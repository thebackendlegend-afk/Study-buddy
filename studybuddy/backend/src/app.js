const express = require('express');
const cors = require('cors');
const authRoutes = require('./controllers/authController');
const sessionRoutes = require('./controllers/sessionController');
const quizRoutes = require('./controllers/quizController');
const aiRoutes = require('./controllers/aiController');
const errorHandler = require('./middleware/errorHandler');
const { createEmailTransport } = require('./services/emailTransport');
const VerificationService = require('./services/verificationService');
const twilio = require('twilio');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/ai', aiRoutes);

app.post('/api/send-report', async (req, res) => {
  const { screenTime, activities } = req.body;

  // Assume parent email is in env or hardcoded for demo
  const parentEmail = process.env.PARENT_EMAIL || 'parent@example.com';

  const transporter = createEmailTransport();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: parentEmail,
    subject: 'Study Activity Report',
    text: `Screen time: ${screenTime} seconds\nActivities: ${JSON.stringify(activities, null, 2)}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Report sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send report' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StudyBuddy API is alive' });
});

// Debug endpoint: Check email/SMS configuration
app.get('/api/debug/config', (req, res) => {
  const config = {
    email: {
      sendgridApiKey: process.env.SENDGRID_API_KEY ? '***SET***' : 'NOT SET',
      emailFrom: process.env.EMAIL_FROM || 'NOT SET',
      configured: Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key')
    },
    sms: {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'AC***' : 'NOT SET',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'NOT SET',
      configured: Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      )
    }
  };
  res.json(config);
});

// Test email endpoint
app.post('/api/test/send-email', async (req, res) => {
  try {
    const { to = process.env.EMAIL_USER, subject = 'Test Email', message = 'This is a test email' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Email recipient not provided and EMAIL_USER not set' });
    }

    const transport = createEmailTransport();
    const result = await transport.sendMail({
      to,
      subject,
      html: `<div style="font-family: Arial; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h2 style="color: #7c3aed;">StudyBuddy Email Test</h2>
        <p>${message}</p>
        <p style="color: #666; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
      </div>`,
      text: message
    });

    console.log('[TEST] Email sent successfully:', result.messageId);
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: result.messageId,
      recipient: to
    });
  } catch (error) {
    console.error('[TEST] Email sending failed:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
});

// Test SMS endpoint
app.post('/api/test/send-sms', async (req, res) => {
  try {
    const { to = process.env.TWILIO_PHONE_NUMBER, message = 'StudyBuddy Test: This is a test SMS' } = req.body;
    
    if (!to) {
      return res.status(400).json({ error: 'Phone number not provided' });
    }

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(400).json({ error: 'Twilio credentials not configured' });
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('[TEST] SMS sent successfully:', result.sid);
    res.json({ 
      success: true,
      message: 'SMS sent successfully',
      messageSid: result.sid,
      recipient: to
    });
  } catch (error) {
    console.error('[TEST] SMS sending failed:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.toString()
    });
  }
});

// Test OTP endpoint
app.post('/api/test/send-otp', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phone number required' });
    }

    const results = {
      email: null,
      sms: null
    };

    // Send email OTP
    if (email) {
      try {
        const emailCode = VerificationService.generateVerificationCode();
        await VerificationService.sendEmailVerification(email, emailCode);
        results.email = { sent: true, code: emailCode };
      } catch (error) {
        results.email = { sent: false, error: error.message };
      }
    }

    // Send SMS OTP
    if (phoneNumber) {
      try {
        await VerificationService.sendSMSVerification(phoneNumber);
        results.sms = { sent: true };
      } catch (error) {
        results.sms = { sent: false, error: error.message };
      }
    }

    res.json({ 
      success: true,
      message: 'OTP sending attempted',
      results
    });
  } catch (error) {
    console.error('[TEST] OTP sending failed:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

app.use(errorHandler);

module.exports = app;
