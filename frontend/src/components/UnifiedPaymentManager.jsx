import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaDollarSign, FaCreditCard, FaUndo, FaSearch, FaFilter, FaDownload, FaPlus,
  FaCheckCircle, FaTimesCircle, FaClock, FaBan, FaExclamationTriangle,
  FaPaypal, FaMoneyBillWave, FaUniversity, FaMobileAlt, FaChartLine,
  FaReceipt, FaEdit, FaTrash, FaEye, FaFileExport, FaCalendarAlt,
  FaFileCsv, FaFileExcel, FaFilePdf, FaFileAlt, FaCaretDown, FaMoneyCheckAlt, FaUser,
  FaSyncAlt
} from 'react-icons/fa';
import { API_BASE_URL } from '../config/api';

export default function UnifiedPaymentManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    todayRevenue: 0,
    todayCount: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    avgTransactionAmount: 0,
    successRate: 0,
    refundRate: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentMethod: '',
    paymentType: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  // Form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [refundingPayment, setRefundingPayment] = useState(null);
  
  const [paymentForm, setPaymentForm] = useState({
    payerName: '',
    payerEmail: '',
    paymentType: 'Registration Fees',
    paymentMethod: 'credit_card',
    amount: 0,
    status: 'completed',
    transactionId: '',
    cardType: '',
    cardLastFour: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const [refundForm, setRefundForm] = useState({
    refundAmount: 0,
    refundReason: '',
    refundMethod: 'original',
    refundNotes: ''
  });

  // Issue Refund states
  const [showIssueRefundModal, setShowIssueRefundModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPaymentHistory, setUserPaymentHistory] = useState([]);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [issueRefundForm, setIssueRefundForm] = useState({
    userId: '',
    amount: 0,
    reason: '',
    paymentMethod: 'credit_card',
    notes: '',
    paymentType: 'Refund',
    cardLastFour: '',
    cardType: ''
  });

  const paymentTypes = [
    'Registration Fees',
    'Membership Dues',
    'Tournament Fees',
    'Training Sessions',
    'Equipment Purchase',
    'Uniform Purchase',
    'Camp/Clinic Fees',
    'Merchandise',
    'Marketplace Purchase',
    'Donations',
    'Sponsorship',
    'Other'
  ];

  const paymentMethods = [
    { value: 'credit_card', label: 'Credit Card', icon: FaCreditCard },
    { value: 'debit_card', label: 'Debit Card', icon: FaCreditCard },
    { value: 'paypal', label: 'PayPal', icon: FaPaypal },
    { value: 'venmo', label: 'Venmo', icon: FaMobileAlt },
    { value: 'zelle', label: 'Zelle', icon: FaMobileAlt },
    { value: 'cash_app', label: 'Cash App', icon: FaMobileAlt },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: FaUniversity },
    { value: 'check', label: 'Check', icon: FaReceipt },
    { value: 'cash', label: 'Cash', icon: FaMoneyBillWave },
    { value: 'other', label: 'Other', icon: FaDollarSign }
  ];

  const statusColors = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'info',
    cancelled: 'secondary'
  };

  const statusIcons = {
    completed: FaCheckCircle,
    pending: FaClock,
    failed: FaTimesCircle,
    refunded: FaUndo,
    cancelled: FaBan
  };

  // Load data
  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  // No longer needed - using button group instead of dropdown

  const loadPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payment/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        toast.error('Failed to load payments');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payment/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.payerName?.toLowerCase().includes(searchLower) ||
        p.payerEmail?.toLowerCase().includes(searchLower) ||
        p.transactionId?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(p => p.paymentMethod === filters.paymentMethod);
    }

    // Payment type filter
    if (filters.paymentType) {
      filtered = filtered.filter(p => p.paymentType === filters.paymentType);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(p => new Date(p.paymentDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(p => new Date(p.paymentDate) <= new Date(filters.dateTo));
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(p => p.amount >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(p => p.amount <= parseFloat(filters.maxAmount));
    }

    setFilteredPayments(filtered);
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const method = editingPayment ? 'PUT' : 'POST';
      const endpoint = editingPayment 
        ? `${API_BASE_URL}/payment/${editingPayment._id}`
        : `${API_BASE_URL}/payment`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentForm)
      });

      if (response.ok) {
        toast.success(editingPayment ? 'Payment updated successfully' : 'Payment created successfully');
        setShowPaymentForm(false);
        setEditingPayment(null);
        resetPaymentForm();
        loadPayments();
        loadStats();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Error saving payment');
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();

    if (!refundingPayment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payment/${refundingPayment._id}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refundForm)
      });

      if (response.ok) {
        toast.success('Refund processed successfully');
        setShowRefundForm(false);
        setRefundingPayment(null);
        resetRefundForm();
        loadPayments();
        loadStats();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Error processing refund');
    }
  };

  const handleDeletePayment = async (id) => {
    if (!confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payment/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Payment deleted successfully');
        loadPayments();
        loadStats();
      } else {
        toast.error('Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Error deleting payment');
    }
  };

  const handleExportCSV = () => {
    try {
      console.log('Exporting CSV...', filteredPayments.length, 'payments');
      const csv = [
        ['Date', 'Payer Name', 'Email', 'Type', 'Method', 'Amount', 'Status', 'Transaction ID'].join(','),
        ...filteredPayments.map(p => [
          new Date(p.paymentDate).toLocaleDateString(),
          p.payerName || '',
          p.payerEmail || '',
          p.paymentType || '',
          p.paymentMethod || '',
          p.amount || 0,
          p.status || '',
          p.transactionId || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('✅ Payments exported to CSV');
    } catch (error) {
      console.error('Export CSV error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportExcel = () => {
    try {
      console.log('Exporting Excel...', filteredPayments.length, 'payments');
      const data = filteredPayments.map(p => ({
        'Date': new Date(p.paymentDate).toLocaleDateString(),
        'Payer Name': p.payerName || '',
        'Email': p.payerEmail || '',
        'Type': p.paymentType || '',
        'Method': p.paymentMethod || '',
        'Amount': `$${(p.amount || 0).toFixed(2)}`,
        'Status': p.status || '',
        'Transaction ID': p.transactionId || ''
      }));

      const csv = [
        Object.keys(data[0] || {}).join('\t'),
        ...data.map(row => Object.values(row).join('\t'))
      ].join('\n');

      const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('✅ Payments exported to Excel');
    } catch (error) {
      console.error('Export Excel error:', error);
      toast.error('Failed to export Excel');
    }
  };

  const handleExportJSON = () => {
    try {
      console.log('Exporting JSON...', filteredPayments.length, 'payments');
      const json = JSON.stringify(filteredPayments, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `payments-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('✅ Payments exported to JSON');
    } catch (error) {
      console.error('Export JSON error:', error);
      toast.error('Failed to export JSON');
    }
  };

  const handleExportPDF = () => {
    console.log('PDF export clicked');
    toast.info('📄 PDF export will be implemented with a PDF library');
  };

  // Load users for refund issuing
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  // Load user payment history for card details
  const loadUserPaymentHistory = async (userId) => {
    if (!userId) {
      setUserPaymentHistory([]);
      return;
    }
    
    setLoadingUserDetails(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch payments filtered by user email
      const response = await fetch(`${API_BASE_URL}/payments?search=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userPayments = Array.isArray(data.payments) ? data.payments : Array.isArray(data) ? data : [];
        // Filter to get payments with card information
        const paymentsWithCards = userPayments.filter(p => 
          p.cardLastFour && ['credit_card', 'debit_card'].includes(p.paymentMethod)
        );
        setUserPaymentHistory(paymentsWithCards);
      }
    } catch (error) {
      console.error('Error loading user payment history:', error);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Handle user selection for refund
  const handleUserSelectForRefund = (userId) => {
    const user = users.find(u => u._id === userId);
    setSelectedUser(user);
    if (user) {
      loadUserPaymentHistory(user.email);
    } else {
      setUserPaymentHistory([]);
    }
  };

  // Issue refund to a user
  const handleIssueRefund = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    if (issueRefundForm.amount <= 0) {
      toast.error('Refund amount must be greater than 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payerName: selectedUser.name,
          payerEmail: selectedUser.email,
          paymentType: 'Refund',
          paymentMethod: issueRefundForm.paymentMethod,
          amount: -Math.abs(issueRefundForm.amount), // Negative for refund
          status: 'refunded',
          notes: `Refund issued: ${issueRefundForm.reason}\n${issueRefundForm.notes}`,
          paymentDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success(`Refund of $${issueRefundForm.amount} issued to ${selectedUser.name}`);
        setShowIssueRefundModal(false);
        setSelectedUser(null);
        setIssueRefundForm({
          userId: '',
          amount: 0,
          reason: '',
          paymentMethod: 'credit_card',
          notes: '',
          paymentType: 'Refund'
        });
        loadPayments();
        loadStats();
      } else {
        toast.error('Failed to issue refund');
      }
    } catch (error) {
      console.error('Error issuing refund:', error);
      toast.error('Error issuing refund');
    }
  };

  const openEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      payerName: payment.payerName || '',
      payerEmail: payment.payerEmail || '',
      paymentType: payment.paymentType || 'Registration Fees',
      paymentMethod: payment.paymentMethod || 'credit_card',
      amount: payment.amount || 0,
      status: payment.status || 'completed',
      transactionId: payment.transactionId || '',
      cardType: payment.cardType || '',
      cardLastFour: payment.cardLastFour || '',
      notes: payment.notes || '',
      paymentDate: payment.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowPaymentForm(true);
  };

  const openRefundForm = (payment) => {
    setRefundingPayment(payment);
    setRefundForm({
      refundAmount: payment.amount,
      refundReason: '',
      refundMethod: 'original',
      refundNotes: ''
    });
    setShowRefundForm(true);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      payerName: '',
      payerEmail: '',
      paymentType: 'Registration Fees',
      paymentMethod: 'credit_card',
      amount: 0,
      status: 'completed',
      transactionId: '',
      cardType: '',
      cardLastFour: '',
      notes: '',
      paymentDate: new Date().toISOString().split('T')[0]
    });
  };

  const resetRefundForm = () => {
    setRefundForm({
      refundAmount: 0,
      refundReason: '',
      refundMethod: 'original',
      refundNotes: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const StatusIcon = statusIcons[status];
    return (
      <span className={`badge bg-${statusColors[status]} d-inline-flex align-items-center gap-1`}>
        <StatusIcon className="small" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    const methodObj = paymentMethods.find(m => m.value === method);
    if (methodObj) {
      const Icon = methodObj.icon;
      return <Icon className="me-1" />;
    }
    return <FaDollarSign className="me-1" />;
  };

  return (
    <div className="h-100 d-flex flex-column" style={{maxHeight: 'calc(100vh - 100px)', overflow: 'hidden'}}>
      {/* Header */}
      <div className="bg-white border-bottom p-3 flex-shrink-0">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-0 h4 d-flex align-items-center">
              <FaDollarSign className="text-success me-2" />
              Payment Management
            </h2>
          </div>
          <div className="d-flex align-items-center" style={{gap: '10px'}}>
            <button 
              className="btn btn-sm btn-outline-success d-flex align-items-center"
              onClick={() => {
                loadPayments();
                loadStats();
              }}
              disabled={loading}
            >
              <FaSyncAlt className="me-1" />
              Refresh
            </button>
            
            {/* Export Button Group */}
            <div className="btn-group">
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleExportCSV}
                disabled={filteredPayments.length === 0}
                title="Export to CSV"
              >
                <FaFileCsv className="me-1" />
                CSV
              </button>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleExportExcel}
                disabled={filteredPayments.length === 0}
                title="Export to Excel"
              >
                <FaFileExcel className="me-1" />
                Excel
              </button>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleExportJSON}
                disabled={filteredPayments.length === 0}
                title="Export to JSON"
              >
                <FaFileAlt className="me-1" />
                JSON
              </button>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={handleExportPDF}
                disabled={filteredPayments.length === 0}
                title="Export to PDF"
              >
                <FaFilePdf className="me-1" />
                PDF
              </button>
            </div>

            <button 
              className="btn btn-sm btn-warning d-flex align-items-center"
              onClick={() => {
                setShowIssueRefundModal(true);
                loadUsers();
              }}
            >
              <FaMoneyCheckAlt className="me-1" />
              Issue Refund
            </button>
            
            <button 
              className="btn btn-sm btn-success d-flex align-items-center"
              onClick={() => {
                resetPaymentForm();
                setEditingPayment(null);
                setShowPaymentForm(true);
              }}
            >
              <FaPlus className="me-1" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav mt-3 mb-0 border-bottom" style={{gap: '8px'}}>
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'all', label: 'All Payments', icon: FaReceipt },
            { id: 'completed', label: 'Completed', icon: FaCheckCircle },
            { id: 'pending', label: 'Pending', icon: FaClock },
            { id: 'refunded', label: 'Refunded', icon: FaUndo },
            { id: 'failed', label: 'Failed', icon: FaTimesCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`btn btn-sm ${isActive ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'overview') {
                      setFilters({...filters, status: tab.id === 'all' ? '' : tab.id});
                    }
                  }}
                  style={{
                    borderRadius: '8px 8px 0 0',
                    marginBottom: '-1px',
                    fontSize: '14px',
                    padding: '8px 16px'
                  }}
                >
                  <Icon className="me-1" />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Content Area with Scrolling */}
      <div className="flex-grow-1" style={{overflowY: 'auto', overflowX: 'hidden', padding: '20px'}}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
            <div className="col-lg-3 col-md-6 col-sm-6 mb-3">
              <div className="card border-success h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Total Revenue</p>
                      <h4 className="mb-0 text-success">{formatCurrency(stats.totalRevenue)}</h4>
                      <small className="text-muted">{stats.completedPayments} payments</small>
                    </div>
                    <FaDollarSign className="fs-1 text-success opacity-25" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-6 mb-3">
              <div className="card border-warning h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Pending Amount</p>
                      <h4 className="mb-0 text-warning">{formatCurrency(stats.pendingAmount)}</h4>
                      <small className="text-muted">Awaiting</small>
                    </div>
                    <FaClock className="fs-1 text-warning opacity-25" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-6 mb-3">
              <div className="card border-info h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Today's Revenue</p>
                      <h4 className="mb-0 text-info">{formatCurrency(stats.todayRevenue)}</h4>
                      <small className="text-muted">{stats.todayCount} today</small>
                    </div>
                    <FaCalendarAlt className="fs-1 text-info opacity-25" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6 col-sm-6 mb-3">
              <div className="card border-danger h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 small">Refunded Amount</p>
                      <h4 className="mb-0 text-danger">{formatCurrency(stats.refundedAmount)}</h4>
                      <small className="text-muted">{stats.refundRate.toFixed(1)}% rate</small>
                    </div>
                    <FaUndo className="fs-1 text-danger opacity-25" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="row g-2 mb-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-3">
                  <p className="text-muted mb-1 small">This Week</p>
                  <h5 className="text-success mb-0">{formatCurrency(stats.weekRevenue)}</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-3">
                  <p className="text-muted mb-1 small">This Month</p>
                  <h5 className="text-primary mb-0">{formatCurrency(stats.monthRevenue)}</h5>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body p-3">
                  <p className="text-muted mb-1 small">Average Transaction</p>
                  <h5 className="text-info mb-0">{formatCurrency(stats.avgTransactionAmount)}</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Tracking */}
          <div className="card mb-4">
            <div className="card-header bg-warning text-white">
              <h5 className="mb-0">
                <FaUndo className="me-2" />
                Refund Tracking
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">Total Refunds Issued</h6>
                    <h3 className="text-danger mb-0">
                      {formatCurrency(payments.filter(p => p.paymentType === 'Refund' && p.amount < 0).reduce((sum, p) => sum + Math.abs(p.amount), 0))}
                    </h3>
                    <small className="text-muted">
                      {payments.filter(p => p.paymentType === 'Refund' && p.amount < 0).length} refund(s)
                    </small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">Refunds This Month</h6>
                    <h3 className="text-warning mb-0">
                      {formatCurrency(payments.filter(p => {
                        const isRefund = p.paymentType === 'Refund' && p.amount < 0;
                        const thisMonth = new Date(p.paymentDate).getMonth() === new Date().getMonth();
                        return isRefund && thisMonth;
                      }).reduce((sum, p) => sum + Math.abs(p.amount), 0))}
                    </h3>
                    <small className="text-muted">
                      {payments.filter(p => {
                        const isRefund = p.paymentType === 'Refund' && p.amount < 0;
                        const thisMonth = new Date(p.paymentDate).getMonth() === new Date().getMonth();
                        return isRefund && thisMonth;
                      }).length} refund(s)
                    </small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">Avg Refund Amount</h6>
                    <h3 className="text-info mb-0">
                      {formatCurrency(
                        payments.filter(p => p.paymentType === 'Refund' && p.amount < 0).length > 0
                          ? Math.abs(payments.filter(p => p.paymentType === 'Refund' && p.amount < 0).reduce((sum, p) => sum + p.amount, 0)) / 
                            payments.filter(p => p.paymentType === 'Refund' && p.amount < 0).length
                          : 0
                      )}
                    </h3>
                    <small className="text-muted">per transaction</small>
                  </div>
                </div>
              </div>

              {/* Recent Refunds */}
              <div className="mt-4">
                <h6 className="mb-3">Recent Refunds</h6>
                {payments.filter(p => p.paymentType === 'Refund' && p.amount < 0).length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <FaUndo className="display-4 mb-2" style={{opacity: 0.3}} />
                    <p className="mb-0">No refunds issued yet</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>User</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.filter(p => p.paymentType === 'Refund' && p.amount < 0).slice(0, 5).map(refund => (
                          <tr key={refund._id}>
                            <td>{new Date(refund.paymentDate).toLocaleDateString()}</td>
                            <td>
                              <div>
                                <strong>{refund.payerName}</strong><br />
                                <small className="text-muted">{refund.payerEmail}</small>
                              </div>
                            </td>
                            <td className="text-danger fw-bold">{formatCurrency(Math.abs(refund.amount))}</td>
                            <td>{paymentMethods.find(m => m.value === refund.paymentMethod)?.label || refund.paymentMethod}</td>
                            <td>
                              <small className="text-muted">{refund.notes?.split('\n')[0] || 'N/A'}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Revenue Trends</h5>
              <div className="text-center py-5 text-muted">
                <FaChartLine className="display-1 mb-3" />
                <p>Revenue analytics and trends charts will appear here</p>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Payments List Tabs */}
        {activeTab !== 'overview' && (
          <div>
          {/* Filters */}
          <div className="card mb-3">
            <div className="card-body p-3">
              <div className="row g-2">
                <div className="col-md-3">
                  <label className="form-label small">Search</label>
                  <div className="input-group">
                    <span className="input-group-text"><FaSearch /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Name, email, transaction ID..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                </div>

                <div className="col-md-2">
                  <label className="form-label small">Payment Method</label>
                  <select
                    className="form-select"
                    value={filters.paymentMethod}
                    onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
                  >
                    <option value="">All Methods</option>
                    {paymentMethods.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label small">Payment Type</label>
                  <select
                    className="form-select"
                    value={filters.paymentType}
                    onChange={(e) => setFilters({...filters, paymentType: e.target.value})}
                  >
                    <option value="">All Types</option>
                    {paymentTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label small">From Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label small">To Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>

                <div className="col-md-1">
                  <label className="form-label small">&nbsp;</label>
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setFilters({
                      search: '',
                      status: activeTab === 'all' ? '' : activeTab,
                      paymentMethod: '',
                      paymentType: '',
                      dateFrom: '',
                      dateTo: '',
                      minAmount: '',
                      maxAmount: ''
                    })}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="card">
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  {filteredPayments.length} Payment{filteredPayments.length !== 1 ? 's' : ''}
                </h5>
                <span className="text-muted">
                  Total: {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <FaReceipt className="display-1 mb-3" />
                  <p>No payments found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Payer</th>
                        <th>Type</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map(payment => (
                        <tr key={payment._id}>
                          <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td>
                            <div>
                              <strong>{payment.payerName}</strong>
                              <br />
                              <small className="text-muted">{payment.payerEmail}</small>
                            </div>
                          </td>
                          <td>{payment.paymentType}</td>
                          <td>
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            {paymentMethods.find(m => m.value === payment.paymentMethod)?.label || payment.paymentMethod}
                          </td>
                          <td className="fw-bold">{formatCurrency(payment.amount)}</td>
                          <td>{getStatusBadge(payment.status)}</td>
                          <td>
                            <code className="small">{payment.transactionId || '-'}</code>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => openEditPayment(payment)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              {payment.status === 'completed' && (
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => openRefundForm(payment)}
                                  title="Refund"
                                >
                                  <FaUndo />
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeletePayment(payment._id)}
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
            </div>
          </div>
        </div>
        )}
      </div>
      {/* End Content Area */}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleCreatePayment}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingPayment ? 'Edit Payment' : 'Record New Payment'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setEditingPayment(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Payer Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={paymentForm.payerName}
                        onChange={(e) => setPaymentForm({...paymentForm, payerName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payer Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={paymentForm.payerEmail}
                        onChange={(e) => setPaymentForm({...paymentForm, payerEmail: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Type *</label>
                      <select
                        className="form-select"
                        value={paymentForm.paymentType}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentType: e.target.value})}
                        required
                      >
                        {paymentTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Payment Method *</label>
                      <select
                        className="form-select"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                        required
                      >
                        {paymentMethods.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Amount *</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={paymentForm.amount || ''}
                          onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Status *</label>
                      <select
                        className="form-select"
                        value={paymentForm.status}
                        onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}
                        required
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Payment Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Transaction ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={paymentForm.transactionId}
                        onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Card Type</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Visa, MC, Amex..."
                        value={paymentForm.cardType}
                        onChange={(e) => setPaymentForm({...paymentForm, cardType: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Last 4 Digits</label>
                      <input
                        type="text"
                        className="form-control"
                        maxLength="4"
                        placeholder="1234"
                        value={paymentForm.cardLastFour}
                        onChange={(e) => setPaymentForm({...paymentForm, cardLastFour: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={paymentForm.notes}
                        onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPaymentForm(false);
                      setEditingPayment(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editingPayment ? 'Update Payment' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Refund Form Modal */}
      {showRefundForm && refundingPayment && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleProcessRefund}>
                <div className="modal-header">
                  <h5 className="modal-title">Process Refund</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowRefundForm(false);
                      setRefundingPayment(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <strong>Original Payment:</strong>
                    <br />
                    Payer: {refundingPayment.payerName}
                    <br />
                    Amount: {formatCurrency(refundingPayment.amount)}
                    <br />
                    Date: {new Date(refundingPayment.paymentDate).toLocaleDateString()}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Refund Amount *</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        max={refundingPayment.amount}
                        value={refundForm.refundAmount || ''}
                        onChange={(e) => setRefundForm({...refundForm, refundAmount: parseFloat(e.target.value) || 0})}
                        required
                      />
                    </div>
                    <small className="text-muted">
                      Max: {formatCurrency(refundingPayment.amount)}
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Refund Reason *</label>
                    <select
                      className="form-select"
                      value={refundForm.refundReason}
                      onChange={(e) => setRefundForm({...refundForm, refundReason: e.target.value})}
                      required
                    >
                      <option value="">Select reason...</option>
                      <option value="customer_request">Customer Request</option>
                      <option value="duplicate_payment">Duplicate Payment</option>
                      <option value="service_not_provided">Service Not Provided</option>
                      <option value="event_cancelled">Event Cancelled</option>
                      <option value="error">Payment Error</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Refund Method</label>
                    <select
                      className="form-select"
                      value={refundForm.refundMethod}
                      onChange={(e) => setRefundForm({...refundForm, refundMethod: e.target.value})}
                    >
                      <option value="original">Original Payment Method</option>
                      <option value="check">Check</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={refundForm.refundNotes}
                      onChange={(e) => setRefundForm({...refundForm, refundNotes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRefundForm(false);
                      setRefundingPayment(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    <FaUndo className="me-1" />
                    Process Refund
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Refund Modal */}
      {showIssueRefundModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleIssueRefund}>
                <div className="modal-header bg-warning text-white">
                  <h5 className="modal-title">
                    <FaMoneyCheckAlt className="me-2" />
                    Issue Refund to User
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowIssueRefundModal(false);
                      setSelectedUser(null);
                      setUserPaymentHistory([]);
                      setIssueRefundForm({
                        userId: '',
                        amount: 0,
                        reason: '',
                        paymentMethod: 'credit_card',
                        notes: '',
                        paymentType: 'Refund',
                        cardLastFour: '',
                        cardType: ''
                      });
                    }}
                  />
                </div>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <small>
                      <strong>Note:</strong> Select a registered user and specify the refund amount and payment method. 
                      The refund will be recorded as a negative payment transaction for tracking purposes.
                    </small>
                  </div>

                  <div className="row g-3">
                    {/* User Selection */}
                    <div className="col-12">
                      <label className="form-label">
                        <FaUser className="me-1" />
                        Select User <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={selectedUser?._id || ''}
                        onChange={(e) => handleUserSelectForRefund(e.target.value)}
                        required
                      >
                        <option value="">-- Select a user --</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* User Information Display */}
                    {selectedUser && (
                      <div className="col-12">
                        <div className="card bg-light border">
                          <div className="card-body py-3">
                            <h6 className="card-title mb-3">
                              <FaUser className="me-2 text-primary" />
                              User Information
                            </h6>
                            {loadingUserDetails ? (
                              <div className="text-center py-2">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                Loading user details...
                              </div>
                            ) : (
                              <div className="row g-2">
                                <div className="col-md-6">
                                  <small className="text-muted d-block">Full Name</small>
                                  <strong>{selectedUser.name || 'N/A'}</strong>
                                </div>
                                <div className="col-md-6">
                                  <small className="text-muted d-block">Email</small>
                                  <strong>{selectedUser.email || 'N/A'}</strong>
                                </div>
                                <div className="col-md-6">
                                  <small className="text-muted d-block">Phone</small>
                                  <strong>{selectedUser.phone || 'N/A'}</strong>
                                </div>
                                <div className="col-md-6">
                                  <small className="text-muted d-block">Username</small>
                                  <strong>@{selectedUser.username || 'N/A'}</strong>
                                </div>
                                {(selectedUser.address || selectedUser.city || selectedUser.state || selectedUser.zipCode) && (
                                  <div className="col-12">
                                    <small className="text-muted d-block">Address</small>
                                    <strong>
                                      {[
                                        selectedUser.address,
                                        selectedUser.city,
                                        selectedUser.state,
                                        selectedUser.zipCode,
                                        selectedUser.country
                                      ].filter(Boolean).join(', ') || 'No address on file'}
                                    </strong>
                                  </div>
                                )}
                                {userPaymentHistory.length > 0 && (
                                  <div className="col-12 mt-2">
                                    <small className="text-muted d-block mb-1">Cards on File</small>
                                    <div className="d-flex flex-wrap gap-2">
                                      {userPaymentHistory.map((payment, idx) => (
                                        <span 
                                          key={idx} 
                                          className="badge bg-secondary d-flex align-items-center"
                                          style={{cursor: 'pointer'}}
                                          onClick={() => setIssueRefundForm(prev => ({
                                            ...prev, 
                                            paymentMethod: payment.paymentMethod,
                                            notes: prev.notes + (prev.notes ? '\n' : '') + `Card: ${payment.cardType || 'Card'} ****${payment.cardLastFour}`
                                          }))}
                                          title="Click to use this card for refund"
                                        >
                                          <FaCreditCard className="me-1" />
                                          {payment.cardType || (payment.paymentMethod === 'credit_card' ? 'Credit' : 'Debit')} ****{payment.cardLastFour}
                                        </span>
                                      ))}
                                    </div>
                                    <small className="text-muted">Click a card to select it for refund</small>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Refund Amount */}
                    <div className="col-md-6">
                      <label className="form-label">
                        <FaDollarSign className="me-1" />
                        Refund Amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          value={issueRefundForm.amount || ''}
                          onChange={(e) => setIssueRefundForm({...issueRefundForm, amount: parseFloat(e.target.value) || 0})}
                          step="0.01"
                          min="0.01"
                          required
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="col-md-6">
                      <label className="form-label">
                        <FaCreditCard className="me-1" />
                        Refund Method <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={issueRefundForm.paymentMethod}
                        onChange={(e) => setIssueRefundForm({...issueRefundForm, paymentMethod: e.target.value})}
                        required
                      >
                        {paymentMethods.map(method => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Card Last 4 Display for Credit/Debit */}
                    {['credit_card', 'debit_card'].includes(issueRefundForm.paymentMethod) && userPaymentHistory.length > 0 && (
                      <div className="col-12">
                        <label className="form-label">
                          <FaCreditCard className="me-1" />
                          Select Card to Refund
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {userPaymentHistory
                            .filter(p => p.paymentMethod === issueRefundForm.paymentMethod)
                            .map((payment, idx) => (
                              <div 
                                key={idx}
                                className={`card p-2 ${issueRefundForm.cardLastFour === payment.cardLastFour ? 'border-primary bg-primary bg-opacity-10' : 'border'}`}
                                style={{cursor: 'pointer', minWidth: '150px'}}
                                onClick={() => setIssueRefundForm(prev => ({
                                  ...prev,
                                  cardLastFour: payment.cardLastFour,
                                  cardType: payment.cardType
                                }))}
                              >
                                <div className="d-flex align-items-center">
                                  <FaCreditCard className={`me-2 ${issueRefundForm.cardLastFour === payment.cardLastFour ? 'text-primary' : 'text-muted'}`} />
                                  <div>
                                    <small className="text-muted d-block">{payment.cardType || 'Card'}</small>
                                    <strong>**** **** **** {payment.cardLastFour}</strong>
                                  </div>
                                </div>
                              </div>
                            ))}
                          {userPaymentHistory.filter(p => p.paymentMethod === issueRefundForm.paymentMethod).length === 0 && (
                            <div className="alert alert-warning py-2 mb-0 w-100">
                              <small>No {issueRefundForm.paymentMethod === 'credit_card' ? 'credit' : 'debit'} card payments found for this user.</small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Refund Reason */}
                    <div className="col-12">
                      <label className="form-label">
                        Refund Reason <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={issueRefundForm.reason}
                        onChange={(e) => setIssueRefundForm({...issueRefundForm, reason: e.target.value})}
                        required
                      >
                        <option value="">-- Select a reason --</option>
                        <option value="Overpayment">Overpayment</option>
                        <option value="Duplicate Payment">Duplicate Payment</option>
                        <option value="Event Cancellation">Event Cancellation</option>
                        <option value="Service Not Rendered">Service Not Rendered</option>
                        <option value="Customer Request">Customer Request</option>
                        <option value="Processing Error">Processing Error</option>
                        <option value="Membership Cancellation">Membership Cancellation</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Additional Notes */}
                    <div className="col-12">
                      <label className="form-label">Additional Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={issueRefundForm.notes}
                        onChange={(e) => setIssueRefundForm({...issueRefundForm, notes: e.target.value})}
                        placeholder="Enter any additional details about this refund..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowIssueRefundModal(false);
                      setSelectedUser(null);
                      setUserPaymentHistory([]);
                      setIssueRefundForm({
                        userId: '',
                        amount: 0,
                        reason: '',
                        paymentMethod: 'credit_card',
                        notes: '',
                        paymentType: 'Refund',
                        cardLastFour: '',
                        cardType: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    <FaMoneyCheckAlt className="me-1" />
                    Issue Refund
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

