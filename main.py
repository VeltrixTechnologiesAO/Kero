import asyncio
import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from config import get_settings
from core.logging import setup_logging
from core.middleware import (
    AccessLogMiddleware,
    RequestIDMiddleware,
    SecurityHeadersMiddleware,
)
from core.rate_limit import RateLimitMiddleware
from db.base import Base, SessionLocal, engine
from routers import api_contact, api_flyers, api_recipes, api_stores, api_competitions, api_products, admin_products
from services.flyers import purge_expired_flyers

from core.admin_middleware import AdminGuardMiddleware
from routers import admin as admin_router

settings = get_settings()
setup_logging(settings.log_level)
logger = logging.getLogger("kero.app")

CLEANUP_INTERVAL_SECONDS = 24 * 60 * 60


class CachedStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 200:
            if settings.is_prod:
                response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            else:
                response.headers["Cache-Control"] = "no-cache"
        return response


async def _cleanup_loop():
    while True:
        try:
            async with SessionLocal() as db:
                await purge_expired_flyers(db)
        except Exception:
            logger.exception("Erro no cleanup de folhetos")
        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("A iniciar %s | env=%s", settings.app_name, settings.app_env)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Base de dados pronta.")

    task = asyncio.create_task(_cleanup_loop())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except (asyncio.CancelledError, Exception):
            pass
        await engine.dispose()
        logger.info("Aplicação encerrada.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="Website institucional da Kero Angola",
        version="0.1.0",
        debug=settings.debug,
        docs_url=None if settings.is_prod else "/docs",
        redoc_url=None,
        openapi_url=None if settings.is_prod else "/openapi.json",
        lifespan=lifespan,
    )
    _register_middlewares(app)
    _register_static(app)
    _register_routers(app)
    _register_routes(app)
    _register_error_handlers(app)
    return app


def _register_middlewares(app: FastAPI) -> None:
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    if settings.rate_limit_enabled:
        app.add_middleware(
            RateLimitMiddleware,
            max_requests=settings.rate_limit_requests,
            window_seconds=settings.rate_limit_window_seconds,
            exclude_paths=("/static/", "/healthz"),
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
        max_age=3600,
    )

    app.add_middleware(AccessLogMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(AdminGuardMiddleware)
    app.add_middleware(
        TrustedHostMiddleware, allowed_hosts=settings.allowed_hosts_list
    )
    app.add_middleware(RequestIDMiddleware)


def _register_static(app: FastAPI) -> None:
    app.mount("/static", CachedStaticFiles(directory="static"), name="static")


def _register_routers(app: FastAPI) -> None:
    app.include_router(api_flyers.router)
    app.include_router(api_recipes.router)
    app.include_router(api_contact.router)
    app.include_router(api_stores.router)
    app.include_router(api_competitions.router)
    app.include_router(admin_router.router)
    app.include_router(api_products.router)
    app.include_router(admin_products.router)


templates = Jinja2Templates(directory="templates")


def _register_routes(app: FastAPI) -> None:
    @app.get("/", response_class=HTMLResponse)
    async def index(request: Request):
        return templates.TemplateResponse(
            "index.html", {"request": request, "app_name": settings.app_name}
        )

    @app.get("/healthz", include_in_schema=False)
    async def healthz():
        return {"status": "ok", "env": settings.app_env}


def _register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(404)
    async def not_found(request: Request, exc):
        if request.url.path.startswith("/api/"):
            return JSONResponse({"detail": "Recurso não encontrado"}, status_code=404)
        return templates.TemplateResponse(
            "index.html",
            {"request": request, "app_name": settings.app_name},
            status_code=404,
        )

    @app.exception_handler(500)
    async def server_error(request: Request, exc):
        logger.exception("Erro interno: %s", exc)
        return JSONResponse({"detail": "Erro interno do servidor"}, status_code=500)


app = create_app()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=not settings.is_prod,
        log_level=settings.log_level.lower(),
    )
