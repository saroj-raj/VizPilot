"""
Widget API endpoints for dashboard widget management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# Commented out until PostgreSQL is set up
# from app.database import get_db
# from app.models import Widget, Dashboard, User
# from app.api.endpoints.auth import get_current_active_user

router = APIRouter(prefix="/api/widgets", tags=["widgets"])


# Request/Response models
class WidgetCreate(BaseModel):
    dashboard_id: int
    title: str
    type: str  # chart, table, card, etc.
    chart_type: Optional[str] = None  # area, bar, donut, combo, etc.
    data: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    vega_spec: Optional[Dict[str, Any]] = None
    position_x: int = 0
    position_y: int = 0
    width: int = 4
    height: int = 3


class WidgetUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    chart_type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    vega_spec: Optional[Dict[str, Any]] = None
    position_x: Optional[int] = None
    position_y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None


class WidgetResponse(BaseModel):
    id: int
    dashboard_id: int
    user_id: int
    title: str
    type: str
    chart_type: Optional[str]
    data: Optional[Dict[str, Any]]
    config: Optional[Dict[str, Any]]
    vega_spec: Optional[Dict[str, Any]]
    position_x: int
    position_y: int
    width: int
    height: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Endpoints (Currently returning mock data until PostgreSQL is set up)

@router.post("/", response_model=WidgetResponse, status_code=status.HTTP_201_CREATED)
async def create_widget(widget: WidgetCreate):
    """
    Create a new widget for a dashboard
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    Currently returns mock data for testing.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # new_widget = Widget(
    #     dashboard_id=widget.dashboard_id,
    #     user_id=current_user.id,
    #     title=widget.title,
    #     type=widget.type,
    #     chart_type=widget.chart_type,
    #     data=widget.data,
    #     config=widget.config,
    #     vega_spec=widget.vega_spec,
    #     position_x=widget.position_x,
    #     position_y=widget.position_y,
    #     width=widget.width,
    #     height=widget.height,
    # )
    # db.add(new_widget)
    # db.commit()
    # db.refresh(new_widget)
    # return new_widget
    
    # Mock response for now
    return {
        "id": 1,
        "dashboard_id": widget.dashboard_id,
        "user_id": 1,
        "title": widget.title,
        "type": widget.type,
        "chart_type": widget.chart_type,
        "data": widget.data,
        "config": widget.config,
        "vega_spec": widget.vega_spec,
        "position_x": widget.position_x,
        "position_y": widget.position_y,
        "width": widget.width,
        "height": widget.height,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


@router.get("/dashboard/{dashboard_id}", response_model=List[WidgetResponse])
async def get_dashboard_widgets(dashboard_id: int):
    """
    Get all widgets for a specific dashboard
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    Currently returns empty list.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # widgets = db.query(Widget).filter(Widget.dashboard_id == dashboard_id).all()
    # return widgets
    
    return []


@router.get("/{widget_id}", response_model=WidgetResponse)
async def get_widget(widget_id: int):
    """
    Get a specific widget by ID
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # widget = db.query(Widget).filter(Widget.id == widget_id).first()
    # if not widget:
    #     raise HTTPException(status_code=404, detail="Widget not found")
    # return widget
    
    raise HTTPException(status_code=501, detail="PostgreSQL not configured yet")


@router.put("/{widget_id}", response_model=WidgetResponse)
async def update_widget(widget_id: int, widget_update: WidgetUpdate):
    """
    Update a widget (position, size, data, config)
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # widget = db.query(Widget).filter(Widget.id == widget_id).first()
    # if not widget:
    #     raise HTTPException(status_code=404, detail="Widget not found")
    
    # # Update only provided fields
    # update_data = widget_update.dict(exclude_unset=True)
    # for field, value in update_data.items():
    #     setattr(widget, field, value)
    
    # widget.updated_at = datetime.utcnow()
    # db.commit()
    # db.refresh(widget)
    # return widget
    
    raise HTTPException(status_code=501, detail="PostgreSQL not configured yet")


@router.delete("/{widget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_widget(widget_id: int):
    """
    Delete a widget
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # widget = db.query(Widget).filter(Widget.id == widget_id).first()
    # if not widget:
    #     raise HTTPException(status_code=404, detail="Widget not found")
    
    # db.delete(widget)
    # db.commit()
    # return None
    
    raise HTTPException(status_code=501, detail="PostgreSQL not configured yet")


@router.post("/bulk-update")
async def bulk_update_widgets(updates: List[Dict[str, Any]]):
    """
    Bulk update widget positions and sizes (useful for drag-and-drop layouts)
    
    Expected format:
    [
        {"id": 1, "position_x": 0, "position_y": 0, "width": 6, "height": 4},
        {"id": 2, "position_x": 6, "position_y": 0, "width": 6, "height": 4},
        ...
    ]
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # updated_widgets = []
    # for update in updates:
    #     widget = db.query(Widget).filter(Widget.id == update["id"]).first()
    #     if widget:
    #         widget.position_x = update.get("position_x", widget.position_x)
    #         widget.position_y = update.get("position_y", widget.position_y)
    #         widget.width = update.get("width", widget.width)
    #         widget.height = update.get("height", widget.height)
    #         widget.updated_at = datetime.utcnow()
    #         updated_widgets.append(widget)
    
    # db.commit()
    # return {"updated": len(updated_widgets)}
    
    return {"updated": 0, "message": "PostgreSQL not configured yet"}
