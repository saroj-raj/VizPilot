# 🚀 Quick Deployment Checklist

Run through this checklist before deploying:

## ✅ Pre-Deployment Checks

### 1. Code Ready
```bash
cd elas-erp

# Check backend files exist
ls backend/render.yaml
ls backend/.env.example
ls backend/app/db/init.sql
ls backend/app/services/storage_supabase.py

# Check frontend files exist
ls frontend/.env.example
ls frontend/app/lib/api.ts
```

### 2. Git Status Clean
```bash
git status
# Should not have node_modules staged
# Should not have .env files committed
```

### 3. Environment Variables Prepared
Copy your credentials to a safe note:
- [ ] Groq API Key: `gsk_...`
- [ ] Generate SECRET_KEY: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] Will get from Neon: `DATABASE_URL`
- [ ] Will get from Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎯 Deployment Order

### Step A: Database (5 min)
- [ ] Create Neon project at neon.tech
- [ ] Copy DATABASE_URL
- [ ] Run: `python -m app.db.run_init` (from backend folder)
- [ ] Verify 5 tables created

### Step B: Storage (5 min)
- [ ] Create Supabase project at supabase.com
- [ ] Create bucket: `elas-uploads` (private)
- [ ] Copy SUPABASE_URL and service_role key

### Step C: Backend (15 min)
- [ ] Deploy to Render from GitHub
- [ ] Root directory: `elas-erp/backend`
- [ ] Set all 8 environment variables
- [ ] Test: `curl https://elas-api.onrender.com/health`
- [ ] Copy backend URL

### Step D: Frontend (5 min)
- [ ] Deploy to Vercel from GitHub
- [ ] Root directory: `elas-erp/frontend`
- [ ] Set: `NEXT_PUBLIC_API_BASE=<your-render-url>`
- [ ] Copy frontend URL

### Step E: Update CORS (5 min)
- [ ] Add Vercel URL to ALLOWED_ORIGINS in Render
- [ ] Redeploy backend
- [ ] Test: Open frontend, try upload

---

## 🧪 Smoke Tests

After deployment, run these tests:

### Health Check
```bash
curl -s https://elas-api.onrender.com/health
# Expected: {"status":"ok","service":"Elas ERP Backend","version":"2.0"}
```

### Version Check
```bash
curl -s https://elas-api.onrender.com/version
# Expected: {"version":"2.0","env":"production"}
```

### CORS Check
```bash
curl -i -X OPTIONS https://elas-api.onrender.com/api/upload \
  -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: POST"
# Expected: Access-Control-Allow-Origin header present
```

### Frontend Check
- [ ] Open frontend URL
- [ ] Check browser console (F12) - no errors
- [ ] Click "Login" - page loads
- [ ] Try onboarding flow

---

## 📝 Your Deployment Info

Fill this in as you deploy:

```
DATABASE_URL: postgresql://_______________
SUPABASE_URL: https://_____.supabase.co
SUPABASE_BUCKET: elas-uploads
GROQ_API_KEY: gsk__________________
SECRET_KEY: _____________________

Backend URL: https://elas-api.onrender.com (or your custom)
Frontend URL: https://elas-erp-_____.vercel.app

ALLOWED_ORIGINS: https://elas-erp-_____.vercel.app,http://localhost:4000
```

---

## 🆘 Quick Troubleshooting

**Backend not responding?**
- Wait 30s (Render cold start)
- Check Render logs
- Verify env vars set

**Frontend can't reach backend?**
- Check NEXT_PUBLIC_API_BASE is set
- Check ALLOWED_ORIGINS includes Vercel URL
- Open browser console for errors

**Database connection failed?**
- Verify DATABASE_URL format: `postgresql://...`
- Check Neon dashboard - database active?

**Upload failing?**
- Check SUPABASE_SERVICE_ROLE_KEY (not anon key)
- Verify bucket name matches SUPABASE_BUCKET
- Check Render logs for error details

---

## ✅ Success!

When everything works:
- [ ] Health check returns OK
- [ ] Frontend loads without errors
- [ ] Can navigate between pages
- [ ] File upload works (even if just metadata)

**Share your URLs**:
- Frontend: `https://elas-erp-_____.vercel.app`
- Backend: `https://elas-api.onrender.com/health`

---

**Total deployment time**: 35-40 minutes
**Total cost**: $0/month

🎉 **You're live on 100% free tiers!**
