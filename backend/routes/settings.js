const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Settings = require('../models/Settings');
const { superAdminAuth } = require('./auth');
const { sendCustomEmail } = require('../services/emailService');

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/logos';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and SVG files are allowed'));
    }
  }
});

// Get fee settings (public endpoint for application forms)
router.get('/fees', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching fee settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get homepage content (public endpoint)
router.get('/homepage', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    
    // Return only homepage-related content
    const homepageContent = {
      // Hero Section
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroButtonText: settings.heroButtonText,
      
      // About Us Section
      aboutUsTitle: settings.aboutUsTitle,
      aboutUsSubtitle: settings.aboutUsSubtitle,
      aboutUsFeatures: settings.aboutUsFeatures,
      showAboutUsSection: settings.showAboutUsSection,
      
      // Programs Overview Section
      programsTitle: settings.programsTitle,
      programsSubtitle: settings.programsSubtitle,
      programsOverview: settings.programsOverview,
      showProgramsSection: settings.showProgramsSection,
      
      // Why Choose Us Section
      whyChooseUsTitle: settings.whyChooseUsTitle,
      whyChooseUsSubtitle: settings.whyChooseUsSubtitle,
      whyChooseUsFeatures: settings.whyChooseUsFeatures,
      showWhyChooseUsSection: settings.showWhyChooseUsSection,
      
      // Latest News Section
      latestNewsTitle: settings.latestNewsTitle,
      latestNewsSubtitle: settings.latestNewsSubtitle,
      latestNewsItems: settings.latestNewsItems,
      showLatestNewsSection: settings.showLatestNewsSection,
      
      // Contact & CTA Section
      ctaTitle: settings.ctaTitle,
      ctaSubtitle: settings.ctaSubtitle,
      ctaStats: settings.ctaStats,
      ctaPrimaryButtonText: settings.ctaPrimaryButtonText,
      ctaSecondaryButtonText: settings.ctaSecondaryButtonText,
      ctaContactInfo: settings.ctaContactInfo,
      showCTASection: settings.showCTASection,
      showStats: settings.showStats,
      showContactInfo: settings.showContactInfo
    };
    
    res.json(homepageContent);
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cookie policy content (public endpoint)
router.get('/cookie', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    
    // Return only cookie-related content
    const cookieContent = {
      cookiePageTitle: settings.cookiePageTitle || 'Cookie Policy',
      cookiePageContent: settings.cookiePageContent || '',
      lastUpdated: settings.updatedAt
    };
    
    res.json(cookieContent);
  } catch (error) {
    console.error('Error fetching cookie content:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get advertisement setting (public endpoint)
router.get('/advertisements-enabled', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    
    res.json({ enableAdvertisements: settings.enableAdvertisements !== false });
  } catch (error) {
    console.error('Error fetching advertisement setting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feature settings (public endpoint)
router.get('/features', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    
    // Return only feature-related settings
    const featureSettings = {
      enableRegistration: settings.enableRegistration,
      enableDonations: settings.enableDonations,
      enableNewsletter: settings.enableNewsletter,
      enableContactForm: settings.enableContactForm,
      enableProgramSearch: settings.enableProgramSearch,
      enableBlog: settings.enableBlog,
      enableEvents: settings.enableEvents,
      enableGallery: settings.enableGallery,
      enableTestimonials: settings.enableTestimonials,
      enableTeamRoster: settings.enableTeamRoster,
      enableSchedule: settings.enableSchedule,
      enableStandings: settings.enableStandings,
      enableLiveScores: settings.enableLiveScores,
      enableOnlineStore: settings.enableOnlineStore,
      enableMemberPortal: settings.enableMemberPortal,
      enableCoachPortal: settings.enableCoachPortal,
      enableAdvertisements: settings.enableAdvertisements
    };
    
    res.json(featureSettings);
  } catch (error) {
    console.error('Error fetching feature settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get fee settings (admin only)
router.get('/fees/admin', superAdminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching fee settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update fee settings (admin only)
router.put('/fees', superAdminAuth, async (req, res) => {
  try {
    const {
      playerFee,
      coachFee,
      refereeFee,
      volunteerFee,
      feesEnabled,
      donationMin,
      donationOptions
    } = req.body;

    // Validate input
    if (playerFee < 0 || coachFee < 0 || refereeFee < 0 || volunteerFee < 0) {
      return res.status(400).json({ message: 'Fees cannot be negative' });
    }

    if (donationMin < 0) {
      return res.status(400).json({ message: 'Minimum donation cannot be negative' });
    }

    if (!Array.isArray(donationOptions) || donationOptions.some(opt => opt < 0)) {
      return res.status(400).json({ message: 'Donation options must be an array of non-negative numbers' });
    }

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update settings
    settings.playerFee = playerFee || 0;
    settings.coachFee = coachFee || 0;
    settings.refereeFee = refereeFee || 0;
    settings.volunteerFee = volunteerFee || 0;
    settings.feesEnabled = feesEnabled !== undefined ? feesEnabled : true;
    settings.donationMin = donationMin || 0;
    settings.donationOptions = donationOptions || [0, 5, 10, 25, 50, 100];

    await settings.save();
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating fee settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all settings (admin only)
router.get('/', superAdminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    
    console.log('Fetched settings logoUrl:', settings.logoUrl);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update all settings (admin only)
router.put('/', superAdminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update all settings from request body
    Object.keys(req.body).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();
    
    res.json({ 
      message: 'Settings updated successfully',
      settings: settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload logo (admin only)
router.post('/upload-logo', superAdminAuth, upload.single('logo'), async (req, res) => {
  try {
    console.log('Logo upload request received');
    console.log('File object:', req.file);
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let processedFilePath = req.file.path;
    const fileExtension = path.extname(req.file.filename).toLowerCase();

    // Resize image if it's not an SVG (SVGs are vector graphics, don't need resizing)
    if (fileExtension !== '.svg') {
      try {
        console.log('Resizing image to 200x200 pixels...');
        
        // Resize the image to 200x200 pixels while maintaining aspect ratio
        await sharp(req.file.path)
          .resize(200, 200, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
          })
          .png() // Convert to PNG for consistency
          .toFile(req.file.path + '_resized');
        
        // Replace original file with resized version
        fs.unlinkSync(req.file.path);
        fs.renameSync(req.file.path + '_resized', req.file.path);
        
        console.log('Image resized successfully');
      } catch (resizeError) {
        console.error('Error resizing image:', resizeError);
        // Continue with original file if resizing fails
      }
    }

    // Generate the URL for the uploaded file
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    console.log('Generated logo URL:', logoUrl);
    console.log('Full file path:', req.file.path);

    // Update settings with the new logo URL
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.logoUrl = logoUrl;
    await settings.save();
    console.log('Settings saved with logo URL:', settings.logoUrl);

    res.json({ 
      message: 'Logo uploaded successfully and resized to 200x200 pixels',
      logoUrl: logoUrl
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send test email (admin only)
router.post('/test-email', superAdminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    
    // Create test email content
    const subject = 'Test Email - Seattle Leopards FC';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
            <div style="font-size: 28px; font-weight: bold; color: #007bff; margin-bottom: 10px;">⚽ Seattle Leopards FC</div>
            <div style="color: #666; font-size: 16px;">Email Configuration Test</div>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">✅ Test Email Successful!</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Congratulations! Your email configuration is working correctly. This test email confirms that:
          </p>
          
          <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li>Email credentials are properly configured</li>
              <li>SMTP connection is successful</li>
              <li>Your email service is operational</li>
              <li>Email templates are rendering correctly</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your automated email notifications are now ready to use! Application submissions, approvals, and status updates will be sent automatically.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #007bff; color: white; padding: 12px 25px; border-radius: 5px; font-weight: bold;">
              Configuration Verified ✓
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p>This is an automated test email from Seattle Leopards FC</p>
            <p><strong>Seattle Leopards FC</strong><br>Building Champions, Creating Memories</p>
          </div>
        </div>
      </div>
    `;
    
    try {
      const result = await sendCustomEmail(email, subject, content, true);
      
      if (result.success) {
        res.json({ 
          success: true,
          message: `Test email sent successfully to ${email}`,
          messageId: result.messageId
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: 'Failed to send test email. Please check your email configuration in the server environment variables.',
          error: result.error
        });
      }
    } catch (emailError) {
      console.error('Error sending test email:', emailError);
      res.status(500).json({ 
        success: false,
        message: 'Failed to send test email. Please ensure EMAIL_USER and EMAIL_PASS environment variables are properly configured.',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Error in test-email endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 2MB.' });
    }
  }
  if (error.message) {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

module.exports = router; 