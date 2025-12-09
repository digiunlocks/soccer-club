import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

const IndividualUserMessaging = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userMessageForm, setUserMessageForm] = useState({
    title: '',
    content: '',
    type: 'both',
    priority: 'normal',
    selectedUsers: []
  });
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState({ role: '', team: '', program: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to access user management');
        return;
      }

      let url = `${API_BASE_URL}/users?`;
      if (userSearch) url += `search=${encodeURIComponent(userSearch)}&`;
      if (userFilter.role) url += `role=${userFilter.role}&`;
      if (userFilter.team) url += `team=${encodeURIComponent(userFilter.team)}&`;
      if (userFilter.program) url += `program=${encodeURIComponent(userFilter.program)}&`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserMessageSubmit = async (e) => {
    e.preventDefault();
    
    if (!userMessageForm.title.trim() || !userMessageForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    if (userMessageForm.selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/broadcasts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...userMessageForm,
          targetAudience: 'individual',
          targetUsers: userMessageForm.selectedUsers,
          tags: ['individual-message']
        })
      });

      if (response.ok) {
        setUserMessageForm({
          title: '',
          content: '',
          type: 'both',
          priority: 'normal',
          selectedUsers: []
        });
        toast.success(`Message sent successfully to ${userMessageForm.selectedUsers.length} user(s)`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send individual message');
      }
    } catch (error) {
      console.error('Error sending individual message:', error);
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleUserSelection = (userId) => {
    setUserMessageForm(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }));
  };

  const handleSelectAllUsers = () => {
    setUserMessageForm(prev => ({
      ...prev,
      selectedUsers: users.map(user => user._id)
    }));
  };

  const handleClearSelection = () => {
    setUserMessageForm(prev => ({
      ...prev,
      selectedUsers: []
    }));
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Send Message to Individual Users</h2>
        <p className="text-sm text-gray-600 mt-1">Select specific users to send personalized messages</p>
      </div>
      
      <div className="p-6">
        {/* User Selection Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-700">Select Users</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllUsers}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>

          {/* User Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={userFilter.role}
              onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admins</option>
              <option value="user">Regular Users</option>
            </select>
            <input
              type="text"
              placeholder="Filter by team..."
              value={userFilter.team}
              onChange={(e) => setUserFilter({ ...userFilter, team: e.target.value })}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Filter by program..."
              value={userFilter.program}
              onChange={(e) => setUserFilter({ ...userFilter, program: e.target.value })}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {usersLoading ? 'Loading...' : 'Apply Filters'}
          </button>

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            {users.map((user) => (
              <div
                key={user._id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  userMessageForm.selectedUsers.includes(user._id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleUserSelection(user._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={userMessageForm.selectedUsers.includes(user._id)}
                      onChange={() => handleUserSelection(user._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">
                        {user.team && `Team: ${user.team}`} {user.program && `• Program: ${user.program}`}
                        {user.isSuperAdmin && ' • Admin'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {userMessageForm.selectedUsers.includes(user._id) && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No users found matching your criteria.
              </div>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {userMessageForm.selectedUsers.length} user(s) selected
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleUserMessageSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Message Title</label>
            <input
              type="text"
              value={userMessageForm.title}
              onChange={(e) => setUserMessageForm({ ...userMessageForm, title: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message Content</label>
            <textarea
              value={userMessageForm.content}
              onChange={(e) => setUserMessageForm({ ...userMessageForm, content: e.target.value })}
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={userMessageForm.type}
                onChange={(e) => setUserMessageForm({ ...userMessageForm, type: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="both">Email & In-App</option>
                <option value="email">Email Only</option>
                <option value="in_app">In-App Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={userMessageForm.priority}
                onChange={(e) => setUserMessageForm({ ...userMessageForm, priority: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={userMessageForm.selectedUsers.length === 0 || sending}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndividualUserMessaging;
