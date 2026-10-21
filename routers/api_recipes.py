from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import get_db
from schemas.recipe import RecipeDetail, RecipeListResponse, RecipeRead
from services import recipes as recipes_service

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

IMAGE_CACHE = "public, max-age=86400, immutable"


def _to_card(recipe) -> RecipeRead:
    return RecipeRead(
        id=recipe.id,
        slug=recipe.slug,
        title=recipe.title,
        category=recipe.category,
        description=recipe.description,
        prep_time_minutes=recipe.prep_time_minutes,
        servings=recipe.servings,
        image_url=f"/api/recipes/{recipe.id}/image",
        thumbnail_url=f"/api/recipes/{recipe.id}/thumbnail",
        created_at=recipe.created_at,
    )


def _to_detail(recipe) -> RecipeDetail:
    return RecipeDetail(
        **_to_card(recipe).model_dump(),
        ingredients=list(recipe.ingredients or []),
        instructions=list(recipe.instructions or []),
    )


@router.get("", response_model=RecipeListResponse)
async def list_recipes(
    category: Optional[str] = Query(default=None, max_length=80),
    db: AsyncSession = Depends(get_db),
):
    items = await recipes_service.list_recipes(db, category=category)
    return RecipeListResponse(total=len(items), items=[_to_card(r) for r in items])


@router.get("/categories", response_model=list)
async def list_categories(db: AsyncSession = Depends(get_db)):
    return await recipes_service.list_categories(db)


@router.get("/{slug}", response_model=RecipeDetail)
async def get_recipe(slug: str, db: AsyncSession = Depends(get_db)):
    recipe = await recipes_service.get_recipe_by_slug(db, slug)
    if not recipe:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    return _to_detail(recipe)


@router.get("/{recipe_id}/image")
async def get_image(recipe_id: int, db: AsyncSession = Depends(get_db)):
    row = await recipes_service.get_recipe_image(db, recipe_id)
    if not row:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
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


@router.get("/{recipe_id}/thumbnail")
async def get_thumbnail(recipe_id: int, db: AsyncSession = Depends(get_db)):
    row = await recipes_service.get_recipe_thumbnail(db, recipe_id)
    if not row:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
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
