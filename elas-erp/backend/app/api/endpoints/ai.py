from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.groq_service import groq_service

router = APIRouter()

class PredictionRequest(BaseModel):
    historical_data: List[Dict[str, Any]]
    months_ahead: int = 6

class AnomalyRequest(BaseModel):
    data: List[Dict[str, Any]]

class RecommendationRequest(BaseModel):
    business_data: Dict[str, Any]
    financial_data: List[Dict[str, Any]]

class DocumentAnalysisRequest(BaseModel):
    document_text: str
    document_type: str

@router.post("/ai/predictions")
async def get_predictions(request: PredictionRequest):
    """
    Get AI-powered financial predictions
    """
    try:
        predictions = groq_service.generate_predictions(
            request.historical_data,
            request.months_ahead
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/anomalies")
async def detect_anomalies(request: AnomalyRequest):
    """
    Detect anomalies in financial data
    """
    try:
        anomalies = groq_service.detect_anomalies(request.data)
        return anomalies
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """
    Get AI-powered business recommendations
    """
    try:
        recommendations = groq_service.generate_recommendations(
            request.business_data,
            request.financial_data
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/analyze-document")
async def analyze_document(request: DocumentAnalysisRequest):
    """
    Analyze document content with AI
    """
    try:
        analysis = groq_service.analyze_document_content(
            request.document_text,
            request.document_type
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/chat")
async def ai_chat(message: str, context: Optional[List[Dict]] = None):
    """
    General AI chat endpoint
    """
    try:
        messages = [
            {
                'role': 'system',
                'content': 'You are Elas AI, an intelligent ERP assistant helping with business analytics and insights.'
            }
        ]
        
        if context:
            messages.extend(context)
        
        messages.append({'role': 'user', 'content': message})
        
        response = groq_service._call_groq(messages, temperature=0.7, max_tokens=512)
        
        return {
            "response": response,
            "timestamp": "2025-10-23T00:00:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

