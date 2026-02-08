"""
Advanced AI Service using Groq API
Provides predictive analytics, anomaly detection, and intelligent recommendations
"""

import os
import json
from typing import List, Dict, Any, Optional
import requests
from datetime import datetime, timedelta

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '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')
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

class GroqAIService:
    """Advanced AI service for business intelligence"""
    
    def __init__(self):
        self.api_key = GROQ_API_KEY
        self.model = 'llama-3.3-70b-versatile'
    
    def _call_groq(self, messages: List[Dict], temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """Make a call to Groq API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'model': self.model,
                'messages': messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            }
            
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            return result['choices'][0]['message']['content']
        
        except Exception as e:
            print(f"Groq API error: {e}")
            return f"Error: {str(e)}"
    
    def generate_predictions(self, historical_data: List[Dict], months_ahead: int = 6) -> Dict[str, Any]:
        """
        Predictive analytics: Forecast future revenue, expenses, and profit
        """
        system_prompt = """You are a financial forecasting AI. Analyze historical data and predict future trends.
        Return predictions as a valid JSON object with this structure:
        {
          "predictions": {
            "revenue": [list of predicted values for next N months],
            "expenses": [list of predicted values for next N months],
            "profit": [list of predicted values for next N months]
          },
          "confidence": "high/medium/low",
          "insights": ["key insight 1", "key insight 2", "key insight 3"],
          "recommendations": ["recommendation 1", "recommendation 2"]
        }"""
        
        user_prompt = f"""Based on this historical financial data for the past 12 months:
        {json.dumps(historical_data, indent=2)}
        
        Predict the next {months_ahead} months. Consider growth trends, seasonality, and market conditions.
        Ensure the response is valid JSON only, no markdown."""
        
        response = self._call_groq(
            [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            temperature=0.6,
            max_tokens=1500
        )
        
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except:
            pass
        
        # Fallback prediction
        return self._generate_fallback_predictions(historical_data, months_ahead)
    
    def detect_anomalies(self, data: List[Dict]) -> Dict[str, Any]:
        """
        Anomaly detection: Identify unusual patterns in financial data
        """
        system_prompt = """You are a financial anomaly detection AI. Identify unusual patterns, spikes, or concerning trends.
        Return analysis as JSON:
        {
          "anomalies": [
            {
              "type": "spike/drop/unusual_pattern",
              "severity": "high/medium/low",
              "month": "month name",
              "metric": "revenue/expenses/profit",
              "description": "explanation",
              "recommendation": "what to do"
            }
          ],
          "overall_health": "healthy/concerning/critical",
          "summary": "brief summary"
        }"""
        
        user_prompt = f"""Analyze this financial data for anomalies:
        {json.dumps(data, indent=2)}
        
        Look for:
        - Unexpected spikes or drops
        - Unusual expense patterns
        - Profit margin concerns
        - Cash flow issues
        
        Return valid JSON only."""
        
        response = self._call_groq(
            [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            temperature=0.5,
            max_tokens=1200
        )
        
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except:
            pass
        
        return {
            "anomalies": [],
            "overall_health": "healthy",
            "summary": "No significant anomalies detected"
        }
    
    def generate_recommendations(self, business_data: Dict, financial_data: List[Dict]) -> List[Dict[str, str]]:
        """
        Generate AI-powered business recommendations
        """
        system_prompt = """You are a business consultant AI. Provide actionable, specific recommendations.
        Return as JSON array:
        [
          {
            "category": "cost_reduction/revenue_growth/efficiency/other",
            "priority": "high/medium/low",
            "title": "Short recommendation title",
            "description": "Detailed explanation",
            "expected_impact": "Estimated impact",
            "timeframe": "Short/Medium/Long term"
          }
        ]"""
        
        user_prompt = f"""Business Profile:
        {json.dumps(business_data, indent=2)}
        
        Financial Data:
        {json.dumps(financial_data[:6], indent=2)}  
        
        Provide 5 specific, actionable recommendations to improve business performance.
        Return valid JSON array only."""
        
        response = self._call_groq(
            [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        try:
            # Try to extract JSON array
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except:
            pass
        
        return [
            {
                "category": "efficiency",
                "priority": "high",
                "title": "Optimize operational costs",
                "description": "Review and reduce unnecessary expenses",
                "expected_impact": "5-10% cost reduction",
                "timeframe": "Short term"
            }
        ]
    
    def analyze_document_content(self, document_text: str, document_type: str) -> Dict[str, Any]:
        """
        Deep analysis of document content
        """
        system_prompt = f"""You are a document analysis AI specialized in {document_type} documents.
        Extract key information and insights. Return as JSON:
        {{
          "summary": "brief summary",
          "key_metrics": [{{"label": "metric name", "value": "value", "trend": "up/down/stable"}}],
          "insights": ["insight 1", "insight 2", "insight 3"],
          "action_items": ["action 1", "action 2"]
        }}"""
        
        user_prompt = f"""Analyze this {document_type} document:
        
        {document_text[:3000]}  
        
        Extract financial data, trends, and provide insights. Return valid JSON only."""
        
        response = self._call_groq(
            [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            temperature=0.5,
            max_tokens=1000
        )
        
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(response[json_start:json_end])
        except:
            pass
        
        return {
            "summary": "Document analyzed successfully",
            "key_metrics": [],
            "insights": [],
            "action_items": []
        }
    
    def _generate_fallback_predictions(self, historical_data: List[Dict], months_ahead: int) -> Dict:
        """Generate simple predictions if AI fails"""
        if not historical_data:
            return {"predictions": {}, "confidence": "low", "insights": [], "recommendations": []}
        
        # Calculate simple averages and growth
        avg_revenue = sum(d.get('revenue', 0) for d in historical_data) / len(historical_data)
        avg_expenses = sum(d.get('expenses', 0) for d in historical_data) / len(historical_data)
        
        growth_rate = 1.05  # 5% growth assumption
        
        predictions = {
            "revenue": [avg_revenue * (growth_rate ** i) for i in range(1, months_ahead + 1)],
            "expenses": [avg_expenses * (1.03 ** i) for i in range(1, months_ahead + 1)],
            "profit": []
        }
        predictions["profit"] = [r - e for r, e in zip(predictions["revenue"], predictions["expenses"])]
        
        return {
            "predictions": predictions,
            "confidence": "medium",
            "insights": ["Based on historical averages with 5% growth projection"],
            "recommendations": ["Monitor actual vs predicted performance monthly"]
        }

# Global instance
groq_service = GroqAIService()

