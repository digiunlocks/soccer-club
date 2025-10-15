import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdvertisingSection() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [advertisementsEnabled, setAdvertisementsEnabled] = useState(false); // Default to false

  // Check if advertisements are enabled
  useEffect(() => {
    const checkAdvertisementsEnabled = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/settings/advertisements-enabled');
        
        if (response.ok) {
          const data = await response.json();
          console.log('Advertisement setting:', data);
          setAdvertisementsEnabled(data.enableAdvertisements === true); // Only true if explicitly true
        } else {
          console.log('Failed to fetch settings, defaulting to disabled');
          setAdvertisementsEnabled(false); // Default to disabled on error
        }
      } catch (err) {
        console.error('Error checking advertisement settings:', err);
        setAdvertisementsEnabled(false); // Default to disabled on error
      }
    };

    checkAdvertisementsEnabled();
  }, []);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      // Don't fetch advertisements if they're disabled
      if (!advertisementsEnabled) {
        console.log('Advertisements disabled, not fetching data');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/advertisements/public?limit=6');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAdvertisements(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching advertisements:', err);
        setError('Failed to load updates');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [advertisementsEnabled]);

  // Auto-rotate advertisements every 5 seconds
  useEffect(() => {
    if (advertisements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === advertisements.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [advertisements.length]);

  const handleClick = async (adId) => {
    try {
      await fetch(`http://localhost:5000/api/advertisements/${adId}/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'club-update':
        return '🏆';
      case 'merchandise':
        return '🛍️';
      case 'other-club':
        return '⚽';
      case 'community-event':
        return '🎉';
      case 'league':
        return '🏅';
      case 'training':
        return '🎯';
      case 'tournament':
        return '🏆';
      default:
        return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'club-update':
        return 'bg-green-500';
      case 'merchandise':
        return 'bg-blue-500';
      case 'other-club':
        return 'bg-purple-500';
      case 'community-event':
        return 'bg-orange-500';
      case 'league':
        return 'bg-indigo-500';
      case 'training':
        return 'bg-teal-500';
      case 'tournament':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'club-update':
        return 'Club Update';
      case 'merchandise':
        return 'Store';
      case 'other-club':
        return 'Other Club';
      case 'community-event':
        return 'Community';
      case 'league':
        return 'League';
      case 'training':
        return 'Training';
      case 'tournament':
        return 'Tournament';
      default:
        return 'Update';
    }
  };

  // Return null if advertisements are disabled
  if (!advertisementsEnabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📢</span>
            <h3 className="font-bold text-lg">Updates & Announcements</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-bold text-lg">Updates & Announcements</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (advertisements.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📢</span>
            <h3 className="font-bold text-lg">Updates & Announcements</h3>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="text-4xl mb-4">📢</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h4>
          <p className="text-sm text-gray-600">
            Check back soon for the latest updates, events, and announcements.
          </p>
        </div>
      </div>
    );
  }

  const currentAd = advertisements[currentIndex];

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getTypeIcon(currentAd.type)}</span>
            <h3 className="font-bold text-lg">Updates & Announcements</h3>
          </div>
          {advertisements.length > 1 && (
            <div className="flex space-x-1">
              {advertisements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Type Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(currentAd.type)}`}>
            {getTypeLabel(currentAd.type)}
          </span>
          {currentAd.badge && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${currentAd.badgeColor}`}>
              {currentAd.badge}
            </span>
          )}
        </div>

        {/* Title and Subtitle */}
        <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {currentAd.title}
        </h4>
        {currentAd.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            {currentAd.subtitle}
          </p>
        )}

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">
          {currentAd.description}
        </p>

        {/* Event Details */}
        {(currentAd.eventDate || currentAd.eventDateText || currentAd.location) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-5 h-5 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                {(currentAd.eventDate || currentAd.eventDateText) && (
                  <p className="text-sm font-medium text-gray-900">
                    {currentAd.eventDateText || new Date(currentAd.eventDate).toLocaleDateString()}
                  </p>
                )}
                {currentAd.location && (
                  <p className="text-sm text-gray-600">
                    📍 {currentAd.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing */}
        {(currentAd.price || currentAd.originalPrice) && (
          <div className="flex items-center space-x-2 mb-4">
            {currentAd.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {currentAd.originalPrice}
              </span>
            )}
            {currentAd.price && (
              <span className="text-lg font-bold text-green-600">
                {currentAd.price}
              </span>
            )}
            {currentAd.discount && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                {currentAd.discount}
              </span>
            )}
          </div>
        )}

        {/* Organization Info (for external content) */}
        {currentAd.organization?.name && (
          <div className="flex items-center space-x-2 mb-4 p-2 bg-blue-50 rounded-lg">
            {currentAd.organization.logo && (
              <img 
                src={currentAd.organization.logo} 
                alt={currentAd.organization.name}
                className="w-6 h-6 rounded"
              />
            )}
            <span className="text-sm text-blue-700 font-medium">
              {currentAd.organization.name}
            </span>
          </div>
        )}

        {/* Call to Action */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleClick(currentAd._id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              currentAd.ctaType === 'external' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {currentAd.ctaText}
            {currentAd.ctaType === 'external' && (
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
          </button>
          
          {advertisements.length > 1 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{currentIndex + 1}</span>
              <span>/</span>
              <span>{advertisements.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 