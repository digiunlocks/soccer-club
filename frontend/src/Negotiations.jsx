import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Negotiations = () => {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buying');
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [counterOffer, setCounterOffer] = useState({ amount: 0, message: '' });
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchNegotiations();
  }, [activeTab]);

  const fetchNegotiations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view negotiations');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/marketplace/negotiations/my?type=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNegotiations(data);
      } else {
        toast.error('Failed to fetch negotiations');
      }
    } catch (error) {
      console.error('Error fetching negotiations:', error);
      toast.error('Failed to fetch negotiations');
    } finally {
      setLoading(false);
    }
  };

  const handleCounterOffer = async (negotiationId, itemId) => {
    if (!counterOffer.amount || counterOffer.amount <= 0) {
      toast.error('Please enter a valid counter offer amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/${itemId}/negotiations/${negotiationId}/counter`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(counterOffer)
      });

      if (response.ok) {
        toast.success('Counter offer sent successfully');
        setShowDetailsModal(false);
        setCounterOffer({ amount: 0, message: '' });
        fetchNegotiations();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send counter offer');
      }
    } catch (error) {
      console.error('Error sending counter offer:', error);
      toast.error('Failed to send counter offer');
    }
  };

  const handleAcceptOffer = async (negotiationId, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/${itemId}/negotiations/${negotiationId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: responseMessage })
      });

      if (response.ok) {
        toast.success('Offer accepted successfully');
        setShowDetailsModal(false);
        setResponseMessage('');
        fetchNegotiations();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer');
    }
  };

  const handleRejectOffer = async (negotiationId, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/${itemId}/negotiations/${negotiationId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: responseMessage })
      });

      if (response.ok) {
        toast.success('Offer rejected');
        setShowDetailsModal(false);
        setResponseMessage('');
        fetchNegotiations();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reject offer');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Failed to reject offer');
    }
  };

  const handleCancelNegotiation = async (negotiationId, itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/marketplace/${itemId}/negotiations/${negotiationId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: 'Negotiation cancelled by user' })
      });

      if (response.ok) {
        toast.success('Negotiation cancelled');
        setShowDetailsModal(false);
        fetchNegotiations();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to cancel negotiation');
      }
    } catch (error) {
      console.error('Error cancelling negotiation:', error);
      toast.error('Failed to cancel negotiation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'countered': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'countered': return '🔄';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'expired': return '⏰';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading negotiations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Negotiations</h1>
        <p className="text-gray-600">Manage your buying and selling negotiations</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('buying')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'buying'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          💰 Buying ({negotiations.filter(n => activeTab === 'buying').length})
        </button>
        <button
          onClick={() => setActiveTab('selling')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'selling'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🛍️ Selling ({negotiations.filter(n => activeTab === 'selling').length})
        </button>
      </div>

      {/* Negotiations List */}
      <div className="space-y-4">
        {negotiations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No negotiations found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'buying' 
                ? "You haven't made any offers yet. Browse the marketplace to find items you're interested in!"
                : "You don't have any pending offers. Your items will appear here when buyers make offers."
              }
            </p>
            {activeTab === 'buying' && (
              <Link 
                to="/marketplace" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Marketplace
              </Link>
            )}
          </div>
        ) : (
          negotiations.map((negotiation) => (
            <div key={negotiation._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {negotiation.item.title}
                    </h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(negotiation.status)}`}>
                      {getStatusIcon(negotiation.status)} {negotiation.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Initial Offer:</span> ${negotiation.initialOffer}
                    </div>
                    <div>
                      <span className="font-medium">Current Offer:</span> ${negotiation.currentOffer}
                    </div>
                    <div>
                      <span className="font-medium">Listed Price:</span> ${negotiation.item.price}
                    </div>
                    <div>
                      <span className="font-medium">Expires:</span> {new Date(negotiation.expiresAt).toLocaleDateString()}
                    </div>
                  </div>

                  {negotiation.messages.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded mb-4">
                      <p className="text-sm font-medium mb-1">Latest Message:</p>
                      <p className="text-sm text-gray-700">
                        {negotiation.messages[negotiation.messages.length - 1].message}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedNegotiation(negotiation);
                        setShowDetailsModal(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    
                    {activeTab === 'selling' && ['pending', 'countered'].includes(negotiation.status) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedNegotiation(negotiation);
                            setCounterOffer({ amount: negotiation.currentOffer + 10, message: '' });
                            setShowDetailsModal(true);
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          Counter Offer
                        </button>
                        <button
                          onClick={() => handleAcceptOffer(negotiation._id, negotiation.item._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectOffer(negotiation._id, negotiation.item._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {['pending', 'countered'].includes(negotiation.status) && (
                      <button
                        onClick={() => handleCancelNegotiation(negotiation._id, negotiation.item._id)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Negotiation Details Modal */}
      {showDetailsModal && selectedNegotiation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Negotiation Details</h3>
            
            <div className="space-y-4">
              {/* Item Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Item Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Title:</span> {selectedNegotiation.item.title}</div>
                  <div><span className="font-medium">Listed Price:</span> ${selectedNegotiation.item.price}</div>
                  <div><span className="font-medium">Initial Offer:</span> ${selectedNegotiation.initialOffer}</div>
                  <div><span className="font-medium">Current Offer:</span> ${selectedNegotiation.currentOffer}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-800">Message History</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedNegotiation.messages.map((message, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{message.senderName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.message}</p>
                      {message.offer && (
                        <p className="text-xs text-green-600 mt-1">
                          Offer: ${message.offer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Forms */}
              {activeTab === 'selling' && ['pending', 'countered'].includes(selectedNegotiation.status) && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-800">Seller Actions</h4>
                  
                  {/* Counter Offer Form */}
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Counter Offer</h5>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={counterOffer.amount}
                        onChange={(e) => setCounterOffer({ ...counterOffer, amount: parseFloat(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Counter offer amount"
                        min="0"
                        step="0.01"
                      />
                      <textarea
                        value={counterOffer.message}
                        onChange={(e) => setCounterOffer({ ...counterOffer, message: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Message to buyer"
                        rows="2"
                      />
                      <button
                        onClick={() => handleCounterOffer(selectedNegotiation._id, selectedNegotiation.item._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Send Counter Offer
                      </button>
                    </div>
                  </div>

                  {/* Accept/Reject Form */}
                  <div>
                    <h5 className="font-medium mb-2">Quick Response</h5>
                    <div className="space-y-2">
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Optional message"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptOffer(selectedNegotiation._id, selectedNegotiation.item._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          Accept Offer
                        </button>
                        <button
                          onClick={() => handleRejectOffer(selectedNegotiation._id, selectedNegotiation.item._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                          Reject Offer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedNegotiation(null);
                  setCounterOffer({ amount: 0, message: '' });
                  setResponseMessage('');
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Negotiations;
