
from typing import List, Dict, Tuple
import json, re
from datetime import datetime
from pathlib import Path

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

# Log file in PROJECT ROOT
ROOT_DIR = Path(__file__).parent.parent.parent.parent  # Go up to project root
GROQ_LOG_FILE = ROOT_DIR / "GROQ_DEBUG.log"


def log_to_file(message: str):
    """Write message to Groq debug log file in project root"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(GROQ_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")

SYSTEM_PROMPT = """You propose concise, role-aware dashboard widgets.
Input includes: domain, intent, columns, and sample stats.
Output must be a JSON list of widget proposals:
[{ "title": str, "chart": "line|bar|area|pie|funnel|treemap|table",
   "x": "field_name", "y": "field_or_agg", "group_by": "field_or_null",
   "explanation": str }]
Follow only what data supports. Do not invent fields."""


def propose_widgets(domain: str, intent: str, columns: List[str], hints: Dict) -> Tuple[List[Dict], Dict, str]:
    """
    Returns: (widgets, groq_input, groq_response)
    """
    log_to_file("="*80)
    log_to_file("🧠 GROQ AI - propose_widgets called")
    log_to_file("="*80)
    
    user = {
        "domain": domain,
        "intent": intent,
        "columns": columns,
        "hints": hints,
    }
    
    groq_input_data = {
        "system_prompt": SYSTEM_PROMPT,
        "user_data": user
    }
    
    log_to_file("\n📤 INPUT DATA SENT TO GROQ:")
    log_to_file(f"   Domain: {domain}")
    log_to_file(f"   Intent: {intent}")
    log_to_file(f"   Columns: {columns}")
    log_to_file(f"   Hints: {json.dumps(hints, indent=2)}")
    log_to_file(f"\n   Full User Data:\n{json.dumps(user, indent=2)}")
    
    print(f"\n🧠 GROQ AI - propose_widgets called")
    print(f"📤 Sending to Groq:")
    print(f"   System prompt: {SYSTEM_PROMPT[:100]}...")
    print(f"   User data: {user}")
    
    msgs = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"DATA:\n{user}")
    ]
    
    groq_response_text = ""
    
    try:
        print("⏳ Waiting for Groq response...")
        log_to_file("\n⏳ Calling Groq API...")
        
        resp = _llm.invoke(msgs)
        text = getattr(resp, "content", str(resp))
        groq_response_text = text
        
        log_to_file("\n📥 GROQ RAW RESPONSE:")
        log_to_file("-"*80)
        log_to_file(text)
        log_to_file("-"*80)
        
        print(f"📥 Groq raw response:")
        print(f"   {text[:500]}...")
        
        # Extract JSON from markdown fences or plain text
        # Handle cases like:
        # "Here is the JSON:\n```json\n[...]\n```"
        # or just "[...]"
        json_match = re.search(r'```(?:json)?\s*(\[[\s\S]*?\])\s*```', text, re.MULTILINE)
        if json_match:
            text = json_match.group(1)
            log_to_file(f"\n🔍 Extracted JSON from markdown fences")
        else:
            # Try to find JSON array directly
            json_match = re.search(r'(\[[\s\S]*\])', text)
            if json_match:
                text = json_match.group(1)
                log_to_file(f"\n🔍 Extracted JSON array directly")
        
        try:
            out = json.loads(text)
            if isinstance(out, list):
                log_to_file(f"\n✅ Successfully parsed {len(out)} widgets from Groq")
                log_to_file(f"   Widgets: {json.dumps(out, indent=2)}")
                print(f"✅ Successfully parsed {len(out)} widgets from Groq")
                return out, groq_input_data, groq_response_text
            else:
                log_to_file(f"\n⚠️ Groq returned non-list: {type(out)}")
                print(f"⚠️ Groq returned non-list: {type(out)}")
        except Exception as parse_error:
            log_to_file(f"\n❌ JSON parse error: {parse_error}")
            log_to_file(f"   Text: {text[:200]}...")
            print(f"❌ JSON parse error: {parse_error}")
            print(f"   Text: {text[:200]}...")
    
    except Exception as e:
        log_to_file(f"\n❌ Groq API call failed: {e}")
        print(f"❌ Groq API call failed: {e}")
    
    # fallback simple rules
    log_to_file("\n⚠️ Using fallback widget generation")
    print("⚠️ Using fallback widget generation")
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
    
    fallback_widgets = base[:3]
    log_to_file(f"\n🔄 Returning {len(fallback_widgets)} fallback widgets:")
    log_to_file(f"   {json.dumps(fallback_widgets, indent=2)}")
    log_to_file("="*80 + "\n")
    
    print(f"🔄 Returning {len(fallback_widgets)} fallback widgets")
    return fallback_widgets, groq_input_data, groq_response_text or "Fallback mode - no Groq response"

