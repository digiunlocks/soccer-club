import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUsers, FaCrown, FaDollarSign, FaChartLine, FaPlus, FaEdit, FaTrash, FaEye, FaPause, FaPlay, FaClock, FaDownload, FaFilter, FaSearch, FaArrowLeft, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const MembershipManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data states
  const [memberships, setMemberships] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [stats, setStats] = useState({});
  const [expiringMemberships, setExpiringMemberships] = useState([]);
  
  // Form states
  const [showTierForm, setShowTierForm] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [editingMembership, setEditingMembership] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    tier: '',
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Form data
  const [tierForm, setTierForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 1,
    features: [],
    benefits: [],
    maxMarketplaceListings: 0,
    prioritySupport: false,
    discountPercentage: 0,
    color: '#3B82F6'
  });

  const [membershipForm, setMembershipForm] = useState({
    userId: '',
    tierId: '',
    startDate: '',
    endDate: '',
    amount: 0,
    paymentMethod: 'credit_card',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, pagination.page, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch based on active tab
      switch (activeTab) {
        case 'overview':
          await Promise.all([
            fetchStats(headers),
            fetchExpiringMemberships(headers)
          ]);
          break;
        case 'memberships':
          await fetchMemberships(headers);
          break;
        case 'tiers':
          await fetchTiers(headers);
          break;
        case 'analytics':
          await fetchStats(headers);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (headers) => {
    const response = await fetch('http://localhost:5000/api/memberships/admin/stats', { headers });
    if (response.ok) {
      const data = await response.json();
      setStats(data);
    }
  };

  const fetchMemberships = async (headers) => {
    const params = new URLSearchParams({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    });
    
    const response = await fetch(`http://localhost:5000/api/memberships/admin/all?${params}`, { headers });
    if (response.ok) {
      const data = await response.json();
      setMemberships(data.memberships);
      setPagination(prev => ({ ...prev, total: data.pagination.total }));
    }
  };

  const fetchTiers = async (headers) => {
    const response = await fetch('http://localhost:5000/api/memberships/tiers', { headers });
    if (response.ok) {
      const data = await response.json();
      setTiers(data);
    }
  };

  const fetchExpiringMemberships = async (headers) => {
    const response = await fetch('http://localhost:5000/api/memberships/admin/expiring?days=30', { headers });
    if (response.ok) {
      const data = await response.json();
      setExpiringMemberships(data);
    }
  };

  const handleTierSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingTier 
        ? `http://localhost:5000/api/memberships/tiers/${editingTier._id}`
        : 'http://localhost:5000/api/memberships/tiers';
      
      const method = editingTier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tierForm)
      });
      
      if (response.ok) {
        toast.success(editingTier ? 'Tier updated!' : 'Tier created!');
        await fetchTiers();
        resetTierForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save tier');
      }
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error('Error saving tier');
    } finally {
      setSaving(false);
    }
  };

  const handleMembershipSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingMembership 
        ? `http://localhost:5000/api/memberships/${editingMembership._id}`
        : 'http://localhost:5000/api/memberships';
      
      const method = editingMembership ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(membershipForm)
      });
      
      if (response.ok) {
        toast.success(editingMembership ? 'Membership updated!' : 'Membership created!');
        await fetchMemberships();
        resetMembershipForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save membership');
      }
    } catch (error) {
      console.error('Error saving membership:', error);
      toast.error('Error saving membership');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspendMembership = async (membershipId) => {
    if (!confirm('Are you sure you want to suspend this membership?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/memberships/${membershipId}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: 'Administrative suspension',
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        })
      });
      
      if (response.ok) {
        toast.success('Membership suspended');
        await fetchMemberships();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to suspend membership');
      }
    } catch (error) {
      console.error('Error suspending membership:', error);
      toast.error('Error suspending membership');
    }
  };

  const handleUnsuspendMembership = async (membershipId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/memberships/${membershipId}/unsuspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Membership unsuspended');
        await fetchMemberships();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to unsuspend membership');
      }
    } catch (error) {
      console.error('Error unsuspending membership:', error);
      toast.error('Error unsuspending membership');
    }
  };

  const handleRenewMembership = async (membershipId) => {
    const months = prompt('Enter number of months to renew:');
    if (!months || isNaN(months)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/memberships/${membershipId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ months: parseInt(months) })
      });
      
      if (response.ok) {
        toast.success('Membership renewed');
        await fetchMemberships();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to renew membership');
      }
    } catch (error) {
      console.error('Error renewing membership:', error);
      toast.error('Error renewing membership');
    }
  };

  const resetTierForm = () => {
    setTierForm({
      name: '',
      description: '',
      price: 0,
      duration: 1,
      features: [],
      benefits: [],
      maxMarketplaceListings: 0,
      prioritySupport: false,
      discountPercentage: 0,
      color: '#3B82F6'
    });
    setEditingTier(null);
    setShowTierForm(false);
  };

  const resetMembershipForm = () => {
    setMembershipForm({
      userId: '',
      tierId: '',
      startDate: '',
      endDate: '',
      amount: 0,
      paymentMethod: 'credit_card',
      notes: ''
    });
    setEditingMembership(null);
    setShowMembershipForm(false);
  };

  const startEditTier = (tier) => {
    setTierForm({
      name: tier.name,
      description: tier.description || '',
      price: tier.price,
      duration: tier.duration,
      features: tier.features || [],
      benefits: tier.benefits || [],
      maxMarketplaceListings: tier.maxMarketplaceListings || 0,
      prioritySupport: tier.prioritySupport || false,
      discountPercentage: tier.discountPercentage || 0,
      color: tier.color || '#3B82F6'
    });
    setEditingTier(tier);
    setShowTierForm(true);
  };

  const startEditMembership = (membership) => {
    setMembershipForm({
      userId: membership.user._id,
      tierId: membership.tier._id,
      startDate: membership.startDate.split('T')[0],
      endDate: membership.endDate.split('T')[0],
      amount: membership.amount,
      paymentMethod: membership.paymentMethod,
      notes: membership.notes || ''
    });
    setEditingMembership(membership);
    setShowMembershipForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading membership data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/admin?section=membership'}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Membership Management"
              >
                <FaArrowLeft />
                Back to Membership Management
              </button>
            </div>
            <div className="flex items-center gap-3">
              <FaUsers className="text-3xl text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Membership Management</h2>
                <p className="text-sm text-gray-600">Comprehensive membership system with tiers, payments, and analytics</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTierForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaPlus />
                Add Tier
              </button>
              <button
                onClick={() => setShowMembershipForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FaPlus />
                Add Membership
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartLine },
                { id: 'memberships', label: 'Memberships', icon: FaUsers },
                { id: 'tiers', label: 'Tiers', icon: FaCrown },
                { id: 'analytics', label: 'Analytics', icon: FaDollarSign }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Members</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalMembers || 0}</p>
                    </div>
                    <FaUsers className="text-2xl text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Active Members</p>
                      <p className="text-2xl font-bold text-green-900">{stats.activeMembers || 0}</p>
                    </div>
                    <FaCheck className="text-2xl text-green-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Expiring Soon</p>
                      <p className="text-2xl font-bold text-yellow-900">{expiringMemberships.length}</p>
                    </div>
                    <FaExclamationTriangle className="text-2xl text-yellow-600" />
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.monthlyRevenue || 0)}</p>
                    </div>
                    <FaDollarSign className="text-2xl text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Expiring Memberships */}
              {expiringMemberships.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaClock className="text-yellow-600" />
                    Memberships Expiring Soon
                  </h3>
                  <div className="space-y-3">
                    {expiringMemberships.slice(0, 5).map((membership) => (
                      <div key={membership._id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{membership.user.username}</p>
                          <p className="text-sm text-gray-600">{membership.tier.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Expires: {formatDate(membership.endDate)}</p>
                          <p className="text-sm font-medium text-yellow-600">
                            {membership.daysUntilExpiry()} days left
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'memberships' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search memberships..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
                <button
                  onClick={() => window.open('http://localhost:5000/api/memberships/admin/export', '_blank')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <FaDownload />
                  Export
                </button>
              </div>

              {/* Memberships Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {memberships.map((membership) => (
                        <tr key={membership._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{membership.user.username}</div>
                              <div className="text-sm text-gray-500">{membership.user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{membership.tier.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(membership.status)}`}>
                              {membership.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(membership.totalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(membership.startDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(membership.endDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditMembership(membership)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              {membership.status === 'suspended' ? (
                                <button
                                  onClick={() => handleUnsuspendMembership(membership._id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Unsuspend"
                                >
                                  <FaPlay />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSuspendMembership(membership._id)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Suspend"
                                >
                                  <FaPause />
                                </button>
                              )}
                              <button
                                onClick={() => handleRenewMembership(membership._id)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Renew"
                              >
                                <FaClock />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="flex justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2">
                      Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tiers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                  <div key={tier._id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      ></div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditTier(tier)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tier.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="text-sm font-medium">{formatCurrency(tier.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="text-sm font-medium">{tier.duration} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Marketplace Listings:</span>
                        <span className="text-sm font-medium">{tier.maxMarketplaceListings}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-medium">{formatCurrency(stats.totalRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <span className="font-medium">{formatCurrency(stats.monthlyRevenue || 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tiers</h3>
                  <div className="space-y-3">
                    {stats.popularTiers?.slice(0, 3).map((tier, index) => (
                      <div key={tier._id} className="flex justify-between">
                        <span className="text-gray-600">{tier.name}:</span>
                        <span className="font-medium">{tier.memberCount} members</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tier Form Modal */}
        {showTierForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingTier ? 'Edit Tier' : 'Add Tier'}
                </h3>
                <button
                  onClick={resetTierForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleTierSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name *</label>
                    <input
                      type="text"
                      required
                      value={tierForm.name}
                      onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={tierForm.price}
                      onChange={(e) => setTierForm({ ...tierForm, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={tierForm.duration}
                      onChange={(e) => setTierForm({ ...tierForm, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={tierForm.color}
                      onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={tierForm.description}
                    onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetTierForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : (editingTier ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Membership Form Modal */}
        {showMembershipForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingMembership ? 'Edit Membership' : 'Add Membership'}
                </h3>
                <button
                  onClick={resetMembershipForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleMembershipSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                  <input
                    type="text"
                    required
                    value={membershipForm.userId}
                    onChange={(e) => setMembershipForm({ ...membershipForm, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="User ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                  <select
                    required
                    value={membershipForm.tierId}
                    onChange={(e) => setMembershipForm({ ...membershipForm, tierId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a tier</option>
                    {tiers.map((tier) => (
                      <option key={tier._id} value={tier._id}>
                        {tier.name} - {formatCurrency(tier.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={membershipForm.startDate}
                      onChange={(e) => setMembershipForm({ ...membershipForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={membershipForm.endDate}
                      onChange={(e) => setMembershipForm({ ...membershipForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={membershipForm.amount}
                    onChange={(e) => setMembershipForm({ ...membershipForm, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={membershipForm.paymentMethod}
                    onChange={(e) => setMembershipForm({ ...membershipForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={membershipForm.notes}
                    onChange={(e) => setMembershipForm({ ...membershipForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetMembershipForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : (editingMembership ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipManagement;
