from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import get_db
from schemas.product import (
    PromotionCreate, PromotionUpdate,
    ProductCreate, ProductUpdate,
)
from services import products as product_service

router = APIRouter(prefix="/admin/api", tags=["admin-products"])


# ─────────── Produtos ───────────
@router.get("/products")
async def admin_list_products(
    search: str = "",
    category: str = "",
    db: AsyncSession = Depends(get_db),
):
    items, categories = await product_service.list_products(
        db, search=search, category=category, include_inactive=True
    )
    return {"items": items, "total": len(items), "categories": categories}


@router.post("/products")
async def admin_create_product(
    payload: ProductCreate, db: AsyncSession = Depends(get_db)
):
    try:
        return await product_service.create_product(db, payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/products/{product_id}")
async def admin_update_product(
    product_id: int, payload: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    data = await product_service.update_product(
        db, product_id, payload.model_dump(exclude_unset=True)
    )
    if not data:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return data


@router.delete("/products/{product_id}")
async def admin_delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    ok = await product_service.delete_product(db, product_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return {"ok": True}


# ─────────── Promoções ───────────
@router.get("/promotions")
async def admin_list_promotions(
    kind: str = "", db: AsyncSession = Depends(get_db)
):
    items = await product_service.list_promotions(db, only_current=False, kind=kind)
    return {"items": items, "total": len(items)}


@router.post("/promotions")
async def admin_create_promotion(
    payload: PromotionCreate, db: AsyncSession = Depends(get_db)
):
    return await product_service.create_promotion(db, payload.model_dump())


@router.put("/promotions/{promo_id}")
async def admin_update_promotion(
    promo_id: int, payload: PromotionUpdate, db: AsyncSession = Depends(get_db)
):
    data = await product_service.update_promotion(
        db, promo_id, payload.model_dump(exclude_unset=True)
    )
    if not data:
        raise HTTPException(status_code=404, detail="Promoção não encontrada")
    return data


@router.delete("/promotions/{promo_id}")
async def admin_delete_promotion(promo_id: int, db: AsyncSession = Depends(get_db)):
    ok = await product_service.delete_promotion(db, promo_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Promoção não encontrada")
    return {"ok": True}
