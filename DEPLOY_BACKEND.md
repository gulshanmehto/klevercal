# Backend Deployment Instructions

## Issue
The Meeting Types page is failing with a CORS error. The backend code has the correct CORS configuration, but it hasn't been deployed to Google Cloud Run yet.

## Solution
Redeploy the backend with the latest code.

## Steps

### Option 1: Via Terminal (Recommended)

1. **Open Terminal** and navigate to the backend folder:
   ```bash
   cd /Users/gulshan/klevermarketing/Klevercal/klevercal/backend
   ```

2. **Deploy to Google Cloud Run:**
   ```bash
   gcloud run deploy klevercal-api --source . --region us-central1 --allow-unauthenticated
   ```

3. **Wait for deployment** to complete (usually 2-3 minutes).

4. **Refresh the Meeting Types page** at https://www.deemeet.in/meeting-types

### Option 2: Via Google Cloud Console

1. Go to [Google Cloud Run Console](https://console.cloud.google.com/run)
2. Select the `klevercal-api` service
3. Click "**EDIT & DEPLOY NEW REVISION**"
4. In the "Container" tab, click "**DEPLOY ONE REVISION FROM SOURCE**"
5. Select your GitHub repository and the `backend` folder
6. Click "**DEPLOY**"
7. Wait for deployment to complete

### Option 3: Via Cloud Shell (Browser-based)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **Cloud Shell icon** (terminal icon in top right)
3. Clone your repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO/backend
   ```
4. Deploy:
   ```bash
   gcloud run deploy klevercal-api --source . --region us-central1 --allow-unauthenticated
   ```

## What This Will Fix

1. ✅ **CORS Error** - Meeting Types page will load correctly
2. ✅ **Email Notifications** - Latest SMTP configuration will be live
3. ✅ **Date Parsing** - Fixed date format handling for meeting types

## Environment Variables

Make sure these environment variables are set in Google Cloud Run:

- `MONGO_URL` - Your MongoDB connection string
- `DB_NAME` - `klevercal`
- `JWT_SECRET` - Your JWT secret
- `SMTP_HOST` - `smtp-relay.brevo.com`
- `SMTP_PORT` - `587`
- `SMTP_USER` - `a1643f001@smtp-brevo.com`
- `SMTP_PASSWORD` - (Your Brevo SMTP password)
- `SMTP_FROM_EMAIL` - `notifications@deemeet.app`
- `SMTP_FROM_NAME` - `DeeMeet`
- `GOOGLE_CLIENT_ID` - (Your Google OAuth client ID)
- `GOOGLE_CLIENT_SECRET` - (Your Google OAuth client secret)
- `ZOOM_CLIENT_ID` - (Your Zoom client ID if using Zoom)
- `ZOOM_CLIENT_SECRET` - (Your Zoom client secret if using Zoom)
- `IMGBB_API_KEY` - (Your ImgBB API key for image uploads)

## Verification

After deployment:
1. Visit https://www.deemeet.in/meeting-types
2. The "Failed to load meeting types" error should be gone
3. You should see your existing meeting types or be able to create new ones

## Notes

- The backend URL is: `https://klevercal-api-721707771890.us-central1.run.app`
- Service name: `klevercal-api`
- Region: `us-central1`
- The deployment will preserve your existing environment variables
