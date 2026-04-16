const { createEmailTransport } = require('./src/services/emailTransport');
const dotenv = require('dotenv');

dotenv.config();

async function debugEmail() {
  console.log('🔍 Debugging Email Configuration...\n');

  // Check environment variables
  console.log('Environment Variables:');
  console.log('MAILTRAP_TOKEN:', process.env.MAILTRAP_TOKEN ? '✅ Set' : '❌ Not set');
  console.log('MAILTRAP_SENDER_EMAIL:', process.env.MAILTRAP_SENDER_EMAIL || 'Not set');
  console.log('MAILTRAP_SENDER_NAME:', process.env.MAILTRAP_SENDER_NAME || 'Not set');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || 'Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
  console.log();

  // Check which transport is being used
  const useMailtrap = Boolean(
    process.env.MAILTRAP_TOKEN && process.env.MAILTRAP_TOKEN !== 'your_mailtrap_token'
  );

  const useSendGrid = Boolean(
    process.env.SENDGRID_API_KEY &&
    process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key' &&
    process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_placeholder'
  );

  const useGmail = Boolean(
    process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
  );

  console.log('Transport Selection:');
  console.log('useGmail:', useGmail);
  console.log('useSendGrid:', useSendGrid);
  console.log('useMailtrap:', useMailtrap);
  console.log();

  try {
    const transport = createEmailTransport();
    console.log('✅ Email transport created successfully');
    console.log('Transport type:', transport.constructor.name);

    // Test email
    console.log('\n📧 Sending test email...');
    const mailOptions = {
      to: 'thebackendlegend@gmail.com',
      subject: 'StudyBuddy Debug Test',
      text: 'This is a debug test email from StudyBuddy to verify Mailtrap integration!',
      category: 'Debug Test'
    };

    const result = await transport.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
  }
}

debugEmail();