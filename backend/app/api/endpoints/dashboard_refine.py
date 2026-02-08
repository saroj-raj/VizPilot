"""
Dashboard refinement endpoint for AI-powered dashboard updates
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Any
import json
import logging
from app.services.llm_service import refine_widgets_with_groq
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


class WidgetSpec(BaseModel):
    id: str
    type: str
    title: str
    data: Any
    config: Optional[dict] = None


class RefineWidgetsRequest(BaseModel):
    dashboard_id: str
    dataset_id: str
    role: str
    user_instruction: str
    constraints: dict
    current_widgets: List[WidgetSpec]


class RefineWidgetsResponse(BaseModel):
    success: bool
    widgets: List[WidgetSpec]
    message: str
    mode: str  # "groq" or "fallback"


@router.post("/refine", response_model=RefineWidgetsResponse)
async def refine_dashboard(request: RefineWidgetsRequest):
    """
    Refine dashboard widgets based on user instruction and constraints.
    
    Uses Groq LLM if API_KEY is available, otherwise returns deterministic fallback.
    
    Args:
        request: Refinement request with user instruction and constraints
        
    Returns:
        Refined widget specifications and metadata
    """
    try:
        logger.info(
            f"Dashboard refinement request: role={request.role}, "
            f"intent={request.constraints.get('intent')}, "
            f"chart_type={request.constraints.get('chartType')}"
        )

        # Validate request
        if not request.user_instruction or not request.user_instruction.strip():
            raise HTTPException(status_code=400, detail="User instruction is required")

        if not request.current_widgets:
            raise HTTPException(status_code=400, detail="Current widgets list is required")

        # Prepare context for LLM
        context = {
            "role": request.role,
            "domain": request.constraints.get("domain", "general"),
            "intent": request.constraints.get("intent", "analyze"),
            "chart_type": request.constraints.get("chartType", "auto"),
            "time_range": request.constraints.get("timeRange", "30d"),
            "user_instruction": request.user_instruction,
            "current_widget_count": len(request.current_widgets),
        }

        # Try to use Groq if API key is configured
        if settings.groq_api_key and settings.groq_mode == "live":
            try:
                logger.info("Using Groq LLM for widget refinement")
                widgets, mode_used = await refine_widgets_with_groq(
                    instruction=request.user_instruction,
                    current_widgets=[w.dict() for w in request.current_widgets],
                    context=context,
                )

                return RefineWidgetsResponse(
                    success=True,
                    widgets=[WidgetSpec(**w) for w in widgets],
                    message="Widgets refined successfully using AI",
                    mode="groq",
                )
            except Exception as e:
                logger.warning(f"Groq refinement failed: {str(e)}, falling back to deterministic")

        # Fallback: Return deterministic refined widgets
        logger.info("Using fallback widget refinement strategy")
        refined_widgets = _generate_fallback_widgets(request, context)

        return RefineWidgetsResponse(
            success=True,
            widgets=refined_widgets,
            message="Widgets refined using deterministic strategy",
            mode="fallback",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refining dashboard: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to refine dashboard widgets")


def _generate_fallback_widgets(request: RefineWidgetsRequest, context: dict) -> List[WidgetSpec]:
    """
    Generate deterministic fallback widgets when Groq is unavailable.
    
    Returns a modified set of widgets based on user constraints.
    """
    refined = []
    
    # Limit widgets based on intent
    intent = context.get("intent", "analyze")
    max_widgets = 3 if intent == "summarize" else 5

    # Filter and modify existing widgets
    for idx, widget in enumerate(request.current_widgets[:max_widgets]):
        # Apply chart type constraint if specified
        chart_type = context.get("chart_type", "auto")
        if chart_type != "auto":
            new_widget = widget.copy(update={"type": chart_type})
        else:
            new_widget = widget

        # Add metadata about the refinement
        if new_widget.config is None:
            new_widget.config = {}
        
        new_widget.config["refined"] = True
        new_widget.config["constraint_role"] = context.get("role")
        new_widget.config["constraint_domain"] = context.get("domain")
        new_widget.config["constraint_intent"] = context.get("intent")
        new_widget.config["constraint_time_range"] = context.get("time_range")

        refined.append(new_widget)

    # If no widgets exist, create a placeholder
    if not refined:
        refined.append(
            WidgetSpec(
                id="placeholder-1",
                type="message",
                title="No Data Available",
                data={"message": f"No widgets match the selected constraints: {context}"},
                config={
                    "refined": True,
                    "is_placeholder": True,
                    "user_instruction": request.user_instruction,
                },
            )
        )

    return refined


async def refine_widgets_with_groq(
    instruction: str,
    current_widgets: List[dict],
    context: dict,
) -> tuple[List[dict], str]:
    """
    Use Groq LLM to refine widgets based on instruction.
    This is imported from llm_service but defined here for clarity.
    """
    from app.services.llm_service import refine_widgets_with_groq as _refine

    return await _refine(instruction, current_widgets, context)
