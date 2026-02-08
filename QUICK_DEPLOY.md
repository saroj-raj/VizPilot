# 🚀 Quick Deployment - Elas ERP

## ⚡ 5-Minute Deploy

### 1️⃣ Backend (Render) - 2 min

1. Go to: https://dashboard.render.com
2. Find service: `elas-api`
3. Add these env vars in **Environment** tab:

```env
SUPABASE_URL=https://nkohcnqkjjsjludqmkjz.supabase.co
SUPABASE_ANON_KEY=<get-from-backend/.env>
SUPABASE_SERVICE_ROLE_KEY=<get-from-backend/.env>
GROQ_API_KEY=<get-from-backend/.env>
```

4. Click **"Manual Deploy"** → **"Deploy latest commit"**
5. Wait for ✅ "Live"

### 2️⃣ Frontend (Vercel) - 3 min

1. Go to: https://vercel.com/new
2. Import: `saroj-raj/Elas-ERP`
3. Root Directory: `elas-erp/frontend`
4. Add env vars:

```env
NEXT_PUBLIC_API_BASE=https://elas-api.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://nkohcnqkjjsjludqmkjz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get-from-frontend/.env.local>
```

5. Click **"Deploy"**
6. Copy your URL: `https://[your-app].vercel.app`

### 3️⃣ Update CORS - 30 sec

1. Back to Render dashboard
2. Update `CORS_ORIGINS` to: `https://[your-app].vercel.app,http://localhost:4000`
3. Update `FRONTEND_URL` to: `https://[your-app].vercel.app`
4. Auto-redeploys

### 4️⃣ Configure Supabase - 30 sec

1. Go to: https://supabase.com/dashboard/project/nkohcnqkjjsjludqmkjz
2. **Authentication** → **URL Configuration**
3. Add Redirect URL: `https://[your-app].vercel.app/**`
4. Save

---

## ✅ Test It

1. Open: `https://[your-app].vercel.app/signup`
2. Create account
3. Should redirect to dashboard
4. ✅ Done!

---

## 🐛 Quick Fixes

**502 Error?**
- Wait 30 seconds (backend waking up)

**CORS Error?**
- Check step 3 above
- Clear browser cache

**Can't login?**
- Check step 4 above
- Verify Supabase env vars

---

**Full Guide:** See `DEPLOYMENT_GUIDE.md`
