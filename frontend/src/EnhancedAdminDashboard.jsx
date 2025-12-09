import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import HomepageContentManager from './components/HomepageContentManager';
import PasswordResetManager from './components/PasswordResetManager';
import BroadcastManager from './components/BroadcastManager';
import { API_BASE_URL } from './config/api';

export default function EnhancedAdminDashboard() {
  const [stats, setStats] = useState({
    applications: 0,
    payments: 0,
    totalAmount: 0,
    users: 0,
    pendingMarketplaceItems: 0,
    flaggedMarketplaceItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState('overview'); // overview, analytics, reports, settings
  
  // Enhanced Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    weeklyApplications: [],
    monthlyRevenue: [],
    userGrowth: [],
    topPrograms: [],
    recentActivity: []
  });
  
  // Enhanced Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Modal States
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showHomepageContentModal, setShowHomepageContentModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchStats();
      fetchAnalyticsData();
      fetchNotifications();
      
      // Refresh data every 30 seconds
      const interval = setInterval(() => {
        fetchStats();
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const [applicationsRes, paymentsRes, usersRes, marketplaceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/applications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/payments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/marketplace/public", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setStats(prev => ({ ...prev, applications: applicationsData.length }));
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        const totalAmount = paymentsData.reduce((sum, p) => sum + p.amount, 0);
        setStats(prev => ({ 
          ...prev, 
          payments: paymentsData.length, 
          totalAmount 
        }));
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStats(prev => ({ ...prev, users: usersData.length }));
      }

      if (marketplaceRes.ok) {
        const marketplaceData = await marketplaceRes.json();
        const pendingItems = marketplaceData.items?.filter(item => item.status === 'pending') || [];
        const flaggedItems = marketplaceData.items?.filter(item => item.flags && item.flags.length > 0) || [];
        setStats(prev => ({ 
          ...prev, 
          pendingMarketplaceItems: pendingItems.length,
          flaggedMarketplaceItems: flaggedItems.length
        }));
      }
    } catch (err) {
      setError("Failed to load dashboard stats");
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      // Generate sample analytics data (replace with actual API calls)
      const weeklyData = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          applications: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 1000) + 200,
          users: Math.floor(Math.random() * 10) + 2
        };
      }).reverse();

      const monthlyData = Array.from({length: 12}, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        revenue: Math.floor(Math.random() * 5000) + 1000,
        applications: Math.floor(Math.random() * 100) + 20
      }));

      setAnalyticsData({
        weeklyApplications: weeklyData,
        monthlyRevenue: monthlyData,
        userGrowth: weeklyData.map(d => ({ date: d.date, users: d.users })),
        topPrograms: [
          { name: 'Youth U12', participants: 45, revenue: 9000 },
          { name: 'Adult League', participants: 32, revenue: 9600 },
          { name: 'Competitive', participants: 28, revenue: 9800 },
          { name: 'Recreational', participants: 38, revenue: 7600 }
        ],
        recentActivity: [
          { type: 'application', message: 'New player application received', time: '2 minutes ago' },
          { type: 'payment', message: 'Payment received from John Doe', time: '15 minutes ago' },
          { type: 'user', message: 'New user registered', time: '1 hour ago' },
          { type: 'marketplace', message: 'Marketplace item flagged for review', time: '2 hours ago' }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Generate sample notifications (replace with actual API calls)
      const sampleNotifications = [
        { id: 1, type: 'warning', message: '5 marketplace items pending approval', time: '2 hours ago', read: false },
        { id: 2, type: 'info', message: 'New payment received: $150.00', time: '4 hours ago', read: true },
        { id: 3, type: 'success', message: '10 applications approved today', time: '6 hours ago', read: true },
        { id: 4, type: 'error', message: 'System backup completed', time: '1 day ago', read: true }
      ];
      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Enhanced StatCard Component
  const EnhancedStatCard = ({ title, value, subtitle, onClick, color = "blue", icon, trend }) => (
    <div 
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-200 p-6 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full bg-${color}-200 group-hover:bg-${color}-300 transition-colors duration-300`}>
          {icon || (
            <svg className={`w-6 h-6 text-${color}-700`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold text-${color}-900 mb-2`}>{value}</div>
      <div className={`text-lg font-semibold text-${color}-700 mb-1`}>{title}</div>
      {subtitle && <div className={`text-sm text-${color}-600 opacity-80`}>{subtitle}</div>}
    </div>
  );

  // Enhanced Analytics Card Component
  const AnalyticsCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  // Enhanced Quick Action Button
  const QuickActionButton = ({ title, description, icon, onClick, color = "blue", className = "" }) => (
    <button
      onClick={onClick}
      className={`w-full bg-gradient-to-r from-${color}-500 to-${color}-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold mb-1">{title}</div>
          <div className="text-sm opacity-90">{description}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </button>
  );

  // Enhanced Notification Badge
  const NotificationBadge = ({ count, onClick }) => (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4H19.8a2 2 0 012 2v12a2 2 0 01-2 2H4.19a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );

  // Check if user is authenticated
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in as a super admin to access this dashboard.</p>
            <Link 
              to="/signin"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
          <p className="text-gray-500">Please wait while we prepare your admin panel</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchStats}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Comprehensive club management & analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['overview', 'analytics', 'reports', 'settings'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      viewMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Notifications */}
              <NotificationBadge 
                count={notifications.filter(n => !n.read).length} 
                onClick={() => setShowNotifications(!showNotifications)} 
              />
              
              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">SA</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Super Admin</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <>
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <EnhancedStatCard
                title="Pending Applications"
                value={stats.applications}
                subtitle="Awaiting review"
                onClick={() => setShowApplicationsModal(true)}
                color="yellow"
                icon={
                  <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                trend={12}
              />
              <EnhancedStatCard
                title="Total Payments"
                value={stats.payments}
                subtitle={`$${stats.totalAmount.toFixed(2)} total`}
                onClick={() => {/* Handle click */}}
                color="blue"
                icon={
                  <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
                trend={8}
              />
              <EnhancedStatCard
                title="Registered Users"
                value={stats.users}
                subtitle="Active accounts"
                onClick={() => setShowUsersModal(true)}
                color="purple"
                icon={
                  <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                trend={15}
              />
              <EnhancedStatCard
                title="Marketplace Items"
                value={stats.pendingMarketplaceItems + stats.flaggedMarketplaceItems}
                subtitle="Need attention"
                onClick={() => {/* Handle click */}}
                color="orange"
                icon={
                  <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
                trend={-5}
              />
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <QuickActionButton
                title="Manage Applications"
                description="Review and process applications"
                icon="📋"
                onClick={() => setShowApplicationsModal(true)}
                color="green"
              />
              <QuickActionButton
                title="User Management"
                description="Manage user accounts and permissions"
                icon="👥"
                onClick={() => setShowUsersModal(true)}
                color="blue"
              />
              <QuickActionButton
                title="Broadcast Messages"
                description="Send announcements to users"
                icon="📢"
                onClick={() => {/* Navigate to broadcast manager */}}
                color="purple"
              />
              <QuickActionButton
                title="Fee Settings"
                description="Configure registration fees"
                icon="💰"
                onClick={() => setShowFeeModal(true)}
                color="yellow"
              />
              <QuickActionButton
                title="Homepage Content"
                description="Manage website content"
                icon="🏠"
                onClick={() => setShowHomepageContentModal(true)}
                color="indigo"
              />
              <QuickActionButton
                title="Password Reset"
                description="Manage password resets"
                icon="🔐"
                onClick={() => setShowPasswordResetModal(true)}
                color="red"
              />
            </div>

            {/* Recent Activity */}
            <AnalyticsCard title="Recent Activity" className="mb-8">
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'application' ? 'bg-blue-500' :
                      activity.type === 'payment' ? 'bg-green-500' :
                      activity.type === 'user' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnalyticsCard>
          </>
        )}

        {/* Analytics Mode */}
        {viewMode === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsCard title="Weekly Applications">
                <div className="space-y-3">
                  {analyticsData.weeklyApplications.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{day.date}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium">{day.applications} applications</span>
                        <span className="text-sm text-gray-500">${day.revenue} revenue</span>
                      </div>
                    </div>
                  ))}
                </div>
              </AnalyticsCard>
              
              <AnalyticsCard title="Top Programs">
                <div className="space-y-3">
                  {analyticsData.topPrograms.map((program, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{program.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{program.participants} participants</div>
                        <div className="text-xs text-gray-500">${program.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnalyticsCard>
            </div>
          </div>
        )}

        {/* Reports Mode */}
        {viewMode === 'reports' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Reports & Export</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalyticsCard title="Data Export">
                <div className="space-y-4">
                  <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Export Applications (CSV)
                  </button>
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Export Payments (CSV)
                  </button>
                  <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                    Export User Data (CSV)
                  </button>
                </div>
              </AnalyticsCard>
              
              <AnalyticsCard title="Generated Reports">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">Monthly Summary Report</div>
                    <div className="text-xs text-gray-500">Generated 2 days ago</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">Application Analytics</div>
                    <div className="text-xs text-gray-500">Generated 1 week ago</div>
                  </div>
                </div>
              </AnalyticsCard>
            </div>
          </div>
        )}

        {/* Settings Mode */}
        {viewMode === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalyticsCard title="General Settings">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Notifications</span>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">Enabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Auto Backup</span>
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-xs">Disabled</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maintenance Mode</span>
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-xs">Disabled</button>
                  </div>
                </div>
              </AnalyticsCard>
              
              <AnalyticsCard title="Security Settings">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Two-Factor Auth</span>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">Required</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Session Timeout</span>
                    <span className="text-sm text-gray-600">30 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Login Attempts</span>
                    <span className="text-sm text-gray-600">5 attempts</span>
                  </div>
                </div>
              </AnalyticsCard>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                    notification.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                    notification.type === 'info' ? 'border-blue-400 bg-blue-50' :
                    notification.type === 'success' ? 'border-green-400 bg-green-50' :
                    'border-red-400 bg-red-50'
                  }`}>
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add other modals here as needed */}
    </div>
  );
}
