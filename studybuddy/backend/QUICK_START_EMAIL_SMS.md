#!/usr/bin/env node
/**
 * StudyBuddy Email & OTP Quick Start Guide
 * This file explains how to set up and test email and SMS functionality
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  StudyBuddy Email & OTP - Quick Start Guide                   ║
╚════════════════════════════════════════════════════════════════╝

📋 CURRENT STATUS:

  Email:  Using Mailtrap (configured)
  SMS:    Using Twilio Verify (configured)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 EMAIL SETUP - MAILTRAP

Current Configuration:
  ✅ MAILTRAP_TOKEN: Set
  ✅ MAILTRAP_SENDER_EMAIL: hello@demomailtrap.co

IMPORTANT: Mailtrap Demo Inbox only sends to:
  ➜ The account owner's email
  ➜ For testing purposes only (emails don't go to real users)

Setup Steps:
  1. Go to https://mailtrap.io/dashboard
  2. In the Inbox, look for the "Inbound address" or "Demo email address"
  3. This is the email you'll receive test emails at
  4. Update .env if needed:
     MAILTRAP_TOKEN=<your_token>
     MAILTRAP_SENDER_EMAIL=<your_account_email>@mailtrap.io

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 SMS SETUP - TWILIO

Current Configuration:
  ✅ TWILIO_ACCOUNT_SID: Set
  ✅ TWILIO_AUTH_TOKEN: Set
  ✅ TWILIO_PHONE_NUMBER: +918849697467
  ✅ TWILIO_VERIFY_SERVICE_ID: Set

Setup Steps:
  1. Go to https://www.twilio.com/console
  2. SMS is already configured and ready to use
  3. Make sure your phone number is verified in Twilio for testing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TESTING ENDPOINTS

Start your backend server:
  npm run dev

Then test the following:

1️⃣ CHECK CONFIGURATION:
  GET http://localhost:5000/api/debug/config
  
  Response shows which providers are active

2️⃣ SEND TEST EMAIL:
  POST http://localhost:5000/api/test/send-email
  
  Body (JSON):
  {
    "to": "your_mailtrap_email@mailtrap.io",
    "subject": "Test Email",
    "message": "This is a test"
  }
  
  Response:
  {
    "success": true,
    "messageId": "...",
    "recipient": "..."
  }

3️⃣ SEND TEST SMS:
  POST http://localhost:5000/api/test/send-sms
  
  Body (JSON):
  {
    "to": "+918849697467",
    "message": "StudyBuddy Test SMS"
  }
  
  Response:
  {
    "success": true,
    "messageSid": "..."
  }

4️⃣ SEND TEST OTP (Email + SMS):
  POST http://localhost:5000/api/test/send-otp
  
  Body (JSON):
  {
    "email": "your_mailtrap_email@mailtrap.io",
    "phoneNumber": "+918849697467"
  }
  
  Response:
  {
    "success": true,
    "results": {
      "email": { "sent": true, "code": "123456" },
      "sms": { "sent": true }
    }
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 TROUBLESHOOTING

❌ Email: "Demo domains can only be used to send emails to account owners"
  → Solution: Send to your Mailtrap account email, not random addresses
  → Update MAILTRAP_SENDER_EMAIL in .env

❌ SMS: "Twilio Verify Service not configured"
  → Solution: Go to https://www.twilio.com/console/verify/services
  → Ensure TWILIO_VERIFY_SERVICE_ID is set

❌ Email won't send
  → Check the backend logs for detailed error messages
  → Run: node diagnose.js

❌ SMS won't send
  → Verify phone number format: +<country><number>
  → Example: +918849697467

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 VERIFICATION FLOW (How it works)

Signup:
  1. User enters email & phone
  2. Backend generates OTP code
  3. Email OTP sent via Mailtrap
  4. SMS OTP sent via Twilio Verify
  5. User enters both codes
  6. Account created & verified

The API logs show detailed info:
  [EMAIL] ✅ Verification email sent to ...
  [SMS] ✅ SMS verification initiated for ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 USEFUL COMMANDS

Run diagnostic:
  node diagnose.js

Test email directly:
  curl -X POST http://localhost:5000/api/test/send-email \\
    -H "Content-Type: application/json" \\
    -d '{"to":"your_email@mailtrap.io"}'

Test SMS directly:
  curl -X POST http://localhost:5000/api/test/send-sms \\
    -H "Content-Type: application/json" \\
    -d '{"to":"+918849697467"}'

Check logs:
  npm run dev  # Watch terminal output

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
