# Email Notification Setup for DeeMeet

This guide will help you set up email notifications from `notifications@deemeet.in`.

## Quick Start: Gmail SMTP (Recommended for Testing)

This is the fastest way to get started, though emails will show "via gmail.com".

### Step 1: Create a Gmail Account or Use Existing
1. Use your existing Gmail account or create a new one for notifications

### Step 2: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification" and enable it
3. Follow the prompts to set up 2FA

### Step 3: Generate App Password
1. After enabling 2FA, go back to https://myaccount.google.com/security
2. Search for "App passwords" or go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Other (Custom name)"
4. Enter "DeeMeet Notifications"
5. Click "Generate"
6. **Copy the 16-character password** (you'll need this)

### Step 4: Update .env File
Add these lines to your `backend/.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM_EMAIL=notifications@deemeet.in
SMTP_FROM_NAME=DeeMeet
```

**Replace:**
- `your-gmail@gmail.com` with your Gmail address
- `your-app-password-here` with the 16-character app password from step 3

---

## Option 2: Domain Email (Professional - Recommended for Production)

### Using Google Workspace (Best Quality)
1. Go to https://workspace.google.com/
2. Sign up for Google Workspace ($6/user/month)
3. Verify your domain `deemeet.in`
4. Create email account: `notifications@deemeet.in`
5. Set up app password (same as Gmail steps above)
6. Update .env with:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=notifications@deemeet.in
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=notifications@deemeet.in
SMTP_FROM_NAME=DeeMeet
```

### Using Zoho Mail (Free Option)
1. Go to https://www.zoho.com/mail/
2. Sign up for free account (up to 5 users)
3. Verify your domain `deemeet.in`
4. Create email: `notifications@deemeet.in`
5. Generate app password in Zoho account settings
6. Update .env with:

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=notifications@deemeet.in
SMTP_PASSWORD=your-zoho-password
SMTP_FROM_EMAIL=notifications@deemeet.in
SMTP_FROM_NAME=DeeMeet
```

---

## Option 3: Transactional Email Service (Best Deliverability)

### Using SendGrid (100 emails/day free)
1. Sign up at https://sendgrid.com/
2. Verify your email
3. Go to Settings → API Keys
4. Create an API key with "Mail Send" permissions
5. Update .env with:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=notifications@deemeet.in
SMTP_FROM_NAME=DeeMeet
```

6. **Important:** Verify sender identity:
   - Go to Settings → Sender Authentication
   - Verify single sender OR authenticate domain `deemeet.in`

### Using Resend (3,000 emails/month free)
1. Sign up at https://resend.com/
2. Get your API key
3. Verify your domain
4. Use their API (we'll need to modify the code slightly)

---

## Testing Your Setup

After updating your `.env` file with any of the above options, test it:

1. Start your backend server:
   ```bash
   cd backend
   source .venv/bin/activate  # or activate your virtual environment
   python server.py
   ```

2. Schedule a test meeting through your frontend
3. Check if emails are received

---

## Troubleshooting

### Gmail: "Authentication failed"
- Make sure 2FA is enabled
- Regenerate app password
- Check for typos in .env file

### Emails going to spam
- Set up SPF, DKIM, and DMARC records for your domain
- Use a professional email service (Google Workspace, SendGrid)
- Avoid spam trigger words in subject lines

### Port connection issues
- Try port 587 instead of 465 (change SMTP_PORT)
- Check if your firewall/ISP blocks SMTP ports
- For Gmail, 465 (SSL) or 587 (TLS) both work

---

## Next Steps

1. Choose one of the options above
2. Update your `backend/.env` file
3. Restart your backend server
4. Test by creating a booking
5. Check both host and guest inboxes

Need help? Reply with which option you chose and any errors you encounter!
