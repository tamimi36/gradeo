# Using Swagger UI with JWT Authorization

## Quick Guide

### Step 1: Login
1. Open Swagger UI: `http://localhost:5001/api/swagger/`
2. Find `POST /api/auth/login`
3. Click "Try it out"
4. Enter your credentials:
   ```json
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```
5. Click "Execute"
6. **Copy the `access_token` from the response**

### Step 2: Authorize
1. Click the **"Authorize"** button (🔒) at the top right of Swagger UI
2. In the "Value" field, enter: `Bearer <your_access_token>`
   - Example: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Use Protected Endpoints
- All protected endpoints (marked with 🔒) will now automatically include your token
- Try any endpoint - it will work without manually adding the token each time!

### Step 4: Refresh Token (When Expired)
If you get a 401 error (token expired):
1. Use `POST /api/auth/refresh` endpoint
2. Use your `refresh_token` (not access_token) in the Authorize button
3. Copy the new `access_token` from the response
4. Re-authorize with the new token

## Tips

- **Token lasts 24 hours** - You'll need to refresh after that
- **Refresh token lasts 30 days** - Use it to get new access tokens
- **The Authorize button saves your token** - You only need to authorize once per session
- **All protected endpoints** automatically use the authorized token

## Visual Guide

```
┌─────────────────────────────────────────┐
│  Exam Scanner API          [🔒 Authorize]│  ← Click this button
└─────────────────────────────────────────┘
         │
         │ After login, click Authorize
         │ Enter: Bearer <your_token>
         │
         ▼
┌─────────────────────────────────────────┐
│  Authorize                              │
│  ┌───────────────────────────────────┐  │
│  │ Bearer Auth                       │  │
│  │ Value: Bearer eyJ0eXAi...        │  │  ← Paste token here
│  │ [Authorize] [Close]               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Troubleshooting

**"Authorize" button not working?**
- Make sure you're using the format: `Bearer <token>` (include the word "Bearer" and a space)

**Getting 401 Unauthorized?**
- Your token might be expired - use the refresh endpoint
- Make sure you clicked "Authorize" after pasting the token

**Token not being sent?**
- Check that you clicked "Authorize" and "Close" after entering the token
- The token should appear in the "Authorized" section at the top

