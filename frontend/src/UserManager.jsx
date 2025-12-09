import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

const USER_ROLES = ["admin", "coach", "user"];
const USER_STATUSES = ["active", "inactive", "pending"];
const PERMISSIONS = [
  "all",
  "user_management", 
  "team_management", 
  "player_view", 
  "basic_access",
  "content_management",
  "financial_access",
  "reporting"
];

export default function UserManager() {
  const navigate = useNavigate();
  
  // Check if user is authenticated (admin)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/signin');
      return;
    }
  }, [navigate]);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filter, setFilter] = useState({
    role: "",
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    coaches: 0,
    users: 0,
    active: 0,
    pending: 0,
    inactive: 0
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    phone: "",
    role: "user",
    status: "active",
    isSuperAdmin: false,
    team: "",
    program: ""
  });

  const [bulkAction, setBulkAction] = useState({
    action: "",
    role: "",
    status: ""
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  // Add active tab state
  const [activeTab, setActiveTab] = useState('all');

  // Update page title based on active tab
  useEffect(() => {
    const titles = {
      'all': 'User Management',
      'coaches': 'Coaches Management', 
      'admins': 'Administrators Management',
      'users': 'Regular Users Management'
    };
    document.title = `${titles[activeTab]} - Seattle Leopards FC Admin`;
  }, [activeTab]);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log('🔍 Fetching users with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Users data received:', data);
        console.log('🔍 First user structure:', data[0]);
        setUsers(data);
      } else {
        const errorData = await response.json();
        console.error('🔍 Error response:', errorData);
        toast.error(errorData.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    setStats({
      total: users.length,
      admins: users.filter(u => u.isSuperAdmin === true).length,
      coaches: users.filter(u => u.role === "coach").length,
      users: users.filter(u => u.isSuperAdmin === false).length,
      active: users.filter(u => u.status === "active").length,
      pending: users.filter(u => u.status === "pending").length,
      inactive: users.filter(u => u.status === "inactive").length
    });
  };

  const filteredUsers = users.filter(user => {
    // Apply tab filtering first
    if (activeTab === 'coaches' && user.role !== 'coach') return false;
    if (activeTab === 'admins' && !user.isSuperAdmin) return false;
    if (activeTab === 'users' && (user.isSuperAdmin || user.role === 'coach')) return false;
    
    // Handle role filtering based on isSuperAdmin field
    if (filter.role === 'admin' && !user.isSuperAdmin) return false;
    if (filter.role === 'user' && user.isSuperAdmin) return false;
    if (filter.role === 'coach' && user.role !== 'coach') return false;
    
    if (filter.status && user.status !== filter.status) return false;
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm)
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
        const newUser = await response.json();
        setUsers(prev => [...prev, newUser]);
        setShowAddModal(false);
        setForm({
          username: "",
          email: "",
          name: "",
          phone: "",
          role: "user",
          status: "active",
          isSuperAdmin: false,
          team: "",
          program: ""
        });
        toast.success("User created successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error creating user');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(prev => prev.map(user => 
          user._id === selectedUser._id ? updatedUser : user
        ));
        setShowEditModal(false);
        setSelectedUser(null);
        setForm({
          username: "",
          email: "",
          name: "",
          phone: "",
          role: "user",
          status: "active",
          isSuperAdmin: false,
          team: "",
          program: ""
        });
        toast.success("User updated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        toast.success("User deleted successfully!");
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800 border-red-200",
      coach: "bg-blue-100 text-blue-800 border-blue-200",
      user: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      isSuperAdmin: user.isSuperAdmin,
      team: user.team,
      program: user.program
    });
    setShowEditModal(true);
  };

  const openProfileModal = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
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
          userIds: selectedUsers,
          action: bulkAction.action,
          role: bulkAction.role,
          status: bulkAction.status
        })
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the user list
        setSelectedUsers([]);
        setShowBulkModal(false);
        setBulkAction({ action: "", role: "", status: "" });
        toast.success('Bulk action completed successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Error performing bulk action');
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Created', 'Last Login'],
      ...filteredUsers.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.role,
        user.status,
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetPassword = async (userId) => {
    if (!window.confirm("Are you sure you want to reset this user's password?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/${userId}/reset-password`, {
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
      toast.error('Error resetting password');
    }
  };

  const openPasswordModal = (userId) => {
    setSelectedUser(users.find(u => u._id === userId));
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setShowPasswordModal(true);
  };

  const setUserPassword = async () => {
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
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser._id}/set-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        toast.success(`Password updated successfully for ${selectedUser.name || selectedUser.username}!`);
        setShowPasswordModal(false);
        setPasswordForm({ newPassword: "", confirmPassword: "" });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error('Error setting password');
    }
  };

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
            <span className="text-gray-700 font-medium">
              {activeTab === 'all' && 'User Management'}
              {activeTab === 'coaches' && 'Coaches Management'}
              {activeTab === 'admins' && 'Administrators Management'}
              {activeTab === 'users' && 'Regular Users Management'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-green-900">
            {activeTab === 'all' && 'User Management'}
            {activeTab === 'coaches' && 'Coaches Management'}
            {activeTab === 'admins' && 'Administrators Management'}
            {activeTab === 'users' && 'Regular Users Management'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {activeTab === 'all' && 'Export All Users'}
            {activeTab === 'coaches' && 'Export Coaches'}
            {activeTab === 'admins' && 'Export Admins'}
            {activeTab === 'users' && 'Export Regular Users'}
          </button>
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Bulk Actions ({selectedUsers.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-900">{stats.admins}</div>
          <div className="text-sm text-red-700">Admins</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-900">{stats.coaches}</div>
          <div className="text-sm text-blue-700">Coaches</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-900">{stats.users}</div>
          <div className="text-sm text-green-700">Users</div>
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

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                All Users ({stats.total})
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/coaches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'coaches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Coaches ({stats.coaches})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admins ({stats.admins})
              </div>
            </button>
            <button
              onClick={() => navigate('/admin/parents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Parents ({stats.parents})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            className="border rounded px-3 py-2 flex-1 min-w-48"
          />
          <select 
            value={filter.role} 
            onChange={e => setFilter(f => ({ ...f, role: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Roles</option>
            {USER_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
          </select>
          <select 
            value={filter.status} 
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            {USER_STATUSES.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
          </select>
          <select 
            value={filter.sortBy} 
            onChange={e => setFilter(f => ({ ...f, sortBy: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="createdAt">Sort by Created</option>
            <option value="lastLogin">Sort by Last Login</option>
            <option value="firstName">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
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
            onClick={() => setFilter({ role: "", status: "", search: "", sortBy: "createdAt", sortOrder: "desc" })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'all' && 'All Users'}
              {activeTab === 'coaches' && 'Coaches'}
              {activeTab === 'admins' && 'Administrators'}
              {activeTab === 'users' && 'Regular Users'}
            </h3>
            <p className="text-sm text-gray-600">
              {activeTab === 'all' && `Showing all ${filteredUsers.length} users`}
              {activeTab === 'coaches' && `Showing ${filteredUsers.length} coaches`}
              {activeTab === 'admins' && `Showing ${filteredUsers.length} administrators`}
              {activeTab === 'users' && `Showing ${filteredUsers.length} regular users`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => handleUserSelect(user._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-800">
                              {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || user.username}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(user.isSuperAdmin ? 'admin' : (user.role || 'user'))}`}>
                        {user.isSuperAdmin ? 'Admin' : (user.role?.charAt(0).toUpperCase() + user.role?.slice(1)) || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(user.status || 'active')}`}>
                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openProfileModal(user)}
                          className="text-green-600 hover:text-green-900"
                          title="View Profile"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit User"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => resetPassword(user._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Reset Password"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openPasswordModal(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Set Password"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Add New User</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input 
                    name="username" 
                    value={form.username} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select 
                      name="role" 
                      value={form.role} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      {USER_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select 
                      name="status" 
                      value={form.status} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      {USER_STATUSES.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                    <input 
                      name="team" 
                      value={form.team} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <input 
                      name="program" 
                      value={form.program} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="isSuperAdmin" 
                      checked={form.isSuperAdmin} 
                      onChange={(e) => setForm(prev => ({ ...prev, isSuperAdmin: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Super Admin</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded font-semibold hover:bg-green-700 transition-colors"
                  >
                    Create User
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Edit User</h3>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input 
                    name="username" 
                    value={form.username} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="w-full border rounded px-3 py-2" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select 
                      name="role" 
                      value={form.role} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      {USER_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select 
                      name="status" 
                      value={form.status} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      {USER_STATUSES.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                    <input 
                      name="team" 
                      value={form.team} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <input 
                      name="program" 
                      value={form.program} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      name="isSuperAdmin" 
                      checked={form.isSuperAdmin} 
                      onChange={(e) => setForm(prev => ({ ...prev, isSuperAdmin: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Super Admin</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Update User
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">User Profile</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Username</label>
                      <p className="text-gray-900">{selectedUser.username}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Team</label>
                      <p className="text-gray-900">{selectedUser.team || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Program</label>
                      <p className="text-gray-900">{selectedUser.program || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Account Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRoleColor(selectedUser.isSuperAdmin ? 'admin' : (selectedUser.role || 'user'))}`}>
                        {selectedUser.isSuperAdmin ? 'Admin' : (selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)) || 'User'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedUser.status || 'active')}`}>
                        {selectedUser.status ? selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1) : 'Active'}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-gray-900">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-gray-900">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedUser.permissions && selectedUser.permissions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-4">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.permissions.map((permission, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    openEditModal(selectedUser);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition-colors"
                >
                  Edit User
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded font-semibold hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Bulk Actions</h3>
              <p className="text-gray-600 mb-4">Selected {selectedUsers.length} user(s)</p>
              
              <form onSubmit={(e) => { e.preventDefault(); handleBulkAction(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select 
                    value={bulkAction.action} 
                    onChange={e => setBulkAction(prev => ({ ...prev, action: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Action</option>
                    <option value="changeRole">Change Role</option>
                    <option value="changeStatus">Change Status</option>
                    <option value="delete">Delete Users</option>
                  </select>
                </div>
                
                {bulkAction.action === 'changeRole' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Role</label>
                    <select 
                      value={bulkAction.role} 
                      onChange={e => setBulkAction(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Select Role</option>
                      {USER_ROLES.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
                    </select>
                  </div>
                )}
                
                {bulkAction.action === 'changeStatus' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                    <select 
                      value={bulkAction.status} 
                      onChange={e => setBulkAction(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Select Status</option>
                      {USER_STATUSES.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                    </select>
                  </div>
                )}
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-orange-600 text-white py-2 px-4 rounded font-semibold hover:bg-orange-700 transition-colors"
                  >
                    Apply Action
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Set Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Set Password for {selectedUser?.name || selectedUser?.username}</h3>
              
              <form onSubmit={(e) => { e.preventDefault(); setUserPassword(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Set Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Cancel
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