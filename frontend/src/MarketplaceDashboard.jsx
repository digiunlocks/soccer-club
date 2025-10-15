import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDollarSign, FaShoppingBag, FaStar, FaComments, FaEye, FaCheck, FaTimes, FaBox, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function MarketplaceDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'my-offers');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // My Offers
  const [myOffers, setMyOffers] = useState([]);
  
  // Bought Items (accepted offers)
  const [boughtItems, setBoughtItems] = useState([]);
  
  // My Reviews (reviews I wrote)
  const [myReviews, setMyReviews] = useState([]);
  
  // Reviews Received (as a seller)
  const [reviewsReceived, setReviewsReceived] = useState([]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser, activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view your marketplace dashboard');
        navigate('/signin');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (activeTab === 'my-offers') {
        // Fetch my offers
        const response = await fetch('http://localhost:5000/api/marketplace-messages/my-offers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMyOffers(data);
        }
      } else if (activeTab === 'bought-items') {
        // Fetch bought items (accepted offers where I'm the buyer)
        const response = await fetch('http://localhost:5000/api/marketplace-messages/my-purchases', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBoughtItems(data);
        }
      } else if (activeTab === 'my-reviews') {
        // Fetch reviews I wrote
        const response = await fetch('http://localhost:5000/api/seller-ratings/my-reviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMyReviews(data.ratings || []);
        }
      } else if (activeTab === 'reviews') {
        // Fetch BOTH seller reviews AND buyer reviews
        const userId = currentUser._id || currentUser.id;
        console.log('📊 [Dashboard] Fetching all reviews for user:', userId);
        
        // Fetch seller reviews (reviews I received as a seller)
        const sellerResponse = await fetch(`http://localhost:5000/api/seller-ratings/seller/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch buyer reviews (reviews I received as a buyer)  
        const buyerResponse = await fetch(`http://localhost:5000/api/buyer-ratings/buyer/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let allReviews = [];
        
        if (sellerResponse.ok) {
          const sellerData = await sellerResponse.json();
          console.log('✅ [Dashboard] Seller reviews:', sellerData);
          const sellerReviewsWithType = (sellerData.ratings || []).map(r => ({ ...r, reviewType: 'seller' }));
          allReviews = [...allReviews, ...sellerReviewsWithType];
        }
        
        if (buyerResponse.ok) {
          const buyerData = await buyerResponse.json();
          console.log('✅ [Dashboard] Buyer reviews:', buyerData);
          const buyerReviewsWithType = (buyerData.ratings || []).map(r => ({ ...r, reviewType: 'buyer' }));
          allReviews = [...allReviews, ...buyerReviewsWithType];
        }
        
        console.log('📊 [Dashboard] Total reviews:', allReviews.length);
        setReviewsReceived(allReviews);
        toast.success(`Loaded ${allReviews.length} total reviews`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReceived = async (messageId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/marketplace-messages/mark-received/${messageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Item marked as received! You can now rate the seller.');
        fetchAllData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to mark as received');
      }
    } catch (error) {
      console.error('Error marking as received:', error);
      toast.error('Failed to mark as received');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return badges[status] || badges.pending;
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your marketplace dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/marketplace')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <FaBox className="text-green-600" />
                  My Marketplace
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your offers, purchases, and reviews
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">{currentUser?.username || currentUser?.name}</p>
                <p className="text-sm text-gray-600">
                  {myOffers.length} offers • {boughtItems.length} purchases
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="grid grid-cols-4 gap-0">
            <button
              onClick={() => setActiveTab('my-offers')}
              className={`py-4 px-6 text-sm font-semibold transition-colors border-b-4 ${
                activeTab === 'my-offers'
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-transparent hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaDollarSign className="w-5 h-5" />
                <span>My Offers</span>
              </div>
              <div className="text-xs mt-1">{myOffers.length}</div>
            </button>
            
            <button
              onClick={() => setActiveTab('bought-items')}
              className={`py-4 px-6 text-sm font-semibold transition-colors border-b-4 ${
                activeTab === 'bought-items'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-transparent hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaShoppingBag className="w-5 h-5" />
                <span>Bought Items</span>
              </div>
              <div className="text-xs mt-1">{boughtItems.length}</div>
            </button>
            
            <button
              onClick={() => setActiveTab('my-reviews')}
              className={`py-4 px-6 text-sm font-semibold transition-colors border-b-4 ${
                activeTab === 'my-reviews'
                  ? 'border-purple-600 bg-purple-50 text-purple-700'
                  : 'border-transparent hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaComments className="w-5 h-5" />
                <span>My Reviews</span>
              </div>
              <div className="text-xs mt-1">{myReviews.length}</div>
            </button>
            
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-sm font-semibold transition-colors border-b-4 ${
                activeTab === 'reviews'
                  ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                  : 'border-transparent hover:bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaStar className="w-5 h-5" />
                <span>Reviews Received</span>
              </div>
              <div className="text-xs mt-1">{reviewsReceived.length}</div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {/* My Offers Tab */}
              {activeTab === 'my-offers' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">My Offers</h2>
                  {myOffers.length > 0 ? (
                    <div className="space-y-4">
                      {myOffers.map((offer) => (
                        <div key={offer._id} className={`border rounded-lg p-4 ${getStatusBadge(offer.status)}`}>
                          <div className="flex items-start gap-4">
                            {offer.item?.images && offer.item.images[0] && (
                              <img
                                src={offer.item.images[0].startsWith('http') 
                                  ? offer.item.images[0] 
                                  : `http://localhost:5000${offer.item.images[0]}`}
                                alt={offer.item.title}
                                className="w-20 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">{offer.item?.title}</h3>
                              <p className="text-sm text-gray-600">Seller: {offer.recipient?.username}</p>
                              <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(offer.offerAmount)}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(offer.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(offer.status)}`}>
                                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions for accepted offers */}
                          {offer.status === 'accepted' && !offer.markedAsReceived && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => markAsReceived(offer._id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                              >
                                ✓ Mark as Received
                              </button>
                            </div>
                          )}
                          
                          {offer.status === 'accepted' && offer.markedAsReceived && !offer.buyerRated && (
                            <div className="mt-3">
                              <Link
                                to={`/marketplace/item/${offer.item?._id}?rate=seller`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold inline-block"
                              >
                                ⭐ Rate Seller
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No offers made yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bought Items Tab */}
              {activeTab === 'bought-items' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Bought Items</h2>
                  {boughtItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {boughtItems.map((offer) => (
                        <div key={offer._id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <div className="flex gap-4">
                            {offer.item?.images && offer.item.images[0] && (
                              <img
                                src={offer.item.images[0].startsWith('http') 
                                  ? offer.item.images[0] 
                                  : `http://localhost:5000${offer.item.images[0]}`}
                                alt={offer.item.title}
                                className="w-24 h-24 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900">{offer.item?.title}</h3>
                              <p className="text-sm text-gray-600">Seller: {offer.recipient?.username}</p>
                              <p className="text-lg font-bold text-green-600">{formatPrice(offer.offerAmount)}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Purchased: {new Date(offer.updatedAt).toLocaleDateString()}
                              </p>
                              
                              {/* Status */}
                              {offer.markedAsReceived ? (
                                <span className="inline-block mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                                  ✓ Received
                                </span>
                              ) : (
                                <button
                                  onClick={() => markAsReceived(offer._id)}
                                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                >
                                  Mark as Received
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Rate seller button */}
                          {offer.markedAsReceived && !offer.buyerRated && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <Link
                                to={`/marketplace/item/${offer.item?._id}?rate=seller`}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold inline-block text-center"
                              >
                                ⭐ Rate Seller
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No purchases yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* My Reviews Tab */}
              {activeTab === 'my-reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews I Wrote</h2>
                  {myReviews.length > 0 ? (
                    <div className="space-y-4">
                      {myReviews.map((review) => (
                        <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-xl">
                                      {i < review.rating ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {review.rating}/5
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                For: <strong>{review.marketplaceItem?.title}</strong>
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                Seller: <strong>{review.seller?.username || review.seller?.name}</strong>
                              </p>
                              {review.comment && (
                                <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Link
                              to={`/marketplace/item/${review.marketplaceItem?._id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              View Item →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaComments className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No reviews written yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Received Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews I Received</h2>
                  {reviewsReceived.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsReceived.map((review) => (
                        <div key={review._id} className={`border rounded-lg p-4 ${
                          review.reviewType === 'buyer' ? 'border-purple-200 bg-purple-50' : 'border-yellow-200 bg-yellow-50'
                        }`}>
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-xl">
                                      {i < review.rating ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {review.rating}/5
                                </span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                                  review.reviewType === 'buyer' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-yellow-600 text-white'
                                }`}>
                                  {review.reviewType === 'buyer' ? 'As Buyer' : 'As Seller'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                For: <strong>{review.marketplaceItem?.title}</strong>
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                From: <strong>{review.reviewType === 'buyer' 
                                  ? (review.seller?.username || review.seller?.name) 
                                  : (review.reviewer?.username || review.reviewer?.name)
                                } ({review.reviewType === 'buyer' ? 'Seller' : 'Buyer'})</strong>
                              </p>
                              {review.comment && (
                                <p className="text-sm text-gray-700 italic bg-white p-3 rounded mt-2">
                                  "{review.comment}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Link
                              to={`/marketplace/item/${review.marketplaceItem?._id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              View Item →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No reviews received yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Reviews will appear here after you sell items and buyers rate you
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

