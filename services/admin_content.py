import logging
from datetime import date
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Competition, ContactMessage, Flyer, Recipe, Store

logger = logging.getLogger("kero.admin.content")


class NotFound(Exception):
    pass


class ValidationError(Exception):
    pass


# ──────────────────── Folhetos ────────────────────

async def get_flyer(db: AsyncSession, flyer_id: int) -> Flyer:
    flyer = await db.get(Flyer, flyer_id)
    if not flyer:
        raise NotFound("Folheto não encontrado")
    return flyer


async def update_flyer(db: AsyncSession, flyer_id: int, data: dict) -> Flyer:
    flyer = await get_flyer(db, flyer_id)

    if "title" in data and data["title"] is not None:
        flyer.title = data["title"]
    if "description" in data:
        flyer.description = data["description"]
    if "valid_from" in data and data["valid_from"] is not None:
        flyer.valid_from = data["valid_from"]
    if "valid_until" in data and data["valid_until"] is not None:
        flyer.valid_until = data["valid_until"]
    if "is_published" in data and data["is_published"] is not None:
        flyer.is_published = data["is_published"]

    if flyer.valid_until < flyer.valid_from:
        raise ValidationError("A data final não pode ser anterior à inicial")

    await db.commit()
    await db.refresh(flyer)
    return flyer


async def delete_flyer(db: AsyncSession, flyer_id: int) -> None:
    flyer = await get_flyer(db, flyer_id)
    await db.delete(flyer)
    await db.commit()


# ──────────────────── Receitas ────────────────────

async def get_recipe(db: AsyncSession, recipe_id: int) -> Recipe:
    recipe = await db.get(Recipe, recipe_id)
    if not recipe:
        raise NotFound("Receita não encontrada")
    return recipe


async def update_recipe(db: AsyncSession, recipe_id: int, data: dict) -> Recipe:
    recipe = await get_recipe(db, recipe_id)

    for field in ("title", "category", "description", "servings"):
        if field in data:
            setattr(recipe, field, data[field])

    if "prep_time_minutes" in data and data["prep_time_minutes"] is not None:
        recipe.prep_time_minutes = data["prep_time_minutes"]

    if "ingredients" in data and data["ingredients"] is not None:
        recipe.ingredients = [i.strip() for i in data["ingredients"] if i.strip()]

    if "instructions" in data and data["instructions"] is not None:
        recipe.instructions = [i.strip() for i in data["instructions"] if i.strip()]

    if "is_published" in data and data["is_published"] is not None:
        recipe.is_published = data["is_published"]

    await db.commit()
    await db.refresh(recipe)
    return recipe


async def delete_recipe(db: AsyncSession, recipe_id: int) -> None:
    recipe = await get_recipe(db, recipe_id)
    await db.delete(recipe)
    await db.commit()


# ──────────────────── Competições ────────────────────

async def get_competition(db: AsyncSession, cid: int) -> Competition:
    c = await db.get(Competition, cid)
    if not c:
        raise NotFound("Competição não encontrada")
    return c


async def update_competition(db: AsyncSession, cid: int, data: dict) -> Competition:
    c = await get_competition(db, cid)

    for field in ("title", "category", "description", "winners_url"):
        if field in data:
            setattr(c, field, data[field])

    if "valid_from" in data and data["valid_from"] is not None:
        c.valid_from = data["valid_from"]
    if "valid_until" in data and data["valid_until"] is not None:
        c.valid_until = data["valid_until"]
    if "is_published" in data and data["is_published"] is not None:
        c.is_published = data["is_published"]
    if "is_featured" in data and data["is_featured"] is not None:
        c.is_featured = data["is_featured"]

    if c.valid_until < c.valid_from:
        raise ValidationError("A data final não pode ser anterior à inicial")

    await db.commit()
    await db.refresh(c)
    return c


async def delete_competition(db: AsyncSession, cid: int) -> None:
    c = await get_competition(db, cid)
    await db.delete(c)
    await db.commit()


# ──────────────────── Lojas ────────────────────

async def get_store(db: AsyncSession, sid: int) -> Store:
    s = await db.get(Store, sid)
    if not s:
        raise NotFound("Loja não encontrada")
    return s


async def update_store(db: AsyncSession, sid: int, data: dict) -> Store:
    s = await get_store(db, sid)

    for field in ("name", "region", "address", "phone", "email", "opening_hours"):
        if field in data:
            setattr(s, field, data[field])

    if "latitude" in data:
        s.latitude = data["latitude"]
    if "longitude" in data:
        s.longitude = data["longitude"]

    if "is_active" in data and data["is_active"] is not None:
        s.is_active = data["is_active"]

    await db.commit()
    await db.refresh(s)
    return s


async def delete_store(db: AsyncSession, sid: int) -> None:
    s = await get_store(db, sid)
    # soft delete — não apagar fisicamente lojas com folhetos associados
    s.is_active = False
    await db.commit()


# ──────────────────── Mensagens ────────────────────

async def get_message(db: AsyncSession, mid: int) -> ContactMessage:
    m = await db.get(ContactMessage, mid)
    if not m:
        raise NotFound("Mensagem não encontrada")
    return m


async def update_message(db: AsyncSession, mid: int, data: dict) -> ContactMessage:
    m = await get_message(db, mid)

    if "is_read" in data and data["is_read"] is not None:
        m.is_read = data["is_read"]
    if "is_archived" in data and data["is_archived"] is not None:
        m.is_archived = data["is_archived"]

    await db.commit()
    await db.refresh(m)
    return m


async def delete_message(db: AsyncSession, mid: int) -> None:
    m = await get_message(db, mid)
    await db.delete(m)
    await db.commit()
