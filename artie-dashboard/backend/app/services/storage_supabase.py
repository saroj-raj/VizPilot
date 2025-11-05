"""
Supabase Storage client for file uploads
Uses Supabase Storage API for free-tier object storage
"""
import os
from typing import BinaryIO
import httpx
from pathlib import Path

class SupabaseStorage:
    """Simple Supabase Storage client using REST API"""
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL", "")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.bucket = os.getenv("SUPABASE_BUCKET", "elas-uploads")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        
        self.storage_url = f"{self.url}/storage/v1"
        self.headers = {
            "Authorization": f"Bearer {self.key}",
            "apikey": self.key,
        }
    
    async def upload_file(self, file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> str:
        """
        Upload file to Supabase Storage
        
        Args:
            file_bytes: File content as bytes
            key: Storage path (e.g., "datasets/uuid/filename.csv")
            content_type: MIME type
        
        Returns:
            Storage key (path)
        """
        upload_url = f"{self.storage_url}/object/{self.bucket}/{key}"
        
        headers = {
            **self.headers,
            "Content-Type": content_type,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                upload_url,
                content=file_bytes,
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code not in (200, 201):
                raise Exception(f"Upload failed: {response.status_code} - {response.text}")
        
        return key
    
    def signed_url(self, key: str, expiry_seconds: int = 3600) -> str:
        """
        Generate a temporary signed URL for file access
        
        Args:
            key: Storage path
            expiry_seconds: URL validity duration (default 1 hour)
        
        Returns:
            Signed URL
        """
        # For Supabase, we can use public URLs or signed URLs
        # Public URL format: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{key}
        # For signed URLs, we'd need to call the API
        
        # Using public URL (bucket must be public)
        public_url = f"{self.url}/storage/v1/object/public/{self.bucket}/{key}"
        return public_url
    
    async def delete_file(self, key: str) -> bool:
        """
        Delete file from storage
        
        Args:
            key: Storage path
        
        Returns:
            True if successful
        """
        delete_url = f"{self.storage_url}/object/{self.bucket}/{key}"
        
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                delete_url,
                headers=self.headers,
                timeout=10.0
            )
            
            return response.status_code in (200, 204)


# Singleton instance
_storage = None

def get_storage() -> SupabaseStorage:
    """Get or create storage client singleton"""
    global _storage
    if _storage is None:
        _storage = SupabaseStorage()
    return _storage
