# Quick SMTP Setup Guide for DeeMeet

## Fastest Setup: Gmail (5 minutes)

### Step 1: Enable 2FA on Gmail
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification" and enable it

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "DeeMeet Notifications"
4. Click "Generate"
5. **Copy the 16-character password** (looks like: xxxx xxxx xxxx xxxx)

### Step 3: Update Your .env File
Add these lines to `backend/.env`:

```env
# SMTP Configuration (using Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-16-char-app-password-here
SMTP_FROM_EMAIL=notifications@deemeet.in
SMTP_FROM_NAME=DeeMeet
```

**Important:** Replace:
- `your-gmail@gmail.com` with your actual Gmail address
- `your-16-char-app-password-here` with the app password from Step 2 (remove spaces)

### Step 4: Test It!
1. Restart your backend server
2. Create a test booking
3. Check both guest and host inboxes

---

## Example .env Configuration

Here's a complete example:

```env
# MongoDB
MONGO_URL=your-mongodb-connection-string
DB_NAME=klevercal
JWT_SECRET=dev-secret
ADMIN_EMAILS=gulshanmehto15@gmail.com,admin@deemeet.com,gulshan@klevermarketing.in

# Google Calendar OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Zoom
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret

# Microsoft Teams
TEAMS_CLIENT_ID=
TEAMS_CLIENT_SECRET=
TEAMS_TENANT_ID=common

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=notifications@deemeet.app
SMTP_FROM_NAME=DeeMeet
```

---

## Alternative: SendGrid (Better Deliverability)

If you want professional deliverability with no "via gmail.com":

### Step 1: Sign up for SendGrid
1. Go to: https://sendgrid.com/
2. Sign up for free account (100 emails/day)

### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create API Key with "Mail Send" permission
3. Copy the API key

### Step 3: Verify Sender
1. Go to Settings → Sender Authentication
2. Verify single sender with: notifications@deemeet.in
3. OR authenticate your entire domain: deemeet.in

### Step 4: Update .env
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key-here
SMTP_FROM_EMAIL=notifications@deemeet.in
SMTP_FROM_NAME=DeeMeet
```

---

## What's New?

✅ **Professional Email Templates** - Beautiful, modern emails matching the reference screenshots
✅ **Both Guest & Host Notifications** - Automatic emails to both parties
✅ **Google Meet Link Integration** - Automatically includes meeting links
✅ **Flexible SMTP Support** - Works with Gmail, SendGrid, Zoho, AWS SES, or any SMTP provider
✅ **Custom From Address** - Emails sent from notifications@deemeet.in

---

## Email Features

### Guest Confirmation Email Includes:
- Meeting title and details
- Date, time, and duration
- Host information
- Google Meet link (if applicable)
- Meeting notes/description
- Calendar invitation notice

### Host Notification Email Includes:
- Guest details (name, email, phone)
- Meeting information
- Google Meet link
- Meeting notes
- Direct link to manage booking

---

## Troubleshooting

### "Authentication failed"
```bash
# Gmail: Make sure you're using app password, not regular password
# Check that 2FA is enabled first
# Remove spaces from the app password
```

### Emails going to spam
```bash
# For Gmail: This is normal for testing
# For production: Use SendGrid or Google Workspace
# Set up SPF/DKIM records for your domain
```

### Port blocked
```bash
# Try port 587 instead of 465:
SMTP_PORT=587
# Port 587 uses STARTTLS instead of SSL
```

---

## Next Steps

1. Choose Gmail (easiest) or SendGrid (professional)
2. Follow the steps above
3. Update your `backend/.env` file
4. Restart backend: `cd backend && python server.py`
5. Test by creating a booking
6. Check both inboxes

Need help? Check EMAIL_SETUP.md for detailed instructions!
