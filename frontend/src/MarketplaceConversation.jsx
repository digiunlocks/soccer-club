import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDollarSign, FaHandshake, FaCheck, FaTimes, FaComments, FaHistory, FaUser } from 'react-icons/fa';

export default function MarketplaceConversation() {
  const { itemId, otherUserId } = useParams();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState([]);
  const [item, setItem] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchConversation();
    fetchItem();
    fetchOtherUser();
  }, [itemId, otherUserId]);

  const fetchConversation = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/marketplace-messages/conversation/${itemId}/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItem = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/marketplace/public/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };

  const fetchOtherUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOtherUser(data);
      }
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to send messages');
      return;
    }

    if (!newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (messageType === 'offer' && !offerAmount) {
      alert('Please enter an offer amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/marketplace-messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          recipientId: otherUserId,
          messageType,
          content: newMessage,
          offerAmount: offerAmount ? parseFloat(offerAmount) : null
        })
      });

      if (response.ok) {
        setNewMessage('');
        setOfferAmount('');
        setMessageType('message');
        fetchConversation();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setIsSubmitting(false);
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

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'offer':
        return <FaDollarSign className="w-4 h-4" />;
      case 'counter_offer':
        return <FaHandshake className="w-4 h-4" />;
      case 'accept':
        return <FaCheck className="w-4 h-4" />;
      case 'reject':
        return <FaTimes className="w-4 h-4" />;
      default:
        return <FaComments className="w-4 h-4" />;
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case 'offer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'counter_offer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accept':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'reject':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {item && (
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={item.images && item.images[0] ? 
                    (item.images[0].startsWith('http') ? 
                      item.images[0] : 
                      `http://localhost:5000${item.images[0]}`) : 
                    '/placeholder-item.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {item ? item.title : 'Loading...'}
              </h1>
              <p className="text-gray-600">
                Conversation with {otherUser ? otherUser.username : 'Loading...'}
              </p>
              {item && (
                <p className="text-lg font-semibold text-green-600">
                  ${item.price}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaHistory className="w-5 h-5" />
              Conversation History
            </h2>
          </div>
          
          <div className="p-6 max-h-96 overflow-y-auto space-y-4">
            {conversation.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
            ) : (
              conversation.map((message) => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const isCurrentUser = message.sender._id === user._id;
                
                return (
                  <div key={message._id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isCurrentUser ? 'bg-green-500 text-white' : getMessageTypeColor(message.messageType)
                        }`}>
                          {getMessageTypeIcon(message.messageType)}
                          <span className="capitalize">
                            {message.messageType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <FaUser className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {message.sender.username}
                        </span>
                        <span className={`text-xs ${
                          isCurrentUser ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {(message.messageType === 'offer' || message.messageType === 'counter_offer') && (
                        <div className={`text-sm font-semibold mb-2 ${
                          isCurrentUser ? 'text-green-100' : 'text-green-600'
                        }`}>
                          💰 ${message.offerAmount}
                        </div>
                      )}
                      
                      <p className="text-sm">{message.content}</p>
                      
                      {message.status === 'accepted' && (
                        <div className="text-xs mt-2 flex items-center gap-1">
                          <FaCheck className="w-3 h-3" />
                          Accepted
                        </div>
                      )}
                      
                      {message.status === 'rejected' && (
                        <div className="text-xs mt-2 flex items-center gap-1">
                          <FaTimes className="w-3 h-3" />
                          Declined
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Message</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Type
              </label>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="message">Regular Message</option>
                <option value="offer">Make Offer</option>
              </select>
            </div>
            
            {messageType === 'offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={item?.price}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={`Max: $${item?.price || 0}`}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Type your message..."
                maxLength="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                {newMessage.length}/1000 characters
              </p>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={isSubmitting || !newMessage.trim() || (messageType === 'offer' && !offerAmount)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
