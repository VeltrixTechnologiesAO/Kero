# db/base.py
from collections.abc import AsyncGenerator
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config import get_settings

settings = get_settings()


def _normalize_db_url(url: str) -> str:
    """Traduz parâmetros libpq -> asyncpg e remove os que ele não conhece."""
    if not url:
        return url

    # prefixo asyncpg
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and "+asyncpg" not in url:
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    parts = urlsplit(url)
    q = dict(parse_qsl(parts.query))

    # libpq -> asyncpg
    if "sslmode" in q:
        q["ssl"] = q.pop("sslmode")
    # asyncpg não suporta estes
    q.pop("channel_binding", None)

    return urlunsplit(parts._replace(query=urlencode(q)))


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    _normalize_db_url(settings.database_url),
    echo=settings.debug,
    future=True,
    pool_pre_ping=True,
    connect_args={"statement_cache_size": 0},  # obrigatório com Neon -pooler
)

SessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
