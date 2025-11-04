from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_service import propose_widgets

router = APIRouter()


class ChatReq(BaseModel):
    domain: str
    intent: str
    columns: list[str]
    hints: dict


@router.post("/chat/propose")
def chat_propose(req: ChatReq):
    out = propose_widgets(req.domain, req.intent, req.columns, req.hints)
    return {"proposals": out}
