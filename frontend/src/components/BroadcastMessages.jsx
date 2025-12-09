import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

const BroadcastMessages = ({ onBroadcastRead }) => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  // Filter broadcasts based on search and filters
  useEffect(() => {
    let filtered = broadcasts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(broadcast =>
        broadcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        broadcast.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (broadcast.tags && broadcast.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(broadcast => broadcast.priority === priorityFilter);
    }

    // Read filter
    if (readFilter === 'unread') {
      filtered = filtered.filter(broadcast => !broadcast.inAppRead);
    } else if (readFilter === 'read') {
      filtered = filtered.filter(broadcast => broadcast.inAppRead);
    }

    setFilteredBroadcasts(filtered);
  }, [broadcasts, searchQuery, priorityFilter, readFilter]);

  const fetchBroadcasts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view broadcasts');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/broadcasts/my-broadcasts`, {
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

  const markAsRead = async (broadcastId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/broadcasts/${broadcastId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setBroadcasts(broadcasts.map(b => 
          b.id === broadcastId 
            ? { ...b, inAppRead: true, inAppReadAt: new Date() }
            : b
        ));
        toast.success('Message marked as read');
        
        // Notify parent component to update unread count
        if (onBroadcastRead) {
          onBroadcastRead();
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as read');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error(error.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unreadBroadcasts = broadcasts.filter(b => !b.inAppRead);
      
      if (unreadBroadcasts.length === 0) {
        toast.info('No unread messages to mark');
        return;
      }

      // Mark each unread broadcast as read
      const promises = unreadBroadcasts.map(broadcast =>
        fetch(`${API_BASE_URL}/broadcasts/${broadcast.id}/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      );

      await Promise.all(promises);

      // Update local state
      setBroadcasts(broadcasts.map(b => 
        !b.inAppRead 
          ? { ...b, inAppRead: true, inAppReadAt: new Date() }
          : b
      ));

      toast.success(`Marked ${unreadBroadcasts.length} messages as read`);
      
      // Notify parent component to update unread count
      if (onBroadcastRead) {
        onBroadcastRead();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all messages as read');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'high':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'normal':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'normal':
        return 'border-blue-200 bg-blue-50';
      case 'low':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-2">Stay updated with the latest club announcements and messages</p>
          </div>
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark All as Read
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Messages</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredBroadcasts.length} of {broadcasts.length} messages
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBroadcasts.map((broadcast) => (
          <div
            key={broadcast.id}
            className={`border rounded-lg p-6 ${getPriorityColor(broadcast.priority)} ${
              !broadcast.inAppRead ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getPriorityIcon(broadcast.priority)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {broadcast.title}
                    </h3>
                    {!broadcast.inAppRead && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        New
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      broadcast.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      broadcast.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      broadcast.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {broadcast.priority}
                    </span>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {broadcast.content}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                    <span>From: {broadcast.sentBy}</span>
                    <span>Sent: {new Date(broadcast.sentAt || broadcast.createdAt).toLocaleDateString()}</span>
                    {broadcast.inAppRead && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Read {new Date(broadcast.inAppReadAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {broadcast.tags && broadcast.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {broadcast.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!broadcast.inAppRead && (
                <button
                  onClick={() => markAsRead(broadcast.id)}
                  className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBroadcasts.length === 0 && broadcasts.length > 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No matching announcements</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters to see more results.</p>
          </div>
        )}

        {broadcasts.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up! Check back later for new announcements.</p>
          </div>
        )}
      </div>

      {/* Broadcast Detail Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedBroadcast.title}</h3>
                <button
                  onClick={() => setSelectedBroadcast(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedBroadcast.content}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>From: {selectedBroadcast.sentBy}</span>
                  <span>Sent: {new Date(selectedBroadcast.sentAt || selectedBroadcast.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedBroadcast(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastMessages;
