import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from "../../../../config";

const NotificationMarqueeLine = () => {
  const [marqueeData, setMarqueeData] = useState([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [scrollDuration, setScrollDuration] = useState(20); // default fallback
  const textRef = useRef(null);

  useEffect(() => {
    const fetchMarqueeData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/notification/active`);
        const data = await response.json();
        const activeNotification = data.filter(
          item => item.isActive === true
        );
        setMarqueeData(activeNotification);
      } catch (error) {
        console.error("Error fetching marquee data:", error);
      }
    };

    fetchMarqueeData();
    const intervalId = setInterval(fetchMarqueeData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (textRef.current) {
      const fullTextWidth = textRef.current.scrollWidth;
      const isMobile = window.innerWidth <= 768;

      // Slower on mobile, faster on desktop
      const duration = isMobile
        ? fullTextWidth / 30
        : fullTextWidth / 60;

      setScrollDuration(duration);
    }
  }, [marqueeData]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 800);
    return () => clearInterval(blinkInterval);
  }, []);

  if (marqueeData.length === 0) return null;

  const combinedText = marqueeData.map(item => item.text).join(" • ");

  return (
    <div className="relative overflow-hidden bg-gray-100 py-2 mx-10 ">
      {/* Fade edges */}
      {/* <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" /> */}

      <div className="marquee-track">
        <div
        // 1 ko "isBlinking" word se replace kiya taaki blink na ho , 1 means true condition hamesha.
          className={`marquee-content ${1 ? 'text-sky-950' : 'text-black'}`}
          ref={textRef}
          style={{
            animationDuration: `${scrollDuration}s`,
          }}
        >
          <span className="text-lg font-medium">{combinedText}</span>
        </div>
      </div>

      <style jsx>{`
        .marquee-track {
          position: relative;
          white-space: nowrap;
          width: 100%;
        }

        .marquee-content {
          display: inline-block;
          padding-left: 100%;
          will-change: transform;
          animation-name: marqueeScroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationMarqueeLine;
