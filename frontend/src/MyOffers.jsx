import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaDollarSign, FaCheck, FaTimes, FaHandshake, FaComments, FaArrowLeft, FaShoppingCart, FaHistory, FaEye, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function MyOffers() {
  const navigate = useNavigate();
  
  const [allMyOffers, setAllMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected
  const [groupedOffers, setGroupedOffers] = useState({});

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAllMyOffers();
    }
  }, [currentUser]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('👤 [MyOffers] Current user fetched:', userData);
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchAllMyOffers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view your offers');
        navigate('/signin');
        return;
      }

      // Fetch all marketplace messages where current user is the sender
      const response = await fetch('http://localhost:5000/api/marketplace-messages/my-offers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const offersData = await response.json();
        console.log('💰 [MyOffers] All my offers:', offersData);
        setAllMyOffers(offersData);
        
        // Group offers by item
        const grouped = {};
        offersData.forEach(offer => {
          const itemId = offer.item?._id || offer.item;
          if (!grouped[itemId]) {
            grouped[itemId] = {
              item: offer.item,
              offers: []
            };
          }
          grouped[itemId].offers.push(offer);
        });
        setGroupedOffers(grouped);
      } else {
        toast.error('Failed to load your offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load your offers');
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
        fetchAllMyOffers();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${action} offer`);
      }
    } catch (error) {
      console.error(`Error ${action}ing offer:`, error);
      toast.error(`Failed to ${action} offer`);
    }
  };

  const markAsReceived = async (messageId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
        fetchAllMyOffers();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'withdrawn': return '⤶';
      default: return '❓';
    }
  };

  const filteredOffers = allMyOffers.filter(offer => {
    if (filter === 'all') return true;
    return offer.status === filter;
  });

  const filteredGroupedOffers = Object.keys(groupedOffers).reduce((acc, itemId) => {
    const itemGroup = groupedOffers[itemId];
    const filteredItemOffers = itemGroup.offers.filter(offer => {
      if (filter === 'all') return true;
      return offer.status === filter;
    });
    
    if (filteredItemOffers.length > 0) {
      acc[itemId] = {
        ...itemGroup,
        offers: filteredItemOffers
      };
    }
    
    return acc;
  }, {});

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
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
                  <FaDollarSign className="text-green-600" />
                  My Offers
                </h1>
                <p className="text-gray-600 mt-1">
                  Track all your offers across all marketplace items
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{filteredOffers.length}</div>
                <div className="text-sm text-gray-600">
                  {filter === 'all' ? 'Total Offers' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Offers`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: allMyOffers.length },
                { key: 'pending', label: 'Pending', count: allMyOffers.filter(o => o.status === 'pending').length },
                { key: 'accepted', label: 'Accepted', count: allMyOffers.filter(o => o.status === 'accepted').length },
                { key: 'rejected', label: 'Rejected', count: allMyOffers.filter(o => o.status === 'rejected').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Offers by Item */}
        {Object.keys(filteredGroupedOffers).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(filteredGroupedOffers).map(([itemId, itemGroup]) => (
              <div key={itemId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Item Header */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 border-b border-gray-200">
                  <div className="flex items-start gap-4">
                    {itemGroup.item?.images && itemGroup.item.images[0] && (
                      <img
                        src={itemGroup.item.images[0].startsWith('http') 
                          ? itemGroup.item.images[0] 
                          : `http://localhost:5000${itemGroup.item.images[0]}`}
                        alt={itemGroup.item.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{itemGroup.item?.title}</h3>
                      <p className="text-green-600 font-semibold">{formatPrice(itemGroup.item?.price)}</p>
                      <p className="text-sm text-gray-600">Seller: {itemGroup.item?.seller?.username || itemGroup.item?.seller?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{itemGroup.offers.length}</div>
                      <div className="text-sm text-gray-600">Offers</div>
                    </div>
                  </div>
                </div>

                {/* Offers List */}
                <div className="p-4">
                  <div className="space-y-3">
                    {itemGroup.offers.map((offer) => (
                      <div key={offer._id} className={`border rounded-lg p-4 ${
                        offer.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                        offer.status === 'accepted' ? 'border-green-200 bg-green-50' :
                        offer.status === 'rejected' ? 'border-red-200 bg-red-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getStatusIcon(offer.status)}</div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {formatPrice(offer.offerAmount)}
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
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(offer.status)}`}>
                              {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                            </span>
                            {offer.messageType === 'counter_offer' && (
                              <span className="block mt-1 text-xs text-purple-600 font-medium">
                                🔄 Counter Offer
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Message Display */}
                        {offer.content && offer.content !== 'No message provided' && (
                          <div className="bg-white rounded-md p-3 mb-3 border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                              <FaComments className="w-3 h-3" />
                              Your Message:
                            </p>
                            <p className="text-sm text-gray-700 italic">
                              "{offer.content}"
                            </p>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        {offer.status === 'pending' && (
                          <div className="flex gap-2">
                            <Link
                              to={`/marketplace/item/${itemGroup.item?.simpleId || itemGroup.item?._id}/my-offers`}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <FaEye className="w-3 h-3" />
                              View Details
                            </Link>
                          </div>
                        )}
                        
                        {/* Mark as Received Button for Accepted Offers */}
                        {offer.status === 'accepted' && !offer.markedAsReceived && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 mb-2 font-medium">
                              ✅ Offer Accepted! Did you receive the item?
                            </p>
                            <button
                              onClick={() => markAsReceived(offer._id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                            >
                              ✓ Mark as Received
                            </button>
                          </div>
                        )}
                        
                        {/* Transaction Complete - Show Rating Options */}
                        {offer.status === 'accepted' && offer.markedAsReceived && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800 mb-2 font-medium">
                              🎉 Transaction Complete!
                            </p>
                            <div className="flex gap-2">
                              {!offer.buyerRated && (
                                <Link
                                  to={`/marketplace/item/${itemGroup.item?.simpleId || itemGroup.item?._id}?rate=seller`}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                                >
                                  ⭐ Rate Seller
                                </Link>
                              )}
                              {offer.buyerRated && (
                                <span className="text-sm text-green-600 font-medium">
                                  ✓ You rated the seller
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-6">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No offers found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {filter === 'all' 
                  ? "You haven't made any offers yet. Browse the marketplace to find items you're interested in!"
                  : `No ${filter} offers found.`
                }
              </p>
              <Link
                to="/marketplace"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold inline-flex items-center gap-2"
              >
                <FaShoppingCart className="w-5 h-5" />
                Browse Marketplace
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
