import os
import io
import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
import PyPDF2
import pandas as pd
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("app/tmp/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/documents/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """
    Upload and process multiple documents (PDF, Excel, CSV)
    Returns extracted data and analysis
    """
    try:
        results = []
        
        for file in files:
            file_path = UPLOAD_DIR / file.filename
            
            # Save file
            content = await file.read()
            with open(file_path, 'wb') as f:
                f.write(content)
            
            # Process based on file type
            file_ext = file.filename.lower().split('.')[-1]
            
            if file_ext == 'pdf':
                extracted_data = process_pdf(content)
            elif file_ext in ['xlsx', 'xls']:
                extracted_data = process_excel(content)
            elif file_ext == 'csv':
                extracted_data = process_csv(content)
            else:
                extracted_data = {"error": "Unsupported file type"}
            
            results.append({
                "filename": file.filename,
                "size": len(content),
                "type": file_ext,
                "data": extracted_data
            })
        
        return {
            "success": True,
            "files": results,
            "message": f"{len(files)} file(s) processed successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")

def process_pdf(content: bytes) -> Dict[str, Any]:
    """Extract text and tables from PDF"""
    try:
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text_content = []
        for page in pdf_reader.pages:
            text_content.append(page.extract_text())
        
        # Simple financial data extraction (look for numbers and keywords)
        full_text = ' '.join(text_content)
        
        # Extract potential financial metrics
        metrics = extract_financial_metrics(full_text)
        
        return {
            "pages": len(pdf_reader.pages),
            "text_length": len(full_text),
            "metrics": metrics,
            "preview": full_text[:500]  # First 500 chars
        }
    except Exception as e:
        return {"error": f"PDF processing failed: {str(e)}"}

def process_excel(content: bytes) -> Dict[str, Any]:
    """Extract data from Excel files"""
    try:
        excel_file = io.BytesIO(content)
        
        # Read all sheets
        xls = pd.ExcelFile(excel_file)
        sheets_data = {}
        
        for sheet_name in xls.sheet_names[:5]:  # Limit to first 5 sheets
            df = pd.read_excel(excel_file, sheet_name=sheet_name)
            
            # Get summary statistics for numeric columns
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            
            sheets_data[sheet_name] = {
                "rows": len(df),
                "columns": list(df.columns),
                "numeric_columns": numeric_cols,
                "summary": df[numeric_cols].describe().to_dict() if numeric_cols else {},
                "preview": df.head(5).to_dict('records')
            }
        
        return {
            "sheets": list(sheets_data.keys()),
            "data": sheets_data
        }
    except Exception as e:
        return {"error": f"Excel processing failed: {str(e)}"}

def process_csv(content: bytes) -> Dict[str, Any]:
    """Extract data from CSV files"""
    try:
        csv_file = io.StringIO(content.decode('utf-8'))
        df = pd.read_csv(csv_file)
        
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        
        return {
            "rows": len(df),
            "columns": list(df.columns),
            "numeric_columns": numeric_cols,
            "summary": df[numeric_cols].describe().to_dict() if numeric_cols else {},
            "preview": df.head(10).to_dict('records')
        }
    except Exception as e:
        return {"error": f"CSV processing failed: {str(e)}"}

def extract_financial_metrics(text: str) -> Dict[str, List[float]]:
    """Extract financial numbers from text"""
    import re
    
    metrics = {
        "revenue": [],
        "expenses": [],
        "profit": [],
        "amounts": []
    }
    
    # Look for currency amounts
    currency_pattern = r'\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
    amounts = re.findall(currency_pattern, text)
    
    # Convert to float
    for amount in amounts[:20]:  # Limit to 20 amounts
        try:
            clean_amount = float(amount.replace(',', ''))
            metrics["amounts"].append(clean_amount)
        except:
            pass
    
    # Look for specific keywords
    if 'revenue' in text.lower():
        metrics["revenue"] = [a for a in metrics["amounts"] if a > 1000][:5]
    if 'expense' in text.lower() or 'cost' in text.lower():
        metrics["expenses"] = [a for a in metrics["amounts"] if a > 100][:5]
    if 'profit' in text.lower() or 'net income' in text.lower():
        metrics["profit"] = [a for a in metrics["amounts"] if a > 0][:5]
    
    return metrics

@router.get("/documents/list")
async def list_documents():
    """List all uploaded documents"""
    try:
        files = []
        for file_path in UPLOAD_DIR.glob('*'):
            if file_path.is_file():
                files.append({
                    "filename": file_path.name,
                    "size": file_path.stat().st_size,
                    "uploaded": file_path.stat().st_mtime
                })
        
        return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    """Delete a specific document"""
    try:
        file_path = UPLOAD_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return {"success": True, "message": f"Deleted {filename}"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

