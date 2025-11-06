"""
Authentication service using Supabase Auth
Handles signup, login, password reset, and session management
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.db.supabase_client import get_supabase, get_supabase_admin


class AuthService:
    """Service for handling authentication operations"""
    
    @staticmethod
    async def signup_business_owner(
        email: str,
        password: str,
        full_name: str,
        business_name: str,
        industry: Optional[str] = None,
        size: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sign up a new business owner (admin)
        Creates both the business and the admin user
        """
        try:
            supabase = get_supabase_admin()
            
            # Step 1: Create auth user in Supabase Auth
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
            
            # Step 2: Create business
            business_data = {
                "name": business_name,
                "industry": industry,
                "size": size,
                "is_active": True
            }
            business_response = supabase.table("businesses").insert(business_data).execute()
            
            if not business_response.data:
                # Rollback: delete auth user if business creation fails
                supabase.auth.admin.delete_user(user_id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create business"
                )
            
            business_id = business_response.data[0]["id"]
            
            # Step 3: Create user profile (links to auth.users)
            user_data = {
                "id": user_id,
                "business_id": business_id,
                "email": email,
                "full_name": full_name,
                "role": "admin",
                "is_active": True,
                "last_login": datetime.utcnow().isoformat()
            }
            user_response = supabase.table("users").insert(user_data).execute()
            
            if not user_response.data:
                # Rollback: delete business and auth user
                supabase.table("businesses").delete().eq("id", business_id).execute()
                supabase.auth.admin.delete_user(user_id)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user profile"
                )
            
            return {
                "user": auth_response.user,
                "session": auth_response.session,
                "business_id": business_id,
                "business_name": business_name
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Signup failed: {str(e)}"
            )
    
    @staticmethod
    async def login(email: str, password: str) -> Dict[str, Any]:
        """Login user and return session"""
        try:
            supabase = get_supabase()
            
            # Authenticate with Supabase
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            user_id = auth_response.user.id
            
            # Get user profile with business info
            user_response = supabase.table("users").select(
                "*, businesses(*)"
            ).eq("id", user_id).single().execute()
            
            if not user_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )
            
            # Update last login
            supabase.table("users").update({
                "last_login": datetime.utcnow().isoformat()
            }).eq("id", user_id).execute()
            
            user_data = user_response.data
            
            return {
                "user": auth_response.user,
                "session": auth_response.session,
                "profile": {
                    "id": user_data["id"],
                    "email": user_data["email"],
                    "full_name": user_data["full_name"],
                    "role": user_data["role"],
                    "business_id": user_data["business_id"],
                    "business_name": user_data["businesses"]["name"],
                    "avatar_url": user_data.get("avatar_url")
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Login failed: {str(e)}"
            )
    
    @staticmethod
    async def logout(access_token: str) -> Dict[str, str]:
        """Logout user (invalidate session)"""
        try:
            supabase = get_supabase()
            supabase.auth.sign_out()
            return {"message": "Logged out successfully"}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Logout failed: {str(e)}"
            )
    
    @staticmethod
    async def get_current_user(access_token: str) -> Dict[str, Any]:
        """Get current user from access token"""
        try:
            supabase = get_supabase()
            
            # Get user from token
            user_response = supabase.auth.get_user(access_token)
            
            if not user_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )
            
            user_id = user_response.user.id
            
            # Get full profile
            profile_response = supabase.table("users").select(
                "*, businesses(*)"
            ).eq("id", user_id).single().execute()
            
            if not profile_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )
            
            user_data = profile_response.data
            
            return {
                "id": user_data["id"],
                "email": user_data["email"],
                "full_name": user_data["full_name"],
                "role": user_data["role"],
                "business_id": user_data["business_id"],
                "business_name": user_data["businesses"]["name"],
                "avatar_url": user_data.get("avatar_url"),
                "is_active": user_data["is_active"]
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    
    @staticmethod
    async def send_password_reset(email: str) -> Dict[str, str]:
        """Send password reset email"""
        try:
            supabase = get_supabase()
            supabase.auth.reset_password_email(email)
            return {"message": "Password reset email sent"}
        except Exception as e:
            # Don't reveal if email exists
            return {"message": "If the email exists, a reset link has been sent"}
    
    @staticmethod
    async def update_password(access_token: str, new_password: str) -> Dict[str, str]:
        """Update user password"""
        try:
            supabase = get_supabase()
            supabase.auth.update_user({
                "password": new_password
            })
            return {"message": "Password updated successfully"}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update password: {str(e)}"
            )
