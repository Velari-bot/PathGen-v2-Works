# Discord OAuth Setup Guide

## 🔐 Setting Up Discord OAuth for PathGen v2

This guide will help you configure Discord OAuth so users can log in with their Discord accounts.

## 📋 Prerequisites

1. Discord Developer Account
2. Vercel CLI installed (`npm install -g vercel`)
3. PathGen v2 deployed to Vercel

## 🚀 Step-by-Step Setup

### Step 1: Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "PathGen v2" (or your preferred name)
4. Click "Create"

### Step 2: Configure OAuth2 Settings

1. In your application, go to "OAuth2" in the left sidebar
2. Click "General" under OAuth2
3. Copy your **Client ID** and **Client Secret**
4. Under "Redirects", add:
   ```
   https://pathgen.dev/setup.html
   http://localhost:3000/setup.html
   ```
5. Click "Save Changes"

### Step 3: Add Environment Variables to Vercel

#### Option A: Use the Helper Script

```powershell
cd apps/web
.\add-discord-env.ps1
```

When prompted:
- Enter your Discord **Client ID**
- Enter your Discord **Client Secret**

#### Option B: Manual Setup via Vercel Dashboard

1. Go to https://vercel.com/velari-bots-projects/pathgen/settings/environment-variables
2. Add these variables:

**DISCORD_CLIENT_ID**
- Value: Your Discord Client ID (e.g., `1234567890123456789`)
- Environments: Production, Preview

**DISCORD_CLIENT_SECRET**
- Value: Your Discord Client Secret (e.g., `abc123def456...`)
- Environments: Production, Preview

3. Click "Save"

#### Option C: Manual Setup via Vercel CLI

```powershell
cd apps/web

# Add Client ID
vercel env add DISCORD_CLIENT_ID production
# Paste your Client ID when prompted

vercel env add DISCORD_CLIENT_ID preview
# Paste your Client ID when prompted

# Add Client Secret
vercel env add DISCORD_CLIENT_SECRET production
# Paste your Client Secret when prompted

vercel env add DISCORD_CLIENT_SECRET preview
# Paste your Client Secret when prompted
```

### Step 4: Deploy to Vercel

```bash
cd "C:\Users\bende\OneDrive\Desktop\fortnite api"
vercel --prod
```

### Step 5: Test the Integration

1. Go to https://pathgen.dev/setup.html
2. Click "Continue with Discord"
3. Authorize the application
4. You should be redirected back and see your Discord info

## 🔍 How It Works

### 1. User Flow

```
User → Click "Continue with Discord" 
     → Redirected to Discord 
     → User authorizes 
     → Redirected back to /setup.html?code=...
     → Frontend sends code to /api/discord/token
     → Backend exchanges code for access token
     → Backend fetches user info
     → User data saved to Firestore
     → User completes setup
```

### 2. API Endpoint

**POST** `/api/discord/token`

Request:
```json
{
  "code": "Discord_authorization_code",
  "redirectUri": "https://pathgen.dev/setup.html"
}
```

Response:
```json
{
  "access_token": "...",
  "user": {
    "id": "123456789",
    "username": "username",
    "email": "user@example.com",
    "avatar": "...",
    "verified": true
  }
}
```

### 3. Firestore Storage

User data is automatically saved to `users/{discordId}`:

```javascript
{
  discordId: "123456789",
  discordUsername: "username",
  email: "user@example.com",
  discordAvatar: "https://cdn.discordapp.com/avatars/...",
  firstName: "John",
  lastName: "Doe",
  loginMethod: "discord",
  setupComplete: true,
  subscription: {
    status: "free",
    plan: "free"
  },
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

## 🐛 Troubleshooting

### Error: "405 Method Not Allowed"
- **Cause**: API route not deployed or Vercel cache
- **Fix**: Redeploy with `vercel --prod`

### Error: "Discord OAuth not configured"
- **Cause**: Missing environment variables
- **Fix**: Add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` to Vercel

### Error: "Failed to exchange authorization code"
- **Cause**: Invalid Client Secret or expired code
- **Fix**: Double-check your Client Secret in Vercel settings

### Error: "Redirect URI mismatch"
- **Cause**: Redirect URI not added to Discord application
- **Fix**: Add `https://pathgen.dev/setup.html` to OAuth2 Redirects

### User data not saving to Firestore
- **Cause**: Firebase not initialized or permissions issue
- **Fix**: Check browser console for Firebase errors

## 📊 Checking Environment Variables

```bash
# List all environment variables
vercel env ls

# Pull environment variables to local
vercel env pull
```

## 🔒 Security Notes

1. **Never commit** your Client Secret to git
2. Client Secret should **only** be in Vercel environment variables
3. Rotate your Client Secret if it's ever exposed
4. Use different Discord applications for development and production

## 📚 Additional Resources

- Discord OAuth2 Docs: https://discord.com/developers/docs/topics/oauth2
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables
- Firebase Firestore: https://firebase.google.com/docs/firestore

## ✅ Verification Checklist

- [ ] Discord application created
- [ ] Redirect URIs added to Discord
- [ ] `DISCORD_CLIENT_ID` added to Vercel
- [ ] `DISCORD_CLIENT_SECRET` added to Vercel
- [ ] Deployed to production
- [ ] Tested login flow
- [ ] User data appears in Firestore
- [ ] Setup completes successfully

## 🎉 Success!

Once everything is set up, users can:
- Login with Discord
- Have their profile automatically created in Firestore
- Access all PathGen v2 features
- See their Discord avatar and username throughout the app

