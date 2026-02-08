# TODO: E2E Flow Implementation

## Status: 🔴 IN PROGRESS

This document tracks the implementation of automated end-to-end testing and the complete user flow.

---

## ✅ COMPLETED

### Infrastructure
- [x] RULES.md created with CI/CD flow-gate rules
- [x] GitHub Actions workflows created (backend-tests.yml, frontend-e2e.yml)
- [x] Playwright config and test structure created
- [x] Backend pytest structure created (conftest.py, test_api.py)
- [x] Frontend package.json updated with test scripts
- [x] Husky pre-push hook created
- [x] Backend config updated (APP_ENV, GROQ_MODE, AUTH_MODE fields)
- [x] /version endpoint added to backend
- [x] Test fixture CSV created

---

## 🔄 IN PROGRESS

### A. Backend Test Mode Implementation

**Priority: HIGH**

#### A1: Database Layer
- [ ] Create SQLite database manager for test mode
- [ ] Update database connection logic to switch based on APP_ENV
  - `test` → `sqlite:///test.db`
  - `development` → Current Supabase/Neon
  - `production` → Current Supabase/Neon
- [ ] Add test database migrations/schema setup
- [ ] Add test teardown (clean test.db between runs)

**Files to modify:**
- `backend/app/core/database.py` (or equivalent)
- `backend/app/core/config.py` (update database_url logic)

#### A2: Storage Layer (Mock for Test)
- [ ] Create local file storage handler for test mode
- [ ] Update upload service to use local temp storage when `APP_ENV=test`
- [ ] Add cleanup for temp test files

**Files to modify:**
- `backend/app/services/storage_service.py` (or equivalent)
- `backend/app/api/endpoints/upload.py`

#### A3: Auth Layer (Mock)
- [ ] Create mock auth service that bypasses Supabase
- [ ] Seed test user: `test@elas.local` / `password`
- [ ] Return mock JWT tokens when `AUTH_MODE=mock`
- [ ] Update auth middleware to accept mock tokens

**Files to modify:**
- `backend/app/services/auth_service.py`
- `backend/app/api/endpoints/auth.py`

#### A4: Groq Mock Service
- [ ] Create deterministic Groq mock that returns 3 valid Vega-Lite specs
- [ ] Specs should reference `{"data": {"name": "named_dataset"}}`
- [ ] Update `/api/widgets/propose` to use mock when `GROQ_MODE=mock`
- [ ] Ensure all specs pass Pydantic validation

**Files to modify:**
- `backend/app/services/ai_service.py` (or equivalent)
- `backend/app/api/endpoints/ai.py`

**Mock spec template:**
```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "mark": "line",
  "data": {"name": "named_dataset"},
  "encoding": {
    "x": {"field": "date", "type": "temporal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
```

---

### B. Frontend Test Support

**Priority: HIGH**

#### B1: Install Dependencies
```bash
cd frontend
npm install @playwright/test --save-dev
npx playwright install --with-deps
```

#### B2: Test Login Shortcut (Optional)
- [ ] Add test mode detection in login page
- [ ] Show "Test Login" button when `APP_ENV=test`
- [ ] Auto-fill test credentials

**Files to modify:**
- `frontend/app/login/page.tsx`

#### B3: Add data-test Attributes
- [ ] Add `data-test="vega-chart"` to chart components
- [ ] Add `data-test="widget-card"` to dashboard widgets
- [ ] Verify all Playwright selectors match actual DOM

**Files to modify:**
- `frontend/app/components/VegaChart.tsx` (or equivalent)
- `frontend/app/dashboard/[role]/page.tsx`

---

### C. Backend Unit Tests

**Priority: MEDIUM**

- [x] Basic structure created
- [ ] Complete test coverage:
  - [x] `/health` endpoint
  - [x] `/version` endpoint
  - [x] `/api/upload` basic flow
  - [ ] `/api/widgets/propose` with mock Groq
  - [ ] `/api/widgets/save` (requires dashboard service)
  - [ ] `/api/dashboard/{role}` (requires saved widgets)

**Files to complete:**
- `backend/tests/test_api.py`

---

### D. CI/CD Pipeline

**Priority: MEDIUM**

#### D1: GitHub Actions Validation
- [ ] Test backend-tests.yml workflow locally
- [ ] Test frontend-e2e.yml workflow locally
- [ ] Fix any path issues (note: workflows run from root, need `elas-erp/` prefix)
- [ ] Verify pytest discovers and runs tests
- [ ] Verify Playwright discovers and runs E2E test

#### D2: Pre-Push Hook Setup
- [ ] Install Husky in frontend:
  ```bash
  cd frontend
  npm install --save-dev husky
  npx husky install
  ```
- [ ] Make pre-push hook executable:
  ```bash
  chmod +x .husky/pre-push
  ```
- [ ] Test pre-push hook locally
- [ ] Fix any blocking issues

---

### E. Endpoints to Implement/Verify

**Priority: VARIES**

#### E1: Widget Endpoints (HIGH)
- [ ] `POST /api/widgets/propose` - Generate widget specs (mock mode needed)
- [ ] `POST /api/widgets/save` - Save dashboard configuration
- [ ] `GET /api/dashboard/{role}` - Load role-specific dashboard

**Status:** May already exist, need to verify and add mock support

#### E2: Business Form Endpoint (MEDIUM)
- [ ] `POST /api/business/onboard` or equivalent
- [ ] Accept business name, type, etc.

**Status:** Check if exists in `backend/app/api/endpoints/business.py`

---

## ⏸️ DEFERRED (Future Sprints)

### F. CORS Hardening
- [ ] Update backend to read `CORS_ORIGINS` from env (comma-separated)
- [ ] Remove `allow_origins=["*"]` wildcard
- [ ] Explicitly list dev + prod URLs

### G. Observability
- [ ] Add `X-Request-ID` header to all requests
- [ ] Log LLM latency and fallback usage
- [ ] Add structured logging (JSON format)

### H. Real Supabase Storage Integration
- [ ] Implement Supabase Storage upload in production mode
- [ ] Create `elas-uploads` bucket
- [ ] Update upload service to use Supabase Storage when `APP_ENV=production`

---

## 🧪 Testing Checklist

### Before Marking as Complete:

- [ ] Backend tests pass locally: `cd backend && pytest -q`
- [ ] Frontend E2E passes locally: `cd frontend && npm run test:e2e`
- [ ] Pre-push hook blocks on test failure
- [ ] GitHub Actions workflows pass on push to main
- [ ] Full E2E flow works:
  1. [ ] Landing page loads
  2. [ ] Login with test credentials
  3. [ ] Business form submission
  4. [ ] File upload succeeds
  5. [ ] Proposals render (3 mock charts)
  6. [ ] Save dashboard works
  7. [ ] Dashboard loads with widgets
- [ ] Mock mode returns deterministic results (no random failures)
- [ ] Test mode doesn't require external services (Groq, Supabase, etc.)

---

## 📊 Progress Tracker

**Overall:** 35% Complete

| Component | Status | Progress |
|-----------|--------|----------|
| Infrastructure | ✅ Done | 100% |
| Backend Test Mode | 🔴 Not Started | 0% |
| Frontend Test Support | 🔴 Not Started | 0% |
| Backend Unit Tests | 🟡 Partial | 40% |
| CI/CD Pipeline | 🟡 Created | 50% |
| E2E Flow | 🔴 Not Started | 0% |

---

## 🚀 Next Steps (Prioritized)

1. **Implement mock Groq service** (A4) - Required for E2E test
2. **Implement mock auth service** (A3) - Required for E2E test
3. **Add data-test attributes** (B3) - Required for E2E test selectors
4. **Install Playwright and test locally** (B1) - Verify E2E test structure
5. **Complete backend test mode** (A1-A2) - Switch to SQLite in test mode
6. **Run and fix E2E test** - Make the full flow pass
7. **Setup and test pre-push hook** (D2) - Block bad pushes
8. **Validate CI workflows** (D1) - Ensure GitHub Actions work

---

## 📝 Notes

- **Mock Groq specs must be valid Vega-Lite** - Use simple line/bar charts
- **Test mode should be completely offline** - No external API calls
- **Pre-push hook may be slow** (~30s-1min) - Consider making it optional for rapid dev
- **CI runs will fail until backend implements test mode** - This is expected
- **Database schema in test mode** - Minimal schema for upload + widgets only

---

## 🆘 Help Needed

If stuck on any item, check:
1. RULES.md for architecture contracts
2. Existing endpoint implementations for patterns
3. FastAPI docs for TestClient usage
4. Playwright docs for selector best practices

---

**Last Updated:** [Date will be auto-updated]
