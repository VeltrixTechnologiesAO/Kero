import logging
from typing import List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer

from db.models import Recipe
from services.flyer_images import ProcessedImage

logger = logging.getLogger("kero.recipes")


async def list_recipes(
    db: AsyncSession,
    category: Optional[str] = None,
    limit: int = 60,
) -> List[Recipe]:
    stmt = (
        select(Recipe)
        .options(defer(Recipe.image_data), defer(Recipe.thumbnail_data))
        .where(Recipe.is_published.is_(True))
        .order_by(Recipe.created_at.desc())
        .limit(limit)
    )
    if category:
        stmt = stmt.where(Recipe.category == category)

    return list((await db.execute(stmt)).scalars().unique().all())


async def get_recipe_by_slug(db: AsyncSession, slug: str) -> Optional[Recipe]:
    stmt = (
        select(Recipe)
        .options(defer(Recipe.image_data), defer(Recipe.thumbnail_data))
        .where(Recipe.slug == slug, Recipe.is_published.is_(True))
    )
    return (await db.execute(stmt)).scalar_one_or_none()


async def get_recipe_image(
    db: AsyncSession, recipe_id: int
) -> Optional[Tuple[bytes, str, str]]:
    stmt = select(
        Recipe.image_data, Recipe.image_mime, Recipe.image_checksum
    ).where(Recipe.id == recipe_id)
    row = (await db.execute(stmt)).first()
    return tuple(row) if row else None


async def get_recipe_thumbnail(
    db: AsyncSession, recipe_id: int
) -> Optional[Tuple[bytes, str, str]]:
    stmt = select(
        Recipe.thumbnail_data, Recipe.thumbnail_mime, Recipe.image_checksum
    ).where(Recipe.id == recipe_id)
    row = (await db.execute(stmt)).first()
    return tuple(row) if row else None


async def list_categories(db: AsyncSession) -> List[str]:
    stmt = (
        select(Recipe.category)
        .where(Recipe.is_published.is_(True), Recipe.category.is_not(None))
        .distinct()
        .order_by(Recipe.category)
    )
    return [c for c in (await db.execute(stmt)).scalars().all() if c]


async def create_recipe(
    db: AsyncSession,
    *,
    slug: str,
    title: str,
    category: Optional[str],
    description: str,
    prep_time_minutes: int,
    servings: str,
    ingredients: List[str],
    instructions: List[str],
    image: ProcessedImage,
    is_published: bool = True,
) -> Recipe:
    recipe = Recipe(
        slug=slug,
        title=title,
        category=category,
        description=description,
        prep_time_minutes=prep_time_minutes,
        servings=servings,
        ingredients=ingredients,
        instructions=instructions,
        image_data=image.data,
        image_mime=image.mime,
        image_size=image.size,
        image_checksum=image.checksum,
        thumbnail_data=image.thumbnail_data,
        thumbnail_mime=image.thumbnail_mime,
        is_published=is_published,
    )
    db.add(recipe)
    await db.commit()
    await db.refresh(recipe)
    logger.info("Receita criada slug=%s", slug)
    return recipe
