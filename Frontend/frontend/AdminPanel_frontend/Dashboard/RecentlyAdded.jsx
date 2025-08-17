import React, { useState, useEffect } from "react";
import { MdHomeWork } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { FaBookOpen } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";
import { format } from "date-fns"; // Import date-fns for date formatting
import API_BASE_URL from "../../config"; // Adjust the import path as necessary

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
    Student: "/api/v1/admin_student/recent",
    Franchise: "/api/v1/franchises/recent",
    Courses: "/api/v1/admin_courses/courses/recent",
  };

  // Generic fetch function for all tabs
  const fetchData = async (tabName) => {
    setLoading(true);
    setError("");
    setData([]); // Reset data before fetching

    try {
      console.log(API_ENDPOINTS[tabName]);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS[tabName]}`);
      if (!response.ok)
        throw new Error(`Failed to fetch ${tabName.toLowerCase()}`);

      const fetchedData = await response.json();
      console.log("Fetched data", fetchedData);
      if (fetchedData.length === 0)
        throw new Error(`No ${tabName.toLowerCase()} available.`);

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
    setData((prevData) => {
      const sortedData = [...prevData];
      sortedData.sort((a, b) => {
        const dateA = new Date(a.addedOn || a.createdAt);
        const dateB = new Date(b.addedOn || b.createdAt);
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div>
      {/* Header */}
      <div className="text-2xl text-regal-voilet mb-6 mt-14">
        <h1>Recently Added</h1>
      </div>
      
      {/* Tab Buttons */}
      <div className="flex mb-1 transition-all duration-300 flex-col sm:flex-row">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            className={`px-6 py-2 w-full sm:w-5/12 flex justify-center items-center transition-all duration-300 ease-in-out ${
              selectedTab === tab.name
                ? "bg-gray-200 text-regal-voilet border-b-4 border-[#09182a] shadow-md scale-105"
                : "bg-white text-regal-voilet "
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
            className="w-full sm:w-3/12 flex font-bold justify-center items-center gap-1 hover:text-regal-voilet"
          >
            <p className="bg-black text-white rounded-sm px-2 py-1 ">Sort by {sortOrder === "newest" ? "Newest" : "Oldest"} </p>
            <BiSortAlt2
              className={`cursor-pointer w-8 h-8 ${
                sortOrder === "oldest" ? "transform rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tab Content Section */}
      <div className="mt-4 p-4 bg-white rounded-lg shadow-md transition-all duration-500 ease-in-out min-h-[300px]">
        {/* Franchise Tab */}
        {selectedTab === "Franchise" && (
          <div>
            <h2 className="text-xl font-semibold text-regal-voilet mb-3">
              Recently Added Franchises
            </h2>

            {/* scroll box */}
            <div className="max-h-96 overflow-y-auto ">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-600 animate-pulse">
                    Loading franchises...
                  </p>
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : data.length > 0 ? (
                <div className="space-y-4">
                  {data.map((franchise) => (
                    <div
                      key={franchise._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start space-x-4 ">
                        {/* Franchise Logo */}
                        <div className="flex-shrink-0">
                          {franchise.franchiseLogoUrl ? (
                            <img
                              src={franchise.franchiseLogoUrl}
                              alt={franchise.ownerName}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://via.placeholder.com/64?text=Logo";
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                No Photo
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Franchise Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-regal-voilet">
                                {franchise.franchiseName}
                              </h3>
                              <p className="text-sm text-gray-700">
                                Owner:{" "}
                                <span className="font-medium">
                                  {franchise.ownerName}
                                </span>
                              </p>
                              <div className="space-y-1">
                                {franchise.franchiseId && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">
                                      Franchise ID:
                                    </span>{" "}
                                    {franchise.franchiseId}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Date Information */}
                            <div className="flex flex-row gap-2 pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Applied:</span>{" "}
                                {formatDate(
                                  franchise.addedOn || franchise.requestDate
                                )}
                              </div>

                              {franchise.expireDate && (
                                <div className="text-xs text-gray-500">
                                  <span className="font-medium">Expires:</span>{" "}
                                  {formatDate(franchise.expireDate)}
                                </div>
                              )}

                              {/* Active Status */}
                              <span
                                className={`text-xs px-3  rounded-full font-medium ${
                                  franchise.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : franchise.status === "Inactive"
                                    ? "bg-red-100 text-red-800"
                                    : franchise.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {franchise.status}
                              </span>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Email:</span>{" "}
                                {franchise.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Mobile:</span>{" "}
                                {franchise.mobile}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Location:</span>{" "}
                                {franchise.state}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No franchises found.</p>
              )}
            </div>
          </div>
        )}

        {/* Student Tab */}
        {selectedTab === "Student" && (
          <div>
            <h2 className="text-xl font-semibold text-regal-voilet mb-3">
              Recently Added Students
            </h2>

            <div className="max-h-96 overflow-y-auto ">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-600 animate-pulse">
                    Loading students...
                  </p>
                </div>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : data.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {data.map((student) => (
                    <li key={student.id} className="py-3 flex items-center mx-2">
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
                          <p className="text-sm text-gray-600">
                            Course: {student.course.courseName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added: {formatDate(student.addedOn)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Roll No: {student.rollNumber}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No students found.</p>
              )}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {selectedTab === "Courses" && (
          <div>
            <h2 className="text-xl font-semibold text-regal-voilet mb-3">
              Recently Added Courses
            </h2>

            <div className="max-h-96 overflow-y-auto ">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-600 animate-pulse">
                    Loading courses...
                  </p>
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
                              e.target.src =
                                "https://via.placeholder.com/100?text=Course";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{course.name}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              course.status === "active"
                                ? "bg-green-100 text-green-800"
                                : course.status === "inactive"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {course.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <p className="text-sm text-gray-600">
                            Code: {course.code}
                          </p>
                          <p className="text-sm text-gray-600">
                            Subject: {course.subject}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duration: {course.duration}
                          </p>
                          <p className="text-sm font-medium text-regal-voilet">
                            {formatPrice(course.price)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          Added: {formatDate(course.addedOn)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No courses found.</p>
              )}{" "}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabMenu;

// import React, { useState, useEffect } from "react";
// import { MdHomeWork } from "react-icons/md";
// import { IoPerson } from "react-icons/io5";
// import { FaBookOpen } from "react-icons/fa";
// import { BiSortAlt2 } from "react-icons/bi";
// import { format } from "date-fns"; // Import date-fns for date formatting
// import API_BASE_URL from "../../config"; // Adjust the import path as necessary

// const TabMenu = () => {
//   const tabs = [
//     { name: "Franchise", icon: <MdHomeWork /> },
//     { name: "Student", icon: <IoPerson /> },
//     { name: "Courses", icon: <FaBookOpen /> },
//   ];

//   const [selectedTab, setSelectedTab] = useState("Franchise");

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

//    // Update API URLs
//    const API_ENDPOINTS = {
//     Student: "/api/v1/admin_student/recent",
//     Franchise: "/api/v1/franchises/recent",
//     Courses: "/api/v1/admin_courses/courses/recent"
//   };

//    // Generic fetch function for all tabs
//    const fetchData = async (tabName) => {
//     setLoading(true);
//     setError("");
//     setData([]); // Reset data before fetching

//     try {
//       console.log(API_ENDPOINTS[tabName]);
//       const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS[tabName]}`);
//       if (!response.ok) throw new Error(`Failed to fetch ${tabName.toLowerCase()}`);

//       const fetchedData = await response.json();
//       console.log("Fetched data" , fetchedData)
//       if (fetchedData.length === 0) throw new Error(`No ${tabName.toLowerCase()} available.`);

//       setData(fetchedData);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle tab switching with animation
//   const handleTabClick = (tabName) => {
//     setSelectedTab(tabName);
//     fetchData(tabName);
//   };

//   // Handle sorting
//   const toggleSortOrder = () => {
//     const newOrder = sortOrder === "newest" ? "oldest" : "newest";
//     setSortOrder(newOrder);

//     // Sort the data
//     setData(prevData => {
//       const sortedData = [...prevData];
//       sortedData.sort((a, b) => {
//         const dateA = new Date(a.addedOn);
//         const dateB = new Date(b.addedOn);
//         return newOrder === "newest" ? dateB - dateA : dateA - dateB;
//       });
//       return sortedData;
//     });
//   };

//    // Fetch data on initial render
//    useEffect(() => {
//     fetchData(selectedTab);
//   }, []);

//   // Format date function
//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return format(date, "dd MMM yyyy");
//     } catch (e) {
//       return dateString;
//     }
//   };

//   // Format price function
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0
//     }).format(price);
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="text-2xl text-regal-voilet mb-6 mt-14">
//         <h1>Recently Added</h1>
//       </div>

//       {/* Tab Buttons */}
//             <div className="flex mb-1 transition-all duration-300">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab.name}
//                   onClick={() => handleTabClick(tab.name)}
//                   className={`px-6 py-2 w-5/12 flex justify-center items-center transition-all duration-300 ease-in-out ${
//                     selectedTab === tab.name
//                       ? "bg-gray-200 text-regal-voilet border-b-4 border-[#09182a] shadow-md scale-105"
//                       : "bg-white text-regal-voilet "
//                   }`}
//                 >
//                   <div className="text-xl">{tab.icon}</div>
//                   <span className="ml-2">{tab.name}</span>
//                 </button>
//               ))}
//                {/* Sort Button */}
//                <div className="w-full flex items-center justify-end">
//                 <button
//                   onClick={toggleSortOrder}
//                   className="w-3/12 flex font-bold justify-center items-center gap-1 hover:text-regal-voilet"
//                 >
//                   <p>Sort by {sortOrder === "newest" ? "Newest" : "Oldest"} </p>
//                   <BiSortAlt2 className={`cursor-pointer w-8 h-8 ${sortOrder === "oldest" ? "transform rotate-180" : ""}`}
//                   />
//                 </button>
//               </div>
//             </div>

//       {/* Tab Content Section */}
//       <div className="mt-4 p-4 bg-white rounded-lg shadow-md transition-all duration-500 ease-in-out min-h-[300px]">
//         {/* Franchise Tab */}
//         {selectedTab === "Franchise" && (
//           <div>
//             <h2 className="text-xl font-semibold text-regal-voilet mb-3">Recently Added Franchises</h2>
//             {loading ? (
//               <div className="flex justify-center items-center h-40">
//                 <p className="text-gray-600 animate-pulse">Loading franchises...</p>
//               </div>
//             ) : error ? (
//               <p className="text-red-500">{error}</p>
//             ) : data.length > 0 ? (
//               <ul className="divide-y divide-gray-200">
//                 {data.map((franchise) => (
//                   <li key={franchise.id} className="py-4 flex items-center">
//                     {/* Owner Photo */}
//                     {franchise.ownerPhotoUrl && (
//                       <div className="mr-4 w-14 h-14 rounded-full overflow-hidden border">
//                         <img
//                           src={franchise.ownerPhotoUrl}
//                           alt={franchise.ownerName}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     )}
//                     <div className="flex-1">
//                       <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//                         <div>
//                           <p className="font-bold text-lg text-regal-voilet">{franchise.franchiseName}</p>
//                           <p className="text-sm text-gray-700">
//                             Owner: <span className="font-medium">{franchise.ownerName}</span>
//                           </p>
//                           <p className="text-xs text-gray-500">ATC Code: {franchise.atcCode || "-"}</p>
//                         </div>
//                         <div className="flex flex-col md:items-end mt-2 md:mt-0">
//                           <span className={`text-xs px-2 py-1 rounded-full mb-1 ${
//                             franchise.status === 'Active'
//                               ? 'bg-green-100 text-green-800'
//                               : franchise.status === 'Inactive'
//                               ? 'bg-red-100 text-red-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {franchise.status}
//                           </span>
//                           <span className={`text-xs px-2 py-1 rounded-full ${
//                             franchise.verificationStatus === 'Verified'
//                               ? 'bg-green-100 text-green-800'
//                               : franchise.verificationStatus === 'Rejected'
//                               ? 'bg-red-100 text-red-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {franchise.verificationStatus}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
//                         <div>
//                           <p className="text-xs text-gray-600">Email: <span className="font-medium">{franchise.email}</span></p>
//                           <p className="text-xs text-gray-600">Mobile: <span className="font-medium">{franchise.mobile}</span></p>
//                           <p className="text-xs text-gray-600">City: {franchise.city}, State: {franchise.state}</p>
//                         </div>
//                         <div>
//                           <p className="text-xs text-gray-600">Franchise ID: <span className="font-medium">{franchise.franchiseId || "-"}</span></p>
//                           <p className="text-xs text-gray-600">Expire Date: <span className="font-medium">{franchise.expireDate ? formatDate(franchise.expireDate) : "-"}</span></p>
//                           <p className="text-xs text-gray-600">Added: <span className="font-medium">{formatDate(franchise.addedOn)}</span></p>
//                         </div>
//                       </div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-600">No franchises found.</p>
//             )}
//           </div>
//         )}

//         {/* Student Tab */}
//         {selectedTab === "Student" && (
//           <div>
//             <h2 className="text-xl font-semibold text-regal-voilet mb-3">Recently Added Students</h2>
//             {loading ? (
//               <div className="flex justify-center items-center h-40">
//                 <p className="text-gray-600 animate-pulse">Loading students...</p>
//               </div>
//             ) : error ? (
//               <p className="text-red-500">{error}</p>
//             ) : data.length > 0 ? (
//               <ul className="divide-y divide-gray-200">
//                 {data.map((student) => (
//                   <li key={student.id} className="py-3 flex items-center">
//                     {student.photoUrl && (
//                       <div className="mr-4 w-12 h-12 rounded-full overflow-hidden">
//                         <img
//                           src={student.photoUrl}
//                           alt={student.name}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                     )}
//                     <div className="flex-1">
//                       <p className="font-medium">{student.name}</p>
//                       <div className="flex justify-between">
//                         <p className="text-sm text-gray-600">Course: {student.course.courseName}</p>
//                         <p className="text-xs text-gray-500">Added: {formatDate(student.addedOn)}</p>
//                       </div>
//                       <p className="text-xs text-gray-500">Roll No: {student.rollNumber}</p>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-600">No students found.</p>
//            )}
//         </div>
//         )}

//         {/* Courses Tab */}
//       {selectedTab === "Courses" && (
//           <div>
//             <h2 className="text-xl font-semibold text-regal-voilet mb-3">Recently Added Courses</h2>
//             {loading ? (
//               <div className="flex justify-center items-center h-40">
//                 <p className="text-gray-600 animate-pulse">Loading courses...</p>
//               </div>
//             ) : error ? (
//               <p className="text-red-500">{error}</p>
//             ) : data.length > 0 ? (
//               <ul className="divide-y divide-gray-200">
//                 {data.map((course) => (
//                   <li key={course.id} className="py-3 flex items-start">
//                     {course.imageUrl && (
//                       <div className="mr-4 w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
//                         <img
//                           src={course.imageUrl}
//                           alt={course.name}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src = "https://via.placeholder.com/100?text=Course";
//                           }}
//                         />
//                       </div>
//                     )}
//                     <div className="flex-1">
//                       <div className="flex justify-between items-start">
//                         <p className="font-medium">{course.name}</p>
//                         <span className={`text-xs px-2 py-1 rounded-full ${
//                           course.status === 'active' ? 'bg-green-100 text-green-800' :
//                           course.status === 'inactive' ? 'bg-red-100 text-red-800' :
//                           'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {course.status}
//                         </span>
//                       </div>
//                       <div className="grid grid-cols-2 gap-1 mt-1">
//                         <p className="text-sm text-gray-600">Code: {course.code}</p>
//                         <p className="text-sm text-gray-600">Subject: {course.subject}</p>
//                         <p className="text-sm text-gray-600">Duration: {course.duration}</p>
//                         <p className="text-sm font-medium text-regal-voilet">{formatPrice(course.price)}</p>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1 text-right">Added: {formatDate(course.addedOn)}</p>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="text-gray-600">No courses found.</p>
//             )}
//           </div>
//         )}

//       </div>

//     </div>
//   );
// };

// export default TabMenu;
