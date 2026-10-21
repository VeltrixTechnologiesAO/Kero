from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import get_db
from schemas.store import StoreListResponse, StoreOption, StoreRead
from services import stores as stores_service

router = APIRouter(prefix="/api/stores", tags=["stores"])


@router.get("", response_model=StoreListResponse)
async def list_stores(
    region: Optional[str] = Query(default=None, max_length=80),
    search: Optional[str] = Query(default=None, max_length=120),
    db: AsyncSession = Depends(get_db),
):
    stores = await stores_service.list_stores(db, region=region, search=search)
    return StoreListResponse(
        total=len(stores),
        items=[StoreRead.model_validate(s) for s in stores],
    )


@router.get("/regions", response_model=List[str])
async def list_regions(db: AsyncSession = Depends(get_db)):
    return await stores_service.list_regions(db)


@router.get("/{store_id}", response_model=StoreRead)
async def get_store(store_id: int, db: AsyncSession = Depends(get_db)):
    store = await stores_service.get_store(db, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Loja não encontrada")
    return StoreRead.model_validate(store)
