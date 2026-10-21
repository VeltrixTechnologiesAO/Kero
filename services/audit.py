import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import AuditLog

logger = logging.getLogger("kero.audit")


async def log_action(
    db: AsyncSession,
    *,
    admin_user_id: Optional[int],
    username: Optional[str],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    commit: bool = True,
) -> AuditLog:
    entry = AuditLog(
        admin_user_id=admin_user_id,
        username_snapshot=username,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details or None,
        ip_address=ip_address,
        user_agent=(user_agent or "")[:255] or None,
    )
    db.add(entry)
    if commit:
        await db.commit()
        await db.refresh(entry)
    return entry


async def list_recent(
    db: AsyncSession,
    limit: int = 100,
    action: Optional[str] = None,
    admin_user_id: Optional[int] = None,
) -> list[AuditLog]:
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)

    if action:
        stmt = stmt.where(AuditLog.action == action)
    if admin_user_id:
        stmt = stmt.where(AuditLog.admin_user_id == admin_user_id)

    return list((await db.execute(stmt)).scalars().all())


async def purge_old(db: AsyncSession, days: int = 365) -> int:
    from sqlalchemy import delete
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(delete(AuditLog).where(AuditLog.created_at < cutoff))
    await db.commit()
    return result.rowcount or 0
