import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function PasswordResetManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetData, setResetData] = useState({
    newPassword: '',
    confirmPassword: '',
    reason: ''
  });
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPasswordHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/admin/password-resets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPasswordHistory(data.users);
      } else {
        toast.error('Failed to fetch password reset history');
      }
    } catch (error) {
      console.error('Error fetching password history:', error);
      toast.error('Failed to fetch password reset history');
    }
  };

  const handleResetPassword = async () => {
    if (!resetData.newPassword || !resetData.confirmPassword || !resetData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (resetData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/admin/reset-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          newPassword: resetData.newPassword,
          reason: resetData.reason
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setShowResetModal(false);
        setSelectedUser(null);
        setResetData({ newPassword: '', confirmPassword: '', reason: '' });
        fetchUsers(); // Refresh user list
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const openHistoryModal = () => {
    fetchPasswordHistory();
    setShowHistoryModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || 
                       (filterRole === 'admin' && user.isSuperAdmin) ||
                       (filterRole === 'user' && !user.isSuperAdmin);
    
    return matchesSearch && matchesRole;
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setResetData(prev => ({
      ...prev,
      newPassword: password,
      confirmPassword: password
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Password Reset Management</h2>
          <p className="text-gray-600">Reset passwords for registered users</p>
        </div>
        <button
          onClick={openHistoryModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📋 Password Reset History
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Users</option>
          <option value="admin">Admins Only</option>
          <option value="user">Regular Users Only</option>
        </select>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div key={user._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex gap-2 mt-1">
                    {user.isSuperAdmin && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Super Admin
                      </span>
                    )}
                    {user.isAdmin && !user.isSuperAdmin && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Admin
                      </span>
                    )}
                    {!user.isAdmin && !user.isSuperAdmin && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        User
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openResetModal(user)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🔐 Reset Password
                </button>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
            <p className="text-gray-600 mb-4">
              Reset password for <strong>{selectedUser.name}</strong> (@{selectedUser.username})
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="text"
                  value={resetData.newPassword}
                  onChange={(e) => setResetData({...resetData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input
                  type="text"
                  value={resetData.confirmPassword}
                  onChange={(e) => setResetData({...resetData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Confirm new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Reason (Required)</label>
                <textarea
                  value={resetData.reason}
                  onChange={(e) => setResetData({...resetData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Why are you resetting this password?"
                />
              </div>
              
              <button
                onClick={generateRandomPassword}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🎲 Generate Random Password
              </button>
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setSelectedUser(null);
                  setResetData({ newPassword: '', confirmPassword: '', reason: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Password Reset History</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {passwordHistory.map(user => (
                <div key={user._id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{user.name} (@{user.username})</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  
                  {user.passwordResets && user.passwordResets.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {user.passwordResets.map((reset, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">Reset by: {reset.resetByUsername}</p>
                              <p className="text-sm text-gray-600">Reason: {reset.reason}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(reset.resetAt).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {reset.newPasswordLength} chars
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No password resets recorded</p>
                  )}
                </div>
              ))}
              
              {passwordHistory.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No password reset history found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
