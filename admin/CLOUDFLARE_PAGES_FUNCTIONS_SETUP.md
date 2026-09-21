# Cloudflare Pages Functions Setup Instructions

## Overview
This guide will help you set up Cloudflare Pages Functions for credential AND document storage, allowing your admin credentials and documents to work across all browsers and devices using your existing Cloudflare Pages deployment at `rayyanenterprises.in`.

## Why Pages Functions?
- ✅ **No separate worker needed** - Functions are part of your existing Pages project
- ✅ **Same domain** - API endpoints at `rayyanenterprises.in/api/...`
- ✅ **Simpler deployment** - Just add `functions/` folder to your project
- ✅ **Free tier included** - No extra setup needed
- ✅ **Integrated with your existing setup**

## Step-by-Step Setup

### 1. Create Two KV Namespaces
You need TWO KV namespaces - one for credentials, one for documents:

**For Credentials:**
1. Log in to your Cloudflare Dashboard
2. Go to **Workers & Pages** → **KV**
3. Click **"Create a Namespace"**
4. Name it: `admin-credentials`
5. Click **"Add"**
6. Copy the **Namespace ID** (you'll need this)

**For Documents:**
1. Go to **Workers & Pages** → **KV**
2. Click **"Create a Namespace"**
3. Name it: `admin-documents`
4. Click **"Add"**
5. Copy the **Namespace ID** (you'll need this)

### 2. Update wrangler.toml
1. Open the `wrangler.toml` file in your project root
2. Replace BOTH KV namespace IDs with your actual IDs
3. The file should look like:
```toml
name = "rayyan-enterprises"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "ADMIN_CREDENTIALS"
id = "31fad13fb7a64884b2b78983a25d0091"

[[kv_namespaces]]
binding = "ADMIN_DOCUMENTS"
id = "your_documents_kv_namespace_id"
```

### 3. Deploy to Cloudflare Pages
Since you already have your site on Cloudflare Pages:

**Option A: Using Git (Recommended)**
1. Commit the new files to your Git repository
2. Push to your Git provider (GitHub/GitLab/Bitbucket)
3. Cloudflare Pages will automatically deploy the changes

**Option B: Using Direct Upload**
1. Go to your Cloudflare Pages project dashboard
2. Select your project
3. Click **"Create deployment"** → **"Upload assets"**
4. Upload your entire project folder (including the new `functions/` folder)
5. Deploy

### 4. Bind Both KV Namespaces to Pages Functions
1. Go to your Cloudflare Pages project dashboard
2. Click **"Settings"** → **Functions**
3. Scroll to **"KV Namespace Bindings"**
4. Add TWO bindings:
   - Variable name: `ADMIN_CREDENTIALS` → KV Namespace: `admin-credentials`
   - Variable name: `ADMIN_DOCUMENTS` → KV Namespace: `admin-documents`
5. Click **"Save"**

### 5. Test the Setup
1. Visit `https://rayyanenterprises.in/admin`
2. Try logging in with your credentials
3. Go to Settings and try changing your credentials
4. Upload a document
5. Test in a different browser - credentials and documents should work!

## API Endpoints

### Credentials:
- **GET /api/credentials** - Get current credentials
- **POST /api/credentials** - Update credentials
- **POST /api/credentials/verify** - Verify login credentials

### Documents:
- **GET /api/documents** - Get all documents
- **POST /api/documents** - Upload document
- **DELETE /api/documents** - Delete document

## Fallback System
The system has a built-in fallback:
1. **Primary**: Cloudflare KV (works across all browsers/devices)
2. **Fallback**: localStorage (browser-specific, used if KV fails)
3. **Final fallback**: Default credentials in code

## Important Notes About Document Storage
- **KV size limit**: Each KV value can be up to 25MB
- **File size limit**: Current implementation is 10MB per file
- **Storage capacity**: Suitable for documents (PDFs, images) but not for large videos
- **For large files**: Consider Cloudflare R2 in the future

## Troubleshooting

### Functions not responding
- Check Pages Functions logs in Cloudflare Dashboard
- Ensure BOTH KV namespaces are properly bound
- Verify the functions folder structure is correct

### Credentials/Documents not updating
- Check if current password is correct
- Look at Pages Functions logs for errors
- Verify KV namespaces have write permissions
- Check console logs for detailed error messages

### Documents not appearing across browsers
- Ensure the `ADMIN_DOCUMENTS` KV namespace is bound
- Check the browser console for API errors
- Verify the document data isn't exceeding KV size limits

## Cost
- Cloudflare Pages Functions: Free tier includes 100,000 requests/day
- Cloudflare KV: Free tier includes 100,000 reads/day and 1,000 writes/day
- This is more than sufficient for admin credential and document management

## Debugging
The system includes detailed console logging. Open browser DevTools (F12) and check the Console tab to see:
- Credential loading attempts
- Document storage operations
- Fallback activations
- API response statuses