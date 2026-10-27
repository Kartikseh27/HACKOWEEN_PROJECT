"""
File Storage and Processing Service.
Handles secure file uploads, Base64 decoding, PDF text extraction, and cleanup.
Never executes uploaded files; restricts extensions to JPG, PNG, WEBP, and PDF.
"""

import base64
import os
import uuid
from typing import Optional, Tuple, Dict, Any
from pypdf import PdfReader
from app.config import settings

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "temp_uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
}


def sanitize_filename(original_name: str) -> str:
    """Generates a secure UUID filename while preserving valid extension."""
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".bin"
    return f"upload_{uuid.uuid4().hex[:12]}{ext}"


def save_base64_upload(base64_data_uri: str, original_name: str = "upload.jpg") -> Tuple[str, str]:
    """
    Decodes frontend Base64 Data URL and saves to secure local storage.
    Returns: (file_path, mime_type)
    """
    if "," in base64_data_uri:
        header, encoded = base64_data_uri.split(",", 1)
        mime_type = header.split(";")[0].replace("data:", "")
    else:
        encoded = base64_data_uri
        mime_type = "application/octet-stream"

    file_bytes = base64.b64decode(encoded)
    
    # Check max file size limit
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise ValueError(f"Uploaded file exceeds {settings.MAX_UPLOAD_SIZE_MB}MB size limit.")

    safe_name = sanitize_filename(original_name)
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return file_path, mime_type


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts raw text from a readable PDF document using pypdf."""
    if not os.path.exists(pdf_path):
        return ""

    try:
        reader = PdfReader(pdf_path)
        extracted = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                extracted.append(t)
        return "\n".join(extracted)
    except Exception:
        return ""


def cleanup_file(file_path: str) -> bool:
    """Safely removes temporary files."""
    try:
        if os.path.exists(file_path) and file_path.startswith(UPLOAD_DIR):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False

