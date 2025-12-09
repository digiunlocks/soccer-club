import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

export default function ContactSellerModal({ item, user, onClose }) {
  const [message, setMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (messageType === 'offer' && (!offerAmount || offerAmount <= 0)) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    // Prevent messaging yourself
    if (user && item && user.id === item.seller) {
      toast.error('You cannot message yourself');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/${item._id}/contact-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: message.trim(),
          offerAmount: messageType === 'offer' ? parseFloat(offerAmount) : null
        })
      });

      if (response.ok) {
        toast.success('Message sent successfully! The seller will be notified.');
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">💬 Contact Seller</h3>
          <p className="text-sm text-blue-100 mt-1">{item?.title}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMessageType('message')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                messageType === 'message' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              💬 Message
            </button>
            <button
              type="button"
              onClick={() => setMessageType('offer')}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                messageType === 'offer' ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              💰 Offer
            </button>
          </div>

          {messageType === 'offer' && (
            <input
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="Offer amount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          )}

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            required
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
