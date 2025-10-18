import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view notifications');
        return;
      }

      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'negotiation_offer':
        return '💰';
      case 'negotiation_counter_offer':
        return '🔄';
      case 'negotiation_accept':
      case 'offer_accepted':
        return '✅';
      case 'negotiation_reject':
      case 'offer_rejected':
        return '❌';
      case 'offer_withdrawn':
        return '⤶';
      case 'transaction_completed':
        return '🎉';
      case 'message':
        return '💬';
      case 'application_status':
        return '📋';
      case 'broadcast':
        return '📢';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'negotiation_offer':
        return 'border-blue-400 bg-blue-50';
      case 'negotiation_counter_offer':
        return 'border-orange-400 bg-orange-50';
      case 'negotiation_accept':
        return 'border-green-400 bg-green-50';
      case 'negotiation_reject':
        return 'border-red-400 bg-red-50';
      case 'message':
        return 'border-purple-400 bg-purple-50';
      case 'application_status':
        return 'border-indigo-400 bg-indigo-50';
      case 'broadcast':
      case 'announcement':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-gray-400 bg-gray-50';
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'negotiation_offer':
        return 'New Offer';
      case 'negotiation_counter_offer':
        return 'Counter Offer';
      case 'negotiation_accept':
      case 'offer_accepted':
        return 'Offer Accepted';
      case 'negotiation_reject':
      case 'offer_rejected':
        return 'Offer Rejected';
      case 'offer_withdrawn':
        return 'Offer Withdrawn';
      case 'transaction_completed':
        return 'Transaction Complete';
      case 'message':
        return 'Message';
      case 'application_status':
        return 'Application Update';
      case 'broadcast':
        return 'Broadcast';
      case 'announcement':
        return 'Announcement';
      default:
        return 'Notification';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'offers') return notification.type.includes('negotiation');
    if (activeTab === 'messages') return notification.type === 'message';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'unread'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'offers'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Offers ({notifications.filter(n => n.type.includes('negotiation')).length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'messages'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Messages ({notifications.filter(n => n.type === 'message').length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {activeTab === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "No notifications match your current filter."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                !notification.read ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mt-1">
                    {notification.message}
                  </p>
                  
                  {notification.data && (
                    <div className="mt-2 text-xs text-gray-600">
                      {notification.data.offerAmount && (
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                          ${notification.data.offerAmount}
                        </span>
                      )}
                      {notification.data.itemTitle && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {notification.data.itemTitle}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {notification.marketplaceItem && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/marketplace/item/${notification.marketplaceItem}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View Item →
                      </Link>
                      {/* Direct link to offers for offer-related notifications */}
                      {(notification.type.includes('negotiation') || notification.type.includes('offer')) && (
                        <>
                          <Link
                            to="/account?tab=marketplace&subtab=offers"
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium px-3 py-1 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            📋 All My Offers →
                          </Link>
                          <Link
                            to="/account?tab=marketplace&subtab=offers"
                            className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            💼 Manage Offers →
                          </Link>
                        </>
                      )}
                      {/* Rate Buyer link for transaction completed */}
                      {notification.type === 'transaction_completed' && notification.data?.buyerName && (
                        <Link
                          to="/account?tab=marketplace&subtab=offers"
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-3 py-1 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          ⭐ Rate {notification.data.buyerName} →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
