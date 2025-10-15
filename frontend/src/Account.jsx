import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from 'react-toastify';
import BroadcastMessages from "./components/BroadcastMessages";
import BuyerRatingForm from "./BuyerRatingForm";

export default function Account() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [buyerReviews, setBuyerReviews] = useState([]);
  const [showReviewsSection, setShowReviewsSection] = useState(false);
  const [completedSales, setCompletedSales] = useState([]);
  const [showRateBuyerModal, setShowRateBuyerModal] = useState(false);
  const [selectedBuyerToRate, setSelectedBuyerToRate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    passwordLastChanged: null
  });
  const [activityLog, setActivityLog] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });
  const [accountSettings, setAccountSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    applicationUpdates: true,
    paymentReminders: true,
    eventReminders: true,
    marketplaceUpdates: true,
    teamUpdates: true,
    newsletter: true,
    marketing: false
  });
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: false,
    backupFrequency: 'weekly',
    lastBackup: null,
    cloudStorage: false
  });
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    plan: 'free',
    status: 'active',
    renewalDate: null,
    features: []
  });
  const [deviceManagement, setDeviceManagement] = useState({
    activeDevices: [],
    loginHistory: [],
    suspiciousActivity: []
  });
  const [advancedSecurity, setAdvancedSecurity] = useState({
    loginAttempts: 0,
    lastFailedLogin: null,
    ipWhitelist: [],
    sessionTimeout: 30,
    requireReauth: false
  });
  const [dataAnalytics, setDataAnalytics] = useState({
    loginFrequency: [],
    activityPatterns: {},
    usageStats: {},
    performanceMetrics: {}
  });
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    onlineStatus: true,
    lastSeen: new Date(),
    activeConnections: 1,
    realTimeNotifications: []
  });
  const [smartInsights, setSmartInsights] = useState({
    recommendations: [],
    trends: [],
    predictions: [],
    alerts: []
  });
  const [aiAssistant, setAiAssistant] = useState({
    enabled: false,
    suggestions: [],
    chatHistory: [],
    isTyping: false
  });
  const [advancedMetrics, setAdvancedMetrics] = useState({
    performanceScore: 85,
    engagementLevel: 'high',
    productivityIndex: 92,
    wellnessScore: 78
  });
  const [modernFeatures, setModernFeatures] = useState({
    darkMode: false,
    animations: true,
    soundEffects: false,
    hapticFeedback: true,
    voiceCommands: false,
    gestureControls: false
  });
  
  // Marketplace enhancement states
  const [marketplaceView, setMarketplaceView] = useState('grid'); // grid, list, table
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('all');
  const [marketplaceSort, setMarketplaceSort] = useState('newest');
  const [showAllMarketplaceItems, setShowAllMarketplaceItems] = useState(false);
  const [allMarketplaceItems, setAllMarketplaceItems] = useState([]);
  const [allMarketplaceItemsLoading, setAllMarketplaceItemsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMarketplaceItemForActions, setSelectedMarketplaceItemForActions] = useState(null);
  const [soldPrice, setSoldPrice] = useState('');
  const [marketplaceEditForm, setMarketplaceEditForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    brand: '',
    size: ''
  });
  const [marketplaceCategories] = useState([
    'Soccer Equipment', 'Jerseys & Apparel', 'Shoes & Cleats', 'Accessories', 
    'Training Gear', 'Collectibles', 'Services', 'Other'
  ]);
  const [marketplaceStats, setMarketplaceStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalMessages: 0,
    totalSales: 0,
    averagePrice: 0,
    responseRate: 0
  });
  const [showMarketplaceModal, setShowMarketplaceModal] = useState(false);
  const [selectedMarketplaceItemForAnalytics, setSelectedMarketplaceItemForAnalytics] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: "", 
    password: "", 
    phone: "", 
    username: "",
    email: "",
    address: "",
    emergencyContact: "",
    medicalInfo: "",
    preferences: {
      notifications: true,
      newsletter: true,
      marketing: false
    }
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadBroadcasts, setUnreadBroadcasts] = useState(0);

  // Function to fetch unread broadcasts count
  const fetchUnreadBroadcastsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/broadcasts/my-broadcasts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const broadcastsData = await response.json();
        const unreadCount = broadcastsData.filter(b => !b.inAppRead).length;
        setUnreadBroadcasts(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread broadcasts count:', error);
    }
  };
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalItems: 0,
    totalApplications: 0,
    totalGalleryItems: 0,
    memberSince: '',
    lastLogin: '',
    accountStatus: 'active'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    
    const fetchUserData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!userRes.ok) throw new Error("Not authorized");
        const userData = await userRes.json();
        setUser(userData);
        setEditForm({ 
          name: userData.name || "", 
          password: "", 
          phone: userData.phone || "",
          username: userData.username || "",
          email: userData.email || "",
          address: userData.address || "",
          emergencyContact: userData.emergencyContact || "",
          medicalInfo: userData.medicalInfo || "",
          preferences: userData.preferences || {
            notifications: true,
            newsletter: true,
            marketing: false
          }
        });

        // Fetch payments
        const paymentsRes = await fetch("http://localhost:5000/api/payments?user=me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData);
          setStats(prev => ({
            ...prev,
            totalDonations: paymentsData.reduce((sum, p) => sum + p.amount, 0)
          }));
        }

        // Fetch user's applications
        const appsRes = await fetch(`http://localhost:5000/api/applications/user-email/${userData.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData);
          setStats(prev => ({
            ...prev,
            totalApplications: appsData.length
          }));
        }

        // Fetch unread broadcasts count
        await fetchUnreadBroadcastsCount();

        // Fetch user's marketplace items
        const marketplaceRes = await fetch("http://localhost:5000/api/marketplace/my-items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (marketplaceRes.ok) {
          const marketplaceData = await marketplaceRes.json();
          setMarketplaceItems(marketplaceData.items || marketplaceData);
          setStats(prev => ({
            ...prev,
            totalItems: (marketplaceData.items || marketplaceData).length
          }));
        }

        // Fetch user's gallery items
        const galleryRes = await fetch("http://localhost:5000/api/gallery/user/my-items", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          setGalleryItems(galleryData);
          setStats(prev => ({
            ...prev,
            totalGalleryItems: galleryData.length
          }));
        }

        // Fetch user's favorites
        const favoritesRes = await fetch("http://localhost:5000/api/marketplace/user/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (favoritesRes.ok) {
          const favoritesData = await favoritesRes.json();
          setFavorites(favoritesData);
        }

        // Set additional stats
        setStats(prev => ({
          ...prev,
          memberSince: new Date(userData.createdAt || Date.now()).toLocaleDateString(),
          lastLogin: new Date(userData.lastLogin || Date.now()).toLocaleDateString(),
          accountStatus: userData.isActive !== false ? 'active' : 'inactive'
        }));

      } catch (err) {
        setError("Not authorized. Please log in again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/signin"), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Refresh unread broadcasts count when announcements tab is active
  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchUnreadBroadcastsCount();
    }
  }, [activeTab]);

  // Function to fetch all marketplace items
  const fetchAllMarketplaceItems = async () => {
    try {
      setAllMarketplaceItemsLoading(true);
      const response = await fetch('http://localhost:5000/api/marketplace/public?page=1&limit=12');
      
      if (response.ok) {
        const data = await response.json();
        console.log('🛒 All Marketplace Items API Response:', data);
        setAllMarketplaceItems(data.items || []);
      } else {
        console.error('❌ All Marketplace Items API Error:', response.status);
        setAllMarketplaceItems([]);
      }
    } catch (error) {
      console.error('Error fetching all marketplace items:', error);
      setAllMarketplaceItems([]);
    } finally {
      setAllMarketplaceItemsLoading(false);
    }
  };

  // Function to toggle between user's items and all marketplace items
  const toggleMarketplaceView = () => {
    if (!showAllMarketplaceItems) {
      fetchAllMarketplaceItems();
    }
    setShowAllMarketplaceItems(!showAllMarketplaceItems);
  };

  // Function to handle delete marketplace item
  const handleDeleteMarketplaceItem = async () => {
    if (!selectedMarketplaceItemForActions) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/my-items/${selectedMarketplaceItemForActions._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove item from local state
        setMarketplaceItems(prev => prev.filter(item => item._id !== selectedMarketplaceItemForActions._id));
        setShowDeleteModal(false);
        setSelectedMarketplaceItemForActions(null);
        alert('Item deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Error deleting item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  // Function to handle mark as sold
  const handleMarkAsSoldMarketplace = async () => {
    if (!selectedMarketplaceItemForActions || !soldPrice) {
      alert('Please enter a sold price');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/my-items/${selectedMarketplaceItemForActions._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'sold',
          soldPrice: parseFloat(soldPrice)
        })
      });

      if (response.ok) {
        // Update item in local state
        setMarketplaceItems(prev => prev.map(item => 
          item._id === selectedMarketplaceItemForActions._id 
            ? { ...item, status: 'sold', soldPrice: parseFloat(soldPrice), soldAt: new Date().toISOString() }
            : item
        ));
        setShowSoldModal(false);
        setSelectedMarketplaceItemForActions(null);
        setSoldPrice('');
        alert('Item marked as sold successfully');
      } else {
        const errorData = await response.json();
        alert(`Error updating item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    }
  };


  const handleUpdateItem = async () => {
    if (!selectedMarketplaceItemForActions) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/${selectedMarketplaceItemForActions._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(marketplaceEditForm)
      });

      if (response.ok) {
        // Update item in local state
        setMarketplaceItems(prev => prev.map(item => 
          item._id === selectedMarketplaceItemForActions._id 
            ? { ...item, ...marketplaceEditForm, updatedAt: new Date().toISOString() }
            : item
        ));
        setShowEditModal(false);
        setSelectedMarketplaceItemForActions(null);
        setMarketplaceEditForm({
          title: '',
          description: '',
          price: '',
          category: '',
          condition: '',
          location: '',
          brand: '',
          size: ''
        });
        alert('Item updated successfully');
      } else {
        const errorData = await response.json();
        alert(`Error updating item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item. Please try again.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setEditForm(f => ({
        ...f,
        preferences: {
          ...f.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditSuccess("");
    setEditError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setUser(data);
      setEditSuccess("Profile updated successfully!");
      setEditMode(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      setEditError(err.message);
      toast.error("Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };


  const handleExportData = () => {
    const userData = {
      profile: user,
      applications: applications,
      marketplaceItems: marketplaceItems,
      galleryItems: galleryItems,
      payments: payments,
      favorites: favorites,
      stats: stats,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seattle-leopards-account-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.")) {
      if (window.confirm("This is your final warning. Are you absolutely sure you want to delete your account?")) {
        // Here you would typically make an API call to delete the account
        toast.error("Account deletion is not implemented yet. Please contact support.");
      }
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notificationSettings),
      });

      if (response.ok) {
        toast.success("Notification settings saved successfully!");
      } else {
        toast.error("Failed to save notification settings");
      }
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Error saving notification settings");
    }
  };

  const handleSaveAccountSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/account-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountSettings),
      });

      if (response.ok) {
        toast.success("Account settings saved successfully!");
      } else {
        toast.error("Failed to save account settings");
      }
    } catch (error) {
      console.error("Error saving account settings:", error);
      toast.error("Error saving account settings");
    }
  };

  const handleSaveBackupSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/backup-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backupSettings),
      });

      if (response.ok) {
        toast.success("Backup settings saved successfully!");
      } else {
        toast.error("Failed to save backup settings");
      }
    } catch (error) {
      console.error("Error saving backup settings:", error);
      toast.error("Error saving backup settings");
    }
  };

  const handleUpgradeSubscription = () => {
    // TODO: Implement subscription upgrade
    toast.info("Subscription upgrade feature will be implemented soon.");
  };

  const handleCreateBackup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/create-backup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBackupSettings(prev => ({
          ...prev,
          lastBackup: new Date().toISOString()
        }));
        toast.success("Backup created successfully!");
      } else {
        toast.error("Failed to create backup");
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Error creating backup");
    }
  };

  const handleRevokeDevice = async (deviceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/devices/${deviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDeviceManagement(prev => ({
          ...prev,
          activeDevices: prev.activeDevices.filter(device => device.id !== deviceId)
        }));
        toast.success("Device revoked successfully!");
      } else {
        toast.error("Failed to revoke device");
      }
    } catch (error) {
      console.error("Error revoking device:", error);
      toast.error("Error revoking device");
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `API Key ${new Date().toLocaleDateString()}`,
          permissions: ['read']
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(prev => [...prev, data.apiKey]);
        toast.success("API key generated successfully!");
      } else {
        toast.error("Failed to generate API key");
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      toast.error("Error generating API key");
    }
  };

  const handleRevokeApiKey = async (keyId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/users/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        toast.success("API key revoked successfully!");
      } else {
        toast.error("Failed to revoke API key");
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
      toast.error("Error revoking API key");
    }
  };

  const handleCreateWebhook = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: "https://example.com/webhook",
          events: ['user.login', 'user.logout'],
          secret: "webhook-secret"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhooks(prev => [...prev, data.webhook]);
        toast.success("Webhook created successfully!");
      } else {
        toast.error("Failed to create webhook");
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast.error("Error creating webhook");
    }
  };

  const handleExportAnalytics = () => {
    const analyticsData = {
      loginFrequency: dataAnalytics.loginFrequency,
      activityPatterns: dataAnalytics.activityPatterns,
      usageStats: dataAnalytics.usageStats,
      performanceMetrics: dataAnalytics.performanceMetrics,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Analytics data exported successfully!");
  };

  const handleToggleDarkMode = () => {
    setModernFeatures(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
    // Apply dark mode to document
    if (modernFeatures.darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    toast.success(`Dark mode ${modernFeatures.darkMode ? 'disabled' : 'enabled'}!`);
  };

  const handleAiChat = async (message) => {
    setAiAssistant(prev => ({
      ...prev,
      isTyping: true,
      chatHistory: [...prev.chatHistory, { type: 'user', message, timestamp: new Date() }]
    }));

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you optimize your account settings for better performance.",
        "Based on your activity patterns, I recommend enabling two-factor authentication.",
        "Your account security score is excellent! Keep up the good work.",
        "I notice you haven't updated your profile recently. Would you like me to help?",
        "Your productivity index is high! Consider exploring our advanced features."
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      setAiAssistant(prev => ({
        ...prev,
        isTyping: false,
        chatHistory: [...prev.chatHistory, { type: 'ai', message: response, timestamp: new Date() }]
      }));
    }, 2000);
  };

  const handleGenerateInsights = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users/generate-insights", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSmartInsights(prev => ({
          ...prev,
          recommendations: data.recommendations || [],
          trends: data.trends || [],
          predictions: data.predictions || []
        }));
        toast.success("Smart insights generated successfully!");
      } else {
        // Fallback to simulated insights
        setSmartInsights(prev => ({
          ...prev,
          recommendations: [
            "Enable two-factor authentication for enhanced security",
            "Update your profile picture to increase engagement",
            "Consider upgrading to Premium for advanced features"
          ],
          trends: [
            "Your login frequency has increased by 15% this month",
            "You're most active on Tuesday afternoons",
            "Your productivity score is above average"
          ],
          predictions: [
            "You'll likely reach 100 logins by month-end",
            "Your engagement level will remain high",
            "Consider exploring new features next week"
          ]
        }));
        toast.success("Smart insights generated successfully!");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Error generating insights");
    }
  };

  const handleVoiceCommand = () => {
    if ('speechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        if (command.includes('profile')) {
          setActiveTab('profile');
          toast.success("Navigating to profile...");
        } else if (command.includes('security')) {
          setActiveTab('security');
          toast.success("Navigating to security...");
        } else if (command.includes('analytics')) {
          setActiveTab('analytics');
          toast.success("Navigating to analytics...");
        }
      };
      
      recognition.start();
      toast.info("Listening for voice commands...");
    } else {
      toast.error("Voice recognition not supported in this browser");
    }
  };

  const handleHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
      toast.success("Haptic feedback activated!");
    } else {
      toast.info("Haptic feedback not supported on this device");
    }
  };

  // Marketplace management functions
  const handlePromoteItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/marketplace/promote/${itemId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to promote item");
      
      toast.success("Item promoted successfully!");
      // Refresh marketplace items
      const marketplaceRes = await fetch("http://localhost:5000/api/marketplace/my-items", {
        headers: { Authorization: `Bearer ${token}` },
      });
        if (marketplaceRes.ok) {
          const marketplaceData = await marketplaceRes.json();
          setMarketplaceItems(marketplaceData.items || marketplaceData);
      }
    } catch (err) {
      toast.error("Failed to promote item");
    }
  };

  const handleBoostItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/marketplace/boost/${itemId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to boost item");
      
      toast.success("Item boosted successfully!");
    } catch (err) {
      toast.error("Failed to boost item");
    }
  };

  const handleViewItemAnalytics = (item) => {
    setSelectedMarketplaceItem(item);
    setShowMarketplaceModal(true);
  };

  const handleEditItem = (item) => {
    // Set the selected item and populate edit form
    setSelectedMarketplaceItemForActions(item);
    setMarketplaceEditForm({
      title: item.title || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || '',
      condition: item.condition || '',
      location: item.location || '',
      brand: item.brand || '',
      size: item.size || ''
    });
    setShowEditModal(true);
  };

  const handleDuplicateItem = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/marketplace/duplicate/${item._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to duplicate item");
      
      toast.success("Item duplicated successfully!");
      // Refresh marketplace items
      const marketplaceRes = await fetch("http://localhost:5000/api/marketplace/my-items", {
        headers: { Authorization: `Bearer ${token}` },
      });
        if (marketplaceRes.ok) {
          const marketplaceData = await marketplaceRes.json();
          setMarketplaceItems(marketplaceData.items || marketplaceData);
      }
    } catch (err) {
      toast.error("Failed to duplicate item");
    }
  };

  const handleMarkAsSoldTable = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/marketplace/sold/${itemId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to mark as sold");
      
      toast.success("Item marked as sold!");
      setMarketplaceItems(prev => prev.map(item => 
        item._id === itemId ? { ...item, status: 'sold' } : item
      ));
    } catch (err) {
      toast.error("Failed to mark as sold");
    }
  };


  // Filter and sort marketplace items
  const filteredMarketplaceItems = marketplaceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                         item.description?.toLowerCase().includes(marketplaceSearch.toLowerCase());
    const matchesFilter = marketplaceFilter === 'all' || item.status === marketplaceFilter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (marketplaceSort) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'price_high':
        return b.price - a.price;
      case 'price_low':
        return a.price - b.price;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/marketplace/user/delete/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to delete item");
      
      setMarketplaceItems(prev => prev.filter(item => item._id !== itemId));
      toast.success("Item deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationTypeLabel = (type) => {
    const labels = {
      'player': 'Player',
      'coach': 'Coach', 
      'referee': 'Referee',
      'volunteer': 'Volunteer'
    };
    return labels[type] || type;
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const initials = getInitials(user.name);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-green-100">@{user.username} • {user.email}</p>
                <p className="text-green-200 text-sm">Member since {stats.memberSince}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donated</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalDonations.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <span className="text-2xl">🛒</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Marketplace Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <span className="text-2xl">📸</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gallery Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGalleryItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 px-4 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: '🏠' },
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'applications', label: 'Applications', icon: '📝' },
                { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
                { id: 'gallery', label: 'Gallery', icon: '📸' },
                { id: 'payments', label: 'Payments', icon: '💰' },
                { id: 'favorites', label: 'Favorites', icon: '❤️' },
                { id: 'activity', label: 'Activity', icon: '📊' },
                { id: 'security', label: 'Security', icon: '🔒' },
                { id: 'privacy', label: 'Privacy', icon: '🛡️' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'preferences', label: 'Preferences', icon: '🎨' },
                { id: 'backup', label: 'Backup', icon: '💾' },
                { id: 'subscription', label: 'Subscription', icon: '💎' },
                { id: 'devices', label: 'Devices', icon: '📱' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'api', label: 'API & Integrations', icon: '🔌' },
                { id: 'insights', label: 'Smart Insights', icon: '🧠' },
                { id: 'ai', label: 'AI Assistant', icon: '🤖' },
                { id: 'modern', label: 'Modern Features', icon: '✨' },
                { id: 'announcements', label: 'Announcements', icon: '📢', badge: unreadBroadcasts },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-x-hidden">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Member'}!</h2>
                  <p className="text-green-100">Here's what's happening with your account today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <span className="text-2xl">📝</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-green-600 font-medium">+{applications.filter(app => new Date(app.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length} this month</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Marketplace Items</p>
                        <p className="text-2xl font-bold text-gray-900">{marketplaceItems.length}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <span className="text-2xl">🛒</span>
                      </div>
                      </div>
                    <div className="mt-4">
                      <span className="text-sm text-green-600 font-medium">{marketplaceItems.filter(item => item.status === 'active').length} active listings</span>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Gallery Photos</p>
                        <p className="text-2xl font-bold text-gray-900">{galleryItems.length}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <span className="text-2xl">📸</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-green-600 font-medium">{galleryItems.filter(item => new Date(item.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length} this week</span>
                  </div>
                </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                <div>
                        <p className="text-sm font-medium text-gray-600">Account Status</p>
                        <p className="text-2xl font-bold text-green-600">Active</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-gray-600">Member since {stats.memberSince}</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity */}
                  <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {applications.slice(0, 3).map(app => (
                        <div key={app._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600">📝</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{getApplicationTypeLabel(app.type)} Application</p>
                            <p className="text-sm text-gray-600">Status: {app.status}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {marketplaceItems.slice(0, 3).map(item => (
                        <div key={item._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600">📦</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.title}</p>
                            <p className="text-sm text-gray-600">Status: {item.status}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {galleryItems.slice(0, 2).map(item => (
                        <div key={item._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600">📸</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Photo uploaded</p>
                            <p className="text-sm text-gray-600">{item.title || 'Untitled photo'}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {applications.length === 0 && marketplaceItems.length === 0 && galleryItems.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl text-gray-400">📊</span>
                          </div>
                          <p className="text-gray-500">No recent activity</p>
                          <p className="text-sm text-gray-400">Start by applying for a position or posting an item!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions & Notifications */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button 
                          onClick={() => setActiveTab('profile')}
                          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2"
                        >
                          <span>👤</span>
                          <span>Update Profile</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('applications')}
                          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                        >
                          <span>📝</span>
                          <span>View Applications</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('marketplace')}
                          className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center space-x-2"
                        >
                          <span>🛒</span>
                          <span>Manage Marketplace</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('gallery')}
                          className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-pink-700 transition flex items-center justify-center space-x-2"
                        >
                          <span>📸</span>
                          <span>Upload Photos</span>
                        </button>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">New message from admin</span>
                        </div>
                        <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Application status updated</span>
                        </div>
                        <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">Payment reminder</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('notifications')}
                        className="w-full mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        Manage Notifications →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Health */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-green-600">🔒</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Security</h4>
                      <p className="text-sm text-gray-600">Strong password enabled</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">85%</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-blue-600">📊</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Profile Completeness</h4>
                      <p className="text-sm text-gray-600">Most information provided</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">70%</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl text-purple-600">🎯</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Engagement</h4>
                      <p className="text-sm text-gray-600">Very active member</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                        <span className="text-xs text-gray-500">95%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input 
                          name="name" 
                          value={editForm.name} 
                          onChange={handleEditChange} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <input 
                          name="username" 
                          value={editForm.username} 
                          onChange={handleEditChange} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input 
                          name="email" 
                          type="email"
                          value={editForm.email} 
                          onChange={handleEditChange} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input 
                          name="phone" 
                          type="tel"
                          value={editForm.phone} 
                          onChange={handleEditChange} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input 
                          name="address" 
                          value={editForm.address} 
                          onChange={handleEditChange} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                        <input 
                          name="emergencyContact" 
                          value={editForm.emergencyContact} 
                          onChange={handleEditChange} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medical Information</label>
                      <textarea 
                        name="medicalInfo" 
                        value={editForm.medicalInfo} 
                        onChange={handleEditChange} 
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        placeholder="Any medical conditions, allergies, or special needs..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input 
                        name="password" 
                        type="password" 
                        value={editForm.password} 
                        onChange={handleEditChange} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                        placeholder="Leave blank to keep current password"
                      />
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Preferences</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            name="preferences.notifications"
                            checked={editForm.preferences.notifications}
                            onChange={handleEditChange}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            name="preferences.newsletter"
                            checked={editForm.preferences.newsletter}
                            onChange={handleEditChange}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Newsletter</span>
                        </label>
                        <label className="flex items-center">
                          <input 
                            type="checkbox" 
                            name="preferences.marketing"
                            checked={editForm.preferences.marketing}
                            onChange={handleEditChange}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Marketing communications</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="submit" 
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition" 
                        disabled={editLoading}
                      >
                        {editLoading ? "Saving..." : "Save Changes"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditMode(false)} 
                        className="bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    {editSuccess && <div className="text-green-700 text-sm">{editSuccess}</div>}
                    {editError && <div className="text-red-600 text-sm">{editError}</div>}
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Full Name</span>
                          <p className="text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Username</span>
                          <p className="text-gray-900">@{user.username}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Email</span>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Phone</span>
                          <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Address</span>
                          <p className="text-gray-900">{user.address || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency & Medical</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Emergency Contact</span>
                          <p className="text-gray-900">{user.emergencyContact || 'Not provided'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Medical Information</span>
                          <p className="text-gray-900">{user.medicalInfo || 'None provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Applications</h3>
                  <div className="flex gap-2">
                    <Link 
                      to="/join/player" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                    >
                      Apply as Player
                    </Link>
                    <Link 
                      to="/join/coach" 
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition text-sm"
                    >
                      Apply as Coach
                    </Link>
                    <Link 
                      to="/join/referee" 
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                    >
                      Apply as Referee
                    </Link>
                    <Link 
                      to="/join/volunteer" 
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-700 transition text-sm"
                    >
                      Apply as Volunteer
                    </Link>
                  </div>
                </div>
                
                {applications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications submitted yet</h3>
                    <p className="text-gray-500 mb-4">Click one of the buttons above to submit your first application!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-4 text-left font-semibold text-gray-900">Type</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Status</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Submitted</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map(app => (
                          <tr key={app._id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="p-4">
                              <span className="font-semibold text-gray-900">{getApplicationTypeLabel(app.type)}</span>
                            </td>
                            <td className="p-4">
                              <span className={`capitalize font-semibold px-3 py-1 rounded-full text-xs ${getApplicationStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              {app.actionReason ? (
                                <div className="text-sm">
                                  <div className="font-semibold text-gray-900">{app.status === 'approved' ? 'Approved' : 'Denied'}</div>
                                  <div className="text-gray-600">{app.actionReason}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Pending review</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'marketplace' && (
              <div>
                {/* Marketplace Header with Stats */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {showAllMarketplaceItems ? 'Marketplace' : 'My Marketplace'}
                      </h3>
                      <p className="text-purple-100">
                        {showAllMarketplaceItems ? 'Browse all marketplace items' : 'Manage your listings, track performance, and grow your sales'}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={toggleMarketplaceView}
                        className={`px-4 py-2 rounded-lg transition-colors font-semibold ${
                          showAllMarketplaceItems 
                            ? 'bg-white text-purple-600 hover:bg-gray-100' 
                            : 'bg-purple-700 text-white'
                        }`}
                      >
                        {showAllMarketplaceItems ? 'Show My Items' : 'Show All Items'}
                      </button>
                    <Link 
                      to="/marketplace/post" 
                      className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2"
                    >
                      <span>➕</span>
                      <span>Post New Item</span>
                    </Link>
                    </div>
                  </div>
                  
                  {/* Marketplace Stats - Only show when viewing user's items */}
                  {!showAllMarketplaceItems && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="bg-white bg-opacity-10 rounded-lg p-3 border border-white border-opacity-20 backdrop-blur-sm hover:bg-opacity-15 transition-all duration-200">
                      <div className="text-xl font-bold text-white mb-1">{marketplaceItems.length}</div>
                      <div className="text-xs text-purple-200 font-medium uppercase tracking-wide">Total Listings</div>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded-lg p-3 border border-white border-opacity-20 backdrop-blur-sm hover:bg-opacity-15 transition-all duration-200">
                      <div className="text-xl font-bold text-white mb-1">{marketplaceItems.filter(item => item.status === 'active').length}</div>
                      <div className="text-xs text-purple-200 font-medium uppercase tracking-wide">Active</div>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded-lg p-3 border border-white border-opacity-20 backdrop-blur-sm hover:bg-opacity-15 transition-all duration-200">
                      <div className="text-xl font-bold text-white mb-1">{marketplaceItems.filter(item => item.status === 'sold').length}</div>
                      <div className="text-xs text-purple-200 font-medium uppercase tracking-wide">Sold</div>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded-lg p-3 border border-white border-opacity-20 backdrop-blur-sm hover:bg-opacity-15 transition-all duration-200">
                      <div className="text-xl font-bold text-white mb-1">${marketplaceItems.reduce((sum, item) => sum + (item.price || 0), 0).toLocaleString()}</div>
                      <div className="text-xs text-purple-200 font-medium uppercase tracking-wide">Total Value</div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Marketplace Sub-Tabs - Only show when viewing user's items */}
                {!showAllMarketplaceItems && (
                  <div className="bg-white border border-gray-200 rounded-lg mb-6 overflow-hidden">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-200">
                      <Link
                        to="/marketplace/my-offers"
                        className="py-4 px-4 hover:bg-green-50 transition-colors text-center group"
                      >
                        <div className="text-2xl mb-1">💰</div>
                        <div className="text-sm font-semibold text-gray-900">My Offers</div>
                        <div className="text-xs text-gray-500">Track your bids</div>
                      </Link>
                      
                      <Link
                        to="/marketplace/dashboard?tab=bought-items"
                        className="py-4 px-4 hover:bg-blue-50 transition-colors text-center group"
                      >
                        <div className="text-2xl mb-1">🛍️</div>
                        <div className="text-sm font-semibold text-gray-900">Bought Items</div>
                        <div className="text-xs text-gray-500">Your purchases</div>
                      </Link>
                      
                      <Link
                        to="/marketplace/dashboard?tab=my-reviews"
                        className="py-4 px-4 hover:bg-purple-50 transition-colors text-center group"
                      >
                        <div className="text-2xl mb-1">💬</div>
                        <div className="text-sm font-semibold text-gray-900">My Reviews</div>
                        <div className="text-xs text-gray-500">Reviews you wrote</div>
                      </Link>
                      
                      <button
                        onClick={async () => {
                          setShowReviewsSection(!showReviewsSection);
                          if (!showReviewsSection) {
                            // Fetch reviews and completed sales
                            const token = localStorage.getItem('token');
                            try {
                              // Fetch reviews received
                              const userId = user._id || user.id;
                              console.log('📊 Fetching reviews for user:', userId);
                              const response = await fetch(`http://localhost:5000/api/seller-ratings/seller/${userId}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (response.ok) {
                                const data = await response.json();
                                console.log('✅ Reviews fetched:', data);
                                setSellerReviews(data.ratings || data.reviews || []);
                              }
                              
                              // Fetch completed sales (where I'm the seller and buyer marked as received)
                              const salesResponse = await fetch('http://localhost:5000/api/marketplace-messages/my-sales', {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (salesResponse.ok) {
                                const salesData = await salesResponse.json();
                                console.log('💰 Completed sales:', salesData);
                                setCompletedSales(salesData);
                              }
                              
                              // Fetch buyer reviews (reviews I received as a buyer)
                              const buyerReviewsResponse = await fetch(`http://localhost:5000/api/buyer-ratings/buyer/${userId}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (buyerReviewsResponse.ok) {
                                const buyerData = await buyerReviewsResponse.json();
                                console.log('🛍️ Buyer reviews:', buyerData);
                                setBuyerReviews(buyerData.ratings || []);
                                toast.success(`Loaded ${(data.ratings || []).length} seller reviews, ${salesData.length} sales, ${(buyerData.ratings || []).length} buyer reviews`);
                              } else {
                                toast.success(`Loaded ${(data.ratings || []).length} seller reviews and ${salesData.length} sales`);
                              }
                            } catch (error) {
                              console.error('Error fetching data:', error);
                              toast.error('Error loading data');
                            }
                          }
                        }}
                        className="py-4 px-4 hover:bg-yellow-50 transition-colors text-center group w-full"
                      >
                        <div className="text-2xl mb-1">⭐</div>
                        <div className="text-sm font-semibold text-gray-900">Reviews Received</div>
                        <div className="text-xs text-gray-500">{sellerReviews.length + buyerReviews.length} total reviews</div>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Reviews Received Section */}
                {!showAllMarketplaceItems && showReviewsSection && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">All Reviews I Received</h3>
                      <button
                        onClick={() => setShowReviewsSection(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Reviews as a Seller */}
                    {sellerReviews.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-600 text-white">As Seller</span>
                          Reviews from Buyers
                        </h4>
                        <div className="space-y-4">
                          {sellerReviews.map((review) => (
                            <div key={review._id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                              <div className="flex items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-xl">
                                          {i < review.rating ? '⭐' : '☆'}
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                      {review.rating}/5
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>From:</strong> {review.reviewer?.username || review.reviewer?.name || 'Anonymous'}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Item:</strong> {review.marketplaceItem?.title}
                                  </p>
                                  {review.comment && (
                                    <p className="text-sm text-gray-700 italic mt-2 bg-white p-3 rounded border border-yellow-200">
                                      "{review.comment}"
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Buyer Reviews Received */}
                    {buyerReviews.length > 0 && (
                      <div className={sellerReviews.length > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">As Buyer</span>
                          Reviews from Sellers
                        </h4>
                        <div className="space-y-3">
                          {buyerReviews.map((review) => (
                            <div key={review._id} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-xl">
                                      {i < review.rating ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm font-semibold text-gray-700">
                                  {review.rating}/5
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>From Seller:</strong> {review.seller?.username || review.seller?.name || 'Anonymous'}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Item:</strong> {review.marketplaceItem?.title}
                              </p>
                              {review.comment && (
                                <p className="text-sm text-gray-700 italic mt-2 bg-white p-3 rounded border border-purple-200">
                                  "{review.comment}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* No reviews message */}
                    {sellerReviews.length === 0 && buyerReviews.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">⭐</div>
                        <p>No reviews received yet</p>
                        <p className="text-xs mt-1">Reviews from buyers and sellers will appear here</p>
                      </div>
                    )}
                    
                    {/* Rate Buyers Section */}
                    {completedSales.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Your Buyers</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Rate buyers who purchased and received your items
                        </p>
                        <div className="space-y-3">
                          {completedSales.map((sale) => (
                            <div key={sale._id} className="border border-blue-200 bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Buyer: {sale.sender?.username || sale.sender?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Item: {sale.item?.title}
                                </p>
                                <p className="text-sm text-green-600 font-medium">
                                  Sold for: ${sale.offerAmount}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Completed: {new Date(sale.receivedAt || sale.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                {!sale.sellerRated ? (
                                  <button
                                    onClick={() => {
                                      setSelectedBuyerToRate({
                                        buyerId: sale.sender?._id,
                                        buyerName: sale.sender?.username || sale.sender?.name,
                                        itemId: sale.item?._id,
                                        itemTitle: sale.item?.title,
                                        offerId: sale._id
                                      });
                                      setShowRateBuyerModal(true);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm"
                                  >
                                    ⭐ Rate Buyer
                                  </button>
                                ) : (
                                  <span className="text-sm text-green-600 font-medium">
                                    ✓ Rated
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Search and Filter Bar */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search your listings..."
                          value={marketplaceSearch}
                          onChange={(e) => setMarketplaceSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                      </div>
                    </div>
                    
                    {/* Filter */}
                    <select
                      value={marketplaceFilter}
                      onChange={(e) => setMarketplaceFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    
                    {/* Sort */}
                    <select
                      value={marketplaceSort}
                      onChange={(e) => setMarketplaceSort(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="title">Title A-Z</option>
                    </select>
                    
                    {/* View Toggle */}
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setMarketplaceView('grid')}
                        className={`px-3 py-2 ${marketplaceView === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        ⊞
                      </button>
                      <button
                        onClick={() => setMarketplaceView('list')}
                        className={`px-3 py-2 ${marketplaceView === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        ☰
                      </button>
                      <button
                        onClick={() => setMarketplaceView('table')}
                        className={`px-3 py-2 ${marketplaceView === 'table' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        ⚏
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marketplace Content */}
                {showAllMarketplaceItems ? (
                  // Show all marketplace items
                  allMarketplaceItemsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
                          <div className="h-48 bg-gray-200"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : allMarketplaceItems.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="text-8xl mb-6">🛒</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No items found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        No marketplace items are available at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allMarketplaceItems.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                          {/* Image */}
                          <div className="relative h-48 bg-gray-200">
                            {item.images && item.images.length > 0 ? (
                              <img
                                src={`http://localhost:5000/${item.images[0]}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-4xl">📦</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-bold text-green-600">${item.price?.toLocaleString() || '0'}</span>
                              <span className="text-sm text-gray-500">{item.category}</span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                              <span>By {item.seller?.name || 'Unknown'}</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                      <Link 
                              to={`/marketplace/item/${item._id}`}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                            >
                              View Details
                      </Link>
                    </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : marketplaceItems.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="text-8xl mb-6">📦</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No items found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      You haven't posted any items yet. Use the 'Post New Item' button above to get started!
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Results Count */}
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-gray-600">
                        Showing {filteredMarketplaceItems.length} of {marketplaceItems.length} listings
                      </p>
                      <div className="flex gap-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                          📊 Analytics
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                          📈 Promote All
                        </button>
                      </div>
                    </div>

                    {/* Grid View */}
                    {marketplaceView === 'grid' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredMarketplaceItems.map(item => (
                          <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex h-32">
                              {/* Image Container - Left Side */}
                              <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
                                {item.images && item.images[0] ? (
                                  <img 
                                    src={item.images[0].startsWith('http') ? 
                                      item.images[0] : 
                                      `http://localhost:5000${item.images[0]}`} 
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = '/placeholder-item.jpg';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400 bg-gray-100">
                                    📦
                                  </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className="absolute top-1 right-1">
                                  <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                                    item.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                
                                {/* Promoted Badge */}
                                {item.promoted && (
                                  <div className="absolute bottom-1 left-1">
                                    <span className="bg-purple-600 text-white px-1 py-0.5 rounded text-xs font-semibold">
                                      🔥
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Content - Right Side */}
                              <div className="flex-1 p-1 pl-2 flex flex-col justify-between min-w-0 overflow-hidden text-left">
                                {/* Top Section */}
                                <div className="flex-1 min-w-0 overflow-hidden w-full">
                                  {/* Title and Brand */}
                                  <div className="mb-1">
                                    {item.brand && (
                                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide block text-left">
                                        {item.brand}
                                      </span>
                                    )}
                                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight text-left" title={item.title}>
                                      {item.title}
                                    </h4>
                                  </div>

                                  {/* Size */}
                                  {item.size && (
                                    <div className="flex items-start gap-1 mb-1 flex-wrap">
                                      <span className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                                        {item.size}
                                      </span>
                                    </div>
                                  )}

                                  {/* Price */}
                                  <p className="text-sm font-bold text-green-600 text-left">
                                    ${item.price}
                                  </p>
                                </div>

                                {/* Bottom Section - Action Buttons */}
                                <div className="flex gap-0.5 w-full">
                                  <button
                                    onClick={() => handleViewItemAnalytics(item)}
                                    className="flex-1 bg-blue-600 text-white px-0.5 py-1 rounded text-xs font-medium hover:bg-blue-700 transition"
                                    title="View Analytics"
                                  >
                                    📊
                                  </button>
                                  <button
                                    onClick={() => handleEditItem(item)}
                                    className="flex-1 bg-gray-600 text-white px-0.5 py-1 rounded text-xs font-medium hover:bg-gray-700 transition"
                                    title="Edit Item"
                                  >
                                    ✏️
                                  </button>
                                  {item.status !== 'sold' && (
                                    <button
                                      onClick={() => {
                                        setSelectedMarketplaceItemForActions(item);
                                        setShowSoldModal(true);
                                      }}
                                      className="flex-1 bg-green-600 text-white px-0.5 py-1 rounded text-xs font-medium hover:bg-green-700 transition"
                                      title="Mark as Sold"
                                    >
                                      💰
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedMarketplaceItemForActions(item);
                                      setShowDeleteModal(true);
                                    }}
                                    className="flex-1 bg-red-600 text-white px-0.5 py-1 rounded text-xs font-medium hover:bg-red-700 transition"
                                    title="Delete Item"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* List View */}
                    {marketplaceView === 'list' && (
                      <div className="space-y-4">
                        {filteredMarketplaceItems.map(item => (
                          <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex gap-4">
                              {/* Item Image */}
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                                {item.image ? (
                                  <img 
                                    src={`http://localhost:5000${item.image}`} 
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                                    📦
                                  </div>
                                )}
                              </div>
                              
                              {/* Item Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-gray-900 truncate">{item.title}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                                    item.status === 'active' ? 'bg-green-100 text-green-800' :
                                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                                <div className="flex justify-between items-center">
                                  <span className="text-lg font-bold text-green-600">${item.price}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2">
                                <button
                                  onClick={() => handleViewItemAnalytics(item)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition"
                                >
                                  📊 Analytics
                                </button>
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-700 transition"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handlePromoteItem(item._id)}
                                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-purple-700 transition"
                                >
                                  🔥 Promote
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Table View */}
                    {marketplaceView === 'table' && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredMarketplaceItems.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 mr-3">
                                        {item.image ? (
                                          <img 
                                            src={`http://localhost:5000${item.image}`} 
                                            alt={item.title}
                                            className="w-full h-full object-cover rounded-lg"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                                            📦
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                        <div className="text-sm text-gray-500">{item.category}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-green-600">${item.price}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      item.status === 'active' ? 'bg-green-100 text-green-800' :
                                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      item.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.views || 0}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleViewItemAnalytics(item)}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        📊
                                      </button>
                                      <button
                                        onClick={() => handleEditItem(item)}
                                        className="text-gray-600 hover:text-gray-900"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={() => handlePromoteItem(item._id)}
                                        className="text-purple-600 hover:text-purple-900"
                                      >
                                        🔥
                                      </button>
                                      {item.status === 'active' && (
                                        <button
                                          onClick={() => handleMarkAsSoldTable(item._id)}
                                          className="text-green-600 hover:text-green-900"
                                        >
                                          ✅
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteItem(item._id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        🗑️
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
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedMarketplaceItemForActions && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Delete Item</h3>
                          <button
                            onClick={() => {
                              setShowDeleteModal(false);
                              setSelectedMarketplaceItemForActions(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to delete "{selectedMarketplaceItemForActions.title}"? This action cannot be undone.
                        </p>
                        
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => {
                              setShowDeleteModal(false);
                              setSelectedMarketplaceItemForActions(null);
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteMarketplaceItem}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mark as Sold Modal */}
                {showSoldModal && selectedMarketplaceItemForActions && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Mark as Sold</h3>
                          <button
                            onClick={() => {
                              setShowSoldModal(false);
                              setSelectedMarketplaceItemForActions(null);
                              setSoldPrice('');
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-600 mb-2">
                            Mark "{selectedMarketplaceItemForActions.title}" as sold:
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">$</span>
                            <input
                              type="number"
                              value={soldPrice}
                              onChange={(e) => setSoldPrice(e.target.value)}
                              placeholder="Enter sold price"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => {
                              setShowSoldModal(false);
                              setSelectedMarketplaceItemForActions(null);
                              setSoldPrice('');
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleMarkAsSoldMarketplace}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Mark as Sold
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Item Modal */}
                {showEditModal && selectedMarketplaceItemForActions && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Edit Item</h3>
                          <button
                            onClick={() => {
                              setShowEditModal(false);
                              setSelectedMarketplaceItemForActions(null);
                              setMarketplaceEditForm({
                                title: '',
                                description: '',
                                price: '',
                                category: '',
                                condition: '',
                                location: '',
                                brand: '',
                                size: ''
                              });
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Title */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              name="title"
                              value={marketplaceEditForm.title}
                              onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter item title"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              name="description"
                              value={marketplaceEditForm.description}
                              onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter item description"
                            />
                          </div>

                          {/* Price and Category */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                              <input
                                type="number"
                                name="price"
                                value={marketplaceEditForm.price}
                                onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, price: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select
                                name="category"
                                value={marketplaceEditForm.category}
                                onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select category</option>
                                {marketplaceCategories.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Condition and Location */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                              <select
                                name="condition"
                                value={marketplaceEditForm.condition}
                                onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, condition: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select condition</option>
                                <option value="new">New</option>
                                <option value="like-new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                              <input
                                type="text"
                                name="location"
                                value={marketplaceEditForm.location}
                                onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="City, State"
                              />
                            </div>
                          </div>

                          {/* Brand and Size */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                              <input
                                type="text"
                                name="brand"
                                value={marketplaceEditForm.brand}
                                onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, brand: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Brand name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                              <input
                                type="text"
                                name="size"
                                value={marketplaceEditForm.size}
                                onChange={(e) => setMarketplaceEditForm(prev => ({ ...prev, size: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Size"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 justify-end mt-6">
                          <button
                            onClick={() => {
                              setShowEditModal(false);
                              setSelectedMarketplaceItemForActions(null);
                              setMarketplaceEditForm({
                                title: '',
                                description: '',
                                price: '',
                                category: '',
                                condition: '',
                                location: '',
                                brand: '',
                                size: ''
                              });
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateItem}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Update Item
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Item Analytics Modal */}
                {showMarketplaceModal && selectedMarketplaceItemForAnalytics && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Item Analytics</h3>
                          <button
                            onClick={() => setShowMarketplaceModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="space-y-6">
                          {/* Item Info */}
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                              {selectedMarketplaceItemForAnalytics.image ? (
                                <img 
                                  src={`http://localhost:5000${selectedMarketplaceItemForAnalytics.image}`} 
                                  alt={selectedMarketplaceItemForActions.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                                  📦
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{selectedMarketplaceItemForActions.title}</h4>
                              <p className="text-sm text-gray-600">{selectedMarketplaceItemForAnalytics.category}</p>
                              <p className="text-lg font-bold text-green-600">${selectedMarketplaceItemForAnalytics.price}</p>
                            </div>
                          </div>
                          
                          {/* Analytics Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">{selectedMarketplaceItemForAnalytics.views || 0}</div>
                              <div className="text-sm text-blue-600">Views</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">{selectedMarketplaceItemForAnalytics.likes || 0}</div>
                              <div className="text-sm text-green-600">Likes</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-purple-600">{selectedMarketplaceItemForAnalytics.messages || 0}</div>
                              <div className="text-sm text-purple-600">Messages</div>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-orange-600">{selectedMarketplaceItemForAnalytics.shares || 0}</div>
                              <div className="text-sm text-orange-600">Shares</div>
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handlePromoteItem(selectedMarketplaceItemForAnalytics._id)}
                              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                            >
                              🔥 Promote Item
                            </button>
                            <button
                              onClick={() => handleBoostItem(selectedMarketplaceItemForAnalytics._id)}
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                              📈 Boost Visibility
                            </button>
                            <button
                              onClick={() => handleDuplicateItem(selectedMarketplaceItemForAnalytics)}
                              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
                            >
                              📋 Duplicate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Gallery Items</h3>
                  <Link 
                    to="/fans-gallery" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                  >
                    View Gallery
                  </Link>
                </div>
                
                {galleryItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">📸</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No gallery items posted yet</h3>
                    <p className="text-gray-500 mb-4">Share your soccer photos and memories with the community!</p>
                    <Link 
                      to="/fans-gallery" 
                      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Share Photos
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryItems.map(item => (
                      <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={`http://localhost:5000${item.url}`} 
                          alt={item.caption || 'Gallery item'}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <p className="font-medium text-gray-900">{item.caption || 'No caption'}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Payments</h3>
                  <Link 
                    to="/donate" 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                  >
                    Make Donation
                  </Link>
                </div>
                
                {payments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No payments found</h3>
                    <p className="text-gray-500 mb-4">Make your first donation to support Seattle Leopards FC!</p>
                    <Link 
                      to="/donate" 
                      className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Donate Now
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-4 text-left font-semibold text-gray-900">Amount</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Method</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Status</th>
                          <th className="p-4 text-left font-semibold text-gray-900">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p._id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="p-4 font-bold text-green-900">${p.amount.toFixed(2)}</td>
                            <td className="p-4">{p.method}</td>
                            <td className="p-4">
                              <span className={`capitalize font-semibold px-3 py-1 rounded-full text-xs ${
                                p.status === 'completed' ? 'bg-green-100 text-green-800' :
                                p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-gray-600">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">My Favorites</h3>
                
                {favorites.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">❤️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-500 mb-4">Start browsing the marketplace and save items you like!</p>
                    <Link 
                      to="/marketplace" 
                      className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                    >
                      Browse Marketplace
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(item => (
                      <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={item.images[0].startsWith('http') ? 
                            item.images[0] : 
                            `http://localhost:5000${item.images[0]}`} 
                          alt={item.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder-item.jpg';
                          }}
                        />
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-green-600 font-bold">${item.price}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Account Activity</h3>
                  <button 
                    onClick={() => setActivityLog([])}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition text-sm"
                  >
                    Clear Log
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Recent Activity</h4>
                    {activityLog.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-gray-500">No recent activity to display</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activityLog.map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <span className="text-lg">{activity.icon}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.action}</p>
                              <p className="text-sm text-gray-600">{activity.details}</p>
                            </div>
                            <span className="text-sm text-gray-500">{activity.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Login History</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Session</span>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Login</span>
                          <span className="text-gray-900">{stats.lastLogin}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Account Created</span>
                          <span className="text-gray-900">{stats.memberSince}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Account Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Applications</span>
                          <span className="text-gray-900 font-medium">{stats.totalApplications}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Marketplace Items</span>
                          <span className="text-gray-900 font-medium">{stats.totalItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Gallery Items</span>
                          <span className="text-gray-900 font-medium">{stats.totalGalleryItems}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Donations</span>
                          <span className="text-gray-900 font-medium">${stats.totalDonations.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            securitySettings.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <button className={`px-4 py-2 rounded-lg font-semibold transition ${
                            securitySettings.twoFactorEnabled 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}>
                            {securitySettings.twoFactorEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Login Notifications</h4>
                          <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={securitySettings.loginNotifications}
                            onChange={(e) => setSecuritySettings(prev => ({
                              ...prev,
                              loginNotifications: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Change Password</h4>
                          <p className="text-sm text-gray-600">Update your account password</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                          Change Password
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">Active Sessions</h4>
                          <p className="text-sm text-gray-600">Manage your active login sessions</p>
                        </div>
                        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition">
                          View Sessions
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Alerts</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-600 text-xl">⚠️</span>
                      <div>
                        <h4 className="font-medium text-yellow-900">Security Recommendations</h4>
                        <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                          <li>• Use a strong, unique password</li>
                          <li>• Enable two-factor authentication for better security</li>
                          <li>• Regularly review your login activity</li>
                          <li>• Log out from devices you no longer use</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Profile Visibility</h4>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input 
                              type="radio" 
                              name="profileVisibility"
                              value="public"
                              checked={privacySettings.profileVisibility === 'public'}
                              onChange={(e) => setPrivacySettings(prev => ({
                                ...prev,
                                profileVisibility: e.target.value
                              }))}
                              className="mr-3"
                            />
                            <span className="text-sm text-gray-700">Public - Anyone can see your profile</span>
                          </label>
                          <label className="flex items-center">
                            <input 
                              type="radio" 
                              name="profileVisibility"
                              value="members"
                              checked={privacySettings.profileVisibility === 'members'}
                              onChange={(e) => setPrivacySettings(prev => ({
                                ...prev,
                                profileVisibility: e.target.value
                              }))}
                              className="mr-3"
                            />
                            <span className="text-sm text-gray-700">Members Only - Only club members can see your profile</span>
                          </label>
                          <label className="flex items-center">
                            <input 
                              type="radio" 
                              name="profileVisibility"
                              value="private"
                              checked={privacySettings.profileVisibility === 'private'}
                              onChange={(e) => setPrivacySettings(prev => ({
                                ...prev,
                                profileVisibility: e.target.value
                              }))}
                              className="mr-3"
                            />
                            <span className="text-sm text-gray-700">Private - Only you can see your profile</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">Show Email Address</h4>
                            <p className="text-sm text-gray-600">Allow others to see your email address</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={privacySettings.showEmail}
                              onChange={(e) => setPrivacySettings(prev => ({
                                ...prev,
                                showEmail: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">Show Phone Number</h4>
                            <p className="text-sm text-gray-600">Allow others to see your phone number</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={privacySettings.showPhone}
                              onChange={(e) => setPrivacySettings(prev => ({
                                ...prev,
                                showPhone: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">Allow Messages</h4>
                            <p className="text-sm text-gray-600">Allow other members to send you messages</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={privacySettings.allowMessages}
                              onChange={(e) => setPrivacySettings(prev => ({
                                ...prev,
                                allowMessages: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 text-xl">ℹ️</span>
                      <div>
                        <h4 className="font-medium text-blue-900">Your Privacy Rights</h4>
                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                          <li>• You can request a copy of all your data</li>
                          <li>• You can request deletion of your account and data</li>
                          <li>• You can update your privacy preferences at any time</li>
                          <li>• We never sell your personal information to third parties</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Communication Channels</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-900">Email Notifications</h5>
                              <p className="text-sm text-gray-600">Receive notifications via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={notificationSettings.emailNotifications}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  emailNotifications: e.target.checked
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-900">Push Notifications</h5>
                              <p className="text-sm text-gray-600">Receive browser push notifications</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={notificationSettings.pushNotifications}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  pushNotifications: e.target.checked
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-900">SMS Notifications</h5>
                              <p className="text-sm text-gray-600">Receive text message notifications</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={notificationSettings.smsNotifications}
                                onChange={(e) => setNotificationSettings(prev => ({
                                  ...prev,
                                  smsNotifications: e.target.checked
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Notification Types</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { key: 'applicationUpdates', label: 'Application Updates', desc: 'Status changes for your applications' },
                            { key: 'paymentReminders', label: 'Payment Reminders', desc: 'Donation and payment notifications' },
                            { key: 'eventReminders', label: 'Event Reminders', desc: 'Upcoming games and events' },
                            { key: 'marketplaceUpdates', label: 'Marketplace Updates', desc: 'New items and messages' },
                            { key: 'teamUpdates', label: 'Team Updates', desc: 'Team news and announcements' },
                            { key: 'newsletter', label: 'Newsletter', desc: 'Club newsletter and updates' },
                            { key: 'marketing', label: 'Marketing', desc: 'Promotional offers and events' }
                          ].map(({ key, label, desc }) => (
                            <div key={key} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                              <div>
                                <h6 className="font-medium text-gray-900">{label}</h6>
                                <p className="text-sm text-gray-600">{desc}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={notificationSettings[key]}
                                  onChange={(e) => setNotificationSettings(prev => ({
                                    ...prev,
                                    [key]: e.target.checked
                                  }))}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={handleSaveNotificationSettings}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Appearance</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                          <select 
                            value={accountSettings.theme}
                            onChange={(e) => setAccountSettings(prev => ({
                              ...prev,
                              theme: e.target.value
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto (System)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                          <select 
                            value={accountSettings.language}
                            onChange={(e) => setAccountSettings(prev => ({
                              ...prev,
                              language: e.target.value
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Regional Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                          <select 
                            value={accountSettings.timezone}
                            onChange={(e) => setAccountSettings(prev => ({
                              ...prev,
                              timezone: e.target.value
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="UTC">UTC</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                          <select 
                            value={accountSettings.dateFormat}
                            onChange={(e) => setAccountSettings(prev => ({
                              ...prev,
                              dateFormat: e.target.value
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                          <select 
                            value={accountSettings.currency}
                            onChange={(e) => setAccountSettings(prev => ({
                              ...prev,
                              currency: e.target.value
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CAD">CAD (C$)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={handleSaveAccountSettings}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Backup & Recovery</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Backup Settings</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Automatic Backup</h5>
                            <p className="text-sm text-gray-600">Automatically backup your data</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={backupSettings.autoBackup}
                              onChange={(e) => setBackupSettings(prev => ({
                                ...prev,
                                autoBackup: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                          <select 
                            value={backupSettings.backupFrequency}
                            onChange={(e) => setBackupSettings(prev => ({
                              ...prev,
                              backupFrequency: e.target.value
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Cloud Storage</h5>
                            <p className="text-sm text-gray-600">Store backups in the cloud</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={backupSettings.cloudStorage}
                              onChange={(e) => setBackupSettings(prev => ({
                                ...prev,
                                cloudStorage: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Backup Actions</h4>
                      <div className="space-y-4">
                        <button 
                          onClick={handleExportData}
                          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          📥 Download Backup
                        </button>
                        
                        <button 
                          onClick={handleCreateBackup}
                          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                        >
                          ☁️ Create Backup
                        </button>
                        
                        <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                          🔄 Restore from Backup
                        </button>
                        
                        <div className="text-sm text-gray-600">
                          <p><strong>Last Backup:</strong> {backupSettings.lastBackup || 'Never'}</p>
                          <p><strong>Next Backup:</strong> {backupSettings.autoBackup ? 'Scheduled' : 'Not scheduled'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={handleSaveBackupSettings}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Save Backup Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription & Billing</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Current Plan</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Plan:</span>
                          <span className="font-semibold text-gray-900 capitalize">{subscriptionInfo.plan}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            subscriptionInfo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {subscriptionInfo.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Renewal Date:</span>
                          <span className="text-gray-900">{subscriptionInfo.renewalDate || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Available Plans</h4>
                      <div className="space-y-3">
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-gray-900">Free Plan</h5>
                            <span className="text-2xl font-bold text-gray-900">$0</span>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Basic account features</li>
                            <li>• Limited marketplace items</li>
                            <li>• Standard support</li>
                          </ul>
                          <button className="w-full mt-3 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition">
                            Current Plan
                          </button>
                        </div>

                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-gray-900">Premium Plan</h5>
                            <span className="text-2xl font-bold text-green-600">$9.99</span>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• All free features</li>
                            <li>• Unlimited marketplace items</li>
                            <li>• Priority support</li>
                            <li>• Advanced analytics</li>
                          </ul>
                          <button 
                            onClick={handleUpgradeSubscription}
                            className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                          >
                            Upgrade Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Management</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Active Devices</h4>
                      <div className="space-y-4">
                        {deviceManagement.activeDevices.length > 0 ? (
                          deviceManagement.activeDevices.map(device => (
                            <div key={device.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600">📱</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{device.name}</p>
                                  <p className="text-sm text-gray-600">{device.browser} on {device.os}</p>
                                  <p className="text-xs text-gray-500">Last active: {device.lastActive}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {device.current && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current</span>
                                )}
                                <button 
                                  onClick={() => handleRevokeDevice(device.id)}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                  Revoke
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl text-gray-400">📱</span>
                            </div>
                            <p className="text-gray-500">No active devices</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Login History</h4>
                      <div className="space-y-3">
                        {deviceManagement.loginHistory.length > 0 ? (
                          deviceManagement.loginHistory.slice(0, 5).map(login => (
                            <div key={login.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${login.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{login.location}</p>
                                  <p className="text-xs text-gray-600">{login.device}</p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">{login.timestamp}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm">No login history available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Security Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                        <select 
                          value={advancedSecurity.sessionTimeout}
                          onChange={(e) => setAdvancedSecurity(prev => ({
                            ...prev,
                            sessionTimeout: parseInt(e.target.value)
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={480}>8 hours</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">Require Re-authentication</h5>
                          <p className="text-sm text-gray-600">For sensitive operations</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={advancedSecurity.requireReauth}
                            onChange={(e) => setAdvancedSecurity(prev => ({
                              ...prev,
                              requireReauth: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Logins</p>
                          <p className="text-2xl font-bold text-gray-900">247</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                          <span className="text-2xl text-blue-600">🔐</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-green-600 font-medium">+12 this week</span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                          <p className="text-2xl font-bold text-gray-900">3</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                          <span className="text-2xl text-green-600">📱</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-gray-600">Across devices</span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Data Usage</p>
                          <p className="text-2xl font-bold text-gray-900">2.4GB</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                          <span className="text-2xl text-purple-600">📊</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-gray-600">This month</span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">API Calls</p>
                          <p className="text-2xl font-bold text-gray-900">1,234</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                          <span className="text-2xl text-yellow-600">🔌</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-green-600 font-medium">+89 today</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Activity Patterns</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Most Active Day</span>
                          <span className="font-medium text-gray-900">Tuesday</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Peak Hours</span>
                          <span className="font-medium text-gray-900">2:00 PM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Session</span>
                          <span className="font-medium text-gray-900">24 minutes</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Login Frequency</span>
                          <span className="font-medium text-gray-900">Daily</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Response Time</span>
                            <span className="text-sm font-medium text-gray-900">245ms</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Uptime</span>
                            <span className="text-sm font-medium text-gray-900">99.9%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '99%'}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Error Rate</span>
                            <span className="text-sm font-medium text-gray-900">0.1%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{width: '1%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button 
                      onClick={handleExportAnalytics}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Export Analytics Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API & Integrations</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">API Keys</h4>
                        <button 
                          onClick={handleGenerateApiKey}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"
                        >
                          Generate New Key
                        </button>
                      </div>
                      <div className="space-y-3">
                        {apiKeys.length > 0 ? (
                          apiKeys.map(key => (
                            <div key={key.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{key.name}</p>
                                <p className="text-sm text-gray-600">Created: {key.createdAt}</p>
                                <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                  {key.key.substring(0, 20)}...
                                </p>
                              </div>
                              <button 
                                onClick={() => handleRevokeApiKey(key.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Revoke
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl text-gray-400">🔑</span>
                            </div>
                            <p className="text-gray-500">No API keys generated</p>
                            <p className="text-sm text-gray-400">Generate your first API key to get started</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">Webhooks</h4>
                        <button 
                          onClick={handleCreateWebhook}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                        >
                          Create Webhook
                        </button>
                      </div>
                      <div className="space-y-3">
                        {webhooks.length > 0 ? (
                          webhooks.map(webhook => (
                            <div key={webhook.id} className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-900">{webhook.url}</p>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {webhook.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">Events: {webhook.events.join(', ')}</p>
                              <p className="text-xs text-gray-500">Last triggered: {webhook.lastTriggered || 'Never'}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl text-gray-400">🔗</span>
                            </div>
                            <p className="text-gray-500">No webhooks configured</p>
                            <p className="text-sm text-gray-400">Create webhooks to receive real-time updates</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Available Integrations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600">📧</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Email Service</h5>
                            <p className="text-sm text-gray-600">SendGrid</p>
                          </div>
                        </div>
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm">
                          Connect
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600">💾</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Cloud Storage</h5>
                            <p className="text-sm text-gray-600">AWS S3</p>
                          </div>
                        </div>
                        <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm">
                          Connect
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600">📊</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">Analytics</h5>
                            <p className="text-sm text-gray-600">Google Analytics</p>
                          </div>
                        </div>
                        <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Insights & AI Recommendations</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Performance Score</h4>
                        <span className="text-2xl font-bold text-green-600">{advancedMetrics.performanceScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{width: `${advancedMetrics.performanceScore}%`}}></div>
                      </div>
                      <p className="text-sm text-gray-600">Based on your activity and engagement</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Engagement Level</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          advancedMetrics.engagementLevel === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {advancedMetrics.engagementLevel}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Very active user</span>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Productivity Index</h4>
                        <span className="text-2xl font-bold text-blue-600">{advancedMetrics.productivityIndex}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{width: `${advancedMetrics.productivityIndex}%`}}></div>
                      </div>
                      <p className="text-sm text-gray-600">Excellent productivity metrics</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">AI Recommendations</h4>
                        <button 
                          onClick={handleGenerateInsights}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm"
                        >
                          Generate New
                        </button>
                      </div>
                      <div className="space-y-3">
                        {smartInsights.recommendations.length > 0 ? (
                          smartInsights.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <span className="text-purple-600">💡</span>
                              <p className="text-sm text-purple-800">{rec}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl text-purple-600">🧠</span>
                            </div>
                            <p className="text-gray-500">No recommendations yet</p>
                            <p className="text-sm text-gray-400">Generate AI-powered insights</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Trend Analysis</h4>
                      <div className="space-y-3">
                        {smartInsights.trends.length > 0 ? (
                          smartInsights.trends.map((trend, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <span className="text-blue-600">📈</span>
                              <p className="text-sm text-blue-800">{trend}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl text-blue-600">📊</span>
                            </div>
                            <p className="text-gray-500">No trends available</p>
                            <p className="text-sm text-gray-400">Generate insights to see trends</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Chat with AI Assistant</h4>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${aiAssistant.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          <span className="text-sm text-gray-600">{aiAssistant.enabled ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                      
                      <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        {aiAssistant.chatHistory.length > 0 ? (
                          aiAssistant.chatHistory.map((message, index) => (
                            <div key={index} className={`mb-3 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                              <div className={`inline-block max-w-xs p-3 rounded-lg ${
                                message.type === 'user' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white text-gray-900 border border-gray-200'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-2xl text-gray-400">🤖</span>
                            </div>
                            <p className="text-gray-500">Start a conversation with your AI assistant</p>
                          </div>
                        )}
                        
                        {aiAssistant.isTyping && (
                          <div className="text-left">
                            <div className="inline-block bg-white text-gray-900 border border-gray-200 p-3 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          placeholder="Ask your AI assistant..."
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              handleAiChat(e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Ask your AI assistant..."]');
                            if (input && input.value.trim()) {
                              handleAiChat(input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                        >
                          Send
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">AI Suggestions</h4>
                        <div className="space-y-3">
                          <button 
                            onClick={() => handleAiChat("Help me optimize my account settings")}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                          >
                            <p className="font-medium text-gray-900">Optimize Settings</p>
                            <p className="text-sm text-gray-600">Get personalized recommendations</p>
                          </button>
                          <button 
                            onClick={() => handleAiChat("Analyze my security settings")}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                          >
                            <p className="font-medium text-gray-900">Security Analysis</p>
                            <p className="text-sm text-gray-600">Review your security status</p>
                          </button>
                          <button 
                            onClick={() => handleAiChat("Show me my activity insights")}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                          >
                            <p className="font-medium text-gray-900">Activity Insights</p>
                            <p className="text-sm text-gray-600">Understand your usage patterns</p>
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-4">AI Capabilities</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-sm text-gray-700">Account optimization</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-sm text-gray-700">Security analysis</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-sm text-gray-700">Usage insights</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✅</span>
                            <span className="text-sm text-gray-700">Personalized recommendations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'modern' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Modern Features & Experience</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Visual Experience</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Dark Mode</h5>
                            <p className="text-sm text-gray-600">Switch to dark theme</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={modernFeatures.darkMode}
                              onChange={handleToggleDarkMode}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Animations</h5>
                            <p className="text-sm text-gray-600">Enable smooth transitions</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={modernFeatures.animations}
                              onChange={(e) => setModernFeatures(prev => ({
                                ...prev,
                                animations: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Sound Effects</h5>
                            <p className="text-sm text-gray-600">Audio feedback for actions</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={modernFeatures.soundEffects}
                              onChange={(e) => setModernFeatures(prev => ({
                                ...prev,
                                soundEffects: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Interactive Features</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Haptic Feedback</h5>
                            <p className="text-sm text-gray-600">Vibration feedback on mobile</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={modernFeatures.hapticFeedback}
                                onChange={(e) => setModernFeatures(prev => ({
                                  ...prev,
                                  hapticFeedback: e.target.checked
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                            <button 
                              onClick={handleHapticFeedback}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                              Test
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Voice Commands</h5>
                            <p className="text-sm text-gray-600">Navigate with voice</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={modernFeatures.voiceCommands}
                                onChange={(e) => setModernFeatures(prev => ({
                                  ...prev,
                                  voiceCommands: e.target.checked
                                }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                            <button 
                              onClick={handleVoiceCommand}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                              Try
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Gesture Controls</h5>
                            <p className="text-sm text-gray-600">Touch gestures for navigation</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={modernFeatures.gestureControls}
                              onChange={(e) => setModernFeatures(prev => ({
                                ...prev,
                                gestureControls: e.target.checked
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Real-time Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl text-green-600">🟢</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">Online Status</h5>
                        <p className="text-sm text-gray-600">Active now</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl text-blue-600">🔗</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">Connections</h5>
                        <p className="text-sm text-gray-600">{realTimeData.activeConnections} active</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl text-purple-600">⚡</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">Response Time</h5>
                        <p className="text-sm text-gray-600">45ms</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Club Announcements</h3>
                </div>
                <BroadcastMessages onBroadcastRead={fetchUnreadBroadcastsCount} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Account Management</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                            <h5 className="font-medium text-gray-900">Export Data</h5>
                            <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                        </div>
                          <button 
                            onClick={handleExportData}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                          >
                            Export
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                            <h5 className="font-medium text-gray-900">Change Username</h5>
                            <p className="text-sm text-gray-600">Update your username</p>
                        </div>
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm">
                            Change
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                            <h5 className="font-medium text-gray-900">Account Verification</h5>
                            <p className="text-sm text-gray-600">Verify your email address</p>
                        </div>
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm">
                            Verify
                        </button>
                      </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Email Notifications</h5>
                            <p className="text-sm text-gray-600">Receive updates via email</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editForm.preferences.notifications}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  notifications: e.target.checked
                                }
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Newsletter</h5>
                            <p className="text-sm text-gray-600">Club newsletter and updates</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editForm.preferences.newsletter}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  newsletter: e.target.checked
                                }
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">Marketing</h5>
                            <p className="text-sm text-gray-600">Promotional offers and events</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editForm.preferences.marketing}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  marketing: e.target.checked
                                }
                              }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
                    <h4 className="font-semibold text-red-900 mb-4">Danger Zone</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium text-red-900">Delete Account</h5>
                          <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                        </div>
                        <button 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Support</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <span className="text-2xl">📄</span>
                        <div className="text-left">
                          <h5 className="font-medium text-gray-900">Privacy Policy</h5>
                          <p className="text-sm text-gray-600">Read our privacy policy</p>
                        </div>
                      </button>
                      
                      <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <span className="text-2xl">📋</span>
                        <div className="text-left">
                          <h5 className="font-medium text-gray-900">Terms of Service</h5>
                          <p className="text-sm text-gray-600">Read our terms of service</p>
                        </div>
                      </button>
                      
                      <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <span className="text-2xl">🆘</span>
                        <div className="text-left">
                          <h5 className="font-medium text-gray-900">Help & Support</h5>
                          <p className="text-sm text-gray-600">Get help and support</p>
                        </div>
                      </button>
                      
                      <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <span className="text-2xl">📧</span>
                        <div className="text-left">
                          <h5 className="font-medium text-gray-900">Contact Us</h5>
                          <p className="text-sm text-gray-600">Send us a message</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {user.isSuperAdmin && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-yellow-900">Super Admin Dashboard</h4>
                          <p className="text-sm text-yellow-700">Access administrative functions and site management</p>
                        </div>
                        <Link 
                          to="/admin" 
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
                        >
                          Admin Dashboard
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Buyer Rating Modal */}
      {showRateBuyerModal && selectedBuyerToRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <BuyerRatingForm
              buyerId={selectedBuyerToRate.buyerId}
              itemId={selectedBuyerToRate.itemId}
              onClose={async () => {
                setShowRateBuyerModal(false);
                setSelectedBuyerToRate(null);
                
                // Refresh completed sales to update the rated status
                const token = localStorage.getItem('token');
                try {
                  const salesResponse = await fetch('http://localhost:5000/api/marketplace-messages/my-sales', {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  if (salesResponse.ok) {
                    const salesData = await salesResponse.json();
                    setCompletedSales(salesData);
                  }
                } catch (error) {
                  console.error('Error refreshing sales:', error);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 