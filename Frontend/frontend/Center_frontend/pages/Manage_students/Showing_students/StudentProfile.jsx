import React, { useState } from "react";

const StudentProfile = ({ student, onClose, onEdit , onViewForm , onViewIDCard , onShare}) => {

  // Handle edit with student data
  const handleEditProfile = () => {
    // Store student data in localStorage as fallback
    localStorage.setItem('editStudentData', JSON.stringify(student));
    // Call the onEdit function from parent with student data
    if (onEdit) {
      onEdit(student.id);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with blur effect */}
      <div
        className="absolute inset-0 bg-grey-300 bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Profile Card */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 z-10">
        {/* Profile Header */}
        <div className="bg-black h-40 rounded-t-lg"></div>

        {/* Profile Image */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2">
          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white overflow-hidden">
            {student.studentPhoto ? (
              <img
                src={student.studentPhoto}
                alt={student.studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-white bg-red-500 rounded-full p-1"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Profile Content */}
        <div className="pt-16 pb-6 px-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            {student.studentName || "Student Name"}
          </h2>

          <div className="space-y-4">
            <div className="flex">
              <div className="w-1/2 font-semibold">Mobile No:</div>
              <div className="w-1/2">{student.studentMobile || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">E-Mail:</div>
              <div className="w-1/2">{student.email || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">Course:</div>
              <div className="w-1/2">{student.courseInterested || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">Batch:</div>
              <div className="w-1/2">{student.batch || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">Username:</div>
              <div className="w-1/2">{student.username || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">Password:</div>
              <div className="w-1/2">{student.username || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">Admission Date:</div>
              <div className="w-1/2">{student.admissionDate || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">Referral Code:</div>
              <div className="w-1/2">{student.referralCode || "N/A"}</div>
            </div>

            <div className="flex">
              <div className="w-1/2 font-semibold">Status:</div>
              <div className="w-1/2">
                <span
                  className={`px-2 py-1 rounded text-white ${
                    student.status ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {student.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>

            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition">
              Certificate
            </button>

            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition">
              Reset Password
            </button>
                
          <div className="flex">
          <button
              className="bg-yellow-500 text-white p-2 rounded mr-2 hover:bg-yellow-600"
              onClick={onViewForm}
            >
              📄
            </button>
            <button
              className="bg-green-500 text-white p-2 rounded mr-2 hover:bg-green-600"
              onClick={onViewIDCard}
            >
              🆔
            </button>
            <button
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              onClick={onShare}
            >
              🔗
            </button>
          </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentProfile;
