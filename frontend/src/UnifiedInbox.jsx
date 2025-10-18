import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaBell, FaEnvelope, FaTrash, FaFilter, FaSearch, FaInbox
} from 'react-icons/fa';

export default function UnifiedInbox() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, conversations
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    conversations: 0
  });

  useEffect(() => {
    fetchInboxItems();
    // Refresh every 30 seconds
    const interval = setInterval(fetchInboxItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInboxItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view your inbox');
        navigate('/signin');
        return;
      }

      console.log('📬 Fetching unified inbox items...');

      // Fetch notifications
      const notifResponse = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch conversations
      const convResponse = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!notifResponse.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const notifications = await notifResponse.json();
      console.log('✅ Fetched notifications:', notifications.length);

      // Transform notifications into inbox items (excluding marketplace notifications)
      const notificationItems = notifications
        .filter(notif => {
          // Exclude marketplace-related notifications
          const marketplaceTypes = [
            'offer_received', 'offer_accepted', 'offer_rejected',
            'negotiation_counter_offer', 'marketplace_inquiry',
            'item_sold', 'item_purchased', 'marketplace_message'
          ];
          return !marketplaceTypes.includes(notif.type);
        })
        .map(notif => ({
          id: `notif-${notif._id}`,
          originalId: notif._id,
          type: 'notification',
          subtype: notif.type,
          title: notif.title,
          message: notif.message,
          from: notif.sender?.username || 'System',
          fromId: notif.sender?._id,
          read: notif.read,
          timestamp: new Date(notif.createdAt),
          data: notif.data || {}
        }));

      // Get conversations if available
      let conversationItems = [];
      if (convResponse.ok) {
        const conversations = await convResponse.json();
        console.log('✅ Fetched conversations:', conversations.length);
        
        conversationItems = conversations.map(conv => ({
          id: `conv-${conv._id}`,
          originalId: conv._id,
          type: 'conversation',
          subtype: 'conversation',
          title: `Conversation with ${conv.otherUser?.username || 'Unknown'}`,
          message: conv.lastMessage?.content || 'No messages yet',
          from: conv.otherUser?.username || 'Unknown',
          fromId: conv.otherUser?._id,
          read: conv.unreadCount === 0,
          timestamp: new Date(conv.lastMessage?.createdAt || conv.createdAt),
          unreadCount: conv.unreadCount || 0,
          conversationId: conv._id
        }));
      }

      // Combine and sort by timestamp (newest first)
      const allItems = [...notificationItems, ...conversationItems];
      allItems.sort((a, b) => b.timestamp - a.timestamp);

      setItems(allItems);

      // Calculate stats
      const unreadCount = allItems.filter(item => !item.read).length;
      const conversationsCount = conversationItems.length;

      setStats({
        total: allItems.length,
        unread: unreadCount,
        conversations: conversationsCount
      });

      console.log('📊 Unified Inbox stats:', {
        total: allItems.length,
        unread: unreadCount,
        conversations: conversationsCount
      });

    } catch (error) {
      console.error('❌ Error fetching inbox:', error);
      toast.error('Failed to load inbox');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (item) => {
    try {
      const token = localStorage.getItem('token');
      
      // Only mark notifications as read (conversations are marked read when opened)
      if (item.type === 'notification') {
        const response = await fetch(`http://localhost:5000/api/notifications/${item.originalId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setItems(prev =>
            prev.map(i =>
              i.id === item.id ? { ...i, read: true } : i
            )
          );
          setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'conversation') {
      // Navigate to messages with this conversation
      navigate(`/messages?conversation=${item.conversationId}`);
    }
    
    // Mark as read
    if (!item.read) {
      markAsRead(item);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setItems(prev => prev.map(item => ({ ...item, read: true })));
        setStats(prev => ({ ...prev, unread: 0 }));
        toast.success('All items marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteItem = async (item) => {
    // Only allow deleting notifications, not conversations
    if (item.type !== 'notification') {
      toast.info('To delete conversations, use the Messages page');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${item.originalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setItems(prev => prev.filter(i => i.id !== item.id));
        setStats(prev => ({ ...prev, total: prev.total - 1 }));
        toast.success('Deleted');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete');
    }
  };

  const getIcon = (item) => {
    if (item.type === 'conversation') {
      return <FaEnvelope className="text-blue-600" />;
    }
    return <FaBell className="text-orange-600" />;
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };


  const filteredItems = items.filter(item => {
    // Filter by type
    if (filter === 'unread' && item.read) return false;
    if (filter === 'conversations' && item.type !== 'conversation') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(query) ||
        item.message?.toLowerCase().includes(query) ||
        item.from?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaEnvelope className="text-blue-600" />
                General Inbox
              </h1>
              <p className="text-gray-600 mt-1">
                Your general notifications and conversations
              </p>
            </div>
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Mark All Read
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <div className="text-sm text-blue-600">Unread</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.conversations}</div>
              <div className="text-sm text-purple-600">Conversations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {['all', 'unread', 'conversations'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Inbox Items */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FaInbox className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'All caught up!' : 'No items found'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? "You don't have any unread items"
                  : "No items match your current filter"
                }
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                  !item.read
                    ? 'border-blue-300 bg-blue-50/30'
                    : 'border-gray-200'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {getIcon(item)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Title and Badge */}
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            {!item.read && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-gray-700 text-sm mb-2">{item.message}</p>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>From: <span className="font-medium">{item.from}</span></span>
                            <span>• {formatTime(item.timestamp)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {item.type === 'conversation' && item.unreadCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                              {item.unreadCount} new
                            </span>
                          )}
                          {item.type === 'notification' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

