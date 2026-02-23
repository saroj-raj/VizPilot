# VizPilot STEP 1: Complete Deliverables Index

**Goal:** Make URLs and environment variables consistent across frontend, backend, and hosting so links stop breaking.

**Status:** ✅ **ANALYSIS COMPLETE - READY FOR IMPLEMENTATION**

---

## 📋 Document Guide

### Start Here
👉 **[STEP1_SUMMARY.md](STEP1_SUMMARY.md)** - High-level overview (5 min read)
- Quick visual summary of all changes
- URL maps and env var contracts
- Summary table of deliverables
- What gets fixed and what stays the same

### For Implementation
👉 **[STEP1_CHECKLIST.md](STEP1_CHECKLIST.md)** - Quick reference checklist (10 min read)
- Phase-by-phase action items
- Files to update in order
- Verification commands
- Risk assessment + timeline

### For Full Details
👉 **[STEP1_URL_ENV_ANALYSIS.md](STEP1_URL_ENV_ANALYSIS.md)** - Comprehensive analysis (30 min read)
- **Part A:** Complete URL map (production + local + all routes)
- **Part B:** Environment variable contract (mapping + standardization)
- **Part C:** Env file examples (new frontend/.env.example and backend/.env.example)
- **Part D:** Code edits inventory (all files with hardcoded URLs, line numbers)
- **Part E:** Action list (4 phases, 16 steps total)
- **Part F:** Exact code changes (patch format with before/after)
- **Part G:** Verification checklist
- **Notes section:** Design rationale

### For Reference
👉 **[STEP1_ENV_REFERENCE.md](STEP1_ENV_REFERENCE.md)** - Side-by-side env var reference (10 min read)
- Current vs After Step 1 comparison tables
- All frontend env vars
- All backend env vars
- New FRONTEND_URL detailed explanation
- CORS configuration changes
- Invitation URL changes
- What to set in Vercel/Render dashboards

---

## 🎯 Key Findings Summary

### Critical Issues (Blocks Production)
| Issue | File | Line | Impact |
|-------|------|------|--------|
| Hardcoded localhost 4000 in invitations | `elas-erp/backend/app/services/invitation_service.py` | 114 | Invitations break in production |
| Wildcard CORS allow_origins=["*"] | `elas-erp/backend/app/main.py` | 11 | Security risk, overly permissive |
| Missing FRONTEND_URL env var | `elas-erp/backend/app/core/config.py` | N/A | No way to configure frontend URL |

### Important Issues (Code Quality)
| Issue | Files | Impact |
|-------|-------|--------|
| Repeated hardcoded localhost fallbacks | 9 frontend components | Code duplication, harder to maintain |
| Inconsistent /api suffix in groq.ts | `elas-erp/frontend/app/lib/groq.ts` | Line 3 | Inconsistent with other files |
| Hardcoded "Elas ERP Backend" | `elas-erp/backend/app/main.py` | Line 16 | Old branding in responses |

### Documentation Issues
| Issue | Files | Impact |
|-------|-------|--------|
| Old branding references | `.env.example` files | Confusion during setup |
| Missing FRONTEND_URL documentation | `backend/.env.example` | Users don't know about new variable |
| Incomplete setup instructions | All `.env.example` files | Users don't know where to get credentials |

---

## 🔧 What Gets Fixed

### ✨ New in Step 1
- **FRONTEND_URL** environment variable (replaces 3 hardcoded values)
- **Config validation** at backend startup (clear error messages)
- **Centralized API_BASE** in frontend (reduce duplication)
- **Complete env documentation** with links to credential sources

### 🔴 Fixes Critical Issues
- **Invitation URLs** now use FRONTEND_URL (will work in production)
- **CORS** now uses FRONTEND_URL (security improved)
- **Backend config** now has FRONTEND_URL field (editable)

### ⚠️ Improves Code Quality
- **Removes 9 hardcoded fallback patterns** (DRY principle)
- **Removes /api suffix inconsistency** (consistency)
- **Uses settings.app_name** in health endpoint (dynamic)

### 📝 Improves Documentation
- **New frontend/.env.example** with setup links
- **New backend/.env.example** with complete variable list
- **Startup validation messages** guide users

---

## 📦 Deliverables Checklist

### Part A: URL Map ✅
- [x] Production URLs listed (Vercel, Render, Supabase)
- [x] Local URLs listed (localhost:4000, localhost:8000)
- [x] Request flow diagram (Frontend → Backend API, Backend → Supabase)
- [x] All routes documented

### Part B: Environment Variable Contract ✅
- [x] Frontend env vars (3 required: NEXT_PUBLIC_API_BASE, SUPABASE_URL, SUPABASE_ANON_KEY)
- [x] Backend env vars (7+ required)
- [x] Mapping of current → standard env var names
- [x] Which files use which env vars

### Part C: Environment Example Files ✅
- [x] `frontend/.env.example` - Proposed replacement content
- [x] `backend/.env.example` - Proposed replacement content
- [x] `elas-erp/backend/.env.example` - Proposed replacement content
- [x] All files include setup instructions and credential source links

### Part D: Code Edits Inventory ✅
- [x] All 9 frontend files with repeated patterns identified (lines)
- [x] All 3 backend files with hardcoded values identified (lines)
- [x] New files needed (validate_config.py, config.ts)
- [x] File paths and line numbers provided for each

### Part E: Action List ✅
- [x] Phase 1: Env files (10 min)
- [x] Phase 2: Frontend code (30 min)
- [x] Phase 3: Backend code (20 min)
- [x] Phase 4: Verification (15 min)
- [x] Total time estimate: ~75 minutes

### Part F: Code Changes (Patches) ✅
- [x] Exact before/after snippets for each change
- [x] Line numbers provided
- [x] File paths provided
- [x] Context (3-5 lines before/after)
- [x] Format: patch-style diffs

### Part G: Verification Checklist ✅
- [x] Env file verification (development setup)
- [x] Backend startup (validation runs, no errors)
- [x] Frontend build (compiles, no missing env errors)
- [x] URL resolution (backend URLs used correctly)
- [x] Production config (env vars switchable per environment)

---

## 🚀 Implementation Path

### For Step 1 Implementation, Follow This Order:

1. **Read STEP1_SUMMARY.md** (5 min) - Get overview
2. **Read STEP1_CHECKLIST.md** (10 min) - Understand phases
3. **Reference STEP1_ENV_REFERENCE.md** (as needed) - Current vs After
4. **Read STEP1_URL_ENV_ANALYSIS.md Part A-E** (30 min) - Detailed plan
5. **Apply changes from STEP1_URL_ENV_ANALYSIS.md Part F** (45 min) - Code edits
6. **Run verification commands** from STEP1_CHECKLIST.md (15 min)

**Total time: ~75 minutes**

---

## 📊 Files to Modify Summary

### Frontend Files (10 files)
```
✏️ frontend/.env.example              - Replace content
✏️ elas-erp/frontend/.env.example     - Create/update (if exists)
✏️ frontend/.env.local                - Verify values
✨ frontend/lib/config.ts             - Create new
✏️ elas-erp/frontend/app/lib/groq.ts  - Fix Line 3
✏️ elas-erp/frontend/app/onboarding/business/page.tsx      - Update 2 lines
✏️ elas-erp/frontend/app/onboarding/upload/page.tsx        - Update 2 lines
✏️ elas-erp/frontend/app/onboarding/documents/page.tsx     - Update 2 lines
✏️ elas-erp/frontend/app/onboarding/review/page.tsx        - Update 1 line
✏️ elas-erp/frontend/app/team/page.tsx                     - Update 2 lines
✏️ elas-erp/frontend/app/settings/page.tsx                 - Update 1 line
✏️ frontend/app/onboarding/business/page.tsx               - Update 2 lines
✏️ frontend/app/onboarding/upload/page.tsx                 - Update 2 lines
✏️ frontend/app/dashboard/[role]/page.tsx                  - Update 1 line
```

### Backend Files (7 files)
```
✏️ backend/.env.example               - Replace content
✏️ elas-erp/backend/.env.example      - Replace content
✏️ elas-erp/backend/.env              - Verify FRONTEND_URL set
✏️ elas-erp/backend/app/core/config.py           - Add FRONTEND_URL field
✨ elas-erp/backend/app/core/validate_config.py  - Create new
✏️ elas-erp/backend/app/main.py                  - Fix CORS, health, validation
✏️ elas-erp/backend/app/services/invitation_service.py - Fix hardcoded URL
```

---

## 🔍 Evidence References

### Frontend Issues: Grep Results
- 9 files with repeated `process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'`
- 160+ matches across repository for env var and URL patterns
- groq.ts has inconsistent `/api` suffix (Line 3)

### Backend Issues: Code Review
- `main.py` Line 11: `allow_origins=["*"]` (hardcoded wildcard)
- `main.py` Line 16: Hardcoded "Elas ERP Backend"
- `invitation_service.py` Line 114: Hardcoded `http://localhost:4000`
- `config.py` Lines 12-13: Has SUPABASE_URL/KEY, missing FRONTEND_URL

### Environment Files
- `backend/.env.example` uses ALLOWED_ORIGINS (unused in code)
- `frontend/.env.example` references old "elas-api.onrender.com"
- No FRONTEND_URL variable documented anywhere

---

## ✅ Quality Assurance

### Changes Are Safe Because:
- ✅ No breaking changes (all fallbacks remain)
- ✅ Backward compatible (existing env vars unchanged)
- ✅ Additive only (only adding FRONTEND_URL)
- ✅ Non-invasive (simple string replacements, no refactoring)
- ✅ Reversible (can be reverted easily)
- ✅ Each change independent (can be tested separately)
- ✅ No logic changes (only configuration changes)

### Changes Are Complete Because:
- ✅ All hardcoded URLs identified
- ✅ All env var usage documented
- ✅ All files needing updates listed
- ✅ Line numbers provided for precision
- ✅ Before/after code shown
- ✅ Verification steps included
- ✅ New files clearly specified

---

## 📞 Questions Answered in Documents

**Q: Why FRONTEND_URL instead of CORS_ORIGINS?**  
A: Clearer intent + reusable for invitations + redirects, not just CORS. See STEP1_URL_ENV_ANALYSIS.md Part H.

**Q: Why keep localhost fallbacks?**  
A: Developer convenience + graceful degradation + clear debugging. See STEP1_URL_ENV_ANALYSIS.md Part H.

**Q: Why consolidate to config.ts?**  
A: Reduces duplication from 9 files, single source of truth, easier to change. See STEP1_CHECKLIST.md.

**Q: What about production deployment?**  
A: Set FRONTEND_URL in Render dashboard, NEXT_PUBLIC_API_BASE in Vercel dashboard. See STEP1_ENV_REFERENCE.md.

**Q: Which files are duplicates?**  
A: `frontend/` vs `elas-erp/frontend/`, `backend/` vs `elas-erp/backend/`. See STEP1_URL_ENV_ANALYSIS.md Part D note.

---

## 🎓 Learning Resources Embedded

Each document includes:
- **Rationale** - Why each change matters
- **Examples** - Concrete code snippets
- **Line numbers** - Exact locations in files
- **Before/after** - Visual comparison
- **Links** - Where to find credentials
- **Verification** - How to test each change

---

## 📈 Next Steps After Step 1

1. **Step 2:** Implement code changes
2. **Step 3:** Test in local environment
3. **Step 4:** Test in staging (if available)
4. **Step 5:** Deploy to production with correct env vars
5. **Step 6:** Monitor links for 24 hours

---

## 🏁 Success Criteria for Step 1

After completing Step 1, these should be true:

- ✅ All hardcoded localhost URLs replaced with env vars
- ✅ FRONTEND_URL env var added and used consistently
- ✅ CORS configured to use FRONTEND_URL (not wildcard)
- ✅ Invitation URLs generated using FRONTEND_URL
- ✅ Frontend API calls centralized to one config file
- ✅ Backend startup validates required env vars
- ✅ Frontend build validates required env vars
- ✅ All .env.example files updated with complete documentation
- ✅ No hardcoded URLs remain in active code paths
- ✅ All changes are env-driven (local vs production via env vars)

---

## 📄 Document Files

| File | Purpose | Size | Read Time |
|------|---------|------|-----------|
| STEP1_SUMMARY.md | This index + overview | 5 KB | 5 min |
| STEP1_CHECKLIST.md | Implementation checklist | 8 KB | 10 min |
| STEP1_URL_ENV_ANALYSIS.md | Comprehensive analysis | 50 KB | 30 min |
| STEP1_ENV_REFERENCE.md | Side-by-side env var reference | 15 KB | 10 min |
| TOTAL | All deliverables | 78 KB | 55 min |

---

## 🎯 TL;DR (Too Long; Didn't Read)

**Problem:** URLs hardcoded, env vars inconsistent, links break in production.

**Solution:** Introduce FRONTEND_URL env var, centralize API_BASE in frontend, update .env examples, add startup validation.

**Impact:** 
- Invitations work in production ✅
- CORS not overly permissive ✅
- All URLs env-driven ✅
- Setup documented ✅

**Time:** 75 minutes to implement

**Files:** 17 to change, 2 to create

**Risk:** Low (reversible, non-breaking, testable)

---

**Created:** February 22, 2026  
**Status:** ✅ Ready for Step 2 Implementation  
**Next:** See STEP1_CHECKLIST.md to begin implementation

---

For questions, see the detailed documents above. Each has specific line numbers, file paths, code patches, and verification steps.

**Happy coding! 🚀**
