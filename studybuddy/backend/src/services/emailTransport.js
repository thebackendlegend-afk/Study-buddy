const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();

const useSendGrid = Boolean(
  process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key'
);

if (useSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

if (useSendGrid) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function buildSendGridMessage(mailOptions) {
  const message = {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html,
    attachments: (mailOptions.attachments || []).map((attachment) => ({
      content:
        attachment.content && typeof attachment.content === 'string'
          ? Buffer.from(attachment.content).toString('base64')
          : attachment.content,
      filename: attachment.filename,
      type: attachment.contentType || attachment.contentType || 'application/octet-stream',
      disposition: attachment.contentDisposition || 'attachment',
    })),
  };
  return message;
}

function createEmailTransport() {
  // Use SendGrid as the primary email provider
  if (useSendGrid) {
    console.log('[EMAIL] Using SendGrid transport');
    return {
      sendMail: async (mailOptions) => {
        const sgMessage = buildSendGridMessage({
          ...mailOptions,
          from: mailOptions.from || {
            email: process.env.EMAIL_FROM || 'noreply@studybuddy.app',
            name: 'StudyBuddy AI'
          }
        });
        return sgMail.send(sgMessage);
      },
    };
  }

  throw new Error('[EMAIL] SendGrid API key not configured. Please set SENDGRID_API_KEY in .env');
}

module.exports = {
  createEmailTransport,
};
