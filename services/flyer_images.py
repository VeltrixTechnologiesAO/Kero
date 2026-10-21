from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO

from PIL import Image, UnidentifiedImageError

from config import get_settings

settings = get_settings()


ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}
PIL_TO_MIME = {"JPEG": "image/jpeg", "PNG": "image/png", "WEBP": "image/webp"}


class InvalidImageError(ValueError):
    pass


@dataclass(frozen=True)
class ProcessedImage:
    data: bytes
    mime: str
    size: int
    checksum: str
    thumbnail_data: bytes
    thumbnail_mime: str


def process_flyer_image(raw: bytes) -> ProcessedImage:
    """
    Valida, normaliza e gera thumbnail a partir de bytes de imagem.
    Levanta InvalidImageError se algo estiver mal.
    """
    if not raw:
        raise InvalidImageError("Imagem vazia.")

    if len(raw) > settings.flyer_max_size_bytes:
        raise InvalidImageError(
            f"Imagem maior que o limite ({settings.flyer_max_size_mb} MB)."
        )

    try:
        img = Image.open(BytesIO(raw))
        img.verify()
        img = Image.open(BytesIO(raw))
    except (UnidentifiedImageError, OSError) as e:
        raise InvalidImageError("Ficheiro não é uma imagem válida.") from e

    fmt = (img.format or "").upper()
    if fmt not in PIL_TO_MIME:
        raise InvalidImageError(f"Formato não suportado: {fmt or 'desconhecido'}.")

    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")

    main_bytes = _encode(img, fmt)
    thumb = _make_thumbnail(img)
    thumb_bytes = _encode(thumb, "JPEG")

    return ProcessedImage(
        data=main_bytes,
        mime=PIL_TO_MIME[fmt],
        size=len(main_bytes),
        checksum=sha256(main_bytes).hexdigest(),
        thumbnail_data=thumb_bytes,
        thumbnail_mime="image/jpeg",
    )


def _encode(img: Image.Image, fmt: str) -> bytes:
    buf = BytesIO()
    if fmt == "JPEG":
        img.save(buf, format="JPEG", quality=85, optimize=True)
    elif fmt == "PNG":
        img.save(buf, format="PNG", optimize=True)
    elif fmt == "WEBP":
        img.save(buf, format="WEBP", quality=85, method=6)
    else:
        img.save(buf, format=fmt)
    return buf.getvalue()


def _make_thumbnail(img: Image.Image) -> Image.Image:
    width = settings.flyer_thumbnail_width
    ratio = width / img.width
    height = max(1, int(img.height * ratio))
    thumb = img.resize((width, height), Image.LANCZOS)
    if thumb.mode != "RGB":
        thumb = thumb.convert("RGB")
    return thumb
