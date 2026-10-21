import logging
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from db.models import ContactMessage, Store

logger = logging.getLogger("kero.contact")


PROVINCES = [
    "Bengo",
    "Benguela",
    "Bié",
    "Cabinda",
    "Cuando",
    "Cuanza Norte",
    "Cuanza Sul",
    "Cubango",
    "Cunene",
    "Huambo",
    "Huíla",
    "Icolo e Bengo",
    "Luanda",
    "Lunda Norte",
    "Lunda Sul",
    "Malanje",
    "Moxico",
    "Moxico Leste",
    "Namibe",
    "Uíge",
    "Zaire",
]

DEPARTMENTS = [
    "Apoio ao cliente",
    "Marketing",
    "Redes sociais",
    "Recursos Humanos",
    "Compras e fornecedores",
    "Parcerias comerciais",
    "Imprensa e comunicação",
    "Outro",
]

MESSAGE_TYPES = [
    "Sugestão",
    "Reclamação",
    "Elogio",
    "Pedido de informação",
    "Parceria comercial",
    "Outro",
]


async def create_contact_message(
    db: AsyncSession,
    *,
    department: Optional[str],
    first_name: str,
    last_name: str,
    email: str,
    phone: str,
    province: str,
    store_id: Optional[int],
    message_type: str,
    subject: str,
    message: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> ContactMessage:
    store_name: Optional[str] = None
    if store_id is not None:
        store = await db.get(Store, store_id)
        if store is None or not store.is_active:
            store_id = None
        else:
            store_name = store.name

    record = ContactMessage(
        department=department,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        province=province,
        store_id=store_id,
        store_name=store_name,
        message_type=message_type,
        subject=subject,
        message=message,
        privacy_accepted=True,
        ip_address=ip_address,
        user_agent=(user_agent or "")[:255] or None,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    logger.info(
        "Nova mensagem id=%d tipo=%s email=%s",
        record.id, record.message_type, record.email,
    )
    return record
