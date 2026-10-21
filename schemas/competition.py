from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class CompetitionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    category: Optional[str] = None
    description: str
    valid_from: date
    valid_until: date
    is_active: bool
    is_closed: bool
    has_winners: bool
    winners_url: Optional[str] = None
    is_featured: bool

    image_url: str
    thumbnail_url: str
    created_at: datetime


class CompetitionListResponse(BaseModel):
    total: int
    items: List[CompetitionRead]
