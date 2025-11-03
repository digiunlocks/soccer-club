import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import UnifiedMarketplaceManager from './components/UnifiedMarketplaceManager';
import UnifiedPaymentManager from './components/UnifiedPaymentManager';


export default function AdminDashboard() {
  const location = useLocation();
  
  // Add spinning animation for refresh button
  const spinStyle = {
    animation: 'spin 1s linear infinite'
  };

  // Add CSS for spin animation and custom styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .avatar-sm {
        width: 40px;
        height: 40px;
        font-size: 16px;
      }
      
      .avatar-lg {
        width: 80px;
        height: 80px;
        font-size: 32px;
      }
      
      .timeline {
        position: relative;
        padding-left: 30px;
      }
      
      .timeline-item {
        position: relative;
        margin-bottom: 20px;
      }
      
      .timeline-marker {
        position: absolute;
        left: -35px;
        top: 5px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 0 0 2px #dee2e6;
      }
      
      .timeline-item:not(:last-child)::before {
        content: '';
        position: absolute;
        left: -30px;
        top: 15px;
        width: 2px;
        height: calc(100% + 10px);
        background-color: #dee2e6;
      }
      
      .timeline-content {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border-left: 3px solid #007bff;
      }
      
      .hover-shadow {
        transition: all 0.3s ease;
      }
      
      .hover-shadow:hover {
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        transform: translateY(-3px);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState('overview');
  const [collapsedSections, setCollapsedSections] = useState({
    userManagement: true,
    programs: true,
    facilities: true,
    clubManagement: true,
    businessFinance: true, // Collapsed by default
    communications: true,
    legalCompliance: true,
    systemTechnical: true,
    support: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'player', status: 'active', joinDate: '2024-01-15', phone: '+1-555-0123', lastActive: '2 hours ago', profileViews: 45, verified: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'coach', status: 'active', joinDate: '2024-01-20', phone: '+1-555-0124', lastActive: '1 hour ago', profileViews: 78, verified: true },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'parent', status: 'suspended', joinDate: '2024-02-01', phone: '+1-555-0125', lastActive: '3 days ago', profileViews: 12, verified: false },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'player', status: 'active', joinDate: '2024-02-05', phone: '+1-555-0126', lastActive: '30 minutes ago', profileViews: 23, verified: true },
    { id: 5, name: 'Coach Martinez', email: 'martinez@example.com', role: 'coach', status: 'active', joinDate: '2024-01-10', phone: '+1-555-0127', lastActive: '1 hour ago', profileViews: 156, verified: true },
    { id: 6, name: 'Emma Davis', email: 'emma@example.com', role: 'parent', status: 'active', joinDate: '2024-02-10', phone: '+1-555-0128', lastActive: '4 hours ago', profileViews: 34, verified: true },
    { id: 7, name: 'Alex Brown', email: 'alex@example.com', role: 'player', status: 'banned', joinDate: '2024-01-25', phone: '+1-555-0129', lastActive: '1 week ago', profileViews: 8, verified: false },
    { id: 8, name: 'Lisa Garcia', email: 'lisa@example.com', role: 'volunteer', status: 'active', joinDate: '2024-02-15', phone: '+1-555-0130', lastActive: '2 hours ago', profileViews: 19, verified: true }
  ]);

  // User management state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');
  
  // Modal states
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [editUserForm, setEditUserForm] = useState({});
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
    password: '',
    team: '',
    position: '',
    emergencyContact: '',
    address: '',
    dateOfBirth: '',
    medicalInfo: ''
  });
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    sendEmail: false
  });
  const [assignForm, setAssignForm] = useState({
    team: '',
    position: '',
    coach: '',
    startDate: '',
    notes: ''
  });
  
  // Advanced features state
  const [userViewMode, setUserViewMode] = useState('table'); // table, grid, list
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userAnalytics, setUserAnalytics] = useState({
    totalSessions: 1247,
    averageSessionTime: '12m 34s',
    mostActiveUsers: ['Jane Smith', 'Coach Martinez', 'Sarah Wilson'],
    userGrowthRate: 15.2,
    retentionRate: 87.5
  });

  // Sample teams and coaches data
  const [sampleTeamsData] = useState([
    { id: 1, name: 'U-12 Boys', coach: 'Coach Martinez', level: 'Competitive' },
    { id: 2, name: 'U-14 Girls', coach: 'Jane Smith', level: 'Recreational' },
    { id: 3, name: 'U-16 Boys', coach: 'Coach Wilson', level: 'Competitive' },
    { id: 4, name: 'Senior Team', coach: 'Coach Davis', level: 'Professional' }
  ]);

  const [coaches] = useState([
    { id: 1, name: 'Coach Martinez', email: 'martinez@example.com', specialization: 'Youth Development' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', specialization: 'Goalkeeping' },
    { id: 3, name: 'Coach Wilson', email: 'wilson@example.com', specialization: 'Tactics' },
    { id: 4, name: 'Coach Davis', email: 'davis@example.com', specialization: 'Fitness' }
  ]);
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Seattle Leopards FC',
    siteDescription: 'Premier Soccer Club',
    adminEmail: 'admin@seattleleopards.com',
    enableRegistration: true,
    maintenanceMode: false
  });

  // Club Info state
  const [clubInfo, setClubInfo] = useState({
    name: "",
    shortName: "",
    founded: "",
    location: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    mission: "",
    vision: "",
    values: [],
    president: "",
    vicePresident: "",
    secretary: "",
    treasurer: "",
    technicalDirector: "",
    headCoach: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    primaryColor: "#1e40af",
    secondaryColor: "#f59e0b",
    logo: "",
    motto: "",
    homeField: "",
    trainingFacilities: [],
    officeLocation: "",
    registrationNumber: "",
    taxId: "",
    nonProfit: false,
    insuranceProvider: "",
    insuranceNumber: "",
    totalMembers: 0,
    activePlayers: 0,
    coaches: 0,
    volunteers: 0,
    teams: 0,
    awards: [],
    championships: [],
    recognitions: []
  });
  const [clubInfoLoading, setClubInfoLoading] = useState(false);
  const [clubInfoActiveTab, setClubInfoActiveTab] = useState('basic');

  // Policies state
  const [policies, setPolicies] = useState({
    general: {
      clubName: 'Seattle Leopards FC',
      codeOfConduct: '',
      membershipTerms: '',
      privacyPolicy: '',
      refundPolicy: '',
      lastUpdated: new Date().toISOString()
    },
    safety: {
      safetyGuidelines: '',
      emergencyProcedures: '',
      injuryReporting: '',
      equipmentSafety: '',
      weatherPolicy: '',
      lastUpdated: new Date().toISOString()
    },
    disciplinary: {
      disciplinaryCode: '',
      suspensionPolicy: '',
      appealProcess: '',
      zeroTolerance: '',
      reportingProcedures: '',
      lastUpdated: new Date().toISOString()
    },
    financial: {
      paymentTerms: '',
      feeStructure: '',
      refundPolicy: '',
      latePaymentPolicy: '',
      financialAid: '',
      lastUpdated: new Date().toISOString()
    },
    technology: {
      dataProtection: '',
      socialMediaPolicy: '',
      photoVideoPolicy: '',
      communicationPolicy: '',
      onlineSafety: '',
      lastUpdated: new Date().toISOString()
    },
    volunteer: {
      volunteerCode: '',
      backgroundChecks: '',
      trainingRequirements: '',
      volunteerRights: '',
      volunteerResponsibilities: '',
      lastUpdated: new Date().toISOString()
    }
  });
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [policiesActiveTab, setPoliciesActiveTab] = useState('general');

  // Documentation state
  const [documentsActiveTab, setDocumentsActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentFilter, setDocumentFilter] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'policies',
    version: '1.0',
    file: null,
    status: 'draft'
  });

  const documentCategories = [
    { id: 'policies', name: 'Policies & Procedures', icon: '📋', color: 'blue' },
    { id: 'forms', name: 'Forms & Templates', icon: '📄', color: 'green' },
    { id: 'handbooks', name: 'Handbooks & Guides', icon: '📚', color: 'purple' },
    { id: 'training', name: 'Training Materials', icon: '🎓', color: 'orange' },
    { id: 'legal', name: 'Legal Documents', icon: '⚖️', color: 'red' },
    { id: 'financial', name: 'Financial Documents', icon: '💰', color: 'teal' },
    { id: 'medical', name: 'Medical Forms', icon: '🏥', color: 'pink' },
    { id: 'other', name: 'Other Documents', icon: '📎', color: 'gray' }
  ];

  // Applications state
  const [applicationsActiveTab, setApplicationsActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState({
    search: '',
    type: 'all',
    status: 'all',
    priority: 'all'
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);

  const applicationTypes = [
    { id: 'player', name: 'Player Registration', icon: '⚽', color: 'blue' },
    { id: 'coach', name: 'Coach Application', icon: '👨‍🏫', color: 'green' },
    { id: 'volunteer', name: 'Volunteer Application', icon: '🤝', color: 'purple' },
    { id: 'transfer', name: 'Transfer Request', icon: '🔄', color: 'orange' },
    { id: 'scholarship', name: 'Scholarship/Financial Aid', icon: '💰', color: 'teal' },
    { id: 'team', name: 'Team Formation', icon: '👥', color: 'indigo' },
    { id: 'other', name: 'Other Applications', icon: '📋', color: 'gray' }
  ];

  const applicationStatusOptions = [
    { id: 'pending', name: 'Pending Review', color: 'warning', icon: '⏳' },
    { id: 'under_review', name: 'Under Review', color: 'info', icon: '👁️' },
    { id: 'approved', name: 'Approved', color: 'success', icon: '✅' },
    { id: 'rejected', name: 'Rejected', color: 'danger', icon: '❌' },
    { id: 'on_hold', name: 'On Hold', color: 'warning', icon: '⏸️' },
    { id: 'requires_info', name: 'Requires Information', color: 'secondary', icon: 'ℹ️' }
  ];

  // Forms state
  const [formsActiveTab, setFormsActiveTab] = useState('overview');
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formFilter, setFormFilter] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const formCategories = [
    { id: 'registration', name: 'Registration Forms', icon: '📝', color: 'blue' },
    { id: 'medical', name: 'Medical Forms', icon: '🏥', color: 'red' },
    { id: 'consent', name: 'Consent & Waivers', icon: '✍️', color: 'orange' },
    { id: 'evaluation', name: 'Evaluation Forms', icon: '⭐', color: 'yellow' },
    { id: 'feedback', name: 'Feedback Forms', icon: '💬', color: 'green' },
    { id: 'application', name: 'Application Forms', icon: '📋', color: 'purple' },
    { id: 'event', name: 'Event Forms', icon: '🎉', color: 'pink' },
    { id: 'financial', name: 'Financial Forms', icon: '💰', color: 'teal' },
    { id: 'other', name: 'Other Forms', icon: '📄', color: 'gray' }
  ];

  // Teams state
  const [teamsActiveTab, setTeamsActiveTab] = useState('overview');
  const [managedTeams, setManagedTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    ageGroup: "",
    level: "",
    status: "Forming",
    coach: "",
    assistantCoach: "",
    maxPlayers: 16,
    currentPlayers: 0,
    practiceDays: "",
    practiceTime: "",
    gameDay: "",
    gameTime: "",
    location: "",
    fees: 0,
    season: "",
    description: "",
    visible: true
  });

  const AGE_GROUPS = ["Under 6", "Under 8", "Under 10", "Under 12", "Under 14", "Under 16", "Under 18", "Adult", "Women's", "Coed"];
  const TEAM_LEVELS = ["Recreational", "Competitive", "Elite", "Development", "All-Star"];
  const TEAM_STATUSES = ["Active", "Inactive", "Forming", "Full", "Tryouts"];

  // Matches state
  const [matchesActiveTab, setMatchesActiveTab] = useState('overview');
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchForm, setMatchForm] = useState({
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    location: "",
    type: "League",
    status: "Scheduled",
    homeScore: 0,
    awayScore: 0,
    notes: ""
  });

  // Training state
  const [trainingsActiveTab, setTrainingsActiveTab] = useState('overview');
  const [trainings, setTrainings] = useState([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [trainingForm, setTrainingForm] = useState({
    title: "",
    description: "",
    team: "",
    coach: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "Technical",
    capacity: 20,
    enrolled: 0
  });

  // Events state
  const [eventsActiveTab, setEventsActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "Tournament",
    status: "Upcoming",
    capacity: 100,
    registered: 0,
    price: 0
  });

  // Scheduling state
  const [schedulesActiveTab, setSchedulesActiveTab] = useState('overview');
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    team: "",
    eventType: "Practice",
    startDate: "",
    startTime: "",
    endTime: "",
    location: "",
    isPublic: true,
    status: "scheduled",
    notes: ""
  });

  // Standings state
  const [standings, setStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [showStandingForm, setShowStandingForm] = useState(false);
  const [editingStanding, setEditingStanding] = useState(null);
  const [standingForm, setStandingForm] = useState({
    season: "",
    league: "",
    division: "",
    team: "",
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: "",
    isPublic: true,
    notes: ""
  });

  // Media Library state
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaTab, setMediaTab] = useState('all'); // all, pending, flagged
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    title: "",
    description: "",
    category: "Match Photos",
    file: null
  });

  // Sponsors state
  const [sponsors, setSponsors] = useState([]);
  const [sponsorsLoading, setSponsorsLoading] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    tier: "Bronze",
    amount: 0,
    paymentFrequency: "Annual",
    contractStart: "",
    contractEnd: "",
    status: "Pending",
    address: "",
    benefits: "",
    notes: "",
    isVisible: true
  });

  // Membership state
  const [membershipTab, setMembershipTab] = useState('tiers'); // tiers, members
  const [memberships, setMemberships] = useState([]);
  const [membershipTiers, setMembershipTiers] = useState([]);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [editingMembership, setEditingMembership] = useState(null);
  const [showTierForm, setShowTierForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [membershipStats, setMembershipStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [membershipForm, setMembershipForm] = useState({
    userId: "",
    tierId: "",
    startDate: "",
    endDate: "",
    amount: 0,
    paymentMethod: "credit_card",
    notes: ""
  });
  const [tierForm, setTierForm] = useState({
    name: "",
    description: "",
    price: 0,
    duration: 12,
    features: [],
    discountPercentage: 0,
    isActive: true,
    color: "#3B82F6"
  });

  // Finance state
  const [financeTab, setFinanceTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);

  // Marketplace state
  const [marketplaceStats, setMarketplaceStats] = useState({
    activeListings: 0,
    activeSellers: 0,
    totalRevenue: 0,
    expiringItems: 0,
    pendingReview: 0,
    flaggedItems: 0,
    soldItems: 0
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [financeSummary, setFinanceSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    incomeCount: 0,
    expenseCount: 0
  });
  const [transactionForm, setTransactionForm] = useState({
    type: "income",
    category: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "cash",
    status: "completed",
    referenceNumber: "",
    payer: "",
    payee: "",
    notes: ""
  });

  const incomeCategories = [
    "Registration Fees", "Membership Dues", "Sponsorships", "Fundraising",
    "Merchandise Sales", "Tournament Fees", "Donations", "Grants", "Other Income"
  ];

  const expenseCategories = [
    "Equipment", "Uniforms", "Facility Rental", "Coaching Fees", "Travel",
    "Insurance", "Utilities", "Marketing", "Referee Fees", "Tournament Fees",
    "Maintenance", "Office Supplies", "Software/Technology", "Other Expenses"
  ];

  // Payment state
  const [paymentTab, setPaymentTab] = useState('all');
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingAmount: 0,
    todayRevenue: 0,
    todayCount: 0,
    refundedAmount: 0
  });
  const [paymentForm, setPaymentForm] = useState({
    payerName: "",
    payerEmail: "",
    paymentType: "Registration Fees",
    paymentMethod: "credit_card",
    amount: 0,
    status: "completed",
    transactionId: "",
    cardType: "",
    cardLastFour: "",
    notes: "",
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const paymentTypes = [
    "Registration Fees",
    "Membership Dues", 
    "Tournament Fees",
    "Training Sessions",
    "Equipment Purchase",
    "Uniform Purchase",
    "Camp/Clinic Fees",
    "Merchandise",
    "Marketplace Purchase",
    "Donations",
    "Sponsorship",
    "Other"
  ];

  const paymentMethods = [
    { value: "credit_card", label: "Credit Card", icon: "💳" },
    { value: "debit_card", label: "Debit Card", icon: "💳" },
    { value: "paypal", label: "PayPal", icon: "🅿️" },
    { value: "venmo", label: "Venmo", icon: "📱" },
    { value: "zelle", label: "Zelle", icon: "💵" },
    { value: "cash_app", label: "Cash App", icon: "💵" },
    { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
    { value: "check", label: "Check", icon: "📝" },
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "other", label: "Other", icon: "💰" }
  ];

  // Enhanced overview data
  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 247,
    activeUsers: 198,
    newUsersThisMonth: 23,
    totalTeams: 12,
    activeTeams: 10,
    totalPlayers: 156,
    totalCoaches: 18,
    totalParents: 73,
    upcomingEvents: 8,
    recentApplications: 15,
    pendingApprovals: 7,
    systemHealth: 98.5,
    storageUsed: 2.3,
    storageTotal: 10.0
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'user_registration', user: 'Sarah Wilson', action: 'registered as player', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'application', user: 'Coach Martinez', action: 'submitted team application', time: '15 minutes ago', status: 'pending' },
    { id: 3, type: 'event', user: 'Admin', action: 'created new training session', time: '1 hour ago', status: 'success' },
    { id: 4, type: 'payment', user: 'Mike Johnson', action: 'completed membership payment', time: '2 hours ago', status: 'success' },
    { id: 5, type: 'broadcast', user: 'Admin', action: 'sent team announcement', time: '3 hours ago', status: 'success' },
    { id: 6, type: 'gallery', user: 'Emma Davis', action: 'uploaded match photos', time: '4 hours ago', status: 'pending' }
  ]);

  const [quickStats, setQuickStats] = useState({
    todayVisits: 89,
    weeklyGrowth: 12.5,
    monthlyRevenue: 15420,
    activeSessions: 23
  });


  // Growth trends data state
  const [growthTrends, setGrowthTrends] = useState({
    memberGrowth: {
      percentage: 0,
      period: 'vs last quarter',
      trend: 'up',
      color: 'text-success',
      icon: 'bi-arrow-up'
    },
    eventAttendance: {
      percentage: 0,
      period: 'vs last month',
      trend: 'up',
      color: 'text-primary',
      icon: 'bi-arrow-up'
    },
    revenueGrowth: {
      percentage: 0,
      period: 'vs last month',
      trend: 'up',
      color: 'text-warning',
      icon: 'bi-arrow-up'
    },
    socialEngagement: {
      percentage: 0,
      period: 'vs last week',
      trend: 'up',
      color: 'text-info',
      icon: 'bi-arrow-up'
    },
    lastUpdated: new Date(),
    isLoading: false
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Initialize growth trends data
    calculateGrowthTrends();
    
    // Set up growth trends refresh interval (every hour)
    const growthInterval = setInterval(calculateGrowthTrends, 60 * 60 * 1000);
    
    return () => {
      clearInterval(growthInterval);
    };
  }, []);

  // Handle URL parameters for section navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const requestedSection = urlParams.get('section');
    
    if (requestedSection) {
      setActiveSection(requestedSection);
      
      // If marketplace is requested, ensure businessFinance section is expanded
      if (requestedSection === 'marketplace') {
        setCollapsedSections(prev => ({
          ...prev,
          businessFinance: false
        }));
        
        // Scroll to marketplace section after a short delay
        setTimeout(() => {
          const marketplaceElement = document.querySelector('[data-marketplace-management]');
          if (marketplaceElement) {
            marketplaceElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [location.search]);

  // Growth trends calculation function
  const calculateGrowthTrends = () => {
    setGrowthTrends(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Calculate real growth metrics based on current data
      
      // Member Growth (based on new users this month vs total users)
      const memberGrowthPercentage = Math.round((overviewStats.newUsersThisMonth / (overviewStats.totalUsers - overviewStats.newUsersThisMonth)) * 100);
      const memberGrowth = {
        percentage: Math.abs(memberGrowthPercentage),
        period: 'vs last quarter',
        trend: memberGrowthPercentage >= 0 ? 'up' : 'down',
        color: memberGrowthPercentage >= 0 ? 'text-success' : 'text-danger',
        icon: memberGrowthPercentage >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'
      };
      
      // Event Attendance (based on upcoming events and recent applications)
      const eventAttendancePercentage = Math.round(((overviewStats.upcomingEvents + overviewStats.recentApplications) / 10) * 100);
      const eventAttendance = {
        percentage: Math.abs(eventAttendancePercentage),
        period: 'vs last month',
        trend: eventAttendancePercentage >= 0 ? 'up' : 'down',
        color: eventAttendancePercentage >= 0 ? 'text-primary' : 'text-danger',
        icon: eventAttendancePercentage >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'
      };
      
      // Revenue Growth (based on monthly revenue and system health)
      const revenueGrowthPercentage = Math.round((quickStats.monthlyRevenue / 10000) * 100);
      const revenueGrowth = {
        percentage: Math.abs(revenueGrowthPercentage),
        period: 'vs last month',
        trend: revenueGrowthPercentage >= 0 ? 'up' : 'down',
        color: revenueGrowthPercentage >= 0 ? 'text-warning' : 'text-danger',
        icon: revenueGrowthPercentage >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'
      };
      
      // Social Engagement (based on active users and system health)
      const socialEngagementPercentage = Math.round((overviewStats.activeUsers / overviewStats.totalUsers) * 100);
      const socialEngagement = {
        percentage: Math.abs(socialEngagementPercentage),
        period: 'vs last week',
        trend: socialEngagementPercentage >= 0 ? 'up' : 'down',
        color: socialEngagementPercentage >= 0 ? 'text-info' : 'text-danger',
        icon: socialEngagementPercentage >= 0 ? 'bi-arrow-up' : 'bi-arrow-down'
      };
      
      setGrowthTrends({
        memberGrowth,
        eventAttendance,
        revenueGrowth,
        socialEngagement,
        lastUpdated: new Date(),
        isLoading: false
      });
      
    } catch (error) {
      console.error('Error calculating growth trends:', error);
      setGrowthTrends(prev => ({ ...prev, isLoading: false }));
    }
  };

  // User management functions
  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const banUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'banned' } : user
    ));
    toast.success('User banned successfully');
  };

  const unbanUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active' } : user
    ));
    toast.success('User unbanned successfully');
  };

  const viewUserDetails = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowUserDetailsModal(true);
    }
  };

  const editUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setEditUserForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        team: user.team || '',
        position: user.position || '',
        emergencyContact: user.emergencyContact || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        medicalInfo: user.medicalInfo || ''
      });
      setShowEditUserModal(true);
    }
  };

  const sendMessage = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowMessageModal(true);
    }
  };

  const viewUserActivity = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowActivityModal(true);
    }
  };

  const addNewUser = () => {
    setShowAddUserModal(true);
  };

  const closeModals = () => {
    setShowUserDetailsModal(false);
    setShowEditUserModal(false);
    setShowAddUserModal(false);
    setShowMessageModal(false);
    setShowActivityModal(false);
    setShowDeleteConfirmModal(false);
    setShowAssignUserModal(false);
    setSelectedUser(null);
    setEditUserForm({});
    setMessageForm({ subject: '', message: '', sendEmail: false });
    setAssignForm({ team: '', position: '', coach: '', startDate: '', notes: '' });
  };

  const bulkAction = (action) => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users first');
      return;
    }
    
    const actionMessages = {
      activate: 'activated',
      suspend: 'suspended',
      ban: 'banned',
      export: 'exported'
    };
    
    toast.success(`${selectedUsers.length} users ${actionMessages[action]}`);
    setSelectedUsers([]);
  };

  const confirmDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setShowDeleteConfirmModal(true);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast.success(`User ${selectedUser.name} deleted successfully`);
      setShowDeleteConfirmModal(false);
      setSelectedUser(null);
    }
  };

  const assignUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setAssignForm({
        team: user.team || '',
        position: user.position || '',
        coach: user.coach || '',
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowAssignUserModal(true);
    }
  };

  const handleEditUser = () => {
    if (selectedUser && editUserForm.name && editUserForm.email) {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              ...editUserForm,
              lastModified: new Date().toISOString().split('T')[0]
            } 
          : user
      ));
      toast.success(`User ${editUserForm.name} updated successfully`);
      setShowEditUserModal(false);
      setSelectedUser(null);
      setEditUserForm({});
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleAddUser = () => {
    if (addUserForm.name && addUserForm.email && addUserForm.role) {
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...addUserForm,
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
        profileViews: 0,
        verified: false
      };
      setUsers([...users, newUser]);
      toast.success(`User ${addUserForm.name} added successfully`);
      setShowAddUserModal(false);
      setAddUserForm({
        name: '',
        email: '',
        phone: '',
        role: '',
        status: 'active',
        password: '',
        team: '',
        position: '',
        emergencyContact: '',
        address: '',
        dateOfBirth: '',
        medicalInfo: ''
      });
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleSendMessage = () => {
    if (messageForm.subject && messageForm.message && selectedUser) {
      toast.success(`Message sent to ${selectedUser.name}`);
      setShowMessageModal(false);
      setSelectedUser(null);
      setMessageForm({ subject: '', message: '', sendEmail: false });
    } else {
      toast.error('Please fill in subject and message');
    }
  };

  const handleAssignUser = () => {
    if (assignForm.team && selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              team: assignForm.team,
              position: assignForm.position,
              coach: assignForm.coach,
              assignmentDate: assignForm.startDate,
              assignmentNotes: assignForm.notes
            } 
          : user
      ));
      toast.success(`${selectedUser.name} assigned to ${assignForm.team}`);
      setShowAssignUserModal(false);
      setSelectedUser(null);
      setAssignForm({ team: '', position: '', coach: '', startDate: '', notes: '' });
    } else {
      toast.error('Please select a team');
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Reset sub-section when switching to communications
    if (section === 'communications') {
      setActiveSubSection('overview');
    }
  };

  const toggleCollapsedSection = (sectionName) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Club Info Functions
  const fetchClubInfo = async () => {
    try {
      setClubInfoLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/club-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClubInfo(data);
      }
    } catch (error) {
      console.error('Error fetching club info:', error);
      toast.error('Failed to fetch club information');
    } finally {
      setClubInfoLoading(false);
    }
  };

  const saveClubInfo = async () => {
    try {
      setClubInfoLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/club-info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clubInfo)
      });

      if (response.ok) {
        toast.success('Club information updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update club information');
      }
    } catch (error) {
      console.error('Error updating club info:', error);
      toast.error('Failed to update club information');
    } finally {
      setClubInfoLoading(false);
    }
  };

  const handleClubInfoChange = (field, value) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClubInfoArrayChange = (field, index, value) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addClubInfoArrayItem = (field, newItem) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: [...prev[field], newItem]
    }));
  };

  const removeClubInfoArrayItem = (field, index) => {
    setClubInfo(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Fetch club info when section changes to club-info
  useEffect(() => {
    if (activeSection === 'club-info') {
      fetchClubInfo();
    }
  }, [activeSection]);

  // Policies Functions
  const loadPolicies = async () => {
    try {
      setPoliciesLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/policies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setPoliciesLoading(false);
    }
  };

  const savePolicies = async () => {
    try {
      setPoliciesLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/policies', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(policies),
      });

      if (response.ok) {
        toast.success('Policies saved successfully!');
      } else {
        toast.error('Error saving policies');
      }
    } catch (error) {
      console.error('Error saving policies:', error);
      toast.error('Error saving policies');
    } finally {
      setPoliciesLoading(false);
    }
  };

  const updatePolicy = (category, field, value) => {
    setPolicies(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
        lastUpdated: new Date().toISOString()
      }
    }));
  };

  // Fetch policies when section changes to policies
  useEffect(() => {
    if (activeSection === 'policies') {
      loadPolicies();
    }
  }, [activeSection]);

  // Documentation Functions
  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument(prev => ({ ...prev, file }));
    }
  };

  const uploadDocument = async () => {
    if (!newDocument.title || !newDocument.file) {
      toast.error('Please provide title and file');
      return;
    }

    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('file', newDocument.file);
      formData.append('title', newDocument.title);
      formData.append('description', newDocument.description);
      formData.append('category', newDocument.category);
      formData.append('version', newDocument.version);
      formData.append('status', newDocument.status);

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Document uploaded successfully!');
        setNewDocument({
          title: '',
          description: '',
          category: 'policies',
          version: '1.0',
          file: null,
          status: 'draft'
        });
        loadDocuments();
        setDocumentsActiveTab('all');
      } else {
        toast.error('Error uploading document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error uploading document');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Document deleted successfully!');
        loadDocuments();
      } else {
        toast.error('Error deleting document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document');
    } finally {
      setDocumentsLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (documentFilter.search && !doc.title.toLowerCase().includes(documentFilter.search.toLowerCase()) &&
        !doc.description?.toLowerCase().includes(documentFilter.search.toLowerCase())) {
      return false;
    }
    if (documentFilter.category !== 'all' && doc.category !== documentFilter.category) return false;
    if (documentFilter.status !== 'all' && doc.status !== documentFilter.status) return false;
    return true;
  });

  const documentStats = {
    total: documents.length,
    published: documents.filter(d => d.status === 'published').length,
    draft: documents.filter(d => d.status === 'draft').length,
    archived: documents.filter(d => d.status === 'archived').length,
    byCategory: documentCategories.map(cat => ({
      ...cat,
      count: documents.filter(d => d.category === cat.id).length
    }))
  };

  const getDocStatusColor = (status) => {
    const colors = {
      draft: 'warning',
      published: 'success',
      archived: 'secondary',
      pending: 'info'
    };
    return colors[status] || 'secondary';
  };

  // Fetch documents when section changes to documents
  useEffect(() => {
    if (activeSection === 'documents') {
      loadDocuments();
    }
  }, [activeSection]);

  // Applications Functions
  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Application ${status} successfully!`);
        loadApplications();
        setShowAppModal(false);
      } else {
        toast.error('Error updating application status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating application status');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/applications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Application deleted successfully!');
        loadApplications();
      } else {
        toast.error('Error deleting application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Error deleting application');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (applicationFilter.search && 
        !app.applicantName?.toLowerCase().includes(applicationFilter.search.toLowerCase()) &&
        !app.applicantEmail?.toLowerCase().includes(applicationFilter.search.toLowerCase())) {
      return false;
    }
    if (applicationFilter.type !== 'all' && app.type !== applicationFilter.type) return false;
    if (applicationFilter.status !== 'all' && app.status !== applicationFilter.status) return false;
    return true;
  });

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    byType: applicationTypes.map(type => ({
      ...type,
      count: applications.filter(a => a.type === type.id).length
    }))
  };

  // Fetch applications when section changes to applications
  useEffect(() => {
    if (activeSection === 'applications') {
      loadApplications();
    }
  }, [activeSection]);

  // Forms Functions
  const loadForms = async () => {
    try {
      setFormsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/forms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setFormsLoading(false);
    }
  };

  const deleteForm = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    try {
      setFormsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/forms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Form deleted successfully!');
        loadForms();
      } else {
        toast.error('Error deleting form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Error deleting form');
    } finally {
      setFormsLoading(false);
    }
  };

  const updateFormStatus = async (id, status) => {
    try {
      setFormsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/forms/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success('Form status updated!');
        loadForms();
      } else {
        toast.error('Error updating form status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating form status');
    } finally {
      setFormsLoading(false);
    }
  };

  const filteredForms = forms.filter(form => {
    if (formFilter.search && 
        !form.title?.toLowerCase().includes(formFilter.search.toLowerCase()) &&
        !form.description?.toLowerCase().includes(formFilter.search.toLowerCase())) {
      return false;
    }
    if (formFilter.category !== 'all' && form.category !== formFilter.category) return false;
    if (formFilter.status !== 'all' && form.status !== formFilter.status) return false;
    return true;
  });

  const formStats = {
    total: forms.length,
    active: forms.filter(f => f.status === 'active').length,
    draft: forms.filter(f => f.status === 'draft').length,
    archived: forms.filter(f => f.status === 'archived').length,
    byCategory: formCategories.map(cat => ({
      ...cat,
      count: forms.filter(f => f.category === cat.id).length
    }))
  };

  // Fetch forms when section changes to forms
  useEffect(() => {
    if (activeSection === 'forms') {
      loadForms();
    }
  }, [activeSection]);

  // Teams Functions
  const loadTeams = async () => {
    try {
      setTeamsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setManagedTeams(data);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleTeamFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTeamForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      setTeamsLoading(true);
      const token = localStorage.getItem("token");
      const url = editingTeam 
        ? `http://localhost:5000/api/teams/${editingTeam._id}` 
        : 'http://localhost:5000/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamForm)
      });

      if (response.ok) {
        const savedTeam = await response.json();
        if (editingTeam) {
          setManagedTeams(prev => prev.map(team => 
            team._id === savedTeam._id ? savedTeam : team
          ));
          toast.success('Team updated successfully');
        } else {
          setManagedTeams(prev => [...prev, savedTeam]);
          toast.success('Team created successfully');
        }
        resetTeamForm();
        setShowTeamForm(false);
        setEditingTeam(null);
      } else {
        toast.error('Error saving team');
      }
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error('Error saving team');
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleEditTeam = (team) => {
    setTeamForm({
      name: team.name,
      ageGroup: team.ageGroup,
      level: team.level,
      status: team.status,
      coach: team.coach,
      assistantCoach: team.assistantCoach || "",
      maxPlayers: team.maxPlayers,
      currentPlayers: team.currentPlayers,
      practiceDays: team.practiceDays,
      practiceTime: team.practiceTime,
      gameDay: team.gameDay,
      gameTime: team.gameTime,
      location: team.location,
      fees: team.fees,
      season: team.season,
      description: team.description || "",
      visible: team.visible !== undefined ? team.visible : true
    });
    setEditingTeam(team);
    setShowTeamForm(true);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;

    try {
      setTeamsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setManagedTeams(prev => prev.filter(team => team._id !== teamId));
        toast.success('Team deleted successfully');
      } else {
        toast.error('Error deleting team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Error deleting team');
    } finally {
      setTeamsLoading(false);
    }
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      ageGroup: "",
      level: "",
      status: "Forming",
      coach: "",
      assistantCoach: "",
      maxPlayers: 16,
      currentPlayers: 0,
      practiceDays: "",
      practiceTime: "",
      gameDay: "",
      gameTime: "",
      location: "",
      fees: 0,
      season: "",
      description: "",
      visible: true
    });
  };

  const teamStats = {
    total: managedTeams.length,
    active: managedTeams.filter(t => t.status === 'Active').length,
    forming: managedTeams.filter(t => t.status === 'Forming').length,
    full: managedTeams.filter(t => t.status === 'Full').length,
    byAgeGroup: AGE_GROUPS.map(age => ({
      name: age,
      count: managedTeams.filter(t => t.ageGroup === age).length
    })).filter(g => g.count > 0),
    byLevel: TEAM_LEVELS.map(level => ({
      name: level,
      count: managedTeams.filter(t => t.level === level).length
    })).filter(l => l.count > 0)
  };

  // Fetch teams when section changes to teams
  useEffect(() => {
    if (activeSection === 'teams') {
      loadTeams();
    }
  }, [activeSection]);

  // Matches Functions
  const loadMatches = async () => {
    try {
      setMatchesLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    try {
      setMatchesLoading(true);
      const token = localStorage.getItem("token");
      const url = editingMatch ? `http://localhost:5000/api/matches/${editingMatch._id}` : 'http://localhost:5000/api/matches';
      const method = editingMatch ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(matchForm)
      });
      if (response.ok) {
        const savedMatch = await response.json();
        if (editingMatch) {
          setMatches(prev => prev.map(m => m._id === savedMatch._id ? savedMatch : m));
          toast.success('Match updated successfully');
        } else {
          setMatches(prev => [...prev, savedMatch]);
          toast.success('Match created successfully');
        }
        setShowMatchForm(false);
        setEditingMatch(null);
        setMatchForm({ homeTeam: "", awayTeam: "", date: "", time: "", location: "", type: "League", status: "Scheduled", homeScore: 0, awayScore: 0, notes: "" });
      } else {
        toast.error('Error saving match');
      }
    } catch (error) {
      toast.error('Error saving match');
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Delete this match?')) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/matches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMatches(prev => prev.filter(m => m._id !== id));
        toast.success('Match deleted');
      }
    } catch (error) {
      toast.error('Error deleting match');
    }
  };

  useEffect(() => {
    if (activeSection === 'matches') loadMatches();
  }, [activeSection]);

  // Training Functions
  const loadTrainings = async () => {
    try {
      setTrainingsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/trainings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrainings(data);
      }
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setTrainingsLoading(false);
    }
  };

  const handleTrainingSubmit = async (e) => {
    e.preventDefault();
    try {
      setTrainingsLoading(true);
      const token = localStorage.getItem("token");
      const url = editingTraining ? `http://localhost:5000/api/trainings/${editingTraining._id}` : 'http://localhost:5000/api/trainings';
      const method = editingTraining ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingForm)
      });
      if (response.ok) {
        const saved = await response.json();
        if (editingTraining) {
          setTrainings(prev => prev.map(t => t._id === saved._id ? saved : t));
          toast.success('Training updated');
        } else {
          setTrainings(prev => [...prev, saved]);
          toast.success('Training created');
        }
        setShowTrainingForm(false);
        setEditingTraining(null);
        setTrainingForm({ title: "", description: "", team: "", coach: "", date: "", startTime: "", endTime: "", location: "", type: "Technical", capacity: 20, enrolled: 0 });
      } else {
        toast.error('Error saving training');
      }
    } catch (error) {
      toast.error('Error saving training');
    } finally {
      setTrainingsLoading(false);
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('Delete this training?')) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/trainings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setTrainings(prev => prev.filter(t => t._id !== id));
        toast.success('Training deleted');
      }
    } catch (error) {
      toast.error('Error deleting training');
    }
  };

  useEffect(() => {
    if (activeSection === 'training') loadTrainings();
  }, [activeSection]);

  // Events Functions
  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      setEventsLoading(true);
      const token = localStorage.getItem("token");
      const url = editingEvent ? `http://localhost:5000/api/events/${editingEvent._id}` : 'http://localhost:5000/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      });
      if (response.ok) {
        const saved = await response.json();
        if (editingEvent) {
          setEvents(prev => prev.map(e => e._id === saved._id ? saved : e));
          toast.success('Event updated');
        } else {
          setEvents(prev => [...prev, saved]);
          toast.success('Event created');
        }
        setShowEventForm(false);
        setEditingEvent(null);
        setEventForm({ title: "", description: "", date: "", startTime: "", endTime: "", location: "", type: "Tournament", status: "Upcoming", capacity: 100, registered: 0, price: 0 });
      } else {
        toast.error('Error saving event');
      }
    } catch (error) {
      toast.error('Error saving event');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEvents(prev => prev.filter(e => e._id !== id));
        toast.success('Event deleted');
      }
    } catch (error) {
      toast.error('Error deleting event');
    }
  };

  useEffect(() => {
    if (activeSection === 'events') loadEvents();
  }, [activeSection]);

  // Scheduling Functions
  const loadSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/schedules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Backend returns paginated data with { schedules: [], pagination: {} }
        setSchedules(data.schedules || data);
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSchedulesLoading(true);
      const token = localStorage.getItem("token");
      const url = editingSchedule ? `http://localhost:5000/api/schedules/${editingSchedule._id}` : 'http://localhost:5000/api/schedules';
      const method = editingSchedule ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm)
      });
      if (response.ok) {
        const saved = await response.json();
        if (editingSchedule) {
          setSchedules(prev => prev.map(s => s._id === saved._id ? saved : s));
          toast.success('Schedule updated');
        } else {
          setSchedules(prev => [...prev, saved]);
          toast.success('Schedule created');
        }
        setShowScheduleForm(false);
        setEditingSchedule(null);
        setScheduleForm({ 
          title: "", 
          description: "", 
          team: "", 
          eventType: "Practice", 
          startDate: "", 
          startTime: "", 
          endTime: "", 
          location: "", 
          isPublic: true,
          status: "scheduled",
          notes: ""
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error saving schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Error saving schedule');
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSchedules(prev => prev.filter(s => s._id !== id));
        toast.success('Schedule deleted');
      }
    } catch (error) {
      toast.error('Error deleting schedule');
    }
  };

  useEffect(() => {
    if (activeSection === 'scheduling') loadSchedules();
  }, [activeSection]);

  // Standings Functions
  const loadStandings = async () => {
    try {
      setStandingsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/standings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStandings(data);
      }
    } catch (error) {
      console.error('Error loading standings:', error);
      toast.error('Failed to load standings');
    } finally {
      setStandingsLoading(false);
    }
  };

  const handleStandingSubmit = async (e) => {
    e.preventDefault();
    try {
      setStandingsLoading(true);
      const token = localStorage.getItem("token");
      const url = editingStanding ? `http://localhost:5000/api/standings/${editingStanding._id}` : 'http://localhost:5000/api/standings';
      const method = editingStanding ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(standingForm)
      });
      if (response.ok) {
        const saved = await response.json();
        if (editingStanding) {
          setStandings(prev => prev.map(s => s._id === saved._id ? saved : s));
          toast.success('Standing updated');
        } else {
          setStandings(prev => [...prev, saved]);
          toast.success('Standing created');
        }
        setShowStandingForm(false);
        setEditingStanding(null);
        setStandingForm({
          season: "",
          league: "",
          division: "",
          team: "",
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          form: "",
          isPublic: true,
          notes: ""
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error saving standing');
      }
    } catch (error) {
      console.error('Error saving standing:', error);
      toast.error('Error saving standing');
    } finally {
      setStandingsLoading(false);
    }
  };

  const handleDeleteStanding = async (id) => {
    if (!window.confirm('Delete this standing?')) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/standings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStandings(prev => prev.filter(s => s._id !== id));
        toast.success('Standing deleted');
      } else {
        toast.error('Error deleting standing');
      }
    } catch (error) {
      console.error('Error deleting standing:', error);
      toast.error('Error deleting standing');
    }
  };

  useEffect(() => {
    if (activeSection === 'standings') loadStandings();
  }, [activeSection]);

  // Media Library Functions
  const loadMediaItems = async (tab = 'all') => {
    try {
      setMediaLoading(true);
      const token = localStorage.getItem("token");
      let url = 'http://localhost:5000/api/gallery/admin/all';
      
      if (tab === 'pending') {
        url = 'http://localhost:5000/api/gallery/admin/pending';
      } else if (tab === 'flagged') {
        url = 'http://localhost:5000/api/gallery/admin/flagged';
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        setMediaItems(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load media:', response.status);
        setMediaItems([]);
      }
    } catch (error) {
      console.error('Error loading media:', error);
      toast.error('Failed to load media');
      setMediaItems([]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaUpload = async (e) => {
    e.preventDefault();
    if (!mediaForm.file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploadingMedia(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('image', mediaForm.file);
      formData.append('title', mediaForm.title);
      formData.append('description', mediaForm.description);
      formData.append('category', mediaForm.category);

      const response = await fetch('http://localhost:5000/api/gallery/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const newItem = await response.json();
        setMediaItems(prev => [newItem, ...prev]);
        toast.success('Media uploaded successfully');
        setShowUploadForm(false);
        setMediaForm({ title: "", description: "", category: "Match Photos", file: null });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to upload media');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleApproveMedia = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/gallery/admin/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item._id !== id));
        toast.success('Media approved');
        loadMediaItems(mediaTab);
      } else {
        toast.error('Failed to approve media');
      }
    } catch (error) {
      console.error('Error approving media:', error);
      toast.error('Failed to approve media');
    }
  };

  const handleRejectMedia = async (id) => {
    if (!window.confirm('Are you sure you want to reject this media?')) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/gallery/admin/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item._id !== id));
        toast.success('Media rejected');
      } else {
        toast.error('Failed to reject media');
      }
    } catch (error) {
      console.error('Error rejecting media:', error);
      toast.error('Failed to reject media');
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media? This cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/gallery/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item._id !== id));
        toast.success('Media deleted');
      } else {
        toast.error('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media');
    }
  };

  useEffect(() => {
    if (activeSection === 'media') {
      loadMediaItems(mediaTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, mediaTab]);

  // Load sponsors when section changes
  useEffect(() => {
    if (activeSection === 'sponsors') {
      loadSponsors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Load memberships when section changes
  useEffect(() => {
    if (activeSection === 'membership') {
      loadMembershipData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, membershipTab]);

  // Load finance data when section changes
  useEffect(() => {
    if (activeSection === 'finance') {
      loadFinanceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, financeTab]);

  // Load marketplace data when section changes
  useEffect(() => {
    if (activeSection === 'marketplace') {
      loadMarketplaceStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Finance functions
  const loadFinanceData = async () => {
    try {
      setFinanceLoading(true);
      const token = localStorage.getItem("token");
      
      // Load summary statistics
      const summaryResponse = await fetch('http://localhost:5000/api/financial-transactions/stats/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        setFinanceSummary(summary);
      }
      
      // Load all transactions
      const transactionsResponse = await fetch('http://localhost:5000/api/financial-transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (transactionsResponse.ok) {
        const data = await transactionsResponse.json();
        setTransactions(data.transactions || data);
      }
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast.error('Failed to load finance data');
    } finally {
      setFinanceLoading(false);
    }
  };

  // Marketplace functions
  const loadMarketplaceStats = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Load marketplace items - use admin endpoint to get ALL items including pending
      const itemsResponse = await fetch('http://localhost:5000/api/marketplace/admin/all?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (itemsResponse.ok) {
        const data = await itemsResponse.json();
        const items = data.items || data; // Handle both paginated and non-paginated responses
        
        console.log('Loaded marketplace items:', items);
        console.log('Items by status:', items.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {}));
        
        // Calculate stats
        const activeListings = items.filter(item => item.status === 'approved').length;
        // Items needing review: both pending initial approval and flagged for review
        const pendingReview = items.filter(item => 
          item.status === 'pending' || item.status === 'flagged_for_review'
        ).length;
        // Flagged items: items flagged for review or removed by flags
        const flaggedItems = items.filter(item => 
          item.status === 'flagged_for_review' || item.status === 'removed_by_flags'
        ).length;
        const soldItems = items.filter(item => item.status === 'sold').length;
        
        // Get unique sellers
        const uniqueSellers = [...new Set(items.map(item => item.sellerId || item.seller?._id).filter(Boolean))];
        const activeSellers = uniqueSellers.length;
        
        // Calculate expiring items (within 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringItems = items.filter(item => {
          if (item.expiresAt) {
            const expiryDate = new Date(item.expiresAt);
            return expiryDate <= sevenDaysFromNow && expiryDate > new Date() && item.status === 'active';
          }
          return false;
        }).length;
        
        // Calculate total revenue (if available)
        const totalRevenue = items
          .filter(item => item.status === 'sold')
          .reduce((sum, item) => sum + (item.price || 0), 0);
        
        setMarketplaceStats({
          activeListings,
          activeSellers,
          totalRevenue,
          expiringItems,
          pendingReview,
          flaggedItems,
          soldItems
        });
      }
    } catch (error) {
      console.error('Error loading marketplace stats:', error);
      // Don't show error toast for stats, just log it
    }
  };

  const resetTransactionForm = () => {
    setTransactionForm({
      type: "income",
      category: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      status: "completed",
      referenceNumber: "",
      payer: "",
      payee: "",
      notes: ""
    });
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingTransaction 
        ? `http://localhost:5000/api/financial-transactions/${editingTransaction._id}` 
        : 'http://localhost:5000/api/financial-transactions';
      
      const response = await fetch(url, {
        method: editingTransaction ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionForm)
      });
      
      if (response.ok) {
        toast.success(`Transaction ${editingTransaction ? 'updated' : 'created'} successfully`);
        resetTransactionForm();
        loadFinanceData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  };

  const handleEditTransaction = (transaction) => {
    setTransactionForm({
      type: transaction.type || "income",
      category: transaction.category || "",
      description: transaction.description || "",
      amount: transaction.amount || 0,
      date: transaction.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: transaction.paymentMethod || "cash",
      status: transaction.status || "completed",
      referenceNumber: transaction.referenceNumber || "",
      payer: transaction.payer || "",
      payee: transaction.payee || "",
      notes: transaction.notes || ""
    });
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/financial-transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Transaction deleted successfully');
        loadFinanceData();
      } else {
        toast.error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Membership functions
  const loadMembershipData = async () => {
    try {
      setMembershipsLoading(true);
      const token = localStorage.getItem("token");
      
      // Load membership stats
      const statsResponse = await fetch('http://localhost:5000/api/memberships/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setMembershipStats(stats);
      }
      
      // Load tiers
      const tiersResponse = await fetch('http://localhost:5000/api/memberships/tiers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (tiersResponse.ok) {
        const tiers = await tiersResponse.json();
        setMembershipTiers(tiers);
      }
      
      // Load all memberships
      const membershipsResponse = await fetch('http://localhost:5000/api/memberships/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (membershipsResponse.ok) {
        const data = await membershipsResponse.json();
        setMemberships(data.memberships || data);
      }
    } catch (error) {
      console.error('Error loading membership data:', error);
      toast.error('Failed to load membership data');
    } finally {
      setMembershipsLoading(false);
    }
  };

  const resetTierForm = () => {
    setTierForm({
      name: "",
      description: "",
      price: 0,
      duration: 12,
      features: [],
      discountPercentage: 0,
      isActive: true,
      color: "#3B82F6"
    });
    setEditingTier(null);
    setShowTierForm(false);
  };

  const handleTierSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingTier 
        ? `http://localhost:5000/api/memberships/tiers/${editingTier._id}` 
        : 'http://localhost:5000/api/memberships/tiers';
      
      const response = await fetch(url, {
        method: editingTier ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tierForm)
      });
      
      if (response.ok) {
        toast.success(`Tier ${editingTier ? 'updated' : 'created'} successfully`);
        resetTierForm();
        loadMembershipData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save tier');
      }
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error('Failed to save tier');
    }
  };

  const handleEditTier = (tier) => {
    setTierForm({
      name: tier.name || "",
      description: tier.description || "",
      price: tier.price || 0,
      duration: tier.duration || 12,
      features: tier.features || [],
      discountPercentage: tier.discountPercentage || 0,
      isActive: tier.isActive !== undefined ? tier.isActive : true,
      color: tier.color || "#3B82F6"
    });
    setEditingTier(tier);
    setShowTierForm(true);
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tier?')) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/memberships/tiers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Tier deleted successfully');
        loadMembershipData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete tier');
      }
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast.error('Failed to delete tier');
    }
  };

  const resetMembershipForm = () => {
    setMembershipForm({
      userId: "",
      tierId: "",
      startDate: "",
      endDate: "",
      amount: 0,
      paymentMethod: "credit_card",
      notes: ""
    });
    setEditingMembership(null);
    setShowMembershipForm(false);
  };

  const handleMembershipSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingMembership 
        ? `http://localhost:5000/api/memberships/${editingMembership._id}` 
        : 'http://localhost:5000/api/memberships';
      
      const response = await fetch(url, {
        method: editingMembership ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(membershipForm)
      });
      
      if (response.ok) {
        toast.success(`Membership ${editingMembership ? 'updated' : 'created'} successfully`);
        resetMembershipForm();
        loadMembershipData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save membership');
      }
    } catch (error) {
      console.error('Error saving membership:', error);
      toast.error('Failed to save membership');
    }
  };

  const handleEditMembership = (membership) => {
    setMembershipForm({
      userId: membership.user?._id || "",
      tierId: membership.tier?._id || "",
      startDate: membership.startDate ? membership.startDate.split('T')[0] : "",
      endDate: membership.endDate ? membership.endDate.split('T')[0] : "",
      amount: membership.amount || 0,
      paymentMethod: membership.paymentMethod || "credit_card",
      notes: membership.notes || ""
    });
    setEditingMembership(membership);
    setShowMembershipForm(true);
  };

  const handleMembershipStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/memberships/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success(`Membership ${status} successfully`);
        loadMembershipData();
      } else {
        toast.error('Failed to update membership status');
      }
    } catch (error) {
      console.error('Error updating membership status:', error);
      toast.error('Failed to update membership status');
    }
  };

  // Sponsors functions
  const loadSponsors = async () => {
    try {
      setSponsorsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5000/api/sponsors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
      } else {
        console.error('Failed to load sponsors:', response.status);
        setSponsors([]);
      }
    } catch (error) {
      console.error('Error loading sponsors:', error);
      toast.error('Failed to load sponsors');
      setSponsors([]);
    } finally {
      setSponsorsLoading(false);
    }
  };

  const resetSponsorForm = () => {
    setSponsorForm({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      tier: "Bronze",
      amount: 0,
      paymentFrequency: "Annual",
      contractStart: "",
      contractEnd: "",
      status: "Pending",
      address: "",
      benefits: "",
      notes: "",
      isVisible: true
    });
    setEditingSponsor(null);
    setShowSponsorForm(false);
  };

  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingSponsor 
        ? `http://localhost:5000/api/sponsors/${editingSponsor._id}` 
        : 'http://localhost:5000/api/sponsors';
      
      const response = await fetch(url, {
        method: editingSponsor ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sponsorForm)
      });
      
      if (response.ok) {
        toast.success(`Sponsor ${editingSponsor ? 'updated' : 'created'} successfully`);
        resetSponsorForm();
        loadSponsors();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save sponsor');
      }
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast.error('Failed to save sponsor');
    }
  };

  const handleEditSponsor = (sponsor) => {
    setSponsorForm({
      companyName: sponsor.companyName || "",
      contactPerson: sponsor.contactPerson || "",
      email: sponsor.email || "",
      phone: sponsor.phone || "",
      website: sponsor.website || "",
      tier: sponsor.tier || "Bronze",
      amount: sponsor.amount || 0,
      paymentFrequency: sponsor.paymentFrequency || "Annual",
      contractStart: sponsor.contractStart ? sponsor.contractStart.split('T')[0] : "",
      contractEnd: sponsor.contractEnd ? sponsor.contractEnd.split('T')[0] : "",
      status: sponsor.status || "Pending",
      address: sponsor.address || "",
      benefits: sponsor.benefits || "",
      notes: sponsor.notes || "",
      isVisible: sponsor.isVisible !== undefined ? sponsor.isVisible : true
    });
    setEditingSponsor(sponsor);
    setShowSponsorForm(true);
  };

  const handleDeleteSponsor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sponsor?')) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/sponsors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Sponsor deleted successfully');
        loadSponsors();
      } else {
        toast.error('Failed to delete sponsor');
      }
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Failed to delete sponsor');
    }
  };

  const sponsorStats = () => {
    const active = sponsors.filter(s => s.status === 'Active').length;
    const pending = sponsors.filter(s => s.status === 'Pending').length;
    const totalRevenue = sponsors
      .filter(s => s.status === 'Active')
      .reduce((sum, s) => sum + (s.amount || 0), 0);
    
    return { total: sponsors.length, active, pending, totalRevenue };
  };

  // Generic Management UI Renderer
  const renderManagementUI = (config) => {
    const { title, items, loading, showForm, formFields, onSubmit, onEdit, onDelete, onCancel, createButtonText } = config;
    
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (showForm) {
      return (
        <form onSubmit={onSubmit}>
          <div className="d-flex justify-content-between mb-3">
            <h5>{formFields.isEditing ? 'Edit' : 'Create'} {title}</h5>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
          <div className="row g-3">{formFields.fields}</div>
          <div className="mt-3">
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? 'Saving...' : (formFields.isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      );
    }

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>{title}</h5>
          <button className="btn btn-primary" onClick={formFields.onCreate}>
            <i className="bi bi-plus-circle me-1"></i> {createButtonText}
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>{formFields.headers}</tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={formFields.colSpan} className="text-center py-5">
                    <p className="text-muted">No {title.toLowerCase()} found</p>
                    <button className="btn btn-primary btn-sm" onClick={formFields.onCreate}>Create First {title}</button>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item._id || index}>
                    {formFields.renderRow(item)}
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => onEdit(item)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-outline-danger" onClick={() => onDelete(item._id)} title="Delete">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // Settings functions
  const updateSetting = (key, value) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    toast.success('Settings saved successfully');
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: '100vw', margin: 0, padding: 0, overflow: 'hidden' }}>
      <style>{`
        .nav-link:hover { background-color: rgba(255, 255, 255, 0.1) !important; transition: background-color 0.3s ease; }
        .nav-link { padding: 0.75rem 1rem !important; margin-bottom: 0.25rem; border-radius: 0.375rem; color: white !important; }
        .sidebar .nav-link { color: white !important; visibility: visible !important; opacity: 1 !important; }
        .sidebar .nav-link i { color: white !important; }
        .table-hover tbody tr:hover { background-color: rgba(0, 123, 255, 0.1); transition: background-color 0.3s ease; }
        .btn { transition: all 0.3s ease; }
        .card { box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); transition: box-shadow 0.15s ease-in-out; }
        .card:hover { box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); }
        .dashboard-container { display: flex; min-height: calc(100vh - 80px); margin: 0; padding: 0; position: relative; }
        .sidebar { width: 0; flex: 0 0 0; overflow: visible; background: transparent; }
        .main-content { flex: 1; padding: 1.5rem 0; margin: 0; }
        .top-navbar { background-color: #224B2B; height: 80px; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
        .top-navbar .nav-link { color: white !important; text-decoration: none; padding: 0.5rem 1rem; border-radius: 0.375rem; transition: background-color 0.3s ease; }
        .top-navbar .nav-link:hover { background-color: rgba(255, 255, 255, 0.1); }
        .donate-btn { background-color: #E8B900; color: #224B2B; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 600; }
        .donate-btn:hover { background-color: #D4A500; }
        .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #4CAF50, #2E7D32); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #E8B900; }
        .logo-icon::before { content: '⚽'; font-size: 20px; color: #E8B900; }

        @media (max-width: 768px) {
          .dashboard-container { flex-direction: column; }
          .sidebar { width: 100%; }
          .top-navbar .nav-links { display: none; }
        }
      `}</style>
      
      {/* Top Navigation Bar */}
      <nav className="top-navbar d-flex align-items-center justify-content-between px-4">
        {/* Logo and Donate Button */}
        <div className="d-flex align-items-center">
          <div className="logo-icon me-3"></div>
          <Link to="/donate" className="donate-btn me-4" style={{textDecoration: 'none'}}>Donate</Link>
        </div>

        {/* Navigation Links */}
        <div className="nav-links d-flex align-items-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/teams" className="nav-link">Teams</Link>
          <Link to="/programs" className="nav-link">Programs</Link>
          <Link to="/schedules" className="nav-link">Schedules</Link>
          <Link to="/gallery" className="nav-link">Fan & Gallery</Link>
          <Link to="/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/join/player" className="nav-link d-flex align-items-center">
            Join the Club
            <i className="bi bi-chevron-down ms-1"></i>
          </Link>
        </div>

        {/* User Actions */}
        <div className="d-flex align-items-center">
          <i className="bi bi-chat-dots text-white me-3" style={{ fontSize: '1.2rem' }}></i>
          <Link to="/account" className="nav-link me-2">My Account</Link>
          <button onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
          }} className="nav-link border-0 bg-transparent text-white" style={{cursor: 'pointer'}}>Sign Out</button>
        </div>
      </nav>

      <div className="dashboard-container" style={{ marginTop: '80px', maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="bg-primary text-white position-fixed start-0"
               style={{ top: '90px', height: 'calc(100vh - 170px)', width: '230px', overflowY: 'auto' }}>
            <div className="p-3 border-bottom border-white border-opacity-25">
              <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                <i className="bi bi-shield-check me-2"></i>Admin Dashboard
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                Seattle Leopards FC
              </div>
            </div>
            <nav className="flex-column p-3">
              {/* Overview */}
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'overview' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('overview')}
              >
                Overview
              </button>

              <hr className="text-white-50 my-3" />

              {/* Management */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('userManagement')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  MANAGEMENT
                </span>
                <i className={`bi ${collapsedSections.userManagement ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              
              {!collapsedSections.userManagement && (
                <div className="ms-3">
              <Link
                    to="/admin/users"
                    className="nav-link text-white text-start border-0"
              >
                    All Users
              </Link>
              <Link
                to="/admin/coaches"
                className="nav-link text-white text-start border-0"
              >
                    Coaches
              </Link>
              <Link
                to="/admin/parents"
                className="nav-link text-white text-start border-0"
              >
                    Parents
              </Link>
              <Link
                to="/admin/volunteers"
                className="nav-link text-white text-start border-0"
              >
                    Volunteers
              </Link>
              <Link
                to="/admin/user-roles"
                className="nav-link text-white text-start border-0"
              >
                    User Roles
              </Link>
              <Link
                to="/admin/users"
                className="nav-link text-white text-start border-0"
              >
                    Permissions
              </Link>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'content' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('content')}
              >
                    Content Management
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'club-info' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('club-info')}
              >
                    Club Information
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'policies' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('policies')}
              >
                    Policies
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'documents' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('documents')}
              >
                    Documents
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'applications' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('applications')}
              >
                    Applications
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'forms' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('forms')}
              >
                    Forms
              </button>
                </div>
              )}

              <hr className="text-white-50 my-3" />

              {/* Programs */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('programs')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  PROGRAMS
                </span>
                <i className={`bi ${collapsedSections.programs ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              {!collapsedSections.programs && (
                <div className="ms-3">
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'teams' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('teams')}
              >
                    Teams
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'matches' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('matches')}
              >
                    Matches
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'training' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('training')}
              >
                    Training
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'events' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('events')}
              >
                    Events
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'scheduling' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('scheduling')}
              >
                    Scheduling
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'standings' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('standings')}
              >
                    Standings
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'statistics' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('statistics')}
              >
                    Statistics
              </button>
                </div>
              )}

              <hr className="text-white-50 my-3" />

              {/* Facilities & Resources */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('facilities')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  RESOURCES
                </span>
                <i className={`bi ${collapsedSections.facilities ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              {!collapsedSections.facilities && (
                <div className="ms-3">
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'media' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('media')}
              >
                    Media Library
              </button>
                </div>
              )}

              <hr className="text-white-50 my-3" />

              {/* Business & Finance */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('businessFinance')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  FINANCE
                </span>
                <i className={`bi ${collapsedSections.businessFinance ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              {!collapsedSections.businessFinance && (
                <div className="ms-3">
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'sponsors' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('sponsors')}
              >
                    Sponsors
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'finance' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('finance')}
              >
                    Finance
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'membership' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('membership')}
              >
                    Membership
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'marketplace' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('marketplace')}
              >
                    Marketplace
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'payments' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('payments')}
              >
                    Payments
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'invoicing' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('invoicing')}
              >
                    Invoicing
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'inventory' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('inventory')}
              >
                    Inventory
              </button>
                </div>
              )}

              <hr className="text-white-50 my-3" />

              {/* Communications */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('communications')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  COMMUNICATIONS
                </span>
                <i className={`bi ${collapsedSections.communications ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              {!collapsedSections.communications && (
                <div className="ms-3">
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'communications' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('communications')}
              >
                    Communications
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'fans-gallery' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('fans-gallery')}
              >
                    Fans & Gallery
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'newsletter' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('newsletter')}
              >
                    Newsletter
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'social-media' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('social-media')}
              >
                    Social Media
              </button>
                </div>
              )}

              <hr className="text-white-50 my-3" />

              {/* Legal & Compliance */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('legalCompliance')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  COMPLIANCE
                </span>
                <i className={`bi ${collapsedSections.legalCompliance ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              {!collapsedSections.legalCompliance && (
                <div className="ms-3">
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'waivers' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('waivers')}
              >
                    Waivers
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'insurance' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('insurance')}
              >
                    Insurance
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'compliance' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('compliance')}
              >
                    Compliance
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'legal-docs' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('legal-docs')}
              >
                    Legal Documents
              </button>
                </div>
              )}

              <hr className="text-white-50 my-3" />

              {/* System & Technical */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('systemTechnical')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  SYSTEM
                </span>
                <i className={`bi ${collapsedSections.systemTechnical ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              {!collapsedSections.systemTechnical && (
                <div className="ms-3">
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'system' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('system')}
              >
                    System
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'settings' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('settings')}
              >
                    Settings
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'security' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('security')}
              >
                    Security
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'api' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('api')}
              >
                    API Management
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'integrations' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('integrations')}
              >
                    Integrations
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'backup' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('backup')}
              >
                    Backup & Restore
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'logs' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('logs')}
              >
                    System Logs
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'maintenance' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('maintenance')}
              >
                    Maintenance
              </button>
                </div>
              )}

              <hr className="text-white-50 my-3" />

              {/* Support */}
              <button
                className="nav-link text-white text-start border-0 d-flex justify-content-between align-items-center fw-bold"
                onClick={() => toggleCollapsedSection('support')}
                style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}
              >
                <span>
                  SUPPORT
                </span>
                <i className={`bi ${collapsedSections.support ? 'bi-chevron-right' : 'bi-chevron-down'}`}></i>
              </button>
              {!collapsedSections.support && (
                <div className="ms-3">
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'help' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('help')}
              >
                    Help & Support
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'documentation' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('documentation')}
              >
                    Documentation
              </button>
              <button
                className={`nav-link text-white text-start border-0 ${activeSection === 'contact-support' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('contact-support')}
              >
                    Contact Support
              </button>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content" style={{maxWidth: 'calc(100vw - 230px)', overflowX: 'hidden', width: '100%', padding: 0, margin: 0}}>
            {activeSection !== 'payments' && activeSection !== 'marketplace' && (
              <h2 className="mb-4">
              {activeSection === 'overview' && 'Overview Dashboard'}
              {activeSection === 'settings' && 'Settings'}
              {activeSection === 'content' && 'Content Management'}
              {activeSection === 'analytics' && 'Analytics Dashboard'}
              {activeSection === 'system' && 'System Management'}
              {activeSection === 'security' && 'Security Center'}
              {activeSection === 'teams' && 'Team Management'}
              {activeSection === 'events' && 'Event Management'}
              {activeSection === 'media' && 'Media Library'}
              {activeSection === 'fans-gallery' && 'Fans & Gallery Management'}
              {activeSection === 'communications' && 'Communications Center'}
              {activeSection === 'reports' && 'Reports & Analytics'}
              {activeSection === 'marketplace' && 'Marketplace Management'}
              {activeSection === 'applications' && 'Application Management'}
              {activeSection === 'backup' && 'Backup & Restore'}
              {activeSection === 'logs' && 'System Logs'}
              {activeSection === 'scheduling' && 'Scheduling & Calendar'}
              {activeSection === 'standings' && 'League Standings'}
              {activeSection === 'statistics' && 'Statistics & Analytics'}
              {activeSection === 'players' && 'Player Management'}
              {activeSection === 'coaches' && 'Coach Management'}
              {activeSection === 'parents' && 'Parent Management'}
              {activeSection === 'matches' && 'Match Management'}
              {activeSection === 'training' && 'Training Programs'}
              {activeSection === 'facilities' && 'Facility Management'}
              {activeSection === 'volunteers' && 'Volunteer Management'}
              {activeSection === 'sponsors' && 'Sponsor Management'}
              {activeSection === 'membership' && 'Membership Management'}
              {activeSection === 'finance' && 'Finance Management'}
              {activeSection === 'payments' && 'Payment Management'}
              {activeSection === 'invoicing' && 'Invoicing System'}
              {activeSection === 'inventory' && 'Inventory Management'}
              {activeSection === 'waivers' && 'Waiver Management'}
              {activeSection === 'insurance' && 'Insurance Management'}
              {activeSection === 'compliance' && 'Compliance Center'}
              {activeSection === 'api' && 'API Management'}
              {activeSection === 'integrations' && 'Integrations Center'}
              {activeSection === 'help' && 'Help & Support'}
              </h2>
            )}

            {activeSection === 'overview' && (
              <div style={{padding: '0 20px'}}>
                {/* Welcome Header */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h2 className="mb-2">Welcome to Seattle Leopards FC Admin</h2>
                            <p className="mb-0">Manage your soccer club with comprehensive tools and real-time insights</p>
                          </div>
                          <div className="col-md-4 text-end">
                            <div className="d-flex flex-column">
                              <small>Last updated: {new Date().toLocaleString()}</small>
                              <div className="mt-2">
                                <span className="badge bg-success me-2">
                                  <i className="bi bi-check-circle me-1"></i>System Online
                                </span>
                                <span className="badge bg-info">
                                  <i className="bi bi-people me-1"></i>{overviewStats.activeUsers} Active Users
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Site Overview */}

                {/* Essential Site Metrics */}
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-primary h-100">
                      <div className="card-body text-center p-3">
                        <i className="bi bi-people-fill text-primary mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <h2 className="text-primary mb-2">{overviewStats.totalUsers}</h2>
                        <h6 className="card-text mb-1">Total Members</h6>
                        <small className="text-muted">{overviewStats.activeUsers} active users</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-warning h-100">
                      <div className="card-body text-center p-3">
                        <i className="bi bi-file-earmark-text-fill text-warning mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <h2 className="text-warning mb-2">{overviewStats.pendingApprovals}</h2>
                        <h6 className="card-text mb-1">Pending Applications</h6>
                        <small className="text-muted">Requires attention</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-info h-100">
                      <div className="card-body text-center p-3">
                        <i className="bi bi-shop text-info mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <h2 className="text-info mb-2">{overviewStats.marketplaceItems || 0}</h2>
                        <h6 className="card-text mb-1">Marketplace Items</h6>
                        <small className="text-muted">Total listings</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card border-success h-100">
                      <div className="card-body text-center p-3">
                        <i className="bi bi-calendar-event-fill text-success mb-3" style={{ fontSize: '2.5rem' }}></i>
                        <h2 className="text-success mb-2">{overviewStats.upcomingEvents}</h2>
                        <h6 className="card-text mb-1">Upcoming Events</h6>
                        <small className="text-muted">This month</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Essential Quick Actions */}
                <div className="row mb-4">
                  <div className="col-lg-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">
                          <i className="bi bi-lightning text-warning me-2"></i>Quick Actions
                        </h5>
                        </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-lg-3 col-md-6">
                            <Link to="/admin/applications" className="btn btn-warning w-100 p-3">
                              <i className="bi bi-file-earmark-text me-2"></i>
                              <div>Review Applications</div>
                              <small className="d-block">{overviewStats.pendingApprovals} pending</small>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-md-6">
                            <Link to="/admin/marketplace-moderation" className="btn btn-danger w-100 p-3">
                              <i className="bi bi-shield-check me-2"></i>
                              <div>Moderate Marketplace</div>
                              <small className="d-block">Approve items</small>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-md-6">
                            <Link to="/admin/schedules" className="btn btn-success w-100 p-3">
                              <i className="bi bi-calendar-plus me-2"></i>
                              <div>Manage Events</div>
                              <small className="d-block">{overviewStats.upcomingEvents} upcoming</small>
                            </Link>
                          </div>
                          <div className="col-lg-3 col-md-6">
                            <Link to="/admin/users" className="btn btn-primary w-100 p-3">
                              <i className="bi bi-people me-2"></i>
                              <div>Manage Users</div>
                              <small className="d-block">{overviewStats.totalUsers} total</small>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity & Alerts */}
                <div className="row mb-4">
                  <div className="col-lg-8">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-clock-history me-2"></i>Recent Activity
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                          {recentActivity.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="list-group-item d-flex align-items-center px-0 py-2">
                              <div className="me-3">
                                {activity.type === 'user_registration' && <i className="bi bi-person-plus-fill text-success"></i>}
                                {activity.type === 'application' && <i className="bi bi-file-earmark-text-fill text-warning"></i>}
                                {activity.type === 'event' && <i className="bi bi-calendar-event-fill text-info"></i>}
                                {activity.type === 'payment' && <i className="bi bi-credit-card-fill text-success"></i>}
                                {activity.type === 'broadcast' && <i className="bi bi-megaphone-fill text-primary"></i>}
                                {activity.type === 'gallery' && <i className="bi bi-camera-fill text-secondary"></i>}
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="mb-1" style={{ fontSize: '0.9rem' }}><strong>{activity.user}</strong> {activity.action}</div>
                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{activity.time}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-exclamation-triangle me-2"></i>Alerts
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-grid gap-2">
                          {overviewStats.pendingApprovals > 0 && (
                            <div className="alert alert-warning d-flex align-items-center mb-0 py-2">
                              <i className="bi bi-exclamation-triangle me-2"></i>
                              <div className="mb-0"><strong>{overviewStats.pendingApprovals} pending applications</strong></div>
                            </div>
                          )}
                          <div className="alert alert-info d-flex align-items-center mb-0 py-2">
                            <i className="bi bi-info-circle me-2"></i>
                            <div className="mb-0"><strong>System operational</strong></div>
                          </div>
                          {overviewStats.upcomingEvents > 0 && (
                            <div className="alert alert-success d-flex align-items-center mb-0 py-2">
                              <i className="bi bi-calendar me-2"></i>
                              <div className="mb-0"><strong>{overviewStats.upcomingEvents} upcoming events</strong></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div>
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 shadow-lg">
                      <div className="card-header bg-gradient-primary text-white position-relative overflow-hidden">
                        <div className="position-absolute top-0 end-0 opacity-10">
                          <i className="bi bi-gear-fill" style={{fontSize: '8rem'}}></i>
                        </div>
                        <div className="d-flex align-items-center justify-content-between position-relative">
                          <div className="d-flex align-items-center">
                            <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                              <i className="bi bi-gear-fill fs-2"></i>
                            </div>
                            <div>
                              <h3 className="mb-1 fw-bold">⚙️ Enterprise Settings Configuration Hub</h3>
                              <p className="mb-0 opacity-90">Advanced control center for comprehensive settings management, automation, and optimization</p>
                              <div className="d-flex gap-3 mt-2">
                                <small className="badge bg-success bg-opacity-75">
                                  <i className="bi bi-shield-check me-1"></i>Secure
                                </small>
                                <small className="badge bg-info bg-opacity-75">
                                  <i className="bi bi-lightning me-1"></i>Fast
                                </small>
                                <small className="badge bg-warning bg-opacity-75">
                                  <i className="bi bi-graph-up me-1"></i>Optimized
                                </small>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex flex-column gap-2">
                            <div className="d-flex gap-2">
                              <button className="btn btn-light btn-sm">
                                <i className="bi bi-download me-1"></i>Export All
                              </button>
                              <button className="btn btn-light btn-sm">
                                <i className="bi bi-upload me-1"></i>Import Config
                              </button>
                              <button className="btn btn-light btn-sm">
                                <i className="bi bi-cloud-upload me-1"></i>Backup
                              </button>
                            </div>
                            <div className="d-flex gap-2">
                              <button className="btn btn-warning btn-sm">
                                <i className="bi bi-arrow-clockwise me-1"></i>Reset
                              </button>
                              <button className="btn btn-success btn-sm">
                                <i className="bi bi-check-circle me-1"></i>Save All
                              </button>
                              <button className="btn btn-info btn-sm">
                                <i className="bi bi-eye me-1"></i>Preview
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings Overview Dashboard */}
                <div className="row mb-4">
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card border-success h-100 shadow-sm">
                      <div className="card-body text-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-check-circle-fill text-success fs-3"></i>
                        </div>
                        <h6 className="card-title fw-bold">Active Settings</h6>
                        <h3 className="text-success mb-1">24</h3>
                        <small className="text-muted">Configured</small>
                        <div className="progress mt-2" style={{height: '4px'}}>
                          <div className="progress-bar bg-success" style={{width: '85%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card border-warning h-100 shadow-sm">
                      <div className="card-body text-center">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-exclamation-triangle-fill text-warning fs-3"></i>
                        </div>
                        <h6 className="card-title fw-bold">Pending</h6>
                        <h3 className="text-warning mb-1">3</h3>
                        <small className="text-muted">Awaiting save</small>
                        <div className="progress mt-2" style={{height: '4px'}}>
                          <div className="progress-bar bg-warning" style={{width: '15%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card border-info h-100 shadow-sm">
                      <div className="card-body text-center">
                        <div className="bg-info bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-clock-fill text-info fs-3"></i>
                        </div>
                        <h6 className="card-title fw-bold">Last Update</h6>
                        <h6 className="text-info mb-1">2h ago</h6>
                        <small className="text-muted">Auto-saved</small>
                        <div className="progress mt-2" style={{height: '4px'}}>
                          <div className="progress-bar bg-info" style={{width: '100%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card border-primary h-100 shadow-sm">
                      <div className="card-body text-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-shield-check-fill text-primary fs-3"></i>
                        </div>
                        <h6 className="card-title fw-bold">Security</h6>
                        <h6 className="text-primary mb-1">High</h6>
                        <small className="text-muted">All enabled</small>
                        <div className="progress mt-2" style={{height: '4px'}}>
                          <div className="progress-bar bg-primary" style={{width: '95%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card border-secondary h-100 shadow-sm">
                      <div className="card-body text-center">
                        <div className="bg-secondary bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-speedometer2 text-secondary fs-3"></i>
                        </div>
                        <h6 className="card-title fw-bold">Performance</h6>
                        <h6 className="text-secondary mb-1">98%</h6>
                        <small className="text-muted">Optimized</small>
                        <div className="progress mt-2" style={{height: '4px'}}>
                          <div className="progress-bar bg-secondary" style={{width: '98%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                    <div className="card border-dark h-100 shadow-sm">
                      <div className="card-body text-center">
                        <div className="bg-dark bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style={{width: '60px', height: '60px'}}>
                          <i className="bi bi-graph-up text-dark fs-3"></i>
                        </div>
                        <h6 className="card-title fw-bold">Uptime</h6>
                        <h6 className="text-dark mb-1">99.9%</h6>
                        <small className="text-muted">Last 30 days</small>
                        <div className="progress mt-2" style={{height: '4px'}}>
                          <div className="progress-bar bg-dark" style={{width: '99.9%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comprehensive Settings Navigation */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">
                          <i className="bi bi-lightning me-2"></i>Comprehensive Settings Control Center
                        </h5>
                      </div>
                      <div className="card-body">
                        {/* Core Site Settings */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-gear me-2"></i>Core Site Settings
                            </h6>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'club' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => window.location.href = '/admin/club'}>
                              <i className="bi bi-building me-1"></i>Club Info
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'contact' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => window.location.href = '/admin/contact'}>
                              <i className="bi bi-telephone me-1"></i>Contact
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'social' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => window.location.href = '/admin/social'}>
                              <i className="bi bi-share me-1"></i>Social & SEO
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'branding' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => window.location.href = '/admin/branding'}>
                              <i className="bi bi-palette me-1"></i>Branding
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'content' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => window.location.href = '/admin/content'}>
                              <i className="bi bi-file-text me-1"></i>Content
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'navigation' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => window.location.href = '/admin/navigation'}>
                              <i className="bi bi-list me-1"></i>Navigation
                            </button>
                          </div>
                        </div>

                        {/* System & Technical Settings */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-cpu me-2"></i>System & Technical
                            </h6>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'features' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => window.location.href = '/admin/features'}>
                              <i className="bi bi-toggle-on me-1"></i>Features
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'security' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => window.location.href = '/admin/security'}>
                              <i className="bi bi-shield-lock me-1"></i>Security
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'performance' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => window.location.href = '/admin/performance'}>
                              <i className="bi bi-speedometer2 me-1"></i>Performance
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'integrations' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => window.location.href = '/admin/integrations'}>
                              <i className="bi bi-plug me-1"></i>Integrations
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'advanced' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveSubSection('advanced')}>
                              <i className="bi bi-gear-wide-connected me-1"></i>Advanced
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'database' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setActiveSubSection('database')}>
                              <i className="bi bi-database me-1"></i>Database
                            </button>
                          </div>
                        </div>

                        {/* User & Access Management */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-people me-2"></i>User & Access Management
                            </h6>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'users' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveSubSection('users')}>
                              <i className="bi bi-person me-1"></i>Users
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'roles' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => setActiveSubSection('roles')}>
                              <i className="bi bi-person-badge me-1"></i>Roles
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'permissions' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setActiveSubSection('permissions')}>
                              <i className="bi bi-key me-1"></i>Permissions
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'authentication' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveSubSection('authentication')}>
                              <i className="bi bi-shield-check me-1"></i>Auth
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'sessions' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setActiveSubSection('sessions')}>
                              <i className="bi bi-clock me-1"></i>Sessions
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'audit' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveSubSection('audit')}>
                              <i className="bi bi-clipboard-check me-1"></i>Audit Log
                            </button>
                          </div>
                        </div>

                        {/* Communication & Notifications */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-chat-dots me-2"></i>Communication & Notifications
                            </h6>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'email' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveSubSection('email')}>
                              <i className="bi bi-envelope me-1"></i>Email
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'notifications' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => setActiveSubSection('notifications')}>
                              <i className="bi bi-bell me-1"></i>Notifications
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'sms' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setActiveSubSection('sms')}>
                              <i className="bi bi-phone me-1"></i>SMS
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'templates' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setActiveSubSection('templates')}>
                              <i className="bi bi-file-earmark-text me-1"></i>Templates
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'broadcasts' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveSubSection('broadcasts')}>
                              <i className="bi bi-broadcast me-1"></i>Broadcasts
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'chat' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveSubSection('chat')}>
                              <i className="bi bi-chat me-1"></i>Chat
                            </button>
                          </div>
                        </div>

                        {/* Business & Operations */}
                        <div className="row mb-3">
                          <div className="col-12">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-briefcase me-2"></i>Business & Operations
                            </h6>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'payments' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveSubSection('payments')}>
                              <i className="bi bi-credit-card me-1"></i>Payments
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'subscriptions' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveSubSection('subscriptions')}>
                              <i className="bi bi-arrow-repeat me-1"></i>Subscriptions
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'invoicing' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => setActiveSubSection('invoicing')}>
                              <i className="bi bi-receipt me-1"></i>Invoicing
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'reports' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => setActiveSubSection('reports')}>
                              <i className="bi bi-graph-up me-1"></i>Reports
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'analytics' ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setActiveSubSection('analytics')}>
                              <i className="bi bi-bar-chart me-1"></i>Analytics
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className={`btn w-100 ${activeSubSection === 'backup' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveSubSection('backup')}>
                              <i className="bi bi-cloud-upload me-1"></i>Backup
                            </button>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="row">
                          <div className="col-12">
                            <h6 className="text-muted mb-3">
                              <i className="bi bi-lightning me-2"></i>Quick Actions
                            </h6>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className="btn btn-outline-warning w-100">
                              <i className="bi bi-download me-1"></i>Export All
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className="btn btn-outline-secondary w-100">
                              <i className="bi bi-upload me-1"></i>Import Settings
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className="btn btn-outline-success w-100">
                              <i className="bi bi-save me-1"></i>Save All
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className="btn btn-outline-danger w-100">
                              <i className="bi bi-arrow-clockwise me-1"></i>Reset All
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className="btn btn-outline-info w-100">
                              <i className="bi bi-eye me-1"></i>Preview
                            </button>
                          </div>
                          <div className="col-lg-2 col-md-3 col-sm-4 col-6 mb-2">
                            <button className="btn btn-outline-primary w-100">
                              <i className="bi bi-question-circle me-1"></i>Help
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Club Information Tab */}
                {activeSubSection === 'club' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-building me-2"></i>Club Information</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Club Name</label>
                            <input type="text" className="form-control" defaultValue="Seattle Leopards FC" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Club Tagline</label>
                            <input type="text" className="form-control" defaultValue="Building Champions, Building Community" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Club Description</label>
                            <textarea className="form-control" rows="3" defaultValue="Seattle Leopards FC is a premier youth soccer club dedicated to developing skilled players and fostering a love for the beautiful game."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Founded Year</label>
                            <input type="text" className="form-control" defaultValue="2020" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Club Mission</label>
                            <textarea className="form-control" rows="2" defaultValue="To provide exceptional soccer training and development opportunities for youth players in the Seattle area."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Club Vision</label>
                            <textarea className="form-control" rows="2" defaultValue="To be the leading youth soccer development program in the Pacific Northwest."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Club Values</label>
                            <input type="text" className="form-control" defaultValue="Excellence, Integrity, Teamwork, Respect, Growth" />
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Club Information
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-info-circle me-2"></i>Current Club Settings</h5>
                        </div>
                        <div className="card-body">
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <td><strong>Club Name:</strong></td>
                                <td>Seattle Leopards FC</td>
                              </tr>
                              <tr>
                                <td><strong>Founded:</strong></td>
                                <td>2020</td>
                              </tr>
                              <tr>
                                <td><strong>Status:</strong></td>
                                <td><span className="badge bg-success">Active</span></td>
                              </tr>
                              <tr>
                                <td><strong>Members:</strong></td>
                                <td>150+ Players</td>
                              </tr>
                              <tr>
                                <td><strong>Teams:</strong></td>
                                <td>12 Active Teams</td>
                              </tr>
                              <tr>
                                <td><strong>Coaches:</strong></td>
                                <td>8 Certified Coaches</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Details Tab */}
                {activeSubSection === 'contact' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-telephone me-2"></i>Contact Information</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Contact Email</label>
                            <input type="email" className="form-control" defaultValue="info@seattleleopardsfc.com" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Contact Phone</label>
                            <input type="tel" className="form-control" defaultValue="(206) 555-0123" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input type="text" className="form-control" defaultValue="123 Soccer Way" />
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">City</label>
                                <input type="text" className="form-control" defaultValue="Seattle" />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-3">
                                <label className="form-label">State</label>
                                <input type="text" className="form-control" defaultValue="WA" />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-3">
                                <label className="form-label">ZIP</label>
                                <input type="text" className="form-control" defaultValue="98101" />
                              </div>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Office Hours</label>
                            <input type="text" className="form-control" defaultValue="Monday-Friday: 9:00 AM - 5:00 PM" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Emergency Contact</label>
                            <input type="tel" className="form-control" defaultValue="(206) 555-9999" />
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Contact Information
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-envelope me-2"></i>Email Configuration</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Admin Email</label>
                            <input type="email" className="form-control" defaultValue="admin@seattleleopardsfc.com" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Support Email</label>
                            <input type="email" className="form-control" defaultValue="support@seattleleopardsfc.com" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">No-Reply Email</label>
                            <input type="email" className="form-control" defaultValue="noreply@seattleleopardsfc.com" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Email Provider</label>
                            <select className="form-select">
                              <option value="gmail">Gmail</option>
                              <option value="outlook">Outlook</option>
                              <option value="custom">Custom SMTP</option>
                            </select>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Email Notifications</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Email Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Media Tab */}
                {activeSubSection === 'social' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-share me-2"></i>Social Media Links</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label"><i className="bi bi-facebook text-primary me-2"></i>Facebook URL</label>
                            <input type="url" className="form-control" defaultValue="https://facebook.com/seattleleopardsfc" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label"><i className="bi bi-instagram text-danger me-2"></i>Instagram URL</label>
                            <input type="url" className="form-control" defaultValue="https://instagram.com/seattleleopardsfc" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label"><i className="bi bi-twitter text-info me-2"></i>Twitter URL</label>
                            <input type="url" className="form-control" defaultValue="https://twitter.com/seattleleopardsfc" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label"><i className="bi bi-youtube text-danger me-2"></i>YouTube URL</label>
                            <input type="url" className="form-control" defaultValue="https://youtube.com/seattleleopardsfc" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label"><i className="bi bi-linkedin text-primary me-2"></i>LinkedIn URL</label>
                            <input type="url" className="form-control" defaultValue="https://linkedin.com/company/seattleleopardsfc" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label"><i className="bi bi-tiktok text-dark me-2"></i>TikTok URL</label>
                            <input type="url" className="form-control" placeholder="Enter TikTok URL" />
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Social Media Links
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-globe me-2"></i>Website Settings</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Site Title</label>
                            <input type="text" className="form-control" defaultValue="Seattle Leopards FC - Premier Youth Soccer Club" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Site Description</label>
                            <textarea className="form-control" rows="2" defaultValue="Join Seattle Leopards FC for premier youth soccer training and development in the Seattle area."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Site Keywords</label>
                            <input type="text" className="form-control" defaultValue="youth soccer, seattle, soccer club, soccer training, youth sports" />
                          </div>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Language</label>
                                <select className="form-select">
                                  <option value="en">English</option>
                                  <option value="es">Spanish</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">Timezone</label>
                                <select className="form-select">
                                  <option value="America/Los_Angeles">Pacific Time</option>
                                  <option value="America/New_York">Eastern Time</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Website Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* Features & Settings Tab */}
                {activeSubSection === 'features' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-toggle-on me-2"></i>Feature Toggles</h5>
                        </div>
                        <div className="card-body">
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable User Registration</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Donations</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Newsletter</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Contact Form</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Program Search</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Blog</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Events</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Gallery</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Testimonials</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Team Roster</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Schedule</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Standings</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Live Scores</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Online Store</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Member Portal</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Coach Portal</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Advertisements</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Feature Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-shield-check me-2"></i>Security & Privacy</h5>
                        </div>
                        <div className="card-body">
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Two-Factor Authentication</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Require Email Verification</label>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Session Timeout (hours)</label>
                            <input type="number" className="form-control" defaultValue="24" min="1" max="168" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Max Login Attempts</label>
                            <input type="number" className="form-control" defaultValue="5" min="3" max="10" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Password Minimum Length</label>
                            <input type="number" className="form-control" defaultValue="8" min="6" max="20" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Require Strong Password</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable CSRF Protection</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Rate Limiting</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Content Security Policy</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Security Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security & Privacy Tab */}
                {activeSubSection === 'security' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-shield-lock me-2"></i>Performance & Caching</h5>
                        </div>
                        <div className="card-body">
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Caching</label>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Cache Duration (seconds)</label>
                            <input type="number" className="form-control" defaultValue="3600" min="300" max="86400" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Image Optimization</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Gzip Compression</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable CDN</label>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">CDN URL</label>
                            <input type="url" className="form-control" placeholder="Enter CDN URL" />
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Performance Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-file-text me-2"></i>Legal & Compliance</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Privacy Policy</label>
                            <textarea className="form-control" rows="3" defaultValue="Your privacy is important to us. We collect and use your information to provide our services and improve your experience."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Terms of Service</label>
                            <textarea className="form-control" rows="3" defaultValue="By using our services, you agree to our terms and conditions."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Cookie Policy</label>
                            <textarea className="form-control" rows="3" defaultValue="We use cookies to enhance your browsing experience and analyze site traffic."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Google Analytics ID</label>
                            <input type="text" className="form-control" placeholder="Enter Google Analytics ID" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Facebook Pixel ID</label>
                            <input type="text" className="form-control" placeholder="Enter Facebook Pixel ID" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Google Tag Manager ID</label>
                            <input type="text" className="form-control" placeholder="Enter Google Tag Manager ID" />
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Legal Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance & Analytics Tab */}
                {activeSubSection === 'performance' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-speedometer2 me-2"></i>Performance Optimization</h5>
                        </div>
                        <div className="card-body">
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Advanced Caching</label>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Cache Duration (seconds)</label>
                            <input type="number" className="form-control" defaultValue="3600" min="300" max="86400" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Image Optimization</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Gzip Compression</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable CDN</label>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">CDN URL</label>
                            <input type="url" className="form-control" placeholder="Enter CDN URL" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Lazy Loading</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Minification</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Performance Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-graph-up me-2"></i>Analytics & Monitoring</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Google Analytics ID</label>
                            <input type="text" className="form-control" placeholder="Enter Google Analytics ID" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Google Tag Manager ID</label>
                            <input type="text" className="form-control" placeholder="Enter Google Tag Manager ID" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Facebook Pixel ID</label>
                            <input type="text" className="form-control" placeholder="Enter Facebook Pixel ID" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Bing Webmaster Tools</label>
                            <input type="text" className="form-control" placeholder="Enter Bing Webmaster Tools ID" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Yandex Metrika</label>
                            <input type="text" className="form-control" placeholder="Enter Yandex Metrika ID" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Real-time Analytics</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Performance Monitoring</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Analytics Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Integrations & APIs Tab */}
                {activeSubSection === 'integrations' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-credit-card me-2"></i>Payment Integrations</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Stripe Publishable Key</label>
                            <input type="text" className="form-control" placeholder="Enter Stripe Publishable Key" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Stripe Secret Key</label>
                            <input type="password" className="form-control" placeholder="Enter Stripe Secret Key" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">PayPal Client ID</label>
                            <input type="text" className="form-control" placeholder="Enter PayPal Client ID" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">PayPal Secret</label>
                            <input type="password" className="form-control" placeholder="Enter PayPal Secret" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Stripe Payments</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable PayPal Payments</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Payment Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-envelope me-2"></i>Communication APIs</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">SMS API Key</label>
                            <input type="password" className="form-control" placeholder="Enter SMS API Key" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">SMS Provider</label>
                            <select className="form-select">
                              <option value="twilio">Twilio</option>
                              <option value="aws">AWS SNS</option>
                              <option value="sendgrid">SendGrid</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Email Service Provider</label>
                            <select className="form-select">
                              <option value="gmail">Gmail SMTP</option>
                              <option value="sendgrid">SendGrid</option>
                              <option value="mailgun">Mailgun</option>
                              <option value="aws">AWS SES</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Email API Key</label>
                            <input type="password" className="form-control" placeholder="Enter Email API Key" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable SMS Notifications</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Push Notifications</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Communication Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeSubSection === 'advanced' && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-gear-wide-connected me-2"></i>Advanced Configuration</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Database Connection String</label>
                            <input type="password" className="form-control" placeholder="Enter database connection string" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">API Rate Limiting</label>
                            <select className="form-select">
                              <option value="low">Low (1000 requests/hour)</option>
                              <option value="medium" selected>Medium (5000 requests/hour)</option>
                              <option value="high">High (10000 requests/hour)</option>
                              <option value="unlimited">Unlimited</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Session Timeout (minutes)</label>
                            <input type="number" className="form-control" defaultValue="30" min="5" max="480" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Log Level</label>
                            <select className="form-select">
                              <option value="error">Error Only</option>
                              <option value="warn">Warning & Error</option>
                              <option value="info" selected>Info, Warning & Error</option>
                              <option value="debug">Debug (All)</option>
                            </select>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Debug Mode</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Maintenance Mode</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable API Documentation</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Advanced Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-tools me-2"></i>Developer Tools</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Environment</label>
                            <select className="form-select">
                              <option value="development">Development</option>
                              <option value="staging">Staging</option>
                              <option value="production" selected>Production</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Cache Strategy</label>
                            <select className="form-select">
                              <option value="memory">Memory Cache</option>
                              <option value="redis" selected>Redis Cache</option>
                              <option value="database">Database Cache</option>
                              <option value="none">No Cache</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Queue System</label>
                            <select className="form-select">
                              <option value="sync">Synchronous</option>
                              <option value="async" selected>Asynchronous</option>
                              <option value="priority">Priority Queue</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Error Reporting</label>
                            <select className="form-select">
                              <option value="none">None</option>
                              <option value="email">Email</option>
                              <option value="slack">Slack</option>
                              <option value="sentry" selected>Sentry</option>
                            </select>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Hot Reload</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Profiling</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Metrics Collection</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Developer Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Management Tab */}
                {activeSubSection === 'content' && (
                  <div className="row">
                    {/* Content Management Overview - No Redirects */}
                    <div className="col-12 mb-4">
                      <div className="card">
                        <div className="card-header bg-gradient-dark text-white">
                          <h5 className="mb-0"><i className="bi bi-file-text me-2"></i>Content Management - All in One Place</h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Manage all your content right here!</strong> No need to navigate to separate pages. All content management features are available below in organized sections.
                          </div>
                          
                          <div className="row g-3">
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <div className="card border-primary">
                                <div className="card-body text-center">
                                  <i className="bi bi-info-circle-fill text-primary" style={{fontSize: '2.5rem'}}></i>
                                  <h5 className="mt-3 mb-2 text-primary">About Page</h5>
                                  <p className="text-muted small mb-0">Scroll down to edit About page content</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <div className="card border-success">
                                <div className="card-body text-center">
                                  <i className="bi bi-house-fill text-success" style={{fontSize: '2.5rem'}}></i>
                                  <h5 className="mt-3 mb-2 text-success">Homepage Content</h5>
                                  <p className="text-muted small mb-0">Edit homepage sections below</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <div className="card border-info">
                                <div className="card-body text-center">
                                  <i className="bi bi-newspaper text-info" style={{fontSize: '2.5rem'}}></i>
                                  <h5 className="mt-3 mb-2 text-info">News & Updates</h5>
                                  <p className="text-muted small mb-0">Manage news articles below</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <div className="card border-warning">
                                <div className="card-body text-center">
                                  <i className="bi bi-images text-warning" style={{fontSize: '2.5rem'}}></i>
                                  <h5 className="mt-3 mb-2 text-warning">Gallery</h5>
                                  <p className="text-muted small mb-0">Manage gallery images below</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Frontpage Content Management */}
                    <div className="col-12 mb-4">
                      <div className="card">
                        <div className="card-header bg-gradient-primary text-white">
                          <h5 className="mb-0"><i className="bi bi-house me-2"></i>Frontpage Content Management</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3">
                              <div className="card border-primary">
                                <div className="card-header bg-primary text-white">
                                  <h6 className="mb-0"><i className="bi bi-info-circle me-1"></i>About Section</h6>
                                </div>
                                <div className="card-body">
                                  <div className="mb-3">
                                    <label className="form-label">Section Title</label>
                                    <input type="text" className="form-control" defaultValue="About Seattle Leopards FC" />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-control" rows="3" defaultValue="We are more than just a soccer club. We're a community dedicated to developing young athletes, fostering sportsmanship, and building lasting friendships through the beautiful game."></textarea>
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Upload Section Images</label>
                                    <div className="input-group">
                                      <input type="file" className="form-control" accept="image/*" multiple />
                                      <button className="btn btn-outline-primary" type="button">
                                        <i className="bi bi-upload me-1"></i>Upload
                                      </button>
                                    </div>
                                  </div>
                                  <button className="btn btn-primary btn-sm w-100">
                                    <i className="bi bi-save me-1"></i>Save About
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="card border-success">
                                <div className="card-header bg-success text-white">
                                  <h6 className="mb-0"><i className="bi bi-trophy me-1"></i>Programs Section</h6>
                                </div>
                                <div className="card-body">
                                  <div className="mb-3">
                                    <label className="form-label">Section Title</label>
                                    <input type="text" className="form-control" defaultValue="Our Programs" />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Subtitle</label>
                                    <input type="text" className="form-control" defaultValue="From youth development to competitive leagues, we offer programs for every age and skill level." />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Program Images</label>
                                    <div className="input-group">
                                      <input type="file" className="form-control" accept="image/*" multiple />
                                      <button className="btn btn-outline-success" type="button">
                                        <i className="bi bi-upload me-1"></i>Upload
                                      </button>
                                    </div>
                                  </div>
                                  <button className="btn btn-success btn-sm w-100">
                                    <i className="bi bi-save me-1"></i>Save Programs
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="card border-warning">
                                <div className="card-header bg-warning text-white">
                                  <h6 className="mb-0"><i className="bi bi-star me-1"></i>Why Choose Us</h6>
                                </div>
                                <div className="card-body">
                                  <div className="mb-3">
                                    <label className="form-label">Section Title</label>
                                    <input type="text" className="form-control" defaultValue="Why Choose Seattle Leopards FC?" />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Subtitle</label>
                                    <input type="text" className="form-control" defaultValue="Discover what makes us the premier soccer club in the Seattle area." />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Benefit Images</label>
                                    <div className="input-group">
                                      <input type="file" className="form-control" accept="image/*" multiple />
                                      <button className="btn btn-outline-warning" type="button">
                                        <i className="bi bi-upload me-1"></i>Upload
                                      </button>
                                    </div>
                                  </div>
                                  <button className="btn btn-warning btn-sm w-100">
                                    <i className="bi bi-save me-1"></i>Save Benefits
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="card border-info">
                                <div className="card-header bg-info text-white">
                                  <h6 className="mb-0"><i className="bi bi-newspaper me-1"></i>News Section</h6>
                                </div>
                                <div className="card-body">
                                  <div className="mb-3">
                                    <label className="form-label">Section Title</label>
                                    <input type="text" className="form-control" defaultValue="Latest News & Updates" />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">Subtitle</label>
                                    <input type="text" className="form-control" defaultValue="Stay connected with the latest happenings at Seattle Leopards FC." />
                                  </div>
                                  <div className="mb-3">
                                    <label className="form-label">News Images</label>
                                    <div className="input-group">
                                      <input type="file" className="form-control" accept="image/*" multiple />
                                      <button className="btn btn-outline-info" type="button">
                                        <i className="bi bi-upload me-1"></i>Upload
                                      </button>
                                    </div>
                                  </div>
                                  <button className="btn btn-info btn-sm w-100">
                                    <i className="bi bi-save me-1"></i>Save News
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-file-text me-2"></i>Content Management System</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Default Content Editor</label>
                            <select className="form-select">
                              <option value="wysiwyg">WYSIWYG Editor</option>
                              <option value="markdown" selected>Markdown Editor</option>
                              <option value="html">HTML Editor</option>
                              <option value="rich">Rich Text Editor</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Auto-Save Interval (seconds)</label>
                            <input type="number" className="form-control" defaultValue="30" min="10" max="300" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Maximum File Upload Size (MB)</label>
                            <input type="number" className="form-control" defaultValue="10" min="1" max="100" />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Allowed File Types</label>
                            <input type="text" className="form-control" defaultValue="jpg,jpeg,png,gif,pdf,doc,docx" placeholder="Enter allowed file extensions" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Content Versioning</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Content Scheduling</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Content Approval Workflow</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable SEO Meta Tags</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Content Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0"><i className="bi bi-collection me-2"></i>Content Categories & Templates</h5>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <label className="form-label">Default Content Categories</label>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label">News & Updates</label>
                            </div>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label">Match Reports</label>
                            </div>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label">Player Profiles</label>
                            </div>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label">Club History</label>
                            </div>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label">Training Programs</label>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Content Templates</label>
                            <select className="form-select">
                              <option value="default">Default Template</option>
                              <option value="news">News Article Template</option>
                              <option value="match">Match Report Template</option>
                              <option value="player">Player Profile Template</option>
                              <option value="event">Event Template</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Featured Content Limit</label>
                            <input type="number" className="form-control" defaultValue="5" min="1" max="20" />
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Content Tags</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" defaultChecked />
                            <label className="form-check-label">Enable Content Comments</label>
                          </div>
                          <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" />
                            <label className="form-check-label">Enable Content Sharing</label>
                          </div>
                          <button className="btn btn-primary">
                            <i className="bi bi-save me-1"></i>Save Template Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Automation & Monitoring Panel */}
                <div className="row mt-4">
                  <div className="col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-gradient-success text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-robot me-2"></i>Smart Automation Center
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label fw-bold">Auto-Save Settings</label>
                              <small className="d-block text-muted">Automatically save changes every 30 seconds</small>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label fw-bold">Smart Backup</label>
                              <small className="d-block text-muted">Daily automated backups to cloud storage</small>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" />
                              <label className="form-check-label fw-bold">Performance Monitoring</label>
                              <small className="d-block text-muted">Real-time performance tracking and alerts</small>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" defaultChecked />
                              <label className="form-check-label fw-bold">Security Scanning</label>
                              <small className="d-block text-muted">Automated security vulnerability checks</small>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" />
                              <label className="form-check-label fw-bold">AI Optimization</label>
                              <small className="d-block text-muted">Machine learning-based settings optimization</small>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button className="btn btn-success btn-sm me-2">
                            <i className="bi bi-play-circle me-1"></i>Run Optimization
                          </button>
                          <button className="btn btn-outline-success btn-sm">
                            <i className="bi bi-gear me-1"></i>Configure
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-gradient-info text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-activity me-2"></i>Real-Time Monitoring
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="text-center p-3 bg-light rounded">
                              <i className="bi bi-cpu text-primary fs-4 mb-2"></i>
                              <h6 className="mb-1">CPU Usage</h6>
                              <h5 className="text-primary mb-0">23%</h5>
                              <div className="progress mt-2" style={{height: '4px'}}>
                                <div className="progress-bar bg-primary" style={{width: '23%'}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-light rounded">
                              <i className="bi bi-memory text-success fs-4 mb-2"></i>
                              <h6 className="mb-1">Memory</h6>
                              <h5 className="text-success mb-0">67%</h5>
                              <div className="progress mt-2" style={{height: '4px'}}>
                                <div className="progress-bar bg-success" style={{width: '67%'}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-light rounded">
                              <i className="bi bi-hdd text-warning fs-4 mb-2"></i>
                              <h6 className="mb-1">Storage</h6>
                              <h5 className="text-warning mb-0">45%</h5>
                              <div className="progress mt-2" style={{height: '4px'}}>
                                <div className="progress-bar bg-warning" style={{width: '45%'}}></div>
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-light rounded">
                              <i className="bi bi-wifi text-info fs-4 mb-2"></i>
                              <h6 className="mb-1">Network</h6>
                              <h5 className="text-info mb-0">98%</h5>
                              <div className="progress mt-2" style={{height: '4px'}}>
                                <div className="progress-bar bg-info" style={{width: '98%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button className="btn btn-info btn-sm me-2">
                            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                          </button>
                          <button className="btn btn-outline-info btn-sm">
                            <i className="bi bi-graph-up me-1"></i>View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Settings Health Check */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-gradient-warning text-dark">
                        <h5 className="mb-0">
                          <i className="bi bi-heart-pulse me-2"></i>Advanced Settings Health Check
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Club Information</h6>
                                <small className="text-muted">Complete</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-success" style={{width: '100%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Contact Details</h6>
                                <small className="text-muted">Complete</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-success" style={{width: '100%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Social & SEO</h6>
                                <small className="text-muted">Needs attention</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-warning" style={{width: '60%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Security</h6>
                                <small className="text-muted">Complete</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-success" style={{width: '100%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-info-circle-fill text-info fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Performance</h6>
                                <small className="text-muted">Optimizing</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-info" style={{width: '85%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-gear-fill text-primary fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Integrations</h6>
                                <small className="text-muted">Active</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-primary" style={{width: '90%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-palette-fill text-secondary fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Branding</h6>
                                <small className="text-muted">Complete</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-secondary" style={{width: '100%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-6 mb-3">
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                              <div className="bg-dark bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="bi bi-toggle-on text-dark fs-5"></i>
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">Features</h6>
                                <small className="text-muted">12 Active</small>
                                <div className="progress mt-1" style={{height: '3px'}}>
                                  <div className="progress-bar bg-dark" style={{width: '95%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'content' && (
              <div>
                {/* Content Management Stats */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>Total Pages</h6>
                        <h4 className="mb-0">12</h4>
                        <small>Active content pages</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>News Articles</h6>
                        <h4 className="mb-0">45</h4>
                        <small>Published articles</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Gallery Images</h6>
                        <h4 className="mb-0">234</h4>
                        <small>Total media items</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6>Last Updated</h6>
                        <h4 className="mb-0">Today</h4>
                        <small>Content freshness</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Content Actions */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Content Management Overview</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          <strong>All content in one place!</strong> Manage your website content right here without navigating to separate pages.
                        </div>
                        
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <div className="card border-primary h-100">
                              <div className="card-body text-center">
                                <i className="bi bi-house-fill text-primary" style={{fontSize: '2rem'}}></i>
                                <h5 className="mt-3 mb-2">Homepage Content</h5>
                                <p className="text-muted small">Welcome section, hero content, featured sections</p>
                                <button className="btn btn-primary btn-sm">Edit Homepage</button>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="card border-success h-100">
                              <div className="card-body text-center">
                                <i className="bi bi-info-circle-fill text-success" style={{fontSize: '2rem'}}></i>
                                <h5 className="mt-3 mb-2">About Page</h5>
                                <p className="text-muted small">Club information, history, mission statement</p>
                                <button className="btn btn-success btn-sm">Edit About</button>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="card border-warning h-100">
                              <div className="card-body text-center">
                                <i className="bi bi-newspaper text-warning" style={{fontSize: '2rem'}}></i>
                                <h5 className="mt-3 mb-2">News & Articles</h5>
                                <p className="text-muted small">Latest updates, announcements, blog posts</p>
                                <button className="btn btn-warning btn-sm">Manage News</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Content Updates */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Recent Content Updates</h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Content</th>
                                <th>Type</th>
                                <th>Last Modified</th>
                                <th>Modified By</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Homepage Hero Section</td>
                                <td><span className="badge bg-primary">Homepage</span></td>
                                <td>2 hours ago</td>
                                <td>Admin User</td>
                                <td><span className="badge bg-success">Published</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
                              </tr>
                              <tr>
                                <td>About Us - Club History</td>
                                <td><span className="badge bg-info">About</span></td>
                                <td>1 day ago</td>
                                <td>Content Manager</td>
                                <td><span className="badge bg-success">Published</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
                              </tr>
                              <tr>
                                <td>Weekly Training Update</td>
                                <td><span className="badge bg-warning">News</span></td>
                                <td>3 days ago</td>
                                <td>Coach Admin</td>
                                <td><span className="badge bg-success">Published</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
                              </tr>
                              <tr>
                                <td>Gallery - Championship Photos</td>
                                <td><span className="badge bg-secondary">Gallery</span></td>
                                <td>1 week ago</td>
                                <td>Media Manager</td>
                                <td><span className="badge bg-success">Published</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">Edit</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'club-info' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Club Information Management</h5>
                        <button
                          onClick={saveClubInfo}
                          disabled={clubInfoLoading}
                          className="btn btn-success"
                        >
                          <i className="bi bi-check me-1"></i>
                          {clubInfoLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                      <div className="card-body">
                        {clubInfoLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading club information...</p>
                          </div>
                        ) : (
                          <>
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${clubInfoActiveTab === 'basic' ? 'active' : ''}`}
                                  onClick={() => setClubInfoActiveTab('basic')}
                                >
                                  🏢 Basic Information
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${clubInfoActiveTab === 'contact' ? 'active' : ''}`}
                                  onClick={() => setClubInfoActiveTab('contact')}
                                >
                                  📞 Contact Details
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${clubInfoActiveTab === 'branding' ? 'active' : ''}`}
                                  onClick={() => setClubInfoActiveTab('branding')}
                                >
                                  🎨 Branding & Colors
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${clubInfoActiveTab === 'facilities' ? 'active' : ''}`}
                                  onClick={() => setClubInfoActiveTab('facilities')}
                                >
                                  🏟️ Facilities
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${clubInfoActiveTab === 'legal' ? 'active' : ''}`}
                                  onClick={() => setClubInfoActiveTab('legal')}
                                >
                                  📋 Legal & Registration
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${clubInfoActiveTab === 'social' ? 'active' : ''}`}
                                  onClick={() => setClubInfoActiveTab('social')}
                                >
                                  📱 Social Media
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${clubInfoActiveTab === 'achievements' ? 'active' : ''}`}
                                  onClick={() => setClubInfoActiveTab('achievements')}
                                >
                                  🏆 Achievements
                                </button>
                              </li>
                            </ul>

                            {/* Basic Information Tab */}
                            {clubInfoActiveTab === 'basic' && (
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Club Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.name}
                                    onChange={(e) => handleClubInfoChange('name', e.target.value)}
                                    placeholder="Seattle Leopards FC"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Short Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.shortName}
                                    onChange={(e) => handleClubInfoChange('shortName', e.target.value)}
                                    placeholder="SLFC"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Founded</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.founded}
                                    onChange={(e) => handleClubInfoChange('founded', e.target.value)}
                                    placeholder="2020"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Location</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.location}
                                    onChange={(e) => handleClubInfoChange('location', e.target.value)}
                                    placeholder="Seattle, WA"
                                  />
                                </div>
                                <div className="col-12">
                                  <label className="form-label">Description</label>
                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    value={clubInfo.description}
                                    onChange={(e) => handleClubInfoChange('description', e.target.value)}
                                    placeholder="Brief description of the club..."
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Mission</label>
                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    value={clubInfo.mission}
                                    onChange={(e) => handleClubInfoChange('mission', e.target.value)}
                                    placeholder="Club mission statement..."
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Vision</label>
                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    value={clubInfo.vision}
                                    onChange={(e) => handleClubInfoChange('vision', e.target.value)}
                                    placeholder="Club vision statement..."
                                  />
                                </div>
                              </div>
                            )}

                            {/* Contact Details Tab */}
                            {clubInfoActiveTab === 'contact' && (
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Phone</label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    value={clubInfo.phone}
                                    onChange={(e) => handleClubInfoChange('phone', e.target.value)}
                                    placeholder="(206) 555-0123"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Email</label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    value={clubInfo.email}
                                    onChange={(e) => handleClubInfoChange('email', e.target.value)}
                                    placeholder="info@seattleleopards.com"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Website</label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={clubInfo.website}
                                    onChange={(e) => handleClubInfoChange('website', e.target.value)}
                                    placeholder="https://seattleleopards.com"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Address</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.address}
                                    onChange={(e) => handleClubInfoChange('address', e.target.value)}
                                    placeholder="123 Main Street"
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">City</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.city}
                                    onChange={(e) => handleClubInfoChange('city', e.target.value)}
                                    placeholder="Seattle"
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">State</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.state}
                                    onChange={(e) => handleClubInfoChange('state', e.target.value)}
                                    placeholder="WA"
                                  />
                                </div>
                                <div className="col-md-4">
                                  <label className="form-label">ZIP Code</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.zipCode}
                                    onChange={(e) => handleClubInfoChange('zipCode', e.target.value)}
                                    placeholder="98101"
                                  />
                                </div>
                                <div className="col-12">
                                  <label className="form-label">Country</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.country}
                                    onChange={(e) => handleClubInfoChange('country', e.target.value)}
                                    placeholder="United States"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Branding & Colors Tab */}
                            {clubInfoActiveTab === 'branding' && (
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Primary Color</label>
                                  <div className="d-flex gap-2">
                                    <input
                                      type="color"
                                      className="form-control form-control-color"
                                      value={clubInfo.primaryColor}
                                      onChange={(e) => handleClubInfoChange('primaryColor', e.target.value)}
                                    />
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={clubInfo.primaryColor}
                                      onChange={(e) => handleClubInfoChange('primaryColor', e.target.value)}
                                      placeholder="#1e40af"
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Secondary Color</label>
                                  <div className="d-flex gap-2">
                                    <input
                                      type="color"
                                      className="form-control form-control-color"
                                      value={clubInfo.secondaryColor}
                                      onChange={(e) => handleClubInfoChange('secondaryColor', e.target.value)}
                                    />
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={clubInfo.secondaryColor}
                                      onChange={(e) => handleClubInfoChange('secondaryColor', e.target.value)}
                                      placeholder="#f59e0b"
                                    />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Motto</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.motto}
                                    onChange={(e) => handleClubInfoChange('motto', e.target.value)}
                                    placeholder="Excellence Through Unity"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Logo URL</label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={clubInfo.logo}
                                    onChange={(e) => handleClubInfoChange('logo', e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Facilities Tab */}
                            {clubInfoActiveTab === 'facilities' && (
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Home Field</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.homeField}
                                    onChange={(e) => handleClubInfoChange('homeField', e.target.value)}
                                    placeholder="Seattle Sports Complex"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Office Location</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.officeLocation}
                                    onChange={(e) => handleClubInfoChange('officeLocation', e.target.value)}
                                    placeholder="123 Club Street, Seattle, WA"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Legal & Registration Tab */}
                            {clubInfoActiveTab === 'legal' && (
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Registration Number</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.registrationNumber}
                                    onChange={(e) => handleClubInfoChange('registrationNumber', e.target.value)}
                                    placeholder="REG-2024-001"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Tax ID</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.taxId}
                                    onChange={(e) => handleClubInfoChange('taxId', e.target.value)}
                                    placeholder="12-3456789"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Insurance Provider</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.insuranceProvider}
                                    onChange={(e) => handleClubInfoChange('insuranceProvider', e.target.value)}
                                    placeholder="Sports Insurance Co."
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Insurance Number</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={clubInfo.insuranceNumber}
                                    onChange={(e) => handleClubInfoChange('insuranceNumber', e.target.value)}
                                    placeholder="INS-2024-001"
                                  />
                                </div>
                                <div className="col-12">
                                  <div className="form-check">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={clubInfo.nonProfit}
                                      onChange={(e) => handleClubInfoChange('nonProfit', e.target.checked)}
                                    />
                                    <label className="form-check-label">Non-Profit Organization</label>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Social Media Tab */}
                            {clubInfoActiveTab === 'social' && (
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Facebook</label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={clubInfo.facebook}
                                    onChange={(e) => handleClubInfoChange('facebook', e.target.value)}
                                    placeholder="https://facebook.com/seattleleopards"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Twitter</label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={clubInfo.twitter}
                                    onChange={(e) => handleClubInfoChange('twitter', e.target.value)}
                                    placeholder="https://twitter.com/seattleleopards"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Instagram</label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={clubInfo.instagram}
                                    onChange={(e) => handleClubInfoChange('instagram', e.target.value)}
                                    placeholder="https://instagram.com/seattleleopards"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">LinkedIn</label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={clubInfo.linkedin}
                                    onChange={(e) => handleClubInfoChange('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/company/seattleleopards"
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">YouTube</label>
                                  <input
                                    type="url"
                                    className="form-control"
                                    value={clubInfo.youtube}
                                    onChange={(e) => handleClubInfoChange('youtube', e.target.value)}
                                    placeholder="https://youtube.com/seattleleopards"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Achievements Tab */}
                            {clubInfoActiveTab === 'achievements' && (
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <label className="form-label">Awards</label>
                                  <div className="mb-2">
                                    {clubInfo.awards.map((award, index) => (
                                      <div key={index} className="input-group mb-2">
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={award}
                                          onChange={(e) => handleClubInfoArrayChange('awards', index, e.target.value)}
                                          placeholder="Award name"
                                        />
                                        <button
                                          className="btn btn-outline-danger"
                                          onClick={() => removeClubInfoArrayItem('awards', index)}
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => addClubInfoArrayItem('awards', '')}
                                  >
                                    + Add Award
                                  </button>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label">Championships</label>
                                  <div className="mb-2">
                                    {clubInfo.championships.map((championship, index) => (
                                      <div key={index} className="input-group mb-2">
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={championship}
                                          onChange={(e) => handleClubInfoArrayChange('championships', index, e.target.value)}
                                          placeholder="Championship name"
                                        />
                                        <button
                                          className="btn btn-outline-danger"
                                          onClick={() => removeClubInfoArrayItem('championships', index)}
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => addClubInfoArrayItem('championships', '')}
                                  >
                                    + Add Championship
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'policies' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Policies Management</h5>
                        <button
                          onClick={savePolicies}
                          disabled={policiesLoading}
                          className="btn btn-success"
                        >
                          <i className="bi bi-check me-1"></i>
                          {policiesLoading ? 'Saving...' : 'Save All Policies'}
                        </button>
                      </div>
                      <div className="card-body">
                        {policiesLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading policies...</p>
                          </div>
                        ) : (
                          <>
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${policiesActiveTab === 'general' ? 'active' : ''}`}
                                  onClick={() => setPoliciesActiveTab('general')}
                                >
                                  📋 General Policies
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${policiesActiveTab === 'safety' ? 'active' : ''}`}
                                  onClick={() => setPoliciesActiveTab('safety')}
                                >
                                  🛡️ Safety & Health
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${policiesActiveTab === 'disciplinary' ? 'active' : ''}`}
                                  onClick={() => setPoliciesActiveTab('disciplinary')}
                                >
                                  ⚖️ Disciplinary
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${policiesActiveTab === 'financial' ? 'active' : ''}`}
                                  onClick={() => setPoliciesActiveTab('financial')}
                                >
                                  💰 Financial
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${policiesActiveTab === 'technology' ? 'active' : ''}`}
                                  onClick={() => setPoliciesActiveTab('technology')}
                                >
                                  💻 Technology
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${policiesActiveTab === 'volunteer' ? 'active' : ''}`}
                                  onClick={() => setPoliciesActiveTab('volunteer')}
                                >
                                  🤝 Volunteer
                                </button>
                              </li>
                            </ul>

                            {/* General Policies Tab */}
                            {policiesActiveTab === 'general' && (
                              <div>
                                <h4 className="mb-3">General Policies</h4>
                                <p className="text-muted mb-4">Core club policies and terms of membership</p>
                                <div className="row g-3">
                                  <div className="col-12">
                                    <label className="form-label">Club Name</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={policies.general.clubName}
                                      onChange={(e) => updatePolicy('general', 'clubName', e.target.value)}
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Code of Conduct</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.general.codeOfConduct}
                                      onChange={(e) => updatePolicy('general', 'codeOfConduct', e.target.value)}
                                      placeholder="Enter the club's code of conduct..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Membership Terms & Conditions</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.general.membershipTerms}
                                      onChange={(e) => updatePolicy('general', 'membershipTerms', e.target.value)}
                                      placeholder="Enter membership terms and conditions..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Privacy Policy</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.general.privacyPolicy}
                                      onChange={(e) => updatePolicy('general', 'privacyPolicy', e.target.value)}
                                      placeholder="Enter privacy policy details..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Refund Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.general.refundPolicy}
                                      onChange={(e) => updatePolicy('general', 'refundPolicy', e.target.value)}
                                      placeholder="Enter refund policy details..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Safety & Health Tab */}
                            {policiesActiveTab === 'safety' && (
                              <div>
                                <h4 className="mb-3">Safety & Health Policies</h4>
                                <p className="text-muted mb-4">Safety guidelines and health protocols</p>
                                <div className="row g-3">
                                  <div className="col-12">
                                    <label className="form-label">Safety Guidelines</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.safety.safetyGuidelines}
                                      onChange={(e) => updatePolicy('safety', 'safetyGuidelines', e.target.value)}
                                      placeholder="Enter general safety guidelines..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Emergency Procedures</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.safety.emergencyProcedures}
                                      onChange={(e) => updatePolicy('safety', 'emergencyProcedures', e.target.value)}
                                      placeholder="Enter emergency procedures..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Injury Reporting Procedures</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.safety.injuryReporting}
                                      onChange={(e) => updatePolicy('safety', 'injuryReporting', e.target.value)}
                                      placeholder="Enter injury reporting procedures..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Equipment Safety</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.safety.equipmentSafety}
                                      onChange={(e) => updatePolicy('safety', 'equipmentSafety', e.target.value)}
                                      placeholder="Enter equipment safety guidelines..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Weather Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.safety.weatherPolicy}
                                      onChange={(e) => updatePolicy('safety', 'weatherPolicy', e.target.value)}
                                      placeholder="Enter weather-related safety policies..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Disciplinary Tab */}
                            {policiesActiveTab === 'disciplinary' && (
                              <div>
                                <h4 className="mb-3">Disciplinary Policies</h4>
                                <p className="text-muted mb-4">Disciplinary procedures and consequences</p>
                                <div className="row g-3">
                                  <div className="col-12">
                                    <label className="form-label">Disciplinary Code</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.disciplinary.disciplinaryCode}
                                      onChange={(e) => updatePolicy('disciplinary', 'disciplinaryCode', e.target.value)}
                                      placeholder="Enter disciplinary code and rules..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Suspension Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.disciplinary.suspensionPolicy}
                                      onChange={(e) => updatePolicy('disciplinary', 'suspensionPolicy', e.target.value)}
                                      placeholder="Enter suspension policy details..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Appeal Process</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.disciplinary.appealProcess}
                                      onChange={(e) => updatePolicy('disciplinary', 'appealProcess', e.target.value)}
                                      placeholder="Enter appeal process details..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Zero Tolerance Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.disciplinary.zeroTolerance}
                                      onChange={(e) => updatePolicy('disciplinary', 'zeroTolerance', e.target.value)}
                                      placeholder="Enter zero tolerance policy..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Reporting Procedures</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.disciplinary.reportingProcedures}
                                      onChange={(e) => updatePolicy('disciplinary', 'reportingProcedures', e.target.value)}
                                      placeholder="Enter reporting procedures..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Financial Tab */}
                            {policiesActiveTab === 'financial' && (
                              <div>
                                <h4 className="mb-3">Financial Policies</h4>
                                <p className="text-muted mb-4">Payment terms and financial procedures</p>
                                <div className="row g-3">
                                  <div className="col-12">
                                    <label className="form-label">Payment Terms</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.financial.paymentTerms}
                                      onChange={(e) => updatePolicy('financial', 'paymentTerms', e.target.value)}
                                      placeholder="Enter payment terms and conditions..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Fee Structure</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.financial.feeStructure}
                                      onChange={(e) => updatePolicy('financial', 'feeStructure', e.target.value)}
                                      placeholder="Enter fee structure details..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Refund Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.financial.refundPolicy}
                                      onChange={(e) => updatePolicy('financial', 'refundPolicy', e.target.value)}
                                      placeholder="Enter refund policy details..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Late Payment Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.financial.latePaymentPolicy}
                                      onChange={(e) => updatePolicy('financial', 'latePaymentPolicy', e.target.value)}
                                      placeholder="Enter late payment policy..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Financial Aid Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.financial.financialAid}
                                      onChange={(e) => updatePolicy('financial', 'financialAid', e.target.value)}
                                      placeholder="Enter financial aid policy..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Technology Tab */}
                            {policiesActiveTab === 'technology' && (
                              <div>
                                <h4 className="mb-3">Technology Policies</h4>
                                <p className="text-muted mb-4">Digital policies and online safety</p>
                                <div className="row g-3">
                                  <div className="col-12">
                                    <label className="form-label">Data Protection Policy</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.technology.dataProtection}
                                      onChange={(e) => updatePolicy('technology', 'dataProtection', e.target.value)}
                                      placeholder="Enter data protection policy..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Social Media Policy</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.technology.socialMediaPolicy}
                                      onChange={(e) => updatePolicy('technology', 'socialMediaPolicy', e.target.value)}
                                      placeholder="Enter social media policy..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Photo & Video Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.technology.photoVideoPolicy}
                                      onChange={(e) => updatePolicy('technology', 'photoVideoPolicy', e.target.value)}
                                      placeholder="Enter photo and video policy..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Communication Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.technology.communicationPolicy}
                                      onChange={(e) => updatePolicy('technology', 'communicationPolicy', e.target.value)}
                                      placeholder="Enter communication policy..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Online Safety Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.technology.onlineSafety}
                                      onChange={(e) => updatePolicy('technology', 'onlineSafety', e.target.value)}
                                      placeholder="Enter online safety policy..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Volunteer Tab */}
                            {policiesActiveTab === 'volunteer' && (
                              <div>
                                <h4 className="mb-3">Volunteer Policies</h4>
                                <p className="text-muted mb-4">Volunteer guidelines and expectations</p>
                                <div className="row g-3">
                                  <div className="col-12">
                                    <label className="form-label">Volunteer Code of Conduct</label>
                                    <textarea
                                      rows={6}
                                      className="form-control"
                                      value={policies.volunteer.volunteerCode}
                                      onChange={(e) => updatePolicy('volunteer', 'volunteerCode', e.target.value)}
                                      placeholder="Enter volunteer code of conduct..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Background Check Policy</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.volunteer.backgroundChecks}
                                      onChange={(e) => updatePolicy('volunteer', 'backgroundChecks', e.target.value)}
                                      placeholder="Enter background check requirements..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Training Requirements</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.volunteer.trainingRequirements}
                                      onChange={(e) => updatePolicy('volunteer', 'trainingRequirements', e.target.value)}
                                      placeholder="Enter training requirements..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Volunteer Rights</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.volunteer.volunteerRights}
                                      onChange={(e) => updatePolicy('volunteer', 'volunteerRights', e.target.value)}
                                      placeholder="Enter volunteer rights..."
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Volunteer Responsibilities</label>
                                    <textarea
                                      rows={4}
                                      className="form-control"
                                      value={policies.volunteer.volunteerResponsibilities}
                                      onChange={(e) => updatePolicy('volunteer', 'volunteerResponsibilities', e.target.value)}
                                      placeholder="Enter volunteer responsibilities..."
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'documents' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Documentation Management</h5>
                      </div>
                      <div className="card-body">
                        {documentsLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading documents...</p>
                          </div>
                        ) : (
                          <>
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${documentsActiveTab === 'overview' ? 'active' : ''}`}
                                  onClick={() => setDocumentsActiveTab('overview')}
                                >
                                  📊 Overview
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${documentsActiveTab === 'all' ? 'active' : ''}`}
                                  onClick={() => setDocumentsActiveTab('all')}
                                >
                                  📁 All Documents
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${documentsActiveTab === 'upload' ? 'active' : ''}`}
                                  onClick={() => setDocumentsActiveTab('upload')}
                                >
                                  ⬆️ Upload Document
                                </button>
                              </li>
                            </ul>

                            {/* Overview Tab */}
                            {documentsActiveTab === 'overview' && (
                              <div>
                                {/* Statistics Cards */}
                                <div className="row g-3 mb-4">
                                  <div className="col-md-3">
                                    <div className="card bg-primary bg-opacity-10 border-primary">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-primary">{documentStats.total}</h2>
                                        <p className="text-muted mb-0">Total Documents</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-success bg-opacity-10 border-success">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-success">{documentStats.published}</h2>
                                        <p className="text-muted mb-0">Published</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-warning bg-opacity-10 border-warning">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-warning">{documentStats.draft}</h2>
                                        <p className="text-muted mb-0">Drafts</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-secondary bg-opacity-10 border-secondary">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-secondary">{documentStats.archived}</h2>
                                        <p className="text-muted mb-0">Archived</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Categories Grid */}
                                <h5 className="mb-3">Document Categories</h5>
                                <div className="row g-3">
                                  {documentStats.byCategory.map((cat) => (
                                    <div key={cat.id} className="col-md-3">
                                      <div className="card h-100">
                                        <div className="card-body">
                                          <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span style={{fontSize: '2rem'}}>{cat.icon}</span>
                                            <h3 className="mb-0">{cat.count}</h3>
                                          </div>
                                          <h6 className="card-title">{cat.name}</h6>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* All Documents Tab */}
                            {documentsActiveTab === 'all' && (
                              <div>
                                {/* Filters */}
                                <div className="row g-3 mb-4">
                                  <div className="col-md-5">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Search documents..."
                                      value={documentFilter.search}
                                      onChange={(e) => setDocumentFilter(f => ({ ...f, search: e.target.value }))}
                                    />
                                  </div>
                                  <div className="col-md-3">
                                    <select
                                      className="form-select"
                                      value={documentFilter.category}
                                      onChange={(e) => setDocumentFilter(f => ({ ...f, category: e.target.value }))}
                                    >
                                      <option value="all">All Categories</option>
                                      {documentCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-2">
                                    <select
                                      className="form-select"
                                      value={documentFilter.status}
                                      onChange={(e) => setDocumentFilter(f => ({ ...f, status: e.target.value }))}
                                    >
                                      <option value="all">All Status</option>
                                      <option value="draft">Draft</option>
                                      <option value="published">Published</option>
                                      <option value="archived">Archived</option>
                                    </select>
                                  </div>
                                  <div className="col-md-2">
                                    <button
                                      className="btn btn-primary w-100"
                                      onClick={() => setDocumentsActiveTab('upload')}
                                    >
                                      <i className="bi bi-upload me-1"></i> Upload
                                    </button>
                                  </div>
                                </div>

                                {/* Documents Table */}
                                <div className="table-responsive">
                                  <table className="table table-hover">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Document</th>
                                        <th>Category</th>
                                        <th>Version</th>
                                        <th>Status</th>
                                        <th>Updated</th>
                                        <th>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredDocuments.length === 0 ? (
                                        <tr>
                                          <td colSpan="6" className="text-center py-5">
                                            <div className="text-muted">
                                              <i className="bi bi-file-earmark-text" style={{fontSize: '3rem'}}></i>
                                              <p className="mt-2">No documents found</p>
                                              <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setDocumentsActiveTab('upload')}
                                              >
                                                Upload Document
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : (
                                        filteredDocuments.map((doc) => (
                                          <tr key={doc._id}>
                                            <td>
                                              <div>
                                                <strong>{doc.title}</strong>
                                                {doc.description && (
                                                  <div className="text-muted small">{doc.description}</div>
                                                )}
                                              </div>
                                            </td>
                                            <td>
                                              <span className="badge bg-secondary">
                                                {documentCategories.find(c => c.id === doc.category)?.name || doc.category}
                                              </span>
                                            </td>
                                            <td className="text-muted small">v{doc.version || '1.0'}</td>
                                            <td>
                                              <span className={`badge bg-${getDocStatusColor(doc.status)}`}>
                                                {doc.status}
                                              </span>
                                            </td>
                                            <td className="text-muted small">
                                              {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td>
                                              <div className="btn-group btn-group-sm">
                                                {doc.url && (
                                                  <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => window.open(doc.url, '_blank')}
                                                    title="View"
                                                  >
                                                    <i className="bi bi-eye"></i>
                                                  </button>
                                                )}
                                                <button
                                                  className="btn btn-outline-danger"
                                                  onClick={() => deleteDocument(doc._id)}
                                                  title="Delete"
                                                >
                                                  <i className="bi bi-trash"></i>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Upload Tab */}
                            {documentsActiveTab === 'upload' && (
                              <div>
                                <h4 className="mb-4">Upload New Document</h4>
                                <div className="row g-3">
                                  <div className="col-12">
                                    <label className="form-label">Document Title *</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={newDocument.title}
                                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                                      placeholder="Enter document title..."
                                      required
                                    />
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Description</label>
                                    <textarea
                                      className="form-control"
                                      rows="3"
                                      value={newDocument.description}
                                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                                      placeholder="Enter document description..."
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <label className="form-label">Category *</label>
                                    <select
                                      className="form-select"
                                      value={newDocument.category}
                                      onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                      {documentCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                          {cat.icon} {cat.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-3">
                                    <label className="form-label">Version</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={newDocument.version}
                                      onChange={(e) => setNewDocument(prev => ({ ...prev, version: e.target.value }))}
                                      placeholder="1.0"
                                    />
                                  </div>
                                  <div className="col-md-3">
                                    <label className="form-label">Status</label>
                                    <select
                                      className="form-select"
                                      value={newDocument.status}
                                      onChange={(e) => setNewDocument(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                      <option value="draft">Draft</option>
                                      <option value="published">Published</option>
                                      <option value="archived">Archived</option>
                                    </select>
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Upload File *</label>
                                    <div className="border border-2 border-dashed rounded p-4 text-center">
                                      <i className="bi bi-cloud-upload display-4 text-muted"></i>
                                      <div className="mt-3">
                                        <label htmlFor="file-upload" className="btn btn-primary">
                                          <i className="bi bi-upload me-2"></i>Choose File
                                          <input
                                            id="file-upload"
                                            type="file"
                                            className="d-none"
                                            onChange={handleFileUpload}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                                          />
                                        </label>
                                      </div>
                                      <p className="text-muted small mt-2">
                                        PDF, DOC, XLS, PPT, Images up to 10MB
                                      </p>
                                      {newDocument.file && (
                                        <div className="alert alert-success mt-3 mb-0">
                                          <i className="bi bi-check-circle me-2"></i>
                                          {newDocument.file.name}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="col-12">
                                    <div className="d-flex gap-2 justify-content-end">
                                      <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                          setNewDocument({
                                            title: '',
                                            description: '',
                                            category: 'policies',
                                            version: '1.0',
                                            file: null,
                                            status: 'draft'
                                          });
                                          setDocumentsActiveTab('overview');
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="btn btn-primary"
                                        onClick={uploadDocument}
                                        disabled={documentsLoading || !newDocument.title || !newDocument.file}
                                      >
                                        {documentsLoading ? 'Uploading...' : 'Upload Document'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div>
                {/* Key Metrics */}
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>Total Visits</h6>
                        <h4 className="mb-0">24,567</h4>
                        <small><i className="bi bi-arrow-up"></i> 12.5% vs last month</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>Active Users</h6>
                        <h4 className="mb-0">1,234</h4>
                        <small><i className="bi bi-arrow-up"></i> 8.3% vs last month</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Page Views</h6>
                        <h4 className="mb-0">89,234</h4>
                        <small><i className="bi bi-arrow-up"></i> 15.2% vs last month</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6>Avg. Session</h6>
                        <h4 className="mb-0">4m 32s</h4>
                        <small><i className="bi bi-arrow-up"></i> 3.1% vs last month</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Traffic Sources & Popular Pages */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Traffic Sources</h5>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="d-flex justify-between-between align-items-center mb-2">
                            <span>Direct</span>
                            <span className="badge bg-primary">45%</span>
                          </div>
                          <div className="progress">
                            <div className="progress-bar bg-primary" style={{width: '45%'}}></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>Search Engines</span>
                            <span className="badge bg-success">30%</span>
                          </div>
                          <div className="progress">
                            <div className="progress-bar bg-success" style={{width: '30%'}}></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>Social Media</span>
                            <span className="badge bg-info">15%</span>
                          </div>
                          <div className="progress">
                            <div className="progress-bar bg-info" style={{width: '15%'}}></div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span>Referral</span>
                            <span className="badge bg-warning">10%</span>
                          </div>
                          <div className="progress">
                            <div className="progress-bar bg-warning" style={{width: '10%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Popular Pages</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <span>/teams</span>
                            <span className="badge bg-primary">12,456 views</span>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <span>/marketplace</span>
                            <span className="badge bg-success">8,234 views</span>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <span>/schedules</span>
                            <span className="badge bg-info">6,789 views</span>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <span>/programs</span>
                            <span className="badge bg-warning">5,432 views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Engagement */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">User Engagement Metrics</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-primary">67%</h4>
                              <p className="mb-0">Bounce Rate</p>
                            </div>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-success">3.4</h4>
                              <p className="mb-0">Pages/Session</p>
                            </div>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-warning">2,145</h4>
                              <p className="mb-0">New Users</p>
                            </div>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-info">58%</h4>
                              <p className="mb-0">Returning Users</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeSection === 'system' && (
              <div>
                {/* System Subcategories Navigation */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body p-3">
                        <div className="d-flex flex-wrap gap-2">
                          <button 
                            className={`btn ${activeSubSection === 'overview' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => setActiveSubSection('overview')}
                          >
                            <i className="bi bi-speedometer2 me-1"></i>Overview
                          </button>
                          <button 
                            className={`btn ${activeSubSection === 'analytics' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => setActiveSubSection('analytics')}
                          >
                            <i className="bi bi-graph-up me-1"></i>Analytics
                          </button>
                          <button 
                            className={`btn ${activeSubSection === 'reports' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => setActiveSubSection('reports')}
                          >
                            <i className="bi bi-file-earmark-bar-graph me-1"></i>Reports
                          </button>
                          <button 
                            className={`btn ${activeSubSection === 'monitoring' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => setActiveSubSection('monitoring')}
                          >
                            <i className="bi bi-activity me-1"></i>Monitoring
                          </button>
                          <button 
                            className={`btn ${activeSubSection === 'maintenance' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                            onClick={() => setActiveSubSection('maintenance')}
                          >
                            <i className="bi bi-tools me-1"></i>Maintenance
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Overview Subsection */}
                {activeSubSection === 'overview' && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">
                            <i className="bi bi-speedometer2 me-2"></i>System Overview
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-lg-3 col-md-6 mb-4">
                              <div className="card border-success">
                                <div className="card-body text-center">
                                  <i className="bi bi-check-circle-fill text-success fs-1"></i>
                                  <h5 className="mt-3">System Status</h5>
                                  <h3 className="text-success">Online</h3>
                                  <small className="text-muted">All systems operational</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-4">
                              <div className="card border-info">
                                <div className="card-body text-center">
                                  <i className="bi bi-cpu text-info fs-1"></i>
                                  <h5 className="mt-3">CPU Usage</h5>
                                  <h3 className="text-info">23%</h3>
                                  <small className="text-muted">Normal load</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-4">
                              <div className="card border-warning">
                                <div className="card-body text-center">
                                  <i className="bi bi-hdd text-warning fs-1"></i>
                                  <h5 className="mt-3">Storage</h5>
                                  <h3 className="text-warning">2.3GB</h3>
                                  <small className="text-muted">of 10GB used</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-4">
                              <div className="card border-primary">
                                <div className="card-body text-center">
                                  <i className="bi bi-memory text-primary fs-1"></i>
                                  <h5 className="mt-3">Memory</h5>
                                  <h3 className="text-primary">1.2GB</h3>
                                  <small className="text-muted">of 4GB used</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analytics Subsection */}
                {activeSubSection === 'analytics' && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">
                            <i className="bi bi-graph-up me-2"></i>System Analytics
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-lg-6 mb-4">
                              <div className="card">
                                <div className="card-header">
                                  <h6 className="mb-0">Performance Metrics</h6>
                                </div>
                                <div className="card-body">
                                  <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span>Response Time</span>
                                      <span className="fw-bold">245ms</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div className="progress-bar bg-success" style={{ width: '75%' }}></div>
                                    </div>
                                  </div>
                                  <div className="mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span>Uptime</span>
                                      <span className="fw-bold">99.9%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div className="progress-bar bg-primary" style={{ width: '99%' }}></div>
                                    </div>
                                  </div>
                                  <div className="mb-0">
                                    <div className="d-flex justify-content-between mb-1">
                                      <span>Error Rate</span>
                                      <span className="fw-bold">0.1%</span>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                      <div className="progress-bar bg-warning" style={{ width: '5%' }}></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-6 mb-4">
                              <div className="card">
                                <div className="card-header">
                                  <h6 className="mb-0">Usage Statistics</h6>
                                </div>
                                <div className="card-body">
                                  <div className="row text-center">
                                    <div className="col-6 mb-3">
                                      <h4 className="text-primary">1,247</h4>
                                      <small className="text-muted">Daily Active Users</small>
                                    </div>
                                    <div className="col-6 mb-3">
                                      <h4 className="text-success">8,923</h4>
                                      <small className="text-muted">Page Views</small>
                                    </div>
                                    <div className="col-6">
                                      <h4 className="text-warning">156</h4>
                                      <small className="text-muted">API Calls</small>
                                    </div>
                                    <div className="col-6">
                                      <h4 className="text-info">23</h4>
                                      <small className="text-muted">New Registrations</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reports Subsection */}
                {activeSubSection === 'reports' && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">
                            <i className="bi bi-file-earmark-bar-graph me-2"></i>System Reports
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-lg-4 col-md-6 mb-4">
                              <div className="card h-100">
                                <div className="card-body text-center">
                                  <i className="bi bi-file-earmark-text text-primary fs-1 mb-3"></i>
                                  <h5>System Health Report</h5>
                                  <p className="text-muted">Comprehensive system performance analysis</p>
                                  <button className="btn btn-primary btn-sm">Generate Report</button>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-4">
                              <div className="card h-100">
                                <div className="card-body text-center">
                                  <i className="bi bi-people text-success fs-1 mb-3"></i>
                                  <h5>User Activity Report</h5>
                                  <p className="text-muted">User engagement and activity metrics</p>
                                  <button className="btn btn-success btn-sm">Generate Report</button>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-4">
                              <div className="card h-100">
                                <div className="card-body text-center">
                                  <i className="bi bi-shield-check text-warning fs-1 mb-3"></i>
                                  <h5>Security Report</h5>
                                  <p className="text-muted">Security events and access logs</p>
                                  <button className="btn btn-warning btn-sm">Generate Report</button>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-4">
                              <div className="card h-100">
                                <div className="card-body text-center">
                                  <i className="bi bi-database text-info fs-1 mb-3"></i>
                                  <h5>Database Report</h5>
                                  <p className="text-muted">Database performance and usage statistics</p>
                                  <button className="btn btn-info btn-sm">Generate Report</button>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-4">
                              <div className="card h-100">
                                <div className="card-body text-center">
                                  <i className="bi bi-graph-up text-danger fs-1 mb-3"></i>
                                  <h5>Performance Report</h5>
                                  <p className="text-muted">System performance and optimization metrics</p>
                                  <button className="btn btn-danger btn-sm">Generate Report</button>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-4">
                              <div className="card h-100">
                                <div className="card-body text-center">
                                  <i className="bi bi-calendar-event text-secondary fs-1 mb-3"></i>
                                  <h5>Event Log Report</h5>
                                  <p className="text-muted">System events and error logs</p>
                                  <button className="btn btn-secondary btn-sm">Generate Report</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monitoring Subsection */}
                {activeSubSection === 'monitoring' && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">
                            <i className="bi bi-activity me-2"></i>System Monitoring
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Real-time system monitoring and alerts. This will include:
                            <ul className="mt-2 mb-0">
                              <li>Server health monitoring</li>
                              <li>Database performance tracking</li>
                              <li>Application error monitoring</li>
                              <li>Resource usage alerts</li>
                              <li>Security event monitoring</li>
                            </ul>
                          </div>
                          <div className="text-center py-5">
                            <i className="bi bi-activity display-1 text-muted"></i>
                            <h4 className="mt-3 text-muted">System Monitoring</h4>
                            <p className="text-muted">Real-time monitoring dashboard coming soon...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Maintenance Subsection */}
                {activeSubSection === 'maintenance' && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">
                            <i className="bi bi-tools me-2"></i>System Maintenance
                          </h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            System maintenance tools and utilities. This will include:
                            <ul className="mt-2 mb-0">
                              <li>Database optimization</li>
                              <li>Cache management</li>
                              <li>Log cleanup</li>
                              <li>System updates</li>
                              <li>Backup scheduling</li>
                            </ul>
                          </div>
                          <div className="text-center py-5">
                            <i className="bi bi-tools display-1 text-muted"></i>
                            <h4 className="mt-3 text-muted">System Maintenance</h4>
                            <p className="text-muted">Maintenance tools coming soon...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'security' && (
              <div>
                {/* Security Status */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>Security Score</h6>
                        <h4 className="mb-0">98/100</h4>
                        <small>Excellent</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Failed Logins</h6>
                        <h4 className="mb-0">12</h4>
                        <small>Last 24 hours</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6>Active Sessions</h6>
                        <h4 className="mb-0">45</h4>
                        <small>Currently logged in</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>2FA Enabled</h6>
                        <h4 className="mb-0">87%</h4>
                        <small>User adoption</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Security Settings</h5>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="require2FA" defaultChecked />
                            <label className="form-check-label" htmlFor="require2FA">
                              Require Two-Factor Authentication
                            </label>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="sessionTimeout" defaultChecked />
                            <label className="form-check-label" htmlFor="sessionTimeout">
                              Auto Session Timeout (30 minutes)
                            </label>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="strongPassword" defaultChecked />
                            <label className="form-check-label" htmlFor="strongPassword">
                              Enforce Strong Password Policy
                            </label>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="loginNotifications" defaultChecked />
                            <label className="form-check-label" htmlFor="loginNotifications">
                              Email Login Notifications
                            </label>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" id="ipWhitelist" />
                            <label className="form-check-label" htmlFor="ipWhitelist">
                              IP Whitelist Protection
                            </label>
                          </div>
                        </div>
                        <button className="btn btn-primary">Save Settings</button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Recent Security Events</h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="list-group list-group-flush">
                          <div className="list-group-item">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-shield-check text-success fs-4 me-3"></i>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Successful Admin Login</h6>
                                <small className="text-muted">admin@club.com • 5 minutes ago</small>
                              </div>
                            </div>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-shield-x text-danger fs-4 me-3"></i>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Failed Login Attempt</h6>
                                <small className="text-muted">unknown@test.com • 15 minutes ago</small>
                              </div>
                            </div>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-key text-warning fs-4 me-3"></i>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Password Changed</h6>
                                <small className="text-muted">user@club.com • 1 hour ago</small>
                              </div>
                            </div>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-shield-check text-success fs-4 me-3"></i>
                              <div className="flex-grow-1">
                                <h6 className="mb-1">2FA Enabled</h6>
                                <small className="text-muted">member@club.com • 2 hours ago</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access Control */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Active User Sessions</h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>User</th>
                                <th>IP Address</th>
                                <th>Device</th>
                                <th>Login Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>admin@club.com</td>
                                <td>192.168.1.1</td>
                                <td>Chrome on Windows</td>
                                <td>2 hours ago</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td><button className="btn btn-sm btn-danger">Revoke</button></td>
                              </tr>
                              <tr>
                                <td>coach@club.com</td>
                                <td>192.168.1.45</td>
                                <td>Safari on iPhone</td>
                                <td>1 hour ago</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td><button className="btn btn-sm btn-danger">Revoke</button></td>
                              </tr>
                              <tr>
                                <td>member@club.com</td>
                                <td>192.168.1.89</td>
                                <td>Firefox on MacOS</td>
                                <td>30 minutes ago</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td><button className="btn btn-sm btn-danger">Revoke</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'teams' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Team Management</h5>
                        {!showTeamForm && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => {
                              resetTeamForm();
                              setShowTeamForm(true);
                              setEditingTeam(null);
                            }}
                          >
                            <i className="bi bi-plus-circle me-1"></i> Create New Team
                          </button>
                        )}
                      </div>
                      <div className="card-body">
                        {teamsLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading teams...</p>
                          </div>
                        ) : showTeamForm ? (
                          <form onSubmit={handleTeamSubmit}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h5>{editingTeam ? 'Edit Team' : 'Create New Team'}</h5>
                              <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => {
                                  setShowTeamForm(false);
                                  setEditingTeam(null);
                                  resetTeamForm();
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Team Name *</label>
                                <input
                                  type="text"
                                  name="name"
                                  className="form-control"
                                  value={teamForm.name}
                                  onChange={handleTeamFormChange}
                                  required
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Age Group *</label>
                                <select
                                  name="ageGroup"
                                  className="form-select"
                                  value={teamForm.ageGroup}
                                  onChange={handleTeamFormChange}
                                  required
                                >
                                  <option value="">Select Age Group</option>
                                  {AGE_GROUPS.map(age => (
                                    <option key={age} value={age}>{age}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Level *</label>
                                <select
                                  name="level"
                                  className="form-select"
                                  value={teamForm.level}
                                  onChange={handleTeamFormChange}
                                  required
                                >
                                  <option value="">Select Level</option>
                                  {TEAM_LEVELS.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Status *</label>
                                <select
                                  name="status"
                                  className="form-select"
                                  value={teamForm.status}
                                  onChange={handleTeamFormChange}
                                >
                                  {TEAM_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Coach *</label>
                                <input
                                  type="text"
                                  name="coach"
                                  className="form-control"
                                  value={teamForm.coach}
                                  onChange={handleTeamFormChange}
                                  required
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Assistant Coach</label>
                                <input
                                  type="text"
                                  name="assistantCoach"
                                  className="form-control"
                                  value={teamForm.assistantCoach}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Max Players</label>
                                <input
                                  type="number"
                                  name="maxPlayers"
                                  className="form-control"
                                  value={teamForm.maxPlayers}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Current Players</label>
                                <input
                                  type="number"
                                  name="currentPlayers"
                                  className="form-control"
                                  value={teamForm.currentPlayers}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Fees ($)</label>
                                <input
                                  type="number"
                                  name="fees"
                                  className="form-control"
                                  value={teamForm.fees}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-md-3">
                                <label className="form-label">Season</label>
                                <input
                                  type="text"
                                  name="season"
                                  className="form-control"
                                  value={teamForm.season}
                                  onChange={handleTeamFormChange}
                                  placeholder="e.g. Spring 2025"
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Practice Days</label>
                                <input
                                  type="text"
                                  name="practiceDays"
                                  className="form-control"
                                  value={teamForm.practiceDays}
                                  onChange={handleTeamFormChange}
                                  placeholder="e.g. Monday, Wednesday"
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Practice Time</label>
                                <input
                                  type="text"
                                  name="practiceTime"
                                  className="form-control"
                                  value={teamForm.practiceTime}
                                  onChange={handleTeamFormChange}
                                  placeholder="e.g. 6:00 PM - 7:30 PM"
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Location</label>
                                <input
                                  type="text"
                                  name="location"
                                  className="form-control"
                                  value={teamForm.location}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Game Day</label>
                                <input
                                  type="text"
                                  name="gameDay"
                                  className="form-control"
                                  value={teamForm.gameDay}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Game Time</label>
                                <input
                                  type="text"
                                  name="gameTime"
                                  className="form-control"
                                  value={teamForm.gameTime}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label">Description</label>
                                <textarea
                                  name="description"
                                  className="form-control"
                                  rows="3"
                                  value={teamForm.description}
                                  onChange={handleTeamFormChange}
                                />
                              </div>
                              <div className="col-12">
                                <div className="form-check">
                                  <input
                                    type="checkbox"
                                    name="visible"
                                    className="form-check-input"
                                    checked={teamForm.visible}
                                    onChange={handleTeamFormChange}
                                  />
                                  <label className="form-check-label">
                                    Visible to public
                                  </label>
                                </div>
                              </div>
                              <div className="col-12">
                                <button type="submit" className="btn btn-success w-100" disabled={teamsLoading}>
                                  {teamsLoading ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team')}
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <>
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${teamsActiveTab === 'overview' ? 'active' : ''}`}
                                  onClick={() => setTeamsActiveTab('overview')}
                                >
                                  📊 Overview
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${teamsActiveTab === 'all' ? 'active' : ''}`}
                                  onClick={() => setTeamsActiveTab('all')}
                                >
                                  📋 All Teams
                                </button>
                              </li>
                            </ul>

                            {/* Overview Tab */}
                            {teamsActiveTab === 'overview' && (
                              <div>
                                {/* Statistics Cards */}
                                <div className="row g-3 mb-4">
                                  <div className="col-md-3">
                                    <div className="card bg-primary bg-opacity-10 border-primary">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-primary">{teamStats.total}</h2>
                                        <p className="text-muted mb-0">Total Teams</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-success bg-opacity-10 border-success">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-success">{teamStats.active}</h2>
                                        <p className="text-muted mb-0">Active</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-warning bg-opacity-10 border-warning">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-warning">{teamStats.forming}</h2>
                                        <p className="text-muted mb-0">Forming</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-info bg-opacity-10 border-info">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-info">{teamStats.full}</h2>
                                        <p className="text-muted mb-0">Full</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Age Groups */}
                                {teamStats.byAgeGroup.length > 0 && (
                                  <div className="mb-4">
                                    <h5 className="mb-3">Teams by Age Group</h5>
                                    <div className="row g-3">
                                      {teamStats.byAgeGroup.map((group) => (
                                        <div key={group.name} className="col-md-2">
                                          <div className="card h-100">
                                            <div className="card-body text-center">
                                              <h3 className="mb-0">{group.count}</h3>
                                              <p className="text-muted small mb-0">{group.name}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Levels */}
                                {teamStats.byLevel.length > 0 && (
                                  <div>
                                    <h5 className="mb-3">Teams by Level</h5>
                                    <div className="row g-3">
                                      {teamStats.byLevel.map((level) => (
                                        <div key={level.name} className="col-md-4">
                                          <div className="card h-100">
                                            <div className="card-body text-center">
                                              <h3 className="mb-0">{level.count}</h3>
                                              <p className="text-muted small mb-0">{level.name}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* All Teams Tab */}
                            {teamsActiveTab === 'all' && (
                              <div>
                                <div className="table-responsive">
                                  <table className="table table-hover">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Team Name</th>
                                        <th>Age Group</th>
                                        <th>Level</th>
                                        <th>Status</th>
                                        <th>Coach</th>
                                        <th>Players</th>
                                        <th>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {managedTeams.length === 0 ? (
                                        <tr>
                                          <td colSpan="7" className="text-center py-5">
                                            <div className="text-muted">
                                              <i className="bi bi-people-fill" style={{fontSize: '3rem'}}></i>
                                              <p className="mt-2">No teams found</p>
                                              <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => {
                                                  resetTeamForm();
                                                  setShowTeamForm(true);
                                                }}
                                              >
                                                Create First Team
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : (
                                        managedTeams.map((team) => (
                                          <tr key={team._id}>
                                            <td><strong>{team.name}</strong></td>
                                            <td>{team.ageGroup}</td>
                                            <td><span className="badge bg-secondary">{team.level}</span></td>
                                            <td>
                                              <span className={`badge bg-${
                                                team.status === 'Active' ? 'success' : 
                                                team.status === 'Forming' ? 'warning' :
                                                team.status === 'Full' ? 'info' : 'secondary'
                                              }`}>
                                                {team.status}
                                              </span>
                                            </td>
                                            <td>{team.coach}</td>
                                            <td>{team.currentPlayers} / {team.maxPlayers}</td>
                                            <td>
                                              <div className="btn-group btn-group-sm">
                                                <button
                                                  className="btn btn-outline-primary"
                                                  onClick={() => handleEditTeam(team)}
                                                  title="Edit"
                                                >
                                                  <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                  className="btn btn-outline-danger"
                                                  onClick={() => handleDeleteTeam(team._id)}
                                                  title="Delete"
                                                >
                                                  <i className="bi bi-trash"></i>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'events' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        {eventsLoading ? (
                          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : showEventForm ? (
                          <form onSubmit={handleEventSubmit}>
                            <div className="d-flex justify-content-between mb-3">
                              <h5>{editingEvent ? 'Edit' : 'Create'} Event</h5>
                              <button type="button" className="btn btn-secondary" onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>Cancel</button>
                            </div>
                            <div className="row g-3">
                              <div className="col-md-6"><label>Title *</label><input type="text" className="form-control" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} required /></div>
                              <div className="col-md-6"><label>Category</label><select className="form-select" value={eventForm.category} onChange={(e) => setEventForm({...eventForm, category: e.target.value})}><option>Tournament</option><option>Meeting</option><option>Training</option><option>Social</option></select></div>
                              <div className="col-md-6"><label>Date *</label><input type="date" className="form-control" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} required /></div>
                              <div className="col-md-6"><label>Time</label><input type="time" className="form-control" value={eventForm.time} onChange={(e) => setEventForm({...eventForm, time: e.target.value})} /></div>
                              <div className="col-md-6"><label>Location</label><input type="text" className="form-control" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} /></div>
                              <div className="col-md-6"><label>Visibility</label><select className="form-select" value={eventForm.visibility} onChange={(e) => setEventForm({...eventForm, visibility: e.target.value})}><option>Public</option><option>Members Only</option><option>Internal</option><option>Private</option></select></div>
                              <div className="col-md-6"><label>Capacity</label><input type="number" className="form-control" value={eventForm.capacity} onChange={(e) => setEventForm({...eventForm, capacity: parseInt(e.target.value) || 0})} /></div>
                              <div className="col-md-6"><label>Fee ($)</label><input type="number" className="form-control" value={eventForm.fee} onChange={(e) => setEventForm({...eventForm, fee: parseFloat(e.target.value) || 0})} /></div>
                              <div className="col-12"><label>Description</label><textarea className="form-control" rows="2" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})}></textarea></div>
                              <div className="col-12"><button type="submit" className="btn btn-success w-100">{eventsLoading ? 'Saving...' : (editingEvent ? 'Update' : 'Create')}</button></div>
                            </div>
                          </form>
                        ) : (
                          <>
                            <button className="btn btn-primary mb-3" onClick={() => setShowEventForm(true)}><i className="bi bi-plus-circle me-1"></i> New Event</button>
                            <table className="table table-hover">
                              <thead className="table-light"><tr><th>Event</th><th>Date & Time</th><th>Category</th><th>Visibility</th><th>Capacity</th><th>Actions</th></tr></thead>
                              <tbody>
                                {events.length === 0 ? (
                                  <tr><td colSpan="6" className="text-center py-5"><p className="text-muted mb-0">No events scheduled</p></td></tr>
                                ) : (
                                  events.map((event) => (
                                    <tr key={event._id}>
                                      <td><strong>{event.title}</strong><br/><small className="text-muted">{event.location}</small></td>
                                      <td>{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}<br/><small>{event.time}</small></td>
                                      <td><span className="badge bg-info">{event.category}</span></td>
                                      <td><span className="badge bg-secondary">{event.visibility}</span></td>
                                      <td>{event.registered || 0}/{event.capacity}</td>
                                      <td>
                                        <div className="btn-group btn-group-sm">
                                          <button className="btn btn-outline-primary" onClick={() => { setEventForm(event); setEditingEvent(event); setShowEventForm(true); }}><i className="bi bi-pencil"></i></button>
                                          <button className="btn btn-outline-danger" onClick={() => handleDeleteEvent(event._id)}><i className="bi bi-trash"></i></button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'media' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        {/* Tabs */}
                        <div className="btn-group mb-3 w-100" role="group">
                          <button 
                            type="button" 
                            className={`btn ${mediaTab === 'all' ? 'btn-primary' : 'btn-outline-primary'}`} 
                            onClick={() => setMediaTab('all')}
                            style={{flex: 1}}
                          >
                            <i className="bi bi-images me-1"></i> All Media ({Array.isArray(mediaItems) ? mediaItems.length : 0})
                          </button>
                          <button 
                            type="button" 
                            className={`btn ${mediaTab === 'pending' ? 'btn-primary' : 'btn-outline-primary'}`} 
                            onClick={() => setMediaTab('pending')}
                            style={{flex: 1}}
                          >
                            <i className="bi bi-clock-history me-1"></i> Pending Approval
                          </button>
                          <button 
                            type="button" 
                            className={`btn ${mediaTab === 'flagged' ? 'btn-primary' : 'btn-outline-primary'}`} 
                            onClick={() => setMediaTab('flagged')}
                            style={{flex: 1}}
                          >
                            <i className="bi bi-flag-fill me-1"></i> Flagged
                          </button>
                        </div>

                        {/* Upload Button */}
                        {!showUploadForm && (
                          <button className="btn btn-primary mb-3" onClick={() => setShowUploadForm(true)}>
                            <i className="bi bi-cloud-upload me-1"></i> Upload Media
                          </button>
                        )}

                        {/* Upload Form */}
                        {showUploadForm && (
                          <div className="card mb-3 border-primary">
                            <div className="card-header bg-primary text-white">
                              <h6 className="mb-0"><i className="bi bi-cloud-upload me-2"></i>Upload New Media</h6>
                            </div>
                            <div className="card-body">
                              <form onSubmit={handleMediaUpload}>
                                <div className="row g-3">
                                  <div className="col-md-6">
                                    <label className="form-label">Title *</label>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      value={mediaForm.title}
                                      onChange={(e) => setMediaForm({...mediaForm, title: e.target.value})}
                                      required
                                      placeholder="Enter media title"
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <label className="form-label">Category *</label>
                                    <select 
                                      className="form-select"
                                      value={mediaForm.category}
                                      onChange={(e) => setMediaForm({...mediaForm, category: e.target.value})}
                                    >
                                      <option>Match Photos</option>
                                      <option>Training</option>
                                      <option>Events</option>
                                      <option>Players</option>
                                      <option>Teams</option>
                                      <option>Facilities</option>
                                      <option>Trophies</option>
                                      <option>Action Shots</option>
                                      <option>Fans</option>
                                      <option>Other</option>
                                    </select>
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Description</label>
                                    <textarea 
                                      className="form-control" 
                                      rows="2"
                                      value={mediaForm.description}
                                      onChange={(e) => setMediaForm({...mediaForm, description: e.target.value})}
                                      placeholder="Add a description..."
                                    ></textarea>
                                  </div>
                                  <div className="col-12">
                                    <label className="form-label">Image File *</label>
                                    <input 
                                      type="file" 
                                      className="form-control"
                                      accept="image/*"
                                      onChange={(e) => setMediaForm({...mediaForm, file: e.target.files[0]})}
                                      required
                                    />
                                    <small className="text-muted">Accepted formats: JPG, PNG, GIF (Max 10MB)</small>
                                  </div>
                                  <div className="col-12">
                                    <button type="submit" className="btn btn-success me-2" disabled={uploadingMedia}>
                                      {uploadingMedia ? <><span className="spinner-border spinner-border-sm me-1"></span> Uploading...</> : 'Upload'}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                      setShowUploadForm(false);
                                      setMediaForm({ title: "", description: "", category: "Match Photos", file: null });
                                    }}>Cancel</button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}

                        {/* Media Grid */}
                        {mediaLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                            <p className="text-muted mt-2">Loading media...</p>
                          </div>
                        ) : !mediaItems || mediaItems.length === 0 ? (
                          <div className="text-center py-5">
                            <i className="bi bi-images" style={{fontSize: '4rem', color: '#ccc'}}></i>
                            <p className="text-muted mt-2 mb-0">No media items found</p>
                          </div>
                        ) : (
                          <div className="row g-3">
                            {Array.isArray(mediaItems) && mediaItems.map(item => (
                              <div key={item._id} className="col-md-4 col-lg-3">
                                <div className="card h-100">
                                  <img 
                                    src={`http://localhost:5000${item.imageUrl}`} 
                                    alt={item.title}
                                    className="card-img-top"
                                    style={{height: '200px', objectFit: 'cover'}}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'; }}
                                  />
                                  <div className="card-body p-2">
                                    <h6 className="card-title mb-1 text-truncate" title={item.title}>{item.title}</h6>
                                    <p className="card-text small text-muted mb-2 text-truncate" title={item.description}>
                                      {item.description || 'No description'}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className="badge bg-info">{item.category}</span>
                                      <span className={`badge bg-${item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}`}>
                                        {item.status}
                                      </span>
                                    </div>
                                    <div className="small text-muted mb-2">
                                      <i className="bi bi-eye me-1"></i>{item.viewCount || 0} views
                                      <i className="bi bi-heart ms-2 me-1"></i>{item.likes?.length || 0} likes
                                    </div>
                                  </div>
                                  <div className="card-footer p-2 bg-white border-top">
                                    <div className="btn-group btn-group-sm w-100">
                                      {item.status === 'pending' && (
                                        <>
                                          <button 
                                            className="btn btn-outline-success" 
                                            onClick={() => handleApproveMedia(item._id)}
                                            title="Approve"
                                          >
                                            <i className="bi bi-check-lg"></i>
                                          </button>
                                          <button 
                                            className="btn btn-outline-danger" 
                                            onClick={() => handleRejectMedia(item._id)}
                                            title="Reject"
                                          >
                                            <i className="bi bi-x-lg"></i>
                                          </button>
                                        </>
                                      )}
                                      <button 
                                        className="btn btn-outline-danger" 
                                        onClick={() => handleDeleteMedia(item._id)}
                                        title="Delete"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'fans-gallery' && (
              <div>
                {/* Gallery Statistics */}
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">1,456</h4>
                            <p className="mb-0">Total Photos</p>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-image fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">23</h4>
                            <p className="mb-0">Pending Review</p>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-clock-history fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">12.5K</h4>
                            <p className="mb-0">Total Likes</p>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-heart-fill fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">45</h4>
                            <p className="mb-0">Albums</p>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-collection fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Moderation */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Pending Moderation</h5>
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-upload me-2"></i>Upload Content
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Preview</th>
                                <th>Submitted By</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><img src="https://via.placeholder.com/60" alt="Preview" className="img-thumbnail" /></td>
                                <td>John Smith</td>
                                <td><span className="badge bg-primary">Photo</span></td>
                                <td>2 hours ago</td>
                                <td>
                                  <button className="btn btn-sm btn-success me-1">
                                    <i className="bi bi-check"></i> Approve
                                  </button>
                                  <button className="btn btn-sm btn-danger">
                                    <i className="bi bi-x"></i> Reject
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td><img src="https://via.placeholder.com/60" alt="Preview" className="img-thumbnail" /></td>
                                <td>Sarah Johnson</td>
                                <td><span className="badge bg-info">Video</span></td>
                                <td>4 hours ago</td>
                                <td>
                                  <button className="btn btn-sm btn-success me-1">
                                    <i className="bi bi-check"></i> Approve
                                  </button>
                                  <button className="btn btn-sm btn-danger">
                                    <i className="bi bi-x"></i> Reject
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td><img src="https://via.placeholder.com/60" alt="Preview" className="img-thumbnail" /></td>
                                <td>Mike Davis</td>
                                <td><span className="badge bg-primary">Photo</span></td>
                                <td>6 hours ago</td>
                                <td>
                                  <button className="btn btn-sm btn-success me-1">
                                    <i className="bi bi-check"></i> Approve
                                  </button>
                                  <button className="btn btn-sm btn-danger">
                                    <i className="bi bi-x"></i> Reject
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery Albums */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Recent Albums</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group">
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-collection text-primary fs-4 me-3"></i>
                              <div>
                                <h6 className="mb-0">Championship Finals 2024</h6>
                                <small className="text-muted">145 photos</small>
                              </div>
                            </div>
                            <button className="btn btn-sm btn-outline-primary">Manage</button>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-collection text-success fs-4 me-3"></i>
                              <div>
                                <h6 className="mb-0">Training Sessions</h6>
                                <small className="text-muted">89 photos</small>
                              </div>
                            </div>
                            <button className="btn btn-sm btn-outline-primary">Manage</button>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-collection text-warning fs-4 me-3"></i>
                              <div>
                                <h6 className="mb-0">Fan Meetup Events</h6>
                                <small className="text-muted">67 photos</small>
                              </div>
                            </div>
                            <button className="btn btn-sm btn-outline-primary">Manage</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Content */}
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Featured Content</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group">
                          <div className="list-group-item">
                            <div className="d-flex align-items-center">
                              <img src="https://via.placeholder.com/60" alt="Featured" className="img-thumbnail me-3" />
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Winning Goal Celebration</h6>
                                <small className="text-muted">1,247 likes • 89 comments</small>
                              </div>
                              <button className="btn btn-sm btn-outline-warning">
                                <i className="bi bi-star-fill"></i>
                              </button>
                            </div>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex align-items-center">
                              <img src="https://via.placeholder.com/60" alt="Featured" className="img-thumbnail me-3" />
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Team Spirit Photo</h6>
                                <small className="text-muted">945 likes • 56 comments</small>
                              </div>
                              <button className="btn btn-sm btn-outline-warning">
                                <i className="bi bi-star-fill"></i>
                              </button>
                            </div>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex align-items-center">
                              <img src="https://via.placeholder.com/60" alt="Featured" className="img-thumbnail me-3" />
                              <div className="flex-grow-1">
                                <h6 className="mb-1">Amazing Save Moment</h6>
                                <small className="text-muted">823 likes • 42 comments</small>
                              </div>
                              <button className="btn btn-sm btn-outline-warning">
                                <i className="bi bi-star-fill"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Analytics */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Gallery Analytics</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-primary">45K</h4>
                              <p className="mb-0">Total Views</p>
                            </div>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-success">12.5K</h4>
                              <p className="mb-0">Total Likes</p>
                            </div>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-warning">3.2K</h4>
                              <p className="mb-0">Shares</p>
                            </div>
                          </div>
                          <div className="col-md-3 text-center mb-3">
                            <div className="border rounded p-3">
                              <h4 className="text-info">890</h4>
                              <p className="mb-0">Comments</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'communications' && (
              <div>
                {/* Communications Sub-Navigation */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        <div className="btn-group w-100" role="group">
                          <button
                            type="button"
                            className={`btn ${activeSubSection === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveSubSection('overview')}
                          >
                            <i className="bi bi-chat-dots me-2"></i>Overview
                          </button>
                          <button
                            type="button"
                            className={`btn ${activeSubSection === 'notifications' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveSubSection('notifications')}
                          >
                            <i className="bi bi-bell me-2"></i>Notifications
                          </button>
                          <button
                            type="button"
                            className={`btn ${activeSubSection === 'broadcasts' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveSubSection('broadcasts')}
                          >
                            <i className="bi bi-megaphone me-2"></i>Broadcasts
                          </button>
                          <button
                            type="button"
                            className={`btn ${activeSubSection === 'messages' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveSubSection('messages')}
                          >
                            <i className="bi bi-envelope me-2"></i>Messages
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communications Content */}
                {activeSubSection === 'overview' && (
                  <div className="row">
                    {/* Key Metrics */}
                    <div className="col-12 mb-4">
                      <div className="row">
                        <div className="col-lg-3 col-md-6 mb-3">
                          <div className="card bg-primary text-white">
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h4 className="mb-0">1,247</h4>
                                  <p className="mb-0">Total Notifications</p>
                                </div>
                                <div className="align-self-center">
                                  <i className="bi bi-bell fs-1"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                          <div className="card bg-success text-white">
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h4 className="mb-0">89%</h4>
                                  <p className="mb-0">Delivery Rate</p>
                                </div>
                                <div className="align-self-center">
                                  <i className="bi bi-check-circle fs-1"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                          <div className="card bg-warning text-white">
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h4 className="mb-0">23</h4>
                                  <p className="mb-0">Active Broadcasts</p>
                                </div>
                                <div className="align-self-center">
                                  <i className="bi bi-megaphone fs-1"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                          <div className="card bg-info text-white">
                            <div className="card-body">
                              <div className="d-flex justify-content-between">
                                <div>
                                  <h4 className="mb-0">156</h4>
                                  <p className="mb-0">Unread Messages</p>
                                </div>
                                <div className="align-self-center">
                                  <i className="bi bi-envelope fs-1"></i>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="col-lg-8 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4 mb-3">
                              <button className="btn btn-outline-primary w-100 h-100 py-4" onClick={() => setActiveSubSection('notifications')}>
                                <i className="bi bi-bell fs-2 d-block mb-2"></i>
                                <strong>Send Notification</strong>
                                <br /><small>Create and send notifications</small>
                              </button>
                            </div>
                            <div className="col-md-4 mb-3">
                              <button className="btn btn-outline-success w-100 h-100 py-4" onClick={() => setActiveSubSection('broadcasts')}>
                                <i className="bi bi-megaphone fs-2 d-block mb-2"></i>
                                <strong>Create Broadcast</strong>
                                <br /><small>Send mass communications</small>
                              </button>
                            </div>
                            <div className="col-md-4 mb-3">
                              <button className="btn btn-outline-warning w-100 h-100 py-4" onClick={() => setActiveSubSection('messages')}>
                                <i className="bi bi-envelope fs-2 d-block mb-2"></i>
                                <strong>Send Message</strong>
                                <br /><small>Direct messaging</small>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Recent Activity</h5>
                        </div>
                        <div className="card-body p-0">
                          <div className="list-group list-group-flush">
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-bell text-primary me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Match Reminder Sent</h6>
                                  <small className="text-muted">2 minutes ago</small>
                                </div>
                                <span className="badge bg-success">Sent</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-megaphone text-success me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Training Schedule Broadcast</h6>
                                  <small className="text-muted">1 hour ago</small>
                                </div>
                                <span className="badge bg-warning">Pending</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-envelope text-warning me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">New Message from Coach</h6>
                                  <small className="text-muted">3 hours ago</small>
                                </div>
                                <span className="badge bg-info">Unread</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-bell text-primary me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Payment Reminder</h6>
                                  <small className="text-muted">5 hours ago</small>
                                </div>
                                <span className="badge bg-success">Delivered</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication Channels */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Communication Channels</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-4">
                              <div className="card text-center border-primary">
                                <div className="card-body">
                                  <i className="bi bi-bell display-4 text-primary"></i>
                                  <h5 className="mt-3">Notifications</h5>
                                  <p className="text-muted">System alerts, reminders, and updates</p>
                                  <div className="mt-3">
                                    <span className="badge bg-primary me-2">Active: 1,247</span>
                                    <span className="badge bg-success">Rate: 89%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="card text-center border-success">
                                <div className="card-body">
                                  <i className="bi bi-megaphone display-4 text-success"></i>
                                  <h5 className="mt-3">Broadcasts</h5>
                                  <p className="text-muted">Mass communication to user groups</p>
                                  <div className="mt-3">
                                    <span className="badge bg-success me-2">Active: 23</span>
                                    <span className="badge bg-info">Reach: 2.1K</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="card text-center border-warning">
                                <div className="card-body">
                                  <i className="bi bi-envelope display-4 text-warning"></i>
                                  <h5 className="mt-3">Messages</h5>
                                  <p className="text-muted">Direct messaging and conversations</p>
                                  <div className="mt-3">
                                    <span className="badge bg-warning me-2">Unread: 156</span>
                                    <span className="badge bg-primary">Total: 3.2K</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'notifications' && (
                  <div className="row">
                    {/* Create Notification */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Create Notification</h5>
                        </div>
                        <div className="card-body">
                          <form>
                            <div className="mb-3">
                              <label className="form-label">Title</label>
                              <input type="text" className="form-control" placeholder="Notification title" />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Message</label>
                              <textarea className="form-control" rows="3" placeholder="Notification message"></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Type</label>
                              <select className="form-select">
                                <option>System Alert</option>
                                <option>Event Reminder</option>
                                <option>Payment Notice</option>
                                <option>General Announcement</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Target Audience</label>
                              <select className="form-select">
                                <option>All Users</option>
                                <option>Players Only</option>
                                <option>Coaches Only</option>
                                <option>Parents Only</option>
                                <option>Specific Team</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Priority</label>
                              <select className="form-select">
                                <option>Low</option>
                                <option>Normal</option>
                                <option>High</option>
                                <option>Urgent</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="emailNotification" />
                                <label className="form-check-label" htmlFor="emailNotification">
                                  Send Email
                                </label>
                              </div>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="pushNotification" />
                                <label className="form-check-label" htmlFor="pushNotification">
                                  Send Push Notification
                                </label>
                              </div>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="smsNotification" />
                                <label className="form-check-label" htmlFor="smsNotification">
                                  Send SMS
                                </label>
                              </div>
                            </div>
                            <div className="d-grid gap-2">
                              <button className="btn btn-primary">Send Notification</button>
                              <button className="btn btn-outline-secondary">Save as Draft</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* Notification Templates */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Quick Templates</h5>
                        </div>
                        <div className="card-body">
                          <div className="list-group list-group-flush">
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Match Reminder</h6>
                                <small>Event</small>
                              </div>
                              <p className="mb-1">Reminder about upcoming match</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Training Schedule</h6>
                                <small>Event</small>
                              </div>
                              <p className="mb-1">Weekly training schedule update</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Payment Due</h6>
                                <small>Payment</small>
                              </div>
                              <p className="mb-1">Monthly fee payment reminder</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Weather Alert</h6>
                                <small>System</small>
                              </div>
                              <p className="mb-1">Weather-related training updates</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Equipment Return</h6>
                                <small>General</small>
                              </div>
                              <p className="mb-1">Equipment return reminder</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Recent Notifications</h5>
                        </div>
                        <div className="card-body p-0">
                          <div className="list-group list-group-flush">
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-bell text-primary me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Match Tomorrow</h6>
                                  <small className="text-muted">Sent to 45 players</small>
                                </div>
                                <span className="badge bg-success">Sent</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-exclamation-triangle text-warning me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Payment Overdue</h6>
                                  <small className="text-muted">Sent to 12 parents</small>
                                </div>
                                <span className="badge bg-warning">Pending</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-cloud-rain text-info me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Weather Alert</h6>
                                  <small className="text-muted">Sent to all users</small>
                                </div>
                                <span className="badge bg-success">Delivered</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-calendar-event text-success me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Training Update</h6>
                                  <small className="text-muted">Sent to U16 team</small>
                                </div>
                                <span className="badge bg-success">Sent</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notification Analytics */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Notification Analytics</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-primary">1,247</h4>
                                <p className="mb-0">Total Sent</p>
                              </div>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-success">89%</h4>
                                <p className="mb-0">Delivery Rate</p>
                              </div>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-info">76%</h4>
                                <p className="mb-0">Open Rate</p>
                              </div>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-warning">2.3s</h4>
                                <p className="mb-0">Avg. Response</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'broadcasts' && (
                  <div className="row">
                    {/* Create Broadcast */}
                    <div className="col-lg-6 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Create Broadcast</h5>
                        </div>
                        <div className="card-body">
                          <form>
                            <div className="mb-3">
                              <label className="form-label">Broadcast Title</label>
                              <input type="text" className="form-control" placeholder="Enter broadcast title" />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Message</label>
                              <textarea className="form-control" rows="4" placeholder="Enter your broadcast message"></textarea>
                            </div>
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Target Audience</label>
                                <select className="form-select">
                                  <option>All Users (2,100)</option>
                                  <option>Players Only (1,200)</option>
                                  <option>Coaches Only (45)</option>
                                  <option>Parents Only (850)</option>
                                  <option>U16 Team (25)</option>
                                  <option>U18 Team (30)</option>
                                  <option>Senior Team (35)</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Priority</label>
                                <select className="form-select">
                                  <option>Normal</option>
                                  <option>High</option>
                                  <option>Urgent</option>
                                </select>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Delivery Method</label>
                              <div className="row">
                                <div className="col-md-4">
                                  <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="broadcastEmail" defaultChecked />
                                    <label className="form-check-label" htmlFor="broadcastEmail">
                                      Email
                                    </label>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="broadcastPush" defaultChecked />
                                    <label className="form-check-label" htmlFor="broadcastPush">
                                      Push Notification
                                    </label>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="broadcastSMS" />
                                    <label className="form-check-label" htmlFor="broadcastSMS">
                                      SMS
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Schedule</label>
                              <select className="form-select">
                                <option>Send Now</option>
                                <option>Schedule for Later</option>
                                <option>Recurring</option>
                              </select>
                            </div>
                            <div className="d-grid gap-2">
                              <button className="btn btn-success">Send Broadcast</button>
                              <button className="btn btn-outline-secondary">Save as Draft</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* Broadcast Templates */}
                    <div className="col-lg-6 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Broadcast Templates</h5>
                        </div>
                        <div className="card-body">
                          <div className="list-group">
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Match Announcement</h6>
                                <small>Event</small>
                              </div>
                              <p className="mb-1">Template for match announcements and updates</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Training Schedule</h6>
                                <small>Schedule</small>
                              </div>
                              <p className="mb-1">Weekly training schedule updates</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Payment Reminder</h6>
                                <small>Payment</small>
                              </div>
                              <p className="mb-1">Monthly fee payment reminders</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Weather Alert</h6>
                                <small>Alert</small>
                              </div>
                              <p className="mb-1">Weather-related training updates</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Equipment Notice</h6>
                                <small>General</small>
                              </div>
                              <p className="mb-1">Equipment collection and return notices</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Broadcasts */}
                    <div className="col-lg-8 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Active Broadcasts</h5>
                        </div>
                        <div className="card-body p-0">
                          <div className="table-responsive">
                            <table className="table table-hover mb-0">
                              <thead>
                                <tr>
                                  <th>Title</th>
                                  <th>Audience</th>
                                  <th>Status</th>
                                  <th>Sent</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>
                                    <div>
                                      <strong>Championship Match Tomorrow</strong>
                                      <br /><small className="text-muted">Reminder about tomorrow's championship match</small>
                                    </div>
                                  </td>
                                  <td>All Players (1,200)</td>
                                  <td><span className="badge bg-success">Delivered</span></td>
                                  <td>2 hours ago</td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-primary">View</button>
                                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <div>
                                      <strong>Training Schedule Update</strong>
                                      <br /><small className="text-muted">Updated training times for this week</small>
                                    </div>
                                  </td>
                                  <td>U16 Team (25)</td>
                                  <td><span className="badge bg-warning">Sending</span></td>
                                  <td>In progress</td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-primary">View</button>
                                    <button className="btn btn-sm btn-outline-danger">Cancel</button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <div>
                                      <strong>Payment Due Reminder</strong>
                                      <br /><small className="text-muted">Monthly fees due this week</small>
                                    </div>
                                  </td>
                                  <td>Parents (850)</td>
                                  <td><span className="badge bg-info">Scheduled</span></td>
                                  <td>Tomorrow 9:00 AM</td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-primary">View</button>
                                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <div>
                                      <strong>Weather Alert</strong>
                                      <br /><small className="text-muted">Training cancelled due to weather</small>
                                    </div>
                                  </td>
                                  <td>All Users (2,100)</td>
                                  <td><span className="badge bg-success">Delivered</span></td>
                                  <td>4 hours ago</td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-primary">View</button>
                                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Broadcast Analytics */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Broadcast Analytics</h5>
                        </div>
                        <div className="card-body">
                          <div className="text-center mb-3">
                            <h4 className="text-success">23</h4>
                            <p className="mb-0">Active Broadcasts</p>
                          </div>
                          <div className="text-center mb-3">
                            <h4 className="text-primary">2,100</h4>
                            <p className="mb-0">Total Reach</p>
                          </div>
                          <div className="text-center mb-3">
                            <h4 className="text-info">89%</h4>
                            <p className="mb-0">Delivery Rate</p>
                          </div>
                          <div className="text-center mb-3">
                            <h4 className="text-warning">76%</h4>
                            <p className="mb-0">Open Rate</p>
                          </div>
                          <hr />
                          <div className="d-grid gap-2">
                            <button className="btn btn-outline-primary btn-sm">View Full Analytics</button>
                            <button className="btn btn-outline-secondary btn-sm">Export Report</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'messages' && (
                  <div className="row">
                    {/* Send Message */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Send Message</h5>
                        </div>
                        <div className="card-body">
                          <form>
                            <div className="mb-3">
                              <label className="form-label">Recipient</label>
                              <select className="form-select">
                                <option>Select recipient...</option>
                                <option>All Players</option>
                                <option>All Coaches</option>
                                <option>All Parents</option>
                                <option>U16 Team</option>
                                <option>U18 Team</option>
                                <option>Senior Team</option>
                                <option>Specific User</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Subject</label>
                              <input type="text" className="form-control" placeholder="Message subject" />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Message</label>
                              <textarea className="form-control" rows="4" placeholder="Type your message here"></textarea>
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Priority</label>
                              <select className="form-select">
                                <option>Normal</option>
                                <option>High</option>
                                <option>Urgent</option>
                              </select>
                            </div>
                            <div className="mb-3">
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="messageEmail" />
                                <label className="form-check-label" htmlFor="messageEmail">
                                  Send Email Copy
                                </label>
                              </div>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="messageSMS" />
                                <label className="form-check-label" htmlFor="messageSMS">
                                  Send SMS Copy
                                </label>
                              </div>
                            </div>
                            <div className="d-grid gap-2">
                              <button className="btn btn-warning">Send Message</button>
                              <button className="btn btn-outline-secondary">Save as Draft</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* Message Templates */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Message Templates</h5>
                        </div>
                        <div className="card-body">
                          <div className="list-group">
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Welcome Message</h6>
                                <small>General</small>
                              </div>
                              <p className="mb-1">Welcome new members to the club</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Training Reminder</h6>
                                <small>Event</small>
                              </div>
                              <p className="mb-1">Remind players about training sessions</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Payment Follow-up</h6>
                                <small>Payment</small>
                              </div>
                              <p className="mb-1">Follow up on overdue payments</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Equipment Notice</h6>
                                <small>Equipment</small>
                              </div>
                              <p className="mb-1">Equipment collection and return notices</p>
                            </button>
                            <button className="list-group-item list-group-item-action">
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">Team Update</h6>
                                <small>Team</small>
                              </div>
                              <p className="mb-1">Team roster and schedule updates</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="col-lg-4 mb-4">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Recent Messages</h5>
                        </div>
                        <div className="card-body p-0">
                          <div className="list-group list-group-flush">
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-envelope text-warning me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Training Update</h6>
                                  <small className="text-muted">To: U16 Team</small>
                                </div>
                                <span className="badge bg-success">Sent</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-envelope text-primary me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Payment Reminder</h6>
                                  <small className="text-muted">To: 12 Parents</small>
                                </div>
                                <span className="badge bg-warning">Pending</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-envelope text-success me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Match Announcement</h6>
                                  <small className="text-muted">To: All Players</small>
                                </div>
                                <span className="badge bg-success">Delivered</span>
                              </div>
                            </div>
                            <div className="list-group-item">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-envelope text-info me-3"></i>
                                <div className="flex-grow-1">
                                  <h6 className="mb-1">Equipment Notice</h6>
                                  <small className="text-muted">To: Senior Team</small>
                                </div>
                                <span className="badge bg-success">Sent</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message Analytics */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Message Analytics</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-warning">3,247</h4>
                                <p className="mb-0">Total Messages</p>
                              </div>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-primary">156</h4>
                                <p className="mb-0">Unread</p>
                              </div>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-success">92%</h4>
                                <p className="mb-0">Delivery Rate</p>
                              </div>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="border rounded p-3">
                                <h4 className="text-info">1.2h</h4>
                                <p className="mb-0">Avg. Response</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'notifications' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <i className="bi bi-bell me-2"></i>Notification Management
                        </h5>
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-plus me-1"></i>Create Notification
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-lg-8 col-md-12 mb-4">
                            <div className="card">
                              <div className="card-header">
                                <h6 className="mb-0">Recent Notifications</h6>
                              </div>
                              <div className="card-body p-0">
                                <div className="list-group list-group-flush">
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-info-circle text-info fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">System Maintenance Scheduled</h6>
                                      <small className="text-muted">Scheduled for tomorrow at 2:00 AM</small>
                                    </div>
                                    <span className="badge bg-info">System</span>
                                  </div>
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-calendar-event text-warning fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">Championship Match Reminder</h6>
                                      <small className="text-muted">Match starts in 2 hours</small>
                                    </div>
                                    <span className="badge bg-warning">Event</span>
                                  </div>
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-person-plus text-success fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">New Player Registration</h6>
                                      <small className="text-muted">Alex Johnson joined the team</small>
                                    </div>
                                    <span className="badge bg-success">User</span>
                                  </div>
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-exclamation-triangle text-danger fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">Payment Failed</h6>
                                      <small className="text-muted">Monthly fee payment failed for 3 users</small>
                                    </div>
                                    <span className="badge bg-danger">Payment</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-12 mb-4">
                            <div className="card">
                              <div className="card-header">
                                <h6 className="mb-0">Notification Settings</h6>
                              </div>
                              <div className="card-body">
                                <div className="form-check mb-3">
                                  <input className="form-check-input" type="checkbox" id="emailNotifications" defaultChecked />
                                  <label className="form-check-label" htmlFor="emailNotifications">
                                    Email Notifications
                                  </label>
                                </div>
                                <div className="form-check mb-3">
                                  <input className="form-check-input" type="checkbox" id="pushNotifications" defaultChecked />
                                  <label className="form-check-label" htmlFor="pushNotifications">
                                    Push Notifications
                                  </label>
                                </div>
                                <div className="form-check mb-3">
                                  <input className="form-check-input" type="checkbox" id="smsNotifications" />
                                  <label className="form-check-label" htmlFor="smsNotifications">
                                    SMS Notifications
                                  </label>
                                </div>
                                <div className="form-check mb-3">
                                  <input className="form-check-input" type="checkbox" id="systemAlerts" defaultChecked />
                                  <label className="form-check-label" htmlFor="systemAlerts">
                                    System Alerts
                                  </label>
                                </div>
                                <hr />
                                <button className="btn btn-outline-primary btn-sm w-100">Save Settings</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'broadcasting' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                          <i className="bi bi-megaphone me-2"></i>Broadcasting Center
                        </h5>
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-plus me-1"></i>Create Broadcast
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-lg-8 col-md-12 mb-4">
                            <div className="card">
                              <div className="card-header">
                                <h6 className="mb-0">Recent Broadcasts</h6>
                              </div>
                              <div className="card-body p-0">
                                <div className="list-group list-group-flush">
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-megaphone text-primary fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">Championship Match Update</h6>
                                      <small className="text-muted">Sent to all players and parents - 2 hours ago</small>
                                    </div>
                                    <div className="text-end">
                                      <span className="badge bg-success">Sent</span>
                                      <br />
                                      <small className="text-muted">247 recipients</small>
                                    </div>
                                  </div>
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-calendar text-warning fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">Training Schedule Change</h6>
                                      <small className="text-muted">Sent to Youth Team A - 5 hours ago</small>
                                    </div>
                                    <div className="text-end">
                                      <span className="badge bg-success">Sent</span>
                                      <br />
                                      <small className="text-muted">18 recipients</small>
                                    </div>
                                  </div>
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-credit-card text-info fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">Payment Reminder</h6>
                                      <small className="text-muted">Sent to overdue accounts - 1 day ago</small>
                                    </div>
                                    <div className="text-end">
                                      <span className="badge bg-success">Sent</span>
                                      <br />
                                      <small className="text-muted">12 recipients</small>
                                    </div>
                                  </div>
                                  <div className="list-group-item d-flex align-items-center">
                                    <div className="me-3">
                                      <i className="bi bi-clock text-secondary fs-4"></i>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">Welcome New Members</h6>
                                      <small className="text-muted">Scheduled for tomorrow at 9:00 AM</small>
                                    </div>
                                    <div className="text-end">
                                      <span className="badge bg-warning">Scheduled</span>
                                      <br />
                                      <small className="text-muted">23 recipients</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-4 col-md-12 mb-4">
                            <div className="card">
                              <div className="card-header">
                                <h6 className="mb-0">Broadcast Templates</h6>
                              </div>
                              <div className="card-body">
                                <div className="d-grid gap-2">
                                  <button className="btn btn-outline-primary btn-sm">
                                    <i className="bi bi-calendar-event me-2"></i>Event Announcement
                                  </button>
                                  <button className="btn btn-outline-success btn-sm">
                                    <i className="bi bi-people me-2"></i>Team Update
                                  </button>
                                  <button className="btn btn-outline-warning btn-sm">
                                    <i className="bi bi-credit-card me-2"></i>Payment Reminder
                                  </button>
                                  <button className="btn btn-outline-info btn-sm">
                                    <i className="bi bi-person-plus me-2"></i>Welcome Message
                                  </button>
                                  <button className="btn btn-outline-danger btn-sm">
                                    <i className="bi bi-exclamation-triangle me-2"></i>Urgent Notice
                                  </button>
                                </div>
                                <hr />
                                <div className="text-center">
                                  <small className="text-muted">Quick Stats</small>
                                  <div className="row text-center mt-2">
                                    <div className="col-6">
                                      <h6 className="text-primary mb-0">156</h6>
                                      <small className="text-muted">Sent Today</small>
                                    </div>
                                    <div className="col-6">
                                      <h6 className="text-success mb-0">94.2%</h6>
                                      <small className="text-muted">Open Rate</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'reports' && (
              <div>
                {/* Key Performance Indicators */}
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">2,145</h4>
                            <p className="mb-0">Total Users</p>
                            <small>+12% this month</small>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-people fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">$45,890</h4>
                            <p className="mb-0">Revenue</p>
                            <small>+8% this month</small>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-currency-dollar fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">156</h4>
                            <p className="mb-0">Active Sessions</p>
                            <small>+5% this week</small>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-activity fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between">
                          <div>
                            <h4 className="mb-0">89%</h4>
                            <p className="mb-0">Satisfaction</p>
                            <small>+3% this quarter</small>
                          </div>
                          <div className="align-self-center">
                            <i className="bi bi-star-fill fs-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Categories */}
                <div className="row mb-4">
                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Financial Reports</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-primary me-2"></i>
                            Revenue Report
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-success me-2"></i>
                            Expense Report
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-warning me-2"></i>
                            Profit & Loss
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-info me-2"></i>
                            Cash Flow
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Membership Reports</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-primary me-2"></i>
                            Member Registration
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-success me-2"></i>
                            Active Members
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-warning me-2"></i>
                            Retention Rate
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-info me-2"></i>
                            Demographics
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Performance Reports</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-primary me-2"></i>
                            Team Performance
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-success me-2"></i>
                            Player Statistics
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-warning me-2"></i>
                            Training Attendance
                          </button>
                          <button className="list-group-item list-group-item-action">
                            <i className="bi bi-file-earmark-text text-info me-2"></i>
                            Match Results
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Export Options */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Quick Export</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <button className="btn btn-outline-danger w-100 py-3">
                              <i className="bi bi-file-pdf fs-3 d-block mb-2"></i>
                              <strong>Export as PDF</strong>
                              <br /><small>Generate PDF reports</small>
                            </button>
                          </div>
                          <div className="col-md-4 mb-3">
                            <button className="btn btn-outline-success w-100 py-3">
                              <i className="bi bi-file-earmark-excel fs-3 d-block mb-2"></i>
                              <strong>Export as Excel</strong>
                              <br /><small>Export to spreadsheet</small>
                            </button>
                          </div>
                          <div className="col-md-4 mb-3">
                            <button className="btn btn-outline-primary w-100 py-3">
                              <i className="bi bi-filetype-csv fs-3 d-block mb-2"></i>
                              <strong>Export as CSV</strong>
                              <br /><small>Export raw data</small>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Reports */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Recent Reports</h5>
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-plus-circle me-2"></i>Generate New Report
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Report Name</th>
                                <th>Type</th>
                                <th>Generated</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Monthly Financial Summary</td>
                                <td><span className="badge bg-primary">Financial</span></td>
                                <td>2 hours ago</td>
                                <td><span className="badge bg-success">Ready</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <i className="bi bi-download"></i> Download
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary">
                                    <i className="bi bi-eye"></i> View
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td>Member Registration Report</td>
                                <td><span className="badge bg-info">Membership</span></td>
                                <td>5 hours ago</td>
                                <td><span className="badge bg-success">Ready</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <i className="bi bi-download"></i> Download
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary">
                                    <i className="bi bi-eye"></i> View
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td>Team Performance Analytics</td>
                                <td><span className="badge bg-warning">Performance</span></td>
                                <td>1 day ago</td>
                                <td><span className="badge bg-success">Ready</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <i className="bi bi-download"></i> Download
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary">
                                    <i className="bi bi-eye"></i> View
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td>Quarterly Revenue Report</td>
                                <td><span className="badge bg-primary">Financial</span></td>
                                <td>2 days ago</td>
                                <td><span className="badge bg-warning">Processing</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-secondary" disabled>
                                    <i className="bi bi-hourglass-split"></i> Processing
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'finance' && (
              <div>
                {/* Header with Statistics and Action Buttons */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Statistics */}
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                          <i className="bi bi-arrow-down-circle text-success fs-2 mb-2"></i>
                          <p className="text-muted mb-1 small fw-semibold">Total Income</p>
                          <h4 className="mb-0 text-success fw-bold">${financeSummary.totalIncome.toLocaleString()}</h4>
                        </div>
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                          <i className="bi bi-arrow-up-circle text-danger fs-2 mb-2"></i>
                          <p className="text-muted mb-1 small fw-semibold">Total Expenses</p>
                          <h4 className="mb-0 text-danger fw-bold">${financeSummary.totalExpense.toLocaleString()}</h4>
                        </div>
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                          <i className={`bi bi-${financeSummary.netIncome >= 0 ? 'check' : 'x'}-circle ${financeSummary.netIncome >= 0 ? 'text-success' : 'text-danger'} fs-2 mb-2`}></i>
                          <p className="text-muted mb-1 small fw-semibold">Net Income</p>
                          <h4 className={`mb-0 ${financeSummary.netIncome >= 0 ? 'text-success' : 'text-danger'} fw-bold`}>${financeSummary.netIncome.toLocaleString()}</h4>
                        </div>
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                          <i className="bi bi-receipt text-info fs-2 mb-2"></i>
                          <p className="text-muted mb-1 small fw-semibold">Transactions</p>
                          <h4 className="mb-0 text-dark fw-bold">{financeSummary.totalTransactions || 0}</h4>
                        </div>
                      </div>
                      
                      {/* Quick Action Buttons */}
                      <div className="col-lg-4">
                        <div className="h-100 d-flex flex-column gap-2 justify-content-center">
                          <button 
                            className="btn btn-success btn-lg w-100"
                            onClick={() => {
                              setShowTransactionForm(true);
                              setTransactionForm({...transactionForm, type: 'income'});
                            }}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add Income
                          </button>
                          <button 
                            className="btn btn-danger btn-lg w-100"
                            onClick={() => {
                              setShowTransactionForm(true);
                              setTransactionForm({...transactionForm, type: 'expense'});
                            }}
                          >
                            <i className="bi bi-dash-circle me-2"></i>
                            Add Expense
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visible Tabs */}
                <div className="mb-4">
                  <div className="btn-group w-100 shadow-sm" role="group">
                    <button 
                      type="button"
                      className={`btn btn-lg ${financeTab === 'transactions' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setFinanceTab('transactions')}
                    >
                      <i className="bi bi-receipt me-2"></i>
                      All Transactions
                    </button>
                    <button 
                      type="button"
                      className={`btn btn-lg ${financeTab === 'income' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFinanceTab('income')}
                    >
                      <i className="bi bi-arrow-down-circle me-2"></i>
                      Income Only
                    </button>
                    <button 
                      type="button"
                      className={`btn btn-lg ${financeTab === 'expenses' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setFinanceTab('expenses')}
                    >
                      <i className="bi bi-arrow-up-circle me-2"></i>
                      Expenses Only
                    </button>
                  </div>
                </div>

                {/* Transaction Management */}
                {(financeTab === 'transactions' || financeTab === 'income' || financeTab === 'expenses') && (
                  <div className="card shadow-sm">
                    <div className="card-header bg-white py-3">
                      <h5 className="mb-3 fw-bold">
                        {financeTab === 'transactions' && (
                          <><i className="bi bi-receipt text-primary me-2"></i>All Transactions</>
                        )}
                        {financeTab === 'income' && (
                          <><i className="bi bi-arrow-down-circle text-success me-2"></i>Income Transactions</>
                        )}
                        {financeTab === 'expenses' && (
                          <><i className="bi bi-arrow-up-circle text-danger me-2"></i>Expense Transactions</>
                        )}
                      </h5>
                      
                      {/* Enhanced Filters */}
                      {!showTransactionForm && (
                        <div className="row g-2">
                          <div className="col-md-3">
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="🔍 Search by description, payer, payee..."
                              onChange={(e) => {
                                // Filter logic will be added
                              }}
                            />
                          </div>
                          <div className="col-md-2">
                            <select className="form-select form-select-sm">
                              <option value="">All Categories</option>
                              {financeTab === 'income' || financeTab === 'transactions' ? 
                                incomeCategories.map(cat => <option key={cat} value={cat}>{cat}</option>) : null}
                              {financeTab === 'expenses' || financeTab === 'transactions' ? 
                                expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>) : null}
                            </select>
                          </div>
                          <div className="col-md-2">
                            <select className="form-select form-select-sm">
                              <option value="">All Statuses</option>
                              <option value="completed">Completed</option>
                              <option value="pending">Pending</option>
                              <option value="failed">Failed</option>
                              <option value="refunded">Refunded</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="col-md-2">
                            <input type="date" className="form-control form-control-sm" placeholder="From Date" />
                          </div>
                          <div className="col-md-2">
                            <input type="date" className="form-control form-control-sm" placeholder="To Date" />
                          </div>
                          <div className="col-md-1">
                            <button className="btn btn-outline-secondary btn-sm w-100" title="Reset Filters">
                              <i className="bi bi-arrow-clockwise"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      {financeLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : showTransactionForm ? (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h5>
                            <button className="btn btn-outline-secondary" onClick={resetTransactionForm}>
                              <i className="bi bi-x-lg me-2"></i>Cancel
                            </button>
                          </div>
                          <form onSubmit={handleTransactionSubmit}>
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Type *</label>
                                <select
                                  className="form-select"
                                  value={transactionForm.type}
                                  onChange={(e) => setTransactionForm({...transactionForm, type: e.target.value, category: ""})}
                                  required
                                >
                                  <option value="income">💰 Income</option>
                                  <option value="expense">💸 Expense</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Category *</label>
                                <select
                                  className="form-select"
                                  value={transactionForm.category}
                                  onChange={(e) => setTransactionForm({...transactionForm, category: e.target.value})}
                                  required
                                >
                                  <option value="">Select Category</option>
                                  {(transactionForm.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-12 mb-3">
                                <label className="form-label fw-bold">Description *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={transactionForm.description}
                                  onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                                  placeholder="Brief description of the transaction"
                                  required
                                />
                              </div>
                              <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">Amount ($) *</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={transactionForm.amount}
                                  onChange={(e) => setTransactionForm({...transactionForm, amount: parseFloat(e.target.value) || 0})}
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  required
                                />
                              </div>
                              <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">Date *</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  value={transactionForm.date}
                                  onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold">Payment Method *</label>
                                <select
                                  className="form-select"
                                  value={transactionForm.paymentMethod}
                                  onChange={(e) => setTransactionForm({...transactionForm, paymentMethod: e.target.value})}
                                  required
                                >
                                  <option value="cash">Cash</option>
                                  <option value="check">Check</option>
                                  <option value="credit_card">Credit Card</option>
                                  <option value="debit_card">Debit Card</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                  <option value="paypal">PayPal</option>
                                  <option value="stripe">Stripe</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Status *</label>
                                <select
                                  className="form-select"
                                  value={transactionForm.status}
                                  onChange={(e) => setTransactionForm({...transactionForm, status: e.target.value})}
                                  required
                                >
                                  <option value="completed">✅ Completed</option>
                                  <option value="pending">⏳ Pending</option>
                                  <option value="failed">❌ Failed</option>
                                  <option value="refunded">↩️ Refunded</option>
                                  <option value="cancelled">🚫 Cancelled</option>
                                </select>
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">Reference Number</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={transactionForm.referenceNumber}
                                  onChange={(e) => setTransactionForm({...transactionForm, referenceNumber: e.target.value})}
                                  placeholder="Check #, Invoice #, Confirmation code"
                                />
                              </div>
                              <div className="col-md-12 mb-3">
                                <label className="form-label fw-bold">{transactionForm.type === 'income' ? 'Received From (Payer)' : 'Paid To (Payee)'}</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={transactionForm.type === 'income' ? transactionForm.payer : transactionForm.payee}
                                  onChange={(e) => setTransactionForm({
                                    ...transactionForm,
                                    [transactionForm.type === 'income' ? 'payer' : 'payee']: e.target.value
                                  })}
                                  placeholder={transactionForm.type === 'income' ? 'Who paid this?' : 'Who received payment?'}
                                />
                              </div>
                              <div className="col-12 mb-3">
                                <label className="form-label fw-bold">Additional Notes</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={transactionForm.notes}
                                  onChange={(e) => setTransactionForm({...transactionForm, notes: e.target.value})}
                                  placeholder="Any additional information about this transaction..."
                                />
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button type="submit" className="btn btn-primary px-4">
                                <i className="bi bi-save me-2"></i>
                                {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
                              </button>
                              <button type="button" className="btn btn-outline-secondary px-4" onClick={resetTransactionForm}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : transactions.filter(t => 
                        financeTab === 'transactions' ? true : 
                        financeTab === 'income' ? t.type === 'income' : 
                        t.type === 'expense'
                      ).length === 0 ? (
                        <div className="text-center py-5">
                          <div className="mb-4">
                            <i className={`bi ${
                              financeTab === 'income' ? 'bi-arrow-down-circle-fill text-success' : 
                              financeTab === 'expenses' ? 'bi-arrow-up-circle-fill text-danger' : 
                              'bi-receipt'
                            }`} style={{fontSize: '5rem', opacity: 0.3}}></i>
                          </div>
                          <h4 className="text-muted mb-3">No {financeTab === 'income' ? 'Income' : financeTab === 'expenses' ? 'Expenses' : 'Transactions'} Yet</h4>
                          <p className="text-muted mb-0">
                            {financeTab === 'income' && "Click the 'Add Income' button above to start tracking your club's income."}
                            {financeTab === 'expenses' && "Click the 'Add Expense' button above to start tracking your club's expenses."}
                            {financeTab === 'transactions' && "Click the 'Add Transaction' button above to get started with financial tracking."}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                              <thead>
                                <tr className="border-bottom">
                                  <th className="text-muted fw-normal small">DATE</th>
                                  <th className="text-muted fw-normal small">DESCRIPTION</th>
                                  <th className="text-muted fw-normal small">CATEGORY</th>
                                  <th className="text-muted fw-normal small">AMOUNT</th>
                                  <th className="text-muted fw-normal small">PAYMENT METHOD</th>
                                  <th className="text-muted fw-normal small">STATUS</th>
                                  <th className="text-muted fw-normal small text-end">ACTIONS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions.filter(t => 
                                  financeTab === 'transactions' ? true : 
                                  financeTab === 'income' ? t.type === 'income' : 
                                  t.type === 'expense'
                                ).map(transaction => (
                                  <tr key={transaction._id} className="border-bottom">
                                    <td className="py-3">
                                      <div className="text-dark">{transaction.date ? new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                                    </td>
                                    <td className="py-3">
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="fw-semibold text-dark">{transaction.description}</div>
                                        {transaction.notes && transaction.notes.includes('Automated entry') && (
                                          <span className="badge bg-info text-white" title="Automatically recorded from payment system">
                                            <i className="bi bi-lightning-charge-fill"></i> Auto
                                          </span>
                                        )}
                                      </div>
                                      {transaction.referenceNumber && (
                                        <small className="text-muted d-block mt-1">Ref: {transaction.referenceNumber}</small>
                                      )}
                                      {(transaction.payer || transaction.payee) && (
                                        <small className="text-muted d-block">
                                          {transaction.type === 'income' ? `From: ${transaction.payer}` : `To: ${transaction.payee}`}
                                        </small>
                                      )}
                                    </td>
                                    <td className="py-3">
                                      <span className="badge bg-light text-dark border">{transaction.category}</span>
                                      {financeTab === 'transactions' && (
                                        <span className={`badge ms-1 ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3">
                                      <div className={`fw-bold fs-5 ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}
                                      </div>
                                    </td>
                                    <td className="py-3">
                                      <span className="text-muted">{transaction.paymentMethod?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    </td>
                                    <td className="py-3">
                                      <span className={`badge ${
                                        transaction.status === 'completed' ? 'bg-success' :
                                        transaction.status === 'pending' ? 'bg-warning text-dark' :
                                        transaction.status === 'failed' ? 'bg-danger' :
                                        transaction.status === 'refunded' ? 'bg-info text-dark' :
                                        'bg-secondary'
                                      }`}>
                                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                      </span>
                                    </td>
                                    <td className="py-3 text-end">
                                      <div className="btn-group btn-group-sm" role="group">
                                        <button
                                          className="btn btn-outline-secondary"
                                          onClick={() => handleEditTransaction(transaction)}
                                          title="Edit Transaction"
                                        >
                                          <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button
                                          className="btn btn-outline-danger"
                                          onClick={() => handleDeleteTransaction(transaction._id)}
                                          title="Delete Transaction"
                                        >
                                          <i className="bi bi-trash3"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {transactions.filter(t => 
                            financeTab === 'transactions' ? true : 
                            financeTab === 'income' ? t.type === 'income' : 
                            t.type === 'expense'
                          ).length > 0 && (
                            <div className="card-footer bg-light text-center py-3">
                              <small className="text-muted">
                                Showing {transactions.filter(t => 
                                  financeTab === 'transactions' ? true : 
                                  financeTab === 'income' ? t.type === 'income' : 
                                  t.type === 'expense'
                                ).length} {financeTab === 'transactions' ? 'transaction' : financeTab === 'income' ? 'income' : 'expense'}{transactions.filter(t => 
                                  financeTab === 'transactions' ? true : 
                                  financeTab === 'income' ? t.type === 'income' : 
                                  t.type === 'expense'
                                ).length !== 1 ? 's' : ''}
                              </small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'marketplace' && (
              <div style={{padding: '0'}}>
                <UnifiedMarketplaceManager />
              </div>
            )}


            {activeSection === 'applications' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Application Management</h5>
                      </div>
                      <div className="card-body">
                        {applicationsLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading applications...</p>
                          </div>
                        ) : (
                          <>
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${applicationsActiveTab === 'overview' ? 'active' : ''}`}
                                  onClick={() => setApplicationsActiveTab('overview')}
                                >
                                  📊 Overview
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${applicationsActiveTab === 'all' ? 'active' : ''}`}
                                  onClick={() => setApplicationsActiveTab('all')}
                                >
                                  📋 All Applications
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${applicationsActiveTab === 'pending' ? 'active' : ''}`}
                                  onClick={() => setApplicationsActiveTab('pending')}
                                >
                                  ⏳ Pending ({applicationStats.pending})
                                </button>
                              </li>
                            </ul>

                            {/* Overview Tab */}
                            {applicationsActiveTab === 'overview' && (
                              <div>
                                {/* Statistics Cards */}
                                <div className="row g-3 mb-4">
                                  <div className="col-md-3">
                                    <div className="card bg-primary bg-opacity-10 border-primary">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-primary">{applicationStats.total}</h2>
                                        <p className="text-muted mb-0">Total Applications</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-warning bg-opacity-10 border-warning">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-warning">{applicationStats.pending}</h2>
                                        <p className="text-muted mb-0">Pending</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-success bg-opacity-10 border-success">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-success">{applicationStats.approved}</h2>
                                        <p className="text-muted mb-0">Approved</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-info bg-opacity-10 border-info">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-info">{applicationStats.underReview}</h2>
                                        <p className="text-muted mb-0">Under Review</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Application Types Grid */}
                                <h5 className="mb-3">Application Types</h5>
                                <div className="row g-3">
                                  {applicationStats.byType.map((type) => (
                                    <div key={type.id} className="col-md-3">
                                      <div className="card h-100">
                                        <div className="card-body">
                                          <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span style={{fontSize: '2rem'}}>{type.icon}</span>
                                            <h3 className="mb-0">{type.count}</h3>
                                          </div>
                                          <h6 className="card-title">{type.name}</h6>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* All/Pending Applications Tab */}
                            {(applicationsActiveTab === 'all' || applicationsActiveTab === 'pending') && (
                              <div>
                                {/* Filters */}
                                <div className="row g-3 mb-4">
                                  <div className="col-md-5">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Search applications..."
                                      value={applicationFilter.search}
                                      onChange={(e) => setApplicationFilter(f => ({ ...f, search: e.target.value }))}
                                    />
                                  </div>
                                  <div className="col-md-3">
                                    <select
                                      className="form-select"
                                      value={applicationFilter.type}
                                      onChange={(e) => setApplicationFilter(f => ({ ...f, type: e.target.value }))}
                                    >
                                      <option value="all">All Types</option>
                                      {applicationTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-4">
                                    <select
                                      className="form-select"
                                      value={applicationFilter.status}
                                      onChange={(e) => setApplicationFilter(f => ({ ...f, status: e.target.value }))}
                                    >
                                      <option value="all">All Status</option>
                                      {applicationStatusOptions.map(status => (
                                        <option key={status.id} value={status.id}>{status.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                {/* Applications Table */}
                                <div className="table-responsive">
                                  <table className="table table-hover">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Applicant</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredApplications
                                        .filter(app => applicationsActiveTab === 'all' || app.status === 'pending')
                                        .length === 0 ? (
                                        <tr>
                                          <td colSpan="5" className="text-center py-5">
                                            <div className="text-muted">
                                              <i className="bi bi-file-earmark-check" style={{fontSize: '3rem'}}></i>
                                              <p className="mt-2">No applications found</p>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : (
                                        filteredApplications
                                          .filter(app => applicationsActiveTab === 'all' || app.status === 'pending')
                                          .map((app) => (
                                          <tr key={app._id}>
                                            <td>
                                              <div>
                                                <strong>{app.applicantName || 'N/A'}</strong>
                                                {app.applicantEmail && (
                                                  <div className="text-muted small">{app.applicantEmail}</div>
                                                )}
                                              </div>
                                            </td>
                                            <td>
                                              <span className="badge bg-secondary">
                                                {applicationTypes.find(t => t.id === app.type)?.name || app.type}
                                              </span>
                                            </td>
                                            <td>
                                              <span className={`badge bg-${applicationStatusOptions.find(s => s.id === app.status)?.color || 'secondary'}`}>
                                                {applicationStatusOptions.find(s => s.id === app.status)?.name || app.status}
                                              </span>
                                            </td>
                                            <td className="text-muted small">
                                              {app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td>
                                              <div className="btn-group btn-group-sm">
                                                <button
                                                  className="btn btn-outline-info"
                                                  onClick={() => {
                                                    setSelectedApplication(app);
                                                    setShowAppModal(true);
                                                  }}
                                                  title="View Details"
                                                >
                                                  <i className="bi bi-eye"></i>
                                                </button>
                                                <button
                                                  className="btn btn-outline-success"
                                                  onClick={() => updateApplicationStatus(app._id, 'approved')}
                                                  title="Approve"
                                                  disabled={app.status === 'approved'}
                                                >
                                                  <i className="bi bi-check"></i>
                                                </button>
                                                <button
                                                  className="btn btn-outline-danger"
                                                  onClick={() => updateApplicationStatus(app._id, 'rejected')}
                                                  title="Reject"
                                                  disabled={app.status === 'rejected'}
                                                >
                                                  <i className="bi bi-x"></i>
                                                </button>
                                                <button
                                                  className="btn btn-outline-danger"
                                                  onClick={() => deleteApplication(app._id)}
                                                  title="Delete"
                                                >
                                                  <i className="bi bi-trash"></i>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Details Modal */}
                {showAppModal && selectedApplication && (
                  <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Application Details</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowAppModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Applicant Name</label>
                              <p>{selectedApplication.applicantName || 'N/A'}</p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Email</label>
                              <p>{selectedApplication.applicantEmail || 'N/A'}</p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Application Type</label>
                              <p>{applicationTypes.find(t => t.id === selectedApplication.type)?.name || selectedApplication.type}</p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Status</label>
                              <p>
                                <span className={`badge bg-${applicationStatusOptions.find(s => s.id === selectedApplication.status)?.color || 'secondary'}`}>
                                  {applicationStatusOptions.find(s => s.id === selectedApplication.status)?.name || selectedApplication.status}
                                </span>
                              </p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Submitted Date</label>
                              <p>{selectedApplication.submittedDate ? new Date(selectedApplication.submittedDate).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-bold">Additional Information</label>
                              <p className="bg-light p-3 rounded">{selectedApplication.notes || 'No additional information provided'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowAppModal(false)}
                          >
                            Close
                          </button>
                          {selectedApplication.status !== 'approved' && (
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => updateApplicationStatus(selectedApplication._id, 'approved')}
                            >
                              Approve
                            </button>
                          )}
                          {selectedApplication.status !== 'rejected' && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'forms' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Form Management</h5>
                      </div>
                      <div className="card-body">
                        {formsLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading forms...</p>
                          </div>
                        ) : (
                          <>
                            {/* Tabs */}
                            <ul className="nav nav-tabs mb-4">
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${formsActiveTab === 'overview' ? 'active' : ''}`}
                                  onClick={() => setFormsActiveTab('overview')}
                                >
                                  📊 Overview
                                </button>
                              </li>
                              <li className="nav-item">
                                <button
                                  className={`nav-link ${formsActiveTab === 'all' ? 'active' : ''}`}
                                  onClick={() => setFormsActiveTab('all')}
                                >
                                  📋 All Forms
                                </button>
                              </li>
                            </ul>

                            {/* Overview Tab */}
                            {formsActiveTab === 'overview' && (
                              <div>
                                {/* Statistics Cards */}
                                <div className="row g-3 mb-4">
                                  <div className="col-md-3">
                                    <div className="card bg-primary bg-opacity-10 border-primary">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-primary">{formStats.total}</h2>
                                        <p className="text-muted mb-0">Total Forms</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-success bg-opacity-10 border-success">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-success">{formStats.active}</h2>
                                        <p className="text-muted mb-0">Active</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-warning bg-opacity-10 border-warning">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-warning">{formStats.draft}</h2>
                                        <p className="text-muted mb-0">Drafts</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="card bg-secondary bg-opacity-10 border-secondary">
                                      <div className="card-body text-center">
                                        <h2 className="display-6 fw-bold text-secondary">{formStats.archived}</h2>
                                        <p className="text-muted mb-0">Archived</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Form Categories Grid */}
                                <h5 className="mb-3">Form Categories</h5>
                                <div className="row g-3">
                                  {formStats.byCategory.map((cat) => (
                                    <div key={cat.id} className="col-md-3">
                                      <div className="card h-100">
                                        <div className="card-body">
                                          <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span style={{fontSize: '2rem'}}>{cat.icon}</span>
                                            <h3 className="mb-0">{cat.count}</h3>
                                          </div>
                                          <h6 className="card-title">{cat.name}</h6>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* All Forms Tab */}
                            {formsActiveTab === 'all' && (
                              <div>
                                {/* Filters */}
                                <div className="row g-3 mb-4">
                                  <div className="col-md-5">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Search forms..."
                                      value={formFilter.search}
                                      onChange={(e) => setFormFilter(f => ({ ...f, search: e.target.value }))}
                                    />
                                  </div>
                                  <div className="col-md-3">
                                    <select
                                      className="form-select"
                                      value={formFilter.category}
                                      onChange={(e) => setFormFilter(f => ({ ...f, category: e.target.value }))}
                                    >
                                      <option value="all">All Categories</option>
                                      {formCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-4">
                                    <select
                                      className="form-select"
                                      value={formFilter.status}
                                      onChange={(e) => setFormFilter(f => ({ ...f, status: e.target.value }))}
                                    >
                                      <option value="all">All Status</option>
                                      <option value="draft">Draft</option>
                                      <option value="active">Active</option>
                                      <option value="archived">Archived</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Forms Table */}
                                <div className="table-responsive">
                                  <table className="table table-hover">
                                    <thead className="table-light">
                                      <tr>
                                        <th>Form Title</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredForms.length === 0 ? (
                                        <tr>
                                          <td colSpan="5" className="text-center py-5">
                                            <div className="text-muted">
                                              <i className="bi bi-ui-checks" style={{fontSize: '3rem'}}></i>
                                              <p className="mt-2">No forms found</p>
                                            </div>
                                          </td>
                                        </tr>
                                      ) : (
                                        filteredForms.map((form) => (
                                          <tr key={form._id}>
                                            <td>
                                              <div>
                                                <strong>{form.title || 'Untitled Form'}</strong>
                                                {form.description && (
                                                  <div className="text-muted small">{form.description}</div>
                                                )}
                                              </div>
                                            </td>
                                            <td>
                                              <span className="badge bg-secondary">
                                                {formCategories.find(c => c.id === form.category)?.name || form.category}
                                              </span>
                                            </td>
                                            <td>
                                              <span className={`badge bg-${form.status === 'active' ? 'success' : form.status === 'draft' ? 'warning' : 'secondary'}`}>
                                                {form.status}
                                              </span>
                                            </td>
                                            <td className="text-muted small">
                                              {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td>
                                              <div className="btn-group btn-group-sm">
                                                <button
                                                  className="btn btn-outline-info"
                                                  onClick={() => {
                                                    setSelectedForm(form);
                                                    setShowFormModal(true);
                                                  }}
                                                  title="View Details"
                                                >
                                                  <i className="bi bi-eye"></i>
                                                </button>
                                                {form.status !== 'active' && (
                                                  <button
                                                    className="btn btn-outline-success"
                                                    onClick={() => updateFormStatus(form._id, 'active')}
                                                    title="Activate"
                                                  >
                                                    <i className="bi bi-check-circle"></i>
                                                  </button>
                                                )}
                                                {form.status === 'active' && (
                                                  <button
                                                    className="btn btn-outline-warning"
                                                    onClick={() => updateFormStatus(form._id, 'archived')}
                                                    title="Archive"
                                                  >
                                                    <i className="bi bi-archive"></i>
                                                  </button>
                                                )}
                                                <button
                                                  className="btn btn-outline-danger"
                                                  onClick={() => deleteForm(form._id)}
                                                  title="Delete"
                                                >
                                                  <i className="bi bi-trash"></i>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Details Modal */}
                {showFormModal && selectedForm && (
                  <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Form Details</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowFormModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="row g-3">
                            <div className="col-md-12">
                              <label className="form-label fw-bold">Form Title</label>
                              <p>{selectedForm.title || 'Untitled Form'}</p>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label fw-bold">Description</label>
                              <p>{selectedForm.description || 'No description provided'}</p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Category</label>
                              <p>{formCategories.find(c => c.id === selectedForm.category)?.name || selectedForm.category}</p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Status</label>
                              <p>
                                <span className={`badge bg-${selectedForm.status === 'active' ? 'success' : selectedForm.status === 'draft' ? 'warning' : 'secondary'}`}>
                                  {selectedForm.status}
                                </span>
                              </p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Created</label>
                              <p>{selectedForm.createdAt ? new Date(selectedForm.createdAt).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Total Fields</label>
                              <p>{selectedForm.fields?.length || 0} fields</p>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowFormModal(false)}
                          >
                            Close
                          </button>
                          {selectedForm.status !== 'active' && (
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => {
                                updateFormStatus(selectedForm._id, 'active');
                                setShowFormModal(false);
                              }}
                            >
                              Activate Form
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'broadcasts' && (
              <div>
                {/* Broadcast Stats */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>Total Broadcasts</h6>
                        <h4 className="mb-0">245</h4>
                        <small>All time</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>Delivered</h6>
                        <h4 className="mb-0">238</h4>
                        <small>97% success rate</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Scheduled</h6>
                        <h4 className="mb-0">5</h4>
                        <small>Upcoming</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6>Total Reach</h6>
                        <h4 className="mb-0">12.5K</h4>
                        <small>Recipients</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Create Broadcast */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Create New Broadcast</h5>
                      </div>
                      <div className="card-body">
                        <form>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Broadcast Title</label>
                              <input type="text" className="form-control" placeholder="Enter broadcast title" />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Target Audience</label>
                              <select className="form-select">
                                <option>All Users</option>
                                <option>Players</option>
                                <option>Coaches</option>
                                <option>Parents</option>
                                <option>Specific Team</option>
                              </select>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Message</label>
                            <textarea className="form-control" rows="4" placeholder="Enter your broadcast message"></textarea>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Delivery Method</label>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="bcEmail" defaultChecked />
                                <label className="form-check-label" htmlFor="bcEmail">Email</label>
                              </div>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="bcPush" defaultChecked />
                                <label className="form-check-label" htmlFor="bcPush">Push Notification</label>
                              </div>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="bcSMS" />
                                <label className="form-check-label" htmlFor="bcSMS">SMS</label>
                              </div>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Schedule</label>
                              <select className="form-select mb-2">
                                <option>Send Now</option>
                                <option>Schedule for Later</option>
                              </select>
                              <input type="datetime-local" className="form-control" />
                            </div>
                          </div>
                          <button type="button" className="btn btn-primary">Send Broadcast</button>
                          <button type="button" className="btn btn-outline-secondary ms-2">Save as Draft</button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Broadcasts */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Recent Broadcasts</h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Audience</th>
                                <th>Sent</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Weekly Training Update</td>
                                <td>All Players (1,200)</td>
                                <td>2 hours ago</td>
                                <td><span className="badge bg-success">Delivered</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                              </tr>
                              <tr>
                                <td>Match Reminder</td>
                                <td>U16 Team (25)</td>
                                <td>1 day ago</td>
                                <td><span className="badge bg-success">Delivered</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                              </tr>
                              <tr>
                                <td>Season Kickoff Event</td>
                                <td>All Users (2,100)</td>
                                <td>3 days ago</td>
                                <td><span className="badge bg-success">Delivered</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'backup' && (
              <div>
                {/* Backup Status */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>Last Backup</h6>
                        <h4 className="mb-0">2 hours ago</h4>
                        <small>Automatic backup completed</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>Total Backups</h6>
                        <h4 className="mb-0">145</h4>
                        <small>32.5 GB total size</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Next Backup</h6>
                        <h4 className="mb-0">In 10 hours</h4>
                        <small>Scheduled for midnight</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6>Storage Used</h6>
                        <h4 className="mb-0">65%</h4>
                        <small>32.5 GB / 50 GB</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Quick Actions</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <button className="btn btn-primary w-100 py-3">
                              <i className="bi bi-cloud-arrow-up fs-3 d-block mb-2"></i>
                              <strong>Create Backup Now</strong>
                              <br /><small>Manual backup</small>
                            </button>
                          </div>
                          <div className="col-md-4 mb-3">
                            <button className="btn btn-success w-100 py-3">
                              <i className="bi bi-cloud-arrow-down fs-3 d-block mb-2"></i>
                              <strong>Restore Backup</strong>
                              <br /><small>Restore from backup</small>
                            </button>
                          </div>
                          <div className="col-md-4 mb-3">
                            <button className="btn btn-warning w-100 py-3">
                              <i className="bi bi-gear fs-3 d-block mb-2"></i>
                              <strong>Configure Schedule</strong>
                              <br /><small>Backup settings</small>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Backups */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Recent Backups</h5>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Backup Name</th>
                                <th>Type</th>
                                <th>Size</th>
                                <th>Created</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Auto Backup - 2024-10-22</td>
                                <td><span className="badge bg-primary">Automatic</span></td>
                                <td>2.3 GB</td>
                                <td>2 hours ago</td>
                                <td><span className="badge bg-success">Verified</span></td>
                                <td>
                                  <button className="btn btn-sm btn-success me-1">
                                    <i className="bi bi-arrow-counterclockwise"></i> Restore
                                  </button>
                                  <button className="btn btn-sm btn-primary me-1">
                                    <i className="bi bi-download"></i> Download
                                  </button>
                                  <button className="btn btn-sm btn-danger">
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td>Manual Backup - Pre Update</td>
                                <td><span className="badge bg-info">Manual</span></td>
                                <td>2.2 GB</td>
                                <td>1 day ago</td>
                                <td><span className="badge bg-success">Verified</span></td>
                                <td>
                                  <button className="btn btn-sm btn-success me-1">
                                    <i className="bi bi-arrow-counterclockwise"></i> Restore
                                  </button>
                                  <button className="btn btn-sm btn-primary me-1">
                                    <i className="bi bi-download"></i> Download
                                  </button>
                                  <button className="btn btn-sm btn-danger">
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td>Auto Backup - 2024-10-21</td>
                                <td><span className="badge bg-primary">Automatic</span></td>
                                <td>2.3 GB</td>
                                <td>2 days ago</td>
                                <td><span className="badge bg-success">Verified</span></td>
                                <td>
                                  <button className="btn btn-sm btn-success me-1">
                                    <i className="bi bi-arrow-counterclockwise"></i> Restore
                                  </button>
                                  <button className="btn btn-sm btn-primary me-1">
                                    <i className="bi bi-download"></i> Download
                                  </button>
                                  <button className="btn btn-sm btn-danger">
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'logs' && (
              <div>
                {/* Log Statistics */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>Total Events</h6>
                        <h4 className="mb-0">12,456</h4>
                        <small>Last 30 days</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-danger text-white">
                      <div className="card-body">
                        <h6>Errors</h6>
                        <h4 className="mb-0">23</h4>
                        <small>Requires attention</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Warnings</h6>
                        <h4 className="mb-0">145</h4>
                        <small>Last 24 hours</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>Success Rate</h6>
                        <h4 className="mb-0">98.9%</h4>
                        <small>System uptime</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Log Filters */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Filter Logs</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Log Level</label>
                            <select className="form-select">
                              <option>All Levels</option>
                              <option>Error</option>
                              <option>Warning</option>
                              <option>Info</option>
                              <option>Debug</option>
                            </select>
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Category</label>
                            <select className="form-select">
                              <option>All Categories</option>
                              <option>Authentication</option>
                              <option>Database</option>
                              <option>API</option>
                              <option>System</option>
                            </select>
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Time Range</label>
                            <select className="form-select">
                              <option>Last 24 Hours</option>
                              <option>Last 7 Days</option>
                              <option>Last 30 Days</option>
                              <option>Custom Range</option>
                            </select>
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Search</label>
                            <input type="text" className="form-control" placeholder="Search logs..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Logs */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Recent Activity</h5>
                        <div>
                          <button className="btn btn-sm btn-outline-primary me-2">
                            <i className="bi bi-download"></i> Export
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-arrow-clockwise"></i> Refresh
                          </button>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover table-sm mb-0">
                            <thead>
                              <tr>
                                <th>Time</th>
                                <th>Level</th>
                                <th>Category</th>
                                <th>Message</th>
                                <th>User</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><small>2024-10-22 14:23:45</small></td>
                                <td><span className="badge bg-success">INFO</span></td>
                                <td>Auth</td>
                                <td>User login successful</td>
                                <td>john@example.com</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                              <tr>
                                <td><small>2024-10-22 14:22:10</small></td>
                                <td><span className="badge bg-danger">ERROR</span></td>
                                <td>Database</td>
                                <td>Connection timeout on query execution</td>
                                <td>System</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                              <tr>
                                <td><small>2024-10-22 14:20:33</small></td>
                                <td><span className="badge bg-warning">WARN</span></td>
                                <td>API</td>
                                <td>Rate limit approaching for endpoint /api/users</td>
                                <td>admin@club.com</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                              <tr>
                                <td><small>2024-10-22 14:18:12</small></td>
                                <td><span className="badge bg-success">INFO</span></td>
                                <td>Payment</td>
                                <td>Payment processed successfully - $49.99</td>
                                <td>member@club.com</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                              <tr>
                                <td><small>2024-10-22 14:15:22</small></td>
                                <td><span className="badge bg-info">DEBUG</span></td>
                                <td>System</td>
                                <td>Backup process initiated</td>
                                <td>System</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                              <tr>
                                <td><small>2024-10-22 14:12:45</small></td>
                                <td><span className="badge bg-danger">ERROR</span></td>
                                <td>Auth</td>
                                <td>Failed login attempt - Invalid credentials</td>
                                <td>unknown@test.com</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                              <tr>
                                <td><small>2024-10-22 14:10:11</small></td>
                                <td><span className="badge bg-warning">WARN</span></td>
                                <td>Storage</td>
                                <td>Disk space usage at 85%</td>
                                <td>System</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                              <tr>
                                <td><small>2024-10-22 14:08:33</small></td>
                                <td><span className="badge bg-success">INFO</span></td>
                                <td>Email</td>
                                <td>Notification email sent successfully</td>
                                <td>System</td>
                                <td><button className="btn btn-sm btn-link">Details</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="card-footer">
                        <nav>
                          <ul className="pagination pagination-sm mb-0 justify-content-center">
                            <li className="page-item disabled"><a className="page-link" href="#">Previous</a></li>
                            <li className="page-item active"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                            <li className="page-item"><a className="page-link" href="#">Next</a></li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'scheduling' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        {schedulesLoading ? (
                          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : showScheduleForm ? (
                          <form onSubmit={handleScheduleSubmit}>
                            <div className="d-flex justify-content-between mb-3">
                              <h5>{editingSchedule ? 'Edit' : 'Create'} Schedule</h5>
                              <button type="button" className="btn btn-secondary" onClick={() => { setShowScheduleForm(false); setEditingSchedule(null); }}>Cancel</button>
                            </div>
                            <div className="row g-3">
                              <div className="col-md-8"><label className="form-label">Title *</label><input type="text" className="form-control" value={scheduleForm.title} onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})} required /></div>
                              <div className="col-md-4"><label className="form-label">Event Type *</label><select className="form-select" value={scheduleForm.eventType} onChange={(e) => setScheduleForm({...scheduleForm, eventType: e.target.value})} required><option value="Practice">Practice</option><option value="Game">Game</option><option value="Meeting">Meeting</option><option value="Training">Training</option><option value="Tournament">Tournament</option><option value="Tryout">Tryout</option><option value="Scrimmage">Scrimmage</option><option value="Friendly Match">Friendly Match</option></select></div>
                              <div className="col-md-6"><label className="form-label">Team/Group *</label><input type="text" className="form-control" value={scheduleForm.team} onChange={(e) => setScheduleForm({...scheduleForm, team: e.target.value})} required placeholder="e.g., U12 Boys, U14 Girls" /></div>
                              <div className="col-md-6"><label className="form-label">Location *</label><input type="text" className="form-control" value={scheduleForm.location} onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})} required placeholder="e.g., Field 1, Main Stadium" /></div>
                              <div className="col-md-4"><label className="form-label">Date *</label><input type="date" className="form-control" value={scheduleForm.startDate} onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})} required /></div>
                              <div className="col-md-4"><label className="form-label">Start Time *</label><input type="time" className="form-control" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})} required /></div>
                              <div className="col-md-4"><label className="form-label">End Time *</label><input type="time" className="form-control" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})} required /></div>
                              <div className="col-md-6"><label className="form-label">Visibility</label><select className="form-select" value={scheduleForm.isPublic} onChange={(e) => setScheduleForm({...scheduleForm, isPublic: e.target.value === 'true'})}><option value="true">Public - Visible to Everyone</option><option value="false">Internal - Staff Only</option></select></div>
                              <div className="col-md-6"><label className="form-label">Status</label><select className="form-select" value={scheduleForm.status} onChange={(e) => setScheduleForm({...scheduleForm, status: e.target.value})}><option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></div>
                              <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={scheduleForm.notes} onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})} placeholder="Add any additional details..."></textarea></div>
                              <div className="col-12"><button type="submit" className="btn btn-success w-100" disabled={schedulesLoading}>{schedulesLoading ? 'Saving...' : (editingSchedule ? 'Update Schedule' : 'Create Schedule')}</button></div>
                            </div>
                          </form>
                        ) : (
                          <>
                            <button className="btn btn-primary mb-3" onClick={() => setShowScheduleForm(true)}><i className="bi bi-plus-circle me-1"></i> New Schedule</button>
                            <table className="table table-hover">
                              <thead className="table-light"><tr><th>Date</th><th>Time</th><th>Title</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
                              <tbody>
                                {schedules.length === 0 ? (
                                  <tr><td colSpan="7" className="text-center py-5"><p className="text-muted mb-0">No schedules created</p></td></tr>
                                ) : (
                                  schedules.map((schedule) => (
                                    <tr key={schedule._id}>
                                      <td>{schedule.date ? new Date(schedule.date).toLocaleDateString() : 'N/A'}</td>
                                      <td><small>{schedule.startTime} - {schedule.endTime}</small></td>
                                      <td><strong>{schedule.title}</strong><br/><small className="text-muted">{schedule.team}</small></td>
                                      <td><span className="badge bg-info">{schedule.type}</span></td>
                                      <td>{schedule.location}</td>
                                      <td><span className={`badge bg-${schedule.status === 'Confirmed' ? 'success' : schedule.status === 'Cancelled' ? 'danger' : 'warning'}`}>{schedule.status}</span></td>
                                      <td>
                                        <div className="btn-group btn-group-sm">
                                          <button className="btn btn-outline-primary" onClick={() => { setScheduleForm(schedule); setEditingSchedule(schedule); setShowScheduleForm(true); }}><i className="bi bi-pencil"></i></button>
                                          <button className="btn btn-outline-danger" onClick={() => handleDeleteSchedule(schedule._id)}><i className="bi bi-trash"></i></button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'standings' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        {standingsLoading ? (
                          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                        ) : showStandingForm ? (
                          <form onSubmit={handleStandingSubmit}>
                            <div className="d-flex justify-content-between mb-3">
                              <h5>{editingStanding ? 'Edit' : 'Add'} Standing</h5>
                              <button type="button" className="btn btn-secondary" onClick={() => { setShowStandingForm(false); setEditingStanding(null); }}>Cancel</button>
                            </div>
                            <div className="row g-3">
                              <div className="col-md-4"><label className="form-label">Season *</label><input type="text" className="form-control" value={standingForm.season} onChange={(e) => setStandingForm({...standingForm, season: e.target.value})} required placeholder="e.g., 2024/2025" /></div>
                              <div className="col-md-4"><label className="form-label">League *</label><input type="text" className="form-control" value={standingForm.league} onChange={(e) => setStandingForm({...standingForm, league: e.target.value})} required placeholder="e.g., Premier League" /></div>
                              <div className="col-md-4"><label className="form-label">Division</label><input type="text" className="form-control" value={standingForm.division} onChange={(e) => setStandingForm({...standingForm, division: e.target.value})} placeholder="e.g., U12 Boys" /></div>
                              <div className="col-md-6"><label className="form-label">Team Name *</label><input type="text" className="form-control" value={standingForm.team} onChange={(e) => setStandingForm({...standingForm, team: e.target.value})} required placeholder="Team name" /></div>
                              <div className="col-md-6"><label className="form-label">Form</label><input type="text" className="form-control" value={standingForm.form} onChange={(e) => setStandingForm({...standingForm, form: e.target.value})} placeholder="e.g., WWLDW" /></div>
                              <div className="col-12"><hr className="my-2" /></div>
                              <div className="col-12"><h6 className="mb-0">Match Statistics</h6></div>
                              <div className="col-md-3"><label className="form-label">Played</label><input type="number" className="form-control" value={standingForm.played} onChange={(e) => setStandingForm({...standingForm, played: parseInt(e.target.value) || 0})} min="0" /></div>
                              <div className="col-md-3"><label className="form-label">Won</label><input type="number" className="form-control" value={standingForm.won} onChange={(e) => setStandingForm({...standingForm, won: parseInt(e.target.value) || 0})} min="0" /></div>
                              <div className="col-md-3"><label className="form-label">Drawn</label><input type="number" className="form-control" value={standingForm.drawn} onChange={(e) => setStandingForm({...standingForm, drawn: parseInt(e.target.value) || 0})} min="0" /></div>
                              <div className="col-md-3"><label className="form-label">Lost</label><input type="number" className="form-control" value={standingForm.lost} onChange={(e) => setStandingForm({...standingForm, lost: parseInt(e.target.value) || 0})} min="0" /></div>
                              <div className="col-md-6"><label className="form-label">Goals For</label><input type="number" className="form-control" value={standingForm.goalsFor} onChange={(e) => setStandingForm({...standingForm, goalsFor: parseInt(e.target.value) || 0})} min="0" /></div>
                              <div className="col-md-6"><label className="form-label">Goals Against</label><input type="number" className="form-control" value={standingForm.goalsAgainst} onChange={(e) => setStandingForm({...standingForm, goalsAgainst: parseInt(e.target.value) || 0})} min="0" /></div>
                              <div className="col-md-6"><label className="form-label">Visibility</label><select className="form-select" value={standingForm.isPublic} onChange={(e) => setStandingForm({...standingForm, isPublic: e.target.value === 'true'})}><option value="true">Public - Visible to Everyone</option><option value="false">Internal - Staff Only</option></select></div>
                              <div className="col-md-6"><label className="form-label">Points</label><input type="number" className="form-control" value={standingForm.points} onChange={(e) => setStandingForm({...standingForm, points: parseInt(e.target.value) || 0})} min="0" placeholder="Auto-calculated: Won*3 + Drawn*1" /></div>
                              <div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={standingForm.notes} onChange={(e) => setStandingForm({...standingForm, notes: e.target.value})} placeholder="Internal notes..."></textarea></div>
                              <div className="col-12"><button type="submit" className="btn btn-success w-100" disabled={standingsLoading}>{standingsLoading ? 'Saving...' : (editingStanding ? 'Update Standing' : 'Add Standing')}</button></div>
                            </div>
                          </form>
                        ) : (
                          <>
                            <button className="btn btn-primary mb-3" onClick={() => setShowStandingForm(true)}><i className="bi bi-plus-circle me-1"></i> Add Standing</button>
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead className="table-light"><tr><th>Pos</th><th>Team</th><th>Played</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th><th>Form</th><th>Actions</th></tr></thead>
                                <tbody>
                                  {standings.length === 0 ? (
                                    <tr><td colSpan="12" className="text-center py-5"><p className="text-muted mb-0">No standings yet</p></td></tr>
                                  ) : (
                                    standings.map((standing, index) => (
                                      <tr key={standing._id}>
                                        <td><strong>{index + 1}</strong></td>
                                        <td><strong>{standing.team}</strong><br/><small className="text-muted">{standing.league} {standing.division && `- ${standing.division}`}</small></td>
                                        <td>{standing.played}</td>
                                        <td>{standing.won}</td>
                                        <td>{standing.drawn}</td>
                                        <td>{standing.lost}</td>
                                        <td>{standing.goalsFor}</td>
                                        <td>{standing.goalsAgainst}</td>
                                        <td><span className={standing.goalDifference >= 0 ? 'text-success' : 'text-danger'}>{standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}</span></td>
                                        <td><strong>{standing.points}</strong></td>
                                        <td><small>{standing.form || '-'}</small></td>
                                        <td>
                                          <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary" onClick={() => { setStandingForm(standing); setEditingStanding(standing); setShowStandingForm(true); }}><i className="bi bi-pencil"></i></button>
                                            <button className="btn btn-outline-danger" onClick={() => handleDeleteStanding(standing._id)}><i className="bi bi-trash"></i></button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'statistics' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        {/* Key Metrics */}
                        <div className="row g-3 mb-4">
                          <div className="col-md-3">
                            <div className="card bg-primary bg-opacity-10 border-primary h-100">
                              <div className="card-body text-center">
                                <i className="bi bi-people-fill display-4 text-primary"></i>
                                <h3 className="mt-2 mb-0">{managedTeams.length}</h3>
                                <p className="text-muted mb-0">Total Teams</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-success bg-opacity-10 border-success h-100">
                              <div className="card-body text-center">
                                <i className="bi bi-trophy-fill display-4 text-success"></i>
                                <h3 className="mt-2 mb-0">{matches.length}</h3>
                                <p className="text-muted mb-0">Total Matches</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-warning bg-opacity-10 border-warning h-100">
                              <div className="card-body text-center">
                                <i className="bi bi-calendar-event-fill display-4 text-warning"></i>
                                <h3 className="mt-2 mb-0">{schedules.length}</h3>
                                <p className="text-muted mb-0">Schedules</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card bg-info bg-opacity-10 border-info h-100">
                              <div className="card-body text-center">
                                <i className="bi bi-bar-chart-fill display-4 text-info"></i>
                                <h3 className="mt-2 mb-0">{standings.length}</h3>
                                <p className="text-muted mb-0">Standings</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Team Statistics */}
                        <div className="row g-3 mb-4">
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header">
                                <h6 className="mb-0"><i className="bi bi-trophy me-2"></i>Team Performance</h6>
                              </div>
                              <div className="card-body">
                                {managedTeams.length > 0 ? (
                                  <div className="table-responsive">
                                    <table className="table table-sm">
                                      <thead>
                                        <tr>
                                          <th>Team</th>
                                          <th>Status</th>
                                          <th>Players</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {managedTeams.slice(0, 5).map(team => (
                                          <tr key={team._id}>
                                            <td><strong>{team.name}</strong></td>
                                            <td><span className={`badge bg-${team.status === 'Active' ? 'success' : 'warning'}`}>{team.status}</span></td>
                                            <td>{team.currentPlayers}/{team.maxPlayers}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-muted text-center mb-0">No teams data available</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header">
                                <h6 className="mb-0"><i className="bi bi-bar-chart-line me-2"></i>Match Statistics</h6>
                              </div>
                              <div className="card-body">
                                {matches.length > 0 ? (
                                  <div>
                                    <div className="d-flex justify-content-between mb-2">
                                      <span>Total Matches:</span>
                                      <strong>{matches.length}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                      <span>Completed:</span>
                                      <strong className="text-success">{matches.filter(m => m.status === 'Completed').length}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                      <span>Scheduled:</span>
                                      <strong className="text-primary">{matches.filter(m => m.status === 'Scheduled').length}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                      <span>In Progress:</span>
                                      <strong className="text-warning">{matches.filter(m => m.status === 'In Progress').length}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                      <span>Cancelled:</span>
                                      <strong className="text-danger">{matches.filter(m => m.status === 'Cancelled').length}</strong>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-muted text-center mb-0">No match data available</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Standings Overview */}
                        <div className="row g-3 mb-4">
                          <div className="col-12">
                            <div className="card">
                              <div className="card-header">
                                <h6 className="mb-0"><i className="bi bi-list-ol me-2"></i>League Standings Overview</h6>
                              </div>
                              <div className="card-body">
                                {standings.length > 0 ? (
                                  <div className="table-responsive">
                                    <table className="table table-sm table-hover">
                                      <thead className="table-light">
                                        <tr>
                                          <th>Pos</th>
                                          <th>Team</th>
                                          <th>P</th>
                                          <th>W</th>
                                          <th>D</th>
                                          <th>L</th>
                                          <th>GD</th>
                                          <th>Pts</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {standings.slice(0, 10).map((standing, index) => (
                                          <tr key={standing._id}>
                                            <td><strong>{index + 1}</strong></td>
                                            <td><strong>{standing.team}</strong></td>
                                            <td>{standing.played}</td>
                                            <td>{standing.won}</td>
                                            <td>{standing.drawn}</td>
                                            <td>{standing.lost}</td>
                                            <td className={standing.goalDifference >= 0 ? 'text-success' : 'text-danger'}>
                                              {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                                            </td>
                                            <td><strong>{standing.points}</strong></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-muted text-center mb-0">No standings data available</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header">
                                <h6 className="mb-0"><i className="bi bi-calendar-check me-2"></i>Upcoming Matches</h6>
                              </div>
                              <div className="card-body">
                                {matches.filter(m => m.status === 'Scheduled').length > 0 ? (
                                  <div className="list-group list-group-flush">
                                    {matches.filter(m => m.status === 'Scheduled').slice(0, 5).map(match => (
                                      <div key={match._id} className="list-group-item px-0">
                                        <div className="d-flex justify-content-between">
                                          <div>
                                            <strong>{match.homeTeam}</strong> vs <strong>{match.awayTeam}</strong>
                                            <br/>
                                            <small className="text-muted">{match.date ? new Date(match.date).toLocaleDateString() : 'N/A'} - {match.time || 'TBD'}</small>
                                          </div>
                                          <span className="badge bg-primary align-self-center">{match.type}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted text-center mb-0">No upcoming matches</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header">
                                <h6 className="mb-0"><i className="bi bi-clock me-2"></i>Recent Activity</h6>
                              </div>
                              <div className="card-body">
                                {matches.filter(m => m.status === 'Completed').length > 0 ? (
                                  <div className="list-group list-group-flush">
                                    {matches.filter(m => m.status === 'Completed').slice(0, 5).map(match => (
                                      <div key={match._id} className="list-group-item px-0">
                                        <div className="d-flex justify-content-between">
                                          <div>
                                            <strong>{match.homeTeam}</strong> {match.homeScore || 0} - {match.awayScore || 0} <strong>{match.awayTeam}</strong>
                                            <br/>
                                            <small className="text-muted">{match.date ? new Date(match.date).toLocaleDateString() : 'N/A'}</small>
                                          </div>
                                          <span className="badge bg-success align-self-center">Final</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted text-center mb-0">No completed matches</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'players' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Player Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Player management features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Player registration and profiles</li>
                            <li>Skill assessments and tracking</li>
                            <li>Medical records and health tracking</li>
                            <li>Performance statistics and analytics</li>
                            <li>Parent/guardian communication</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-person-badge display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Player Management</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'coaches' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Coach Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Coach Management is now available!</strong> Access the full coaches management system with features including:
                          <ul className="mt-2 mb-3">
                            <li>Coach profiles and certifications</li>
                            <li>Specialization and experience tracking</li>
                            <li>Team assignment and management</li>
                            <li>Performance evaluation tools</li>
                            <li>Communication with players and parents</li>
                          </ul>
                          <Link to="/admin/coaches" className="btn btn-success">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Coaches Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-person-workspace display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Coach Management Ready</h4>
                          <p className="text-muted">Click the button above to access the full coaches management system.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'parents' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Parent Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Parent Management is now available!</strong> Access the full parents management system with features including:
                          <ul className="mt-2 mb-3">
                            <li>Parent profiles and contact information</li>
                            <li>Children and family management</li>
                            <li>Volunteer interests tracking</li>
                            <li>Communication preferences and history</li>
                            <li>Emergency contact management</li>
                          </ul>
                          <Link to="/admin/parents" className="btn btn-success">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Parents Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-people display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Parents Management Ready</h4>
                          <p className="text-muted">Click the button above to access the full parents management system.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'matches' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-end align-items-center">
                        {!showMatchForm && (
                          <button className="btn btn-primary" onClick={() => setShowMatchForm(true)}>
                            <i className="bi bi-plus-circle me-1"></i> Schedule New Match
                          </button>
                        )}
                      </div>
                      <div className="card-body">
                        {matchesLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mt-2">Loading matches...</p>
                          </div>
                        ) : showMatchForm ? (
                          <form onSubmit={handleMatchSubmit}>
                            <div className="d-flex justify-content-between mb-3">
                              <h5>{editingMatch ? 'Edit Match' : 'Schedule New Match'}</h5>
                              <button type="button" className="btn btn-secondary" onClick={() => { setShowMatchForm(false); setEditingMatch(null); }}>Cancel</button>
                            </div>
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label">Home Team *</label>
                                <input type="text" className="form-control" value={matchForm.homeTeam} onChange={(e) => setMatchForm({...matchForm, homeTeam: e.target.value})} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Away Team *</label>
                                <input type="text" className="form-control" value={matchForm.awayTeam} onChange={(e) => setMatchForm({...matchForm, awayTeam: e.target.value})} required />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Date *</label>
                                <input type="date" className="form-control" value={matchForm.date} onChange={(e) => setMatchForm({...matchForm, date: e.target.value})} required />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Time *</label>
                                <input type="time" className="form-control" value={matchForm.time} onChange={(e) => setMatchForm({...matchForm, time: e.target.value})} required />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Location *</label>
                                <input type="text" className="form-control" value={matchForm.location} onChange={(e) => setMatchForm({...matchForm, location: e.target.value})} required />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Match Type</label>
                                <select className="form-select" value={matchForm.type} onChange={(e) => setMatchForm({...matchForm, type: e.target.value})}>
                                  <option value="League">League</option>
                                  <option value="Cup">Cup</option>
                                  <option value="Friendly">Friendly</option>
                                  <option value="Tournament">Tournament</option>
                                </select>
                              </div>
                              {editingMatch && (
                                <>
                                  <div className="col-md-6">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={matchForm.status} onChange={(e) => setMatchForm({...matchForm, status: e.target.value})}>
                                      <option value="Scheduled">Scheduled</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                  <div className="col-12"><hr className="my-2" /></div>
                                  <div className="col-12"><h6 className="mb-0">Match Result</h6></div>
                                  <div className="col-md-6">
                                    <label className="form-label">Home Score</label>
                                    <input type="number" className="form-control" value={matchForm.homeScore} onChange={(e) => setMatchForm({...matchForm, homeScore: parseInt(e.target.value) || 0})} min="0" />
                                  </div>
                                  <div className="col-md-6">
                                    <label className="form-label">Away Score</label>
                                    <input type="number" className="form-control" value={matchForm.awayScore} onChange={(e) => setMatchForm({...matchForm, awayScore: parseInt(e.target.value) || 0})} min="0" />
                                  </div>
                                </>
                              )}
                              <div className="col-12">
                                <label className="form-label">Notes</label>
                                <textarea className="form-control" rows="2" value={matchForm.notes} onChange={(e) => setMatchForm({...matchForm, notes: e.target.value})} placeholder="Add any additional details..."></textarea>
                              </div>
                              <div className="col-12">
                                <button type="submit" className="btn btn-success w-100" disabled={matchesLoading}>
                                  {matchesLoading ? 'Saving...' : (editingMatch ? 'Update Match' : 'Schedule Match')}
                                </button>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead className="table-light">
                                <tr>
                                  <th>Date</th>
                                  <th>Time</th>
                                  <th>Match</th>
                                  <th>Score</th>
                                  <th>Type</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {matches.length === 0 ? (
                                  <tr>
                                    <td colSpan="7" className="text-center py-5">
                                      <i className="bi bi-trophy-fill" style={{fontSize: '3rem', color: '#ccc'}}></i>
                                      <p className="text-muted mt-2 mb-0">No matches scheduled</p>
                                    </td>
                                  </tr>
                                ) : (
                                  matches.map((match) => (
                                    <tr key={match._id}>
                                      <td>{match.date ? new Date(match.date).toLocaleDateString() : 'N/A'}</td>
                                      <td>{match.time || 'N/A'}</td>
                                      <td><strong>{match.homeTeam}</strong> vs <strong>{match.awayTeam}</strong><br/><small className="text-muted">{match.location}</small></td>
                                      <td><span className="badge bg-secondary">{match.homeScore} - {match.awayScore}</span></td>
                                      <td><span className="badge bg-info">{match.type}</span></td>
                                      <td><span className={`badge bg-${match.status === 'Completed' ? 'success' : match.status === 'In Progress' ? 'warning' : match.status === 'Cancelled' ? 'danger' : 'primary'}`}>{match.status}</span></td>
                                      <td>
                                        <div className="btn-group btn-group-sm">
                                          <button className="btn btn-outline-primary" onClick={() => { setMatchForm(match); setEditingMatch(match); setShowMatchForm(true); }} title="Edit">
                                            <i className="bi bi-pencil"></i>
                                          </button>
                                          <button className="btn btn-outline-danger" onClick={() => handleDeleteMatch(match._id)} title="Delete">
                                            <i className="bi bi-trash"></i>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'training' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-body">
                        {trainingsLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                          </div>
                        ) : showTrainingForm ? (
                          <form onSubmit={handleTrainingSubmit}>
                            <div className="d-flex justify-content-between mb-3">
                              <h5>{editingTraining ? 'Edit' : 'Create'} Training</h5>
                              <button type="button" className="btn btn-secondary" onClick={() => { setShowTrainingForm(false); setEditingTraining(null); }}>Cancel</button>
                            </div>
                            <div className="row g-3">
                              <div className="col-md-6"><label>Title *</label><input type="text" className="form-control" value={trainingForm.title} onChange={(e) => setTrainingForm({...trainingForm, title: e.target.value})} required /></div>
                              <div className="col-md-6"><label>Team</label><input type="text" className="form-control" value={trainingForm.team} onChange={(e) => setTrainingForm({...trainingForm, team: e.target.value})} /></div>
                              <div className="col-md-6"><label>Coach</label><input type="text" className="form-control" value={trainingForm.coach} onChange={(e) => setTrainingForm({...trainingForm, coach: e.target.value})} /></div>
                              <div className="col-md-6"><label>Type</label><select className="form-select" value={trainingForm.type} onChange={(e) => setTrainingForm({...trainingForm, type: e.target.value})}><option>Technical</option><option>Tactical</option><option>Physical</option></select></div>
                              <div className="col-md-4"><label>Date</label><input type="date" className="form-control" value={trainingForm.date} onChange={(e) => setTrainingForm({...trainingForm, date: e.target.value})} /></div>
                              <div className="col-md-4"><label>Start Time</label><input type="time" className="form-control" value={trainingForm.startTime} onChange={(e) => setTrainingForm({...trainingForm, startTime: e.target.value})} /></div>
                              <div className="col-md-4"><label>End Time</label><input type="time" className="form-control" value={trainingForm.endTime} onChange={(e) => setTrainingForm({...trainingForm, endTime: e.target.value})} /></div>
                              <div className="col-md-6"><label>Location</label><input type="text" className="form-control" value={trainingForm.location} onChange={(e) => setTrainingForm({...trainingForm, location: e.target.value})} /></div>
                              <div className="col-md-6"><label>Capacity</label><input type="number" className="form-control" value={trainingForm.capacity} onChange={(e) => setTrainingForm({...trainingForm, capacity: parseInt(e.target.value) || 20})} /></div>
                              <div className="col-12"><label>Description</label><textarea className="form-control" rows="2" value={trainingForm.description} onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}></textarea></div>
                              <div className="col-12"><button type="submit" className="btn btn-success w-100">{trainingsLoading ? 'Saving...' : (editingTraining ? 'Update' : 'Create')}</button></div>
                            </div>
                          </form>
                        ) : (
                          <>
                            <button className="btn btn-primary mb-3" onClick={() => setShowTrainingForm(true)}><i className="bi bi-plus-circle me-1"></i> New Training</button>
                            <table className="table table-hover">
                              <thead className="table-light"><tr><th>Title</th><th>Team</th><th>Date & Time</th><th>Type</th><th>Capacity</th><th>Actions</th></tr></thead>
                              <tbody>
                                {trainings.length === 0 ? (
                                  <tr><td colSpan="6" className="text-center py-5"><p className="text-muted mb-0">No trainings scheduled</p></td></tr>
                                ) : (
                                  trainings.map((t) => (
                                    <tr key={t._id}>
                                      <td><strong>{t.title}</strong></td>
                                      <td>{t.team}</td>
                                      <td>{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}<br/><small>{t.startTime} - {t.endTime}</small></td>
                                      <td><span className="badge bg-info">{t.type}</span></td>
                                      <td>{t.enrolled}/{t.capacity}</td>
                                      <td>
                                        <div className="btn-group btn-group-sm">
                                          <button className="btn btn-outline-primary" onClick={() => { setTrainingForm(t); setEditingTraining(t); setShowTrainingForm(true); }}><i className="bi bi-pencil"></i></button>
                                          <button className="btn btn-outline-danger" onClick={() => handleDeleteTraining(t._id)}><i className="bi bi-trash"></i></button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'facilities' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Facility Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Facility management features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Field and facility booking system</li>
                            <li>Maintenance scheduling and tracking</li>
                            <li>Facility availability and capacity</li>
                            <li>Rental and usage management</li>
                            <li>Facility condition monitoring</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-building display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Facility Management</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

        {activeSection === 'inventory' && (
          <div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Inventory Management</h5>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-success">
                      <i className="bi bi-check-circle me-2"></i>
                      Inventory management system is now available! Click below to access the complete inventory management interface.
                    </div>
                    <div className="text-center py-5">
                      <i className="bi bi-box display-1 text-primary"></i>
                      <h4 className="mt-3">Inventory Management System</h4>
                      <p className="text-muted mb-4">Access the complete inventory management interface with equipment tracking, maintenance scheduling, rental management, and more.</p>
                      <a
                        href="/admin/inventory"
                        className="btn btn-primary btn-lg"
                      >
                        <i className="bi bi-arrow-right me-2"></i>
                        Open Inventory Management
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

            {activeSection === 'volunteers' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Volunteer Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Volunteer Management is now available!</strong> Access the comprehensive volunteers management system with features including:
                          <ul className="mt-2 mb-3">
                            <li>Volunteer registration and profiles</li>
                            <li>Skills and category management</li>
                            <li>Background check and training tracking</li>
                            <li>Availability and scheduling</li>
                            <li>Recognition and reward systems</li>
                            <li>Bulk actions and reporting</li>
                          </ul>
                          <Link to="/admin/volunteers" className="btn btn-success">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Volunteers Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-heart display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Volunteers Management Ready</h4>
                          <p className="text-muted">Click the button above to access the comprehensive volunteers management system.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sponsors' && (
              <div>
                {/* Statistics Cards */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-1 small">Total Sponsors</p>
                            <h3 className="mb-0">{sponsorStats().total}</h3>
                          </div>
                          <div className="bg-primary bg-opacity-10 p-3 rounded">
                            <i className="bi bi-building text-primary fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-1 small">Active Sponsors</p>
                            <h3 className="mb-0">{sponsorStats().active}</h3>
                          </div>
                          <div className="bg-success bg-opacity-10 p-3 rounded">
                            <i className="bi bi-check-circle text-success fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-1 small">Pending</p>
                            <h3 className="mb-0">{sponsorStats().pending}</h3>
                          </div>
                          <div className="bg-warning bg-opacity-10 p-3 rounded">
                            <i className="bi bi-clock text-warning fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="text-muted mb-1 small">Total Revenue</p>
                            <h3 className="mb-0">${sponsorStats().totalRevenue.toLocaleString()}</h3>
                          </div>
                          <div className="bg-info bg-opacity-10 p-3 rounded">
                            <i className="bi bi-cash-stack text-info fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sponsors Management Section */}
                <div className="card">
                  <div className="card-body">
                    {sponsorsLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : showSponsorForm ? (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0">{editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</h5>
                          <button className="btn btn-secondary" onClick={resetSponsorForm}>
                            <i className="bi bi-x-lg me-2"></i>Cancel
                          </button>
                        </div>
                        <form onSubmit={handleSponsorSubmit}>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Company Name *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={sponsorForm.companyName}
                                onChange={(e) => setSponsorForm({...sponsorForm, companyName: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Contact Person *</label>
                              <input
                                type="text"
                                className="form-control"
                                value={sponsorForm.contactPerson}
                                onChange={(e) => setSponsorForm({...sponsorForm, contactPerson: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Email *</label>
                              <input
                                type="email"
                                className="form-control"
                                value={sponsorForm.email}
                                onChange={(e) => setSponsorForm({...sponsorForm, email: e.target.value})}
                                required
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Phone</label>
                              <input
                                type="tel"
                                className="form-control"
                                value={sponsorForm.phone}
                                onChange={(e) => setSponsorForm({...sponsorForm, phone: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Website</label>
                              <input
                                type="url"
                                className="form-control"
                                value={sponsorForm.website}
                                onChange={(e) => setSponsorForm({...sponsorForm, website: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Tier *</label>
                              <select
                                className="form-select"
                                value={sponsorForm.tier}
                                onChange={(e) => setSponsorForm({...sponsorForm, tier: e.target.value})}
                                required
                              >
                                <option value="Platinum">💎 Platinum</option>
                                <option value="Gold">🥇 Gold</option>
                                <option value="Silver">🥈 Silver</option>
                                <option value="Bronze">🥉 Bronze</option>
                                <option value="In-Kind">🎁 In-Kind</option>
                              </select>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Sponsorship Amount ($)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={sponsorForm.amount}
                                onChange={(e) => setSponsorForm({...sponsorForm, amount: parseFloat(e.target.value) || 0})}
                                min="0"
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Payment Frequency</label>
                              <select
                                className="form-select"
                                value={sponsorForm.paymentFrequency}
                                onChange={(e) => setSponsorForm({...sponsorForm, paymentFrequency: e.target.value})}
                              >
                                <option value="Annual">Annual</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="One-Time">One-Time</option>
                              </select>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Contract Start Date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={sponsorForm.contractStart}
                                onChange={(e) => setSponsorForm({...sponsorForm, contractStart: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Contract End Date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={sponsorForm.contractEnd}
                                onChange={(e) => setSponsorForm({...sponsorForm, contractEnd: e.target.value})}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Status</label>
                              <select
                                className="form-select"
                                value={sponsorForm.status}
                                onChange={(e) => setSponsorForm({...sponsorForm, status: e.target.value})}
                              >
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Expired">Expired</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Visible on Website</label>
                              <select
                                className="form-select"
                                value={sponsorForm.isVisible}
                                onChange={(e) => setSponsorForm({...sponsorForm, isVisible: e.target.value === 'true'})}
                              >
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                              </select>
                            </div>
                            <div className="col-12 mb-3">
                              <label className="form-label">Address</label>
                              <input
                                type="text"
                                className="form-control"
                                value={sponsorForm.address}
                                onChange={(e) => setSponsorForm({...sponsorForm, address: e.target.value})}
                              />
                            </div>
                            <div className="col-12 mb-3">
                              <label className="form-label">Benefits</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={sponsorForm.benefits}
                                onChange={(e) => setSponsorForm({...sponsorForm, benefits: e.target.value})}
                                placeholder="e.g., Logo on jerseys, Website placement, Banner at games..."
                              />
                            </div>
                            <div className="col-12 mb-3">
                              <label className="form-label">Notes</label>
                              <textarea
                                className="form-control"
                                rows="3"
                                value={sponsorForm.notes}
                                onChange={(e) => setSponsorForm({...sponsorForm, notes: e.target.value})}
                                placeholder="Additional notes about the sponsor..."
                              />
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary">
                              <i className="bi bi-save me-2"></i>
                              {editingSponsor ? 'Update Sponsor' : 'Create Sponsor'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={resetSponsorForm}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5 className="mb-0">All Sponsors</h5>
                          <button className="btn btn-primary" onClick={() => setShowSponsorForm(true)}>
                            <i className="bi bi-plus-lg me-2"></i>Add New Sponsor
                          </button>
                        </div>
                        
                        {sponsors.length === 0 ? (
                          <div className="text-center py-5">
                            <i className="bi bi-building" style={{fontSize: '4rem', color: '#ccc'}}></i>
                            <p className="text-muted mt-3">No sponsors found. Add your first sponsor to get started!</p>
                            <button className="btn btn-primary mt-2" onClick={() => setShowSponsorForm(true)}>
                              <i className="bi bi-plus-lg me-2"></i>Add First Sponsor
                            </button>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Company</th>
                                  <th>Contact</th>
                                  <th>Tier</th>
                                  <th>Amount</th>
                                  <th>Contract Period</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sponsors.map(sponsor => (
                                  <tr key={sponsor._id}>
                                    <td>
                                      <strong>{sponsor.companyName}</strong>
                                      {sponsor.website && (
                                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="ms-2">
                                          <i className="bi bi-box-arrow-up-right"></i>
                                        </a>
                                      )}
                                    </td>
                                    <td>
                                      <div>{sponsor.contactPerson}</div>
                                      <small className="text-muted">{sponsor.email}</small>
                                    </td>
                                    <td>
                                      <span className={`badge ${
                                        sponsor.tier === 'Platinum' ? 'bg-dark' :
                                        sponsor.tier === 'Gold' ? 'bg-warning' :
                                        sponsor.tier === 'Silver' ? 'bg-secondary' :
                                        sponsor.tier === 'Bronze' ? 'bg-info' :
                                        'bg-light text-dark'
                                      }`}>
                                        {sponsor.tier === 'Platinum' && '💎'} 
                                        {sponsor.tier === 'Gold' && '🥇'} 
                                        {sponsor.tier === 'Silver' && '🥈'} 
                                        {sponsor.tier === 'Bronze' && '🥉'} 
                                        {sponsor.tier === 'In-Kind' && '🎁'} 
                                        {sponsor.tier}
                                      </span>
                                    </td>
                                    <td>
                                      <strong>${sponsor.amount?.toLocaleString() || 0}</strong>
                                      <br/>
                                      <small className="text-muted">{sponsor.paymentFrequency}</small>
                                    </td>
                                    <td>
                                      {sponsor.contractStart && sponsor.contractEnd ? (
                                        <small>
                                          {new Date(sponsor.contractStart).toLocaleDateString()} - {new Date(sponsor.contractEnd).toLocaleDateString()}
                                        </small>
                                      ) : (
                                        <small className="text-muted">Not set</small>
                                      )}
                                    </td>
                                    <td>
                                      <span className={`badge ${
                                        sponsor.status === 'Active' ? 'bg-success' :
                                        sponsor.status === 'Pending' ? 'bg-warning' :
                                        sponsor.status === 'Expired' ? 'bg-danger' :
                                        'bg-secondary'
                                      }`}>
                                        {sponsor.status}
                                      </span>
                                      {!sponsor.isVisible && (
                                        <span className="badge bg-secondary ms-1">Hidden</span>
                                      )}
                                    </td>
                                    <td>
                                      <div className="btn-group btn-group-sm">
                                        <button
                                          className="btn btn-outline-primary"
                                          onClick={() => handleEditSponsor(sponsor)}
                                          title="Edit"
                                        >
                                          <i className="bi bi-pencil"></i>
                                        </button>
                                        <button
                                          className="btn btn-outline-danger"
                                          onClick={() => handleDeleteSponsor(sponsor._id)}
                                          title="Delete"
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
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'membership' && (
              <div>
                {/* Header with Statistics and Action Buttons */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Statistics */}
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                          <i className="bi bi-people text-primary fs-2 mb-2"></i>
                          <p className="text-muted mb-1 small fw-semibold">Total Members</p>
                          <h4 className="mb-0 text-dark fw-bold">{membershipStats.totalMembers}</h4>
                        </div>
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                          <i className="bi bi-person-check text-success fs-2 mb-2"></i>
                          <p className="text-muted mb-1 small fw-semibold">Active Members</p>
                          <h4 className="mb-0 text-success fw-bold">{membershipStats.activeMembers}</h4>
                        </div>
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                          <i className="bi bi-clock-history text-warning fs-2 mb-2"></i>
                          <p className="text-muted mb-1 small fw-semibold">Expired</p>
                          <h4 className="mb-0 text-warning fw-bold">{membershipStats.expiredMembers}</h4>
                        </div>
                      </div>
                      <div className="col-lg-2 col-md-6">
                        <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                          <i className="bi bi-currency-dollar text-info fs-2 mb-2"></i>
                          <p className="text-muted mb-1 small fw-semibold">Total Revenue</p>
                          <h4 className="mb-0 text-info fw-bold">${membershipStats.totalRevenue.toLocaleString()}</h4>
                        </div>
                      </div>
                      
                      {/* Quick Action Buttons */}
                      <div className="col-lg-4">
                        <div className="h-100 d-flex flex-column gap-2 justify-content-center">
                          <button 
                            className="btn btn-warning btn-lg w-100"
                            onClick={() => {
                              setMembershipTab('tiers');
                              setShowTierForm(true);
                            }}
                          >
                            <i className="bi bi-trophy me-2"></i>
                            Create Membership Tier
                          </button>
                          <button 
                            className="btn btn-success btn-lg w-100"
                            onClick={() => {
                              setMembershipTab('members');
                              setShowMembershipForm(true);
                            }}
                          >
                            <i className="bi bi-person-plus me-2"></i>
                            Add New Member
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visible Tabs */}
                <div className="mb-4">
                  <div className="btn-group w-100 shadow-sm" role="group">
                    <button 
                      type="button"
                      className={`btn btn-lg ${membershipTab === 'tiers' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setMembershipTab('tiers')}
                    >
                      <i className="bi bi-trophy me-2"></i>
                      Membership Tiers
                    </button>
                    <button 
                      type="button"
                      className={`btn btn-lg ${membershipTab === 'members' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setMembershipTab('members')}
                    >
                      <i className="bi bi-people-fill me-2"></i>
                      All Members
                    </button>
                  </div>
                </div>

                {/* Tiers Tab */}
                {membershipTab === 'tiers' && (
                  <div className="card shadow-sm">
                    <div className="card-header bg-white py-3">
                      <h5 className="mb-0 fw-bold">
                        <i className="bi bi-trophy text-warning me-2"></i>Membership Tiers
                      </h5>
                    </div>
                    <div className="card-body">
                      {membershipsLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : showTierForm ? (
                        <div className="bg-light p-4 rounded">
                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0 fw-bold">
                              <i className="bi bi-trophy text-warning me-2"></i>
                              {editingTier ? 'Edit Tier' : 'Create New Tier'}
                            </h5>
                            <button className="btn btn-outline-secondary" onClick={resetTierForm}>
                              <i className="bi bi-x-lg me-2"></i>Cancel
                            </button>
                          </div>
                          <form onSubmit={handleTierSubmit}>
                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Tier Name *</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={tierForm.name}
                                  onChange={(e) => setTierForm({...tierForm, name: e.target.value})}
                                  required
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Price ($) *</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={tierForm.price}
                                  onChange={(e) => setTierForm({...tierForm, price: parseFloat(e.target.value) || 0})}
                                  min="0"
                                  required
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Duration (months) *</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={tierForm.duration}
                                  onChange={(e) => setTierForm({...tierForm, duration: parseInt(e.target.value) || 12})}
                                  min="1"
                                  required
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Discount Percentage (%)</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={tierForm.discountPercentage}
                                  onChange={(e) => setTierForm({...tierForm, discountPercentage: parseInt(e.target.value) || 0})}
                                  min="0"
                                  max="100"
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Color</label>
                                <input
                                  type="color"
                                  className="form-control"
                                  value={tierForm.color}
                                  onChange={(e) => setTierForm({...tierForm, color: e.target.value})}
                                />
                              </div>
                              <div className="col-md-6 mb-3">
                                <label className="form-label">Status</label>
                                <select
                                  className="form-select"
                                  value={tierForm.isActive}
                                  onChange={(e) => setTierForm({...tierForm, isActive: e.target.value === 'true'})}
                                >
                                  <option value="true">Active</option>
                                  <option value="false">Inactive</option>
                                </select>
                              </div>
                              <div className="col-12 mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                  className="form-control"
                                  rows="3"
                                  value={tierForm.description}
                                  onChange={(e) => setTierForm({...tierForm, description: e.target.value})}
                                />
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button type="submit" className="btn btn-primary">
                                <i className="bi bi-save me-2"></i>
                                {editingTier ? 'Update Tier' : 'Create Tier'}
                              </button>
                              <button type="button" className="btn btn-secondary" onClick={resetTierForm}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div>
                          {membershipTiers.length === 0 ? (
                            <div className="text-center py-5">
                              <div className="mb-4">
                                <i className="bi bi-trophy-fill text-warning" style={{fontSize: '5rem', opacity: 0.3}}></i>
                              </div>
                              <h4 className="text-muted mb-3">No Membership Tiers Yet</h4>
                              <p className="text-muted mb-0">Click the 'Add New Tier' button above to create your first membership tier.</p>
                            </div>
                          ) : (
                            <div className="row">
                              {membershipTiers.map(tier => (
                                <div key={tier._id} className="col-lg-4 col-md-6 mb-4">
                                  <div className="card h-100 border-0 shadow-sm" style={{borderLeft: `4px solid ${tier.color || '#007bff'}`}}>
                                    <div className="card-body d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                          <h5 className="card-title fw-bold mb-1">{tier.name}</h5>
                                          <small className="text-muted">
                                            <i className="bi bi-clock me-1"></i>{tier.duration} month{tier.duration !== 1 ? 's' : ''}
                                          </small>
                                        </div>
                                        <span className={`badge ${tier.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                          {tier.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                      
                                      <div className="mb-3">
                                        <h2 className="text-dark mb-0">
                                          <strong>${tier.price}</strong>
                                        </h2>
                                        {tier.discountPercentage > 0 && (
                                          <span className="badge bg-warning text-dark mt-2">
                                            <i className="bi bi-tag-fill me-1"></i>{tier.discountPercentage}% OFF
                                          </span>
                                        )}
                                      </div>
                                      
                                      {tier.description && (
                                        <p className="card-text text-muted small mb-3 flex-grow-1">{tier.description}</p>
                                      )}
                                      
                                      <hr className="my-3" />
                                      
                                      <div className="d-flex gap-2 mt-auto">
                                        <button
                                          className="btn btn-outline-secondary btn-sm flex-fill"
                                          onClick={() => handleEditTier(tier)}
                                        >
                                          <i className="bi bi-pencil-square me-1"></i> Edit
                                        </button>
                                        <button
                                          className="btn btn-outline-danger btn-sm"
                                          onClick={() => {
                                            if (window.confirm(`Are you sure you want to delete the "${tier.name}" tier?`)) {
                                              handleDeleteTier(tier._id);
                                            }
                                          }}
                                          title="Delete tier"
                                        >
                                          <i className="bi bi-trash"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Members Tab */}
                {membershipTab === 'members' && (
                  <div className="card shadow-sm">
                    <div className="card-header bg-white py-3">
                      <h5 className="mb-0 fw-bold">
                        <i className="bi bi-people-fill text-info me-2"></i>All Memberships
                      </h5>
                    </div>
                    <div className="card-body">
                      {membershipsLoading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : memberships.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="mb-4">
                            <i className="bi bi-people-fill text-info" style={{fontSize: '5rem', opacity: 0.3}}></i>
                          </div>
                          <h4 className="text-muted mb-3">No Memberships Yet</h4>
                          <p className="text-muted mb-0">Memberships will appear here once members sign up for tiers.</p>
                        </div>
                      ) : (
                        <div>
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                              <thead>
                                <tr className="border-bottom">
                                  <th className="text-muted fw-normal small">MEMBER</th>
                                  <th className="text-muted fw-normal small">TIER</th>
                                  <th className="text-muted fw-normal small">START DATE</th>
                                  <th className="text-muted fw-normal small">END DATE</th>
                                  <th className="text-muted fw-normal small">AMOUNT</th>
                                  <th className="text-muted fw-normal small">STATUS</th>
                                  <th className="text-muted fw-normal small text-end">ACTIONS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {memberships.map(membership => (
                                  <tr key={membership._id} className="border-bottom">
                                    <td className="py-3">
                                      <div className="fw-semibold text-dark">{membership.user?.username || 'N/A'}</div>
                                      <small className="text-muted d-block">{membership.user?.email || 'N/A'}</small>
                                    </td>
                                    <td className="py-3">
                                      <span className="badge bg-primary">
                                        {membership.tier?.name || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="py-3">
                                      <span className="text-dark">{membership.startDate ? new Date(membership.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                    </td>
                                    <td className="py-3">
                                      <span className="text-dark">{membership.endDate ? new Date(membership.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                    </td>
                                    <td className="py-3">
                                      <div className="fw-bold text-dark">${membership.totalAmount || membership.amount || 0}</div>
                                    </td>
                                    <td className="py-3">
                                      <span className={`badge ${
                                        membership.status === 'active' ? 'bg-success' :
                                        membership.status === 'pending' ? 'bg-warning text-dark' :
                                        membership.status === 'expired' ? 'bg-danger' :
                                        membership.status === 'suspended' ? 'bg-secondary' :
                                        'bg-dark'
                                      }`}>
                                        {membership.status?.charAt(0).toUpperCase() + membership.status?.slice(1) || 'N/A'}
                                      </span>
                                    </td>
                                    <td className="py-3 text-end">
                                      <div className="btn-group btn-group-sm" role="group">
                                        <button
                                          className="btn btn-outline-secondary"
                                          onClick={() => handleEditMembership(membership)}
                                          title="Edit Membership"
                                        >
                                          <i className="bi bi-pencil-square"></i>
                                        </button>
                                        {membership.status === 'suspended' && (
                                          <button
                                            className="btn btn-outline-success"
                                            onClick={() => handleMembershipStatusChange(membership._id, 'active')}
                                            title="Activate"
                                          >
                                            <i className="bi bi-check-circle"></i>
                                          </button>
                                        )}
                                        {membership.status === 'active' && (
                                          <button
                                            className="btn btn-outline-warning"
                                            onClick={() => handleMembershipStatusChange(membership._id, 'suspended')}
                                            title="Suspend"
                                          >
                                            <i className="bi bi-pause-circle"></i>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {memberships.length > 0 && (
                            <div className="card-footer bg-light text-center py-3">
                              <small className="text-muted">
                                Showing {memberships.length} membership{memberships.length !== 1 ? 's' : ''}
                              </small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'payments' && (
              <div style={{padding: '0', margin: '-20px'}}>
                <UnifiedPaymentManager />
              </div>
            )}

            {activeSection === 'payments-old' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Payment Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>💳 Comprehensive Payment Management System Available!</strong> Process and track all club payments:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-credit-card me-2"></i>Payment Processing</h6>
                              <ul className="small">
                                <li><strong>10+ Payment Methods:</strong> Cards, PayPal, Zelle, Venmo, Cash App, Bank Transfer, Check, Cash</li>
                                <li><strong>Card Processing:</strong> Track card type (Visa, MC, Amex) and last 4 digits</li>
                                <li><strong>Transaction IDs:</strong> Reference numbers for all payments</li>
                                <li><strong>Payment Types:</strong> Registration, Membership, Tournament, Training, Equipment, Merchandise, Marketplace, Donations</li>
                                <li><strong>Real-Time Status:</strong> Completed, pending, failed, refunded, cancelled</li>
                                <li><strong>Payer Information:</strong> Name, email, and contact tracking</li>
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-graph-up me-2"></i>Tracking & Analytics</h6>
                              <ul className="small">
                                <li><strong>Revenue Tracking:</strong> Total revenue, completed payments, pending amounts</li>
                                <li><strong>Refund Management:</strong> Track refunds (full/partial), refund history, reasons</li>
                                <li><strong>Payment Analytics:</strong> Today's count, this week/month totals</li>
                                <li><strong>Method Performance:</strong> Revenue by payment method breakdown</li>
                                <li><strong>Success Rate:</strong> Payment completion percentage</li>
                                <li><strong>Refund Rate:</strong> Refund percentage monitoring</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-funnel me-2"></i>Advanced Features</h6>
                            <div className="row small">
                              <div className="col-md-4">• Search by donor, email, transaction ID</div>
                              <div className="col-md-4">• Filter by method, status, payment type</div>
                              <div className="col-md-4">• Date range filtering</div>
                              <div className="col-md-4">• Export to CSV for accounting</div>
                              <div className="col-md-4">• Payment details view</div>
                              <div className="col-md-4">• Quick refund processing</div>
                              <div className="col-md-4">• Manual payment recording</div>
                              <div className="col-md-4">• Transaction history</div>
                              <div className="col-md-4">• Revenue reports</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-link-45deg me-2"></i>System Integrations</h6>
                            <div className="row small">
                              <div className="col-md-3">• <strong>Registrations:</strong> Player registration payments</div>
                              <div className="col-md-3">• <strong>Memberships:</strong> Membership dues tracking</div>
                              <div className="col-md-3">• <strong>Marketplace:</strong> Equipment sales payments</div>
                              <div className="col-md-3">• <strong>Tournaments:</strong> Tournament entry fees</div>
                              <div className="col-md-3">• <strong>Training:</strong> Training session payments</div>
                              <div className="col-md-3">• <strong>Events:</strong> Event registration fees</div>
                              <div className="col-md-3">• <strong>Merchandise:</strong> Store purchases</div>
                              <div className="col-md-3">• <strong>Donations:</strong> Charitable contributions</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/payments" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Payment Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-credit-card-fill display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Payment Management System Ready</h4>
                          <p className="text-muted">Process payments, track revenue, manage refunds with complete integration across all club systems.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'invoicing' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Invoicing System</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>📄 Professional Invoicing System Available!</strong> Create, send, and track invoices:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-info"><i className="bi bi-file-text me-2"></i>Invoice Creation</h6>
                              <ul className="small">
                                <li><strong>Professional Templates:</strong> Pre-built templates for common services</li>
                                <li><strong>11+ Invoice Types:</strong> Registration, Membership, Tournament, Training, Equipment, Camp, Sponsorship, Facility, Merchandise, Services</li>
                                <li><strong>Line Items:</strong> Add multiple items with quantity and rates</li>
                                <li><strong>Auto Calculations:</strong> Subtotal, tax, discount, and total</li>
                                <li><strong>Flexible Discounts:</strong> Percentage or fixed amount discounts</li>
                                <li><strong>Custom Terms:</strong> Payment terms and notes</li>
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6 className="text-info"><i className="bi bi-send me-2"></i>Delivery & Tracking</h6>
                              <ul className="small">
                                <li><strong>Email Invoices:</strong> Send directly to clients via email</li>
                                <li><strong>Status Tracking:</strong> Draft, Sent, Viewed, Partial, Paid, Overdue, Cancelled</li>
                                <li><strong>Due Date Management:</strong> Track payment deadlines</li>
                                <li><strong>Overdue Alerts:</strong> Automatic overdue flagging</li>
                                <li><strong>Partial Payments:</strong> Track partial payment progress</li>
                                <li><strong>Payment Reminders:</strong> Automated reminder system</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-calculator me-2"></i>Advanced Features</h6>
                            <div className="row small">
                              <div className="col-md-4">• Professional invoice templates</div>
                              <div className="col-md-4">• Auto-generated invoice numbers</div>
                              <div className="col-md-4">• Customizable line items</div>
                              <div className="col-md-4">• Tax rate calculations</div>
                              <div className="col-md-4">• Discount management (% or $)</div>
                              <div className="col-md-4">• Payment terms customization</div>
                              <div className="col-md-4">• Client information management</div>
                              <div className="col-md-4">• Invoice status workflow</div>
                              <div className="col-md-4">• Overdue tracking</div>
                              <div className="col-md-4">• PDF export</div>
                              <div className="col-md-4">• CSV export for accounting</div>
                              <div className="col-md-4">• Search and filter invoices</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-grid-3x3 me-2"></i>Invoice Types</h6>
                            <div className="row small">
                              <div className="col-md-3">• <strong>Registration:</strong> Player registration fees</div>
                              <div className="col-md-3">• <strong>Membership:</strong> Annual/monthly dues</div>
                              <div className="col-md-3">• <strong>Tournament:</strong> Tournament entry fees</div>
                              <div className="col-md-3">• <strong>Training:</strong> Training session fees</div>
                              <div className="col-md-3">• <strong>Equipment:</strong> Equipment purchases</div>
                              <div className="col-md-3">• <strong>Camp:</strong> Camp and clinic fees</div>
                              <div className="col-md-3">• <strong>Sponsorship:</strong> Sponsor invoices</div>
                              <div className="col-md-3">• <strong>Facility:</strong> Facility rental</div>
                              <div className="col-md-3">• <strong>Merchandise:</strong> Store purchases</div>
                              <div className="col-md-3">• <strong>Services:</strong> Service fees</div>
                              <div className="col-md-3">• <strong>Other:</strong> Custom invoices</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/invoicing" className="btn btn-info btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Invoicing System
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-file-text-fill display-1 text-info"></i>
                          <h4 className="mt-3 text-info">Professional Invoicing System Ready</h4>
                          <p className="text-muted">Create, send, and track professional invoices for all club services with automated calculations and payment tracking.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeSection === 'waivers' && (
              <div>
                {/* Waiver Statistics */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>Signed Waivers</h6>
                        <h4 className="mb-0">1,234</h4>
                        <small>100% compliance</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Pending Signatures</h6>
                        <h4 className="mb-0">12</h4>
                        <small>Awaiting completion</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-danger text-white">
                      <div className="card-body">
                        <h6>Expiring Soon</h6>
                        <h4 className="mb-0">23</h4>
                        <small>Next 30 days</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>Total Templates</h6>
                        <h4 className="mb-0">8</h4>
                        <small>Active templates</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waiver Templates */}
                <div className="row mb-4">
                  <div className="col-md-8 mb-4">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Waiver Templates</h5>
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-plus-circle me-2"></i>Create Template
                        </button>
                      </div>
                      <div className="card-body">
                        <div className="list-group">
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">General Liability Waiver</h6>
                              <small className="text-muted">Standard waiver for all members • 1,200 signed</small>
                            </div>
                            <div>
                              <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                              <button className="btn btn-sm btn-outline-secondary">View</button>
                            </div>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">Minor Participation Waiver</h6>
                              <small className="text-muted">For players under 18 • 456 signed</small>
                            </div>
                            <div>
                              <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                              <button className="btn btn-sm btn-outline-secondary">View</button>
                            </div>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">Medical Information Form</h6>
                              <small className="text-muted">Health and emergency contacts • 1,150 signed</small>
                            </div>
                            <div>
                              <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                              <button className="btn btn-sm btn-outline-secondary">View</button>
                            </div>
                          </div>
                          <div className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">Tournament Consent Form</h6>
                              <small className="text-muted">Special events and tournaments • 89 signed</small>
                            </div>
                            <div>
                              <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                              <button className="btn btn-sm btn-outline-secondary">View</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="col-md-4 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Quick Actions</h5>
                      </div>
                      <div className="card-body">
                        <div className="d-grid gap-2">
                          <button className="btn btn-primary">
                            <i className="bi bi-plus-circle me-2"></i>Create Waiver
                          </button>
                          <button className="btn btn-outline-success">
                            <i className="bi bi-send me-2"></i>Send Reminders
                          </button>
                          <button className="btn btn-outline-warning">
                            <i className="bi bi-file-earmark-check me-2"></i>Review Pending
                          </button>
                          <button className="btn btn-outline-info">
                            <i className="bi bi-download me-2"></i>Export Records
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Recent Signatures</h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Member</th>
                                <th>Waiver Type</th>
                                <th>Signed Date</th>
                                <th>Expires</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>John Smith</td>
                                <td>General Liability</td>
                                <td>2024-10-20</td>
                                <td>2025-10-20</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                              </tr>
                              <tr>
                                <td>Sarah Johnson</td>
                                <td>Minor Participation</td>
                                <td>2024-10-19</td>
                                <td>2025-10-19</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                              </tr>
                              <tr>
                                <td>Mike Davis</td>
                                <td>Medical Information</td>
                                <td>2024-10-18</td>
                                <td>2025-10-18</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                              </tr>
                              <tr>
                                <td>Emily Brown</td>
                                <td>General Liability</td>
                                <td>2024-10-17</td>
                                <td>2024-11-15</td>
                                <td><span className="badge bg-warning">Expiring Soon</span></td>
                                <td><button className="btn btn-sm btn-outline-primary">View</button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'insurance' && (
              <div>
                {/* Insurance Overview */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <h6>Active Policies</h6>
                        <h4 className="mb-0">6</h4>
                        <small>All current and valid</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white">
                      <div className="card-body">
                        <h6>Total Coverage</h6>
                        <h4 className="mb-0">$5M</h4>
                        <small>Combined liability</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-white">
                      <div className="card-body">
                        <h6>Open Claims</h6>
                        <h4 className="mb-0">2</h4>
                        <small>In processing</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white">
                      <div className="card-body">
                        <h6>Annual Premium</h6>
                        <h4 className="mb-0">$45,890</h4>
                        <small>Total yearly cost</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Policies */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Active Insurance Policies</h5>
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-plus-circle me-2"></i>Add Policy
                        </button>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Policy Type</th>
                                <th>Provider</th>
                                <th>Coverage</th>
                                <th>Premium</th>
                                <th>Renewal Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><strong>General Liability</strong></td>
                                <td>ABC Insurance Co.</td>
                                <td>$2,000,000</td>
                                <td>$15,000/year</td>
                                <td>2025-03-15</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">View</button>
                                  <button className="btn btn-sm btn-outline-secondary">Edit</button>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Property Insurance</strong></td>
                                <td>XYZ Insurance</td>
                                <td>$1,500,000</td>
                                <td>$12,500/year</td>
                                <td>2025-06-20</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">View</button>
                                  <button className="btn btn-sm btn-outline-secondary">Edit</button>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Workers Compensation</strong></td>
                                <td>Safety First Insurance</td>
                                <td>$1,000,000</td>
                                <td>$8,900/year</td>
                                <td>2025-01-10</td>
                                <td><span className="badge bg-warning">Renewing Soon</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">View</button>
                                  <button className="btn btn-sm btn-outline-secondary">Edit</button>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Directors & Officers</strong></td>
                                <td>Executive Shield Ltd.</td>
                                <td>$500,000</td>
                                <td>$5,490/year</td>
                                <td>2025-09-01</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">View</button>
                                  <button className="btn btn-sm btn-outline-secondary">Edit</button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claims Management */}
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Recent Claims</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          <div className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">Minor Injury - Training Session</h6>
                                <small className="text-muted">Claim #2024-0123 • Filed: Oct 15, 2024</small>
                              </div>
                              <span className="badge bg-warning">Processing</span>
                            </div>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">Equipment Damage</h6>
                                <small className="text-muted">Claim #2024-0098 • Filed: Sep 22, 2024</small>
                              </div>
                              <span className="badge bg-success">Approved</span>
                            </div>
                          </div>
                          <div className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">Facility Water Damage</h6>
                                <small className="text-muted">Claim #2024-0067 • Filed: Aug 10, 2024</small>
                              </div>
                              <span className="badge bg-info">Settled</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="col-md-6 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Insurance Actions</h5>
                      </div>
                      <div className="card-body">
                        <div className="d-grid gap-3">
                          <button className="btn btn-outline-primary">
                            <i className="bi bi-file-earmark-plus me-2"></i>File New Claim
                          </button>
                          <button className="btn btn-outline-success">
                            <i className="bi bi-shield-check me-2"></i>Verify Coverage
                          </button>
                          <button className="btn btn-outline-warning">
                            <i className="bi bi-arrow-repeat me-2"></i>Renewal Reminders
                          </button>
                          <button className="btn btn-outline-info">
                            <i className="bi bi-file-earmark-text me-2"></i>Generate Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'compliance' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Compliance Center</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Compliance features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Regulatory compliance tracking</li>
                            <li>Policy and procedure management</li>
                            <li>Audit preparation and documentation</li>
                            <li>Compliance training and certification</li>
                            <li>Risk assessment and mitigation</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-check-circle display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Compliance Center</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'api' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">API Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          API management features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>API key generation and management</li>
                            <li>Rate limiting and usage monitoring</li>
                            <li>API documentation and testing</li>
                            <li>Third-party integration management</li>
                            <li>API analytics and performance tracking</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-code-slash display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">API Management</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'integrations' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Integrations Center</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Integration features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Third-party service integrations</li>
                            <li>Data synchronization and mapping</li>
                            <li>Webhook management and monitoring</li>
                            <li>Integration testing and validation</li>
                            <li>Error handling and troubleshooting</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-puzzle display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Integrations Center</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div style={{padding: '0 20px'}}>
                {/* Quick Help Cards */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100 border-primary">
                      <div className="card-body">
                        <i className="bi bi-book text-primary mb-3" style={{fontSize: '3rem'}}></i>
                        <h5 className="card-title">Documentation</h5>
                        <p className="card-text text-muted small">Comprehensive guides and tutorials</p>
                        <button className="btn btn-outline-primary btn-sm">View Docs</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100 border-success">
                      <div className="card-body">
                        <i className="bi bi-play-circle text-success mb-3" style={{fontSize: '3rem'}}></i>
                        <h5 className="card-title">Video Tutorials</h5>
                        <p className="card-text text-muted small">Step-by-step video guides</p>
                        <button className="btn btn-outline-success btn-sm">Watch Videos</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100 border-warning">
                      <div className="card-body">
                        <i className="bi bi-question-circle text-warning mb-3" style={{fontSize: '3rem'}}></i>
                        <h5 className="card-title">FAQ</h5>
                        <p className="card-text text-muted small">Frequently asked questions</p>
                        <button className="btn btn-outline-warning btn-sm">View FAQ</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100 border-info">
                      <div className="card-body">
                        <i className="bi bi-headset text-info mb-3" style={{fontSize: '3rem'}}></i>
                        <h5 className="card-title">Contact Support</h5>
                        <p className="card-text text-muted small">Get help from our team</p>
                        <button className="btn btn-outline-info btn-sm">Contact Us</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Getting Started Guide */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-rocket me-2"></i>Getting Started Guide
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <div className="border-start border-primary border-4 ps-3">
                              <h6 className="fw-bold">1. Dashboard Overview</h6>
                              <p className="text-muted small mb-2">Learn how to navigate the admin dashboard and access key features.</p>
                              <a href="#" className="text-primary small text-decoration-none">Read more →</a>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="border-start border-success border-4 ps-3">
                              <h6 className="fw-bold">2. User Management</h6>
                              <p className="text-muted small mb-2">Manage members, approve applications, and handle user roles.</p>
                              <a href="#" className="text-success small text-decoration-none">Read more →</a>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="border-start border-warning border-4 ps-3">
                              <h6 className="fw-bold">3. Content Management</h6>
                              <p className="text-muted small mb-2">Update homepage, branding, events, and club information.</p>
                              <a href="#" className="text-warning small text-decoration-none">Read more →</a>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="border-start border-info border-4 ps-3">
                              <h6 className="fw-bold">4. Team & Schedule</h6>
                              <p className="text-muted small mb-2">Organize teams, manage schedules, and track matches.</p>
                              <a href="#" className="text-info small text-decoration-none">Read more →</a>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="border-start border-danger border-4 ps-3">
                              <h6 className="fw-bold">5. Marketplace</h6>
                              <p className="text-muted small mb-2">Moderate listings, approve items, and manage transactions.</p>
                              <a href="#" className="text-danger small text-decoration-none">Read more →</a>
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <div className="border-start border-secondary border-4 ps-3">
                              <h6 className="fw-bold">6. Reports & Analytics</h6>
                              <p className="text-muted small mb-2">View insights, generate reports, and track performance.</p>
                              <a href="#" className="text-secondary small text-decoration-none">Read more →</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="row mb-4">
                  <div className="col-lg-8 mb-4">
                    <div className="card">
                      <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0">
                          <i className="bi bi-patch-question me-2"></i>Frequently Asked Questions
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="accordion" id="faqAccordion">
                          <div className="accordion-item">
                            <h2 className="accordion-header">
                              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1">
                                How do I approve new member applications?
                              </button>
                            </h2>
                            <div id="collapse1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                              <div className="accordion-body">
                                Navigate to <strong>Management → Applications</strong> in the sidebar. You'll see all pending applications. Click on any application to review details, then use the "Approve" or "Reject" buttons to process the application. Approved members will receive an automatic email notification.
                              </div>
                            </div>
                          </div>
                          <div className="accordion-item">
                            <h2 className="accordion-header">
                              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2">
                                How do I update the homepage hero images?
                              </button>
                            </h2>
                            <div id="collapse2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                              <div className="accordion-body">
                                Go to <strong>Settings → Branding</strong> and scroll to the Hero Content section. You can upload new images or videos, set them as slideshows, adjust transition effects, and control their display order. Changes are saved automatically and reflected on the homepage immediately.
                              </div>
                            </div>
                          </div>
                          <div className="accordion-item">
                            <h2 className="accordion-header">
                              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3">
                                How do I moderate marketplace listings?
                              </button>
                            </h2>
                            <div id="collapse3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                              <div className="accordion-body">
                                Visit <strong>Business & Finance → Marketplace → Item Approval & Moderation</strong>. Review pending items, check for inappropriate content or pricing, and approve or reject each listing. You can also edit item details if needed before approval.
                              </div>
                            </div>
                          </div>
                          <div className="accordion-item">
                            <h2 className="accordion-header">
                              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4">
                                Can I customize email notifications?
                              </button>
                            </h2>
                            <div id="collapse4" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                              <div className="accordion-body">
                                Yes! Go to <strong>Communications → Email Templates</strong> to customize all automated emails including registration confirmations, payment receipts, event reminders, and more. You can edit content, styling, and add your club's branding.
                              </div>
                            </div>
                          </div>
                          <div className="accordion-item">
                            <h2 className="accordion-header">
                              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse5">
                                How do I create a new event or match?
                              </button>
                            </h2>
                            <div id="collapse5" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                              <div className="accordion-body">
                                Navigate to <strong>Management → Schedules</strong> and click "Create New Event". Fill in the event details including date, time, location, type (match, training, meeting), and description. The event will automatically appear on the schedules page and member calendars.
                              </div>
                            </div>
                          </div>
                          <div className="accordion-item">
                            <h2 className="accordion-header">
                              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse6">
                                How do I generate financial reports?
                              </button>
                            </h2>
                            <div id="collapse6" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                              <div className="accordion-body">
                                Access <strong>Business & Finance → Reports</strong> to generate various financial reports including revenue summaries, payment tracking, expense reports, and tax documents. You can filter by date range and export reports as PDF or Excel files.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links & Resources */}
                  <div className="col-lg-4 mb-4">
                    <div className="card mb-3">
                      <div className="card-header bg-success text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-link-45deg me-2"></i>Quick Links
                        </h6>
                      </div>
                      <div className="list-group list-group-flush">
                        <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                          <span><i className="bi bi-file-text text-primary me-2"></i>Admin Guide PDF</span>
                          <i className="bi bi-download"></i>
                        </a>
                        <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                          <span><i className="bi bi-keyboard text-success me-2"></i>Keyboard Shortcuts</span>
                          <i className="bi bi-arrow-right"></i>
                        </a>
                        <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                          <span><i className="bi bi-shield-check text-warning me-2"></i>Security Best Practices</span>
                          <i className="bi bi-arrow-right"></i>
                        </a>
                        <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                          <span><i className="bi bi-bug text-danger me-2"></i>Report a Bug</span>
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                        <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                          <span><i className="bi bi-lightbulb text-info me-2"></i>Feature Requests</span>
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                      </div>
                    </div>

                    <div className="card mb-3">
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-info-circle me-2"></i>System Status
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small">Platform Status</span>
                          <span className="badge bg-success">Operational</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small">Email Service</span>
                          <span className="badge bg-success">Online</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small">Payment Gateway</span>
                          <span className="badge bg-success">Active</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small">Backup System</span>
                          <span className="badge bg-success">Running</span>
                        </div>
                        <hr />
                        <small className="text-muted">Last checked: {new Date().toLocaleTimeString()}</small>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header bg-danger text-white">
                        <h6 className="mb-0">
                          <i className="bi bi-exclamation-triangle me-2"></i>Emergency Contacts
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <h6 className="small fw-bold">Technical Support</h6>
                          <p className="mb-1 small">
                            <i className="bi bi-envelope me-2"></i>support@seattleleopardsfc.com
                          </p>
                          <p className="mb-0 small">
                            <i className="bi bi-telephone me-2"></i>(206) 555-TECH
                          </p>
                        </div>
                        <div className="mb-3">
                          <h6 className="small fw-bold">System Administrator</h6>
                          <p className="mb-1 small">
                            <i className="bi bi-envelope me-2"></i>admin@seattleleopardsfc.com
                          </p>
                          <p className="mb-0 small">
                            <i className="bi bi-telephone me-2"></i>(206) 555-ADMIN
                          </p>
                        </div>
                        <div>
                          <h6 className="small fw-bold">24/7 Hotline</h6>
                          <p className="mb-0 small">
                            <i className="bi bi-telephone-fill me-2"></i>(206) 555-HELP
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting Guide */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header bg-secondary text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-tools me-2"></i>Common Troubleshooting Issues
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Issue</th>
                                <th>Possible Cause</th>
                                <th>Solution</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><i className="bi bi-x-circle text-danger me-2"></i>Can't login to admin panel</td>
                                <td>Expired session or incorrect credentials</td>
                                <td>Clear browser cache, reset password, or contact support</td>
                              </tr>
                              <tr>
                                <td><i className="bi bi-image text-warning me-2"></i>Images not uploading</td>
                                <td>File size too large or unsupported format</td>
                                <td>Resize images to under 5MB, use JPG/PNG format</td>
                              </tr>
                              <tr>
                                <td><i className="bi bi-envelope-x text-danger me-2"></i>Emails not sending</td>
                                <td>Email service configuration issue</td>
                                <td>Check spam folder, verify email settings in system config</td>
                              </tr>
                              <tr>
                                <td><i className="bi bi-clock-history text-info me-2"></i>Slow dashboard loading</td>
                                <td>Too much data or slow internet connection</td>
                                <td>Clear browser cache, archive old data, check internet speed</td>
                              </tr>
                              <tr>
                                <td><i className="bi bi-calendar-x text-warning me-2"></i>Events not showing on calendar</td>
                                <td>Event not published or date filter applied</td>
                                <td>Ensure event is published and calendar filters are cleared</td>
                              </tr>
                              <tr>
                                <td><i className="bi bi-credit-card text-danger me-2"></i>Payment processing errors</td>
                                <td>Payment gateway issue or invalid card details</td>
                                <td>Verify payment gateway status, ask user to re-enter card info</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Support Form */}
                <div className="row mb-4">
                  <div className="col-lg-8 mx-auto">
                    <div className="card border-primary">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-chat-dots me-2"></i>Contact Support Team
                        </h5>
                      </div>
                      <div className="card-body">
                        <form>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Your Name</label>
                              <input type="text" className="form-control" placeholder="Enter your name" />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-bold">Email Address</label>
                              <input type="email" className="form-control" placeholder="your.email@example.com" />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Subject</label>
                            <select className="form-select">
                              <option>Select a category...</option>
                              <option>Technical Issue</option>
                              <option>Feature Request</option>
                              <option>Bug Report</option>
                              <option>Account Problem</option>
                              <option>Payment Issue</option>
                              <option>General Question</option>
                              <option>Other</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Priority</label>
                            <div className="btn-group w-100" role="group">
                              <input type="radio" className="btn-check" name="priority" id="low" />
                              <label className="btn btn-outline-success" htmlFor="low">Low</label>
                              
                              <input type="radio" className="btn-check" name="priority" id="medium" defaultChecked />
                              <label className="btn btn-outline-warning" htmlFor="medium">Medium</label>
                              
                              <input type="radio" className="btn-check" name="priority" id="high" />
                              <label className="btn btn-outline-danger" htmlFor="high">High</label>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Message</label>
                            <textarea className="form-control" rows="5" placeholder="Describe your issue or question in detail..."></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold">Attachments (Optional)</label>
                            <input type="file" className="form-control" multiple />
                            <small className="text-muted">You can upload screenshots or relevant files (max 10MB per file)</small>
                          </div>
                          <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-primary btn-lg">
                              <i className="bi bi-send me-2"></i>Submit Support Request
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Resources */}
                <div className="row">
                  <div className="col-12">
                    <div className="card bg-light">
                      <div className="card-body text-center py-4">
                        <h5 className="mb-3">Need More Help?</h5>
                        <p className="text-muted mb-4">Our support team is available Monday-Friday, 9 AM - 6 PM PST</p>
                        <div className="d-flex justify-content-center gap-3 flex-wrap">
                          <button className="btn btn-outline-primary">
                            <i className="bi bi-chat-left-text me-2"></i>Live Chat
                          </button>
                          <button className="btn btn-outline-success">
                            <i className="bi bi-calendar-check me-2"></i>Schedule Call
                          </button>
                          <button className="btn btn-outline-info">
                            <i className="bi bi-people me-2"></i>Join Community Forum
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
