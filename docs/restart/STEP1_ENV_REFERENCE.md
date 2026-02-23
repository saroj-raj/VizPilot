# ENV VAR REFERENCE - Current vs Standard (Side-by-Side)

## Frontend Environment Variables

### NEXT_PUBLIC_API_BASE

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Backend API endpoint | Backend API endpoint | ✅ Unchanged |
| **Used in files** | 9 component files | 1 config file (imported) | ✅ Centralized |
| **Local value** | `http://localhost:8000` | `http://localhost:8000` | ✅ Same |
| **Fallback pattern** | `\|\| 'http://localhost:8000'` (repeated 9x) | Import from `lib/config.ts` | ✅ DRY |
| **Production value** | `https://vizpilot-api.onrender.com` | `https://vizpilot-api.onrender.com` | ✅ Same |
| **Set in** | `.env.local` (dev) or Vercel dashboard | `.env.local` (dev) or Vercel dashboard | ✅ Same |

### NEXT_PUBLIC_SUPABASE_URL

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Supabase project URL | Supabase project URL | ✅ Unchanged |
| **Used in** | `frontend/lib/supabase.ts` | `frontend/lib/supabase.ts` | ✅ Unchanged |
| **Format** | `https://[project].supabase.co` | `https://[project].supabase.co` | ✅ Same |
| **Example** | `https://myproject.supabase.co` | `https://myproject.supabase.co` | ✅ Same |
| **Requirement** | Required (crashes if missing) | Required (crashes if missing) | ✅ Same |

### NEXT_PUBLIC_SUPABASE_ANON_KEY

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Supabase anonymous public key | Supabase anonymous public key | ✅ Unchanged |
| **Used in** | `frontend/lib/supabase.ts` | `frontend/lib/supabase.ts` | ✅ Unchanged |
| **Security** | Public (safe to expose) | Public (safe to expose) | ✅ Same |
| **Requirement** | Required (crashes if missing) | Required (crashes if missing) | ✅ Same |

---

## Backend Environment Variables

### New in Step 1: FRONTEND_URL

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Variable name** | N/A (hardcoded) | `FRONTEND_URL` | ✨ NEW |
| **Purpose** | N/A | Frontend URL for CORS, invitations, OAuth redirects | ✨ NEW |
| **Replaces** | Hard-coded strings in 2 files | Single env var | ✨ NEW |
| **Local value** | `http://localhost:4000` (hardcoded) | `http://localhost:4000` (env var) | ✨ NEW |
| **Production value** | N/A | `https://vizpilot.vercel.app` | ✨ NEW |
| **Used in** | - | 3 places: CORS, invitations, redirects | ✨ NEW |
| **Set in** | - | `backend/.env` or `.env.local` | ✨ NEW |
| **Fallback** | N/A | `http://localhost:4000` (in config.py) | ✨ NEW |

### SUPABASE_URL (Backend)

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Supabase project URL | Supabase project URL | ✅ Unchanged |
| **Used in** | `backend/app/db/supabase_client.py` | `backend/app/db/supabase_client.py` | ✅ Unchanged |
| **Format** | `https://[project].supabase.co` | `https://[project].supabase.co` | ✅ Same |
| **Requirement** | Required | Required | ✅ Same |
| **Set in** | `backend/.env` | `backend/.env` | ✅ Same |

### SUPABASE_ANON_KEY (Backend)

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Supabase anonymous key | Supabase anonymous key | ✅ Unchanged |
| **Used in** | `backend/app/db/supabase_client.py` | `backend/app/db/supabase_client.py` | ✅ Unchanged |
| **Requirement** | Required | Required | ✅ Same |
| **Set in** | `backend/.env` | `backend/.env` | ✅ Same |

### SUPABASE_SERVICE_ROLE_KEY

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Supabase service role key (admin) | Supabase service role key (admin) | ✅ Unchanged |
| **Used in** | `backend/app/db/supabase_client.py` | `backend/app/db/supabase_client.py` | ✅ Unchanged |
| **Requirement** | Required | Required | ✅ Same |
| **Security** | Private (never expose) | Private (never expose) | ✅ Same |
| **Set in** | `backend/.env` | `backend/.env` | ✅ Same |

### GROQ_API_KEY

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Groq AI API key | Groq AI API key | ✅ Unchanged |
| **Used in** | `backend/app/services/llm_service.py` | `backend/app/services/llm_service.py` | ✅ Unchanged |
| **Requirement** | Required (if using AI features) | Required (if using AI features) | ✅ Same |
| **Set in** | `backend/.env` | `backend/.env` | ✅ Same |

### APP_NAME

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Default value** | `"Elas ERP Backend"` | `"VizPilot Backend"` | 🔄 UPDATED |
| **Used in** | Health endpoint, app title | Health endpoint, app title | ✅ Same usage |
| **Set in** | `backend/app/core/config.py` | `backend/.env` (APP_NAME=) | ✅ Env-controllable |
| **File change** | `app_name: str = Field(default="Elas ERP Backend", ...)` | `app_name: str = Field(default="VizPilot Backend", ...)` | 🔄 UPDATED |

### APP_ENV

| Aspect | Current | After Step 1 | Status |
|--------|---------|--------------|--------|
| **Purpose** | Environment name (dev/staging/prod) | Environment name (dev/staging/prod) | ✅ Unchanged |
| **Default** | `"dev"` | `"dev"` | ✅ Same |
| **Values** | `dev`, `staging`, `prod` | `dev`, `staging`, `prod` | ✅ Same |
| **Set in** | `backend/.env` | `backend/.env` | ✅ Same |

---

## CORS Configuration: Hardcoded vs Env-Driven

### Current (Step 0)
```python
# File: elas-erp/backend/app/main.py (Line 11)
allow_origins=["*"]  # ❌ HARDCODED - Too permissive
```

### After Step 1
```python
# File: elas-erp/backend/app/main.py (Line 11)
allow_origins=[settings.frontend_url]  # ✅ ENV-DRIVEN from FRONTEND_URL
```

**Impact:**
- **Before:** Accepts requests from ANY origin (security risk)
- **After:** Only accepts from FRONTEND_URL (http://localhost:4000 local or https://vizpilot.vercel.app prod)

---

## Invitation URL: Hardcoded vs Env-Driven

### Current (Step 0)
```python
# File: elas-erp/backend/app/services/invitation_service.py (Line 114)
"invite_url": f"http://localhost:4000/invite/{token}"  # ❌ HARDCODED
```

### After Step 1
```python
# File: elas-erp/backend/app/services/invitation_service.py (Line 114)
"invite_url": f"{settings.frontend_url}/invite/{token}"  # ✅ ENV-DRIVEN
```

**Impact:**
- **Before:** Invitations always link to http://localhost:4000 (breaks in production)
- **After:** Invitations link to correct frontend URL (http://localhost:4000 local or https://vizpilot.vercel.app prod)

---

## Environment Files Comparison

### frontend/.env.local (DEV)

**Current:**
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
```

**After Step 1:**
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Changes:**
- Documentation improved in .example file (not .local)
- Same 3 variables required
- Comments added explaining where to find values

---

### elas-erp/backend/.env (DEV)

**Current:**
```env
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_ANON_KEY=placeholder-anon-key
SUPABASE_SERVICE_ROLE_KEY=...
ALLOWED_ORIGINS=http://localhost:4000,http://localhost:3000,http://localhost:8000
```

**After Step 1:**
```env
FRONTEND_URL=http://localhost:4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
APP_NAME=VizPilot Backend
APP_ENV=dev
GROQ_API_KEY=gsk_your_key_here
GROQ_MODE=live
AUTH_MODE=live
```

**Changes:**
- ✨ **NEW:** FRONTEND_URL (replaces hardcoded + unused ALLOWED_ORIGINS)
- ✅ Updated documentation in .example file
- ✅ All required vars now documented
- ✅ Removed unused ALLOWED_ORIGINS variable

---

## Vercel Dashboard Configuration (Production Frontend)

### Environment Variables to Set

```env
NEXT_PUBLIC_API_BASE=https://vizpilot-api.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Before/After:** Unchanged (same vars)  
**Note:** These are read-only in browser DevTools (prefixed with NEXT_PUBLIC_)

---

## Render Dashboard Configuration (Production Backend)

### Environment Variables to Set

```env
FRONTEND_URL=https://vizpilot.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
GROQ_API_KEY=gsk_your_key_here
APP_NAME=VizPilot Backend
APP_ENV=prod
GROQ_MODE=live
AUTH_MODE=live
```

**Before/After:** 
- Before: Missing FRONTEND_URL (broken in production)
- After: FRONTEND_URL explicitly set (fixes invitations + CORS)

---

## Quick Reference: Where to Change Env Vars

### For Local Development
```bash
# Frontend
nano frontend/.env.local
# Set: NEXT_PUBLIC_API_BASE, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Backend
nano elas-erp/backend/.env
# Set: FRONTEND_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY
```

### For Production (Vercel)
```
1. Go to https://vercel.com/dashboard
2. Select vizpilot project
3. Settings → Environment Variables
4. Set: NEXT_PUBLIC_API_BASE, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### For Production (Render)
```
1. Go to https://dashboard.render.com
2. Select vizpilot-api service
3. Settings → Environment
4. Set: FRONTEND_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY
```

---

## Validation Checklist After Step 1

- [ ] `NEXT_PUBLIC_API_BASE` points to correct backend
  - Local: http://localhost:8000
  - Production: https://vizpilot-api.onrender.com

- [ ] `FRONTEND_URL` points to correct frontend
  - Local: http://localhost:4000
  - Production: https://vizpilot.vercel.app

- [ ] CORS middleware accepts requests from `FRONTEND_URL` only

- [ ] Invitation links generated use `FRONTEND_URL` not hardcoded URL

- [ ] All Supabase credentials set (URL + anon key + service role key)

- [ ] Groq API key set and backend starts without errors

- [ ] Backend startup validation runs and reports missing env vars clearly

- [ ] Frontend build succeeds and shows no env var errors

---

**See STEP1_URL_ENV_ANALYSIS.md for implementation details and exact code patches.**
