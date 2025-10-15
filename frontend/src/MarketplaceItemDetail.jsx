import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaUser, FaArrowLeft, FaDollarSign, FaHandshake, FaTimes, FaCheck, FaComments, FaHistory, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
// import SellerRatingFormNew from './SellerRatingFormNew';
// import SellerReviewsNew from './SellerReviewsNew';

// Inline components to avoid import issues
const SellerRatingFormNew = ({ sellerId, itemId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sellerId: sellerId,
          itemId: itemId,
          rating: rating,
          review: review
        })
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate & Review Seller</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-3xl focus:outline-none"
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">{rating} out of 5 stars</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="4"
            placeholder="Share your experience with this seller..."
            maxLength="500"
          />
          <p className="text-xs text-gray-500 mt-1">{review.length}/500 characters</p>
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

const SellerReviewsNew = ({ sellerId, itemId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/seller-ratings/seller/${sellerId}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data.ratings || []);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (sellerId) fetchReviews();
  }, [sellerId]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Reviews</h3>
      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < review.rating ? '⭐' : '☆'}</span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">by {review.reviewer?.username || review.buyer?.username || 'Anonymous'}</span>
              </div>
              {(review.comment || review.review) && (
                <p className="text-sm text-gray-700 italic bg-gray-50 p-2 rounded mt-2">
                  "{review.comment || review.review}"
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No reviews yet</p>
      )}
    </div>
  );
};

export default function MarketplaceItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const rateParam = searchParams.get('rate'); // 'seller' or 'buyer'
  const buyerId = searchParams.get('buyerId');
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(!!rateParam);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userInteractions, setUserInteractions] = useState({
    hasMessaged: false,
    hasPurchased: false,
    canReview: false
  });
  const [offers, setOffers] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [showOfferHistory, setShowOfferHistory] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({
    amount: '',
    message: ''
  });
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [counterOfferRecipient, setCounterOfferRecipient] = useState(null);
  const [isCounterOffer, setIsCounterOffer] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagForm, setFlagForm] = useState({
    reason: '',
    description: ''
  });
  const [isSubmittingFlag, setIsSubmittingFlag] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (item && currentUser) {
      console.log('🔄 [ItemDetail] Item and currentUser loaded, fetching offers...');
      checkUserInteractions();
      fetchOffers();
    } else {
      console.log('⏳ [ItemDetail] Waiting for item and currentUser:', {
        hasItem: !!item,
        hasCurrentUser: !!currentUser
      });
    }
  }, [item, currentUser]);

  useEffect(() => {
    if (item && item.seller) {
      fetchConversation();
    }
  }, [item]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('👤 [ItemDetail] Current user fetched:', userData);
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchItem = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/marketplace/public/${id}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      } else {
        alert('Item not found');
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      alert('Failed to load item');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const checkUserInteractions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      
      // Don't proceed if userId is undefined or item/seller is not loaded yet
      if (!userId || !item?.seller?._id) return;
      
      // Check if user has messaged this seller
      const messagesResponse = await fetch(`http://localhost:5000/api/messages/conversation/${userId}/${item.seller._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if user has purchased from this seller (check transactions)
      const transactionsResponse = await fetch(`http://localhost:5000/api/transactions/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const hasMessaged = messagesResponse.ok;
      const hasPurchased = transactionsResponse.ok && (await transactionsResponse.json()).some(
        transaction => transaction.sellerId === item?.seller?._id
      );

      setUserInteractions({
        hasMessaged,
        hasPurchased,
        canReview: hasMessaged || hasPurchased
      });
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };

  const fetchOffers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch active (pending) offers
      const response = await fetch(`http://localhost:5000/api/marketplace-messages/offers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Fetched active offers:', data);
        setOffers(data);
      } else {
        console.error('❌ Failed to fetch offers:', response.status);
      }

      // Fetch all offers (including accepted/rejected) for history
      const allResponse = await fetch(`http://localhost:5000/api/marketplace-messages/offers/${id}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (allResponse.ok) {
        const allData = await allResponse.json();
        console.log('📚 Fetched all offers:', allData);
        setAllOffers(allData);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchConversation = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;
      
      if (!userId || !item?.seller?._id) return;

      const response = await fetch(`http://localhost:5000/api/marketplace-messages/conversation/${id}/${item.seller._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const submitOffer = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to make an offer');
      return;
    }

    if (!offerForm.amount) {
      alert('Please enter an offer amount');
      return;
    }

    setIsSubmittingOffer(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Determine recipient - for counter offers, send to the original buyer
      const recipientId = isCounterOffer && counterOfferRecipient 
        ? counterOfferRecipient 
        : item.seller._id;
      
      const response = await fetch('http://localhost:5000/api/marketplace-messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: id,
          recipientId: recipientId,
          messageType: 'offer',
          content: offerForm.message,
          offerAmount: parseFloat(offerForm.amount)
        })
      });

      if (response.ok) {
        alert(isCounterOffer ? 'Counter offer sent successfully!' : 'Offer sent successfully!');
        setShowOfferModal(false);
        setOfferForm({ amount: '', message: '' });
        setIsCounterOffer(false);
        setCounterOfferRecipient(null);
        fetchOffers();
        fetchConversation();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send offer');
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('Failed to send offer');
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handleOfferAction = async (messageId, action) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/marketplace-messages/${action}/${messageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: action === 'reject' ? JSON.stringify({ reason: 'No reason provided' }) : undefined
      });

      if (response.ok) {
        alert(`Offer ${action}ed successfully!`);
        fetchOffers();
        fetchConversation();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} offer`);
      }
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
      alert(`Failed to ${action} offer`);
    }
  };

  const submitFlag = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to flag an item');
      return;
    }

    if (!flagForm.reason) {
      alert('Please select a reason for flagging');
      return;
    }

    setIsSubmittingFlag(true);
    try {
      const response = await fetch('http://localhost:5000/api/marketplace/flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: id,
          reason: flagForm.reason,
          description: flagForm.description
        })
      });

      if (response.ok) {
        alert('Item flagged successfully. Thank you for your report.');
        setShowFlagModal(false);
        setFlagForm({ reason: '', description: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to flag item');
      }
    } catch (error) {
      console.error('Error flagging item:', error);
      alert('Failed to flag item');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like-new': 'bg-blue-100 text-blue-800',
      'excellent': 'bg-emerald-100 text-emerald-800',
      'good': 'bg-yellow-100 text-yellow-800',
      'fair': 'bg-orange-100 text-orange-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Link to="/marketplace" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
              <img
                src={item.images && item.images[currentImageIndex] ? 
                  (item.images[currentImageIndex].startsWith('http') ? 
                    item.images[currentImageIndex] : 
                    `http://localhost:5000${item.images[currentImageIndex]}`) : 
                  '/placeholder-item.jpg'}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-item.jpg';
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-green-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-item.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                <div className="flex items-center gap-2">
                  {/* Seller Rating */}
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (item.seller?.rating || 0) 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.seller?.rating || 0}/5
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-3xl font-bold text-green-600 mb-4">{formatPrice(item.price)}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                  {item.condition}
                </span>
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="w-4 h-4" />
                  <span>Listed {formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                <button 
                  onClick={() => navigate(`/marketplace?category=${encodeURIComponent(item.category)}`)}
                  className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Category: {item.category}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
                <button
                  onClick={() => setShowFlagModal(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Flag Item
                </button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaUser className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.seller?.name || item.seller?.username || 'Unknown Seller'}</p>
                  <p className="text-sm text-gray-600">Member since {item.seller?.createdAt ? formatDate(item.seller.createdAt) : 'Unknown'}</p>
                </div>
              </div>
              
              {/* Only show contact seller button if user is not the seller */}
              {(() => {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                
                // Don't show contact seller button if user is not logged in or is the seller
                if (!token || user._id === item.seller?._id) {
                  return null;
                }
                
                return (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button 
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        onClick={() => setShowOfferModal(true)}
                      >
                        <FaDollarSign className="w-4 h-4" />
                        Make Offer
                      </button>
                      <button 
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        onClick={() => {
                          navigate(`/messages?contact=${item.seller?._id}&item=${item._id}&type=marketplace_inquiry`);
                        }}
                      >
                        <FaComments className="w-4 h-4" />
                        Contact Seller
                      </button>
                    </div>
                    {conversation.length > 0 && (
                      <button 
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        onClick={() => navigate(`/marketplace/conversation/${item._id}/${item.seller._id}`)}
                      >
                        <FaHistory className="w-4 h-4" />
                        View Conversation ({conversation.length} messages)
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>


            {/* Seller Offer Management - More Robust */}
            {(() => {
              const token = localStorage.getItem('token');
              
              if (!token || !currentUser) {
                console.log('❌ No token or currentUser not loaded yet');
                return null;
              }
              
              // Check ownership using simpleId first (more reliable), then ObjectId
              const isOwner = currentUser && (
                (currentUser.simpleId && item.seller?.simpleId && currentUser.simpleId === item.seller.simpleId) ||
                currentUser._id === item.seller?._id || 
                currentUser.id === item.seller?._id || 
                currentUser._id === item.seller || 
                currentUser.id === item.seller ||
                String(currentUser._id) === String(item.seller?._id) ||
                String(currentUser.id) === String(item.seller)
              );
              
              // Debug logging
              console.log('🔍 [ItemDetail] Offer section check:', {
                hasToken: !!token,
                currentUserSimpleId: currentUser.simpleId,
                currentUserId: currentUser._id || currentUser.id,
                currentUserName: currentUser.username || currentUser.name,
                sellerSimpleId: item.seller?.simpleId,
                sellerId: item.seller?._id || item.seller,
                sellerName: item.seller?.username || item.seller?.name,
                simpleIdMatch: currentUser.simpleId && item.seller?.simpleId && currentUser.simpleId === item.seller.simpleId,
                isOwner: isOwner,
                offersCount: offers.length,
                allOffersCount: allOffers.length
              });
              
              if (!isOwner) {
                console.log('❌ Not showing offers section - user is not the owner');
                return null;
              }
              
              console.log('✅ Showing offers section to seller');

              const pendingOffers = offers.filter(o => o.status === 'pending');
              const pastOffers = allOffers.filter(o => o.status !== 'pending');
              const totalOffers = allOffers.length;
              
              // Quick preview with link to dedicated page
              
              return (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaDollarSign className="text-green-600 w-6 h-6" />
                        Your Offers
                      </h3>
                      <p className="text-sm text-gray-700 mt-1 font-medium">
                        {pendingOffers.length} pending • {totalOffers} total
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/marketplace/item/${item._id}/offers`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <FaDollarSign className="w-5 h-5" />
                      Manage All Offers →
                    </button>
                  </div>

                  {/* Quick Preview of Pending Offers */}
                  {pendingOffers.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded">{pendingOffers.length}</span>
                        Recent Pending Offers (Preview)
                      </h4>
                      {pendingOffers.slice(0, 2).map((offer) => (
                        <div key={offer._id} className="border border-blue-200 bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {offer.sender?.username?.charAt(0).toUpperCase() || '?'}
                              </span>
                              <div>
                                <p className="font-bold text-gray-900">{offer.sender?.username || 'Unknown'}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(offer.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-green-600">
                                ${offer.offerAmount}
                              </p>
                            </div>
                          </div>
                          
                          {/* Show snippet of message if exists */}
                          {offer.content && offer.content !== 'No message provided' && (
                            <div className="mt-2 text-sm text-gray-600 italic truncate">
                              💬 "{offer.content.substring(0, 60)}{offer.content.length > 60 ? '...' : ''}"
                            </div>
                          )}
                        </div>
                      ))}
                      {pendingOffers.length > 2 && (
                        <div className="text-center mt-3 pb-2">
                          <button
                            onClick={() => navigate(`/marketplace/item/${item._id}/offers`)}
                            className="text-blue-600 hover:text-blue-700 font-bold text-sm"
                          >
                            + View {pendingOffers.length - 2} more pending offer{pendingOffers.length - 2 > 1 ? 's' : ''}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                      <FaDollarSign className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium text-sm">No pending offers</p>
                      <p className="text-xs text-gray-500 mt-1">New offers will appear here</p>
                    </div>
                  )}

                  {/* Removed offer history from preview - user should go to dedicated page */}
                  {pastOffers.length > 0 && false && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                        Offer History
                      </h4>
                      <div className="space-y-3">
                        {pastOffers.map((offer) => (
                          <div key={offer._id} className={`border rounded-lg p-3 ${
                            offer.status === 'accepted' ? 'bg-green-50 border-green-200' :
                            offer.status === 'rejected' ? 'bg-red-50 border-red-200' :
                            'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">
                                  {offer.sender?.username || 'Unknown'} • ${offer.offerAmount}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {new Date(offer.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {offer.status === 'accepted' && (
                                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    ✓ Accepted
                                  </span>
                                )}
                                {offer.status === 'rejected' && (
                                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    ✗ Declined
                                  </span>
                                )}
                                {offer.status === 'withdrawn' && (
                                  <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    ⤶ Withdrawn
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Rating and Reviews Section */}
        <div className="mt-8 space-y-6">
          {/* Show rating form if rate parameter exists */}
          {showRatingForm && rateParam === 'seller' && localStorage.getItem('token') && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-green-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">⭐ Rate the Seller</h3>
                <button
                  onClick={() => {
                    setShowRatingForm(false);
                    navigate(`/marketplace/item/${id}`);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Rate your experience with {item.seller?.username || item.seller?.name}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Your feedback helps build trust in the marketplace community.
                </p>
              </div>
              <SellerRatingFormNew 
                sellerId={item.seller?._id} 
                itemId={item._id}
                onReviewSubmitted={() => {
                  toast.success('Thank you for your review!');
                  setShowRatingForm(false);
                  navigate(`/marketplace/my-offers`);
                }}
              />
            </div>
          )}
          
          {/* Seller Reviews */}
          <SellerReviewsNew sellerId={item.seller?._id} itemId={item._id} />
          
          {/* Rating Form - Only show if user can review (has interacted with seller) */}
          {!showRatingForm && localStorage.getItem('token') && 
           item.seller?._id !== JSON.parse(localStorage.getItem('user') || '{}')._id && 
           userInteractions.canReview && (
            <SellerRatingFormNew 
              sellerId={item.seller?._id} 
              itemId={item._id}
              onReviewSubmitted={() => {
                // Refresh the reviews when a new review is submitted
                window.location.reload();
              }}
            />
          )}

          {/* Show message if user hasn't interacted with seller yet */}
          {localStorage.getItem('token') && 
           item.seller?._id !== JSON.parse(localStorage.getItem('user') || '{}')._id && 
           !userInteractions.canReview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Rate & Review This Seller</h4>
              <p className="text-sm text-blue-700 mb-3">
                To rate and review this seller, you need to first interact with them by:
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside mb-3">
                <li>Contacting the seller about this item</li>
                <li>Making a purchase from this seller</li>
              </ul>
              <p className="text-xs text-blue-600">
                Once you've interacted with the seller, you'll be able to leave a review and rating.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isCounterOffer ? 'Make Counter Offer' : 'Make an Offer'}
              </h3>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setIsCounterOffer(false);
                  setCounterOfferRecipient(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            {isCounterOffer && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Counter Offer:</strong> You are responding to a buyer's offer with your counter proposal.
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isCounterOffer ? 'Counter Offer Amount ($)' : 'Offer Amount ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={item.price}
                  value={offerForm.amount}
                  onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={`Original price: $${item.price}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original price: ${item.price}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message {!isCounterOffer && '(Optional)'}
                </label>
                <textarea
                  value={offerForm.message}
                  onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder={isCounterOffer 
                    ? "Explain your counter offer (optional)..." 
                    : "Add a message with your offer (optional)..."}
                  maxLength="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {offerForm.message.length}/1000 characters
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setIsCounterOffer(false);
                  setCounterOfferRecipient(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitOffer}
                disabled={isSubmittingOffer || !offerForm.amount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingOffer 
                  ? 'Sending...' 
                  : isCounterOffer 
                    ? 'Send Counter Offer' 
                    : 'Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Flag Item</h3>
              <button
                onClick={() => setShowFlagModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for flagging *
                </label>
                <select
                  value={flagForm.reason}
                  onChange={(e) => setFlagForm({ ...flagForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="spam_fake">Spam or Fake Item</option>
                  <option value="misleading_description">Misleading Description</option>
                  <option value="overpriced">Overpriced</option>
                  <option value="prohibited_item">Prohibited Item</option>
                  <option value="duplicate_listing">Duplicate Listing</option>
                  <option value="harassment">Harassment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={flagForm.description}
                  onChange={(e) => setFlagForm({ ...flagForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Please provide additional details about why you're flagging this item..."
                  maxLength="500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {flagForm.description.length}/500 characters
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFlagModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitFlag}
                disabled={isSubmittingFlag || !flagForm.reason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingFlag ? 'Submitting...' : 'Submit Flag'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
