// SharePopup.jsx
import React from 'react';

const SharePopup = ({ student, onClose }) => {
  const handleCopyToClipboard = () => {
    const studentDetails = `Name: ${student.studentName}\nBatch: ${student.batch}\nCourse: ${student.courseInterested}\nMobile: ${student.studentMobile}\nEmail: ${student.email}`;
    navigator.clipboard.writeText(studentDetails);
    alert('Student details copied to clipboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Share Student Details</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">{JSON.stringify(student, null, 2)}</pre>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={handleCopyToClipboard}>Copy to Clipboard</button>
      </div>
    </div>
  );
};

export default SharePopup;