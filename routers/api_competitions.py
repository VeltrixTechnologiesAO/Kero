from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import get_db
from schemas.competition import CompetitionListResponse, CompetitionRead
from services import competitions as competitions_service

router = APIRouter(prefix="/api/competitions", tags=["competitions"])

IMAGE_CACHE = "public, max-age=86400, immutable"


def _to_schema(c) -> CompetitionRead:
    return CompetitionRead(
        id=c.id,
        slug=c.slug,
        title=c.title,
        category=c.category,
        description=c.description,
        valid_from=c.valid_from,
        valid_until=c.valid_until,
        is_active=c.is_active,
        is_closed=c.is_closed,
        has_winners=c.has_winners,
        winners_url=c.winners_url,
        is_featured=c.is_featured,
        image_url=f"/api/competitions/{c.id}/image",
        thumbnail_url=f"/api/competitions/{c.id}/thumbnail",
        created_at=c.created_at,
    )


@router.get("", response_model=CompetitionListResponse)
async def list_competitions(
    only_active: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
):
    items = await competitions_service.list_competitions(db, only_active=only_active)
    return CompetitionListResponse(total=len(items), items=[_to_schema(c) for c in items])


@router.get("/{slug}", response_model=CompetitionRead)
async def get_competition(slug: str, db: AsyncSession = Depends(get_db)):
    c = await competitions_service.get_competition_by_slug(db, slug)
    if not c:
        raise HTTPException(status_code=404, detail="Competição não encontrada")
    return _to_schema(c)


@router.get("/{competition_id}/image")
async def get_image(competition_id: int, db: AsyncSession = Depends(get_db)):
    row = await competitions_service.get_competition_image(db, competition_id)
    if not row:
        raise HTTPException(status_code=404, detail="Competição não encontrada")
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


@router.get("/{competition_id}/thumbnail")
async def get_thumbnail(competition_id: int, db: AsyncSession = Depends(get_db)):
    row = await competitions_service.get_competition_thumbnail(db, competition_id)
    if not row:
        raise HTTPException(status_code=404, detail="Competição não encontrada")
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
