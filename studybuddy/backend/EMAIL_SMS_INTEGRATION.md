# Email & OTP System - Complete Documentation

## Overview

StudyBuddy now has a fully functional email and SMS verification system with comprehensive diagnostics and testing tools.

## Features

✅ **Email Verification**
- Multi-provider support (Mailtrap, Gmail, SendGrid)
- Automatic provider selection with fallbacks
- Beautiful HTML email templates
- Detailed logging

✅ **SMS/OTP Verification**
- Twilio Verify integration
- One-click SMS sending
- Support for verification codes
- Automatic fallback handling

✅ **Comprehensive Diagnostics**
- Check configuration status
- Test each provider independently
- Detailed error messages
- Quick troubleshooting guide

## Configuration Files

### Environment Variables (.env)

**Email Configuration:**
```env
# Option 1: Mailtrap (Recommended for testing)
MAILTRAP_TOKEN=<your_token>
MAILTRAP_SENDER_EMAIL=<account_email>@mailtrap.io
MAILTRAP_SENDER_NAME=StudyBuddy AI

# Option 2: Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=<app_password>

# Option 3: SendGrid
SENDGRID_API_KEY=SG.xxxxx
```

**SMS Configuration (Twilio):**
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_VERIFY_SERVICE_ID=VAxxxxx
```

## Usage

### 1. Run Diagnostics

Check your current configuration:

```bash
node diagnose.js
```

Output shows:
- ✅ What's configured
- ✅ What's not configured
- ✅ Recommendations for fixes

### 2. Test Email

Send a test email:

```bash
curl -X POST http://localhost:5000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your_mailtrap_email@mailtrap.io",
    "subject": "Test Email",
    "message": "Hello from StudyBuddy!"
  }'
```

### 3. Test SMS

Send a test SMS:

```bash
curl -X POST http://localhost:5000/api/test/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+918849697467",
    "message": "StudyBuddy Test SMS"
  }'
```

### 4. Test OTP

Send both email and SMS OTPs:

```bash
curl -X POST http://localhost:5000/api/test/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_mailtrap_email@mailtrap.io",
    "phoneNumber": "+918849697467"
  }'
```

## Architecture

### Email Transport (`src/services/emailTransport.js`)

**Priority Order:**
1. **Mailtrap** (primary - best for testing, emails go to inbox)
2. **Gmail** (fallback - requires valid App Password)
3. **SendGrid** (fallback - requires API key)

**Why this order:**
- Mailtrap is most reliable for development
- Gmail requires less setup but can have auth issues
- SendGrid is a good production option

### Verification Service (`src/services/verificationService.js`)

**Key Functions:**
- `generateVerificationCode()` - Creates 6-digit codes
- `sendEmailVerification(email, code)` - Sends OTP via email
- `sendSMSVerification(phoneNumber)` - Sends OTP via SMS
- `verifyEmailCode()` - Validates email codes (10-min expiry)
- `verifySMSCode()` - Validates SMS codes via Twilio

**Error Handling:**
- Graceful fallbacks when providers unavailable
- Detailed console logging with `[EMAIL]` and `[SMS]` prefixes
- Proper error messages for debugging

### API Endpoints

#### Debug
```
GET /api/debug/config
Returns current email/SMS configuration status
```

#### Testing
```
POST /api/test/send-email
POST /api/test/send-sms
POST /api/test/send-otp
Send test messages for verification
```

## Troubleshooting

### Email Issues

**Issue:** "Demo domains can only be used to send emails to account owners"
- **Cause:** Sending to wrong email in Mailtrap
- **Fix:** Send to your Mailtrap inbox email, not user emails

**Issue:** "Invalid login" (Gmail)
- **Cause:** Using wrong password or placeholder
- **Fix:** Generate App Password from https://myaccount.google.com/apppasswords

**Issue:** Email not received
- **Check:** 
  - Run `node diagnose.js`
  - Check console logs for `[EMAIL]` messages
  - Verify provider in use
  - Check spam folder

### SMS Issues

**Issue:** "SMS not received"
- **Check:**
  - Phone format: must start with `+` and country code
  - Phone verified in Twilio console
  - Run `node diagnose.js`

**Issue:** "Twilio Verify Service not configured"
- **Fix:** Set `TWILIO_VERIFY_SERVICE_ID` in .env
- **Get it:** https://www.twilio.com/console/verify/services

## Key Improvements Made

1. **Better Provider Selection**
   - Mailtrap now prioritized (more reliable)
   - Automatic fallback to other providers
   - Clear logging of which provider is used

2. **Enhanced Logging**
   - All logs prefixed with `[EMAIL]` or `[SMS]`
   - Shows success/failure clearly
   - Includes message IDs for tracking

3. **Comprehensive Diagnostics**
   - `diagnose.js` script checks everything
   - Shows what's configured vs what's not
   - Provides actionable recommendations

4. **Test Endpoints**
   - Easy testing without frontend
   - Test individual providers
   - Test complete OTP flow

5. **Better Error Messages**
   - Detailed error descriptions
   - Suggestions for fixes
   - Links to setup resources

## Testing Workflow

### Step 1: Check Configuration
```bash
node diagnose.js
```

### Step 2: Test Email
```bash
curl -X POST http://localhost:5000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your_mailtrap_email@mailtrap.io"}'
```

### Step 3: Test SMS
```bash
curl -X POST http://localhost:5000/api/test/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to":"+918849697467"}'
```

### Step 4: Test Full OTP Flow
```bash
curl -X POST http://localhost:5000/api/test/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your_mailtrap_email@mailtrap.io","phoneNumber":"+918849697467"}'
```

## Files Modified

1. **`src/services/emailTransport.js`**
   - Prioritized Mailtrap
   - Added better logging
   - Improved error handling

2. **`src/services/verificationService.js`**
   - Enhanced email templates
   - Better SMS logging
   - Improved error messages

3. **`src/app.js`**
   - Added test endpoints
   - Imported required services
   - Added debug configuration

4. **New Files:**
   - `diagnose.js` - Comprehensive diagnostics
   - `QUICK_START_EMAIL_SMS.md` - Quick reference
   - `EMAIL_SMS_INTEGRATION.md` - This documentation

## Next Steps

1. ✅ Email verification working
2. ✅ SMS verification working
3. ✅ Comprehensive diagnostics available
4. ✅ Test endpoints ready
5. Ready for production deployment

## Support

If you encounter issues:

1. Run `node diagnose.js` to check status
2. Check console logs for `[EMAIL]` or `[SMS]` messages
3. Test endpoints individually
4. Verify .env configuration
5. Check email/SMS provider dashboards

