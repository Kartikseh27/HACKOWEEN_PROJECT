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
        self.model = "gemini-2.0-flash"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": self.api_key,
        }
        # If the key is an OAuth or access token (e.g. starts with AQ. or ya29.)
        if self.api_key.startswith("AQ.") or self.api_key.startswith("ya29."):
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

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
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, headers=self._get_headers(), json=payload)
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

    async def analyze_image(
        self,
        base64_data: str,
        mime_type: str = "image/jpeg",
        prompt: str = "Identify plant symptoms and diseases based on ICAR guidelines."
    ) -> Optional[str]:
        """
        Multimodal visual analysis for uploaded crop leaf or soil images.
        """
        if not self.is_configured:
            return None

        # Clean base64 data header if present
        clean_base64 = base64_data.split(",")[-1] if "," in base64_data else base64_data

        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": clean_base64
                            }
                        },
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                res = await client.post(url, headers=self._get_headers(), json=payload)
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
