import os, uuid, shutil, json
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import duckdb
import numpy as np
import pandas as pd
from datetime import datetime
from pathlib import Path
from app.services.dashboard_generator import generate_quick_viz
from app.services.file_parsers import parse_file, validate_dataframe

router = APIRouter()

# Create uploads directory using absolute path
ROOT_DIR = Path(__file__).parent.parent.parent.parent  # Go up to project root
UPLOAD_DIR = ROOT_DIR / "app" / "tmp" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Log file in PROJECT ROOT
GROQ_LOG_FILE = ROOT_DIR / "GROQ_DEBUG.log"


def log_upload_info(message: str):
    """Write upload info to Groq debug log file in project root"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(GROQ_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    domain: str = Form(...),
    intent: str = Form(...),
):
    log_upload_info("\n" + "="*80)
    log_upload_info("📤 NEW UPLOAD REQUEST")
    log_upload_info("="*80)
    log_upload_info(f"📁 File: {file.filename}")
    log_upload_info(f"🏢 Domain: {domain}")
    log_upload_info(f"🎯 Intent: {intent}")
    
    print("\n" + "="*80)
    print("📤 UPLOAD ENDPOINT CALLED")
    print("="*80)
    print(f"📁 File: {file.filename}")
    print(f"🏢 Domain: {domain}")
    print(f"🎯 Intent: {intent}")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Get file extension
    file_ext = file.filename.lower().split('.')[-1] if '.' in file.filename else ''
    supported_exts = ['csv', 'tsv', 'txt', 'xlsx', 'xls', 'pdf', 'docx', 'doc']
    
    if file_ext not in supported_exts:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: .{file_ext}. Supported: {', '.join(supported_exts)}"
        )
    
    log_upload_info(f"📎 File type: {file_ext.upper()}")
    print(f"📎 File type: {file_ext.upper()}")

    fpath = str(UPLOAD_DIR / f"{uuid.uuid4()}_{file.filename}")
    with open(fpath, "wb") as out:
        shutil.copyfileobj(file.file, out)
    
    log_upload_info(f"💾 Saved to: {fpath}")
    print(f"💾 Saved to: {fpath}")
    
    # Parse file using appropriate parser
    try:
        log_upload_info(f"\n🔄 Parsing {file_ext.upper()} file...")
        print(f"\n🔄 Parsing {file_ext.upper()} file...")
        
        df_parsed, file_type_detected = parse_file(fpath)
        validate_dataframe(df_parsed, min_rows=1, min_cols=1)
        
        log_upload_info(f"✅ Successfully parsed as {file_type_detected}")
        log_upload_info(f"📊 Data shape: {df_parsed.shape[0]} rows × {df_parsed.shape[1]} columns")
        print(f"✅ Successfully parsed as {file_type_detected}")
        print(f"📊 Data shape: {df_parsed.shape[0]} rows × {df_parsed.shape[1]} columns")
        
        # Save parsed data as temporary CSV for DuckDB
        temp_csv_path = fpath.rsplit('.', 1)[0] + '_parsed.csv'
        df_parsed.to_csv(temp_csv_path, index=False)
        fpath = temp_csv_path  # Use parsed CSV for downstream processing
        
        # Log preview
        preview_df = df_parsed.head(5)
        log_upload_info(f"\n📊 PARSED DATA PREVIEW (first 5 rows):")
        log_upload_info("-"*80)
        log_upload_info(preview_df.to_string())
        log_upload_info("-"*80)
        
    except Exception as e:
        error_msg = str(e)
        log_upload_info(f"❌ Parsing failed: {error_msg}")
        print(f"❌ Parsing failed: {error_msg}")
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {error_msg}")

    # Generate widget proposals
    log_upload_info("\n🤖 Calling generate_quick_viz...")
    print("\n🤖 Calling generate_quick_viz...")
    
    # Try AI generation with fallback to mock widgets
    try:
        widgets, groq_input, groq_response = generate_quick_viz(csv_path=fpath, domain=domain, intent=intent)
        log_upload_info(f"✅ Generated {len(widgets)} widgets")
        print(f"✅ Generated {len(widgets)} widgets")
    except Exception as ai_error:
        log_upload_info(f"⚠️ AI widget generation failed: {ai_error}")
        print(f"⚠️ AI widget generation failed: {ai_error}")
        print("📊 Using fallback mock widgets...")
        
        # Fallback: Create basic widgets based on columns
        widgets = []
        groq_input = {"domain": domain, "intent": intent, "columns": df_parsed.columns.tolist()}
        groq_response = "AI unavailable - using fallback widgets"
        
        numeric_cols = df_parsed.select_dtypes(include=['number']).columns.tolist()
        text_cols = df_parsed.select_dtypes(include=['object']).columns.tolist()
        
        # Create a summary table widget
        widgets.append({
            "type": "table",
            "title": f"{domain} Data Summary",
            "subtitle": f"Analysis for: {intent}",
            "config": {
                "columns": df_parsed.columns.tolist()[:5],  # First 5 columns
                "pageSize": 10
            }
        })
        
        # If we have numeric columns, create a bar chart
        if len(numeric_cols) >= 1:
            widgets.append({
                "type": "bar",
                "title": f"{numeric_cols[0]} Overview",
                "subtitle": f"Distribution of {numeric_cols[0]}",
                "config": {
                    "xField": text_cols[0] if text_cols else numeric_cols[0],
                    "yField": numeric_cols[0],
                    "limit": 10
                }
            })
        
        # If we have 2+ numeric columns, create a line chart
        if len(numeric_cols) >= 2:
            widgets.append({
                "type": "line",
                "title": f"{numeric_cols[0]} vs {numeric_cols[1]}",
                "subtitle": "Trend comparison",
                "config": {
                    "xField": text_cols[0] if text_cols else numeric_cols[0],
                    "yField": numeric_cols[1],
                    "limit": 20
                }
            })
        
        log_upload_info(f"✅ Created {len(widgets)} fallback widgets")
        print(f"✅ Created {len(widgets)} fallback widgets")

    # Return a small preview sample so the client can render Vega-Lite immediately
    preview_rows: List[Dict[str, Any]] = []
    try:
        print("\n📊 Loading preview data with DuckDB...")
        con = duckdb.connect()
        # read_csv_auto also handles TSV/TXT
        df = con.execute(f"SELECT * FROM read_csv_auto('{fpath}') LIMIT 200").fetch_df()
        
        # Convert to JSON-serializable format (handle NaN, Timestamp, etc.)
        df = df.replace({np.nan: None})  # Replace NaN with None
        preview_rows = json.loads(df.to_json(orient="records", date_format="iso"))
        
        print(f"✅ Loaded {len(preview_rows)} preview rows")
        if preview_rows:
            print(f"📋 Columns: {list(preview_rows[0].keys())}")
    except Exception as e:
        # ignore preview failure; widgets can still be shown with empty data
        print(f"⚠️ Preview failed: {e}")
        import traceback
        traceback.print_exc()
        preview_rows = []

    response_data = {
        "dataset_id": os.path.basename(fpath),
        "widgets": widgets,
        "preview": preview_rows,
        "domain": domain,
        "intent": intent,
        "groq_input": groq_input,
        "groq_response": groq_response,
    }
    
    print("\n📦 Response summary:")
    print(f"   - Dataset ID: {response_data['dataset_id']}")
    print(f"   - Widgets: {len(response_data['widgets'])}")
    print(f"   - Preview rows: {len(response_data['preview'])}")
    print(f"   - Groq input: {len(str(groq_input))} chars")
    print(f"   - Groq response: {len(groq_response)} chars")
    print("="*80 + "\n")
    
    return JSONResponse(response_data)
