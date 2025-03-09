import React, { useState, useEffect } from "react";
import { MdHomeWork } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";
import { format } from "date-fns"; // Import date-fns for date formatting

const TabMenu = () => {
  const tabs = [
    { name: "Franchise", icon: <MdHomeWork /> },
    { name: "Student", icon: <IoPerson /> },
    { name: "Courses", icon: <FaBookOpen /> },
  ];

  const [selectedTab, setSelectedTab] = useState("Franchise");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

   // Update API URLs
   const API_ENDPOINTS = {
    Student: "/api/v1/student/recent",
    Franchise: "/api/v1/franchises/recent",
    Courses: "/api/v1/courses/recent"
  };

   // Generic fetch function for all tabs
   const fetchData = async (tabName) => {
    setLoading(true);
    setError("");
    setData([]); // Reset data before fetching
    
    try {
      console.log(API_ENDPOINTS[tabName]);
      const response = await fetch(`http://localhost:8000${API_ENDPOINTS[tabName]}`);
      if (!response.ok) throw new Error(`Failed to fetch ${tabName.toLowerCase()}`);
      
      const fetchedData = await response.json();
      console.log("Fetched data" , fetchedData)
      if (fetchedData.length === 0) throw new Error(`No ${tabName.toLowerCase()} available.`);
      
      setData(fetchedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab switching with animation
  const handleTabClick = (tabName) => {
    setSelectedTab(tabName);
    fetchData(tabName);
  };

  // Handle sorting
  const toggleSortOrder = () => {
    const newOrder = sortOrder === "newest" ? "oldest" : "newest";
    setSortOrder(newOrder);
    
    // Sort the data
    setData(prevData => {
      const sortedData = [...prevData];
      sortedData.sort((a, b) => {
        const dateA = new Date(a.addedOn);
        const dateB = new Date(b.addedOn);
        return newOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
      return sortedData;
    });
  };

   // Fetch data on initial render
   useEffect(() => {
    fetchData(selectedTab); 
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Format price function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div>
      {/* Header */}
      <div className="text-2xl text-regal-voilet mb-6 mt-14">
        <h1>Recently Added</h1>
      </div>

      {/* Tab Buttons */}
      <div className="flex mb-1 transition-all duration-300">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            className={`px-6 py-2 w-5/12 rounded-md flex justify-center items-center transition-all duration-300 ease-in-out ${
              selectedTab === tab.name
                ? "bg-gray-200 text-regal-voilet border-b-4 border-[#09182a] shadow-md scale-105"
                : "bg-white text-regal-voilet hover:bg-gray-100"
            }`}
          >
            <div className="text-xl">{tab.icon}</div>
            <span className="ml-2">{tab.name}</span>
          </button>
        ))}
         {/* Sort Button */}
         <div className="w-full flex items-center justify-end">
          <button 
            onClick={toggleSortOrder}
            className="w-3/12 flex justify-center items-center gap-1 hover:text-regal-voilet"
          >
            <p>Sort by {sortOrder === "newest" ? "Newest" : "Oldest"}</p>
            <BiSortAlt2 className={sortOrder === "oldest" ? "transform rotate-180" : ""} />
          </button>
        </div>
      </div>
 
      {/* Tab Content Section */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-md transition-all duration-500 ease-in-out min-h-[300px]">
        {/* Student Tab */}
        {selectedTab === "Student" && (
          <div>
            <h2 className="text-xl font-semibold text-regal-voilet mb-3">Recently Added Students</h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-600 animate-pulse">Loading students...</p>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {data.map((student) => (
                  <li key={student.id} className="py-3 flex items-center">
                    {student.photoUrl && (
                      <div className="mr-4 w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={student.photoUrl} 
                          alt={student.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-600">Course: {student.course}</p>
                        <p className="text-xs text-gray-500">Added: {formatDate(student.addedOn)}</p>
                      </div>
                      <p className="text-xs text-gray-500">Roll No: {student.rollNumber}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No students found.</p>
           )}
        </div>
        )}

        {/* Courses Tab */}
      {selectedTab === "Courses" && (
          <div>
            <h2 className="text-xl font-semibold text-regal-voilet mb-3">Recently Added Courses</h2>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-600 animate-pulse">Loading courses...</p>
              </div>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : data.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {data.map((course) => (
                  <li key={course.id} className="py-3 flex items-start">
                    {course.imageUrl && (
                      <div className="mr-4 w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={course.imageUrl} 
                          alt={course.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/100?text=Course";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{course.name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.status === 'active' ? 'bg-green-100 text-green-800' : 
                          course.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <p className="text-sm text-gray-600">Code: {course.code}</p>
                        <p className="text-sm text-gray-600">Subject: {course.subject}</p>
                        <p className="text-sm text-gray-600">Duration: {course.duration}</p>
                        <p className="text-sm font-medium text-regal-voilet">{formatPrice(course.price)}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">Added: {formatDate(course.addedOn)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No courses found.</p>
            )}
          </div>
        )}
        
      </div>

      
    </div>
  );
};

export default TabMenu;
