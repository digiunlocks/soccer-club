import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

const API_URL = API_BASE_URL;

const FinanceManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [declinedPayments, setDeclinedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('transaction'); // transaction, invoice, refund
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    todayRevenue: 0,
    todayCount: 0
  });
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    category: 'all',
    paymentType: 'all'
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [transactionForm, setTransactionForm] = useState({
    type: 'income',
    category: 'registration',
    amount: '',
    description: '',
    payer: '',
    paymentMethod: 'credit_card',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    notes: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    customerName: '',
    customerEmail: '',
    items: [{ description: '', quantity: 1, unitPrice: '', amount: '' }],
    subtotal: 0,
    tax: 0,
    total: 0,
    dueDate: '',
    status: 'draft',
    notes: '',
    paymentTerms: 'net_30'
  });

  const [refundForm, setRefundForm] = useState({
    originalTransactionId: '',
    amount: '',
    reason: '',
    refundReason: 'customer_request',
    refundMethod: 'original',
    processedBy: '',
    approvedBy: '',
    refundPercentage: 100,
    notes: ''
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'transactions', name: 'Transactions', icon: '💳' },
    { id: 'payments', name: 'Payment History', icon: '💵' },
    { id: 'declined', name: 'Declined/Failed', icon: '❌' },
    { id: 'invoices', name: 'Invoices', icon: '📄' },
    { id: 'refunds', name: 'Refunds', icon: '↩️' },
    { id: 'profit-loss', name: 'Profit & Loss', icon: '📈' },
    { id: 'reports', name: 'Reports', icon: '📋' }
  ];

  const transactionTypes = [
    { id: 'income', name: 'Income', icon: '📈', color: 'green' },
    { id: 'expense', name: 'Expense', icon: '📉', color: 'red' }
  ];

  const incomeCategories = [
    { id: 'registration', name: 'Registration Fees', icon: '📝' },
    { id: 'membership', name: 'Membership Dues', icon: '👥' },
    { id: 'sponsorship', name: 'Sponsorships', icon: '🤝' },
    { id: 'fundraising', name: 'Fundraising', icon: '🎗️' },
    { id: 'merchandise', name: 'Merchandise Sales', icon: '👕' },
    { id: 'tournament', name: 'Tournament Fees', icon: '🏆' },
    { id: 'donations', name: 'Donations', icon: '💝' },
    { id: 'marketplace', name: 'Marketplace Sales', icon: '🛒' },
    { id: 'camps', name: 'Camps/Clinics', icon: '⚽' },
    { id: 'other_income', name: 'Other Income', icon: '💵' }
  ];

  const expenseCategories = [
    { id: 'equipment', name: 'Equipment', icon: '⚽' },
    { id: 'uniforms', name: 'Uniforms', icon: '👕' },
    { id: 'facility', name: 'Facility Rental', icon: '🏟️' },
    { id: 'coaching', name: 'Coaching Salaries', icon: '👨‍🏫' },
    { id: 'travel', name: 'Travel Expenses', icon: '🚌' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'utilities', name: 'Utilities', icon: '💡' },
    { id: 'marketing', name: 'Marketing', icon: '📢' },
    { id: 'administrative', name: 'Administrative', icon: '📋' },
    { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
    { id: 'referee', name: 'Referee Fees', icon: '🟨' },
    { id: 'other_expense', name: 'Other Expenses', icon: '💸' }
  ];

  const paymentMethods = [
    { id: 'credit_card', name: 'Credit Card', icon: '💳' },
    { id: 'debit_card', name: 'Debit Card', icon: '💳' },
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'check', name: 'Check', icon: '📝' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'stripe', name: 'Stripe', icon: '💰' },
    { id: 'other', name: 'Other', icon: '💳' }
  ];

  const refundReasons = [
    { id: 'customer_request', name: 'Customer Request', icon: '👤' },
    { id: 'event_cancelled', name: 'Event Cancelled', icon: '🚫' },
    { id: 'duplicate_payment', name: 'Duplicate Payment', icon: '🔄' },
    { id: 'service_not_delivered', name: 'Service Not Delivered', icon: '❌' },
    { id: 'overcharged', name: 'Overcharged/Billing Error', icon: '💰' },
    { id: 'player_withdrew', name: 'Player Withdrew', icon: '🚶' },
    { id: 'injury', name: 'Injury/Medical Reasons', icon: '🏥' },
    { id: 'dissatisfaction', name: 'Customer Dissatisfaction', icon: '😞' },
    { id: 'policy_violation', name: 'Club Policy Violation', icon: '⚖️' },
    { id: 'technical_error', name: 'Technical/System Error', icon: '🔧' },
    { id: 'goodwill', name: 'Goodwill Gesture', icon: '🤝' },
    { id: 'fraud', name: 'Fraudulent Transaction', icon: '⚠️' },
    { id: 'chargeback', name: 'Chargeback/Dispute', icon: '🔙' },
    { id: 'weather', name: 'Weather Cancellation', icon: '🌧️' },
    { id: 'family_emergency', name: 'Family Emergency', icon: '🚨' },
    { id: 'relocation', name: 'Relocation/Moving', icon: '📦' },
    { id: 'financial_hardship', name: 'Financial Hardship', icon: '💔' },
    { id: 'other', name: 'Other Reason', icon: '📝' }
  ];

  const refundMethods = [
    { id: 'original', name: 'Original Payment Method', icon: '🔄', description: 'Refund to the same method used for payment' },
    { id: 'credit_card', name: 'Credit Card', icon: '💳', description: 'Refund to credit card' },
    { id: 'debit_card', name: 'Debit Card', icon: '💳', description: 'Refund to debit card' },
    { id: 'check', name: 'Check (Mail)', icon: '📮', description: 'Mail physical check to customer' },
    { id: 'cash', name: 'Cash (In-Person)', icon: '💵', description: 'Cash refund at office' },
    { id: 'bank_transfer', name: 'Bank Transfer/ACH', icon: '🏦', description: 'Direct deposit to bank account' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️', description: 'Refund via PayPal' },
    { id: 'stripe', name: 'Stripe', icon: '💰', description: 'Refund via Stripe' },
    { id: 'venmo', name: 'Venmo', icon: '💸', description: 'Refund via Venmo' },
    { id: 'zelle', name: 'Zelle', icon: '⚡', description: 'Refund via Zelle' },
    { id: 'store_credit', name: 'Store Credit', icon: '🎟️', description: 'Credit for future purchases' },
    { id: 'account_credit', name: 'Account Credit', icon: '💰', description: 'Credit to customer account' },
    { id: 'wire_transfer', name: 'Wire Transfer', icon: '🌐', description: 'International wire transfer' },
    { id: 'money_order', name: 'Money Order', icon: '📄', description: 'Postal money order' },
    { id: 'gift_card', name: 'Gift Card', icon: '🎁', description: 'Club gift card' },
    { id: 'other', name: 'Other Method', icon: '💳', description: 'Alternative refund method' }
  ];

  const transactionStatus = [
    { id: 'completed', name: 'Completed', icon: '✅', color: 'green' },
    { id: 'pending', name: 'Pending', icon: '⏳', color: 'yellow' },
    { id: 'failed', name: 'Failed', icon: '❌', color: 'red' },
    { id: 'refunded', name: 'Refunded', icon: '↩️', color: 'blue' },
    { id: 'cancelled', name: 'Cancelled', icon: '🚫', color: 'gray' }
  ];

  const invoiceStatus = [
    { id: 'draft', name: 'Draft', icon: '📝', color: 'gray' },
    { id: 'sent', name: 'Sent', icon: '📧', color: 'blue' },
    { id: 'paid', name: 'Paid', icon: '✅', color: 'green' },
    { id: 'overdue', name: 'Overdue', icon: '⚠️', color: 'red' },
    { id: 'cancelled', name: 'Cancelled', icon: '🚫', color: 'gray' }
  ];

  useEffect(() => {
    document.title = 'Financial Management - Seattle Leopards FC Admin';
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadTransactions(),
      loadPayments(),
      loadDeclinedPayments(),
      loadPaymentStats(),
      loadInvoices()
    ]);
    setLoading(false);
  };

  const loadTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/financial-transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(Array.isArray(data.transactions) ? data.transactions : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const loadPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(Array.isArray(data.payments) ? data.payments : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]);
    }
  };

  const loadDeclinedPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments?status=failed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const allPayments = Array.isArray(data.payments) ? data.payments : Array.isArray(data) ? data : [];
        // Get all failed and cancelled payments
        const declined = allPayments.filter(p => ['failed', 'cancelled'].includes(p.status));
        setDeclinedPayments(declined);
      }
    } catch (error) {
      console.error('Error loading declined payments:', error);
      setDeclinedPayments([]);
    }
  };

  const loadPaymentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentStats(data);
      }
    } catch (error) {
      console.error('Error loading payment stats:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(Array.isArray(data.invoices) ? data.invoices : Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const saveTransaction = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = editingItem 
        ? `${API_URL}/financial-transactions/${editingItem._id}` 
        : `${API_URL}/financial-transactions`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionForm)
      });

      if (response.ok) {
        toast.success(`Transaction ${editingItem ? 'updated' : 'added'} successfully!`);
        loadTransactions();
        loadPaymentStats();
        setShowModal(false);
        resetForms();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  const saveInvoice = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = editingItem 
        ? `${API_URL}/invoices/${editingItem._id}` 
        : `${API_URL}/invoices`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invoiceForm)
      });

      if (response.ok) {
        toast.success(`Invoice ${editingItem ? 'updated' : 'created'} successfully!`);
        loadInvoices();
        setShowModal(false);
        resetForms();
      } else {
        toast.error('Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Error saving invoice');
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // If we have a selected payment, process refund via payment endpoint
      if (selectedPayment) {
        const response = await fetch(`${API_URL}/payments/${selectedPayment._id}/refund`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: parseFloat(refundForm.amount),
            reason: `${refundForm.refundReason}: ${refundForm.reason}`
          })
        });

        if (response.ok) {
          toast.success('Refund processed successfully!');
          loadAllData();
          setShowModal(false);
          resetForms();
          setSelectedPayment(null);
        } else {
          const error = await response.json();
          toast.error(error.error || 'Failed to process refund');
        }
      } else {
        // Process as a general expense transaction
        const refundTransaction = {
          type: 'expense',
          category: 'Refunds',
          amount: parseFloat(refundForm.amount),
          description: `Refund: ${refundForm.reason}`,
          date: new Date().toISOString(),
          paymentMethod: refundForm.refundMethod,
          status: 'completed',
          notes: `Reason: ${refundForm.refundReason}. Processed by: ${refundForm.processedBy}. Approved by: ${refundForm.approvedBy}`
        };

        const response = await fetch(`${API_URL}/financial-transactions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(refundTransaction)
        });

        if (response.ok) {
          toast.success('Refund recorded successfully!');
          loadAllData();
          setShowModal(false);
          resetForms();
        } else {
          toast.error('Failed to record refund');
        }
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Error processing refund');
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'pending' })
      });

      if (response.ok) {
        toast.success('Payment marked for retry');
        loadAllData();
      } else {
        toast.error('Failed to retry payment');
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast.error('Error retrying payment');
    }
  };

  const resetForms = () => {
    setTransactionForm({
      type: 'income',
      category: 'registration',
      amount: '',
      description: '',
      payer: '',
      paymentMethod: 'credit_card',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: ''
    });
    setInvoiceForm({
      invoiceNumber: '',
      customerName: '',
      customerEmail: '',
      items: [{ description: '', quantity: 1, unitPrice: '', amount: '' }],
      subtotal: 0,
      tax: 0,
      total: 0,
      dueDate: '',
      status: 'draft',
      notes: '',
      paymentTerms: 'net_30'
    });
    setRefundForm({
      originalTransactionId: '',
      amount: '',
      reason: '',
      refundReason: 'customer_request',
      refundMethod: 'original',
      processedBy: '',
      approvedBy: '',
      refundPercentage: 100,
      notes: ''
    });
    setEditingItem(null);
  };

  const calculateInvoiceTotal = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => {
      const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
      return sum + amount;
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    setInvoiceForm(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: '', amount: '' }]
    }));
  };

  const removeInvoiceItem = (index) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setTimeout(calculateInvoiceTotal, 0);
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].unitPrice) || 0);
    }
    
    setInvoiceForm(prev => ({ ...prev, items: newItems }));
    setTimeout(calculateInvoiceTotal, 0);
  };

  const getFilteredTransactions = () => {
    let filtered = Array.isArray(transactions) ? transactions : [];

    if (filter.search) {
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
        t.payer?.toLowerCase().includes(filter.search.toLowerCase()) ||
        t.reference?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.type !== 'all') filtered = filtered.filter(t => t.type === filter.type);
    if (filter.status !== 'all') filtered = filtered.filter(t => t.status === filter.status);
    if (filter.category !== 'all') filtered = filtered.filter(t => t.category === filter.category);
    if (filter.dateFrom) filtered = filtered.filter(t => new Date(t.date) >= new Date(filter.dateFrom));
    if (filter.dateTo) filtered = filtered.filter(t => new Date(t.date) <= new Date(filter.dateTo));

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate stats from transactions
  const transactionStats = {
    totalIncome: Array.isArray(transactions) ? transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0,
    totalExpenses: Array.isArray(transactions) ? transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0,
    pendingIncome: Array.isArray(transactions) ? transactions
      .filter(t => t.type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0,
    refundedAmount: Array.isArray(transactions) ? transactions
      .filter(t => t.status === 'refunded' || t.category === 'Refunds')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0,
  };

  // Calculate payment stats
  const paymentCalcs = {
    totalPayments: payments.length,
    completedPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    refundedPayments: payments.filter(p => ['refunded', 'partially_refunded'].includes(p.status)).length,
    totalPaymentAmount: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
    totalRefundedAmount: payments
      .reduce((sum, p) => sum + (parseFloat(p.refundAmount) || 0), 0),
  };

  // Invoice stats
  const invoiceStats = {
    invoicesSent: Array.isArray(invoices) ? invoices.filter(i => i.status === 'sent').length : 0,
    invoicesPaid: Array.isArray(invoices) ? invoices.filter(i => i.status === 'paid').length : 0,
    invoicesOverdue: Array.isArray(invoices) ? invoices.filter(i => i.status === 'overdue').length : 0,
    outstandingInvoices: Array.isArray(invoices) ? invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0) : 0
  };

  // Combined stats
  const stats = {
    ...transactionStats,
    ...paymentCalcs,
    ...invoiceStats,
    // Use payment stats from API if available, otherwise use calculated
    totalRevenue: paymentStats.totalRevenue || transactionStats.totalIncome,
    todayRevenue: paymentStats.todayRevenue || 0,
    todayCount: paymentStats.todayCount || 0,
  };

  stats.netIncome = stats.totalIncome - stats.totalExpenses;
  stats.profitMargin = stats.totalIncome > 0 ? ((stats.netIncome / stats.totalIncome) * 100).toFixed(1) : 0;

  // Group payments by type for analysis
  const paymentsByType = payments.reduce((acc, p) => {
    if (p.status === 'completed') {
      acc[p.paymentType] = (acc[p.paymentType] || 0) + (parseFloat(p.amount) || 0);
    }
    return acc;
  }, {});

  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (parseFloat(t.amount) || 0);
      return acc;
    }, {});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track payments, manage invoices, process refunds, and analyze club finances
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (location.state?.from) {
                    navigate('/admin', { state: { section: location.state.from } });
                  } else {
                    navigate('/admin', { state: { section: 'finance' } });
                  }
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <button
                onClick={() => {
                  resetForms();
                  setModalType('transaction');
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-circle me-2"></i>Add Transaction
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
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📈</div>
                  <div className="text-green-600">
                    <i className="bi bi-arrow-up text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-900">{formatCurrency(stats.totalIncome)}</div>
                <div className="text-sm text-green-700 mt-1">Total Income</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📉</div>
                  <div className="text-red-600">
                    <i className="bi bi-arrow-down text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-900">{formatCurrency(stats.totalExpenses)}</div>
                <div className="text-sm text-red-700 mt-1">Total Expenses</div>
              </div>

              <div className={`bg-gradient-to-br from-${stats.netIncome >= 0 ? 'blue' : 'orange'}-50 to-${stats.netIncome >= 0 ? 'blue' : 'orange'}-100 p-6 rounded-lg shadow-sm border border-${stats.netIncome >= 0 ? 'blue' : 'orange'}-200`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">💰</div>
                  <div className={`text-${stats.netIncome >= 0 ? 'blue' : 'orange'}-600`}>
                    <i className={`bi bi-${stats.netIncome >= 0 ? 'check' : 'exclamation'}-circle text-xl`}></i>
                  </div>
                </div>
                <div className={`text-3xl font-bold text-${stats.netIncome >= 0 ? 'blue' : 'orange'}-900`}>
                  {formatCurrency(stats.netIncome)}
                </div>
                <div className={`text-sm text-${stats.netIncome >= 0 ? 'blue' : 'orange'}-700 mt-1`}>Net Income</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📄</div>
                  <div className="text-purple-600">
                    <i className="bi bi-file-earmark-text text-xl"></i>
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-900">{formatCurrency(stats.outstandingInvoices)}</div>
                <div className="text-sm text-purple-700 mt-1">Outstanding Invoices</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.pendingIncome)}</div>
                <div className="text-sm text-yellow-700 mt-1">Pending Income</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-teal-900">{formatCurrency(stats.refundedAmount)}</div>
                <div className="text-sm text-teal-700 mt-1">Refunded</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-orange-900">{stats.invoicesOverdue}</div>
                <div className="text-sm text-orange-700 mt-1">Overdue Invoices</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-900">{stats.invoicesPaid}</div>
                <div className="text-sm text-green-700 mt-1">Paid Invoices</div>
              </div>
            </div>

            {/* What is Financial Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💰 What is Financial Management?</h2>
              <p className="text-gray-700 mb-4">
                Financial Management is your complete accounting and financial tracking system for the club. 
                It handles all money flowing in and out, from registration payments to equipment purchases, 
                invoicing to refunds, providing complete financial transparency and control.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💳 Payment Tracking</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Record all income sources</li>
                    <li>• Track expense payments</li>
                    <li>• Multiple payment methods</li>
                    <li>• Transaction history</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📄 Invoicing</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Create professional invoices</li>
                    <li>• Track payment status</li>
                    <li>• Automatic calculations</li>
                    <li>• Payment reminders</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">↩️ Refunds</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Process refund requests</li>
                    <li>• Track refund amounts</li>
                    <li>• Document reasons</li>
                    <li>• Audit trail</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Reporting</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Income/expense reports</li>
                    <li>• Category breakdowns</li>
                    <li>• Financial statements</li>
                    <li>• Export to Excel/PDF</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💰 Budget Planning</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Set budget goals</li>
                    <li>• Track vs. budget</li>
                    <li>• Category allocations</li>
                    <li>• Variance analysis</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📈 Analytics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Revenue trends</li>
                    <li>• Expense analysis</li>
                    <li>• Cash flow projections</li>
                    <li>• Financial health metrics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => {
                  resetForms();
                  setModalType('transaction');
                  setShowModal(true);
                }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="text-4xl mb-3">💳</div>
                <h3 className="font-semibold text-gray-900 mb-1">Record Transaction</h3>
                <p className="text-sm text-gray-600">Add income or expense</p>
              </button>

              <button
                onClick={() => {
                  resetForms();
                  setModalType('invoice');
                  setInvoiceForm(prev => ({
                    ...prev,
                    invoiceNumber: `INV-${Date.now()}`
                  }));
                  setShowModal(true);
                }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="text-4xl mb-3">📄</div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Invoice</h3>
                <p className="text-sm text-gray-600">Generate new invoice</p>
              </button>

              <button
                onClick={() => {
                  resetForms();
                  setModalType('refund');
                  setShowModal(true);
                }}
                className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left"
              >
                <div className="text-4xl mb-3">↩️</div>
                <h3 className="font-semibold text-gray-900 mb-1">Process Refund</h3>
                <p className="text-sm text-gray-600">Issue customer refund</p>
              </button>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={filter.type}
                  onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Types</option>
                  {transactionTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                  ))}
                </select>
                <select
                  value={filter.category}
                  onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  <optgroup label="Income">
                    {incomeCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Expenses">
                    {expenseCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </optgroup>
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  {transactionStatus.map(status => (
                    <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
                  placeholder="From Date"
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(f => ({ ...f, dateTo: e.target.value }))}
                  placeholder="To Date"
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer/Payee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">💳</div>
                          <p className="text-lg font-semibold mb-2">No transactions found</p>
                          <p className="text-sm">Add your first transaction to get started</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => {
                        const type = transactionTypes.find(t => t.id === transaction.type);
                        const statusOption = transactionStatus.find(s => s.id === transaction.status);
                        const allCategories = [...incomeCategories, ...expenseCategories];
                        const category = allCategories.find(c => c.id === transaction.category);
                        const method = paymentMethods.find(m => m.id === transaction.paymentMethod);

                        return (
                          <tr key={transaction._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${type?.color}-100 text-${type?.color}-800`}>
                                {type?.icon} {type?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {category?.icon} {category?.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {transaction.payer || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {method?.icon} {method?.name}
                            </td>
                            <td className={`px-6 py-4 text-right text-sm font-semibold ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${statusOption?.color}-100 text-${statusOption?.color}-800`}>
                                {statusOption?.icon} {statusOption?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                {transaction.status === 'completed' && transaction.type === 'income' && (
                                  <button
                                    onClick={() => {
                                      setRefundForm(prev => ({
                                        ...prev,
                                        originalTransactionId: transaction._id,
                                        amount: transaction.amount
                                      }));
                                      setModalType('refund');
                                      setShowModal(true);
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

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Invoices</h2>
              <button
                onClick={() => {
                  resetForms();
                  setModalType('invoice');
                  setInvoiceForm(prev => ({
                    ...prev,
                    invoiceNumber: `INV-${Date.now()}`
                  }));
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <i className="bi bi-plus-circle me-2"></i>Create Invoice
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-semibold mb-2 text-gray-900">Invoice Management</p>
              <p className="text-sm text-gray-600">Create and manage invoices for club services</p>
            </div>
          </div>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Refund Management</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-900">{formatCurrency(stats.refundedAmount)}</div>
                  <div className="text-sm text-teal-700 mt-1">Total Refunded</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {transactions.filter(t => t.status === 'refunded').length}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">Refund Count</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {transactions.filter(t => t.status === 'refunded').length > 0
                      ? formatCurrency(stats.refundedAmount / transactions.filter(t => t.status === 'refunded').length)
                      : formatCurrency(0)}
                  </div>
                  <div className="text-sm text-purple-700 mt-1">Avg Refund Amount</div>
                </div>
              </div>

              <div className="text-center py-8">
                <button
                  onClick={() => {
                    resetForms();
                    setModalType('refund');
                    setShowModal(true);
                  }}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
                >
                  <i className="bi bi-arrow-counterclockwise me-2"></i>Process New Refund
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Financial Reports</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 border-2 border-dashed rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Income Statement</h3>
                  <p className="text-sm text-gray-600">Revenue and expenses summary</p>
                </div>
                <div className="p-6 border-2 border-dashed rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cash Flow</h3>
                  <p className="text-sm text-gray-600">Money in and out analysis</p>
                </div>
                <div className="p-6 border-2 border-dashed rounded-lg text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="text-4xl mb-3">📈</div>
                  <h3 className="font-semibold text-gray-900 mb-1">Trend Analysis</h3>
                  <p className="text-sm text-gray-600">Financial trends over time</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Payment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalPaymentAmount)}</div>
                <div className="text-sm text-green-700">Total Revenue</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{stats.completedPayments}</div>
                <div className="text-sm text-blue-700">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-900">{stats.pendingPayments}</div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-900">{stats.failedPayments}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-900">{formatCurrency(stats.totalRefundedAmount)}</div>
                <div className="text-sm text-orange-700">Refunded</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.todayRevenue)}</div>
                <div className="text-sm text-purple-700">Today</div>
              </div>
            </div>

            {/* Payment Type Filter */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Search by name, email, or transaction ID..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={filter.paymentType}
                  onChange={(e) => setFilter(f => ({ ...f, paymentType: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Payment Types</option>
                  <option value="Registration Fees">📝 Registration Fees</option>
                  <option value="Membership Dues">👥 Membership Dues</option>
                  <option value="Tournament Fees">🏆 Tournament Fees</option>
                  <option value="Training Sessions">⚽ Training Sessions</option>
                  <option value="Equipment Purchase">🎽 Equipment Purchase</option>
                  <option value="Uniform Purchase">👕 Uniform Purchase</option>
                  <option value="Camp/Clinic Fees">🏕️ Camp/Clinic Fees</option>
                  <option value="Merchandise">🛍️ Merchandise</option>
                  <option value="Marketplace Purchase">🛒 Marketplace Purchase</option>
                  <option value="Donations">💝 Donations</option>
                  <option value="Sponsorship">🤝 Sponsorship</option>
                  <option value="Other">💵 Other</option>
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">✅ Completed</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="failed">❌ Failed</option>
                  <option value="refunded">↩️ Refunded</option>
                  <option value="cancelled">🚫 Cancelled</option>
                </select>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter(f => ({ ...f, dateTo: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">💵</div>
                          <p className="text-lg font-semibold mb-2">No payments found</p>
                          <p className="text-sm">Payments will appear here once they are processed</p>
                        </td>
                      </tr>
                    ) : (
                      payments
                        .filter(p => {
                          if (filter.paymentType !== 'all' && p.paymentType !== filter.paymentType) return false;
                          if (filter.status !== 'all' && p.status !== filter.status) return false;
                          if (filter.search && !p.payerName?.toLowerCase().includes(filter.search.toLowerCase()) &&
                              !p.payerEmail?.toLowerCase().includes(filter.search.toLowerCase()) &&
                              !p.transactionId?.toLowerCase().includes(filter.search.toLowerCase())) return false;
                          return true;
                        })
                        .map((payment) => (
                          <tr key={payment._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(payment.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{payment.payerName}</div>
                              <div className="text-xs text-gray-500">{payment.payerEmail}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{payment.paymentType}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {paymentMethods.find(m => m.id === payment.paymentMethod)?.name || payment.paymentMethod}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                              {payment.refundAmount > 0 && (
                                <div className="text-xs text-orange-600">
                                  -{formatCurrency(payment.refundAmount)} refunded
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                payment.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                              {payment.transactionId || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {payment.status === 'completed' && (
                                  <button
                                    onClick={() => {
                                      setSelectedPayment(payment);
                                      setRefundForm(prev => ({
                                        ...prev,
                                        amount: payment.amount - (payment.refundAmount || 0),
                                        originalTransactionId: payment._id
                                      }));
                                      setModalType('refund');
                                      setShowModal(true);
                                    }}
                                    className="text-orange-600 hover:text-orange-800 text-sm"
                                    title="Issue Refund"
                                  >
                                    ↩️ Refund
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Declined/Failed Payments Tab */}
        {activeTab === 'declined' && (
          <div className="space-y-6">
            {/* Alert */}
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-center">
                <div className="text-red-600 text-2xl mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-semibold">Failed & Declined Payments</h3>
                  <p className="text-red-700 text-sm">
                    These payments were unsuccessful. You can retry processing or contact the customer.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                <div className="text-3xl font-bold text-red-900">{declinedPayments.length}</div>
                <div className="text-sm text-red-700">Total Failed</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
                <div className="text-3xl font-bold text-orange-900">
                  {formatCurrency(declinedPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0))}
                </div>
                <div className="text-sm text-orange-700">Lost Revenue</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                <div className="text-3xl font-bold text-yellow-900">
                  {declinedPayments.filter(p => new Date(p.paymentDate) > new Date(Date.now() - 7*24*60*60*1000)).length}
                </div>
                <div className="text-sm text-yellow-700">Last 7 Days</div>
              </div>
            </div>

            {/* Declined Payments Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Payer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-red-700 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {declinedPayments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">✅</div>
                          <p className="text-lg font-semibold mb-2 text-green-700">No Failed Payments!</p>
                          <p className="text-sm">All payments are processing successfully</p>
                        </td>
                      </tr>
                    ) : (
                      declinedPayments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-red-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{payment.payerName}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">{payment.payerEmail}</div>
                            {payment.payerPhone && (
                              <div className="text-xs text-gray-500">{payment.payerPhone}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{payment.paymentType}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              {payment.status === 'failed' ? '❌ Failed' : '🚫 Cancelled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.paymentMethod}
                            {payment.cardLastFour && (
                              <span className="text-xs text-gray-500 ml-1">
                                ****{payment.cardLastFour}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => retryPayment(payment._id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                              >
                                🔄 Retry
                              </button>
                              <a
                                href={`mailto:${payment.payerEmail}`}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                              >
                                ✉️ Contact
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profit & Loss Tab */}
        {activeTab === 'profit-loss' && (
          <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Report Period:</span>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border rounded px-3 py-2"
                />
                <button
                  onClick={loadAllData}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* P&L Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Income */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl">📈</div>
                  <div className="text-green-200 text-sm">TOTAL INCOME</div>
                </div>
                <div className="text-4xl font-bold">{formatCurrency(stats.totalIncome)}</div>
                <div className="text-green-200 text-sm mt-2">
                  {stats.completedPayments} completed transactions
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl">📉</div>
                  <div className="text-red-200 text-sm">TOTAL EXPENSES</div>
                </div>
                <div className="text-4xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
                <div className="text-red-200 text-sm mt-2">
                  Including refunds: {formatCurrency(stats.totalRefundedAmount)}
                </div>
              </div>

              {/* Net Profit/Loss */}
              <div className={`bg-gradient-to-br ${stats.netIncome >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white p-6 rounded-xl shadow-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl">{stats.netIncome >= 0 ? '💰' : '⚠️'}</div>
                  <div className={`${stats.netIncome >= 0 ? 'text-blue-200' : 'text-orange-200'} text-sm`}>
                    NET {stats.netIncome >= 0 ? 'PROFIT' : 'LOSS'}
                  </div>
                </div>
                <div className="text-4xl font-bold">{formatCurrency(Math.abs(stats.netIncome))}</div>
                <div className={`${stats.netIncome >= 0 ? 'text-blue-200' : 'text-orange-200'} text-sm mt-2`}>
                  Profit Margin: {stats.profitMargin}%
                </div>
              </div>
            </div>

            {/* Revenue Breakdown by Payment Type */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💵 Revenue by Category</h3>
              <div className="space-y-3">
                {Object.entries(paymentsByType).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No revenue data available</p>
                ) : (
                  Object.entries(paymentsByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, amount]) => (
                      <div key={type} className="flex items-center">
                        <div className="w-40 text-sm text-gray-600">{type}</div>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-green-500 h-full rounded-full"
                              style={{ width: `${(amount / stats.totalPaymentAmount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-32 text-right font-semibold text-green-600">
                          {formatCurrency(amount)}
                        </div>
                        <div className="w-16 text-right text-sm text-gray-500">
                          {((amount / stats.totalPaymentAmount) * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Expense Breakdown by Category */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💸 Expenses by Category</h3>
              <div className="space-y-3">
                {Object.entries(expensesByCategory).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No expense data available</p>
                ) : (
                  Object.entries(expensesByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount]) => {
                      const cat = expenseCategories.find(c => c.id === category);
                      return (
                        <div key={category} className="flex items-center">
                          <div className="w-40 text-sm text-gray-600">
                            {cat?.icon} {cat?.name || category}
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div
                                className="bg-red-500 h-full rounded-full"
                                style={{ width: `${(amount / stats.totalExpenses) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-32 text-right font-semibold text-red-600">
                            {formatCurrency(amount)}
                          </div>
                          <div className="w-16 text-right text-sm text-gray-500">
                            {((amount / stats.totalExpenses) * 100).toFixed(1)}%
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Financial Health Indicators */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Financial Health Indicators</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{stats.profitMargin}%</div>
                  <div className="text-sm text-gray-600">Profit Margin</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalIncome > 0 ? ((stats.totalExpenses / stats.totalIncome) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Expense Ratio</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalPaymentAmount > 0 ? ((stats.totalRefundedAmount / stats.totalPaymentAmount) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Refund Rate</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalPayments > 0 ? ((stats.completedPayments / stats.totalPayments) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showModal && modalType === 'transaction' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Transaction' : 'Add Transaction'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={transactionForm.type}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {transactionTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={transactionForm.category}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <optgroup label="Income">
                        {incomeCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Expenses">
                        {expenseCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={transactionForm.date}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payer/Payee</label>
                    <input
                      type="text"
                      value={transactionForm.payer}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, payer: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                    <select
                      value={transactionForm.paymentMethod}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.id}>{method.icon} {method.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                    <input
                      type="text"
                      value={transactionForm.reference}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="Check #, Invoice #, etc."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      value={transactionForm.status}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {transactionStatus.map(status => (
                        <option key={status.id} value={status.id}>{status.icon} {status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={transactionForm.notes}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
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
                    onClick={saveTransaction}
                    disabled={loading || !transactionForm.amount || !transactionForm.description}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingItem ? 'Update Transaction' : 'Add Transaction'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showModal && modalType === 'refund' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Process Refund</h2>
                  <p className="text-sm text-gray-600 mt-1">Complete all required fields to process a refund</p>
                </div>
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
                {/* Refund Amount Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Refund Amount</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refund Amount * <span className="text-xs text-gray-500">(USD)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={refundForm.amount}
                          onChange={(e) => setRefundForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full border rounded-lg pl-7 pr-3 py-2"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refund Percentage
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={refundForm.refundPercentage}
                          onChange={(e) => setRefundForm(prev => ({ ...prev, refundPercentage: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                          min="0"
                          max="100"
                          step="5"
                        />
                        <span className="text-gray-600">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Full refund = 100%, Partial = less</p>
                    </div>
                  </div>
                </div>

                {/* Refund Reason Section */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-3">Refund Reason</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason Category *
                    </label>
                    <select
                      value={refundForm.refundReason}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, refundReason: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 mb-3"
                      required
                    >
                      {refundReasons.map(reason => (
                        <option key={reason.id} value={reason.id}>
                          {reason.icon} {reason.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Explanation *
                    </label>
                    <textarea
                      rows={3}
                      value={refundForm.reason}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Provide detailed explanation for the refund (required for audit purposes)..."
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Be specific about circumstances leading to refund request
                    </p>
                  </div>
                </div>

                {/* Refund Method Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">Refund Method</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How should the refund be processed? *
                    </label>
                    <select
                      value={refundForm.refundMethod}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, refundMethod: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    >
                      {refundMethods.map(method => (
                        <option key={method.id} value={method.id}>
                          {method.icon} {method.name}
                        </option>
                      ))}
                    </select>
                    {refundForm.refundMethod && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-600">
                        <i className="bi bi-info-circle me-1"></i>
                        {refundMethods.find(m => m.id === refundForm.refundMethod)?.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Processing Information Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Processing Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processed By
                      </label>
                      <input
                        type="text"
                        value={refundForm.processedBy}
                        onChange={(e) => setRefundForm(prev => ({ ...prev, processedBy: e.target.value }))}
                        placeholder="Your name/staff ID"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approved By
                      </label>
                      <input
                        type="text"
                        value={refundForm.approvedBy}
                        onChange={(e) => setRefundForm(prev => ({ ...prev, approvedBy: e.target.value }))}
                        placeholder="Manager/supervisor name"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes / Internal Comments
                  </label>
                  <textarea
                    rows={2}
                    value={refundForm.notes}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional context, reference numbers, or internal notes..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Refund Summary */}
                {refundForm.amount && (
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Refund Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund Amount:</span>
                        <span className="font-bold text-lg text-green-600">${parseFloat(refundForm.amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund Type:</span>
                        <span className="font-semibold">
                          {refundForm.refundPercentage == 100 ? 'Full Refund' : `Partial (${refundForm.refundPercentage}%)`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-semibold">
                          {refundMethods.find(m => m.id === refundForm.refundMethod)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="font-semibold">
                          {refundReasons.find(r => r.id === refundForm.refundReason)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning Notice */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Refunds are final and cannot be undone</li>
                          <li>Processing time varies by payment method (3-10 business days)</li>
                          <li>Complete documentation is required for audit compliance</li>
                          <li>Customer will be notified of refund status via email</li>
                        </ul>
                      </div>
                    </div>
                  </div>
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
                    onClick={processRefund}
                    disabled={loading || !refundForm.amount || !refundForm.reason || !refundForm.refundReason}
                    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-counterclockwise"></i>
                        Process Refund
                      </>
                    )}
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

export default FinanceManager;

