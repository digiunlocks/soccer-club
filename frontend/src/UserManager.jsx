import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const USER_ROLES = ["admin", "coach", "user"];
const USER_STATUSES = ["active", "inactive", "pending"];

// Sample data for demonstration
const SAMPLE_USERS = [
  {
    _id: "1",
    username: "admin@soccerclub.com",
    email: "admin@soccerclub.com",
    role: "admin",
    status: "active",
    firstName: "Super",
    lastName: "Admin",
    phone: "(555) 123-4567",
    createdAt: "2024-01-15T10:30:00Z",
    lastLogin: "2024-12-19T14:22:00Z",
    permissions: ["all"]
  },
  {
    _id: "2",
    username: "coach.smith@email.com",
    email: "coach.smith@email.com",
    role: "coach",
    status: "active",
    firstName: "John",
    lastName: "Smith",
    phone: "(555) 234-5678",
    createdAt: "2024-02-20T09:15:00Z",
    lastLogin: "2024-12-18T16:45:00Z",
    permissions: ["team_management", "player_view"]
  },
  {
    _id: "3",
    username: "coach.patel@email.com",
    email: "coach.patel@email.com",
    role: "coach",
    status: "active",
    firstName: "Priya",
    lastName: "Patel",
    phone: "(555) 345-6789",
    createdAt: "2024-03-10T11:20:00Z",
    lastLogin: "2024-12-17T13:30:00Z",
    permissions: ["team_management", "player_view"]
  },
  {
    _id: "4",
    username: "user.doe@email.com",
    email: "user.doe@email.com",
    role: "user",
    status: "active",
    firstName: "Jane",
    lastName: "Doe",
    phone: "(555) 456-7890",
    createdAt: "2024-04-05T14:45:00Z",
    lastLogin: "2024-12-16T10:15:00Z",
    permissions: ["basic_access"]
  },
  {
    _id: "5",
    username: "coach.williams@email.com",
    email: "coach.williams@email.com",
    role: "coach",
    status: "pending",
    firstName: "Mike",
    lastName: "Williams",
    phone: "(555) 567-8901",
    createdAt: "2024-12-15T08:30:00Z",
    lastLogin: null,
    permissions: ["basic_access"]
  }
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
  
  const [users, setUsers] = useState(SAMPLE_USERS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState({
    role: "",
    status: "",
    search: ""
  });
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    coaches: 0,
    users: 0,
    active: 0,
    pending: 0
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "user",
    status: "active",
    permissions: []
  });

  useEffect(() => {
    calculateStats();
  }, [users]);

  const calculateStats = () => {
    setStats({
      total: users.length,
      admins: users.filter(u => u.role === "admin").length,
      coaches: users.filter(u => u.role === "coach").length,
      users: users.filter(u => u.role === "user").length,
      active: users.filter(u => u.status === "active").length,
      pending: users.filter(u => u.status === "pending").length
    });
  };

  const filteredUsers = users.filter(user => {
    if (filter.role && user.role !== filter.role) return false;
    if (filter.status && user.status !== filter.status) return false;
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      return (
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newUser = {
      _id: Date.now().toString(),
      ...form,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    setUsers(prev => [...prev, newUser]);
    setShowAddModal(false);
    setForm({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "user",
      status: "active",
      permissions: []
    });
    toast.success("User created successfully!");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    setUsers(prev => prev.map(user => 
      user._id === selectedUser._id 
        ? { ...user, ...form }
        : user
    ));
    
    setShowEditModal(false);
    setSelectedUser(null);
    setForm({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "user",
      status: "active",
      permissions: []
    });
    toast.success("User updated successfully!");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    setUsers(prev => prev.filter(user => user._id !== userId));
    toast.success("User deleted successfully!");
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
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      permissions: user.permissions || []
    });
    setShowEditModal(true);
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
          <h2 className="text-2xl font-bold text-green-900">User Management</h2>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
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
          <button
            onClick={() => setFilter({ role: "", status: "", search: "" })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-800">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                      required 
                    />
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      className="w-full border rounded px-3 py-2" 
                      required 
                    />
                  </div>
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
    </div>
  );
} 