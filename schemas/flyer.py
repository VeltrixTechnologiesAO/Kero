from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class StoreRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    region: str
    address: Optional[str] = None


class FlyerPageRead(BaseModel):
    page_number: int
    image_url: str
    thumbnail_url: str
    image_size: int


class FlyerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    valid_from: date
    valid_until: date
    days_remaining: int
    is_active: bool

    store: StoreRead

    page_count: int
    pages: List[FlyerPageRead]

    cover_image_url: Optional[str] = None
    cover_thumbnail_url: Optional[str] = None

    total_image_size: int
    created_at: datetime


class FlyerListResponse(BaseModel):
    total: int = Field(ge=0)
    items: list[FlyerRead]
