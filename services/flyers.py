import logging
from datetime import date, timedelta
from typing import List, Optional, Tuple

from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer, selectinload

from config import get_settings
from db.models import Flyer, FlyerPage, Store
from services.flyer_images import ProcessedImage

logger = logging.getLogger("kero.flyers")
settings = get_settings()


def _defer_page_blobs():
    return [
        defer(FlyerPage.image_data),
        defer(FlyerPage.thumbnail_data),
    ]


async def list_active_flyers(
    db: AsyncSession,
    region: Optional[str] = None,
    store_id: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = 60,
) -> List[Flyer]:
    today = date.today()
    stmt = (
        select(Flyer)
        .options(
            selectinload(Flyer.pages).options(*_defer_page_blobs()),
        )
        .join(Flyer.store)
        .where(
            Flyer.is_published.is_(True),
            Flyer.valid_from <= today,
            Flyer.valid_until >= today,
            Store.is_active.is_(True),
        )
        .order_by(Flyer.valid_until.asc())
        .limit(limit)
    )

    if region:
        stmt = stmt.where(Store.region == region)
    if store_id:
        stmt = stmt.where(Flyer.store_id == store_id)
    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Flyer.title.ilike(term),
                Flyer.description.ilike(term),
                Store.name.ilike(term),
                Store.region.ilike(term),
            )
        )

    result = await db.execute(stmt)
    return list(result.scalars().unique().all())


async def get_flyer(db: AsyncSession, flyer_id: int) -> Optional[Flyer]:
    stmt = (
        select(Flyer)
        .options(selectinload(Flyer.pages).options(*_defer_page_blobs()))
        .where(Flyer.id == flyer_id)
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def get_flyer_page_image(
    db: AsyncSession, flyer_id: int, page_number: int
) -> Optional[Tuple[bytes, str, str]]:
    stmt = select(
        FlyerPage.image_data, FlyerPage.image_mime, FlyerPage.image_checksum
    ).where(
        FlyerPage.flyer_id == flyer_id,
        FlyerPage.page_number == page_number,
    )
    row = (await db.execute(stmt)).first()
    return tuple(row) if row else None


async def get_flyer_page_thumbnail(
    db: AsyncSession, flyer_id: int, page_number: int
) -> Optional[Tuple[bytes, str, str]]:
    stmt = select(
        FlyerPage.thumbnail_data, FlyerPage.thumbnail_mime, FlyerPage.image_checksum
    ).where(
        FlyerPage.flyer_id == flyer_id,
        FlyerPage.page_number == page_number,
    )
    row = (await db.execute(stmt)).first()
    return tuple(row) if row else None


async def list_flyer_pages_meta(
    db: AsyncSession, flyer_id: int
) -> List[Tuple[int, int]]:
    """Devolve [(page_number, image_size), ...] sem carregar os blobs."""
    stmt = (
        select(FlyerPage.page_number, FlyerPage.image_size)
        .where(FlyerPage.flyer_id == flyer_id)
        .order_by(FlyerPage.page_number)
    )
    return [(r[0], r[1]) for r in (await db.execute(stmt)).all()]


async def next_page_number(db: AsyncSession, flyer_id: int) -> int:
    current = await db.scalar(
        select(func.coalesce(func.max(FlyerPage.page_number), 0)).where(
            FlyerPage.flyer_id == flyer_id
        )
    )
    return int(current or 0) + 1


async def create_flyer(
    db: AsyncSession,
    *,
    store_id: int,
    title: str,
    description: Optional[str],
    valid_from: date,
    valid_until: date,
    images: List[ProcessedImage],
    is_published: bool = True,
) -> Flyer:
    if not images:
        raise ValueError("Precisa de pelo menos uma imagem")

    flyer = Flyer(
        store_id=store_id,
        title=title,
        description=description,
        valid_from=valid_from,
        valid_until=valid_until,
        is_published=is_published,
    )
    db.add(flyer)
    await db.flush()

    for i, img in enumerate(images, start=1):
        db.add(FlyerPage(
            flyer_id=flyer.id,
            page_number=i,
            image_data=img.data,
            image_mime=img.mime,
            image_size=img.size,
            image_checksum=img.checksum,
            thumbnail_data=img.thumbnail_data,
            thumbnail_mime=img.thumbnail_mime,
        ))

    await db.commit()
    await db.refresh(flyer)
    logger.info("Folheto criado id=%d pages=%d", flyer.id, len(images))
    return flyer


async def add_flyer_page(
    db: AsyncSession,
    flyer_id: int,
    image: ProcessedImage,
) -> FlyerPage:
    number = await next_page_number(db, flyer_id)
    page = FlyerPage(
        flyer_id=flyer_id,
        page_number=number,
        image_data=image.data,
        image_mime=image.mime,
        image_size=image.size,
        image_checksum=image.checksum,
        thumbnail_data=image.thumbnail_data,
        thumbnail_mime=image.thumbnail_mime,
    )
    db.add(page)
    await db.commit()
    await db.refresh(page)
    return page


async def delete_flyer_page(
    db: AsyncSession, flyer_id: int, page_number: int
) -> bool:
    total = await db.scalar(
        select(func.count()).select_from(FlyerPage).where(
            FlyerPage.flyer_id == flyer_id
        )
    )
    if (total or 0) <= 1:
        raise ValueError("Um folheto tem de ter pelo menos uma página")

    result = await db.execute(
        delete(FlyerPage).where(
            FlyerPage.flyer_id == flyer_id,
            FlyerPage.page_number == page_number,
        )
    )
    if result.rowcount == 0:
        await db.rollback()
        return False

    remaining = (
        await db.execute(
            select(FlyerPage.id)
            .where(FlyerPage.flyer_id == flyer_id)
            .order_by(FlyerPage.page_number)
        )
    ).scalars().all()

    for idx, page_id in enumerate(remaining, start=1):
        await db.execute(
            FlyerPage.__table__.update()
            .where(FlyerPage.id == page_id)
            .values(page_number=-idx)
        )

    for idx, page_id in enumerate(remaining, start=1):
        await db.execute(
            FlyerPage.__table__.update()
            .where(FlyerPage.id == page_id)
            .values(page_number=idx)
        )

    await db.commit()
    return True


async def purge_expired_flyers(db: AsyncSession) -> int:
    cutoff = date.today() - timedelta(days=settings.flyer_retention_days)
    stmt = delete(Flyer).where(Flyer.valid_until < cutoff)
    result = await db.execute(stmt)
    await db.commit()
    deleted = result.rowcount or 0
    if deleted:
        logger.info("Purge: %d folhetos apagados (cutoff=%s)", deleted, cutoff)
    return deleted


async def list_regions(db: AsyncSession) -> List[str]:
    stmt = (
        select(Store.region)
        .where(Store.is_active.is_(True))
        .distinct()
        .order_by(Store.region)
    )
    return list((await db.execute(stmt)).scalars().all())


async def list_stores_with_active_flyers(db: AsyncSession) -> List[Store]:
    today = date.today()
    stmt = (
        select(Store)
        .join(Flyer, Flyer.store_id == Store.id)
        .where(
            Store.is_active.is_(True),
            Flyer.is_published.is_(True),
            Flyer.valid_from <= today,
            Flyer.valid_until >= today,
        )
        .distinct()
        .order_by(Store.region, Store.name)
    )
    return list((await db.execute(stmt)).scalars().unique().all())
