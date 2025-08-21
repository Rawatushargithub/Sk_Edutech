// FormView.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const FormView = ({ student, onClose }) => {
  useEffect(() => {
    const handleDownloadPDF = async () => {
      if (!student || !student._id) {
        console.error("Student data is not available.");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/admin_student/${student._id}/admission-form`,
          {
            responseType: "blob", // Important to handle binary data
          }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `admission_form_${student.studentName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        onClose(); // Close the popup after download
      } catch (error) {
        console.error("Error downloading PDF:", error);
      }
    };

    handleDownloadPDF();
  }, [student, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Background Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm bg-black/20" 
        onClick={onClose}
      ></div>

      {/* Popup Container */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-900 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Generating PDF</h2>
        <p className="text-gray-600">Your download will begin shortly. Please wait...</p>
      </div>
    </div>
  );
};

export default FormView;
