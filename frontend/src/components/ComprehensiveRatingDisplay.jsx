import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaThumbsUp, FaFlag, FaReply } from 'react-icons/fa';
import RatingDisplay from './RatingDisplay';
import { API_BASE_URL } from '../config/api';

const ComprehensiveRatingDisplay = ({ 
  sellerId, 
  showDetails = true, 
  showReviews = true,
  maxReviews = 5 
}) => {
  const [ratingStats, setRatingStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchRatingData();
  }, [sellerId]);

  const fetchRatingData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch comprehensive rating stats
      const statsResponse = await fetch(`${API_BASE_URL}/ratings/seller/${sellerId}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const stats = await statsResponse.json();
      
      // Fetch recent reviews
      const reviewsResponse = await fetch(`${API_BASE_URL}/ratings/seller/${sellerId}/reviews?limit=${maxReviews}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reviews = await reviewsResponse.json();
      
      setRatingStats(stats);
      setRecentReviews(reviews);
    } catch (error) {
      console.error('Error fetching rating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpfulVote = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/ratings/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Refresh data
      fetchRatingData();
    } catch (error) {
      console.error('Error voting helpful:', error);
    }
  };

  const handleReportReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to report this review?')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE_URL}/ratings/${reviewId}/report`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        alert('Review reported. Thank you for your feedback.');
      } catch (error) {
        console.error('Error reporting review:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!ratingStats || ratingStats.totalReviews === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="text-4xl mb-2">⭐</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Reviews Yet</h3>
        <p className="text-gray-600">This seller hasn't received any reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Rating Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <RatingDisplay
              rating={ratingStats.averageRating}
              reviewCount={ratingStats.totalReviews}
              showDistribution={true}
              distribution={ratingStats.ratingDistribution}
              size="lg"
              verified={ratingStats.verifiedReviews > 0}
            />
          </div>
          
          {/* Quick Stats */}
          <div className="text-right space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{ratingStats.verifiedReviews}</span> verified reviews
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{ratingStats.responseRate}%</span> response rate
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {showDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Communication</div>
              <div className="flex items-center justify-center space-x-1">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{ratingStats.categoryAverages.communication}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Item Condition</div>
              <div className="flex items-center justify-center space-x-1">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{ratingStats.categoryAverages.itemCondition}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Shipping Speed</div>
              <div className="flex items-center justify-center space-x-1">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{ratingStats.categoryAverages.shippingSpeed}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Value for Money</div>
              <div className="flex items-center justify-center space-x-1">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="font-semibold">{ratingStats.categoryAverages.valueForMoney}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      {showReviews && recentReviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
            {recentReviews.length >= maxReviews && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                {showAllReviews ? 'Show Less' : 'Show All Reviews'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(showAllReviews ? recentReviews : recentReviews.slice(0, maxReviews)).map((review) => (
              <div key={review._id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold">
                        {review.buyer?.username?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.buyer?.username || 'Anonymous'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.isVerified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleHelpfulVote(review._id)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600 text-sm"
                    >
                      <FaThumbsUp className="w-4 h-4" />
                      <span>{review.helpfulVotes?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => handleReportReview(review._id)}
                      className="text-gray-600 hover:text-red-600 text-sm"
                    >
                      <FaFlag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                )}

                {/* Category Ratings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communication:</span>
                    <span className="font-medium">{review.categories?.communication || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{review.categories?.itemCondition || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{review.categories?.shippingSpeed || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium">{review.categories?.valueForMoney || 'N/A'}</span>
                  </div>
                </div>

                {/* Seller Response */}
                {review.sellerResponse && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3 mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaReply className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Seller Response</span>
                      <span className="text-sm text-green-600">
                        {new Date(review.sellerResponseAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-green-700">{review.sellerResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveRatingDisplay;
