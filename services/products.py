from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Tuple, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.models import Product, Promotion


def _today() -> date:
    return date.today()


def _promo_is_current(promo: Promotion) -> bool:
    today = _today()
    return promo.is_active and promo.start_date <= today <= promo.end_date


def _days_remaining(promo: Promotion) -> int:
    return max(0, (promo.end_date - _today()).days)


def _effective_price(product: Product) -> Tuple[Decimal, Optional[Promotion]]:
    """Devolve (preço_atual, promoção_ativa)."""
    if not product.is_active:
        return product.price, None

    promo = next(
        (p for p in product.promotions if _promo_is_current(p) and p.kind == "product"),
        None,
    )
    if not promo:
        return product.price, None

    if promo.promo_price is not None and promo.promo_price > 0:
        return promo.promo_price, promo
    if promo.discount_percent:
        discounted = product.price * (Decimal(100 - promo.discount_percent) / Decimal(100))
        return discounted.quantize(Decimal("0.01")), promo
    return product.price, None


def serialize_product(product: Product) -> dict:
    current_price, active_promo = _effective_price(product)

    promo_summary = None
    if active_promo:
        promo_summary = {
            "id": active_promo.id,
            "title": active_promo.title,
            "description": active_promo.description,
            "kind": active_promo.kind,
            "discount_percent": active_promo.discount_percent,
            "promo_price": active_promo.promo_price,
            "start_date": active_promo.start_date,
            "end_date": active_promo.end_date,
            "image_url": active_promo.image_url,
            "is_featured": active_promo.is_featured,
            "is_current": True,
            "days_remaining": _days_remaining(active_promo),
        }

    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "category": product.category,
        "brand": product.brand,
        "image_url": product.image_url,
        "price": product.price,
        "current_price": current_price,
        "has_promotion": active_promo is not None,
        "unit": product.unit,
        "is_active": product.is_active,
        "active_promotion": promo_summary,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }


def serialize_promotion(promo: Promotion) -> dict:
    product_name = promo.product.name if promo.product else None
    product_slug = promo.product.slug if promo.product else None
    return {
        "id": promo.id,
        "title": promo.title,
        "description": promo.description,
        "kind": promo.kind,
        "product_id": promo.product_id,
        "discount_percent": promo.discount_percent,
        "promo_price": promo.promo_price,
        "start_date": promo.start_date,
        "end_date": promo.end_date,
        "image_url": promo.image_url,
        "is_featured": promo.is_featured,
        "is_active": promo.is_active,
        "is_current": _promo_is_current(promo),
        "days_remaining": _days_remaining(promo),
        "product_name": product_name,
        "product_slug": product_slug,
        "created_at": promo.created_at,
        "updated_at": promo.updated_at,
    }


# ─────────── Produtos (público) ───────────
async def list_products(
    db: AsyncSession,
    *,
    search: str = "",
    category: str = "",
    only_promotions: bool = False,
    include_inactive: bool = False,
) -> Tuple[List[dict], List[str]]:
    stmt = select(Product).options(selectinload(Product.promotions))

    if not include_inactive:
        stmt = stmt.where(Product.is_active.is_(True))

    if category:
        stmt = stmt.where(Product.category == category)

    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(
            (Product.name.ilike(like))
            | (Product.brand.ilike(like))
            | (Product.category.ilike(like))
        )

    stmt = stmt.order_by(Product.name.asc())
    result = await db.execute(stmt)
    products = result.scalars().all()

    if only_promotions:
        products = [p for p in products if _effective_price(p)[1] is not None]

    serialized = [serialize_product(p) for p in products]

    categories_stmt = select(Product.category).distinct().order_by(Product.category)
    categories = [c for c in (await db.execute(categories_stmt)).scalars().all() if c]

    return serialized, categories


async def get_product_by_slug(db: AsyncSession, slug: str) -> Optional[dict]:
    stmt = (
        select(Product)
        .options(selectinload(Product.promotions))
        .where(Product.slug == slug)
    )
    product = (await db.execute(stmt)).scalar_one_or_none()
    if not product:
        return None
    data = serialize_product(product)
    data["promotion_history"] = [
        serialize_promotion(p)
        for p in sorted(product.promotions, key=lambda x: x.start_date, reverse=True)
    ]
    return data


# ─────────── Promoções (público) ───────────
async def list_promotions(
    db: AsyncSession,
    *,
    only_current: bool = True,
    only_featured: bool = False,
    kind: str = "",
) -> List[dict]:
    stmt = select(Promotion).options(selectinload(Promotion.product))
    if only_featured:
        stmt = stmt.where(Promotion.is_featured.is_(True))
    if kind in ("product", "general"):
        stmt = stmt.where(Promotion.kind == kind)
    stmt = stmt.order_by(
        Promotion.is_featured.desc(),
        Promotion.start_date.desc(),
    )

    promos = (await db.execute(stmt)).scalars().all()

    if only_current:
        promos = [p for p in promos if _promo_is_current(p)]

    return [serialize_promotion(p) for p in promos]


# ─────────── CRUD (admin) ───────────
async def create_product(db: AsyncSession, payload: dict) -> dict:
    slug = payload["slug"].strip().lower()
    exists = (
        await db.execute(select(Product).where(Product.slug == slug))
    ).scalar_one_or_none()
    if exists:
        raise ValueError("Já existe um produto com este slug.")

    product = Product(**{**payload, "slug": slug})
    db.add(product)
    await db.commit()
    await db.refresh(product, ["promotions"])
    return serialize_product(product)


async def update_product(
    db: AsyncSession, product_id: int, payload: dict
) -> Optional[dict]:
    stmt = (
        select(Product)
        .options(selectinload(Product.promotions))
        .where(Product.id == product_id)
    )
    product = (await db.execute(stmt)).scalar_one_or_none()
    if not product:
        return None

    if "slug" in payload and payload["slug"]:
        payload["slug"] = payload["slug"].strip().lower()

    for k, v in payload.items():
        if v is not None:
            setattr(product, k, v)

    await db.commit()
    await db.refresh(product, ["promotions"])
    return serialize_product(product)


async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = (
        await db.execute(select(Product).where(Product.id == product_id))
    ).scalar_one_or_none()
    if not product:
        return False
    await db.delete(product)
    await db.commit()
    return True


async def create_promotion(db: AsyncSession, payload: dict) -> dict:
    promo = Promotion(**payload)
    db.add(promo)
    await db.commit()
    await db.refresh(promo, ["product"])
    return serialize_promotion(promo)


async def update_promotion(
    db: AsyncSession, promo_id: int, payload: dict
) -> Optional[dict]:
    stmt = (
        select(Promotion)
        .options(selectinload(Promotion.product))
        .where(Promotion.id == promo_id)
    )
    promo = (await db.execute(stmt)).scalar_one_or_none()
    if not promo:
        return None

    for k, v in payload.items():
        if v is not None:
            setattr(promo, k, v)

    await db.commit()
    await db.refresh(promo, ["product"])
    return serialize_promotion(promo)


async def delete_promotion(db: AsyncSession, promo_id: int) -> bool:
    promo = (
        await db.execute(select(Promotion).where(Promotion.id == promo_id))
    ).scalar_one_or_none()
    if not promo:
        return False
    await db.delete(promo)
    await db.commit()
    return True
