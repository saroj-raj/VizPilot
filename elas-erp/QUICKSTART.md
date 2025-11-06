# Quick Start Guide (Updated)

## 🚀 Running Elas ERP

### Prerequisites
- Python 3.11+ installed
- Virtual environment at `../.venv` (in parent Elas-ERP directory)

### Start Everything (Easiest Method)
```powershell
# From elas-erp directory
python main.py
```

This will:
- ✅ Start the backend API at http://127.0.0.1:8000
- ✅ Open your browser automatically
- ⚠️ Ask you to start frontend manually if npm not found

### Backend Only

**Option 1: Using the launcher**
```powershell
python main.py
```

**Option 2: Manual start**
```powershell
# Activate virtual environment (from parent directory)
cd ..
.\.venv\Scripts\Activate.ps1
cd elas-erp

# Start backend
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Option 3: Direct command (no activation needed)**
```powershell
# From elas-erp directory
..\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (After Installing Node.js)
```powershell
cd frontend
npm install
npm run dev
```

### Access Points
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health
- **Frontend** (if running): http://localhost:3000

### Environment Setup
Ensure `backend/.env` exists with your Groq API key:
```env
GROQ_API_KEY=your_actual_key_here
APP_NAME=Elas ERP
DEBUG=true
```

### Testing the API
```powershell
# Health check
Invoke-RestMethod http://127.0.0.1:8000/health

# Open API docs in browser
start http://127.0.0.1:8000/docs
```

### Common Tasks

**Install new Python package:**
```powershell
cd ..
.\.venv\Scripts\Activate.ps1
cd elas-erp
pip install package_name
pip freeze > backend/requirements.txt
```

**Update dependencies:**
```powershell
cd ..
.\.venv\Scripts\Activate.ps1
cd elas-erp
pip install -r backend/requirements.txt --upgrade
```

**Check Python version:**
```powershell
..\.venv\Scripts\python.exe --version
```

### Troubleshooting

**"ModuleNotFoundError"**
- Ensure you're using the venv Python: `..\.venv\Scripts\python.exe`
- Or activate from parent: `cd .. && .\.venv\Scripts\Activate.ps1 && cd elas-erp`

**"Cannot find path"**
- Make sure you're in the `elas-erp` directory
- Use `pwd` to check current directory
- Virtual environment is in parent directory: `Elas-ERP\.venv`

**Backend won't start**
- Check `backend/.env` has `GROQ_API_KEY`
- Verify venv exists: `Test-Path ..\.venv\Scripts\python.exe`
- Check for port conflicts: `netstat -ano | findstr :8000`

**Frontend won't start**
- Install Node.js 20+ from nodejs.org
- Run `npm install` in frontend directory
- Check `frontend/.env.local` has correct API URL

### File Structure
```
Elas-ERP/
├── .venv/                    ← Virtual environment (PARENT DIRECTORY)
└── elas-erp/
    ├── main.py               ← Launcher script
    ├── backend/
    │   ├── .env              ← Your API keys here
    │   ├── app/
    │   │   ├── main.py
    │   │   ├── api/
    │   │   ├── core/
    │   │   └── services/
    │   └── requirements.txt
    └── frontend/
        ├── package.json
        └── app/
```

---

**Last Updated:** October 23, 2025  
**Virtual Environment:** `../.venv` (in parent Elas-ERP directory)
**Benefits:** Easy to zip elas-erp without large .venv folder
