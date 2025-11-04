# 🚀 Render Setup - Quick Reference

## Step 1: Delete Old Service
1. Scroll to bottom of current service page
2. Click RED "Delete Web Service" button
3. Type: `Elas-ERP` to confirm

## Step 2: Create New Service
1. Dashboard → **New +** → **Web Service**
2. Connect repository: `saroj-raj/Elas-ERP`

## Step 3: Configuration
```
Name: Elas-ERP
Region: Oregon (US West)
Branch: main
Root Directory: elas-erp/backend
Environment: Python 3  ⚠️ NOT Docker!
Build Command: pip install -r requirements.txt
Start Command:  
Instance Type: Free
```

## Step 4: Environment Variables (8 total)

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_Wfo1l9xTspMD@ep-fragrant-cloud-ah6fw03c-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. SUPABASE_URL
```
https://eovphecoexvbsofifyty.supabase.co
```

### 3. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvdnBoZWNvZXh2YnNvZmlmeXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjA1ODU5NCwiZXhwIjoyMDc3NjM0NTk0fQ.OGcAZfeDxdwlTCAO7mjrqJEqI4yphcaXY4r0UepEIzo
```

### 4. SUPABASE_BUCKET
```
elas-uploads
```

### 5. GROQ_API_KEY
```
YOUR_GROQ_API_KEY_HERE
```
<!-- Get your key from https://console.groq.com/ -->

### 6. SECRET_KEY
```
3c04ecde7af25c4b0d17304b1d48c474
```

### 7. ALLOWED_ORIGINS
```
http://localhost:4000
```

### 8. APP_ENV
```
production
```

## Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes
3. Watch logs for success messages

## Expected Logs ✅
```
Collecting fastapi==0.115.4
Installing collected packages: fastapi, uvicorn...
Successfully installed...
INFO: Application startup complete
```

## Test URL
Once deployed, test:
```
https://elas-erp.onrender.com/health
```

Expected response:
```json
{"status":"ok","service":"Elas ERP Backend","version":"2.0"}
```

---

## 🎯 Next Steps After Backend Works
1. Deploy frontend to Vercel (see DEPLOY.md Section D)
2. Update ALLOWED_ORIGINS with Vercel URL
3. Test full stack

---

**Current Status**: Waiting for deployment...
