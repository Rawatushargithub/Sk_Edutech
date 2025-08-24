// SharePopup.jsx
import React from 'react';

const SharePopup = ({ student, onClose }) => {
  const handleCopyToClipboard = () => {
    const studentDetails = `
      Name: ${student.studentName}
      Batch: ${student.batch}
      Course: ${student.courseInterested.courseName}
      Mobile: ${student.studentMobile}
      Email: ${student.email}
    `;
    navigator.clipboard.writeText(studentDetails.trim());
    alert('Student details copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Share Student Details</h2>
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p><strong>Name:</strong> {student.studentName}</p>
          <p><strong>Batch:</strong> {student.batch}</p>
          <p><strong>Course:</strong> {student.courseInterested.courseName}</p>
          <p><strong>Mobile:</strong> {student.studentMobile}</p>
          <p><strong>Email:</strong> {student.email}</p>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={handleCopyToClipboard}>Copy Details</button>
      </div>
    </div>
  );
};

export default SharePopup;
