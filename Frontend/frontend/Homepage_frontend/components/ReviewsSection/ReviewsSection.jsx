import { useEffect, useState } from "react";
import { FaStar, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios to make API requests
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch reviews from your backend API
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/feedbacks`); 
        console.log(response.data); 
        setReviews(response.data); // Set the fetched reviews data to state
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchReviews();
  }, []); // Empty dependency array ensures this only runs once on component mount

  const handleNextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 3 >= reviews.length ? 0 : prevIndex + 3
    );
  };

  const handlePrevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 3 < 0 ? Math.max(0, reviews.length - 3) : prevIndex - 3
    );
  };

  const handleViewAll = () => {
    navigate("allreviews"); // Adjust this for the correct navigation
  };

  // Get current visible reviews (3 at a time)
  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);
  if (visibleReviews.length < 3 && reviews.length > 3) {
    const remaining = 3 - visibleReviews.length;
    visibleReviews.push(...reviews.slice(0, remaining));
  }

  return (
    <div className="bg-[#FCEEE3] py-14">
      <h2 className="text-3xl font-bold text-center mb-6">
        What Our Students Say
      </h2>
      <div className="border-t-4 border-black w-20 mx-auto mb-8"></div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
          {visibleReviews.map((review, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between h-full"
            >
              <h3 className="text-lg font-bold text-orange-500">
                {review.studentName || "Anonymous"} {/* Use student's name or default to Anonymous */}
              </h3>
              {/* Star Rating */}
              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < review.rating ? "text-yellow-500" : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <p className="text-gray-700 mt-2">{review.comment}</p>

              {/* Center Code */}
              <p className="text-sm text-gray-500 mt-auto text-right">
                Center: {review.code}
              </p>

              {/* Date Posted */}
              <p className="text-sm text-gray-500 text-right">
                Posted on: {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-end mt-8 gap-4">
          {/* Previous Arrow */}
          <button
            onClick={handlePrevSlide}
            className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition duration-300"
            aria-label="Previous reviews"
          >
            <FaArrowLeft />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNextSlide}
            className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition duration-300"
            aria-label="Next reviews"
          >
            <FaArrowRight />
          </button>

          {/* View All Button */}
          <button
            onClick={handleViewAll}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-300"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;