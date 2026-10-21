from functools import lru_cache
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Kero Angola"
    app_env: Literal["development", "staging", "production"] = "development"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000

    secret_key: str = ""
    allowed_hosts: str = "localhost,127.0.0.1"
    cors_origins: str = ""

    rate_limit_enabled: bool = True
    rate_limit_requests: int = Field(default=120, ge=1)
    rate_limit_window_seconds: int = Field(default=60, ge=1)

    log_level: str = "INFO"

    database_url: str = "postgresql+asyncpg://postgres:admin123@localhost:5432/kero"

    flyer_retention_days: int = Field(default=30, ge=0, le=3650)
    flyer_max_size_mb: int = Field(default=10, ge=1, le=100)
    flyer_thumbnail_width: int = Field(default=600, ge=200, le=2000)

    # ── Admin ──
    admin_allowed_ips: str = "127.0.0.1,::1"
    admin_session_hours: int = 12
    admin_cookie_name: str = "kero_admin_session"
    admin_cookie_secure: bool = False
    admin_login_max_attempts: int = 5
    admin_lockout_minutes: int = 15

    # ── Vercel / Serverless ──
    vercel: bool = False              # Vercel injeta VERCEL=1 automaticamente
    vercel_env: str = ""              # production | preview | development (VERCEL_ENV)
    cron_secret: str = ""             # protege /api/cron/*
    blob_read_write_token: str = ""   # Vercel Blob (uploads)

    # ── Rate limit distribuído (opcional, Upstash Redis) ──
    upstash_redis_url: str = ""
    upstash_redis_token: str = ""

    # ─────────── Propriedades derivadas ───────────
    @property
    def admin_allowed_ips_list(self) -> list[str]:
        return [ip.strip() for ip in self.admin_allowed_ips.split(",") if ip.strip()]

    @property
    def is_prod(self) -> bool:
        return self.app_env == "production"

    @property
    def is_vercel(self) -> bool:
        return self.vercel or bool(self.vercel_env)

    @property
    def allowed_hosts_list(self) -> list[str]:
        return [h.strip() for h in self.allowed_hosts.split(",") if h.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def flyer_max_size_bytes(self) -> int:
        return self.flyer_max_size_mb * 1024 * 1024

    @property
    def use_blob_storage(self) -> bool:
        return bool(self.blob_read_write_token)

    @property
    def use_redis_rate_limit(self) -> bool:
        return bool(self.upstash_redis_url and self.upstash_redis_token)

    # ─────────── Validação ───────────
    @model_validator(mode="after")
    def _validate_security(self) -> "Settings":
        if self.is_prod:
            if len(self.secret_key) < 32:
                raise ValueError("SECRET_KEY tem de ter ≥ 32 chars em produção.")
            if "localhost" in self.allowed_hosts_list:
                raise ValueError("ALLOWED_HOSTS não pode ter 'localhost' em produção.")
            if "*" in self.allowed_hosts_list:
                raise ValueError("ALLOWED_HOSTS não pode ter '*'.")
            if self.database_url.startswith("sqlite"):
                raise ValueError("Em produção usa PostgreSQL (não SQLite).")
            if not self.admin_cookie_secure:
                raise ValueError("ADMIN_COOKIE_SECURE tem de ser true em produção (HTTPS).")

        # Avisos específicos de Vercel (não bloqueiam o arranque)
        if self.is_vercel and self.is_prod:
            import warnings
            if not self.cron_secret:
                warnings.warn(
                    "CRON_SECRET vazio: /api/cron/* fica acessível a qualquer um.",
                    RuntimeWarning,
                    stacklevel=2,
                )
            if not self.blob_read_write_token:
                warnings.warn(
                    "BLOB_READ_WRITE_TOKEN vazio: uploads vão falhar "
                    "(filesystem do Vercel é read-only).",
                    RuntimeWarning,
                    stacklevel=2,
                )
            if not self.admin_allowed_ips_list:
                warnings.warn(
                    "ADMIN_ALLOWED_IPS vazio: filtro por IP do admin desativado "
                    "(comportamento esperado em Vercel).",
                    RuntimeWarning,
                    stacklevel=2,
                )

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
