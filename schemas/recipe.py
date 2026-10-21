from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class RecipeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    category: Optional[str] = None
    description: str
    prep_time_minutes: int
    servings: str

    image_url: str
    thumbnail_url: str

    created_at: datetime


class RecipeDetail(RecipeRead):
    ingredients: list[str]
    instructions: list[str]


class RecipeListResponse(BaseModel):
    total: int
    items: list[RecipeRead]
