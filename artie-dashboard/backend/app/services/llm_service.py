
from typing import List, Dict
import json, re

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.core.config import settings


# Initialize Groq-backed chat LLM
_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model=settings.groq_model,
    temperature=0.2,
    max_retries=2,
)

SYSTEM_PROMPT = """You propose concise, role-aware dashboard widgets.
Input includes: domain, intent, columns, and sample stats.
Output must be a JSON list of widget proposals:
[{ "title": str, "chart": "line|bar|area|pie|funnel|treemap|table",
   "x": "field_name", "y": "field_or_agg", "group_by": "field_or_null",
   "explanation": str }]
Follow only what data supports. Do not invent fields."""


def propose_widgets(domain: str, intent: str, columns: List[str], hints: Dict) -> List[Dict]:
    user = {
        "domain": domain,
        "intent": intent,
        "columns": columns,
        "hints": hints,
    }
    msgs = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"DATA:\n{user}")
    ]
    resp = _llm.invoke(msgs)
    text = getattr(resp, "content", str(resp))
    # crude fence removal
    text = re.sub(r"^```json|```$", "", text.strip(), flags=re.M)
    try:
        out = json.loads(text)
        if isinstance(out, list):
            return out
    except Exception:
        pass

    # fallback simple rules
    base = []
    if hints.get("has_date") and hints.get("measures"):
        base.append({
            "title": "Monthly Trend",
            "chart": "line",
            "x": hints.get("date_field", "date"),
            "y": f"SUM({hints['measures'][0]})",
            "group_by": None,
            "explanation": "Trend over time"
        })
    if hints.get("categories") and hints.get("measures"):
        base.append({
            "title": "Top Categories",
            "chart": "bar",
            "x": hints["categories"][0],
            "y": f"SUM({hints['measures'][0]})",
            "group_by": None,
            "explanation": "Top contributors"
        })
    return base[:3]
