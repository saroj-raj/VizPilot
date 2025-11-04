from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ FIX: import from backend.app...  (package-absolute)
from backend.app.core.config import settings
from backend.app.api.endpoints import upload, upload_simple, chat, business, documents, ai, dashboard, widgets, dashboards
# Auth endpoints - PostgreSQL is now set up!
from backend.app.api.endpoints import auth

app = FastAPI(title=settings.app_name)

# CORS: Use ALLOWED_ORIGINS from environment
allowed_origins = settings.allowed_origins.split(",") if settings.allowed_origins else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "Elas ERP Backend", "version": "2.0"}

@app.get("/version")
def version():
    return {"version": "2.0", "env": settings.app_env}

# Include all routers
app.include_router(auth.router, tags=["authentication"])  # PostgreSQL is now set up!
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(upload_simple.router, prefix="/api", tags=["upload-simple"])  # Simplified upload for testing
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(business.router, prefix="/api", tags=["business"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])
app.include_router(widgets.router, tags=["widgets"])
app.include_router(dashboards.router, tags=["dashboards"])

