# Cloudflare Pages Functions Setup Instructions

## Overview
This guide will help you set up Cloudflare Pages Functions for credential storage, allowing your admin credentials to work across all browsers and devices using your existing Cloudflare Pages deployment at `rayyanenterprises.in`.

## Why Pages Functions?
- ✅ **No separate worker needed** - Functions are part of your existing Pages project
- ✅ **Same domain** - API endpoints at `rayyanenterprises.in/api/...`
- ✅ **Simpler deployment** - Just add `functions/` folder to your project
- ✅ **Free tier included** - No extra setup needed
- ✅ **Integrated with your existing setup**

## Prerequisites
- Your website already deployed on Cloudflare Pages
- Cloudflare account with access to your Pages project

## Step-by-Step Setup

### 1. Create KV Namespace
1. Log in to your Cloudflare Dashboard
2. Go to **Workers & Pages** → **KV**
3. Click **"Create a Namespace"**
4. Name it: `admin-credentials`
5. Click **"Add"**
6. Copy the **Namespace ID** (you'll need this)

### 2. Add Functions Folder to Your Project
The functions folder structure is already created:
```
rayyan-enterprises/
├── functions/
│   └── api/
│       └── credentials/
│           ├── index.js (GET/POST credentials)
│           └── verify/
│               └── index.js (POST verify credentials)
```

### 3. Update wrangler.toml
1. Open the `wrangler.toml` file in your project root
2. Replace `your_kv_namespace_id` with your actual KV Namespace ID
3. The file should look like:
```toml
name = "rayyan-enterprises"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "ADMIN_CREDENTIALS"
id = "your_actual_kv_namespace_id"
```

### 4. Deploy to Cloudflare Pages
Since you already have your site on Cloudflare Pages:

**Option A: Using Git (Recommended)**
1. Commit the new files to your Git repository
2. Push to your Git provider (GitHub/GitLab/Bitbucket)
3. Cloudflare Pages will automatically deploy the changes

**Option B: Using Direct Upload**
1. Go to your Cloudflare Pages dashboard
2. Select your project
3. Click **"Create deployment"** → **"Upload assets"**
4. Upload your entire project folder (including the new `functions/` folder)
5. Deploy

### 5. Bind KV Namespace to Pages Functions
1. Go to your Cloudflare Pages project dashboard
2. Click **"Settings"** → **Functions**
3. Scroll to **"KV Namespace Bindings"**
4. Click **"Add binding"**
5. Variable name: `ADMIN_CREDENTIALS`
6. KV Namespace: Select `admin-credentials`
7. Click **"Save"**

### 6. Test the Setup
1. Visit `https://rayyanenterprises.in/admin`
2. Try logging in with your credentials
3. Go to Settings and try changing your credentials
4. Test in a different browser - the new credentials should work

## API Endpoints

### GET /api/credentials
- URL: `https://rayyanenterprises.in/api/credentials`
- Returns current stored credentials
- Returns default credentials if none stored

### POST /api/credentials
- URL: `https://rayyanenterprises.in/api/credentials`
- Updates credentials
- Requires current password for verification
- Body: `{ currentPassword, newEmail?, newPassword? }`

### POST /api/credentials/verify
- URL: `https://rayyanenterprises.in/api/credentials/verify`
- Verifies credentials for login
- Body: `{ email, password }`
- Returns `{ success: true/false }`

## Fallback System
The system has a built-in fallback:
1. **Primary**: Cloudflare KV (works across all browsers/devices)
2. **Fallback**: localStorage (browser-specific, used if KV fails)
3. **Final fallback**: Default credentials in code

## Security Notes
- Credentials are stored in Cloudflare KV (encrypted at rest)
- Functions run on Cloudflare's edge network
- All API calls use HTTPS (your domain already has SSL)
- Current password required for any changes
- CORS is enabled for your domain

## Troubleshooting

### Functions not responding
- Check Pages Functions logs in Cloudflare Dashboard
- Ensure KV namespace is properly bound
- Verify the functions folder structure is correct

### Credentials not updating
- Check if current password is correct
- Look at Pages Functions logs for errors
- Verify KV namespace has write permissions

### CORS errors
- Ensure your domain is correct (rayyanenterprises.in)
- Check that CORS headers are properly set in function files
- Make sure you're calling from the correct domain

### Deployment issues
- Ensure `wrangler.toml` is in the project root
- Check that KV namespace ID is correct
- Verify the functions folder structure matches the pattern

## Cost
- Cloudflare Pages Functions: Free tier includes 100,000 requests/day
- Cloudflare KV: Free tier includes 100,000 reads/day and 1,000 writes/day
- This is more than sufficient for admin credential management

## File Structure After Setup
```
rayyan-enterprises/
├── functions/
│   └── api/
│       └── credentials/
│           ├── index.js
│           └── verify/
│               └── index.js
├── admin/
│   ├── index.html
│   ├── admin.js
│   └── CLOUDFLARE_PAGES_FUNCTIONS_SETUP.md
├── wrangler.toml
└── (your existing files)
```

## Next Steps
After setup, you can:
1. Test the credential system across different browsers
2. Change your admin credentials through the Settings panel
3. Consider using Cloudflare R2 for document storage (similar setup)
4. Remove the old worker.js and wrangler.toml from admin folder (no longer needed)

## Maintenance
- Monitor your Cloudflare Pages Functions usage in the dashboard
- Check KV storage usage periodically
- Keep an eye on the free tier limits
- The system will automatically fallback to localStorage if there are any issues