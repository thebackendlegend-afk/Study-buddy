const { createEmailTransport } = require('./emailTransport');
const twilio = require('twilio');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const transporter = createEmailTransport();

let twilioClient = null;
let twilioVerifyService = null;

if (process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid' &&
    process.env.TWILIO_AUTH_TOKEN !== 'your_twilio_auth_token') {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  // Initialize Twilio Verify service
  if (process.env.TWILIO_VERIFY_SERVICE_ID) {
    twilioVerifyService = twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_ID);
  }
}

class VerificationService {
  static generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static async sendEmailVerification(email, code) {
    try {
      const mailOptions = {
        to: email,
        subject: '📧 StudyBuddy - Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
            <h2 style="color: #7c3aed; text-align: center;">Welcome to StudyBuddy! 👋</h2>
            <p style="color: #475569; font-size: 16px;">Your email verification code is:</p>
            <div style="background: white; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #7c3aed;">
              <h1 style="color: #7c3aed; font-size: 48px; margin: 0; letter-spacing: 10px; font-weight: bold;">${code}</h1>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p style="color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">If you didn't request this verification, please ignore this email.</p>
          </div>
        `,
        text: `Your StudyBuddy email verification code is: ${code}\n\nThis code will expire in 10 minutes.`
      };

      await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] ✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error(`[EMAIL] ❌ Failed to send verification email to ${email}:`, error.message);
      throw error;
    }
  }

  static async sendSMSVerification(phoneNumber, code) {
    if (!twilioVerifyService) {
      console.log(`[SMS] ⚠️  Twilio Verify NOT CONFIGURED - Code for ${phoneNumber}: ${code}`);
      console.log('[SMS] Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_ID in .env');
      // Don't throw - let verification continue with fallback
      return;
    }

    try {
      const verification = await twilioVerifyService.verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });
      console.log(`[SMS] ✅ SMS verification initiated for ${phoneNumber} (SID: ${verification.sid})`);
      return true;
    } catch (error) {
      console.error(`[SMS] ❌ Failed to send SMS to ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  static async verifySMSCode(phoneNumber, code, storedCode, storedTimestamp) {
    if (!twilioVerifyService) {
      console.log(`[SMS] ⚠️  Twilio Verify not configured - falling back to code validation`);
      return this.verifyEmailCode(phoneNumber, code, storedCode, storedTimestamp);
    }

    try {
      const verificationCheck = await twilioVerifyService.verificationChecks.create({
        to: phoneNumber,
        code: code,
      });

      if (verificationCheck.status === 'approved') {
        console.log(`[SMS] ✅ SMS code verified successfully for ${phoneNumber}`);
        return true;
      } else {
        console.log(`[SMS] ❌ SMS verification failed - Status: ${verificationCheck.status}`);
        throw new Error(`Verification failed: ${verificationCheck.status}`);
      }
    } catch (error) {
      console.error(`[SMS] ❌ SMS code verification error for ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  static async verifyEmailCode(email, code, storedCode, storedTimestamp) {
    if (!storedCode || !storedTimestamp) {
      throw new Error('No verification code found');
    }

    const now = Date.now();
    const codeAge = now - storedTimestamp;

    // Code expires after 10 minutes
    if (codeAge > 10 * 60 * 1000) {
      throw new Error('Verification code has expired');
    }

    if (storedCode !== code) {
      throw new Error('Invalid verification code');
    }

    return true;
  }
}

module.exports = VerificationService;