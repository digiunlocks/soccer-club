import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config/api';

// Server URL for images (without /api)
const SERVER_URL = API_BASE_URL.replace('/api', '');

export default function Account() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [marketplaceMessages, setMarketplaceMessages] = useState([]);
  const [marketplaceStats, setMarketplaceStats] = useState({
    totalSales: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState('items');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(false);
  const [itemForm, setItemForm] = useState({});
  
  // Payment state
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cardType: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    fetchAllUserData(token);
  }, [navigate]);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    const subtab = searchParams.get('subtab');
    
    if (tab) {
      setActiveTab(tab);
      
      // Handle marketplace subtabs
      if (tab === 'marketplace' && subtab) {
        setActiveMarketplaceTab(subtab);
      }
    }
  }, [searchParams]);

  const fetchAllUserData = async (token) => {
      try {
      setLoading(true);
      
      console.log('🔍 Starting data fetch with token:', token ? 'Present' : 'Missing');
      
      // First fetch user data
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

      if (!userResponse.ok) {
        setError('Failed to load user data');
        setLoading(false);
        return;
      }

      const userData = await userResponse.json();
      console.log('👤 User data loaded:', userData);
      setUser(userData);
      
      // Test the new routes
      console.log('🧪 Testing new API routes...');
      const testOffersResponse = await fetch(`${API_BASE_URL}/marketplace/offers/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('🧪 Test offers response status:', testOffersResponse.status);
      
      const testReviewsResponse = await fetch(`${API_BASE_URL}/marketplace/reviews/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('🧪 Test reviews response status:', testReviewsResponse.status);
      setProfileForm({
        name: userData.name || '',
        username: userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        team: userData.team || '',
        coach: userData.coach || '',
        program: userData.program || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zipCode || '',
        country: userData.country || ''
      });
          localStorage.setItem('user', JSON.stringify(userData));

      // Now fetch related data using the user's email
      const [applicationsResponse, marketplaceResponse, galleryResponse, notificationsResponse, offersResponse, reviewsResponse, messagesResponse, paymentStatusResponse, paymentHistoryResponse] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/applications/user/${userData.email}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/marketplace/user/my-items`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/gallery/user/my-items`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/marketplace/offers/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/marketplace/reviews/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/marketplace/messages/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/payments/user/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/payments/user/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);


      // Process applications
      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.ok) {
        const apps = await applicationsResponse.value.json();
        setApplications(apps);
      }

      // Process marketplace items
      if (marketplaceResponse.status === 'fulfilled' && marketplaceResponse.value.ok) {
        const items = await marketplaceResponse.value.json();
        console.log('Marketplace items loaded:', items);
        setMarketplaceItems(items);
      } else {
        console.error('Failed to load marketplace items:', marketplaceResponse);
      }

      // Process gallery items
      if (galleryResponse.status === 'fulfilled' && galleryResponse.value.ok) {
        const items = await galleryResponse.value.json();
        setGalleryItems(items);
      }

      // Process notifications
      if (notificationsResponse.status === 'fulfilled' && notificationsResponse.value.ok) {
        const notifs = await notificationsResponse.value.json();
        setNotifications(notifs);
      }

      // Process offers
      if (offersResponse.status === 'fulfilled' && offersResponse.value.ok) {
        const offersData = await offersResponse.value.json();
        console.log('Offers loaded:', offersData);
        setOffers(offersData);
      } else {
        console.error('Failed to load offers:', offersResponse);
        console.error('Offers response status:', offersResponse.status);
        console.error('Offers response value:', offersResponse.value);
      }

      // Process reviews
      if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value.ok) {
        const reviewsData = await reviewsResponse.value.json();
        console.log('Reviews loaded:', reviewsData);
        setReviews(reviewsData);
      } else {
        console.error('Failed to load reviews:', reviewsResponse);
        console.error('Reviews response status:', reviewsResponse.status);
        console.error('Reviews response value:', reviewsResponse.value);
      }

      // Process marketplace messages
      if (messagesResponse.status === 'fulfilled' && messagesResponse.value.ok) {
        const messagesData = await messagesResponse.value.json();
        console.log('Marketplace messages loaded:', messagesData);
        setMarketplaceMessages(messagesData);
      } else {
        console.error('Failed to load marketplace messages:', messagesResponse);
        console.error('Messages response status:', messagesResponse.status);
        console.error('Messages response value:', messagesResponse.value);
      }

      // Process payment status
      if (paymentStatusResponse.status === 'fulfilled' && paymentStatusResponse.value.ok) {
        const statusData = await paymentStatusResponse.value.json();
        console.log('Payment status loaded:', statusData);
        setPaymentStatus(statusData);
      }

      // Process payment history
      if (paymentHistoryResponse.status === 'fulfilled' && paymentHistoryResponse.value.ok) {
        const historyData = await paymentHistoryResponse.value.json();
        console.log('Payment history loaded:', historyData);
        setPaymentHistory(historyData);
      }

      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading account');
      } finally {
        setLoading(false);
      }
    };

  // Remove the redirect - we'll show marketplace management within the account page

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditingProfile(false);
        toast.success('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'denied': case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateTotalDonations = () => {
    // This would be calculated from payment records
    return 0;
  };

  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent applications
    applications.slice(0, 3).forEach(app => {
      activities.push({
        type: 'application',
        title: `Application for ${app.type}`,
        date: app.createdAt,
        status: app.status
      });
    });

    // Add recent marketplace items
    marketplaceItems.slice(0, 3).forEach(item => {
      activities.push({
        type: 'marketplace',
        title: `Listed "${item.title}"`,
        date: item.createdAt,
        status: item.status
      });
    });

    // Add recent gallery items
    galleryItems.slice(0, 3).forEach(item => {
      activities.push({
        type: 'gallery',
        title: `Uploaded "${item.title}"`,
        date: item.createdAt,
        status: 'published'
      });
    });

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const getOfferStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const handleOfferAction = async (offerId, action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/marketplace/offers/${offerId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`Offer ${action} successfully!`);
        // Refresh offers data
        await fetchAllUserData(token);
      } else {
        toast.error(`Failed to ${action} offer`);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      toast.error('Error processing offer');
    }
  };

  const handleReviewResponse = async (reviewId, response) => {
    try {
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(`${API_BASE_URL}/marketplace/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response })
      });

      if (apiResponse.ok) {
        toast.success('Response added successfully!');
        // Refresh reviews data
        await fetchAllUserData(token);
      } else {
        toast.error('Failed to add response');
      }
    } catch (error) {
      console.error('Error responding to review:', error);
      toast.error('Error adding response');
    }
  };

  const handleItemEdit = (item) => {
    setSelectedItem(item);
    setItemForm({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      condition: item.condition,
      brand: item.brand,
      size: item.size,
      color: item.color,
      location: item.location
    });
    setEditingItem(true);
    setShowItemModal(true);
  };

  const handleItemUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/marketplace/items/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemForm)
      });

      if (response.ok) {
        toast.success('Item updated successfully!');
        setShowItemModal(false);
        setEditingItem(false);
        await fetchAllUserData(token);
      } else {
        toast.error('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Error updating item');
    }
  };

  const handleItemDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/marketplace/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('Item deleted successfully!');
          await fetchAllUserData(token);
        } else {
          toast.error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Error deleting item');
      }
    }
  };

  const handleItemStatusChange = async (itemId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/marketplace/items/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Item status changed to ${newStatus}`);
        await fetchAllUserData(token);
      } else {
        toast.error('Failed to change item status');
      }
    } catch (error) {
      console.error('Error changing item status:', error);
      toast.error('Error changing item status');
    }
  };

  const calculateMarketplaceStats = () => {
    const totalSales = marketplaceItems.filter(item => item.status === 'sold').length;
    const totalEarnings = marketplaceItems
      .filter(item => item.status === 'sold')
      .reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
    const averageRating = reviews.filter(r => r.type === 'received').length > 0
      ? reviews.filter(r => r.type === 'received').reduce((sum, r) => sum + r.rating, 0) / reviews.filter(r => r.type === 'received').length
      : 0;
    const totalViews = marketplaceItems.reduce((total, item) => total + (item.views || 0), 0);

    return { totalSales, totalEarnings, averageRating, totalViews };
  };

  const getItemAnalytics = (item) => {
    const itemOffers = offers.filter(offer => offer.itemId === item._id);
    const itemReviews = reviews.filter(review => review.itemId === item._id);
    const itemViews = item.views || 0;
    const daysListed = Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24));

    return {
      offers: itemOffers.length,
      reviews: itemReviews.length,
      views: itemViews,
      daysListed,
      avgViewsPerDay: daysListed > 0 ? (itemViews / daysListed).toFixed(1) : 0
    };
  };

  const handleRepostItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/marketplace/items/${itemId}/repost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Item reposted successfully!');
        await fetchAllUserData(token);
      } else {
        toast.error('Failed to repost item');
      }
    } catch (error) {
      console.error('Error reposting item:', error);
      toast.error('Error reposting item');
    }
  };

  const handleExtendItem = async (itemId, days = 30) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/marketplace/items/${itemId}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ days })
      });

      if (response.ok) {
        toast.success(`Item extended by ${days} days!`);
        await fetchAllUserData(token);
      } else {
        toast.error('Failed to extend item');
      }
    } catch (error) {
      console.error('Error extending item:', error);
      toast.error('Error extending item');
    }
  };

  const handleUnflagItem = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/marketplace/items/${itemId}/unflag`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Item unflagged successfully!');
        await fetchAllUserData(token);
      } else {
        toast.error('Failed to unflag item');
      }
    } catch (error) {
      console.error('Error unflagging item:', error);
      toast.error('Error unflagging item');
    }
  };

  const getDaysUntilExpiry = (item) => {
    if (!item.expiryDate) return null;
    const expiry = new Date(item.expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isItemExpiringSoon = (item) => {
    const daysLeft = getDaysUntilExpiry(item);
    return daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
  };

  // Payment helper functions
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'Visa';
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
    return '';
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (value.length <= 19) {
      setCardInfo(prev => ({
        ...prev,
        cardNumber: value,
        cardType: detectCardType(value)
      }));
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setCardInfo(prev => ({ ...prev, expiryDate: value }));
    }
  };

  const processRegistrationPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (paymentMethod === 'card') {
      const cardNum = cardInfo.cardNumber.replace(/\s/g, '');
      if (cardNum.length < 15) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (!cardInfo.cardName) {
        toast.error('Please enter the name on your card');
        return;
      }
      if (cardInfo.expiryDate.length < 5) {
        toast.error('Please enter a valid expiry date');
        return;
      }
      if (cardInfo.cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return;
      }
    }

    setProcessingPayment(true);

    try {
      const token = localStorage.getItem('token');
      const cardLastFour = paymentMethod === 'card' 
        ? cardInfo.cardNumber.replace(/\s/g, '').slice(-4) 
        : '';

      const response = await fetch(`${API_BASE_URL}/payments/registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod: paymentMethod === 'card' ? 'credit_card' : 'paypal',
          cardType: cardInfo.cardType,
          cardLastFour
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment successful! You will be assigned to a team soon.');
        setShowPaymentModal(false);
        setPaymentMethod('');
        setCardInfo({ cardNumber: '', cardName: '', expiryDate: '', cvv: '', cardType: '' });
        // Refresh user data
        await fetchAllUserData(token);
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('An error occurred while processing your payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Account</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const initials = getInitials(user.name);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-green-100">@{user.username} • {user.email}</p>
                <p className="text-green-200 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                {notifications.filter(n => !n.read).length > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🔔 {notifications.filter(n => !n.read).length} unread notifications
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{user.isSuperAdmin ? 'Super Admin' : user.isAdmin ? 'Admin' : 'Member'}</div>
              <div className="text-green-200 text-sm">Account Status</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={async () => {
                  setRefreshing(true);
                  await fetchAllUserData(localStorage.getItem("token"));
                  setRefreshing(false);
                }}
                disabled={refreshing}
                className="text-green-200 hover:text-white transition-colors text-sm disabled:opacity-50"
              >
                {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Data'}
              </button>
              <button
                onClick={() => {
                  console.log('Current data state:');
                  console.log('Marketplace Items:', marketplaceItems);
                  console.log('Offers:', offers);
                  console.log('Reviews:', reviews);
                }}
                className="text-blue-200 hover:text-white transition-colors text-sm"
              >
                🐛 Debug Data
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Donated</p>
                <p className="text-2xl font-semibold text-gray-900">${calculateTotalDonations().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Marketplace Items</p>
                <p className="text-2xl font-semibold text-gray-900">{marketplaceItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gallery Items</p>
                <p className="text-2xl font-semibold text-gray-900">{galleryItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="overflow-x-auto">
            <div className="flex border-b border-gray-200 min-w-max">
              {['overview', 'profile', 'applications', 'marketplace', 'gallery', 'payments', 'favorites', 'notifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                  className={`px-4 py-4 font-medium transition-colors capitalize relative whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
                  {tab === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Overview Tab - Enhanced and Comprehensive */}
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Payment Required Alert */}
              {paymentStatus && paymentStatus.registrationPaymentStatus === 'pending' && (
                <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">⚠️</div>
                      <div>
                        <h4 className="font-semibold text-yellow-800">Complete Your Registration</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          Pay the registration fee of <span className="font-bold">${paymentStatus.registrationPaymentAmount?.toFixed(2)}</span> to be assigned to a team.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('payments');
                        setShowPaymentModal(true);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold whitespace-nowrap ml-4"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              )}

              {/* Team Assignment Card */}
              {paymentStatus && paymentStatus.registrationPaymentStatus === 'paid' && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">⚽</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">Your Team Assignment</h3>
                      {user?.team ? (
                        <div>
                          <p className="text-green-800">
                            You have been assigned to: <span className="font-bold text-lg">{user.team}</span>
                          </p>
                          {user?.coach && (
                            <p className="text-green-700 text-sm mt-1">Coach: {user.coach}</p>
                          )}
                          {user?.program && (
                            <p className="text-green-700 text-sm">Program: {user.program}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-green-700">Your payment is confirmed! ✓</p>
                          <p className="text-green-600 text-sm mt-1">
                            A club administrator will assign you to a team soon. You'll receive a notification when your team is ready.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || user?.username || 'User'}!</h2>
                <p className="text-gray-600">Here's an overview of your account activity and statistics.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Applications</p>
                      <p className="text-3xl font-bold">{applications.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Marketplace Items</p>
                      <p className="text-3xl font-bold">{marketplaceItems.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🛍️</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Gallery Items</p>
                      <p className="text-3xl font-bold">{galleryItems.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📸</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Unread Notifications</p>
                      <p className="text-3xl font-bold">{notifications.filter(n => !n.read).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🔔</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity - Enhanced */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                      <button 
                        onClick={() => setActiveTab('notifications')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View All →
                      </button>
                    </div>
                    <div className="space-y-4">
                      {getRecentActivity().length > 0 ? (
                        getRecentActivity().map((activity, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.type === 'application' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'marketplace' ? 'bg-purple-100 text-purple-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {activity.type === 'application' ? '📝' : activity.type === 'marketplace' ? '🛍️' : '📸'}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-6xl mb-4">📊</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recent Activity</h3>
                          <p className="text-gray-600 mb-6">Start by submitting an application or listing an item in the marketplace!</p>
                          <div className="flex gap-3 justify-center">
                            <button 
                              onClick={() => setActiveTab('applications')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View Applications
                            </button>
                            <button 
                              onClick={() => setActiveTab('marketplace')}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              Browse Marketplace
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions & Marketplace Stats */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setActiveTab('marketplace')}
                        className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-2xl">🛍️</span>
                        <div>
                          <p className="font-medium text-gray-900">Manage Marketplace</p>
                          <p className="text-sm text-gray-500">View items, offers, and reviews</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => setActiveTab('applications')}
                        className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-2xl">📝</span>
                        <div>
                          <p className="font-medium text-gray-900">View Applications</p>
                          <p className="text-sm text-gray-500">Check application status</p>
                        </div>
                      </button>
                      <button 
                        onClick={() => setActiveTab('gallery')}
                        className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-2xl">📸</span>
                        <div>
                          <p className="font-medium text-gray-900">Gallery Items</p>
                          <p className="text-sm text-gray-500">Manage your photos</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Marketplace Performance */}
                  {marketplaceItems.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Performance</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Active Items</span>
                          <span className="font-semibold text-green-600">
                            {marketplaceItems.filter(item => item.status === 'approved').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Pending Items</span>
                          <span className="font-semibold text-yellow-600">
                            {marketplaceItems.filter(item => item.status === 'pending').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Offers</span>
                          <span className="font-semibold text-blue-600">{offers.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Reviews Received</span>
                          <span className="font-semibold text-purple-600">{reviews.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* Profile Information Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.name || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <p className="text-gray-500 text-sm">@{user.username || 'Not provided'}</p>
                    <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-500 text-sm">{user.email || 'Not provided'}</p>
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    {editingProfile ? (
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                    <p className="text-gray-500 text-sm">{user.team || 'Not assigned'}</p>
                    <p className="text-xs text-gray-400 mt-1">Team cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coach</label>
                    <p className="text-gray-500 text-sm">{user.coach || 'Not assigned'}</p>
                    <p className="text-xs text-gray-400 mt-1">Coach cannot be changed</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                    <p className="text-gray-500 text-sm">{user.program || 'Not assigned'}</p>
                    <p className="text-xs text-gray-400 mt-1">Program cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your street address"
                      />
                    ) : (
                      <p className="text-gray-900">{user.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your city"
                      />
                    ) : (
                      <p className="text-gray-900">{user.city || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({...profileForm, state: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your state/province"
                      />
                    ) : (
                      <p className="text-gray-900">{user.state || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.zipCode}
                        onChange={(e) => setProfileForm({...profileForm, zipCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your ZIP/postal code"
                      />
                    ) : (
                      <p className="text-gray-900">{user.zipCode || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    {editingProfile ? (
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your country"
                      />
                    ) : (
                      <p className="text-gray-900">{user.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Change Section */}
              {showPasswordForm && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h4>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Change Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                        }}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {editingProfile && (
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Applications</h3>
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{app.type} Application</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Applied on {formatDate(app.createdAt)}</p>
                      {app.actionReason && (
                        <p className="text-sm text-gray-700">
                          <strong>Response:</strong> {app.actionReason}
                        </p>
                      )}
                      {app.info && (
                        <div className="mt-3 text-sm text-gray-600">
                          <p><strong>Name:</strong> {app.info.name}</p>
                          <p><strong>Email:</strong> {app.info.email}</p>
                          {app.info.phone && <p><strong>Phone:</strong> {app.info.phone}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p>No applications submitted yet</p>
                  <Link to="/join" className="text-green-600 hover:text-green-700 mt-2 inline-block">
                    Submit an application
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Marketplace Dashboard</h3>
                  <p className="text-gray-600 mt-1">Manage your marketplace presence and track performance</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/marketplace"
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <span>🔍</span>
                    Browse All Items
                  </Link>
                  <Link
                    to="/marketplace/post"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <span>➕</span>
                    Post New Item
                  </Link>
                </div>
              </div>

              {/* Enhanced Marketplace Stats */}
              {(() => {
                const stats = calculateMarketplaceStats();
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total Sales</p>
                          <p className="text-3xl font-bold">{stats.totalSales}</p>
                        </div>
                        <div className="text-4xl opacity-80">💰</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Total Earnings</p>
                          <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
                        </div>
                        <div className="text-4xl opacity-80">💵</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm font-medium">Average Rating</p>
                          <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                        </div>
                        <div className="text-4xl opacity-80">⭐</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Total Views</p>
                          <p className="text-3xl font-bold">{stats.totalViews}</p>
                        </div>
                        <div className="text-4xl opacity-80">👁️</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Enhanced Marketplace Sub-tabs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <div className="flex space-x-8 px-6">
                    {[
                    { key: 'items', label: 'My Items', icon: '📦', count: marketplaceItems.length },
                    { key: 'offers', label: 'Offers', icon: '💰', count: offers.length },
                    { key: 'reviews', label: 'Reviews', icon: '⭐', count: reviews.length },
                    { key: 'messages', label: 'Messages', icon: '💬', count: null },
                    { key: 'analytics', label: 'Analytics', icon: '📊', count: null }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveMarketplaceTab(tab.key)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                          activeMarketplaceTab === tab.key
                            ? 'border-green-500 text-green-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        {tab.label}
                        {tab.count !== null && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            activeMarketplaceTab === tab.key
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items Tab */}
              {activeMarketplaceTab === 'items' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Your Marketplace Items</h4>
                        <p className="text-sm text-gray-600">Manage and track your listed items</p>
                      </div>
                      <div className="flex gap-2">
                        <select 
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          onChange={(e) => {
                            // Filter items by status
                          }}
                        >
                          <option value="">All Items</option>
                          <option value="approved">Active</option>
                          <option value="pending">Pending</option>
                          <option value="sold">Sold</option>
                          <option value="expired">Expired</option>
                          <option value="flagged">Flagged</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Status Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {marketplaceItems.filter(item => item.status === 'approved').length}
                        </div>
                        <div className="text-sm text-green-600 font-medium">Active</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          {marketplaceItems.filter(item => item.status === 'sold').length}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">Sold</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-700">
                          {marketplaceItems.filter(item => item.status === 'expired').length}
                        </div>
                        <div className="text-sm text-yellow-600 font-medium">Expired</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">
                          {marketplaceItems.filter(item => item.status === 'flagged').length}
                        </div>
                        <div className="text-sm text-red-600 font-medium">Flagged</div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">
                          {marketplaceItems.filter(item => item.status === 'pending').length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium">Pending</div>
                      </div>
                    </div>

                    {marketplaceItems.length > 0 ? (
                      <div className="space-y-4">
                        {marketplaceItems.map((item) => {
                          const analytics = getItemAnalytics(item);
                          const daysUntilExpiry = getDaysUntilExpiry(item);
                          const isExpiringSoon = isItemExpiringSoon(item);
                          
                          return (
                            <div key={item._id} className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                              item.status === 'flagged' ? 'border-red-200 bg-red-50' :
                              item.status === 'expired' ? 'border-yellow-200 bg-yellow-50' :
                              item.status === 'sold' ? 'border-green-200 bg-green-50' :
                              isExpiringSoon ? 'border-orange-200 bg-orange-50' :
                              'border-gray-200 bg-white'
                            }`}>
                              <div className="flex gap-6">
                                {/* Item Image */}
                                <div className="flex-shrink-0">
                                  {item.images && item.images.length > 0 ? (
                                    <div className="relative">
                                      <img
                                        src={`${SERVER_URL}/uploads/marketplace/${item.images[0]}`}
                                        alt={item.title}
                                        className="w-24 h-24 object-cover rounded-lg"
                                      />
                                      {item.images.length > 1 && (
                                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                          +{item.images.length - 1}
                                        </span>
                                      )}
                                      {item.status === 'sold' && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                          <span className="text-white font-bold text-sm">SOLD</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <span className="text-gray-400 text-3xl">📦</span>
                                    </div>
                                  )}
                                </div>

                                {/* Item Details */}
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900 text-lg">{item.title}</h4>
                                        {isExpiringSoon && (
                                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                            ⏰ Expires in {daysUntilExpiry} days
                                          </span>
                                        )}
                                        {item.status === 'expired' && (
                                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                            ⏰ Expired
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                      <div className="flex gap-4 text-sm text-gray-500 mb-2">
                                        <span className="font-medium text-green-600">${item.price}</span>
                                        <span>{item.category}</span>
                                        <span className="capitalize">{item.condition}</span>
                                        {item.brand && <span>{item.brand}</span>}
                                      </div>
                                      <div className="flex gap-4 text-xs text-gray-400">
                                        <span>Listed {formatDate(item.createdAt)}</span>
                                        <span>{analytics.daysListed} days ago</span>
                                        {item.expiryDate && (
                                          <span>
                                            {item.status === 'expired' ? 'Expired' : `Expires ${formatDate(item.expiryDate)}`}
                                          </span>
                                        )}
                                      </div>

                                      {/* Flag Reason */}
                                      {item.status === 'flagged' && item.flagReason && (
                                        <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-lg">
                                          <div className="flex items-start gap-2">
                                            <span className="text-red-600 text-sm">⚠️</span>
                                            <div>
                                              <p className="text-sm font-medium text-red-800">Flagged Item</p>
                                              <p className="text-sm text-red-700">{item.flagReason}</p>
                                              {item.flaggedAt && (
                                                <p className="text-xs text-red-600 mt-1">
                                                  Flagged on {formatDate(item.flaggedAt)}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Sold Information */}
                                      {item.status === 'sold' && item.soldAt && (
                                        <div className="mt-2 p-3 bg-green-100 border border-green-200 rounded-lg">
                                          <div className="flex items-center gap-2">
                                            <span className="text-green-600 text-sm">✅</span>
                                            <div>
                                              <p className="text-sm font-medium text-green-800">Item Sold</p>
                                              <p className="text-sm text-green-700">
                                                Sold on {formatDate(item.soldAt)}
                                                {item.soldTo && ` to ${item.soldTo}`}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {item.status.toUpperCase()}
                                      </span>
                                      <div className="mt-2 text-xs text-gray-500">
                                        <div>👁️ {analytics.views} views</div>
                                        <div>💰 {analytics.offers} offers</div>
                                        <div>⭐ {analytics.reviews} reviews</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Analytics Bar */}
                                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <div className="grid grid-cols-4 gap-4 text-center">
                                      <div>
                                        <div className="text-lg font-bold text-blue-600">{analytics.views}</div>
                                        <div className="text-xs text-gray-500">Views</div>
                                      </div>
                                      <div>
                                        <div className="text-lg font-bold text-green-600">{analytics.offers}</div>
                                        <div className="text-xs text-gray-500">Offers</div>
                                      </div>
                                      <div>
                                        <div className="text-lg font-bold text-yellow-600">{analytics.reviews}</div>
                                        <div className="text-xs text-gray-500">Reviews</div>
                                      </div>
                                      <div>
                                        <div className="text-lg font-bold text-purple-600">{analytics.avgViewsPerDay}</div>
                                        <div className="text-xs text-gray-500">Views/Day</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Status-Specific Action Buttons */}
                                <div className="flex-shrink-0 flex flex-col gap-2">
                                  <button
                                    onClick={() => window.open(`/marketplace/item/${item._id}`, '_blank')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                                  >
                                    <span>👁️</span>
                                    View
                                  </button>
                                  
                                  {/* Active Items */}
                                  {item.status === 'approved' && (
                                    <>
                                      <button
                                        onClick={() => handleItemEdit(item)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
                                      >
                                        <span>✏️</span>
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleItemStatusChange(item._id, 'sold')}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                                      >
                                        <span>✅</span>
                                        Mark Sold
                                      </button>
                                      {isExpiringSoon && (
                                        <button
                                          onClick={() => handleExtendItem(item._id, 30)}
                                          className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors flex items-center gap-2"
                                        >
                                          <span>⏰</span>
                                          Extend 30 Days
                                        </button>
                                      )}
                                    </>
                                  )}
                                  
                                  {/* Expired Items */}
                                  {item.status === 'expired' && (
                                    <>
                                      <button
                                        onClick={() => handleRepostItem(item._id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                                      >
                                        <span>🔄</span>
                                        Repost
                                      </button>
                                      <button
                                        onClick={() => handleExtendItem(item._id, 30)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                                      >
                                        <span>⏰</span>
                                        Extend 30 Days
                                      </button>
                                    </>
                                  )}
                                  
                                  {/* Flagged Items */}
                                  {item.status === 'flagged' && (
                                    <button
                                      onClick={() => handleUnflagItem(item._id)}
                                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors flex items-center gap-2"
                                    >
                                      <span>🚩</span>
                                      Request Unflag
                                    </button>
                                  )}
                                  
                                  {/* Pending Items */}
                                  {item.status === 'pending' && (
                                    <button
                                      disabled
                                      className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed flex items-center gap-2"
                                    >
                                      <span>⏳</span>
                                      Pending Review
                                    </button>
                                  )}
                                  
                                  {/* Delete Button (available for most statuses) */}
                                  {!['sold'].includes(item.status) && (
                                    <button
                                      onClick={() => handleItemDelete(item._id)}
                                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                      <span>🗑️</span>
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        <div className="text-8xl mb-6">🛍️</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Marketplace Items Yet</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                          Start your marketplace journey by listing your first item. 
                          It's easy to get started and you can manage everything from here!
                        </p>
                        <p className="text-sm text-gray-500">
                          Use the "Post New Item" button above to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Offers Tab */}
              {activeMarketplaceTab === 'offers' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Offer Management</h4>
                        <p className="text-sm text-gray-600">Track and manage all your marketplace offers</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-blue-700">
                              {offers.filter(offer => offer.type === 'received').length}
                            </div>
                            <div className="text-sm text-blue-600 font-medium">Offers Received</div>
                            <div className="text-xs text-blue-500 mt-1">
                              {offers.filter(offer => offer.type === 'received' && offer.status === 'pending').length} pending
                            </div>
                          </div>
                          <div className="text-4xl opacity-60">📥</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-3xl font-bold text-green-700">
                              {offers.filter(offer => offer.type === 'given').length}
                            </div>
                            <div className="text-sm text-green-600 font-medium">Offers Given</div>
                            <div className="text-xs text-green-500 mt-1">
                              {offers.filter(offer => offer.type === 'given' && offer.status === 'pending').length} pending
                            </div>
                          </div>
                          <div className="text-4xl opacity-60">📤</div>
                        </div>
                      </div>
                    </div>

                  <div className="space-y-4">
                    {/* Offers Received */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Offers Received</h4>
                      {offers.filter(offer => offer.type === 'received').length > 0 ? (
                        <div className="space-y-3">
                          {offers.filter(offer => offer.type === 'received').map((offer) => (
                            <div key={offer._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900">${offer.amount}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOfferStatusColor(offer.status)}`}>
                                      {offer.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">For: {offer.itemTitle}</p>
                                  <p className="text-sm text-gray-500">From: {offer.buyerName}</p>
                                  {offer.message && (
                                    <p className="text-sm text-gray-700 mt-2 italic">"{offer.message}"</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2">{formatDate(offer.createdAt)}</p>
                                </div>
                                {offer.status === 'pending' && (
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => handleOfferAction(offer._id, 'accept')}
                                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleOfferAction(offer._id, 'reject')}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-4">📥</div>
                          <p>No offers received yet</p>
                        </div>
                      )}
                    </div>

                    {/* Offers Given */}
                    <div className="mt-8">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Offers Given</h4>
                      {offers.filter(offer => offer.type === 'given').length > 0 ? (
                        <div className="space-y-3">
                          {offers.filter(offer => offer.type === 'given').map((offer) => (
                            <div key={offer._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900">${offer.amount}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOfferStatusColor(offer.status)}`}>
                                      {offer.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">For: {offer.itemTitle}</p>
                                  <p className="text-sm text-gray-500">To: {offer.sellerName}</p>
                                  {offer.message && (
                                    <p className="text-sm text-gray-700 mt-2 italic">"{offer.message}"</p>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2">{formatDate(offer.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-4">📤</div>
                          <p>No offers given yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeMarketplaceTab === 'reviews' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {reviews.filter(review => review.type === 'received').length}
                      </div>
                      <div className="text-sm text-blue-600">Reviews Received</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {reviews.filter(review => review.type === 'given').length}
                      </div>
                      <div className="text-sm text-green-600">Reviews Given</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Reviews Received */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Reviews Received</h4>
                      {reviews.filter(review => review.type === 'received').length > 0 ? (
                        <div className="space-y-4">
                          {reviews.filter(review => review.type === 'received').map((review) => (
                            <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">{renderStars(review.rating)}</div>
                                    <span className="font-medium text-gray-900">{review.title}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">From: {review.reviewerName}</p>
                                  <p className="text-sm text-gray-500">For: {review.itemTitle}</p>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                              
                              {/* Seller Response */}
                              {review.sellerResponse ? (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-600 mb-1">Your Response:</p>
                                  <p className="text-sm text-gray-700">{review.sellerResponse}</p>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Respond to this review..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && e.target.value.trim()) {
                                        handleReviewResponse(review._id, e.target.value.trim());
                                        e.target.value = '';
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      const input = e.target.previousElementSibling;
                                      if (input.value.trim()) {
                                        handleReviewResponse(review._id, input.value.trim());
                                        input.value = '';
                                      }
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                  >
                                    Respond
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-4">⭐</div>
                          <p>No reviews received yet</p>
                        </div>
                      )}
                    </div>

                    {/* Reviews Given */}
                    <div className="mt-8">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Reviews Given</h4>
                      {reviews.filter(review => review.type === 'given').length > 0 ? (
                        <div className="space-y-4">
                          {reviews.filter(review => review.type === 'given').map((review) => (
                            <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">{renderStars(review.rating)}</div>
                                    <span className="font-medium text-gray-900">{review.title}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">To: {review.sellerName}</p>
                                  <p className="text-sm text-gray-500">For: {review.itemTitle}</p>
                                </div>
                                <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700 mb-3">{review.comment}</p>
                              
                              {/* Seller Response */}
                              {review.sellerResponse && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="text-xs text-gray-600 mb-1">Seller Response:</p>
                                  <p className="text-sm text-gray-700">{review.sellerResponse}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-4">⭐</div>
                          <p>No reviews given yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Tab */}
              {activeMarketplaceTab === 'messages' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Marketplace Messages</h4>
                        <p className="text-sm text-gray-600">All your marketplace communications and negotiations</p>
                      </div>
                    </div>

                    {marketplaceMessages.length > 0 ? (
                      <div className="space-y-4">
                        {marketplaceMessages.map((message) => (
                          <div key={message._id} className={`border rounded-lg p-4 ${
                            message.sender._id === user._id 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-blue-200 bg-blue-50'
                          }`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    message.messageType === 'offer' ? 'bg-green-100 text-green-800' :
                                    message.messageType === 'counter_offer' ? 'bg-yellow-100 text-yellow-800' :
                                    message.messageType === 'accept' ? 'bg-blue-100 text-blue-800' :
                                    message.messageType === 'reject' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {message.messageType === 'offer' ? '💰 Offer' :
                                     message.messageType === 'counter_offer' ? '💰 Counter Offer' :
                                     message.messageType === 'accept' ? '✅ Accepted' :
                                     message.messageType === 'reject' ? '❌ Rejected' :
                                     '💬 Message'}
                                  </span>
                                  {message.offerAmount && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      ${message.offerAmount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {message.sender._id === user._id ? 'You' : message.sender.username || message.sender.name} 
                                  {' '}to{' '}
                                  {message.recipient._id === user._id ? 'You' : message.recipient.username || message.recipient.name}
                                </p>
                                <p className="text-sm text-gray-500 mb-2">Item: {message.item?.title}</p>
                                <p className="text-sm text-gray-700">{message.content}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500">{formatDate(message.createdAt)}</span>
                                {!message.read && message.recipient._id === user._id && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      Unread
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Marketplace Messages Yet</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          When you start communicating with buyers or sellers about your items, 
                          all messages will appear here for easy management.
                        </p>
                        <Link 
                          to="/marketplace" 
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Browse Marketplace
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeMarketplaceTab === 'analytics' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Marketplace Analytics</h4>
                        <p className="text-sm text-gray-600">Detailed insights into your marketplace performance</p>
                      </div>
                    </div>

                    {/* Performance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-indigo-700">
                              {marketplaceItems.length > 0 ? (marketplaceItems.reduce((sum, item) => sum + (item.views || 0), 0) / marketplaceItems.length).toFixed(1) : 0}
                            </div>
                            <div className="text-sm text-indigo-600 font-medium">Avg Views per Item</div>
                          </div>
                          <div className="text-3xl opacity-60">📈</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-emerald-700">
                              {marketplaceItems.length > 0 ? ((offers.length / marketplaceItems.length) * 100).toFixed(1) : 0}%
                            </div>
                            <div className="text-sm text-emerald-600 font-medium">Offer Rate</div>
                          </div>
                          <div className="text-3xl opacity-60">🎯</div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-amber-700">
                              {marketplaceItems.length > 0 ? ((reviews.length / marketplaceItems.length) * 100).toFixed(1) : 0}%
                            </div>
                            <div className="text-sm text-amber-600 font-medium">Review Rate</div>
                          </div>
                          <div className="text-3xl opacity-60">⭐</div>
                        </div>
                      </div>
                    </div>

                    {/* Item Performance Chart */}
                    <div className="mb-8">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Item Performance</h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {marketplaceItems.length > 0 ? (
                          <div className="space-y-3">
                            {marketplaceItems.slice(0, 5).map((item) => {
                              const analytics = getItemAnalytics(item);
                              return (
                                <div key={item._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                  <div className="flex items-center gap-3">
                                    {item.images && item.images.length > 0 ? (
                                      <img
                                        src={`${SERVER_URL}/uploads/marketplace/${item.images[0]}`}
                                        alt={item.title}
                                        className="w-12 h-12 object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400">📦</span>
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-medium text-gray-900">{item.title}</div>
                                      <div className="text-sm text-gray-500">${item.price}</div>
                                    </div>
                                  </div>
                                  <div className="flex gap-6 text-sm">
                                    <div className="text-center">
                                      <div className="font-bold text-blue-600">{analytics.views}</div>
                                      <div className="text-gray-500">Views</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-bold text-green-600">{analytics.offers}</div>
                                      <div className="text-gray-500">Offers</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-bold text-yellow-600">{analytics.reviews}</div>
                                      <div className="text-gray-500">Reviews</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-4">📊</div>
                            <p>No analytics data available yet</p>
                            <p className="text-sm mt-2">List some items to see performance metrics</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Performing Categories */}
                    <div className="mb-8">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h5>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {(() => {
                          const categoryStats = marketplaceItems.reduce((acc, item) => {
                            acc[item.category] = (acc[item.category] || 0) + 1;
                            return acc;
                          }, {});
                          
                          const sortedCategories = Object.entries(categoryStats)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5);
                          
                          return sortedCategories.length > 0 ? (
                            <div className="space-y-3">
                              {sortedCategories.map(([category, count]) => (
                                <div key={category} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                  <div className="font-medium text-gray-900 capitalize">{category}</div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm text-gray-500">{count} items</div>
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${(count / Math.max(...Object.values(categoryStats))) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <div className="text-4xl mb-4">📊</div>
                              <p>No category data available</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Gallery Items</h3>
                <Link
                  to="/gallery/upload"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload New Item
                </Link>
              </div>
              {galleryItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryItems.map((item) => (
                    <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {item.image && (
                        <img
                          src={`${SERVER_URL}/uploads/gallery/${item.image}`}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <p className="text-xs text-gray-500">Uploaded {formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📸</div>
                  <p>No gallery items uploaded yet</p>
                  <Link to="/gallery/upload" className="text-green-600 hover:text-green-700 mt-2 inline-block">
                    Upload your first item
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="p-6">
              {/* Registration Payment Alert */}
              {paymentStatus && paymentStatus.registrationPaymentStatus === 'pending' && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">⚠️</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">Registration Payment Required</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        To complete your registration and be assigned to a team, please pay the registration fee of 
                        <span className="font-bold"> ${paymentStatus.registrationPaymentAmount?.toFixed(2) || '50.00'}</span>.
                      </p>
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                      >
                        Pay Now - ${paymentStatus.registrationPaymentAmount?.toFixed(2) || '50.00'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Status Confirmed */}
              {paymentStatus && paymentStatus.registrationPaymentStatus === 'paid' && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">✅</div>
                    <div>
                      <h4 className="font-semibold text-green-800">Registration Payment Confirmed</h4>
                      <p className="text-green-700 text-sm mt-1">
                        Your registration fee of ${paymentStatus.registrationPaymentAmount?.toFixed(2)} was paid on {formatDate(paymentStatus.registrationPaymentDate)}.
                      </p>
                      {paymentStatus.registrationTransactionId && (
                        <p className="text-green-600 text-xs mt-1">Transaction ID: {paymentStatus.registrationTransactionId}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              
              {paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{payment.paymentType}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {payment.paymentMethod === 'credit_card' || payment.paymentMethod === 'debit_card' 
                              ? `${payment.cardType || 'Card'} ending in ${payment.cardLastFour || '****'}`
                              : payment.paymentMethod?.replace('_', ' ').charAt(0).toUpperCase() + payment.paymentMethod?.slice(1).replace('_', ' ')
                            }
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(payment.paymentDate)}</p>
                          {payment.transactionId && (
                            <p className="text-xs text-gray-400 mt-1">ID: {payment.transactionId}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${payment.amount?.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            payment.status === 'refunded' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">💳</div>
                  <p>No payment history available</p>
                  <p className="text-sm mt-2">Payments and donations will appear here</p>
                </div>
              )}

              {/* Make a Donation */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Support the Club</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Your donations help us provide opportunities, equipment, and programs for youth and adult soccer.
                </p>
                <Link
                  to="/donate"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="mr-2">❤️</span> Make a Donation
                </Link>
              </div>
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Pay Registration Fee</h3>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setPaymentMethod('');
                      setCardInfo({ cardNumber: '', cardName: '', expiryDate: '', cvv: '', cardType: '' });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-green-50 rounded p-3 mb-4">
                  <p className="text-sm text-green-800">
                    Amount Due: <span className="font-bold text-lg">${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'}</span>
                  </p>
                </div>

                {/* Payment Method Selection */}
                {!paymentMethod && (
                  <div className="space-y-3">
                    <p className="font-medium text-gray-700 mb-2">Select Payment Method:</p>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-8 h-8" />
                      <span className="font-medium">Pay with PayPal</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="font-medium">Pay with Card</span>
                    </button>
                  </div>
                )}

                {/* PayPal Payment */}
                {paymentMethod === 'paypal' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setPaymentMethod('')} className="text-gray-500 hover:text-gray-700">←</button>
                      <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="w-6 h-6" />
                      <span className="font-medium">PayPal Checkout</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Click the button below to complete your payment securely with PayPal.
                    </p>
                    <button
                      onClick={processRegistrationPayment}
                      disabled={processingPayment}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {processingPayment ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        `Pay $${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'} with PayPal`
                      )}
                    </button>
                  </div>
                )}

                {/* Card Payment */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <button onClick={() => setPaymentMethod('')} className="text-gray-500 hover:text-gray-700">←</button>
                      <span className="font-medium">Card Payment</span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={cardInfo.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="Card Number"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16"
                        maxLength={19}
                      />
                      {cardInfo.cardType && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500">
                          {cardInfo.cardType}
                        </span>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={cardInfo.cardName}
                      onChange={(e) => setCardInfo(prev => ({ ...prev, cardName: e.target.value }))}
                      placeholder="Name on Card"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardInfo.expiryDate}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        maxLength={5}
                      />
                      <input
                        type="text"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="CVV"
                        className="border border-gray-300 rounded-lg px-3 py-2"
                        maxLength={4}
                      />
                    </div>

                    <button
                      onClick={processRegistrationPayment}
                      disabled={processingPayment}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {processingPayment ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        `Pay $${paymentStatus?.registrationPaymentAmount?.toFixed(2) || '50.00'}`
                      )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      🔒 Your payment information is secure and encrypted
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Favorites</h3>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">❤️</div>
                <p>No favorites saved yet</p>
                <p className="text-sm mt-2">Items you favorite will appear here</p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification._id} className={`p-4 border rounded-lg ${notification.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">{formatDate(notification.createdAt)}</p>
                        </div>
                        {!notification.read && (
                          <span className="ml-4 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🔔</div>
                  <p>No notifications yet</p>
                  <p className="text-sm mt-2">You'll receive notifications for important updates</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}