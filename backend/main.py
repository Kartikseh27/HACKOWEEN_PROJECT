"""
Main entry point for KISAN CULTURE FastAPI Backend.
Run locally with:
    python -m uvicorn main:app --reload --port 8000
"""

import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure backend root is in Python sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import init_db
from app.api.health import router as health_router
from app.api.crop import router as crop_router
from app.api.weather import router as weather_router
from app.api.soil import router as soil_router
from app.api.mandi import router as mandi_router
from app.api.schemes import router as schemes_router
from app.api.agent import router as agent_router
from app.api.reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Initialize SQLite database tables
    init_db()
    print(f"🌾 {settings.APP_NAME} v{settings.VERSION} online at http://{settings.HOST}:{settings.PORT}")
    print(f"📚 Interactive Swagger API Docs: http://localhost:{settings.PORT}/docs")
    yield
    print(f"🛑 {settings.APP_NAME} shutdown complete.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Agentic Agricultural Intelligence Backend for Indian Farmers",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure permissive CORS for all frontend clients (Vercel, Render, Localhost, Mobile)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for friendly error messages
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "hint": "Please verify request parameters or backend logs."
        }
    )

# Include Routers
app.include_router(health_router)
app.include_router(crop_router)
app.include_router(weather_router)
app.include_router(soil_router)
app.include_router(mandi_router)
app.include_router(schemes_router)
app.include_router(agent_router)
app.include_router(reports_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )

