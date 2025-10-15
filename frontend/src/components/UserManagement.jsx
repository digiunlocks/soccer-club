import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';

const UserManagement = ({ 
  users, 
  setUsers, 
  selectedUsers, 
  setSelectedUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter,
  setUserStatusFilter,
  userSortBy,
  setUserSortBy,
  userSortOrder,
  setUserSortOrder,
  userManagementTab,
  setUserManagementTab,
  userAnalytics,
  userContent,
  userReports,
  userActivityLog,
  userPermissions,
  setUserPermissions
}) => {
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [isUserTableLoading, setIsUserTableLoading] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showUserActivityModal, setShowUserActivityModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkActionValue, setBulkActionValue] = useState('');

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const getFilteredUsers = useMemo(() => {
    let filtered = users;
    
    if (debouncedUserSearch) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
        user.username.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedUserSearch.toLowerCase())
      );
    }
    
    if (userRoleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === userRoleFilter);
    }
    
    if (userStatusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === userStatusFilter);
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[userSortBy];
      const bValue = b[userSortBy];
      
      if (userSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [users, debouncedUserSearch, userRoleFilter, userStatusFilter, userSortBy, userSortOrder]);

  const toggleUserSelection = useCallback((userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, [setSelectedUsers]);

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(getFilteredUsers.map(user => user.id));
  }, [getFilteredUsers, setSelectedUsers]);

  const clearUserSelection = useCallback(() => {
    setSelectedUsers([]);
  }, [setSelectedUsers]);

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        toast.info('Deleting user...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast.success('User deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const deleteMultipleUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        toast.info(`Deleting ${selectedUsers.length} users...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        toast.success(`${selectedUsers.length} users deleted successfully!`);
      } catch (error) {
        toast.error('Failed to delete users');
      }
    }
  };

  const resetUserPassword = async (userId) => {
    try {
      toast.info('Resetting password...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset email sent successfully!');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const banUser = async (userId, reason, duration) => {
    try {
      toast.info('Banning user...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isBanned: true, status: 'banned', banReason: reason }
          : user
      ));
      toast.success('User banned successfully!');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const unbanUser = async (userId) => {
    try {
      toast.info('Unbanning user...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isBanned: false, status: 'active' }
          : user
      ));
      toast.success('User unbanned successfully!');
    } catch (error) {
      toast.error('Failed to unban user');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      toast.info('Updating user role...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      toast.success('User role updated successfully!');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      toast.info('Updating user permissions...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserPermissions(prev => ({
        ...prev,
        [userId]: permissions
      }));
      
      toast.success('User permissions updated successfully!');
    } catch (error) {
      toast.error('Failed to update user permissions');
    }
  };

  const getUserActivity = (userId) => {
    return userActivityLog.filter(activity => activity.userId === userId);
  };

  const exportUserReport = async (userId, reportType) => {
    try {
      const user = users.find(u => u.id === userId);
      const activity = getUserActivity(userId);
      const permissions = userPermissions[userId] || {};
      
      const data = {
        user,
        activity,
        permissions,
        reportType,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Super Admin'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-report-${user.username}-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('User report exported successfully!');
    } catch (error) {
      toast.error('Failed to export user report');
    }
  };

  const performBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select users to perform bulk action');
      return;
    }

    try {
      toast.info(`Performing bulk action: ${bulkActionType}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      switch (bulkActionType) {
        case 'delete':
          setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
          break;
        case 'ban':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, isBanned: true, status: 'banned', banReason: bulkActionValue }
              : user
          ));
          break;
        case 'activate':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'active' }
              : user
          ));
          break;
        case 'suspend':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: 'suspended' }
              : user
          ));
          break;
        case 'changeRole':
          setUsers(prev => prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, role: bulkActionValue }
              : user
          ));
          break;
        case 'sendNotification':
          // In a real app, this would send notifications to selected users
          break;
      }

      setSelectedUsers([]);
      setShowBulkActionsModal(false);
      toast.success(`Bulk action completed for ${selectedUsers.length} users`);
    } catch (error) {
      toast.error('Failed to perform bulk action');
    }
  };

  const sendBulkNotification = async (message, type = 'info') => {
    try {
      toast.info(`Sending notification to ${selectedUsers.length} users...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would send notifications to all selected users
      toast.success(`Notification sent to ${selectedUsers.length} users`);
    } catch (error) {
      toast.error('Failed to send notifications');
    }
  };

  const importUsers = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.users && Array.isArray(data.users)) {
        const newUsers = data.users.map((user, index) => ({
          ...user,
          id: Date.now() + index,
          joinDate: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0],
          status: 'active',
          isVerified: false,
          totalPosts: 0,
          totalComments: 0,
          totalLikes: 0,
          violations: 0,
          warnings: 0,
          isBanned: false
        }));
        
        setUsers(prev => [...prev, ...newUsers]);
        toast.success(`${newUsers.length} users imported successfully!`);
      } else {
        toast.error('Invalid file format');
      }
    } catch (error) {
      toast.error('Failed to import users');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="bi bi-people me-2"></i>User Management</h4>
        <div className="btn-group">
          <button className="btn btn-outline-primary" onClick={() => exportUserReport(1, 'full')}>
            <i className="bi bi-download me-1"></i>Export Data
          </button>
          <button className="btn btn-outline-success" onClick={() => document.getElementById('importUsers').click()}>
            <i className="bi bi-upload me-1"></i>Import Users
          </button>
          <button className="btn btn-outline-info" onClick={() => setShowBulkActionsModal(true)} disabled={selectedUsers.length === 0}>
            <i className="bi bi-gear me-1"></i>Bulk Actions ({selectedUsers.length})
          </button>
          <button className="btn btn-outline-warning" onClick={() => setShowNotificationModal(true)} disabled={selectedUsers.length === 0}>
            <i className="bi bi-bell me-1"></i>Notify ({selectedUsers.length})
          </button>
          <button className="btn btn-outline-danger" onClick={deleteMultipleUsers} disabled={selectedUsers.length === 0}>
            <i className="bi bi-trash me-1"></i>Delete ({selectedUsers.length})
          </button>
        </div>
        <input 
          type="file" 
          id="importUsers" 
          accept=".json" 
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files[0]) {
              importUsers(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* User Management Tabs */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${userManagementTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setUserManagementTab('overview')}
                  >
                    <i className="bi bi-graph-up me-1"></i>Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${userManagementTab === 'users' ? 'active' : ''}`}
                    onClick={() => setUserManagementTab('users')}
                  >
                    <i className="bi bi-people me-1"></i>Users
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${userManagementTab === 'content' ? 'active' : ''}`}
                    onClick={() => setUserManagementTab('content')}
                  >
                    <i className="bi bi-file-text me-1"></i>Content Review
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${userManagementTab === 'reports' ? 'active' : ''}`}
                    onClick={() => setUserManagementTab('reports')}
                  >
                    <i className="bi bi-flag me-1"></i>Reports
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${userManagementTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setUserManagementTab('analytics')}
                  >
                    <i className="bi bi-bar-chart me-1"></i>Analytics
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${userManagementTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setUserManagementTab('activity')}
                  >
                    <i className="bi bi-clock-history me-1"></i>Activity Log
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${userManagementTab === 'permissions' ? 'active' : ''}`}
                    onClick={() => setUserManagementTab('permissions')}
                  >
                    <i className="bi bi-shield-check me-1"></i>Permissions
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {/* User Overview Tab */}
              {userManagementTab === 'overview' && (
                <div>
                  <div className="row mb-4">
                    <div className="col-md-3">
                      <div className="card text-center">
                        <div className="card-body">
                          <h3 className="text-primary">{userAnalytics.totalUsers}</h3>
                          <p className="card-text">Total Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card text-center">
                        <div className="card-body">
                          <h3 className="text-success">{userAnalytics.activeUsers}</h3>
                          <p className="card-text">Active Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card text-center">
                        <div className="card-body">
                          <h3 className="text-info">{userAnalytics.newUsersThisMonth}</h3>
                          <p className="card-text">New This Month</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card text-center">
                        <div className="card-body">
                          <h3 className="text-warning">{userAnalytics.bannedUsers}</h3>
                          <p className="card-text">Banned Users</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {userManagementTab === 'users' && (
                <div>
                  {/* User Filters and Search */}
                  <div className="row mb-4">
                    <div className="col-md-3">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <select 
                        className="form-select"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        <option value="player">Player</option>
                        <option value="coach">Coach</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select 
                        className="form-select"
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select 
                        className="form-select"
                        value={userSortBy}
                        onChange={(e) => setUserSortBy(e.target.value)}
                      >
                        <option value="joinDate">Join Date</option>
                        <option value="lastLogin">Last Login</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <select 
                        className="form-select"
                        value={userSortOrder}
                        onChange={(e) => setUserSortOrder(e.target.value)}
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                    </div>
                    <div className="col-md-1">
                      <button className="btn btn-outline-secondary" onClick={selectAllUsers}>
                        <i className="bi bi-check-all"></i>
                      </button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="table-responsive position-relative">
                    {isUserTableLoading && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 10 }}>
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>
                            <input 
                              type="checkbox" 
                              checked={selectedUsers.length === getFilteredUsers.length}
                              onChange={selectAllUsers}
                            />
                          </th>
                          <th>User</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Join Date</th>
                          <th>Last Login</th>
                          <th>Activity</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <input 
                                type="checkbox" 
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img 
                                  src={user.profileImage} 
                                  alt={user.name}
                                  className="rounded-circle me-2"
                                  width="32"
                                  height="32"
                                  onError={(e) => e.target.src = '/images/default-avatar.png'}
                                />
                                <div>
                                  <div className="fw-bold">{user.name}</div>
                                  <small className="text-muted">@{user.username}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'coach' ? 'bg-warning' : 'bg-primary'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${user.status === 'active' ? 'bg-success' : user.status === 'suspended' ? 'bg-warning' : 'bg-danger'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>{user.joinDate}</td>
                            <td>{user.lastLogin}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <span className="badge bg-info">{user.totalPosts} posts</span>
                                <span className="badge bg-secondary">{user.totalComments} comments</span>
                              </div>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserDetailsModal(true);
                                  }}
                                  title="View Details"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-info"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserActivityModal(true);
                                  }}
                                  title="View Activity"
                                >
                                  <i className="bi bi-clock-history"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowPermissionsModal(true);
                                  }}
                                  title="Manage Permissions"
                                >
                                  <i className="bi bi-shield-check"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-warning"
                                  onClick={() => resetUserPassword(user.id)}
                                  title="Reset Password"
                                >
                                  <i className="bi bi-key"></i>
                                </button>
                                {user.isBanned ? (
                                  <button 
                                    className="btn btn-outline-success"
                                    onClick={() => unbanUser(user.id)}
                                    title="Unban User"
                                  >
                                    <i className="bi bi-unlock"></i>
                                  </button>
                                ) : (
                                  <button 
                                    className="btn btn-outline-danger"
                                    onClick={() => banUser(user.id, 'Policy violation', 30)}
                                    title="Ban User"
                                  >
                                    <i className="bi bi-ban"></i>
                                  </button>
                                )}
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => exportUserReport(user.id, 'full')}
                                  title="Export Report"
                                >
                                  <i className="bi bi-file-earmark-text"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-danger"
                                  onClick={() => deleteUser(user.id)}
                                  title="Delete User"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Other tabs content would go here */}
              {userManagementTab !== 'overview' && userManagementTab !== 'users' && (
                <div className="text-center py-5">
                  <h5>Coming Soon!</h5>
                  <p className="text-muted">This section is under development.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals would go here */}
    </div>
  );
};

export default UserManagement;
