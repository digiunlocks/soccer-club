import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PaymentManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('payment');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    method: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    type: 'all'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    donorName: '',
    donorEmail: '',
    method: 'card',
    status: 'completed',
    transactionId: '',
    cardType: '',
    cardLast4: '',
    notes: '',
    paymentFor: 'registration',
    userId: ''
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'all', name: 'All Payments', icon: '💳' },
    { id: 'pending', name: 'Pending', icon: '⏳' },
    { id: 'completed', name: 'Completed', icon: '✅' },
    { id: 'refunded', name: 'Refunded', icon: '↩️' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: 'blue' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️', color: 'purple' },
    { id: 'zelle', name: 'Zelle', icon: '⚡', color: 'cyan' },
    { id: 'venmo', name: 'Venmo', icon: '💸', color: 'teal' },
    { id: 'cashapp', name: 'Cash App', icon: '💵', color: 'green' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', color: 'indigo' },
    { id: 'check', name: 'Check', icon: '📝', color: 'gray' },
    { id: 'cash', name: 'Cash', icon: '💵', color: 'yellow' },
    { id: 'stripe', name: 'Stripe', icon: '💰', color: 'purple' },
    { id: 'other', name: 'Other', icon: '💳', color: 'gray' }
  ];

  const paymentStatus = [
    { id: 'completed', name: 'Completed', icon: '✅', color: 'green' },
    { id: 'pending', name: 'Pending', icon: '⏳', color: 'yellow' },
    { id: 'failed', name: 'Failed', icon: '❌', color: 'red' },
    { id: 'refunded', name: 'Refunded', icon: '↩️', color: 'blue' },
    { id: 'partial', name: 'Partially Refunded', icon: '🔄', color: 'orange' },
    { id: 'cancelled', name: 'Cancelled', icon: '🚫', color: 'gray' }
  ];

  const paymentTypes = [
    { id: 'registration', name: 'Registration Fee', icon: '📝' },
    { id: 'membership', name: 'Membership Dues', icon: '👥' },
    { id: 'tournament', name: 'Tournament Fee', icon: '🏆' },
    { id: 'training', name: 'Training Session', icon: '⚽' },
    { id: 'equipment', name: 'Equipment Purchase', icon: '🎽' },
    { id: 'uniform', name: 'Uniform Purchase', icon: '👕' },
    { id: 'camp', name: 'Camp/Clinic Fee', icon: '🏕️' },
    { id: 'merchandise', name: 'Merchandise', icon: '🛍️' },
    { id: 'marketplace', name: 'Marketplace Purchase', icon: '🛒' },
    { id: 'donation', name: 'Donation', icon: '💝' },
    { id: 'sponsorship', name: 'Sponsorship', icon: '🤝' },
    { id: 'other', name: 'Other', icon: '💰' }
  ];

  const cardTypes = [
    { id: 'visa', name: 'Visa', icon: '💳' },
    { id: 'mastercard', name: 'MasterCard', icon: '💳' },
    { id: 'amex', name: 'American Express', icon: '💳' },
    { id: 'discover', name: 'Discover', icon: '💳' },
    { id: 'other', name: 'Other', icon: '💳' }
  ];

  useEffect(() => {
    document.title = 'Payment Management - Seattle Leopards FC Admin';
    loadPayments();
    loadTransactions();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const savePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentForm)
      });

      if (response.ok) {
        setMessage('Payment recorded successfully!');
        loadPayments();
        loadTransactions();
        setShowModal(false);
        resetForm();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error saving payment');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving payment:', error);
      setMessage('Error saving payment');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (paymentId, amount, reason) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payment/${paymentId}/refund`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          refundAmount: amount,
          reason: reason,
          admin: 'Admin User'
        })
      });

      if (response.ok) {
        setMessage('Refund processed successfully!');
        loadPayments();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Error processing refund');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error processing refund:', error);
      setMessage('Error processing refund');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPaymentForm({
      amount: '',
      donorName: '',
      donorEmail: '',
      method: 'card',
      status: 'completed',
      transactionId: '',
      cardType: '',
      cardLast4: '',
      notes: '',
      paymentFor: 'registration',
      userId: ''
    });
  };

  const getFilteredPayments = () => {
    let filtered = Array.isArray(payments) ? payments : [];

    // Tab filtering
    if (activeTab === 'pending') {
      filtered = filtered.filter(p => p.status === 'pending');
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(p => p.status === 'completed');
    } else if (activeTab === 'refunded') {
      filtered = filtered.filter(p => p.status === 'refunded' || p.status === 'partial');
    }

    // Additional filters
    if (filter.search) {
      filtered = filtered.filter(p =>
        p.donorName?.toLowerCase().includes(filter.search.toLowerCase()) ||
        p.donorEmail?.toLowerCase().includes(filter.search.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.method !== 'all') filtered = filtered.filter(p => p.method === filter.method);
    if (filter.status !== 'all') filtered = filtered.filter(p => p.status === filter.status);
    if (filter.dateFrom) filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(filter.dateFrom));
    if (filter.dateTo) filtered = filtered.filter(p => new Date(p.createdAt) <= new Date(filter.dateTo));

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filteredPayments = getFilteredPayments();

  const stats = {
    total: Array.isArray(payments) ? payments.length : 0,
    completed: Array.isArray(payments) ? payments.filter(p => p.status === 'completed').length : 0,
    pending: Array.isArray(payments) ? payments.filter(p => p.status === 'pending').length : 0,
    failed: Array.isArray(payments) ? payments.filter(p => p.status === 'failed').length : 0,
    refunded: Array.isArray(payments) ? payments.filter(p => p.status === 'refunded' || p.status === 'partial').length : 0,
    totalAmount: Array.isArray(payments) ? payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0,
    totalRefunded: Array.isArray(payments) ? payments
      .reduce((sum, p) => sum + (parseFloat(p.totalRefunded) || 0), 0) : 0,
    pendingAmount: Array.isArray(payments) ? payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0,
    byMethod: paymentMethods.map(method => ({
      ...method,
      count: Array.isArray(payments) ? payments.filter(p => p.method === method.id).length : 0,
      amount: Array.isArray(payments) ? payments
        .filter(p => p.method === method.id && p.status === 'completed')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0
    })),
    todayCount: Array.isArray(payments) ? payments.filter(p => {
      const today = new Date();
      const paymentDate = new Date(p.createdAt);
      return paymentDate.toDateString() === today.toDateString();
    }).length : 0,
    thisWeekAmount: Array.isArray(payments) ? payments.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.createdAt) >= weekAgo && p.status === 'completed';
    }).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0,
    thisMonthAmount: Array.isArray(payments) ? payments.filter(p => {
      const now = new Date();
      const paymentDate = new Date(p.createdAt);
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear() &&
             p.status === 'completed';
    }).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) : 0
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportPayments = () => {
    const csv = [
      ['Date', 'Transaction ID', 'Donor Name', 'Email', 'Amount', 'Method', 'Status', 'Card Type', 'Last 4', 'Notes'],
      ...filteredPayments.map(p => [
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
        p.transactionId || '',
        p.donorName || '',
        p.donorEmail || '',
        p.amount || '',
        paymentMethods.find(m => m.id === p.method)?.name || p.method,
        paymentStatus.find(s => s.id === p.status)?.name || p.status,
        p.cardType || '',
        p.cardLast4 || '',
        p.notes || ''
      ])
    ];

    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Process, track, and manage all club payments and transactions
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
                  setModalType('payment');
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-circle me-2"></i>Record Payment
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
                  {tab.id === 'pending' && stats.pending > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.pending}
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
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">💰</div>
                  <div className="text-green-600"><i className="bi bi-arrow-up text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalAmount)}</div>
                <div className="text-sm text-green-700 mt-1">Total Revenue</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">✅</div>
                  <div className="text-blue-600"><i className="bi bi-check-circle text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-blue-900">{stats.completed}</div>
                <div className="text-sm text-blue-700 mt-1">Completed</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-sm border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">⏳</div>
                  <div className="text-yellow-600"><i className="bi bi-clock text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
                <div className="text-sm text-yellow-700 mt-1">Pending</div>
                <div className="text-xs text-yellow-600 mt-1">{formatCurrency(stats.pendingAmount)}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">↩️</div>
                  <div className="text-orange-600"><i className="bi bi-arrow-counterclockwise text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-orange-900">{stats.refunded}</div>
                <div className="text-sm text-orange-700 mt-1">Refunded</div>
                <div className="text-xs text-orange-600 mt-1">{formatCurrency(stats.totalRefunded)}</div>
              </div>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-900">{stats.todayCount}</div>
                <div className="text-sm text-purple-700 mt-1">Payments Today</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-teal-900">{formatCurrency(stats.thisWeekAmount)}</div>
                <div className="text-sm text-teal-700 mt-1">This Week</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.thisMonthAmount)}</div>
                <div className="text-sm text-indigo-700 mt-1">This Month</div>
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payments by Method</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.byMethod.filter(m => m.count > 0).map((method) => (
                  <div key={method.id} className={`bg-${method.color}-50 p-4 rounded-lg border border-${method.color}-200 text-center`}>
                    <div className="text-3xl mb-2">{method.icon}</div>
                    <div className="font-semibold text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{method.count} payments</div>
                    <div className="text-lg font-bold text-green-600 mt-2">{formatCurrency(method.amount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Payment Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💳 What is Payment Management?</h2>
              <p className="text-gray-700 mb-4">
                Payment Management is your centralized payment processing and tracking system. It integrates with 
                multiple payment providers (Stripe, PayPal, Zelle, Venmo, etc.) to accept payments for registrations, 
                memberships, tournaments, and more. It provides complete payment history, refund processing, and 
                financial reporting.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💳 Payment Processing</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Multiple payment methods (10+)</li>
                    <li>• Credit/debit card processing</li>
                    <li>• Digital wallets (PayPal, Venmo, Zelle)</li>
                    <li>• Cash and check tracking</li>
                    <li>• Transaction IDs and references</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Tracking & Reporting</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Complete payment history</li>
                    <li>• Real-time status tracking</li>
                    <li>• Revenue analytics</li>
                    <li>• Method performance</li>
                    <li>• Export to CSV</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">↩️ Refund Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full and partial refunds</li>
                    <li>• Refund history tracking</li>
                    <li>• Reason documentation</li>
                    <li>• Automatic calculations</li>
                    <li>• Compliance logging</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Integration Points */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔗 System Integrations</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-2">📝</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Registrations</h3>
                  <p className="text-xs text-gray-600">Player registration payments</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl mb-2">👥</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Memberships</h3>
                  <p className="text-xs text-gray-600">Membership dues and renewals</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl mb-2">🛒</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Marketplace</h3>
                  <p className="text-xs text-gray-600">Equipment sales and rentals</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl mb-2">🏆</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Tournaments</h3>
                  <p className="text-xs text-gray-600">Tournament entry fees</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Payments / Completed / Pending / Refunded Tabs */}
        {(activeTab === 'all' || activeTab === 'completed' || activeTab === 'pending' || activeTab === 'refunded') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={filter.method}
                  onChange={(e) => setFilter(f => ({ ...f, method: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>{method.icon} {method.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  {paymentStatus.map(status => (
                    <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
                  placeholder="From"
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(f => ({ ...f, dateTo: e.target.value }))}
                  placeholder="To"
                  className="border rounded px-3 py-2"
                />
                <button
                  onClick={exportPayments}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <i className="bi bi-download me-2"></i>Export
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredPayments.length} of {payments.length} payments
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">💳</div>
                          <p className="text-lg font-semibold mb-2">No payments found</p>
                          <p className="text-sm">Payments will appear here as they are processed</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => {
                        const method = paymentMethods.find(m => m.id === payment.method);
                        const statusOption = paymentStatus.find(s => s.id === payment.status);

                        return (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                              <div className="text-xs text-gray-500">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleTimeString() : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                              {payment.transactionId || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{payment.donorName || 'Anonymous'}</div>
                              <div className="text-xs text-gray-500">{payment.donorEmail || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                              {payment.totalRefunded > 0 && (
                                <div className="text-xs text-orange-600">
                                  Refunded: {formatCurrency(payment.totalRefunded)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${method?.color}-100 text-${method?.color}-800`}>
                                {method?.icon} {method?.name}
                              </span>
                              {payment.cardType && payment.cardLast4 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {payment.cardType} ****{payment.cardLast4}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${statusOption?.color}-100 text-${statusOption?.color}-800`}>
                                {statusOption?.icon} {statusOption?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setModalType('view');
                                    setShowModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                {payment.status === 'completed' && (
                                  <button
                                    onClick={() => {
                                      const refundAmount = prompt(`Enter refund amount (max: $${payment.amount - (payment.totalRefunded || 0)}):`);
                                      const reason = prompt('Enter refund reason:');
                                      if (refundAmount && reason) {
                                        processRefund(payment._id, parseFloat(refundAmount), reason);
                                      }
                                    }}
                                    className="text-orange-600 hover:text-orange-800"
                                    title="Process Refund"
                                  >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                  </button>
                                )}
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Average Payment</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(stats.completed > 0 ? stats.totalAmount / stats.completed : 0)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Success Rate</h3>
                <div className="text-3xl font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Refund Rate</h3>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.completed > 0 ? Math.round((stats.refunded / stats.completed) * 100) : 0}%
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Net Revenue</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(stats.totalAmount - stats.totalRefunded)}
                </div>
              </div>
            </div>

            {/* Method Performance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method Performance</h2>
              <div className="space-y-4">
                {stats.byMethod.filter(m => m.amount > 0).map((method) => {
                  const percentage = stats.totalAmount > 0 ? (method.amount / stats.totalAmount) * 100 : 0;
                  return (
                    <div key={method.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {method.icon} {method.name} ({method.count} payments)
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(method.amount)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-${method.color}-600 h-3 rounded-full transition-all`}
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

        {/* Record Payment Modal */}
        {showModal && modalType === 'payment' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
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
                {/* Payment Amount */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Payment Amount</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full border rounded-lg pl-7 pr-3 py-2"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment For</label>
                      <select
                        value={paymentForm.paymentFor}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentFor: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {paymentTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payer Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Payer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payer Name *</label>
                      <input
                        type="text"
                        value={paymentForm.donorName}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, donorName: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={paymentForm.donorEmail}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, donorEmail: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Method *</label>
                      <select
                        value={paymentForm.method}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {paymentMethods.map(method => (
                          <option key={method.id} value={method.id}>{method.icon} {method.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        value={paymentForm.status}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {paymentStatus.slice(0, 3).map(status => (
                          <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                        ))}
                      </select>
                    </div>
                    {paymentForm.method === 'card' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                          <select
                            value={paymentForm.cardType}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, cardType: e.target.value }))}
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="">Select card type</option>
                            {cardTypes.map(card => (
                              <option key={card.id} value={card.id}>{card.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits</label>
                          <input
                            type="text"
                            value={paymentForm.cardLast4}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, cardLast4: e.target.value.slice(0, 4) }))}
                            className="w-full border rounded-lg px-3 py-2"
                            maxLength="4"
                            placeholder="1234"
                          />
                        </div>
                      </>
                    )}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction/Reference ID</label>
                      <input
                        type="text"
                        value={paymentForm.transactionId}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                        placeholder="e.g., PP-123456, TXN-789"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional information about this payment..."
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
                    onClick={savePayment}
                    disabled={loading || !paymentForm.amount || !paymentForm.donorName}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Payment Modal */}
        {showModal && modalType === 'view' && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-600">Transaction ID:</span>
                    <div className="font-mono font-semibold">{selectedPayment.transactionId || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Date:</span>
                    <div className="font-semibold">
                      {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Amount:</span>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedPayment.amount)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Method:</span>
                    <div className="font-semibold">
                      {paymentMethods.find(m => m.id === selectedPayment.method)?.name || selectedPayment.method}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Payer:</span>
                    <div className="font-semibold">{selectedPayment.donorName || 'Anonymous'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Email:</span>
                    <div className="font-semibold">{selectedPayment.donorEmail || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full bg-${paymentStatus.find(s => s.id === selectedPayment.status)?.color}-100 text-${paymentStatus.find(s => s.id === selectedPayment.status)?.color}-800`}>
                        {paymentStatus.find(s => s.id === selectedPayment.status)?.name}
                      </span>
                    </div>
                  </div>
                  {selectedPayment.totalRefunded > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Refunded:</span>
                      <div className="font-semibold text-orange-600">{formatCurrency(selectedPayment.totalRefunded)}</div>
                    </div>
                  )}
                </div>

                {selectedPayment.notes && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                    <p className="text-sm text-gray-700">{selectedPayment.notes}</p>
                  </div>
                )}

                {selectedPayment.refunds && selectedPayment.refunds.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Refund History:</h4>
                    <div className="space-y-2">
                      {selectedPayment.refunds.map((refund, index) => (
                        <div key={index} className="text-sm bg-white p-3 rounded border">
                          <div className="flex justify-between">
                            <span>{formatCurrency(refund.amount)}</span>
                            <span className="text-gray-500">
                              {refund.refundedAt ? new Date(refund.refundedAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          {refund.reason && (
                            <div className="text-xs text-gray-600 mt-1">Reason: {refund.reason}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagementSystem;

