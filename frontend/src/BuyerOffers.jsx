import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaDollarSign, FaCheck, FaTimes, FaHandshake, FaComments, FaArrowLeft, FaShoppingCart, FaHistory, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function BuyerOffers() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerForm, setOfferForm] = useState({ amount: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
        console.log('👤 [BuyerOffers] Current user fetched:', userData);
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
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
        console.log('📱 [BuyerOffers] Loading offers for item:', itemData.title);
      } else {
        toast.error('Item not found');
        navigate('/marketplace');
        return;
      }

      // Fetch all offers for this item
      const allOffersResponse = await fetch(`http://localhost:5000/api/marketplace-messages/offers/${itemId}/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (allOffersResponse.ok) {
        const allOffersData = await allOffersResponse.json();
        console.log('📚 [BuyerOffers] Fetched all offers:', allOffersData);
        setAllOffers(allOffersData);
        
        // Debug current user
        console.log('👤 [BuyerOffers] Current user for filtering:', {
          currentUserId: currentUser._id || currentUser.id,
          currentUserName: currentUser.username || currentUser.name
        });
        
        // Filter to show only offers from current user (buyer)
        const myOffersData = allOffersData.filter(offer => {
          const offerSenderId = offer.sender?._id || offer.sender?.id || offer.sender;
          const myId = currentUser._id || currentUser.id;
          const isMatch = String(offerSenderId) === String(myId);
          
          console.log('🔍 [BuyerOffers] Offer filter check:', {
            offerId: offer._id,
            offerSenderId: offerSenderId,
            myId: myId,
            isMatch: isMatch,
            offerSender: offer.sender
          });
          
          return isMatch;
        });
        
        console.log('💰 [BuyerOffers] My offers after filtering:', myOffersData);
        setMyOffers(myOffersData);
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

    // Find the offer to check if it's a counter offer from seller
    const offer = allOffers.find(o => o._id === messageId);
    if (!offer) {
      toast.error('Offer not found');
      return;
    }

    // Only allow actions on counter offers received from seller
    const isCounterOfferFromSeller = offer.recipient?._id === currentUser._id && 
                                   offer.messageType === 'offer' && 
                                   offer.status === 'pending';

    if (!isCounterOfferFromSeller) {
      toast.error('You can only accept/reject counter offers from the seller');
      return;
    }

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
        toast.success(`Counter offer ${action}ed successfully!`);
        fetchItemAndOffers();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${action} counter offer`);
      }
    } catch (error) {
      console.error(`Error ${action}ing counter offer:`, error);
      toast.error(`Failed to ${action} counter offer`);
    }
  };

  const submitNewOffer = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to make an offer');
      return;
    }

    if (!offerForm.amount) {
      toast.error('Please enter an offer amount');
      return;
    }

    console.log('📤 [BuyerOffers] Sending new offer:', {
      itemId: itemId,
      recipientId: item.seller?._id || item.seller,
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
          recipientId: String(item.seller?._id || item.seller),
          messageType: 'offer',
          content: offerForm.message || 'New offer',
          offerAmount: parseFloat(offerForm.amount)
        })
      });

      if (response.ok) {
        toast.success('Offer sent successfully!');
        setShowOfferModal(false);
        setOfferForm({ amount: '', message: '' });
        fetchItemAndOffers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send offer');
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast.error('Failed to send offer');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your offers...</p>
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

  const pendingOffers = myOffers.filter(o => o.status === 'pending');
  const pastOffers = myOffers.filter(o => o.status !== 'pending');
  
  // Find counter offers received from seller
  const counterOffersReceived = allOffers.filter(offer => {
    const offerRecipientId = offer.recipient?._id || offer.recipient?.id || offer.recipient;
    const myId = currentUser._id || currentUser.id;
    const isForMe = String(offerRecipientId) === String(myId);
    const isOffer = offer.messageType === 'offer';
    const isPending = offer.status === 'pending';
    
    console.log('🔄 [BuyerOffers] Counter offer check:', {
      offerId: offer._id,
      offerRecipientId: offerRecipientId,
      myId: myId,
      isForMe: isForMe,
      isOffer: isOffer,
      isPending: isPending,
      offerRecipient: offer.recipient
    });
    
    return isForMe && isOffer && isPending;
  });
  
  console.log('🔄 [BuyerOffers] Counter offers received:', counterOffersReceived);

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
                <p className="text-sm text-gray-500 mt-1">Seller: {item.seller?.username || item.seller?.name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{pendingOffers.length}</div>
                <div className="text-sm text-gray-600">Your Pending Offers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Counter Offers Received from Seller */}
        {counterOffersReceived.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FaHandshake className="text-purple-600" />
                  Counter Offers from Seller
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {counterOffersReceived.length} counter offer{counterOffersReceived.length > 1 ? 's' : ''} awaiting your response
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {counterOffersReceived.map((offer) => (
                <div key={offer._id} className="border-2 border-purple-200 bg-purple-50 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                        {item.seller?.username?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {item.seller?.username || 'Seller'} (Counter Offer)
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
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 bg-purple-100 text-purple-800 border border-purple-300">
                        🔄 Counter Offer from Seller
                      </span>
                    </div>
                  </div>
                  
                  {/* Message Display */}
                  {offer.content && offer.content !== 'No message provided' && (
                    <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-purple-500 shadow-sm">
                      <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                        <FaComments className="w-4 h-4 text-purple-600" />
                        Seller's Message:
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed italic">
                        "{offer.content}"
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons - Only for counter offers from seller */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleOfferAction(offer._id, 'accept')}
                      className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
                    >
                      <FaCheck className="w-5 h-5" />
                      Accept Counter
                    </button>
                    <button
                      onClick={() => handleOfferAction(offer._id, 'reject')}
                      className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
                    >
                      <FaTimes className="w-5 h-5" />
                      Decline Counter
                    </button>
                    <button
                      onClick={() => {
                        setOfferForm({
                          amount: offer.offerAmount,
                          message: ''
                        });
                        setShowOfferModal(true);
                      }}
                      className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
                    >
                      <FaHandshake className="w-5 h-5" />
                      Counter Back
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Offers Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaDollarSign className="text-green-600" />
                Your Offers
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {pendingOffers.length} pending • {myOffers.length} total
              </p>
            </div>
            <button
              onClick={() => setShowOfferModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FaDollarSign className="w-5 h-5" />
              Make New Offer
            </button>
          </div>

          {pendingOffers.length > 0 ? (
            <div className="space-y-4">
              {pendingOffers.map((offer) => (
                <div key={offer._id} className="border-2 border-blue-200 bg-blue-50 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                        {currentUser?.username?.charAt(0).toUpperCase() || 'Y'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          Your Offer
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
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 bg-green-100 text-green-800 border border-green-300">
                        💰 Your Offer
                      </span>
                    </div>
                  </div>
                  
                  {/* Message Display */}
                  {offer.content && offer.content !== 'No message provided' && (
                    <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-500 shadow-sm">
                      <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-2">
                        <FaComments className="w-4 h-4 text-blue-600" />
                        Your Message:
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed italic">
                        "{offer.content}"
                      </p>
                    </div>
                  )}
                  
                  {/* Status */}
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="font-medium">Awaiting seller's response</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <FaDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">No Pending Offers</p>
              <p className="text-sm text-gray-600 mt-2">Make an offer to start negotiating</p>
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
                          Your offer • {formatPrice(offer.offerAmount)}
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

      {/* New Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Make an Offer</h3>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={item.price}
                  value={offerForm.amount}
                  onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                  placeholder={`Max: ${formatPrice(item.price)}`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Listed price: {formatPrice(item.price)}
                </p>
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
                  placeholder="Add a message with your offer..."
                  maxLength="1000"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOfferModal(false);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitNewOffer}
                disabled={isSubmitting || !offerForm.amount}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Sending...' : 'Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
