# 🚀 Supabase Multi-Tenant Setup Guide

## Overview
This guide will walk you through setting up Supabase authentication and database for the Elas ERP multi-tenant system.

## Prerequisites
- Supabase account (free tier works fine)
- Basic understanding of PostgreSQL

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Organization**: Select or create one
   - **Name**: `elas-erp` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

---

## Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `backend/app/db/schema.sql` from this repository
4. Copy the **entire contents** and paste into the SQL Editor
5. Click **"Run"** (bottom right)
6. You should see success messages for all tables created

**What this creates:**
- ✅ `businesses` table (stores organization info)
- ✅ `users` table (extends Supabase auth with roles)
- ✅ `invitations` table (team invitation system)
- ✅ `uploaded_files` table (file tracking)
- ✅ `dashboards` table (user dashboard configs)
- ✅ `audit_logs` table (activity tracking)
- ✅ Row Level Security (RLS) policies for data isolation
- ✅ Indexes for performance
- ✅ Triggers for automatic timestamps

---

## Step 3: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. Find **"Email"** provider
3. Toggle **"Enable Email provider"** to ON
4. Settings:
   - ✅ **Confirm email**: ON (recommended for production)
   - ✅ **Secure email change**: ON
   - ✅ **Secure password change**: ON
5. Click **"Save"**

### Customize Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize these templates:
   - **Confirm signup**: Welcome email
   - **Invite user**: Team invitation email
   - **Magic link**: Passwordless login
   - **Change email address**: Email change confirmation
   - **Reset password**: Password reset email

**Variables available:**
- `{{ .ConfirmationURL }}` - Email confirmation link
- `{{ .Token }}` - Magic link token
- `{{ .SiteURL }}` - Your app URL
- `{{ .Email }}` - User's email

---

## Step 4: Get API Keys

1. Go to **Project Settings** → **API** (gear icon, left sidebar)
2. You'll see several keys:

### Copy These Values:

```bash
# Project URL
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon/Public Key (safe for frontend)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (KEEP SECRET! Backend only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT**: 
- **Anon Key**: Can be used in frontend (respects RLS policies)
- **Service Role Key**: Bypasses RLS - NEVER expose to frontend!

---

## Step 5: Update Backend Environment

1. In `backend/` folder, create `.env` file:
   ```bash
   cp .env.template .env
   ```

2. Edit `.env` and add your keys:
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   GROQ_API_KEY=your_groq_key_here
   FRONTEND_URL=http://localhost:4000
   ```

3. Save the file

---

## Step 6: Update Frontend Environment

1. In `frontend/` folder, edit `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. Save the file

---

## Step 7: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs:
- ✅ `supabase` - Python client library
- ✅ `python-jose` - JWT handling
- ✅ `passlib` - Password hashing
- ✅ Other dependencies

---

## Step 8: Test the Setup

### Start Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Test Signup
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@italian-restaurant.com",
    "password": "SecurePassword123!",
    "full_name": "Mario Rossi",
    "business_name": "Mario'\''s Italian Restaurant",
    "industry": "Food & Beverage",
    "size": "11-50 employees"
  }'
```

**Expected Response:**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "email": "owner@italian-restaurant.com"
  },
  "session": {
    "access_token": "eyJhbGci...",
    "refresh_token": "...",
    "expires_at": 1234567890
  },
  "business": {
    "id": "business-uuid",
    "name": "Mario's Italian Restaurant"
  }
}
```

---

## Step 9: Verify Database

1. Go to **Table Editor** in Supabase dashboard
2. Check tables:
   - **businesses**: Should have 1 row (your restaurant)
   - **users**: Should have 1 row (Mario as admin)
   - **invitations**: Empty for now

---

## Step 10: Test Invitation Flow

### 1. Invite a Team Member
```bash
curl -X POST http://localhost:8000/api/auth/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "email": "chef@italian-restaurant.com",
    "role": "employee"
  }'
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "invitation-uuid",
    "email": "chef@italian-restaurant.com",
    "role": "employee",
    "token": "abc123def456...",
    "expires_at": "2024-11-12T...",
    "invite_url": "http://localhost:4000/invite/abc123def456...",
    "business_name": "Mario's Italian Restaurant"
  }
}
```

### 2. Accept Invitation
Visit the `invite_url` or use:
```bash
curl -X POST http://localhost:8000/api/auth/invite/accept \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "email": "chef@italian-restaurant.com",
    "password": "ChefPassword123!",
    "full_name": "Giovanni Chef"
  }'
```

---

## Troubleshooting

### "Failed to create business"
- ✅ Check RLS policies are enabled
- ✅ Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- ✅ Check SQL schema ran successfully

### "Invalid or expired token"
- ✅ Token expires after 1 hour (Supabase default)
- ✅ Use refresh token to get new access token
- ✅ Check Authorization header format: `Bearer <token>`

### "User with this email already exists"
- ✅ Email already registered
- ✅ Use password reset to recover account
- ✅ Check `auth.users` table in Supabase

### RLS Policy Issues
- ✅ Make sure you ran the full schema.sql
- ✅ Check user has `business_id` set correctly
- ✅ Verify using service role key for admin operations

---

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files to git
   - Use `.env.local` for frontend (Next.js)
   - Keep service role key secret

2. **Row Level Security**:
   - All tables have RLS enabled
   - Users can only access their business's data
   - Admins have elevated permissions

3. **Password Requirements**:
   - Minimum 8 characters
   - Include uppercase, lowercase, number, special char
   - Enforce in frontend validation

4. **Invitation Expiry**:
   - Tokens expire after 7 days
   - Cancelled invitations can't be reused
   - One invitation per email per business

---

## Next Steps

✅ Supabase configured
✅ Database schema created
✅ Authentication working
✅ Invitation system ready

**Now you can**:
1. Integrate Supabase Auth in frontend
2. Add team management UI
3. Implement role-based data filtering
4. Setup email service (Resend)
5. Deploy to production

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## Support

If you encounter issues:
1. Check Supabase logs: **Logs & Analytics** in dashboard
2. Verify API keys are correct
3. Test with curl commands above
4. Check browser console for frontend errors

Happy building! 🚀
