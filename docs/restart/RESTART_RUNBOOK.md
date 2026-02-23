# VizPilot - Senior Engineer Restart Runbook
**Status:** Production deployed, local development blocked  
**Last Updated:** 2026-02-20  
**Auditor:** Code Analysis + Repository Scan

---

## PART A: CURRENT REALITY SNAPSHOT

### What is Implemented and Working ✅

**Backend (FastAPI on Render)**
- ✅ Authentication endpoints: POST /api/auth/signup, /login, /logout, GET /me
- ✅ File upload: POST /api/upload (CSV parsing with DuckDB)
- ✅ Business setup: POST /api/business/setup, GET /api/business/me/info
- ✅ Team invitations: POST /api/auth/invite, GET /api/auth/invite/{token}
- ✅ Health check: GET /health (responds 200)
- ✅ Version endpoint: GET /version
- ✅ CORS middleware configured (allow all origins at `allow_origins=["*"]`)
- ✅ Groq API key configured and library imported
- Deployed at: https://vizpilot-api.onrender.com

**Frontend (Next.js on Vercel)**
- ✅ Authentication pages: /login, /signup
- ✅ Onboarding flow: /onboarding/business, /onboarding/team, /onboarding/upload, /onboarding/documents, /onboarding/review
- ✅ Role-based dashboards: /dashboard/[role] (Admin, Manager, Employee, Finance)
- ✅ Settings page: /settings for user account management
- ✅ User switcher component for testing role views
- ✅ Supabase Auth client initialized in contexts/AuthContext.tsx
- ✅ API client configured to use NEXT_PUBLIC_API_BASE env var
- Deployed at: https://vizpilot.vercel.app

**Database (Supabase)**
- ✅ Schema defined in elas-erp/backend/app/db/schema.sql
- ✅ Tables: businesses, users, invitations, uploaded_files, audit_logs
- ✅ Row Level Security (RLS) policies defined
- ✅ Auth provider configured (Supabase Auth)

**Infrastructure**
- ✅ GitHub Actions CI/CD workflows exist (backend-tests.yml, frontend-e2e.yml)
- ✅ Auto-deploy on push to main branch
- ✅ Husky pre-push hooks configured

---

### What is Partially Implemented ⚠️

**Groq AI Integration (50%)**
- ✅ API key configured (you already provided it)
- ✅ langchain_groq library installed
- ✅ ChatGroq initialized in llm_service.py
- ⚠️ **Initialized at import time** (line 14 of llm_service.py - blocks startup if key invalid)
- ⚠️ Endpoints /api/ai/chat exist but return partial responses
- ⚠️ Chart proposal generation disabled (code exists but commented out)
- **Evidence:** elas-erp/backend/app/services/llm_service.py line 14-18

**Email Invitations (80%)**
- ✅ Invitation token generation works
- ✅ Database storage works
- ✅ Endpoints created: POST /api/auth/invite, GET /api/auth/invite/{token}
- ❌ **Email sending not implemented** (TODO comment at line 99)
- ❌ Hardcoded frontend URL: localhost:4000 in invitation_service.py line 114
- **Evidence:** elas-erp/backend/app/services/invitation_service.py line 99, 114

**File Storage (30%)**
- ✅ Upload endpoint accepts files
- ✅ CSV parsing works with DuckDB
- ✅ File preview generated (first 100 rows)
- ❌ Files stored in temporary directory, not persisted
- ❌ SupabaseStorage class defined but not called by upload endpoint
- **Evidence:** 
  - elas-erp/backend/app/services/storage_supabase.py (defined but unused)
  - elas-erp/backend/app/api/endpoints/upload.py (doesn't call storage service)

**Dashboard Data (40%)**
- ✅ Dashboard pages render at correct routes
- ✅ Role switching works
- ❌ No real data integration
- ❌ Dashboards show placeholder/static content
- **Evidence:** frontend/app/dashboard/[role]/page.tsx contains no data fetching

**E2E Testing (35%)**
- ✅ Test infrastructure scaffolded (pytest, Playwright, GitHub Actions)
- ✅ Basic tests exist (health, version, upload)
- ❌ Test mocking not implemented (despite config fields for GROQ_MODE, AUTH_MODE)
- ❌ No SQLite test database setup
- ❌ No Groq mock service
- **Evidence:** 
  - elas-erp/backend/app/core/config.py has groq_mode, auth_mode fields (line 18-19)
  - backend/tests/test_api.py has only 3 basic tests
  - TODO.md lines 25-232 list 11 unchecked mock tasks

---

### What is Missing ❌

**Password Reset Flow (0%)**
- No endpoint in auth.py
- No frontend pages
- No email template
- **Status:** Completely absent from codebase

**Audit Logging (0%)**
- ✅ Database schema has audit_logs table
- ❌ No middleware to log requests
- ❌ No service to write audit entries
- Not wired into endpoints
- **Status:** Schema only, no implementation

**Real-time Collaboration (0%)**
- No WebSocket setup
- No Supabase Realtime client
- **Status:** Not started

**Mobile Optimization (0%)**
- Tailwind responsive classes available
- No mobile-specific breakpoints in components
- No mobile testing
- **Status:** Not implemented

**Dark Mode (0%)**
- No theme provider
- No dark mode toggle
- **Status:** Not implemented

---

### What is Broken Due to Config/Environment Variables 🔴

**CRITICAL - Blocks Local Development:**

**1. Supabase Credentials Missing**
- **Symptom:** Frontend crashes with "Error: supabaseUrl is required"
- **Root Cause:** placeholder values in .env.local
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
  ```
- **Files:**
  - frontend/.env.local (lines 5-6)
  - frontend/lib/supabase.ts (lines 3-4) - validates at import time
  - Code validates eagerly on every page load
- **Fix Required:** Real Supabase project credentials

**2. Groq API Crashes Backend on Startup if Invalid**
- **Symptom:** Server won't start if API key missing/invalid
- **Root Cause:** ChatGroq initialized at import time (not lazy-loaded)
- **Files:**
  - elas-erp/backend/app/services/llm_service.py line 14-18
  - elas-erp/backend/app/core/config.py line 16-17 (GROQ_API_KEY field)
- **Error:** groq.GroqError: The api_key client option must be set
- **Status:** You provided the key, should work, but risky design

**3. Database Connection Uses SQLite Locally**
- **Symptom:** Data not synced with Supabase in local dev
- **Config:**
  - elas-erp/backend/app/core/config.py line 31
  - `database_url: str = Field(default="sqlite:///./vizpilot.db", ...)`
- **Issue:** Supabase client expects real Supabase URL
- **Fix:** Set SUPABASE_URL and auth keys in .env

**4. Hardcoded Localhost URLs in Backend**
- **Symptom:** Invitation emails (if implemented) would send localhost links
- **Files:**
  - elas-erp/backend/app/services/invitation_service.py line 114
  - `"invite_url": f"http://localhost:4000/invite/{token}"`
- **Status:** Hardcoded, not using env var

---

### What Still References Old Branding "Elas ERP" 📝

**Backend Code:**
- elas-erp/backend/app/core/config.py line 5
  ```python
  app_name: str = Field(default="Elas ERP Backend", ...)
  ```
  Health endpoint returns this in response

- elas-erp/backend/app/main.py (indirectly via settings)
  Health check response: `{"status":"ok","service":"Elas ERP Backend","version":"2.0"}`

**Documentation Files:**
- COMPLETE_PROJECT_STATUS.md (header and throughout)
- SUPABASE_SETUP.md line 4
- README.md lines 100-101, 132, 206, 218-219, 333

**Scripts:**
- start.py line 3, 125
- test_groq.ps1 line 23
- setup_postgres.sql lines 2, 10, 16, 19, 30

**Deployment Configs:**
- README.md references old URLs (elas-erp.vercel.app, elas-erp.onrender.com)

**Git Repo Name:**
- GitHub clone command still says "Elas-ERP"

---

## PART B: RUNBOOK - VERIFICATION IN ORDER

### Step 1: Verify Backend Health (Local + Production)

**1.1 Local Backend Health Check**
```bash
# Terminal 1
cd elas-erp/backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**1.2 Test Health Endpoint (Local)**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{"status":"ok","service":"Elas ERP Backend","version":"2.0"}
```

**1.3 Test Version Endpoint (Local)**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/version" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Response:**
```json
{"version":"2.0.0","app_name":"Elas ERP Backend","environment":"dev"}
```

**1.4 Test Production Health Check**
```powershell
Invoke-WebRequest -Uri "https://vizpilot-api.onrender.com/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected Response:** Same as local (200 status code)

**Done Criteria:**
- [ ] Local health check returns 200
- [ ] Local version check succeeds
- [ ] Production health check succeeds
- [ ] No 500 errors (means Groq and Supabase are optional)

---

### Step 2: Verify Frontend Loads Without Runtime Errors

**2.1 Start Frontend (Local)**
```bash
# Terminal 2
cd frontend
npm run dev
```

**Expected Output:**
```
Local: http://localhost:4000
Ready in 2.5s
```

**2.2 Visit Frontend in Browser**
```
http://localhost:4000
```

**Expected:**
- [ ] Page loads (not 500 error)
- [ ] Browser console shows no FATAL errors
- [ ] Hero/login page displays
- If you see Supabase error: expected (missing real credentials)

**2.3 Verify No Middleware Blocking**
**Expected:**
- [ ] No redirect to login from /
- [ ] Can navigate directly to pages without auth
- [ ] Logo/branding loads

**2.4 Check Browser Network Tab**
- [ ] API calls go to correct backend URL
  - If local: http://localhost:8000
  - If production: Check NEXT_PUBLIC_API_BASE value
- [ ] No CORS errors
- [ ] Supabase requests show 400 (expected with placeholder creds)

**Done Criteria:**
- [ ] Frontend loads at http://localhost:4000
- [ ] No 500 errors from Next.js
- [ ] Can see page content (not blank)
- [ ] Can check console for warnings (Supabase warning is OK)

---

### Step 3: Signup → Login → Logout Flow

**3.1 Navigate to Signup**
```
http://localhost:4000/signup
```

**3.2 Enter Credentials**
- Email: test@example.com
- Password: Test123!
- Business Name: Test Corp

**3.3 Monitor Network Tab**
- [ ] POST request to `/api/auth/signup` goes to backend
- [ ] Response status is 200 or 201
- [ ] Response contains user data or session info

**3.4 If Supabase Auth Fails**
- **Expected if no real Supabase:** "Error: supabaseUrl is required"
- **Workaround:** Provide real Supabase credentials to proceed

**3.5 If Signup Succeeds**
- [ ] Redirected to /onboarding/business or /dashboard
- [ ] User email displays somewhere
- [ ] localStorage contains session data

**3.6 Test Logout**
- [ ] Click logout in user menu
- [ ] Check that session is cleared
- [ ] Can't access protected pages anymore

**Done Criteria:**
- [ ] Can reach signup/login pages
- [ ] Form submits (even if backend rejects - that's OK)
- [ ] Network requests hit correct endpoints
- [ ] No client-side crashes

---

### Step 4: Business Onboarding Flow

**4.1 Navigate Onboarding Steps**
```
1. /onboarding/business → Enter business info
2. /onboarding/team → Add team members (optional)
3. /onboarding/upload → Upload CSV file
4. /onboarding/documents → Review uploads
5. /onboarding/review → Final review
```

**4.2 Each Step Should:**
- [ ] Load page without errors
- [ ] Display correct form fields
- [ ] Accept user input (type, click, drag)
- [ ] Show next/previous buttons

**4.3 Monitor Network Requests**
- Business step: POST to /api/business/setup
- Upload step: POST to /api/upload (multipart form data)
- Should see responses in Network tab

**4.4 Test Data Persistence**
- Enter business name: "My Test Company"
- Navigate to next step
- Go back to previous step
- [ ] Data still shows (from localStorage)

**Done Criteria:**
- [ ] Can navigate all steps without 500 errors
- [ ] Form data persists across navigation
- [ ] Network requests hit correct endpoints
- [ ] File upload accepted (even if not persisted)

---

### Step 5: File Upload End-to-End Preview and Persistence

**5.1 Prepare Test CSV**
```
Create file: test-data.csv
Content:
Name,Amount,Date
Sale1,1000,2024-01-01
Sale2,1500,2024-01-02
Sale3,2000,2024-01-03
```

**5.2 Upload via Frontend**
```
1. Go to /onboarding/upload
2. Click "Choose File" or drag-drop
3. Select test-data.csv
4. Click "Upload"
```

**5.3 Monitor Upload**
- [ ] Network tab shows POST to /api/upload
- [ ] Request body has multipart form-data
- [ ] Backend returns 200 status
- [ ] Response includes:
  - dataset_id
  - profile (with columns, row count, sample data)
  - preview (first 100 rows)

**5.4 Verify Preview Rendering**
- [ ] CSV preview shows in frontend
- [ ] Table displays headers and rows
- [ ] Statistics shown (column types, nulls, etc.)

**5.5 Test Persistence (Later)**
- [ ] Restart backend
- [ ] Try to fetch uploaded file metadata
- [ ] **Expected (current state):** File lost (stored in /tmp)
- [FUTURE] File should exist in Supabase Storage

**Done Criteria:**
- [ ] File uploads without 500 error
- [ ] Backend returns file metadata
- [ ] Preview renders in UI
- [ ] Can see statistics about data

---

### Step 6: Role Dashboards Render and Data Isolation Works

**6.1 Navigate to Admin Dashboard**
```
http://localhost:4000/dashboard/admin
```

**Expected:**
- [ ] Page loads (even if no data)
- [ ] Dashboard header shows "Admin Dashboard"
- [ ] Sidebar shows admin-specific options
- [ ] Widgets/cards display (even if hardcoded data)

**6.2 Check User Switcher (if available)**
- [ ] Click user menu → "View as Role"
- [ ] Can switch between: Admin, Manager, Employee, Finance
- [ ] Dashboard content changes per role

**6.3 Monitor Network Requests**
- [ ] Should see GET requests to /api/dashboard/* endpoints
- [ ] (Not implemented yet, so 404 is OK for now)

**6.4 Verify No Data Leakage**
- **Current state:** Dashboards are empty/hardcoded
- [FUTURE] Verify data isolation:
  - Admin sees all business data
  - Manager sees only team data
  - Employee sees only own data
  - Finance sees only financial metrics

**6.5 Test Role Navigation**
- [ ] /dashboard/admin works
- [ ] /dashboard/manager works
- [ ] /dashboard/employee works
- [ ] /dashboard/finance works
- [ ] Any invalid role returns 404 or error

**Done Criteria:**
- [ ] All dashboard routes load without 500 error
- [ ] Correct role content displays
- [ ] User switcher works
- [ ] No JavaScript errors in console

---

### Step 7: AI (Groq) Endpoints Respond and Degrade Gracefully

**7.1 Test Chat Endpoint (Manual)**
```powershell
# Have backend running on localhost:8000
$body = @{
    message = "What is our revenue?"
    context = @{ business_id = "test"; role = "admin" }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/ai/chat" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**7.2 Expected Responses (Modes)**
- **GROQ_MODE=live (current):**
  - ✅ Returns AI-generated response from Groq
  - ⚠️ May fail if API key invalid/rate limited
  
- **GROQ_MODE=mock (not implemented):**
  - Should return deterministic mock response

**7.3 Error Handling Test**
- Temporarily set: GROQ_API_KEY=invalid_key
- Restart backend
- **Expected:** Should still start (no TypeError on import) [CURRENTLY FAILS]
- **Actual:** Server crashes with groq.GroqError

**7.4 Test Widget Proposal Endpoint**
```powershell
$body = @{
    dataset_id = "test-123"
    domain = "sales"
    intent = "trends"
    role = "finance"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/widgets/propose" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**7.5 Expected:**
- [ ] Endpoint responds (returns something)
- [ ] Response includes widget specs
- [ ] No 500 error (even if disabled)
- **Current state:** Endpoint exists but may return minimal/hardcoded data

**Done Criteria:**
- [ ] /api/ai/chat endpoint accessible
- [ ] /api/widgets/propose endpoint accessible
- [ ] Both return JSON responses (format may vary)
- [ ] No unhandled exceptions

---

### Step 8: Invitation Flow End-to-End Including Acceptance

**8.1 Create Invitation (Authenticated User Required)**
```powershell
# Assuming you're logged in and have business_id
$body = @{
    email = "newteammember@company.com"
    role = "manager"
    business_id = "YOUR_BUSINESS_ID"  # Get from /api/auth/me
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/auth/invite" `
  -Method POST `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
  } `
  -Body $body
```

**8.2 Expected Response**
```json
{
  "token": "unique_token_here",
  "email": "newteammember@company.com",
  "role": "manager",
  "status": "pending",
  "invite_url": "http://localhost:4000/invite/unique_token_here"
}
```

**8.3 Get Invitation Details**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/auth/invite/unique_token_here" `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected:**
- [ ] Returns invitation details
- [ ] Shows role and email
- [ ] Status is "pending"
- [ ] No error if token valid

**8.4 Check Email (If Implemented)**
- **Current state:** Email not sent (TODO at line 99)
- **Expected (when fixed):** Email arrives with invite link

**8.5 Accept Invitation (Frontend)**
- [ ] Navigate to invite link: http://localhost:4000/invite/{token}
- [ ] Page should display invitation and prompt to accept
- [ ] **Current state:** Page may not exist yet

**8.6 Accept Invitation (API)**
```powershell
$body = @{
    token = "unique_token_here"
    password = "NewPassword123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/auth/invite/accept" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Expected:**
- [ ] Returns success with user object
- [ ] Invitation status changes to "accepted"
- [ ] New user account created
- [ ] Can login with new email/password

**8.7 Verify New User Can Login**
- [ ] Login with invited email
- [ ] Can access business dashboard
- [ ] Correct role is assigned

**Done Criteria:**
- [ ] Can create invitations via API (returns token)
- [ ] Can fetch invitation details
- [ ] Can accept invitation (API works)
- [ ] Email sending not required for pass (low priority)
- [ ] New user gets correct role

---

## PART C: BROKEN LINKS AND HOSTING INTEGRATION DIAGNOSIS

### Finding 1: Frontend API Base URLs

**Locations:**
- `frontend/lib/api.ts` line 1
  ```typescript
  export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  ```
- `frontend/lib/groq.ts` line 3
  ```typescript
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';
  ```
  **Issue:** /api suffix inconsistency

**Environment Variable:**
- `NEXT_PUBLIC_API_BASE` - must be set in Vercel dashboard and .env.local

**Required Values:**
- **Local:** http://localhost:8000
- **Production:** https://vizpilot-api.onrender.com

**Status:**
- ✅ Works if env var set
- ❌ Defaults only work locally
- ⚠️ /api suffix mismatch between two files

**All Files Using NEXT_PUBLIC_API_BASE:**
- frontend/contexts/AuthContext.tsx (line 56)
- frontend/app/team/page.tsx (lines 62, 93)
- frontend/app/settings/page.tsx (line 70)
- frontend/app/onboarding/upload/page.tsx (lines 88, 124)
- frontend/app/onboarding/documents/page.tsx (lines 99, 148)
- frontend/app/onboarding/review/page.tsx (line 24)
- frontend/app/onboarding/business/page.tsx (lines 40, 68)

---

### Finding 2: Backend CORS and Frontend URL Configuration

**Location:** elas-erp/backend/app/main.py lines 9-13
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ ALLOWS ALL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

**Issue:**
- `allow_origins=["*"]` allows ANY origin (overly permissive)
- `allow_credentials=True` with `allow_origins=["*"]` violates CORS spec
- Should specify exact Vercel URL

**Required Values:**
- **Local:** http://localhost:4000
- **Production:** https://vizpilot.vercel.app

**How to Fix:**
```python
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:4000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

**Related Config Files:**
- elas-erp/backend/check_env.py line 19
  ```python
  "ALLOWED_ORIGINS": "https://your-app.vercel.app,http://localhost:4000",
  ```

**Status:**
- ✅ Currently works (allows all)
- ⚠️ Production security risk
- ❌ No env var controlling it

---

### Finding 3: Supabase Auth Redirect URLs

**Files:**
- frontend/lib/supabase.ts (lines 3-4)
  ```typescript
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ```

**Environment Variables Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Configuration Location:**
- **Local:** frontend/.env.local (currently has placeholders)
- **Production:** Vercel dashboard → Project Settings → Environment Variables

**Supabase Console Configuration:**
- Login to https://supabase.com/dashboard
- Project Settings → Auth → URL Configuration
- Set Site URL: https://vizpilot.vercel.app
- Set Redirect URLs:
  - http://localhost:4000/auth/callback (local)
  - https://vizpilot.vercel.app/auth/callback (production)

**Status:**
- ❌ No real config (placeholder values)
- ❌ callback route may not exist
- ✅ frontend/app/auth/callback/route.ts exists

---

### Finding 4: Vercel Rewrites and Redirects

**Files:**
- next.config.mjs (if exists)
- vercel.json (if exists)

**Check:**
```bash
ls -la frontend/next.config.*
ls -la frontend/vercel.json
```

**Expected:**
- next.config.js should NOT rewrite /api/* to localhost:8000
- /api/* should go through NEXT_PUBLIC_API_BASE env var
- Call backend via fetch(), not Next.js API routes

**Status:**
- Not found in repo (likely using defaults)
- ✅ Should be fine (frontend makes direct fetch calls)

---

### Finding 5: Render Service URL Configuration

**Backend Service:**
- **URL:** https://vizpilot-api.onrender.com
- **Health Check:** https://vizpilot-api.onrender.com/health

**Configuration in Code:**
- elas-erp/backend/app/core/config.py (no hardcoded URL, good)
- elas-erp/backend/app/services/invitation_service.py line 114
  ```python
  "invite_url": f"http://localhost:4000/invite/{token}",
  ```
  **Issue:** Hardcoded localhost, should use env var

**Environment Variables Needed:**
- `FRONTEND_URL` or `APP_URL` (currently missing)

**Status:**
- ✅ Backend itself is flexible
- ❌ Invitation service hardcodes localhost
- ✅ Can override with ALLOWED_ORIGINS env var

---

## PART D: PRIORITY BACKLOG

### P0 (Critical - Blocks Development)

#### P0.1: Configure Real Supabase Credentials
**Why It Matters:**
- Frontend won't load without this
- Can't test auth flow
- Blocks all development

**Where:**
- frontend/.env.local (lines 5-6)
- elas-erp/backend/.env (needs creation from template)

**Concrete Done Criteria:**
- [ ] Have Supabase account and project
- [ ] frontend/.env.local has real NEXT_PUBLIC_SUPABASE_URL
- [ ] frontend/.env.local has real NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] elas-erp/backend/.env has real SUPABASE_URL
- [ ] elas-erp/backend/.env has real SUPABASE_SERVICE_ROLE_KEY
- [ ] Frontend loads without "supabaseUrl is required" error
- [ ] Can attempt signup (may fail if DB not configured)

**Time Estimate:** 30 minutes (includes account creation)

---

#### P0.2: Fix Groq API Initialization (Non-Blocking but Risky)
**Why It Matters:**
- Backend crashes if API key invalid
- Makes deployment/testing fragile
- Should lazy-load

**Where:**
- elas-erp/backend/app/services/llm_service.py lines 14-18

**Current Code:**
```python
_llm = ChatGroq(
    api_key=settings.groq_api_key,
    model=settings.groq_model,
    temperature=0.2,
    max_retries=2,
)
```

**Fix:**
```python
# Module-level initialization deferred
_llm = None

def get_llm() -> ChatGroq:
    global _llm
    if _llm is None:
        if not settings.groq_api_key:
            return None  # Return None for /api/ai endpoints to handle
        try:
            _llm = ChatGroq(
                api_key=settings.groq_api_key,
                model=settings.groq_model,
                temperature=0.2,
                max_retries=2,
            )
        except Exception as e:
            logger.error(f"Groq init failed: {e}")
            return None
    return _llm
```

**Update endpoints:**
- elas-erp/backend/app/api/endpoints/ai.py
- Use `get_llm()` instead of global `_llm`

**Done Criteria:**
- [ ] Backend starts even if GROQ_API_KEY invalid
- [ ] /api/ai/chat returns error response (not 500)
- [ ] /api/ai/chat still works with valid key

**Time Estimate:** 45 minutes

---

### P1 (High Priority - Core Features)

#### P1.1: Wire Up File Upload to Supabase Storage
**Why It Matters:**
- Uploaded files currently lost on server restart
- No persistence = worthless feature

**Where:**
- elas-erp/backend/app/api/endpoints/upload.py
- elas-erp/backend/app/services/storage_supabase.py (currently unused)

**Current Issue:**
```python
# upload.py saves to tmp only
save_path = f"/tmp/{filename}"
```

**Fix:**
```python
# Add after CSV parsing:
storage = get_storage()  # from storage_supabase.py
file_url = await storage.upload_file(
    file_bytes=file_content,
    key=f"uploads/{business_id}/{dataset_id}/{filename}",
    content_type="text/csv"
)
# Return file_url to frontend
```

**Done Criteria:**
- [ ] Files uploaded to Supabase Storage
- [ ] GET endpoint to list files works
- [ ] Files persist across server restarts
- [ ] File URLs work in frontend

**Time Estimate:** 2 hours

---

#### P1.2: Implement Email Sending for Invitations
**Why It Matters:**
- Invitations are unusable without email
- Can't onboard team members

**Where:**
- elas-erp/backend/app/services/invitation_service.py line 99

**Options:**
1. Supabase Email (built-in, free tier limited)
2. SendGrid (reliable, free tier 100/day)
3. Mailgun (reliable, $20/month)

**Fix (using SendGrid example):**
```python
import sendgrid
from sendgrid.helpers.mail import Mail

# At line 99, replace TODO with:
sg = sendgrid.SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
message = Mail(
    from_email='noreply@vizpilot.com',
    to_emails=email,
    subject='You are invited to VizPilot',
    html_content=f'<a href="{frontend_url}/invite/{token}">Accept Invite</a>'
)
response = sg.send(message)
```

**Also Fix:**
- Line 114: hardcoded localhost URL
- Use env var: `FRONTEND_URL` or `APP_URL`

**Done Criteria:**
- [ ] Team member receives email
- [ ] Email contains valid invitation link
- [ ] Link matches invite token
- [ ] Can accept via link

**Time Estimate:** 1.5 hours

---

#### P1.3: Implement Real Dashboard Data Integration
**Why It Matters:**
- Dashboards are empty/useless now
- Can't validate role-based isolation

**Where:**
- frontend/app/dashboard/[role]/page.tsx
- elas-erp/backend/app/api/endpoints/dashboard.py

**Backend Endpoints Needed:**
```python
@router.get("/dashboard/admin")
async def get_admin_dashboard(business_id: str) -> dict:
    # Query real data from Supabase
    # Return stats, charts, metrics
    
@router.get("/dashboard/manager")
async def get_manager_dashboard(business_id: str, user_id: str) -> dict:
    # Return team-scoped data
    
@router.get("/dashboard/employee")
async def get_employee_dashboard(user_id: str) -> dict:
    # Return user's own data
    
@router.get("/dashboard/finance")
async def get_finance_dashboard(business_id: str) -> dict:
    # Return financial metrics only
```

**Frontend:**
```typescript
useEffect(() => {
  fetch(`${apiBase}/api/dashboard/${role}?business_id=${businessId}`)
    .then(r => r.json())
    .then(data => setDashboardData(data))
}, [role])
```

**Done Criteria:**
- [ ] Each role sees different data
- [ ] Admin sees all business data
- [ ] Finance sees only financial tables
- [ ] No data leakage between businesses
- [ ] Performance acceptable (< 2s load)

**Time Estimate:** 3 hours

---

#### P1.4: Implement Test Mocking (Per TODO.md)
**Why It Matters:**
- Can't run CI/CD tests without real services
- Blocks automated testing

**Where:**
- elas-erp/backend/app/services/ (new mock files)
- elas-erp/backend/app/core/config.py (already has fields)

**Subtasks:**
1. Mock Groq service (returns dummy Vega-Lite specs)
2. Mock Auth service (returns fake JWT tokens)
3. SQLite test database (separate from dev)
4. Mock Supabase Storage (temp files)

**Done Criteria:**
- [ ] Run tests with APP_ENV=test
- [ ] All tests pass (green CI)
- [ ] Backend starts without Groq/Auth/DB
- [ ] 80%+ test coverage target

**Time Estimate:** 6 hours

**Reference:** TODO.md lines 25-232 lists detailed tasks

---

### P1.5: Update All Branding from "Elas ERP" to "VizPilot"
**Why It Matters:**
- Confusing for users
- API responses show old name

**Where (Code):**
- elas-erp/backend/app/core/config.py line 5
  ```python
  app_name: str = Field(default="Elas ERP Backend", ...)
  # Change to: "VizPilot Backend"
  ```

**Where (Docs & Scripts):**
- COMPLETE_PROJECT_STATUS.md (header)
- SUPABASE_SETUP.md line 4
- README.md (multiple lines)
- start.py line 125
- test_groq.ps1 line 23
- setup_postgres.sql (lines 2, 10, 16, 19, 30) - probably not needed

**Where (Deployment):**
- README.md references old URLs
- GitHub repo URL still says "Elas-ERP"

**Done Criteria:**
- [ ] `grep -r "Elas ERP" --include="*.py"` returns only historic references
- [ ] Health endpoint returns "VizPilot Backend"
- [ ] Documentation consistent
- [ ] No user-facing "Elas" text

**Time Estimate:** 1 hour

---

### P2 (Medium Priority - Important but Non-Blocking)

#### P2.1: Implement Password Reset Flow
**Why It Matters:**
- Users can't recover locked accounts
- Support overhead

**Where:**
- New: frontend/app/forgot-password/page.tsx
- New: frontend/app/reset-password/page.tsx
- New: elas-erp/backend/app/api/endpoints/auth.py (POST /forgot, POST /reset)

**Done Criteria:**
- [ ] User can request password reset
- [ ] Email sent with reset link
- [ ] Reset link valid for 1 hour
- [ ] Can set new password via link
- [ ] Old password no longer works

**Time Estimate:** 2 hours

---

#### P2.2: Implement Audit Logging
**Why It Matters:**
- Compliance/audit requirements
- Track data changes

**Where:**
- elas-erp/backend/app/middleware/ (new)
- elas-erp/backend/app/services/audit_service.py (new)

**What to Log:**
- User signup/login/logout
- File uploads
- Business data changes
- Invitation acceptance

**Done Criteria:**
- [ ] audit_logs table populated
- [ ] Can query logs via API
- [ ] Includes user_id, action, timestamp, details

**Time Estimate:** 3 hours

---

#### P2.3: Fix CORS Configuration to Be Secure
**Why It Matters:**
- Current `allow_origins=["*"]` is overly permissive
- Production security risk

**Where:**
- elas-erp/backend/app/main.py lines 9-13

**Fix:**
- Read ALLOWED_ORIGINS from env var
- Default to localhost for dev
- Production requires Vercel URL

**Done Criteria:**
- [ ] CORS respects specific origins
- [ ] Production only allows vizpilot.vercel.app
- [ ] Local dev allows localhost:4000
- [ ] No hardcoded values

**Time Estimate:** 30 minutes

---

#### P2.4: Fix Hardcoded Frontend URL in Invitations
**Why It Matters:**
- Invitation links point to localhost on production
- Emails would be broken

**Where:**
- elas-erp/backend/app/services/invitation_service.py line 114

**Fix:**
```python
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:4000")
"invite_url": f"{frontend_url}/invite/{token}",
```

**Done Criteria:**
- [ ] Invitation URLs reflect environment
- [ ] Local uses localhost
- [ ] Production uses vizpilot.vercel.app
- [ ] No hardcoded values

**Time Estimate:** 15 minutes

---

### GREP TARGETS FOR OLD BRANDING

Search these patterns to find remaining "Elas ERP" references:

```bash
# Python files
grep -r "Elas ERP" elas-erp/backend/ --include="*.py"
grep -r "elas_erp" elas-erp/backend/ --include="*.py"
grep -r "elas-erp" . --include="*.py"

# Documentation
grep -r "Elas ERP" . --include="*.md"
grep -r "elas-erp.vercel.app" . --include="*.md"
grep -r "elas-erp.onrender.com" . --include="*.md"

# Scripts
grep -r "Elas ERP" . --include="*.ps1" --include="*.sh"
grep -r "elas-erp" . --include="*.sql"

# In the codebase
grep -r "Elas ERP Backend" . --include="*.py"
```

**Files with References:**
- elas-erp/backend/app/core/config.py (app_name default)
- COMPLETE_PROJECT_STATUS.md (title, content)
- SUPABASE_SETUP.md (intro)
- README.md (git clone, URLs, docs)
- start.py (header comment, banner)
- test_groq.ps1 (URL reference)
- setup_postgres.sql (header, database name)

---

## VERIFICATION MATRIX

| Check | Local | Production | Evidence |
|-------|-------|-----------|----------|
| Backend starts | ✅ | ✅ | /health returns 200 |
| Frontend loads | ⚠️ | ⚠️ | Supabase required |
| Auth flow works | ❌ | ❌ | Supabase creds needed |
| File upload works | ✅ | ✅ | /api/upload responds |
| File persistence | ❌ | ❌ | Files in /tmp only |
| Dashboards render | ✅ | ✅ | Pages load (empty) |
| AI endpoints | ⚠️ | ✅ | Groq key working |
| Invitations send | ❌ | ❌ | Email not implemented |
| Tests pass | ❌ | ❌ | Mocks not implemented |

---

**END OF RUNBOOK**
