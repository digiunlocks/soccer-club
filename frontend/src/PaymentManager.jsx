import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './config/api';

const API_URL = `${API_BASE_URL}/payments`;
const METHODS = ["paypal", "zelle", "venmo", "cashapp", "card"];
const STATUS = ["completed", "pending", "refunded", "failed", "partial"];
const REFUNDABLE_METHODS = ["paypal", "card"];

export default function PaymentManager() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState({ status: "", method: "", name: "", cardType: "", cardLast4: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refundId, setRefundId] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [refundLogId, setRefundLogId] = useState(null);
  const [refundLog, setRefundLog] = useState([]);
  const [refundLogLoading, setRefundLogLoading] = useState(false);
  
  // Enhanced analytics state
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    refundedAmount: 0,
    methodBreakdown: {},
    statusBreakdown: {},
    monthlyRevenue: [],
    averagePayment: 0
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    let url = API_URL + "?";
    if (filter.status) url += `status=${filter.status}&`;
    if (filter.method) url += `method=${filter.method}&`;
    if (filter.name) url += `name=${encodeURIComponent(filter.name)}&`;
    if (filter.cardType) url += `cardType=${encodeURIComponent(filter.cardType)}&`;
    if (filter.cardLast4) url += `cardLast4=${encodeURIComponent(filter.cardLast4)}&`;
    if (dateRange.start) url += `startDate=${dateRange.start}&`;
    if (dateRange.end) url += `endDate=${dateRange.end}&`;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Authentication required. Please log in again.");
          navigate('/signin');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setPayments(data);
      calculateAnalytics(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError("Failed to load payments");
      toast.error("Failed to load payments");
    }
    setLoading(false);
  };

  const calculateAnalytics = (paymentData) => {
    const totalRevenue = paymentData.reduce((sum, p) => sum + p.amount, 0);
    const totalPayments = paymentData.length;
    const pendingPayments = paymentData.filter(p => p.status === 'pending').length;
    const refundedAmount = paymentData.reduce((sum, p) => sum + (p.totalRefunded || 0), 0);
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // Method breakdown
    const methodBreakdown = {};
    METHODS.forEach(method => {
      methodBreakdown[method] = paymentData.filter(p => p.method === method).length;
    });

    // Status breakdown
    const statusBreakdown = {};
    STATUS.forEach(status => {
      statusBreakdown[status] = paymentData.filter(p => p.status === status).length;
    });

    // Monthly revenue (last 12 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthRevenue = paymentData
        .filter(p => {
          const paymentDate = new Date(p.createdAt);
          return paymentDate.getMonth() === month.getMonth() && 
                 paymentDate.getFullYear() === month.getFullYear();
        })
        .reduce((sum, p) => sum + p.amount, 0);
      monthlyRevenue.push({ month: monthStr, revenue: monthRevenue });
    }

    setAnalytics({
      totalRevenue,
      totalPayments,
      pendingPayments,
      refundedAmount,
      methodBreakdown,
      statusBreakdown,
      monthlyRevenue,
      averagePayment
    });
  };

  useEffect(() => { 
    console.log('PaymentManager component mounted');
    fetchPayments(); 
  }, [filter, dateRange]);

  // Add a debug effect to check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log('No authentication token found');
      toast.error("Please log in to access payment management");
      navigate('/signin');
    } else {
      console.log('Authentication token found');
    }
  }, [navigate]);

  const handleRefund = (id) => {
    setRefundId(id);
    setRefundReason("");
    setRefundAmount("");
    setConfirm(false);
  };

  const submitRefund = async () => {
    setRefundLoading(true);
    setError("");
    try {
      const payment = payments.find(p => p._id === refundId);
      const amount = Number(refundAmount);
      if (!amount || amount <= 0 || amount > (payment.amount - (payment.totalRefunded || 0))) {
        setError("Invalid refund amount");
        setRefundLoading(false);
        return;
      }
      
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${refundId}/refund`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ refundAmount: amount, refundReason }),
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Authentication required. Please log in again.");
          navigate('/signin');
          return;
        }
        const data = await res.json();
        setError(data.error || "Refund failed");
        toast.error(data.error || "Refund failed");
        setRefundLoading(false);
        return;
      }
      
      setRefundId(null);
      setRefundReason("");
      setRefundAmount("");
      setConfirm(false);
      fetchPayments();
      toast.success("Refund issued successfully");
    } catch (err) {
      console.error('Error processing refund:', err);
      setError("Refund failed");
      toast.error("Refund failed");
    }
    setRefundLoading(false);
  };

  const openRefundLog = async (id) => {
    setRefundLogId(id);
    setRefundLogLoading(true);
    setRefundLog([]);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/${id}/refunds`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Authentication required. Please log in again.");
          navigate('/signin');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setRefundLog(data);
    } catch (err) {
      console.error('Error fetching refund log:', err);
      setRefundLog([]);
      toast.error("Failed to load refund history");
    }
    setRefundLogLoading(false);
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const exportPayments = async () => {
    setExportLoading(true);
    try {
      const csvContent = [
        ['Date', 'Amount', 'Donor Name', 'Email', 'Method', 'Status', 'Transaction ID', 'Card Type', 'Last 4', 'Total Refunded', 'Notes'].join(','),
        ...payments.map(p => [
          new Date(p.createdAt).toLocaleDateString(),
          p.amount,
          p.donorName || '',
          p.donorEmail || '',
          p.method,
          p.status,
          p.transactionId || '',
          p.cardType || '',
          p.cardLast4 || '',
          p.totalRefunded || 0,
          p.notes || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Payments exported successfully');
    } catch (err) {
      toast.error('Export failed');
    }
    setExportLoading(false);
  };

  const clearFilters = () => {
    setFilter({ status: "", method: "", name: "", cardType: "", cardLast4: "" });
    setDateRange({ start: "", end: "" });
  };

  const createSampleData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/sample-data`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Authentication required. Please log in again.");
          navigate('/signin');
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      toast.success(`Created ${data.count} sample payments`);
      fetchPayments(); // Refresh the payments list
    } catch (err) {
      console.error('Error creating sample data:', err);
      toast.error("Failed to create sample data");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-white rounded shadow mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div>
            <h2 className="text-3xl font-bold text-green-900">Payment Management</h2>
            <p className="text-gray-600">Track and manage all club payments and donations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={exportPayments}
            disabled={exportLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={createSampleData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Sample Data
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
            <div className="text-sm opacity-90">Total Revenue</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{analytics.totalPayments}</div>
            <div className="text-sm opacity-90">Total Payments</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{analytics.pendingPayments}</div>
            <div className="text-sm opacity-90">Pending Payments</div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">${analytics.refundedAmount.toFixed(2)}</div>
            <div className="text-sm opacity-90">Total Refunded</div>
          </div>
        </div>
      )}

      {/* Enhanced Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <select 
            value={filter.status} 
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            {STATUS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select 
            value={filter.method} 
            onChange={e => setFilter(f => ({ ...f, method: e.target.value }))} 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Methods</option>
            {METHODS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </select>
          <input 
            value={filter.name} 
            onChange={e => setFilter(f => ({ ...f, name: e.target.value }))} 
            placeholder="Search by name" 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
          <input 
            value={filter.cardType} 
            onChange={e => setFilter(f => ({ ...f, cardType: e.target.value }))} 
            placeholder="Card type" 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
          <input 
            value={filter.cardLast4} 
            onChange={e => setFilter(f => ({ ...f, cardLast4: e.target.value }))} 
            placeholder="Last 4 digits" 
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full" 
            maxLength={4} 
          />
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
        
        {/* Date Range Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDateRange({ start: "", end: "" })}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Clear Dates
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Showing {payments.length} payment{payments.length !== 1 ? 's' : ''}
          {dateRange.start && dateRange.end && ` from ${dateRange.start} to ${dateRange.end}`}
        </div>
        <div className="text-sm font-semibold text-green-700">
          Total: ${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
        </div>
      </div>

      {/* Enhanced Payments Table */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-green-50 border-b">
                <th className="p-4 text-left font-semibold text-green-900">Amount</th>
                <th className="p-4 text-left font-semibold text-green-900">Donor</th>
                <th className="p-4 text-left font-semibold text-green-900">Method</th>
                <th className="p-4 text-left font-semibold text-green-900">Status</th>
                <th className="p-4 text-left font-semibold text-green-900">Date</th>
                <th className="p-4 text-left font-semibold text-green-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No payments found matching your criteria
                  </td>
                </tr>
              ) : (
                payments.map(p => {
                  const refundable = REFUNDABLE_METHODS.includes(p.method) && p.status !== "refunded";
                  let refundTooltip = "";
                  if (!REFUNDABLE_METHODS.includes(p.method)) {
                    refundTooltip = "Refunds only available for PayPal or Card payments.";
                  } else if (p.status === "refunded") {
                    refundTooltip = "Already fully refunded.";
                  }
                  
                  return (
                    <tr key={p._id} className="border-b hover:bg-green-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-lg">${p.amount.toFixed(2)}</div>
                        {p.totalRefunded > 0 && (
                          <div className="text-sm text-red-600">
                            Refunded: ${p.totalRefunded.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{p.donorName || "Anonymous"}</div>
                        <div className="text-sm text-gray-600">{p.donorEmail || "-"}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-medium">{p.method}</span>
                          {p.method === "card" && (
                            <span className="text-xs text-gray-500">
                              {p.cardType} •••• {p.cardLast4}
                            </span>
                          )}
                        </div>
                        {p.transactionId && (
                          <div className="text-xs text-gray-500">ID: {p.transactionId}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.status === 'completed' ? 'bg-green-100 text-green-800' :
                          p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          p.status === 'refunded' ? 'bg-red-100 text-red-800' :
                          p.status === 'failed' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => viewPaymentDetails(p)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => openRefundLog(p._id)} 
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            Refund History
                          </button>
                          <button
                            onClick={() => refundable && handleRefund(p._id)}
                            className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                              refundable 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!refundable}
                            title={refundTooltip || "Issue a refund for this payment."}
                          >
                            Issue Refund
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
      )}

      {/* Refund Modal */}
      {refundId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button className="absolute top-2 right-2 text-green-900 hover:text-green-700 text-2xl font-bold" onClick={() => setRefundId(null)} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4 text-green-900">Issue Refund</h3>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Payment Details:</div>
              <div className="font-semibold">${payments.find(p => p._id === refundId)?.amount.toFixed(2)}</div>
              <div className="text-sm">{payments.find(p => p._id === refundId)?.donorName}</div>
            </div>
            <label className="block mb-2 font-semibold">Refund Amount</label>
            <input 
              type="number" 
              min="0.01" 
              step="0.01" 
              value={refundAmount} 
              onChange={e => setRefundAmount(e.target.value)} 
              className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="Enter amount" 
            />
            <label className="block mb-2 font-semibold">Refund Reason (optional)</label>
            <textarea 
              value={refundReason} 
              onChange={e => setRefundReason(e.target.value)} 
              className="border rounded px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" 
              rows={3} 
              placeholder="Reason for refund..."
            />
            {!confirm ? (
              <button 
                onClick={() => setConfirm(true)} 
                disabled={refundLoading || !refundAmount} 
                className="bg-yellow-400 text-green-900 px-4 py-2 rounded font-bold hover:bg-yellow-500 transition w-full disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <>
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm text-red-700 font-semibold">Confirm Refund</div>
                  <div className="text-sm text-red-600">Are you sure you want to refund ${refundAmount}?</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setConfirm(false)} 
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded font-bold hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitRefund} 
                    disabled={refundLoading} 
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {refundLoading ? "Processing..." : "Confirm Refund"}
                  </button>
                </div>
              </>
            )}
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>
        </div>
      )}

      {/* Refund History Modal */}
      {refundLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button className="absolute top-2 right-2 text-green-900 hover:text-green-700 text-2xl font-bold" onClick={() => setRefundLogId(null)} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4 text-green-900">Refund History</h3>
            {refundLogLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Reason</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Admin</th>
                      <th className="p-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundLog.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-4 text-gray-500">No refunds found</td>
                      </tr>
                    ) : (
                      refundLog.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-3 font-bold">${r.amount.toFixed(2)}</td>
                          <td className="p-3 text-sm">{r.reason || "-"}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === 'processed' ? 'bg-green-100 text-green-800' :
                              r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm capitalize">{r.refundType}</td>
                          <td className="p-3 text-sm">{r.admin || "-"}</td>
                          <td className="p-3 text-sm">{new Date(r.refundedAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button className="absolute top-2 right-2 text-green-900 hover:text-green-700 text-2xl font-bold" onClick={() => setShowPaymentDetails(false)} aria-label="Close">×</button>
            <h3 className="text-xl font-bold mb-4 text-green-900">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Amount:</span> ${selectedPayment.amount.toFixed(2)}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPayment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedPayment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedPayment.status === 'refunded' ? 'bg-red-100 text-red-800' :
                      selectedPayment.status === 'failed' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                    </span>
                  </div>
                  <div><span className="font-medium">Method:</span> {selectedPayment.method.charAt(0).toUpperCase() + selectedPayment.method.slice(1)}</div>
                  <div><span className="font-medium">Transaction ID:</span> {selectedPayment.transactionId || "N/A"}</div>
                  <div><span className="font-medium">Date:</span> {new Date(selectedPayment.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Donor Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedPayment.donorName || "Anonymous"}</div>
                  <div><span className="font-medium">Email:</span> {selectedPayment.donorEmail || "N/A"}</div>
                  {selectedPayment.method === "card" && (
                    <>
                      <div><span className="font-medium">Card Type:</span> {selectedPayment.cardType || "N/A"}</div>
                      <div><span className="font-medium">Last 4:</span> {selectedPayment.cardLast4 || "N/A"}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {selectedPayment.totalRefunded > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <h4 className="font-semibold text-red-800 mb-2">Refund Information</h4>
                <div className="text-sm text-red-700">
                  <div>Total Refunded: ${selectedPayment.totalRefunded.toFixed(2)}</div>
                  {selectedPayment.refundedAt && (
                    <div>Refunded Date: {new Date(selectedPayment.refundedAt).toLocaleString()}</div>
                  )}
                  {selectedPayment.refundReason && (
                    <div>Reason: {selectedPayment.refundReason}</div>
                  )}
                </div>
              </div>
            )}
            {selectedPayment.notes && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  {selectedPayment.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 