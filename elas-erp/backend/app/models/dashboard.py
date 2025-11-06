from pydantic import BaseModel
from typing import Any, Dict


class Dashboard(BaseModel):
    id: int
    name: str
    widgets: Dict[str, Any] = {}

