from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import get_db
from schemas.product import ProductListOut
from services import products as product_service

router = APIRouter(tags=["products"])


@router.get("/api/products", response_model=ProductListOut)
async def list_products(
    search: str = Query("", max_length=120),
    category: str = Query("", max_length=80),
    only_promotions: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    items, categories = await product_service.list_products(
        db, search=search, category=category, only_promotions=only_promotions
    )
    return {"items": items, "total": len(items), "categories": categories}


@router.get("/api/products/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    _, categories = await product_service.list_products(db)
    return categories


@router.get("/api/products/{slug}")
async def get_product(slug: str, db: AsyncSession = Depends(get_db)):
    data = await product_service.get_product_by_slug(db, slug)
    if not data:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return data


@router.get("/api/promotions")
async def list_promotions(
    only_featured: bool = Query(False),
    kind: str = Query("", pattern="^(|product|general)$"),
    db: AsyncSession = Depends(get_db),
):
    items = await product_service.list_promotions(
        db, only_current=True, only_featured=only_featured, kind=kind
    )
    return {"items": items, "total": len(items)}
