import React, { useState, useEffect } from 'react';
import API_BASE_URL from "../../../config"
const BottomMarquee = () => {
  const [marqueeData, setMarqueeData] = useState([]);
  const [isBlinking, setIsBlinking] = useState(false);

  // Fetch marquee data from API
  useEffect(() => {
    const fetchMarqueeData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/marquee/active`); // Replace with your actual API endpoint
        const data = await response.json();
        
        // Filter for active bottom marquees only
        const bottomMarquees = data.filter(
          item => item.position === "bottom" && item.isActive === true
        );
        
        setMarqueeData(bottomMarquees);
      } catch (error) {
        console.error("Error fetching marquee data:", error);
      }
    };

    fetchMarqueeData();
    
    // Set up interval to refresh data every 5 minutes
    const intervalId = setInterval(fetchMarqueeData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Blinking effect timer
  useEffect(() => {
    const blinkingInterval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 800); // Toggle every 800ms
    
    return () => clearInterval(blinkingInterval);
  }, []);

  // Don't render if no active bottom marquees
  if (marqueeData.length === 0) {
    return null;
  }

  return (
    <div 
    className="rounded-2xl mx-10 mb-8 bg-black py-4 overflow-hidden whitespace-nowrap"

    >
      <div className="overflow-hidden whitespace-nowrap">
        <div 
          className={`inline-block animate-marquee ${isBlinking ? 'text-orange-400' : 'text-white'}`}
          style={{
            animation: "marquee 15s linear infinite",
          }}
        >
          {marqueeData.map((item, index) => (
            <span key={item._id || index} className="mx-4 text-lg font-medium">
              {item.text}
            </span>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(600%);
          }
          1000% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BottomMarquee;