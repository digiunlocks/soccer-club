import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DocumentationManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filter, setFilter] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });

  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'policies',
    version: '1.0',
    file: null,
    tags: [],
    status: 'draft'
  });

  // Record Keeping State
  const [records, setRecords] = useState([]);
  const [recordFilter, setRecordFilter] = useState({
    search: '',
    recordType: 'all',
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [activeRecordSubTab, setActiveRecordSubTab] = useState('overview');

  const categories = [
    { id: 'policies', name: 'Policies & Procedures', icon: '📋', color: 'blue' },
    { id: 'forms', name: 'Forms & Templates', icon: '📄', color: 'green' },
    { id: 'handbooks', name: 'Handbooks & Guides', icon: '📚', color: 'purple' },
    { id: 'training', name: 'Training Materials', icon: '🎓', color: 'orange' },
    { id: 'legal', name: 'Legal Documents', icon: '⚖️', color: 'red' },
    { id: 'financial', name: 'Financial Documents', icon: '💰', color: 'teal' },
    { id: 'medical', name: 'Medical Forms', icon: '🏥', color: 'pink' },
    { id: 'other', name: 'Other Documents', icon: '📎', color: 'gray' }
  ];

  const recordTypes = [
    { id: 'player', name: 'Player Records', icon: '⚽', color: 'blue', description: 'Player registrations, performance, transfers' },
    { id: 'user', name: 'User Records', icon: '👤', color: 'green', description: 'All registered users and account history' },
    { id: 'disciplinary', name: 'Disciplinary Records', icon: '⚠️', color: 'red', description: 'Warnings, violations, suspensions' },
    { id: 'financial', name: 'Financial Records', icon: '💰', color: 'teal', description: 'Payments, transactions, fees' },
    { id: 'marketplace', name: 'Marketplace Records', icon: '🛒', color: 'purple', description: 'Listings, sales, rentals' },
    { id: 'medical', name: 'Medical Records', icon: '🏥', color: 'pink', description: 'Injuries, treatments, clearances' },
    { id: 'attendance', name: 'Attendance Records', icon: '📅', color: 'orange', description: 'Training and match attendance' },
    { id: 'volunteer', name: 'Volunteer Records', icon: '🤝', color: 'indigo', description: 'Volunteer hours and activities' },
    { id: 'coach', name: 'Coach Records', icon: '👨‍🏫', color: 'cyan', description: 'Coach certifications and evaluations' },
    { id: 'event', name: 'Event Records', icon: '🎉', color: 'yellow', description: 'Event participation and outcomes' },
    { id: 'communication', name: 'Communication Records', icon: '📧', color: 'gray', description: 'Messages, notifications, announcements' },
    { id: 'compliance', name: 'Compliance Records', icon: '✓', color: 'lime', description: 'Policy compliance and audits' }
  ];

  const retentionPolicies = [
    { type: 'player', duration: 'Lifetime + 7 years after departure', legal: 'Required for legal and insurance purposes' },
    { type: 'user', duration: 'Lifetime of account + 3 years', legal: 'Data protection compliance (GDPR)' },
    { type: 'disciplinary', duration: 'Permanent (major) / 5 years (minor)', legal: 'Legal protection and appeals' },
    { type: 'financial', duration: '7 years minimum', legal: 'Tax and audit requirements' },
    { type: 'marketplace', duration: '5 years after transaction', legal: 'Consumer protection laws' },
    { type: 'medical', duration: 'Lifetime + 10 years', legal: 'Medical record retention laws' },
    { type: 'attendance', duration: '3 years', legal: 'Operational records' },
    { type: 'volunteer', duration: 'Lifetime + 5 years', legal: 'Background check compliance' },
    { type: 'coach', duration: 'Lifetime + 7 years', legal: 'Certification and liability' },
    { type: 'event', duration: '5 years', legal: 'Historical records' },
    { type: 'communication', duration: '3 years', legal: 'Communication audit trail' },
    { type: 'compliance', duration: 'Permanent', legal: 'Regulatory compliance' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'all', name: 'All Documents', icon: '📁' },
    { id: 'records', name: 'Record Keeping', icon: '📝' },
    { id: 'upload', name: 'Upload Document', icon: '⬆️' }
  ];

  useEffect(() => {
    document.title = 'Documentation Management - Seattle Leopards FC Admin';
    loadDocuments();
    loadRecords();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportRecords = (recordType) => {
    const filtered = records.filter(r => recordType === 'all' || r.recordType === recordType);
    const csv = [
      ['Record ID', 'Type', 'Subject', 'Date', 'Status', 'Retention Until', 'Notes'],
      ...filtered.map(r => [
        r._id,
        r.recordType,
        r.subject,
        new Date(r.date).toLocaleDateString(),
        r.status,
        r.retentionDate ? new Date(r.retentionDate).toLocaleDateString() : 'N/A',
        r.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `records-${recordType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument(prev => ({ ...prev, file }));
    }
  };

  const uploadDocument = async () => {
    if (!newDocument.title || !newDocument.file) {
      setMessage('Please provide title and file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', newDocument.file);
      formData.append('title', newDocument.title);
      formData.append('description', newDocument.description);
      formData.append('category', newDocument.category);
      formData.append('version', newDocument.version);
      formData.append('tags', JSON.stringify(newDocument.tags));
      formData.append('status', newDocument.status);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setMessage('Document uploaded successfully!');
        setShowUploadModal(false);
        setNewDocument({
          title: '',
          description: '',
          category: 'policies',
          version: '1.0',
          file: null,
          tags: [],
          status: 'draft'
        });
        loadDocuments();
      } else {
        setMessage('Error uploading document');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setMessage('Error uploading document');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Document deleted successfully!');
        loadDocuments();
      } else {
        setMessage('Error deleting document');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting document:', error);
      setMessage('Error deleting document');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (id, status) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setMessage('Document status updated!');
        loadDocuments();
      } else {
        setMessage('Error updating status');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Error updating status');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter.search && !doc.title.toLowerCase().includes(filter.search.toLowerCase()) &&
        !doc.description?.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    if (filter.category !== 'all' && doc.category !== filter.category) return false;
    if (filter.status !== 'all' && doc.status !== filter.status) return false;
    return true;
  });

  const filteredRecords = records.filter(record => {
    if (recordFilter.search && 
        !record.subject?.toLowerCase().includes(recordFilter.search.toLowerCase()) &&
        !record.notes?.toLowerCase().includes(recordFilter.search.toLowerCase())) {
      return false;
    }
    if (recordFilter.recordType !== 'all' && record.recordType !== recordFilter.recordType) return false;
    if (recordFilter.status !== 'all' && record.status !== recordFilter.status) return false;
    if (recordFilter.dateFrom && new Date(record.date) < new Date(recordFilter.dateFrom)) return false;
    if (recordFilter.dateTo && new Date(record.date) > new Date(recordFilter.dateTo)) return false;
    return true;
  });

  const stats = {
    total: documents.length,
    published: documents.filter(d => d.status === 'published').length,
    draft: documents.filter(d => d.status === 'draft').length,
    archived: documents.filter(d => d.status === 'archived').length,
    byCategory: categories.map(cat => ({
      ...cat,
      count: documents.filter(d => d.category === cat.id).length
    }))
  };

  const recordStats = {
    total: records.length,
    active: records.filter(r => r.status === 'active').length,
    archived: records.filter(r => r.status === 'archived').length,
    flagged: records.filter(r => r.status === 'flagged').length,
    byType: recordTypes.map(type => ({
      ...type,
      count: records.filter(r => r.recordType === type.id).length
    })),
    upcomingRetention: records.filter(r => {
      if (!r.retentionDate) return false;
      const daysUntil = Math.floor((new Date(r.retentionDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 90 && daysUntil >= 0;
    }).length
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
      pending: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.color || 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentation Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage club documents, forms, handbooks, and resources
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
                  setShowUploadModal(true);
                  setActiveTab('upload');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-upload me-2"></i>Upload Document
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-700 mt-1">Total Documents</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-green-900">{stats.published}</div>
                <div className="text-sm text-green-700 mt-1">Published</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-yellow-900">{stats.draft}</div>
                <div className="text-sm text-yellow-700 mt-1">Drafts</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-3xl font-bold text-gray-900">{stats.archived}</div>
                <div className="text-sm text-gray-700 mt-1">Archived</div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Document Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.byCategory.map((cat) => (
                  <div key={cat.id} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl mb-2">{cat.icon}</div>
                        <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                        <p className="text-2xl font-bold text-gray-800 mt-2">{cat.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setShowUploadModal(true);
                    setActiveTab('upload');
                  }}
                  className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">⬆️</div>
                  <h3 className="font-semibold text-blue-900">Upload Document</h3>
                  <p className="text-sm text-blue-700 mt-1">Add new document to library</p>
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className="bg-green-50 border-2 border-green-200 p-4 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <div className="text-2xl mb-2">📁</div>
                  <h3 className="font-semibold text-green-900">Browse Documents</h3>
                  <p className="text-sm text-green-700 mt-1">View all documents</p>
                </button>
                <button className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg hover:bg-purple-100 transition-colors text-left">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-purple-900">Generate Report</h3>
                  <p className="text-sm text-purple-700 mt-1">Export document inventory</p>
                </button>
              </div>
            </div>

            {/* Document Types Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What is Documentation Management?</h2>
              <p className="text-gray-700 mb-4">
                The Documentation Management system serves as your club's central document repository and knowledge base. 
                It's designed to organize, store, and distribute all important club documents efficiently.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📋 Policies & Procedures</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Club policies and bylaws</li>
                    <li>• Operational procedures</li>
                    <li>• Safety protocols</li>
                    <li>• Code of conduct documents</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📄 Forms & Templates</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Registration forms</li>
                    <li>• Consent forms</li>
                    <li>• Permission slips</li>
                    <li>• Document templates</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📚 Handbooks & Guides</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Parent handbooks</li>
                    <li>• Player guides</li>
                    <li>• Coach manuals</li>
                    <li>• Training guides</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">⚖️ Legal & Medical</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Liability waivers</li>
                    <li>• Medical consent forms</li>
                    <li>• Insurance documents</li>
                    <li>• Legal agreements</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Documents Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-wrap gap-4">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={filter.search}
                  onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
                  className="border rounded px-3 py-2 flex-1 min-w-[200px]"
                />
                <select
                  value={filter.category}
                  onChange={(e) => setFilter(f => ({ ...f, category: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  All Documents ({filteredDocuments.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          <div className="text-6xl mb-4">📄</div>
                          <p className="text-lg font-semibold mb-2">No documents found</p>
                          <p className="text-sm">Upload your first document to get started</p>
                          <button
                            onClick={() => {
                              setShowUploadModal(true);
                              setActiveTab('upload');
                            }}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Upload Document
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <tr key={doc._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{doc.title}</div>
                              {doc.description && (
                                <div className="text-sm text-gray-500">{doc.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full bg-${getCategoryColor(doc.category)}-100 text-${getCategoryColor(doc.category)}-800`}>
                              {categories.find(c => c.id === doc.category)?.name || doc.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            v{doc.version || '1.0'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => window.open(doc.url, '_blank')}
                                className="text-blue-600 hover:text-blue-800"
                                title="View"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button
                                onClick={() => window.open(doc.url, '_blank')}
                                className="text-green-600 hover:text-green-800"
                                title="Download"
                              >
                                <i className="bi bi-download"></i>
                              </button>
                              <button
                                onClick={() => deleteDocument(doc._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
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

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Document</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter document description..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={newDocument.version}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={newDocument.status}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, XLS, PPT, Images up to 10MB
                    </p>
                    {newDocument.file && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        ✓ {newDocument.file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setNewDocument({
                      title: '',
                      description: '',
                      category: 'policies',
                      version: '1.0',
                      file: null,
                      tags: [],
                      status: 'draft'
                    });
                    setActiveTab('overview');
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadDocument}
                  disabled={loading || !newDocument.title || !newDocument.file}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Keeping Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            {/* Record Keeping Sub-tabs */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveRecordSubTab('overview')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeRecordSubTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => setActiveRecordSubTab('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeRecordSubTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📋 All Records
                </button>
                <button
                  onClick={() => setActiveRecordSubTab('retention')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeRecordSubTab === 'retention'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⏰ Retention Policies
                </button>
              </div>
            </div>

            {/* Overview Sub-tab */}
            {activeRecordSubTab === 'overview' && (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-blue-900">{recordStats.total}</div>
                    <div className="text-sm text-blue-700 mt-1">Total Records</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-green-900">{recordStats.active}</div>
                    <div className="text-sm text-green-700 mt-1">Active Records</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-orange-900">{recordStats.upcomingRetention}</div>
                    <div className="text-sm text-orange-700 mt-1">Retention Due (90 days)</div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="text-3xl font-bold text-red-900">{recordStats.flagged}</div>
                    <div className="text-sm text-red-700 mt-1">Flagged for Review</div>
                  </div>
                </div>

                {/* Record Types Grid */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Record Types</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recordStats.byType.map((type) => (
                      <div 
                        key={type.id} 
                        className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          setRecordFilter(f => ({ ...f, recordType: type.id }));
                          setActiveRecordSubTab('all');
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

                {/* What is Record Keeping */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">📝 What is Record Keeping?</h2>
                  <p className="text-gray-700 mb-4">
                    Record Keeping is a comprehensive lifetime data retention system that maintains all club records 
                    according to legal requirements and organizational policies. This ensures compliance, protects 
                    the club legally, and provides historical data for audits and reporting.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-2">⚽ Player Records</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Registration history</li>
                        <li>• Performance evaluations</li>
                        <li>• Transfers and movements</li>
                        <li>• Disciplinary actions</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-2">👤 User Records</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Account creation and changes</li>
                        <li>• Login history</li>
                        <li>• Profile modifications</li>
                        <li>• Role assignments</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-2">⚠️ Disciplinary Records</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Warnings and violations</li>
                        <li>• Suspensions and bans</li>
                        <li>• Appeals and resolutions</li>
                        <li>• Incident reports</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-2">💰 Financial Records</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Payment transactions</li>
                        <li>• Fee assessments</li>
                        <li>• Refunds and credits</li>
                        <li>• Financial aid history</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-2">🛒 Marketplace Records</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Listing history</li>
                        <li>• Sales and rentals</li>
                        <li>• Transaction details</li>
                        <li>• Dispute resolutions</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="font-semibold text-gray-900 mb-2">🏥 Medical Records</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Injury reports</li>
                        <li>• Medical clearances</li>
                        <li>• Treatment history</li>
                        <li>• Emergency contacts</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">🔒 Legal Compliance</h3>
                      <p className="text-sm text-blue-700">Automatic retention policies based on legal requirements</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-900 mb-2">📊 Audit Trail</h3>
                      <p className="text-sm text-green-700">Complete history of all record changes and access</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-purple-900 mb-2">⏰ Automated Retention</h3>
                      <p className="text-sm text-purple-700">Automatic archival and deletion per policy</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h3 className="font-semibold text-orange-900 mb-2">🔍 Advanced Search</h3>
                      <p className="text-sm text-orange-700">Find records by type, date, subject, or status</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-900 mb-2">📤 Bulk Export</h3>
                      <p className="text-sm text-red-700">Export records for reporting and compliance</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <h3 className="font-semibold text-teal-900 mb-2">🔔 Retention Alerts</h3>
                      <p className="text-sm text-teal-700">Notifications for upcoming retention dates</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Records Sub-tab */}
            {activeRecordSubTab === 'all' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input
                      type="text"
                      placeholder="Search records..."
                      value={recordFilter.search}
                      onChange={(e) => setRecordFilter(f => ({ ...f, search: e.target.value }))}
                      className="border rounded px-3 py-2"
                    />
                    <select
                      value={recordFilter.recordType}
                      onChange={(e) => setRecordFilter(f => ({ ...f, recordType: e.target.value }))}
                      className="border rounded px-3 py-2"
                    >
                      <option value="all">All Types</option>
                      {recordTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                      ))}
                    </select>
                    <select
                      value={recordFilter.status}
                      onChange={(e) => setRecordFilter(f => ({ ...f, status: e.target.value }))}
                      className="border rounded px-3 py-2"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                      <option value="flagged">Flagged</option>
                    </select>
                    <input
                      type="date"
                      value={recordFilter.dateFrom}
                      onChange={(e) => setRecordFilter(f => ({ ...f, dateFrom: e.target.value }))}
                      placeholder="From Date"
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="date"
                      value={recordFilter.dateTo}
                      onChange={(e) => setRecordFilter(f => ({ ...f, dateTo: e.target.value }))}
                      placeholder="To Date"
                      className="border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">
                      Showing {filteredRecords.length} of {records.length} records
                    </p>
                    <button
                      onClick={() => exportRecords(recordFilter.recordType)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      📥 Export Records
                    </button>
                  </div>
                </div>

                {/* Records Table */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention Until</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                              <div className="text-6xl mb-4">📝</div>
                              <p className="text-lg font-semibold mb-2">No records found</p>
                              <p className="text-sm">Records are automatically created from system activities</p>
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map((record) => {
                            const recordType = recordTypes.find(t => t.id === record.recordType);
                            return (
                              <tr key={record._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs rounded-full bg-${recordType?.color}-100 text-${recordType?.color}-800`}>
                                    {recordType?.icon} {recordType?.name || record.recordType}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">{record.subject}</div>
                                  {record.notes && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{record.notes}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    record.status === 'active' ? 'bg-green-100 text-green-800' :
                                    record.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {record.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {record.retentionDate ? new Date(record.retentionDate).toLocaleDateString() : 'Permanent'}
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => {
                                      setSelectedRecord(record);
                                      setShowRecordModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>
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

            {/* Retention Policies Sub-tab */}
            {activeRecordSubTab === 'retention' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Retention Policies</h2>
                  <p className="text-gray-600 mb-6">
                    These policies define how long different types of records must be kept according to legal 
                    requirements and best practices. Records are automatically archived or deleted based on these policies.
                  </p>

                  <div className="space-y-4">
                    {retentionPolicies.map((policy) => {
                      const recordType = recordTypes.find(t => t.id === policy.type);
                      const recordCount = records.filter(r => r.recordType === policy.type).length;
                      
                      return (
                        <div key={policy.type} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-3">{recordType?.icon}</span>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{recordType?.name}</h3>
                                  <p className="text-sm text-gray-600">{recordType?.description}</p>
                                </div>
                              </div>
                              <div className="ml-11 space-y-2">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-700 w-32">Retention:</span>
                                  <span className="text-sm text-gray-900 font-semibold">{policy.duration}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-700 w-32">Legal Basis:</span>
                                  <span className="text-sm text-gray-600">{policy.legal}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-700 w-32">Total Records:</span>
                                  <span className="text-sm text-blue-600 font-semibold">{recordCount} records</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legal Compliance Notice */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Legal Compliance Notice</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          These retention policies are based on federal and state legal requirements. Modifying these 
                          policies may result in non-compliance. Consult with legal counsel before making changes. 
                          Some records may require longer retention based on ongoing legal matters or investigations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationManager;

