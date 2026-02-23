# STEP 1 CHECKLIST: URL & ENV VAR FIXES (Quick Reference)

## Files to Update - In Order

### ✅ Phase 1: Environment Example Files (Start Here)

- [ ] **frontend/.env.example** - Replace with new content from Part C
- [ ] **backend/.env.example** - Replace with new content from Part C  
- [ ] **elas-erp/backend/.env.example** - Replace with new content from Part C
- [ ] Verify: **frontend/.env.local** has NEXT_PUBLIC_API_BASE=http://localhost:8000
- [ ] Verify: **elas-erp/backend/.env** has FRONTEND_URL=http://localhost:4000

### ✅ Phase 2: Frontend Code Changes

- [ ] **elas-erp/frontend/app/lib/groq.ts** (Line 3)
  - Change: Remove `/api` suffix from localhost
  - From: `'http://localhost:8000/api'`
  - To: `'http://localhost:8000'`

- [ ] **Create frontend/lib/config.ts** (new file)
  - Export getApiBase() function with fallback
  - Or use existing frontend/lib/api.ts if applicable

- [ ] **Update 9 files** to use consolidated API_BASE
  - elas-erp/frontend/app/onboarding/business/page.tsx (Lines 40, 68)
  - elas-erp/frontend/app/onboarding/upload/page.tsx (Lines 88, 124)
  - elas-erp/frontend/app/onboarding/documents/page.tsx (Lines 99, 148)
  - elas-erp/frontend/app/team/page.tsx (Lines 62, 93)
  - elas-erp/frontend/app/settings/page.tsx (Line 70)
  - elas-erp/frontend/app/onboarding/review/page.tsx (Line 24)
  - frontend/app/onboarding/business/page.tsx (Lines 40, 68)
  - frontend/app/onboarding/upload/page.tsx (Lines 88, 124)
  - frontend/app/dashboard/[role]/page.tsx (Line 155)

### ✅ Phase 3: Backend Code Changes

- [ ] **elas-erp/backend/app/core/config.py** (After line 13)
  - Add: `frontend_url: str = Field(default="http://localhost:4000", alias="FRONTEND_URL")`

- [ ] **elas-erp/backend/app/main.py** (Line 11)
  - Change CORS allow_origins from `["*"]` to `[settings.frontend_url]`
  - Also update health endpoint to use `settings.app_name` (Line 16)

- [ ] **elas-erp/backend/app/services/invitation_service.py** (Line 114)
  - Change: Replace hardcoded `"http://localhost:4000"` with `settings.frontend_url`
  - Add import: `from app.core.config import settings`

- [ ] **Create elas-erp/backend/app/core/validate_config.py** (new file)
  - Add function to validate required env vars at startup

- [ ] **elas-erp/backend/app/main.py** (Top of file)
  - Add validation call: `validate_backend_config()` before app creation

---

## Files Changed Summary

| File | Change Type | Lines | Issue |
|------|------------|-------|-------|
| frontend/.env.example | Update | All | Old branding refs, missing docs |
| backend/.env.example | Update | All | Old ALLOWED_ORIGINS, missing FRONTEND_URL |
| elas-erp/frontend/app/lib/groq.ts | Fix API Base | 3 | /api suffix inconsistency |
| 9 Frontend pages | Consolidate | Multiple | Repeated localhost fallbacks |
| elas-erp/backend/app/core/config.py | Add Field | 14-16 | Missing FRONTEND_URL |
| elas-erp/backend/app/main.py | Fix CORS | 11 | Wildcard allow_origins |
| elas-erp/backend/app/main.py | Fix health | 16 | Hardcoded "VizPilot Backend" |
| elas-erp/backend/app/services/invitation_service.py | Fix hardcoded URL | 114 | Breaks in production |
| NEW: elas-erp/backend/app/core/validate_config.py | Create | New | Startup validation |

---

## Key Environment Variables After Step 1

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)
```env
FRONTEND_URL=http://localhost:4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
GROQ_API_KEY=gsk_your_key
```

---

## Verification Commands

After applying all changes:

```bash
# 1. Check backend starts
cd elas-erp/backend
python -m uvicorn app.main:app --reload

# 2. Check health endpoint (in another terminal)
curl http://localhost:8000/health

# 3. Check frontend builds
cd frontend
npm run build

# 4. Run frontend
npm run dev

# 5. Verify in browser
# - http://localhost:4000 loads
# - Network tab shows API calls to http://localhost:8000
# - No hardcoded localhost URLs in production config
```

---

## Risk Assessment

🟢 **LOW RISK**
- All changes are localized
- Fallbacks remain for safety
- No breaking changes
- Can be reverted easily
- Each change independent

---

## Timeline

- **Phase 1 (Env Files):** 10 minutes
- **Phase 2 (Frontend Code):** 30 minutes
- **Phase 3 (Backend Code):** 20 minutes
- **Verification:** 15 minutes
- **Total:** ~75 minutes

---

## Questions Answered

**Q: Why FRONTEND_URL and not CORS_ORIGINS?**  
A: FRONTEND_URL is clearer and reusable for invitations + redirects, not just CORS.

**Q: Why not break up ALLOWED_ORIGINS into individual env vars?**  
A: Backend only needs single Vercel URL. Comma-separated is overcomplicated.

**Q: Why keep localhost fallbacks?**  
A: Convenience + graceful degradation if env var not set.

**Q: What about production?**  
A: Set FRONTEND_URL=https://vizpilot.vercel.app and NEXT_PUBLIC_API_BASE=https://vizpilot-api.onrender.com in hosting dashboards.

---

**See STEP1_URL_ENV_ANALYSIS.md for full documentation with code snippets and patches.**
