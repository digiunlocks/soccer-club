import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaDollarSign, FaCheck, FaTimes, FaHandshake, FaComments, FaArrowLeft, FaShoppingCart, FaHistory, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import BuyerRatingForm from './BuyerRatingForm';

export default function OfferManagement() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [offers, setOffers] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [counterOfferRecipient, setCounterOfferRecipient] = useState(null);
  const [offerForm, setOfferForm] = useState({ amount: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showBuyerRating, setShowBuyerRating] = useState(false);
  const [ratingBuyerId, setRatingBuyerId] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchItemAndOffers();
    }
  }, [itemId, currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('👤 Current user fetched:', userData);
        setCurrentUser(userData);
        // Also update localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.error('Failed to fetch current user');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchItemAndOffers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view offers');
        navigate('/signin');
        return;
      }

      // Fetch item details
      const itemResponse = await fetch(`http://localhost:5000/api/marketplace/public/${itemId}`);
      if (itemResponse.ok) {
        const itemData = await itemResponse.json();
        setItem(itemData);
        
      console.log('📱 Loading offers page for user:', currentUser?.username || currentUser?.name);
      console.log('📦 Item details:', {
        title: itemData.title,
        simpleId: itemData.simpleId,
        sellerSimpleId: itemData.seller?.simpleId,
        sellerId: itemData.seller?._id,
        seller: itemData.seller
      });
      } else {
        toast.error('Item not found');
        navigate('/marketplace');
        return;
      }

      // Fetch pending offers
      const offersResponse = await fetch(`http://localhost:5000/api/marketplace-messages/offers/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        console.log('📊 Fetched pending offers:', offersData);
        console.log('🔍 First offer details:', offersData[0]);
        setOffers(offersData);
      } else {
        console.error('❌ Failed to fetch pending offers:', offersResponse.status);
      }

      // Fetch all offers for history
      const allOffersResponse = await fetch(`http://localhost:5000/api/marketplace-messages/offers/${itemId}/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (allOffersResponse.ok) {
        const allOffersData = await allOffersResponse.json();
        console.log('📚 Fetched all offers:', allOffersData);
        console.log('🔍 Accepted offers:', allOffersData.filter(o => o.status === 'accepted'));
        console.log('🔍 Marked as received:', allOffersData.filter(o => o.markedAsReceived));
        setAllOffers(allOffersData);
      } else {
        console.error('❌ Failed to fetch all offers:', allOffersResponse.status);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
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
        toast.success(`Offer ${action}ed successfully!`);
        fetchItemAndOffers();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${action} offer`);
      }
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
      toast.error(`Failed to ${action} offer`);
    }
  };

  const submitCounterOffer = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to make a counter offer');
      return;
    }

    if (!offerForm.amount) {
      toast.error('Please enter a counter offer amount');
      return;
    }

    console.log('📤 Sending counter offer:', {
      itemId: itemId,
      recipientId: counterOfferRecipient,
      currentUserId: currentUser?._id || currentUser?.id,
      amount: offerForm.amount,
      message: offerForm.message
    });

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/marketplace-messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: itemId,
          recipientId: String(counterOfferRecipient), // Convert to string
          messageType: 'offer',
          content: offerForm.message || 'Counter offer',
          offerAmount: parseFloat(offerForm.amount)
        })
      });

      if (response.ok) {
        toast.success('Counter offer sent successfully!');
        setShowOfferModal(false);
        setOfferForm({ amount: '', message: '' });
        setCounterOfferRecipient(null);
        fetchItemAndOffers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send counter offer');
      }
    } catch (error) {
      console.error('Error submitting counter offer:', error);
      toast.error('Failed to send counter offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  console.log('🔍 [OfferManagement] Render state:', {
    loading,
    hasItem: !!item,
    hasCurrentUser: !!currentUser,
    pendingOffersCount: offers.length,
    allOffersCount: allOffers.length
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offers...</p>
          <p className="text-xs text-gray-500 mt-2">Item ID: {itemId}</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // Check ownership using simpleId first (more reliable), then fall back to ObjectId
  const isOwner = currentUser && (
    (currentUser.simpleId && item.seller?.simpleId && currentUser.simpleId === item.seller.simpleId) ||
    currentUser._id === item.seller?._id || 
    currentUser.id === item.seller?._id || 
    currentUser._id === item.seller || 
    currentUser.id === item.seller ||
    String(currentUser._id) === String(item.seller?._id) ||
    String(currentUser.id) === String(item.seller)
  );
  
  console.log('🔐 Ownership check:', {
    currentUserId: currentUser?._id || currentUser?.id,
    currentUserSimpleId: currentUser?.simpleId,
    sellerId: item.seller?._id || item.seller,
    sellerSimpleId: item.seller?.simpleId,
    simpleIdMatch: currentUser?.simpleId && item.seller?.simpleId && currentUser.simpleId === item.seller.simpleId,
    isOwner: isOwner
  });
  
  const pendingOffers = offers.filter(o => o.status === 'pending');
  const pastOffers = allOffers.filter(o => o.status !== 'pending');
  
  // If user is not the owner, show message
  if (!currentUser || !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            Only the item owner can view and manage offers for this item.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/marketplace/item/${itemId}`)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              View Item Details
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
            >
              Back to Marketplace
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Logged in as: <strong>{currentUser?.username || currentUser?.name || 'Unknown'}</strong>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Your ID: {currentUser?.simpleId || currentUser?._id || 'Not loaded'}<br/>
            Item owner ID: {item.seller?.simpleId || item.seller?._id || item.seller}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/marketplace/item/${itemId}`)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Item Details
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              {item.images && item.images[0] && (
                <img
                  src={item.images[0].startsWith('http') ? item.images[0] : `http://localhost:5000${item.images[0]}`}
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
                <p className="text-xl font-bold text-green-600 mb-2">{formatPrice(item.price)}</p>
                <p className="text-sm text-gray-600">Listed Price</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{pendingOffers.length}</div>
                <div className="text-sm text-gray-600">Pending Offers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Offers Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaDollarSign className="text-green-600" />
                Pending Offers
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {pendingOffers.length} {pendingOffers.length === 1 ? 'offer' : 'offers'} awaiting your response
              </p>
            </div>
          </div>

          {pendingOffers.length > 0 ? (
            <div className="space-y-4">
              {pendingOffers.map((offer) => (
                <div key={offer._id} className="border-2 border-blue-200 bg-blue-50 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                        {offer.sender?.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {offer.sender?.username || 'Unknown Buyer'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(offer.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        {formatPrice(offer.offerAmount)}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                        offer.messageType === 'offer' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        {offer.messageType === 'offer' ? '💰 Initial Offer' : '🔄 Counter Offer'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Message Display */}
                  {offer.content && offer.content !== 'No message provided' && (
                    <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                        <FaComments className="w-4 h-4 text-blue-600" />
                        Buyer's Message:
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed italic">
                        "{offer.content}"
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons - Only for pending offers */}
                  {offer.status === 'pending' && (
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleOfferAction(offer._id, 'accept')}
                        className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
                      >
                        <FaCheck className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleOfferAction(offer._id, 'reject')}
                        className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
                      >
                        <FaTimes className="w-5 h-5" />
                        Decline
                      </button>
                      <button
                        onClick={() => {
                          const buyerId = offer.sender?._id || offer.sender?.id || offer.sender;
                          console.log('🔄 Setting up counter offer:', {
                            offerSender: offer.sender,
                            buyerId: buyerId,
                            buyerName: offer.sender?.username,
                            offerAmount: offer.offerAmount
                          });
                          setCounterOfferRecipient(buyerId);
                          setOfferForm({
                            amount: offer.offerAmount,
                            message: ''
                          });
                          setShowOfferModal(true);
                        }}
                        className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
                      >
                        <FaHandshake className="w-5 h-5" />
                        Counter
                      </button>
                    </div>
                  )}
                  
                  {/* Accepted Offer - Waiting for buyer confirmation */}
                  {offer.status === 'accepted' && !offer.markedAsReceived && (
                    <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                      <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                        <FaCheck className="w-4 h-4" />
                        Offer Accepted! Waiting for buyer to confirm receipt.
                      </p>
                    </div>
                  )}
                  
                  {/* Debug Info */}
                  <div className="mt-2 p-2 bg-gray-100 text-xs text-gray-600 rounded">
                    Debug: Status={offer.status}, Received={offer.markedAsReceived ? 'Yes' : 'No'}, SellerRated={offer.sellerRated ? 'Yes' : 'No'}
                  </div>
                  
                  {/* Transaction Complete - Show Rating Option */}
                  {offer.status === 'accepted' && offer.markedAsReceived && (
                    <div className="mt-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                      <p className="text-sm text-blue-800 mb-3 font-medium flex items-center gap-2">
                        🎉 Transaction Complete! {offer.sender?.username} received the item.
                      </p>
                      <div className="flex gap-2">
                        {!offer.sellerRated ? (
                          <button
                            onClick={() => {
                              console.log('🎯 Opening rating modal for buyer:', offer.sender);
                              setRatingBuyerId(offer.sender?._id || offer.sender);
                              setShowBuyerRating(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center gap-2"
                          >
                            <FaStar className="w-4 h-4" />
                            ⭐ Rate {offer.sender?.username || 'Buyer'}
                          </button>
                        ) : (
                          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <FaCheck className="w-4 h-4" />
                            ✓ You rated the buyer
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <FaDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">No Pending Offers</p>
              <p className="text-sm text-gray-600 mt-2">New offers will appear here when buyers make them</p>
            </div>
          )}
        </div>

        {/* Offer History */}
        {pastOffers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 p-3 rounded-lg transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaHistory className="text-gray-600" />
                Offer History ({pastOffers.length})
              </h3>
              <span className="text-blue-600 font-medium">
                {showHistory ? '▲ Hide' : '▼ Show'}
              </span>
            </button>
            
            {showHistory && (
              <div className="space-y-3">
                {pastOffers.map((offer) => (
                  <div key={offer._id} className={`border-l-4 rounded-lg p-4 ${
                    offer.status === 'accepted' ? 'bg-green-50 border-green-500' :
                    offer.status === 'rejected' ? 'bg-red-50 border-red-500' :
                    'bg-gray-50 border-gray-400'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {offer.sender?.username || 'Unknown'} • {formatPrice(offer.offerAmount)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {offer.status === 'accepted' && (
                          <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                            ✓ Accepted
                          </span>
                        )}
                        {offer.status === 'rejected' && (
                          <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                            ✗ Declined
                          </span>
                        )}
                        {offer.status === 'withdrawn' && (
                          <span className="bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                            ⤶ Withdrawn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Make Counter Offer</h3>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setCounterOfferRecipient(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Counter Offer:</strong> You are responding to a buyer's offer with your counter proposal.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Counter Offer Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={offerForm.amount}
                  onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                  placeholder="Enter your counter offer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={offerForm.message}
                  onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Explain your counter offer..."
                  maxLength="1000"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setCounterOfferRecipient(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitCounterOffer}
                disabled={isSubmitting || !offerForm.amount}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Sending...' : 'Send Counter Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Rating Modal */}
      {showBuyerRating && ratingBuyerId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <BuyerRatingForm
              buyerId={ratingBuyerId}
              itemId={itemId}
              onClose={() => {
                setShowBuyerRating(false);
                setRatingBuyerId(null);
                fetchItemAndOffers();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

