from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import (
    AdminUser,
    Competition,
    ContactMessage,
    Flyer,
    Recipe,
    Store,
)


async def get_stats(db: AsyncSession) -> dict:
    unread_messages = await db.scalar(
        select(func.count()).select_from(ContactMessage).where(
            ContactMessage.is_read.is_(False),
            ContactMessage.is_archived.is_(False),
        )
    ) or 0

    total_messages = await db.scalar(
        select(func.count()).select_from(ContactMessage)
    ) or 0

    total_flyers = await db.scalar(select(func.count()).select_from(Flyer)) or 0
    total_recipes = await db.scalar(select(func.count()).select_from(Recipe)) or 0
    total_competitions = await db.scalar(
        select(func.count()).select_from(Competition)
    ) or 0
    total_stores = await db.scalar(
        select(func.count()).select_from(Store).where(Store.is_active.is_(True))
    ) or 0
    total_admins = await db.scalar(
        select(func.count()).select_from(AdminUser).where(AdminUser.is_active.is_(True))
    ) or 0

    return {
        "unread_messages": unread_messages,
        "total_messages": total_messages,
        "total_flyers": total_flyers,
        "total_recipes": total_recipes,
        "total_competitions": total_competitions,
        "total_stores": total_stores,
        "total_admins": total_admins,
    }


async def get_recent_messages(db: AsyncSession, limit: int = 5) -> list[ContactMessage]:
    stmt = (
        select(ContactMessage)
        .order_by(ContactMessage.created_at.desc())
        .limit(limit)
    )
    return list((await db.execute(stmt)).scalars().all())
