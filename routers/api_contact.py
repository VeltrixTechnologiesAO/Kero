from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import get_db
from schemas.contact import ContactFormIn, ContactFormOut, ContactOptions
from services import contact as contact_service

router = APIRouter(prefix="/api/contact", tags=["contact"])


@router.get("/options", response_model=ContactOptions)
async def get_options():
    return ContactOptions(
        provinces=contact_service.PROVINCES,
        message_types=contact_service.MESSAGE_TYPES,
        departments=contact_service.DEPARTMENTS,
    )


@router.post("", response_model=ContactFormOut)
async def submit_contact(
    payload: ContactFormIn,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    record = await contact_service.create_contact_message(
        db,
        department=payload.department,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=str(payload.email),
        phone=payload.phone,
        province=payload.province,
        store_id=payload.store_id,
        message_type=payload.message_type,
        subject=payload.subject,
        message=payload.message,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return ContactFormOut(
        ok=True,
        message="Mensagem recebida. Entraremos em contacto em breve.",
        reference=f"MSG-{record.id:06d}",
    )
