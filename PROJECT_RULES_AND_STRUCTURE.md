# 🎯 ELAS ERP - Project Rules & Structure

**Last Updated:** November 5, 2025

---

## 📋 **PROJECT RULES (FROM CONVERSATION)**

### **1. ROOT STRUCTURE**
```
Elas-ERP/
├── start.py              ← MUST be in root folder for local development
├── elas-erp/             ← Main project folder
│   ├── backend/
│   ├── frontend/
│   └── artie_erp.db
└── artie-dashboard/      ← Deployment-only folder (can be deleted locally)
```

### **2. DEVELOPMENT COMMANDS**
```powershell
# Start local development:
python start.py              # Starts both frontend (port 4000) and backend (port 8000)

# Stop servers:
# Just close the terminal or Ctrl+C
```

### **3. PROJECT OBJECTIVE**
**Elas ERP** is an AI-powered financial analytics platform that:

1. **Accepts user data uploads** (Excel, CSV, financial files)
2. **Processes with Groq AI** to extract insights
3. **Generates dynamic dashboards** with charts and visualizations
4. **Provides AI chat interface** to query the data
5. **Supports multiple business domains** (defined by user)

---

## 🗂️ **CORRECT PROJECT STRUCTURE**

### **Backend (`elas-erp/backend/`)**
```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/
│   │       ├── upload.py          # File upload endpoint + Groq processing
│   │       ├── chat.py            # AI chat with Groq
│   │       └── auth.py            # User authentication (optional)
│   ├── core/
│   │   ├── config.py              # Environment variables
│   │   └── groq_client.py         # Groq AI client
│   ├── models/
│   │   └── user.py                # Database models
│   ├── database.py                # PostgreSQL connection
│   ├── init_db.py                 # Database initialization
│   └── main.py                    # FastAPI app entry point
├── requirements.txt
└── .env                           # GROQ_API_KEY, DATABASE_URL, etc.
```

### **Frontend (`elas-erp/frontend/`)**
```
frontend/
├── app/
│   ├── onboarding/
│   │   ├── business/              # Step 1: Business info
│   │   ├── team/                  # Step 2: Team setup
│   │   └── upload/                # Step 3: Upload files + AI processing
│   ├── dashboard/
│   │   └── admin/                 # Main dashboard with uploaded data
│   ├── lib/
│   │   └── api.ts                 # API base URL
│   ├── layout.tsx
│   └── page.tsx                   # Homepage
├── components/
│   └── charts/                    # Reusable chart components
├── package.json
└── next.config.js
```

---

## 🎯 **KEY FEATURES (ACTUAL PROJECT)**

### **1. Onboarding Flow**
- **Step 1:** Business information (name, industry, team size)
- **Step 2:** Team member details
- **Step 3:** **CRITICAL** - Upload financial data files

### **2. File Upload + AI Processing**
**Location:** `frontend/app/onboarding/upload/page.tsx`

**What it does:**
1. User uploads Excel/CSV files
2. Files sent to `/api/upload-simple` endpoint
3. **Backend calls Groq AI** to:
   - Extract data from files
   - Analyze financial metrics
   - Generate insights and recommendations
4. Returns structured data for dashboard
5. Creates widgets automatically

**Backend endpoint:** `backend/app/api/endpoints/upload.py`

### **3. Admin Dashboard**
**Location:** `frontend/app/dashboard/admin/page.tsx`

**What it shows:**
- KPIs from uploaded data (revenue, expenses, profit)
- Charts generated from file content
- AI-generated insights
- Red flags and alerts
- Interactive data visualizations

**Data source:** 
- Initially: localStorage (`uploadResponse`)
- Eventually: PostgreSQL database

### **4. AI Chat Interface**
**Location:** `backend/app/api/endpoints/chat.py`

**What it does:**
- User asks questions about their data
- Backend sends query + context to Groq AI
- AI analyzes uploaded data and responds
- Chat history maintained

---

## 🚫 **WHAT TO DELETE**

### **Delete These Files/Folders:**
```
# DELETE ENTIRE artie-dashboard FOLDER (deployment-only)
artie-dashboard/
├── backend/
├── frontend/
└── ...

# DELETE unnecessary documentation (created during deployment mess)
DASHBOARD_IMPROVEMENT_PLAN.md
DASHBOARD_VISUAL_MOCKUPS.md
DEPLOY.md
DEPLOYMENT_SUMMARY.md
DEPLOY_CHECKLIST.md
DEPLOY_QUICK_START.md
DEPLOY_REFERENCE.md
HOW_TO_PROCEED.md
IMPLEMENTATION_COMPLETE.md
NEXT_STEPS_SUMMARY.md
QUICK_DECISION_CARD.md
RENDER_SETUP.md
TASKS_STATUS.md
UPLOAD_FIX_SUMMARY.md
VERCEL_DEPLOY.md
VERCEL_DEPLOYMENT_GUIDE.md
```

### **Keep These Files:**
```
# Essential files
elas-erp/                    # Main project
start.py                     # Root development server
.python-version              # Python 3.11.9
requirements.txt             # Python dependencies
setup_postgres.sql           # Database setup
LOCAL_DEVELOPMENT.md         # Development guide
CURRENT_STATUS_AND_TODO.md   # Status tracking
COMPLETED_FEATURES.md        # Feature checklist
```

---

## 🔧 **ENVIRONMENT VARIABLES**

### **Backend `.env` file:**
```env
# Groq AI API Key (CRITICAL - for data processing)
GROQ_API_KEY=your_groq_api_key_here

# Database (optional for now)
DATABASE_URL=postgresql://elas_user:elas_password@localhost/elas_erp

# CORS (for local development)
ALLOWED_ORIGINS=http://localhost:4000,http://localhost:3000

# Neon Database (deployment)
NEON_DATABASE_URL=postgresql://...

# Supabase Storage (deployment)
SUPABASE_URL=...
SUPABASE_KEY=...
```

### **Frontend `.env.production` file:**
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## 📊 **DATA FLOW (THE ACTUAL PROJECT)**

```
1. User enters business info → Stored in localStorage

2. User uploads financial files (Excel/CSV)
   ↓
3. Frontend sends to /api/upload-simple
   ↓
4. Backend receives files + domain + intent
   ↓
5. Backend calls Groq AI with:
   - File content
   - Domain (e.g., "manufacturing", "retail")
   - Intent (e.g., "analyze AR aging", "forecast revenue")
   ↓
6. Groq AI returns:
   - Extracted metrics
   - Insights
   - Recommendations
   - Chart data
   ↓
7. Backend creates widget configurations
   ↓
8. Frontend receives response with:
   - Widgets array (charts, KPIs, tables)
   - Summary text
   - Red flags
   ↓
9. Frontend stores in localStorage (uploadResponse)
   ↓
10. User redirected to /dashboard/admin
   ↓
11. Dashboard loads data from localStorage
   ↓
12. Displays:
    - KPI tiles
    - Charts (bar, line, pie)
    - AI insights
    - Interactive filters
```

---

## 🎨 **CORRECT PAGES (elas-erp folder)**

### **Homepage (`app/page.tsx`)**
- Hero section
- Features list
- "Get Started" button → `/onboarding/business`

### **Onboarding Pages**
1. `/onboarding/business` - Business info form
2. `/onboarding/team` - Team members form
3. `/onboarding/upload` - **FILE UPLOAD + AI PROCESSING**

### **Dashboard (`app/dashboard/admin/page.tsx`)**
- KPI tiles (revenue, expenses, margin, DSO)
- Charts from uploaded data
- Global filters (date, client, PM, aging)
- Red flags strip
- AI chat interface

---

## 🚨 **CRITICAL ISSUES TO FIX**

### **Issue 1: Two Project Folders**
- ✅ **Keep:** `elas-erp/` (actual project)
- ❌ **Delete:** `artie-dashboard/` (deployment mess)

### **Issue 2: Missing start.py in Root**
- ❌ **Current:** No start.py in root
- ✅ **Fix:** Create start.py that runs both servers

### **Issue 3: Deployed Wrong Project**
- ❌ **Deployed:** artie-dashboard (generic dashboard)
- ✅ **Should Deploy:** elas-erp (AI-powered analytics)

### **Issue 4: Missing Upload Page**
- The **MOST IMPORTANT** page is `/onboarding/upload`
- This is where files are uploaded and Groq AI processes them
- This was working before - need to restore it

### **Issue 5: Missing Groq Integration**
- Backend must call Groq AI to analyze uploaded files
- Endpoint: `/api/upload-simple` or `/api/upload`
- Currently may be returning mock data

---

## ✅ **ACTION PLAN TO FIX EVERYTHING**

### **Phase 1: Clean Up (30 minutes)**
1. Delete `artie-dashboard/` folder entirely
2. Delete unnecessary documentation files
3. Verify `elas-erp/` folder has all correct files
4. Create `start.py` in root folder

### **Phase 2: Restore Working Features (1 hour)**
5. Verify upload page works (`/onboarding/upload`)
6. Test Groq API integration in backend
7. Verify dashboard loads uploaded data
8. Test AI chat interface

### **Phase 3: Fix Any Broken Imports (30 minutes)**
9. Check all import paths in elas-erp
10. Ensure API_BASE points to correct backend
11. Verify environment variables are set

### **Phase 4: Test End-to-End (30 minutes)**
12. Run `python start.py`
13. Go through complete onboarding flow
14. Upload a sample Excel file
15. Verify dashboard shows processed data
16. Test AI chat with questions

### **Phase 5: Deployment (Optional)**
17. Deploy `elas-erp/backend` to Render
18. Deploy `elas-erp/frontend` to Vercel
19. Update environment variables
20. Test deployed version

---

## 📝 **NEXT IMMEDIATE STEPS**

1. **Confirm:** You want me to delete `artie-dashboard/` folder?
2. **Create:** `start.py` in root folder
3. **Verify:** `elas-erp/` has all correct code
4. **Test:** Local development works

**SHALL I PROCEED WITH CLEANUP?**
