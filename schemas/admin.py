from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ──────────────────── Utilizadores ────────────────────

class AdminUserIn(BaseModel):
    username: str = Field(min_length=3, max_length=60)
    email: EmailStr
    display_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=10, max_length=200)
    role: str = Field(pattern=r"^(superadmin|editor)$")

    @field_validator("username")
    @classmethod
    def _norm_username(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("email")
    @classmethod
    def _norm_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("display_name")
    @classmethod
    def _strip_name(cls, v: str) -> str:
        return v.strip()


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    display_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    role: Optional[str] = Field(default=None, pattern=r"^(superadmin|editor)$")
    is_active: Optional[bool] = None


class AdminUserPasswordReset(BaseModel):
    new_password: str = Field(min_length=10, max_length=200)


class AdminUserOut(BaseModel):
    id: int
    username: str
    email: str
    display_name: str
    role: str
    is_superadmin: bool
    is_active: bool
    is_locked: bool
    last_login_at: Optional[datetime] = None
    last_login_ip: Optional[str] = None
    created_at: datetime


# ──────────────────── Folhetos ────────────────────

class FlyerUpdateIn(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=160)
    description: Optional[str] = Field(default=None, max_length=2000)
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None
    is_published: Optional[bool] = None


# ──────────────────── Receitas ────────────────────

class RecipeUpdateIn(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=160)
    category: Optional[str] = Field(default=None, max_length=80)
    description: Optional[str] = Field(default=None, max_length=4000)
    prep_time_minutes: Optional[int] = Field(default=None, ge=1, le=1000)
    servings: Optional[str] = Field(default=None, max_length=20)
    ingredients: Optional[List[str]] = None
    instructions: Optional[List[str]] = None
    is_published: Optional[bool] = None


# ──────────────────── Competições ────────────────────

class CompetitionUpdateIn(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=160)
    category: Optional[str] = Field(default=None, max_length=80)
    description: Optional[str] = Field(default=None, max_length=4000)
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None
    winners_url: Optional[str] = Field(default=None, max_length=500)
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None


# ──────────────────── Lojas ────────────────────

class StoreUpdateIn(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    region: Optional[str] = Field(default=None, min_length=1, max_length=80)
    address: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=40)
    email: Optional[EmailStr] = None
    opening_hours: Optional[str] = Field(default=None, max_length=160)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    is_active: Optional[bool] = None


# ──────────────────── Mensagens ────────────────────

class MessageUpdateIn(BaseModel):
    is_read: Optional[bool] = None
    is_archived: Optional[bool] = None
