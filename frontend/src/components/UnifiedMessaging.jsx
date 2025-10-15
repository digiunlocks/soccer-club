import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaShoppingCart, FaUsers, FaGraduationCap, FaHeadset, FaBullhorn, FaSearch, FaPaperPlane } from 'react-icons/fa';

export default function UnifiedMessaging() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'marketplace', label: 'Marketplace', icon: FaShoppingCart, color: 'text-green-600' },
    { id: 'general', label: 'General', icon: FaEnvelope, color: 'text-blue-600' },
    { id: 'parent_coach', label: 'Parent-Coach', icon: FaGraduationCap, color: 'text-purple-600' },
    { id: 'support', label: 'Support', icon: FaHeadset, color: 'text-orange-600' },
    { id: 'announcements', label: 'Announcements', icon: FaBullhorn, color: 'text-red-600' }
  ];

  useEffect(() => {
    fetchUnifiedInbox();
  }, []);

  const fetchUnifiedInbox = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/unified-inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setUnreadCounts(data.unreadCounts);
        setTotalUnread(data.totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unified inbox:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (recipientId, messageType = 'general_inquiry') => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = messageType === 'marketplace_inquiry' 
        ? 'http://localhost:5000/api/messages/marketplace-inquiry'
        : 'http://localhost:5000/api/messages/general-message';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId,
          content: newMessage,
          messageType
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchUnifiedInbox();
        if (selectedConversation) {
          fetchConversation(selectedConversation.otherUserId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const fetchConversation = async (otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${user._id}/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const conversationMessages = await response.json();
        setSelectedConversation({
          otherUserId,
          messages: conversationMessages
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const getMessageTypeIcon = (messageType) => {
    switch (messageType) {
      case 'marketplace_inquiry':
      case 'offer':
        return <FaShoppingCart className="w-4 h-4 text-green-600" />;
      case 'parent_coach':
        return <FaGraduationCap className="w-4 h-4 text-purple-600" />;
      case 'support':
        return <FaHeadset className="w-4 h-4 text-orange-600" />;
      case 'announcement':
      case 'broadcast':
        return <FaBullhorn className="w-4 h-4 text-red-600" />;
      default:
        return <FaEnvelope className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages[activeTab]?.filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Unified Inbox</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Total Unread:</span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                {totalUnread}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Message Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const unreadCount = unreadCounts[tab.id] || 0;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-green-50 border border-green-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${tab.color}`} />
                          <span className="font-medium text-gray-900">{tab.label}</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Right Content - Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {tabs.find(tab => tab.id === activeTab)?.label} Messages
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Messages List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FaEnvelope className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages in this category</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredMessages.map((message) => (
                      <div
                        key={message._id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          !message.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => fetchConversation(
                          message.sender._id === JSON.parse(localStorage.getItem('user') || '{}')._id
                            ? message.recipient._id
                            : message.sender._id
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getMessageTypeIcon(message.messageType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {message.sender._id === JSON.parse(localStorage.getItem('user') || '{}')._id
                                  ? `To: ${message.recipient.name || message.recipient.username}`
                                  : `From: ${message.sender.name || message.sender.username}`
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {message.content}
                            </p>
                            {message.marketplaceItemId && (
                              <div className="mt-2 flex items-center gap-2">
                                <FaShoppingCart className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600">
                                  About: {message.marketplaceItemId.title}
                                </span>
                              </div>
                            )}
                            {message.offerAmount && (
                              <div className="mt-1">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Offer: ${message.offerAmount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

