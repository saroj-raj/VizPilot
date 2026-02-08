"""
Authentication API endpoints
Handles signup, login, logout, and user management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.services.auth_service import AuthService
from app.services.invitation_service import InvitationService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# =====================================================
# REQUEST MODELS
# =====================================================

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    business_name: str
    industry: Optional[str] = None
    size: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class UpdatePasswordRequest(BaseModel):
    new_password: str


class InviteUserRequest(BaseModel):
    email: EmailStr
    role: str


class AcceptInviteRequest(BaseModel):
    token: str
    email: EmailStr
    password: str
    full_name: str


# =====================================================
# AUTH DEPENDENCY
# =====================================================

async def get_current_user_from_header(
    authorization: Optional[str] = Header(None)
):
    """Extract and validate JWT token from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        # Expected format: "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme"
            )
        
        # Validate token and get user
        user = await AuthService.get_current_user(token)
        return user
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


# =====================================================
# ENDPOINTS
# =====================================================

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    """
    Sign up a new business owner
    Creates both the business and admin user account
    """
    result = await AuthService.signup_business_owner(
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        business_name=request.business_name,
        industry=request.industry,
        size=request.size
    )
    
    return {
        "message": "Account created successfully",
        "user": {
            "id": result["user"].id,
            "email": result["user"].email
        },
        "session": {
            "access_token": result["session"].access_token,
            "refresh_token": result["session"].refresh_token,
            "expires_at": result["session"].expires_at
        },
        "business": {
            "id": result["business_id"],
            "name": result["business_name"]
        }
    }


@router.post("/login")
async def login(request: LoginRequest):
    """
    Login with email and password
    Returns user info and JWT tokens
    """
    result = await AuthService.login(
        email=request.email,
        password=request.password
    )
    
    return {
        "message": "Login successful",
        "user": {
            "id": result["user"].id,
            "email": result["user"].email
        },
        "session": {
            "access_token": result["session"].access_token,
            "refresh_token": result["session"].refresh_token,
            "expires_at": result["session"].expires_at
        },
        "profile": result["profile"]
    }


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user_from_header)
):
    """Logout current user (invalidate session)"""
    # Note: Supabase handles session invalidation client-side
    # This endpoint is mainly for logging/audit purposes
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user_from_header)
):
    """Get current user profile"""
    return {
        "user": current_user
    }


@router.post("/password-reset")
async def request_password_reset(request: PasswordResetRequest):
    """Send password reset email"""
    result = await AuthService.send_password_reset(request.email)
    return result


@router.post("/password-update")
async def update_password(
    request: UpdatePasswordRequest,
    current_user: dict = Depends(get_current_user_from_header)
):
    """Update user password (requires authentication)"""
    # Note: In production, you'd pass the access token
    result = await AuthService.update_password(
        access_token="",  # Token is validated in dependency
        new_password=request.new_password
    )
    return result


# =====================================================
# TEAM INVITATION ENDPOINTS
# =====================================================

@router.post("/invite")
async def invite_team_member(
    request: InviteUserRequest,
    current_user: dict = Depends(get_current_user_from_header)
):
    """
    Invite a team member (admin/manager only)
    Sends invitation email with unique link
    """
    # Check permissions
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can invite team members"
        )
    
    result = await InvitationService.create_invitation(
        business_id=current_user["business_id"],
        email=request.email,
        role=request.role,
        invited_by_user_id=current_user["id"]
    )
    
    return {
        "message": "Invitation sent successfully",
        "invitation": result
    }


@router.get("/invite/{token}")
async def get_invitation_details(token: str):
    """
    Get invitation details by token
    Used to display invitation info before accepting
    """
    result = await InvitationService.get_invitation(token)
    return result


@router.post("/invite/accept")
async def accept_invitation(request: AcceptInviteRequest):
    """
    Accept an invitation and create user account
    Sets password on first login
    """
    result = await InvitationService.accept_invitation(
        token=request.token,
        email=request.email,
        password=request.password,
        full_name=request.full_name
    )
    
    return {
        "message": "Invitation accepted successfully",
        "user": {
            "id": result["user"].id,
            "email": result["user"].email
        },
        "session": {
            "access_token": result["session"].access_token,
            "refresh_token": result["session"].refresh_token,
            "expires_at": result["session"].expires_at
        },
        "profile": result["profile"],
        "business": result["business"]
    }


@router.get("/invitations")
async def list_invitations(
    current_user: dict = Depends(get_current_user_from_header)
):
    """
    List all invitations for current user's business
    Admin/Manager only
    """
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can view invitations"
        )
    
    invitations = await InvitationService.list_invitations(
        business_id=current_user["business_id"]
    )
    
    return {
        "invitations": invitations
    }


@router.delete("/invitations/{invitation_id}")
async def cancel_invitation(
    invitation_id: str,
    current_user: dict = Depends(get_current_user_from_header)
):
    """Cancel a pending invitation (Admin/Manager only)"""
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins and managers can cancel invitations"
        )
    
    result = await InvitationService.cancel_invitation(
        invitation_id=invitation_id,
        business_id=current_user["business_id"]
    )
    
    return result

