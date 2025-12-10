const nodemailer = require('nodemailer');

// Email service configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Welcome email template
const getWelcomeEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Seattle Leopards FC</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 16px;
        }
        .welcome-message {
          font-size: 18px;
          color: #333;
          margin-bottom: 25px;
        }
        .user-info {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #007bff;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .next-steps {
          background-color: #e7f3ff;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .step {
          margin-bottom: 15px;
          padding-left: 25px;
          position: relative;
        }
        .step::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #28a745;
          font-weight: bold;
        }
        .contact-info {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 5px;
          font-weight: bold;
        }
        .button:hover {
          background-color: #0056b3;
        }
        .social-links {
          text-align: center;
          margin: 20px 0;
        }
        .social-link {
          display: inline-block;
          margin: 0 10px;
          color: #007bff;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div class="subtitle">Your Journey Starts Here</div>
        </div>

        <div class="welcome-message">
          <h2>Welcome to the Family, ${user.name}! 🎉</h2>
          <p>We're thrilled to have you join Seattle Leopards FC! You're now part of our amazing soccer community where passion, teamwork, and excellence come together.</p>
        </div>

        <div class="user-info">
          <h3>Your Account Details</h3>
          <div class="info-item">
            <span class="info-label">Name:</span> ${user.name}
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span> ${user.email}
          </div>
          <div class="info-item">
            <span class="info-label">Username:</span> ${user.username}
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span> ${user.phone}
          </div>
          <div class="info-item">
            <span class="info-label">Registration Date:</span> ${new Date().toLocaleDateString()}
          </div>
        </div>

        <div class="next-steps">
          <h3>What's Next?</h3>
          <div class="step">Complete your profile with additional information</div>
          <div class="step">Explore our programs and teams</div>
          <div class="step">Join our community discussions</div>
          <div class="step">Stay updated with club news and events</div>
          <div class="step">Connect with coaches and fellow players</div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" class="button">Complete Profile</a>
        </div>

        <div class="contact-info">
          <h3>Need Help?</h3>
          <p>Our team is here to support you every step of the way:</p>
          <p><strong>Email:</strong> info@seattleleopardsfc.com</p>
          <p><strong>Phone:</strong> (206) 555-0123</p>
          <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
        </div>

        <div class="social-links">
          <h3>Follow Us</h3>
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">Instagram</a>
          <a href="#" class="social-link">Twitter</a>
          <a href="#" class="social-link">YouTube</a>
        </div>

        <div class="footer">
          <p>This email was sent to ${user.email} because you registered for Seattle Leopards FC.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Welcome to Seattle Leopards FC, ${user.name}! ⚽`,
      html: getWelcomeEmailTemplate(user)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', user.email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send welcome email to:', user.email, error);
    return { success: false, error: error.message };
  }
};

// Send bulk welcome emails
const sendBulkWelcomeEmails = async (users) => {
  const results = [];
  
  for (const user of users) {
    const result = await sendWelcomeEmail(user);
    results.push({
      userId: user._id,
      email: user.email,
      name: user.name,
      ...result
    });
    
    // Add small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};

// Send custom email
const sendCustomEmail = async (to, subject, content, isHtml = true) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      [isHtml ? 'html' : 'text']: content
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send email to:', to, error);
    return { success: false, error: error.message };
  }
};

// Password reset email template
const getPasswordResetEmailTemplate = (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Seattle Leopards FC</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #dc3545;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #dc3545;
          margin-bottom: 10px;
        }
        .reset-button {
          display: inline-block;
          background-color: #dc3545;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .reset-button:hover {
          background-color: #c82333;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div style="color: #666; font-size: 16px;">Password Reset Request</div>
        </div>

        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password for your Seattle Leopards FC account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" class="reset-button">Reset My Password</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
          ${resetUrl}
        </p>
        
        <div class="warning">
          <strong>⚠️ Important Security Information:</strong>
          <ul>
            <li>This link will expire in 1 hour for security reasons</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Your password will not be changed until you click the link above</li>
          </ul>
        </div>
        
        <p>If you have any questions or need assistance, please contact our support team.</p>
        
        <div class="footer">
          <p>This email was sent to ${user.email} because a password reset was requested for your Seattle Leopards FC account.</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Username recovery email template
const getUsernameRecoveryEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Username Recovery - Seattle Leopards FC</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .username-box {
          background-color: #e7f3ff;
          border: 2px solid #007bff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .username {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          font-family: monospace;
        }
        .login-button {
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div style="color: #666; font-size: 16px;">Username Recovery</div>
        </div>

        <h2>Your Username</h2>
        <p>Hello ${user.name},</p>
        <p>You requested your username for your Seattle Leopards FC account. Here it is:</p>
        
        <div class="username-box">
          <div style="color: #666; margin-bottom: 10px;">Your Username:</div>
          <div class="username">${user.username}</div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="login-button">Go to Login</a>
        </div>
        
        <p>If you still can't access your account, you may need to reset your password. You can do this from the login page.</p>
        
        <div class="footer">
          <p>This email was sent to ${user.email} because a username recovery was requested for your Seattle Leopards FC account.</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Password Reset Request - Seattle Leopards FC`,
      html: getPasswordResetEmailTemplate(user, resetToken)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully to:', user.email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send password reset email to:', user.email, error);
    return { success: false, error: error.message };
  }
};

// Send username recovery email
const sendUsernameRecoveryEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Username - Seattle Leopards FC`,
      html: getUsernameRecoveryEmailTemplate(user)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Username recovery email sent successfully to:', user.email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send username recovery email to:', user.email, error);
    return { success: false, error: error.message };
  }
};

// Payment receipt email template
const getPaymentReceiptEmailTemplate = (user, payment) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - Seattle Leopards FC</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #166534;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #166534;
          margin-bottom: 10px;
        }
        .success-badge {
          display: inline-block;
          background-color: #dcfce7;
          color: #166534;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: bold;
          margin: 10px 0;
        }
        .receipt-details {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
        }
        .detail-value {
          font-weight: bold;
        }
        .total-row {
          background-color: #f0fdf4;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
          font-size: 1.2em;
        }
        .total-row .detail-value {
          color: #166534;
        }
        .next-steps {
          background-color: #e7f3ff;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background-color: #166534;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 5px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div style="color: #666; font-size: 16px;">Payment Receipt</div>
          <div class="success-badge">✓ Payment Successful</div>
        </div>

        <h2>Thank You for Your Payment!</h2>
        <p>Hello ${user.name},</p>
        <p>Your payment has been successfully processed. Here are your receipt details:</p>
        
        <div class="receipt-details">
          <div class="detail-row">
            <span class="detail-label">Transaction ID</span>
            <span class="detail-value" style="font-family: monospace;">${payment.transactionId}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Type</span>
            <span class="detail-value">${payment.paymentType}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method</span>
            <span class="detail-value">${payment.paymentMethod === 'credit_card' || payment.paymentMethod === 'debit_card' 
              ? `${payment.cardType || 'Card'} ending in ${payment.cardLastFour || '****'}` 
              : payment.paymentMethod?.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</span>
          </div>
          <div class="total-row">
            <div class="detail-row" style="border-bottom: none; padding: 0;">
              <span class="detail-label" style="font-weight: bold; font-size: 1em;">Amount Paid</span>
              <span class="detail-value">$${payment.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="next-steps">
          <h3>What's Next?</h3>
          <p>A club administrator will review your registration and assign you to a team based on your program selection. You'll receive a notification when your team assignment is complete.</p>
          <p>In the meantime, feel free to explore your account and connect with other members!</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/account" class="button">Go to My Account</a>
        </div>
        
        <div class="footer">
          <p>This receipt was sent to ${user.email}</p>
          <p>Please keep this email for your records.</p>
          <p>Questions? Contact us at support@seattleleopardsfc.com</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send payment receipt email
const sendPaymentReceiptEmail = async (user, payment) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Payment Receipt - $${payment.amount.toFixed(2)} - Seattle Leopards FC`,
      html: getPaymentReceiptEmailTemplate(user, payment)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Payment receipt email sent successfully to:', user.email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send payment receipt email to:', user.email, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBulkWelcomeEmails,
  sendCustomEmail,
  getWelcomeEmailTemplate,
  sendPasswordResetEmail,
  sendUsernameRecoveryEmail,
  getPasswordResetEmailTemplate,
  getUsernameRecoveryEmailTemplate,
  sendPaymentReceiptEmail,
  getPaymentReceiptEmailTemplate
};
