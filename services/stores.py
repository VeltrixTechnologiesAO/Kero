from typing import List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Store


async def list_stores(
    db: AsyncSession,
    region: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Store]:
    stmt = (
        select(Store)
        .where(Store.is_active.is_(True))
        .order_by(Store.region, Store.name)
    )

    if region:
        stmt = stmt.where(Store.region == region)

    if search:
        term = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Store.name.ilike(term),
                Store.address.ilike(term),
                Store.region.ilike(term),
            )
        )

    return list((await db.execute(stmt)).scalars().all())


async def get_store(db: AsyncSession, store_id: int) -> Optional[Store]:
    stmt = select(Store).where(Store.id == store_id, Store.is_active.is_(True))
    return (await db.execute(stmt)).scalar_one_or_none()


async def list_regions(db: AsyncSession) -> List[str]:
    stmt = (
        select(Store.region)
        .where(Store.is_active.is_(True))
        .distinct()
        .order_by(Store.region)
    )
    return list((await db.execute(stmt)).scalars().all())
