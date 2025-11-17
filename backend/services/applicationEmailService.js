const nodemailer = require('nodemailer');

// Email service configuration
const createTransporter = () => {
  // Support both EMAIL_USER/EMAIL_PASS and SMTP_USER/SMTP_PASS
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!emailUser || !emailPass) {
    console.warn('⚠️ Email credentials not configured. Emails will be simulated.');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// Get frontend URL
const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
};

// Common email styles
const getEmailStyles = () => {
  return `
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
      .header.success {
        border-bottom-color: #28a745;
      }
      .header.warning {
        border-bottom-color: #ffc107;
      }
      .header.danger {
        border-bottom-color: #dc3545;
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
      .content {
        font-size: 16px;
        color: #333;
        margin-bottom: 25px;
      }
      .info-box {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
        border-left: 4px solid #007bff;
      }
      .info-box.success {
        border-left-color: #28a745;
        background-color: #d4edda;
      }
      .info-box.warning {
        border-left-color: #ffc107;
        background-color: #fff3cd;
      }
      .info-box.danger {
        border-left-color: #dc3545;
        background-color: #f8d7da;
      }
      .info-item {
        margin-bottom: 10px;
      }
      .info-label {
        font-weight: bold;
        color: #555;
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
      .button.success {
        background-color: #28a745;
      }
      .button.success:hover {
        background-color: #218838;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        color: #666;
        font-size: 14px;
      }
      .highlight {
        background-color: #fff3cd;
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
      }
      ul {
        padding-left: 20px;
      }
      li {
        margin-bottom: 8px;
      }
    </style>
  `;
};

// Application submission confirmation email template
const getApplicationSubmissionTemplate = (application) => {
  const applicationType = application.type || 'Application';
  const capitalizedType = applicationType.charAt(0).toUpperCase() + applicationType.slice(1);
  const applicantName = application.info?.name || 'Applicant';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Received - Seattle Leopards FC</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="container">
        <div class="header success">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div class="subtitle">Application Received</div>
        </div>

        <div class="content">
          <h2>Thank You for Your Application! 🎉</h2>
          <p>Dear ${applicantName},</p>
          <p>We have successfully received your <strong>${capitalizedType} Application</strong>. Thank you for your interest in joining Seattle Leopards FC!</p>
        </div>

        <div class="info-box success">
          <h3>Application Details</h3>
          <div class="info-item">
            <span class="info-label">Application Type:</span> ${capitalizedType}
          </div>
          <div class="info-item">
            <span class="info-label">Applicant Name:</span> ${applicantName}
          </div>
          <div class="info-item">
            <span class="info-label">Email:</span> ${application.info?.email || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Phone:</span> ${application.info?.phone || 'N/A'}
          </div>
          <div class="info-item">
            <span class="info-label">Submission Date:</span> ${new Date(application.submittedAt || Date.now()).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div class="info-item">
            <span class="info-label">Status:</span> <span class="highlight">Pending Review</span>
          </div>
        </div>

        <div class="content">
          <h3>What Happens Next?</h3>
          <ul>
            <li>Our team will carefully review your application</li>
            <li>This process typically takes 3-5 business days</li>
            <li>You will receive an email notification once a decision is made</li>
            <li>We may contact you if we need any additional information</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${getFrontendUrl()}" class="button success">Visit Our Website</a>
        </div>

        <div class="info-box">
          <h3>Need Help?</h3>
          <p>If you have any questions about your application, please don't hesitate to contact us:</p>
          <p><strong>Email:</strong> info@seattleleopardsfc.com</p>
          <p><strong>Phone:</strong> (206) 555-0123</p>
          <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
        </div>

        <div class="footer">
          <p>This email was sent to ${application.info?.email} regarding your Seattle Leopards FC application.</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Application approval email template
const getApplicationApprovalTemplate = (application, teamPlacement, customMessage) => {
  const applicationType = application.type || 'Application';
  const capitalizedType = applicationType.charAt(0).toUpperCase() + applicationType.slice(1);
  const applicantName = application.info?.name || 'Applicant';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Approved - Seattle Leopards FC</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="container">
        <div class="header success">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div class="subtitle">Congratulations!</div>
        </div>

        <div class="content">
          <h2>Your Application Has Been Approved! 🎊</h2>
          <p>Dear ${applicantName},</p>
          <p>We are thrilled to inform you that your <strong>${capitalizedType} Application</strong> has been <span class="highlight" style="background-color: #d4edda; color: #155724;">APPROVED</span>!</p>
          <p>Welcome to the Seattle Leopards FC family! We're excited to have you join us.</p>
        </div>

        ${teamPlacement ? `
        <div class="info-box success">
          <h3>Your Team Placement</h3>
          <div style="font-size: 18px; font-weight: bold; color: #155724; margin-top: 10px;">
            ${teamPlacement}
          </div>
        </div>
        ` : ''}

        ${customMessage ? `
        <div class="info-box">
          <h3>Message from the Team</h3>
          <p>${customMessage}</p>
        </div>
        ` : ''}

        <div class="content">
          <h3>Next Steps</h3>
          <ul>
            <li>Check your email for registration and payment information</li>
            <li>Complete any required paperwork and waivers</li>
            <li>Attend the orientation session (details to follow)</li>
            <li>Mark your calendar for the season start date</li>
            <li>Visit our website to stay updated with team news</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${getFrontendUrl()}/dashboard" class="button success">Go to Dashboard</a>
          <a href="${getFrontendUrl()}/contact" class="button">Contact Us</a>
        </div>

        <div class="info-box">
          <h3>Questions?</h3>
          <p>If you have any questions or need assistance, our team is here to help:</p>
          <p><strong>Email:</strong> info@seattleleopardsfc.com</p>
          <p><strong>Phone:</strong> (206) 555-0123</p>
          <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
        </div>

        <div class="footer">
          <p>This email was sent to ${application.info?.email} regarding your Seattle Leopards FC application.</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Application rejection email template
const getApplicationRejectionTemplate = (application, customMessage) => {
  const applicationType = application.type || 'Application';
  const capitalizedType = applicationType.charAt(0).toUpperCase() + applicationType.slice(1);
  const applicantName = application.info?.name || 'Applicant';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update - Seattle Leopards FC</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div class="subtitle">Application Update</div>
        </div>

        <div class="content">
          <h2>Thank You for Your Interest</h2>
          <p>Dear ${applicantName},</p>
          <p>Thank you for taking the time to submit your <strong>${capitalizedType} Application</strong> to Seattle Leopards FC. We truly appreciate your interest in joining our club.</p>
          <p>After careful consideration, we regret to inform you that we are unable to move forward with your application at this time.</p>
        </div>

        ${customMessage ? `
        <div class="info-box">
          <h3>Message from the Team</h3>
          <p>${customMessage}</p>
        </div>
        ` : ''}

        <div class="content">
          <h3>We Encourage You To:</h3>
          <ul>
            <li>Consider reapplying in the future - we'd love to hear from you again</li>
            <li>Stay connected with our club through our website and social media</li>
            <li>Attend our community events and open training sessions</li>
            <li>Explore other opportunities within our organization</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${getFrontendUrl()}/programs" class="button">View Programs</a>
          <a href="${getFrontendUrl()}/contact" class="button">Contact Us</a>
        </div>

        <div class="info-box">
          <h3>Questions or Feedback?</h3>
          <p>If you would like to discuss your application or receive feedback, please feel free to reach out:</p>
          <p><strong>Email:</strong> info@seattleleopardsfc.com</p>
          <p><strong>Phone:</strong> (206) 555-0123</p>
          <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
        </div>

        <div class="footer">
          <p>This email was sent to ${application.info?.email} regarding your Seattle Leopards FC application.</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Application pending/under review email template
const getApplicationPendingTemplate = (application, customMessage) => {
  const applicationType = application.type || 'Application';
  const capitalizedType = applicationType.charAt(0).toUpperCase() + applicationType.slice(1);
  const applicantName = application.info?.name || 'Applicant';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Under Review - Seattle Leopards FC</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="container">
        <div class="header warning">
          <div class="logo">⚽ Seattle Leopards FC</div>
          <div class="subtitle">Application Status Update</div>
        </div>

        <div class="content">
          <h2>Your Application is Under Review</h2>
          <p>Dear ${applicantName},</p>
          <p>This is an update regarding your <strong>${capitalizedType} Application</strong> with Seattle Leopards FC.</p>
          <p>Your application is currently <span class="highlight">under review</span> by our team.</p>
        </div>

        ${customMessage ? `
        <div class="info-box warning">
          <h3>Important Information</h3>
          <p>${customMessage}</p>
        </div>
        ` : ''}

        <div class="content">
          <h3>What This Means:</h3>
          <ul>
            <li>Your application is being carefully evaluated by our team</li>
            <li>We may contact you if additional information is needed</li>
            <li>You will receive a final decision notification soon</li>
            <li>Please keep your contact information up to date</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${getFrontendUrl()}" class="button">Visit Our Website</a>
        </div>

        <div class="info-box">
          <h3>Questions?</h3>
          <p>If you have any questions about your application status:</p>
          <p><strong>Email:</strong> info@seattleleopardsfc.com</p>
          <p><strong>Phone:</strong> (206) 555-0123</p>
          <p><strong>Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
        </div>

        <div class="footer">
          <p>This email was sent to ${application.info?.email} regarding your Seattle Leopards FC application.</p>
          <p><strong>Seattle Leopards FC</strong><br>
          Building Champions, Creating Memories</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send application submission confirmation email
const sendApplicationSubmissionEmail = async (application) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 [SIMULATED] Application submission email would be sent to:', application.info?.email);
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_USER,
      to: application.info?.email,
      subject: `Application Received - Seattle Leopards FC`,
      html: getApplicationSubmissionTemplate(application)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Application submission email sent to:', application.info?.email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send application submission email:', error);
    return { success: false, error: error.message };
  }
};

// Send application status notification email
const sendApplicationStatusEmail = async (application, status, teamPlacement = null, customMessage = null) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`📧 [SIMULATED] Application ${status} email would be sent to:`, application.info?.email);
      return { success: true, simulated: true };
    }

    let template;
    let subject;

    switch (status.toLowerCase()) {
      case 'approved':
        template = getApplicationApprovalTemplate(application, teamPlacement, customMessage);
        subject = '🎉 Your Application Has Been Approved - Seattle Leopards FC';
        break;
      case 'rejected':
        template = getApplicationRejectionTemplate(application, customMessage);
        subject = 'Application Update - Seattle Leopards FC';
        break;
      case 'pending':
      case 'under review':
        template = getApplicationPendingTemplate(application, customMessage);
        subject = 'Application Status Update - Seattle Leopards FC';
        break;
      default:
        throw new Error(`Unknown application status: ${status}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_USER,
      to: application.info?.email,
      subject: subject,
      html: template
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Application ${status} email sent to:`, application.info?.email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send application ${status} email:`, error);
    return { success: false, error: error.message };
  }
};

// Send custom application email
const sendCustomApplicationEmail = async (toEmail, subject, message) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 [SIMULATED] Custom email would be sent to:', toEmail);
      return { success: true, simulated: true };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚽ Seattle Leopards FC</div>
          </div>

          <div class="content">
            ${message}
          </div>

          <div class="footer">
            <p><strong>Seattle Leopards FC</strong><br>
            Building Champions, Creating Memories</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.SMTP_USER,
      to: toEmail,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Custom application email sent to:', toEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send custom application email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApplicationSubmissionEmail,
  sendApplicationStatusEmail,
  sendCustomApplicationEmail,
  getApplicationSubmissionTemplate,
  getApplicationApprovalTemplate,
  getApplicationRejectionTemplate,
  getApplicationPendingTemplate
};

