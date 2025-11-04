import os, uuid, shutil
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.services.dashboard_generator import generate_quick_viz

router = APIRouter()

UPLOAD_DIR = "app/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    domain: str = Form(...),
    intent: str = Form(...),
):
    if not file.filename.lower().endswith((".csv",".tsv",".txt",".xlsx",".xls")):
        raise HTTPException(status_code=400, detail="Only CSV/TSV/XLSX supported in demo")

    fpath = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(fpath, "wb") as out:
        shutil.copyfileobj(file.file, out)

    widgets = generate_quick_viz(csv_path=fpath, domain=domain, intent=intent)
    return JSONResponse({"dataset_id": os.path.basename(fpath), "widgets": widgets})
