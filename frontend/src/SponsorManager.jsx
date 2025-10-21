import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SponsorManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    tier: 'all',
    status: 'all',
    expiringIn: 'all'
  });

  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    tier: 'bronze',
    status: 'active',
    amount: '',
    paymentFrequency: 'annual',
    startDate: '',
    endDate: '',
    logo: '',
    description: '',
    benefits: [],
    contractFile: '',
    address: '',
    notes: ''
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'active', name: 'Active Sponsors', icon: '✅' },
    { id: 'all', name: 'All Sponsors', icon: '🤝' },
    { id: 'packages', name: 'Packages', icon: '📦' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  const sponsorshipTiers = [
    { 
      id: 'platinum', 
      name: 'Platinum', 
      icon: '💎', 
      color: 'purple',
      minAmount: 10000,
      benefits: [
        'Logo on all team jerseys',
        'Banner at all home games',
        'Social media mentions (weekly)',
        'Website homepage placement',
        'Season passes (10)',
        'Recognition at events',
        'Newsletter features',
        'Press release inclusion'
      ]
    },
    { 
      id: 'gold', 
      name: 'Gold', 
      icon: '🥇', 
      color: 'yellow',
      minAmount: 5000,
      benefits: [
        'Logo on select jerseys',
        'Banner at home games',
        'Social media mentions (monthly)',
        'Website sponsor page',
        'Season passes (5)',
        'Event recognition',
        'Newsletter mentions'
      ]
    },
    { 
      id: 'silver', 
      name: 'Silver', 
      icon: '🥈', 
      color: 'gray',
      minAmount: 2500,
      benefits: [
        'Logo on practice jerseys',
        'Banner at select games',
        'Social media mentions (quarterly)',
        'Website listing',
        'Season passes (2)',
        'Event listing'
      ]
    },
    { 
      id: 'bronze', 
      name: 'Bronze', 
      icon: '🥉', 
      color: 'orange',
      minAmount: 1000,
      benefits: [
        'Logo on training equipment',
        'Website listing',
        'Social media mentions (annual)',
        'Season passes (1)',
        'Newsletter listing'
      ]
    },
    {
      id: 'inkind',
      name: 'In-Kind',
      icon: '🎁',
      color: 'teal',
      minAmount: 0,
      benefits: [
        'Website listing',
        'Recognition for donations',
        'Certificate of appreciation'
      ]
    }
  ];

  const statusOptions = [
    { id: 'active', name: 'Active', icon: '✅', color: 'green' },
    { id: 'pending', name: 'Pending', icon: '⏳', color: 'yellow' },
    { id: 'expired', name: 'Expired', icon: '❌', color: 'red' },
    { id: 'negotiating', name: 'Negotiating', icon: '💬', color: 'blue' },
    { id: 'cancelled', name: 'Cancelled', icon: '🚫', color: 'gray' }
  ];

  const paymentFrequencyOptions = [
    { id: 'annual', name: 'Annual', icon: '📅' },
    { id: 'semi-annual', name: 'Semi-Annual', icon: '📆' },
    { id: 'quarterly', name: 'Quarterly', icon: '🗓️' },
    { id: 'monthly', name: 'Monthly', icon: '📋' },
    { id: 'one-time', name: 'One-Time', icon: '💵' }
  ];

  useEffect(() => {
    document.title = 'Sponsor Management - Seattle Leopards FC Admin';
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sponsors');
      if (response.ok) {
        const data = await response.json();
        setSponsors(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading sponsors:', error);
      setSponsors([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSponsor = async () => {
    try {
      setLoading(true);
      const url = editingSponsor ? `/api/sponsors/${editingSponsor._id}` : '/api/sponsors';
      const method = editingSponsor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setMessage(`Sponsor ${editingSponsor ? 'updated' : 'added'} successfully!`);
        loadSponsors();
        setShowModal(false);
        resetForm();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving sponsor:', error);
      setMessage('Error saving sponsor');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteSponsor = async (id) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/sponsors/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Sponsor deleted successfully!');
        loadSponsors();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting sponsor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sponsor) => {
    setForm({
      companyName: sponsor.companyName || '',
      contactPerson: sponsor.contactPerson || '',
      email: sponsor.email || '',
      phone: sponsor.phone || '',
      website: sponsor.website || '',
      tier: sponsor.tier || 'bronze',
      status: sponsor.status || 'active',
      amount: sponsor.amount || '',
      paymentFrequency: sponsor.paymentFrequency || 'annual',
      startDate: sponsor.startDate ? sponsor.startDate.split('T')[0] : '',
      endDate: sponsor.endDate ? sponsor.endDate.split('T')[0] : '',
      logo: sponsor.logo || '',
      description: sponsor.description || '',
      benefits: sponsor.benefits || [],
      contractFile: sponsor.contractFile || '',
      address: sponsor.address || '',
      notes: sponsor.notes || ''
    });
    setEditingSponsor(sponsor);
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      website: '',
      tier: 'bronze',
      status: 'active',
      amount: '',
      paymentFrequency: 'annual',
      startDate: '',
      endDate: '',
      logo: '',
      description: '',
      benefits: [],
      contractFile: '',
      address: '',
      notes: ''
    });
    setEditingSponsor(null);
  };

  const getFilteredSponsors = () => {
    let filtered = Array.isArray(sponsors) ? sponsors : [];

    // Tab filtering
    if (activeTab === 'active') {
      filtered = filtered.filter(s => s.status === 'active');
    }

    // Additional filters
    if (filter.search) {
      filtered = filtered.filter(s =>
        s.companyName?.toLowerCase().includes(filter.search.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.tier !== 'all') filtered = filtered.filter(s => s.tier === filter.tier);
    if (filter.status !== 'all') filtered = filtered.filter(s => s.status === filter.status);
    
    if (filter.expiringIn !== 'all') {
      const today = new Date();
      filtered = filtered.filter(s => {
        if (!s.endDate) return false;
        const endDate = new Date(s.endDate);
        const daysUntilExpiry = Math.floor((endDate - today) / (1000 * 60 * 60 * 24));
        
        if (filter.expiringIn === '30') return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        if (filter.expiringIn === '60') return daysUntilExpiry <= 60 && daysUntilExpiry >= 0;
        if (filter.expiringIn === '90') return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
        return false;
      });
    }

    return filtered;
  };

  const filteredSponsors = getFilteredSponsors();

  const stats = {
    total: Array.isArray(sponsors) ? sponsors.length : 0,
    active: Array.isArray(sponsors) ? sponsors.filter(s => s.status === 'active').length : 0,
    pending: Array.isArray(sponsors) ? sponsors.filter(s => s.status === 'pending').length : 0,
    expired: Array.isArray(sponsors) ? sponsors.filter(s => s.status === 'expired').length : 0,
    totalRevenue: Array.isArray(sponsors) ? sponsors
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) : 0,
    byTier: sponsorshipTiers.map(tier => ({
      ...tier,
      count: Array.isArray(sponsors) ? sponsors.filter(s => s.tier === tier.id && s.status === 'active').length : 0,
      revenue: Array.isArray(sponsors) ? sponsors
        .filter(s => s.tier === tier.id && s.status === 'active')
        .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0) : 0
    })),
    expiringSoon: Array.isArray(sponsors) ? sponsors.filter(s => {
      if (!s.endDate || s.status !== 'active') return false;
      const daysUntil = Math.floor((new Date(s.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 60 && daysUntil >= 0;
    }).length : 0
  };

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const days = Math.floor((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sponsor Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage sponsors, track contributions, and maintain relationships
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back to Admin
              </Link>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-circle me-2"></i>Add Sponsor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                  {tab.id === 'active' && stats.active > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.active}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                    <div className="text-sm text-blue-700 mt-1">Total Sponsors</div>
                  </div>
                  <div className="text-4xl">🤝</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{stats.active}</div>
                    <div className="text-sm text-green-700 mt-1">Active</div>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="text-sm text-purple-700 mt-1">Total Revenue</div>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-900">{stats.expiringSoon}</div>
                    <div className="text-sm text-orange-700 mt-1">Expiring Soon</div>
                  </div>
                  <div className="text-4xl">⏰</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
                    <div className="text-sm text-yellow-700 mt-1">Pending</div>
                  </div>
                  <div className="text-4xl">⏳</div>
                </div>
              </div>
            </div>

            {/* Sponsorship Tiers */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sponsorship Tiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.byTier.map((tier) => (
                  <div
                    key={tier.id}
                    className={`bg-gradient-to-br from-${tier.color}-50 to-${tier.color}-100 p-6 rounded-lg border border-${tier.color}-200`}
                  >
                    <div className="text-center mb-3">
                      <div className="text-5xl mb-2">{tier.icon}</div>
                      <h3 className="font-bold text-lg text-gray-900">{tier.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">Min: {formatCurrency(tier.minAmount)}</p>
                    </div>
                    <div className="space-y-2 text-center">
                      <div className="bg-white rounded p-2">
                        <div className="text-2xl font-bold text-gray-900">{tier.count}</div>
                        <div className="text-xs text-gray-600">Sponsors</div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-lg font-bold text-green-600">{formatCurrency(tier.revenue)}</div>
                        <div className="text-xs text-gray-600">Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Sponsor Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🤝 What is Sponsor Management?</h2>
              <p className="text-gray-700 mb-4">
                Sponsor Management is your comprehensive system for managing club sponsorships, tracking financial 
                contributions, maintaining sponsor relationships, and ensuring all sponsor benefits are delivered. 
                This system helps generate revenue, build community partnerships, and provide sponsors with value.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💼 Sponsor Profiles</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Company information</li>
                    <li>• Contact management</li>
                    <li>• Logo and branding</li>
                    <li>• Contract tracking</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📦 Packages & Tiers</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 5 sponsorship tiers</li>
                    <li>• Custom benefits</li>
                    <li>• Flexible pricing</li>
                    <li>• Package templates</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💰 Financial Tracking</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Revenue tracking</li>
                    <li>• Payment schedules</li>
                    <li>• Contract dates</li>
                    <li>• Renewal reminders</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Expiring Soon Alert */}
            {stats.expiringSoon > 0 && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800">
                      Action Required: Sponsor Renewals
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>
                        You have <strong>{stats.expiringSoon}</strong> sponsor contract(s) expiring within the next 60 days. 
                        Review and reach out to sponsors to discuss renewal options.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFilter(f => ({ ...f, expiringIn: '60' }));
                        setActiveTab('all');
                      }}
                      className="mt-3 text-sm font-medium text-orange-800 hover:text-orange-900"
                    >
                      View Expiring Sponsors →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Sponsors & All Sponsors Tabs */}
        {(activeTab === 'active' || activeTab === 'all') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Search sponsors..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={filter.tier}
                  onChange={(e) => setFilter(f => ({ ...f, tier: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Tiers</option>
                  {sponsorshipTiers.map(tier => (
                    <option key={tier.id} value={tier.id}>{tier.icon} {tier.name}</option>
                  ))}
                </select>
                {activeTab === 'all' && (
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                    className="border rounded px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    {statusOptions.map(status => (
                      <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                    ))}
                  </select>
                )}
                <select
                  value={filter.expiringIn}
                  onChange={(e) => setFilter(f => ({ ...f, expiringIn: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Dates</option>
                  <option value="30">Expiring in 30 days</option>
                  <option value="60">Expiring in 60 days</option>
                  <option value="90">Expiring in 90 days</option>
                </select>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredSponsors.length} of {sponsors.length} sponsors
              </div>
            </div>

            {/* Sponsors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSponsors.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="text-6xl mb-4">🤝</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No sponsors found</p>
                  <p className="text-sm text-gray-600 mb-4">Add your first sponsor to get started</p>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Sponsor
                  </button>
                </div>
              ) : (
                filteredSponsors.map((sponsor) => {
                  const tier = sponsorshipTiers.find(t => t.id === sponsor.tier);
                  const statusOption = statusOptions.find(s => s.id === sponsor.status);
                  const daysUntilExpiry = getDaysUntilExpiry(sponsor.endDate);

                  return (
                    <div key={sponsor._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      {/* Logo/Header */}
                      <div className={`bg-gradient-to-r from-${tier?.color}-100 to-${tier?.color}-50 p-6 border-b`}>
                        {sponsor.logo ? (
                          <img src={sponsor.logo} alt={sponsor.companyName} className="h-16 object-contain mx-auto" />
                        ) : (
                          <div className="h-16 flex items-center justify-center">
                            <span className="text-4xl">{tier?.icon}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900">{sponsor.companyName}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full bg-${statusOption?.color}-100 text-${statusOption?.color}-800`}>
                            {statusOption?.icon} {statusOption?.name}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <i className="bi bi-person me-2"></i>
                            {sponsor.contactPerson}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <i className="bi bi-envelope me-2"></i>
                            {sponsor.email}
                          </div>
                          {sponsor.phone && (
                            <div className="flex items-center text-gray-600">
                              <i className="bi bi-telephone me-2"></i>
                              {sponsor.phone}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-3 py-1 text-sm rounded-full bg-${tier?.color}-100 text-${tier?.color}-800 font-semibold`}>
                              {tier?.icon} {tier?.name}
                            </span>
                            <span className="font-bold text-green-600">{formatCurrency(sponsor.amount)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {paymentFrequencyOptions.find(p => p.id === sponsor.paymentFrequency)?.name || 'Annual'}
                          </div>
                        </div>

                        {sponsor.endDate && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Expires:</span>
                              <span className={`font-semibold ${
                                daysUntilExpiry !== null && daysUntilExpiry <= 30 ? 'text-red-600' :
                                daysUntilExpiry !== null && daysUntilExpiry <= 60 ? 'text-orange-600' :
                                'text-gray-900'
                              }`}>
                                {new Date(sponsor.endDate).toLocaleDateString()}
                                {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                                  <span className="ml-1">({daysUntilExpiry} days)</span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleEdit(sponsor)}
                            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm"
                          >
                            <i className="bi bi-pencil me-1"></i> Edit
                          </button>
                          {sponsor.website && (
                            <button
                              onClick={() => window.open(sponsor.website, '_blank')}
                              className="bg-green-50 text-green-600 px-3 py-2 rounded hover:bg-green-100 text-sm"
                            >
                              <i className="bi bi-link-45deg"></i>
                            </button>
                          )}
                          <button
                            onClick={() => deleteSponsor(sponsor._id)}
                            className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 text-sm"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sponsorship Packages</h2>
              
              <div className="space-y-6">
                {sponsorshipTiers.map((tier) => (
                  <div key={tier.id} className={`bg-gradient-to-r from-${tier.color}-50 to-white rounded-lg border-2 border-${tier.color}-200 p-6`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl">{tier.icon}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{tier.name} Tier</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Minimum contribution: <span className="font-semibold text-green-600">{formatCurrency(tier.minAmount)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {stats.byTier.find(t => t.id === tier.id)?.count || 0}
                        </div>
                        <div className="text-sm text-gray-600">Current Sponsors</div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Package Benefits:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tier.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <i className="bi bi-check-circle-fill text-green-600 mt-0.5"></i>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Annual Revenue</h3>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Average Per Sponsor</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(stats.active > 0 ? stats.totalRevenue / stats.active : 0)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Retention Rate</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Revenue by Tier */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Tier</h2>
              <div className="space-y-4">
                {stats.byTier.filter(t => t.revenue > 0).map((tier) => {
                  const percentage = stats.totalRevenue > 0 ? (tier.revenue / stats.totalRevenue) * 100 : 0;
                  return (
                    <div key={tier.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {tier.icon} {tier.name} ({tier.count})
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(tier.revenue)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-${tier.color}-600 h-3 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Sponsor Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSponsor ? 'Edit Sponsor' : 'Add New Sponsor'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                {/* Company Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => setForm(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={form.contactPerson}
                      onChange={(e) => setForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Sponsorship Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tier *
                    </label>
                    <select
                      value={form.tier}
                      onChange={(e) => setForm(prev => ({ ...prev, tier: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {sponsorshipTiers.map(tier => (
                        <option key={tier.id} value={tier.id}>
                          {tier.icon} {tier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {statusOptions.map(status => (
                        <option key={status.id} value={status.id}>
                          {status.icon} {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                      step="100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Frequency
                    </label>
                    <select
                      value={form.paymentFrequency}
                      onChange={(e) => setForm(prev => ({ ...prev, paymentFrequency: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {paymentFrequencyOptions.map(freq => (
                        <option key={freq.id} value={freq.id}>
                          {freq.icon} {freq.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={form.logo}
                    onChange={(e) => setForm(prev => ({ ...prev, logo: e.target.value }))}
                    placeholder="https://"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes about this sponsor..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSponsor}
                    disabled={loading || !form.companyName || !form.contactPerson || !form.email}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingSponsor ? 'Update Sponsor' : 'Add Sponsor'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SponsorManager;

