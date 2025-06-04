
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary
const AchieverSlider = () => {
  const [achievers, setAchievers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const cardsToShow = { mobile: 1, tablet: 2, desktop: 4 };

  // Determine how many cards to display based on screen size
  const [displayCount, setDisplayCount] = useState(cardsToShow.desktop);

  // Fetch achievers data from backend
  useEffect(() => {
    const fetchAchievers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/v1/achievements/`);
        console.log("raw response", response);
        console.log(response.data[0].studentPhoto); // ✅ This is correct
        setAchievers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching achievers:", err);
        setError("Failed to load achievers data");
        setLoading(false);
      }
    };
  
    fetchAchievers();
  }, []);
  
  useEffect(() => { 
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setDisplayCount(cardsToShow.mobile);
      } else if (window.innerWidth < 1024) {
        setDisplayCount(cardsToShow.tablet);
      } else {
        setDisplayCount(cardsToShow.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (autoPlay && achievers.length > 0) {
      interval = setInterval(() => {
        handleNext();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [autoPlay, currentIndex, achievers.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? Math.max(achievers.length - displayCount, 0) : prevIndex - 1;
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1 >= achievers.length ? 0 : prevIndex + 1;
      return newIndex;
    });
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
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
      <div className="text-center text-red-500 py-8">
        <p>{error}</p>
      </div>
    );
  }

  if (achievers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No achievers data available</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white py-8 px-4">
      <div 
        className="relative overflow-hidden px-8 py-4"
        onMouseEnter={() => setAutoPlay(false)}
        onMouseLeave={() => setAutoPlay(true)}
      >
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / displayCount)}%)` }}
        >
          {achievers.map((achiever, index) => (
            <div 
              key={achiever.id} 
              className="flex-shrink-0 px-3 w-full md:w-1/2 lg:w-1/4"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${hoveredCard === index ? 'scale-105 shadow-xl' : ''}`}>
                <div className="relative h-64 overflow-hidden">
                <img
  src={achiever.studentPhoto}
  alt={achiever.studentName}
  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-yellow-300 text-sm font-medium">
                        {new Date(achiever.date).getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{achiever.studentName}</h3>
                  <p className="text-blue-600 font-medium text-sm">{achiever.achievementDetails}</p>
                  <p className="text-gray-500 text-xs mt-1">Roll: {achiever.rollNumber}</p>
                </div>
                <div className={`h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 origin-left transition-transform duration-300 ${hoveredCard === index ? 'scale-x-100' : ''}`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons with improved styles */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
          aria-label="Previous"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-800 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
          aria-label="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Indicator dots */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: Math.max(1, Math.ceil(achievers.length / displayCount)) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx * displayCount)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex >= idx * displayCount && currentIndex < (idx + 1) * displayCount
                ? 'w-6 bg-blue-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AchieverSlider;