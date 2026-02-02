# 🚀 Deploy Email Notifications to Production

## ✅ Code Pushed to GitHub Successfully!

Your email notification changes have been committed and pushed to GitHub.

---

## 🎯 Next Step: Deploy Backend to Google Cloud Run

Since `gcloud` CLI is not installed, use the **Google Cloud Console** (easiest method):

### Step 1: Open Google Cloud Console
Go to: **https://console.cloud.google.com/run**

### Step 2: Find Your Service
- Look for **`klevercal-api`** (or similar backend service name)
- Click on the service name

### Step 3: Deploy New Revision
1. Click the **"EDIT & DEPLOY NEW REVISION"** button (top of page)
2. Scroll down to find the **"BUILD CONFIGURATION"** section
3. Make sure it's set to deploy from:
   - Source: **Repository** (connected to your GitHub repo)
   - OR Source: **Cloud Build** (if auto-deploy is configured)
4. Click **"DEPLOY"** button at the bottom

### Step 4: Wait for Deployment
- Deployment typically takes 2-5 minutes
- You'll see a progress indicator
- Wait for green checkmark ✅

### Step 5: Verify Environment Variables
**Important:** Make sure your Brevo SMTP credentials are set in Cloud Run:

1. After deployment completes, click on the service
2. Go to **"VARIABLES & SECRETS"** tab
3. Verify these environment variables exist:
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=a1643f001@smtp-brevo.com
   SMTP_PASSWORD=your-brevo-smtp-key-here
   SMTP_FROM_EMAIL=notifications@deemeet.app
   SMTP_FROM_NAME=DeeMeet
   ```

4. If they don't exist, click **"EDIT & DEPLOY NEW REVISION"**
5. Scroll to **"Container, Variables & Secrets, Connections, Security"**
6. Click **"VARIABLES & SECRETS"** tab
7. Add each variable above
8. Click **"DEPLOY"** again

---

## 📋 Alternative: Deploy via Command Line (If You Want to Install gcloud)

If you prefer command line deployment:

### Install gcloud CLI:
```bash
# Mac (using Homebrew)
brew install google-cloud-sdk

# Or download from:
# https://cloud.google.com/sdk/docs/install
```

### Login and Deploy:
```bash
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy backend
cd /Users/gulshan/klevermarketing/Klevercal/klevercal/backend
gcloud run deploy klevercal-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SMTP_HOST=smtp-relay.brevo.com,SMTP_PORT=587,SMTP_USER=a1643f001@smtp-brevo.com,SMTP_PASSWORD=your-brevo-smtp-key-here,SMTP_FROM_EMAIL=notifications@deemeet.app,SMTP_FROM_NAME=DeeMeet
```

---

## ✅ After Deployment

### 1. Verify Sender in Brevo
**IMPORTANT:** Before emails will work:

1. Go to: https://app.brevo.com
2. Navigate to: **Settings → Senders & IP**
3. Click: **"Add a Sender"**
4. Enter: `notifications@deemeet.app`
5. Verify the email address

### 2. Test Email Notifications

1. Go to your live scheduling page: **https://deemeet.in/[your-username]**
2. Book a test meeting
3. Check both inboxes:
   - ✅ Guest confirmation email
   - ✅ Host notification email (your inbox)

### 3. Check Backend Logs

In Google Cloud Console:
1. Go to your Cloud Run service
2. Click **"LOGS"** tab
3. Look for:
   ```
   INFO - Confirmation email sent to guest@email.com from notifications@deemeet.app
   INFO - Host notification sent to host@email.com from notifications@deemeet.app
   ```

Or check for errors:
   ```
   ERROR - Failed to send email: [error details]
   ```

---

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check Brevo Sender Verification**
   - Go to https://app.brevo.com
   - Verify notifications@deemeet.app is verified

2. **Check Environment Variables**
   - Google Cloud Console → Cloud Run → Your Service
   - Variables & Secrets tab
   - Verify all SMTP variables are set correctly

3. **Check Logs**
   - Cloud Run service → Logs tab
   - Look for email sending errors

4. **Test SMTP Locally First**
   ```bash
   cd backend
   python server.py
   # Create a test booking
   # Check terminal for email logs
   ```

---

## 📊 Deployment Checklist

- [x] Code committed to Git
- [x] Code pushed to GitHub
- [ ] **Backend deployed to Cloud Run** (YOU NEED TO DO THIS!)
- [ ] **SMTP env variables set in Cloud Run**
- [ ] **Sender verified in Brevo** (notifications@deemeet.app)
- [ ] Test booking created
- [ ] Both emails received
- [ ] Emails look professional on mobile and desktop

---

## 🎯 What Got Deployed

### Code Changes:
1. **backend/server.py** - Updated email functions with Brevo SMTP support
2. **backend/email_templates.py** - Professional HTML email templates
3. **Documentation** - Setup guides and troubleshooting

### Features Added:
- ✅ Professional guest confirmation emails
- ✅ Host notification emails
- ✅ Google Meet link integration in emails
- ✅ Mobile-responsive email design
- ✅ Flexible SMTP configuration (Brevo)
- ✅ Emails sent from notifications@deemeet.app

---

## 🆘 Need Help?

1. **Google Cloud Console:** https://console.cloud.google.com/run
2. **Brevo Dashboard:** https://app.brevo.com
3. **Check Documentation:** EMAIL_SETUP_COMPLETE.md

---

**Next Action:** Deploy via Google Cloud Console using the steps above! 🚀
