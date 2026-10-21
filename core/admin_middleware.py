import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import RedirectResponse, Response

from config import get_settings

logger = logging.getLogger("kero.admin.access")
settings = get_settings()

# Caminhos públicos do admin (não exigem sessão)
PUBLIC_ADMIN_PATHS = (
    "/admin/login",
    "/admin/static/",
)

# Caminhos que não fazem parte do admin (deixar passar)
def _is_admin_path(path: str) -> bool:
    return path == "/admin" or path.startswith("/admin/")


def _is_public_admin_path(path: str) -> bool:
    return any(path.startswith(p) for p in PUBLIC_ADMIN_PATHS)


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else ""


class AdminGuardMiddleware(BaseHTTPMiddleware):
    """
    Fase 1: IP allowlist (404 se fora).
    Fase 2: carrega sessão do cookie e valida.
    Redireciona para /admin/login se não autenticado.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if not _is_admin_path(path):
            return await call_next(request)

        client_ip = _client_ip(request)
        allowed = settings.admin_allowed_ips_list
        if allowed and client_ip not in allowed:
            logger.warning("admin: IP bloqueado %s em %s", client_ip, path)
            return Response(status_code=404)

        session = await self._load_session(request)
        request.state.admin_session = session
        request.state.admin_user = session.user if session else None

        if _is_public_admin_path(path):
            if session and path.startswith("/admin/login"):
                return RedirectResponse("/admin", status_code=307)
            return await call_next(request)

        if not session:
            if path.startswith("/admin/api/"):
                from starlette.responses import JSONResponse
                return JSONResponse(
                    {"detail": "Sessão expirada. Faça login novamente."},
                    status_code=401,
                )
            return RedirectResponse("/admin/login", status_code=307)

        return await call_next(request)

    async def _load_session(self, request: Request):
        token = request.cookies.get(settings.admin_cookie_name)
        if not token:
            return None

        # Import tardio para evitar ciclo
        from db.base import SessionLocal
        from services.admin_auth import get_session_by_token

        try:
            async with SessionLocal() as db:
                session = await get_session_by_token(db, token)
        except Exception:
            logger.exception("admin: erro a carregar sessão")
            return None

        if not session or not session.is_valid:
            return None

        return session
