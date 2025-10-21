import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';


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
  const [teams] = useState([
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
                className={`nav-link text-white text-start border-0 ${activeSection === 'equipment' ? 'bg-white bg-opacity-25' : ''}`}
                onClick={() => handleSectionChange('equipment')}
              >
                    Equipment
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
              {activeSection === 'finance' && 'Financial Management'}
              {activeSection === 'marketplace' && 'Marketplace Management'}
              {activeSection === 'applications' && 'Application Management'}
              {activeSection === 'backup' && 'Backup & Restore'}
              {activeSection === 'logs' && 'System Logs'}
              {activeSection === 'scheduling' && 'Scheduling & Calendar'}
              {activeSection === 'players' && 'Player Management'}
              {activeSection === 'coaches' && 'Coach Management'}
              {activeSection === 'parents' && 'Parent Management'}
              {activeSection === 'matches' && 'Match Management'}
              {activeSection === 'training' && 'Training Programs'}
              {activeSection === 'facilities' && 'Facility Management'}
              {activeSection === 'equipment' && 'Equipment Management'}
              {activeSection === 'volunteers' && 'Volunteer Management'}
              {activeSection === 'sponsors' && 'Sponsor Management'}
              {activeSection === 'membership' && 'Membership Management'}
              {activeSection === 'waivers' && 'Waiver Management'}
              {activeSection === 'insurance' && 'Insurance Management'}
              {activeSection === 'compliance' && 'Compliance Center'}
              {activeSection === 'api' && 'API Management'}
              {activeSection === 'integrations' && 'Integrations Center'}
              {activeSection === 'help' && 'Help & Support'}
            </h2>

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
                    {/* Content Management Quick Links */}
                    <div className="col-12 mb-4">
                      <div className="card">
                        <div className="card-header bg-gradient-dark text-white">
                          <h5 className="mb-0"><i className="bi bi-grid me-2"></i>Content Management Sections</h5>
                        </div>
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <Link to="/admin/about" className="text-decoration-none">
                                <div className="card border-primary hover-shadow" style={{transition: 'all 0.3s', cursor: 'pointer'}}>
                                  <div className="card-body text-center">
                                    <i className="bi bi-info-circle-fill text-primary" style={{fontSize: '2.5rem'}}></i>
                                    <h5 className="mt-3 mb-2 text-primary">About Page</h5>
                                    <p className="text-muted small mb-0">Manage About page content & gallery</p>
                                  </div>
                                </div>
                              </Link>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <Link to="/admin/content" className="text-decoration-none">
                                <div className="card border-success hover-shadow" style={{transition: 'all 0.3s', cursor: 'pointer'}}>
                                  <div className="card-body text-center">
                                    <i className="bi bi-house-fill text-success" style={{fontSize: '2.5rem'}}></i>
                                    <h5 className="mt-3 mb-2 text-success">Homepage Content</h5>
                                    <p className="text-muted small mb-0">Edit homepage sections & content</p>
                                  </div>
                                </div>
                              </Link>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <Link to="/admin/news" className="text-decoration-none">
                                <div className="card border-info hover-shadow" style={{transition: 'all 0.3s', cursor: 'pointer'}}>
                                  <div className="card-body text-center">
                                    <i className="bi bi-newspaper text-info" style={{fontSize: '2.5rem'}}></i>
                                    <h5 className="mt-3 mb-2 text-info">News & Updates</h5>
                                    <p className="text-muted small mb-0">Manage news articles & updates</p>
                                  </div>
                                </div>
                              </Link>
                            </div>
                            <div className="col-lg-3 col-md-4 col-sm-6">
                              <Link to="/admin/gallery" className="text-decoration-none">
                                <div className="card border-warning hover-shadow" style={{transition: 'all 0.3s', cursor: 'pointer'}}>
                                  <div className="card-body text-center">
                                    <i className="bi bi-images text-warning" style={{fontSize: '2.5rem'}}></i>
                                    <h5 className="mt-3 mb-2 text-warning">Gallery</h5>
                                    <p className="text-muted small mb-0">Manage community gallery images</p>
                                  </div>
                                </div>
                              </Link>
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
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Content Management System</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Content Management is now available!</strong> Access the comprehensive content management system with features including:
                          <ul className="mt-2 mb-3">
                            <li>Homepage content editing (Welcome, Programs, Events, Teams, Statistics, CTA)</li>
                            <li>About page management with gallery</li>
                            <li>Event management and scheduling</li>
                            <li>Team information management</li>
                            <li>Statistics and highlights</li>
                            <li>Call-to-action sections</li>
                          </ul>
                          <Link to="/admin/content" className="btn btn-success">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Content Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-file-text display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Content Management Ready</h4>
                          <p className="text-muted">Click the button above to access the comprehensive content management system.</p>
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
                      <div className="card-header">
                        <h5 className="mb-0">Club Information Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Club Information Management is now available!</strong> Access the comprehensive club information system with features including:
                          <ul className="mt-2 mb-3">
                            <li>Basic club information (name, founded, location)</li>
                            <li>Contact details and addresses</li>
                            <li>Branding and color management</li>
                            <li>Facilities and venues</li>
                            <li>Legal and registration information</li>
                            <li>Social media links</li>
                            <li>Achievements and awards tracking</li>
                          </ul>
                          <Link to="/admin/club-info" className="btn btn-success">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Club Information Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-building display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Club Information Ready</h4>
                          <p className="text-muted">Click the button above to access the comprehensive club information management system.</p>
                        </div>
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
                      <div className="card-header">
                        <h5 className="mb-0">Policies Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Policies Management is now available!</strong> Access the comprehensive policies management system with features including:
                          <ul className="mt-2 mb-3">
                            <li>General club policies and terms</li>
                            <li>Safety and health protocols</li>
                            <li>Disciplinary procedures and consequences</li>
                            <li>Financial policies and payment terms</li>
                            <li>Technology and data protection policies</li>
                            <li>Volunteer guidelines and expectations</li>
                            <li>Version control and audit trails</li>
                          </ul>
                          <Link to="/admin/policies" className="btn btn-success">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Policies Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-shield-check display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Policies Management Ready</h4>
                          <p className="text-muted">Click the button above to access the comprehensive policies management system.</p>
                        </div>
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
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>Documentation Management is now available!</strong> Access the comprehensive documentation system with features including:
                          <ul className="mt-2 mb-3">
                            <li>Centralized document repository</li>
                            <li>Multiple document categories (policies, forms, handbooks, training materials)</li>
                            <li>Upload and manage files (PDF, DOC, XLS, PPT, images)</li>
                            <li>Version control and tracking</li>
                            <li>Document status management (draft, published, archived)</li>
                            <li>Search and filter capabilities</li>
                            <li>Document categorization and tagging</li>
                          </ul>
                          <Link to="/admin/documents" className="btn btn-success">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Documentation Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-file-earmark-text display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Documentation Management Ready</h4>
                          <p className="text-muted">Click the button above to access the comprehensive documentation management system.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Analytics Dashboard</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Analytics features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>User activity tracking</li>
                            <li>Content performance metrics</li>
                            <li>Site traffic analysis</li>
                            <li>Engagement statistics</li>
                            <li>Custom reports</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-graph-up display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Analytics Dashboard</h4>
                          <p className="text-muted">Coming soon...</p>
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
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Security Center</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Security features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Security logs</li>
                            <li>Access control</li>
                            <li>Password policies</li>
                            <li>Two-factor authentication</li>
                            <li>Security monitoring</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-shield-check display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Security Center</h4>
                          <p className="text-muted">Coming soon...</p>
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
                      <div className="card-header">
                        <h5 className="mb-0">Team Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>⚽ Comprehensive Team Management System Available!</strong> Manage all aspects of your teams with powerful features:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-people-fill me-2"></i>Team Management</h6>
                              <ul className="small">
                                <li>Create and manage teams by age group</li>
                                <li>Multiple team levels (Recreational, Competitive, Elite)</li>
                                <li>Team roster management</li>
                                <li>Coach and assistant coach assignments</li>
                                <li>Team status tracking (Active, Forming, Full, Tryouts)</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-calendar-check me-2"></i>Scheduling & Organization</h6>
                              <ul className="small">
                                <li>Practice schedules and times</li>
                                <li>Game day coordination</li>
                                <li>Location and facility assignment</li>
                                <li>Season management</li>
                                <li>Player capacity tracking</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-gear me-2"></i>Advanced Features</h6>
                            <div className="row small">
                              <div className="col-md-4">• Team roster management</div>
                              <div className="col-md-4">• Player assignments</div>
                              <div className="col-md-4">• Coach assignments</div>
                              <div className="col-md-4">• Fee tracking</div>
                              <div className="col-md-4">• Team visibility control</div>
                              <div className="col-md-4">• Advanced filtering</div>
                    </div>
                  </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-trophy me-2"></i>Age Groups & Levels</h6>
                            <div className="row small">
                              <div className="col-md-6">
                                <strong>Age Groups:</strong> Under 6, 8, 10, 12, 14, 16, 18, Adult, Women's, Coed
                              </div>
                              <div className="col-md-6">
                                <strong>Levels:</strong> Recreational, Competitive, Elite, Development, All-Star
                              </div>
                            </div>
                          </div>
                          
                          <Link to="/admin/teams" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Team Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-people-fill display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Team Management Ready</h4>
                          <p className="text-muted">Manage teams, rosters, schedules, and coaching assignments all in one place.</p>
                        </div>
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
                      <div className="card-header">
                        <h5 className="mb-0">Event Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>🎉 Comprehensive Event Management System Available!</strong> Manage both public and internal events:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-globe me-2"></i>Public Events (Community-Facing)</h6>
                              <ul className="small">
                                <li>Tournaments and competitions</li>
                                <li>Public tryouts and training camps</li>
                                <li>Community outreach events</li>
                                <li>Fundraising activities</li>
                                <li>Skills clinics and workshops</li>
                                <li>Awards ceremonies</li>
                                <li>Online registration with payment</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-building me-2"></i>Internal Events (Club-Only)</h6>
                              <ul className="small">
                                <li>Board and committee meetings</li>
                                <li>Parent-coach meetings</li>
                                <li>Staff training workshops</li>
                                <li>Volunteer coordination</li>
                                <li>Team social events</li>
                                <li>Strategic planning sessions</li>
                                <li>Internal communications</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-gear me-2"></i>Event Management Features</h6>
                            <div className="row small">
                              <div className="col-md-4">• 12 event categories</div>
                              <div className="col-md-4">• 4 visibility levels</div>
                              <div className="col-md-4">• Registration & RSVP system</div>
                              <div className="col-md-4">• Capacity management</div>
                              <div className="col-md-4">• Waitlist functionality</div>
                              <div className="col-md-4">• Fee collection</div>
                              <div className="col-md-4">• Event agenda builder</div>
                              <div className="col-md-4">• Attendee tracking</div>
                              <div className="col-md-4">• Analytics dashboard</div>
                    </div>
                  </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-shield-check me-2"></i>Visibility Options</h6>
                            <div className="row small">
                              <div className="col-md-6">
                                <strong>🌐 Public:</strong> Visible to everyone, open registration
                              </div>
                              <div className="col-md-6">
                                <strong>🔐 Members Only:</strong> Only registered club members
                              </div>
                              <div className="col-md-6">
                                <strong>🏢 Internal:</strong> Staff and volunteers only
                              </div>
                              <div className="col-md-6">
                                <strong>🔒 Private:</strong> Invite-only events
                              </div>
                            </div>
                          </div>
                          
                          <Link to="/admin/events" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Event Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-calendar-event-fill display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Event Management System Ready</h4>
                          <p className="text-muted">Create public tournaments and internal meetings with full registration, tracking, and analytics.</p>
                        </div>
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
                      <div className="card-header">
                        <h5 className="mb-0">Media Library Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>📸 Comprehensive Media Library System Available!</strong> Centralized digital asset management for photos, videos, and documents:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-globe me-2"></i>Public Media (Website)</h6>
                              <ul className="small">
                                <li>Photo galleries for website and fans</li>
                                <li>Match action shots and highlights</li>
                                <li>Event photos and videos</li>
                                <li>Team and player photos</li>
                                <li>Social media content</li>
                                <li>Marketing materials and graphics</li>
                                <li>Sponsor logos and assets</li>
                                <li>Award and trophy photos</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-lock me-2"></i>Internal Media (Private)</h6>
                              <ul className="small">
                                <li>Training video analysis</li>
                                <li>Tactical diagrams and playbooks</li>
                                <li>Internal documents and forms</li>
                                <li>Staff resources and guides</li>
                                <li>Confidential materials</li>
                                <li>Coach development videos</li>
                                <li>Administrative documents</li>
                                <li>Meeting recordings</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-folder me-2"></i>Organization System</h6>
                            <div className="row small">
                              <div className="col-md-3">• <strong>12 Categories:</strong> Matches, Training, Events, Players, Teams, Facilities, etc.</div>
                              <div className="col-md-3">• <strong>4 Visibility Levels:</strong> Public, Members, Internal, Private</div>
                              <div className="col-md-3">• <strong>Tagging System:</strong> Add multiple tags for easy searching</div>
                              <div className="col-md-3">• <strong>Advanced Search:</strong> Find files by name, category, tag, date</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-gear me-2"></i>Features & Management</h6>
                            <div className="row small">
                              <div className="col-md-4">• Bulk upload (multiple files at once)</div>
                              <div className="col-md-4">• Automatic image optimization</div>
                              <div className="col-md-4">• Thumbnail generation</div>
                              <div className="col-md-4">• Grid and list view modes</div>
                              <div className="col-md-4">• File size tracking and limits</div>
                              <div className="col-md-4">• Download permission control</div>
                              <div className="col-md-4">• Photo credit/attribution</div>
                              <div className="col-md-4">• Metadata management</div>
                              <div className="col-md-4">• Preview and lightbox</div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-file-earmark me-2"></i>Supported File Types</h6>
                            <div className="row small">
                              <div className="col-md-3">• <strong>Images:</strong> JPG, PNG, GIF, WebP</div>
                              <div className="col-md-3">• <strong>Videos:</strong> MP4, MOV, AVI, WebM</div>
                              <div className="col-md-3">• <strong>Audio:</strong> MP3, WAV, OGG</div>
                              <div className="col-md-3">• <strong>Documents:</strong> PDF, DOC, DOCX, TXT</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/media" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Media Library
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-images display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Media Library System Ready</h4>
                          <p className="text-muted">Professional digital asset management for photos, videos, and documents with organization and permissions.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'fans-gallery' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Fans & Gallery Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Fans & Gallery management features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Fan-submitted photo and video management</li>
                            <li>Gallery organization and categorization</li>
                            <li>Content moderation and approval workflow</li>
                            <li>Fan engagement and interaction tracking</li>
                            <li>Featured content and spotlight management</li>
                            <li>Social media integration and sharing</li>
                            <li>Fan contests and photo competitions</li>
                            <li>Gallery analytics and popular content tracking</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-camera display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Fans & Gallery Management</h4>
                          <p className="text-muted">Coming soon...</p>
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
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Communications Overview</h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Communications Center Overview - Manage all communication channels from one place.
                          </div>
                          <div className="row">
                            <div className="col-md-4">
                              <div className="card text-center">
                                <div className="card-body">
                                  <i className="bi bi-bell display-4 text-primary"></i>
                                  <h5 className="mt-3">Notifications</h5>
                                  <p className="text-muted">System and user notifications</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="card text-center">
                                <div className="card-body">
                                  <i className="bi bi-megaphone display-4 text-success"></i>
                                  <h5 className="mt-3">Broadcasts</h5>
                                  <p className="text-muted">Mass communication to users</p>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="card text-center">
                                <div className="card-body">
                                  <i className="bi bi-envelope display-4 text-warning"></i>
                                  <h5 className="mt-3">Messages</h5>
                                  <p className="text-muted">Direct messaging system</p>
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
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Notifications Management</h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Notification management features will be implemented here. This will include:
                            <ul className="mt-2 mb-0">
                              <li>System notifications and alerts</li>
                              <li>User notification preferences</li>
                              <li>Email notifications</li>
                              <li>Push notifications</li>
                              <li>Notification templates</li>
                              <li>Notification delivery tracking</li>
                            </ul>
                          </div>
                          <div className="text-center py-5">
                            <i className="bi bi-bell display-1 text-muted"></i>
                            <h4 className="mt-3 text-muted">Notifications Management</h4>
                            <p className="text-muted">Coming soon...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'broadcasts' && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Broadcast Management</h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Broadcast management features will be implemented here. This will include:
                            <ul className="mt-2 mb-0">
                              <li>Create and send broadcasts</li>
                              <li>Target specific user groups</li>
                              <li>Schedule broadcast delivery</li>
                              <li>Broadcast templates and history</li>
                              <li>Delivery tracking and analytics</li>
                              <li>Broadcast performance metrics</li>
                            </ul>
                          </div>
                          <div className="text-center py-5">
                            <i className="bi bi-megaphone display-1 text-muted"></i>
                            <h4 className="mt-3 text-muted">Broadcast Management</h4>
                            <p className="text-muted">Coming soon...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'messages' && (
                  <div className="row">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="mb-0">Message Management</h5>
                        </div>
                        <div className="card-body">
                          <div className="alert alert-info">
                            <i className="bi bi-info-circle me-2"></i>
                            Message management features will be implemented here. This will include:
                            <ul className="mt-2 mb-0">
                              <li>Internal messaging system</li>
                              <li>Direct user-to-user messaging</li>
                              <li>Group messaging and channels</li>
                              <li>Message templates and automation</li>
                              <li>Message history and archiving</li>
                              <li>Message analytics and reporting</li>
                            </ul>
                          </div>
                          <div className="text-center py-5">
                            <i className="bi bi-envelope display-1 text-muted"></i>
                            <h4 className="mt-3 text-muted">Message Management</h4>
                            <p className="text-muted">Coming soon...</p>
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
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Reports & Analytics</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Reporting features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Custom report generation</li>
                            <li>Data visualization and charts</li>
                            <li>Export reports (PDF, Excel, CSV)</li>
                            <li>Scheduled report delivery</li>
                            <li>Performance metrics and KPIs</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-file-earmark-bar-graph display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Reports & Analytics</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'finance' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Financial Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>💰 Comprehensive Financial Management System Available!</strong> Complete accounting and financial control:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-credit-card me-2"></i>Payment Tracking</h6>
                              <ul className="small">
                                <li><strong>Income Recording:</strong> Registration fees, memberships, sponsorships, fundraising, merchandise, tournaments, donations</li>
                                <li><strong>Expense Tracking:</strong> Equipment, uniforms, facilities, coaching, travel, insurance, utilities, marketing</li>
                                <li><strong>Payment Methods:</strong> Credit/debit cards, cash, checks, bank transfers, PayPal, Stripe</li>
                                <li><strong>Transaction Status:</strong> Completed, pending, failed, refunded, cancelled</li>
                                <li><strong>Reference Numbers:</strong> Track check #, invoice #, confirmation codes</li>
                                <li><strong>Transaction History:</strong> Complete audit trail with dates and amounts</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-file-earmark-text me-2"></i>Invoicing System</h6>
                              <ul className="small">
                                <li><strong>Professional Invoices:</strong> Auto-generated invoice numbers</li>
                                <li><strong>Itemized Billing:</strong> Multiple line items per invoice</li>
                                <li><strong>Automatic Calculations:</strong> Subtotal, tax, and total</li>
                                <li><strong>Invoice Status:</strong> Draft, sent, paid, overdue, cancelled</li>
                                <li><strong>Payment Terms:</strong> Net 15, Net 30, Net 60, Due on receipt</li>
                                <li><strong>Due Date Tracking:</strong> Never miss payment deadlines</li>
                                <li><strong>Customer Management:</strong> Track customer details and emails</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-arrow-counterclockwise me-2"></i>Refund Processing</h6>
                            <div className="row small">
                              <div className="col-md-4">• Process refund requests with reason tracking</div>
                              <div className="col-md-4">• Multiple refund methods (original payment, check, cash, transfer)</div>
                              <div className="col-md-4">• Complete refund history and audit trail</div>
                              <div className="col-md-4">• Refund amount tracking and analytics</div>
                              <div className="col-md-4">• Document reasons for compliance</div>
                              <div className="col-md-4">• Link refunds to original transactions</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-graph-up me-2"></i>Financial Reports & Analytics</h6>
                            <div className="row small">
                              <div className="col-md-3">• <strong>Income Statement:</strong> Revenue vs. expenses</div>
                              <div className="col-md-3">• <strong>Cash Flow:</strong> Money in/out analysis</div>
                              <div className="col-md-3">• <strong>Category Breakdown:</strong> Income/expense by category</div>
                              <div className="col-md-3">• <strong>Trend Analysis:</strong> Financial trends over time</div>
                              <div className="col-md-3">• <strong>Net Income:</strong> Profitability tracking</div>
                              <div className="col-md-3">• <strong>Outstanding Invoices:</strong> Money owed to club</div>
                              <div className="col-md-3">• <strong>Budget vs. Actual:</strong> Performance tracking</div>
                              <div className="col-md-3">• <strong>Export Reports:</strong> PDF and Excel formats</div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-piggy-bank me-2"></i>Budget Planning</h6>
                            <div className="row small">
                              <div className="col-md-4">• Set annual budget goals by category</div>
                              <div className="col-md-4">• Track actual spending vs. budget</div>
                              <div className="col-md-4">• Variance analysis and alerts</div>
                              <div className="col-md-4">• Budget allocation optimization</div>
                              <div className="col-md-4">• Multi-year budget planning</div>
                              <div className="col-md-4">• Department-level budgets</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-funnel me-2"></i>Advanced Filtering</h6>
                            <div className="row small">
                              <div className="col-md-4">• Filter by income/expense type</div>
                              <div className="col-md-4">• Filter by category (20+ categories)</div>
                              <div className="col-md-4">• Filter by transaction status</div>
                              <div className="col-md-4">• Date range filtering</div>
                              <div className="col-md-4">• Payment method filtering</div>
                              <div className="col-md-4">• Search by description, payer, reference</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/finance" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Financial Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-cash-stack display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Financial Management System Ready</h4>
                          <p className="text-muted">Track all transactions, create invoices, process refunds, generate reports, and plan budgets with complete financial control.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'marketplace' && (
              <div>
                {/* Enhanced Marketplace Management Alert */}
                <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                    <div className="flex-grow-1">
                      <h5 className="alert-heading mb-2">🚀 Enhanced Marketplace Management Available!</h5>
                      <p className="mb-2">Access comprehensive marketplace controls including:</p>
                      <ul className="mb-2">
                        <li><strong>Global Settings:</strong> Expiration, pricing, and extension controls</li>
                        <li><strong>Category Management:</strong> Dynamic categories with pricing tiers</li>
                        <li><strong>Item Monitoring:</strong> Track expiring items and extensions</li>
                        <li><strong>Fee Management:</strong> Configure marketplace fees and pricing</li>
                      </ul>
                      <div className="d-flex gap-2">
                        <Link to="/admin/marketplace-settings" className="btn btn-warning btn-sm">
                          <i className="bi bi-gear me-1"></i>Marketplace Settings
                        </Link>
                        <Link to="/admin/category-management" className="btn btn-warning btn-sm">
                          <i className="bi bi-tags me-1"></i>Category Management
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketplace Management Cards */}
                <div className="row mb-4">
                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 border-warning" data-marketplace-management>
                      <div className="card-header bg-warning text-dark">
                        <h5 className="mb-0">
                          <i className="bi bi-gear me-2"></i>Marketplace Settings
                        </h5>
                      </div>
                      <div className="card-body">
                        <p className="card-text">Configure global marketplace settings including expiration policies, pricing tiers, and extension rules.</p>
                        <ul className="list-unstyled">
                          <li><i className="bi bi-check text-success me-2"></i>Default expiration periods</li>
                          <li><i className="bi bi-check text-success me-2"></i>Pricing tier management</li>
                          <li><i className="bi bi-check text-success me-2"></i>Extension controls</li>
                          <li><i className="bi bi-check text-success me-2"></i>Notification settings</li>
                        </ul>
                        <Link to="/admin/marketplace-settings" className="btn btn-warning">
                          <i className="bi bi-gear me-1"></i>Manage Settings
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 border-info">
                      <div className="card-header bg-info text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-tags me-2"></i>Category Management
                        </h5>
                      </div>
                      <div className="card-body">
                        <p className="card-text">Create and manage marketplace categories and subcategories with custom pricing and settings.</p>
                        <ul className="list-unstyled">
                          <li><i className="bi bi-check text-success me-2"></i>Dynamic categories</li>
                          <li><i className="bi bi-check text-success me-2"></i>Category-specific pricing</li>
                          <li><i className="bi bi-check text-success me-2"></i>Subcategory management</li>
                          <li><i className="bi bi-check text-success me-2"></i>Custom expiration rules</li>
                        </ul>
                        <Link to="/admin/category-management" className="btn btn-info">
                          <i className="bi bi-tags me-1"></i>Manage Categories
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 border-success">
                      <div className="card-header bg-success text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-clock me-2"></i>Expiration Monitoring
                        </h5>
                      </div>
                      <div className="card-body">
                        <p className="card-text">Monitor and manage expiring marketplace items with automated notifications and extension controls.</p>
                        <ul className="list-unstyled">
                          <li><i className="bi bi-check text-success me-2"></i>Expiring items tracking</li>
                          <li><i className="bi bi-check text-success me-2"></i>Automated notifications</li>
                          <li><i className="bi bi-check text-success me-2"></i>Extension management</li>
                          <li><i className="bi bi-check text-success me-2"></i>Bulk operations</li>
                        </ul>
                        <Link to="/marketplace/expiring-items" className="btn btn-success">
                          <i className="bi bi-clock me-1"></i>View Expiring Items
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6 mb-3">
                    <div className="card h-100 border-danger">
                      <div className="card-header bg-danger text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-shield-check me-2"></i>Item Approval & Moderation
                        </h5>
                      </div>
                      <div className="card-body">
                        <p className="card-text">Review, approve, and moderate marketplace items posted by users. Manage pending items and flagged content.</p>
                        <ul className="list-unstyled">
                          <li><i className="bi bi-check text-success me-2"></i>Approve/reject pending items</li>
                          <li><i className="bi bi-check text-success me-2"></i>Review flagged content</li>
                          <li><i className="bi bi-check text-success me-2"></i>Bulk moderation actions</li>
                          <li><i className="bi bi-check text-success me-2"></i>Item status management</li>
                        </ul>
                        <Link to="/admin/marketplace-moderation" className="btn btn-danger">
                          <i className="bi bi-shield-check me-1"></i>Moderate Items
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketplace Statistics */}
                <div className="row mb-4">
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-shop text-primary fs-1"></i>
                        <h4 className="mt-2">0</h4>
                        <p className="text-muted mb-0">Active Listings</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-people text-success fs-1"></i>
                        <h4 className="mt-2">0</h4>
                        <p className="text-muted mb-0">Active Sellers</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-currency-dollar text-warning fs-1"></i>
                        <h4 className="mt-2">$0</h4>
                        <p className="text-muted mb-0">Total Revenue</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 mb-3">
                    <div className="card text-center">
                      <div className="card-body">
                        <i className="bi bi-clock text-info fs-1"></i>
                        <h4 className="mt-2">0</h4>
                        <p className="text-muted mb-0">Expiring Soon</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">
                          <i className="bi bi-lightning me-2"></i>Quick Actions
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-3 mb-2">
                            <Link to="/admin/marketplace-settings" className="btn btn-outline-primary w-100">
                              <i className="bi bi-gear me-1"></i>Settings
                            </Link>
                          </div>
                          <div className="col-md-3 mb-2">
                            <Link to="/admin/category-management" className="btn btn-outline-info w-100">
                              <i className="bi bi-tags me-1"></i>Categories
                            </Link>
                          </div>
                          <div className="col-md-3 mb-2">
                            <Link to="/marketplace/expiring-items" className="btn btn-outline-warning w-100">
                              <i className="bi bi-clock me-1"></i>Expiring Items
                            </Link>
                          </div>
                          <div className="col-md-3 mb-2">
                            <Link to="/marketplace" className="btn btn-outline-success w-100">
                              <i className="bi bi-eye me-1"></i>View Marketplace
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>🚀 Enhanced Application Management System Now Available!</strong> Access the enterprise-grade application processing system with powerful features:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-check-circle-fill me-2"></i>Core Features</h6>
                              <ul className="small">
                                <li>12 application types (Player, Coach, Volunteer, Transfer, Scholarship, etc.)</li>
                                <li>7-stage status workflow with automated notifications</li>
                                <li>4-level priority system (Low, Medium, High, Urgent)</li>
                                <li>Real-time status tracking and updates</li>
                                <li>Advanced multi-criteria filtering</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-lightning-fill me-2"></i>Advanced Features</h6>
                              <ul className="small">
                                <li><strong>Bulk Actions:</strong> Select & process multiple applications</li>
                                <li><strong>Assignment System:</strong> Distribute workload to team members</li>
                                <li><strong>Smart Sorting:</strong> Sort by date, priority, name, or type</li>
                                <li><strong>Timeline View:</strong> Complete audit trail for each application</li>
                                <li><strong>Analytics Dashboard:</strong> Comprehensive reporting & insights</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-graph-up me-2"></i>Analytics & Insights</h6>
                            <div className="row small">
                              <div className="col-md-4">• Approval rate tracking</div>
                              <div className="col-md-4">• Processing time metrics</div>
                              <div className="col-md-4">• Type-based performance</div>
                              <div className="col-md-4">• Status breakdown charts</div>
                              <div className="col-md-4">• Priority distribution</div>
                              <div className="col-md-4">• Team workload analysis</div>
                    </div>
                  </div>
                          
                          <Link to="/admin/applications" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Launch Application Management System
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-file-earmark-check display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Application Management Ready</h4>
                          <p className="text-muted">Click the button above to access the comprehensive application management system.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>📝 Comprehensive Form Builder Now Available!</strong> Create, manage, and distribute professional forms with ease:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-hammer me-2"></i>Form Builder Features</h6>
                              <ul className="small">
                                <li>Drag-and-drop form designer</li>
                                <li>15+ field types (text, email, phone, dropdown, signature, etc.)</li>
                                <li>Conditional logic support</li>
                                <li>Custom validation rules</li>
                                <li>Field ordering and organization</li>
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-gear me-2"></i>Form Management</h6>
                              <ul className="small">
                                <li>9 form categories (Registration, Medical, Consent, Evaluation, etc.)</li>
                                <li>Form status control (Draft, Active, Archived)</li>
                                <li>Duplicate and template system</li>
                                <li>Import/Export forms as JSON</li>
                                <li>Public form links</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-inbox me-2"></i>Submission Management</h6>
                            <div className="row small">
                              <div className="col-md-4">• Real-time submission tracking</div>
                              <div className="col-md-4">• Email notifications</div>
                              <div className="col-md-4">• Export to CSV/Excel</div>
                              <div className="col-md-4">• Automated responses</div>
                              <div className="col-md-4">• Access control options</div>
                              <div className="col-md-4">• Mobile responsive forms</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/forms" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Launch Form Builder
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-ui-checks display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Form Management System Ready</h4>
                          <p className="text-muted">Create registration forms, waivers, surveys, and more with our powerful form builder.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'broadcasts' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Broadcast Center</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Broadcast features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Create and send broadcasts</li>
                            <li>Target specific user groups</li>
                            <li>Schedule broadcast delivery</li>
                            <li>Broadcast templates and history</li>
                            <li>Delivery tracking and analytics</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-megaphone display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Broadcast Center</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'backup' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Backup & Restore</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Backup and restore features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Automated backup scheduling</li>
                            <li>Manual backup creation</li>
                            <li>Backup restoration</li>
                            <li>Backup verification and integrity</li>
                            <li>Backup storage management</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-cloud-arrow-down display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Backup & Restore</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'logs' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">System Logs</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          System logging features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>System activity logs</li>
                            <li>Error and exception tracking</li>
                            <li>User activity monitoring</li>
                            <li>Security event logging</li>
                            <li>Log filtering and search</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-journal-text display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">System Logs</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
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
                      <div className="card-header">
                        <h5 className="mb-0">Scheduling & Calendar Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>📅 Master Calendar & Scheduling System Available!</strong> Coordinate ALL club activities (public + internal):
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-globe me-2"></i>PUBLIC SCHEDULING</h6>
                              <ul className="small">
                                <li><strong>Team Practices</strong> - Visible on public calendar</li>
                                <li><strong>Match Schedules</strong> - Game times for parents</li>
                                <li><strong>Training Sessions</strong> - Public training times</li>
                                <li><strong>Events</strong> - Tournaments, camps, tryouts</li>
                                <li><strong>Public Calendar</strong> - Website integration</li>
                          </ul>
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <small className="text-blue-800">
                                  <strong>Purpose:</strong> Keep families informed of all activities
                                </small>
                        </div>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-building me-2"></i>INTERNAL SCHEDULING</h6>
                              <ul className="small">
                                <li><strong>Staff Meetings</strong> - Board, committee meetings</li>
                                <li><strong>Planning Sessions</strong> - Strategic planning</li>
                                <li><strong>Facility Maintenance</strong> - Downtime coordination</li>
                                <li><strong>Coach Meetings</strong> - Internal coordination</li>
                                <li><strong>Private Calendar</strong> - Staff-only view</li>
                              </ul>
                              <div className="mt-2 p-2 bg-gray-100 rounded">
                                <small className="text-gray-800">
                                  <strong>Purpose:</strong> Internal operations and coordination
                                </small>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-gear me-2"></i>Core Features</h6>
                            <div className="row small">
                              <div className="col-md-4">• 9 schedule types (Practice, Match, Meeting, etc.)</div>
                              <div className="col-md-4">• 3 visibility levels (Public, Members, Internal)</div>
                              <div className="col-md-4">• Resource booking system</div>
                              <div className="col-md-4">• Automatic conflict detection</div>
                              <div className="col-md-4">• Recurring schedule patterns</div>
                              <div className="col-md-4">• Multi-view calendar (Day/Week/Month)</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-building-fill-gear me-2"></i>Resource Management</h6>
                            <div className="row small">
                              <div className="col-md-4">• Field and facility booking</div>
                              <div className="col-md-4">• Equipment reservation</div>
                              <div className="col-md-4">• Availability tracking</div>
                              <div className="col-md-4">• Double-booking prevention</div>
                              <div className="col-md-4">• Resource utilization analytics</div>
                              <div className="col-md-4">• Booking conflicts resolution</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/scheduling" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Scheduling & Calendar
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-calendar-week-fill display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Scheduling System Ready</h4>
                          <p className="text-muted">Master calendar coordinating public schedules and internal operations with conflict prevention.</p>
                        </div>
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
                      <div className="card-header">
                        <h5 className="mb-0">Standings Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>🏆 Comprehensive Standings System Available!</strong> Manage league tables and rankings (PUBLIC + INTERNAL):
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-globe me-2"></i>PUBLIC STANDINGS</h6>
                              <ul className="small">
                                <li><strong>League Tables</strong> - Visible on website for fans</li>
                                <li><strong>Team Rankings</strong> - Current positions</li>
                                <li><strong>Win/Loss/Draw Records</strong> - Match results</li>
                                <li><strong>Goals Statistics</strong> - Scoring data</li>
                                <li><strong>Current Form</strong> - Last 5 results (W/L/D)</li>
                                <li><strong>Position Changes</strong> - Up/down arrows</li>
                                <li><strong>Season History</strong> - Past standings</li>
                              </ul>
                              <div className="mt-2 p-2 bg-blue-50 rounded">
                                <small className="text-blue-800">
                                  <strong>Purpose:</strong> Show fans and parents how teams are performing in competitions
                                </small>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-building me-2"></i>INTERNAL STANDINGS</h6>
                              <ul className="small">
                                <li><strong>Practice Performance</strong> - Internal rankings</li>
                                <li><strong>Development Tracking</strong> - Player progress</li>
                                <li><strong>Evaluation Tables</strong> - Staff assessments</li>
                                <li><strong>Selection Rankings</strong> - Team selection data</li>
                                <li><strong>Trial Period Results</strong> - Tryout standings</li>
                                <li><strong>Private Metrics</strong> - Internal analysis</li>
                                <li><strong>Staff-Only Data</strong> - Confidential evaluations</li>
                              </ul>
                              <div className="mt-2 p-2 bg-gray-100 rounded">
                                <small className="text-gray-800">
                                  <strong>Purpose:</strong> Internal evaluation and team management decisions
                                </small>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-calculator me-2"></i>Automatic Calculations</h6>
                            <div className="row small">
                              <div className="col-md-4">• Automatic points calculation</div>
                              <div className="col-md-4">• Goal difference computation</div>
                              <div className="col-md-4">• Win rate percentages</div>
                              <div className="col-md-4">• Automatic table sorting</div>
                              <div className="col-md-4">• Tiebreaker rules (4 methods)</div>
                              <div className="col-md-4">• Position change tracking</div>
                              <div className="col-md-4">• Form indicators (last 5 games)</div>
                              <div className="col-md-4">• Promotion/relegation zones</div>
                              <div className="col-md-4">• Real-time updates</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-trophy-fill me-2"></i>League Features</h6>
                            <div className="row small">
                              <div className="col-md-4">• Multiple divisions (U6 to Adult)</div>
                              <div className="col-md-4">• 5 league types (League, Cup, Tournament, etc.)</div>
                              <div className="col-md-4">• Customizable points system</div>
                              <div className="col-md-4">• Season management</div>
                              <div className="col-md-4">• Export to CSV/PDF</div>
                              <div className="col-md-4">• Mobile responsive tables</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/standings" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Standings Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-trophy-fill display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Standings System Ready</h4>
                          <p className="text-muted">Create public league tables and internal evaluation rankings with automatic calculations.</p>
                        </div>
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
                      <div className="card-header">
                        <h5 className="mb-0">Statistics & Analytics</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>📊 Comprehensive Statistics & Analytics System Available!</strong> Data-driven insights for better decision making:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-trophy me-2"></i>Match Statistics</h6>
                              <ul className="small">
                                <li>Win/Loss/Draw records and percentages</li>
                                <li>Goals scored and conceded tracking</li>
                                <li>Clean sheets and shutouts</li>
                                <li>Home vs away performance analysis</li>
                                <li>Win streaks and form tracking</li>
                                <li>Biggest wins and losses</li>
                                <li>Head-to-head records</li>
                              </ul>
                            </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-people me-2"></i>Player Analytics</h6>
                              <ul className="small">
                                <li>Top scorers and assist leaders</li>
                                <li>Goals per match averages</li>
                                <li>Shot accuracy and efficiency</li>
                                <li>Appearances and minutes played</li>
                                <li>Disciplinary records (cards)</li>
                                <li>Player comparisons</li>
                                <li>Performance rankings</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-graph-up me-2"></i>Advanced Analytics</h6>
                            <div className="row small">
                              <div className="col-md-4">• Goal difference analysis</div>
                              <div className="col-md-4">• Win rate calculations</div>
                              <div className="col-md-4">• Scoring patterns</div>
                              <div className="col-md-4">• Defensive metrics</div>
                              <div className="col-md-4">• Performance trends</div>
                              <div className="col-md-4">• Season comparisons</div>
                              <div className="col-md-4">• Team benchmarking</div>
                              <div className="col-md-4">• Player development tracking</div>
                              <div className="col-md-4">• Tactical insights</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-file-earmark-bar-graph me-2"></i>Reports & Insights</h6>
                            <div className="row small">
                              <div className="col-md-4">• Automated season reports</div>
                              <div className="col-md-4">• Player performance reports</div>
                              <div className="col-md-4">• Team comparison reports</div>
                              <div className="col-md-4">• Export to PDF/Excel</div>
                              <div className="col-md-4">• Custom report builder</div>
                              <div className="col-md-4">• Visual charts and graphs</div>
                              <div className="col-md-4">• Print-friendly formats</div>
                              <div className="col-md-4">• Email report distribution</div>
                              <div className="col-md-4">• Historical data archives</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/statistics" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Statistics & Analytics
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-graph-up-arrow display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Statistics System Ready</h4>
                          <p className="text-muted">Comprehensive analytics dashboard with match stats, player performance, and season insights.</p>
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
                      <div className="card-header">
                        <h5 className="mb-0">Match Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>⚽ Comprehensive Match Management System Available!</strong> Complete match scheduling and tracking system:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-calendar-event me-2"></i>Match Scheduling</h6>
                              <ul className="small">
                                <li>6 match types (League, Cup, Friendly, Tournament, Playoff, Exhibition)</li>
                                <li>7 status stages (Scheduled, Confirmed, In Progress, Halftime, Completed, etc.)</li>
                                <li>Date, time, and venue management</li>
                                <li>Referee and officials assignment</li>
                                <li>Weather and attendance tracking</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-graph-up me-2"></i>Score & Statistics</h6>
                              <ul className="small">
                                <li>Live score updates</li>
                                <li>Detailed match statistics (shots, possession, corners, fouls)</li>
                                <li>Cards tracking (yellow/red cards)</li>
                                <li>Team lineups and formations</li>
                                <li>Match events timeline</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-trophy me-2"></i>Analytics & Reporting</h6>
                            <div className="row small">
                              <div className="col-md-4">• Win/Loss/Draw records</div>
                              <div className="col-md-4">• Goals scored/conceded</div>
                              <div className="col-md-4">• Win rate percentage</div>
                              <div className="col-md-4">• Goal difference tracking</div>
                              <div className="col-md-4">• Performance analytics</div>
                              <div className="col-md-4">• Match reports generation</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-list-check me-2"></i>Features</h6>
                            <div className="row small">
                              <div className="col-md-4">• Advanced filtering (type, status, date range)</div>
                              <div className="col-md-4">• Live match tracking with real-time updates</div>
                              <div className="col-md-4">• Upcoming matches dashboard</div>
                              <div className="col-md-4">• Match history and archives</div>
                              <div className="col-md-4">• Export match data</div>
                              <div className="col-md-4">• Mobile responsive interface</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/matches" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Match Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-trophy-fill display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Match Management System Ready</h4>
                          <p className="text-muted">Schedule matches, track scores, manage officials, and analyze performance all in one place.</p>
                        </div>
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
                      <div className="card-header">
                        <h5 className="mb-0">Training Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>🎯 Comprehensive Training Management System Available!</strong> Complete training planning and development system:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-calendar-check me-2"></i>Session Planning</h6>
                              <ul className="small">
                                <li>9 training types (Technical, Tactical, Physical, Mental, etc.)</li>
                                <li>Session scheduling with date, time, and location</li>
                                <li>Objectives and focus area setting</li>
                                <li>4 intensity levels (Low, Medium, High, Very High)</li>
                                <li>Coach and assistant assignments</li>
                                <li>Equipment requirements tracking</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-trophy me-2"></i>Development Tracking</h6>
                              <ul className="small">
                                <li>Attendance tracking per session</li>
                                <li>Progress monitoring and assessments</li>
                                <li>Skill focus areas (14 categories)</li>
                                <li>Session notes and feedback</li>
                                <li>Training history and archives</li>
                                <li>Player development analytics</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-book me-2"></i>Drill Library & Resources</h6>
                            <div className="row small">
                              <div className="col-md-4">• 9 drill categories</div>
                              <div className="col-md-4">• Pre-built drill templates</div>
                              <div className="col-md-4">• Custom drill creation</div>
                              <div className="col-md-4">• Drill diagrams and videos</div>
                              <div className="col-md-4">• Equipment lists</div>
                              <div className="col-md-4">• Age-appropriate exercises</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-graph-up me-2"></i>Analytics & Reporting</h6>
                            <div className="row small">
                              <div className="col-md-4">• Training completion rates</div>
                              <div className="col-md-4">• Average attendance tracking</div>
                              <div className="col-md-4">• Training frequency metrics</div>
                              <div className="col-md-4">• Total training hours</div>
                              <div className="col-md-4">• Type distribution analysis</div>
                              <div className="col-md-4">• Export session data</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/training" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Training Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-clipboard-check display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Training Management System Ready</h4>
                          <p className="text-muted">Plan training sessions, track player development, manage drill libraries, and analyze training effectiveness.</p>
                        </div>
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

            {activeSection === 'equipment' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Equipment Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Equipment management features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Equipment inventory and tracking</li>
                            <li>Check-out and return system</li>
                            <li>Maintenance and repair scheduling</li>
                            <li>Equipment condition monitoring</li>
                            <li>Purchase and procurement management</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-gear display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Equipment Management</h4>
                          <p className="text-muted">Coming soon...</p>
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
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Sponsor Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>🤝 Comprehensive Sponsor Management System Available!</strong> Build and maintain valuable partnerships:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-building me-2"></i>Sponsor Profiles</h6>
                              <ul className="small">
                                <li>Complete company information and contacts</li>
                                <li>Logo and branding assets storage</li>
                                <li>Contract tracking and management</li>
                                <li>Payment schedules and history</li>
                                <li>Communication logs and notes</li>
                                <li>Website and social media links</li>
                                <li>Address and location details</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-trophy me-2"></i>Sponsorship Tiers</h6>
                              <ul className="small">
                                <li><strong>💎 Platinum:</strong> $10,000+ (Premium benefits)</li>
                                <li><strong>🥇 Gold:</strong> $5,000+ (Enhanced visibility)</li>
                                <li><strong>🥈 Silver:</strong> $2,500+ (Standard package)</li>
                                <li><strong>🥉 Bronze:</strong> $1,000+ (Basic recognition)</li>
                                <li><strong>🎁 In-Kind:</strong> Product/service donations</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-calendar-check me-2"></i>Contract Management</h6>
                            <div className="row small">
                              <div className="col-md-4">• Start and end date tracking</div>
                              <div className="col-md-4">• Automatic expiration alerts</div>
                              <div className="col-md-4">• Renewal reminders (30/60/90 days)</div>
                              <div className="col-md-4">• Contract document storage</div>
                              <div className="col-md-4">• Status tracking (Active, Pending, Expired)</div>
                              <div className="col-md-4">• Multi-year agreements</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-cash-stack me-2"></i>Financial Tracking</h6>
                            <div className="row small">
                              <div className="col-md-4">• Payment frequency options (Annual, Quarterly, Monthly)</div>
                              <div className="col-md-4">• Total revenue calculation</div>
                              <div className="col-md-4">• Revenue by tier analytics</div>
                              <div className="col-md-4">• Average sponsor value</div>
                              <div className="col-md-4">• Payment schedule tracking</div>
                              <div className="col-md-4">• Financial reporting</div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-gift me-2"></i>Sponsor Benefits</h6>
                            <div className="row small">
                              <div className="col-md-3">• Logo on jerseys/equipment</div>
                              <div className="col-md-3">• Website placement and links</div>
                              <div className="col-md-3">• Social media recognition</div>
                              <div className="col-md-3">• Banner at games/events</div>
                              <div className="col-md-3">• Season passes allocation</div>
                              <div className="col-md-3">• Newsletter features</div>
                              <div className="col-md-3">• Press release inclusion</div>
                              <div className="col-md-3">• Event recognition</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/sponsors" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Sponsor Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-award display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Sponsor Management System Ready</h4>
                          <p className="text-muted">Manage partnerships, track revenue, automate renewals, and deliver sponsor benefits effectively.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'membership' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Membership Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          <strong>👥 Comprehensive Membership Management System Available!</strong> Complete membership lifecycle management:
                          
                          <div className="row mt-3 mb-3">
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-person-badge me-2"></i>Member Management</h6>
                              <ul className="small">
                                <li><strong>Complete Profiles:</strong> Personal info, contact details, emergency contacts</li>
                                <li><strong>Unique Member Numbers:</strong> Auto-generated MEM-xxxxx format</li>
                                <li><strong>Member History:</strong> Track membership timeline and changes</li>
                                <li><strong>Family Memberships:</strong> Link family members together</li>
                                <li><strong>Status Tracking:</strong> Active, pending, expired, suspended, cancelled</li>
                                <li><strong>Advanced Search:</strong> Find by name, email, member number</li>
                                <li><strong>Bulk Operations:</strong> Renew multiple members at once</li>
                                <li><strong>Export Data:</strong> CSV export for external analysis</li>
                          </ul>
                        </div>
                            <div className="col-md-6">
                              <h6 className="text-success"><i className="bi bi-trophy me-2"></i>Membership Tiers (5 Levels)</h6>
                              <ul className="small">
                                <li><strong>🥉 Basic ($50/year):</strong> Events, newsletter, 10% merch discount</li>
                                <li><strong>🥈 Standard ($100/year):</strong> Priority registration, members events, 15% discount</li>
                                <li><strong>🥇 Premium ($200/year):</strong> VIP access, reserved seating, 20% discount, coaching session</li>
                                <li><strong>💎 Elite ($500/year):</strong> Unlimited passes, VIP parking, 30% discount, private coaching</li>
                                <li><strong>👨‍👩‍👧‍👦 Family ($150/year):</strong> Up to 4 members, standard benefits for all</li>
                                <li><strong>Custom Tiers:</strong> Create your own membership levels</li>
                                <li><strong>Flexible Pricing:</strong> Monthly, quarterly, semi-annual, annual, lifetime</li>
                              </ul>
                        </div>
                      </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-arrow-repeat me-2"></i>Renewal System</h6>
                            <div className="row small">
                              <div className="col-md-4">• <strong>Auto-Renewal:</strong> Automatic membership renewal with saved payment</div>
                              <div className="col-md-4">• <strong>Renewal Reminders:</strong> Automated emails 30/60/90 days before expiry</div>
                              <div className="col-md-4">• <strong>Expiration Tracking:</strong> Color-coded alerts for expiring memberships</div>
                              <div className="col-md-4">• <strong>Bulk Renewals:</strong> Renew multiple members simultaneously</div>
                              <div className="col-md-4">• <strong>Grace Period:</strong> Configurable grace period after expiration</div>
                              <div className="col-md-4">• <strong>Manual Renewal:</strong> Process renewals manually when needed</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-cash-stack me-2"></i>Payment & Billing</h6>
                            <div className="row small">
                              <div className="col-md-3">• Multiple payment methods (cards, PayPal, Stripe, check, cash)</div>
                              <div className="col-md-3">• Billing cycle options (monthly, quarterly, annual, lifetime)</div>
                              <div className="col-md-3">• Discount code support</div>
                              <div className="col-md-3">• Payment history tracking</div>
                              <div className="col-md-3">• Invoice generation</div>
                              <div className="col-md-3">• Failed payment handling</div>
                              <div className="col-md-3">• Prorated memberships</div>
                              <div className="col-md-3">• Payment reminders</div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-graph-up me-2"></i>Analytics & Reporting</h6>
                            <div className="row small">
                              <div className="col-md-4">• Total membership revenue tracking</div>
                              <div className="col-md-4">• Revenue by tier breakdown</div>
                              <div className="col-md-4">• Average revenue per member</div>
                              <div className="col-md-4">• Retention rate calculation</div>
                              <div className="col-md-4">• Growth trends and projections</div>
                              <div className="col-md-4">• Expiration forecasting</div>
                              <div className="col-md-4">• Member acquisition analysis</div>
                              <div className="col-md-4">• Churn rate monitoring</div>
                              <div className="col-md-4">• Export reports to Excel/PDF</div>
                            </div>
                          </div>
                          
                          <div className="bg-light p-3 rounded mb-3">
                            <h6 className="text-dark mb-2"><i className="bi bi-gear me-2"></i>Admin Controls</h6>
                            <div className="row small">
                              <div className="col-md-4">• Tier management (create, edit, delete)</div>
                              <div className="col-md-4">• Benefit customization per tier</div>
                              <div className="col-md-4">• Pricing adjustments</div>
                              <div className="col-md-4">• Member status changes (suspend, cancel, reactivate)</div>
                              <div className="col-md-4">• Manual expiry date adjustments</div>
                              <div className="col-md-4">• Upgrade/downgrade members between tiers</div>
                              <div className="col-md-4">• Discount code creation and management</div>
                              <div className="col-md-4">• Email template customization</div>
                              <div className="col-md-4">• Automated workflow configuration</div>
                            </div>
                          </div>
                          
                          <Link to="/admin/membership" className="btn btn-success btn-lg">
                            <i className="bi bi-arrow-right me-2"></i>
                            Go to Membership Management
                          </Link>
                        </div>
                        <div className="text-center py-4">
                          <i className="bi bi-person-check-fill display-1 text-success"></i>
                          <h4 className="mt-3 text-success">Membership Management System Ready</h4>
                          <p className="text-muted">Manage members, tiers, renewals, payments with comprehensive analytics and automation.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'payments' && (
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

            {activeSection === 'waivers' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Waiver Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Waiver management features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Digital waiver creation and management</li>
                            <li>Electronic signature collection</li>
                            <li>Waiver compliance tracking</li>
                            <li>Expiration and renewal management</li>
                            <li>Legal document storage and retrieval</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-file-earmark-check display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Waiver Management</h4>
                          <p className="text-muted">Coming soon...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'insurance' && (
              <div>
                <div className="row">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Insurance Management</h5>
                      </div>
                      <div className="card-body">
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Insurance management features will be implemented here. This will include:
                          <ul className="mt-2 mb-0">
                            <li>Insurance policy management</li>
                            <li>Claim processing and tracking</li>
                            <li>Coverage verification and validation</li>
                            <li>Premium payment tracking</li>
                            <li>Insurance compliance monitoring</li>
                          </ul>
                        </div>
                        <div className="text-center py-5">
                          <i className="bi bi-shield display-1 text-muted"></i>
                          <h4 className="mt-3 text-muted">Insurance Management</h4>
                          <p className="text-muted">Coming soon...</p>
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
