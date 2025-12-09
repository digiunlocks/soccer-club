import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaStore, FaClock, FaCheckCircle, FaTimesCircle, FaFlag, FaStar,
  FaUser, FaDollarSign, FaChartLine, FaCog, FaTags, FaEye,
  FaComments, FaShieldAlt, FaExclamationTriangle, FaHistory,
  FaFilter, FaSearch, FaDownload, FaTrash, FaEdit, FaPlus,
  FaCalendarAlt, FaHeart, FaMapMarkerAlt, FaBox, FaBell,
  FaExchangeAlt, FaFileInvoiceDollar, FaUserShield
} from 'react-icons/fa';
import { API_BASE_URL } from '../config/api';

const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function UnifiedMarketplaceManager() {
  // Main navigation state
  const [activeModule, setActiveModule] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('pending');

  // Data states
  const [items, setItems] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [flags, setFlags] = useState([]);
  const [stats, setStats] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter & Selection states
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    dateRange: 'all',
    priceRange: { min: '', max: '' },
    hasFlags: false,
    hasReviews: false
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    postingFee: 0,
    renewalFee: 0,
    extensionFee: 0,
    featuredFee: 0,
    defaultExpirationDays: 90,
    maxExtensions: 3,
    subcategories: []
  });
  const [newSubcategory, setNewSubcategory] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Soccer Club Marketplace',
      siteDescription: 'Buy and sell soccer equipment',
      maintenanceMode: false,
      allowGuestBrowsing: true,
      requireEmailVerification: true,
      autoApproveListings: false,
      maxImagesPerListing: 10,
      minImageResolution: 800,
      allowNegotiablePrices: true,
      enableMessaging: true,
      enableOffers: true,
      enableFavorites: true,
      maxActiveListingsPerUser: 50,
      listingExpirationDays: 90,
      enableListingExtensions: true,
      maxListingExtensions: 3,
      extensionDays: 30
    },
    ratings: {
      enableRatings: true,
      ratingSystem: '5-star', // '5-star', '10-point', 'thumbs', 'percentage'
      allowSellerRatings: true,
      allowBuyerRatings: true,
      requireTransactionToRate: true,
      displayAverageRating: true,
      displayRatingCount: true,
      displayIndividualRatings: true,
      minRatingToDisplay: 1,
      hideUserNamesInRatings: false,
      allowRatingEdits: true,
      ratingEditWindow: 7, // days
      requireRatingComment: false,
      minCommentLength: 10,
      maxCommentLength: 500,
      enableRatingVerification: true,
      verifiedBadgeText: 'Verified Purchase',
      flagInappropriateRatings: true,
      autoHideNegativeRatings: false,
      negativeRatingThreshold: 2,
      displayRatingDistribution: true,
      enableHelpfulVotes: true,
      sortRatingsBy: 'recent', // 'recent', 'helpful', 'rating-high', 'rating-low'
      moderateRatingsBeforePublish: false
    },
    reviews: {
      enableReviews: true,
      requireTransactionToReview: false,
      allowAnonymousReviews: false,
      minReviewLength: 20,
      maxReviewLength: 2000,
      allowReviewEdits: true,
      reviewEditWindow: 14, // days
      enableReviewImages: true,
      maxReviewImages: 5,
      enableReviewVideos: false,
      moderateReviewsBeforePublish: true,
      autoApproveVerifiedBuyers: false,
      enableReviewReplies: true,
      allowSellerResponses: true,
      sellerResponseWindow: 30, // days
      enableReviewVoting: true,
      enableReviewReporting: true,
      displayReviewerStats: true,
      displayReviewDate: true,
      displayVerifiedBadge: true,
      sortReviewsBy: 'recent', // 'recent', 'helpful', 'rating'
      reviewsPerPage: 10,
      enableReviewFilters: true,
      showReviewSummary: true
    },
    moderation: {
      enableAutoModeration: true,
      profanityFilter: true,
      blockSuspiciousListings: true,
      requireManualApproval: false,
      flagThreshold: 3,
      autoRemoveThreshold: 10,
      enableImageModeration: true,
      blockExplicitContent: true,
      enableSpamDetection: true,
      enablePriceValidation: true,
      minPrice: 1,
      maxPrice: 100000,
      suspiciousPriceThreshold: 10000,
      blockDuplicateListings: true,
      duplicateDetectionMethod: 'title-image', // 'title', 'image', 'title-image'
      blockBannedWords: true,
      requirePhoneVerification: false,
      requireIdVerification: false,
      trustScoreEnabled: true,
      minTrustScoreToList: 0,
      banDuration: 30, // days
      warningBeforeBan: true,
      maxWarnings: 3
    },
    display: {
      listingsPerPage: 24,
      gridColumns: 4, // 2, 3, 4, 6
      showFeaturedListings: true,
      featuredListingsCount: 8,
      showRecentListings: true,
      recentListingsCount: 12,
      showTrendingListings: true,
      enableQuickView: true,
      showSellerInfo: true,
      showLocationInResults: true,
      showPriceInResults: true,
      showConditionInResults: true,
      showViewCount: true,
      showFavoriteCount: true,
      enableImageZoom: true,
      enableImageCarousel: true,
      defaultSortOrder: 'recent', // 'recent', 'price-low', 'price-high', 'popular'
      enableAdvancedFilters: true,
      showSimilarItems: true,
      similarItemsCount: 4,
      enableSocialSharing: true,
      showBreadcrumbs: true,
      enableWishlist: true,
      enableCompare: true,
      maxCompareItems: 4
    },
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableSMSNotifications: false,
      notifyOnNewListing: true,
      notifyOnPriceChange: true,
      notifyOnNewMessage: true,
      notifyOnNewOffer: true,
      notifyOnOfferAccepted: true,
      notifyOnItemSold: true,
      notifyOnItemExpiring: true,
      expirationWarningDays: 7,
      notifyOnNewReview: true,
      notifyOnNewRating: true,
      notifyOnItemFlagged: true,
      notifyOnLowInventory: false,
      notifyAdminOnSuspiciousActivity: true,
      dailyDigest: false,
      weeklyReport: true
    },
    fees: {
      enableListingFees: false,
      defaultPostingFee: 0,
      defaultRenewalFee: 0,
      defaultExtensionFee: 0,
      defaultFeaturedFee: 5,
      commissionEnabled: false,
      commissionPercentage: 10,
      commissionFlatFee: 0,
      freeListingsPerMonth: 3,
      enablePromotionalPricing: false,
      enableBulkDiscounts: false,
      paymentProcessor: 'stripe', // 'stripe', 'paypal', 'square'
      currency: 'USD',
      taxEnabled: false,
      taxRate: 0,
      enableRefunds: true,
      refundWindow: 30 // days
    },
    security: {
      enableRateLimiting: true,
      maxRequestsPerMinute: 60,
      enableCaptcha: true,
      captchaProvider: 'recaptcha', // 'recaptcha', 'hcaptcha'
      enableTwoFactorAuth: false,
      requireStrongPasswords: true,
      minPasswordLength: 8,
      sessionTimeout: 30, // minutes
      enableLoginAttemptLimiting: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15, // minutes
      enableIpBlocking: true,
      logSecurityEvents: true,
      enableDataEncryption: true,
      enableAuditLog: true,
      gdprCompliance: true,
      cookieConsent: true
    }
  });
  const [settingsActiveTab, setSettingsActiveTab] = useState('general');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Load data on mount and when active module changes
  useEffect(() => {
    loadData();
  }, [activeModule, activeSubTab, filters, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load based on active module
      if (activeModule === 'dashboard' || activeModule === 'items') {
        await loadItems(headers);
        await loadStats(headers);
      }
      if (activeModule === 'ratings' || activeModule === 'dashboard') {
        await loadRatings(headers);
      }
      if (activeModule === 'reviews' || activeModule === 'dashboard') {
        await loadReviews(headers);
      }
      if (activeModule === 'flags') {
        await loadFlags(headers);
      }
      if (activeModule === 'settings') {
        await loadSettings();
      }
      if (activeModule === 'categories') {
        await loadCategories(headers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (headers) => {
    try {
      const endpoint = activeSubTab === 'pending' 
        ? `${API_BASE_URL}/marketplace/admin/moderation-queue`
        : `${API_BASE_URL}/marketplace/admin/all?limit=1000`;
      
      const response = await fetch(endpoint, { headers });
      if (response.ok) {
        const data = await response.json();
        let itemsList = data.items || data;

        // Apply filters
        if (activeSubTab !== 'all') {
          itemsList = itemsList.filter(item => {
            switch(activeSubTab) {
              case 'pending': return item.status === 'pending' || item.status === 'flagged_for_review';
              case 'approved': return item.status === 'approved';
              case 'flagged': return item.flags?.length > 0 || item.status === 'flagged_for_review';
              case 'expired': return item.status === 'expired';
              case 'sold': return item.status === 'sold';
              default: return true;
            }
          });
        }

        setItems(itemsList);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadStats = async (headers) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/admin/all?limit=1000`, { headers });
      if (response.ok) {
        const data = await response.json();
        const allItems = data.items || data;

        const statsData = {
          totalItems: allItems.length,
          pending: allItems.filter(i => i.status === 'pending' || i.status === 'flagged_for_review').length,
          approved: allItems.filter(i => i.status === 'approved').length,
          flagged: allItems.filter(i => i.flags?.length > 0 || i.status === 'flagged_for_review').length,
          expired: allItems.filter(i => i.status === 'expired').length,
          sold: allItems.filter(i => i.status === 'sold').length,
          totalViews: allItems.reduce((sum, i) => sum + (i.views || 0), 0),
          totalFavorites: allItems.reduce((sum, i) => sum + (i.favorites?.length || 0), 0),
          totalRevenue: allItems.filter(i => i.status === 'sold').reduce((sum, i) => sum + (i.soldPrice || i.price || 0), 0),
          avgPrice: allItems.length > 0 ? allItems.reduce((sum, i) => sum + (i.price || 0), 0) / allItems.length : 0
        };

        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRatings = async (headers) => {
    try {
      const [sellerRes, buyerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/seller-ratings`, { headers }),
        fetch(`${API_BASE_URL}/buyer-ratings`, { headers })
      ]);

      const sellerRatings = sellerRes.ok ? await sellerRes.json() : [];
      const buyerRatings = buyerRes.ok ? await buyerRes.json() : [];

      setRatings({ seller: sellerRatings, buyer: buyerRatings });
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const loadReviews = async (headers) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace`, { headers });
      if (response.ok) {
        const data = await response.json();
        const allReviews = [];
        
        data.forEach(item => {
          if (item.reviews && item.reviews.length > 0) {
            item.reviews.forEach(review => {
              allReviews.push({ ...review, itemTitle: item.title, itemId: item._id });
            });
          }
        });

        setReviews(allReviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadFlags = async (headers) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/admin/flagged`, { headers });
      if (response.ok) {
        const data = await response.json();
        setFlags(data.items || data);
      }
    } catch (error) {
      console.error('Error loading flags:', error);
    }
  };

  const loadCategories = async (headers) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, { headers });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set default categories if API fails
      setCategories([
        { name: 'Soccer Balls', subcategories: ['Match Balls', 'Training Balls'], postingFee: 5, renewalFee: 3 },
        { name: 'Cleats', subcategories: ['Adult', 'Youth', 'Indoor'], postingFee: 8, renewalFee: 5 },
        { name: 'Jerseys', subcategories: ['Team Jerseys', 'Replica', 'Training'], postingFee: 6, renewalFee: 4 },
      ]);
    }
  };

  // Action handlers
  const handleApprove = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/admin/${itemId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Item approved successfully');
        loadData();
      } else {
        toast.error('Failed to approve item');
      }
    } catch (error) {
      console.error('Error approving item:', error);
      toast.error('Error approving item');
    }
  };

  const handleReject = async (itemId, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/admin/${itemId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Item rejected');
        loadData();
      } else {
        toast.error('Failed to reject item');
      }
    } catch (error) {
      console.error('Error rejecting item:', error);
      toast.error('Error rejecting item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        loadData();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items first');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedItems.length} item(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      for (const itemId of selectedItems) {
        if (action === 'approve') {
          await handleApprove(itemId);
        } else if (action === 'reject') {
          await handleReject(itemId);
        } else if (action === 'delete') {
          await handleDelete(itemId);
        }
      }

      setSelectedItems([]);
      toast.success(`Bulk ${action} completed`);
      loadData();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Error performing bulk action');
    }
  };

  // Category management handlers
  const handleSaveCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingCategory ? 'PUT' : 'POST';
      const endpoint = editingCategory 
        ? `${API_BASE_URL}/categories/${editingCategory._id}`
        : `${API_BASE_URL}/categories`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({
          name: '',
          description: '',
          postingFee: 0,
          renewalFee: 0,
          extensionFee: 0,
          featuredFee: 0,
          defaultExpirationDays: 90,
          maxExtensions: 3,
          subcategories: []
        });
        loadData();
      } else {
        toast.error('Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error saving category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        loadData();
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim()) {
      toast.warning('Please enter a subcategory name');
      return;
    }

    setCategoryForm({
      ...categoryForm,
      subcategories: [...categoryForm.subcategories, {
        name: newSubcategory,
        postingFee: categoryForm.postingFee,
        renewalFee: categoryForm.renewalFee,
        extensionFee: categoryForm.extensionFee
      }]
    });
    setNewSubcategory('');
  };

  const handleRemoveSubcategory = (index) => {
    setCategoryForm({
      ...categoryForm,
      subcategories: categoryForm.subcategories.filter((_, i) => i !== index)
    });
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || '',
      description: category.description || '',
      postingFee: category.postingFee || 0,
      renewalFee: category.renewalFee || 0,
      extensionFee: category.extensionFee || 0,
      featuredFee: category.featuredFee || 0,
      defaultExpirationDays: category.defaultExpirationDays || 90,
      maxExtensions: category.maxExtensions || 3,
      subcategories: category.subcategories || []
    });
    setShowCategoryModal(true);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      postingFee: 0,
      renewalFee: 0,
      extensionFee: 0,
      featuredFee: 0,
      defaultExpirationDays: 90,
      maxExtensions: 3,
      subcategories: []
    });
    setShowCategoryModal(true);
  };

  // Settings handlers
  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
        // Optionally reload settings
        loadSettings();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marketplace/settings/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      // Reset to default values
      setSettings({
        general: {
          siteName: 'Soccer Club Marketplace',
          siteDescription: 'Buy and sell soccer equipment',
          maintenanceMode: false,
          allowGuestBrowsing: true,
          requireEmailVerification: true,
          autoApproveListings: false,
          maxImagesPerListing: 10,
          minImageResolution: 800,
          allowNegotiablePrices: true,
          enableMessaging: true,
          enableOffers: true,
          enableFavorites: true,
          maxActiveListingsPerUser: 50,
          listingExpirationDays: 90,
          enableListingExtensions: true,
          maxListingExtensions: 3,
          extensionDays: 30
        },
        ratings: {
          enableRatings: true,
          ratingSystem: '5-star',
          allowSellerRatings: true,
          allowBuyerRatings: true,
          requireTransactionToRate: true,
          displayAverageRating: true,
          displayRatingCount: true,
          displayIndividualRatings: true,
          minRatingToDisplay: 1,
          hideUserNamesInRatings: false,
          allowRatingEdits: true,
          ratingEditWindow: 7,
          requireRatingComment: false,
          minCommentLength: 10,
          maxCommentLength: 500,
          enableRatingVerification: true,
          verifiedBadgeText: 'Verified Purchase',
          flagInappropriateRatings: true,
          autoHideNegativeRatings: false,
          negativeRatingThreshold: 2,
          displayRatingDistribution: true,
          enableHelpfulVotes: true,
          sortRatingsBy: 'recent',
          moderateRatingsBeforePublish: false
        },
        reviews: {
          enableReviews: true,
          requireTransactionToReview: false,
          allowAnonymousReviews: false,
          minReviewLength: 20,
          maxReviewLength: 2000,
          allowReviewEdits: true,
          reviewEditWindow: 14,
          enableReviewImages: true,
          maxReviewImages: 5,
          enableReviewVideos: false,
          moderateReviewsBeforePublish: true,
          autoApproveVerifiedBuyers: false,
          enableReviewReplies: true,
          allowSellerResponses: true,
          sellerResponseWindow: 30,
          enableReviewVoting: true,
          enableReviewReporting: true,
          displayReviewerStats: true,
          displayReviewDate: true,
          displayVerifiedBadge: true,
          sortReviewsBy: 'recent',
          reviewsPerPage: 10,
          enableReviewFilters: true,
          showReviewSummary: true
        },
        moderation: {
          enableAutoModeration: true,
          profanityFilter: true,
          blockSuspiciousListings: true,
          requireManualApproval: false,
          flagThreshold: 3,
          autoRemoveThreshold: 10,
          enableImageModeration: true,
          blockExplicitContent: true,
          enableSpamDetection: true,
          enablePriceValidation: true,
          minPrice: 1,
          maxPrice: 100000,
          suspiciousPriceThreshold: 10000,
          blockDuplicateListings: true,
          duplicateDetectionMethod: 'title-image',
          blockBannedWords: true,
          requirePhoneVerification: false,
          requireIdVerification: false,
          trustScoreEnabled: true,
          minTrustScoreToList: 0,
          banDuration: 30,
          warningBeforeBan: true,
          maxWarnings: 3
        },
        display: {
          listingsPerPage: 24,
          gridColumns: 4,
          showFeaturedListings: true,
          featuredListingsCount: 8,
          showRecentListings: true,
          recentListingsCount: 12,
          showTrendingListings: true,
          enableQuickView: true,
          showSellerInfo: true,
          showLocationInResults: true,
          showPriceInResults: true,
          showConditionInResults: true,
          showViewCount: true,
          showFavoriteCount: true,
          enableImageZoom: true,
          enableImageCarousel: true,
          defaultSortOrder: 'recent',
          enableAdvancedFilters: true,
          showSimilarItems: true,
          similarItemsCount: 4,
          enableSocialSharing: true,
          showBreadcrumbs: true,
          enableWishlist: true,
          enableCompare: true,
          maxCompareItems: 4
        },
        notifications: {
          enableEmailNotifications: true,
          enablePushNotifications: true,
          enableSMSNotifications: false,
          notifyOnNewListing: true,
          notifyOnPriceChange: true,
          notifyOnNewMessage: true,
          notifyOnNewOffer: true,
          notifyOnOfferAccepted: true,
          notifyOnItemSold: true,
          notifyOnItemExpiring: true,
          expirationWarningDays: 7,
          notifyOnNewReview: true,
          notifyOnNewRating: true,
          notifyOnItemFlagged: true,
          notifyOnLowInventory: false,
          notifyAdminOnSuspiciousActivity: true,
          dailyDigest: false,
          weeklyReport: true
        },
        fees: {
          enableListingFees: false,
          defaultPostingFee: 0,
          defaultRenewalFee: 0,
          defaultExtensionFee: 0,
          defaultFeaturedFee: 5,
          commissionEnabled: false,
          commissionPercentage: 10,
          commissionFlatFee: 0,
          freeListingsPerMonth: 3,
          enablePromotionalPricing: false,
          enableBulkDiscounts: false,
          paymentProcessor: 'stripe',
          currency: 'USD',
          taxEnabled: false,
          taxRate: 0,
          enableRefunds: true,
          refundWindow: 30
        },
        security: {
          enableRateLimiting: true,
          maxRequestsPerMinute: 60,
          enableCaptcha: true,
          captchaProvider: 'recaptcha',
          enableTwoFactorAuth: false,
          requireStrongPasswords: true,
          minPasswordLength: 8,
          sessionTimeout: 30,
          enableLoginAttemptLimiting: true,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          enableIpBlocking: true,
          logSecurityEvents: true,
          enableDataEncryption: true,
          enableAuditLog: true,
          gdprCompliance: true,
          cookieConsent: true
        }
      });
      toast.success('Settings reset to default');
    }
  };

  // Render functions for different modules
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaClock className="text-yellow-500" />}
          title="Pending Review"
          value={stats.pending || 0}
          subtitle="Needs attention"
          color="yellow"
          onClick={() => { setActiveModule('items'); setActiveSubTab('pending'); }}
          actionLabel="Review Now"
        />
        <StatCard
          icon={<FaCheckCircle className="text-green-500" />}
          title="Active Listings"
          value={stats.approved || 0}
          subtitle={`${stats.totalViews || 0} total views`}
          color="green"
        />
        <StatCard
          icon={<FaDollarSign className="text-blue-500" />}
          title="Total Revenue"
          value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
          subtitle={`${stats.sold || 0} items sold`}
          color="blue"
        />
        <StatCard
          icon={<FaFlag className="text-red-500" />}
          title="Flagged Items"
          value={stats.flagged || 0}
          subtitle="Requires moderation"
          color="red"
          onClick={() => { setActiveModule('items'); setActiveSubTab('flagged'); }}
          actionLabel={stats.flagged > 0 ? "Review Flags" : null}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaHistory className="text-gray-600" />
            Recent Items
          </h3>
          <div className="space-y-3">
            {items.slice(0, 5).map(item => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-gray-600" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <MetricRow label="Total Items" value={stats.totalItems || 0} />
            <MetricRow label="Approval Rate" value={`${stats.totalItems > 0 ? Math.round((stats.approved / stats.totalItems) * 100) : 0}%`} />
            <MetricRow label="Avg Views/Item" value={stats.totalItems > 0 ? Math.round((stats.totalViews || 0) / stats.totalItems) : 0} />
            <MetricRow label="Total Favorites" value={stats.totalFavorites || 0} />
            <MetricRow label="Avg Price" value={`$${(stats.avgPrice || 0).toFixed(2)}`} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderItems = () => (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'pending', label: 'Pending', count: stats.pending, icon: FaClock },
              { id: 'all', label: 'All Items', count: stats.totalItems, icon: FaBox },
              { id: 'approved', label: 'Approved', count: stats.approved, icon: FaCheckCircle },
              { id: 'flagged', label: 'Flagged', count: stats.flagged, icon: FaFlag },
              { id: 'expired', label: 'Expired', count: stats.expired, icon: FaCalendarAlt },
              { id: 'sold', label: 'Sold', count: stats.sold, icon: FaDollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeSubTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Approve All
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          ) : items.filter(item => 
            !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
          ).length === 0 ? (
            <div className="p-8 text-center">
              <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">No items match your current filters</p>
            </div>
          ) : (
            items.filter(item => 
              !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase())
            ).map(item => (
              <ItemRow
                key={item._id}
                item={item}
                selected={selectedItems.includes(item._id)}
                onSelect={(id) => {
                  if (selectedItems.includes(id)) {
                    setSelectedItems(selectedItems.filter(i => i !== id));
                  } else {
                    setSelectedItems([...selectedItems, id]);
                  }
                }}
                onApprove={() => handleApprove(item._id)}
                onReject={() => handleReject(item._id)}
                onDelete={() => handleDelete(item._id)}
                onView={() => { setSelectedItem(item); setShowItemDetails(true); }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderRatings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seller Ratings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaUserShield className="text-green-600" />
            Seller Ratings
          </h3>
          <div className="space-y-3">
            {ratings.seller && ratings.seller.length > 0 ? (
              ratings.seller.slice(0, 10).map((rating, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{rating.seller?.name || 'Unknown'}</span>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span className="font-bold">{rating.rating?.toFixed(1) || 0}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rating.review || 'No review'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No seller ratings yet</p>
            )}
          </div>
        </div>

        {/* Buyer Ratings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Buyer Ratings
          </h3>
          <div className="space-y-3">
            {ratings.buyer && ratings.buyer.length > 0 ? (
              ratings.buyer.slice(0, 10).map((rating, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{rating.buyer?.name || 'Unknown'}</span>
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      <span className="font-bold">{rating.rating?.toFixed(1) || 0}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rating.review || 'No review'}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No buyer ratings yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FaComments className="text-purple-600" />
        Marketplace Reviews
      </h3>
      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <div key={idx} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{review.itemTitle}</p>
                  <p className="text-sm text-gray-500">{review.user?.name || 'Anonymous'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-500" />
                  <span className="font-bold">{review.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet</p>
        )}
      </div>
    </div>
  );

  const renderFlags = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FaFlag className="text-red-600" />
        Flagged Content
      </h3>
      <div className="space-y-3">
        {flags.length > 0 ? (
          flags.map((item) => (
            <div key={item._id} className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.flags?.length || 0} flag(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(item._id)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {item.flags && item.flags.map((flag, idx) => (
                <div key={idx} className="mt-2 p-2 bg-white rounded text-sm">
                  <span className="font-medium">{flag.reason}</span>: {flag.description}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No flagged items</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaStore className="text-2xl text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Marketplace Management</h1>
                <p className="text-sm text-gray-600">Comprehensive marketplace control center</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FaExchangeAlt />
              Refresh
            </button>
          </div>

          {/* Module Navigation */}
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
              { id: 'items', label: 'Items', icon: FaBox, badge: stats.pending },
              { id: 'ratings', label: 'Ratings', icon: FaStar },
              { id: 'reviews', label: 'Reviews', icon: FaComments },
              { id: 'flags', label: 'Flags', icon: FaFlag, badge: stats.flagged },
              { id: 'categories', label: 'Categories', icon: FaTags },
              { id: 'settings', label: 'Settings', icon: FaCog }
            ].map(module => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors relative ${
                  activeModule === module.id
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <module.icon />
                {module.label}
                {module.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {module.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'items' && renderItems()}
        {activeModule === 'ratings' && renderRatings()}
        {activeModule === 'reviews' && renderReviews()}
        {activeModule === 'flags' && renderFlags()}
        {activeModule === 'categories' && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaTags className="text-green-600" />
                    Category & Fee Management
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Manage categories, subcategories, and pricing structure</p>
                </div>
                <button
                  onClick={openAddCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
                >
                  <FaPlus />
                  Add Category
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Categories</p>
                      <p className="text-2xl font-bold text-blue-900">{categories.length}</p>
                    </div>
                    <FaTags className="text-3xl text-blue-400" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Subcategories</p>
                      <p className="text-2xl font-bold text-green-900">
                        {categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0)}
                      </p>
                    </div>
                    <FaBox className="text-3xl text-green-400" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Avg Posting Fee</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ${categories.length > 0 ? (categories.reduce((sum, cat) => sum + (cat.postingFee || 0), 0) / categories.length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <FaDollarSign className="text-3xl text-purple-400" />
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Active Items</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.totalItems || 0}</p>
                    </div>
                    <FaBox className="text-3xl text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {/* Category Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditCategory(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Category"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id || index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Category"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Pricing Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600 font-medium mb-1">Posting Fee</p>
                          <p className="text-lg font-bold text-blue-900">${category.postingFee || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-600 font-medium mb-1">Renewal Fee</p>
                          <p className="text-lg font-bold text-green-900">${category.renewalFee || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-purple-600 font-medium mb-1">Extension Fee</p>
                          <p className="text-lg font-bold text-purple-900">${category.extensionFee || 0}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-orange-600 font-medium mb-1">Featured Fee</p>
                          <p className="text-lg font-bold text-orange-900">${category.featuredFee || 0}</p>
                        </div>
                      </div>

                      {/* Listing Settings */}
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Default Duration</span>
                          <span className="text-sm font-bold text-gray-900">{category.defaultExpirationDays || 90} days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Max Extensions</span>
                          <span className="text-sm font-bold text-gray-900">{category.maxExtensions || 3}</span>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Subcategories ({category.subcategories.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.slice(0, 5).map((sub, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                              >
                                {typeof sub === 'string' ? sub : sub.name}
                              </span>
                            ))}
                            {category.subcategories.length > 5 && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                                +{category.subcategories.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white rounded-lg shadow p-12 text-center">
                  <FaTags className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first category to start organizing marketplace items</p>
                  <button
                    onClick={openAddCategory}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    <FaPlus className="inline mr-2" />
                    Create First Category
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {activeModule === 'settings' && (
          <div className="space-y-6">
            {/* Settings Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaCog className="text-green-600" />
                    Marketplace Settings
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Configure all aspects of the marketplace</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetSettings}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    {settingsSaving ? 'Saving...' : 'Save All Settings'}
                  </button>
                </div>
              </div>

              {/* Settings Tabs */}
              <div className="border-b border-gray-200 mt-6">
                <nav className="flex space-x-8 overflow-x-auto">
                  {[
                    { id: 'general', label: 'General', icon: FaCog },
                    { id: 'ratings', label: 'Ratings System', icon: FaStar },
                    { id: 'reviews', label: 'Reviews', icon: FaComments },
                    { id: 'moderation', label: 'Moderation', icon: FaShieldAlt },
                    { id: 'display', label: 'Display', icon: FaEye },
                    { id: 'notifications', label: 'Notifications', icon: FaBell },
                    { id: 'fees', label: 'Fees & Payments', icon: FaDollarSign },
                    { id: 'security', label: 'Security', icon: FaUserShield },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        settingsActiveTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Settings Content */}
            <div className="bg-white rounded-lg shadow p-6">
              {/* General Settings */}
              {settingsActiveTab === 'general' && (
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">General Marketplace Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Images Per Listing</label>
                      <input
                        type="number"
                        value={settings.general.maxImagesPerListing}
                        onChange={(e) => handleSettingChange('general', 'maxImagesPerListing', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                      <textarea
                        value={settings.general.siteDescription}
                        onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Listing Expiration (days)</label>
                      <input
                        type="number"
                        value={settings.general.listingExpirationDays}
                        onChange={(e) => handleSettingChange('general', 'listingExpirationDays', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Active Listings Per User</label>
                      <input
                        type="number"
                        value={settings.general.maxActiveListingsPerUser}
                        onChange={(e) => handleSettingChange('general', 'maxActiveListingsPerUser', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Listing Extensions</label>
                      <input
                        type="number"
                        value={settings.general.maxListingExtensions}
                        onChange={(e) => handleSettingChange('general', 'maxListingExtensions', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Extension Duration (days)</label>
                      <input
                        type="number"
                        value={settings.general.extensionDays}
                        onChange={(e) => handleSettingChange('general', 'extensionDays', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h5 className="font-bold text-gray-900 mb-4">Feature Toggles</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { key: 'maintenanceMode', label: 'Maintenance Mode', dangerous: true },
                        { key: 'allowGuestBrowsing', label: 'Allow Guest Browsing' },
                        { key: 'requireEmailVerification', label: 'Require Email Verification' },
                        { key: 'autoApproveListings', label: 'Auto-Approve Listings' },
                        { key: 'allowNegotiablePrices', label: 'Allow Negotiable Prices' },
                        { key: 'enableMessaging', label: 'Enable Messaging' },
                        { key: 'enableOffers', label: 'Enable Offers' },
                        { key: 'enableFavorites', label: 'Enable Favorites' },
                        { key: 'enableListingExtensions', label: 'Enable Listing Extensions' },
                      ].map(toggle => (
                        <label key={toggle.key} className={`flex items-center gap-3 p-3 rounded-lg border ${toggle.dangerous ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} cursor-pointer hover:shadow`}>
                          <input
                            type="checkbox"
                            checked={settings.general[toggle.key]}
                            onChange={(e) => handleSettingChange('general', toggle.key, e.target.checked)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className={`text-sm font-medium ${toggle.dangerous ? 'text-red-700' : 'text-gray-700'}`}>
                            {toggle.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Ratings Settings */}
              {settingsActiveTab === 'ratings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold text-gray-900">Rating System Configuration</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${settings.ratings.enableRatings ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {settings.ratings.enableRatings ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating System Type</label>
                      <select
                        value={settings.ratings.ratingSystem}
                        onChange={(e) => handleSettingChange('ratings', 'ratingSystem', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="5-star">5-Star Rating</option>
                        <option value="10-point">10-Point Scale</option>
                        <option value="thumbs">Thumbs Up/Down</option>
                        <option value="percentage">Percentage (0-100%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Sort Order</label>
                      <select
                        value={settings.ratings.sortRatingsBy}
                        onChange={(e) => handleSettingChange('ratings', 'sortRatingsBy', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="rating-high">Highest Rating</option>
                        <option value="rating-low">Lowest Rating</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating to Display</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={settings.ratings.minRatingToDisplay}
                        onChange={(e) => handleSettingChange('ratings', 'minRatingToDisplay', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating Edit Window (days)</label>
                      <input
                        type="number"
                        value={settings.ratings.ratingEditWindow}
                        onChange={(e) => handleSettingChange('ratings', 'ratingEditWindow', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Comment Length</label>
                      <input
                        type="number"
                        value={settings.ratings.minCommentLength}
                        onChange={(e) => handleSettingChange('ratings', 'minCommentLength', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Comment Length</label>
                      <input
                        type="number"
                        value={settings.ratings.maxCommentLength}
                        onChange={(e) => handleSettingChange('ratings', 'maxCommentLength', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Negative Rating Threshold</label>
                      <input
                        type="number"
                        value={settings.ratings.negativeRatingThreshold}
                        onChange={(e) => handleSettingChange('ratings', 'negativeRatingThreshold', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ratings below this value are considered negative</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Verified Badge Text</label>
                      <input
                        type="text"
                        value={settings.ratings.verifiedBadgeText}
                        onChange={(e) => handleSettingChange('ratings', 'verifiedBadgeText', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h5 className="font-bold text-gray-900 mb-4">Rating Features</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { key: 'enableRatings', label: 'Enable Rating System' },
                        { key: 'allowSellerRatings', label: 'Allow Seller Ratings' },
                        { key: 'allowBuyerRatings', label: 'Allow Buyer Ratings' },
                        { key: 'requireTransactionToRate', label: 'Require Transaction to Rate' },
                        { key: 'displayAverageRating', label: 'Display Average Rating' },
                        { key: 'displayRatingCount', label: 'Display Rating Count' },
                        { key: 'displayIndividualRatings', label: 'Display Individual Ratings' },
                        { key: 'hideUserNamesInRatings', label: 'Hide User Names' },
                        { key: 'allowRatingEdits', label: 'Allow Rating Edits' },
                        { key: 'requireRatingComment', label: 'Require Rating Comment' },
                        { key: 'enableRatingVerification', label: 'Enable Verification Badge' },
                        { key: 'flagInappropriateRatings', label: 'Enable Rating Flagging' },
                        { key: 'autoHideNegativeRatings', label: 'Auto-Hide Negative Ratings' },
                        { key: 'displayRatingDistribution', label: 'Display Rating Distribution' },
                        { key: 'enableHelpfulVotes', label: 'Enable Helpful Votes' },
                        { key: 'moderateRatingsBeforePublish', label: 'Moderate Before Publishing' },
                      ].map(toggle => (
                        <label key={toggle.key} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200 cursor-pointer hover:shadow">
                          <input
                            type="checkbox"
                            checked={settings.ratings[toggle.key]}
                            onChange={(e) => handleSettingChange('ratings', toggle.key, e.target.checked)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{toggle.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Settings */}
              {settingsActiveTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold text-gray-900">Review System Configuration</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${settings.reviews.enableReviews ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {settings.reviews.enableReviews ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Review Length</label>
                      <input
                        type="number"
                        value={settings.reviews.minReviewLength}
                        onChange={(e) => handleSettingChange('reviews', 'minReviewLength', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Review Length</label>
                      <input
                        type="number"
                        value={settings.reviews.maxReviewLength}
                        onChange={(e) => handleSettingChange('reviews', 'maxReviewLength', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review Edit Window (days)</label>
                      <input
                        type="number"
                        value={settings.reviews.reviewEditWindow}
                        onChange={(e) => handleSettingChange('reviews', 'reviewEditWindow', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Review Images</label>
                      <input
                        type="number"
                        value={settings.reviews.maxReviewImages}
                        onChange={(e) => handleSettingChange('reviews', 'maxReviewImages', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seller Response Window (days)</label>
                      <input
                        type="number"
                        value={settings.reviews.sellerResponseWindow}
                        onChange={(e) => handleSettingChange('reviews', 'sellerResponseWindow', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reviews Per Page</label>
                      <input
                        type="number"
                        value={settings.reviews.reviewsPerPage}
                        onChange={(e) => handleSettingChange('reviews', 'reviewsPerPage', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Sort Order</label>
                      <select
                        value={settings.reviews.sortReviewsBy}
                        onChange={(e) => handleSettingChange('reviews', 'sortReviewsBy', e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="rating">Highest Rating</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h5 className="font-bold text-gray-900 mb-4">Review Features</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { key: 'enableReviews', label: 'Enable Review System' },
                        { key: 'requireTransactionToReview', label: 'Require Transaction to Review' },
                        { key: 'allowAnonymousReviews', label: 'Allow Anonymous Reviews' },
                        { key: 'allowReviewEdits', label: 'Allow Review Edits' },
                        { key: 'enableReviewImages', label: 'Enable Review Images' },
                        { key: 'enableReviewVideos', label: 'Enable Review Videos' },
                        { key: 'moderateReviewsBeforePublish', label: 'Moderate Before Publishing' },
                        { key: 'autoApproveVerifiedBuyers', label: 'Auto-Approve Verified Buyers' },
                        { key: 'enableReviewReplies', label: 'Enable Review Replies' },
                        { key: 'allowSellerResponses', label: 'Allow Seller Responses' },
                        { key: 'enableReviewVoting', label: 'Enable Review Voting' },
                        { key: 'enableReviewReporting', label: 'Enable Review Reporting' },
                        { key: 'displayReviewerStats', label: 'Display Reviewer Stats' },
                        { key: 'displayReviewDate', label: 'Display Review Date' },
                        { key: 'displayVerifiedBadge', label: 'Display Verified Badge' },
                        { key: 'enableReviewFilters', label: 'Enable Review Filters' },
                        { key: 'showReviewSummary', label: 'Show Review Summary' },
                      ].map(toggle => (
                        <label key={toggle.key} className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200 cursor-pointer hover:shadow">
                          <input
                            type="checkbox"
                            checked={settings.reviews[toggle.key]}
                            onChange={(e) => handleSettingChange('reviews', toggle.key, e.target.checked)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-sm font-medium text-gray-700">{toggle.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional tabs content would continue here... */}
              {settingsActiveTab === 'moderation' && (
                <div className="text-center py-12">
                  <FaShieldAlt className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Moderation settings will be implemented next...</p>
                </div>
              )}

              {settingsActiveTab === 'display' && (
                <div className="text-center py-12">
                  <FaEye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Display settings will be implemented next...</p>
                </div>
              )}

              {settingsActiveTab === 'notifications' && (
                <div className="text-center py-12">
                  <FaBell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Notification settings will be implemented next...</p>
                </div>
              )}

              {settingsActiveTab === 'fees' && (
                <div className="text-center py-12">
                  <FaDollarSign className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Fee settings will be implemented next...</p>
                </div>
              )}

              {settingsActiveTab === 'security' && (
                <div className="text-center py-12">
                  <FaUserShield className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Security settings will be implemented next...</p>
                </div>
              )}
            </div>

            {/* Save Button (Sticky at bottom) */}
            <div className="bg-white rounded-lg shadow p-4 sticky bottom-0 z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <FaExclamationTriangle className="inline text-yellow-500 mr-2" />
                  Changes will affect all marketplace users
                </p>
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50 shadow-lg"
                >
                  {settingsSaving ? 'Saving Changes...' : 'Save All Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {showItemDetails && selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setShowItemDetails(false)}
          onApprove={() => { handleApprove(selectedItem._id); setShowItemDetails(false); }}
          onReject={() => { handleReject(selectedItem._id); setShowItemDetails(false); }}
          onDelete={() => { handleDelete(selectedItem._id); setShowItemDetails(false); }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={categoryForm}
          setCategory={setCategoryForm}
          onSave={handleSaveCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          isEditing={!!editingCategory}
          newSubcategory={newSubcategory}
          setNewSubcategory={setNewSubcategory}
          onAddSubcategory={handleAddSubcategory}
          onRemoveSubcategory={handleRemoveSubcategory}
        />
      )}
    </div>
  );
}

// Helper Components
const StatCard = ({ icon, title, value, subtitle, color, onClick, actionLabel }) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
    <div className="flex items-center justify-between mb-3">
      <div className="text-3xl">{icon}</div>
      <div className="text-right">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
    {actionLabel && onClick && (
      <button
        onClick={onClick}
        className={`w-full mt-2 px-3 py-2 bg-${color}-500 text-white rounded-lg hover:bg-${color}-600 text-sm font-medium`}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    flagged: 'bg-orange-100 text-orange-800',
    expired: 'bg-gray-100 text-gray-800',
    sold: 'bg-blue-100 text-blue-800',
    flagged_for_review: 'bg-orange-100 text-orange-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const MetricRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

const ItemRow = ({ item, selected, onSelect, onApprove, onReject, onDelete, onView }) => (
  <div className="p-4 hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-4">
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item._id)}
        className="rounded"
      />
      <img 
        src={item.images?.[0] || '/placeholder.jpg'} 
        alt={item.title}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-600">{item.category} • ${item.price}</p>
            <p className="text-xs text-gray-500 mt-1">
              <FaUser className="inline mr-1" />
              {item.seller?.name || 'Unknown'} • 
              <FaEye className="inline mx-1" />
              {item.views || 0} views •
              <FaHeart className="inline mx-1" />
              {item.favorites?.length || 0} favorites
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
          title="View Details"
        >
          <FaEye />
        </button>
        {(item.status === 'pending' || item.status === 'flagged_for_review') && (
          <>
            <button
              onClick={onApprove}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
              title="Approve"
            >
              <FaCheckCircle />
            </button>
            <button
              onClick={onReject}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Reject"
            >
              <FaTimesCircle />
            </button>
          </>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-red-800 hover:bg-red-50 rounded-lg"
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
    {item.flags && item.flags.length > 0 && (
      <div className="mt-2 p-2 bg-orange-50 rounded text-sm flex items-center gap-2">
        <FaExclamationTriangle className="text-orange-600" />
        <span className="text-orange-800 font-medium">{item.flags.length} flag(s)</span>
      </div>
    )}
  </div>
);

const ItemDetailsModal = ({ item, onClose, onApprove, onReject, onDelete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{item.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle className="text-2xl" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img 
              src={item.images?.[0] || '/placeholder.jpg'} 
              alt={item.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {item.images?.slice(1, 5).map((img, idx) => (
                <img key={idx} src={img} alt="" className="w-full h-16 object-cover rounded" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-3xl font-bold text-green-600">${item.price}</span>
              {item.isNegotiable && (
                <span className="ml-2 text-sm text-gray-500">(Negotiable)</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{item.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium">{item.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{item.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{item.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Seller</p>
              <p className="font-medium">{item.seller?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{item.seller?.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{item.views || 0}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{item.favorites?.length || 0}</p>
                <p className="text-xs text-gray-500">Favorites</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{item.flags?.length || 0}</p>
                <p className="text-xs text-gray-500">Flags</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
          {(item.status === 'pending' || item.status === 'flagged_for_review') && (
            <>
              <button
                onClick={onApprove}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Approve Item
              </button>
              <button
                onClick={onReject}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Reject Item
              </button>
            </>
          )}
          <button
            onClick={onDelete}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CategoryModal = ({ 
  category, 
  setCategory, 
  onSave, 
  onClose, 
  isEditing,
  newSubcategory,
  setNewSubcategory,
  onAddSubcategory,
  onRemoveSubcategory
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle className="text-2xl" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category.name}
                onChange={(e) => setCategory({ ...category, name: e.target.value })}
                placeholder="e.g., Soccer Balls"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Expiration (days)
              </label>
              <input
                type="number"
                value={category.defaultExpirationDays}
                onChange={(e) => setCategory({ ...category, defaultExpirationDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={category.description}
              onChange={(e) => setCategory({ ...category, description: e.target.value })}
              placeholder="Brief description of this category..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Pricing Structure */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaDollarSign className="text-green-600" />
              Pricing Structure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Posting Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={category.postingFee}
                  onChange={(e) => setCategory({ ...category, postingFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-green-700 mb-2">
                  Renewal Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={category.renewalFee}
                  onChange={(e) => setCategory({ ...category, renewalFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Extension Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={category.extensionFee}
                  onChange={(e) => setCategory({ ...category, extensionFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-orange-700 mb-2">
                  Featured Fee ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={category.featuredFee}
                  onChange={(e) => setCategory({ ...category, featuredFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Listing Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaCog className="text-gray-600" />
              Listing Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Extensions Allowed
                </label>
                <input
                  type="number"
                  value={category.maxExtensions}
                  onChange={(e) => setCategory({ ...category, maxExtensions: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of times sellers can extend their listing</p>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaTags className="text-gray-600" />
              Subcategories
            </h3>
            
            {/* Add Subcategory */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onAddSubcategory()}
                placeholder="Enter subcategory name..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={onAddSubcategory}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <FaPlus />
                Add
              </button>
            </div>

            {/* Subcategory List */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="space-y-2">
                {category.subcategories.map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{typeof sub === 'string' ? sub : sub.name}</span>
                    <button
                      onClick={() => onRemoveSubcategory(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(!category.subcategories || category.subcategories.length === 0) && (
              <p className="text-gray-500 text-center py-4">No subcategories added yet</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t">
          <button
            onClick={onSave}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            {isEditing ? 'Update Category' : 'Create Category'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

