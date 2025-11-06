# Elas ERP Deployment Guide

## ✅ Prerequisites Completed
- ✅ Code pushed to GitHub (latest commit: Phase C Frontend Integration)
- ✅ Backend configured with Supabase authentication
- ✅ Frontend integrated with Supabase auth
- ✅ Build tested successfully

---

## 🚀 Deployment Steps

### 1. Backend Deployment (Render)

#### A. Update Existing Render Service

1. **Go to [render.com](https://render.com) Dashboard**
   - Sign in to your account
   - Find your existing `elas-api` service

2. **Configure Environment Variables**
   
   Go to **Environment** tab and add/update these variables:

   ```env
   # Supabase (CRITICAL - Required for authentication)
   SUPABASE_URL=https://nkohcnqkjjsjludqmkjz.supabase.co
   SUPABASE_ANON_KEY=<your-supabase-anon-key-from-local-env>
   SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key-from-local-env>

   # Groq AI (Optional - for AI features)
   GROQ_API_KEY=<your-groq-api-key-from-local-env>

   # Database (if using Supabase PostgreSQL)
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.nkohcnqkjjsjludqmkjz.supabase.co:5432/postgres
   ```

   **Note:** Other variables are auto-configured via `render.yaml`

3. **Trigger Manual Deploy**
   - Go to **Manual Deploy** → **Deploy latest commit**
   - Wait 3-5 minutes for build to complete
   - Check logs for "Uvicorn running on http://0.0.0.0:$PORT"

4. **Verify Backend is Live**
   
   Once deployed, test these endpoints:
   
   ```bash
   # Health check
   curl https://elas-api.onrender.com/health
   # Should return: {"status":"healthy"}

   # Version check
   curl https://elas-api.onrender.com
   # Should return: {"message":"Elas ERP API","version":"1.0.0"}

   # Auth endpoint check
   curl https://elas-api.onrender.com/api/auth/me
   # Should return: 401 Unauthorized (expected - not logged in)
   ```

   ✅ **Backend URL:** `https://elas-api.onrender.com`

---

### 2. Frontend Deployment (Vercel)

#### A. Prepare Frontend Environment

1. **Update Frontend Environment Variables**
   
   Your frontend needs these environment variables on Vercel:

   ```env
   # Backend API
   NEXT_PUBLIC_API_BASE=https://elas-api.onrender.com

   # Supabase (CRITICAL - Required for authentication)
   NEXT_PUBLIC_SUPABASE_URL=https://nkohcnqkjjsjludqmkjz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key-from-local-env>
   ```

#### B. Deploy to Vercel

**Option 1: Via Vercel Dashboard (Recommended)**

1. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub

2. **Import Your Repository**
   - Click **"Add New..."** → **Project**
   - Select `saroj-raj/Elas-ERP`
   - Click **Import**

3. **Configure Project**
   - **Framework Preset:** Next.js
   - **Root Directory:** `elas-erp/frontend`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Add Environment Variables**
   - Click **"Environment Variables"**
   - Add all 3 variables from above
   - Check "Production", "Preview", "Development"

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Copy your deployment URL (e.g., `https://elas-erp.vercel.app`)

**Option 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd elas-erp/frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to configure project
```

6. **Verify Frontend is Live**
   
   Visit your Vercel URL:
   - Homepage: `https://elas-erp.vercel.app`
   - Login: `https://elas-erp.vercel.app/login`
   - Signup: `https://elas-erp.vercel.app/signup`

   ✅ **Frontend URL:** `https://elas-erp.vercel.app`

---

### 3. Update CORS Settings

**CRITICAL:** Update backend CORS to allow your Vercel frontend:

1. **On Render Dashboard**
   - Go to your `elas-api` service
   - Go to **Environment** tab
   - Update `CORS_ORIGINS` to:
     ```
     https://elas-erp.vercel.app,http://localhost:4000
     ```
   - Update `FRONTEND_URL` to:
     ```
     https://elas-erp.vercel.app
     ```
   - Click **"Save Changes"**
   - Service will auto-redeploy

---

### 4. Configure Supabase Authentication

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
   - Select your `elas-erp-storage` project

2. **Add Authorized URLs**
   - Go to **Authentication** → **URL Configuration**
   - Add to **Site URL:** `https://elas-erp.vercel.app`
   - Add to **Redirect URLs:**
     - `https://elas-erp.vercel.app/**`
     - `http://localhost:4000/**` (for local dev)
   - Click **Save**

3. **Verify Email Settings**
   - Go to **Authentication** → **Email Templates**
   - Ensure templates reference your production URL
   - Update if needed: Change `{{ .SiteURL }}` to your Vercel URL

---

## 🧪 Testing Deployment

### 1. Test Signup Flow
1. Go to `https://elas-erp.vercel.app/signup`
2. Fill in:
   - Full Name: Test User
   - Business Name: Test Company
   - Email: test@example.com
   - Password: Test123456
3. Click **Create Account**
4. Should redirect to `/dashboard/admin`

### 2. Test Login Flow
1. Go to `https://elas-erp.vercel.app/login`
2. Login with credentials from step 1
3. Should redirect to dashboard

### 3. Test Route Protection
1. While logged out, try visiting:
   - `https://elas-erp.vercel.app/dashboard/admin`
2. Should redirect to `/login`

### 4. Test Logout
1. Click user switcher (top right)
2. Click **Logout**
3. Should redirect to `/login`
4. Try accessing dashboard - should redirect to login

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: 502 Bad Gateway**
- **Cause:** Backend is sleeping (Render free tier)
- **Fix:** Wait 30-60 seconds, refresh page
- **Prevention:** Upgrade to paid plan ($7/month)

**Problem: "Failed to fetch" in frontend**
- **Cause:** CORS not configured
- **Fix:** 
  1. Check `CORS_ORIGINS` on Render includes your Vercel URL
  2. Redeploy backend
  3. Clear browser cache

**Problem: 401 Unauthorized**
- **Cause:** Supabase credentials missing/incorrect
- **Fix:**
  1. Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` on Render
  2. Check values match your Supabase project
  3. Redeploy

### Frontend Issues

**Problem: "Invalid Supabase URL"**
- **Cause:** Environment variables not set on Vercel
- **Fix:**
  1. Go to Vercel project settings
  2. Environment Variables tab
  3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  4. Redeploy from dashboard

**Problem: "Network Error" when signing up/logging in**
- **Cause:** Backend URL incorrect
- **Fix:**
  1. Check `NEXT_PUBLIC_API_BASE` on Vercel
  2. Should be `https://elas-api.onrender.com` (no trailing slash)
  3. Redeploy

**Problem: Signup succeeds but can't login**
- **Cause:** Supabase auth not configured
- **Fix:**
  1. Check Supabase **Authentication** → **Providers**
  2. Enable "Email" provider
  3. Add Vercel URL to authorized URLs

### Supabase Issues

**Problem: "Email rate limit exceeded"**
- **Cause:** Too many signup attempts
- **Fix:** Wait 1 hour or verify email in Supabase dashboard manually

**Problem: "Invalid JWT token"**
- **Cause:** Mismatched Supabase keys
- **Fix:**
  1. Go to Supabase **Settings** → **API**
  2. Copy fresh `anon` and `service_role` keys
  3. Update on both Render and Vercel
  4. Redeploy both

---

## 📋 Deployment Checklist

- [ ] Backend deployed on Render
  - [ ] Environment variables configured
  - [ ] Health endpoint responding
  - [ ] Auth endpoints accessible
- [ ] Frontend deployed on Vercel
  - [ ] Environment variables configured
  - [ ] Build successful
  - [ ] Pages loading correctly
- [ ] CORS configured
  - [ ] Vercel URL added to CORS_ORIGINS on Render
  - [ ] Backend redeployed
- [ ] Supabase configured
  - [ ] Vercel URL added to authorized URLs
  - [ ] Email provider enabled
  - [ ] Database tables exist (6 tables with RLS)
- [ ] End-to-end testing complete
  - [ ] Signup works
  - [ ] Login works
  - [ ] Route protection works
  - [ ] Logout works

---

## 🎯 Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Vercel: Add custom domain in project settings
   - Render: Add custom domain in service settings
   - Update Supabase authorized URLs

2. **Enable email confirmations** (recommended)
   - Supabase → Authentication → Email Auth
   - Enable "Confirm Email"
   - Configure SMTP settings

3. **Monitor logs**
   - Render: Check logs for errors
   - Vercel: Check deployment logs
   - Supabase: Check SQL logs

4. **Set up error tracking** (recommended)
   - Add Sentry or similar
   - Track frontend and backend errors

5. **Backup database** (recommended)
   - Supabase has automatic backups
   - Download manual backup from dashboard

---

## 🔗 Quick Links

### Your Deployed Apps
- **Frontend:** https://elas-erp.vercel.app (Update after Vercel deployment)
- **Backend:** https://elas-api.onrender.com (Update with your Render URL)
- **Supabase:** https://supabase.com/dashboard/project/nkohcnqkjjsjludqmkjz

### Dashboards
- **Render:** https://dashboard.render.com
- **Vercel:** https://vercel.com/dashboard
- **Supabase:** https://supabase.com/dashboard

### Documentation
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

## 🆘 Support

If you encounter issues:

1. **Check logs:**
   - Render: Service logs tab
   - Vercel: Deployment logs
   - Browser: Console (F12)

2. **Verify environment variables:**
   - All `SUPABASE_*` variables set correctly
   - `NEXT_PUBLIC_API_BASE` points to Render URL
   - `CORS_ORIGINS` includes Vercel URL

3. **Test locally first:**
   ```bash
   # Backend
   cd elas-erp/backend
   uvicorn app.main:app --reload

   # Frontend
   cd elas-erp/frontend
   npm run dev
   ```

4. **Check service status:**
   - Render status page
   - Vercel status page
   - Supabase status page

---

**Last Updated:** November 6, 2025
**Version:** Phase C Complete - Multi-tenant with Supabase Auth
