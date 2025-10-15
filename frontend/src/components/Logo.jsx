import React from 'react';

const Logo = ({ className = "w-8 h-8", customLogoUrl = null }) => {
  // If custom logo URL is provided, use it
  if (customLogoUrl) {
    return (
      <div className={`${className} flex-shrink-0`}>
        <img 
          src={customLogoUrl} 
          alt="Club Logo" 
          className="w-full h-full object-contain"
          crossOrigin="anonymous"
          onError={(e) => {
            // Fallback to default logo if custom logo fails to load
            console.log("Logo image failed to load:", e.target.src);
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
          onLoad={(e) => {
            console.log("Logo image loaded successfully:", e.target.src);
          }}
        />
        {/* Fallback default logo */}
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full hidden"
        >
          {/* Soccer ball base */}
          <circle cx="16" cy="16" r="15" fill="#15803d" stroke="#fbbf24" strokeWidth="2"/>
          
          {/* Soccer ball pattern - simplified design */}
          <path 
            d="M16 1 C 20 1, 24 3, 26 7 C 28 11, 28 15, 26 19 C 24 23, 20 25, 16 25 C 12 25, 8 23, 6 19 C 4 15, 4 11, 6 7 C 8 3, 12 1, 16 1 Z" 
            fill="#fbbf24" 
            opacity="0.3"
          />
          
          {/* Center circle */}
          <circle cx="16" cy="16" r="3" fill="#fbbf24" opacity="0.6"/>
          
          {/* Decorative lines */}
          <line x1="16" y1="1" x2="16" y2="31" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
          <line x1="1" y1="16" x2="31" y2="16" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
          
          {/* Small decorative dots */}
          <circle cx="8" cy="8" r="1" fill="#fbbf24"/>
          <circle cx="24" cy="8" r="1" fill="#fbbf24"/>
          <circle cx="8" cy="24" r="1" fill="#fbbf24"/>
          <circle cx="24" cy="24" r="1" fill="#fbbf24"/>
        </svg>
      </div>
    );
  }

  // Default logo
  return (
    <div className={`${className} flex-shrink-0`}>
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soccer ball base */}
        <circle cx="16" cy="16" r="15" fill="#15803d" stroke="#fbbf24" strokeWidth="2"/>
        
        {/* Soccer ball pattern - simplified design */}
        <path 
          d="M16 1 C 20 1, 24 3, 26 7 C 28 11, 28 15, 26 19 C 24 23, 20 25, 16 25 C 12 25, 8 23, 6 19 C 4 15, 4 11, 6 7 C 8 3, 12 1, 16 1 Z" 
          fill="#fbbf24" 
          opacity="0.3"
        />
        
        {/* Center circle */}
        <circle cx="16" cy="16" r="3" fill="#fbbf24" opacity="0.6"/>
        
        {/* Decorative lines */}
        <line x1="16" y1="1" x2="16" y2="31" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
        <line x1="1" y1="16" x2="31" y2="16" stroke="#fbbf24" strokeWidth="1" opacity="0.4"/>
        
        {/* Small decorative dots */}
        <circle cx="8" cy="8" r="1" fill="#fbbf24"/>
        <circle cx="24" cy="8" r="1" fill="#fbbf24"/>
        <circle cx="8" cy="24" r="1" fill="#fbbf24"/>
        <circle cx="24" cy="24" r="1" fill="#fbbf24"/>
      </svg>
    </div>
  );
};

export default Logo; 