from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
import os, json, uuid

router = APIRouter()


@router.get("/dashboard")
def get_dashboard():
    return {"widgets": []}


# Simple JSON-file persistence for demo
STORE_DIR = "app/tmp/dashboards"
os.makedirs(STORE_DIR, exist_ok=True)


class SaveDashboardRequest(BaseModel):
    name: str
    widgets: List[Dict[str, Any]]
    dataset_id: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None


@router.post("/dashboard/save")
def save_dashboard(req: SaveDashboardRequest):
    try:
        dash_id = str(uuid.uuid4())
        doc = {
            "id": dash_id,
            "name": req.name,
            "widgets": req.widgets,
            "dataset_id": req.dataset_id,
            "meta": req.meta or {},
        }
        path = os.path.join(STORE_DIR, f"{dash_id}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(doc, f, indent=2)
        return {"success": True, "id": dash_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard/{dash_id}")
def get_dashboard_by_id(dash_id: str):
    path = os.path.join(STORE_DIR, f"{dash_id}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Dashboard not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

