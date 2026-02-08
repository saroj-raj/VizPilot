# 🐛 Debug Guide: Current Issues

## Issue 1: Switch User Not Working

### Problem
The "Switch User" dropdown appears but clicking on different roles doesn't navigate to the respective dashboards.

### Root Cause Analysis
1. **Middleware is DISABLED** - The middleware that handles route protection is currently disabled
2. **Client-side navigation** - Using `router.push()` which may be blocked or not working
3. **No error in console** - Silent failure suggests middleware or routing issue

### Quick Fixes

#### Fix 1: Check Browser Console
Open browser console (F12) and look for:
- Navigation errors
- Route protection warnings
- JavaScript errors when clicking roles

#### Fix 2: Re-enable Middleware (RECOMMENDED)
Current state in `frontend/middleware.ts`:
```typescript
export function middleware(request: NextRequest) {
  console.log('Middleware: Disabled, allowing all requests through')
  return NextResponse.next()
  /* ... commented out code */
}
```

**What to do:**
1. Go to Render dashboard: https://dashboard.render.com
2. Navigate to your frontend service (Vercel)
3. Check environment variables - ensure Supabase credentials are correct
4. Re-enable middleware with proper cookie detection

#### Fix 3: Test Switch User Directly
Try navigating manually:
- https://elas-erp.vercel.app/dashboard/admin
- https://elas-erp.vercel.app/dashboard/manager
- https://elas-erp.vercel.app/dashboard/employee
- https://elas-erp.vercel.app/dashboard/finance

If manual navigation works, the issue is in the `UserSwitcher` component.

### Code Location
- **Component**: `frontend/app/components/UserSwitcher.tsx`
- **Handler**: Line 116 - `handleSwitchUser` function
- **Navigation**: Line 121 - `router.push(\`/dashboard/\${user.role}\`)`

### Temporary Debug Fix
Add console logging to see what's happening:

```typescript
const handleSwitchUser = (user: User) => {
  console.log('🔄 Attempting to switch to:', user.role);
  setCurrentUser(user);
  setIsOpen(false);
  
  const targetPath = `/dashboard/${user.role}`;
  console.log('📍 Navigating to:', targetPath);
  router.push(targetPath);
  
  // Add a fallback
  setTimeout(() => {
    if (window.location.pathname !== targetPath) {
      console.warn('⚠️ Navigation failed, using window.location');
      window.location.href = targetPath;
    }
  }, 500);
};
```

---

## Issue 2: Groq Returning "Fallback mode - no Groq response"

### Problem
AI-powered chart proposals are not working. Backend returns fallback widgets instead of AI-generated ones.

### Root Cause Analysis

The fallback message comes from `backend/app/services/llm_service.py` line 144:
```python
return fallback_widgets, groq_input_data, groq_response_text or "Fallback mode - no Groq response"
```

This happens when:
1. **Groq API call fails** (exception caught at line 128)
2. **JSON parsing fails** (exception at line 118)
3. **API key is missing/invalid**
4. **Rate limit exceeded**
5. **Network timeout**

### Diagnostic Steps

#### Step 1: Check Render Environment Variables
1. Go to https://dashboard.render.com
2. Select your backend service (elas-erp)
3. Go to "Environment" tab
4. Verify `GROQ_API_KEY` is set and starts with `gsk_`

#### Step 2: Check Render Logs
1. In Render dashboard, go to "Logs" tab
2. Look for entries with:
   - `❌ Groq API call failed:`
   - `❌ JSON parse error:`
   - `⚠️ Using fallback widget generation`
3. This will show the exact error

#### Step 3: Test Groq API Key Locally
Run this PowerShell script:
```powershell
# Get your Groq API key from Render
$apiKey = "YOUR_GROQ_API_KEY_HERE"

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$body = @{
    model = "llama-3.3-70b-versatile"
    messages = @(
        @{
            role = "user"
            content = "Say hello"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod `
        -Uri 'https://api.groq.com/openai/v1/chat/completions' `
        -Method Post `
        -Headers $headers `
        -Body $body
    
    Write-Host "✅ Groq API is working!" -ForegroundColor Green
    Write-Host $response.choices[0].message.content
} catch {
    Write-Host "❌ Groq API failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
```

#### Step 4: Check Groq Console
1. Go to https://console.groq.com
2. Check API key is active
3. Check usage/quota limits
4. Verify model `llama-3.3-70b-versatile` is available

### Quick Fixes

#### Fix 1: Verify API Key in Render
The key should:
- Start with `gsk_`
- Have no trailing spaces
- Be the same key that works in local development

#### Fix 2: Check Model Availability
Current model: `llama-3.3-70b-versatile`

If this model is deprecated, update in `backend/app/core/config.py`:
```python
groq_model: str = Field(default="llama-3.1-70b-versatile", alias="GROQ_MODEL")
```

#### Fix 3: Add Error Logging to Production
The backend already logs to `GROQ_DEBUG.log`, but this file is on the server.

To see errors in Render logs, ensure print statements are visible:
```python
# In llm_service.py, line 128
except Exception as e:
    print(f"❌ Groq API call failed: {e}")  # This appears in Render logs
    print(f"   Error type: {type(e)}")
    print(f"   Error details: {str(e)}")
```

### Expected Behavior
When working correctly:
1. User uploads files
2. Backend sends data to Groq API
3. Groq returns JSON array of widget proposals
4. Backend parses JSON and returns widgets
5. Frontend displays AI-generated charts

### Code Locations
- **Service**: `backend/app/services/llm_service.py`
- **Config**: `backend/app/core/config.py` (lines 17-19)
- **Endpoint**: `backend/app/api/endpoints/upload.py` (line 107)

---

## Testing Checklist

### For Switch User Issue:
- [ ] Check browser console for errors
- [ ] Try manual navigation to /dashboard/admin, /dashboard/manager, etc.
- [ ] Verify middleware is enabled/disabled
- [ ] Test on different browsers
- [ ] Check if user is authenticated (localStorage has auth token)

### For Groq Issue:
- [ ] Check GROQ_API_KEY in Render environment
- [ ] Check Render backend logs for errors
- [ ] Test API key manually using curl/PowerShell
- [ ] Verify model name is correct
- [ ] Check Groq console for quota/rate limits
- [ ] Test with a simple file upload

---

## Next Steps

1. **Fix Switch User First** - This is simpler and affects UX
   - Add console logging to UserSwitcher
   - Test manual navigation
   - Consider using `window.location.href` as fallback

2. **Fix Groq Integration** - This requires backend investigation
   - Check Render logs (most important)
   - Verify environment variables
   - Test API key validity
   - Consider adding more detailed error logging

3. **Re-enable Middleware** - After both are fixed
   - Properly detect Supabase auth cookie
   - Protect routes based on authentication
   - Test full auth flow

---

## Contact & Resources

- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Groq Console**: https://console.groq.com
- **Backend Logs**: Render → Your Service → Logs tab
- **Frontend Logs**: Browser Console (F12)
