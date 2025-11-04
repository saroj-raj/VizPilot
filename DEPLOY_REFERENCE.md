# 🚀 Elas-ERP Deployment - Quick Reference Card

## 📦 What Was Created

### Configuration Files
- ✅ `elas-erp/backend/render.yaml` - Render deployment config
- ✅ `elas-erp/backend/.env.example` - Backend env template
- ✅ `elas-erp/frontend/.env.example` - Frontend env template

### Database & Storage
- ✅ `elas-erp/backend/app/db/init.sql` - PostgreSQL schema (5 tables)
- ✅ `elas-erp/backend/app/db/run_init.py` - Database initialization script
- ✅ `elas-erp/backend/app/services/storage_supabase.py` - File upload client

### Frontend Utilities
- ✅ `elas-erp/frontend/app/lib/api.ts` - API_BASE constant & utilities

### Documentation
- ✅ `DEPLOY.md` - Complete step-by-step guide (6 sections)
- ✅ `DEPLOY_CHECKLIST.md` - Quick checklist format
- ✅ `DEPLOYMENT_SUMMARY.md` - Technical details

---

## 🔧 Code Changes

### Backend
1. **config.py** - Added Supabase + CORS settings
2. **main.py** - CORS from env, added `/version` endpoint

### Frontend  
1. **upload/page.tsx** - Removed hardcoded localhost
2. **documents/page.tsx** - Removed hardcoded localhost (2 places)

---

## 🌐 Environment Variables

### Vercel (1 var)
```bash
NEXT_PUBLIC_API_BASE=https://elas-api.onrender.com
```

### Render (8 vars)
```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/elas_erp
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET=elas-uploads
GROQ_API_KEY=gsk_your_groq_api_key_here
SECRET_KEY=<python -c "import secrets; print(secrets.token_urlsafe(32))">
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:4000
APP_ENV=production
```

---

## 📋 Deployment Steps (35-40 min)

| Step | Task | Time | Output |
|------|------|------|--------|
| A | Create Neon database | 5 min | DATABASE_URL |
| B | Create Supabase storage | 5 min | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| C | Deploy backend (Render) | 15 min | Backend URL |
| D | Deploy frontend (Vercel) | 5 min | Frontend URL |
| E | Update CORS | 5 min | - |
| F | Smoke tests | 5 min | ✅ |

---

## 🔗 Your URLs

After deployment, you'll have:

```
Frontend:  https://elas-erp-<your-id>.vercel.app
Backend:   https://elas-api.onrender.com
Health:    https://elas-api.onrender.com/health
Version:   https://elas-api.onrender.com/version
API Docs:  https://elas-api.onrender.com/docs
```

---

## 🧪 Quick Tests

```bash
# Health check
curl https://elas-api.onrender.com/health
# → {"status":"ok","service":"Elas ERP Backend","version":"2.0"}

# Version check
curl https://elas-api.onrender.com/version
# → {"version":"2.0","env":"production"}

# CORS check
curl -i -X OPTIONS https://elas-api.onrender.com/api/upload \
  -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: POST"
# → Access-Control-Allow-Origin header present
```

---

## 💰 Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| Render | Free | $0 |
| Neon | Free | $0 |
| Supabase | Free | $0 |
| Groq | Free | $0 |
| **TOTAL** | | **$0/month** |

---

## ⚠️ Free-Tier Quirks

1. **Render Cold Start**: First request takes 20-30s after 15 min inactivity
2. **Supabase Auth**: Use `service_role` key (not `anon`) for uploads
3. **LLM Timeouts**: Set 10-12s timeout, always have fallback templates
4. **Neon Connections**: Limited connections, use pooling (already configured)

---

## 🆘 Common Issues

**Frontend can't reach backend?**
- Check `NEXT_PUBLIC_API_BASE` in Vercel
- Check `ALLOWED_ORIGINS` in Render
- Wait 30s for Render cold start

**Database connection failed?**
- Verify `postgresql://` format
- Check Neon database is active
- Test connection locally first

**Upload failing?**
- Verify `SUPABASE_SERVICE_ROLE_KEY` (not anon)
- Check bucket name matches `SUPABASE_BUCKET`
- Review Render logs for errors

---

## 📚 Documentation Files

- **DEPLOY.md** - Complete deployment guide
- **DEPLOY_CHECKLIST.md** - Step-by-step checklist
- **DEPLOYMENT_SUMMARY.md** - Technical summary

---

## ✅ Verification Checklist

- [ ] All 11 files created
- [ ] No hardcoded localhost in active code
- [ ] Environment variables documented
- [ ] Database schema ready (5 tables)
- [ ] Supabase storage client implemented
- [ ] CORS uses environment variable
- [ ] Health + version endpoints work
- [ ] Documentation complete

---

**Status**: ✅ Ready to Deploy
**Time to Live**: 35-40 minutes
**Monthly Cost**: $0

🚀 **Start here**: Read `DEPLOY.md` and follow steps A-F!
