import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from config import get_settings
from core.admin_security import (
    generate_csrf_token,
    generate_session_token,
    hash_password,
    needs_rehash,
    session_expiry,
    verify_password,
)
from db.models import AdminSession, AdminUser

logger = logging.getLogger("kero.admin.auth")
settings = get_settings()


class AuthError(Exception):
    pass


# ──────────────────────────── Sessões ────────────────────────────

async def get_session_by_token(db: AsyncSession, token: str) -> Optional[AdminSession]:
    stmt = select(AdminSession).where(AdminSession.token == token)
    return (await db.execute(stmt)).scalar_one_or_none()


async def create_session(
    db: AsyncSession,
    user: AdminUser,
    ip: Optional[str],
    user_agent: Optional[str],
) -> AdminSession:
    session = AdminSession(
        token=generate_session_token(),
        csrf_token=generate_csrf_token(),
        admin_user_id=user.id,
        expires_at=session_expiry(),
        ip_address=ip,
        user_agent=(user_agent or "")[:255] or None,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def destroy_session(db: AsyncSession, token: str) -> None:
    await db.execute(delete(AdminSession).where(AdminSession.token == token))
    await db.commit()


async def destroy_all_sessions_for_user(db: AsyncSession, user_id: int) -> int:
    result = await db.execute(
        delete(AdminSession).where(AdminSession.admin_user_id == user_id)
    )
    await db.commit()
    return result.rowcount or 0


async def purge_expired_sessions(db: AsyncSession) -> int:
    now = datetime.now(timezone.utc)
    result = await db.execute(delete(AdminSession).where(AdminSession.expires_at < now))
    await db.commit()
    return result.rowcount or 0


# ──────────────────────────── Autenticação ────────────────────────────

async def authenticate(
    db: AsyncSession,
    username: str,
    password: str,
) -> AdminUser:
    """
    Devolve o AdminUser se as credenciais forem válidas.
    Atualiza failed_login_attempts / locked_until conforme necessário.
    Lança AuthError com mensagem genérica para não revelar detalhes.
    """
    stmt = select(AdminUser).where(AdminUser.username == username)
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user:
        # Não revelar que o username não existe
        raise AuthError("Credenciais inválidas.")

    if not user.is_active:
        raise AuthError("Conta desativada.")

    if user.is_locked:
        raise AuthError("Conta temporariamente bloqueada. Tente novamente mais tarde.")

    if not verify_password(user.password_hash, password):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

        if user.failed_login_attempts >= settings.admin_login_max_attempts:
            from datetime import timedelta
            user.locked_until = datetime.now(timezone.utc) + timedelta(
                minutes=settings.admin_lockout_minutes
            )
            logger.warning(
                "admin: conta bloqueada por tentativas falhadas user=%s", user.username
            )

        await db.commit()
        raise AuthError("Credenciais inválidas.")

    # Sucesso
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(password)

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return user


# ──────────────────────────── Gestão de utilizadores ────────────────────────────

async def create_user(
    db: AsyncSession,
    *,
    username: str,
    email: str,
    password: str,
    display_name: str,
    is_superadmin: bool = False,
) -> AdminUser:
    user = AdminUser(
        username=username.strip().lower(),
        email=email.strip().lower(),
        password_hash=hash_password(password),
        display_name=display_name.strip(),
        is_active=True,
        is_superadmin=is_superadmin,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def set_password(
    db: AsyncSession, user: AdminUser, new_password: str
) -> None:
    user.password_hash = hash_password(new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    await db.commit()
