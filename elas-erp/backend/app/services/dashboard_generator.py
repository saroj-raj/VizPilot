from typing import List, Dict, Tuple
import duckdb
import pandas as pd

from app.services.llm_service import propose_widgets


def infer_hints_from_csv(csv_path: str, sample_rows: int = 200) -> Dict:
    print(f"\n🔍 Inferring hints from CSV: {csv_path}")
    con = duckdb.connect()
    df = con.execute(f"SELECT * FROM read_csv_auto('{csv_path}') LIMIT {sample_rows}").df()
    cols = list(df.columns)
    print(f"   Columns found: {cols}")
    
    has_date = any(pd.api.types.is_datetime64_any_dtype(df[c]) or "date" in c.lower() for c in cols)
    measures = [c for c in cols if pd.api.types.is_numeric_dtype(df[c])]
    categories = [c for c in cols if not pd.api.types.is_numeric_dtype(df[c]) and c.lower() not in ["id","uuid"]]
    date_field = None
    for c in cols:
        lc = c.lower()
        if "date" in lc or "time" in lc:
            date_field = c
            break
    
    hints = {
        "has_date": has_date,
        "date_field": date_field,
        "measures": measures[:3],
        "categories": categories[:3]
    }
    
    print(f"   📈 Measures: {hints['measures']}")
    print(f"   🏷️  Categories: {hints['categories']}")
    print(f"   📅 Date field: {hints['date_field']}")
    
    return hints


def vega_from_proposal(proposal: Dict) -> Dict:
    chart = proposal.get("chart","bar")
    x = proposal.get("x")
    y = proposal.get("y")
    group_by = proposal.get("group_by")
    mark = "bar" if chart in ["bar","funnel","treemap"] else "line" if chart=="line" else "area"
    enc = {
        "x": {"field": x, "type": "temporal" if x and "date" in x.lower() else "nominal"} if x else None,
        "y": {"field": y.replace("SUM(","").replace(")","") , "type": "quantitative"} if y else None
    }
    enc = {k:v for k,v in enc.items() if v}
    spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "description": proposal.get("title","Widget"),
        "data": {"name": "preview"},
        "mark": {"type": mark, "point": chart=="line"},
        "encoding": enc
    }
    return spec


def generate_quick_viz(csv_path: str, domain: str, intent: str) -> Tuple[List[Dict], Dict, str]:
    """
    Returns: (widgets, groq_input, groq_response)
    """
    print(f"\n🚀 GENERATE_QUICK_VIZ called")
    print(f"   Domain: {domain}")
    print(f"   Intent: {intent}")
    
    hints = infer_hints_from_csv(csv_path)
    cols = list(hints.get("measures",[])) + list(hints.get("categories",[]))
    
    print(f"\n🤖 Calling Groq AI with:")
    print(f"   Columns: {cols}")
    print(f"   Hints: {hints}")
    
    props, groq_input, groq_response = propose_widgets(domain=domain, intent=intent, columns=cols, hints=hints)
    
    print(f"\n✨ Groq returned {len(props)} proposals:")
    for i, p in enumerate(props[:6], 1):
        print(f"   {i}. {p.get('title')} ({p.get('chart')})")
    
    widgets = []
    for p in props[:6]:
        # Map Groq chart types to frontend widget types
        chart_type = p.get("chart", "bar").lower()
        if chart_type in ["bar", "funnel", "treemap"]:
            widget_type = "bar_chart"
        elif chart_type == "line":
            widget_type = "line_chart"
        elif chart_type in ["pie", "donut"]:
            widget_type = "pie_chart"
        elif chart_type in ["kpi", "metric", "number"]:
            widget_type = "kpi"
        elif chart_type == "table":
            widget_type = "table"
        else:
            widget_type = "bar_chart"  # default fallback
        
        widgets.append({
            "id": f"widget_{len(widgets) + 1}",
            "type": widget_type,
            "title": p.get("title","Widget"),
            "explanation": p.get("explanation",""),
            "vega_spec": vega_from_proposal(p),
            "config": {
                "x_column": p.get("x"),
                "y_column": p.get("y"),
                "description": p.get("explanation","")
            },
            "data": {},  # Will be populated by frontend if needed
            "role": "auto",
        })
    
    print(f"✅ Generated {len(widgets)} widget specs\n")
    return widgets, groq_input, groq_response

