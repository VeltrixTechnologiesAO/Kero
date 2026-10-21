import logging
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer

from db.models import Competition
from services.flyer_images import ProcessedImage

logger = logging.getLogger("kero.competitions")


async def list_competitions(
    db: AsyncSession,
    only_active: bool = False,
    limit: int = 60,
) -> List[Competition]:
    stmt = (
        select(Competition)
        .options(defer(Competition.image_data), defer(Competition.thumbnail_data))
        .where(Competition.is_published.is_(True))
        .order_by(Competition.valid_until.desc())
        .limit(limit)
    )
    if only_active:
        from datetime import date
        today = date.today()
        stmt = stmt.where(
            Competition.valid_from <= today,
            Competition.valid_until >= today,
        )

    return list((await db.execute(stmt)).scalars().unique().all())


async def get_competition_by_slug(
    db: AsyncSession, slug: str
) -> Optional[Competition]:
    stmt = (
        select(Competition)
        .options(defer(Competition.image_data), defer(Competition.thumbnail_data))
        .where(Competition.slug == slug, Competition.is_published.is_(True))
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def get_competition_image(
    db: AsyncSession, competition_id: int
) -> Optional[tuple]:
    stmt = select(
        Competition.image_data,
        Competition.image_mime,
        Competition.image_checksum,
    ).where(Competition.id == competition_id)
    row = (await db.execute(stmt)).first()
    return tuple(row) if row else None


async def get_competition_thumbnail(
    db: AsyncSession, competition_id: int
) -> Optional[tuple]:
    stmt = select(
        Competition.thumbnail_data,
        Competition.thumbnail_mime,
        Competition.image_checksum,
    ).where(Competition.id == competition_id)
    row = (await db.execute(stmt)).first()
    return tuple(row) if row else None


async def create_competition(
    db: AsyncSession,
    *,
    slug: str,
    title: str,
    category: Optional[str],
    description: str,
    valid_from,
    valid_until,
    winners_url: Optional[str],
    image: ProcessedImage,
    is_published: bool = True,
    is_featured: bool = False,
) -> Competition:
    record = Competition(
        slug=slug,
        title=title,
        category=category,
        description=description,
        valid_from=valid_from,
        valid_until=valid_until,
        winners_url=winners_url,
        image_data=image.data,
        image_mime=image.mime,
        image_size=image.size,
        image_checksum=image.checksum,
        thumbnail_data=image.thumbnail_data,
        thumbnail_mime=image.thumbnail_mime,
        is_published=is_published,
        is_featured=is_featured,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    logger.info("Competição criada slug=%s", slug)
    return record
