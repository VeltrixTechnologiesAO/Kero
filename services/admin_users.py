import logging
from typing import List, Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.admin_security import hash_password
from db.models import AdminSession, AdminUser

logger = logging.getLogger("kero.admin.users")


class NotFound(Exception):
    pass


class Conflict(Exception):
    pass


class Forbidden(Exception):
    pass


async def list_users(db: AsyncSession) -> List[AdminUser]:
    stmt = select(AdminUser).order_by(AdminUser.created_at.desc())
    return list((await db.execute(stmt)).scalars().all())


async def get_user(db: AsyncSession, uid: int) -> AdminUser:
    u = await db.get(AdminUser, uid)
    if not u:
        raise NotFound("Utilizador não encontrado")
    return u


async def create_user(
    db: AsyncSession,
    *,
    username: str,
    email: str,
    display_name: str,
    password: str,
    role: str,
) -> AdminUser:
    exists = await db.scalar(
        select(func.count()).select_from(AdminUser).where(
            (AdminUser.username == username) | (AdminUser.email == email)
        )
    )
    if exists:
        raise Conflict("Username ou email já existe")

    is_super = role == "superadmin"

    user = AdminUser(
        username=username,
        email=email,
        display_name=display_name,
        password_hash=hash_password(password),
        role=role,
        is_active=True,
        is_superadmin=is_super,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    logger.info("admin: utilizador criado username=%s role=%s", user.username, user.role)
    return user


async def update_user(
    db: AsyncSession,
    uid: int,
    *,
    email: Optional[str] = None,
    display_name: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    actor: AdminUser,
) -> AdminUser:
    user = await get_user(db, uid)

    # Só superadmin pode mudar roles
    if role is not None and role != user.role:
        if not actor.is_superadmin:
            raise Forbidden("Só superadmins podem alterar roles")
        user.role = role
        user.is_superadmin = (role == "superadmin")

    # Não permitir auto-desativar ou auto-rebaixar
    if user.id == actor.id:
        if is_active is False:
            raise Forbidden("Não pode desativar-se a si próprio")
        if role is not None and role != "superadmin" and actor.is_superadmin:
            raise Forbidden("Não pode remover o seu próprio superadmin")

    if email is not None and email != user.email:
        exists = await db.scalar(
            select(func.count()).select_from(AdminUser).where(
                AdminUser.email == email, AdminUser.id != uid
            )
        )
        if exists:
            raise Conflict("Email já em uso")
        user.email = email

    if display_name is not None:
        user.display_name = display_name

    if is_active is not None:
        user.is_active = is_active
        if not is_active:
            # Revogar todas as sessões do utilizador
            await db.execute(
                update(AdminSession).where(AdminSession.admin_user_id == uid).values(
                    expires_at=func.now()
                )
            )

    await db.commit()
    await db.refresh(user)
    return user


async def reset_password(
    db: AsyncSession, uid: int, new_password: str, actor: AdminUser
) -> None:
    user = await get_user(db, uid)

    # Editor só pode mudar a própria password
    if not actor.is_superadmin and actor.id != uid:
        raise Forbidden("Só pode alterar a sua própria password")

    user.password_hash = hash_password(new_password)
    user.failed_login_attempts = 0
    user.locked_until = None

    # Revogar todas as sessões (obriga a novo login)
    await db.execute(
        update(AdminSession).where(AdminSession.admin_user_id == uid).values(
            expires_at=func.now()
        )
    )

    await db.commit()
    logger.info("admin: password alterada uid=%d por=%s", uid, actor.username)


async def delete_user(db: AsyncSession, uid: int, actor: AdminUser) -> None:
    if not actor.is_superadmin:
        raise Forbidden("Só superadmins podem eliminar utilizadores")

    if uid == actor.id:
        raise Forbidden("Não pode eliminar-se a si próprio")

    user = await get_user(db, uid)

    # Não permitir apagar o último superadmin
    if user.is_superadmin:
        count = await db.scalar(
            select(func.count()).select_from(AdminUser).where(
                AdminUser.is_superadmin.is_(True),
                AdminUser.is_active.is_(True),
                AdminUser.id != uid,
            )
        )
        if not count:
            raise Forbidden("Não pode eliminar o último superadmin ativo")

    username = user.username
    await db.delete(user)
    await db.commit()
    logger.info("admin: utilizador eliminado username=%s por=%s", username, actor.username)
