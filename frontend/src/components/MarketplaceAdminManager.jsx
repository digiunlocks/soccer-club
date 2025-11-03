import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaEye, FaCheck, FaTimes, FaFlag, FaTrash, FaEdit, FaSearch, 
  FaFilter, FaSort, FaRedo, FaChartBar, FaClock, FaUser,
  FaDollarSign, FaTag, FaMapMarkerAlt, FaCalendarAlt, FaShieldAlt,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaEyeSlash,
  FaDownload, FaUpload, FaCog, FaBroom
} from 'react-icons/fa';

export default function MarketplaceAdminManager() {
  const [activeTab, setActiveTab] = useState('pending');
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationSettings, setExpirationSettings] = useState({
    defaultExpirationDays: 90,
    extensionDays: 30,
    maxExtensions: 3
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    pendingItems: 0,
    approvedItems: 0,
    rejectedItems: 0,
    flaggedItems: 0,
    totalViews: 0,
    totalFavorites: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    priceRange: { min: '', max: '' },
    dateRange: { from: '', to: '' },
    author: '',
    hasFlags: false
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // Authentication check
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required - Please log in first');
        return;
      }

      // Verify user is super admin
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.isSuperAdmin) {
          setIsAuthenticated(true);
          setUser(userData);
          fetchStats();
          fetchItems();
        } else {
          setError('Super admin access required');
        }
      } else {
        setError('Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication error');
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  // Fetch items based on active tab
  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      let endpoint = 'http://localhost:5000/api/marketplace/admin/all-items';
      
      // Use specific endpoints for different tabs
      switch (activeTab) {
        case 'pending':
          endpoint = 'http://localhost:5000/api/marketplace/admin/moderation-queue';
          break;
        case 'flagged':
          endpoint = 'http://localhost:5000/api/marketplace/admin/flagged';
          break;
        case 'restorable':
          endpoint = 'http://localhost:5000/api/marketplace/admin/restorable';
          break;
        default:
          endpoint = 'http://localhost:5000/api/marketplace/admin/all-items';
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: sortBy === 'createdAt' ? 'newest' : sortBy
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.priceRange.min) params.append('minPrice', filters.priceRange.min);
      if (filters.priceRange.max) params.append('maxPrice', filters.priceRange.max);

      const response = await fetch(`${endpoint}?${params}`, { headers });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || data);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load items');
      toast.error('Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  };

  // Fetch expiration settings
  const fetchExpirationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/fees/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.fees) {
          setExpirationSettings({
            defaultExpirationDays: data.fees.defaultExpirationDays,
            extensionDays: data.fees.extensionDays,
            maxExtensions: data.fees.maxExtensions
          });
        }
      }
    } catch (error) {
      console.error('Error fetching expiration settings:', error);
    }
  };

  // Update expiration settings
  const updateExpirationSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/fees/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expirationSettings)
      });

      if (response.ok) {
        toast.success('Expiration settings updated successfully!');
        setShowExpirationModal(false);
        await fetchExpirationSettings();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update expiration settings');
      }
    } catch (error) {
      console.error('Error updating expiration settings:', error);
      toast.error('Error updating expiration settings');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [activeTab, currentPage, sortBy, sortOrder, filters, isAuthenticated]);

  // Handle item status change
  const handleStatusChange = async (itemId, newStatus, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/admin/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          reason: reason
        })
      });

      if (response.ok) {
        toast.success(`Item ${newStatus} successfully`);
        fetchItems();
        fetchStats();
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status change error:', error);
      toast.error(error.message || 'Error updating item status');
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/admin/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        fetchItems();
        fetchStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Error deleting item');
    }
  };

  // Handle bulk operations
  const handleBulkAction = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    if (!bulkAction) {
      toast.error('Please select an action');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (bulkAction === 'delete') {
        const response = await fetch('http://localhost:5000/api/marketplace/admin/bulk-delete', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemIds: selectedItems })
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(`${result.deletedCount} items deleted successfully`);
          setSelectedItems([]);
          setShowBulkModal(false);
          fetchItems();
          fetchStats();
        } else {
          throw new Error('Failed to delete items');
        }
      } else {
        // Bulk approve/reject
        const promises = selectedItems.map(itemId => 
          handleStatusChange(itemId, bulkAction)
        );
        
        await Promise.all(promises);
        setSelectedItems([]);
        setShowBulkModal(false);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Error performing bulk action');
    }
  };

  // Handle flag resolution
  const handleResolveFlag = async (itemId, flagId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/admin/${itemId}/resolve-flag`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ flagId, action })
      });

      if (response.ok) {
        toast.success('Flag resolved successfully');
        fetchItems();
      } else {
        throw new Error('Failed to resolve flag');
      }
    } catch (error) {
      console.error('Flag resolution error:', error);
      toast.error('Error resolving flag');
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      sold: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/signin'}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace Management</h1>
              <p className="text-gray-600 mt-1">Review, approve, and manage marketplace items</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchItems()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaRedo className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  fetchExpirationSettings();
                  setShowExpirationModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FaCog className="w-4 h-4" />
                Expiration Settings
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaFilter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Awaiting Action - Most Important */}
          <div className={`rounded-lg shadow-sm border-2 p-6 ${stats.pendingItems > 0 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Awaiting Action</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingItems}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.flaggedItems > 0 && `+ ${stats.flaggedItems} flagged`}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            {stats.pendingItems > 0 && (
              <button
                onClick={() => {setActiveTab('pending'); window.scrollTo({ top: 400, behavior: 'smooth' });}}
                className="w-full mt-3 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
              >
                Review Now
              </button>
            )}
          </div>

          {/* Total Engagement */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-blue-700 uppercase">Total Views</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalViews || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Across {stats.totalItems} items</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <FaEye className="w-6 h-6 text-blue-700" />
              </div>
            </div>
            <div className="text-xs text-blue-600 font-medium">
              Avg: {stats.totalItems > 0 ? Math.round((stats.totalViews || 0) / stats.totalItems) : 0} views/item
            </div>
          </div>

          {/* Active Listings */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-green-700 uppercase">Active Listings</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedItems}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalItems > 0 ? Math.round((stats.approvedItems / stats.totalItems) * 100) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <FaCheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium">
              {stats.totalFavorites || 0} total favorites
            </div>
          </div>

          {/* Issues & Alerts */}
          <div className={`rounded-lg shadow-sm border-2 p-6 ${stats.flaggedItems > 0 ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Issues & Alerts</p>
                <p className="text-3xl font-bold text-red-600">{stats.flaggedItems}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.rejectedItems || 0} rejected items
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaFlag className="w-6 h-6 text-red-600" />
              </div>
            </div>
            {stats.flaggedItems > 0 && (
              <button
                onClick={() => {setActiveTab('flagged'); window.scrollTo({ top: 400, behavior: 'smooth' });}}
                className="w-full mt-3 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Review Flags
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pending', label: 'Pending Review', count: stats.pendingItems, icon: FaClock },
                { id: 'all', label: 'All Items', count: stats.totalItems, icon: FaChartBar },
                { id: 'flagged', label: 'Flagged', count: stats.flaggedItems, icon: FaFlag },
                { id: 'restorable', label: 'Restorable', count: stats.rejectedItems, icon: FaRedo }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                    setSelectedItems([]);
                  }}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search items..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Soccer Balls">Soccer Balls</option>
                    <option value="Cleats">Cleats</option>
                    <option value="Jerseys">Jerseys</option>
                    <option value="Shorts">Shorts</option>
                    <option value="Socks">Socks</option>
                    <option value="Gloves">Gloves</option>
                    <option value="Shin Guards">Shin Guards</option>
                    <option value="Goalkeeper Gear">Goalkeeper Gear</option>
                    <option value="Training Equipment">Training Equipment</option>
                    <option value="Bags">Bags</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Books & Media">Books & Media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="sold">Sold</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, min: e.target.value }
                    }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, max: e.target.value }
                    }))}
                    placeholder="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setFilters({
                    search: '',
                    category: '',
                    status: '',
                    priceRange: { min: '', max: '' },
                    dateRange: { from: '', to: '' },
                    author: '',
                    hasFlags: false
                  })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length} item(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Bulk Actions
                  </button>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading items...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchItems}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <FaEyeSlash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === items.length && items.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleItemSelect(item._id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.images && item.images.length > 0 && (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.seller?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.seller?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.category}</div>
                        {item.subcategory && (
                          <div className="text-sm text-gray-500">{item.subcategory}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                        {item.flags && item.flags.length > 0 && (
                          <div className="mt-1">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {item.flags.length} flag(s)
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowItemModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          
                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(item._id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowRejectModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-red-800 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      {showItemModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Images */}
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedItem.title} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Title</h4>
                    <p className="text-gray-900">{selectedItem.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Description</h4>
                    <p className="text-gray-900">{selectedItem.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Price</h4>
                      <p className="text-gray-900">{formatPrice(selectedItem.price)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Category</h4>
                      <p className="text-gray-900">{selectedItem.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Condition</h4>
                      <p className="text-gray-900">{selectedItem.condition}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Location</h4>
                      <p className="text-gray-900">{selectedItem.location}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Seller</h4>
                    <p className="text-gray-900">{selectedItem.seller?.name || 'Unknown'}</p>
                    <p className="text-gray-500">{selectedItem.seller?.email || 'No email'}</p>
                  </div>
                  
                  {selectedItem.flags && selectedItem.flags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Flags</h4>
                      <div className="space-y-2">
                        {selectedItem.flags.map((flag, index) => (
                          <div key={index} className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-red-800">{flag.reason}</span>
                              <span className="text-xs text-red-600">
                                {formatDate(flag.flaggedAt)}
                              </span>
                            </div>
                            {flag.description && (
                              <p className="text-sm text-red-700 mt-1">{flag.description}</p>
                            )}
                            {!flag.resolved && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleResolveFlag(selectedItem._id, flag._id, 'dismiss')}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                  Dismiss
                                </button>
                                <button
                                  onClick={() => handleResolveFlag(selectedItem._id, flag._id, 'action')}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  Take Action
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {selectedItem.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedItem._id, 'approved');
                      setShowItemModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowItemModal(false);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reject Item</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting "{selectedItem.title}":
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(selectedItem._id, 'rejected', rejectionReason)}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Select an action for {selectedItems.length} selected item(s):
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bulkAction"
                    value="approved"
                    checked={bulkAction === 'approved'}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="mr-3"
                  />
                  <span>Approve All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bulkAction"
                    value="rejected"
                    checked={bulkAction === 'rejected'}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="mr-3"
                  />
                  <span>Reject All</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bulkAction"
                    value="delete"
                    checked={bulkAction === 'delete'}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="mr-3"
                  />
                  <span>Delete All</span>
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkAction('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Execute Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expiration Settings Modal */}
      {showExpirationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Expiration Settings</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Expiration (Days)
                </label>
                <input
                  type="number"
                  value={expirationSettings.defaultExpirationDays}
                  onChange={(e) => setExpirationSettings(prev => ({
                    ...prev,
                    defaultExpirationDays: parseInt(e.target.value) || 90
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="365"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extension Period (Days)
                </label>
                <input
                  type="number"
                  value={expirationSettings.extensionDays}
                  onChange={(e) => setExpirationSettings(prev => ({
                    ...prev,
                    extensionDays: parseInt(e.target.value) || 30
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Extensions per Item
                </label>
                <input
                  type="number"
                  value={expirationSettings.maxExtensions}
                  onChange={(e) => setExpirationSettings(prev => ({
                    ...prev,
                    maxExtensions: parseInt(e.target.value) || 3
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="10"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowExpirationModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateExpirationSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
