from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ─────────────── Product ───────────────
class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    slug: str = Field(..., min_length=2, max_length=200)
    description: str = ""
    category: str = Field(..., min_length=1, max_length=80)
    brand: str = ""
    image_url: str = ""
    price: Decimal = Field(..., ge=0)
    unit: str = "un"
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[Decimal] = None
    unit: Optional[str] = None
    is_active: Optional[bool] = None


class PromotionSummary(BaseModel):
    id: int
    title: str
    description: str = ""
    kind: str
    discount_percent: Optional[int] = None
    promo_price: Optional[Decimal] = None
    start_date: date
    end_date: date
    image_url: str = ""
    is_featured: bool = False
    is_current: bool = False
    days_remaining: int = 0


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    category: str
    brand: str
    image_url: str
    price: Decimal
    current_price: Decimal
    has_promotion: bool
    unit: str
    is_active: bool
    active_promotion: Optional[PromotionSummary] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListOut(BaseModel):
    items: List[ProductOut]
    total: int
    categories: List[str]


# ─────────────── Promotion ───────────────
class PromotionCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = ""
    kind: str = Field(..., pattern="^(product|general)$")
    product_id: Optional[int] = None
    discount_percent: Optional[int] = Field(None, ge=1, le=100)
    promo_price: Optional[Decimal] = Field(None, ge=0)
    start_date: date
    end_date: date
    image_url: str = ""
    is_featured: bool = False
    is_active: bool = True

    @field_validator("end_date")
    @classmethod
    def check_dates(cls, v, info):
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("A data de fim tem de ser ≥ à data de início.")
        return v

    @field_validator("product_id")
    @classmethod
    def check_product(cls, v, info):
        kind = info.data.get("kind")
        if kind == "product" and v is None:
            raise ValueError("Promoções de produto exigem product_id.")
        if kind == "general" and v is not None:
            raise ValueError("Promoções gerais não devem ter product_id.")
        return v


class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    kind: Optional[str] = None
    product_id: Optional[int] = None
    discount_percent: Optional[int] = None
    promo_price: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    image_url: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class PromotionOut(PromotionCreate):
    id: int
    is_current: bool
    days_remaining: int
    product_name: Optional[str] = None
    product_slug: Optional[str] = None
    created_at: datetime
    updated_at: datetime
