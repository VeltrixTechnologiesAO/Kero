from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class StoreRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    region: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    opening_hours: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class StoreOption(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    region: str
    address: Optional[str] = None


class StoreListResponse(BaseModel):
    total: int
    items: List[StoreRead]
