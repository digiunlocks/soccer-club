import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

const USER_ROLES = ["coach"];
const USER_STATUSES = ["active", "inactive", "pending"];

export default function CoachesManager() {
  const navigate = useNavigate();
  
  // Check if user is authenticated (admin)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);
  
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedCoaches, setSelectedCoaches] = useState([]);
  const [filter, setFilter] = useState({
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    phone: "",
    role: "coach",
    status: "active",
    team: "",
    program: "",
    specialization: "",
    experience: "",
    certifications: ""
  });

  const [bulkAction, setBulkAction] = useState({
    action: "",
    status: ""
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Update page title
  useEffect(() => {
    document.title = "Coaches Management - Seattle Leopards FC Admin";
  }, []);

  // Fetch coaches from API
  useEffect(() => {
    fetchCoaches();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [coaches]);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log('🔍 Fetching coaches with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/users?role=coach`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Coaches data received:', data);
        setCoaches(data);
      } else {
        const errorData = await response.json();
        console.error('🔍 Error response:', errorData);
        toast.error(errorData.error || 'Failed to fetch coaches');
      }
    } catch (error) {
      console.error('🔍 Error fetching coaches:', error);
      toast.error('Failed to fetch coaches');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    setStats({
      total: coaches.length,
      active: coaches.filter(c => c.status === "active").length,
      pending: coaches.filter(c => c.status === "pending").length,
      inactive: coaches.filter(c => c.status === "inactive").length
    });
  };

  const filteredCoaches = coaches.filter(coach => {
    if (filter.status && coach.status !== filter.status) return false;
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      return (
        coach.name?.toLowerCase().includes(searchTerm) ||
        coach.email?.toLowerCase().includes(searchTerm) ||
        coach.username?.toLowerCase().includes(searchTerm) ||
        coach.specialization?.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  }).sort((a, b) => {
    const aValue = a[filter.sortBy];
    const bValue = b[filter.sortBy];
    
    if (filter.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const newCoach = await response.json();
        setCoaches(prev => [...prev, newCoach]);
        setShowAddModal(false);
        setForm({
          username: "",
          email: "",
          name: "",
          phone: "",
          role: "coach",
          status: "active",
          team: "",
          program: "",
          specialization: "",
          experience: "",
          certifications: ""
        });
        toast.success('Coach added successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create coach');
      }
    } catch (error) {
      console.error('Error creating coach:', error);
      toast.error('Failed to create coach');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${selectedCoach._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const updatedCoach = await response.json();
        setCoaches(prev => prev.map(coach => 
          coach._id === selectedCoach._id ? updatedCoach : coach
        ));
        setShowEditModal(false);
        setSelectedCoach(null);
        toast.success('Coach updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update coach');
      }
    } catch (error) {
      console.error('Error updating coach:', error);
      toast.error('Failed to update coach');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (coachId) => {
    if (!window.confirm("Are you sure you want to delete this coach?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${coachId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCoaches(prev => prev.filter(coach => coach._id !== coachId));
        toast.success('Coach deleted successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete coach');
      }
    } catch (error) {
      console.error('Error deleting coach:', error);
      toast.error('Failed to delete coach');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const openEditModal = (coach) => {
    setSelectedCoach(coach);
    setForm({
      username: coach.username,
      email: coach.email,
      name: coach.name,
      phone: coach.phone,
      role: "coach",
      status: coach.status,
      team: coach.team || "",
      program: coach.program || "",
      specialization: coach.specialization || "",
      experience: coach.experience || "",
      certifications: coach.certifications || ""
    });
    setShowEditModal(true);
  };

  const openProfileModal = (coach) => {
    setSelectedCoach(coach);
    setShowProfileModal(true);
  };

  const handleBulkAction = async () => {
    if (selectedCoaches.length === 0) {
      toast.error('Please select coaches first');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedCoaches,
          ...bulkAction
        })
      });

      if (response.ok) {
        await fetchCoaches();
        setSelectedCoaches([]);
        setShowBulkModal(false);
        toast.success('Bulk action completed successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleCoachSelect = (coachId) => {
    setSelectedCoaches(prev => 
      prev.includes(coachId) 
        ? prev.filter(id => id !== coachId)
        : [...prev, coachId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCoaches.length === filteredCoaches.length) {
      setSelectedCoaches([]);
    } else {
      setSelectedCoaches(filteredCoaches.map(coach => coach._id));
    }
  };

  const exportCoaches = () => {
    const csvContent = [
      ['Name', 'Email', 'Specialization', 'Experience', 'Status', 'Created', 'Last Login'],
      ...filteredCoaches.map(coach => [
        coach.name || '',
        coach.email || '',
        coach.specialization || '',
        coach.experience || '',
        coach.status || '',
        coach.createdAt ? new Date(coach.createdAt).toLocaleDateString() : '',
        coach.lastLogin ? new Date(coach.lastLogin).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coaches.csv';
    a.click();
  };

  const resetPassword = async (coachId) => {
    if (!window.confirm("Are you sure you want to reset this coach's password?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${coachId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Password reset email sent successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const openPasswordModal = (coachId) => {
    setSelectedCoach(coaches.find(c => c._id === coachId));
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowPasswordModal(true);
  };

  const setCoachPassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${selectedCoach._id}/set-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: passwordForm.newPassword
        })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        toast.success('Password updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Error setting password');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coaches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Admin</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-700 font-medium">Coaches Management</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900">Coaches Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCoaches}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Coaches
          </button>
          {selectedCoaches.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Bulk Actions ({selectedCoaches.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Coach
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Coaches</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-900">{stats.active}</div>
          <div className="text-sm text-green-700">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          <div className="text-sm text-yellow-700">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
          <div className="text-sm text-gray-700">Inactive</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search coaches..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            className="border rounded px-3 py-2 flex-1 min-w-48"
          />
          <select 
            value={filter.status} 
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <select 
            value={filter.sortBy} 
            onChange={e => setFilter(f => ({ ...f, sortBy: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="createdAt">Sort by Created</option>
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="specialization">Sort by Specialization</option>
          </select>
          <select 
            value={filter.sortOrder} 
            onChange={e => setFilter(f => ({ ...f, sortOrder: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          <button
            onClick={() => setFilter({ status: "", search: "", sortBy: "createdAt", sortOrder: "desc" })}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Coaches</h3>
            <p className="text-sm text-gray-600">Showing {filteredCoaches.length} coaches</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredCoaches.length} of {coaches.length} coaches
            </span>
          </div>
        </div>
      </div>

      {/* Coaches Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedCoaches.length === filteredCoaches.length && filteredCoaches.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COACH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SPECIALIZATION</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EXPERIENCE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CREATED</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LAST LOGIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCoaches.map((coach) => (
                <tr key={coach._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedCoaches.includes(coach._id)}
                      onChange={() => handleCoachSelect(coach._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">
                            {coach.name ? coach.name.charAt(0).toUpperCase() : 'C'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{coach.name || 'No Name'}</div>
                        <div className="text-sm text-gray-500">{coach.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{coach.specialization || 'Not specified'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(coach.status)}`}>
                      {coach.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coach.experience || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coach.createdAt ? new Date(coach.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coach.lastLogin ? new Date(coach.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openProfileModal(coach)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Profile"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditModal(coach)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Coach"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openPasswordModal(coach._id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Set Password"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(coach._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Coach"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coach Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Coach</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Youth Development, Goalkeeping"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certifications</label>
                  <input
                    type="text"
                    name="certifications"
                    value={form.certifications}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., UEFA License, USSF License"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coach Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Coach</h3>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Youth Development, Goalkeeping"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certifications</label>
                  <input
                    type="text"
                    name="certifications"
                    value={form.certifications}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., UEFA License, USSF License"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Coach Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{selectedCoach.name || 'No Name'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedCoach.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <p className="text-sm text-gray-900">{selectedCoach.specialization || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <p className="text-sm text-gray-900">{selectedCoach.experience || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Certifications</label>
                <p className="text-sm text-gray-900">{selectedCoach.certifications || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(selectedCoach.status)}`}>
                  {selectedCoach.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Bulk Actions</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Action</label>
                <select
                  value={bulkAction.action}
                  onChange={e => setBulkAction(prev => ({ ...prev, action: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Action</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Apply Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Set Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={setCoachPassword}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Set Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
