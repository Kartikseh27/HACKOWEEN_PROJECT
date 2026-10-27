"""
Google Gemini AI Client with safe fallback.
Connects to Google Generative Language REST API using httpx.
Supports text reasoning and multimodal vision for leaf and soil inspection.
"""

from typing import Optional, Dict, Any, List
import httpx
from app.config import settings


class GeminiClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY.strip()
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model = "gemini-2.5-flash"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        if not self.is_configured:
            return None

        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
        except Exception:
            return None

        return None


ai_client = GeminiClient()

