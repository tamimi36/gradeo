# Authentication Guide

## How to Use Authorization Tokens

After logging in, you'll receive an `access_token`. You need to include this token in the `Authorization` header of all protected API requests.

## Token Format

All protected endpoints require the token in this format:
```
Authorization: Bearer <your_access_token>
```

## Step-by-Step Examples

### 1. Login and Get Token

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "your_username",
    "email": "user@example.com",
    ...
  },
  "status": "success"
}
```

**Save the token:**
```bash
# Save token to a variable (bash/zsh)
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# Or save to a file
echo "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." > token.txt
```

### 2. Use Token to Access Protected Endpoints

#### Get Current User Info
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

#### Get List of Users (Admin/Teacher only)
```bash
curl -X GET http://localhost:5001/api/users \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Specific User
```bash
curl -X GET http://localhost:5001/api/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### Update User
```bash
curl -X PUT http://localhost:5001/api/users/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated",
    "last_name": "Name"
  }'
```

#### Assign Role to User (Admin only)
```bash
curl -X POST http://localhost:5001/api/users/1/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "teacher"
  }'
```

#### Logout
```bash
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Refresh Token When Expired

If your access token expires (after 24 hours), use the refresh token:

```bash
curl -X POST http://localhost:5001/api/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN"
```

This returns a new `access_token` that you can use.

## Using Swagger UI

1. **Start the application:**
   ```bash
   python run.py
   ```

2. **Open Swagger UI:**
   Navigate to: `http://localhost:5001/api/swagger/`

3. **Login:**
   - Find the `POST /api/auth/login` endpoint
   - Click "Try it out"
   - Enter your credentials
   - Click "Execute"
   - Copy the `access_token` from the response

4. **Authorize:**
   - Click the **"Authorize"** button at the top right of Swagger UI
   - In the "Value" field, enter: `Bearer <your_access_token>`
   - Click "Authorize"
   - Click "Close"

5. **Use Protected Endpoints:**
   - Now all protected endpoints will automatically include your token
   - Try any endpoint marked with a lock icon 🔒
   - Click "Try it out" and "Execute"

## Using Python Requests

```python
import requests

# Base URL
BASE_URL = "http://localhost:5001/api"

# 1. Login
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "username": "your_username",
        "password": "your_password"
    }
)

tokens = login_response.json()
access_token = tokens["access_token"]

# 2. Use token for protected endpoints
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

# Get current user
response = requests.get(
    f"{BASE_URL}/auth/me",
    headers=headers
)
print(response.json())

# Get users list
response = requests.get(
    f"{BASE_URL}/users",
    headers=headers
)
print(response.json())
```

## Using JavaScript/Fetch

```javascript
const BASE_URL = 'http://localhost:5001/api';

// 1. Login
async function login(username, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  return data.access_token;
}

// 2. Use token for protected endpoints
async function getCurrentUser(token) {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return await response.json();
}

// Usage
const token = await login('your_username', 'your_password');
const user = await getCurrentUser(token);
console.log(user);
```

## Common Errors

### 401 Unauthorized
- **Cause:** Missing or invalid token
- **Solution:** Make sure you include `Authorization: Bearer <token>` header
- **Check:** Token might be expired - use refresh token to get a new one

### 403 Forbidden
- **Cause:** User doesn't have required role/permission
- **Solution:** Check if your user has the required role (admin, teacher, etc.)

### Token Expired
- **Cause:** Access token expired (after 24 hours)
- **Solution:** Use the refresh token endpoint to get a new access token

## Best Practices

1. **Store tokens securely:**
   - Never commit tokens to version control
   - Use environment variables or secure storage
   - In browsers, consider using httpOnly cookies

2. **Handle token expiration:**
   - Check for 401 responses
   - Automatically refresh tokens when expired
   - Re-authenticate if refresh token expires

3. **Token security:**
   - Always use HTTPS in production
   - Don't log tokens
   - Implement token blacklisting for logout

## Testing with curl - Complete Example

```bash
# 1. Login
RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }')

# 2. Extract token (requires jq or manual extraction)
TOKEN=$(echo $RESPONSE | jq -r '.access_token')

# 3. Use token
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Quick Test Script

Save this as `test_auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5001/api"
USERNAME="your_username"
PASSWORD="your_password"

echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed!"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✓ Login successful!"
echo "Token: ${TOKEN:0:50}..."

echo -e "\n2. Getting current user..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n3. Getting users list..."
curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Make it executable and run:
```bash
chmod +x test_auth.sh
./test_auth.sh
```

