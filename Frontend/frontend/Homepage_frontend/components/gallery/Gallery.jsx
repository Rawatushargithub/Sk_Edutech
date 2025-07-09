// GalleryHomepage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../navbar/Navbar';
import API_BASE_URL from "../../../config"
// import Navbart2 from '../Navbart2';

const GalleryHomepage = () => {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [searchTerm, activeTab, media]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/gallery/`);
      setMedia(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      setError('Failed to load gallery items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
    let result = [...media];
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by active tab
    if (activeTab === 'photos') {
      result = result.filter(item => item.mediaType === 'image');
    } else if (activeTab === 'videos') {
      result = result.filter(item => item.mediaType === 'video');
    } else if (activeTab === 'recent') {
      // Sort by date (newest first) for recent tab
      result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Limit to 15 items for recent
      result = result.slice(0, 15);
    }
    
    setFilteredMedia(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const openLightbox = (item) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  const handleLightboxNavigation = (direction) => {
    if (!selectedItem) return;
    
    const currentIndex = filteredMedia.findIndex(item => item._id === selectedItem._id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredMedia.length;
    } else {
      newIndex = (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
    }
    
    setSelectedItem(filteredMedia[newIndex]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-6">
        <p>{error}</p>
        <button 
          onClick={fetchGalleryItems}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='bg-gray-100 pb-4'>
      <div className=''>
        <Navbar/>
      </div>
    <div className="max-w-7xl mx-auto px-4 py-6 mt-6 bg-white rounded-2xl">
      <h1 
      className="text-3xl font-bold text-center text-amber-400 "
      // className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-black"
      >
        Sk Edutech Gallery
        
      </h1>
      <h2 className="text-md font-bold text-center text-gray-400 mb-8">Our Event's Photos & Videos</h2>
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 mx-auto block p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabClick('recent')}
          className={`mr-4 py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'recent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Recently Uploaded
        </button>
        <button
          onClick={() => handleTabClick('photos')}
          className={`mr-4 py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'photos'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => handleTabClick('videos')}
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'videos'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Videos
        </button>
      </div>
      
      {/* Gallery Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No media found.</p>
          {searchTerm && (
            <p className="mt-2">Try adjusting your search term or select a different category.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item._id}
              className="cursor-pointer rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              onClick={() => openLightbox(item)}
            >
              <div className="relative pb-[75%]">
                {item.mediaType === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      poster={item.url.replace(/\.[^/.]+$/, ".jpg")}
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg 
                        className="w-12 h-12 text-white opacity-70" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Lightbox */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="max-w-5xl w-full max-h-screen p-4">
            <div className="relative">
              <button 
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
                aria-label="Close"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              
              {/* Navigation Buttons */}
              <button
                onClick={() => handleLightboxNavigation('prev')}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-r-lg p-2 text-white hover:bg-opacity-70"
                aria-label="Previous"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button
                onClick={() => handleLightboxNavigation('next')}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-l-lg p-2 text-white hover:bg-opacity-70"
                aria-label="Next"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              {/* Media Content */}
              {selectedItem.mediaType === 'image' ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-h-[80vh] mx-auto"
                />
              ) : (
                <video
                  src={selectedItem.url}
                  className="max-h-[80vh] mx-auto"
                  controls
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              )}
              
              {/* Media Info */}
              <div className="text-white text-center mt-4">
                <h3 className="text-xl font-medium">{selectedItem.title}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Uploaded on {new Date(selectedItem.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    
  );
};

export default GalleryHomepage;