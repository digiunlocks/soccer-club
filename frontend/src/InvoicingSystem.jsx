import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const InvoicingSystem = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    type: 'all'
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    invoiceType: 'registration',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    discountType: 'percentage',
    total: 0,
    status: 'draft',
    dueDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    notes: '',
    terms: 'Payment due within 30 days',
    paymentMethod: '',
    paidAmount: 0
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'all', name: 'All Invoices', icon: '📄' },
    { id: 'draft', name: 'Drafts', icon: '📝' },
    { id: 'sent', name: 'Sent', icon: '📤' },
    { id: 'paid', name: 'Paid', icon: '✅' },
    { id: 'overdue', name: 'Overdue', icon: '⚠️' },
    { id: 'templates', name: 'Templates', icon: '📋' }
  ];

  const invoiceTypes = [
    { id: 'registration', name: 'Player Registration', icon: '📝', color: 'blue' },
    { id: 'membership', name: 'Membership Dues', icon: '👥', color: 'purple' },
    { id: 'tournament', name: 'Tournament Fee', icon: '🏆', color: 'gold' },
    { id: 'training', name: 'Training Session', icon: '⚽', color: 'green' },
    { id: 'equipment', name: 'Equipment Purchase', icon: '🎽', color: 'orange' },
    { id: 'camp', name: 'Camp/Clinic', icon: '🏕️', color: 'teal' },
    { id: 'sponsorship', name: 'Sponsorship', icon: '🤝', color: 'indigo' },
    { id: 'facility', name: 'Facility Rental', icon: '🏟️', color: 'cyan' },
    { id: 'merchandise', name: 'Merchandise', icon: '🛍️', color: 'pink' },
    { id: 'service', name: 'Services', icon: '🔧', color: 'gray' },
    { id: 'other', name: 'Other', icon: '💼', color: 'slate' }
  ];

  const invoiceStatuses = [
    { id: 'draft', name: 'Draft', icon: '📝', color: 'gray' },
    { id: 'sent', name: 'Sent', icon: '📤', color: 'blue' },
    { id: 'viewed', name: 'Viewed', icon: '👁️', color: 'cyan' },
    { id: 'partial', name: 'Partially Paid', icon: '⏳', color: 'yellow' },
    { id: 'paid', name: 'Paid', icon: '✅', color: 'green' },
    { id: 'overdue', name: 'Overdue', icon: '⚠️', color: 'red' },
    { id: 'cancelled', name: 'Cancelled', icon: '🚫', color: 'red' }
  ];

  const templates = [
    {
      id: 'registration',
      name: 'Player Registration Invoice',
      items: [
        { description: 'Player Registration Fee - Season 2025', quantity: 1, rate: 150, amount: 150 },
        { description: 'Uniform Package', quantity: 1, rate: 75, amount: 75 }
      ]
    },
    {
      id: 'membership',
      name: 'Annual Membership Invoice',
      items: [
        { description: 'Annual Membership Dues', quantity: 1, rate: 200, amount: 200 }
      ]
    },
    {
      id: 'tournament',
      name: 'Tournament Entry Invoice',
      items: [
        { description: 'Tournament Entry Fee', quantity: 1, rate: 300, amount: 300 },
        { description: 'Referee Fee', quantity: 1, rate: 50, amount: 50 }
      ]
    }
  ];

  useEffect(() => {
    document.title = 'Invoicing System - Seattle Leopards FC Admin';
    loadInvoices();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [invoiceForm.items, invoiceForm.taxRate, invoiceForm.discount, invoiceForm.discountType]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setMessage('Failed to load invoices');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    let discountAmount = 0;
    if (invoiceForm.discountType === 'percentage') {
      discountAmount = (subtotal * parseFloat(invoiceForm.discount || 0)) / 100;
    } else {
      discountAmount = parseFloat(invoiceForm.discount || 0);
    }

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * parseFloat(invoiceForm.taxRate || 0)) / 100;
    const total = afterDiscount + taxAmount;

    setInvoiceForm(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2)
    }));
  };

  const addItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = (quantity * rate).toFixed(2);
    }
    
    setInvoiceForm(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}-${random}`;
  };

  const loadTemplate = (template) => {
    setInvoiceForm(prev => ({
      ...prev,
      invoiceType: template.id,
      items: template.items.map(item => ({ ...item }))
    }));
    setMessage(`Template "${template.name}" loaded!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const resetForm = () => {
    setInvoiceForm({
      invoiceNumber: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      invoiceType: 'registration',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      discountType: 'percentage',
      total: 0,
      status: 'draft',
      dueDate: '',
      issueDate: new Date().toISOString().split('T')[0],
      notes: '',
      terms: 'Payment due within 30 days',
      paymentMethod: '',
      paidAmount: 0
    });
  };

  const saveInvoice = async () => {
    if (!invoiceForm.clientName || !invoiceForm.clientEmail) {
      setMessage('Please fill in client name and email');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const invoiceData = {
        ...invoiceForm,
        dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        setMessage('Invoice saved successfully!');
        setShowModal(false);
        resetForm();
        loadInvoices();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to save invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setMessage('Failed to save invoice');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const sendInvoice = async (invoice) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/invoices/${invoice._id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage(`Invoice ${invoice.invoiceNumber} sent to ${invoice.clientEmail}`);
        loadInvoices();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      setMessage('Failed to send invoice');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const markAsPaid = async (invoice) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/invoices/${invoice._id}/payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: invoice.total - invoice.paidAmount,
          method: 'manual'
        })
      });

      if (response.ok) {
        setMessage(`Invoice ${invoice.invoiceNumber} marked as paid!`);
        loadInvoices();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      setMessage('Failed to mark as paid');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getFilteredInvoices = () => {
    let filtered = [...invoices];

    if (activeTab === 'draft') filtered = filtered.filter(inv => inv.status === 'draft');
    if (activeTab === 'sent') filtered = filtered.filter(inv => inv.status === 'sent' || inv.status === 'viewed');
    if (activeTab === 'paid') filtered = filtered.filter(inv => inv.status === 'paid');
    if (activeTab === 'overdue') filtered = filtered.filter(inv => inv.status === 'overdue');

    if (filter.search) {
      filtered = filtered.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(filter.search.toLowerCase()) ||
        inv.clientName?.toLowerCase().includes(filter.search.toLowerCase()) ||
        inv.clientEmail?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    if (filter.status !== 'all') filtered = filtered.filter(inv => inv.status === filter.status);
    if (filter.type !== 'all') filtered = filtered.filter(inv => inv.invoiceType === filter.type);
    if (filter.dateFrom) filtered = filtered.filter(inv => new Date(inv.issueDate) >= new Date(filter.dateFrom));
    if (filter.dateTo) filtered = filtered.filter(inv => new Date(inv.issueDate) <= new Date(filter.dateTo));

    return filtered.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  };

  const filteredInvoices = getFilteredInvoices();

  const stats = {
    total: invoices.length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
    sent: invoices.filter(inv => inv.status === 'sent' || inv.status === 'viewed').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.paidAmount), 0),
    unpaidAmount: invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + (parseFloat(inv.total) - parseFloat(inv.paidAmount)), 0),
    overdueAmount: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + parseFloat(inv.total), 0)
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: filter.status,
        type: filter.type,
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo
      });
      
      const response = await fetch(`/api/invoices/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        setMessage('Failed to export invoices');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Failed to export invoices');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteInvoice = async (invoice) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/invoices/${invoice._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage(`Invoice ${invoice.invoiceNumber} deleted successfully`);
        loadInvoices();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setMessage('Failed to delete invoice');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const sendReminder = async (invoice) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/invoices/${invoice._id}/reminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage(`Payment reminder sent for invoice ${invoice.invoiceNumber}`);
        loadInvoices();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      setMessage('Failed to send reminder');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoicing System</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create, send, and track professional invoices for all club services
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
                  setModalType('create');
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-circle me-2"></i>Create Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-lg ${message.includes('success') || message.includes('sent') || message.includes('marked') || message.includes('loaded') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
                  {tab.id === 'draft' && stats.draft > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.draft}
                    </span>
                  )}
                  {tab.id === 'overdue' && stats.overdue > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.overdue}
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📄</div>
                  <div className="text-blue-600"><i className="bi bi-file-text text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-700 mt-1">Total Invoices</div>
                <div className="text-xs text-blue-600 mt-1">{formatCurrency(stats.totalAmount)}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">✅</div>
                  <div className="text-green-600"><i className="bi bi-check-circle text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-green-900">{stats.paid}</div>
                <div className="text-sm text-green-700 mt-1">Paid Invoices</div>
                <div className="text-xs text-green-600 mt-1">{formatCurrency(stats.paidAmount)}</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg shadow-sm border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">📤</div>
                  <div className="text-yellow-600"><i className="bi bi-send text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-yellow-900">{stats.sent}</div>
                <div className="text-sm text-yellow-700 mt-1">Sent/Pending</div>
                <div className="text-xs text-yellow-600 mt-1">{formatCurrency(stats.unpaidAmount)}</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">⚠️</div>
                  <div className="text-red-600"><i className="bi bi-exclamation-triangle text-xl"></i></div>
                </div>
                <div className="text-3xl font-bold text-red-900">{stats.overdue}</div>
                <div className="text-sm text-red-700 mt-1">Overdue</div>
                <div className="text-xs text-red-600 mt-1">{formatCurrency(stats.overdueAmount)}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-900">{stats.draft}</div>
                <div className="text-sm text-purple-700 mt-1">Draft Invoices</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-teal-900">{formatCurrency(stats.totalAmount)}</div>
                <div className="text-sm text-teal-700 mt-1">Total Invoiced</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-indigo-900">
                  {stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-indigo-700 mt-1">Collection Rate</div>
              </div>
            </div>

            {/* What is Invoicing System */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📄 What is the Invoicing System?</h2>
              <p className="text-gray-700 mb-4">
                The Invoicing System is your professional billing solution for the soccer club. Create, customize, 
                send, and track invoices for all services including registrations, memberships, tournaments, training, 
                equipment, and more. Manage payment collection, track overdue invoices, and maintain professional 
                financial records.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📝 Invoice Creation</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Professional invoice templates</li>
                    <li>• Customizable line items</li>
                    <li>• Auto-generated invoice numbers</li>
                    <li>• Multiple invoice types (11+)</li>
                    <li>• Tax and discount calculations</li>
                    <li>• Payment terms and notes</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📤 Delivery & Tracking</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Email invoices to clients</li>
                    <li>• Track invoice status (sent/viewed)</li>
                    <li>• Payment reminders</li>
                    <li>• Overdue notifications</li>
                    <li>• View tracking</li>
                    <li>• Due date management</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💰 Payment Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Track payment status</li>
                    <li>• Partial payment support</li>
                    <li>• Payment history</li>
                    <li>• Overdue tracking</li>
                    <li>• Collection reporting</li>
                    <li>• Export to CSV/PDF</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Features Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 System Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {invoiceTypes.map((type) => (
                  <div key={type.id} className={`p-4 bg-${type.color}-50 rounded-lg border border-${type.color}-200 text-center`}>
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm">{type.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Invoices / Draft / Sent / Paid / Overdue Tabs */}
        {(activeTab === 'all' || activeTab === 'draft' || activeTab === 'sent' || activeTab === 'paid' || activeTab === 'overdue') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search invoices..."
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
                  {invoiceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  {invoiceStatuses.map(status => (
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
                  onClick={exportInvoices}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <i className="bi bi-download me-2"></i>Export
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">📄</div>
                          <p className="text-lg font-semibold mb-2">No invoices found</p>
                          <p className="text-sm">Create your first invoice to get started</p>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((invoice) => {
                        const type = invoiceTypes.find(t => t.id === invoice.invoiceType);
                        const statusOption = invoiceStatuses.find(s => s.id === invoice.status);

                        return (
                          <tr key={invoice._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-mono font-bold text-blue-600">{invoice.invoiceNumber}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{invoice.clientName}</div>
                              <div className="text-xs text-gray-500">{invoice.clientEmail}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${type?.color}-100 text-${type?.color}-800`}>
                                {type?.icon} {type?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-green-600">{formatCurrency(invoice.total)}</div>
                              {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                                <div className="text-xs text-gray-500">
                                  Paid: {formatCurrency(invoice.paidAmount)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${statusOption?.color}-100 text-${statusOption?.color}-800`}>
                                {statusOption?.icon} {statusOption?.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                              {invoice.status === 'overdue' && (
                                <div className="text-xs text-red-600 mt-1">
                                  {Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setModalType('view');
                                    setShowModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Invoice"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                {invoice.status === 'draft' && (
                                  <button
                                    onClick={() => sendInvoice(invoice)}
                                    className="text-green-600 hover:text-green-800"
                                    title="Send Invoice"
                                  >
                                    <i className="bi bi-send"></i>
                                  </button>
                                )}
                                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                  <button
                                    onClick={() => markAsPaid(invoice)}
                                    className="text-purple-600 hover:text-purple-800"
                                    title="Mark as Paid"
                                  >
                                    <i className="bi bi-check-circle"></i>
                                  </button>
                                )}
                                <button
                                  className="text-orange-600 hover:text-orange-800"
                                  title="Download PDF"
                                >
                                  <i className="bi bi-download"></i>
                                </button>
                                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                  <button
                                    onClick={() => sendReminder(invoice)}
                                    className="text-yellow-600 hover:text-yellow-800"
                                    title="Send Payment Reminder"
                                  >
                                    <i className="bi bi-bell"></i>
                                  </button>
                                )}
                                {invoice.status === 'draft' && (
                                  <button
                                    onClick={() => deleteInvoice(invoice)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete Invoice"
                                  >
                                    <i className="bi bi-trash"></i>
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

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📋 Invoice Templates</h2>
              <p className="text-gray-700">
                Pre-built invoice templates for common services. Click to load a template and customize it for your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {templates.map((template) => {
                const type = invoiceTypes.find(t => t.id === template.id);
                const total = template.items.reduce((sum, item) => sum + item.amount, 0);

                return (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{type?.icon}</div>
                      <span className={`px-2 py-1 text-xs rounded-full bg-${type?.color}-100 text-${type?.color}-800`}>
                        Template
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{template.name}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <div className="space-y-1">
                        {template.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.description}</span>
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t mt-2 pt-2 flex justify-between font-bold text-green-600">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        loadTemplate(template);
                        setModalType('create');
                        setShowModal(true);
                      }}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <i className="bi bi-plus-circle me-2"></i>Use Template
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Custom Template Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Creating Custom Templates</h3>
              <p className="text-sm text-blue-800 mb-4">
                You can create custom invoice templates by setting up a new invoice with your preferred items, 
                saving it as a draft, and using it as a starting point for future invoices.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setModalType('create');
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                <i className="bi bi-plus-circle me-2"></i>Create Custom Invoice
              </button>
            </div>
          </div>
        )}

        {/* Create/Edit Invoice Modal */}
        {showModal && (modalType === 'create' || modalType === 'edit') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-5xl w-full my-8 p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
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

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Invoice Details */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Invoice Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={invoiceForm.invoiceNumber}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                        placeholder="Auto-generated"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                      <input
                        type="date"
                        value={invoiceForm.issueDate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, issueDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                      <input
                        type="date"
                        value={invoiceForm.dueDate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type *</label>
                    <select
                      value={invoiceForm.invoiceType}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceType: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      {invoiceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Client Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                      <input
                        type="text"
                        value={invoiceForm.clientName}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, clientName: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Email *</label>
                      <input
                        type="email"
                        value={invoiceForm.clientEmail}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={invoiceForm.clientPhone}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, clientPhone: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={invoiceForm.clientAddress}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, clientAddress: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-green-900">Line Items</h3>
                    <button
                      onClick={addItem}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      <i className="bi bi-plus me-1"></i>Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {invoiceForm.items.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full border rounded px-2 py-1 text-sm"
                            min="1"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', e.target.value)}
                            placeholder="Rate"
                            className="w-full border rounded px-2 py-1 text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={formatCurrency(item.amount)}
                            readOnly
                            className="w-full border rounded px-2 py-1 text-sm bg-gray-50 font-semibold"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          {invoiceForm.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculations */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-3">Calculations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={invoiceForm.discount}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, discount: e.target.value }))}
                          className="w-full border rounded-lg px-3 py-2"
                          min="0"
                          step="0.01"
                        />
                        <select
                          value={invoiceForm.discountType}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, discountType: e.target.value }))}
                          className="border rounded-lg px-3 py-2"
                        >
                          <option value="percentage">%</option>
                          <option value="fixed">$</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={invoiceForm.taxRate}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, taxRate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {/* Totals Summary */}
                  <div className="mt-4 bg-white p-4 rounded border">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(invoiceForm.subtotal)}</span>
                      </div>
                      {invoiceForm.discount > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Discount:</span>
                          <span>
                            -{invoiceForm.discountType === 'percentage' 
                              ? `${invoiceForm.discount}%` 
                              : formatCurrency(invoiceForm.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax ({invoiceForm.taxRate}%):</span>
                        <span className="font-semibold">{formatCurrency(invoiceForm.taxAmount)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-600">
                        <span>Total:</span>
                        <span>{formatCurrency(invoiceForm.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                      <input
                        type="text"
                        value={invoiceForm.terms}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, terms: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="e.g., Payment due within 30 days"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        rows={3}
                        value={invoiceForm.notes}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Additional notes or instructions for the client..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={invoiceForm.status}
                        onChange={(e) => setInvoiceForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Send to Client</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
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
                  onClick={saveInvoice}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : modalType === 'create' ? 'Create Invoice' : 'Update Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Invoice Modal */}
        {showModal && modalType === 'view' && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                  <div className="text-lg font-mono text-blue-600">{selectedInvoice.invoiceNumber}</div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg text-2xl"></i>
                </button>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold">Seattle Leopards FC</div>
                    <div>123 Soccer Way</div>
                    <div>Seattle, WA 98101</div>
                    <div>info@seattleleopardsfc.com</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold">{selectedInvoice.clientName}</div>
                    <div>{selectedInvoice.clientEmail}</div>
                    {selectedInvoice.clientPhone && <div>{selectedInvoice.clientPhone}</div>}
                    {selectedInvoice.clientAddress && <div>{selectedInvoice.clientAddress}</div>}
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Issue Date</div>
                  <div className="font-semibold">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Due Date</div>
                  <div className="font-semibold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Status</div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full bg-${invoiceStatuses.find(s => s.id === selectedInvoice.status)?.color}-100 text-${invoiceStatuses.find(s => s.id === selectedInvoice.status)?.color}-800`}>
                      {invoiceStatuses.find(s => s.id === selectedInvoice.status)?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-8">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedInvoice.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.rate)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-600">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                    {selectedInvoice.paidAmount > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-blue-600">
                          <span>Paid:</span>
                          <span className="font-semibold">{formatCurrency(selectedInvoice.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-orange-600">
                          <span>Balance Due:</span>
                          <span>{formatCurrency(selectedInvoice.total - selectedInvoice.paidAmount)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                >
                  <i className="bi bi-download me-2"></i>Download PDF
                </button>
                {selectedInvoice.status === 'draft' && (
                  <button
                    onClick={() => sendInvoice(selectedInvoice)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    <i className="bi bi-send me-2"></i>Send Invoice
                  </button>
                )}
                {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                  <button
                    onClick={() => markAsPaid(selectedInvoice)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                  >
                    <i className="bi bi-check-circle me-2"></i>Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicingSystem;

