# StudyBuddy Email & SMS Setup Guide

## Current Status
Your app is currently **NOT sending** emails or SMS because credentials are not configured.

## Check Configuration
Visit: `http://localhost:5000/api/debug/config`

This will show you:
- ✓ If email is configured
- ✓ If SMS (Twilio) is configured
- ✓ What provider you're using

---

## Option 1: Gmail (Recommended for Testing)

### Step 1: Generate Gmail App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google will generate a **16-character password**
4. Copy it (it has no spaces)

### Step 2: Update `.env` file
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

### Step 3: Restart backend
```bash
npm run dev
```

---

## Option 2: Mailtrap (Best for Testing)

### Step 1: Get Your Token
1. Go to https://mailtrap.io/
2. Sign up (free)
3. Go to **API Tokens** tab
4. Copy your token

### Step 2: Update `.env` file
```env
MAILTRAP_TOKEN=ebecd19f50bc6ac998dc98f0bc17c473
```

### Step 3: Restart backend
```bash
npm run dev
```

Note: Emails sent via Mailtrap go to your Mailtrap inbox (not real users). Good for testing!

---

## Option 3: Twilio (For SMS)

### Step 1: Get Twilio Credentials
1. Go to https://www.twilio.com/console
2. Copy your **Account SID** (starts with `AC...`)
3. Copy your **Auth Token**
4. Go to **Phone Numbers** and copy your **Twilio number** (format: `+1234567890`)

### Step 2: Update `.env` file
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Restart backend
```bash
npm run dev
```

---

## Testing Verification Flow

### 1. Start the backend
```bash
npm run dev
```

### 2. Check config
Open `http://localhost:5000/api/debug/config` in browser

You should see:
```json
{
  "email": {
    "configured": true,
    "usingMailtrap": false
  },
  "sms": {
    "configured": true
  }
}
```

### 3. Test signup
Go to frontend signup and enter:
- Email: your@email.com
- Phone: +1234567890

### 4. Check backend logs
Look for:
- ✓ Email sent successfully → Email was sent
- ⚠️ EMAIL NOT CONFIGURED → Update `.env`

---

## Troubleshooting

### "Email sent successfully" but not received?
- Check spam folder
- For Gmail: Make sure you used **App Password**, not your regular password
- For Mailtrap: Check your Mailtrap inbox instead

### "SMS not received"?
- Verify phone number starts with `+` and country code (e.g., `+13105551234`)
- Check Twilio trial account has your phone verified
- Look at backend logs for error messages

### "EMAIL NOT CONFIGURED"?
- `EMAIL_USER` must NOT be the placeholder `your_actual_email@gmail.com`
- Verify file path: `backend/.env` (not `.env.example`)

### "SMS NOT CONFIGURED"?
- All three required: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- They must NOT be the placeholder values

---

## Quick Fixes

**Option A: Use Both Email Providers** (Backup)
Set both Gmail AND Mailtrap credentials. The app will use Mailtrap if token is set, otherwise Gmail.

**Option B: Test Without Verification**
Comment out verification requirement in `frontend/src/components/Auth/Signup.jsx` temporarily to debug.

**Option C: Check Logs**
Add `console.log()` statements in backend to track verification flow:
```bash
npm run dev  # Watch terminal output when signing up
```
