"""KPI extraction placeholder"""

def extract_kpis(data: dict) -> dict:
    return {"kpis": {k: len(str(v)) for k, v in data.items()}}

