from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import using relative paths (since we run from backend dir)
from app.core.config import settings
from app.api.endpoints import upload, chat

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"]
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(upload.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
