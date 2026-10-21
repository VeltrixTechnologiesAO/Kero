from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class ContactFormIn(BaseModel):
    department: Optional[str] = Field(default=None, max_length=80)
    first_name: str = Field(min_length=2, max_length=80)
    last_name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=40)
    province: str = Field(min_length=2, max_length=80)
    store_id: Optional[int] = None
    message_type: str = Field(min_length=2, max_length=80)
    subject: str = Field(min_length=3, max_length=160)
    message: str = Field(min_length=10, max_length=4000)
    privacy_accepted: bool

    @field_validator("privacy_accepted")
    @classmethod
    def _must_accept(cls, v: bool) -> bool:
        if not v:
            raise ValueError("É necessário aceitar a política de privacidade.")
        return v

    @field_validator("first_name", "last_name", "subject")
    @classmethod
    def _strip(cls, v: str) -> str:
        return v.strip()

    @field_validator("message")
    @classmethod
    def _strip_message(cls, v: str) -> str:
        return v.strip()


class ContactFormOut(BaseModel):
    ok: bool
    message: str
    reference: Optional[str] = None


class ContactOptions(BaseModel):
    provinces: List[str]
    message_types: List[str]
    departments: List[str]


class ContactMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    department: Optional[str]
    first_name: str
    last_name: str
    email: str
    phone: str
    province: str
    store_name: Optional[str]
    message_type: str
    subject: str
    message: str
    is_read: bool
    is_archived: bool
    created_at: datetime
