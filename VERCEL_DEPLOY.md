# 🚀 Deploy Frontend to Vercel

## Quick Setup (5 minutes)

### 1. Go to Vercel
Visit: https://vercel.com/new

### 2. Import Your GitHub Repository
- Click **"Add New"** → **"Project"**
- Select **"Import Git Repository"**
- Choose: **`saroj-raj/Elas-ERP`**
- Click **"Import"**

### 3. Configure Project Settings

**Framework Preset:** Next.js ✅ (auto-detected)

**Root Directory:** 
```
artie-dashboard/frontend
```
⚠️ **Important:** Click **"Edit"** and set this!

**Build Command:** (leave default)
```
npm run build
```

**Output Directory:** (leave default)
```
.next
```

**Install Command:** (leave default)
```
npm install
```

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_BASE` | `https://elas-erp.onrender.com` |

### 5. Deploy!

Click **"Deploy"** button 🚀

---

## 📋 After Deployment

Once deployed (takes 2-3 minutes), you'll get a URL like:
```
https://your-project.vercel.app
```

### Test Your App:
1. Visit your Vercel URL
2. Try uploading a file
3. Check if it connects to the backend

---

## 🎉 Success!

You now have:
- ✅ **Backend:** https://elas-erp.onrender.com
- ✅ **Frontend:** https://your-project.vercel.app
- ✅ **Database:** Neon PostgreSQL
- ✅ **Storage:** Supabase
- ✅ **LLM:** Groq

**Total Cost: $0/month** 💰

---

## 🔧 Troubleshooting

### CORS Errors?
Backend already allows all origins (`allow_origins=["*"]`), so this should work!

### API Not Connecting?
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_BASE` is set correctly in Vercel
3. Test backend directly: https://elas-erp.onrender.com/health

### Need to Update Frontend?
1. Push changes to GitHub
2. Vercel auto-deploys on every push to `main` branch!

---

## 🎯 Next Steps (Optional)

1. **Custom Domain:** Add your own domain in Vercel settings
2. **Database Setup:** Run the init.sql script to create tables
3. **Authentication:** Set up user accounts
4. **Analytics:** Add Vercel Analytics (free!)

Enjoy your deployed app! 🎊
