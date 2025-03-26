const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text content
 * @param {String} options.html - HTML content
 */
exports.sendEmail = async (options) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Define email options
    const mailOptions = {
      from: `Athlete Management System <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Generate email template
 * @param {String} type - Email type
 * @param {Object} data - Template data
 */
exports.generateEmailTemplate = (type, data) => {
  switch (type) {
    case 'welcome':
      return {
        subject: 'Welcome to Athlete Management System',
        text: `Hi ${data.name},\n\nWelcome to Athlete Management System! We're excited to have you on board.\n\nBest regards,\nThe AMS Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Athlete Management System!</h2>
            <p>Hi ${data.name},</p>
            <p>We're excited to have you on board. Your journey to better athletic performance starts now!</p>
            <p>Get started by completing your profile and exploring the platform.</p>
            <div style="margin: 20px 0;">
              <a href="${data.loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
            </div>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The AMS Team</p>
          </div>
        `
      };
    
    case 'passwordReset':
      return {
        subject: 'Password Reset Request',
        text: `Hi ${data.name},\n\nYou requested a password reset. Please click on the following link to reset your password: ${data.resetUrl}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe AMS Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${data.name},</p>
            <p>You requested a password reset. Please click on the button below to reset your password:</p>
            <div style="margin: 20px 0;">
              <a href="${data.resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>The AMS Team</p>
          </div>
        `
      };
    
    case 'verifyEmail':
      return {
        subject: 'Verify Your Email',
        text: `Hi ${data.name},\n\nPlease verify your email by clicking on the following link: ${data.verificationUrl}\n\nBest regards,\nThe AMS Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email</h2>
            <p>Hi ${data.name},</p>
            <p>Please verify your email by clicking on the button below:</p>
            <div style="margin: 20px 0;">
              <a href="${data.verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </div>
            <p>Best regards,<br>The AMS Team</p>
          </div>
        `
      };
    
    case 'competitionReminder':
      return {
        subject: `Upcoming Competition: ${data.competitionName}`,
        text: `Hi ${data.name},\n\nThis is a reminder that you have an upcoming competition: ${data.competitionName} on ${data.date} at ${data.location}.\n\nBest regards,\nThe AMS Team`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Upcoming Competition Reminder</h2>
            <p>Hi ${data.name},</p>
            <p>This is a reminder that you have an upcoming competition:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Competition:</strong> ${data.competitionName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Location:</strong> ${data.location}</p>
            </div>
            <p>Good luck!</p>
            <p>Best regards,<br>The AMS Team</p>
          </div>
        `
      };
    
    default:
      return {
        subject: 'Notification from Athlete Management System',
        text: data.text || 'This is a notification from Athlete Management System.',
        html: data.html || `<p>This is a notification from Athlete Management System.</p>`
      };
  }
};