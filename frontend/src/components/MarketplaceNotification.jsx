import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const MarketplaceNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Listen for notifications updated event
    const handleNotificationsUpdated = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    
    // Also listen for when user is actively reading notifications
    const handleUserActivity = () => {
      // Refresh more frequently when user is active
      setTimeout(fetchUnreadCount, 1000);
    };
    
    window.addEventListener('focus', handleUserActivity);
    window.addEventListener('visibilitychange', handleUserActivity);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
      window.removeEventListener('focus', handleUserActivity);
      window.removeEventListener('visibilitychange', handleUserActivity);
    };
  }, []);

  // Show notification when new marketplace notifications arrive
  useEffect(() => {
    if (unreadCount > previousCount && previousCount > 0) {
      const newNotifications = unreadCount - previousCount;
      toast.info(`You have ${newNotifications} new marketplace notification${newNotifications > 1 ? 's' : ''}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    setPreviousCount(unreadCount);
  }, [unreadCount, previousCount]);

  const fetchUnreadCount = async () => {
    console.log('🔔 [MarketplaceNotification] Fetching unread count...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ [MarketplaceNotification] No token found');
        setLoading(false);
        return;
      }

      console.log('📡 [MarketplaceNotification] Making API call to /unread-count');
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📥 [MarketplaceNotification] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ [MarketplaceNotification] Unread count:', data.count);
        setUnreadCount(data.count);
      } else {
        console.log('❌ [MarketplaceNotification] Response not OK:', response.status);
      }
    } catch (error) {
      console.error('❌ [MarketplaceNotification] Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Link 
        to="/notifications" 
        className="hover:text-green-300 font-semibold px-4 py-2 whitespace-nowrap relative"
      >
        Notifications
      </Link>
    );
  }

  console.log('🎨 [MarketplaceNotification] Rendering with count:', unreadCount);
  
  return (
    <Link 
      to="/inbox"
      className="hover:text-green-300 font-semibold px-4 py-2 whitespace-nowrap relative inline-flex items-center gap-2"
      title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
    >
      <span>📬 Inbox</span>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold animate-pulse shadow-lg border-2 border-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default MarketplaceNotification;
