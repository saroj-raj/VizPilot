from typing import List, Dict
import duckdb
import pandas as pd

from app.services.llm_service import propose_widgets


def infer_hints_from_csv(csv_path: str, sample_rows: int = 200) -> Dict:
    con = duckdb.connect()
    df = con.execute(f"SELECT * FROM read_csv_auto('{csv_path}') LIMIT {sample_rows}").df()
    cols = list(df.columns)
    has_date = any(pd.api.types.is_datetime64_any_dtype(df[c]) or "date" in c.lower() for c in cols)
    measures = [c for c in cols if pd.api.types.is_numeric_dtype(df[c])]
    categories = [c for c in cols if not pd.api.types.is_numeric_dtype(df[c]) and c.lower() not in ["id","uuid"]]
    date_field = None
    for c in cols:
        lc = c.lower()
        if "date" in lc or "time" in lc:
            date_field = c
            break
    return {
        "has_date": has_date,
        "date_field": date_field,
        "measures": measures[:3],
        "categories": categories[:3]
    }


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


def generate_quick_viz(csv_path: str, domain: str, intent: str) -> List[Dict]:
    hints = infer_hints_from_csv(csv_path)
    cols = list(hints.get("measures",[])) + list(hints.get("categories",[]))
    props = propose_widgets(domain=domain, intent=intent, columns=cols, hints=hints)
    widgets = []
    for p in props[:6]:
        widgets.append({
            "title": p.get("title","Widget"),
            "explanation": p.get("explanation",""),
            "vega_spec": vega_from_proposal(p),
            "role": "auto",
        })
    return widgets
