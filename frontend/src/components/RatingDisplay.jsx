import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const RatingDisplay = ({ 
  rating, 
  reviewCount, 
  showDistribution = false, 
  distribution = null,
  size = 'md',
  showCount = true,
  showTrend = false,
  trend = null,
  verified = false
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const starSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={`${starSizeClasses[size]} text-yellow-400`} 
        />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt 
          key="half" 
          className={`${starSizeClasses[size]} text-yellow-400`} 
        />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar 
          key={`empty-${i}`} 
          className={`${starSizeClasses[size]} text-gray-300`} 
        />
      );
    }
    
    return stars;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Average';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Main Rating Display */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {renderStars(rating)}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`font-semibold ${sizeClasses[size]} ${getRatingColor(rating)}`}>
            {rating.toFixed(1)}
          </span>
          {verified && (
            <span className="text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded">
              ✓ Verified
            </span>
          )}
        </div>
        {showCount && (
          <span className={`text-gray-600 ${sizeClasses[size]}`}>
            ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>

      {/* Rating Label */}
      <div className={`${sizeClasses[size]} ${getRatingColor(rating)} font-medium`}>
        {getRatingLabel(rating)}
      </div>

      {/* Rating Distribution */}
      {showDistribution && distribution && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-700">Rating Breakdown:</div>
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center space-x-2">
              <span className="text-sm w-8">{stars}⭐</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${distribution[stars] ? (distribution[stars] / reviewCount) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-8">
                {distribution[stars] || 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Trend Indicator */}
      {showTrend && trend && (
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">Recent trend:</span>
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '↗️ Improving' : trend < 0 ? '↘️ Declining' : '→ Stable'}
          </span>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
