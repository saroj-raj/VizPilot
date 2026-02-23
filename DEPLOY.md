# 🚀 Elas-ERP Deployment Guide - 100% Free Tier

This guide walks you through deploying Elas-ERP on completely free hosting tiers.

## 📋 Stack Overview

- **Frontend**: Vercel (Hobby - Free)
- **Backend API**: Render Free Web Service
- **Database**: Neon Postgres Free (or Supabase Postgres)
- **Object Storage**: Supabase Storage Free (1GB)
- **LLM**: Groq (Free tier with your API key)

**Total Monthly Cost**: $0 🎉

---

## ⚙️ Environment Variables Reference

### Frontend (Vercel)

```bash
NEXT_PUBLIC_API_BASE=https://elas-api.onrender.com
```

### Backend (Render)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/elas_erp

# Supabase Storage
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
SUPABASE_BUCKET=elas-uploads

# LLM
GROQ_API_KEY=gsk_your_groq_api_key_here

# Security
SECRET_KEY=your-random-32-character-secret-key
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:4000

# Application
APP_ENV=production
```

---

## 📝 Deployment Steps (30-40 minutes)

### A. Create Neon Database (5 min)

1. **Sign up at [neon.tech](https://neon.tech)**
   - Use GitHub or email
   - Select free tier (no credit card needed)

2. **Create a new project**
   - Name: `elas-erp`
   - Region: Choose closest to your users
   - PostgreSQL version: 15 or 16

3. **Copy your connection string**
   - Go to Dashboard → Connection Details
   - Copy the connection string (looks like):
     ```
     postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech:5432/elas_erp
     ```
   - Save this as `DATABASE_URL` for later

4. **Initialize the database**
   
   **Option 1: Using the Python script (recommended)**
   ```bash
   # Set environment variable
   export DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/elas_erp"
   # Windows PowerShell:
   # $env:DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/elas_erp"
   
   # Run init script
   cd elas-erp/backend
   python -m app.db.run_init
   ```
   
   **Option 2: Using psql or Neon SQL Editor**
   - Open Neon's SQL Editor in the dashboard
   - Copy the contents of `elas-erp/backend/app/db/init.sql`
   - Paste and execute

5. **Verify tables were created**
   - In Neon dashboard, go to Tables
   - Should see: `users`, `datasets`, `dataset_profiles`, `dashboards`, `widgets`

---

### B. Create Supabase Project (5 min)

1. **Sign up at [supabase.com](https://supabase.com)**
   - Use GitHub or email
   - Free tier: 500MB database + 1GB storage

2. **Create a new project**
   - Name: `elas-erp-storage`
   - Database Password: Generate a strong password
   - Region: Choose same as Neon for lower latency

3. **Create storage bucket**
   - Go to Storage → Buckets
   - Click "New Bucket"
   - Name: `elas-uploads`
   - Public: **OFF** (keep private)
   - Click "Create Bucket"

4. **Get your credentials**
   - Go to Settings → API
   - Copy:
     - `URL` (e.g., `https://xxxxx.supabase.co`)
     - `service_role` key (under "Service role")
   - **Important**: Use `service_role`, NOT `anon` key (anon won't work for uploads)

---

### C. Deploy Backend on Render (15 min)

1. **Sign up at [render.com](https://render.com)**
   - Use GitHub account (easiest)
   - Free tier: 750 hours/month, sleeps after 15 min inactivity

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `Elas-ERP` repository

3. **Configure the service**
   ```
   Name: elas-api
   Region: Oregon (US-West) - or closest to you
   Branch: main
   Root Directory: elas-erp/backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Set environment variables**
   - Click "Environment" tab
   - Add each variable (click "Add Environment Variable"):
   
   ```
   DATABASE_URL=<your-neon-connection-string>
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   SUPABASE_BUCKET=elas-uploads
   GROQ_API_KEY=<your-groq-api-key>
   SECRET_KEY=<generate-with-python-secrets-below>
   ALLOWED_ORIGINS=http://localhost:4000
   APP_ENV=production
   ```
   
   **Generate SECRET_KEY**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Watch the logs for any errors

6. **Get your backend URL**
   - Once deployed, copy the URL (e.g., `https://vizpilot-api.onrender.com`)
   - Test health check:
     ```bash
     curl https://elas-api.onrender.com/health
   # Should return: {"status":"ok","service":"VizPilot Backend","version":"2.0"}
     
     curl https://elas-api.onrender.com/version
     # Should return: {"version":"2.0","env":"production"}
     ```

---

### D. Deploy Frontend on Vercel (5 min)

1. **Sign up at [vercel.com](https://vercel.com)**
   - Use GitHub account
   - Free tier: Unlimited deployments, 100GB bandwidth

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your `Elas-ERP` repository
   - Vercel will auto-detect Next.js

3. **Configure the project**
   ```
   Framework Preset: Next.js
   Root Directory: elas-erp/frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Set environment variable**
   - In "Environment Variables" section:
     ```
     NEXT_PUBLIC_API_BASE=https://elas-api.onrender.com
     ```
   - Replace with YOUR Render backend URL
   - Add for: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Vercel will give you a URL like: `https://elas-erp-xxx.vercel.app`

6. **Copy your Vercel URL**

---

### E. Update Backend CORS (5 min)

Now that you have your Vercel URL, update the backend to allow requests from it:

1. **Go back to Render dashboard**
   - Open your `elas-api` service
   - Go to "Environment" tab

2. **Update ALLOWED_ORIGINS**
   - Find the `ALLOWED_ORIGINS` variable
   - Update to include your Vercel URL:
     ```
     https://elas-erp-xxx.vercel.app,http://localhost:4000
     ```
   - Click "Save Changes"

3. **Trigger a redeploy**
   - Render will automatically redeploy
   - Wait 2-3 minutes
   - Or manually: Click "Manual Deploy" → "Deploy latest commit"

---

### F. Final Smoke Tests (5 min)

1. **Test backend health**
   ```bash
   curl -s https://vizpilot-api.onrender.com/health
   # Expected: {"status":"ok","service":"VizPilot Backend","version":"2.0"}
   ```

2. **Test CORS preflight**
    ```bash
    curl -i -X OPTIONS https://vizpilot-api.onrender.com/api/upload \
       -H "Origin: https://vizpilot-xxx.vercel.app" \
       -H "Access-Control-Request-Method: POST"
    # Expected: Access-Control-Allow-Origin header present
    ```

3. **Test frontend**
   - Open your Vercel URL: `https://vizpilot-xxx.vercel.app`
   - Should see the landing page
   - Click "Login" - should load (even if no users yet)
   - Try the onboarding flow

4. **Test file upload (optional)**
   - Create a tiny CSV file:
     ```csv
     date,amount
     2024-01-01,1000
     2024-01-02,1500
     ```
   - Use curl to test upload:
     ```bash
     curl -F "file=@test.csv" \
          -F "domain=finance" \
          -F "intent=revenue analysis" \
          https://elas-api.onrender.com/api/upload-simple
     ```
   - Should return JSON with widgets and preview

---

## ⚠️ Known Free-Tier Quirks

### 1. Render Cold Starts (15-30 seconds)
**Problem**: Render free tier sleeps after 15 min of inactivity. First request wakes it up (slow).

**Mitigation**:
- In your frontend, show a "Waking backend..." message on first load
- Example code in `elas-erp/frontend/app/lib/api.ts`:
  ```typescript
  if (isLoading && error?.message?.includes('timeout')) {
    return <div>Backend waking up... (first request may take 30s)</div>;
  }
  ```

### 2. Supabase Storage Permissions
**Problem**: Storage requires `service_role` key on server-side only.

**Solution**:
- NEVER expose `service_role` key in frontend
- All uploads go through backend API
- Backend uses Supabase client with service key

### 3. LLM Timeouts
**Problem**: Groq API can be slow (5-10s) or hit rate limits.

**Mitigation**:
- Set timeout to 10-12s
- Always have fallback to deterministic chart templates
- Already implemented in `upload_simple.py` fallback logic

### 4. Database Connection Limits
**Problem**: Neon free tier has connection limit.

**Solution**:
- Use connection pooling (already in SQLAlchemy)
- Close connections properly (FastAPI handles this)

---

## 🎉 Success Checklist

- [ ] Neon database created and initialized (5 tables)
- [ ] Supabase storage bucket `elas-uploads` created
- [ ] Backend deployed on Render
  - [ ] Health check returns `{"status":"ok"}`
  - [ ] Version endpoint returns `{"version":"2.0"}`
  - [ ] Environment variables all set
- [ ] Frontend deployed on Vercel
  - [ ] Landing page loads
  - [ ] No console errors about API_BASE
- [ ] CORS configured correctly
  - [ ] Backend ALLOWED_ORIGINS includes Vercel URL
  - [ ] Preflight requests succeed
- [ ] Upload test passes (optional)

---

## 🔗 Your Deployment URLs

After completing these steps, you'll have:

```
Frontend:  https://elas-erp-xxx.vercel.app
Backend:   https://elas-api.onrender.com
Health:    https://elas-api.onrender.com/health
Version:   https://elas-api.onrender.com/version
API Docs:  https://elas-api.onrender.com/docs
```

---

## 🐛 Troubleshooting

### Frontend can't reach backend

**Check**:
1. `NEXT_PUBLIC_API_BASE` is set in Vercel env vars
2. Backend `ALLOWED_ORIGINS` includes your Vercel URL
3. Backend is awake (visit `/health` first)

**Debug**:
- Open browser console (F12) → Network tab
- Look for CORS errors
- Check if API requests have correct base URL

### Database connection failed

**Check**:
1. `DATABASE_URL` is correctly formatted (PostgreSQL, not SQLite)
2. Neon database is not paused (free tier pauses after inactivity)
3. Connection string includes password

**Debug**:
- Check Render logs for connection errors
- Verify Neon database is "Active" in dashboard

### Supabase upload failed

**Check**:
1. Using `service_role` key, not `anon` key
2. Bucket name matches `SUPABASE_BUCKET` env var
3. Bucket exists in Supabase Storage dashboard

**Debug**:
- Check Render logs for Supabase API errors
- Verify bucket is private (not public)

### Backend build failed on Render

**Check**:
1. `requirements.txt` is in `elas-erp/backend/` folder
2. Python 3 is selected as runtime
3. Root directory is set to `elas-erp/backend`

**Debug**:
- Read build logs carefully
- Common issue: `psycopg2-binary` might need `libpq-dev` (Render handles this)

---

## 📚 Additional Resources

- [Neon Docs](https://neon.tech/docs/introduction)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Groq API Docs](https://console.groq.com/docs)

---

**Questions?** Check the logs first:
- Render logs: Dashboard → Service → Logs
- Vercel logs: Dashboard → Deployments → [Latest] → Build Logs
- Browser console: F12 → Console tab

**Need help?** Include:
- Error message from logs
- Which step you're on
- Deployment URLs (redact any secrets!)
