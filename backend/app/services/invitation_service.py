"""
Team invitation service
Handles creating, sending, and accepting team member invitations
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from fastapi import HTTPException, status
from app.db.supabase_client import get_supabase, get_supabase_admin


class InvitationService:
    """Service for managing team invitations"""
    
    # Invitation expiry (7 days)
    INVITATION_EXPIRY_DAYS = 7
    
    @staticmethod
    async def create_invitation(
        business_id: str,
        email: str,
        role: str,
        invited_by_user_id: str
    ) -> Dict[str, Any]:
        """
        Create a new team invitation
        Generates a unique token and sends invite email
        """
        try:
            supabase = get_supabase_admin()
            
            # Validate role
            valid_roles = ['admin', 'manager', 'employee', 'finance']
            if role not in valid_roles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
                )
            
            # Check if user already exists with this email in this business
            existing_user = supabase.table("users").select("*").eq(
                "email", email
            ).eq("business_id", business_id).execute()
            
            if existing_user.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email already exists in your business"
                )
            
            # Check for pending invitation
            existing_invitation = supabase.table("invitations").select("*").eq(
                "email", email
            ).eq("business_id", business_id).eq("status", "pending").execute()
            
            if existing_invitation.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A pending invitation already exists for this email"
                )
            
            # Generate unique token
            token = secrets.token_urlsafe(32)
            
            # Set expiry
            expires_at = datetime.utcnow() + timedelta(days=InvitationService.INVITATION_EXPIRY_DAYS)
            
            # Create invitation
            invitation_data = {
                "business_id": business_id,
                "email": email,
                "role": role,
                "invited_by": invited_by_user_id,
                "token": token,
                "expires_at": expires_at.isoformat(),
                "status": "pending"
            }
            
            response = supabase.table("invitations").insert(invitation_data).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create invitation"
                )
            
            invitation = response.data[0]
            
            # Get business info for email
            business = supabase.table("businesses").select("name").eq(
                "id", business_id
            ).single().execute()
            
            # Get inviter info
            inviter = supabase.table("users").select("full_name, email").eq(
                "id", invited_by_user_id
            ).single().execute()
            
            # TODO: Send invitation email
            # await send_invitation_email(
            #     to_email=email,
            #     business_name=business.data["name"],
            #     inviter_name=inviter.data["full_name"],
            #     role=role,
            #     token=token
            # )
            
            return {
                "id": invitation["id"],
                "email": email,
                "role": role,
                "token": token,
                "expires_at": invitation["expires_at"],
                "invite_url": f"http://localhost:4000/invite/{token}",
                "business_name": business.data["name"] if business.data else "Unknown",
                "inviter_name": inviter.data["full_name"] if inviter.data else "Unknown"
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create invitation: {str(e)}"
            )
    
    @staticmethod
    async def get_invitation(token: str) -> Dict[str, Any]:
        """Get invitation details by token"""
        try:
            supabase = get_supabase()
            
            # Get invitation
            response = supabase.table("invitations").select(
                "*, businesses(name, industry)"
            ).eq("token", token).single().execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invitation not found"
                )
            
            invitation = response.data
            
            # Check status
            if invitation["status"] != "pending":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invitation is {invitation['status']}"
                )
            
            # Check expiry
            expires_at = datetime.fromisoformat(invitation["expires_at"].replace('Z', '+00:00'))
            if expires_at < datetime.utcnow():
                # Update status to expired
                supabase.table("invitations").update({
                    "status": "expired"
                }).eq("token", token).execute()
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invitation has expired"
                )
            
            return {
                "id": invitation["id"],
                "email": invitation["email"],
                "role": invitation["role"],
                "business_id": invitation["business_id"],
                "business_name": invitation["businesses"]["name"],
                "business_industry": invitation["businesses"].get("industry"),
                "expires_at": invitation["expires_at"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve invitation: {str(e)}"
            )
    
    @staticmethod
    async def accept_invitation(
        token: str,
        email: str,
        password: str,
        full_name: str
    ) -> Dict[str, Any]:
        """
        Accept an invitation and create user account
        """
        try:
            supabase = get_supabase_admin()
            
            # Get and validate invitation
            invitation_response = supabase.table("invitations").select("*").eq(
                "token", token
            ).eq("status", "pending").single().execute()
            
            if not invitation_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invalid or expired invitation"
                )
            
            invitation = invitation_response.data
            
            # Verify email matches
            if invitation["email"].lower() != email.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email does not match invitation"
                )
            
            # Check expiry
            expires_at = datetime.fromisoformat(invitation["expires_at"].replace('Z', '+00:00'))
            if expires_at < datetime.utcnow():
                supabase.table("invitations").update({
                    "status": "expired"
                }).eq("token", token).execute()
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invitation has expired"
                )
            
            # Create auth user
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": {
                        "full_name": full_name
                    }
                }
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create user account"
                )
            
            user_id = auth_response.user.id
            
            # Create user profile
            user_data = {
                "id": user_id,
                "business_id": invitation["business_id"],
                "email": email,
                "full_name": full_name,
                "role": invitation["role"],
                "is_active": True,
                "last_login": datetime.utcnow().isoformat()
            }
            
            user_response = supabase.table("users").insert(user_data).execute()
            
            if not user_response.data:
                # Rollback: delete auth user
                supabase.auth.admin.delete_user(user_id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user profile"
                )
            
            # Update invitation status
            supabase.table("invitations").update({
                "status": "accepted",
                "accepted_at": datetime.utcnow().isoformat()
            }).eq("token", token).execute()
            
            # Get business info
            business = supabase.table("businesses").select("*").eq(
                "id", invitation["business_id"]
            ).single().execute()
            
            return {
                "user": auth_response.user,
                "session": auth_response.session,
                "profile": user_response.data[0],
                "business": business.data
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to accept invitation: {str(e)}"
            )
    
    @staticmethod
    async def list_invitations(business_id: str) -> List[Dict[str, Any]]:
        """List all invitations for a business"""
        try:
            supabase = get_supabase()
            
            response = supabase.table("invitations").select(
                "*, users!invitations_invited_by_fkey(full_name, email)"
            ).eq("business_id", business_id).order(
                "created_at", desc=True
            ).execute()
            
            return response.data or []
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to list invitations: {str(e)}"
            )
    
    @staticmethod
    async def cancel_invitation(invitation_id: str, business_id: str) -> Dict[str, str]:
        """Cancel a pending invitation"""
        try:
            supabase = get_supabase()
            
            response = supabase.table("invitations").update({
                "status": "cancelled"
            }).eq("id", invitation_id).eq(
                "business_id", business_id
            ).eq("status", "pending").execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invitation not found or already processed"
                )
            
            return {"message": "Invitation cancelled successfully"}
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to cancel invitation: {str(e)}"
            )
