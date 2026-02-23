from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.endpoints import upload, chat, business, documents, ai, dashboard, auth

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name, "version": "2.0"}

@app.get("/version")
def version():
    """Return app version and environment info"""
    return {
        "version": "2.0.0",
        "app_name": settings.app_name,
        "environment": settings.app_env
    }

# Include all routers
app.include_router(auth.router, tags=["auth"])  # No prefix - router has /api/auth
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(business.router, prefix="/api", tags=["business"])
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])


