const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();
const path = require('path');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:", "http://localhost:5000", "http://localhost:5173"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.example.com", "http://localhost:5000", "http://localhost:5173"]
    }
  }
}));

// CORS configuration - must come before rate limiting
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN_PROD 
    : process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting - DISABLED for development (enable in production!)
// Uncomment and configure properly for production use
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/', limiter);
*/

// For development: No rate limiting
console.log('⚠️  Rate limiting DISABLED (development mode)');

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with CORS headers for images
app.use('/uploads', (req, res, next) => {
  // Allow all origins for image serving
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Route imports and middleware
const heroContentRoutes = require('./routes/heroContent');
const broadcastRoutes = require('./routes/broadcasts');
const { router: authRoutes, auth: authenticateToken, superAdminAuth } = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/hero-content', heroContentRoutes);
const heroTextSettingsRoutes = require('./routes/heroTextSettings');
app.use('/api/hero-text-settings', heroTextSettingsRoutes);
app.use('/api/broadcasts', broadcastRoutes);

const applicationRoutes = require('./routes/application');
app.use('/api/applications', applicationRoutes);

const programRoutes = require('./routes/program');
app.use('/api/programs', programRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes);

const invoiceRoutes = require('./routes/invoices');
app.use('/api/invoices', invoiceRoutes);

const equipmentRoutes = require('./routes/equipment');
app.use('/api/equipment', equipmentRoutes);

const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);

const sellerRatingRoutes = require('./routes/sellerRatings');
app.use('/api/seller-ratings', sellerRatingRoutes);

const buyerRatingRoutes = require('./routes/buyerRatings');
app.use('/api/buyer-ratings', buyerRatingRoutes);

const marketplaceUnifiedRoutes = require('./routes/marketplaceUnified');
app.use('/api/marketplace', marketplaceUnifiedRoutes);

const scheduleRoutes = require('./routes/schedules');
app.use('/api/schedules', scheduleRoutes);
const standingRoutes = require('./routes/standings');
app.use('/api/standings', standingRoutes);
const sponsorRoutes = require('./routes/sponsors');
app.use('/api/sponsors', sponsorRoutes);
const financialTransactionRoutes = require('./routes/financialTransactions');
app.use('/api/financial-transactions', financialTransactionRoutes);

const galleryRoutes = require('./routes/gallery');
app.use('/api/gallery', galleryRoutes);

const marketplaceRoutes = require('./routes/marketplace');

const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

const aboutRoutes = require('./routes/about');
app.use('/api/about', aboutRoutes);

const teamsRoutes = require('./routes/teams');
app.use('/api/teams', teamsRoutes);

const messageRoutes = require('./routes/messages');
const advertisementRoutes = require('./routes/advertisements');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const marketplaceFeesRoutes = require('./routes/marketplaceFees');
const marketplacePaymentsRoutes = require('./routes/marketplacePayments');
const marketplaceMessagesRoutes = require('./routes/marketplaceMessages');
const marketplaceFlagsRoutes = require('./routes/marketplaceFlags');
const marketplaceSettingsRoutes = require('./routes/marketplaceSettings');
const marketplaceExtensionRoutes = require('./routes/marketplaceExtension');
const categoryRoutes = require('./routes/categories');
const membershipRoutes = require('./routes/memberships');
const homepageContentRoutes = require('./routes/homepageContent');

app.use('/api/messages', messageRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/marketplace/fees', marketplaceFeesRoutes);
app.use('/api/marketplace/payments', marketplacePaymentsRoutes);
app.use('/api/marketplace/messages', marketplaceMessagesRoutes);
app.use('/api/marketplace/flags', marketplaceFlagsRoutes);
app.use('/api/marketplace/settings', marketplaceSettingsRoutes);
app.use('/api/marketplace/extension', marketplaceExtensionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/homepage-content', homepageContentRoutes);
// IMPORTANT: General marketplace route must come LAST to avoid conflicts
app.use('/api/marketplace', marketplaceRoutes);

// Enhanced Rating System
const enhancedRatingsRoutes = require('./routes/enhancedRatings');
app.use('/api/ratings', enhancedRatingsRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const MONGODB_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGO_URI_PROD 
  : process.env.MONGO_URI || 'mongodb://localhost:27017/soccer-club';

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB');
    
    // Create super admin account
    try {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      
      // Get admin credentials from environment variables or use defaults for development
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@soccerclub.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminName = process.env.ADMIN_NAME || 'Super Admin';
      const adminPhone = process.env.ADMIN_PHONE || '555-0000';
      
      // In production, only create admin if credentials are provided via environment variables
      if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_EMAIL) {
        console.log('⚠️  Production mode: Admin account not created. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to create admin account.');
      } else {
        const existingAdmin = await User.findOne({ 
          $or: [
            { email: adminEmail },
            { username: adminUsername }
          ]
        });
        
        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          const defaultAdmin = new User({
            username: adminUsername,
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            phone: adminPhone,
            isSuperAdmin: true
          });
          await defaultAdmin.save();
          console.log(`✅ Super admin created: ${adminEmail} / ${adminUsername}`);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`   Password: ${adminPassword}`);
          } else {
            console.log('   Password: (set via ADMIN_PASSWORD environment variable)');
          }
        } else {
          // Always ensure admin status and update password if needed
          let needsUpdate = false;
          
          // Ensure isSuperAdmin is true
          if (!existingAdmin.isSuperAdmin) {
            existingAdmin.isSuperAdmin = true;
            needsUpdate = true;
          }
          
          // Update email/username if they don't match
          if (existingAdmin.email !== adminEmail) {
            existingAdmin.email = adminEmail;
            needsUpdate = true;
          }
          if (existingAdmin.username !== adminUsername) {
            existingAdmin.username = adminUsername;
            needsUpdate = true;
          }
          
          // Update password if it doesn't match (always in development, or if ADMIN_PASSWORD is set)
          const isPasswordMatch = await bcrypt.compare(adminPassword, existingAdmin.password);
          if (!isPasswordMatch) {
            // In development, always reset to default password if it doesn't match
            // In production, only update if ADMIN_PASSWORD is explicitly set
            if (process.env.NODE_ENV !== 'production' || process.env.ADMIN_PASSWORD) {
              const hashedPassword = await bcrypt.hash(adminPassword, 10);
              existingAdmin.password = hashedPassword;
              needsUpdate = true;
              console.log(`✅ Super admin password updated: ${adminEmail}`);
            }
          }
          
          if (needsUpdate) {
            await existingAdmin.save();
          }
          console.log(`✅ Super admin already exists: ${adminEmail}`);
          if (process.env.NODE_ENV !== 'production') {
            console.log(`   Password: ${adminPassword}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error creating/updating super admin:', error.message);
    }

      // Create default teams for testing (only in development)
      if (process.env.NODE_ENV !== 'production') {
        try {
          const Team = require('./models/Team');
          
          const existingTeams = await Team.find();
          if (existingTeams.length === 0) {
            const defaultTeams = [
              {
                name: "U10 Tigers",
                ageGroup: "Under 10",
                level: "Competitive",
                status: "Active",
                coach: "Coach Smith",
                assistantCoach: "Coach Johnson",
                maxPlayers: 16,
                currentPlayers: 14,
                practiceDays: "Tuesday & Thursday",
                practiceTime: "4:30 PM - 6:00 PM",
                gameDay: "Saturday",
                gameTime: "10:30 AM",
                location: "Greenfield Park",
                fees: 250,
                season: "Fall 2024",
                description: "Competitive team focusing on skill development and tactical play.",
                players: [
                  { name: "Alex Johnson", position: "Forward", jersey: 10 },
                  { name: "Sarah Davis", position: "Midfielder", jersey: 8 },
                  { name: "Mike Wilson", position: "Defender", jersey: 4 },
                  { name: "Emma Brown", position: "Goalkeeper", jersey: 1 }
                ],
                visible: true
              },
              {
                name: "U12 Lions",
                ageGroup: "Under 12",
                level: "Elite",
                status: "Full",
                coach: "Coach Patel",
                assistantCoach: "Coach Garcia",
                maxPlayers: 18,
                currentPlayers: 18,
                practiceDays: "Monday & Wednesday",
                practiceTime: "5:00 PM - 6:30 PM",
                gameDay: "Saturday",
                gameTime: "12:00 PM",
                location: "Central Stadium",
                fees: 300,
                season: "Fall 2024",
                description: "Elite development team preparing players for high school soccer.",
                players: [
                  { name: "David Lee", position: "Forward", jersey: 9 },
                  { name: "Maria Rodriguez", position: "Midfielder", jersey: 6 },
                  { name: "James Thompson", position: "Defender", jersey: 3 },
                  { name: "Lisa Chen", position: "Goalkeeper", jersey: 1 }
                ],
                visible: true
              },
              {
                name: "Adult Leopards",
                ageGroup: "Adult",
                level: "Recreational",
                status: "Forming",
                coach: "Coach Williams",
                assistantCoach: "",
                maxPlayers: 22,
                currentPlayers: 15,
                practiceDays: "Tuesday & Thursday",
                practiceTime: "7:00 PM - 8:30 PM",
                gameDay: "Sunday",
                gameTime: "3:00 PM",
                location: "Community Center",
                fees: 180,
                season: "Fall 2024",
                description: "Recreational adult team for players of all skill levels.",
                players: [
                  { name: "John Anderson", position: "Forward", jersey: 11 },
                  { name: "Rachel Green", position: "Midfielder", jersey: 7 },
                  { name: "Tom Martinez", position: "Defender", jersey: 5 }
                ],
                visible: true
              }
            ];

            await Team.insertMany(defaultTeams);
            console.log('✅ Default teams created');
          } else {
            console.log('✅ Default teams already exist');
          }
        } catch (error) {
          console.error('❌ Error creating default teams:', error.message);
        }

        // Create default programs for testing (only in development)
        try {
          const Program = require('./models/Program');
          
          const existingPrograms = await Program.find();
          if (existingPrograms.length === 0) {
            const defaultPrograms = [
              {
                name: "Downtown Seattle Youth Program",
                description: "Comprehensive youth soccer development program in downtown Seattle. Focus on skill development, teamwork, and sportsmanship.",
                zipCodes: ["98101", "98102", "98104", "98121"],
                address: "123 Soccer Way",
                city: "Seattle",
                state: "WA",
                visible: true,
                contact: "downtown@seattleleopardsfc.com",
                website: "https://seattleleopardsfc.com/downtown",
                registrationLink: "https://seattleleopardsfc.com/register/downtown",
                assignedTeam: "U10 Tigers",
                assignedCoach: "Coach Smith"
              },
              {
                name: "Bellevue Eastside Program",
                description: "Elite training program for competitive players on the Eastside. Advanced coaching and specialized training sessions.",
                zipCodes: ["98004", "98005", "98006", "98007", "98008"],
                address: "456 Eastside Blvd",
                city: "Bellevue",
                state: "WA",
                visible: true,
                contact: "eastside@seattleleopardsfc.com",
                website: "https://seattleleopardsfc.com/eastside",
                registrationLink: "https://seattleleopardsfc.com/register/eastside",
                assignedTeam: "U12 Lions",
                assignedCoach: "Coach Patel"
              },
              {
                name: "Redmond Technology District",
                description: "Innovative soccer program incorporating technology and analytics for player development. Perfect for tech-savvy families.",
                zipCodes: ["98052", "98053", "98054"],
                address: "789 Tech Park Drive",
                city: "Redmond",
                state: "WA",
                visible: true,
                contact: "redmond@seattleleopardsfc.com",
                website: "https://seattleleopardsfc.com/redmond",
                registrationLink: "https://seattleleopardsfc.com/register/redmond",
                assignedTeam: "U12 Lions",
                assignedCoach: "Coach Garcia"
              },
              {
                name: "Kirkland Lakeside Program",
                description: "Scenic lakeside soccer program with beautiful facilities and outdoor training opportunities.",
                zipCodes: ["98033", "98034"],
                address: "321 Lake Washington Blvd",
                city: "Kirkland",
                state: "WA",
                visible: true,
                contact: "kirkland@seattleleopardsfc.com",
                website: "https://seattleleopardsfc.com/kirkland",
                registrationLink: "https://seattleleopardsfc.com/register/kirkland",
                assignedTeam: "Adult Leopards",
                assignedCoach: "Coach Williams"
              },
              {
                name: "Sammamish Plateau Program",
                description: "Family-friendly soccer program in the Sammamish Plateau area. Emphasis on community involvement and fun learning.",
                zipCodes: ["98074", "98075"],
                address: "654 Plateau Way",
                city: "Sammamish",
                state: "WA",
                visible: true,
                contact: "sammamish@seattleleopardsfc.com",
                website: "https://seattleleopardsfc.com/sammamish",
                registrationLink: "https://seattleleopardsfc.com/register/sammamish",
                assignedTeam: "U10 Tigers",
                assignedCoach: "Coach Johnson"
              }
            ];

            await Program.insertMany(defaultPrograms);
            console.log('✅ Default programs created');
          } else {
            console.log('✅ Default programs already exist');
          }
        } catch (error) {
          console.error('❌ Error creating default programs:', error.message);
        }
      }
    
    // Maintenance mode middleware - only apply after database is connected
    const maintenanceMode = require('./middleware/maintenance');
    app.use(maintenanceMode);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    if (retries > 0) {
      console.log(`❌ MongoDB connection failed. Retrying... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('❌ Failed to connect to MongoDB after multiple attempts:', error);
      process.exit(1);
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
}); 

// Start server
connectDB(); 