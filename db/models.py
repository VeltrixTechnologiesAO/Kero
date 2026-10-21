from datetime import date, datetime, timezone
from typing import List, Optional
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    func,
    Index,
    Numeric,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    region: Mapped[str] = mapped_column(String(80), index=True)
    address: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    opening_hours: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    flyers: Mapped[List["Flyer"]] = relationship(
        back_populates="store",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Store {self.name} ({self.region})>"


class Flyer(Base):
    __tablename__ = "flyers"

    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[int] = mapped_column(
        ForeignKey("stores.id", ondelete="CASCADE"), index=True
    )

    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    valid_from: Mapped[date] = mapped_column(Date, index=True)
    valid_until: Mapped[date] = mapped_column(Date, index=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    store: Mapped[Store] = relationship(back_populates="flyers", lazy="joined")

    pages: Mapped[List["FlyerPage"]] = relationship(
        back_populates="flyer",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="FlyerPage.page_number",
        lazy="selectin",
    )

    @property
    def page_count(self) -> int:
        return len(self.pages or [])

    @property
    def cover(self) -> Optional["FlyerPage"]:
        if not self.pages:
            return None
        return sorted(self.pages, key=lambda p: p.page_number)[0]

    @property
    def total_image_size(self) -> int:
        return sum(p.image_size for p in (self.pages or []))

    @property
    def is_active(self) -> bool:
        today = date.today()
        return self.is_published and self.valid_from <= today <= self.valid_until

    @property
    def days_remaining(self) -> int:
        return (self.valid_until - date.today()).days

    def __repr__(self) -> str:
        return f"<Flyer {self.id} store={self.store_id} pages={len(self.pages or [])}>"


class FlyerPage(Base):
    __tablename__ = "flyer_pages"

    id: Mapped[int] = mapped_column(primary_key=True)
    flyer_id: Mapped[int] = mapped_column(
        ForeignKey("flyers.id", ondelete="CASCADE"), index=True
    )
    page_number: Mapped[int] = mapped_column(Integer)

    image_data: Mapped[bytes] = mapped_column(LargeBinary)
    image_mime: Mapped[str] = mapped_column(String(64))
    image_size: Mapped[int] = mapped_column(Integer)
    image_checksum: Mapped[str] = mapped_column(String(64), index=True)

    thumbnail_data: Mapped[bytes] = mapped_column(LargeBinary)
    thumbnail_mime: Mapped[str] = mapped_column(String(64))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    flyer: Mapped[Flyer] = relationship(back_populates="pages")

    __table_args__ = (
        Index("ix_flyer_pages_flyer_page", "flyer_id", "page_number", unique=True),
    )

    def __repr__(self) -> str:
        return f"<FlyerPage flyer={self.flyer_id} n={self.page_number}>"


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    category: Mapped[Optional[str]] = mapped_column(String(80), nullable=True, index=True)
    description: Mapped[str] = mapped_column(Text)

    prep_time_minutes: Mapped[int] = mapped_column(Integer)
    servings: Mapped[str] = mapped_column(String(20))

    ingredients: Mapped[list] = mapped_column(JSON, default=list)
    instructions: Mapped[list] = mapped_column(JSON, default=list)

    image_data: Mapped[bytes] = mapped_column(LargeBinary)
    image_mime: Mapped[str] = mapped_column(String(64))
    image_size: Mapped[int] = mapped_column(Integer)
    image_checksum: Mapped[str] = mapped_column(String(64), index=True)

    thumbnail_data: Mapped[bytes] = mapped_column(LargeBinary)
    thumbnail_mime: Mapped[str] = mapped_column(String(64))

    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<Recipe {self.slug}>"


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)

    department: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(160), index=True)
    phone: Mapped[str] = mapped_column(String(40))
    province: Mapped[str] = mapped_column(String(80), index=True)

    store_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("stores.id", ondelete="SET NULL"), nullable=True, index=True
    )
    store_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)

    message_type: Mapped[str] = mapped_column(String(80), index=True)
    subject: Mapped[str] = mapped_column(String(160))
    message: Mapped[str] = mapped_column(Text)

    privacy_accepted: Mapped[bool] = mapped_column(Boolean, default=False)

    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    store: Mapped[Optional[Store]] = relationship(lazy="joined")

    def __repr__(self) -> str:
        return f"<ContactMessage {self.id} from={self.email}>"

class Competition(Base):
    __tablename__ = "competitions"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    category: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    description: Mapped[str] = mapped_column(Text)

    valid_from: Mapped[date] = mapped_column(Date, index=True)
    valid_until: Mapped[date] = mapped_column(Date, index=True)

    winners_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    image_data: Mapped[bytes] = mapped_column(LargeBinary)
    image_mime: Mapped[str] = mapped_column(String(64))
    image_size: Mapped[int] = mapped_column(Integer)
    image_checksum: Mapped[str] = mapped_column(String(64), index=True)

    thumbnail_data: Mapped[bytes] = mapped_column(LargeBinary)
    thumbnail_mime: Mapped[str] = mapped_column(String(64))

    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    @property
    def is_active(self) -> bool:
        today = date.today()
        return self.is_published and self.valid_from <= today <= self.valid_until

    @property
    def is_closed(self) -> bool:
        return self.is_published and date.today() > self.valid_until

    @property
    def has_winners(self) -> bool:
        return bool(self.winners_url)

    def __repr__(self) -> str:
        return f"<Competition {self.slug}>"

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(80), index=True)
    brand: Mapped[str] = mapped_column(String(120), default="")
    image_url: Mapped[str] = mapped_column(String(500), default="")
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    unit: Mapped[str] = mapped_column(String(40), default="un")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    promotions: Mapped[list["Promotion"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )


class Promotion(Base):
    __tablename__ = "promotions"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    # 'product' → associada a um produto | 'general' → campanha geral
    kind: Mapped[str] = mapped_column(String(20), default="product")
    product_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), nullable=True
    )
    discount_percent: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    promo_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, index=True)
    end_date: Mapped[date] = mapped_column(Date, index=True)
    image_url: Mapped[str] = mapped_column(String(500), default="")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    product: Mapped[Optional["Product"]] = relationship(back_populates="promotions")

class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    display_name: Mapped[str] = mapped_column(String(120))

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    is_superadmin: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_login_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    role: Mapped[str] = mapped_column(String(20), default="editor", index=True)

    sessions: Mapped[List["AdminSession"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @property
    def is_locked(self) -> bool:
        if self.locked_until is None:
            return False
        now = datetime.now(timezone.utc)
        locked = self.locked_until
        if locked.tzinfo is None:
            locked = locked.replace(tzinfo=timezone.utc)
        return locked > now

    def __repr__(self) -> str:
        return f"<AdminUser {self.username}>"


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    token: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    csrf_token: Mapped[str] = mapped_column(String(64))

    admin_user_id: Mapped[int] = mapped_column(
        ForeignKey("admin_users.id", ondelete="CASCADE"), index=True
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[AdminUser] = relationship(back_populates="sessions", lazy="joined")

    @property
    def is_valid(self) -> bool:
        now = datetime.now(timezone.utc)
        exp = self.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return exp > now and self.user.is_active and not self.user.is_locked

    def __repr__(self) -> str:
        return f"<AdminSession user={self.admin_user_id}>"


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: Mapped[int] = mapped_column(primary_key=True)

    admin_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    username_snapshot: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)

    action: Mapped[str] = mapped_column(String(80), index=True)
    entity_type: Mapped[Optional[str]] = mapped_column(String(60), nullable=True, index=True)
    entity_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    __table_args__ = (
        Index("ix_audit_entity", "entity_type", "entity_id"),
    )

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} by {self.username_snapshot}>"

