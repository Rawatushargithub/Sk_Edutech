import { useEffect, useState } from "react";
import { FaStar, FaSearch } from "react-icons/fa";
import Navbart2 from "../navbar/Navbar2";
import API_BASE_URL from "../../../config"; // Adjust the import path as necessary
const NAllReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCode, setFilterCode] = useState("all");
  const [reviewType, setReviewType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reviewsPerPage = 5;

  useEffect(() => {
    // Fetch reviews from the backend API
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch(`${API_BASE_URL}/api/v1/feedbacks`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the API response to match our component's expected format
        const formattedReviews = data.map(review => ({
          id: review._id,
          name: review.studentName,
          rollNumber: review.rollNumber,
          rating: review.rating,
          comment: review.comment,
          code: review.rollNumber.substring(0, 3), // Assuming first 3 digits of roll number represent center code
          date: new Date(review.createdAt).toLocaleDateString(),
          createdAt: review.createdAt
        }));
        
        setReviews(formattedReviews);
        setFilteredReviews(formattedReviews);
        calculateStats(formattedReviews);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, []);

  // Filtering logic
  useEffect(() => {
    let filtered = reviews;

    // Filter by Center Code
    if (filterCode !== "all") {
      filtered = filtered.filter((review) => review.code === filterCode);
    }

    // Filter by Review Type
    if (reviewType === "positive") {
      filtered = filtered.filter((review) => review.rating >= 4);
    } else if (reviewType === "negative") {
      filtered = filtered.filter((review) => review.rating < 4);
    }

    
    if (searchQuery?.trim() !== "") {
      filtered = filtered.filter((review) =>
        review.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    

    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [filterCode, reviewType, searchQuery, reviews]);

  // Calculate statistics
  const calculateStats = (reviewsData) => {
    if (!reviewsData.length) return;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviewsData.forEach((review) => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });

    const totalRatingPoints = reviewsData.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    
    const averageRating = (totalRatingPoints / reviewsData.length).toFixed(1);

    setStats({
      averageRating,
      totalReviews: reviewsData.length,
      distribution,
    });
  };

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  // Get unique center codes for the dropdown
  const centerCodes = [...new Set(reviews.map(review => review.code))];
  
  // Calculate the maximum count for proper scaling of bars
  const maxCount = Math.max(...Object.values(stats.distribution));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar placeholder */}
      <Navbart2 />
      
      {/* Main content */}
      <div className="mt-20 pt-20 pb-10 px-4 md:px-6 lg:px-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Reviews</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Review Summary (fixed on larger screens) */}
            <div className="w-full lg:w-1/3">
              <div className="lg:sticky lg:top-24 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Review Summary</h2>
                
                {/* Average rating */}
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <span className="text-5xl font-bold text-indigo-900">{stats.averageRating}</span>
                  </div>
                  <div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < Math.round(stats.averageRating)
                              ? "text-yellow-400 text-xl"
                              : "text-yellow-400 text-xl opacity-30"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 mt-1">
                      Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>
                
                {/* Rating distribution */}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <span className="w-6 text-gray-700 font-medium">{rating}</span>
                      <FaStar className="text-yellow-400 mr-2" />
                      <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{
                            width: `${maxCount ? (stats.distribution[rating] / maxCount) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 w-6 text-center text-gray-700">
                        {stats.distribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right column - Filters and Reviews */}
            <div className="flex-1">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-64">
                    <label htmlFor="centerCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Center
                    </label>
                    <select
                      id="centerCode"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={filterCode}
                      onChange={(e) => setFilterCode(e.target.value)}
                    >
                      <option value="all">All Centers</option>
                      {centerCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full md:w-64">
                    <label htmlFor="reviewType" className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Rating
                    </label>
                    <select
                      id="reviewType"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={reviewType}
                      onChange={(e) => setReviewType(e.target.value)}
                    >
                      <option value="all">All Reviews</option>
                      <option value="positive">Positive Reviews (4-5 ★)</option>
                      <option value="negative">Critical Reviews (1-3 ★)</option>
                    </select>
                  </div>
                  
                  <div className="w-full md:flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                      Search Reviews
                    </label>
                    <div className="relative">
                      <input
                        id="search"
                        type="text"
                        placeholder="Search by name or keyword"
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reviews List */}
              <div className="space-y-4">
                {currentReviews.length > 0 ? (
                  currentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-800">
                          {review.name || "Anonymous"}
                        </h3>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < review.rating ? "text-yellow-400" : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-2">{review.comment}</p>
                      
                      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                        <span>Roll Number: {review.rollNumber}</span>
                        <span>Posted on: {review.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">No reviews found matching your criteria.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <nav className="flex items-center space-x-1">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === i + 1
                            ? "bg-orange-500 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NAllReviewsPage;