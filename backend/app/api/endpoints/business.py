from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
import json
import os

router = APIRouter()

# In-memory storage (replace with database in production)
business_data = {}
DATA_FILE = "app/tmp/business_data.json"

class BusinessInfo(BaseModel):
    businessName: str
    industry: str
    size: str
    country: str
    description: Optional[str] = None

class TeamMember(BaseModel):
    id: str
    name: str
    email: str
    role: str

class BusinessSetup(BaseModel):
    businessInfo: BusinessInfo
    teamMembers: Optional[List[TeamMember]] = []
    uploadedFiles: Optional[List[str]] = []
    useHistoricalData: bool = False

# Load existing data
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

# Save data
def save_data(data):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@router.post("/business/setup")
async def save_business_setup(setup: BusinessSetup):
    """Save complete business setup information"""
    try:
        business_id = setup.businessInfo.businessName.lower().replace(' ', '_')
        
        data = load_data()
        data[business_id] = {
            "businessInfo": setup.businessInfo.dict(),
            "teamMembers": [m.dict() for m in (setup.teamMembers or [])],
            "uploadedFiles": setup.uploadedFiles or [],
            "useHistoricalData": setup.useHistoricalData
        }
        save_data(data)
        
        return {
            "success": True,
            "businessId": business_id,
            "message": "Business setup saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/business/{business_id}")
async def get_business_info(business_id: str):
    """Retrieve business information"""
    data = load_data()
    if business_id not in data:
        raise HTTPException(status_code=404, detail="Business not found")
    return data[business_id]

@router.get("/business/me/info")
async def get_my_business_info(user_email: Optional[str] = Header(None, alias="X-User-Email")):
    """Get business info for the authenticated user"""
    try:
        data = load_data()
        
        # If user_email is provided, try to find their business
        if user_email:
            # Search through all businesses to find one associated with this email
            for business_id, business in data.items():
                # Check if this email matches any team member or the owner
                if business.get("businessInfo", {}).get("ownerEmail") == user_email:
                    return business
                
                # Check team members
                for member in business.get("teamMembers", []):
                    if member.get("email") == user_email:
                        return business
        
        # If no email or no match found, return all businesses (for backward compatibility)
        # In production, this should return only the user's business
        if data:
            # Return the first/most recent business
            return list(data.values())[0] if data else None
        
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/business")
async def list_businesses():
    """List all businesses"""
    data = load_data()
    return {
        "businesses": [
            {
                "id": bid,
                "name": bdata["businessInfo"]["businessName"],
                "industry": bdata["businessInfo"]["industry"]
            }
            for bid, bdata in data.items()
        ]
    }

@router.post("/business/{business_id}/team")
async def add_team_member(business_id: str, member: TeamMember):
    """Add a team member to a business"""
    data = load_data()
    if business_id not in data:
        raise HTTPException(status_code=404, detail="Business not found")
    
    data[business_id]["teamMembers"].append(member.dict())
    save_data(data)
    
    return {"success": True, "message": "Team member added"}

@router.delete("/business/{business_id}/team/{member_id}")
async def remove_team_member(business_id: str, member_id: str):
    """Remove a team member"""
    data = load_data()
    if business_id not in data:
        raise HTTPException(status_code=404, detail="Business not found")
    
    data[business_id]["teamMembers"] = [
        m for m in data[business_id]["teamMembers"] 
        if m["id"] != member_id
    ]
    save_data(data)
    
    return {"success": True, "message": "Team member removed"}

