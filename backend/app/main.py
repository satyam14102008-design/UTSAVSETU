from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import db_manager
from backend.app.services.seed_data import seed_demo_data

from backend.app.routers.auth import router as auth_router
from backend.app.routers.events import router as events_router
from backend.app.routers.guests import router as guests_router
from backend.app.routers.invitations import router as invitations_router
from backend.app.routers.rsvp import router as rsvp_router
from backend.app.routers.budget import router as budget_router
from backend.app.routers.attendance import router as attendance_router
from backend.app.routers.whatsapp import router as whatsapp_router
from backend.app.routers.reports import router as reports_router
from backend.app.routers.smart_assist import router as smart_assist_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed demo data on startup so app is immediately usable
    try:
        seed_demo_data()
    except Exception as e:
        print(f"Seed note: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Indian Event, Invitation, Guest & Budget Management Platform",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers under API v1 prefix
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(events_router, prefix=api_prefix)
app.include_router(guests_router, prefix=api_prefix)
app.include_router(invitations_router, prefix=api_prefix)
app.include_router(rsvp_router, prefix=api_prefix)
app.include_router(budget_router, prefix=api_prefix)
app.include_router(attendance_router, prefix=api_prefix)
app.include_router(whatsapp_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)
app.include_router(smart_assist_router, prefix=api_prefix)

@app.get("/health")
def health_check():
    db_status = db_manager.get_status()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "whatsapp_mode": "cloud_api" if settings.WHATSAPP_API_TOKEN else "demo_mode"
    }

@app.get("/")
def root():
    return {
        "platform": "UtsavSetu — AI-Powered Indian Event Management Platform",
        "tagline": "One platform. Every celebration. A customized experience for each event.",
        "api_docs": "/docs",
        "health": "/health",
        "demo_user": "demo@utsavsetu.com / password123"
    }

