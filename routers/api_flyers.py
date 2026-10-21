from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import get_db
from schemas.flyer import FlyerListResponse, FlyerRead, FlyerPageRead, StoreRead
from schemas.store import StoreOption
from services import flyers as flyers_service

router = APIRouter(prefix="/api/flyers", tags=["flyers"])

IMAGE_CACHE = "public, max-age=86400, immutable"


def _to_schema(flyer) -> FlyerRead:
    cover = flyer.cover
    pages = sorted(flyer.pages or [], key=lambda p: p.page_number)

    return FlyerRead(
        id=flyer.id,
        title=flyer.title,
        description=flyer.description,
        valid_from=flyer.valid_from,
        valid_until=flyer.valid_until,
        days_remaining=flyer.days_remaining,
        is_active=flyer.is_active,
        store=StoreRead.model_validate(flyer.store),
        page_count=len(pages),
        pages=[
            FlyerPageRead(
                page_number=p.page_number,
                image_url=f"/api/flyers/{flyer.id}/pages/{p.page_number}/image",
                thumbnail_url=f"/api/flyers/{flyer.id}/pages/{p.page_number}/thumbnail",
                image_size=p.image_size,
            )
            for p in pages
        ],
        cover_image_url=(
            f"/api/flyers/{flyer.id}/pages/{cover.page_number}/image" if cover else None
        ),
        cover_thumbnail_url=(
            f"/api/flyers/{flyer.id}/pages/{cover.page_number}/thumbnail" if cover else None
        ),
        total_image_size=flyer.total_image_size,
        created_at=flyer.created_at,
    )


@router.get("", response_model=FlyerListResponse)
async def list_flyers(
    region: Optional[str] = Query(default=None, max_length=80),
    store_id: Optional[int] = Query(default=None, gt=0),
    search: Optional[str] = Query(default=None, max_length=120),
    db: AsyncSession = Depends(get_db),
):
    items = await flyers_service.list_active_flyers(
        db, region=region, store_id=store_id, search=search
    )
    return FlyerListResponse(total=len(items), items=[_to_schema(f) for f in items])


@router.get("/regions", response_model=List[str])
async def list_regions(db: AsyncSession = Depends(get_db)):
    return await flyers_service.list_regions(db)


@router.get("/stores", response_model=List[StoreOption])
async def list_stores_with_flyers(db: AsyncSession = Depends(get_db)):
    stores = await flyers_service.list_stores_with_active_flyers(db)
    return [StoreOption.model_validate(s) for s in stores]


@router.get("/{flyer_id}/pages/{page_number}/image")
async def get_page_image(
    flyer_id: int, page_number: int, db: AsyncSession = Depends(get_db),
):
    row = await flyers_service.get_flyer_page_image(db, flyer_id, page_number)
    if not row:
        raise HTTPException(status_code=404, detail="Página não encontrada")
    data, mime, checksum = row
    return Response(
        content=data,
        media_type=mime,
        headers={
            "Cache-Control": IMAGE_CACHE,
            "ETag": f'"{checksum[:24]}"',
            "Content-Length": str(len(data)),
        },
    )


@router.get("/{flyer_id}/pages/{page_number}/thumbnail")
async def get_page_thumbnail(
    flyer_id: int, page_number: int, db: AsyncSession = Depends(get_db),
):
    row = await flyers_service.get_flyer_page_thumbnail(db, flyer_id, page_number)
    if not row:
        raise HTTPException(status_code=404, detail="Página não encontrada")
    data, mime, checksum = row
    return Response(
        content=data,
        media_type=mime,
        headers={
            "Cache-Control": IMAGE_CACHE,
            "ETag": f'"{checksum[:24]}"',
            "Content-Length": str(len(data)),
        },
    )
