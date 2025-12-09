import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import IndividualUserMessaging from './IndividualUserMessaging';
import { API_BASE_URL } from '../config/api';

const BroadcastManager = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('broadcasts');
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    draft: 0,
    scheduled: 0,
    totalRecipients: 0,
    totalRead: 0
  });
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'both',
    targetAudience: 'all',
    priority: 'normal',
    tags: '',
    scheduledFor: '',
    isPublic: false
  });
  const [selectedBroadcasts, setSelectedBroadcasts] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [broadcasts]);

  const fetchBroadcasts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access broadcast manager');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/broadcasts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch broadcasts');
      }
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
      toast.error(error.message || 'Failed to load broadcasts');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = broadcasts.length;
    const sent = broadcasts.filter(b => b.status === 'sent').length;
    const draft = broadcasts.filter(b => b.status === 'draft').length;
    const scheduled = broadcasts.filter(b => b.status === 'scheduled').length;
    const totalRecipients = broadcasts.reduce((sum, b) => sum + (b.deliveryStats?.totalRecipients || 0), 0);
    const totalRead = broadcasts.reduce((sum, b) => sum + (b.deliveryStats?.inAppRead || 0), 0);

    setStats({ total, sent, draft, scheduled, totalRecipients, totalRead });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/broadcasts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          scheduledFor: form.scheduledFor || null
        })
      });

      if (response.ok) {
        const newBroadcast = await response.json();
        setBroadcasts([newBroadcast, ...broadcasts]);
        setShowCreateModal(false);
        setForm({
          title: '',
          content: '',
          type: 'both',
          targetAudience: 'all',
          priority: 'normal',
          tags: '',
          scheduledFor: '',
          isPublic: false
        });
        toast.success('Broadcast created successfully');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create broadcast');
      }
    } catch (error) {
      console.error('Error creating broadcast:', error);
      toast.error(error.message);
    }
  };

  const handleSendBroadcast = async (broadcastId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/broadcasts/${broadcastId}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Broadcast sent successfully');
        fetchBroadcasts();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send broadcast');
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteBroadcast = async (broadcastId) => {
    if (!window.confirm('Are you sure you want to delete this broadcast?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/broadcasts/${broadcastId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setBroadcasts(broadcasts.filter(b => b._id !== broadcastId));
        
        // Show success message with warning if applicable
        if (result.warning) {
          toast.success(result.message);
          toast.warning(result.warning);
        } else {
          toast.success(result.message);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete broadcast');
      }
    } catch (error) {
      console.error('Error deleting broadcast:', error);
      toast.error(error.message);
    }
  };

  const handleSelectBroadcast = (broadcastId) => {
    setSelectedBroadcasts(prev => {
      if (prev.includes(broadcastId)) {
        return prev.filter(id => id !== broadcastId);
      } else {
        return [...prev, broadcastId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedBroadcasts(filteredBroadcasts.map(b => b._id));
  };

  const handleClearSelection = () => {
    setSelectedBroadcasts([]);
  };

  const handleBulkDelete = async () => {
    if (selectedBroadcasts.length === 0) {
      toast.error('Please select broadcasts to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedBroadcasts.length} broadcast(s)?`)) return;

    try {
      const token = localStorage.getItem('token');
      let successCount = 0;
      let warningCount = 0;
      let errorCount = 0;

      for (const broadcastId of selectedBroadcasts) {
        try {
          const response = await fetch(`${API_BASE_URL}/broadcasts/${broadcastId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            const result = await response.json();
            successCount++;
            if (result.warning) {
              warningCount++;
            }
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      // Update the broadcasts list
      setBroadcasts(broadcasts.filter(b => !selectedBroadcasts.includes(b._id)));
      setSelectedBroadcasts([]);

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} broadcast(s)`);
      }
      if (warningCount > 0) {
        toast.warning(`${warningCount} broadcast(s) were already sent and may have been delivered`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} broadcast(s)`);
      }
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('An error occurred during bulk delete');
    }
  };

  const handleExport = (format) => {
    const data = filteredBroadcasts.map(b => ({
      Title: b.title,
      Content: b.content,
      Status: b.status,
      Type: b.type,
      Priority: b.priority,
      TargetAudience: b.targetAudience,
      Recipients: b.deliveryStats?.totalRecipients || 0,
      Read: b.deliveryStats?.inAppRead || 0,
      ReadRate: b.deliveryStats?.totalRecipients > 0 ? 
        ((b.deliveryStats.inAppRead / b.deliveryStats.totalRecipients) * 100).toFixed(1) + '%' : '0%',
      Created: new Date(b.createdAt).toLocaleDateString(),
      SentBy: b.sentBy?.username || 'Admin'
    }));

    if (format === 'csv') {
      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `broadcasts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `broadcasts-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    
    setShowExportModal(false);
    toast.success(`Exported ${data.length} broadcasts as ${format.toUpperCase()}`);
  };

  const filteredBroadcasts = broadcasts.filter(broadcast => {
    if (filter.status !== 'all' && broadcast.status !== filter.status) return false;
    if (filter.type !== 'all' && broadcast.type !== filter.type) return false;
    if (filter.priority !== 'all' && broadcast.priority !== filter.priority) return false;
    if (filter.search && !broadcast.title.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Broadcast Manager
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Comprehensive communication hub for club announcements and messaging
              </p>
            </div>
            {activeTab === 'broadcasts' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Broadcast
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {activeTab === 'broadcasts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Broadcasts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRecipients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Read</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRead}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('broadcasts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'broadcasts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Group Broadcasts
                </div>
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'individual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Individual Messages
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'broadcasts' ? (
            <div className="p-6">
              {/* Filters */}
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search broadcasts..."
                      value={filter.search}
                      onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filter.status}
                      onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={filter.type}
                      onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="email">Email</option>
                      <option value="in_app">In-App</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={filter.priority}
                      onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilter({ status: 'all', type: 'all', priority: 'all', search: '' })}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Bulk Actions */}
                {filteredBroadcasts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedBroadcasts.length === filteredBroadcasts.length && filteredBroadcasts.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Select All ({filteredBroadcasts.length})
                          </label>
                        </div>
                        {selectedBroadcasts.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {selectedBroadcasts.length} selected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedBroadcasts.length > 0 && (
                          <>
                            <button
                              onClick={handleClearSelection}
                              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                              Clear Selection
                            </button>
                            <button
                              onClick={handleBulkDelete}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                            >
                              Delete Selected ({selectedBroadcasts.length})
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Broadcasts List */}
              <div className="space-y-4">
                {filteredBroadcasts.map((broadcast) => (
                  <div key={broadcast._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={selectedBroadcasts.includes(broadcast._id)}
                            onChange={() => handleSelectBroadcast(broadcast._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 truncate">{broadcast.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                              {broadcast.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(broadcast.priority)}`}>
                              {broadcast.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{broadcast.content}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {broadcast.sentBy?.username || 'Admin'}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(broadcast.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {broadcast.targetAudience}
                            </span>
                            {broadcast.deliveryStats && (
                              <>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                  </svg>
                                  {broadcast.deliveryStats.totalRecipients} recipients
                                </span>
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  {broadcast.deliveryStats.inAppRead} read
                                </span>
                              </>
                            )}
                          </div>
                          {broadcast.tags && broadcast.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {broadcast.tags.map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedBroadcast(broadcast);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          View Details
                        </button>
                        {broadcast.status === 'draft' && (
                          <button
                            onClick={() => handleSendBroadcast(broadcast._id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                          >
                            Send Now
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBroadcast(broadcast._id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBroadcasts.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts found</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first broadcast message.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Broadcast
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <IndividualUserMessaging />
            </div>
          )}
        </div>

        {/* Create Broadcast Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-2xl rounded-2xl bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create New Broadcast</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter broadcast title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter broadcast content..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="both">Email & In-App</option>
                      <option value="email">Email Only</option>
                      <option value="in_app">In-App Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <select
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="all">All Members</option>
                      <option value="players">Players Only</option>
                      <option value="coaches">Coaches Only</option>
                      <option value="referees">Referees Only</option>
                      <option value="volunteers">Volunteers Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule For (Optional)</label>
                    <input
                      type="datetime-local"
                      value={form.scheduledFor}
                      onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="announcement, important, event"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={form.isPublic}
                    onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                    Make this broadcast public
                  </label>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    Create Broadcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Broadcast Details Modal */}
        {showDetailsModal && selectedBroadcast && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-2xl rounded-2xl bg-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Broadcast Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedBroadcast.title}</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedBroadcast.content}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBroadcast.status)}`}>
                        {selectedBroadcast.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedBroadcast.priority)}`}>
                        {selectedBroadcast.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="text-gray-900">{selectedBroadcast.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                      <p className="text-gray-900">{selectedBroadcast.targetAudience}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created By</label>
                      <p className="text-gray-900">{selectedBroadcast.sentBy?.username || 'Admin'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <p className="text-gray-900">{new Date(selectedBroadcast.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedBroadcast.sentAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sent At</label>
                        <p className="text-gray-900">{new Date(selectedBroadcast.sentAt).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedBroadcast.tags && selectedBroadcast.tags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedBroadcast.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {selectedBroadcast.deliveryStats && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-medium text-gray-900 mb-4">Delivery Statistics</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{selectedBroadcast.deliveryStats.totalRecipients}</p>
                        <p className="text-sm text-gray-600">Total Recipients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedBroadcast.deliveryStats.emailsSent}</p>
                        <p className="text-sm text-gray-600">Emails Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{selectedBroadcast.deliveryStats.inAppDelivered}</p>
                        <p className="text-sm text-gray-600">In-App Delivered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{selectedBroadcast.deliveryStats.inAppRead}</p>
                        <p className="text-sm text-gray-600">In-App Read</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Close
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

export default BroadcastManager;
