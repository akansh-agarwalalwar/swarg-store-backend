const nodemailer = require('nodemailer');

// Configure transporter (use environment variables for sensitive info)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'akanshagarwal.alwar@gmail.com',
    pass: process.env.SMTP_PASS || 'dnmx cdww fwnw npeb',
  },
});

// Reusable function to send an email
async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: '"Swargstore" <akanshagarwal.alwar@gmail.com>',
    to,
    subject,
    html,
  });
}

// Reusable HTML template for subadmin welcome
function subAdminWelcomeTemplate({ username, password }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
      <h2 style="color: #2d3748;">Welcome to Our Platform!</h2>
      <p>Hi <strong>${username}</strong>,</p>
      <p>Thank you for joining as a Subadmin. Your account has been created successfully.</p>
      <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Username:</strong> ${username}</p>
        <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
      </div>
      <p style="color: #718096; font-size: 14px;">Please keep your credentials safe. You can change your password after logging in.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 13px; color: #a0aec0;">If you have any questions, feel free to contact our support team.</p>
    </div>
  `;
}

// Main function to send subadmin welcome email
async function sendSubAdminWelcomeEmail({ to, username, password }) {
  return sendEmail({
    to,
    subject: 'Welcome to the Swargstore - Admin Access',
    html: subAdminWelcomeTemplate({ username, password }),
  });
}

// Reusable HTML template for OTP (password reset)
function otpTemplate({ username, otp }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 24px; background: #fafbfc;">
      <h2 style="color: #2d3748;">Password Reset Request</h2>
      <p>Hi <strong>${username}</strong>,</p>
      <p>We received a request to reset your password. Use the OTP below to proceed:</p>
      <div style="background: #f1f5f9; border-radius: 6px; padding: 16px; margin: 16px 0; text-align: center;">
        <p style="font-size: 24px; letter-spacing: 4px; margin: 0;"><strong>${otp}</strong></p>
      </div>
      <p style="color: #718096; font-size: 14px;">This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 13px; color: #a0aec0;">For security, do not share this OTP with anyone.</p>
    </div>
  `;
}

// Main function to send OTP email
async function sendOtpEmail({ to, username, otp }) {
  return sendEmail({
    to,
    subject: 'Your OTP for Password Reset',
    html: otpTemplate({ username, otp }),
  });
}

module.exports = {
  sendSubAdminWelcomeEmail,
  sendEmail, // for future use
  subAdminWelcomeTemplate, // for future use
  sendOtpEmail, // for OTP
  otpTemplate, // for OTP
};
