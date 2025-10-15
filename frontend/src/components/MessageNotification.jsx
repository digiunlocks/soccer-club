import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const MessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previousCount, setPreviousCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling to check for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Listen for messages updated event
    const handleMessagesUpdated = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('messagesUpdated', handleMessagesUpdated);
    
    // Also listen for when user is actively reading messages
    const handleUserActivity = () => {
      // Refresh more frequently when user is active
      setTimeout(fetchUnreadCount, 1000);
    };
    
    window.addEventListener('focus', handleUserActivity);
    window.addEventListener('visibilitychange', handleUserActivity);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('messagesUpdated', handleMessagesUpdated);
      window.removeEventListener('focus', handleUserActivity);
      window.removeEventListener('visibilitychange', handleUserActivity);
    };
  }, []);

  // Show notification when new messages arrive
  useEffect(() => {
    if (unreadCount > previousCount && previousCount > 0) {
      const newMessages = unreadCount - previousCount;
      toast.info(`You have ${newMessages} new message${newMessages > 1 ? 's' : ''}!`, {
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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Link 
        to="/messages" 
        className="hover:text-green-300 font-semibold px-4 py-2 whitespace-nowrap relative"
      >
        Messages
      </Link>
    );
  }

  return (
    <Link 
      to="/messages" 
      className="hover:text-green-300 font-semibold px-4 py-2 whitespace-nowrap relative"
    >
      Messages
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default MessageNotification;
