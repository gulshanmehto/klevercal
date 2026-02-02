# Brevo SMTP Configuration for DeeMeet

## ✅ Configuration Complete!

Your Brevo SMTP credentials have been configured in `backend/.env`:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login@smtp-brevo.com
SMTP_PASSWORD=your-brevo-smtp-key-here
SMTP_FROM_EMAIL=notifications@deemeet.app
SMTP_FROM_NAME=DeeMeet
```

---

## 🎯 Important: Verify Sender in Brevo

Before emails will work, you need to verify `notifications@deemeet.in` in Brevo:

### Step 1: Add Sender Email
1. Log into Brevo: https://app.brevo.com
2. Go to **Settings** → **Senders & IP**
3. Click **Add a Sender**
4. Enter email: `notifications@deemeet.in`
5. Enter sender name: `DeeMeet`

### Step 2: Verify Sender
Brevo will send a verification email to `notifications@deemeet.in`

**Two options:**

#### Option A: If you have access to notifications@deemeet.in
- Check that inbox and click the verification link

#### Option B: If you don't have notifications@deemeet.in yet
- Use your current email (e.g., `gulshan@klevermarketing.in`) temporarily
- Update `.env` to use verified email:
  ```env
  SMTP_FROM_EMAIL=gulshan@klevermarketing.in
  SMTP_FROM_NAME=DeeMeet
  ```
- Later, once notifications@deemeet.in is set up, verify it in Brevo and switch back

### Step 3: Set up Domain Authentication (Optional but Recommended)
For best deliverability:
1. In Brevo, go to **Settings** → **Senders & IP** → **Domains**
2. Click **Authenticate a domain**
3. Enter: `deemeet.in`
4. Follow instructions to add DNS records (SPF, DKIM, DMARC)
5. This prevents emails from going to spam

---

## 🚀 Testing Your Setup

### Method 1: Restart Backend and Test
```bash
cd /Users/gulshan/klevermarketing/Klevercal/klevercal/backend

# If using virtual environment
source .venv/bin/activate  # or source venv/bin/activate

# Start the server
python server.py
```

### Method 2: Create a Test Booking
1. Go to your scheduling page
2. Book a test meeting
3. Check both emails:
   - Guest confirmation email
   - Host notification email

---

## 📊 Brevo Benefits

✅ **Free tier**: 300 emails/day
✅ **Professional deliverability**: Better than Gmail
✅ **Email analytics**: Track opens, clicks
✅ **No "via" label**: Clean sender reputation
✅ **API access**: Can upgrade to API later
✅ **Templates**: Can use Brevo's template builder

---

## 🔍 Troubleshooting

### "Authentication failed"
- Check that SMTP credentials are correct in .env
- Make sure there are no extra spaces in the password
- Verify you're using the SMTP key, not API key

### "Sender not verified"
- Go to Brevo dashboard → Senders & IP
- Verify notifications@deemeet.in
- OR use a verified sender email temporarily

### Emails not arriving
- Check Brevo dashboard for sending stats
- Look in spam folder
- Verify sender is authenticated in Brevo

### Rate limit exceeded
- Free tier: 300 emails/day
- Check usage in Brevo dashboard
- Upgrade plan if needed

---

## 📧 What Happens Next

When someone books a meeting:

1. **Appointment created** in MongoDB
2. **Google Meet link generated** (if connected)
3. **Two emails sent via Brevo:**
   - ✅ Guest confirmation → guest@email.com
   - ✅ Host notification → your@email.com
4. **Calendar invite** via Google Calendar

All emails will be sent from: **notifications@deemeet.in**

---

## 📈 Monitoring Emails

### Brevo Dashboard
1. Log in to https://app.brevo.com
2. Go to **Statistics** → **Email**
3. View:
   - Emails sent
   - Delivery rate
   - Open rate
   - Bounces
   - Spam reports

### Backend Logs
Check terminal output for:
```
INFO - Confirmation email sent to guest@email.com from notifications@deemeet.in
INFO - Host notification sent to host@email.com from notifications@deemeet.in
```

Or check for errors:
```
ERROR - Failed to send email: [error details]
```

---

## ⚙️ Current Configuration Summary

| Setting | Value |
|---------|-------|
| Provider | Brevo (Sendinblue) |
| SMTP Server | smtp-relay.brevo.com |
| Port | 587 (TLS) |
| From Email | notifications@deemeet.in |
| From Name | DeeMeet |
| Daily Limit | 300 emails (free tier) |

---

## 🎨 Email Templates

Your emails now include:

**Guest Confirmation:**
- Professional header with gradient
- Meeting details card
- Google Meet link (green call-out box)
- Calendar invitation notice
- Reschedule/cancel information

**Host Notification:**
- New booking alert
- Guest contact information
- Meeting details
- Google Meet link
- Dashboard management link

---

## ✅ Next Steps

1. **Verify sender email** in Brevo dashboard
2. **Restart backend server**
3. **Create test booking**
4. **Check both inboxes**
5. **Verify emails look correct**
6. **(Optional) Set up domain authentication** for best deliverability

---

Need help? Check the Brevo documentation: https://help.brevo.com/hc/en-us/articles/209462765-Configure-your-SMTP-server-to-relay-emails
