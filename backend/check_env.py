#!/usr/bin/env python3
"""
Quick environment check for deployment readiness
Run this before deploying to verify all environment variables are set
"""
import os
import sys

def check_env():
    print("🔍 Checking Backend Environment Variables...\n")
    
    required = {
        "DATABASE_URL": "postgresql://...",
        "SUPABASE_URL": "https://...supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJ...",
        "SUPABASE_BUCKET": "vizpilot-uploads",
        "GROQ_API_KEY": "gsk_...",
        "SECRET_KEY": "random-32-char-string",
        "ALLOWED_ORIGINS": "https://your-app.vercel.app,http://localhost:4000",
        "APP_ENV": "production"
    }
    
    missing = []
    invalid = []
    ok = []
    
    for key, example in required.items():
        value = os.getenv(key)
        
        if not value:
            missing.append((key, example))
            print(f"❌ {key:30} NOT SET")
        elif value == example or "your-" in value or value == "production" and key != "APP_ENV":
            invalid.append((key, value, example))
            print(f"⚠️  {key:30} '{value[:30]}...' (looks like example)")
        else:
            ok.append(key)
            print(f"✅ {key:30} SET")
    
    print("\n" + "="*60)
    print(f"✅ OK: {len(ok)}")
    print(f"⚠️  WARNING: {len(invalid)}")
    print(f"❌ MISSING: {len(missing)}")
    print("="*60)
    
    if missing:
        print("\n❌ Missing variables:")
        for key, example in missing:
            print(f"   export {key}=\"{example}\"")
        print("\n💡 Set these in your .env file or Render dashboard")
        return False
    
    if invalid:
        print("\n⚠️  Check these variables (look like examples):")
        for key, value, example in invalid:
            print(f"   {key}: '{value}'")
            print(f"   Expected format: {example}")
        print("\n💡 Update with real values")
        return False
    
    print("\n🎉 All environment variables configured!")
    print("✅ Ready to deploy")
    return True

if __name__ == "__main__":
    try:
        success = check_env()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        sys.exit(1)
