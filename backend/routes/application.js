const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const nodemailer = require('nodemailer');

// Get all applications (optionally filter by type/status)
router.get('/', async (req, res) => {
  const { type, status, user } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  
  // If user=me, get applications for the authenticated user
  if (user === 'me') {
    // This would need to be implemented with authentication middleware
    // For now, we'll return an empty array
    return res.json([]);
  }
  
  const apps = await Application.find(filter).sort({ createdAt: -1 });
  res.json(apps);
});

// Get applications for a specific user by email
router.get('/user-email/:email', async (req, res) => {
  try {
    const apps = await Application.find({ 'info.email': req.params.email }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get applications for a specific user by email (alternative route for frontend compatibility)
router.get('/user/:email', async (req, res) => {
  try {
    const apps = await Application.find({ 'info.email': req.params.email }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single application
router.get('/:id', async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Not found' });
  res.json(app);
});

// Create application
router.post('/', async (req, res) => {
  try {
    const app = new Application(req.body);
    await app.save();
    res.status(201).json(app);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update application (approve/deny/assign)
router.put('/:id', async (req, res) => {
  try {
    console.log('PUT /api/applications/:id payload:', req.body);
    const { status, actionReason, sendEmail } = req.body;
    if (!status || !['approved', 'denied', 'pending', 'rejected'].includes(status)) {
      console.error('Invalid or missing status:', status);
      return res.status(400).json({ error: 'Invalid or missing status' });
    }
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    app.status = status;
    if (actionReason !== undefined) app.actionReason = actionReason;
    app.reviewedAt = new Date();
    // Optionally send email (only in production)
    if (process.env.NODE_ENV === 'production' && sendEmail && app.info && app.info.email) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const subject = status === 'approved' ? 'Your application has been approved' : 'Your application has been denied';
      const text = `Dear ${app.info.name},\n\nYour application has been ${status}.\nReason: ${actionReason || 'No reason provided.'}\n\nThank you,\nSeattle Leopards FC`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: app.info.email,
        subject,
        text,
      });
      app.emailSent = true;
    }
    // For local email testing, you can use Ethereal:
    // if (process.env.NODE_ENV !== 'production') {
    //   const testAccount = await nodemailer.createTestAccount();
    //   const transporter = nodemailer.createTransport({
    //     host: 'smtp.ethereal.email',
    //     port: 587,
    //     auth: { user: testAccount.user, pass: testAccount.pass },
    //   });
    //   // ... same as above ...
    //   // console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    // }
    await app.save();
    res.json(app);
  } catch (err) {
    console.error('Error in PUT /api/applications/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update application status with team placement
router.put('/:id/status', async (req, res) => {
  try {
    console.log('PUT /api/applications/:id/status payload:', req.body);
    const { status, teamPlacement } = req.body;
    
    if (!status || !['approved', 'denied', 'pending', 'rejected'].includes(status)) {
      console.error('Invalid or missing status:', status);
      return res.status(400).json({ error: 'Invalid or missing status' });
    }
    
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    
    app.status = status;
    app.reviewedAt = new Date();
    
    // Add team placement if provided
    if (teamPlacement && status === 'approved') {
      app.teamPlacement = teamPlacement;
    }
    
    await app.save();
    res.json(app);
  } catch (err) {
    console.error('Error in PUT /api/applications/:id/status:', err);
    res.status(400).json({ error: err.message });
  }
});

// Send notification for application status/placement
router.post('/:id/notify', async (req, res) => {
  try {
    console.log('POST /api/applications/:id/notify payload:', req.body);
    const { teamPlacement, includePlacement, customMessage, isAuto } = req.body;
    
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    
    if (!app.info || !app.info.email) {
      return res.status(400).json({ error: 'Application has no email address' });
    }
    
    // For now, just log the notification (you can implement actual email sending later)
    console.log('Notification would be sent to:', app.info.email);
    console.log('Team placement:', teamPlacement);
    console.log('Include placement:', includePlacement);
    console.log('Custom message:', customMessage);
    console.log('Is auto:', isAuto);
    
    // Mark notification as sent
    app.notificationSent = true;
    app.notificationSentAt = new Date();
    await app.save();
    
    res.json({ 
      success: true, 
      message: 'Notification sent successfully',
      notificationDetails: {
        email: app.info.email,
        teamPlacement,
        includePlacement,
        customMessage,
        isAuto
      }
    });
  } catch (err) {
    console.error('Error sending notification:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send correction email to individual applicant
router.post('/:id/correction', async (req, res) => {
  try {
    const { email, reason } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    
    if (process.env.NODE_ENV === 'production' && email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      const subject = 'Application Correction Required - Seattle Leopards FC';
      const text = `Dear ${app.info.name},\n\nWe need to request a correction to your application.\n\nReason: ${reason}\n\nPlease review your application and make the necessary changes.\n\nThank you,\nSeattle Leopards FC`;
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text,
      });
      
      // Log the correction email
      if (!app.correctionEmails) app.correctionEmails = [];
      app.correctionEmails.push({
        sentAt: new Date(),
        reason: reason,
        email: email
      });
      await app.save();
    }
    
    res.json({ success: true, message: 'Correction email sent successfully' });
  } catch (err) {
    console.error('Error sending correction email:', err);
    res.status(500).json({ error: 'Failed to send correction email' });
  }
});

// Send bulk correction emails
router.post('/bulk-correction', async (req, res) => {
  try {
    const { ids, reason } = req.body;
    const apps = await Application.find({ _id: { $in: ids } });
    
    if (process.env.NODE_ENV === 'production') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      const subject = 'Application Correction Required - Seattle Leopards FC';
      
      for (const app of apps) {
        if (app.info && app.info.email) {
          const text = `Dear ${app.info.name},\n\nWe need to request a correction to your application.\n\nReason: ${reason}\n\nPlease review your application and make the necessary changes.\n\nThank you,\nSeattle Leopards FC`;
          
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: app.info.email,
            subject,
            text,
          });
          
          // Log the correction email
          if (!app.correctionEmails) app.correctionEmails = [];
          app.correctionEmails.push({
            sentAt: new Date(),
            reason: reason,
            email: app.info.email
          });
          await app.save();
        }
      }
    }
    
    res.json({ success: true, message: `Bulk correction emails sent to ${apps.length} applicants` });
  } catch (err) {
    console.error('Error sending bulk correction emails:', err);
    res.status(500).json({ error: 'Failed to send bulk correction emails' });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get applications for a specific user by email (alternative route for frontend compatibility)
router.get('/user/:email', async (req, res) => {
  try {
    const apps = await Application.find({ 'info.email': req.params.email }).sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 