import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function MarketplaceMessaging({ item, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (item && user) {
      fetchConversations();
    }
  }, [item, user]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/marketplace/${item._id}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Prevent messaging yourself
    if (user && item && user.id === item.author) {
      toast.error('You cannot message yourself');
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        itemId: item._id,
        recipientId: item.author,
        messageType,
        content: newMessage,
        offerAmount: messageType === 'offer' ? parseFloat(offerAmount) : null
      };

      const response = await fetch('http://localhost:5000/api/marketplace/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📥 Marketplace message response:', result);
        
        if (result.debug) {
          console.log('🔍 Debug info:', result.debug);
          if (result.debug.actualMessageType === 'counter_offer') {
            toast.success('Counter offer sent successfully!');
          } else {
            toast.success(result.message);
          }
        } else {
          toast.success(result.message);
        }
        
        setNewMessage('');
        setOfferAmount('');
        setMessageType('message');
        fetchConversations();
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const canMakeOffer = () => {
    return user && item && item.author !== user.id && item.availability === 'available';
  };

  const formatMessageType = (type) => {
    switch (type) {
      case 'offer': return '💰 Offer';
      case 'counter_offer': return '💰 Counter Offer';
      case 'accept': return '✅ Accepted';
      case 'reject': return '❌ Rejected';
      default: return '💬 Message';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">💬 Marketplace Chat</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-green-100 mt-1">
            {item?.title} - ${item?.price}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            conversations.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.sender === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === user?.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {formatMessageType(message.messageType)}
                  </div>
                  <p className="text-sm">{message.content}</p>
                  {message.offerAmount && (
                    <p className="text-xs mt-1 font-semibold">
                      {message.messageType === 'counter_offer' ? 'Counter Offer' : 'Offer'}: ${message.offerAmount}
                    </p>
                  )}
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="space-y-3">
            {/* Message Type Selector */}
            {canMakeOffer() && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMessageType('message')}
                  className={`px-3 py-1 text-sm rounded ${
                    messageType === 'message'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  💬 Message
                </button>
                <button
                  type="button"
                  onClick={() => setMessageType('offer')}
                  className={`px-3 py-1 text-sm rounded ${
                    messageType === 'offer'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  💰 Make Offer
                </button>
              </div>
            )}

            {/* Offer Amount Input */}
            {messageType === 'offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Amount ($)
                </label>
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder={`Max: $${item?.price - 1}`}
                  max={item?.price - 1}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  messageType === 'offer' 
                    ? 'Add a message with your offer...' 
                    : 'Type your message...'
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
