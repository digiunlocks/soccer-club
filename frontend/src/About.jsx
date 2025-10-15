import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade, EffectCube } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-cube';

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryView, setGalleryView] = useState('slider'); // 'slider', 'grid', 'slideshow'
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState({});
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const swiperRef = useRef(null);

  // Sort gallery images by order - moved here to avoid initialization error
  const sortedGallery = aboutData?.gallery?.sort((a, b) => a.order - b.order) || [];

  const fetchAboutData = async () => {
    try {
      // Add cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:5000/api/about?t=${timestamp}`);
      if (!response.ok) {
        throw new Error('Failed to fetch about page data');
      }
      const data = await response.json();
      setAboutData(data);
    } catch (err) {
      console.error('Error fetching about data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
    
    // Expose refresh function globally for other components to call
    window.refreshAboutPage = fetchAboutData;
    
    return () => {
      // Clean up global function when component unmounts
      delete window.refreshAboutPage;
    };
  }, []);

  // Handle image loading states
  const handleImageLoad = (imageId) => {
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = (imageId) => {
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
  };

  // Lightbox functionality
  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (sortedGallery.length > 0) {
      const nextIndex = (currentImageIndex + 1) % sortedGallery.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(sortedGallery[nextIndex]);
    }
  };

  const prevImage = () => {
    if (sortedGallery.length > 0) {
      const prevIndex = currentImageIndex === 0 ? sortedGallery.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(sortedGallery[prevIndex]);
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex, aboutData]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-lg text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Error Loading Content</h3>
          <p>{error}</p>
          <button 
            onClick={fetchAboutData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-gray-600 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
          <p>Please check back later or contact an administrator.</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('About page - Gallery data:', sortedGallery);
  console.log('About page - Total images:', sortedGallery.length);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-green-900 text-center">
          {aboutData.title}
        </h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 mb-8">
          <p className="text-xl leading-relaxed mb-6">{aboutData.description}</p>
          <p className="text-lg text-gray-600">{aboutData.additionalInfo}</p>
        </div>
        
        {/* Club Highlights */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">Club Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aboutData.highlights?.map((highlight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 font-medium">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Gallery Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-green-900 mb-4 sm:mb-0">Gallery</h2>
          
          {/* Gallery View Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setGalleryView('slider')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  galleryView === 'slider' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Slider
              </button>
              <button
                onClick={() => setGalleryView('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  galleryView === 'grid' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setGalleryView('slideshow')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  galleryView === 'slideshow' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Slideshow
              </button>
            </div>
            
            {galleryView === 'slider' && (
              <button
                onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  autoplayEnabled 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {autoplayEnabled ? '⏸️ Pause' : '▶️ Play'}
              </button>
            )}
          </div>
        </div>

        {sortedGallery.length > 0 ? (
          <div className="space-y-6">
            {/* Slider View */}
            {galleryView === 'slider' && (
              <div className="relative">
                <Swiper 
                  ref={swiperRef}
                  spaceBetween={30} 
                  slidesPerView={1} 
                  loop={true} 
                  navigation={true}
                  pagination={{ 
                    clickable: true,
                    dynamicBullets: true
                  }}
                  autoplay={autoplayEnabled ? {
                    delay: 4000,
                    disableOnInteraction: false,
                  } : false}
                  effect="fade"
                  modules={[Navigation, Pagination, Autoplay, EffectFade]}
                  className="rounded-xl shadow-lg overflow-hidden"
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                      effect: undefined
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                      effect: undefined
                    }
                  }}
                >
                  {sortedGallery.map((image, idx) => (
                    <SwiperSlide key={image._id || idx}>
                      <div className="relative group cursor-pointer" onClick={() => openLightbox(image, idx)}>
                        <div className="relative overflow-hidden rounded-lg">
                          <img 
                            src={`http://localhost:5000${image.url}?t=${new Date().getTime()}`} 
                            alt={image.alt} 
                            className="w-full h-64 sm:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                            onLoad={() => handleImageLoad(image._id || idx)}
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDgwMCAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iOTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlCOUJCQTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                              handleImageError(image._id || idx);
                            }}
                          />
                          {imageLoading[image._id || idx] && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                          )}
                        </div>
                        
                        {/* Overlay with caption */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                          <div className="w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-white text-sm font-medium">{image.caption || image.alt}</p>
                          </div>
                        </div>
                        
                        {/* Zoom indicator */}
                        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          🔍
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {/* Grid View */}
            {galleryView === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedGallery.map((image, idx) => (
                  <div 
                    key={image._id || idx} 
                    className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg"
                    onClick={() => openLightbox(image, idx)}
                  >
                    <div className="relative">
                      <img 
                        src={`http://localhost:5000${image.url}?t=${new Date().getTime()}`} 
                        alt={image.alt} 
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        onLoad={() => handleImageLoad(image._id || idx)}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iOTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlCOUJCQTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
                          handleImageError(image._id || idx);
                        }}
                      />
                      {imageLoading[image._id || idx] && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-2xl mb-2">🔍</div>
                        <p className="text-sm font-medium">{image.caption || image.alt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Slideshow View */}
            {galleryView === 'slideshow' && (
              <div className="relative">
                <Swiper 
                  spaceBetween={0} 
                  slidesPerView={1} 
                  loop={true} 
                  navigation={true}
                  pagination={{ 
                    clickable: true,
                    dynamicBullets: true
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  effect="fade"
                  modules={[Navigation, Pagination, Autoplay, EffectFade]}
                  className="rounded-xl shadow-lg overflow-hidden h-96 sm:h-[500px]"
                >
                  {sortedGallery.map((image, idx) => (
                    <SwiperSlide key={image._id || idx}>
                      <div className="relative h-full">
                        <img 
                          src={`http://localhost:5000${image.url}?t=${new Date().getTime()}`} 
                          alt={image.alt} 
                          className="w-full h-full object-cover"
                          onLoad={() => handleImageLoad(image._id || idx)}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDgwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5QjlCQkEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
                            handleImageError(image._id || idx);
                          }}
                        />
                        {imageLoading[image._id || idx] && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                          </div>
                        )}
                        
                        {/* Caption overlay */}
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                            <p className="text-white text-lg font-medium">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {/* Gallery Info */}
            <div className="text-center text-gray-600">
              <p className="text-sm">
                {sortedGallery.length} image{sortedGallery.length !== 1 ? 's' : ''} in gallery
                {galleryView === 'slider' && autoplayEnabled && ' • Auto-playing'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold mb-2">No Gallery Images</h3>
            <p className="text-sm">Gallery images will appear here once they are uploaded.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            
            {/* Navigation buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ‹
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
            >
              ›
            </button>
            
            {/* Image */}
            <img
              src={`http://localhost:5000${selectedImage.url}?t=${new Date().getTime()}`}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Caption */}
            {selectedImage.caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                <p className="text-lg font-medium bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                  {selectedImage.caption}
                </p>
              </div>
            )}
            
            {/* Image counter */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-lg text-sm">
              {currentImageIndex + 1} / {sortedGallery.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 