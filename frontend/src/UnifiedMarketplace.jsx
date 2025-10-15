import React, { useState, useEffect } from 'react';
import { FaPlus, FaShoppingBag, FaHandshake, FaStar, FaComments, FaReply, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import MarketplacePost from './MarketplacePost';
import BuyerRatingForm from './BuyerRatingForm';

export default function UnifiedMarketplace() {
  const [activeTab, setActiveTab] = useState('post');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Post Tab State
  const [showPostForm, setShowPostForm] = useState(false);

  // My Items Tab State
  const [myItems, setMyItems] = useState([]);

  // Offers Tab State
  const [offersReceived, setOffersReceived] = useState([]);
  const [offersMade, setOffersMade] = useState([]);

  // Rate & Review Tab State
  const [sellerRatings, setSellerRatings] = useState([]);
  const [buyerRatings, setBuyerRatings] = useState([]);
  const [showBuyerRatingModal, setShowBuyerRatingModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyItems();
      fetchOffers();
      fetchRatings();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/my-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMyItems(data);
      }
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch offers received (on my items)
      const receivedResponse = await fetch('http://localhost:5000/api/marketplace/offers/received', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        setOffersReceived(receivedData);
      }

      // Fetch offers made (by me)
      const madeResponse = await fetch('http://localhost:5000/api/marketplace/offers/made', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (madeResponse.ok) {
        const madeData = await madeResponse.json();
        setOffersMade(madeData);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch seller ratings (reviews about me as seller)
      const sellerResponse = await fetch('http://localhost:5000/api/seller-ratings/seller/' + user.id, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        setSellerRatings(sellerData.ratings || []);
      }

      // Fetch buyer ratings (reviews about me as buyer)
      const buyerResponse = await fetch('http://localhost:5000/api/buyer-ratings/buyer/' + user.id, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (buyerResponse.ok) {
        const buyerData = await buyerResponse.json();
        setBuyerRatings(buyerData.ratings || []);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRateBuyer = (buyer, item) => {
    setSelectedBuyer(buyer);
    setSelectedItem(item);
    setShowBuyerRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    setShowBuyerRatingModal(false);
    setSelectedBuyer(null);
    setSelectedItem(null);
    fetchOffers(); // Refresh offers to update rating status
    toast.success('Rating submitted successfully!');
  };

  const publicTabs = [
    { id: 'post', label: 'Post Item', icon: FaPlus, requiresAuth: true }
  ];

  const authenticatedTabs = [
    { id: 'items', label: 'My Items', icon: FaShoppingBag, requiresAuth: true },
    { id: 'offers', label: 'Offers', icon: FaHandshake, requiresAuth: true },
    { id: 'reviews', label: 'Rate & Review', icon: FaStar, requiresAuth: true }
  ];

  const allTabs = [...publicTabs, ...authenticatedTabs];

  // Check if current tab requires authentication
  const currentTab = allTabs.find(tab => tab.id === activeTab);
  const requiresAuth = currentTab?.requiresAuth;

  // Redirect to login if trying to access authenticated tab without being logged in
  if (!loading && requiresAuth && !isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this section of the marketplace.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/signin'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Manage your items, offers, and reviews in one place</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {allTabs.map((tab) => {
            const Icon = tab.icon;
            const isDisabled = tab.requiresAuth && !isAuthenticated;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isDisabled) {
                    setActiveTab(tab.id);
                  }
                }}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  isDisabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                title={isDisabled ? 'Please sign in to access this section' : ''}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {isDisabled && <span className="text-xs">(🔒)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Post Item Tab */}
        {activeTab === 'post' && (
          <div className="p-6">
            <div className="text-center py-12">
              <FaPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Post a New Item</h3>
              <p className="text-gray-600 mb-6">List your soccer equipment for sale</p>
              <button
                onClick={() => setShowPostForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Create New Listing
              </button>
            </div>
            
            {showPostForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Post New Item</h2>
                      <button
                        onClick={() => setShowPostForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>
                    <MarketplacePost onSuccess={() => {
                      setShowPostForm(false);
                      fetchMyItems();
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Items Tab */}
        {activeTab === 'items' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Items ({myItems.length})</h2>
              <button
                onClick={() => setActiveTab('post')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaPlus className="w-4 h-4 inline mr-2" />
                Post New Item
              </button>
            </div>

            {/* Item Status Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                  All ({myItems.length})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                  Active ({myItems.filter(item => item.status === 'approved').length})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Pending ({myItems.filter(item => item.status === 'pending').length})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-200">
                  Sold ({myItems.filter(item => item.status === 'sold').length})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200">
                  Expired ({myItems.filter(item => item.status === 'expired').length})
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 border border-orange-200">
                  Flagged ({myItems.filter(item => item.status === 'flagged').length})
                </button>
              </div>
            </div>

            {myItems.length === 0 ? (
              <div className="text-center py-12">
                <FaShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items Listed</h3>
                <p className="text-gray-600 mb-6">Start by posting your first item for sale</p>
                <button
                  onClick={() => setActiveTab('post')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Post Your First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myItems.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <FaShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-green-600 font-bold text-lg">${item.price}</p>
                      <p className="text-sm text-gray-600 mb-2">{item.location}</p>
                      
                      {/* Item Details */}
                      <div className="text-xs text-gray-500 mb-3">
                        <p>Posted: {new Date(item.createdAt).toLocaleDateString()}</p>
                        {item.views && <p>Views: {item.views}</p>}
                        {item.favorites && item.favorites.length > 0 && (
                          <p>Favorites: {item.favorites.length}</p>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'sold' ? 'bg-green-100 text-green-800' :
                          item.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'flagged' ? 'bg-orange-100 text-orange-800' :
                          item.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                          {item.status === 'approved' && (
                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Offers Received */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaHandshake className="w-5 h-5 text-blue-600" />
                  Offers Received ({offersReceived.length})
                </h3>
                
                {offersReceived.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaHandshake className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No offers received yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offersReceived.map((offer) => (
                      <div key={offer._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{offer.item?.title}</h4>
                            <p className="text-sm text-gray-600">From: {offer.sender?.username}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {offer.status}
                          </span>
                        </div>
                        <p className="text-green-600 font-bold">${offer.offerAmount}</p>
                        <p className="text-sm text-gray-600 mt-2">{offer.content}</p>
                        
                        {/* Rating Button for Completed Transactions */}
                        {offer.status === 'accepted' && offer.markedAsReceived && !offer.sellerRated && (
                          <button
                            onClick={() => handleRateBuyer(offer.sender, offer.item)}
                            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                          >
                            <FaStar className="w-4 h-4" />
                            Rate Buyer
                          </button>
                        )}
                        
                        {offer.status === 'accepted' && offer.markedAsReceived && offer.sellerRated && (
                          <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                            <FaCheck className="w-4 h-4" />
                            You rated this buyer
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Offers Made */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaShoppingBag className="w-5 h-5 text-green-600" />
                  Offers Made ({offersMade.length})
                </h3>
                
                {offersMade.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No offers made yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {offersMade.map((offer) => (
                      <div key={offer._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{offer.item?.title}</h4>
                            <p className="text-sm text-gray-600">To: {offer.recipient?.username}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {offer.status}
                          </span>
                        </div>
                        <p className="text-green-600 font-bold">${offer.offerAmount}</p>
                        <p className="text-sm text-gray-600 mt-2">{offer.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rate & Review Tab */}
        {activeTab === 'reviews' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reviews About Me (as Seller) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaStar className="w-5 h-5 text-yellow-500" />
                  Reviews About Me (as Seller) ({sellerRatings.length})
                </h3>
                
                {sellerRatings.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaStar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellerRatings.map((rating) => (
                      <div key={rating._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{rating.marketplaceItem?.title}</h4>
                            <p className="text-sm text-gray-600">From: {rating.reviewer?.username}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{rating.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* Response Button */}
                        {!rating.sellerResponse && (
                          <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2">
                            <FaReply className="w-4 h-4" />
                            Respond to Review
                          </button>
                        )}
                        
                        {rating.sellerResponse && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Your response:</strong> {rating.sellerResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews About Me (as Buyer) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaComments className="w-5 h-5 text-blue-500" />
                  Reviews About Me (as Buyer) ({buyerRatings.length})
                </h3>
                
                {buyerRatings.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaComments className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {buyerRatings.map((rating) => (
                      <div key={rating._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{rating.marketplaceItem?.title}</h4>
                            <p className="text-sm text-gray-600">From: {rating.seller?.username}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{rating.comment}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* Response Button */}
                        {!rating.buyerResponse && (
                          <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2">
                            <FaReply className="w-4 h-4" />
                            Respond to Review
                          </button>
                        )}
                        
                        {rating.buyerResponse && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Your response:</strong> {rating.buyerResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buyer Rating Modal */}
      {showBuyerRatingModal && selectedBuyer && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-lg w-full">
            <BuyerRatingForm
              buyerId={selectedBuyer._id || selectedBuyer}
              itemId={selectedItem._id || selectedItem}
              onClose={handleRatingSubmitted}
            />
          </div>
        </div>
      )}
    </div>
  );
}
