# Microsoft OAuth Setup Guide

## Overview

This application supports Microsoft OAuth authentication (Azure AD / Microsoft Entra ID), allowing users to sign in with their Microsoft accounts.

## Azure Portal Configuration

### 1. Get Client Secret

You need to create a client secret in Azure Portal:

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Find your app: `09ad13b0-45db-41b4-b705-b7269259a8da`
4. Go to **Certificates & secrets**
5. Click **New client secret**
6. Add a description and choose expiration
7. **Copy the secret value immediately** (you won't see it again!)
8. Add it to your `.env` file as `MICROSOFT_CLIENT_SECRET`

### 2. Update Redirect URIs

1. In your app registration, go to **Authentication**
2. Under **Platform configurations**, click **Add a platform** > **Web**
3. Add the redirect URI:
   ```
   http://localhost:5001/api/auth/microsoft/callback
   ```
4. For production, also add:
   ```
   https://yourdomain.com/api/auth/microsoft/callback
   ```
5. Click **Configure**

### 3. API Permissions

1. Go to **API permissions**
2. Ensure these permissions are added:
   - `openid` (OpenID Connect sign-in)
   - `profile` (View users' basic profile)
   - `email` (View users' email address)
3. Click **Grant admin consent** if needed

## Environment Variables

Add these to your `.env` file:

```bash
MICROSOFT_CLIENT_ID=09ad13b0-45db-41b4-b705-b7269259a8da
MICROSOFT_CLIENT_SECRET=your-client-secret-here
MICROSOFT_TENANT_ID=c0a70de9-fd3f-4962-aa56-3c132a934d7f
MICROSOFT_REDIRECT_URI=http://localhost:5001/api/auth/microsoft/callback
```

**Important:** You must add the `MICROSOFT_CLIENT_SECRET` from Azure Portal!

## API Endpoints

### 1. Get Microsoft OAuth URL
```
GET /api/oauth/microsoft
```
Returns the Microsoft authorization URL.

### 2. Microsoft OAuth Callback (Server-side flow)
```
GET /api/auth/microsoft/callback?code=...
```
This is called by Microsoft after user authorization. Returns JWT tokens.

### 3. Authenticate with Microsoft Token (Client-side flow)
```
POST /api/oauth/microsoft/token
Body: {
  "token": "microsoft_id_token_from_frontend"
}
```
For frontend applications that get the Microsoft ID token directly.

## Usage Examples

### Server-Side Flow (Web Application)

1. **Get authorization URL:**
   ```bash
   curl http://localhost:5001/api/oauth/microsoft
   ```

2. **Redirect user to the returned URL**

3. **User authorizes and Microsoft redirects to:**
   ```
   http://localhost:5001/api/auth/microsoft/callback?code=...
   ```

4. **The callback endpoint returns JWT tokens**

### Client-Side Flow (SPA/Mobile)

1. **Frontend gets Microsoft ID token using Microsoft Authentication Library (MSAL)**

2. **Send token to backend:**
   ```bash
   curl -X POST http://localhost:5001/api/oauth/microsoft/token \
     -H "Content-Type: application/json" \
     -d '{"token": "microsoft_id_token_here"}'
   ```

3. **Backend verifies token and returns JWT tokens**

## Frontend Integration Example

### React with MSAL

```javascript
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: '09ad13b0-45db-41b4-b705-b7269259a8da',
    authority: 'https://login.microsoftonline.com/c0a70de9-fd3f-4962-aa56-3c132a934d7f',
    redirectUri: 'http://localhost:3000'
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

async function handleMicrosoftLogin() {
  try {
    const loginResponse = await msalInstance.loginPopup({
      scopes: ['openid', 'profile', 'email']
    });
    
    // Send ID token to your backend
    const response = await fetch('http://localhost:5001/api/oauth/microsoft/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: loginResponse.idToken
      })
    });
    
    const data = await response.json();
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### HTML/JavaScript Example

```html
<script src="https://alcdn.msauth.net/browser/2.38.0/js/msal-browser.min.js"></script>
<script>
const msalConfig = {
  auth: {
    clientId: '09ad13b0-45db-41b4-b705-b7269259a8da',
    authority: 'https://login.microsoftonline.com/c0a70de9-fd3f-4962-aa56-3c132a934d7f',
    redirectUri: window.location.origin
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

async function signInWithMicrosoft() {
  try {
    const loginResponse = await msalInstance.loginPopup({
      scopes: ['openid', 'profile', 'email']
    });
    
    // Send to your backend
    fetch('http://localhost:5001/api/oauth/microsoft/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: loginResponse.idToken
      })
    })
    .then(res => res.json())
    .then(data => {
      localStorage.setItem('access_token', data.access_token);
      // Redirect or update UI
    });
  } catch (error) {
    console.error('Login failed:', error);
  }
}
</script>
```

## How It Works

1. **User clicks "Sign in with Microsoft"**
2. **Frontend gets Microsoft ID token** (or redirects to Microsoft)
3. **Backend verifies the token** with Microsoft
4. **Backend gets user info** from verified token
5. **Backend creates/finds user** in database
6. **Backend returns JWT tokens** for your API

## User Account Linking

- If a user signs up with email/password and later signs in with Microsoft using the same email, the accounts are automatically linked
- The user can then use either method to sign in
- OAuth users don't need passwords

## Security Notes

- Microsoft tokens are verified server-side using Microsoft's public keys
- Never trust client-side tokens without verification
- OAuth users are automatically marked as verified (Microsoft emails are verified)
- Provider data is stored in JSON format for future reference

## Troubleshooting

### "Invalid token" error
- Check that `MICROSOFT_CLIENT_ID` matches Azure Portal
- Ensure the token hasn't expired
- Verify redirect URI matches exactly

### "Redirect URI mismatch"
- Check Azure Portal redirect URIs
- Ensure no trailing slashes
- Use exact URL including protocol (http/https)

### "Client secret not configured"
- You must add `MICROSOFT_CLIENT_SECRET` to your `.env` file
- Get it from Azure Portal > App registrations > Certificates & secrets

### "Email not provided"
- Check Microsoft OAuth scopes include 'email'
- User must grant email permission

## Production Checklist

- [ ] Add client secret to `.env` file
- [ ] Update redirect URI to production URL in Azure Portal
- [ ] Update redirect URI in `.env` file
- [ ] Use HTTPS in production
- [ ] Store credentials securely (environment variables)
- [ ] Enable CORS for your frontend domain
- [ ] Test OAuth flow end-to-end
- [ ] Grant admin consent for API permissions

## Differences from Google OAuth

| Feature | Google | Microsoft |
|---------|--------|-----------|
| **Authority URL** | `accounts.google.com` | `login.microsoftonline.com/{tenant}` |
| **Token Endpoint** | `oauth2.googleapis.com/token` | `login.microsoftonline.com/{tenant}/oauth2/v2.0/token` |
| **User ID Field** | `sub` | `sub` or `oid` |
| **Profile Picture** | Included in ID token | Not included (requires separate API call) |
| **Tenant Support** | N/A | Supports single-tenant or multi-tenant |

## Additional Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Azure Portal](https://portal.azure.com/)

