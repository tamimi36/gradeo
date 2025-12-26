# Google Cloud Console Setup Instructions

## Required Changes in Google Cloud Console

You need to update your Google OAuth 2.0 Client configuration to add the correct redirect URI.

### Step-by-Step Instructions

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project: `astute-fort-479817-n0`

2. **Navigate to Credentials**
   - Go to **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID: `197647816040-c1c7781nhnlic23sclnemoviu53pglps.apps.googleusercontent.com`
   - Click on it to edit

3. **Update Authorized redirect URIs**
   
   **Current redirect URI:**
   ```
   http://localhost:5001/
   ```
   
   **Change to:**
   ```
   http://localhost:5001/api/auth/google/callback
   ```
   
   **For production, also add:**
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

4. **Verify Authorized JavaScript origins**
   
   Should include:
   ```
   http://localhost:5001
   ```
   
   For production:
   ```
   https://yourdomain.com
   ```

5. **Save Changes**
   - Click **Save** at the bottom
   - Wait a few minutes for changes to propagate

## Important Notes

- ⚠️ **The redirect URI must match EXACTLY** - including the full path `/api/auth/google/callback`
- ⚠️ **No trailing slashes** - don't add `/` at the end
- ⚠️ **Protocol matters** - use `http://` for localhost, `https://` for production
- ⚠️ **Changes can take a few minutes** to propagate

## Testing

After updating, test the OAuth flow:

1. Get the authorization URL:
   ```bash
   curl http://localhost:5001/api/oauth/google
   ```

2. Open the returned URL in a browser

3. Authorize the application

4. You should be redirected to: `http://localhost:5001/api/auth/google/callback?code=...`

5. The callback should return JWT tokens

## Troubleshooting

### "Redirect URI mismatch" error
- Double-check the redirect URI in Google Console matches exactly
- Ensure no trailing slashes
- Check protocol (http vs https)

### "Invalid client" error
- Verify `GOOGLE_CLIENT_ID` in your `.env` file
- Check that the client ID matches Google Console

### "Access blocked" error
- Check that your app is in "Testing" mode in Google Console
- Add test users if needed
- For production, submit for verification

