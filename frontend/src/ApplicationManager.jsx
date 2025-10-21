import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ApplicationManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState({
    search: '',
    type: 'all',
    status: 'all',
    priority: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const applicationTypes = [
    { id: 'player', name: 'Player Registration', icon: '⚽', color: 'blue', description: 'New player applications' },
    { id: 'coach', name: 'Coach Application', icon: '👨‍🏫', color: 'green', description: 'Coaching position applications' },
    { id: 'volunteer', name: 'Volunteer Application', icon: '🤝', color: 'purple', description: 'Volunteer program applications' },
    { id: 'transfer', name: 'Transfer Request', icon: '🔄', color: 'orange', description: 'Player transfer applications' },
    { id: 'scholarship', name: 'Scholarship/Financial Aid', icon: '💰', color: 'teal', description: 'Financial assistance requests' },
    { id: 'team', name: 'Team Formation', icon: '👥', color: 'indigo', description: 'New team creation requests' },
    { id: 'event', name: 'Event Hosting', icon: '🎉', color: 'pink', description: 'Event hosting applications' },
    { id: 'facility', name: 'Facility Usage', icon: '🏟️', color: 'red', description: 'Facility rental/usage requests' },
    { id: 'membership', name: 'Membership Application', icon: '🎫', color: 'yellow', description: 'Club membership applications' },
    { id: 'sponsor', name: 'Sponsorship Proposal', icon: '🤝', color: 'cyan', description: 'Sponsorship applications' },
    { id: 'partnership', name: 'Partnership Request', icon: '🔗', color: 'lime', description: 'Partnership proposals' },
    { id: 'other', name: 'Other Applications', icon: '📋', color: 'gray', description: 'Miscellaneous applications' }
  ];

  const statusOptions = [
    { id: 'pending', name: 'Pending Review', color: 'yellow', icon: '⏳' },
    { id: 'under_review', name: 'Under Review', color: 'blue', icon: '👁️' },
    { id: 'approved', name: 'Approved', color: 'green', icon: '✅' },
    { id: 'rejected', name: 'Rejected', color: 'red', icon: '❌' },
    { id: 'on_hold', name: 'On Hold', color: 'orange', icon: '⏸️' },
    { id: 'requires_info', name: 'Requires Information', color: 'purple', icon: 'ℹ️' },
    { id: 'completed', name: 'Completed', color: 'teal', icon: '✓' }
  ];

  const priorityLevels = [
    { id: 'low', name: 'Low', color: 'gray', icon: '📌' },
    { id: 'medium', name: 'Medium', color: 'blue', icon: '📍' },
    { id: 'high', name: 'High', color: 'orange', icon: '⚠️' },
    { id: 'urgent', name: 'Urgent', color: 'red', icon: '🚨' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'all', name: 'All Applications', icon: '📋' },
    { id: 'pending', name: 'Pending', icon: '⏳' },
    { id: 'review', name: 'Under Review', icon: '👁️' },
    { id: 'approved', name: 'Approved', icon: '✅' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  const teamMembers = [
    { id: 'admin1', name: 'John Admin', role: 'Admin' },
    { id: 'admin2', name: 'Sarah Manager', role: 'Manager' },
    { id: 'admin3', name: 'Mike Reviewer', role: 'Reviewer' },
    { id: 'unassigned', name: 'Unassigned', role: '' }
  ];

  useEffect(() => {
    document.title = 'Application Management - Seattle Leopards FC Admin';
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id, status, notes = '') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        setMessage(`Application ${status} successfully!`);
        loadApplications();
        setShowModal(false);
        setReviewNotes('');
      } else {
        setMessage('Error updating application status');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Error updating application status');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationPriority = async (id, priority) => {
    try {
      const response = await fetch(`/api/applications/${id}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });

      if (response.ok) {
        setMessage('Priority updated successfully!');
        loadApplications();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const exportApplications = () => {
    const filtered = getFilteredApplications();
    const csv = [
      ['ID', 'Type', 'Applicant', 'Email', 'Status', 'Priority', 'Assigned To', 'Submitted', 'Last Updated'],
      ...filtered.map(app => [
        app._id,
        applicationTypes.find(t => t.id === app.type)?.name || app.type,
        app.applicantName,
        app.applicantEmail,
        app.status,
        app.priority || 'medium',
        app.assignedTo || 'Unassigned',
        new Date(app.submittedDate).toLocaleDateString(),
        new Date(app.updatedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const bulkUpdateStatus = async (status) => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications/bulk-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: selectedApplications, status })
      });

      if (response.ok) {
        setMessage(`${selectedApplications.length} applications updated to ${status}!`);
        loadApplications();
        setSelectedApplications([]);
        setShowBulkActions(false);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error in bulk update:', error);
    } finally {
      setLoading(false);
    }
  };

  const bulkAssign = async (assignee) => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications/bulk-assign', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: selectedApplications, assignedTo: assignee })
      });

      if (response.ok) {
        setMessage(`${selectedApplications.length} applications assigned!`);
        loadApplications();
        setSelectedApplications([]);
        setShowAssignModal(false);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error in bulk assign:', error);
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedApplications.length} applications? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/applications/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: selectedApplications })
      });

      if (response.ok) {
        setMessage(`${selectedApplications.length} applications deleted!`);
        loadApplications();
        setSelectedApplications([]);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error in bulk delete:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(filteredApplications.map(app => app._id));
    }
  };

  const toggleSelectApplication = (id) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(selectedApplications.filter(appId => appId !== id));
    } else {
      setSelectedApplications([...selectedApplications, id]);
    }
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    // Tab filtering
    if (activeTab === 'pending') {
      filtered = filtered.filter(app => app.status === 'pending');
    } else if (activeTab === 'review') {
      filtered = filtered.filter(app => app.status === 'under_review');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(app => app.status === 'approved');
    }

    // Additional filters
    if (filter.search) {
      filtered = filtered.filter(app =>
        app.applicantName?.toLowerCase().includes(filter.search.toLowerCase()) ||
        app.applicantEmail?.toLowerCase().includes(filter.search.toLowerCase()) ||
        app.notes?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }
    if (filter.type !== 'all') filtered = filtered.filter(app => app.type === filter.type);
    if (filter.status !== 'all') filtered = filtered.filter(app => app.status === filter.status);
    if (filter.priority !== 'all') filtered = filtered.filter(app => app.priority === filter.priority);
    if (filter.dateFrom) filtered = filtered.filter(app => new Date(app.submittedDate) >= new Date(filter.dateFrom));
    if (filter.dateTo) filtered = filtered.filter(app => new Date(app.submittedDate) <= new Date(filter.dateTo));

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch(sortBy) {
        case 'date':
          compareValue = new Date(b.submittedDate) - new Date(a.submittedDate);
          break;
        case 'name':
          compareValue = (a.applicantName || '').localeCompare(b.applicantName || '');
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          compareValue = priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
          break;
        case 'type':
          compareValue = (a.type || '').localeCompare(b.type || '');
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  };

  const filteredApplications = getFilteredApplications();

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    onHold: applications.filter(a => a.status === 'on_hold').length,
    requiresInfo: applications.filter(a => a.status === 'requires_info').length,
    urgent: applications.filter(a => a.priority === 'urgent').length,
    high: applications.filter(a => a.priority === 'high').length,
    byType: applicationTypes.map(type => ({
      ...type,
      count: applications.filter(a => a.type === type.id).length
    })),
    thisWeek: applications.filter(a => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.submittedDate) >= weekAgo;
    }).length,
    thisMonth: applications.filter(a => {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return new Date(a.submittedDate) >= monthAgo;
    }).length,
    today: applications.filter(a => {
      const today = new Date().toDateString();
      return new Date(a.submittedDate).toDateString() === today;
    }).length,
    approvalRate: applications.length > 0 
      ? ((applications.filter(a => a.status === 'approved').length / applications.length) * 100).toFixed(1) 
      : 0,
    avgProcessingTime: '3.2 days', // This would be calculated from actual data
    assignedCount: applications.filter(a => a.assignedTo && a.assignedTo !== 'unassigned').length,
    unassignedCount: applications.filter(a => !a.assignedTo || a.assignedTo === 'unassigned').length
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.id === status);
    return statusObj?.color || 'gray';
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorityLevels.find(p => p.id === priority);
    return priorityObj?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Review, process, and manage all club applications
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
                onClick={exportApplications}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <i className="bi bi-download me-2"></i>Export Data
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
                  {tab.id === 'review' && stats.underReview > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.underReview}
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
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                    <div className="text-sm text-blue-700 mt-1">Total Applications</div>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
                    <div className="text-sm text-yellow-700 mt-1">Pending Review</div>
                  </div>
                  <div className="text-4xl">⏳</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-900">{stats.underReview}</div>
                    <div className="text-sm text-blue-700 mt-1">Under Review</div>
                  </div>
                  <div className="text-4xl">👁️</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-900">{stats.urgent}</div>
                    <div className="text-sm text-red-700 mt-1">Urgent</div>
                  </div>
                  <div className="text-4xl">🚨</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">Approved</span>
                  <span className="text-2xl">✅</span>
                </div>
                <div className="text-3xl font-bold text-green-900">{stats.approved}</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700">Rejected</span>
                  <span className="text-2xl">❌</span>
                </div>
                <div className="text-3xl font-bold text-red-900">{stats.rejected}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">This Week</span>
                  <span className="text-2xl">📅</span>
                </div>
                <div className="text-3xl font-bold text-purple-900">{stats.thisWeek}</div>
              </div>
            </div>

            {/* Application Types Grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Applications by Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byType.map((type) => (
                  <div
                    key={type.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setFilter(f => ({ ...f, type: type.id }));
                      setActiveTab('all');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl">{type.icon}</div>
                      <div className="text-2xl font-bold text-gray-800">{type.count}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{type.name}</h3>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Application Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📋 What is Application Management?</h2>
              <p className="text-gray-700 mb-4">
                Application Management is a comprehensive system for processing and tracking all types of applications 
                submitted to your soccer club. It streamlines the review process, ensures timely responses, and maintains 
                a complete audit trail of all applications and decisions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">⚽ Player Applications</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• New player registrations</li>
                    <li>• Team tryout applications</li>
                    <li>• Transfer requests</li>
                    <li>• Age group changes</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">👨‍🏫 Coach Applications</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Coaching position applications</li>
                    <li>• Assistant coach requests</li>
                    <li>• Certification submissions</li>
                    <li>• Background checks</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">💰 Financial Applications</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Scholarship requests</li>
                    <li>• Financial aid applications</li>
                    <li>• Fee waivers</li>
                    <li>• Payment plan requests</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🤝 Volunteer Applications</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Volunteer program applications</li>
                    <li>• Event volunteer requests</li>
                    <li>• Committee participation</li>
                    <li>• Board member applications</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">⚡ Quick Review</h3>
                  <p className="text-sm text-blue-700">Fast application review with one-click actions</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">📊 Status Tracking</h3>
                  <p className="text-sm text-green-700">Real-time status updates and notifications</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">🔔 Automated Notifications</h3>
                  <p className="text-sm text-purple-700">Automatic emails to applicants</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-2">🚨 Priority System</h3>
                  <p className="text-sm text-orange-700">Flag urgent applications for quick action</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">📝 Review Notes</h3>
                  <p className="text-sm text-red-700">Add notes and comments during review</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <h3 className="font-semibold text-teal-900 mb-2">📤 Export & Reports</h3>
                  <p className="text-sm text-teal-700">Generate reports and export data</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Applications / Filtered Views */}
        {(activeTab === 'all' || activeTab === 'pending' || activeTab === 'review' || activeTab === 'approved') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Search applicants..."
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
                  {applicationTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
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
                  value={filter.priority}
                  onChange={(e) => setFilter(f => ({ ...f, priority: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Priorities</option>
                  {priorityLevels.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.icon} {priority.name}</option>
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
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredApplications.length} of {applications.length} applications
                </p>
                <button
                  onClick={() => setFilter({
                    search: '',
                    type: 'all',
                    status: 'all',
                    priority: 'all',
                    dateFrom: '',
                    dateTo: ''
                  })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedApplications.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-blue-900">
                      {selectedApplications.length} application(s) selected
                    </span>
                    <button
                      onClick={() => setSelectedApplications([])}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear Selection
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                    >
                      <i className="bi bi-person-plus me-1"></i>Assign
                    </button>
                    <button
                      onClick={() => bulkUpdateStatus('under_review')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <i className="bi bi-eye me-1"></i>Mark as Reviewing
                    </button>
                    <button
                      onClick={() => bulkUpdateStatus('approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      <i className="bi bi-check-circle me-1"></i>Approve All
                    </button>
                    <button
                      onClick={() => bulkUpdateStatus('rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                    >
                      <i className="bi bi-x-circle me-1"></i>Reject All
                    </button>
                    <button
                      onClick={bulkDelete}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sorting Bar */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="date">Date Submitted</option>
                    <option value="priority">Priority</option>
                    <option value="name">Applicant Name</option>
                    <option value="type">Application Type</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    <i className={`bi bi-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                    {sortOrder === 'asc' ? ' Ascending' : ' Descending'}
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Displaying {filteredApplications.length} result(s)
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">📋</div>
                          <p className="text-lg font-semibold mb-2">No applications found</p>
                          <p className="text-sm">Applications will appear here as they are submitted</p>
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((application) => {
                        const appType = applicationTypes.find(t => t.id === application.type);
                        const isSelected = selectedApplications.includes(application._id);
                        return (
                          <tr key={application._id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectApplication(application._id)}
                                className="rounded"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${appType?.color}-100 text-${appType?.color}-800`}>
                                {appType?.icon} {appType?.name || application.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{application.applicantName}</div>
                              <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(application.submittedDate).toLocaleDateString()}
                              <div className="text-xs text-gray-400">
                                {Math.floor((new Date() - new Date(application.submittedDate)) / (1000 * 60 * 60 * 24))} days ago
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={application.priority || 'medium'}
                                onChange={(e) => updateApplicationPriority(application._id, e.target.value)}
                                className={`px-2 py-1 text-xs rounded-full border-0 bg-${getPriorityColor(application.priority || 'medium')}-100 text-${getPriorityColor(application.priority || 'medium')}-800`}
                              >
                                {priorityLevels.map(p => (
                                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(application.status)}-100 text-${getStatusColor(application.status)}-800`}>
                                {statusOptions.find(s => s.id === application.status)?.icon} {statusOptions.find(s => s.id === application.status)?.name || application.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={application.assignedTo || 'unassigned'}
                                onChange={(e) => bulkAssign(e.target.value)}
                                className="px-2 py-1 text-xs rounded border text-gray-700"
                              >
                                {teamMembers.map(member => (
                                  <option key={member.id} value={member.id}>
                                    {member.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowTimelineModal(true);
                                  }}
                                  className="text-purple-600 hover:text-purple-800"
                                  title="View Timeline"
                                >
                                  <i className="bi bi-clock-history"></i>
                                </button>
                                {application.status === 'pending' || application.status === 'under_review' ? (
                                  <>
                                    <button
                                      onClick={() => updateApplicationStatus(application._id, 'approved')}
                                      className="text-green-600 hover:text-green-800"
                                      title="Approve"
                                    >
                                      <i className="bi bi-check-circle"></i>
                                    </button>
                                    <button
                                      onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                      className="text-red-600 hover:text-red-800"
                                      title="Reject"
                                    >
                                      <i className="bi bi-x-circle"></i>
                                    </button>
                                  </>
                                ) : null}
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
            {/* Enhanced Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{stats.today}</div>
                <div className="text-sm text-blue-700">Today</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">{stats.thisWeek}</div>
                <div className="text-sm text-green-700">This Week</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-900">{stats.thisMonth}</div>
                <div className="text-sm text-purple-700">This Month</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-900">{stats.approvalRate}%</div>
                <div className="text-sm text-orange-700">Approval Rate</div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg border border-teal-200">
                <div className="text-2xl font-bold text-teal-900">{stats.avgProcessingTime}</div>
                <div className="text-sm text-teal-700">Avg Processing</div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Status Breakdown</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
                  <div className="text-sm text-yellow-700 mt-1">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-900">{stats.underReview}</div>
                  <div className="text-sm text-blue-700 mt-1">Under Review</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-3xl font-bold text-orange-900">{stats.onHold}</div>
                  <div className="text-sm text-orange-700 mt-1">On Hold</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-900">{stats.requiresInfo}</div>
                  <div className="text-sm text-purple-700 mt-1">Requires Info</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-900">{stats.approved}</div>
                  <div className="text-sm text-green-700 mt-1">Approved</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-900">{stats.rejected}</div>
                  <div className="text-sm text-red-700 mt-1">Rejected</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="text-3xl font-bold text-indigo-900">{stats.assignedCount}</div>
                  <div className="text-sm text-indigo-700 mt-1">Assigned</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900">{stats.unassignedCount}</div>
                  <div className="text-sm text-gray-700 mt-1">Unassigned</div>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Priority Levels</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-4xl mb-2">🚨</div>
                  <div className="text-3xl font-bold text-red-900">{stats.urgent}</div>
                  <div className="text-sm text-red-700 mt-1">Urgent</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-4xl mb-2">⚠️</div>
                  <div className="text-3xl font-bold text-orange-900">{stats.high}</div>
                  <div className="text-sm text-orange-700 mt-1">High</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-4xl mb-2">📍</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {applications.filter(a => (a.priority || 'medium') === 'medium').length}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">Medium</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-4xl mb-2">📌</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {applications.filter(a => a.priority === 'low').length}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">Low</div>
                </div>
              </div>
            </div>

            {/* Application Type Performance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Application Types Performance</h2>
              <div className="space-y-3">
                {stats.byType.filter(t => t.count > 0).map((type) => {
                  const approvalRate = applications.filter(a => a.type === type.id && a.status === 'approved').length;
                  const totalOfType = type.count;
                  const percentage = totalOfType > 0 ? ((approvalRate / totalOfType) * 100).toFixed(0) : 0;
                  
                  return (
                    <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{type.name}</div>
                          <div className="text-sm text-gray-600">{type.count} applications</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">{approvalRate} approved</div>
                          <div className="text-xs text-gray-500">{percentage}% approval rate</div>
                        </div>
                        <div className="w-32">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Assign Applications</h2>
              <p className="text-gray-600 mb-4">
                Assign {selectedApplications.length} selected application(s) to:
              </p>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              >
                <option value="">Select team member...</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.role && `(${member.role})`}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setAssignedTo('');
                  }}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => bulkAssign(assignedTo)}
                  disabled={!assignedTo}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Modal */}
        {showTimelineModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Application Timeline</h2>
                <button
                  onClick={() => setShowTimelineModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="bi bi-file-earmark text-blue-600"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Application Submitted</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedApplication.submittedDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Application submitted by {selectedApplication.applicantName}
                    </p>
                  </div>
                </div>
                {selectedApplication.assignedTo && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <i className="bi bi-person-check text-purple-600"></i>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Assigned to Reviewer</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedApplication.updatedAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Assigned to {teamMembers.find(m => m.id === selectedApplication.assignedTo)?.name || 'team member'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-10 h-10 bg-${getStatusColor(selectedApplication.status)}-100 rounded-full flex items-center justify-center`}>
                    <i className={`bi bi-${selectedApplication.status === 'approved' ? 'check-circle' : selectedApplication.status === 'rejected' ? 'x-circle' : 'clock'} text-${getStatusColor(selectedApplication.status)}-600`}></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Current Status: {statusOptions.find(s => s.id === selectedApplication.status)?.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedApplication.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-gray-900">
                        {applicationTypes.find(t => t.id === selectedApplication.type)?.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900">
                        {statusOptions.find(s => s.id === selectedApplication.status)?.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Applicant</label>
                      <p className="text-gray-900">{selectedApplication.applicantName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedApplication.applicantEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Submitted Date</label>
                      <p className="text-gray-900">
                        {new Date(selectedApplication.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <p className="text-gray-900">
                        {priorityLevels.find(p => p.id === selectedApplication.priority)?.name || 'Medium'}
                      </p>
                    </div>
                  </div>

                  {selectedApplication.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Application Notes</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedApplication.notes}</p>
                    </div>
                  )}

                  {selectedApplication.status === 'pending' || selectedApplication.status === 'under_review' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Review Notes
                        </label>
                        <textarea
                          rows={3}
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add notes about your decision..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => updateApplicationStatus(selectedApplication._id, 'on_hold', reviewNotes)}
                          className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200"
                        >
                          Put On Hold
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected', reviewNotes)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(selectedApplication._id, 'approved', reviewNotes)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManager;

