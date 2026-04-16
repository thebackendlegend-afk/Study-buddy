#!/usr/bin/env node
/**
 * Comprehensive Email & OTP Diagnostic Tool
 * Tests both email sending and SMS/OTP sending
 */

const dotenv = require('dotenv');
const twilio = require('twilio');
const { createEmailTransport } = require('./src/services/emailTransport');

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(type, message) {
  const icons = {
    error: '❌',
    success: '✅',
    warning: '⚠️ ',
    info: 'ℹ️ ',
    test: '🧪'
  };
  console.log(`${icons[type]} ${message}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}\n`);
}

async function checkEnvironment() {
  logSection('ENVIRONMENT CHECK');

  const checks = {
    'SendGrid Email': {
      required: ['SENDGRID_API_KEY'],
      values: {
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? '***SET***' : 'NOT SET',
        EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET'
      }
    },
    'Twilio SMS': {
      required: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER', 'TWILIO_VERIFY_SERVICE_ID'],
      values: {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'AC***' : 'NOT SET',
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? '***SET***' : 'NOT SET',
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
        TWILIO_VERIFY_SERVICE_ID: process.env.TWILIO_VERIFY_SERVICE_ID
      }
    }
  };

  for (const [service, config] of Object.entries(checks)) {
    console.log(`\n${colors.bold}${service}:${colors.reset}`);
    for (const [key, value] of Object.entries(config.values)) {
      if (value === 'NOT SET') {
        log('error', `  ${key}: ${value}`);
      } else {
        log('success', `  ${key}: ${value}`);
      }
    }
  }
}

async function testEmailTransport() {
  logSection('EMAIL TRANSPORT TEST');

  try {
    const transport = createEmailTransport();
    log('success', 'Email transport created successfully');
    log('info', `Transport type: ${transport.constructor.name}`);

    // Determine which provider is active
    if (process.env.SENDGRID_API_KEY) {
      log('info', 'Using: SendGrid');
    }

    return transport;
  } catch (error) {
    log('error', `Failed to create email transport: ${error.message}`);
    return null;
  }
}

async function sendTestEmail(transport) {
  if (!transport) {
    log('warning', 'Skipping email test - no transport available');
    return false;
  }

  logSection('SEND TEST EMAIL');

  const testEmail = process.env.EMAIL_USER || 'thebackendlegend@gmail.com';

  console.log(`Sending test email to: ${testEmail}\n`);

  try {
    const result = await transport.sendMail({
      to: testEmail,
      subject: '📧 StudyBuddy Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">StudyBuddy Email Test</h2>
          <p>This is a test email to verify your email configuration is working.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p style="color: #666; font-size: 12px;">This is an automated test email. You can safely ignore it.</p>
        </div>
      `,
      text: 'This is a test email from StudyBuddy.'
    });

    log('success', 'Test email sent successfully!');
    if (result.messageId) {
      log('info', `Message ID: ${result.messageId}`);
    }
    if (result.response) {
      log('info', `Response: ${result.response}`);
    }
    return true;
  } catch (error) {
    log('error', `Failed to send test email:`);
    console.log(`  ${error.message}`);
    if (error.code) log('info', `  Error code: ${error.code}`);
    return false;
  }
}

async function testTwilioSMS() {
  logSection('TWILIO SMS TEST');

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  // Check if Twilio is configured
  if (!accountSid || !authToken || !phoneNumber) {
    log('warning', 'Twilio SMS not configured - skipping SMS test');
    log('info', 'To enable SMS:');
    log('info', '  1. Get credentials from https://www.twilio.com/console');
    log('info', '  2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in .env');
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    log('success', 'Twilio client initialized successfully');
    log('info', `Phone number: ${phoneNumber}`);

    // Check Verify Service
    if (!process.env.TWILIO_VERIFY_SERVICE_ID) {
      log('warning', 'Twilio Verify Service ID not set - SMS verification disabled');
      log('info', 'To enable SMS verification:');
      log('info', '  1. Go to https://www.twilio.com/console/verify/services');
      log('info', '  2. Create a new service and copy the Service SID');
      log('info', '  3. Set TWILIO_VERIFY_SERVICE_ID in .env');
      return;
    }

    const verifyService = client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_ID);
    log('success', `Twilio Verify Service configured: ${process.env.TWILIO_VERIFY_SERVICE_ID}`);
    log('info', 'SMS verification is ready to use');

  } catch (error) {
    log('error', `Twilio initialization failed: ${error.message}`);
  }
}

async function testVerificationService() {
  logSection('VERIFICATION SERVICE TEST');

  try {
    const VerificationService = require('./src/services/verificationService');

    // Test email verification code generation
    const emailCode = VerificationService.generateVerificationCode();
    log('success', `Generated email verification code: ${emailCode}`);

    // Test SMS verification code generation
    const smsCode = VerificationService.generateVerificationCode();
    log('success', `Generated SMS verification code: ${smsCode}`);

    log('info', 'Verification service is operational');
  } catch (error) {
    log('error', `Verification service error: ${error.message}`);
  }
}

async function checkDatabaseConnection() {
  logSection('DATABASE CONNECTION CHECK');

  try {
    const admin = require('firebase-admin');
    const serviceAccount = require('./firebase-key.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    const db = admin.firestore();
    await db.collection('_test_').doc('_test_').set({ test: true });
    await db.collection('_test_').doc('_test_').delete();

    log('success', 'Firebase Firestore connected successfully');
  } catch (error) {
    log('warning', `Firebase connection not tested: ${error.message}`);
  }
}

async function printRecommendations() {
  logSection('RECOMMENDATIONS');

  const hasSendGrid = process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key';
  const hasTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER;

  console.log('\n📋 Quick Status:\n');
  console.log(`Email:  ${hasSendGrid ? '✅ READY' : '❌ NEEDS SETUP'}`);
  console.log(`SMS:    ${hasTwilio ? '✅ READY' : '❌ NEEDS SETUP'}`);

  if (!hasSendGrid) {
    console.log('\n🔧 To enable EMAIL, setup SendGrid:\n');
    console.log('  1. Go to https://app.sendgrid.com/settings/api_keys');
    console.log('  2. Create a new API key');
    console.log('  3. Update .env:\n');
    console.log('     SENDGRID_API_KEY=<your_api_key>');
    console.log('     EMAIL_FROM=noreply@studybuddy.app\n');
  }

  if (!hasTwilio) {
    console.log('🔧 To enable SMS, setup Twilio:\n');
    console.log('  1. Go to https://www.twilio.com/console');
    console.log('  2. Copy Account SID and Auth Token');
    console.log('  3. Get your phone number');
    console.log('  4. Update .env:\n');
    console.log('     TWILIO_ACCOUNT_SID=ACxxxxx');
    console.log('     TWILIO_AUTH_TOKEN=xxxxx');
    console.log('     TWILIO_PHONE_NUMBER=+1234567890\n');
  }
}

async function runDiagnostics() {
  console.log(`${colors.bold}${colors.blue}
╔════════════════════════════════════════╗
║  StudyBuddy Email & OTP Diagnostics    ║
║                                        ║
╚════════════════════════════════════════╝${colors.reset}\n`);

  await checkEnvironment();
  const transport = await testEmailTransport();
  await sendTestEmail(transport);
  await testTwilioSMS();
  await testVerificationService();
  await printRecommendations();

  console.log(`\n${colors.bold}✨ Diagnostics complete!${colors.reset}\n`);
}

runDiagnostics().catch(console.error);
