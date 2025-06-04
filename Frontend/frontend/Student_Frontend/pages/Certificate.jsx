import React, { useEffect, useState, useRef } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
const CertificatePage = () => {
  const [student, setStudent] = useState(null);
  const certificateRef = useRef();

  const studentId = JSON.parse(localStorage.getItem("student"))?.studentId;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/student/${studentId}`);
        const data = await res.json();
        setStudent(data.student);
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };

    if (studentId) fetchStudent();
  }, [studentId]);

  const handleDownload = async () => {
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
      const pdf = new jsPDF("landscape", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("certificate.pdf");
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  if (!student) {
    return <div className="text-center mt-10">Loading certificate...</div>;
  }

  return (
    <div className="p-10">
      <div
        ref={certificateRef}
        style={{ backgroundColor: "#ffffff" }}
        className="relative w-[1120px] h-[790px] mx-auto border shadow-lg overflow-hidden"
      >
        {/* Background Image */}
        <img
          src="certificate.PNG"
          alt="Background"
          className="absolute w-full h-full object-cover opacity-100"
        />

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Certificate of Completion</h1>
          <p className="text-lg mb-2">This is to certify that</p>
          <h2 className="text-3xl font-semibold text-blue-800 mb-2">{student.studentName}</h2>
          <p className="mb-4">has successfully completed the course</p>
          <h3 className="text-xl font-bold text-green-600 mb-6">{student.courseInterested}</h3>

          {/* Student Photo */}
          <div className="absolute left-10 top-10 border border-gray-300 rounded overflow-hidden w-32 h-32">
            <img src={student.studentPhoto} alt="Student" className="w-full h-full object-cover" />
          </div>

          {/* Student Signature */}
          <div className="absolute right-20 bottom-20 text-center">
            <img src={student.studentSignature} alt="Signature" className="w-32 h-16 object-contain" />
            <p className="text-sm text-gray-700 mt-1">Signature</p>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
        >
          Download Certificate
        </button>
      </div>
    </div>
  );
};

export default CertificatePage;
