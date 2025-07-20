import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from "../../../config";

const TopMarquee = () => {
  const [marqueeData, setMarqueeData] = useState([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch marquee data from API
  useEffect(() => {
    const fetchMarqueeData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/marquee/active`);
        const data = await response.json();
        
        // Filter for active top marquees only
        const topMarquees = data.filter(
          item => item.position === "top" && item.isActive === true
        );
        
        setMarqueeData(topMarquees);
      } catch (error) {
        console.error("Error fetching marquee data:", error);
      }
    };

    fetchMarqueeData();
    const intervalId = setInterval(fetchMarqueeData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Calculate text width for smooth animation
  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textElement = textRef.current;
      const containerWidth = containerRef.current.offsetWidth;
      const fullTextWidth = textElement.scrollWidth;
      
      setTextWidth(fullTextWidth);
      
      // Calculate animation duration based on text length for consistent speed
      const duration = Math.max(15, (fullTextWidth / 50)); // Adjust speed as needed
      textElement.style.animationDuration = `${duration}s`;
    }
  }, [marqueeData]);

  // Blinking effect timer
  useEffect(() => {
    const blinkingInterval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 800);
    
    return () => clearInterval(blinkingInterval);
  }, []);

  // Don't render if no active top marquees
  if (marqueeData.length === 0) {
    return null;
  }

  const combinedText = marqueeData.map(item => item.text).join(' • ');

  return (
    <div 
      ref={containerRef}
      className="rounded-2xl mx-10 mb-8 bg-black py-4 overflow-hidden relative"
    >
      {/* Left fade gradient for smooth disappearing effect */}
      <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      
      {/* Right fade gradient for smooth appearing effect */}
      <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      
      <div className="overflow-hidden whitespace-nowrap relative">
        <div 
          ref={textRef}
          className={`inline-block animate-smooth-marquee ${isBlinking ? 'text-orange-400' : 'text-white'}`}
          style={{
            willChange: 'transform',
          }}
        >
          <span className="text-lg font-medium">
            {combinedText}
          </span>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes smooth-marquee {
          0% {
            transform: translateX(800%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-smooth-marquee {
          animation: smooth-marquee 40s linear infinite;
        }
        
        /* Ensure smooth hardware acceleration */
        .animate-smooth-marquee {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default TopMarquee;



// import React, { useState, useEffect } from 'react';
// import API_BASE_URL from "../../../config";
// const TopMarquee = () => {
//   const [marqueeData, setMarqueeData] = useState([]);
//   const [isBlinking, setIsBlinking] = useState(false);

//   // Fetch marquee data from API
//   useEffect(() => {
//     const fetchMarqueeData = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/v1/marquee/active`); // Replace with your actual API endpoint
//         const data = await response.json();
        
//         // Filter for active top marquees only
//         const topMarquees = data.filter(
//           item => item.position === "top" && item.isActive === true
//         );
        
//         setMarqueeData(topMarquees);
//       } catch (error) {
//         console.error("Error fetching marquee data:", error);
//       }
//     };

//     fetchMarqueeData();
    
//     // Set up interval to refresh data every 5 minutes
//     const intervalId = setInterval(fetchMarqueeData, 5 * 60 * 1000);
    
//     return () => clearInterval(intervalId);
//   }, []);

//   // Blinking effect timer
//   useEffect(() => {
//     const blinkingInterval = setInterval(() => {
//       setIsBlinking(prev => !prev);
//     }, 800); // Toggle every 800ms
    
//     return () => clearInterval(blinkingInterval);
//   }, []);

//   // Don't render if no active top marquees
//   if (marqueeData.length === 0) {
//     return null;
//   }

//   return (
//     <div 
    
//     className="rounded-2xl mx-10 mb-8 bg-black py-4 overflow-hidden whitespace-nowrap"

//     >
//       <div className="overflow-hidden whitespace-nowrap">
//         <div 
//           className={`inline-block animate-marquee  ${isBlinking ? 'text-orange-400' : 'text-white'}`}
//           style={{
//             animation: "marquee 20s linear infinite",
//           }}
//         >
//           {marqueeData.map((item, index) => (
//             <span key={item._id || index} className="mx-4 text-lg font-medium">
//               {item.text}
//             </span>
//           ))}
//         </div>
//       </div>
      
//       <style jsx>{`
//         @keyframes marquee {
//           0% {
//             transform: translateX(800%);
//           }
//           100% {
//             transform: translateX(-100%);
//           }
//         }
//         .animate-marquee {
//           animation: marquee 20s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default TopMarquee;