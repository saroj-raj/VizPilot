"""
Dashboard API endpoints for dashboard management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

# Commented out until PostgreSQL is set up
# from app.database import get_db
# from app.models import Dashboard, Widget, User
# from app.api.endpoints.auth import get_current_active_user

router = APIRouter(prefix="/api/dashboards", tags=["dashboards"])


# Request/Response models
class DashboardCreate(BaseModel):
    role: str  # CEO, CFO, Manager, Employee
    name: str
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    is_default: bool = False


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    is_default: Optional[bool] = None


class DashboardResponse(BaseModel):
    id: int
    user_id: int
    role: str
    name: str
    description: Optional[str]
    layout: Optional[Dict[str, Any]]
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardWithWidgets(DashboardResponse):
    widgets: List[Dict[str, Any]] = []


# Endpoints (Currently returning mock data until PostgreSQL is set up)

@router.post("/", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def create_dashboard(dashboard: DashboardCreate):
    """
    Create a new dashboard for the current user
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    Currently returns mock data for testing.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # new_dashboard = Dashboard(
    #     user_id=current_user.id,
    #     role=dashboard.role,
    #     name=dashboard.name,
    #     description=dashboard.description,
    #     layout=dashboard.layout,
    #     is_default=dashboard.is_default,
    # )
    # db.add(new_dashboard)
    # db.commit()
    # db.refresh(new_dashboard)
    # return new_dashboard
    
    # Mock response for now
    return {
        "id": 1,
        "user_id": 1,
        "role": dashboard.role,
        "name": dashboard.name,
        "description": dashboard.description,
        "layout": dashboard.layout,
        "is_default": dashboard.is_default,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


@router.get("/", response_model=List[DashboardResponse])
async def get_user_dashboards():
    """
    Get all dashboards for the current user
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    Currently returns empty list.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # dashboards = db.query(Dashboard).filter(Dashboard.user_id == current_user.id).all()
    # return dashboards
    
    return []


@router.get("/role/{role}", response_model=DashboardWithWidgets)
async def get_role_dashboard(role: str):
    """
    Get the default dashboard for a specific role
    If no dashboard exists, returns a default configuration
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # dashboard = db.query(Dashboard).filter(
    #     Dashboard.role == role,
    #     Dashboard.is_default == True
    # ).first()
    
    # if not dashboard:
    #     # Return default dashboard configuration for role
    #     return get_default_dashboard_for_role(role)
    
    # # Get widgets for this dashboard
    # widgets = db.query(Widget).filter(Widget.dashboard_id == dashboard.id).all()
    
    # return {
    #     **dashboard.__dict__,
    #     "widgets": [w.__dict__ for w in widgets]
    # }
    
    # Mock response with default configurations
    default_dashboards = {
        "CEO": {
            "id": 1,
            "user_id": 1,
            "role": "CEO",
            "name": "Executive Dashboard",
            "description": "Complete business overview with all key metrics",
            "layout": None,
            "is_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "widgets": []
        },
        "CFO": {
            "id": 2,
            "user_id": 1,
            "role": "CFO",
            "name": "Financial Dashboard",
            "description": "Financial metrics and analysis",
            "layout": None,
            "is_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "widgets": []
        },
        "Manager": {
            "id": 3,
            "user_id": 1,
            "role": "Manager",
            "name": "Operations Dashboard",
            "description": "Team and operations metrics",
            "layout": None,
            "is_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "widgets": []
        },
        "Employee": {
            "id": 4,
            "user_id": 1,
            "role": "Employee",
            "name": "Personal Dashboard",
            "description": "Personal performance and tasks",
            "layout": None,
            "is_default": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "widgets": []
        }
    }
    
    if role.upper() in default_dashboards:
        return default_dashboards[role.upper()]
    else:
        raise HTTPException(status_code=404, detail=f"No dashboard found for role: {role}")


@router.get("/{dashboard_id}", response_model=DashboardWithWidgets)
async def get_dashboard(dashboard_id: int):
    """
    Get a specific dashboard with its widgets
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    # if not dashboard:
    #     raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # widgets = db.query(Widget).filter(Widget.dashboard_id == dashboard_id).all()
    
    # return {
    #     **dashboard.__dict__,
    #     "widgets": [w.__dict__ for w in widgets]
    # }
    
    raise HTTPException(status_code=501, detail="PostgreSQL not configured yet")


@router.put("/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(dashboard_id: int, dashboard_update: DashboardUpdate):
    """
    Update a dashboard (name, description, layout, is_default)
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    # if not dashboard:
    #     raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # # Update only provided fields
    # update_data = dashboard_update.dict(exclude_unset=True)
    # for field, value in update_data.items():
    #     setattr(dashboard, field, value)
    
    # dashboard.updated_at = datetime.utcnow()
    # db.commit()
    # db.refresh(dashboard)
    # return dashboard
    
    raise HTTPException(status_code=501, detail="PostgreSQL not configured yet")


@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard(dashboard_id: int):
    """
    Delete a dashboard and all its widgets
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    # if not dashboard:
    #     raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # db.delete(dashboard)  # Cascade will delete widgets automatically
    # db.commit()
    # return None
    
    raise HTTPException(status_code=501, detail="PostgreSQL not configured yet")


@router.post("/{dashboard_id}/clone", response_model=DashboardResponse)
async def clone_dashboard(dashboard_id: int, new_name: Optional[str] = None):
    """
    Clone an existing dashboard with all its widgets
    
    **Note:** This endpoint will be fully functional once PostgreSQL is set up.
    """
    # TODO: Uncomment once PostgreSQL is set up
    # original = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    # if not original:
    #     raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # # Create new dashboard
    # new_dashboard = Dashboard(
    #     user_id=current_user.id,
    #     role=original.role,
    #     name=new_name or f"{original.name} (Copy)",
    #     description=original.description,
    #     layout=original.layout,
    #     is_default=False,
    # )
    # db.add(new_dashboard)
    # db.flush()
    
    # # Clone widgets
    # original_widgets = db.query(Widget).filter(Widget.dashboard_id == dashboard_id).all()
    # for widget in original_widgets:
    #     new_widget = Widget(
    #         dashboard_id=new_dashboard.id,
    #         user_id=current_user.id,
    #         title=widget.title,
    #         type=widget.type,
    #         chart_type=widget.chart_type,
    #         data=widget.data,
    #         config=widget.config,
    #         vega_spec=widget.vega_spec,
    #         position_x=widget.position_x,
    #         position_y=widget.position_y,
    #         width=widget.width,
    #         height=widget.height,
    #     )
    #     db.add(new_widget)
    
    # db.commit()
    # db.refresh(new_dashboard)
    # return new_dashboard
    
    raise HTTPException(status_code=501, detail="PostgreSQL not configured yet")
