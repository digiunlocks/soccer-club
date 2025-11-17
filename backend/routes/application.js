const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const nodemailer = require('nodemailer');
const {
  sendApplicationSubmissionEmail,
  sendApplicationStatusEmail,
  sendCustomApplicationEmail
} = require('../services/applicationEmailService');

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
    
    // Send confirmation email to applicant
    if (app.info && app.info.email) {
      try {
        await sendApplicationSubmissionEmail(app);
        console.log('✅ Confirmation email sent for application:', app._id);
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
        // Don't fail the application submission if email fails
      }
    }
    
    res.status(201).json(app);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update application (approve/deny/assign)
router.put('/:id', async (req, res) => {
  try {
    console.log('PUT /api/applications/:id payload:', req.body);
    const { status, actionReason, sendEmail, teamPlacement } = req.body;
    if (!status || !['approved', 'denied', 'pending', 'rejected'].includes(status)) {
      console.error('Invalid or missing status:', status);
      return res.status(400).json({ error: 'Invalid or missing status' });
    }
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    
    const oldStatus = app.status;
    app.status = status;
    if (actionReason !== undefined) app.actionReason = actionReason;
    if (teamPlacement && status === 'approved') app.teamPlacement = teamPlacement;
    app.reviewedAt = new Date();
    
    // Send email notification using the new email service
    if (sendEmail !== false && app.info && app.info.email && oldStatus !== status) {
      try {
        await sendApplicationStatusEmail(app, status, teamPlacement, actionReason);
        app.emailSent = true;
        app.emailSentAt = new Date();
        console.log(`✅ Status email (${status}) sent for application:`, app._id);
      } catch (emailError) {
        console.error('❌ Failed to send status email:', emailError);
        // Don't fail the application update if email fails
      }
    }
    
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
    
    // Send actual email notification using the new email service
    try {
      const finalTeamPlacement = includePlacement ? teamPlacement : null;
      await sendApplicationStatusEmail(app, app.status, finalTeamPlacement, customMessage);
      
      // Mark notification as sent
      app.notificationSent = true;
      app.notificationSentAt = new Date();
      await app.save();
      
      console.log('✅ Notification email sent successfully to:', app.info.email);
      
      res.json({ 
        success: true, 
        message: 'Notification sent successfully',
        notificationDetails: {
          email: app.info.email,
          status: app.status,
          teamPlacement: finalTeamPlacement,
          includePlacement,
          customMessage,
          isAuto
        }
      });
    } catch (emailError) {
      console.error('❌ Error sending notification email:', emailError);
      res.status(500).json({ 
        error: 'Failed to send notification email',
        details: emailError.message 
      });
    }
  } catch (err) {
    console.error('Error in notification endpoint:', err);
    res.status(500).json({ error: 'Failed to process notification request' });
  }
});

// Send correction email to individual applicant
router.post('/:id/correction', async (req, res) => {
  try {
    const { email, reason } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    
    if (email) {
      try {
        const subject = 'Application Correction Required - Seattle Leopards FC';
        const message = `
          <h2>Correction Required</h2>
          <p>Dear ${app.info.name},</p>
          <p>We need to request a correction to your application.</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <strong>Reason:</strong><br>
            ${reason}
          </div>
          <p>Please review your application and make the necessary changes at your earliest convenience.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Thank you for your cooperation,<br>Seattle Leopards FC</p>
        `;
        
        await sendCustomApplicationEmail(email, subject, message);
        
        // Log the correction email
        if (!app.correctionEmails) app.correctionEmails = [];
        app.correctionEmails.push({
          sentAt: new Date(),
          reason: reason,
          email: email
        });
        await app.save();
        
        console.log('✅ Correction email sent to:', email);
      } catch (emailError) {
        console.error('❌ Failed to send correction email:', emailError);
        return res.status(500).json({ error: 'Failed to send correction email', details: emailError.message });
      }
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
    
    const subject = 'Application Correction Required - Seattle Leopards FC';
    let successCount = 0;
    let failCount = 0;
    
    for (const app of apps) {
      if (app.info && app.info.email) {
        try {
          const message = `
            <h2>Correction Required</h2>
            <p>Dear ${app.info.name},</p>
            <p>We need to request a correction to your application.</p>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <strong>Reason:</strong><br>
              ${reason}
            </div>
            <p>Please review your application and make the necessary changes at your earliest convenience.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you for your cooperation,<br>Seattle Leopards FC</p>
          `;
          
          await sendCustomApplicationEmail(app.info.email, subject, message);
          
          // Log the correction email
          if (!app.correctionEmails) app.correctionEmails = [];
          app.correctionEmails.push({
            sentAt: new Date(),
            reason: reason,
            email: app.info.email
          });
          await app.save();
          
          successCount++;
          console.log('✅ Bulk correction email sent to:', app.info.email);
          
          // Add small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (emailError) {
          failCount++;
          console.error('❌ Failed to send bulk correction email to:', app.info.email, emailError);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Bulk correction emails sent to ${successCount} of ${apps.length} applicants`,
      successCount,
      failCount
    });
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

module.exports = router;
