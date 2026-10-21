"""Middlewares de segurança, rastreio e logging."""
import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from config import get_settings

logger = logging.getLogger("kero.access")
settings = get_settings()


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Atribui um ID único a cada pedido (para rastrear em logs)."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Aplica cabeçalhos de segurança a todas as respostas."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=()"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        response.headers["Content-Security-Policy"] = self._csp()

        if settings.is_prod:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        return response

    @staticmethod
    def _csp() -> str:
        directives = [
            "default-src 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "img-src 'self' data: blob: https://unpkg.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
            "font-src 'self' https://fonts.gstatic.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
            "script-src 'self' https://unpkg.com",
            "connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
        ]
        if settings.is_prod:
            directives.append("upgrade-insecure-requests")
        return "; ".join(directives)


class AccessLogMiddleware(BaseHTTPMiddleware):
    """Registra cada pedido: método, path, status, duração, IP."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration = (time.perf_counter() - start) * 1000
            logger.exception(
                "request_id=%s method=%s path=%s status=500 duration_ms=%.1f",
                getattr(request.state, "request_id", "-"),
                request.method,
                request.url.path,
                duration,
            )
            raise

        duration = (time.perf_counter() - start) * 1000
        logger.info(
            "request_id=%s method=%s path=%s status=%d duration_ms=%.1f ip=%s",
            getattr(request.state, "request_id", "-"),
            request.method,
            request.url.path,
            response.status_code,
            duration,
            request.client.host if request.client else "-",
        )
        return response
