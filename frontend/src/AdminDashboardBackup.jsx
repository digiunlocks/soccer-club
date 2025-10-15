import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { toast } from 'react-toastify';

// Lazy load components
const UserManagement = lazy(() => import('./components/UserManagement'));

export default function AdminDashboard() {
  // Navigation state
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    users: 0,
    applications: 0,
    teams: 0,
    broadcasts: 0,
    revenue: 0,
    events: 0,
    messages: 0,
    gallery: 0
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showBroadcastsModal, setShowBroadcastsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Data states
  const [applications, setApplications] = useState([]);
  const [teams, setTeams] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  // Site Settings states
  const [siteSettings, setSiteSettings] = useState({
    // General Settings
    general: {
      siteName: 'Soccer Club Management',
      siteDescription: 'Professional soccer club management system',
      siteUrl: 'https://soccerclub.com',
      adminEmail: 'admin@soccerclub.com',
      timezone: 'America/New_York',
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    // Appearance Settings
    appearance: {
      theme: 'light',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      logo: '',
      favicon: '',
      customCSS: '',
      headerText: 'Welcome to Soccer Club',
      footerText: '© 2024 Soccer Club. All rights reserved.',
      showBreadcrumbs: true,
      showSidebar: true
    },
    // Security Settings
    security: {
      requireEmailVerification: true,
      allowRegistration: true,
      requireStrongPasswords: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableTwoFactor: false,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      maxFileSize: 10,
      enableAuditLog: true,
      ipWhitelist: [],
      maintenanceMode: false
    },
    // Email Settings
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@soccerclub.com',
      fromName: 'Soccer Club',
      enableNotifications: true,
      emailTemplates: {
        welcome: 'Welcome to Soccer Club!',
        passwordReset: 'Password Reset Request',
        applicationReceived: 'Application Received',
        applicationApproved: 'Application Approved'
      }
    },
    // Integration Settings
    integrations: {
      googleAnalytics: '',
      facebookPixel: '',
      stripePublicKey: '',
      stripeSecretKey: '',
      paypalClientId: '',
      twilioAccountSid: '',
      twilioAuthToken: '',
      awsAccessKey: '',
      awsSecretKey: '',
      awsRegion: 'us-east-1',
      awsBucket: ''
    },
    // Backup Settings
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      backupLocation: 'local',
      cloudBackup: false,
      backupEmail: '',
      lastBackup: null,
      nextBackup: null
    },
    // Performance Settings
    performance: {
      enableCaching: true,
      cacheExpiry: 3600,
      enableCompression: true,
      enableCDN: false,
      cdnUrl: '',
      imageOptimization: true,
      lazyLoading: true,
      minifyCSS: true,
      minifyJS: true
    },
    // Social Media Settings
    social: {
      facebookUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      linkedinUrl: '',
      showSocialLinks: true,
      socialLogin: {
        google: false,
        facebook: false,
        twitter: false
      }
    }
  });

  const [settingsTab, setSettingsTab] = useState('general');
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Content Management states
  const [selectedPage, setSelectedPage] = useState('homepage'); // Page selection
  const [pageContent, setPageContent] = useState({
    homepage: {
      title: 'Welcome to Soccer Club',
      subtitle: 'Join our community of passionate soccer players',
      heroImage: '',
      heroText: 'Experience the thrill of competitive soccer with our professional training programs and state-of-the-art facilities.',
      sections: [
        {
          id: 1,
          title: 'Our Programs',
          content: 'We offer comprehensive soccer programs for all ages and skill levels, from beginner to advanced players.',
          image: '',
          type: 'text'
        },
        {
          id: 2,
          title: 'Training Facilities',
          content: 'Our modern facilities include professional-grade fields, training equipment, and dedicated coaching staff.',
          image: '',
          type: 'text'
        }
      ],
      features: [
        { title: 'Professional Coaching', description: 'Experienced coaches with professional backgrounds', icon: 'bi-trophy' },
        { title: 'Modern Facilities', description: 'State-of-the-art training facilities and equipment', icon: 'bi-building' },
        { title: 'Community Focus', description: 'Building a strong soccer community for all ages', icon: 'bi-people' }
      ],
      testimonials: [
        { name: 'John Smith', role: 'Parent', text: 'Great coaching and excellent facilities for my son.', image: '' },
        { name: 'Sarah Johnson', role: 'Player', text: 'The training has improved my game significantly.', image: '' }
      ]
    },
    about: {
      title: 'About Our Soccer Club',
      subtitle: 'Building champions on and off the field',
      mainContent: 'Founded in 2010, our soccer club has been dedicated to developing young talent and fostering a love for the beautiful game. We believe in creating an environment where players can grow both as athletes and individuals.',
      mission: 'To provide exceptional soccer training and development opportunities while building character, teamwork, and sportsmanship.',
      vision: 'To be the premier soccer club in the region, known for developing talented players and contributing to the community.',
      values: [
        'Excellence in training and development',
        'Respect for all players, coaches, and opponents',
        'Teamwork and collaboration',
        'Integrity and fair play',
        'Community involvement and support'
      ],
      history: 'Our club was established by a group of passionate soccer enthusiasts who wanted to create a professional environment for youth development. Over the years, we have grown from a small local team to a comprehensive soccer organization.',
      achievements: [
        'Regional Champions 2023',
        'State Cup Finalists 2022',
        'Youth Development Award 2021',
        'Community Service Recognition 2020'
      ],
      team: [
        { name: 'Coach Martinez', role: 'Head Coach', bio: 'Former professional player with 15 years coaching experience.', image: '' },
        { name: 'Coach Thompson', role: 'Assistant Coach', bio: 'Specializes in youth development and technical training.', image: '' }
      ]
    },
    contact: {
      title: 'Contact Us',
      subtitle: 'Get in touch with our team',
      mainContent: 'We would love to hear from you. Whether you have questions about our programs, want to schedule a visit, or are interested in joining our club, please don\'t hesitate to reach out.',
      contactInfo: {
        address: '123 Soccer Street, Sports City, SC 12345',
        phone: '(555) 123-4567',
        email: 'info@soccerclub.com',
        hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 8:00 AM - 4:00 PM\nSunday: Closed'
      },
      socialMedia: {
        facebook: 'https://facebook.com/soccerclub',
        twitter: 'https://twitter.com/soccerclub',
        instagram: 'https://instagram.com/soccerclub',
        youtube: 'https://youtube.com/soccerclub'
      },
      mapEmbed: '',
      contactForm: {
        enabled: true,
        fields: ['name', 'email', 'phone', 'message'],
        thankYouMessage: 'Thank you for your message. We will get back to you soon!'
      }
    },
    programs: {
      title: 'Our Programs',
      subtitle: 'Comprehensive soccer development for all ages',
      mainContent: 'We offer a wide range of programs designed to develop players at every level, from recreational to competitive play.',
      programs: [
        {
          id: 1,
          name: 'Youth Development (Ages 5-12)',
          description: 'Introduction to soccer with focus on fun, basic skills, and teamwork.',
          ageGroup: '5-12 years',
          schedule: 'Saturdays 9:00 AM - 10:30 AM',
          price: '$150/month',
          features: ['Basic skills training', 'Small-sided games', 'Character development'],
          image: ''
        },
        {
          id: 2,
          name: 'Competitive Teams (Ages 13-18)',
          description: 'Advanced training for serious players looking to compete at higher levels.',
          ageGroup: '13-18 years',
          schedule: 'Tuesday & Thursday 6:00 PM - 8:00 PM',
          price: '$200/month',
          features: ['Advanced tactics', 'Fitness training', 'Tournament play'],
          image: ''
        },
        {
          id: 3,
          name: 'Adult Leagues',
          description: 'Recreational and competitive leagues for adult players.',
          ageGroup: '18+ years',
          schedule: 'Sundays 2:00 PM - 4:00 PM',
          price: '$100/month',
          features: ['League play', 'Social events', 'Flexible scheduling'],
          image: ''
        }
      ]
    }
  });

  const [mediaLibrary, setMediaLibrary] = useState([
    { id: 1, name: 'hero-image.jpg', url: '/images/hero-image.jpg', type: 'image', size: '2.3 MB', uploaded: '2024-01-15' },
    { id: 2, name: 'team-photo.jpg', url: '/images/team-photo.jpg', type: 'image', size: '1.8 MB', uploaded: '2024-01-10' },
    { id: 3, name: 'facility-video.mp4', url: '/videos/facility-video.mp4', type: 'video', size: '15.2 MB', uploaded: '2024-01-05' }
  ]);

  const [seoSettings, setSeoSettings] = useState({
    homepage: {
      title: 'Soccer Club - Professional Training & Development',
      description: 'Join our premier soccer club for professional training, modern facilities, and championship development programs.',
      keywords: 'soccer club, youth soccer, training, development, competitive',
      ogImage: '/images/og-homepage.jpg'
    },
    about: {
      title: 'About Us - Soccer Club History & Mission',
      description: 'Learn about our soccer club\'s history, mission, and commitment to developing young athletes.',
      keywords: 'about soccer club, history, mission, coaches, achievements',
      ogImage: '/images/og-about.jpg'
    },
    contact: {
      title: 'Contact Soccer Club - Get In Touch',
      description: 'Contact our soccer club for information about programs, registration, and facility tours.',
      keywords: 'contact soccer club, information, registration, programs',
      ogImage: '/images/og-contact.jpg'
    }
  });

  const [contentChanged, setContentChanged] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [contentTab, setContentTab] = useState('pages');

  // Expanded Content Management states
  const [blogPosts, setBlogPosts] = useState([
    {
      id: 1,
      title: 'Welcome to Our New Season',
      slug: 'welcome-new-season',
      excerpt: 'We are excited to announce the start of our new soccer season with amazing opportunities for all players.',
      content: 'This season promises to be our best yet with new coaching staff, improved facilities, and exciting tournaments...',
      author: 'Coach Martinez',
      publishDate: '2024-01-15',
      status: 'published',
      featuredImage: '/images/blog/season-start.jpg',
      tags: ['season', 'announcement', 'coaching'],
      category: 'News',
      views: 245,
      likes: 18,
      comments: 5
    },
    {
      id: 2,
      title: 'Training Tips for Young Players',
      slug: 'training-tips-young-players',
      excerpt: 'Essential training tips to help young soccer players improve their skills and performance.',
      content: 'Developing fundamental skills at a young age is crucial for long-term success in soccer...',
      author: 'Coach Thompson',
      publishDate: '2024-01-10',
      status: 'draft',
      featuredImage: '/images/blog/training-tips.jpg',
      tags: ['training', 'youth', 'skills'],
      category: 'Training',
      views: 0,
      likes: 0,
      comments: 0
    }
  ]);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Season Opening Tournament',
      description: 'Join us for our annual season opening tournament featuring teams from across the region.',
      startDate: '2024-02-15',
      endDate: '2024-02-17',
      startTime: '09:00',
      endTime: '17:00',
      location: 'Main Soccer Field',
      address: '123 Soccer Street, Sports City',
      category: 'Tournament',
      status: 'published',
      maxAttendees: 200,
      currentAttendees: 45,
      price: '$25',
      featuredImage: '/images/events/tournament.jpg',
      registrationRequired: true,
      tags: ['tournament', 'season', 'competition']
    },
    {
      id: 2,
      title: 'Parent Meeting',
      description: 'Important information session for parents about the upcoming season.',
      startDate: '2024-01-25',
      endDate: '2024-01-25',
      startTime: '19:00',
      endTime: '21:00',
      location: 'Club House',
      address: '123 Soccer Street, Sports City',
      category: 'Meeting',
      status: 'published',
      maxAttendees: 100,
      currentAttendees: 23,
      price: 'Free',
      featuredImage: '/images/events/meeting.jpg',
      registrationRequired: false,
      tags: ['meeting', 'parents', 'information']
    }
  ]);

  const [newsletters, setNewsletters] = useState([
    {
      id: 1,
      subject: 'January 2024 Club Newsletter',
      content: 'Welcome to our January newsletter with updates on the new season, upcoming events, and player highlights.',
      status: 'sent',
      sentDate: '2024-01-01',
      recipients: 156,
      openRate: 68.5,
      clickRate: 12.3,
      template: 'default'
    },
    {
      id: 2,
      subject: 'Training Schedule Updates',
      content: 'Important updates to our training schedule and new program announcements.',
      status: 'draft',
      sentDate: null,
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      template: 'training'
    }
  ]);

  const [contentTemplates, setContentTemplates] = useState([
    {
      id: 1,
      name: 'Hero Section',
      type: 'section',
      content: {
        title: 'Your Title Here',
        subtitle: 'Your subtitle here',
        backgroundImage: '',
        ctaText: 'Learn More',
        ctaLink: '#'
      },
      preview: '/images/templates/hero.jpg'
    },
    {
      id: 2,
      name: 'Feature Grid',
      type: 'section',
      content: {
        title: 'Our Features',
        features: [
          { title: 'Feature 1', description: 'Description here', icon: 'bi-star' },
          { title: 'Feature 2', description: 'Description here', icon: 'bi-heart' },
          { title: 'Feature 3', description: 'Description here', icon: 'bi-trophy' }
        ]
      },
      preview: '/images/templates/features.jpg'
    },
    {
      id: 3,
      name: 'Blog Post',
      type: 'post',
      content: {
        title: 'Blog Post Title',
        excerpt: 'Brief description of the blog post...',
        content: 'Full blog post content goes here...',
        tags: ['tag1', 'tag2'],
        category: 'News'
      },
      preview: '/images/templates/blog.jpg'
    }
  ]);

  const [contentWorkflow, setContentWorkflow] = useState({
    enabled: true,
    stages: ['draft', 'review', 'approved', 'published'],
    approvers: ['admin@soccerclub.com', 'editor@soccerclub.com'],
    autoPublish: false,
    reviewDeadline: 24 // hours
  });

  const [contentAnalytics, setContentAnalytics] = useState({
    totalViews: 15420,
    totalLikes: 892,
    totalComments: 234,
    topPages: [
      { page: 'Homepage', views: 5420, unique: 3200 },
      { page: 'About Us', views: 2100, unique: 1800 },
      { page: 'Programs', views: 1890, unique: 1200 },
      { page: 'Contact', views: 1560, unique: 1100 }
    ],
    topPosts: [
      { title: 'Welcome to Our New Season', views: 245, engagement: 8.5 },
      { title: 'Training Tips for Young Players', views: 189, engagement: 6.2 }
    ],
    engagement: {
      averageTimeOnPage: '2:34',
      bounceRate: 35.2,
      conversionRate: 4.8
    }
  });

  const [galleries, setGalleries] = useState([
    {
      id: 1,
      name: 'Season 2024 Photos',
      description: 'Photos from our 2024 season activities',
      images: [
        { id: 1, url: '/images/gallery/season1.jpg', caption: 'Team practice', alt: 'Team practice session' },
        { id: 2, url: '/images/gallery/season2.jpg', caption: 'Tournament win', alt: 'Championship celebration' },
        { id: 3, url: '/images/gallery/season3.jpg', caption: 'Award ceremony', alt: 'Player awards' }
      ],
      status: 'published',
      created: '2024-01-15',
      views: 89
    },
    {
      id: 2,
      name: 'Training Sessions',
      description: 'Behind the scenes training photos',
      images: [
        { id: 4, url: '/images/gallery/training1.jpg', caption: 'Youth training', alt: 'Young players training' },
        { id: 5, url: '/images/gallery/training2.jpg', caption: 'Skills practice', alt: 'Individual skills training' }
      ],
      status: 'draft',
      created: '2024-01-10',
      views: 0
    }
  ]);

  const [selectedContentType, setSelectedContentType] = useState('all');
  const [contentFilter, setContentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchContent, setSearchContent] = useState('');

  // User Management states
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'john_doe',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '555-0123',
      role: 'player',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-20',
      profileImage: '/images/users/john.jpg',
      isVerified: true,
      totalPosts: 12,
      totalComments: 45,
      totalLikes: 89,
      lastActivity: '2024-01-20 14:30',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'New York, NY',
      timezone: 'EST',
      preferences: {
        notifications: true,
        emailUpdates: true,
        privacy: 'public'
      },
      subscription: {
        plan: 'premium',
        expires: '2024-12-31',
        autoRenew: true
      },
      violations: 0,
      warnings: 0,
      isBanned: false,
      banReason: '',
      banExpires: null
    },
    {
      id: 2,
      username: 'jane_smith',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '555-0124',
      role: 'coach',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-19',
      profileImage: '/images/users/jane.jpg',
      isVerified: true,
      totalPosts: 8,
      totalComments: 23,
      totalLikes: 67,
      lastActivity: '2024-01-19 16:45',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'Los Angeles, CA',
      timezone: 'PST',
      preferences: {
        notifications: false,
        emailUpdates: true,
        privacy: 'friends'
      },
      subscription: {
        plan: 'basic',
        expires: '2024-06-30',
        autoRenew: false
      },
      violations: 1,
      warnings: 2,
      isBanned: false,
      banReason: '',
      banExpires: null
    },
    {
      id: 3,
      username: 'mike_wilson',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '555-0125',
      role: 'parent',
      status: 'suspended',
      joinDate: '2024-01-05',
      lastLogin: '2024-01-18',
      profileImage: '/images/users/mike.jpg',
      isVerified: false,
      totalPosts: 3,
      totalComments: 12,
      totalLikes: 5,
      lastActivity: '2024-01-18 09:15',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      location: 'Chicago, IL',
      timezone: 'CST',
      preferences: {
        notifications: true,
        emailUpdates: false,
        privacy: 'private'
      },
      subscription: {
        plan: 'free',
        expires: null,
        autoRenew: false
      },
      violations: 3,
      warnings: 5,
      isBanned: true,
      banReason: 'Inappropriate content and harassment',
      banExpires: '2024-02-18'
    }
  ]);

  const [userManagementTab, setUserManagementTab] = useState('overview');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [userSortBy, setUserSortBy] = useState('joinDate');
  const [userSortOrder, setUserSortOrder] = useState('desc');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkActionValue, setBulkActionValue] = useState('');
  const [isUserTableLoading, setIsUserTableLoading] = useState(false);
  const [userActivityLog, setUserActivityLog] = useState([
    {
      id: 1,
      userId: 1,
      action: 'login',
      description: 'User logged in successfully',
      timestamp: '2024-01-20 14:30:00',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'New York, NY'
    },
    {
      id: 2,
      userId: 1,
      action: 'post_created',
      description: 'Created new post: "Great training session today!"',
      timestamp: '2024-01-20 14:25:00',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'New York, NY'
    },
    {
      id: 3,
      userId: 2,
      action: 'comment_created',
      description: 'Commented on post: "Re: Training Schedule"',
      timestamp: '2024-01-19 16:45:00',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'Los Angeles, CA'
    },
    {
      id: 4,
      userId: 3,
      action: 'account_suspended',
      description: 'Account suspended for policy violations',
      timestamp: '2024-01-18 09:15:00',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      location: 'Chicago, IL'
    }
  ]);
  const [userPermissions, setUserPermissions] = useState({
    1: {
      canCreatePosts: true,
      canComment: true,
      canUploadMedia: true,
      canManageTeams: false,
      canViewAnalytics: false,
      canModerateContent: false,
      canManageUsers: false
    },
    2: {
      canCreatePosts: true,
      canComment: true,
      canUploadMedia: true,
      canManageTeams: true,
      canViewAnalytics: true,
      canModerateContent: true,
      canManageUsers: false
    },
    3: {
      canCreatePosts: false,
      canComment: false,
      canUploadMedia: false,
      canManageTeams: false,
      canViewAnalytics: false,
      canModerateContent: false,
      canManageUsers: false
    }
  });
  const [userAnalytics, setUserAnalytics] = useState({
    totalUsers: 1250,
    activeUsers: 1100,
    newUsersThisMonth: 45,
    bannedUsers: 12,
    userGrowth: 15.2,
    averageSessionTime: '8:45',
    topCountries: [
      { country: 'United States', users: 450, percentage: 36 },
      { country: 'Canada', users: 180, percentage: 14.4 },
      { country: 'United Kingdom', users: 120, percentage: 9.6 },
      { country: 'Australia', users: 95, percentage: 7.6 }
    ],
    userRoles: [
      { role: 'Player', count: 800, percentage: 64 },
      { role: 'Parent', count: 300, percentage: 24 },
      { role: 'Coach', count: 100, percentage: 8 },
      { role: 'Admin', count: 50, percentage: 4 }
    ],
    activityStats: {
      dailyActiveUsers: 450,
      weeklyActiveUsers: 850,
      monthlyActiveUsers: 1100,
      retentionRate: 78.5
    }
  });

  const [userContent, setUserContent] = useState([
    {
      id: 1,
      userId: 1,
      type: 'post',
      title: 'Great training session today!',
      content: 'Had an amazing training session with the team. The new drills are really helping improve our skills.',
      status: 'published',
      createdAt: '2024-01-20 14:30',
      likes: 12,
      comments: 5,
      reports: 0,
      isFlagged: false
    },
    {
      id: 2,
      userId: 2,
      type: 'comment',
      title: 'Re: Training Schedule',
      content: 'I think we should adjust the training schedule to accommodate working parents.',
      status: 'published',
      createdAt: '2024-01-19 16:45',
      likes: 8,
      comments: 0,
      reports: 1,
      isFlagged: true
    },
    {
      id: 3,
      userId: 3,
      type: 'post',
      title: 'Inappropriate content',
      content: 'This post contains inappropriate language and should be removed.',
      status: 'flagged',
      createdAt: '2024-01-18 09:15',
      likes: 0,
      comments: 0,
      reports: 3,
      isFlagged: true
    }
  ]);

  const [userReports, setUserReports] = useState([
    {
      id: 1,
      reporterId: 5,
      reportedUserId: 3,
      reason: 'Harassment',
      description: 'User has been sending inappropriate messages',
      status: 'pending',
      createdAt: '2024-01-20 10:30',
      evidence: ['message1.jpg', 'message2.jpg']
    },
    {
      id: 2,
      reporterId: 8,
      reportedUserId: 3,
      reason: 'Spam',
      description: 'User is posting spam content repeatedly',
      status: 'investigating',
      createdAt: '2024-01-19 15:20',
      evidence: ['post1.jpg', 'post2.jpg']
    }
  ]);


  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Fetch stats on component mount
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access the admin dashboard');
      return;
    }

    // Check if user has admin privileges
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', payload);
      if (!payload.isSuperAdmin) {
        toast.error('Access denied. Admin privileges required.');
        console.log('User does not have superAdmin privileges');
        return;
      }
      console.log('User has superAdmin privileges, proceeding...');
    } catch (error) {
      console.error('Error parsing token:', error);
      toast.error('Invalid authentication token');
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    console.log('Fetching comprehensive dashboard statistics...');
    
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No authentication token found');
      toast.error('Please log in to view dashboard statistics');
      setIsLoading(false);
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Initialize stats with default values
    let stats = {
      users: 0,
      applications: 0,
      teams: 0,
      broadcasts: 0,
      revenue: 0,
      events: 0,
      messages: 0,
      gallery: 0
    };

    // Fetch users count
    try {
      const usersResponse = await fetch('/api/auth/users', { headers });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        stats.users = usersData.length || 0;
      }
    } catch (error) {
      console.log('Users API error:', error.message);
    }
    
    // Fetch applications count
    try {
      const applicationsResponse = await fetch('/api/application', { headers });
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        const pendingApplications = applicationsData.filter(app => app.status === 'pending');
        stats.applications = pendingApplications.length || 0;
      }
    } catch (error) {
      console.log('Applications API error:', error.message);
    }
    
    // Fetch teams count
    try {
      const teamsResponse = await fetch('/api/teams', { headers });
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        stats.teams = teamsData.length || 0;
      }
    } catch (error) {
      console.log('Teams API error:', error.message);
    }
    
    // Fetch broadcasts count
    try {
      const broadcastsResponse = await fetch('/api/broadcasts', { headers });
      if (broadcastsResponse.ok) {
        const broadcastsData = await broadcastsResponse.json();
        stats.broadcasts = broadcastsData.length || 0;
      }
    } catch (error) {
      console.log('Broadcasts API error:', error.message);
    }

    // Fetch additional stats (mock data for now)
    stats.revenue = 15420;
    stats.events = 8;
    stats.messages = 156;
    stats.gallery = 89;

    // Fetch recent activity
    try {
      setRecentActivity([
        { id: 1, type: 'user_registration', user: 'John Doe', timestamp: new Date(), details: 'New user registered' },
        { id: 2, type: 'application_submitted', user: 'Jane Smith', timestamp: new Date(), details: 'Player application submitted' },
        { id: 3, type: 'team_created', user: 'Admin', timestamp: new Date(), details: 'New team "Thunder Hawks" created' },
        { id: 4, type: 'broadcast_sent', user: 'Admin', timestamp: new Date(), details: 'Practice schedule updated' }
      ]);
    } catch (error) {
      console.log('Recent activity error:', error.message);
    }

    // Fetch system health
    setSystemHealth({
      database: 'healthy',
      server: 'healthy',
      storage: '85%',
      uptime: '99.9%'
    });

    // Fetch notifications
    setNotifications([
      { id: 1, type: 'warning', message: 'Storage usage is at 85%', timestamp: new Date() },
      { id: 2, type: 'info', message: 'New user registration', timestamp: new Date() },
      { id: 3, type: 'success', message: 'Backup completed successfully', timestamp: new Date() }
    ]);

    console.log('Final stats:', stats);
    setStats(stats);
    setIsLoading(false);
  };

  const openModal = async (modalType) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access this feature');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      switch (modalType) {
        case 'users':
          const usersResponse = await fetch('/api/auth/users', { headers });
          if (!usersResponse.ok) {
            throw new Error(`Users API error: ${usersResponse.status}`);
          }
          const usersData = await usersResponse.json();
          setUsers(usersData);
          setShowUsersModal(true);
          break;
        case 'applications':
          const applicationsResponse = await fetch('/api/application', { headers });
          if (!applicationsResponse.ok) {
            throw new Error(`Applications API error: ${applicationsResponse.status}`);
          }
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData);
          setShowApplicationsModal(true);
          break;
        case 'teams':
          const teamsResponse = await fetch('/api/teams', { headers });
          if (!teamsResponse.ok) {
            throw new Error(`Teams API error: ${teamsResponse.status}`);
          }
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
          setShowTeamsModal(true);
          break;
        case 'broadcasts':
          const broadcastsResponse = await fetch('/api/broadcasts', { headers });
          if (!broadcastsResponse.ok) {
            throw new Error(`Broadcasts API error: ${broadcastsResponse.status}`);
          }
          const broadcastsData = await broadcastsResponse.json();
          setBroadcasts(broadcastsData);
          setShowBroadcastsModal(true);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${modalType}:`, error);
      if (error.message.includes('401') || error.message.includes('403')) {
        toast.error('Authentication required. Please log in again.');
      } else {
        toast.error(`Failed to fetch ${modalType}`);
      }
    }
  };

  // Settings management functions
  const updateSetting = (category, key, value) => {
    setSiteSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setSettingsChanged(true);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // In a real application, you would send this to your backend
      console.log('Saving settings:', siteSettings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully!');
      setSettingsChanged(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSiteSettings({
        general: {
          siteName: 'Soccer Club Management',
          siteDescription: 'Professional soccer club management system',
          siteUrl: 'https://soccerclub.com',
          adminEmail: 'admin@soccerclub.com',
          timezone: 'America/New_York',
          language: 'en',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h'
        },
        appearance: {
          theme: 'light',
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          logo: '',
          favicon: '',
          customCSS: '',
          headerText: 'Welcome to Soccer Club',
          footerText: '© 2024 Soccer Club. All rights reserved.',
          showBreadcrumbs: true,
          showSidebar: true
        },
        security: {
          requireEmailVerification: true,
          allowRegistration: true,
          requireStrongPasswords: true,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
          enableTwoFactor: false,
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
          maxFileSize: 10,
          enableAuditLog: true,
          ipWhitelist: [],
          maintenanceMode: false
        },
        email: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: 'noreply@soccerclub.com',
          fromName: 'Soccer Club',
          enableNotifications: true,
          emailTemplates: {
            welcome: 'Welcome to Soccer Club!',
            passwordReset: 'Password Reset Request',
            applicationReceived: 'Application Received',
            applicationApproved: 'Application Approved'
          }
        },
        integrations: {
          googleAnalytics: '',
          facebookPixel: '',
          stripePublicKey: '',
          stripeSecretKey: '',
          paypalClientId: '',
          twilioAccountSid: '',
          twilioAuthToken: '',
          awsAccessKey: '',
          awsSecretKey: '',
          awsRegion: 'us-east-1',
          awsBucket: ''
        },
        backup: {
          autoBackup: true,
          backupFrequency: 'daily',
          backupRetention: 30,
          backupLocation: 'local',
          cloudBackup: false,
          backupEmail: '',
          lastBackup: null,
          nextBackup: null
        },
        performance: {
          enableCaching: true,
          cacheExpiry: 3600,
          enableCompression: true,
          enableCDN: false,
          cdnUrl: '',
          imageOptimization: true,
          lazyLoading: true,
          minifyCSS: true,
          minifyJS: true
        },
        social: {
          facebookUrl: '',
          twitterUrl: '',
          instagramUrl: '',
          youtubeUrl: '',
          linkedinUrl: '',
          showSocialLinks: true,
          socialLogin: {
            google: false,
            facebook: false,
            twitter: false
          }
        }
      });
      setSettingsChanged(true);
      toast.info('Settings reset to default values');
    }
  };

  const testEmailConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Simulate email test
      toast.info('Testing email connection...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Email connection test successful!');
    } catch (error) {
      toast.error('Email connection test failed');
    }
  };

  const createBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      toast.info('Creating backup...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Backup created successfully!');
      
      // Update backup info
      updateSetting('backup', 'lastBackup', new Date());
    } catch (error) {
      toast.error('Backup creation failed');
    }
  };

  // Content Management functions
  const updatePageContent = (page, field, value) => {
    setPageContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
    setContentChanged(true);
  };

  const updatePageSection = (page, sectionId, field, value) => {
    setPageContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        sections: prev[page].sections?.map(section => 
          section.id === sectionId ? { ...section, [field]: value } : section
        ) || []
      }
    }));
    setContentChanged(true);
  };

  const addPageSection = (page) => {
    const newSection = {
      id: Date.now(),
      title: 'New Section',
      content: 'Add your content here...',
      image: '',
      type: 'text'
    };
    
    setPageContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        sections: [...(prev[page].sections || []), newSection]
      }
    }));
    setContentChanged(true);
  };

  const removePageSection = (page, sectionId) => {
    setPageContent(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        sections: prev[page].sections?.filter(section => section.id !== sectionId) || []
      }
    }));
    setContentChanged(true);
  };

  const savePageContent = async () => {
    setSavingContent(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // In a real application, you would send this to your backend
      console.log('Saving page content:', pageContent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Page content saved successfully!');
      setContentChanged(false);
    } catch (error) {
      console.error('Error saving page content:', error);
      toast.error('Failed to save page content');
    } finally {
      setSavingContent(false);
    }
  };

  const uploadMedia = async (file) => {
    try {
      // Simulate file upload
      toast.info('Uploading media...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newMedia = {
        id: Date.now(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        uploaded: new Date().toISOString().split('T')[0]
      };
      
      setMediaLibrary(prev => [newMedia, ...prev]);
      toast.success('Media uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload media');
    }
  };

  const updateSEOSettings = (page, field, value) => {
    setSeoSettings(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
    setContentChanged(true);
  };

  const previewPage = () => {
    setPreviewMode(true);
    // In a real application, this would open a preview window
    toast.info('Preview mode activated');
  };

  const publishPage = async () => {
    try {
      await savePageContent();
      toast.success('Page published successfully!');
    } catch (error) {
      toast.error('Failed to publish page');
    }
  };

  // Expanded Content Management functions
  const createBlogPost = () => {
    const newPost = {
      id: Date.now(),
      title: 'New Blog Post',
      slug: 'new-blog-post',
      excerpt: 'Write a brief excerpt here...',
      content: 'Write your blog post content here...',
      author: 'Admin',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      featuredImage: '',
      tags: [],
      category: 'News',
      views: 0,
      likes: 0,
      comments: 0
    };
    setBlogPosts(prev => [newPost, ...prev]);
    setContentChanged(true);
    toast.success('New blog post created!');
  };

  const updateBlogPost = (postId, field, value) => {
    setBlogPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, [field]: value } : post
    ));
    setContentChanged(true);
  };

  const deleteBlogPost = (postId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
      setContentChanged(true);
      toast.success('Blog post deleted!');
    }
  };

  const createEvent = () => {
    const newEvent = {
      id: Date.now(),
      title: 'New Event',
      description: 'Event description here...',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      location: '',
      address: '',
      category: 'Event',
      status: 'draft',
      maxAttendees: 100,
      currentAttendees: 0,
      price: 'Free',
      featuredImage: '',
      registrationRequired: false,
      tags: []
    };
    setEvents(prev => [newEvent, ...prev]);
    setContentChanged(true);
    toast.success('New event created!');
  };

  const updateEvent = (eventId, field, value) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, [field]: value } : event
    ));
    setContentChanged(true);
  };

  const deleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setContentChanged(true);
      toast.success('Event deleted!');
    }
  };

  const createNewsletter = () => {
    const newNewsletter = {
      id: Date.now(),
      subject: 'New Newsletter',
      content: 'Write your newsletter content here...',
      status: 'draft',
      sentDate: null,
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      template: 'default'
    };
    setNewsletters(prev => [newNewsletter, ...prev]);
    setContentChanged(true);
    toast.success('New newsletter created!');
  };

  const updateNewsletter = (newsletterId, field, value) => {
    setNewsletters(prev => prev.map(newsletter => 
      newsletter.id === newsletterId ? { ...newsletter, [field]: value } : newsletter
    ));
    setContentChanged(true);
  };

  const sendNewsletter = async (newsletterId) => {
    try {
      toast.info('Sending newsletter...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNewsletters(prev => prev.map(newsletter => 
        newsletter.id === newsletterId 
          ? { 
              ...newsletter, 
              status: 'sent', 
              sentDate: new Date().toISOString().split('T')[0],
              recipients: 156,
              openRate: Math.random() * 30 + 50,
              clickRate: Math.random() * 10 + 5
            } 
          : newsletter
      ));
      
      toast.success('Newsletter sent successfully!');
    } catch (error) {
      toast.error('Failed to send newsletter');
    }
  };

  const createGallery = () => {
    const newGallery = {
      id: Date.now(),
      name: 'New Gallery',
      description: 'Gallery description here...',
      images: [],
      status: 'draft',
      created: new Date().toISOString().split('T')[0],
      views: 0
    };
    setGalleries(prev => [newGallery, ...prev]);
    setContentChanged(true);
    toast.success('New gallery created!');
  };

  const updateGallery = (galleryId, field, value) => {
    setGalleries(prev => prev.map(gallery => 
      gallery.id === galleryId ? { ...gallery, [field]: value } : gallery
    ));
    setContentChanged(true);
  };

  const addImageToGallery = (galleryId, imageFile) => {
    const newImage = {
      id: Date.now(),
      url: URL.createObjectURL(imageFile),
      caption: '',
      alt: imageFile.name
    };
    
    setGalleries(prev => prev.map(gallery => 
      gallery.id === galleryId 
        ? { ...gallery, images: [...gallery.images, newImage] }
        : gallery
    ));
    setContentChanged(true);
  };

  const createContentTemplate = () => {
    const newTemplate = {
      id: Date.now(),
      name: 'New Template',
      type: 'section',
      content: {},
      preview: ''
    };
    setContentTemplates(prev => [newTemplate, ...prev]);
    setContentChanged(true);
    toast.success('New template created!');
  };

  const useTemplate = (templateId, targetPage) => {
    const template = contentTemplates.find(t => t.id === templateId);
    if (template) {
      // Apply template content to the target page
      toast.success(`Template "${template.name}" applied to ${targetPage}!`);
    }
  };

  const updateWorkflowSettings = (field, value) => {
    setContentWorkflow(prev => ({
      ...prev,
      [field]: value
    }));
    setContentChanged(true);
  };

  const approveContent = async (contentId, contentType) => {
    try {
      toast.info('Approving content...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (contentType === 'blog') {
        setBlogPosts(prev => prev.map(post => 
          post.id === contentId ? { ...post, status: 'approved' } : post
        ));
      } else if (contentType === 'event') {
        setEvents(prev => prev.map(event => 
          event.id === contentId ? { ...event, status: 'approved' } : event
        ));
      }
      
      toast.success('Content approved!');
    } catch (error) {
      toast.error('Failed to approve content');
    }
  };

  const exportContent = async (contentType) => {
    try {
      let data = {};
      if (contentType === 'all') {
        data = { pageContent, blogPosts, events, newsletters, galleries };
      } else if (contentType === 'blog') {
        data = blogPosts;
      } else if (contentType === 'events') {
        data = events;
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contentType}-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Content exported successfully!');
    } catch (error) {
      toast.error('Failed to export content');
    }
  };

  const importContent = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.blogPosts) setBlogPosts(data.blogPosts);
      if (data.events) setEvents(data.events);
      if (data.newsletters) setNewsletters(data.newsletters);
      if (data.galleries) setGalleries(data.galleries);
      
      setContentChanged(true);
      toast.success('Content imported successfully!');
    } catch (error) {
      toast.error('Failed to import content');
    }
  };

  // User Management functions
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        toast.info('Deleting user...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUsers(prev => prev.filter(user => user.id !== userId));
        setUserContent(prev => prev.filter(content => content.userId !== userId));
        setUserReports(prev => prev.filter(report => report.reportedUserId !== userId));
        
        toast.success('User deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const deleteMultipleUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      try {
        toast.info(`Deleting ${selectedUsers.length} users...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setUserContent(prev => prev.filter(content => !selectedUsers.includes(content.userId)));
        setUserReports(prev => prev.filter(report => !selectedUsers.includes(report.reportedUserId)));
        setSelectedUsers([]);
        
        toast.success(`${selectedUsers.length} users deleted successfully!`);
      } catch (error) {
        toast.error('Failed to delete users');
      }
    }
  };

  const resetUserPassword = async (userId) => {
    try {
      toast.info('Resetting password...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would send a password reset email
      const user = users.find(u => u.id === userId);
      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const banUser = async (userId, reason, duration) => {
    try {
      toast.info('Banning user...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isBanned: true, 
              banReason: reason,
              banExpires: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
              status: 'banned'
            } 
          : user
      ));
      
      toast.success('User banned successfully!');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const unbanUser = async (userId) => {
    try {
      toast.info('Unbanning user...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isBanned: false, 
              banReason: '',
              banExpires: null,
              status: 'active'
            } 
          : user
      ));
      
      toast.success('User unbanned successfully!');
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const suspendUser = async (userId, reason, duration) => {
    try {
      toast.info('Suspending user...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              status: 'suspended',
              violations: user.violations + 1
            } 
          : user
      ));
      
      toast.success('User suspended successfully!');
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const activateUser = async (userId) => {
    try {
      toast.info('Activating user...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: 'active' } 
          : user
      ));
      
      toast.success('User activated successfully!');
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      toast.info('Updating user role...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole } 
          : user
      ));
      
      toast.success('User role updated successfully!');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const approveUserContent = async (contentId) => {
    try {
      toast.info('Approving content...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserContent(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, status: 'approved', isFlagged: false } 
          : content
      ));
      
      toast.success('Content approved successfully!');
    } catch (error) {
      toast.error('Failed to approve content');
    }
  };

  const rejectUserContent = async (contentId, reason) => {
    try {
      toast.info('Rejecting content...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserContent(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, status: 'rejected', isFlagged: true } 
          : content
      ));
      
      toast.success('Content rejected successfully!');
    } catch (error) {
      toast.error('Failed to reject content');
    }
  };

  const deleteUserContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        toast.info('Deleting content...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setUserContent(prev => prev.filter(content => content.id !== contentId));
        toast.success('Content deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete content');
      }
    }
  };

  const resolveUserReport = async (reportId, action, notes) => {
    try {
      toast.info('Resolving report...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'resolved', action, notes } 
          : report
      ));
      
      toast.success('Report resolved successfully!');
    } catch (error) {
      toast.error('Failed to resolve report');
    }
  };

  const exportUserData = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const userContentData = userContent.filter(c => c.userId === userId);
      const userReportsData = userReports.filter(r => r.reportedUserId === userId);
      
      const data = {
        user,
        content: userContentData,
        reports: userReportsData,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('User data exported successfully!');
    } catch (error) {
      toast.error('Failed to export user data');
    }
  };

  const sendUserNotification = async (userId, message, type = 'info') => {
    try {
      toast.info('Sending notification...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would send a notification to the user
      const user = users.find(u => u.id === userId);
      toast.success(`Notification sent to ${user.name}`);
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const toggleUserSelection = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(getFilteredUsers.map(user => user.id));
  }, [getFilteredUsers]);

  const clearUserSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const getFilteredUsers = useMemo(() => {
    let filtered = users;
    
    if (debouncedUserSearch) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
        user.username.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedUserSearch.toLowerCase())
      );
    }
    
    if (userRoleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === userRoleFilter);
    }
    
    if (userStatusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === userStatusFilter);
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[userSortBy];
      const bValue = b[userSortBy];
      
      if (userSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [users, debouncedUserSearch, userRoleFilter, userStatusFilter, userSortBy, userSortOrder]);

  // Enhanced user management functions
  const performBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users to perform bulk action');
      return;
    }

    try {
      toast.info(`Performing bulk action: ${bulkActionType}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      switch (bulkActionType) {
        case 'delete':
          setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
          break;
        case 'ban':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, isBanned: true, status: 'banned', banReason: bulkActionValue }
              : user
          ));
          break;
        case 'activate':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'active' }
              : user
          ));
          break;
        case 'suspend':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'suspended' }
              : user
          ));
          break;
        case 'changeRole':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, role: bulkActionValue }
              : user
          ));
          break;
        case 'sendNotification':
          // In a real app, this would send notifications to selected users
          break;
      }

      setSelectedUsers([]);
      setShowBulkActionsModal(false);
      toast.success(`Bulk action completed for ${selectedUsers.length} users`);
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      toast.info('Updating user permissions...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserPermissions(prev => ({
        ...prev,
        [userId]: permissions
      }));
      
      toast.success('User permissions updated successfully!');
    } catch (error) {
      toast.error('Failed to update user permissions');
    }
  };

  const getUserActivity = (userId) => {
    return userActivityLog.filter(activity => activity.userId === userId);
  };

  const exportUserReport = async (userId, reportType) => {
    try {
      const user = users.find(u => u.id === userId);
      const activity = getUserActivity(userId);
      const permissions = userPermissions[userId] || {};
      
      const data = {
        user,
        activity,
        permissions,
        reportType,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Super Admin'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-report-${user.username}-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('User report exported successfully!');
    } catch (error) {
      toast.error('Failed to export user report');
    }
  };

  const sendBulkNotification = async (message, type = 'info') => {
    try {
      toast.info(`Sending notification to ${selectedUsers.length} users...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would send notifications to all selected users
      toast.success(`Notification sent to ${selectedUsers.length} users`);
    } catch (error) {
      toast.error('Failed to send notifications');
    }
  };

  const importUsers = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.users && Array.isArray(data.users)) {
        const newUsers = data.users.map((user, index) => ({
          ...user,
          id: Date.now() + index,
          joinDate: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0],
          status: 'active',
          isVerified: false,
          totalPosts: 0,
          totalComments: 0,
          totalLikes: 0,
          violations: 0,
          warnings: 0,
          isBanned: false
        }));
        
        setUsers(prev => [...prev, ...newUsers]);
        toast.success(`${newUsers.length} users imported successfully!`);
      } else {
        toast.error('Invalid file format');
      }
    } catch (error) {
      toast.error('Failed to import users');
    }
  };

  return (
    <div className="container-fluid">
      <style jsx>{`
        .sidebar.collapsed {
          width: 60px !important;
        }
        .sidebar.collapsed .nav-link {
          padding: 0.5rem 0.75rem;
          text-align: center;
        }
        .sidebar.collapsed .nav-link i {
          margin-right: 0 !important;
        }
        .form-control-color {
          width: 3rem;
          height: calc(1.5em + 0.75rem + 2px);
          padding: 0.375rem;
        }
        .settings-tab-content {
          min-height: 500px;
        }
        .card-header-tabs .nav-link {
          border: none;
          color: #6c757d;
        }
        .card-header-tabs .nav-link.active {
          color: #007bff;
          background-color: transparent;
          border-bottom: 2px solid #007bff;
        }
        .table-hover tbody tr {
          transition: background-color 0.15s ease-in-out;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(0, 0, 0, 0.075);
        }
        .btn-group-sm .btn {
          transition: all 0.15s ease-in-out;
        }
        .badge {
          transition: all 0.15s ease-in-out;
        }
        .card-header-tabs .nav-link:hover {
          color: #007bff;
          background-color: transparent;
        }
      `}</style>
      <div className="row">
        {/* Enhanced Sidebar */}
        <nav className={`col-md-3 col-lg-2 d-md-block bg-dark sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="position-sticky pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white mb-0">Admin Panel</h5>
              <button 
                className="btn btn-sm btn-outline-light"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <i className={`bi bi-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
              </button>
            </div>
            
            <ul className="nav flex-column">
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'overview' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('overview')}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  {!sidebarCollapsed && 'Overview'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'users' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('users')}
                >
                  <i className="bi bi-people me-2"></i>
                  {!sidebarCollapsed && 'Users'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'applications' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('applications')}
                >
                  <i className="bi bi-file-earmark-text me-2"></i>
                  {!sidebarCollapsed && 'Applications'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'teams' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('teams')}
                >
                  <i className="bi bi-trophy me-2"></i>
                  {!sidebarCollapsed && 'Teams'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'broadcasts' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('broadcasts')}
                >
                  <i className="bi bi-megaphone me-2"></i>
                  {!sidebarCollapsed && 'Broadcasts'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'analytics' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('analytics')}
                >
                  <i className="bi bi-graph-up me-2"></i>
                  {!sidebarCollapsed && 'Analytics'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'content' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('content')}
                >
                  <i className="bi bi-file-earmark-image me-2"></i>
                  {!sidebarCollapsed && 'Content'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'notifications' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('notifications')}
                >
                  <i className="bi bi-bell me-2"></i>
                  {!sidebarCollapsed && 'Notifications'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'system' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('system')}
                >
                  <i className="bi bi-gear me-2"></i>
                  {!sidebarCollapsed && 'System'}
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link text-start w-100 ${activeSection === 'backup' ? 'active text-white' : 'text-white-50'}`}
                  onClick={() => setActiveSection('backup')}
                >
                  <i className="bi bi-cloud-arrow-down me-2"></i>
                  {!sidebarCollapsed && 'Backup'}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          {/* Header */}
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <div>
              <h1 className="h2">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Dashboard</h1>
              <p className="text-muted">Manage your soccer club efficiently</p>
            </div>
            <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group me-2">
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-download me-1"></i>Export
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-printer me-1"></i>Print
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary">
                  <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text"><i className="bi bi-search"></i></span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <select 
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="users">Users</option>
                        <option value="applications">Applications</option>
                        <option value="teams">Teams</option>
                        <option value="broadcasts">Broadcasts</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <select 
                        className="form-select"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                      >
                        <option value="1d">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button className="btn btn-primary w-100">
                        <i className="bi bi-funnel me-1"></i>Filter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow">
                  <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading dashboard data...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Content Based on Active Section */}
          {!isLoading && (
            <>
              {activeSection === 'overview' && (
                <div>
                  {/* Enhanced Stats Cards */}
                  <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-primary shadow h-100 py-2" style={{ borderLeft: '4px solid #4e73df' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Registered Users
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.users}</div>
                              <div className="text-xs text-success">+12% from last month</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-people fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                          <button 
                            className="btn btn-sm btn-primary w-100"
                            onClick={() => setActiveSection('users')}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-success shadow h-100 py-2" style={{ borderLeft: '4px solid #1cc88a' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Pending Applications
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.applications}</div>
                              <div className="text-xs text-warning">Requires attention</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-file-earmark-text fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                          <button 
                            className="btn btn-sm btn-success w-100"
                            onClick={() => setActiveSection('applications')}
                          >
                            Review Applications
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-info shadow h-100 py-2" style={{ borderLeft: '4px solid #36b9cc' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Active Teams
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.teams}</div>
                              <div className="text-xs text-info">All teams active</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-trophy fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                          <button 
                            className="btn btn-sm btn-info w-100"
                            onClick={() => setActiveSection('teams')}
                          >
                            Manage Teams
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-warning shadow h-100 py-2" style={{ borderLeft: '4px solid #f6c23e' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Total Broadcasts
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.broadcasts}</div>
                              <div className="text-xs text-success">+5 this week</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-megaphone fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                          <button 
                            className="btn btn-sm btn-warning w-100"
                            onClick={() => setActiveSection('broadcasts')}
                          >
                            View Broadcasts
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats Row */}
                  <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-danger shadow h-100 py-2" style={{ borderLeft: '4px solid #e74a3b' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                Revenue
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">${stats.revenue.toLocaleString()}</div>
                              <div className="text-xs text-success">+8% from last month</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-currency-dollar fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-secondary shadow h-100 py-2" style={{ borderLeft: '4px solid #6c757d' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                                Events
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.events}</div>
                              <div className="text-xs text-info">This month</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-calendar-event fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-dark shadow h-100 py-2" style={{ borderLeft: '4px solid #343a40' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-dark text-uppercase mb-1">
                                Messages
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.messages}</div>
                              <div className="text-xs text-warning">Unread: 12</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-chat-dots fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-4">
                      <div className="card border-left-light shadow h-100 py-2" style={{ borderLeft: '4px solid #f8f9fa' }}>
                        <div className="card-body">
                          <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                              <div className="text-xs font-weight-bold text-light text-uppercase mb-1">
                                Gallery Items
                              </div>
                              <div className="h5 mb-0 font-weight-bold text-gray-800">{stats.gallery}</div>
                              <div className="text-xs text-success">+23 this week</div>
                            </div>
                            <div className="col-auto">
                              <i className="bi bi-images fa-2x text-gray-300"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Health and Recent Activity */}
                  <div className="row">
                    <div className="col-lg-6 mb-4">
                      <div className="card shadow">
                        <div className="card-header py-3">
                          <h6 className="m-0 font-weight-bold text-primary">System Health</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-6">
                              <div className="text-center">
                                <div className="h4 text-success">{systemHealth.uptime}</div>
                                <div className="text-xs text-uppercase text-muted">Uptime</div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="text-center">
                                <div className="h4 text-warning">{systemHealth.storage}</div>
                                <div className="text-xs text-uppercase text-muted">Storage Used</div>
                              </div>
                            </div>
                          </div>
                          <hr />
                          <div className="row">
                            <div className="col-6">
                              <span className="badge bg-success me-2">●</span>
                              Database: {systemHealth.database}
                            </div>
                            <div className="col-6">
                              <span className="badge bg-success me-2">●</span>
                              Server: {systemHealth.server}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6 mb-4">
                      <div className="card shadow">
                        <div className="card-header py-3">
                          <h6 className="m-0 font-weight-bold text-primary">Recent Activity</h6>
                        </div>
                        <div className="card-body">
                          <div className="list-group list-group-flush">
                            {recentActivity.map((activity) => (
                              <div key={activity.id} className="list-group-item px-0">
                                <div className="d-flex align-items-center">
                                  <div className="me-3">
                                    <i className={`bi bi-${activity.type === 'user_registration' ? 'person-plus' : 
                                      activity.type === 'application_submitted' ? 'file-earmark-text' :
                                      activity.type === 'team_created' ? 'trophy' : 'megaphone'} text-primary`}></i>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="fw-bold">{activity.details}</div>
                                    <div className="text-muted small">{activity.user} • {activity.timestamp.toLocaleTimeString()}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* System Settings Section */}
              {activeSection === 'system' && (
                <div>
                  {/* Settings Header */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card shadow">
                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                          <h6 className="m-0 font-weight-bold text-primary">
                            <i className="bi bi-gear me-2"></i>Site Settings
                          </h6>
                          <div className="btn-group">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={saveSettings}
                              disabled={!settingsChanged || savingSettings}
                            >
                              {savingSettings ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-lg me-1"></i>Save Changes
                                </>
                              )}
                            </button>
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={resetSettings}
                            >
                              <i className="bi bi-arrow-clockwise me-1"></i>Reset
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          {settingsChanged && (
                            <div className="alert alert-warning">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              You have unsaved changes. Don't forget to save your settings.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Tabs */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card shadow">
                        <div className="card-header">
                          <ul className="nav nav-tabs card-header-tabs" role="tablist">
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'general' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('general')}
                              >
                                <i className="bi bi-house me-1"></i>General
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'appearance' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('appearance')}
                              >
                                <i className="bi bi-palette me-1"></i>Appearance
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'security' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('security')}
                              >
                                <i className="bi bi-shield-lock me-1"></i>Security
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'email' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('email')}
                              >
                                <i className="bi bi-envelope me-1"></i>Email
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'integrations' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('integrations')}
                              >
                                <i className="bi bi-plug me-1"></i>Integrations
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'backup' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('backup')}
                              >
                                <i className="bi bi-cloud-arrow-down me-1"></i>Backup
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'performance' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('performance')}
                              >
                                <i className="bi bi-speedometer2 me-1"></i>Performance
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${settingsTab === 'social' ? 'active' : ''}`}
                                onClick={() => setSettingsTab('social')}
                              >
                                <i className="bi bi-share me-1"></i>Social
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="card-body">
                          {/* General Settings Tab */}
                          {settingsTab === 'general' && (
                            <div className="row">
                              <div className="col-md-6">
                                <h5 className="mb-3">Basic Information</h5>
                                <div className="mb-3">
                                  <label className="form-label">Site Name</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={siteSettings.general.siteName}
                                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Site Description</label>
                                  <textarea 
                                    className="form-control" 
                                    rows="3"
                                    value={siteSettings.general.siteDescription}
                                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                                  ></textarea>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Site URL</label>
                                  <input 
                                    type="url" 
                                    className="form-control"
                                    value={siteSettings.general.siteUrl}
                                    onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Admin Email</label>
                                  <input 
                                    type="email" 
                                    className="form-control"
                                    value={siteSettings.general.adminEmail}
                                    onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h5 className="mb-3">Regional Settings</h5>
                                <div className="mb-3">
                                  <label className="form-label">Timezone</label>
                                  <select 
                                    className="form-select"
                                    value={siteSettings.general.timezone}
                                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                                  >
                                    <option value="America/New_York">Eastern Time</option>
                                    <option value="America/Chicago">Central Time</option>
                                    <option value="America/Denver">Mountain Time</option>
                                    <option value="America/Los_Angeles">Pacific Time</option>
                                    <option value="Europe/London">London</option>
                                    <option value="Europe/Paris">Paris</option>
                                    <option value="Asia/Tokyo">Tokyo</option>
                                  </select>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Language</label>
                                  <select 
                                    className="form-select"
                                    value={siteSettings.general.language}
                                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                                  >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                  </select>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Currency</label>
                                  <select 
                                    className="form-select"
                                    value={siteSettings.general.currency}
                                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                                  >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD (C$)</option>
                                    <option value="AUD">AUD (A$)</option>
                                  </select>
                                </div>
                                <div className="row">
                                  <div className="col-6">
                                    <label className="form-label">Date Format</label>
                                    <select 
                                      className="form-select"
                                      value={siteSettings.general.dateFormat}
                                      onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                                    >
                                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                  </div>
                                  <div className="col-6">
                                    <label className="form-label">Time Format</label>
                                    <select 
                                      className="form-select"
                                      value={siteSettings.general.timeFormat}
                                      onChange={(e) => updateSetting('general', 'timeFormat', e.target.value)}
                                    >
                                      <option value="12h">12 Hour</option>
                                      <option value="24h">24 Hour</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Appearance Settings Tab */}
                          {settingsTab === 'appearance' && (
                            <div className="row">
                              <div className="col-md-6">
                                <h5 className="mb-3">Theme & Colors</h5>
                                <div className="mb-3">
                                  <label className="form-label">Theme</label>
                                  <select 
                                    className="form-select"
                                    value={siteSettings.appearance.theme}
                                    onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                                  >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto</option>
                                  </select>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Primary Color</label>
                                  <div className="input-group">
                                    <input 
                                      type="color" 
                                      className="form-control form-control-color"
                                      value={siteSettings.appearance.primaryColor}
                                      onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                                    />
                                    <input 
                                      type="text" 
                                      className="form-control"
                                      value={siteSettings.appearance.primaryColor}
                                      onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Secondary Color</label>
                                  <div className="input-group">
                                    <input 
                                      type="color" 
                                      className="form-control form-control-color"
                                      value={siteSettings.appearance.secondaryColor}
                                      onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                                    />
                                    <input 
                                      type="text" 
                                      className="form-control"
                                      value={siteSettings.appearance.secondaryColor}
                                      onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Header Text</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={siteSettings.appearance.headerText}
                                    onChange={(e) => updateSetting('appearance', 'headerText', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Footer Text</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={siteSettings.appearance.footerText}
                                    onChange={(e) => updateSetting('appearance', 'footerText', e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h5 className="mb-3">Layout Options</h5>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.appearance.showBreadcrumbs}
                                      onChange={(e) => updateSetting('appearance', 'showBreadcrumbs', e.target.checked)}
                                    />
                                    <label className="form-check-label">Show Breadcrumbs</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.appearance.showSidebar}
                                      onChange={(e) => updateSetting('appearance', 'showSidebar', e.target.checked)}
                                    />
                                    <label className="form-check-label">Show Sidebar</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Custom CSS</label>
                                  <textarea 
                                    className="form-control" 
                                    rows="8"
                                    placeholder="/* Add your custom CSS here */"
                                    value={siteSettings.appearance.customCSS}
                                    onChange={(e) => updateSetting('appearance', 'customCSS', e.target.value)}
                                  ></textarea>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Logo Upload</label>
                                  <input 
                                    type="file" 
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        updateSetting('appearance', 'logo', e.target.files[0].name);
                                      }
                                    }}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Favicon Upload</label>
                                  <input 
                                    type="file" 
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        updateSetting('appearance', 'favicon', e.target.files[0].name);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Security Settings Tab */}
                          {settingsTab === 'security' && (
                            <div className="row">
                              <div className="col-md-6">
                                <h5 className="mb-3">Authentication</h5>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.security.requireEmailVerification}
                                      onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                                    />
                                    <label className="form-check-label">Require Email Verification</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.security.allowRegistration}
                                      onChange={(e) => updateSetting('security', 'allowRegistration', e.target.checked)}
                                    />
                                    <label className="form-check-label">Allow User Registration</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.security.requireStrongPasswords}
                                      onChange={(e) => updateSetting('security', 'requireStrongPasswords', e.target.checked)}
                                    />
                                    <label className="form-check-label">Require Strong Passwords</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.security.enableTwoFactor}
                                      onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                                    />
                                    <label className="form-check-label">Enable Two-Factor Authentication</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Session Timeout (minutes)</label>
                                  <input 
                                    type="number" 
                                    className="form-control"
                                    value={siteSettings.security.sessionTimeout}
                                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Max Login Attempts</label>
                                  <input 
                                    type="number" 
                                    className="form-control"
                                    value={siteSettings.security.maxLoginAttempts}
                                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h5 className="mb-3">File Upload Security</h5>
                                <div className="mb-3">
                                  <label className="form-label">Allowed File Types</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={siteSettings.security.allowedFileTypes.join(', ')}
                                    onChange={(e) => updateSetting('security', 'allowedFileTypes', e.target.value.split(', '))}
                                    placeholder="jpg, jpeg, png, pdf, doc, docx"
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Max File Size (MB)</label>
                                  <input 
                                    type="number" 
                                    className="form-control"
                                    value={siteSettings.security.maxFileSize}
                                    onChange={(e) => updateSetting('security', 'maxFileSize', parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.security.enableAuditLog}
                                      onChange={(e) => updateSetting('security', 'enableAuditLog', e.target.checked)}
                                    />
                                    <label className="form-check-label">Enable Audit Logging</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.security.maintenanceMode}
                                      onChange={(e) => updateSetting('security', 'maintenanceMode', e.target.checked)}
                                    />
                                    <label className="form-check-label">Maintenance Mode</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">IP Whitelist</label>
                                  <textarea 
                                    className="form-control" 
                                    rows="3"
                                    placeholder="192.168.1.1&#10;10.0.0.1"
                                    value={siteSettings.security.ipWhitelist.join('\n')}
                                    onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value.split('\n'))}
                                  ></textarea>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Email Settings Tab */}
                          {settingsTab === 'email' && (
                            <div className="row">
                              <div className="col-md-6">
                                <h5 className="mb-3">SMTP Configuration</h5>
                                <div className="mb-3">
                                  <label className="form-label">SMTP Host</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={siteSettings.email.smtpHost}
                                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">SMTP Port</label>
                                  <input 
                                    type="number" 
                                    className="form-control"
                                    value={siteSettings.email.smtpPort}
                                    onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">SMTP Username</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={siteSettings.email.smtpUser}
                                    onChange={(e) => updateSetting('email', 'smtpUser', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">SMTP Password</label>
                                  <input 
                                    type="password" 
                                    className="form-control"
                                    value={siteSettings.email.smtpPassword}
                                    onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <button 
                                    className="btn btn-info"
                                    onClick={testEmailConnection}
                                  >
                                    <i className="bi bi-envelope-check me-1"></i>Test Connection
                                  </button>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h5 className="mb-3">Email Settings</h5>
                                <div className="mb-3">
                                  <label className="form-label">From Email</label>
                                  <input 
                                    type="email" 
                                    className="form-control"
                                    value={siteSettings.email.fromEmail}
                                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">From Name</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={siteSettings.email.fromName}
                                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                                  />
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.email.enableNotifications}
                                      onChange={(e) => updateSetting('email', 'enableNotifications', e.target.checked)}
                                    />
                                    <label className="form-check-label">Enable Email Notifications</label>
                                  </div>
                                </div>
                                <h6 className="mt-4 mb-3">Email Templates</h6>
                                <div className="mb-3">
                                  <label className="form-label">Welcome Email</label>
                                  <textarea 
                                    className="form-control" 
                                    rows="2"
                                    value={siteSettings.email.emailTemplates.welcome}
                                    onChange={(e) => updateSetting('email', 'emailTemplates', {
                                      ...siteSettings.email.emailTemplates,
                                      welcome: e.target.value
                                    })}
                                  ></textarea>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Password Reset Email</label>
                                  <textarea 
                                    className="form-control" 
                                    rows="2"
                                    value={siteSettings.email.emailTemplates.passwordReset}
                                    onChange={(e) => updateSetting('email', 'emailTemplates', {
                                      ...siteSettings.email.emailTemplates,
                                      passwordReset: e.target.value
                                    })}
                                  ></textarea>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Backup Settings Tab */}
                          {settingsTab === 'backup' && (
                            <div className="row">
                              <div className="col-md-6">
                                <h5 className="mb-3">Backup Settings</h5>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={siteSettings.backup.autoBackup}
                                      onChange={(e) => updateSetting('backup', 'autoBackup', e.target.checked)}
                                    />
                                    <label className="form-check-label">Enable Auto Backup</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Backup Frequency</label>
                                  <select 
                                    className="form-select"
                                    value={siteSettings.backup.backupFrequency}
                                    onChange={(e) => updateSetting('backup', 'backupFrequency', e.target.value)}
                                  >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                  </select>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Backup Retention (days)</label>
                                  <input 
                                    type="number" 
                                    className="form-control"
                                    value={siteSettings.backup.backupRetention}
                                    onChange={(e) => updateSetting('backup', 'backupRetention', parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="mb-3">
                                  <button 
                                    className="btn btn-primary"
                                    onClick={createBackup}
                                  >
                                    <i className="bi bi-cloud-arrow-down me-1"></i>Create Backup Now
                                  </button>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h5 className="mb-3">Backup Status</h5>
                                <div className="card">
                                  <div className="card-body">
                                    <p><strong>Last Backup:</strong> {siteSettings.backup.lastBackup ? siteSettings.backup.lastBackup.toLocaleString() : 'Never'}</p>
                                    <p><strong>Next Backup:</strong> {siteSettings.backup.nextBackup ? siteSettings.backup.nextBackup.toLocaleString() : 'Not scheduled'}</p>
                                    <p><strong>Backup Location:</strong> {siteSettings.backup.backupLocation}</p>
                                    <p><strong>Cloud Backup:</strong> {siteSettings.backup.cloudBackup ? 'Enabled' : 'Disabled'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Other tabs placeholder */}
                          {settingsTab === 'integrations' && (
                            <div className="text-center py-5">
                              <i className="bi bi-plug fa-3x text-muted mb-3"></i>
                              <h4 className="text-muted">Integrations</h4>
                              <p className="text-muted">Third-party integrations coming soon!</p>
                            </div>
                          )}

                          {settingsTab === 'performance' && (
                            <div className="text-center py-5">
                              <i className="bi bi-speedometer2 fa-3x text-muted mb-3"></i>
                              <h4 className="text-muted">Performance Settings</h4>
                              <p className="text-muted">Performance optimization settings coming soon!</p>
                            </div>
                          )}

                          {settingsTab === 'social' && (
                            <div className="text-center py-5">
                              <i className="bi bi-share fa-3x text-muted mb-3"></i>
                              <h4 className="text-muted">Social Media Settings</h4>
                              <p className="text-muted">Social media integration settings coming soon!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Management Section */}
              {activeSection === 'content' && (
                <div>
                  {/* Content Header */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card shadow">
                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                          <h6 className="m-0 font-weight-bold text-primary">
                            <i className="bi bi-file-earmark-image me-2"></i>Content Management System
                          </h6>
                          <div className="btn-group">
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={savePageContent}
                              disabled={!contentChanged || savingContent}
                            >
                              {savingContent ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-lg me-1"></i>Save Content
                                </>
                              )}
                            </button>
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={previewPage}
                            >
                              <i className="bi bi-eye me-1"></i>Preview
                            </button>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={publishPage}
                            >
                              <i className="bi bi-globe me-1"></i>Publish
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          {contentChanged && (
                            <div className="alert alert-warning">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              You have unsaved content changes. Don't forget to save your work.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Tabs */}
                  <div className="row">
                    <div className="col-12">
                      <div className="card shadow">
                        <div className="card-header">
                          <ul className="nav nav-tabs card-header-tabs" role="tablist">
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'pages' ? 'active' : ''}`}
                                onClick={() => setContentTab('pages')}
                              >
                                <i className="bi bi-file-text me-1"></i>Pages
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'blog' ? 'active' : ''}`}
                                onClick={() => setContentTab('blog')}
                              >
                                <i className="bi bi-journal-text me-1"></i>Blog
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'events' ? 'active' : ''}`}
                                onClick={() => setContentTab('events')}
                              >
                                <i className="bi bi-calendar-event me-1"></i>Events
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'newsletters' ? 'active' : ''}`}
                                onClick={() => setContentTab('newsletters')}
                              >
                                <i className="bi bi-envelope me-1"></i>Newsletters
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'galleries' ? 'active' : ''}`}
                                onClick={() => setContentTab('galleries')}
                              >
                                <i className="bi bi-images me-1"></i>Galleries
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'templates' ? 'active' : ''}`}
                                onClick={() => setContentTab('templates')}
                              >
                                <i className="bi bi-layout-text-window me-1"></i>Templates
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'workflow' ? 'active' : ''}`}
                                onClick={() => setContentTab('workflow')}
                              >
                                <i className="bi bi-diagram-3 me-1"></i>Workflow
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setContentTab('analytics')}
                              >
                                <i className="bi bi-graph-up me-1"></i>Analytics
                              </button>
                            </li>
                            <li className="nav-item">
                              <button 
                                className={`nav-link ${contentTab === 'seo' ? 'active' : ''}`}
                                onClick={() => setContentTab('seo')}
                              >
                                <i className="bi bi-search me-1"></i>SEO
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="card-body">
                          {/* Pages Tab */}
                          {contentTab === 'pages' && (
                            <div className="row">
                              <div className="col-md-3">
                                <h5 className="mb-3">Select Page</h5>
                                <div className="list-group">
                                  <button 
                                    className={`list-group-item list-group-item-action ${selectedPage === 'homepage' ? 'active' : ''}`}
                                    onClick={() => setSelectedPage('homepage')}
                                  >
                                    <i className="bi bi-house me-2"></i>Homepage
                                  </button>
                                  <button 
                                    className={`list-group-item list-group-item-action ${selectedPage === 'about' ? 'active' : ''}`}
                                    onClick={() => setSelectedPage('about')}
                                  >
                                    <i className="bi bi-info-circle me-2"></i>About Us
                                  </button>
                                  <button 
                                    className={`list-group-item list-group-item-action ${selectedPage === 'contact' ? 'active' : ''}`}
                                    onClick={() => setSelectedPage('contact')}
                                  >
                                    <i className="bi bi-envelope me-2"></i>Contact
                                  </button>
                                  <button 
                                    className={`list-group-item list-group-item-action ${selectedPage === 'programs' ? 'active' : ''}`}
                                    onClick={() => setSelectedPage('programs')}
                                  >
                                    <i className="bi bi-trophy me-2"></i>Programs
                                  </button>
                                </div>
                              </div>
                              <div className="col-md-9">
                                <h5 className="mb-3">Edit {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)} Page</h5>
                                
                                {/* Homepage Content Editor */}
                                {selectedPage === 'homepage' && (
                                  <div>
                                    <div className="mb-3">
                                      <label className="form-label">Page Title</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.homepage.title}
                                        onChange={(e) => updatePageContent('homepage', 'title', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Subtitle</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.homepage.subtitle}
                                        onChange={(e) => updatePageContent('homepage', 'subtitle', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Hero Text</label>
                                      <textarea 
                                        className="form-control" 
                                        rows="3"
                                        value={pageContent.homepage.heroText}
                                        onChange={(e) => updatePageContent('homepage', 'heroText', e.target.value)}
                                      ></textarea>
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Hero Image</label>
                                      <input 
                                        type="file" 
                                        className="form-control"
                                        accept="image/*"
                                        onChange={(e) => {
                                          if (e.target.files[0]) {
                                            updatePageContent('homepage', 'heroImage', e.target.files[0].name);
                                          }
                                        }}
                                      />
                                    </div>
                                    
                                    <h6 className="mt-4 mb-3">Page Sections</h6>
                                    {pageContent.homepage.sections?.map((section, index) => (
                                      <div key={section.id} className="card mb-3">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                          <h6 className="mb-0">Section {index + 1}</h6>
                                          <button 
                                            className="btn btn-sm btn-danger"
                                            onClick={() => removePageSection('homepage', section.id)}
                                          >
                                            <i className="bi bi-trash"></i>
                                          </button>
                                        </div>
                                        <div className="card-body">
                                          <div className="mb-3">
                                            <label className="form-label">Section Title</label>
                                            <input 
                                              type="text" 
                                              className="form-control"
                                              value={section.title}
                                              onChange={(e) => updatePageSection('homepage', section.id, 'title', e.target.value)}
                                            />
                                          </div>
                                          <div className="mb-3">
                                            <label className="form-label">Section Content</label>
                                            <textarea 
                                              className="form-control" 
                                              rows="3"
                                              value={section.content}
                                              onChange={(e) => updatePageSection('homepage', section.id, 'content', e.target.value)}
                                            ></textarea>
                                          </div>
                                          <div className="mb-3">
                                            <label className="form-label">Section Image</label>
                                            <input 
                                              type="file" 
                                              className="form-control"
                                              accept="image/*"
                                              onChange={(e) => {
                                                if (e.target.files[0]) {
                                                  updatePageSection('homepage', section.id, 'image', e.target.files[0].name);
                                                }
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    <button 
                                      className="btn btn-primary"
                                      onClick={() => addPageSection('homepage')}
                                    >
                                      <i className="bi bi-plus me-1"></i>Add Section
                                    </button>
                                  </div>
                                )}

                                {/* About Page Content Editor */}
                                {selectedPage === 'about' && (
                                  <div>
                                    <div className="mb-3">
                                      <label className="form-label">Page Title</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.about.title}
                                        onChange={(e) => updatePageContent('about', 'title', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Subtitle</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.about.subtitle}
                                        onChange={(e) => updatePageContent('about', 'subtitle', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Main Content</label>
                                      <textarea 
                                        className="form-control" 
                                        rows="4"
                                        value={pageContent.about.mainContent}
                                        onChange={(e) => updatePageContent('about', 'mainContent', e.target.value)}
                                      ></textarea>
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Mission Statement</label>
                                      <textarea 
                                        className="form-control" 
                                        rows="2"
                                        value={pageContent.about.mission}
                                        onChange={(e) => updatePageContent('about', 'mission', e.target.value)}
                                      ></textarea>
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Vision Statement</label>
                                      <textarea 
                                        className="form-control" 
                                        rows="2"
                                        value={pageContent.about.vision}
                                        onChange={(e) => updatePageContent('about', 'vision', e.target.value)}
                                      ></textarea>
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Club History</label>
                                      <textarea 
                                        className="form-control" 
                                        rows="3"
                                        value={pageContent.about.history}
                                        onChange={(e) => updatePageContent('about', 'history', e.target.value)}
                                      ></textarea>
                                    </div>
                                  </div>
                                )}

                                {/* Contact Page Content Editor */}
                                {selectedPage === 'contact' && (
                                  <div>
                                    <div className="mb-3">
                                      <label className="form-label">Page Title</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.contact.title}
                                        onChange={(e) => updatePageContent('contact', 'title', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Subtitle</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.contact.subtitle}
                                        onChange={(e) => updatePageContent('contact', 'subtitle', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Main Content</label>
                                      <textarea 
                                        className="form-control" 
                                        rows="3"
                                        value={pageContent.contact.mainContent}
                                        onChange={(e) => updatePageContent('contact', 'mainContent', e.target.value)}
                                      ></textarea>
                                    </div>
                                    
                                    <h6 className="mt-4 mb-3">Contact Information</h6>
                                    <div className="row">
                                      <div className="col-md-6">
                                        <div className="mb-3">
                                          <label className="form-label">Address</label>
                                          <textarea 
                                            className="form-control" 
                                            rows="2"
                                            value={pageContent.contact.contactInfo.address}
                                            onChange={(e) => updatePageContent('contact', 'contactInfo', {
                                              ...pageContent.contact.contactInfo,
                                              address: e.target.value
                                            })}
                                          ></textarea>
                                        </div>
                                        <div className="mb-3">
                                          <label className="form-label">Phone</label>
                                          <input 
                                            type="text" 
                                            className="form-control"
                                            value={pageContent.contact.contactInfo.phone}
                                            onChange={(e) => updatePageContent('contact', 'contactInfo', {
                                              ...pageContent.contact.contactInfo,
                                              phone: e.target.value
                                            })}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-md-6">
                                        <div className="mb-3">
                                          <label className="form-label">Email</label>
                                          <input 
                                            type="email" 
                                            className="form-control"
                                            value={pageContent.contact.contactInfo.email}
                                            onChange={(e) => updatePageContent('contact', 'contactInfo', {
                                              ...pageContent.contact.contactInfo,
                                              email: e.target.value
                                            })}
                                          />
                                        </div>
                                        <div className="mb-3">
                                          <label className="form-label">Hours</label>
                                          <textarea 
                                            className="form-control" 
                                            rows="3"
                                            value={pageContent.contact.contactInfo.hours}
                                            onChange={(e) => updatePageContent('contact', 'contactInfo', {
                                              ...pageContent.contact.contactInfo,
                                              hours: e.target.value
                                            })}
                                          ></textarea>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Programs Page Content Editor */}
                                {selectedPage === 'programs' && (
                                  <div>
                                    <div className="mb-3">
                                      <label className="form-label">Page Title</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.programs.title}
                                        onChange={(e) => updatePageContent('programs', 'title', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Subtitle</label>
                                      <input 
                                        type="text" 
                                        className="form-control"
                                        value={pageContent.programs.subtitle}
                                        onChange={(e) => updatePageContent('programs', 'subtitle', e.target.value)}
                                      />
                                    </div>
                                    <div className="mb-3">
                                      <label className="form-label">Main Content</label>
                                      <textarea 
                                        className="form-control" 
                                        rows="3"
                                        value={pageContent.programs.mainContent}
                                        onChange={(e) => updatePageContent('programs', 'mainContent', e.target.value)}
                                      ></textarea>
                                    </div>
                                    
                                    <h6 className="mt-4 mb-3">Programs</h6>
                                    {pageContent.programs.programs?.map((program, index) => (
                                      <div key={program.id} className="card mb-3">
                                        <div className="card-header">
                                          <h6 className="mb-0">Program {index + 1}</h6>
                                        </div>
                                        <div className="card-body">
                                          <div className="row">
                                            <div className="col-md-6">
                                              <div className="mb-3">
                                                <label className="form-label">Program Name</label>
                                                <input 
                                                  type="text" 
                                                  className="form-control"
                                                  value={program.name}
                                                  onChange={(e) => {
                                                    const updatedPrograms = [...pageContent.programs.programs];
                                                    updatedPrograms[index] = { ...program, name: e.target.value };
                                                    updatePageContent('programs', 'programs', updatedPrograms);
                                                  }}
                                                />
                                              </div>
                                              <div className="mb-3">
                                                <label className="form-label">Age Group</label>
                                                <input 
                                                  type="text" 
                                                  className="form-control"
                                                  value={program.ageGroup}
                                                  onChange={(e) => {
                                                    const updatedPrograms = [...pageContent.programs.programs];
                                                    updatedPrograms[index] = { ...program, ageGroup: e.target.value };
                                                    updatePageContent('programs', 'programs', updatedPrograms);
                                                  }}
                                                />
                                              </div>
                                              <div className="mb-3">
                                                <label className="form-label">Schedule</label>
                                                <input 
                                                  type="text" 
                                                  className="form-control"
                                                  value={program.schedule}
                                                  onChange={(e) => {
                                                    const updatedPrograms = [...pageContent.programs.programs];
                                                    updatedPrograms[index] = { ...program, schedule: e.target.value };
                                                    updatePageContent('programs', 'programs', updatedPrograms);
                                                  }}
                                                />
                                              </div>
                                            </div>
                                            <div className="col-md-6">
                                              <div className="mb-3">
                                                <label className="form-label">Price</label>
                                                <input 
                                                  type="text" 
                                                  className="form-control"
                                                  value={program.price}
                                                  onChange={(e) => {
                                                    const updatedPrograms = [...pageContent.programs.programs];
                                                    updatedPrograms[index] = { ...program, price: e.target.value };
                                                    updatePageContent('programs', 'programs', updatedPrograms);
                                                  }}
                                                />
                                              </div>
                                              <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea 
                                                  className="form-control" 
                                                  rows="3"
                                                  value={program.description}
                                                  onChange={(e) => {
                                                    const updatedPrograms = [...pageContent.programs.programs];
                                                    updatedPrograms[index] = { ...program, description: e.target.value };
                                                    updatePageContent('programs', 'programs', updatedPrograms);
                                                  }}
                                                ></textarea>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Media Library Tab */}
                          {contentTab === 'media' && (
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Media Library</h5>
                                <div>
                                  <input 
                                    type="file" 
                                    className="form-control d-inline-block me-2" 
                                    style={{width: 'auto'}}
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        uploadMedia(e.target.files[0]);
                                      }
                                    }}
                                  />
                                  <button className="btn btn-primary">
                                    <i className="bi bi-upload me-1"></i>Upload Media
                                  </button>
                                </div>
                              </div>
                              
                              <div className="row">
                                {mediaLibrary.map((media) => (
                                  <div key={media.id} className="col-md-3 mb-3">
                                    <div className="card">
                                      <div className="card-body text-center">
                                        {media.type === 'image' ? (
                                          <img 
                                            src={media.url} 
                                            alt={media.name}
                                            className="img-fluid mb-2"
                                            style={{maxHeight: '100px'}}
                                          />
                                        ) : (
                                          <i className="bi bi-play-circle fa-3x text-muted mb-2"></i>
                                        )}
                                        <h6 className="card-title">{media.name}</h6>
                                        <p className="card-text small text-muted">
                                          {media.size} • {media.uploaded}
                                        </p>
                                        <div className="btn-group btn-group-sm">
                                          <button className="btn btn-outline-primary">
                                            <i className="bi bi-eye"></i>
                                          </button>
                                          <button className="btn btn-outline-secondary">
                                            <i className="bi bi-download"></i>
                                          </button>
                                          <button className="btn btn-outline-danger">
                                            <i className="bi bi-trash"></i>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Blog Management Tab */}
                          {contentTab === 'blog' && (
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Blog Management</h5>
                                <div className="btn-group">
                                  <button className="btn btn-primary" onClick={createBlogPost}>
                                    <i className="bi bi-plus me-1"></i>New Post
                                  </button>
                                  <button className="btn btn-outline-secondary" onClick={() => exportContent('blog')}>
                                    <i className="bi bi-download me-1"></i>Export
                                  </button>
                                </div>
                              </div>
                              
                              <div className="row">
                                {blogPosts.map((post) => (
                                  <div key={post.id} className="col-md-6 mb-3">
                                    <div className="card">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title">{post.title}</h6>
                                          <span className={`badge ${post.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                            {post.status}
                                          </span>
                                        </div>
                                        <p className="card-text small text-muted">{post.excerpt}</p>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <small className="text-muted">
                                            By {post.author} • {post.publishDate}
                                          </small>
                                          <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary">
                                              <i className="bi bi-eye"></i> {post.views}
                                            </button>
                                            <button className="btn btn-outline-success">
                                              <i className="bi bi-heart"></i> {post.likes}
                                            </button>
                                            <button className="btn btn-outline-info">
                                              <i className="bi bi-chat"></i> {post.comments}
                                            </button>
                                            <button className="btn btn-outline-danger" onClick={() => deleteBlogPost(post.id)}>
                                              <i className="bi bi-trash"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Events Management Tab */}
                          {contentTab === 'events' && (
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Event Management</h5>
                                <div className="btn-group">
                                  <button className="btn btn-primary" onClick={createEvent}>
                                    <i className="bi bi-plus me-1"></i>New Event
                                  </button>
                                  <button className="btn btn-outline-secondary" onClick={() => exportContent('events')}>
                                    <i className="bi bi-download me-1"></i>Export
                                  </button>
                                </div>
                              </div>
                              
                              <div className="row">
                                {events.map((event) => (
                                  <div key={event.id} className="col-md-6 mb-3">
                                    <div className="card">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title">{event.title}</h6>
                                          <span className={`badge ${event.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                            {event.status}
                                          </span>
                                        </div>
                                        <p className="card-text small">{event.description}</p>
                                        <div className="row text-center">
                                          <div className="col-4">
                                            <small className="text-muted">Date</small>
                                            <div className="fw-bold">{event.startDate}</div>
                                          </div>
                                          <div className="col-4">
                                            <small className="text-muted">Attendees</small>
                                            <div className="fw-bold">{event.currentAttendees}/{event.maxAttendees}</div>
                                          </div>
                                          <div className="col-4">
                                            <small className="text-muted">Price</small>
                                            <div className="fw-bold">{event.price}</div>
                                          </div>
                                        </div>
                                        <div className="d-flex justify-content-end mt-2">
                                          <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary">
                                              <i className="bi bi-eye"></i>
                                            </button>
                                            <button className="btn btn-outline-danger" onClick={() => deleteEvent(event.id)}>
                                              <i className="bi bi-trash"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Newsletter Management Tab */}
                          {contentTab === 'newsletters' && (
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Newsletter Management</h5>
                                <button className="btn btn-primary" onClick={createNewsletter}>
                                  <i className="bi bi-plus me-1"></i>New Newsletter
                                </button>
                              </div>
                              
                              <div className="row">
                                {newsletters.map((newsletter) => (
                                  <div key={newsletter.id} className="col-md-6 mb-3">
                                    <div className="card">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title">{newsletter.subject}</h6>
                                          <span className={`badge ${newsletter.status === 'sent' ? 'bg-success' : 'bg-warning'}`}>
                                            {newsletter.status}
                                          </span>
                                        </div>
                                        <p className="card-text small">{newsletter.content}</p>
                                        {newsletter.status === 'sent' && (
                                          <div className="row text-center">
                                            <div className="col-4">
                                              <small className="text-muted">Recipients</small>
                                              <div className="fw-bold">{newsletter.recipients}</div>
                                            </div>
                                            <div className="col-4">
                                              <small className="text-muted">Open Rate</small>
                                              <div className="fw-bold">{newsletter.openRate}%</div>
                                            </div>
                                            <div className="col-4">
                                              <small className="text-muted">Click Rate</small>
                                              <div className="fw-bold">{newsletter.clickRate}%</div>
                                            </div>
                                          </div>
                                        )}
                                        <div className="d-flex justify-content-end mt-2">
                                          <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary">
                                              <i className="bi bi-eye"></i>
                                            </button>
                                            {newsletter.status === 'draft' && (
                                              <button 
                                                className="btn btn-outline-success"
                                                onClick={() => sendNewsletter(newsletter.id)}
                                              >
                                                <i className="bi bi-send"></i>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Galleries Management Tab */}
                          {contentTab === 'galleries' && (
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Gallery Management</h5>
                                <button className="btn btn-primary" onClick={createGallery}>
                                  <i className="bi bi-plus me-1"></i>New Gallery
                                </button>
                              </div>
                              
                              <div className="row">
                                {galleries.map((gallery) => (
                                  <div key={gallery.id} className="col-md-6 mb-3">
                                    <div className="card">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title">{gallery.name}</h6>
                                          <span className={`badge ${gallery.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                                            {gallery.status}
                                          </span>
                                        </div>
                                        <p className="card-text small">{gallery.description}</p>
                                        <div className="row text-center">
                                          <div className="col-6">
                                            <small className="text-muted">Images</small>
                                            <div className="fw-bold">{gallery.images.length}</div>
                                          </div>
                                          <div className="col-6">
                                            <small className="text-muted">Views</small>
                                            <div className="fw-bold">{gallery.views}</div>
                                          </div>
                                        </div>
                                        <div className="d-flex justify-content-end mt-2">
                                          <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary">
                                              <i className="bi bi-eye"></i>
                                            </button>
                                            <button className="btn btn-outline-secondary">
                                              <i className="bi bi-plus"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Templates Management Tab */}
                          {contentTab === 'templates' && (
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5>Content Templates</h5>
                                <button className="btn btn-primary" onClick={createContentTemplate}>
                                  <i className="bi bi-plus me-1"></i>New Template
                                </button>
                              </div>
                              
                              <div className="row">
                                {contentTemplates.map((template) => (
                                  <div key={template.id} className="col-md-4 mb-3">
                                    <div className="card">
                                      <div className="card-body text-center">
                                        <h6 className="card-title">{template.name}</h6>
                                        <p className="card-text small text-muted">{template.type}</p>
                                        <div className="btn-group btn-group-sm">
                                          <button className="btn btn-outline-primary">
                                            <i className="bi bi-eye"></i>
                                          </button>
                                          <button 
                                            className="btn btn-outline-success"
                                            onClick={() => useTemplate(template.id, 'homepage')}
                                          >
                                            <i className="bi bi-check"></i>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Workflow Management Tab */}
                          {contentTab === 'workflow' && (
                            <div className="row">
                              <div className="col-md-6">
                                <h5 className="mb-3">Content Workflow Settings</h5>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={contentWorkflow.enabled}
                                      onChange={(e) => updateWorkflowSettings('enabled', e.target.checked)}
                                    />
                                    <label className="form-check-label">Enable Content Workflow</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input 
                                      className="form-check-input" 
                                      type="checkbox"
                                      checked={contentWorkflow.autoPublish}
                                      onChange={(e) => updateWorkflowSettings('autoPublish', e.target.checked)}
                                    />
                                    <label className="form-check-label">Auto-publish approved content</label>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Review Deadline (hours)</label>
                                  <input 
                                    type="number" 
                                    className="form-control"
                                    value={contentWorkflow.reviewDeadline}
                                    onChange={(e) => updateWorkflowSettings('reviewDeadline', parseInt(e.target.value))}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Approvers</label>
                                  <textarea 
                                    className="form-control" 
                                    rows="3"
                                    value={contentWorkflow.approvers.join('\n')}
                                    onChange={(e) => updateWorkflowSettings('approvers', e.target.value.split('\n'))}
                                    placeholder="admin@soccerclub.com&#10;editor@soccerclub.com"
                                  ></textarea>
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h5 className="mb-3">Workflow Stages</h5>
                                <div className="list-group">
                                  {contentWorkflow.stages.map((stage, index) => (
                                    <div key={stage} className="list-group-item d-flex justify-content-between align-items-center">
                                      <span className="badge bg-primary me-2">{index + 1}</span>
                                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                                      <span className="badge bg-secondary">Active</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Analytics Tab */}
                          {contentTab === 'analytics' && (
                            <div>
                              <h5 className="mb-4">Content Analytics</h5>
                              <div className="row mb-4">
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-primary">{contentAnalytics.totalViews.toLocaleString()}</h3>
                                      <p className="card-text">Total Views</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-success">{contentAnalytics.totalLikes}</h3>
                                      <p className="card-text">Total Likes</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-info">{contentAnalytics.totalComments}</h3>
                                      <p className="card-text">Total Comments</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-warning">{contentAnalytics.engagement.bounceRate}%</h3>
                                      <p className="card-text">Bounce Rate</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="row">
                                <div className="col-md-6">
                                  <h6>Top Pages</h6>
                                  <div className="list-group">
                                    {contentAnalytics.topPages.map((page, index) => (
                                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        {page.page}
                                        <div>
                                          <span className="badge bg-primary me-1">{page.views} views</span>
                                          <span className="badge bg-secondary">{page.unique} unique</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <h6>Top Posts</h6>
                                  <div className="list-group">
                                    {contentAnalytics.topPosts.map((post, index) => (
                                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                          <div className="fw-bold">{post.title}</div>
                                          <small className="text-muted">{post.views} views</small>
                                        </div>
                                        <span className="badge bg-success">{post.engagement}% engagement</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SEO Settings Tab */}
                          {contentTab === 'seo' && (
                            <div className="row">
                              <div className="col-md-6">
                                <h5 className="mb-3">SEO Settings</h5>
                                <div className="mb-3">
                                  <label className="form-label">Page</label>
                                  <select 
                                    className="form-select"
                                    onChange={(e) => setSelectedPage(e.target.value)}
                                    value={selectedPage}
                                  >
                                    <option value="homepage">Homepage</option>
                                    <option value="about">About Us</option>
                                    <option value="contact">Contact</option>
                                    <option value="programs">Programs</option>
                                  </select>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Meta Title</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={seoSettings[selectedPage]?.title || ''}
                                    onChange={(e) => updateSEOSettings(selectedPage, 'title', e.target.value)}
                                    maxLength="60"
                                  />
                                  <div className="form-text">
                                    {seoSettings[selectedPage]?.title?.length || 0}/60 characters
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Meta Description</label>
                                  <textarea 
                                    className="form-control" 
                                    rows="3"
                                    value={seoSettings[selectedPage]?.description || ''}
                                    onChange={(e) => updateSEOSettings(selectedPage, 'description', e.target.value)}
                                    maxLength="160"
                                  ></textarea>
                                  <div className="form-text">
                                    {seoSettings[selectedPage]?.description?.length || 0}/160 characters
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Keywords</label>
                                  <input 
                                    type="text" 
                                    className="form-control"
                                    value={seoSettings[selectedPage]?.keywords || ''}
                                    onChange={(e) => updateSEOSettings(selectedPage, 'keywords', e.target.value)}
                                    placeholder="keyword1, keyword2, keyword3"
                                  />
                                </div>
                                <div className="mb-3">
                                  <label className="form-label">Open Graph Image</label>
                                  <input 
                                    type="file" 
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files[0]) {
                                        updateSEOSettings(selectedPage, 'ogImage', e.target.files[0].name);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <h5 className="mb-3">SEO Preview</h5>
                                <div className="card">
                                  <div className="card-body">
                                    <h6 className="text-primary">
                                      {seoSettings[selectedPage]?.title || 'Page Title'}
                                    </h6>
                                    <p className="text-success small mb-1">
                                      {siteSettings.general.siteUrl}/{selectedPage}
                                    </p>
                                    <p className="text-muted small">
                                      {seoSettings[selectedPage]?.description || 'Page description will appear here...'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Management Section */}
              {activeSection === 'users' && (
                <Suspense fallback={
                  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading User Management...</span>
                    </div>
                  </div>
                }>
                  <UserManagement
                    users={users}
                    setUsers={setUsers}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    userSearch={userSearch}
                    setUserSearch={setUserSearch}
                    userRoleFilter={userRoleFilter}
                    setUserRoleFilter={setUserRoleFilter}
                    userStatusFilter={userStatusFilter}
                    setUserStatusFilter={setUserStatusFilter}
                    userSortBy={userSortBy}
                    setUserSortBy={setUserSortBy}
                    userSortOrder={userSortOrder}
                    setUserSortOrder={setUserSortOrder}
                    userManagementTab={userManagementTab}
                    setUserManagementTab={setUserManagementTab}
                    userAnalytics={userAnalytics}
                    userContent={userContent}
                    userReports={userReports}
                    userActivityLog={userActivityLog}
                    userPermissions={userPermissions}
                    setUserPermissions={setUserPermissions}
                  />
                </Suspense>
              )}

                          {/* User Overview Tab */}
                          {userManagementTab === 'overview' && (
                            <div>
                              <div className="row mb-4">
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-primary">{userAnalytics.totalUsers.toLocaleString()}</h3>
                                      <p className="card-text">Total Users</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-success">{userAnalytics.activeUsers.toLocaleString()}</h3>
                                      <p className="card-text">Active Users</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-info">{userAnalytics.newUsersThisMonth}</h3>
                                      <p className="card-text">New This Month</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-warning">{userAnalytics.bannedUsers}</h3>
                                      <p className="card-text">Banned Users</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="row">
                                <div className="col-md-6">
                                  <h6>User Roles Distribution</h6>
                                  <div className="list-group">
                                    {userAnalytics.userRoles.map((role, index) => (
                                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        {role.role}
                                        <div>
                                          <span className="badge bg-primary me-1">{role.count}</span>
                                          <span className="badge bg-secondary">{role.percentage}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <h6>Top Countries</h6>
                                  <div className="list-group">
                                    {userAnalytics.topCountries.map((country, index) => (
                                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        {country.country}
                                        <div>
                                          <span className="badge bg-primary me-1">{country.users}</span>
                                          <span className="badge bg-secondary">{country.percentage}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Users Management Tab */}
                          {userManagementTab === 'users' && (
                            <div>
                              {/* User Filters and Search */}
                              <div className="row mb-4">
                                <div className="col-md-3">
                                  <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <select 
                                    className="form-select"
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                  >
                                    <option value="all">All Roles</option>
                                    <option value="player">Player</option>
                                    <option value="coach">Coach</option>
                                    <option value="parent">Parent</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </div>
                                <div className="col-md-2">
                                  <select 
                                    className="form-select"
                                    value={userStatusFilter}
                                    onChange={(e) => setUserStatusFilter(e.target.value)}
                                  >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="banned">Banned</option>
                                  </select>
                                </div>
                                <div className="col-md-2">
                                  <select 
                                    className="form-select"
                                    value={userSortBy}
                                    onChange={(e) => setUserSortBy(e.target.value)}
                                  >
                                    <option value="joinDate">Join Date</option>
                                    <option value="lastLogin">Last Login</option>
                                    <option value="name">Name</option>
                                    <option value="email">Email</option>
                                  </select>
                                </div>
                                <div className="col-md-2">
                                  <select 
                                    className="form-select"
                                    value={userSortOrder}
                                    onChange={(e) => setUserSortOrder(e.target.value)}
                                  >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                  </select>
                                </div>
                                <div className="col-md-1">
                                  <button className="btn btn-outline-secondary" onClick={selectAllUsers}>
                                    <i className="bi bi-check-all"></i>
                                  </button>
                                </div>
                              </div>

                              {/* Users Table */}
                              <div className="table-responsive position-relative">
                                {isUserTableLoading && (
                                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
                                    <div className="spinner-border text-primary" role="status">
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  </div>
                                )}
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th>
                                        <input 
                                          type="checkbox" 
                                          checked={selectedUsers.length === getFilteredUsers.length}
                                          onChange={selectAllUsers}
                                        />
                                      </th>
                                      <th>User</th>
                                      <th>Role</th>
                                      <th>Status</th>
                                      <th>Join Date</th>
                                      <th>Last Login</th>
                                      <th>Activity</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredUsers.map((user) => (
                                      <tr key={user.id}>
                                        <td>
                                          <input 
                                            type="checkbox" 
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => toggleUserSelection(user.id)}
                                          />
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center">
                                            <img 
                                              src={user.profileImage} 
                                              alt={user.name}
                                              className="rounded-circle me-2"
                                              width="32"
                                              height="32"
                                              onError={(e) => e.target.src = '/images/default-avatar.png'}
                                            />
                                            <div>
                                              <div className="fw-bold">{user.name}</div>
                                              <small className="text-muted">@{user.username}</small>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'coach' ? 'bg-warning' : 'bg-primary'}`}>
                                            {user.role}
                                          </span>
                                        </td>
                                        <td>
                                          <span className={`badge ${user.status === 'active' ? 'bg-success' : user.status === 'suspended' ? 'bg-warning' : 'bg-danger'}`}>
                                            {user.status}
                                          </span>
                                        </td>
                                        <td>{user.joinDate}</td>
                                        <td>{user.lastLogin}</td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <span className="badge bg-info">{user.totalPosts} posts</span>
                                            <span className="badge bg-secondary">{user.totalComments} comments</span>
                                          </div>
                                        </td>
                                        <td>
                                          <div className="btn-group btn-group-sm">
                                            <button 
                                              className="btn btn-outline-primary"
                                              onClick={() => {
                                                setSelectedUser(user);
                                                setShowUserDetailsModal(true);
                                              }}
                                              title="View Details"
                                            >
                                              <i className="bi bi-eye"></i>
                                            </button>
                                            <button 
                                              className="btn btn-outline-info"
                                              onClick={() => {
                                                setSelectedUser(user);
                                                setShowUserActivityModal(true);
                                              }}
                                              title="View Activity"
                                            >
                                              <i className="bi bi-clock-history"></i>
                                            </button>
                                            <button 
                                              className="btn btn-outline-secondary"
                                              onClick={() => {
                                                setSelectedUser(user);
                                                setShowPermissionsModal(true);
                                              }}
                                              title="Manage Permissions"
                                            >
                                              <i className="bi bi-shield-check"></i>
                                            </button>
                                            <button 
                                              className="btn btn-outline-warning"
                                              onClick={() => resetUserPassword(user.id)}
                                              title="Reset Password"
                                            >
                                              <i className="bi bi-key"></i>
                                            </button>
                                            {user.isBanned ? (
                                              <button 
                                                className="btn btn-outline-success"
                                                onClick={() => unbanUser(user.id)}
                                                title="Unban User"
                                              >
                                                <i className="bi bi-unlock"></i>
                                              </button>
                                            ) : (
                                              <button 
                                                className="btn btn-outline-danger"
                                                onClick={() => banUser(user.id, 'Policy violation', 30)}
                                                title="Ban User"
                                              >
                                                <i className="bi bi-ban"></i>
                                              </button>
                                            )}
                                            <button 
                                              className="btn btn-outline-primary"
                                              onClick={() => exportUserReport(user.id, 'full')}
                                              title="Export Report"
                                            >
                                              <i className="bi bi-file-earmark-text"></i>
                                            </button>
                                            <button 
                                              className="btn btn-outline-danger"
                                              onClick={() => deleteUser(user.id)}
                                              title="Delete User"
                                            >
                                              <i className="bi bi-trash"></i>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Content Review Tab */}
                          {userManagementTab === 'content' && (
                            <div>
                              <h5 className="mb-3">User Content Review</h5>
                              <div className="row">
                                {userContent.map((content) => (
                                  <div key={content.id} className="col-md-6 mb-3">
                                    <div className="card">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title">{content.title}</h6>
                                          <span className={`badge ${content.status === 'published' ? 'bg-success' : content.status === 'flagged' ? 'bg-danger' : 'bg-warning'}`}>
                                            {content.status}
                                          </span>
                                        </div>
                                        <p className="card-text small">{content.content}</p>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <small className="text-muted">
                                            {content.createdAt} • {content.likes} likes • {content.comments} comments
                                          </small>
                                          <div className="btn-group btn-group-sm">
                                            {content.status === 'flagged' && (
                                              <>
                                                <button 
                                                  className="btn btn-outline-success"
                                                  onClick={() => approveUserContent(content.id)}
                                                >
                                                  <i className="bi bi-check"></i>
                                                </button>
                                                <button 
                                                  className="btn btn-outline-danger"
                                                  onClick={() => rejectUserContent(content.id, 'Inappropriate content')}
                                                >
                                                  <i className="bi bi-x"></i>
                                                </button>
                                              </>
                                            )}
                                            <button 
                                              className="btn btn-outline-danger"
                                              onClick={() => deleteUserContent(content.id)}
                                            >
                                              <i className="bi bi-trash"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reports Tab */}
                          {userManagementTab === 'reports' && (
                            <div>
                              <h5 className="mb-3">User Reports</h5>
                              <div className="row">
                                {userReports.map((report) => (
                                  <div key={report.id} className="col-md-6 mb-3">
                                    <div className="card">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <h6 className="card-title">Report #{report.id}</h6>
                                          <span className={`badge ${report.status === 'pending' ? 'bg-warning' : report.status === 'investigating' ? 'bg-info' : 'bg-success'}`}>
                                            {report.status}
                                          </span>
                                        </div>
                                        <p className="card-text">
                                          <strong>Reason:</strong> {report.reason}<br/>
                                          <strong>Description:</strong> {report.description}
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <small className="text-muted">{report.createdAt}</small>
                                          <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary">
                                              <i className="bi bi-eye"></i>
                                            </button>
                                            <button 
                                              className="btn btn-outline-success"
                                              onClick={() => resolveUserReport(report.id, 'Warning issued', 'User warned about behavior')}
                                            >
                                              <i className="bi bi-check"></i>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* User Analytics Tab */}
                          {userManagementTab === 'analytics' && (
                            <div>
                              <h5 className="mb-4">User Analytics</h5>
                              <div className="row mb-4">
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-primary">{userAnalytics.activityStats.dailyActiveUsers}</h3>
                                      <p className="card-text">Daily Active Users</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-success">{userAnalytics.activityStats.weeklyActiveUsers}</h3>
                                      <p className="card-text">Weekly Active Users</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-info">{userAnalytics.activityStats.monthlyActiveUsers}</h3>
                                      <p className="card-text">Monthly Active Users</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="card text-center">
                                    <div className="card-body">
                                      <h3 className="text-warning">{userAnalytics.activityStats.retentionRate}%</h3>
                                      <p className="card-text">Retention Rate</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Activity Log Tab */}
                          {userManagementTab === 'activity' && (
                            <div>
                              <h5 className="mb-3">User Activity Log</h5>
                              <div className="table-responsive">
                                <table className="table table-hover">
                                  <thead>
                                    <tr>
                                      <th>User</th>
                                      <th>Action</th>
                                      <th>Description</th>
                                      <th>Timestamp</th>
                                      <th>IP Address</th>
                                      <th>Location</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userActivityLog.map((activity) => {
                                      const user = users.find(u => u.id === activity.userId);
                                      return (
                                        <tr key={activity.id}>
                                          <td>
                                            <div className="d-flex align-items-center">
                                              <img 
                                                src={user?.profileImage || '/images/default-avatar.png'} 
                                                alt={user?.name}
                                                className="rounded-circle me-2"
                                                width="24"
                                                height="24"
                                              />
                                              <div>
                                                <div className="fw-bold small">{user?.name}</div>
                                                <small className="text-muted">@{user?.username}</small>
                                              </div>
                                            </div>
                                          </td>
                                          <td>
                                            <span className={`badge ${
                                              activity.action === 'login' ? 'bg-success' :
                                              activity.action === 'post_created' ? 'bg-primary' :
                                              activity.action === 'comment_created' ? 'bg-info' :
                                              activity.action === 'account_suspended' ? 'bg-danger' :
                                              'bg-secondary'
                                            }`}>
                                              {activity.action.replace('_', ' ')}
                                            </span>
                                          </td>
                                          <td>{activity.description}</td>
                                          <td>{activity.timestamp}</td>
                                          <td><code>{activity.ipAddress}</code></td>
                                          <td>{activity.location}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Permissions Tab */}
                          {userManagementTab === 'permissions' && (
                            <div>
                              <h5 className="mb-3">User Permissions Management</h5>
                              <div className="row">
                                {users.map((user) => (
                                  <div key={user.id} className="col-md-6 mb-3">
                                    <div className="card">
                                      <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                          <div className="d-flex align-items-center">
                                            <img 
                                              src={user.profileImage} 
                                              alt={user.name}
                                              className="rounded-circle me-2"
                                              width="32"
                                              height="32"
                                              onError={(e) => e.target.src = '/images/default-avatar.png'}
                                            />
                                            <div>
                                              <div className="fw-bold">{user.name}</div>
                                              <small className="text-muted">@{user.username}</small>
                                            </div>
                                          </div>
                                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'coach' ? 'bg-warning' : 'bg-primary'}`}>
                                            {user.role}
                                          </span>
                                        </div>
                                        <div className="row">
                                          {Object.entries(userPermissions[user.id] || {}).map(([permission, allowed]) => (
                                            <div key={permission} className="col-6 mb-2">
                                              <div className="form-check">
                                                <input 
                                                  className="form-check-input" 
                                                  type="checkbox"
                                                  checked={allowed}
                                                  onChange={(e) => {
                                                    const newPermissions = {
                                                      ...userPermissions[user.id],
                                                      [permission]: e.target.checked
                                                    };
                                                    updateUserPermissions(user.id, newPermissions);
                                                  }}
                                                />
                                                <label className="form-check-label small">
                                                  {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </label>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other sections placeholder */}
              {activeSection !== 'overview' && activeSection !== 'system' && activeSection !== 'content' && activeSection !== 'users' && (
                <div className="row">
                  <div className="col-12">
                    <div className="card shadow">
                      <div className="card-body text-center py-5">
                        <i className="bi bi-gear-fill fa-3x text-muted mb-3"></i>
                        <h4 className="text-muted">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section</h4>
                        <p className="text-muted">This section is under development. Coming soon!</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => setActiveSection('overview')}
                        >
                          Back to Overview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Users Modal */}
      {showUsersModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registered Users</h5>
                <button type="button" className="btn-close" onClick={() => setShowUsersModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead className="table-dark">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={index}>
                          <td>{user.name || 'N/A'}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'superAdmin' ? 'bg-warning' : 'bg-secondary'}`}>
                              {user.role || 'User'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUsersModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pending Applications</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplicationsModal(false)}></button>
              </div>
              <div className="modal-body">
                {applications.length === 0 ? (
                  <p className="text-center text-muted">No pending applications found</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Type</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app, index) => (
                          <tr key={index}>
                            <td>{app.applicantName || 'N/A'}</td>
                            <td>{app.applicationType}</td>
                            <td>
                              <span className="badge bg-warning">Pending</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplicationsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teams Modal */}
      {showTeamsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Team Management</h5>
                <button type="button" className="btn-close" onClick={() => setShowTeamsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Team Name</th>
                        <th>Age Group</th>
                        <th>Coach</th>
                        <th>Players</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team, index) => (
                        <tr key={index}>
                          <td>{team.name}</td>
                          <td>{team.ageGroup}</td>
                          <td>{team.coach}</td>
                          <td>{team.players ? team.players.length : 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTeamsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Details - {selectedUser.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowUserDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4">
                    <img 
                      src={selectedUser.profileImage} 
                      alt={selectedUser.name}
                      className="img-fluid rounded-circle mb-3"
                      onError={(e) => e.target.src = '/images/default-avatar.png'}
                    />
                    <h6>Contact Information</h6>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone}</p>
                    <p><strong>Location:</strong> {selectedUser.location}</p>
                  </div>
                  <div className="col-md-8">
                    <h6>Account Information</h6>
                    <div className="row">
                      <div className="col-6">
                        <p><strong>Username:</strong> @{selectedUser.username}</p>
                        <p><strong>Role:</strong> <span className={`badge ${selectedUser.role === 'admin' ? 'bg-danger' : selectedUser.role === 'coach' ? 'bg-warning' : 'bg-primary'}`}>{selectedUser.role}</span></p>
                        <p><strong>Status:</strong> <span className={`badge ${selectedUser.status === 'active' ? 'bg-success' : selectedUser.status === 'suspended' ? 'bg-warning' : 'bg-danger'}`}>{selectedUser.status}</span></p>
                      </div>
                      <div className="col-6">
                        <p><strong>Join Date:</strong> {selectedUser.joinDate}</p>
                        <p><strong>Last Login:</strong> {selectedUser.lastLogin}</p>
                        <p><strong>Verified:</strong> {selectedUser.isVerified ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <h6 className="mt-3">Activity Statistics</h6>
                    <div className="row">
                      <div className="col-3">
                        <div className="text-center">
                          <h4 className="text-primary">{selectedUser.totalPosts}</h4>
                          <small>Posts</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="text-center">
                          <h4 className="text-info">{selectedUser.totalComments}</h4>
                          <small>Comments</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="text-center">
                          <h4 className="text-success">{selectedUser.totalLikes}</h4>
                          <small>Likes</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="text-center">
                          <h4 className="text-warning">{selectedUser.violations}</h4>
                          <small>Violations</small>
                        </div>
                      </div>
                    </div>
                    {selectedUser.isBanned && (
                      <div className="alert alert-danger mt-3">
                        <h6>Ban Information</h6>
                        <p><strong>Reason:</strong> {selectedUser.banReason}</p>
                        <p><strong>Expires:</strong> {selectedUser.banExpires || 'Permanent'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserDetailsModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => exportUserReport(selectedUser.id, 'detailed')}>Export Report</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActionsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bulk Actions - {selectedUsers.length} Users Selected</h5>
                <button type="button" className="btn-close" onClick={() => setShowBulkActionsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Action Type</label>
                  <select 
                    className="form-select"
                    value={bulkActionType}
                    onChange={(e) => setBulkActionType(e.target.value)}
                  >
                    <option value="">Select Action</option>
                    <option value="activate">Activate Users</option>
                    <option value="suspend">Suspend Users</option>
                    <option value="ban">Ban Users</option>
                    <option value="changeRole">Change Role</option>
                    <option value="sendNotification">Send Notification</option>
                    <option value="delete">Delete Users</option>
                  </select>
                </div>
                {(bulkActionType === 'ban' || bulkActionType === 'changeRole' || bulkActionType === 'sendNotification') && (
                  <div className="mb-3">
                    <label className="form-label">
                      {bulkActionType === 'ban' ? 'Ban Reason' : 
                       bulkActionType === 'changeRole' ? 'New Role' : 
                       'Notification Message'}
                    </label>
                    {bulkActionType === 'changeRole' ? (
                      <select 
                        className="form-select"
                        value={bulkActionValue}
                        onChange={(e) => setBulkActionValue(e.target.value)}
                      >
                        <option value="">Select Role</option>
                        <option value="player">Player</option>
                        <option value="coach">Coach</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        className="form-control"
                        value={bulkActionValue}
                        onChange={(e) => setBulkActionValue(e.target.value)}
                        placeholder={bulkActionType === 'ban' ? 'Enter ban reason...' : 'Enter notification message...'}
                      />
                    )}
                  </div>
                )}
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This action will be applied to {selectedUsers.length} selected users. This cannot be undone.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkActionsModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={performBulkAction}
                  disabled={!bulkActionType || (bulkActionType !== 'activate' && bulkActionType !== 'suspend' && bulkActionType !== 'delete' && !bulkActionValue)}
                >
                  Execute Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Activity Modal */}
      {showUserActivityModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Activity Log - {selectedUser.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowUserActivityModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Description</th>
                        <th>Timestamp</th>
                        <th>IP Address</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getUserActivity(selectedUser.id).map((activity) => (
                        <tr key={activity.id}>
                          <td>
                            <span className={`badge ${
                              activity.action === 'login' ? 'bg-success' :
                              activity.action === 'post_created' ? 'bg-primary' :
                              activity.action === 'comment_created' ? 'bg-info' :
                              activity.action === 'account_suspended' ? 'bg-danger' :
                              'bg-secondary'
                            }`}>
                              {activity.action.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{activity.description}</td>
                          <td>{activity.timestamp}</td>
                          <td><code>{activity.ipAddress}</code></td>
                          <td>{activity.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUserActivityModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Permissions - {selectedUser.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowPermissionsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Content Permissions</h6>
                    {Object.entries(userPermissions[selectedUser.id] || {}).map(([permission, allowed]) => (
                      <div key={permission} className="form-check mb-2">
                        <input 
                          className="form-check-input" 
                          type="checkbox"
                          checked={allowed}
                          onChange={(e) => {
                            const newPermissions = {
                              ...userPermissions[selectedUser.id],
                              [permission]: e.target.checked
                            };
                            updateUserPermissions(selectedUser.id, newPermissions);
                          }}
                        />
                        <label className="form-check-label">
                          {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6">
                    <h6>Current Role: <span className={`badge ${selectedUser.role === 'admin' ? 'bg-danger' : selectedUser.role === 'coach' ? 'bg-warning' : 'bg-primary'}`}>{selectedUser.role}</span></h6>
                    <p className="text-muted">Role-based permissions are automatically applied based on the user's role.</p>
                    <div className="mt-3">
                      <label className="form-label">Change Role</label>
                      <select 
                        className="form-select"
                        value={selectedUser.role}
                        onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                      >
                        <option value="player">Player</option>
                        <option value="coach">Coach</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPermissionsModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => setShowPermissionsModal(false)}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Notification - {selectedUsers.length} Users</h5>
                <button type="button" className="btn-close" onClick={() => setShowNotificationModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Notification Type</label>
                  <select className="form-select">
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-control" placeholder="Enter notification subject..." />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows="4" placeholder="Enter notification message..."></textarea>
                </div>
                <div className="alert alert-info">
                  This notification will be sent to {selectedUsers.length} selected users.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNotificationModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={() => {
                  sendBulkNotification('Test notification', 'info');
                  setShowNotificationModal(false);
                }}>Send Notification</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcasts Modal */}
      {showBroadcastsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Broadcast Messages</h5>
                <button type="button" className="btn-close" onClick={() => setShowBroadcastsModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Target</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {broadcasts.map((broadcast, index) => (
                        <tr key={index}>
                          <td>{broadcast.title}</td>
                          <td>{broadcast.targetAudience}</td>
                          <td>
                            <span className={`badge ${broadcast.status === 'sent' ? 'bg-success' : 'bg-warning'}`}>
                              {broadcast.status}
                            </span>
                          </td>
                          <td>{new Date(broadcast.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBroadcastsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
