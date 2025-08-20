import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  Clock, 
  DollarSign, 
  Award, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Loader2
} from "lucide-react";
import API_BASE_URL from "../../config";
import axios from "axios";

const CourseDetails = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentData = JSON.parse(localStorage.getItem("student"));
  const courseCode = studentData?.courseCode || "";

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const res = await axios.get(`${API_BASE_URL}/api/v1/coursedetails/${courseCode}`);
        if (res.data.success) {
          setCourse(res.data.data);
        } else {
          setError("Course not found");
        }
      } catch (err) {
        setError("Failed to fetch course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseCode) {
      fetchCourse();
    }
  }, [courseCode]);

  // Loading Component
  const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Course Details</h3>
        <p className="text-gray-600">Please wait while we fetch your course information...</p>
        
        {/* Loading bars animation */}
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-pulse"
                style={{
                  width: `${60 + (i * 15)}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Error Component
  const ErrorScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;
  if (!course) return null;

  const getStatusIcon = (status) => {
    return status === 'active' ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 
      'bg-green-100 text-green-800' : 
      'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const discount = course.courseMRP - course.courseFees;
  const discountPercentage = Math.round((discount / course.courseMRP) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Course Details
            </h1>
            <p className="text-sky-100 text-lg">
              Everything you need to know about your enrolled course
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Course Image Section */}
          {course.courseImage && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img 
                src={course.courseImage} 
                alt={course.courseName} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{course.courseName}</h2>
                <p className="text-sky-200 text-lg">{course.courseSubject}</p>
              </div>
            </div>
          )}

          {/* Course Info Grid */}
          <div className="p-8 md:p-12">
            {!course.courseImage && (
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{course.courseName}</h2>
                <p className="text-sky-600 text-xl">{course.courseSubject}</p>
              </div>
            )}

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="w-6 h-6 text-sky-600" />
                  <span className="font-semibold text-gray-700">Course Code</span>
                </div>
                <p className="text-2xl font-bold text-sky-700">{course.courseCode}</p>
              </div>

              <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-6 h-6 text-sky-600" />
                  <span className="font-semibold text-gray-700">Duration</span>
                </div>
                <p className="text-2xl font-bold text-sky-700">{course.courseDuration} months</p>
              </div>

              <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="w-6 h-6 text-sky-600" />
                  <span className="font-semibold text-gray-700">Franchise</span>
                </div>
                <p className="text-lg font-bold text-sky-700">{course.franchiseId}</p>
              </div>

              <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(course.instituteStatus)}
                  <span className="font-semibold text-gray-700">Status</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(course.instituteStatus)}`}>
                  {course.instituteStatus}
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                Course Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Original Price</p>
                  <p className="text-2xl font-bold text-red-500 line-through">{formatCurrency(course.courseMRP)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Course Fees</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(course.courseFees)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">You Save</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(discount)} ({discountPercentage}% off)
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Course Syllabus */}
              <div className="bg-sky-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <BookOpen className="w-6 h-6 text-sky-600 mr-2" />
                  Course Syllabus
                </h3>
                <div className="prose prose-sky max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.courseSyllabus}
                  </p>
                </div>
              </div>

              {/* Course Eligibility */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <User className="w-6 h-6 text-blue-600 mr-2" />
                  Eligibility Criteria
                </h3>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.courseEligibility}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Course information last updated on {new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-12"></div>
    </div>
  );
};

export default CourseDetails;