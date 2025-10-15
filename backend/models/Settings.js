const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Fee Settings
  playerFee: {
    type: Number,
    default: 0,
    min: 0
  },
  coachFee: {
    type: Number,
    default: 0,
    min: 0
  },
  refereeFee: {
    type: Number,
    default: 0,
    min: 0
  },
  volunteerFee: {
    type: Number,
    default: 0,
    min: 0
  },
  feesEnabled: {
    type: Boolean,
    default: true
  },
  
  // Donation Settings
  donationMin: {
    type: Number,
    default: 0,
    min: 0
  },
  donationOptions: {
    type: [Number],
    default: [0, 5, 10, 25, 50, 100]
  },
  
  // Logo Settings
  logoUrl: {
    type: String,
    default: ""
  },

  // Club Information
  clubName: { type: String, default: "Seattle Leopards FC" },
  clubTagline: { type: String, default: "Building Champions, Building Community" },
  clubDescription: { type: String, default: "Seattle Leopards FC is a premier youth soccer club dedicated to developing skilled players and fostering a love for the beautiful game." },
  foundedYear: { type: String, default: "2020" },
  clubMission: { type: String, default: "To provide exceptional soccer training and development opportunities for youth players in the Seattle area." },
  clubVision: { type: String, default: "To be the leading youth soccer development program in the Pacific Northwest." },
  clubValues: { type: String, default: "Excellence, Integrity, Teamwork, Respect, Growth" },
  
  // Contact Information
  contactEmail: { type: String, default: "info@seattleleopardsfc.com" },
  contactPhone: { type: String, default: "(206) 555-0123" },
  contactAddress: { type: String, default: "123 Soccer Way" },
  contactCity: { type: String, default: "Seattle" },
  contactState: { type: String, default: "WA" },
  contactZip: { type: String, default: "98101" },
  contactCountry: { type: String, default: "USA" },
  officeHours: { type: String, default: "Monday-Friday: 9:00 AM - 5:00 PM" },
  emergencyContact: { type: String, default: "(206) 555-9999" },
  
  // Social Media
  facebookUrl: { type: String, default: "https://facebook.com/seattleleopardsfc" },
  instagramUrl: { type: String, default: "https://instagram.com/seattleleopardsfc" },
  twitterUrl: { type: String, default: "https://twitter.com/seattleleopardsfc" },
  youtubeUrl: { type: String, default: "https://youtube.com/seattleleopardsfc" },
  linkedinUrl: { type: String, default: "https://linkedin.com/company/seattleleopardsfc" },
  tiktokUrl: { type: String, default: "" },
  
  // Website Settings
  siteTitle: { type: String, default: "Seattle Leopards FC - Premier Youth Soccer Club" },
  siteDescription: { type: String, default: "Join Seattle Leopards FC for premier youth soccer training and development in the Seattle area." },
  siteKeywords: { type: String, default: "youth soccer, seattle, soccer club, soccer training, youth sports" },
  siteLanguage: { type: String, default: "en" },
  timezone: { type: String, default: "America/Los_Angeles" },
  dateFormat: { type: String, default: "MM/DD/YYYY" },
  timeFormat: { type: String, default: "12" },
  
  // Branding & Design
  primaryColor: { type: String, default: "#166534" },
  secondaryColor: { type: String, default: "#EAB308" },
  accentColor: { type: String, default: "#059669" },
  backgroundColor: { type: String, default: "#FFFFFF" },
  textColor: { type: String, default: "#1F2937" },
  faviconUrl: { type: String, default: "" },
  heroImageUrl: { type: String, default: "" },
  aboutImageUrl: { type: String, default: "" },
  customCSS: { type: String, default: "" },
  customJS: { type: String, default: "" },
  
  // Features & Settings
  enableRegistration: { type: Boolean, default: true },
  enableDonations: { type: Boolean, default: true },
  enableNewsletter: { type: Boolean, default: true },
  enableContactForm: { type: Boolean, default: true },
  enableProgramSearch: { type: Boolean, default: true },
  enableBlog: { type: Boolean, default: false },
  enableEvents: { type: Boolean, default: true },
  enableGallery: { type: Boolean, default: true },
  enableTestimonials: { type: Boolean, default: true },
  enableTeamRoster: { type: Boolean, default: true },
  enableSchedule: { type: Boolean, default: true },
  enableStandings: { type: Boolean, default: true },
  enableLiveScores: { type: Boolean, default: false },
  enableOnlineStore: { type: Boolean, default: false },
  enableMemberPortal: { type: Boolean, default: true },
  enableCoachPortal: { type: Boolean, default: true },
  enableAdvertisements: { type: Boolean, default: true },
  
  // Email Configuration
  emailNotifications: { type: Boolean, default: true },
  adminEmail: { type: String, default: "admin@seattleleopardsfc.com" },
  supportEmail: { type: String, default: "support@seattleleopardsfc.com" },
  noreplyEmail: { type: String, default: "noreply@seattleleopardsfc.com" },
  emailProvider: { type: String, default: "gmail" },
  emailTemplateHeader: { type: String, default: "" },
  emailTemplateFooter: { type: String, default: "" },
  
  // Security & Privacy
  enableTwoFactorAuth: { type: Boolean, default: false },
  requireEmailVerification: { type: Boolean, default: true },
  sessionTimeout: { type: Number, default: 24 },
  maxLoginAttempts: { type: Number, default: 5 },
  passwordMinLength: { type: Number, default: 8 },
  requireStrongPassword: { type: Boolean, default: true },
  enableCSRFProtection: { type: Boolean, default: true },
  enableRateLimiting: { type: Boolean, default: true },
  enableContentSecurityPolicy: { type: Boolean, default: true },
  
  // Performance & Caching
  enableCaching: { type: Boolean, default: true },
  cacheDuration: { type: Number, default: 3600 },
  enableImageOptimization: { type: Boolean, default: true },
  enableGzipCompression: { type: Boolean, default: true },
  enableCDN: { type: Boolean, default: false },
  cdnUrl: { type: String, default: "" },
  
  // Legal & Compliance
  privacyPolicy: { type: String, default: "Your privacy is important to us. We collect and use your information to provide our services and improve your experience." },
  termsOfService: { type: String, default: "By using our services, you agree to our terms and conditions." },
  cookiePolicy: { type: String, default: "We use cookies to enhance your browsing experience and analyze site traffic." },
  refundPolicy: { type: String, default: "Refunds are processed within 30 days of purchase." },
  waiverText: { type: String, default: "I acknowledge and accept the risks associated with participation in soccer activities." },
  gdprCompliance: { type: Boolean, default: true },
  ccpaCompliance: { type: Boolean, default: true },
  
  // Footer Content Management
  footerCompanyName: { type: String, default: "Seattle Leopards FC" },
  footerTagline: { type: String, default: "Building Champions, Building Community" },
  footerDescription: { type: String, default: "Premier youth soccer club dedicated to developing skilled players and fostering a love for the beautiful game." },
  footerCopyright: { type: String, default: "© 2024 Seattle Leopards FC. All rights reserved." },
  
  // Footer Links
  footerTermsUrl: { type: String, default: "/terms" },
  footerPrivacyUrl: { type: String, default: "/privacy" },
  footerCookieUrl: { type: String, default: "/cookie" },
  footerLegalUrl: { type: String, default: "/legal" },
  
  // Footer Social Media
  footerFacebookUrl: { type: String, default: "https://facebook.com/seattleleopardsfc" },
  footerInstagramUrl: { type: String, default: "https://instagram.com/seattleleopardsfc" },
  footerTwitterUrl: { type: String, default: "https://twitter.com/seattleleopardsfc" },
  footerYoutubeUrl: { type: String, default: "https://youtube.com/seattleleopardsfc" },
  
  // Footer Contact
  footerContactEmail: { type: String, default: "info@seattleleopardsfc.com" },
  footerContactPhone: { type: String, default: "(206) 555-0123" },
  footerContactAddress: { type: String, default: "123 Soccer Way, Seattle, WA 98101" },
  
  // Footer Sections
  footerAboutText: { type: String, default: "Seattle Leopards FC is committed to excellence in youth soccer development, providing top-tier training and fostering a supportive community for young athletes." },
  footerQuickLinks: { type: String, default: "About Us,Programs,Teams,Contact,Donate" },
  footerPrograms: { type: String, default: "Youth Programs,Competitive Teams,Training Camps,Summer Leagues" },
  footerSupport: { type: String, default: "Volunteer,Donate,Sponsor,Partner" },
  
  // Footer Newsletter
  footerNewsletterTitle: { type: String, default: "Stay Connected" },
  footerNewsletterDescription: { type: String, default: "Get the latest updates on programs, events, and club news." },
  footerNewsletterPlaceholder: { type: String, default: "Enter your email address" },
  footerNewsletterButton: { type: String, default: "Subscribe" },
  
  // Footer Legal Content
  footerTermsTitle: { type: String, default: "Terms of Service" },
  footerPrivacyTitle: { type: String, default: "Privacy Policy" },
  footerCookieTitle: { type: String, default: "Cookie Policy" },
  footerLegalTitle: { type: String, default: "Legal Information" },
  
  // Footer Display Settings
  footerShowSocialMedia: { type: Boolean, default: true },
  footerShowNewsletter: { type: Boolean, default: true },
  footerShowQuickLinks: { type: Boolean, default: true },
  footerShowContact: { type: Boolean, default: true },
  footerShowPrograms: { type: Boolean, default: true },
  footerShowSupport: { type: Boolean, default: true },
  footerShowCopyright: { type: Boolean, default: true },
  
  // Page Content Management
  termsPageTitle: { type: String, default: "Terms of Service" },
  termsPageContent: { type: String, default: "" },
  privacyPageTitle: { type: String, default: "Privacy Policy" },
  privacyPageContent: { type: String, default: "" },
  cookiePageTitle: { type: String, default: "Cookie Policy" },
  cookiePageContent: { type: String, default: "" },
  legalPageTitle: { type: String, default: "Legal Information" },
  legalPageContent: { type: String, default: "" },
  
  // Homepage Content Management
  // Hero Section
  heroTitle: { type: String, default: "Seattle Leopards FC" },
  heroSubtitle: { type: String, default: "Building champions on and off the field. Youth & Adult soccer, community, and opportunity for all. Join the pride today!" },
  heroButtonText: { type: String, default: "Join the Club" },
  
  // About Us Section
  aboutUsTitle: { type: String, default: "About Seattle Leopards FC" },
  aboutUsSubtitle: { type: String, default: "We are more than just a soccer club. We're a community dedicated to developing young athletes, fostering sportsmanship, and building lasting friendships through the beautiful game." },
  aboutUsFeatures: {
    type: [{
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      icon: { type: String, default: "" }
    }],
    default: [
      {
        title: "Community Focus",
        description: "Building strong community bonds through soccer, bringing families together and creating lasting friendships.",
        icon: "users"
      },
      {
        title: "Excellence",
        description: "Committed to excellence in coaching, player development, and creating opportunities for success both on and off the field.",
        icon: "check-circle"
      },
      {
        title: "Inclusive",
        description: "Welcoming players of all skill levels and backgrounds, ensuring everyone has the opportunity to participate and grow.",
        icon: "user-group"
      }
    ]
  },
  
  // Programs Overview Section
  programsTitle: { type: String, default: "Our Programs" },
  programsSubtitle: { type: String, default: "From youth development to competitive leagues, we offer programs for every age and skill level." },
  programsOverview: {
    type: [{
      ageGroup: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      linkText: { type: String, default: "Learn More →" }
    }],
    default: [
      {
        ageGroup: "U6-U12",
        title: "Youth Development",
        description: "Building fundamental skills and love for the game in our youngest players.",
        linkText: "Learn More →"
      },
      {
        ageGroup: "U13-U18",
        title: "Competitive",
        description: "Advanced training and competitive play for developing athletes.",
        linkText: "Learn More →"
      },
      {
        ageGroup: "18+",
        title: "Adult Leagues",
        description: "Recreational and competitive leagues for adult players of all levels.",
        linkText: "Learn More →"
      },
      {
        ageGroup: "All",
        title: "Special Programs",
        description: "Camps, clinics, and special events throughout the year.",
        linkText: "Learn More →"
      }
    ]
  },
  
  // Why Choose Us Section
  whyChooseUsTitle: { type: String, default: "Why Choose Seattle Leopards FC?" },
  whyChooseUsSubtitle: { type: String, default: "Discover what makes us the premier soccer club in the Seattle area." },
  whyChooseUsFeatures: {
    type: [{
      title: { type: String, default: "" },
      description: { type: String, default: "" }
    }],
    default: [
      {
        title: "Professional Coaching Staff",
        description: "Our certified coaches bring years of experience and a passion for developing young athletes."
      },
      {
        title: "State-of-the-Art Facilities",
        description: "Access to premium fields, training equipment, and modern facilities for optimal development."
      },
      {
        title: "Comprehensive Development",
        description: "Focus on technical skills, tactical understanding, physical fitness, and mental toughness."
      },
      {
        title: "Strong Community",
        description: "Join a supportive network of families, players, and coaches who share your passion for soccer."
      },
      {
        title: "College Pathways",
        description: "Guidance and support for players interested in pursuing soccer at the collegiate level."
      },
      {
        title: "Affordable Excellence",
        description: "High-quality programs at competitive prices, with scholarship opportunities available."
      }
    ]
  },
  
  // Latest News Section
  latestNewsTitle: { type: String, default: "Latest News & Updates" },
  latestNewsSubtitle: { type: String, default: "Stay connected with the latest happenings at Seattle Leopards FC." },
  latestNewsItems: {
    type: [{
      date: { type: String, default: "" },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      linkText: { type: String, default: "Read More →" },
      linkUrl: { type: String, default: "" },
      color: { type: String, default: "green" }
    }],
    default: [
      {
        date: "January 15, 2025",
        title: "Spring Registration Now Open",
        description: "Secure your spot for our spring programs. Early registration discounts available until February 1st.",
        linkText: "Read More →",
        linkUrl: "/programs",
        color: "green"
      },
      {
        date: "January 10, 2025",
        title: "Championship Success",
        description: "Congratulations to our U16 team for winning the regional championship! Amazing teamwork and dedication.",
        linkText: "Read More →",
        linkUrl: "/teams",
        color: "yellow"
      },
      {
        date: "January 5, 2025",
        title: "New Coach Joins Staff",
        description: "Welcome Coach Sarah Martinez to our coaching staff! Sarah brings 10+ years of experience in youth development.",
        linkText: "Read More →",
        linkUrl: "/teams",
        color: "blue"
      }
    ]
  },
  
  // Contact & CTA Section
  ctaTitle: { type: String, default: "Ready to Join the Pride?" },
  ctaSubtitle: { type: String, default: "Whether you're a player, coach, referee, or volunteer, there's a place for you at Seattle Leopards FC." },
  ctaStats: {
    type: [{
      number: { type: String, default: "" },
      label: { type: String, default: "" }
    }],
    default: [
      { number: "500+", label: "Active Players" },
      { number: "25+", label: "Qualified Coaches" },
      { number: "15+", label: "Years Experience" }
    ]
  },
  ctaPrimaryButtonText: { type: String, default: "Apply Now" },
  ctaSecondaryButtonText: { type: String, default: "Contact Us" },
  ctaContactInfo: {
    email: { type: String, default: "info@seattleleopardsfc.com" },
    phone: { type: String, default: "(206) 555-0123" },
    location: { type: String, default: "Seattle, WA" },
    locationDetails: { type: String, default: "Multiple field locations" },
    officeHours: { type: String, default: "Mon-Fri: 9AM-6PM" },
    weekendHours: { type: String, default: "Sat: 9AM-3PM" }
  },
  
  // Homepage Display Settings
  showAboutUsSection: { type: Boolean, default: true },
  showProgramsSection: { type: Boolean, default: true },
  showWhyChooseUsSection: { type: Boolean, default: true },
  showLatestNewsSection: { type: Boolean, default: true },
  showCTASection: { type: Boolean, default: true },
  showStats: { type: Boolean, default: true },
  showContactInfo: { type: Boolean, default: true },
  
  // SEO & Analytics
  googleAnalyticsId: { type: String, default: "" },
  facebookPixelId: { type: String, default: "" },
  googleTagManagerId: { type: String, default: "" },
  bingWebmasterTools: { type: String, default: "" },
  yandexMetrika: { type: String, default: "" },
  metaImageUrl: { type: String, default: "" },
  structuredData: { type: String, default: "" },
  canonicalUrl: { type: String, default: "" },
  robotsTxt: { type: String, default: "User-agent: *\nAllow: /" },
  sitemapUrl: { type: String, default: "" },
  
  // Integrations
  stripePublishableKey: { type: String, default: "" },
  stripeSecretKey: { type: String, default: "" },
  paypalClientId: { type: String, default: "" },
  paypalSecret: { type: String, default: "" },
  googleMapsApiKey: { type: String, default: "" },
  weatherApiKey: { type: String, default: "" },
  smsApiKey: { type: String, default: "" },
  smsProvider: { type: String, default: "twilio" },
  
  // Notifications & Alerts
  enableSMSNotifications: { type: Boolean, default: false },
  enablePushNotifications: { type: Boolean, default: false },
  enableEmailAlerts: { type: Boolean, default: true },
  alertEmailRecipients: { type: String, default: "admin@seattleleopardsfc.com" },
  maintenanceNotifications: { type: Boolean, default: true },
  
  // Maintenance & System
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: "We're currently performing maintenance. Please check back soon." },
  maintenanceStartTime: { type: String, default: "" },
  maintenanceEndTime: { type: String, default: "" },
  systemVersion: { type: String, default: "1.0.0" },
  lastBackup: { type: String, default: "" },
  autoBackup: { type: Boolean, default: true },
  backupFrequency: { type: String, default: "daily" },
  
  // Content Management
  maxFileUploadSize: { type: Number, default: 10485760 },
  allowedFileTypes: { type: String, default: "jpg,jpeg,png,gif,pdf,doc,docx" },
  enableImageWatermark: { type: Boolean, default: false },
  watermarkText: { type: String, default: "Seattle Leopards FC" },
  enableAutoImageResize: { type: Boolean, default: true },
  maxImageWidth: { type: Number, default: 1920 },
  maxImageHeight: { type: Number, default: 1080 },
  
  // User Experience
  enableDarkMode: { type: Boolean, default: false },
  enableAccessibility: { type: Boolean, default: true },
  enableKeyboardNavigation: { type: Boolean, default: true },
  enableScreenReader: { type: Boolean, default: true },
  defaultLanguage: { type: String, default: "en" },
  supportedLanguages: { type: String, default: "en,es" },
  
  // Advanced Features
  enableAPI: { type: Boolean, default: false },
  apiRateLimit: { type: Number, default: 100 },
  enableWebhooks: { type: Boolean, default: false },
  webhookUrl: { type: String, default: "" },
  enableRealTimeUpdates: { type: Boolean, default: false },
  enableOfflineMode: { type: Boolean, default: false },
  
  // Timestamps
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
settingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Settings', settingsSchema); 