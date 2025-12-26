
x# Google OAuth Setup Guide

## Overview

This application supports Google OAuth authentication, allowing users to sign in with their Google accounts.

## Google Cloud Console Configuration

### 1. Update Redirect URIs

You need to add the following redirect URI in your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:5001/api/auth/google/callback
   ```
5. For production, also add your production URL:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```
6. Click **Save**

### 2. Authorized JavaScript Origins

Make sure these are set in Google Cloud Console:
- `http://localhost:5001` (for development)
- `https://yourdomain.com` (for production)

## Environment Variables

Add these to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5001/api/auth/google/callback
```

## Database Migration

After updating the User model, run migrations:

```bash
flask db migrate -m "Add OAuth support to User model"
flask db upgrade
```

Or if using `db.create_all()`, restart the app and it will update the schema.

## API Endpoints

### 1. Get Google OAuth URL
```
GET /api/oauth/google
```
Returns the Google authorization URL.

### 2. Google OAuth Callback (Server-side flow)
```
GET /api/auth/google/callback?code=...
```
This is called by Google after user authorization. Returns JWT tokens.

### 3. Authenticate with Google Token (Client-side flow)
```
POST /api/oauth/google/token
Body: {
  "token": "google_id_token_from_frontend"
}
```
For frontend applications that get the Google ID token directly.

## Usage Examples

### Server-Side Flow (Web Application)

1. **Get authorization URL:**
   ```bash
   curl http://localhost:5001/api/oauth/google
   ```

2. **Redirect user to the returned URL**

3. **User authorizes and Google redirects to:**
   ```
   http://localhost:5001/api/auth/google/callback?code=...
   ```

4. **The callback endpoint returns JWT tokens**

### Client-Side Flow (SPA/Mobile)

1. **Frontend gets Google ID token using Google Sign-In SDK**

2. **Send token to backend:**
   ```bash
   curl -X POST http://localhost:5001/api/oauth/google/token \
     -H "Content-Type: application/json" \
     -d '{"token": "google_id_token_here"}'
   ```

3. **Backend verifies token and returns JWT tokens**

## Frontend Integration Example

### React Example

```javascript
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const handleGoogleSuccess = async (credentialResponse) => {
    const response = await fetch('http://localhost:5001/api/oauth/google/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: credentialResponse.credential
      })
    });
    
    const data = await response.json();
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login Failed')}
    />
  );
}
```

### HTML/JavaScript Example

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
<div id="g_id_onload"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
function handleCredentialResponse(response) {
  fetch('http://localhost:5001/api/oauth/google/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: response.credential
    })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('access_token', data.access_token);
    // Redirect or update UI
  });
}
</script>
```

## How It Works

1. **User clicks "Sign in with Google"**
2. **Frontend gets Google ID token** (or redirects to Google)
3. **Backend verifies the token** with Google
4. **Backend gets user info** from verified token
5. **Backend creates/finds user** in database
6. **Backend returns JWT tokens** for your API

## User Account Linking

- If a user signs up with email/password and later signs in with Google using the same email, the accounts are automatically linked
- The user can then use either method to sign in
- OAuth users don't need passwords

## Security Notes

- Google tokens are verified server-side
- Never trust client-side tokens without verification
- OAuth users are automatically marked as verified (Google emails are verified)
- Provider data is stored in JSON format for future reference

## Troubleshooting

### "Invalid token" error
- Check that `GOOGLE_CLIENT_ID` matches your Google Cloud Console
- Ensure the token hasn't expired
- Verify redirect URI matches exactly

### "Redirect URI mismatch"
- Check Google Cloud Console redirect URIs
- Ensure no trailing slashes
- Use exact URL including protocol (http/https)

### "Email not provided"
- Check Google OAuth scopes include 'email'
- User must grant email permission

## Production Checklist

- [ ] Update redirect URI to production URL
- [ ] Update JavaScript origins in Google Console
- [ ] Use HTTPS in production
- [ ] Store credentials securely (environment variables)
- [ ] Enable CORS for your frontend domain
- [ ] Test OAuth flow end-to-end

