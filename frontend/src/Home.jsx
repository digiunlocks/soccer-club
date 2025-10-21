import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdvertisingSection from "./components/AdvertisingSection";

const API_URL = "http://localhost:5000/api/hero-content";
const HERO_TEXT_URL = "http://localhost:5000/api/hero-text-settings";
const HOMEPAGE_CONTENT_URL = "http://localhost:5000/api/homepage-content";

export default function Home() {
  const [heroItems, setHeroItems] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayMode, setDisplayMode] = useState("slideshow");
  const [slideshowSettings, setSlideshowSettings] = useState({
    autoPlay: true,
    interval: 5000,
    showDots: true,
    showArrows: true
  });
  const [homepageContent, setHomepageContent] = useState(null);
  const [heroTextSettings, setHeroTextSettings] = useState({
    caption: "Welcome to Our Soccer Club",
    subtitle: "Building Champions, Creating Memories",
    buttonText: "",
    buttonLink: "",
    enabled: false,
    textPosition: "center",
    textColor: "white",
    backgroundColor: "rgba(0,0,0,0.4)"
  });

  // Fetch hero text settings
  useEffect(() => {
    fetch(`${HERO_TEXT_URL}/public`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('🎯 Hero text settings received:', data);
        setHeroTextSettings(data);
      })
      .catch(error => {
        console.error('Error fetching hero text settings:', error);
      });
  }, []);

  // Fetch hero content
  useEffect(() => {
    fetch(`${API_URL}/public`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Sort items by order and filter visible items
          const sortedItems = data
            .filter(item => item.visible)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          
          setHeroItems(sortedItems);
          if (sortedItems.length > 0) {
            // Use the first item's media type to determine display mode
            const firstItem = sortedItems[0];
            setDisplayMode(firstItem.mediaType || firstItem.type || "slideshow");
          }
        } else {
          console.error('Data is not an array:', data);
          setHeroItems([]);
        }
      })
      .catch(error => {
        console.error('Error fetching hero content:', error);
        setHeroItems([]);
      });
  }, []);

  // Fetch other content
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/slideshow-settings`).then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      }),
      fetch(HOMEPAGE_CONTENT_URL).then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
    ])
      .then(([settingsData, homepageData]) => {
        setSlideshowSettings(settingsData);
        setHomepageContent(homepageData);
      })
      .catch(err => {
        console.error('Error fetching settings:', err);
        // Set default values if fetch fails
        setSlideshowSettings({
          autoPlay: true,
          interval: 5000,
          showDots: true,
          showArrows: true
        });
      });
  }, []);

  // Slideshow auto-advance
  useEffect(() => {
    if (heroItems.length > 1) {
      // Check if we should autoplay based on media types and settings
      const shouldAutoplay = heroItems.some(item => {
        const mediaType = item.mediaType || item.type || 'image';
        return mediaType === 'slideshow' || (mediaType === 'image' && item.autoplay !== false);
      });
      
      if (shouldAutoplay) {
        // Use the current slide's interval or default
        const currentItem = heroItems[currentSlide];
        const interval = currentItem?.slideshowInterval || slideshowSettings.interval || 5000;
        
        console.log('🎬 Starting autoplay:', { interval, currentSlide, mediaType: currentItem?.mediaType });
        
        const autoAdvance = setInterval(() => {
          setCurrentSlide(prev => {
            const next = (prev + 1) % heroItems.length;
            console.log('🎬 Advancing slide:', { from: prev, to: next });
            return next;
          });
        }, interval);
      
      return () => {
          console.log('🎬 Stopping autoplay');
          clearInterval(autoAdvance);
        };
      }
    }
  }, [currentSlide, slideshowSettings.interval, heroItems]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroItems.length) % heroItems.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen">
      {/* ENHANCED HERO SECTION */}
      <div style={{
        width: '100%',
        height: '70vh',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto'
      }}>
        {/* HERO CONTENT */}
        {heroItems.length > 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {heroItems.map((item, index) => {
              const isActive = index === currentSlide;
              const mediaType = item.mediaType || item.type || 'image';
              
              // Transition styles based on item settings
              const transitionEffect = item.transitionEffect || 'fade';
              let transitionStyle = {};
              
              if (transitionEffect === 'fade') {
                transitionStyle = {
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 1s ease-in-out'
                };
              } else if (transitionEffect === 'slide') {
                transitionStyle = {
                  transform: `translateX(${isActive ? '0%' : '-100%'})`,
                  transition: 'transform 1s ease-in-out'
                };
              } else if (transitionEffect === 'slideRight') {
                transitionStyle = {
                  transform: `translateX(${isActive ? '0%' : '100%'})`,
                  transition: 'transform 1s ease-in-out'
                };
              } else if (transitionEffect === 'zoom') {
                transitionStyle = {
                  transform: `scale(${isActive ? 1 : 1.1})`,
                  opacity: isActive ? 1 : 0,
                  transition: 'transform 1s ease-in-out, opacity 1s ease-in-out'
                };
              }
              
              return (
                  <div
                    key={item._id || index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                    ...transitionStyle
                  }}
                >
                  {mediaType === 'video' ? (
                    <video
                        src={item.url}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center'
                      }}
                      autoPlay={item.autoplay !== false}
                      muted
                      loop
                      controls={item.showControls !== false}
                      onLoadedData={() => console.log('✅ VIDEO LOADED')}
                      onError={() => console.log('❌ VIDEO FAILED')}
                    />
                  ) : (
                    <img
                        src={item.url}
                      alt={item.caption || 'Hero content'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center'
                      }}
                      onLoad={() => console.log('✅ IMAGE LOADED')}
                      onError={() => console.log('❌ IMAGE FAILED')}
                    />
            )}
          </div>
              );
            })}
            </div>
          )}

        {/* OVERLAY */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 10
        }} />
        
        {/* GLOBAL TEXT OVERLAY / BRANDING */}
        {heroItems.length > 0 && heroTextSettings.caption && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: heroTextSettings.textPosition === 'center' ? '50%' : 
                  heroTextSettings.textPosition === 'left' ? '10%' : '90%',
            transform: heroTextSettings.textPosition === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)',
            zIndex: 15,
            textAlign: heroTextSettings.textPosition === 'center' ? 'center' : 
                      heroTextSettings.textPosition === 'left' ? 'left' : 'right',
            color: heroTextSettings.textColor,
            width: heroTextSettings.textPosition === 'center' ? '90%' : 'auto',
            maxWidth: '1200px',
            padding: '20px'
          }}>
            <h1 style={{
              fontSize: heroTextSettings.fontSize?.caption || 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: 'bold',
              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
              marginBottom: '15px',
              lineHeight: '1.2'
            }}>
              {heroTextSettings.caption}
            </h1>
            {heroTextSettings.subtitle && (
              <p style={{
                fontSize: heroTextSettings.fontSize?.subtitle || 'clamp(0.9rem, 2vw, 1.2rem)',
                textShadow: '1px 1px 4px rgba(0,0,0,0.8)',
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {heroTextSettings.subtitle}
              </p>
            )}
            {heroTextSettings.buttonText && heroTextSettings.buttonLink && (
              <a 
                href={heroTextSettings.buttonLink}
                style={{
                  display: 'inline-block',
                  padding: '15px 40px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textShadow: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#45a049';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#4CAF50';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {heroTextSettings.buttonText}
              </a>
            )}
            </div>
          )}

        {/* NAVIGATION ARROWS */}
        {heroItems.length > 1 && heroItems.some(item => item.showControls !== false) && (
            <>
              <button
              onClick={prevSlide}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.7)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.5)'}
            >
              ←
              </button>
              <button
              onClick={nextSlide}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.7)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.5)'}
            >
              →
              </button>
            </>
          )}

        {/* DOTS INDICATOR */}
        {heroItems.length > 1 && heroItems.some(item => item.showControls !== false) && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 20
          }}>
            {heroItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (index !== currentSlide) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentSlide) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.5)';
                  }
                }}
              />
            ))}
          </div>
        )}

          </div>
          
      {/* Updates & Announcements Section */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <AdvertisingSection />
        </div>
      </div>
          
      {/* Main Content Sections */}
      {homepageContent && (
        <main className="bg-gray-50">
          {/* Welcome Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">{homepageContent.welcomeTitle}</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                {homepageContent.welcomeSubtitle}
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {homepageContent.values && homepageContent.values.map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
            </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
                </div>
            </div>
          </section>

          {/* Programs Section */}
          {homepageContent.programs && homepageContent.programs.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">{homepageContent.programsTitle}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {homepageContent.programsSubtitle}
                </p>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {homepageContent.programs.map((program, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col h-full">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight">{program.title}</h3>
                      {program.features && (
                        <ul className="text-sm text-gray-500 mb-6 space-y-2 flex-grow">
                          {program.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="leading-relaxed">• {feature}</li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-col items-center mt-auto pt-4 space-y-3">
                        <span className="text-xl font-bold text-green-600">{program.price}</span>
                        <Link to={program.link} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm w-full text-center">
                          Learn More
                        </Link>
                      </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

          {/* Events Section */}
          {homepageContent.events && homepageContent.events.length > 0 && (
            <section className="py-16 bg-white/50 backdrop-blur-sm">
              <div className="container mx-auto px-4">
          <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">{homepageContent.eventsTitle}</h2>
                  <p className="text-xl text-gray-600">{homepageContent.eventsSubtitle}</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {homepageContent.events.map((event, index) => {
                    const eventDate = new Date(event.date);
                    const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    const day = eventDate.getDate();
                    
                    return (
                      <div key={index} className={`bg-gradient-to-br from-${event.color}-50 to-${event.color}-100 rounded-lg p-6 border-l-4 border-${event.color}-500`}>
                        <div className="flex items-center mb-4">
                          <div className={`w-12 h-12 bg-${event.color}-500 rounded-full flex items-center justify-center text-white font-bold`}>
                            {month}
                </div>
                          <div className="ml-4">
                            <div className="text-2xl font-bold text-gray-800">{day}</div>
                            <div className="text-sm text-gray-600">{eventDate.getFullYear()}</div>
                </div>
              </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                        <div className={`text-${event.color}-600 font-semibold mb-2`}>{event.time} • {event.location}</div>
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                          {event.location}
                </div>
              </div>
                    );
                  })}
                </div>
                <div className="text-center mt-8">
                  <Link to="/schedules" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                    View All Events
                  </Link>
            </div>
          </div>
        </section>
          )}

          {/* Teams Section */}
          {homepageContent.teams && homepageContent.teams.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4">{homepageContent.teamsTitle}</h2>
                  <p className="text-xl text-gray-600">{homepageContent.teamsSubtitle}</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {homepageContent.teams.map((team, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
                      <div className={`w-20 h-20 bg-gradient-to-br from-${team.color}-400 to-${team.color}-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className="text-white font-bold text-xl">{team.name.charAt(0)}</span>
                </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{team.name}</h3>
                      <div className="text-lg text-gray-600 mb-2">{team.division}</div>
                      <div className="text-sm text-gray-500 mb-4">Coach: {team.coach}</div>
                      <div className={`bg-${team.color}-100 text-${team.color}-800 px-4 py-2 rounded-full text-sm font-semibold mb-4`}>
                        Record: {team.record}
                </div>
                      <Link to={team.link} className="text-green-600 hover:text-green-700 font-semibold">
                        View Team Details →
                      </Link>
              </div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link to="/teams" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                    View All Teams
              </Link>
            </div>
          </div>
        </section>
          )}
        </main>
      )}
    </div>
  );
} 