const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
const VerificationService = require('../services/verificationService');

dotenv.config();

const router = express.Router();

// In-memory storage for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, parentEmail } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    // Generate verification codes (email uses local codes, SMS uses Twilio Verify)
    const emailCode = VerificationService.generateVerificationCode();

    // Store email verification code with timestamp
    verificationCodes.set(`email_${email}`, {
      code: emailCode,
      timestamp: Date.now(),
      userData: { name, email, password, phoneNumber, parentEmail }
    });

    // For SMS: store user data but let Twilio Verify generate the code
    if (phoneNumber) {
      verificationCodes.set(`phone_${phoneNumber}`, {
        timestamp: Date.now(),
        userData: { name, email, password, phoneNumber, parentEmail }
      });
    }

    // Send verification emails/SMS
    try {
      await VerificationService.sendEmailVerification(email, emailCode);
      if (phoneNumber) {
        await VerificationService.sendSMSVerification(phoneNumber, null);
      }
    } catch (verificationError) {
      console.error('Verification service error:', verificationError.message);
      // Continue with signup even if verification services fail
    }

    res.json({
      message: 'Verification codes sent. Please verify your email and phone number.',
      requiresVerification: true,
      emailSent: true,
      smsSent: !!phoneNumber
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const storedData = verificationCodes.get(`email_${email}`);
    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found for this email.' });
    }

    await VerificationService.verifyEmailCode(email, code, storedData.code, storedData.timestamp);

    // Mark email as verified
    verificationCodes.set(`email_${email}`, {
      ...storedData,
      emailVerified: true
    });

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-phone', async (req, res, next) => {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and verification code are required.' });
    }

    const storedData = verificationCodes.get(`phone_${phoneNumber}`);
    if (!storedData) {
      return res.status(400).json({ error: 'No verification request found for this phone number.' });
    }

    // For Twilio Verify: pass null storedCode/timestamp, service will validate via Twilio API
    await VerificationService.verifySMSCode(phoneNumber, code, null, null);

    // Mark phone as verified
    verificationCodes.set(`phone_${phoneNumber}`, {
      ...storedData,
      phoneVerified: true
    });

    res.json({ message: 'Phone number verified successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/complete-signup', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const storedData = verificationCodes.get(`email_${email}`);
    if (!storedData) {
      return res.status(400).json({ error: 'No signup data found. Please start signup again.' });
    }

    if (!storedData.emailVerified) {
      return res.status(400).json({ error: 'Email must be verified before completing signup.' });
    }

    // Check phone verification if phone number was provided
    if (storedData.userData.phoneNumber) {
      const phoneData = verificationCodes.get(`phone_${storedData.userData.phoneNumber}`);
      if (!phoneData || !phoneData.phoneVerified) {
        return res.status(400).json({ error: 'Phone number must be verified before completing signup.' });
      }
    }

    // Create the user
    const passwordHash = await bcrypt.hash(storedData.userData.password, 10);
    const user = await User.create({
      ...storedData.userData,
      passwordHash,
      emailVerified: true,
      phoneVerified: !!storedData.userData.phoneNumber
    });

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Clean up verification codes
    verificationCodes.delete(`email_${email}`);
    if (storedData.userData.phoneNumber) {
      verificationCodes.delete(`phone_${storedData.userData.phoneNumber}`);
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        parentEmail: user.parentEmail,
        emailVerified: true,
        phoneVerified: !!storedData.userData.phoneNumber
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, parentEmail: user.parentEmail, streak: user.streak, totalStudyMinutes: user.totalStudyMinutes }, token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
