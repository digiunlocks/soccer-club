import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaArrowLeft, FaShoppingCart, FaUser } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api';

export default function ConversationView({ otherUserId, onBack, messageType = 'general_inquiry' }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    if (otherUserId) {
      fetchConversation();
      fetchOtherUser();
    }
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${API_BASE_URL}/messages/conversation/${user._id}/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const conversationMessages = await response.json();
        setMessages(conversationMessages);
        
        // Mark messages as read
        const unreadMessageIds = conversationMessages
          .filter(msg => !msg.isRead && msg.recipient._id === user._id)
          .map(msg => msg._id);
        
        if (unreadMessageIds.length > 0) {
          await markMessagesAsRead(unreadMessageIds);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setOtherUser(userData);
      }
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/messages/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messageIds })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = messageType === 'marketplace_inquiry' 
        ? `${API_BASE_URL}/messages/marketplace-inquiry`
        : `${API_BASE_URL}/messages/general-message`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: otherUserId,
          content: newMessage,
          messageType
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchConversation();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMessageTypeIcon = (messageType) => {
    switch (messageType) {
      case 'marketplace_inquiry':
      case 'offer':
        return <FaShoppingCart className="w-4 h-4 text-green-600" />;
      default:
        return <FaUser className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            {getMessageTypeIcon(messageType)}
            <div>
              <h3 className="font-medium text-gray-900">
                {otherUser?.name || otherUser?.username || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                {messageType.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender._id === JSON.parse(localStorage.getItem('user') || '{}')._id;
            
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatDate(message.createdAt)}
                  </p>
                  {message.offerAmount && (
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        isOwnMessage 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        Offer: ${message.offerAmount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

