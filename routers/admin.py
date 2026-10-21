from typing import Optional
from typing import List as TypingList

from fastapi import APIRouter, Depends, Form, HTTPException, Request, File, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from config import get_settings
from core.admin_security import constant_time_compare
from db.base import get_db
from db.models import (
    AdminUser,
    AuditLog,
    Competition,
    ContactMessage,
    Flyer,
    Recipe,
    Store,
)
from schemas.admin import (
    AdminUserIn,
    AdminUserPasswordReset,
    AdminUserUpdate,
    CompetitionUpdateIn,
    FlyerUpdateIn,
    MessageUpdateIn,
    RecipeUpdateIn,
    StoreUpdateIn,
    StoreUpdateIn,
)

from services import admin_auth, admin_dashboard, admin_users, audit
from services import admin_content as content
from services.flyer_images import InvalidImageError, process_flyer_image
from services.flyers import (
    add_flyer_page,
    create_flyer,
    delete_flyer_page,
)

from datetime import date

import json
import re
import unicodedata

import logging
logger = logging.getLogger("kero.admin")

settings = get_settings()
router = APIRouter(prefix="/admin", tags=["admin"])
templates = Jinja2Templates(directory="templates")


# ──────────────────────────── Helpers ────────────────────────────

def _user(request: Request) -> AdminUser:
    return getattr(request.state, "admin_user", None)


def _require_user(request: Request) -> AdminUser:
    u = _user(request)
    if not u:
        raise HTTPException(status_code=401, detail="Sessão inválida")
    return u


def _require_superadmin(request: Request) -> AdminUser:
    u = _require_user(request)
    if not u.is_superadmin:
        raise HTTPException(status_code=403, detail="Apenas superadmins")
    return u


def _check_csrf(request: Request, token: Optional[str]) -> None:
    session = getattr(request.state, "admin_session", None)
    if not session or not token or not constant_time_compare(session.csrf_token, token):
        raise HTTPException(status_code=403, detail="CSRF inválido")


def _error(code: int, message: str) -> JSONResponse:
    """Devolve JSON limpo — nunca expõe detalhes internos."""
    return JSONResponse({"detail": message}, status_code=code)


# ──────────────────────────── Shell / Login / Logout ────────────────────────────

@router.get("", response_class=HTMLResponse)
@router.get("/", response_class=HTMLResponse)
async def shell(request: Request):
    session = request.state.admin_session
    return templates.TemplateResponse("admin.html", {
        "request": request,
        "admin_user": session.user,
        "csrf_token": session.csrf_token,
    })


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("admin/login.html", {
        "request": request,
        "app_name": settings.app_name,
        "error": None,
        "username": "",
    })


@router.post("/login", response_class=HTMLResponse)
async def login_submit(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")

    try:
        user = await admin_auth.authenticate(db, username.strip(), password)
    except admin_auth.AuthError as e:
        await audit.log_action(
            db,
            admin_user_id=None,
            username=username.strip()[:60] or None,
            action="admin.login.failed",
            ip_address=ip, user_agent=ua,
            details={"username": username.strip()[:60]},
        )
        return templates.TemplateResponse(
            "admin/login.html",
            {
                "request": request,
                "app_name": settings.app_name,
                "error": str(e),
                "username": username,
            },
            status_code=401,
        )

    session = await admin_auth.create_session(db, user, ip=ip, user_agent=ua)

    await audit.log_action(
        db,
        admin_user_id=user.id, username=user.username,
        action="admin.login.success",
        ip_address=ip, user_agent=ua,
    )

    response = RedirectResponse("/admin", status_code=303)
    response.set_cookie(
        key=settings.admin_cookie_name, value=session.token,
        max_age=settings.admin_session_hours * 3600,
        httponly=True, secure=settings.admin_cookie_secure,
        samesite="lax", path="/admin",
    )
    return response


@router.post("/logout")
async def logout(
    request: Request,
    csrf_token: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, csrf_token)
    session = request.state.admin_session
    if session:
        await audit.log_action(
            db,
            admin_user_id=session.admin_user_id,
            username=session.user.username,
            action="admin.logout",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        await admin_auth.destroy_session(db, session.token)

    response = RedirectResponse("/admin/login", status_code=303)
    response.delete_cookie(settings.admin_cookie_name, path="/admin")
    return response


# ──────────────────────────── Dashboard ────────────────────────────

@router.get("/api/dashboard")
async def api_dashboard(request: Request, db: AsyncSession = Depends(get_db)):
    _require_user(request)
    stats = await admin_dashboard.get_stats(db)
    recent_messages = await admin_dashboard.get_recent_messages(db, limit=5)
    recent_audit = await audit.list_recent(db, limit=8)

    return {
        "stats": stats,
        "recent_messages": [
            {
                "id": m.id,
                "first_name": m.first_name,
                "last_name": m.last_name,
                "subject": m.subject,
                "is_read": m.is_read,
                "created_at": m.created_at.isoformat(),
            } for m in recent_messages
        ],
        "recent_audit": [
            {
                "id": e.id, "action": e.action,
                "username": e.username_snapshot,
                "created_at": e.created_at.isoformat(),
            } for e in recent_audit
        ],
    }


# ──────────────────────────── Mensagens ────────────────────────────

@router.get("/api/messages")
async def api_messages(request: Request, db: AsyncSession = Depends(get_db)):
    _require_user(request)
    stmt = select(ContactMessage).order_by(ContactMessage.created_at.desc()).limit(500)
    items = list((await db.execute(stmt)).scalars().all())
    return {
        "total": len(items),
        "items": [
            {
                "id": m.id,
                "first_name": m.first_name,
                "last_name": m.last_name,
                "email": m.email,
                "phone": m.phone,
                "province": m.province,
                "department": m.department,
                "message_type": m.message_type,
                "subject": m.subject,
                "message": m.message,
                "store_name": m.store_name,
                "is_read": m.is_read,
                "is_archived": m.is_archived,
                "ip_address": m.ip_address,
                "user_agent": m.user_agent,
                "created_at": m.created_at.isoformat(),
            } for m in items
        ],
    }


@router.patch("/api/messages/{mid}")
async def api_message_update(
    mid: int, request: Request, payload: MessageUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        m = await content.update_message(db, mid, payload.model_dump(exclude_unset=True))
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="message.updated", entity_type="contact_message", entity_id=mid,
        details=payload.model_dump(exclude_unset=True),
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


@router.delete("/api/messages/{mid}")
async def api_message_delete(
    mid: int, request: Request, db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)

    msg = await db.get(ContactMessage, mid)
    if not msg:
        return _error(404, "Mensagem não encontrada")

    snapshot = {
        "subject": msg.subject,
        "from_name": f"{msg.first_name} {msg.last_name}".strip(),
        "from_email": msg.email,
        "phone": msg.phone,
        "province": msg.province,
        "store_name": msg.store_name,
        "department": msg.department,
        "message_type": msg.message_type,
        "message_preview": (msg.message or "")[:300],
        "created_at": msg.created_at.isoformat(),
        "was_read": msg.is_read,
        "was_archived": msg.is_archived,
    }

    try:
        await content.delete_message(db, mid)
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db,
        admin_user_id=user.id,
        username=user.username,
        action="message.deleted",
        entity_type="contact_message",
        entity_id=mid,
        details=snapshot,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return {"ok": True}


# ──────────────────────────── Folhetos ────────────────────────────

@router.post("/api/flyers")
async def api_flyer_create(
    request: Request,
    store_id: int = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    valid_from: date = Form(...),
    valid_until: date = Form(...),
    is_published: bool = Form(True),
    images: TypingList[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)

    if valid_until < valid_from:
        return _error(400, "A data final não pode ser anterior à inicial")

    title = (title or "").strip()
    if len(title) < 2 or len(title) > 160:
        return _error(400, "Título inválido (2–160 caracteres)")

    store = await db.get(Store, store_id)
    if not store or not store.is_active:
        return _error(400, "Loja inválida ou inativa")

    if not images:
        return _error(400, "Adicione pelo menos uma página")
    if len(images) > 50:
        return _error(400, "Máximo de 50 páginas por folheto")

    processed_pages = []
    for idx, file in enumerate(images, start=1):
        try:
            raw = await file.read()
        except Exception:
            return _error(400, f"Erro ao ler a imagem #{idx}")
        if not raw:
            return _error(400, f"Imagem #{idx} está vazia")
        try:
            processed_pages.append(process_flyer_image(raw))
        except InvalidImageError as e:
            return _error(400, f"Página {idx}: {e}")

    try:
        flyer = await create_flyer(
            db,
            store_id=store_id,
            title=title,
            description=(description or "").strip() or None,
            valid_from=valid_from,
            valid_until=valid_until,
            images=processed_pages,
            is_published=bool(is_published),
        )
    except Exception:
        logger.exception("Erro ao criar folheto")
        return _error(500, "Não foi possível criar o folheto")

    await audit.log_action(
        db,
        admin_user_id=user.id,
        username=user.username,
        action="flyer.created",
        entity_type="flyer",
        entity_id=flyer.id,
        details={"title": flyer.title, "store_id": store_id, "pages": len(processed_pages)},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return {"ok": True, "id": flyer.id}

@router.get("/api/flyers")
async def api_flyers(request: Request, db: AsyncSession = Depends(get_db)):
    _require_user(request)

    stmt = (
        select(Flyer)
        .options(selectinload(Flyer.pages))
        .order_by(Flyer.valid_until.desc())
        .limit(500)
    )
    items = list((await db.execute(stmt)).scalars().unique().all())

    return {
        "total": len(items),
        "items": [
            {
                "id": f.id,
                "title": f.title,
                "description": f.description,
                "store_name": f.store.name,
                "store_region": f.store.region,
                "valid_from": f.valid_from.isoformat(),
                "valid_until": f.valid_until.isoformat(),
                "is_active": f.is_active,
                "is_published": f.is_published,
                "page_count": f.page_count,
                "total_image_size": f.total_image_size,
                "cover_thumbnail_url": (
                    f"/api/flyers/{f.id}/pages/{f.cover.page_number}/thumbnail"
                    if f.cover else None
                ),
                "pages": [
                    {
                        "page_number": p.page_number,
                        "image_url": f"/api/flyers/{f.id}/pages/{p.page_number}/image",
                        "thumbnail_url": f"/api/flyers/{f.id}/pages/{p.page_number}/thumbnail",
                        "image_size": p.image_size,
                    }
                    for p in sorted(f.pages, key=lambda x: x.page_number)
                ],
                "created_at": f.created_at.isoformat(),
            }
            for f in items
        ],
    }


@router.patch("/api/flyers/{fid}")
async def api_flyer_update(
    fid: int, request: Request, payload: FlyerUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.update_flyer(db, fid, payload.model_dump(exclude_unset=True))
    except content.NotFound as e:
        return _error(404, str(e))
    except content.ValidationError as e:
        return _error(400, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="flyer.updated", entity_type="flyer", entity_id=fid,
        details=payload.model_dump(exclude_unset=True),
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


@router.delete("/api/flyers/{fid}")
async def api_flyer_delete(
    fid: int, request: Request, db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.delete_flyer(db, fid)
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="flyer.deleted", entity_type="flyer", entity_id=fid,
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


@router.post("/api/flyers/{fid}/pages")
async def api_flyer_add_page(
    fid: int, request: Request,
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)

    flyer = await db.get(Flyer, fid)
    if not flyer:
        return _error(404, "Folheto não encontrado")

    try:
        raw = await image.read()
    except Exception:
        return _error(400, "Erro ao ler imagem")
    if not raw:
        return _error(400, "Imagem vazia")

    try:
        processed = process_flyer_image(raw)
    except InvalidImageError as e:
        return _error(400, str(e))

    try:
        page = await add_flyer_page(db, fid, processed)
    except Exception:
        logger.exception("Erro ao adicionar página")
        return _error(500, "Não foi possível adicionar a página")

    await audit.log_action(
        db,
        admin_user_id=user.id, username=user.username,
        action="flyer.page_added",
        entity_type="flyer", entity_id=fid,
        details={"page_number": page.page_number, "image_size": page.image_size},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return {"ok": True, "page_number": page.page_number}


@router.delete("/api/flyers/{fid}/pages/{page_number}")
async def api_flyer_delete_page(
    fid: int, page_number: int, request: Request,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)

    flyer = await db.get(Flyer, fid)
    if not flyer:
        return _error(404, "Folheto não encontrado")

    try:
        ok = await delete_flyer_page(db, fid, page_number)
    except ValueError as e:
        return _error(400, str(e))

    if not ok:
        return _error(404, "Página não encontrada")

    await audit.log_action(
        db,
        admin_user_id=user.id, username=user.username,
        action="flyer.page_deleted",
        entity_type="flyer", entity_id=fid,
        details={"page_number": page_number},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    return {"ok": True}

# ──────────────────────────── Receitas ────────────────────────────

def _slugify(text: str) -> str:
    """Gera slug a partir do título: remove acentos, espaços → -, etc."""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    text = re.sub(r"[-\s]+", "-", text)
    return text[:140]


@router.post("/api/recipes")
async def api_recipe_create(
    request: Request,
    title: str = Form(...),
    category: Optional[str] = Form(None),
    description: str = Form(...),
    prep_time_minutes: int = Form(...),
    servings: str = Form(...),
    ingredients: str = Form(...),      # JSON array de strings
    instructions: str = Form(...),     # JSON array de strings
    is_published: bool = Form(True),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)

    # ─── Validações ───
    title = (title or "").strip()
    if len(title) < 3 or len(title) > 160:
        return _error(400, "Título inválido (3–160 caracteres)")

    description = (description or "").strip()
    if len(description) < 10 or len(description) > 4000:
        return _error(400, "Descrição inválida (10–4000 caracteres)")

    category = (category or "").strip() or None
    if category and len(category) > 80:
        return _error(400, "Categoria demasiado longa")

    servings = (servings or "").strip()
    if not servings or len(servings) > 20:
        return _error(400, "Porções inválidas")

    if prep_time_minutes < 1 or prep_time_minutes > 1000:
        return _error(400, "Tempo de preparação inválido")

    # Ingredientes / instruções (JSON strings vindos do FormData)
    try:
        ing_list = json.loads(ingredients)
        inst_list = json.loads(instructions)
    except (json.JSONDecodeError, TypeError):
        return _error(400, "Formato de ingredientes/instruções inválido")

    if not isinstance(ing_list, list) or not isinstance(inst_list, list):
        return _error(400, "Ingredientes e instruções têm de ser listas")

    ing_list = [str(i).strip() for i in ing_list if str(i).strip()]
    inst_list = [str(i).strip() for i in inst_list if str(i).strip()]

    if not ing_list:
        return _error(400, "Adicione pelo menos um ingrediente")
    if not inst_list:
        return _error(400, "Adicione pelo menos um passo")
    if len(ing_list) > 100 or len(inst_list) > 100:
        return _error(400, "Demasiados itens (máx. 100)")

    # Slug único
    base_slug = _slugify(title) or "receita"
    slug = base_slug
    counter = 1
    while await db.scalar(select(func.count()).select_from(Recipe).where(Recipe.slug == slug)):
        slug = f"{base_slug}-{counter}"
        counter += 1
        if counter > 1000:
            return _error(500, "Não foi possível gerar slug único")

    # ─── Imagem ───
    try:
        raw = await image.read()
    except Exception:
        return _error(400, "Erro ao ler imagem")

    if not raw:
        return _error(400, "Nenhuma imagem enviada")

    try:
        processed = process_flyer_image(raw)
    except InvalidImageError as e:
        return _error(400, str(e))

    # ─── Criar ───
    try:
        recipe = Recipe(
            slug=slug,
            title=title,
            category=category,
            description=description,
            prep_time_minutes=prep_time_minutes,
            servings=servings,
            ingredients=ing_list,
            instructions=inst_list,
            image_data=processed.data,
            image_mime=processed.mime,
            image_size=processed.size,
            image_checksum=processed.checksum,
            thumbnail_data=processed.thumbnail_data,
            thumbnail_mime=processed.thumbnail_mime,
            is_published=bool(is_published),
        )
        db.add(recipe)
        await db.commit()
        await db.refresh(recipe)
    except Exception:
        logger.exception("Erro ao criar receita")
        await db.rollback()
        return _error(500, "Não foi possível criar a receita")

    await audit.log_action(
        db,
        admin_user_id=user.id,
        username=user.username,
        action="recipe.created",
        entity_type="recipe",
        entity_id=recipe.id,
        details={"slug": recipe.slug, "title": recipe.title},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return {"ok": True, "id": recipe.id, "slug": recipe.slug}

@router.get("/api/recipes")
async def api_recipes(request: Request, db: AsyncSession = Depends(get_db)):
    _require_user(request)
    stmt = select(Recipe).order_by(Recipe.created_at.desc()).limit(500)
    items = list((await db.execute(stmt)).scalars().all())
    return {
        "total": len(items),
        "items": [
            {
                "id": r.id, "slug": r.slug, "title": r.title,
                "category": r.category, "description": r.description,
                "prep_time_minutes": r.prep_time_minutes, "servings": r.servings,
                "ingredients": list(r.ingredients or []),
                "instructions": list(r.instructions or []),
                "is_published": r.is_published,
                "thumbnail_url": f"/api/recipes/{r.id}/thumbnail",
                "created_at": r.created_at.isoformat(),
            } for r in items
        ],
    }


@router.patch("/api/recipes/{rid}")
async def api_recipe_update(
    rid: int, request: Request, payload: RecipeUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.update_recipe(db, rid, payload.model_dump(exclude_unset=True))
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="recipe.updated", entity_type="recipe", entity_id=rid,
        details=payload.model_dump(exclude_unset=True),
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


@router.delete("/api/recipes/{rid}")
async def api_recipe_delete(
    rid: int, request: Request, db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.delete_recipe(db, rid)
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="recipe.deleted", entity_type="recipe", entity_id=rid,
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


# ──────────────────────────── Competições ────────────────────────────

@router.post("/api/competitions")
async def api_competition_create(
    request: Request,
    title: str = Form(...),
    category: Optional[str] = Form(None),
    description: str = Form(...),
    valid_from: date = Form(...),
    valid_until: date = Form(...),
    winners_url: Optional[str] = Form(None),
    is_published: bool = Form(True),
    is_featured: bool = Form(False),
    image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)

    title = (title or "").strip()
    if len(title) < 3 or len(title) > 160:
        return _error(400, "Título inválido (3–160 caracteres)")

    description = (description or "").strip()
    if len(description) < 10 or len(description) > 4000:
        return _error(400, "Descrição inválida (10–4000 caracteres)")

    if valid_until < valid_from:
        return _error(400, "A data final não pode ser anterior à inicial")

    category = (category or "").strip() or None
    winners_url = (winners_url or "").strip() or None
    if winners_url and len(winners_url) > 500:
        return _error(400, "URL dos vencedores demasiado longo")

    base_slug = _slugify(title) or "competicao"
    slug = base_slug
    counter = 1
    while await db.scalar(select(func.count()).select_from(Competition).where(Competition.slug == slug)):
        slug = f"{base_slug}-{counter}"
        counter += 1
        if counter > 1000:
            return _error(500, "Não foi possível gerar slug único")

    try:
        raw = await image.read()
    except Exception:
        return _error(400, "Erro ao ler imagem")

    if not raw:
        return _error(400, "Nenhuma imagem enviada")

    try:
        processed = process_flyer_image(raw)
    except InvalidImageError as e:
        return _error(400, str(e))

    try:
        comp = Competition(
            slug=slug,
            title=title,
            category=category,
            description=description,
            valid_from=valid_from,
            valid_until=valid_until,
            winners_url=winners_url,
            image_data=processed.data,
            image_mime=processed.mime,
            image_size=processed.size,
            image_checksum=processed.checksum,
            thumbnail_data=processed.thumbnail_data,
            thumbnail_mime=processed.thumbnail_mime,
            is_published=bool(is_published),
            is_featured=bool(is_featured),
        )
        db.add(comp)
        await db.commit()
        await db.refresh(comp)
    except Exception:
        logger.exception("Erro ao criar competição")
        await db.rollback()
        return _error(500, "Não foi possível criar a competição")

    await audit.log_action(
        db,
        admin_user_id=user.id,
        username=user.username,
        action="competition.created",
        entity_type="competition",
        entity_id=comp.id,
        details={"slug": comp.slug, "title": comp.title},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return {"ok": True, "id": comp.id, "slug": comp.slug}

@router.get("/api/competitions")
async def api_competitions(request: Request, db: AsyncSession = Depends(get_db)):
    _require_user(request)
    stmt = select(Competition).order_by(Competition.valid_until.desc()).limit(500)
    items = list((await db.execute(stmt)).scalars().all())
    return {
        "total": len(items),
        "items": [
            {
                "id": c.id, "slug": c.slug, "title": c.title,
                "category": c.category, "description": c.description,
                "valid_from": c.valid_from.isoformat(),
                "valid_until": c.valid_until.isoformat(),
                "winners_url": c.winners_url,
                "is_active": c.is_active, "is_published": c.is_published,
                "is_featured": c.is_featured, "has_winners": c.has_winners,
                "thumbnail_url": f"/api/competitions/{c.id}/thumbnail",
                "created_at": c.created_at.isoformat(),
            } for c in items
        ],
    }


@router.patch("/api/competitions/{cid}")
async def api_competition_update(
    cid: int, request: Request, payload: CompetitionUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.update_competition(db, cid, payload.model_dump(exclude_unset=True))
    except content.NotFound as e:
        return _error(404, str(e))
    except content.ValidationError as e:
        return _error(400, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="competition.updated", entity_type="competition", entity_id=cid,
        details=payload.model_dump(exclude_unset=True),
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


@router.delete("/api/competitions/{cid}")
async def api_competition_delete(
    cid: int, request: Request, db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.delete_competition(db, cid)
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="competition.deleted", entity_type="competition", entity_id=cid,
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


# ──────────────────────────── Lojas ────────────────────────────

@router.post("/api/stores")
async def api_store_create(
    request: Request,
    payload: StoreUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)

    data = payload.model_dump(exclude_unset=True)
    name = (data.get("name") or "").strip()
    region = (data.get("region") or "").strip()

    if len(name) < 2 or len(name) > 120:
        return _error(400, "Nome inválido (2–120 caracteres)")
    if len(region) < 2 or len(region) > 80:
        return _error(400, "Província inválida")

    # Nome único
    exists = await db.scalar(
        select(func.count()).select_from(Store).where(Store.name == name)
    )
    if exists:
        return _error(409, "Já existe uma loja com esse nome")

    store = Store(
        name=name,
        region=region,
        address=(data.get("address") or "").strip() or None,
        phone=(data.get("phone") or "").strip() or None,
        email=(data.get("email") or "").strip() or None,
        opening_hours=(data.get("opening_hours") or "").strip() or None,
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        is_active=bool(data.get("is_active", True)),
    )
    db.add(store)
    await db.commit()
    await db.refresh(store)

    await audit.log_action(
        db,
        admin_user_id=user.id,
        username=user.username,
        action="store.created",
        entity_type="store",
        entity_id=store.id,
        details={"name": store.name, "region": store.region},
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return {"ok": True, "id": store.id}

@router.get("/api/stores")
async def api_stores_admin(request: Request, db: AsyncSession = Depends(get_db)):
    _require_user(request)
    stmt = select(Store).order_by(Store.region, Store.name)
    items = list((await db.execute(stmt)).scalars().all())

    # Províncias únicas (para filtro)
    regions = sorted({s.region for s in items if s.region})

    return {
        "total": len(items),
        "regions": regions,
        "items": [
            {
                "id": s.id, "name": s.name, "region": s.region,
                "address": s.address, "phone": s.phone, "email": s.email,
                "opening_hours": s.opening_hours,
                "latitude": s.latitude, "longitude": s.longitude,
                "is_active": s.is_active,
            } for s in items
        ],
    }


@router.patch("/api/stores/{sid}")
async def api_store_update(
    sid: int, request: Request, payload: StoreUpdateIn,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.update_store(db, sid, payload.model_dump(exclude_unset=True))
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="store.updated", entity_type="store", entity_id=sid,
        details=payload.model_dump(exclude_unset=True),
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


@router.delete("/api/stores/{sid}")
async def api_store_delete(
    sid: int, request: Request, db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    user = _require_user(request)
    try:
        await content.delete_store(db, sid)
    except content.NotFound as e:
        return _error(404, str(e))

    await audit.log_action(
        db, admin_user_id=user.id, username=user.username,
        action="store.deactivated", entity_type="store", entity_id=sid,
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


# ──────────────────────────── Utilizadores ────────────────────────────

def _user_out(u: AdminUser) -> dict:
    return {
        "id": u.id, "username": u.username, "email": u.email,
        "display_name": u.display_name,
        "role": getattr(u, "role", "superadmin" if u.is_superadmin else "editor"),
        "is_superadmin": u.is_superadmin,
        "is_active": u.is_active, "is_locked": u.is_locked,
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
        "last_login_ip": u.last_login_ip,
        "created_at": u.created_at.isoformat(),
    }


@router.get("/api/users")
async def api_users(request: Request, db: AsyncSession = Depends(get_db)):
    me = _require_user(request)
    items = await admin_users.list_users(db)
    return {
        "total": len(items),
        "items": [_user_out(u) for u in items],
        "can_manage": me.is_superadmin,
        "me_id": me.id,
    }


@router.post("/api/users")
async def api_users_create(
    request: Request, payload: AdminUserIn,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    actor = _require_superadmin(request)

    try:
        u = await admin_users.create_user(
            db,
            username=payload.username,
            email=payload.email,
            display_name=payload.display_name,
            password=payload.password,
            role=payload.role,
        )
    except admin_users.Conflict as e:
        return _error(409, str(e))

    await audit.log_action(
        db, admin_user_id=actor.id, username=actor.username,
        action="admin.user.created", entity_type="admin_user", entity_id=u.id,
        details={"username": u.username, "role": u.role},
        ip_address=request.client.host if request.client else None,
    )
    return _user_out(u)


@router.patch("/api/users/{uid}")
async def api_users_update(
    uid: int, request: Request, payload: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    actor = _require_user(request)

    try:
        u = await admin_users.update_user(
            db, uid, actor=actor,
            **payload.model_dump(exclude_unset=True),
        )
    except admin_users.NotFound as e:
        return _error(404, str(e))
    except admin_users.Forbidden as e:
        return _error(403, str(e))
    except admin_users.Conflict as e:
        return _error(409, str(e))

    await audit.log_action(
        db, admin_user_id=actor.id, username=actor.username,
        action="admin.user.updated", entity_type="admin_user", entity_id=uid,
        details=payload.model_dump(exclude_unset=True),
        ip_address=request.client.host if request.client else None,
    )
    return _user_out(u)


@router.post("/api/users/{uid}/password")
async def api_users_reset_password(
    uid: int, request: Request, payload: AdminUserPasswordReset,
    db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    actor = _require_user(request)

    try:
        await admin_users.reset_password(db, uid, payload.new_password, actor)
    except admin_users.NotFound as e:
        return _error(404, str(e))
    except admin_users.Forbidden as e:
        return _error(403, str(e))

    await audit.log_action(
        db, admin_user_id=actor.id, username=actor.username,
        action="admin.user.password_reset", entity_type="admin_user", entity_id=uid,
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


@router.delete("/api/users/{uid}")
async def api_users_delete(
    uid: int, request: Request, db: AsyncSession = Depends(get_db),
):
    _check_csrf(request, request.headers.get("X-CSRF-Token"))
    actor = _require_superadmin(request)

    try:
        await admin_users.delete_user(db, uid, actor)
    except admin_users.NotFound as e:
        return _error(404, str(e))
    except admin_users.Forbidden as e:
        return _error(403, str(e))

    await audit.log_action(
        db, admin_user_id=actor.id, username=actor.username,
        action="admin.user.deleted", entity_type="admin_user", entity_id=uid,
        ip_address=request.client.host if request.client else None,
    )
    return {"ok": True}


# ──────────────────────────── Auditoria ────────────────────────────

@router.get("/api/audit")
async def api_audit(request: Request, db: AsyncSession = Depends(get_db)):
    _require_superadmin(request)
    entries = await audit.list_recent(db, limit=500)
    return {
        "total": len(entries),
        "items": [
            {
                "id": e.id, "action": e.action,
                "username": e.username_snapshot,
                "entity_type": e.entity_type, "entity_id": e.entity_id,
                "details": e.details,
                "ip_address": e.ip_address,
                "created_at": e.created_at.isoformat(),
            } for e in entries
        ],
    }

