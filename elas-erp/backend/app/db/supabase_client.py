"""
Supabase client configuration for VizPilot
Handles authentication and database operations
"""
import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")


class SupabaseClient:
    """Singleton Supabase client"""
    
    _client: Optional[Client] = None
    _service_client: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get Supabase client for regular operations"""
        if cls._client is None:
            cls._client = create_client(SUPABASE_URL, SUPABASE_KEY)
        return cls._client
    
    @classmethod
    def get_service_client(cls) -> Client:
        """Get Supabase client with service role (bypasses RLS)"""
        if cls._service_client is None:
            if not SUPABASE_SERVICE_KEY:
                raise ValueError("SUPABASE_SERVICE_ROLE_KEY must be set for admin operations")
            cls._service_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        return cls._service_client


# Convenience functions
def get_supabase() -> Client:
    """Get Supabase client instance"""
    return SupabaseClient.get_client()


def get_supabase_admin() -> Client:
    """Get Supabase client with admin privileges"""
    return SupabaseClient.get_service_client()
