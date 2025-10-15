import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UnifiedMessaging from './components/UnifiedMessaging';
import ConversationView from './components/ConversationView';

export default function MessagesNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showConversation, setShowConversation] = useState(false);
  const [conversationParams, setConversationParams] = useState(null);

  useEffect(() => {
    const contactId = searchParams.get('contact');
    const itemId = searchParams.get('item');
    const type = searchParams.get('type');

    if (contactId) {
      setConversationParams({
        otherUserId: contactId,
        itemId: itemId,
        messageType: type || 'general_inquiry'
      });
      setShowConversation(true);
    } else {
      setShowConversation(false);
      setConversationParams(null);
    }
  }, [searchParams]);

  const handleBackToInbox = () => {
    setShowConversation(false);
    setConversationParams(null);
    navigate('/messages');
  };

  if (showConversation && conversationParams) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ConversationView
            otherUserId={conversationParams.otherUserId}
            messageType={conversationParams.messageType}
            onBack={handleBackToInbox}
          />
        </div>
      </div>
    );
  }

  return <UnifiedMessaging />;
}

