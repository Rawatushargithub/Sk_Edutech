// FormView.jsx
import React from 'react';

const FormView = ({ student, onClose }) => {
  const handleDownloadPDF = () => {
    console.log('Download PDF for student:', student);
    // Implement PDF generation logic here using jsPDF or react-to-print
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Transparent Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose}></div>

      {/* Form Container Sliding from Right */}
      <div className="w-full max-w-lg h-full bg-white shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out">
        <div className="p-6 overflow-auto h-full">
          <h2 className="text-2xl font-bold mb-4">Student Admission Form</h2>
          <p><strong>Name:</strong> {student?.studentName || 'N/A'}</p>
          <p><strong>Batch:</strong> {student?.batch || 'N/A'}</p>
          <p><strong>Course:</strong> {student?.courseInterested || 'N/A'}</p>
          <p><strong>Mobile:</strong> {student?.studentMobile || 'N/A'}</p>
          <p><strong>Email:</strong> {student?.email || 'N/A'}</p>

          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={handleDownloadPDF}>Download PDF</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded mt-4 ml-4" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FormView;
