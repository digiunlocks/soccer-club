import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConversationView from './components/ConversationView';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const marketplaceItemId = searchParams.get('marketplace') || searchParams.get('item');
  const sellerId = searchParams.get('seller') || searchParams.get('contact');
  const messageType = searchParams.get('type');
  const initialOfferAmount = searchParams.get('amount');
  const initialMessage = searchParams.get('message');
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(initialMessage || '');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showOfferInput, setShowOfferInput] = useState(messageType === 'offer' || !!initialOfferAmount);
  const [offerAmount, setOfferAmount] = useState(initialOfferAmount || '');
  const [marketplaceItem, setMarketplaceItem] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [broadcasts, setBroadcasts] = useState([]);
  const [unreadBroadcasts, setUnreadBroadcasts] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDeleteConversationModal, setShowDeleteConversationModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          console.log('✅ User loaded:', userData.username);
        } else {
          navigate('/signin');
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch marketplace item details if we have a marketplace context
  useEffect(() => {
    if (marketplaceItemId) {
      const fetchMarketplaceItem = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/marketplace/public/${marketplaceItemId}`);
          if (response.ok) {
            const itemData = await response.json();
            setMarketplaceItem(itemData);
            console.log('✅ Marketplace item loaded:', itemData.title);
          }
        } catch (error) {
          console.error('❌ Error fetching marketplace item:', error);
        }
      };
      fetchMarketplaceItem();
    }
  }, [marketplaceItemId]);

  // Fetch conversations and announcements
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter out announcements from conversations to prevent redundancy
          const filteredConversations = data.filter(conv => {
            // Skip if there's no last message
            if (!conv.lastMessage) return true;
            
            // Skip if the last message is an announcement
            if (conv.lastMessage.messageType === 'announcement') return false;
            
            // Skip if the content contains announcement markers
            if (conv.lastMessage.content && conv.lastMessage.content.includes('📢')) return false;
            
            return true;
          });
          setConversations(filteredConversations);
          console.log('✅ Conversations loaded:', filteredConversations.length);
          
          // Fetch announcements
          fetchAnnouncements();
          fetchBroadcasts(); // Fetch broadcasts here
          
          // If we have marketplace context, find or create conversation with seller
          if (marketplaceItemId && sellerId) {
            const existingConversation = data.find(conv => 
              conv.otherUser._id === sellerId
            );
            
            if (existingConversation) {
              setSelectedConversation(existingConversation);
            } else {
              // Create new conversation with seller
              await startMarketplaceConversation();
            }
          }
        } else {
          console.error('❌ Failed to fetch conversations');
        }
      } catch (error) {
        console.error('❌ Error fetching conversations:', error);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/messages/announcements', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
          setUnreadAnnouncements(data.filter(ann => !ann.isRead).length);
          console.log('✅ Announcements loaded:', data.length);
        }
      } catch (error) {
        console.error('❌ Error fetching announcements:', error);
      }
    };

    const fetchBroadcasts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/broadcasts/my-broadcasts', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBroadcasts(data);
          setUnreadBroadcasts(data.filter(broadcast => !broadcast.inAppRead).length);
          console.log('✅ Broadcast messages loaded:', data.length);
        }
      } catch (error) {
        console.error('❌ Error fetching broadcast messages:', error);
      }
    };

    fetchConversations();
  }, [user, marketplaceItemId, sellerId]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    console.log('🔍 Selected conversation:', selectedConversation);

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Special handling for announcements
        if (selectedConversation.isAnnouncement) {
          console.log('🔍 Loading announcement:', selectedConversation.announcement);
          // For announcements, we just display the announcement content
          const announcementMessage = {
            ...selectedConversation.announcement,
            content: selectedConversation.announcement.content || 'No content available'
          };
          console.log('🔍 Setting messages array with announcement:', [announcementMessage]);
          setMessages([announcementMessage]);
          
          // Mark announcement as read
          if (!selectedConversation.announcement.isRead) {
            try {
              const readResponse = await fetch(`http://localhost:5000/api/messages/announcements/${selectedConversation.announcement._id}/read`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (readResponse.ok) {
                console.log('✅ Announcement marked as read');
                // Update the announcement in the list
                setAnnouncements(prev => prev.map(ann => 
                  ann._id === selectedConversation.announcement._id 
                    ? { ...ann, isRead: true }
                    : ann
                ));
                setUnreadAnnouncements(prev => Math.max(0, prev - 1));
              }
            } catch (error) {
              console.error('❌ Error marking announcement as read:', error);
            }
          }
          return;
        }

        // Special handling for broadcast messages
        if (selectedConversation.isBroadcast) {
          console.log('🔍 Loading broadcast:', selectedConversation.broadcast);
          // For broadcasts, we just display the broadcast content
          const broadcastMessage = {
            ...selectedConversation.broadcast,
            content: selectedConversation.broadcast.content || 'No content available',
            sender: { username: selectedConversation.broadcast.sentBy, _id: 'broadcast' }
          };
          console.log('🔍 Setting messages array with broadcast:', [broadcastMessage]);
          setMessages([broadcastMessage]);
          
          // Mark broadcast as read
          if (!selectedConversation.broadcast.inAppRead) {
            try {
              const readResponse = await fetch(`http://localhost:5000/api/broadcasts/${selectedConversation.broadcast.id}/read`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (readResponse.ok) {
                console.log('✅ Broadcast marked as read');
                // Update the broadcast in the list
                setBroadcasts(prev => prev.map(broadcast => 
                  broadcast.id === selectedConversation.broadcast.id 
                    ? { ...broadcast, inAppRead: true }
                    : broadcast
                ));
                setUnreadBroadcasts(prev => Math.max(0, prev - 1));
              }
            } catch (error) {
              console.error('❌ Error marking broadcast as read:', error);
            }
          }
          return;
        }
        
        // Use the other user's ID to get the conversation
        const otherUserId = selectedConversation.otherUser._id;
        console.log('🔍 Using other user ID:', otherUserId);
        
        const response = await fetch(`http://localhost:5000/api/messages/conversation/${otherUserId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          console.log('✅ Messages loaded:', data.length);
          
          // Mark messages as read
          if (data.length > 0) {
            markMessagesAsRead();
          }
        } else {
          console.error('❌ Failed to fetch messages');
        }
      } catch (error) {
        console.error('❌ Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Search users for new conversation
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/search-users?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        const filteredResults = data.filter(user => user._id !== user.id);
        setSearchResults(filteredResults);
        console.log('✅ Search results:', filteredResults.length);
      } else {
        console.error('❌ Failed to search users');
      }
    } catch (error) {
      console.error('❌ Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  // Send message
  const sendMessage = async (e) => {
         e.preventDefault();
     if (!selectedConversation) return;
     
     // Allow sending offer without message, but require message for regular messages
     if (!showOfferInput && !newMessage.trim() && !marketplaceItemId) return;

    // Validate offer if making one
    if (showOfferInput) {
      if (!offerAmount || parseFloat(offerAmount) <= 0) {
        toast.error('Please enter a valid offer amount');
        return;
      }
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
             // Combine offer amount with message content for clarity
       let messageContent = newMessage.trim();
       if (showOfferInput && offerAmount) {
         if (newMessage.trim()) {
           messageContent = `Offer made $${offerAmount}. ${newMessage.trim()}`;
         } else {
           messageContent = `Offer made $${offerAmount}.`;
         }
       }
       
       const messageData = {
         recipientId: selectedConversation.otherUser._id,
         content: messageContent
       };

      // Add marketplace-specific data
      if (marketplaceItemId) {
        messageData.marketplaceItemId = marketplaceItemId;
        if (showOfferInput && offerAmount) {
          messageData.messageType = 'offer';
          messageData.offerAmount = parseFloat(offerAmount);
        } else {
          messageData.messageType = 'marketplace_inquiry';
        }
      } else if (showOfferInput && offerAmount) {
        // Handle offers in non-marketplace conversations
        messageData.messageType = 'offer';
        messageData.offerAmount = parseFloat(offerAmount);
      }

      console.log('🔍 Sending message data:', messageData);
      
      // Prevent messaging yourself
      if (messageData.recipientId === user.id) {
        toast.error('You cannot message yourself');
        return;
      }
      
      // Use marketplace endpoint if this is a marketplace conversation
      const endpoint = marketplaceItemId ? 
        'http://localhost:5000/api/marketplace/messages/send' : 
        'http://localhost:5000/api/messages/send';
      
      // Adjust message data for marketplace endpoint
      if (marketplaceItemId) {
        messageData.itemId = marketplaceItemId;
        messageData.recipientId = sellerId;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📥 Message response:', result);
        
        // Handle marketplace endpoint response format
        const sentMessage = marketplaceItemId ? result.data : result;
        
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        setOfferAmount('');
        setShowOfferInput(false);
        
        // Show appropriate success message
        if (marketplaceItemId && result.debug && result.debug.actualMessageType === 'counter_offer') {
          toast.success('Counter offer sent successfully!');
        } else {
          const successMessage = showOfferInput && offerAmount 
            ? `Offer of $${offerAmount} sent!` 
            : 'Message sent!';
          toast.success(successMessage);
        }
        console.log('✅ Message sent successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Start marketplace conversation
  const startMarketplaceConversation = async () => {
    if (!marketplaceItemId || !sellerId) return;
    
    // Prevent messaging yourself
    if (sellerId === user.id) {
      toast.error('You cannot message yourself');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: marketplaceItemId,
          recipientId: sellerId,
          content: `Hi! I'm interested in your marketplace item. Can you tell me more about it?`,
          messageType: 'message'
        })
      });

      if (response.ok) {
        const result = await response.json();
        const sentMessage = result.data;
        // Refresh conversations
        const conversationsResponse = await fetch('http://localhost:5000/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (conversationsResponse.ok) {
          const updatedConversations = await conversationsResponse.json();
          setConversations(updatedConversations);
          
          // Find and select the new conversation
          const newConversation = updatedConversations.find(conv => 
            conv.otherUser._id === sellerId
          );
          if (newConversation) {
            setSelectedConversation(newConversation);
          }
        }

        toast.success('Started conversation with seller!');
        console.log('✅ Marketplace conversation started');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('❌ Error starting marketplace conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!selectedConversation) return;
    
    try {
      const token = localStorage.getItem('token');
      const otherUserId = selectedConversation.otherUser._id;
      
      const response = await fetch(`http://localhost:5000/api/messages/mark-read/${otherUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        console.log('✅ Messages marked as read');
        // Trigger a refresh of the unread count in the parent component
        window.dispatchEvent(new CustomEvent('messagesRead'));
      }
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  };

  // Start new conversation
  const startConversation = async (otherUser) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: otherUser._id,
          content: 'Hello! I\'d like to start a conversation with you.'
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        // Refresh conversations
        const conversationsResponse = await fetch('http://localhost:5000/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (conversationsResponse.ok) {
          const updatedConversations = await conversationsResponse.json();
          setConversations(updatedConversations);
          
          // Find and select the new conversation
          const newConversation = updatedConversations.find(conv => 
            conv.otherUser._id === otherUser._id
          );
          if (newConversation) {
            setSelectedConversation(newConversation);
          }
        }

        setShowNewConversationModal(false);
        setSearchQuery('');
        setSearchResults([]);
        toast.success(`Started conversation with ${otherUser.username}`);
        console.log('✅ New conversation started');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to start conversation');
      }
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Delete a single message
  const deleteMessage = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove the message from the current messages list
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast.success('Message deleted successfully');
        console.log('✅ Message deleted:', messageId);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  // Delete entire conversation
  const deleteConversation = async (conversation) => {
    try {
      const token = localStorage.getItem('token');
      
      // Handle announcements differently
      if (conversation.isAnnouncement) {
        console.log('🔍 Deleting all announcements');
        
        const response = await fetch(`http://localhost:5000/api/messages/announcements/delete-all`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Remove the conversation from the list
          setConversations(prev => prev.filter(conv => conv._id !== conversation._id));
          // Clear the selected conversation if it was the deleted one
          if (selectedConversation && selectedConversation._id === conversation._id) {
            setSelectedConversation(null);
            setMessages([]);
          }
          toast.success('All announcements deleted successfully');
          console.log('✅ All announcements deleted');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to delete announcements');
        }
      } else {
        // Regular conversation deletion
        const otherUserId = conversation.otherUser._id;
        
        console.log('🔍 Deleting conversation with user:', otherUserId);
        
        const response = await fetch(`http://localhost:5000/api/messages/conversation/${otherUserId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Remove the conversation from the list
          setConversations(prev => prev.filter(conv => conv._id !== conversation._id));
          // Clear the selected conversation if it was the deleted one
          if (selectedConversation && selectedConversation._id === conversation._id) {
            setSelectedConversation(null);
            setMessages([]);
          }
          toast.success('Conversation deleted successfully');
          console.log('✅ Conversation deleted with user:', otherUserId);
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to delete conversation');
        }
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setShowDeleteConversationModal(false);
      setConversationToDelete(null);
    }
  };

  // Auto-scroll to bottom of messages (only for regular conversations, not announcements)
  const scrollToBottom = () => {
    if (!selectedConversation?.isAnnouncement) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Basic loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full py-2 px-4 sm:px-6 lg:px-8">
         <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full max-h-screen">
           <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <h1 className="text-2xl font-bold">Messages</h1>
                {user && (
                  <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {user.username}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowNewConversationModal(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                >
                  ✨ New Message
                </button>
              </div>
            </div>
          </div>
          
                     <div className="flex h-[calc(100%-3.5rem)] overflow-hidden">
             {/* Conversations Sidebar */}
             <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
              {/* Announcements Section */}
              {announcements.length > 0 && (
                <div className="p-4 border-b border-gray-200 bg-yellow-50 max-h-64 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center sticky top-0 bg-yellow-50 py-1">
                    📢 Announcements
                    {unreadAnnouncements > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadAnnouncements}
                      </span>
                    )}
                  </h3>
                  <div className="space-y-2 pr-2">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement._id}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          !announcement.isRead ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-white'
                        }`}
                        onClick={() => {
                          const announcementConversation = {
                            _id: `announcement-${announcement._id}`,
                            otherUser: { username: 'Club Announcement', _id: 'announcement' },
                            lastMessage: announcement.content.substring(0, 50) + '...',
                            unreadCount: announcement.isRead ? 0 : 1,
                            isAnnouncement: true,
                            announcement: announcement
                          };
                          console.log('🔍 Setting announcement conversation:', announcementConversation);
                          setSelectedConversation(announcementConversation);
                        }}
                      >
                        <div className="text-xs font-medium text-gray-600">
                          {announcement.sender?.username || 'Admin'}
                        </div>
                        <div className="text-sm text-gray-800 truncate">
                          {announcement.content.substring(0, 40)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Broadcast Messages Section */}
              {broadcasts.length > 0 && (
                <div className="p-4 border-b border-gray-200 bg-blue-50 max-h-64 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center sticky top-0 bg-blue-50 py-1">
                    📢 Broadcast Messages
                    {unreadBroadcasts > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadBroadcasts}
                      </span>
                    )}
                  </h3>
                  <div className="space-y-2 pr-2">
                    {broadcasts.map((broadcast) => (
                      <div
                        key={broadcast.id}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          !broadcast.inAppRead ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-white'
                        }`}
                        onClick={() => {
                          const broadcastConversation = {
                            _id: `broadcast-${broadcast.id}`,
                            otherUser: { username: 'Club Broadcast', _id: 'broadcast' },
                            lastMessage: broadcast.content.substring(0, 50) + '...',
                            unreadCount: broadcast.inAppRead ? 0 : 1,
                            isBroadcast: true,
                            broadcast: broadcast
                          };
                          console.log('🔍 Setting broadcast conversation:', broadcastConversation);
                          setSelectedConversation(broadcastConversation);
                        }}
                      >
                        <div className="text-xs font-medium text-gray-600">
                          {broadcast.sentBy}
                        </div>
                        <div className="text-sm text-gray-800 truncate">
                          {broadcast.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(broadcast.sentAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
                <p className="text-sm text-gray-600">{conversations.length} conversations</p>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-2">Start a new conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation._id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedConversation?._id === conversation._id
                            ? 'bg-green-100 border-l-4 border-green-500'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {conversation.otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {conversation.otherUser?.username || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage?.content || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[1.5rem] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {conversation.lastMessage?.createdAt && 
                            new Date(conversation.lastMessage.createdAt).toLocaleDateString()
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

                         {/* Messages Area */}
             <div className="flex-1 flex flex-col h-full overflow-hidden">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedConversation.otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.otherUser?.username || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.otherUser?.email || ''}
                          </p>
                          {marketplaceItemId && marketplaceItem && (
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                📦 {marketplaceItem.title}
                              </span>
                              <span className="text-xs text-gray-500">
                                ${marketplaceItem.price}
                              </span>
                              <button
                                onClick={() => navigate(`/marketplace/item/${marketplaceItemId}`)}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                View Item
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Delete conversation button (for all conversations including announcements) */}
                      <button
                        onClick={() => {
                          setConversationToDelete(selectedConversation);
                          setShowDeleteConversationModal(true);
                        }}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete conversation"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                                     {/* Messages List */}
                                     <div className={`flex-1 ${selectedConversation?.isAnnouncement ? 'flex items-start justify-center p-4 pt-12 overflow-hidden' : 'overflow-y-auto p-4 space-y-4'} min-h-0`}>
                    {console.log('🔍 Messages array:', messages)}
                    {console.log('🔍 User object:', user)}
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <div className="text-4xl mb-3">💭</div>
                        <p className="text-sm">
                          {selectedConversation?.isAnnouncement ? 'No announcement content' : 'No messages in this conversation'}
                        </p>
                        <p className="text-xs mt-2">
                          {selectedConversation?.isAnnouncement ? 'The announcement content could not be loaded.' : 'Send the first message!'}
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`${selectedConversation?.isAnnouncement ? 'w-full' : 'flex'} ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`${selectedConversation?.isAnnouncement ? 'max-w-2xl mx-auto max-h-[calc(100vh-12rem)] overflow-y-auto' : 'max-w-xs lg:max-w-md'} px-4 py-2 rounded-lg relative ${
                              message.sender._id === user.id
                                ? 'bg-green-500 text-white'
                                : message.messageType === 'announcement'
                                ? 'bg-yellow-100 border-l-4 border-yellow-500 text-gray-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {/* Delete button for individual messages (including announcements) */}
                            {console.log('🔍 Message type:', message.messageType, 'for message:', message._id)}
                            <button
                              onClick={() => {
                                setMessageToDelete(message);
                                setShowDeleteModal(true);
                              }}
                              className="absolute top-1 right-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
                              title="Delete message"
                            >
                              🗑️
                            </button>
                            {/* Special handling for announcement content */}
                            {message.messageType === 'announcement' ? (
                              <div className="announcement-content">
                                <div className="flex items-center mb-2">
                                  <span className="text-yellow-600 mr-2">📢</span>
                                  <span className="text-sm font-semibold text-yellow-800">Club Announcement</span>
                                </div>
                                <div className="text-sm whitespace-pre-wrap break-words">
                                  {message.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                  Sent by: {message.sender?.username || 'Admin'}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}

                            {message.marketplaceItemId && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                                <p className="text-xs text-blue-700 font-medium">📦 Marketplace Item</p>
                                <p className="text-xs text-blue-600">
                                  {marketplaceItem ? marketplaceItem.title : `Item ID: ${message.marketplaceItemId}`}
                                </p>
                                {marketplaceItem && (
                                  <p className="text-xs text-blue-600">
                                    Listed Price: ${marketplaceItem.price}
                                  </p>
                                )}
                                {(message.messageType === 'offer' || message.messageType === 'counter_offer') && message.offerAmount && (
                                  <p className="text-xs text-green-600 font-semibold">
                                    {message.messageType === 'counter_offer' ? '🔄 Counter Offer' : '💰 Offer'}: ${message.offerAmount}
                                  </p>
                                )}
                              </div>
                            )}
                            <p className={`text-xs mt-1 ${
                              message.sender._id === user.id ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {!selectedConversation?.isAnnouncement && <div ref={messagesEndRef} />}
                  </div>

                  {/* Message Input */}
                  <div className="p-2 border-t border-gray-200 bg-white flex-shrink-0">
                    {marketplaceItemId && (
                      <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        {console.log('🔍 Rendering marketplace buttons, marketplaceItemId:', marketplaceItemId)}
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-medium text-blue-800">📦 Marketplace Item</span>
                            {marketplaceItem && (
                              <div className="text-xs text-blue-600 mt-1">
                                <p>{marketplaceItem.title}</p>
                                <p>Listed Price: ${marketplaceItem.price}</p>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => navigate(`/marketplace/item/${marketplaceItemId}`)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            View Item
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              console.log('💰 Make Offer button clicked');
                              setShowOfferInput(true);
                            }}
                            className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 cursor-pointer transition-colors duration-200"
                            style={{ pointerEvents: 'auto' }}
                          >
                            💰 Make Offer
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('💬 Message Only button clicked');
                              setShowOfferInput(false);
                            }}
                            className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 cursor-pointer transition-colors duration-200"
                            style={{ pointerEvents: 'auto' }}
                          >
                            💬 Message Only
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {showOfferInput && (
                      <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-green-800">
                            Offer Amount ($)
                          </label>
                          <button
                            onClick={() => {
                              setShowOfferInput(false);
                              setOfferAmount('');
                            }}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            ✕ Cancel
                          </button>
                        </div>
                        <input
                          type="number"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder="Enter your offer..."
                          min="1"
                          step="0.01"
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                    
                    {!marketplaceItemId && !showOfferInput && (
                      <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-purple-800">💬 Regular Message</span>
                          <button
                            onClick={() => setShowOfferInput(true)}
                            className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                          >
                            💰 Make Offer
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Hide message input for announcements */}
                    {!selectedConversation.isAnnouncement && (
                      <div className="flex space-x-3 bg-blue-100 p-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={showOfferInput && offerAmount ? "Add a message to your offer (optional)..." : "Type your message..."}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={sending}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (newMessage.trim() || showOfferInput || marketplaceItemId) {
                              sendMessage(e);
                            }
                          }}
                          disabled={sending}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                        >
                          {sending ? '⏳' : '📤'}
                        </button>
                      </div>
                    )}
                    
                    {/* Show announcement info for announcements */}
                    {selectedConversation.isAnnouncement && (
                      <div className="p-2 bg-yellow-50 border-t border-yellow-200">
                        <div className="text-center text-yellow-800">
                          <p className="text-sm">📢 This is a club announcement</p>
                          <p className="text-xs mt-1">You cannot reply to announcements</p>
                        </div>
                      </div>
                    )}

                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-lg font-semibold mb-2">Select a conversation</p>
                    <p className="text-sm mb-4">Choose a conversation from the sidebar or start a new one</p>
                    <button
                      onClick={() => setShowNewConversationModal(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                    >
                      ✨ Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Start New Conversation</h3>
            <p className="text-gray-600 mb-4">Search for users to start a conversation with</p>
            
            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            <div className="mb-4 max-h-48 overflow-y-auto">
              {searching ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser._id}
                      onClick={() => startConversation(searchUser)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {searchUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{searchUser.username}</p>
                          <p className="text-sm text-gray-500">{searchUser.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.length > 0 ? (
                <p className="text-center text-gray-500 py-4">No users found</p>
              ) : (
                <p className="text-center text-gray-500 py-4">Start typing to search for users</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewConversationModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {showDeleteModal && messageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Message</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                "{messageToDelete.content.substring(0, 100)}..."
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setMessageToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMessage(messageToDelete._id)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Conversation Confirmation Modal */}
      {showDeleteConversationModal && conversationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">Delete Conversation</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your entire conversation with{' '}
              <span className="font-semibold">{conversationToDelete.otherUser?.username}</span>?
              This will permanently delete all messages in this conversation.
            </p>
            <div className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
              <p className="text-sm text-red-700">
                ⚠️ This action cannot be undone. All messages will be permanently deleted.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConversationModal(false);
                  setConversationToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConversation(conversationToDelete)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
