// FormView.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../../config';

const FormView = ({ student, onClose }) => {
  useEffect(() => {
    const handleDownloadPDF = async () => {
      if (!student || !student._id) {
        console.error("Student data is not available.");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/institute_student/${student._id}/admission-form`,
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
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Transparent Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose}></div>

      {/* Form Container Sliding from Right */}
      <div className="w-full max-w-lg h-full bg-white shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out">
        <div className="p-6 overflow-auto h-full">
          <h2 className="text-2xl font-bold mb-4">Downloading Admission Form...</h2>
          <p>Your download will begin shortly.</p>
        </div>
      </div>
    </div>
  );
};

export default FormView;
