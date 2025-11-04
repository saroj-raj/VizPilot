# 🚀 Local Development Setup

## Prerequisites

Make sure you have installed:
- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL** (or use Neon cloud database)

---

## 📁 Project Structure

```
Elas-ERP/
├── artie-dashboard/
│   ├── backend/          ← Python FastAPI backend
│   └── frontend/         ← Next.js frontend
└── elas-erp/             ← Old folder (can ignore)
```

---

## 🔧 Backend Setup (Python FastAPI)

### 1. Navigate to Backend
```bash
cd artie-dashboard/backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Create `.env` File

Create `artie-dashboard/backend/.env`:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_Wfo1l9xTspMD@ep-fragrant-cloud-ah6fw03c-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

# Supabase Storage
SUPABASE_URL=https://eovphecoexvbsofifyty.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvdnBoZWNvZXh2YnNvZmlmeXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA1ODU5NCwiZXhwIjoyMDc3NjM0NTk0fQ.OGcAZfeDxdwlTCAO7mjrqJEqI4yphcaXY4r0UepEIzo
SUPABASE_BUCKET=elas-uploads

# Groq API
GROQ_API_KEY=your_groq_api_key_here

# App Settings
SECRET_KEY=3c04ecde7af25c4b0d17304b1d48c474
ALLOWED_ORIGINS=http://localhost:3000
APP_ENV=development
```

### 6. Run Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```

**Backend will run at:** http://localhost:8000

**Test it:** http://localhost:8000/health (should return `{"status":"ok"}`)

---

## 🎨 Frontend Setup (Next.js)

### 1. Open NEW Terminal (keep backend running)

### 2. Navigate to Frontend
```bash
cd artie-dashboard/frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create `.env.local` File

Create `artie-dashboard/frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

### 5. Run Frontend Server
```bash
npm run dev
```

**Frontend will run at:** http://localhost:3000

---

## ✅ Verify Everything Works

1. **Backend Health Check:** http://localhost:8000/health
   - Should return: `{"status":"ok"}`

2. **Frontend:** http://localhost:3000
   - Should load the dashboard UI

3. **API Connection:** 
   - Try uploading a file in the frontend
   - Check if it connects to backend successfully

---

## 🔄 Development Workflow

### Making Changes

**Backend Changes:**
1. Edit files in `artie-dashboard/backend/app/`
2. Server auto-reloads (if using `--reload`)
3. Test at http://localhost:8000

**Frontend Changes:**
1. Edit files in `artie-dashboard/frontend/app/`
2. Next.js auto-reloads
3. View at http://localhost:3000

### Testing Changes Locally

```bash
# Test backend endpoint
curl http://localhost:8000/api/upload

# Or use browser/Postman
```

---

## 🚀 Deploy Changes to Production

### After Making Local Changes:

```bash
# 1. Stage your changes
git add .

# 2. Commit
git commit -m "Description of your changes"

# 3. Push to GitHub
git push origin main
```

**What Happens Next:**
- ✅ **Render (Backend):** Auto-deploys from GitHub (takes ~3-5 min)
- ✅ **Vercel (Frontend):** Auto-deploys from GitHub (takes ~1-2 min)

**No need to manually redeploy!** Both platforms watch your GitHub repo.

---

## 📦 Quick Start Script (Optional)

Create `start-dev.ps1` (Windows) or `start-dev.sh` (Mac/Linux):

**Windows (PowerShell):**
```powershell
# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd artie-dashboard/backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start frontend  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd artie-dashboard/frontend; npm run dev"
```

Then run:
```powershell
.\start-dev.ps1
```

---

## 🐛 Troubleshooting

### Backend Issues

**Import Errors?**
```bash
# Make sure virtual environment is activated
cd artie-dashboard/backend
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
```

**Port Already in Use?**
```bash
# Use different port
uvicorn app.main:app --reload --port 8001
```

**Database Connection Error?**
- Check `.env` file exists
- Verify `DATABASE_URL` is correct
- Test connection: https://neon.tech

### Frontend Issues

**Module Not Found?**
```bash
cd artie-dashboard/frontend
rm -rf node_modules package-lock.json
npm install
```

**API Not Connecting?**
- Check `.env.local` exists
- Verify backend is running (http://localhost:8000/health)
- Check `NEXT_PUBLIC_API_BASE=http://localhost:8000`

**Build Errors?**
```bash
npm run build  # Test build locally
```

---

## 📚 Project URLs

### Local Development
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Swagger UI)

### Production (Deployed)
- **Frontend:** https://your-app.vercel.app (after Vercel deployment)
- **Backend API:** https://elas-erp.onrender.com
- **API Health:** https://elas-erp.onrender.com/health

---

## 🎯 Common Development Tasks

### Add New API Endpoint (Backend)
1. Create route in `artie-dashboard/backend/app/api/endpoints/`
2. Add to `main.py`: `app.include_router(your_router, prefix="/api")`
3. Test at http://localhost:8000/api/your-endpoint

### Add New Page (Frontend)
1. Create folder in `artie-dashboard/frontend/app/your-page/`
2. Add `page.tsx` file
3. Access at http://localhost:3000/your-page

### Add New Component (Frontend)
1. Create in `artie-dashboard/frontend/components/YourComponent.tsx`
2. Import: `import YourComponent from '@/components/YourComponent'`

---

## 💡 Pro Tips

1. **Keep terminals open:** One for backend, one for frontend
2. **Use Git branches:** Create feature branches for big changes
3. **Test locally first:** Always test before pushing to production
4. **Check logs:** Backend terminal shows API errors, frontend shows React errors
5. **Hot reload works:** Both backend and frontend auto-reload on changes

---

## 🆘 Need Help?

- **Backend errors:** Check terminal running `uvicorn`
- **Frontend errors:** Check browser console (F12)
- **API issues:** Test with http://localhost:8000/docs
- **Database issues:** Check Neon dashboard
- **Deployment issues:** Check Render/Vercel logs

Happy coding! 🎉
