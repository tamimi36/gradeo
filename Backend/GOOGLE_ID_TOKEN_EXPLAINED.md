# Google ID Token Explained

## What is a Google ID Token?

A **Google ID Token** is a JWT (JSON Web Token) that Google issues after a user successfully authenticates. It contains information about the user and proves that Google has verified their identity.

## Key Characteristics

1. **JWT Format**: It's a JSON Web Token (three parts separated by dots: `header.payload.signature`)
2. **Signed by Google**: Cryptographically signed, so you can verify it came from Google
3. **Contains User Info**: Includes user's email, name, profile picture, etc.
4. **Short-lived**: Typically expires in 1 hour
5. **One-time use**: Should be used immediately after receiving it

## What's Inside an ID Token?

When decoded, an ID token contains:

```json
{
  "iss": "https://accounts.google.com",           // Issuer (Google)
  "sub": "103824896654914472312",                  // Google user ID (unique)
  "aud": "your-client-id.apps.googleusercontent.com", // Audience (your app)
  "email": "user@gmail.com",                       // User's email
  "email_verified": true,                          // Email is verified
  "name": "John Doe",                              // Full name
  "picture": "https://...",                        // Profile picture URL
  "given_name": "John",                            // First name
  "family_name": "Doe",                            // Last name
  "iat": 1234567890,                               // Issued at (timestamp)
  "exp": 1234571490                                // Expires at (timestamp)
}
```

## How It's Used in Your Application

### Two OAuth Flows

#### 1. **Server-Side Flow** (Traditional Web App)
```
User → Google Login → Google redirects with code → 
Your server exchanges code for tokens → Gets ID token → 
Verify ID token → Create user → Return JWT tokens
```

**Endpoint**: `GET /api/auth/google/callback`

#### 2. **Client-Side Flow** (SPA/Mobile App)
```
User → Google Login (in frontend) → 
Frontend gets ID token directly → 
Send ID token to your backend → 
Backend verifies ID token → Create user → Return JWT tokens
```

**Endpoint**: `POST /api/oauth/google/token`

## Why Verify the ID Token?

**Security**: You must verify the token to ensure:
- ✅ It was actually issued by Google (not fake)
- ✅ It hasn't been tampered with
- ✅ It's meant for your application (correct client ID)
- ✅ It hasn't expired

## How Verification Works in Your Code

```python
from google.oauth2 import id_token
from google.auth.transport import requests

# Verify the token
idinfo = id_token.verify_oauth2_token(
    token,                    # The ID token string
    google_requests.Request(), # HTTP request object
    GOOGLE_CLIENT_ID          # Your app's client ID
)

# If verification succeeds, you get user info
email = idinfo['email']
name = idinfo['name']
google_id = idinfo['sub']
```

## ID Token vs Access Token

| Feature | ID Token | Access Token |
|---------|----------|--------------|
| **Purpose** | Authentication (who is the user?) | Authorization (what can they access?) |
| **Contains** | User identity info | Permissions/scopes |
| **Used for** | Logging in users | Accessing Google APIs |
| **Lifetime** | ~1 hour | Varies |
| **Your app uses** | ✅ Yes (to identify user) | ❌ Usually not needed |

## Example Flow

### Frontend Gets ID Token

```javascript
// Using Google Sign-In JavaScript SDK
function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  
  // Send to your backend
  fetch('http://localhost:5001/api/oauth/google/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: id_token  // ← This is the Google ID token
    })
  })
  .then(response => response.json())
  .then(data => {
    // Get your app's JWT tokens
    localStorage.setItem('access_token', data.access_token);
  });
}
```

### Backend Verifies and Uses It

```python
# In your backend (POST /api/oauth/google/token)
google_token = request.json.get('token')  # ID token from frontend

# Verify it's from Google
google_user_info = verify_google_token(google_token)

# Extract user info
email = google_user_info['email']
name = google_user_info['name']
google_id = google_user_info['sub']  # Unique Google user ID

# Create or find user in your database
user = get_or_create_user(google_id, email, name)

# Create YOUR app's JWT tokens
access_token = create_access_token(identity=str(user.id))
refresh_token = create_refresh_token(identity=str(user.id))

# Return to frontend
return {
    'access_token': access_token,  # Your app's token
    'refresh_token': refresh_token,
    'user': user.to_dict()
}
```

## Visual Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Clicks "Sign in with Google"
       ▼
┌─────────────┐
│  Google     │
│  Login Page │
└──────┬──────┘
       │
       │ 2. User authorizes
       ▼
┌─────────────┐
│   Google    │
│  Issues ID  │
│   Token     │
└──────┬──────┘
       │
       │ 3. ID Token sent to your app
       ▼
┌─────────────┐
│  Your App   │
│  Verifies   │
│  ID Token   │
└──────┬──────┘
       │
       │ 4. Extract user info
       ▼
┌─────────────┐
│  Your App   │
│  Creates    │
│  User &     │
│  JWT Tokens │
└─────────────┘
```

## Security Best Practices

1. **Always verify server-side**: Never trust client-side tokens without verification
2. **Check expiration**: ID tokens expire quickly
3. **Verify audience**: Make sure token is for YOUR client ID
4. **One-time use**: Don't reuse ID tokens
5. **HTTPS only**: Always use HTTPS in production

## In Your Implementation

Your app has two ways to use Google ID tokens:

### Option 1: Server-Side Flow
- User visits `/api/oauth/google`
- Gets redirected to Google
- Google redirects back with a code
- Your server exchanges code for ID token
- **You handle everything server-side**

### Option 2: Client-Side Flow (Recommended for SPAs)
- Frontend uses Google Sign-In SDK
- Gets ID token directly
- Sends ID token to `/api/oauth/google/token`
- **Frontend gets token, backend verifies it**

## Summary

- **Google ID Token** = Proof from Google that user is authenticated
- Contains user's identity information (email, name, etc.)
- Must be verified server-side for security
- Used to create/find user in your database
- After verification, you create YOUR app's JWT tokens

Think of it as: **Google's ID token proves "This is John from Google"**, then you create your own token that says **"This is user #123 in my app"**.

