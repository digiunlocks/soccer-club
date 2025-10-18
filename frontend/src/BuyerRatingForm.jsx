import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimes, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function BuyerRatingForm({ buyerId, itemId, onClose }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/buyer-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          buyerId: buyerId,
          itemId: itemId,
          rating: rating,
          review: review
        })
      });

      if (response.ok) {
        toast.success('Thank you for rating the buyer!');
        if (onClose) onClose();
        else navigate('/account?tab=marketplace&subtab=offers');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          Rate the Buyer
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Help build trust in the marketplace</strong>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Rate the buyer's communication, reliability, and payment
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Rating *</label>
          <div className="flex gap-3 justify-center">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-5xl focus:outline-none transition-transform hover:scale-110"
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-2 font-semibold">{rating} out of 5 stars</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Share your experience with this buyer (e.g., prompt payment, good communication, etc.)..."
            maxLength="500"
          />
          <p className="text-xs text-gray-500 mt-1">{review.length}/500 characters</p>
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
}

