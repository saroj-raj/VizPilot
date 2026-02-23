# STEP 1: Technical Architecture Diagrams

## Current State (Before Step 1)

### Frontend Architecture

```
┌─────────────────────────────────────────────┐
│   frontend/  (Next.js)                      │
├─────────────────────────────────────────────┤
│                                              │
│  ✅ lib/api.ts                              │
│     export API_BASE = process.env... || ... │
│                                              │
│  ⚠️  app/onboarding/business/page.tsx       │
│     const apiBase = process.env... || ...   │
│                                              │
│  ⚠️  app/onboarding/upload/page.tsx         │
│     const apiBase = process.env... || ...   │
│     [REPEATED PATTERN x9]                   │
│                                              │
│  ⚠️  lib/groq.ts                            │
│     API_BASE = process.env... || '...8000/api'  [WRONG /api suffix]
│                                              │
│  ✅ lib/supabase.ts                         │
│     NEXT_PUBLIC_SUPABASE_URL                │
│     NEXT_PUBLIC_SUPABASE_ANON_KEY           │
│                                              │
└─────────────────────────────────────────────┘
        ↓
   PROBLEM: Repeated fallback patterns (Code duplication)
```

### Backend Architecture (Current)

```
┌────────────────────────────────────────────────────┐
│   elas-erp/backend/  (FastAPI)                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  ✅ app/core/config.py                             │
│     ✅ supabase_url                                │
│     ✅ supabase_anon_key                           │
│     ❌ MISSING: frontend_url                       │
│                                                     │
│  🔴 app/main.py                                    │
│     Line 11: allow_origins = ["*"]                 │
│             [HARDCODED WILDCARD - SECURITY RISK]   │
│     Line 16: "service": "VizPilot Backend"         │
│             [HARDCODED STRING]                     │
│                                                     │
│  🔴 app/services/invitation_service.py             │
│     Line 114: invite_url = "http://localhost:4000/..."
│             [HARDCODED - BREAKS IN PRODUCTION]     │
│                                                     │
│  ✅ app/db/supabase_client.py                      │
│     Uses env vars correctly                        │
│                                                     │
│  ❌ app/core/validate_config.py                    │
│     [MISSING - NO VALIDATION AT STARTUP]           │
│                                                     │
└────────────────────────────────────────────────────┘
        ↓
   PROBLEMS: Hardcoded URLs (3), Missing FRONTEND_URL, No validation
```

### Request Flow (Current - Broken in Production)

```
PRODUCTION SCENARIO: User receives email invitation

Email Backend:
  └─ invitation_service.py generates invite_url
     └─ "http://localhost:4000/invite/token123"  ❌ HARDCODED

User clicks link in production:
  ❌ Tries to visit http://localhost:4000 (BROKEN - user's machine doesn't have backend)

CORS issue if frontend at different URL:
  Frontend at: https://vizpilot.vercel.app
  CORS allow_origins: ["*"]  ✅ Works but OVERLY PERMISSIVE
  Should be: [https://vizpilot.vercel.app]  ❌ Not configurable
```

---

## After Step 1 (Solution)

### Frontend Architecture (After Step 1)

```
┌─────────────────────────────────────────────┐
│   frontend/  (Next.js)                      │
├─────────────────────────────────────────────┤
│                                              │
│  ✨ lib/config.ts (NEW)                     │
│     export API_BASE = getApiBase()          │
│     └─ return process.env.NEXT_PUBLIC_API_BASE
│        || 'http://localhost:8000'           │
│                                              │
│  ✅ All pages (9 files)                     │
│     import { API_BASE } from '@/lib/config' │
│     const apiBase = API_BASE;               │
│     [DRY - Uses centralized config]         │
│                                              │
│  ✅ lib/groq.ts (FIXED)                     │
│     const API_BASE = process.env... || ...  │
│                     'http://localhost:8000' │
│                     [/api SUFFIX REMOVED]   │
│                                              │
│  ✅ lib/supabase.ts (UNCHANGED)             │
│     NEXT_PUBLIC_SUPABASE_URL                │
│     NEXT_PUBLIC_SUPABASE_ANON_KEY           │
│                                              │
└─────────────────────────────────────────────┘
        ↓
   BENEFIT: Single source of truth, no duplication, easy to maintain
```

### Backend Architecture (After Step 1)

```
┌────────────────────────────────────────────────────┐
│   elas-erp/backend/  (FastAPI)                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  ✨ app/core/config.py (UPDATED)                   │
│     ✅ supabase_url                                │
│     ✅ supabase_anon_key                           │
│     ✨ frontend_url: str = Field(                  │
│        default="http://localhost:4000",            │
│        alias="FRONTEND_URL"                        │
│     )  [NEW - ENV-DRIVEN]                          │
│                                                     │
│  ✅ app/main.py (FIXED)                            │
│     Line 11: allow_origins = [settings.frontend_url]
│             [ENV-DRIVEN - NO HARDCODING]           │
│     Line 16: "service": settings.app_name          │
│             [DYNAMIC - Uses config value]          │
│                                                     │
│  ✅ app/services/invitation_service.py (FIXED)     │
│     Line 114: invite_url = f"{settings.frontend_url}/..."
│             [ENV-DRIVEN - WORKS IN PRODUCTION]     │
│                                                     │
│  ✅ app/db/supabase_client.py (UNCHANGED)          │
│     Uses env vars correctly                        │
│                                                     │
│  ✨ app/core/validate_config.py (NEW)              │
│     Validates all required env vars at startup     │
│     Prints clear error messages                    │
│     [PREVENTS SILENT FAILURES]                     │
│                                                     │
└────────────────────────────────────────────────────┘
        ↓
   BENEFITS: Env-driven, configurable, validated, secure, clear errors
```

### Request Flow (After Step 1 - Fixed in Production)

```
PRODUCTION SCENARIO: User receives email invitation

Email Backend:
  └─ invitation_service.py generates invite_url
     └─ f"{settings.frontend_url}/invite/token123"
     └─ From .env: FRONTEND_URL=https://vizpilot.vercel.app
     └─ "https://vizpilot.vercel.app/invite/token123"  ✅ CORRECT

User clicks link in production:
  ✅ Visits https://vizpilot.vercel.app/invite/token123 (WORKS)

CORS fixed:
  Frontend at: https://vizpilot.vercel.app
  CORS allow_origins: [settings.frontend_url]
  = [https://vizpilot.vercel.app]  ✅ SECURE + CORRECT
```

---

## Environment Variable Flow

### Before Step 1

```
FRONTEND (.env.local):
  NEXT_PUBLIC_API_BASE=http://localhost:8000
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...

  ↓ (API calls)

BACKEND (hardcoded):
  Invitations: http://localhost:4000  ❌ HARDCODED
  CORS: ["*"]  ❌ HARDCODED
  Health: "VizPilot Backend"  ❌ HARDCODED
```

### After Step 1

```
FRONTEND (.env.local):
  NEXT_PUBLIC_API_BASE=http://localhost:8000  ✅
  NEXT_PUBLIC_SUPABASE_URL=...  ✅
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...  ✅

  ↓ (API calls)

BACKEND (.env):
  FRONTEND_URL=http://localhost:4000  ✨ NEW
  SUPABASE_URL=...  ✅
  SUPABASE_ANON_KEY=...  ✅
  SUPABASE_SERVICE_ROLE_KEY=...  ✅
  GROQ_API_KEY=...  ✅
  APP_NAME=VizPilot Backend  ✅
  APP_ENV=dev  ✅
  
  ↓

BACKEND (uses env vars):
  Invitations: f"{FRONTEND_URL}/invite/..."  ✅ ENV-DRIVEN
  CORS: [FRONTEND_URL]  ✅ ENV-DRIVEN
  Health: f"app_name: {APP_NAME}"  ✅ ENV-DRIVEN
```

---

## File Change Summary (Visual)

### Frontend Files

```
9 PAGES (DUPLICATED PATTERN):
├─ app/onboarding/business/page.tsx
│  ├─ Line 40:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  ├─ Line 68:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  └─ AFTER: import { API_BASE }; const api = API_BASE;
├─ app/onboarding/upload/page.tsx
│  ├─ Line 88:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  ├─ Line 124: const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  └─ AFTER: import { API_BASE }; const api = API_BASE;
├─ app/onboarding/documents/page.tsx
│  ├─ Line 99:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  ├─ Line 148: const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  └─ AFTER: import { API_BASE }; const api = API_BASE;
├─ app/onboarding/review/page.tsx
│  ├─ Line 24:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  └─ AFTER: import { API_BASE }; const api = API_BASE;
├─ app/team/page.tsx
│  ├─ Line 62:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  ├─ Line 93:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  └─ AFTER: import { API_BASE }; const api = API_BASE;
├─ app/settings/page.tsx
│  ├─ Line 70:  const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
│  └─ AFTER: import { API_BASE }; const api = API_BASE;
└─ app/dashboard/[role]/page.tsx
   ├─ Line 155: const api = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
   └─ AFTER: import { API_BASE }; const api = API_BASE;

1 FILE (INCONSISTENCY):
├─ lib/groq.ts
│  ├─ Line 3:   const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'
│  └─ AFTER:    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
               Remove /api suffix

1 NEW FILE:
├─ lib/config.ts (NEW)
│  └─ Centralized export of API_BASE = getApiBase()
```

### Backend Files

```
1 FILE (ADD FIELD):
├─ app/core/config.py
│  └─ Add after line 13: frontend_url: str = Field(default="http://localhost:4000", alias="FRONTEND_URL")

1 FILE (3 FIXES):
├─ app/main.py
│  ├─ Line 11: allow_origins=["*"] → allow_origins=[settings.frontend_url]
│  ├─ Line 16: "service": "VizPilot Backend" → "service": settings.app_name
│  └─ Top: Add validation import and call

1 FILE (1 FIX):
├─ app/services/invitation_service.py
│  └─ Line 114: "invite_url": f"http://localhost:4000/invite/{token}" 
                → "invite_url": f"{settings.frontend_url}/invite/{token}"

1 NEW FILE:
├─ app/core/validate_config.py
│  └─ Function to validate required env vars with clear error messages

2 FILES (CONTENT REPLACE):
├─ backend/.env.example
│  └─ Replace entire content with new documented version
└─ elas-erp/backend/.env.example
   └─ Replace entire content with new documented version
```

---

## Change Difficulty Matrix

```
DIFFICULTY → EASE OF CHANGE

🟢 EASY (5 min each):
  ├─ Remove /api suffix from groq.ts (search/replace)
  ├─ Update health endpoint to use settings.app_name (search/replace)
  ├─ Replace CORS hardcoded to use settings.frontend_url (search/replace)
  └─ Replace 9 hardcoded invitation URLs (1 search/replace)

🟡 MEDIUM (10 min each):
  ├─ Add FRONTEND_URL field to config.py (copy/paste)
  ├─ Create lib/config.ts (new file from template)
  ├─ Create validate_config.py (new file from template)
  └─ Replace .env.example files (copy/paste content)

🟢 EASY (30 min total):
  └─ Update 9 pages to import API_BASE (search/replace + import)

TOTAL: ~75 minutes
Risk: LOW (all changes isolated, reversible)
```

---

## Deployment Mapping

### Local Development (No Changes Needed)

```
Developer Machine:
  frontend/.env.local:
    NEXT_PUBLIC_API_BASE=http://localhost:8000
    NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-key

  elas-erp/backend/.env:
    FRONTEND_URL=http://localhost:4000
    SUPABASE_URL=https://dev-project.supabase.co
    SUPABASE_ANON_KEY=dev-key
    ...

  npm run dev        → http://localhost:4000 ✓
  python main:app    → http://localhost:8000 ✓
```

### Staging/Production (Environment-Specific)

```
Vercel Dashboard (Frontend):
  Settings → Environment Variables:
    NEXT_PUBLIC_API_BASE=https://vizpilot-api.onrender.com
    NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key

Render Dashboard (Backend):
  Settings → Environment:
    FRONTEND_URL=https://vizpilot.vercel.app
    SUPABASE_URL=https://prod-project.supabase.co
    SUPABASE_ANON_KEY=prod-anon-key
    ...

  Deploy ✓ → Auto-uses env vars from dashboard
```

---

## Risk & Rollback

```
RISK LEVEL: 🟢 LOW

Why Low Risk:
✓ Each change isolated (no dependencies)
✓ All fallbacks remain (backward compatible)
✓ No breaking changes to APIs
✓ Env vars optional (have defaults)
✓ Can revert individually

ROLLBACK PROCEDURE (if needed):
1. Restore .env.local, .env files
2. Revert code files to before Step 1
3. Restart both servers
4. No data loss possible
5. No database changes

SAFEGUARDS:
✓ Validation at startup (catches config errors early)
✓ Test in local first (before pushing)
✓ Check frontend build (verify no missing env errors)
✓ Verify URLs in browser Network tab
✓ Monitor logs during deployment
```

---

## Success Metrics

```
After Step 1, Verify:

✅ ENVIRONMENT VARIABLES
   □ FRONTEND_URL set in backend .env
   □ NEXT_PUBLIC_API_BASE set in frontend .env.local
   □ All Supabase credentials present

✅ CODE CHANGES
   □ No hardcoded localhost:4000 in main codebase
   □ No hardcoded localhost:8000 in main codebase
   □ CORS uses settings.frontend_url
   □ Invitations use settings.frontend_url
   □ Health endpoint uses settings.app_name

✅ BUILD & STARTUP
   □ Frontend builds: npm run build (no errors)
   □ Frontend runs: npm run dev (loads at localhost:4000)
   □ Backend validation: python main:app (runs startup validation)
   □ Backend responds: curl http://localhost:8000/health (200 OK)

✅ FUNCTIONALITY
   □ API calls go to correct backend URL
   □ Supabase auth works
   □ Database queries work
   □ Invitations have correct URLs
   □ CORS allows requests from frontend

✅ DOCUMENTATION
   □ .env.example files updated
   □ Setup instructions included
   □ Links to credential sources provided
   □ All env vars documented
```

---

**All diagrams reference exact file paths and line numbers from the analysis.**

**See STEP1_URL_ENV_ANALYSIS.md Part F for detailed code patches.**
