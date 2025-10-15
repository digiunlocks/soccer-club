const Settings = require('../models/Settings');
const mongoose = require('mongoose');

const maintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for admin routes and API endpoints
    if (req.path.startsWith('/admin') || req.path.startsWith('/api')) {
      return next();
    }

    // Check if database is connected before querying
    if (mongoose.connection.readyState !== 1) {
      return next();
    }

    const settings = await Settings.findOne();
    
    if (settings && settings.maintenanceMode) {
      // For API requests, return JSON response
      if (req.path.startsWith('/api')) {
        return res.status(503).json({
          error: 'Site is under maintenance',
          message: settings.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
          maintenanceMode: true
        });
      }
      
      // For regular requests, return HTML maintenance page
      return res.status(503).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Site Maintenance - Seattle Leopards FC</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: linear-gradient(135deg, #166534 0%, #059669 100%);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }
            .maintenance-container {
              text-align: center;
              max-width: 600px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 1rem;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            .logo {
              font-size: 2.5rem;
              font-weight: bold;
              margin-bottom: 1rem;
              color: #EAB308;
            }
            .message {
              font-size: 1.2rem;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .status {
              background: rgba(255, 255, 255, 0.2);
              padding: 1rem;
              border-radius: 0.5rem;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="maintenance-container">
            <div class="icon">🔧</div>
            <div class="logo">Seattle Leopards FC</div>
            <div class="message">
              ${settings.maintenanceMessage || 'We are currently performing maintenance to improve your experience. Please check back soon.'}
            </div>
            <div class="status">
              <strong>Status:</strong> Under Maintenance<br>
              <small>We apologize for any inconvenience.</small>
            </div>
          </div>
        </body>
        </html>
      `);
    }
    
    next();
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    next(); // Continue if there's an error
  }
};

module.exports = maintenanceMode; 