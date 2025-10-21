import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MembershipManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [memberships, setMemberships] = useState([]);
  const [membershipTiers, setMembershipTiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('member'); // member, tier, renewal
  const [editingItem, setEditingItem] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  const [filter, setFilter] = useState({
    search: '',
    tier: 'all',
    status: 'all',
    expiringIn: 'all',
    ageGroup: 'all'
  });

  const [memberForm, setMemberForm] = useState({
    memberNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    tier: 'basic',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    autoRenew: true,
    paymentMethod: 'credit_card',
    discountCode: '',
    notes: ''
  });

  const [tierForm, setTierForm] = useState({
    name: '',
    price: '',
    billingCycle: 'annual',
    description: '',
    benefits: [],
    maxMembers: '',
    color: '#3B82F6',
    featured: false,
    visible: true
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'members', name: 'Members', icon: '👥' },
    { id: 'tiers', name: 'Membership Tiers', icon: '🏆' },
    { id: 'renewals', name: 'Renewals', icon: '🔄' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const defaultTiers = [
    {
      id: 'basic',
      name: 'Basic',
      icon: '🥉',
      price: 50,
      billingCycle: 'annual',
      color: 'gray',
      benefits: [
        'Access to public events',
        'Newsletter subscription',
        'Member directory listing',
        '10% discount on merchandise'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: '🥈',
      price: 100,
      billingCycle: 'annual',
      color: 'blue',
      benefits: [
        'All Basic benefits',
        'Priority event registration',
        'Access to members-only events',
        '15% discount on merchandise',
        'Quarterly member meetups',
        'Access to training videos'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: '🥇',
      price: 200,
      billingCycle: 'annual',
      color: 'purple',
      benefits: [
        'All Standard benefits',
        'VIP event access',
        'Reserved seating at matches',
        '20% discount on merchandise',
        'Complimentary guest passes (2)',
        'Private coaching session (1/year)',
        'Priority customer support'
      ]
    },
    {
      id: 'elite',
      name: 'Elite',
      icon: '💎',
      price: 500,
      billingCycle: 'annual',
      color: 'yellow',
      benefits: [
        'All Premium benefits',
        'Unlimited guest passes',
        'VIP parking at all events',
        '30% discount on merchandise',
        'Personalized training plan',
        'Private coaching sessions (4/year)',
        'Exclusive club merchandise',
        'Recognition on club website',
        'Board meeting attendance',
        '24/7 concierge support'
      ]
    },
    {
      id: 'family',
      name: 'Family',
      icon: '👨‍👩‍👧‍👦',
      price: 150,
      billingCycle: 'annual',
      color: 'green',
      benefits: [
        'Covers up to 4 family members',
        'All Standard benefits for all members',
        'Family event access',
        'Group training discounts',
        'Family merchandise package'
      ]
    }
  ];

  const membershipStatus = [
    { id: 'active', name: 'Active', icon: '✅', color: 'green' },
    { id: 'pending', name: 'Pending', icon: '⏳', color: 'yellow' },
    { id: 'expired', name: 'Expired', icon: '❌', color: 'red' },
    { id: 'suspended', name: 'Suspended', icon: '⏸️', color: 'orange' },
    { id: 'cancelled', name: 'Cancelled', icon: '🚫', color: 'gray' }
  ];

  const billingCycles = [
    { id: 'monthly', name: 'Monthly', icon: '📅' },
    { id: 'quarterly', name: 'Quarterly', icon: '📆' },
    { id: 'semi-annual', name: 'Semi-Annual', icon: '🗓️' },
    { id: 'annual', name: 'Annual', icon: '📋' },
    { id: 'lifetime', name: 'Lifetime', icon: '♾️' }
  ];

  const ageGroups = [
    { id: 'youth', name: 'Youth (Under 18)', icon: '👶' },
    { id: 'adult', name: 'Adult (18-64)', icon: '👤' },
    { id: 'senior', name: 'Senior (65+)', icon: '👴' },
    { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' }
  ];

  useEffect(() => {
    document.title = 'Membership Management - Seattle Leopards FC Admin';
    loadMemberships();
    loadTiers();
  }, []);

  const loadMemberships = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/memberships/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMemberships(Array.isArray(data.memberships) ? data.memberships : []);
      }
    } catch (error) {
      console.error('Error loading memberships:', error);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTiers = async () => {
    try {
      const response = await fetch('/api/memberships/tiers');
      if (response.ok) {
        const data = await response.json();
        setMembershipTiers(Array.isArray(data) && data.length > 0 ? data : defaultTiers);
      } else {
        setMembershipTiers(defaultTiers);
      }
    } catch (error) {
      console.error('Error loading tiers:', error);
      setMembershipTiers(defaultTiers);
    }
  };

  const saveMember = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = editingItem ? `/api/memberships/${editingItem._id}` : '/api/memberships';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(memberForm)
      });

      if (response.ok) {
        setMessage(`Member ${editingItem ? 'updated' : 'added'} successfully!`);
        loadMemberships();
        setShowModal(false);
        resetForms();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error saving member');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving member:', error);
      setMessage('Error saving member');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const saveTier = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = editingItem ? `/api/memberships/tiers/${editingItem._id}` : '/api/memberships/tiers';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tierForm)
      });

      if (response.ok) {
        setMessage(`Tier ${editingItem ? 'updated' : 'created'} successfully!`);
        loadTiers();
        setShowModal(false);
        resetForms();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error saving tier');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving tier:', error);
      setMessage('Error saving tier');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const bulkRenew = async () => {
    if (selectedMembers.length === 0) {
      setMessage('Please select members to renew');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Renew each membership individually
      const renewPromises = selectedMembers.map(memberId =>
        fetch(`/api/memberships/${memberId}/renew`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ months: 12 }) // Renew for 1 year
        })
      );

      await Promise.all(renewPromises);
      setMessage(`${selectedMembers.length} membership(s) renewed successfully!`);
      loadMemberships();
      setSelectedMembers([]);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error renewing memberships:', error);
      setMessage('Error renewing memberships');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const sendRenewalReminders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/memberships/admin/expiring?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Found ${data.length} memberships expiring soon. Reminders would be sent.`);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error sending reminders:', error);
      setMessage('Error sending reminders');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setMemberForm({
      memberNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      tier: 'basic',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      autoRenew: true,
      paymentMethod: 'credit_card',
      discountCode: '',
      notes: ''
    });
    setTierForm({
      name: '',
      price: '',
      billingCycle: 'annual',
      description: '',
      benefits: [],
      maxMembers: '',
      color: '#3B82F6',
      featured: false,
      visible: true
    });
    setEditingItem(null);
  };

  const getFilteredMembers = () => {
    let filtered = Array.isArray(memberships) ? memberships : [];

    if (filter.search) {
      filtered = filtered.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(filter.search.toLowerCase()) ||
        m.email?.toLowerCase().includes(filter.search.toLowerCase()) ||
        m.memberNumber?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.tier !== 'all') filtered = filtered.filter(m => m.tier === filter.tier);
    if (filter.status !== 'all') filtered = filtered.filter(m => m.status === filter.status);
    
    if (filter.expiringIn !== 'all') {
      const today = new Date();
      filtered = filtered.filter(m => {
        if (!m.expiryDate) return false;
        const expiryDate = new Date(m.expiryDate);
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (filter.expiringIn === '30') return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        if (filter.expiringIn === '60') return daysUntilExpiry <= 60 && daysUntilExpiry >= 0;
        if (filter.expiringIn === '90') return daysUntilExpiry <= 90 && daysUntilExpiry >= 0;
        return false;
      });
    }

    return filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  };

  const filteredMembers = getFilteredMembers();

  const stats = {
    total: Array.isArray(memberships) ? memberships.length : 0,
    active: Array.isArray(memberships) ? memberships.filter(m => m.status === 'active').length : 0,
    pending: Array.isArray(memberships) ? memberships.filter(m => m.status === 'pending').length : 0,
    expired: Array.isArray(memberships) ? memberships.filter(m => m.status === 'expired').length : 0,
    revenue: Array.isArray(memberships) ? memberships
      .filter(m => m.status === 'active')
      .reduce((sum, m) => {
        const tier = membershipTiers.find(t => t.id === m.tier);
        return sum + (tier?.price || 0);
      }, 0) : 0,
    byTier: membershipTiers.map(tier => ({
      ...tier,
      count: Array.isArray(memberships) ? memberships.filter(m => m.tier === tier.id && m.status === 'active').length : 0,
      revenue: Array.isArray(memberships) ? memberships
        .filter(m => m.tier === tier.id && m.status === 'active')
        .reduce((sum) => sum + (tier.price || 0), 0) : 0
    })),
    expiringSoon: Array.isArray(memberships) ? memberships.filter(m => {
      if (!m.expiryDate || m.status !== 'active') return false;
      const daysUntil = Math.floor((new Date(m.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    }).length : 0,
    autoRenewEnabled: Array.isArray(memberships) ? memberships.filter(m => m.autoRenew && m.status === 'active').length : 0
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const exportMemberships = () => {
    const csv = [
      ['Member Number', 'Name', 'Email', 'Phone', 'Tier', 'Status', 'Start Date', 'Expiry Date', 'Auto-Renew'],
      ...filteredMembers.map(m => [
        m.memberNumber,
        `${m.firstName} ${m.lastName}`,
        m.email,
        m.phone,
        membershipTiers.find(t => t.id === m.tier)?.name,
        membershipStatus.find(s => s.id === m.status)?.name,
        m.startDate ? new Date(m.startDate).toLocaleDateString() : '',
        m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '',
        m.autoRenew ? 'Yes' : 'No'
      ])
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memberships-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Membership Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage members, tiers, renewals, and membership analytics
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
                  resetForms();
                  setMemberForm(prev => ({ ...prev, memberNumber: `MEM-${Date.now()}` }));
                  setModalType('member');
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-circle me-2"></i>Add Member
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.includes('success') || message.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                  {tab.id === 'renewals' && stats.expiringSoon > 0 && (
                    <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.expiringSoon}
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
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">👥</div>
                  <div className="text-blue-600">
                    <i className="bi bi-people text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-700 mt-1">Total Members</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">✅</div>
                  <div className="text-green-600">
                    <i className="bi bi-check-circle text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-900">{stats.active}</div>
                <div className="text-sm text-green-700 mt-1">Active</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">💰</div>
                  <div className="text-purple-600">
                    <i className="bi bi-cash-stack text-xl"></i>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.revenue)}</div>
                <div className="text-sm text-purple-700 mt-1">Annual Revenue</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">⏰</div>
                  <div className="text-orange-600">
                    <i className="bi bi-clock text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-900">{stats.expiringSoon}</div>
                <div className="text-sm text-orange-700 mt-1">Expiring Soon</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">🔄</div>
                  <div className="text-teal-600">
                    <i className="bi bi-arrow-repeat text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-teal-900">{stats.autoRenewEnabled}</div>
                <div className="text-sm text-teal-700 mt-1">Auto-Renew</div>
              </div>
            </div>

            {/* Membership Tiers Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Membership Tiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.byTier.map((tier) => (
                  <div
                    key={tier.id}
                    className={`bg-gradient-to-br from-${tier.color}-50 to-${tier.color}-100 p-6 rounded-lg border border-${tier.color}-200`}
                  >
                    <div className="text-center mb-3">
                      <div className="text-5xl mb-2">{tier.icon}</div>
                      <h3 className="font-bold text-lg text-gray-900">{tier.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{formatCurrency(tier.price)}/{tier.billingCycle}</p>
                    </div>
                    <div className="space-y-2 text-center">
                      <div className="bg-white rounded p-2">
                        <div className="text-2xl font-bold text-gray-900">{tier.count}</div>
                        <div className="text-xs text-gray-600">Members</div>
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

            {/* What is Membership Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">👥 What is Membership Management?</h2>
              <p className="text-gray-700 mb-4">
                Membership Management is your complete system for managing club memberships, from registration to renewal. 
                It handles member profiles, tiered membership levels, payment processing, renewal tracking, and provides 
                comprehensive analytics to grow your membership base.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">👤 Member Profiles</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete member information</li>
                    <li>• Emergency contacts</li>
                    <li>• Membership history</li>
                    <li>• Payment records</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🏆 Tiered System</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 5 membership levels</li>
                    <li>• Customizable benefits</li>
                    <li>• Flexible pricing</li>
                    <li>• Upgrade/downgrade options</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔄 Auto-Renewal</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automatic renewals</li>
                    <li>• Renewal reminders</li>
                    <li>• Payment processing</li>
                    <li>• Expiration tracking</li>
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
                      Action Required: Membership Renewals
                    </h3>
                    <div className="mt-2 text-sm text-orange-700">
                      <p>
                        You have <strong>{stats.expiringSoon}</strong> membership(s) expiring within the next 30 days. 
                        Send renewal reminders or contact members directly.
                      </p>
                    </div>
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => {
                          setFilter(f => ({ ...f, expiringIn: '30' }));
                          setActiveTab('renewals');
                        }}
                        className="text-sm font-medium text-orange-800 hover:text-orange-900"
                      >
                        View Expiring Memberships →
                      </button>
                      <button
                        onClick={sendRenewalReminders}
                        disabled={loading}
                        className="text-sm font-medium text-orange-800 hover:text-orange-900 disabled:opacity-50"
                      >
                        Send Reminders →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search members..."
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
                  {membershipTiers.map(tier => (
                    <option key={tier.id} value={tier.id}>{tier.icon} {tier.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  {membershipStatus.map(status => (
                    <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                  ))}
                </select>
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
                <button
                  onClick={exportMemberships}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <i className="bi bi-download me-2"></i>Export CSV
                </button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {filteredMembers.length} of {memberships.length} members
                </p>
                {selectedMembers.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-sm text-gray-600">{selectedMembers.length} selected</span>
                    <button
                      onClick={bulkRenew}
                      disabled={loading}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>Bulk Renew
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Members Grid/Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers(filteredMembers.map(m => m._id || m.memberNumber));
                            } else {
                              setSelectedMembers([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auto-Renew</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">👥</div>
                          <p className="text-lg font-semibold mb-2">No members found</p>
                          <p className="text-sm">Add your first member to get started</p>
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => {
                        const tier = membershipTiers.find(t => t.id === member.tier);
                        const statusOption = membershipStatus.find(s => s.id === member.status);
                        const daysUntilExpiry = getDaysUntilExpiry(member.expiryDate);

                        return (
                          <tr key={member._id || member.memberNumber} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedMembers.includes(member._id || member.memberNumber)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembers([...selectedMembers, member._id || member.memberNumber]);
                                  } else {
                                    setSelectedMembers(selectedMembers.filter(id => id !== (member._id || member.memberNumber)));
                                  }
                                }}
                                className="rounded"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {member.memberNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {member.firstName} {member.lastName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${tier?.color}-100 text-${tier?.color}-800`}>
                                {tier?.icon} {tier?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${statusOption?.color}-100 text-${statusOption?.color}-800`}>
                                {statusOption?.icon} {statusOption?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {member.expiryDate ? (
                                <div>
                                  <div className={`font-semibold ${
                                    daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0 ? 'text-red-600' :
                                    daysUntilExpiry !== null && daysUntilExpiry <= 60 && daysUntilExpiry >= 0 ? 'text-orange-600' :
                                    'text-gray-900'
                                  }`}>
                                    {new Date(member.expiryDate).toLocaleDateString()}
                                  </div>
                                  {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                                    <div className="text-xs text-gray-500">{daysUntilExpiry} days</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {member.autoRenew ? (
                                <span className="text-green-600">✓ Enabled</span>
                              ) : (
                                <span className="text-gray-400">✗ Disabled</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button className="text-blue-600 hover:text-blue-800" title="View">
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button className="text-green-600 hover:text-green-800" title="Edit">
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button className="text-orange-600 hover:text-orange-800" title="Renew">
                                  <i className="bi bi-arrow-repeat"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Membership Tiers</h2>
              <button
                onClick={() => {
                  resetForms();
                  setModalType('tier');
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <i className="bi bi-plus-circle me-2"></i>Create Tier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membershipTiers.map((tier) => (
                <div key={tier.id} className={`bg-gradient-to-br from-${tier.color}-50 to-white rounded-lg border-2 border-${tier.color}-200 p-6 hover:shadow-lg transition-shadow`}>
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-3">{tier.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                    <div className="text-3xl font-bold text-green-600 mt-2">
                      {formatCurrency(tier.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      per {billingCycles.find(b => b.id === tier.billingCycle)?.name.toLowerCase()}
                    </div>
                  </div>

                  {tier.description && (
                    <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-sm text-gray-900">Benefits:</h4>
                    {tier.benefits && tier.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <i className="bi bi-check-circle-fill text-green-600 mt-0.5"></i>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Members:</span>
                      <span className="font-semibold">{stats.byTier.find(t => t.id === tier.id)?.count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Annual Revenue:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(stats.byTier.find(t => t.id === tier.id)?.revenue || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Renewals Tab */}
        {activeTab === 'renewals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Membership Renewals</h2>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl font-bold text-orange-900">{stats.expiringSoon}</div>
                  <div className="text-sm text-orange-700 mt-1">Expiring in 30 Days</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-900">
                    {memberships.filter(m => {
                      if (!m.expiryDate) return false;
                      const days = getDaysUntilExpiry(m.expiryDate);
                      return days <= 60 && days > 30;
                    }).length}
                  </div>
                  <div className="text-sm text-yellow-700 mt-1">31-60 Days</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-900">{stats.autoRenewEnabled}</div>
                  <div className="text-sm text-blue-700 mt-1">Auto-Renew Enabled</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-900">{stats.expired}</div>
                  <div className="text-sm text-red-700 mt-1">Expired</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendRenewalReminders}
                  disabled={loading}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  <i className="bi bi-send me-2"></i>Send Renewal Reminders
                </button>
                <button
                  onClick={() => {
                    setFilter(f => ({ ...f, expiringIn: '30' }));
                    setActiveTab('members');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  <i className="bi bi-people me-2"></i>View Expiring Members
                </button>
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
                <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.revenue)}</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Average Revenue Per Member</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(stats.active > 0 ? stats.revenue / stats.active : 0)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Retention Rate</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Tier</h2>
              <div className="space-y-4">
                {stats.byTier.filter(t => t.revenue > 0).map((tier) => {
                  const percentage = stats.revenue > 0 ? (tier.revenue / stats.revenue) * 100 : 0;
                  return (
                    <div key={tier.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {tier.icon} {tier.name} ({tier.count} members)
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

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Membership Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Renewal Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">Enable auto-renewal by default</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">Send renewal reminders 30 days before expiry</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">Send expiration notice on expiry date</span>
                    </label>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Email Templates</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Welcome Email</span>
                        <i className="bi bi-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Renewal Reminder</span>
                        <i className="bi bi-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Expiration Notice</span>
                        <i className="bi bi-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showModal && modalType === 'member' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Member' : 'Add New Member'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForms();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Number *</label>
                      <input
                        type="text"
                        value={memberForm.memberNumber}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, memberNumber: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                        readOnly
                      />
                    </div>
                    <div></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={memberForm.firstName}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={memberForm.lastName}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={memberForm.email}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={memberForm.phone}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={memberForm.dateOfBirth}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Address Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={memberForm.address}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={memberForm.city}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={memberForm.state}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        maxLength="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                      <input
                        type="text"
                        value={memberForm.zipCode}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        value={memberForm.emergencyContact}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
                      <input
                        type="tel"
                        value={memberForm.emergencyPhone}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Membership Details */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Membership Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                      <select
                        value={memberForm.tier}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, tier: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {membershipTiers.map(tier => (
                          <option key={tier.id} value={tier.id}>{tier.icon} {tier.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        value={memberForm.status}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {membershipStatus.map(status => (
                          <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={memberForm.paymentMethod}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="credit_card">💳 Credit Card</option>
                        <option value="debit_card">💳 Debit Card</option>
                        <option value="paypal">🅿️ PayPal</option>
                        <option value="bank_transfer">🏦 Bank Transfer</option>
                        <option value="cash">💵 Cash</option>
                        <option value="check">📝 Check</option>
                        <option value="free">🎁 Free</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={memberForm.startDate}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        value={memberForm.expiryDate}
                        onChange={(e) => setMemberForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={memberForm.autoRenew}
                          onChange={(e) => setMemberForm(prev => ({ ...prev, autoRenew: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">Enable Auto-Renew</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={memberForm.notes}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Internal notes about this member..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForms();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMember}
                    disabled={loading || !memberForm.firstName || !memberForm.lastName || !memberForm.email}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingItem ? 'Update Member' : 'Add Member'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Tier Modal */}
        {showModal && modalType === 'tier' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Tier' : 'Create Membership Tier'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForms();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name *</label>
                    <input
                      type="text"
                      value={tierForm.name}
                      onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Gold, Premium, VIP"
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={tierForm.price}
                        onChange={(e) => setTierForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full border rounded-lg pl-7 pr-3 py-2"
                        min="0"
                        step="10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle *</label>
                    <select
                      value={tierForm.billingCycle}
                      onChange={(e) => setTierForm(prev => ({ ...prev, billingCycle: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {billingCycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>{cycle.icon} {cycle.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={tierForm.color}
                      onChange={(e) => setTierForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                    <input
                      type="number"
                      value={tierForm.maxMembers}
                      onChange={(e) => setTierForm(prev => ({ ...prev, maxMembers: e.target.value }))}
                      placeholder="Unlimited"
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={tierForm.description}
                    onChange={(e) => setTierForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this membership tier..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tierForm.featured}
                      onChange={(e) => setTierForm(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Featured Tier</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tierForm.visible}
                      onChange={(e) => setTierForm(prev => ({ ...prev, visible: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Visible to Public</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForms();
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTier}
                    disabled={loading || !tierForm.name || !tierForm.price}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingItem ? 'Update Tier' : 'Create Tier'}
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

export default MembershipManager;

