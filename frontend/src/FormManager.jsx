import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FormManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'registration',
    status: 'draft',
    fields: [],
    settings: {
      allowAnonymous: false,
      requireLogin: true,
      multipleSubmissions: false,
      showProgressBar: true,
      confirmationMessage: 'Thank you for your submission!',
      notificationEmail: '',
      autoResponse: true
    }
  });

  const formCategories = [
    { id: 'registration', name: 'Registration Forms', icon: '📝', color: 'blue', description: 'Player, team, and program registrations' },
    { id: 'medical', name: 'Medical Forms', icon: '🏥', color: 'red', description: 'Medical consent, health questionnaires' },
    { id: 'consent', name: 'Consent & Waivers', icon: '✍️', color: 'orange', description: 'Liability waivers, permission forms' },
    { id: 'evaluation', name: 'Evaluation Forms', icon: '⭐', color: 'yellow', description: 'Player assessments, coach evaluations' },
    { id: 'feedback', name: 'Feedback Forms', icon: '💬', color: 'green', description: 'Surveys, feedback, suggestions' },
    { id: 'application', name: 'Application Forms', icon: '📋', color: 'purple', description: 'Job, volunteer, scholarship applications' },
    { id: 'event', name: 'Event Forms', icon: '🎉', color: 'pink', description: 'Event registration, RSVP forms' },
    { id: 'financial', name: 'Financial Forms', icon: '💰', color: 'teal', description: 'Payment, scholarship, refund forms' },
    { id: 'other', name: 'Other Forms', icon: '📄', color: 'gray', description: 'Custom and miscellaneous forms' }
  ];

  const fieldTypes = [
    { id: 'text', name: 'Short Text', icon: '📝', description: 'Single line text input' },
    { id: 'textarea', name: 'Long Text', icon: '📄', description: 'Multi-line text area' },
    { id: 'email', name: 'Email', icon: '📧', description: 'Email address input' },
    { id: 'phone', name: 'Phone', icon: '📱', description: 'Phone number input' },
    { id: 'number', name: 'Number', icon: '🔢', description: 'Numeric input' },
    { id: 'date', name: 'Date', icon: '📅', description: 'Date picker' },
    { id: 'time', name: 'Time', icon: '🕐', description: 'Time picker' },
    { id: 'dropdown', name: 'Dropdown', icon: '▼', description: 'Select from options' },
    { id: 'radio', name: 'Radio Buttons', icon: '⚪', description: 'Choose one option' },
    { id: 'checkbox', name: 'Checkboxes', icon: '☑️', description: 'Select multiple' },
    { id: 'file', name: 'File Upload', icon: '📎', description: 'Upload documents' },
    { id: 'signature', name: 'Signature', icon: '✒️', description: 'Digital signature' },
    { id: 'address', name: 'Address', icon: '🏠', description: 'Full address input' },
    { id: 'section', name: 'Section Header', icon: '📌', description: 'Organize form sections' },
    { id: 'paragraph', name: 'Paragraph Text', icon: '📰', description: 'Descriptive text' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'all', name: 'All Forms', icon: '📋' },
    { id: 'builder', name: 'Form Builder', icon: '🔨' },
    { id: 'submissions', name: 'Submissions', icon: '📥' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  useEffect(() => {
    document.title = 'Form Management - Seattle Leopards FC Admin';
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async () => {
    try {
      setLoading(true);
      const url = selectedForm ? `/api/forms/${selectedForm._id}` : '/api/forms';
      const method = selectedForm ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('Form saved successfully!');
        loadForms();
        setShowFormBuilder(false);
        resetFormData();
      } else {
        setMessage('Error saving form');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving form:', error);
      setMessage('Error saving form');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (id) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Form deleted successfully!');
        loadForms();
      } else {
        setMessage('Error deleting form');
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const duplicateForm = async (form) => {
    try {
      setLoading(true);
      const duplicated = {
        ...form,
        title: `${form.title} (Copy)`,
        status: 'draft'
      };
      delete duplicated._id;

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicated)
      });

      if (response.ok) {
        setMessage('Form duplicated successfully!');
        loadForms();
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error duplicating form:', error);
    } finally {
      setLoading(false);
    }
  };

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      placeholder: '',
      required: false,
      options: type === 'dropdown' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : [],
      validation: {},
      conditionalLogic: null
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const moveField = (fieldId, direction) => {
    setFormData(prev => {
      const fields = [...prev.fields];
      const index = fields.findIndex(f => f.id === fieldId);
      if (direction === 'up' && index > 0) {
        [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
      } else if (direction === 'down' && index < fields.length - 1) {
        [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
      }
      return { ...prev, fields };
    });
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      description: '',
      category: 'registration',
      status: 'draft',
      fields: [],
      settings: {
        allowAnonymous: false,
        requireLogin: true,
        multipleSubmissions: false,
        showProgressBar: true,
        confirmationMessage: 'Thank you for your submission!',
        notificationEmail: '',
        autoResponse: true
      }
    });
    setSelectedForm(null);
  };

  const editForm = (form) => {
    setFormData(form);
    setSelectedForm(form);
    setShowFormBuilder(true);
    setActiveTab('builder');
  };

  const exportForm = (form) => {
    const dataStr = JSON.stringify(form, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, '_')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredForms = forms.filter(form => {
    if (filter.search && !form.title.toLowerCase().includes(filter.search.toLowerCase()) &&
        !form.description?.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }
    if (filter.category !== 'all' && form.category !== filter.category) return false;
    if (filter.status !== 'all' && form.status !== filter.status) return false;
    return true;
  });

  const stats = {
    total: forms.length,
    active: forms.filter(f => f.status === 'active').length,
    draft: forms.filter(f => f.status === 'draft').length,
    archived: forms.filter(f => f.status === 'archived').length,
    byCategory: formCategories.map(cat => ({
      ...cat,
      count: forms.filter(f => f.category === cat.id).length
    })),
    totalSubmissions: forms.reduce((sum, f) => sum + (f.submissions || 0), 0),
    thisWeek: forms.filter(f => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(f.createdAt) >= weekAgo;
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Form Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create, manage, and distribute forms throughout your club
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
                  resetFormData();
                  setShowFormBuilder(true);
                  setActiveTab('builder');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="bi bi-plus-lg me-2"></i>Create New Form
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
                  {tab.id === 'submissions' && stats.totalSubmissions > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {stats.totalSubmissions}
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
                    <div className="text-sm text-blue-700 mt-1">Total Forms</div>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-900">{stats.active}</div>
                    <div className="text-sm text-green-700 mt-1">Active Forms</div>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-900">{stats.totalSubmissions}</div>
                    <div className="text-sm text-purple-700 mt-1">Total Submissions</div>
                  </div>
                  <div className="text-4xl">📥</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-orange-900">{stats.thisWeek}</div>
                    <div className="text-sm text-orange-700 mt-1">Created This Week</div>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
              </div>
            </div>

            {/* Form Categories Grid */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Form Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.byCategory.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setFilter(f => ({ ...f, category: cat.id }));
                      setActiveTab('all');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-2xl">{cat.icon}</div>
                      <div className="text-2xl font-bold text-gray-800">{cat.count}</div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</h3>
                    <p className="text-xs text-gray-600">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What is Form Management */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📝 What is Form Management?</h2>
              <p className="text-gray-700 mb-4">
                Form Management is a powerful form builder and management system that allows you to create, customize, 
                and distribute digital forms throughout your soccer club. Design professional forms with drag-and-drop ease, 
                collect responses, and analyze submissions all in one place.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">🔨 Form Builder</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Drag-and-drop form designer</li>
                    <li>• 15+ field types available</li>
                    <li>• Conditional logic support</li>
                    <li>• Custom validation rules</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📥 Submissions</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time submission tracking</li>
                    <li>• Email notifications</li>
                    <li>• Export to CSV/Excel</li>
                    <li>• Automated responses</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">📊 Analytics</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Submission statistics</li>
                    <li>• Completion rates</li>
                    <li>• Field-level analytics</li>
                    <li>• Response patterns</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-2">⚙️ Settings</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Access control options</li>
                    <li>• Multi-submission control</li>
                    <li>• Custom confirmation messages</li>
                    <li>• Integration webhooks</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">🎨 Visual Builder</h3>
                  <p className="text-sm text-blue-700">Drag-and-drop interface for creating forms without coding</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">📱 Mobile Responsive</h3>
                  <p className="text-sm text-green-700">Forms work perfectly on all devices</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">🔒 Secure</h3>
                  <p className="text-sm text-purple-700">Encrypted data storage and secure submissions</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-2">🔔 Notifications</h3>
                  <p className="text-sm text-orange-700">Instant email alerts for new submissions</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">📤 Export</h3>
                  <p className="text-sm text-red-700">Download responses as CSV or Excel</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <h3 className="font-semibold text-teal-900 mb-2">🔄 Templates</h3>
                  <p className="text-sm text-teal-700">Save and reuse forms as templates</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Forms Tab */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex flex-wrap gap-4">
                <input
                  type="text"
                  placeholder="Search forms..."
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
                  {formCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
                <select
                  value={filter.status}
                  onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredForms.length} of {forms.length} forms
                </p>
                <button
                  onClick={() => setFilter({ search: '', category: 'all', status: 'all' })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg font-semibold mb-2 text-gray-900">No forms found</p>
                  <p className="text-sm text-gray-600 mb-4">Create your first form to get started</p>
                  <button
                    onClick={() => {
                      resetFormData();
                      setShowFormBuilder(true);
                      setActiveTab('builder');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Form
                  </button>
                </div>
              ) : (
                filteredForms.map((form) => {
                  const category = formCategories.find(c => c.id === form.category);
                  return (
                    <div key={form._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      <div className={`h-2 bg-${category?.color}-500 rounded-t-lg`}></div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{category?.icon}</span>
                              <h3 className="font-semibold text-gray-900">{form.title}</h3>
                            </div>
                            {form.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            form.status === 'active' ? 'bg-green-100 text-green-800' :
                            form.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {form.status}
                          </span>
                          <span className="text-gray-500">
                            {form.fields?.length || 0} fields
                          </span>
                          <span className="text-gray-500">
                            {form.submissions || 0} submissions
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => editForm(form)}
                            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-100"
                          >
                            <i className="bi bi-pencil me-1"></i>Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedForm(form);
                              setShowPreview(true);
                            }}
                            className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded text-sm hover:bg-green-100"
                          >
                            <i className="bi bi-eye me-1"></i>Preview
                          </button>
                          <div className="relative group">
                            <button className="bg-gray-50 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-100">
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10 hidden group-hover:block">
                              <button
                                onClick={() => duplicateForm(form)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <i className="bi bi-files me-2"></i>Duplicate
                              </button>
                              <button
                                onClick={() => exportForm(form)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <i className="bi bi-download me-2"></i>Export
                              </button>
                              <button
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/forms/${form._id}`)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <i className="bi bi-link-45deg me-2"></i>Copy Link
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => deleteForm(form._id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <i className="bi bi-trash me-2"></i>Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Form Builder Tab */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Field Types */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4">Field Types</h3>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {fieldTypes.map((fieldType) => (
                    <button
                      key={fieldType.id}
                      onClick={() => addField(fieldType.id)}
                      className="w-full text-left p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{fieldType.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{fieldType.name}</div>
                          <div className="text-xs text-gray-500">{fieldType.description}</div>
                        </div>
                        <i className="bi bi-plus-lg text-gray-400 group-hover:text-blue-600"></i>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Panel - Form Builder */}
            <div className="lg:col-span-2 space-y-6">
              {/* Form Details */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Form Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Form Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter form title..."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter form description..."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        {formCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Form Fields</h3>
                  <span className="text-sm text-gray-500">{formData.fields.length} fields</span>
                </div>

                {formData.fields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-gray-600 mb-2">Click field types on the left to add them</p>
                    <p className="text-sm text-gray-500">Build your form by adding fields</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.fields.map((field, index) => {
                      const fieldType = fieldTypes.find(t => t.id === field.type);
                      return (
                        <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col gap-2 mt-8">
                              <button
                                onClick={() => moveField(field.id, 'up')}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                <i className="bi bi-chevron-up"></i>
                              </button>
                              <button
                                onClick={() => moveField(field.id, 'down')}
                                disabled={index === formData.fields.length - 1}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                <i className="bi bi-chevron-down"></i>
                              </button>
                            </div>

                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{fieldType?.icon}</span>
                                <span className="text-sm font-medium text-gray-600">{fieldType?.name}</span>
                                <button
                                  onClick={() => removeField(field.id)}
                                  className="ml-auto text-red-600 hover:text-red-800"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>

                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                placeholder="Field label..."
                                className="w-full border rounded px-3 py-2"
                              />

                              {field.type !== 'section' && field.type !== 'paragraph' && (
                                <input
                                  type="text"
                                  value={field.placeholder}
                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                  placeholder="Placeholder text..."
                                  className="w-full border rounded px-3 py-2"
                                />
                              )}

                              {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700 mb-2 block">Options</label>
                                  {field.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex gap-2 mb-2">
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                          const newOptions = [...field.options];
                                          newOptions[optIndex] = e.target.value;
                                          updateField(field.id, { options: newOptions });
                                        }}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="flex-1 border rounded px-3 py-2"
                                      />
                                      <button
                                        onClick={() => {
                                          const newOptions = field.options.filter((_, i) => i !== optIndex);
                                          updateField(field.id, { options: newOptions });
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <i className="bi bi-x-lg"></i>
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const newOptions = [...field.options, `Option ${field.options.length + 1}`];
                                      updateField(field.id, { options: newOptions });
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    <i className="bi bi-plus-lg me-1"></i>Add Option
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-700">Required field</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Settings */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Form Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.requireLogin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, requireLogin: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Require login to submit</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.multipleSubmissions}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, multipleSubmissions: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Allow multiple submissions per user</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.showProgressBar}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, showProgressBar: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Show progress bar</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.settings.autoResponse}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, autoResponse: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Send auto-response email</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Email
                    </label>
                    <input
                      type="email"
                      value={formData.settings.notificationEmail}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, notificationEmail: e.target.value }
                      }))}
                      placeholder="admin@club.com"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Receive email when someone submits this form</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmation Message
                    </label>
                    <textarea
                      rows={3}
                      value={formData.settings.confirmationMessage}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, confirmationMessage: e.target.value }
                      }))}
                      placeholder="Thank you for your submission!"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    resetFormData();
                    setActiveTab('all');
                  }}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedForm({ ...formData });
                    setShowPreview(true);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  <i className="bi bi-eye me-2"></i>Preview
                </button>
                <button
                  onClick={saveForm}
                  disabled={loading || !formData.title}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : selectedForm ? 'Update Form' : 'Save Form'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Form Submissions</h3>
              <p className="text-gray-600 mb-4">
                View and manage all form submissions in one place
              </p>
              <p className="text-sm text-gray-500">
                Select a form to view its submissions
              </p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-900">{stats.totalSubmissions}</div>
                <div className="text-sm text-blue-700">Total Submissions</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">{stats.active}</div>
                <div className="text-sm text-green-700">Active Forms</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-900">
                  {stats.totalSubmissions > 0 ? (stats.totalSubmissions / stats.active || 1).toFixed(1) : 0}
                </div>
                <div className="text-sm text-purple-700">Avg Submissions per Form</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Form Performance</h2>
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📈</div>
                <p>Detailed analytics coming soon...</p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && selectedForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedForm.title}</h2>
                    {selectedForm.description && (
                      <p className="text-gray-600 mt-2">{selectedForm.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedForm.fields?.map((field) => {
                    const fieldType = fieldTypes.find(t => t.id === field.type);
                    return (
                      <div key={field.id} className="border-b pb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {field.type === 'text' || field.type === 'email' || field.type === 'phone' || field.type === 'number' ? (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className="w-full border rounded-lg px-3 py-2"
                            disabled
                          />
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={4}
                            placeholder={field.placeholder}
                            className="w-full border rounded-lg px-3 py-2"
                            disabled
                          />
                        ) : field.type === 'dropdown' ? (
                          <select className="w-full border rounded-lg px-3 py-2" disabled>
                            <option>{field.placeholder || 'Select an option'}</option>
                            {field.options?.map((opt, i) => (
                              <option key={i}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options?.map((opt, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input type="radio" name={field.id} disabled />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {field.options?.map((opt, i) => (
                              <label key={i} className="flex items-center gap-2">
                                <input type="checkbox" disabled />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : field.type === 'date' ? (
                          <input type="date" className="w-full border rounded-lg px-3 py-2" disabled />
                        ) : field.type === 'file' ? (
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            <i className="bi bi-cloud-upload text-3xl text-gray-400"></i>
                            <p className="text-sm text-gray-600 mt-2">Click to upload or drag and drop</p>
                          </div>
                        ) : field.type === 'section' ? (
                          <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>
                        ) : field.type === 'paragraph' ? (
                          <p className="text-gray-600">{field.label}</p>
                        ) : null}
                      </div>
                    );
                  })}

                  {selectedForm.fields?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No fields added yet</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Close Preview
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

export default FormManager;

