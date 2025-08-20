import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trophy, BookOpen, Rocket, Award } from "lucide-react"; // lucide icons
import API_BASE_URL from "../../config";

const CertificatePreview = () => {
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);

  const student = JSON.parse(localStorage.getItem("student"));
  const rollNumber = student?.rollNumber;
  const courseCode = student?.courseCode;
  const franchiseId = student?.franchiseId;

  useEffect(() => {
    if (!franchiseId || !courseCode || !rollNumber) {
      setError("Missing student data.");
      return;
    }

    axios
      .post(`${API_BASE_URL}/api/v1/certificates/approvedcertificate`, {
        franchiseId,
        courseCode,
        rollNumber,
      })
      .then((res) => {
        if (!res.data || Object.keys(res.data).length === 0) {
          setCertificateData(null);
        } else {
          setCertificateData(res.data);
        }
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        const message =
          err.response?.status === 404
            ? "No certificate has been issued yet."
            : err.response?.data?.message || "Something went wrong";
        setError(message);
      });
  }, [franchiseId, courseCode, rollNumber]);

  const handlePrint = () => {
    window.print();
  };

  // 🔴 Error / Missing Student Data
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center px-6">
        <Rocket className="text-red-500 w-16 h-16 mb-4 animate-bounce" />
        <h2 className="text-red-600 text-xl font-bold mb-2">
          {error}
        </h2>
        <p className="text-gray-600 max-w-md">
          🚀 Keep working hard, your dedication will pay off soon.  
          Every setback is just a setup for a stronger comeback!
        </p>
      </div>
    );
  }

  // 🔵 No Certificate Yet
  if (!certificateData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 text-center px-6">
        <BookOpen className="text-blue-600 w-16 h-16 mb-4 animate-pulse" />
        <h2 className="text-gray-700 text-2xl font-bold mb-2">
          Your Journey is in Progress 📚
        </h2>
        <p className="text-gray-600 max-w-md">
          Keep learning, keep growing 🌟. Hard work always pays off —  
          your certificate is on its way! 🏆
        </p>
        {/* Optional: motivational gif */}
        <img
          src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
          alt="Motivation"
          className="mt-6 w-40 rounded-lg shadow"
        />
      </div>
    );
  }

  // 🟢 Certificate Found
  return (
    <div className="flex flex-col justify-center items-center py-10 bg-gray-100 min-h-screen">
      {/* 🎉 Motivational Banner */}
      <div className="flex items-center gap-3 bg-green-100 border border-green-400 text-green-700 font-semibold px-6 py-3 rounded-lg shadow mb-6">
        <Trophy className="w-6 h-6 text-green-600" />
        🎉 Congratulations! You Did It! 🎉
      </div>

      <div className="bg-white border-4 border-blue-600 rounded-lg shadow-lg w-full max-w-3xl px-10 py-8 text-center relative print:border-black print:shadow-none print:px-16 print:py-10">
        <div className="absolute top-4 left-6 text-sm font-medium text-gray-700 print:static print:mb-4 print:text-center">
          Certificate ID:{" "}
          <span className="text-blue-700 font-semibold">
            {certificateData.certificateId}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-blue-700 mb-6 mt-4 uppercase flex justify-center items-center gap-2">
          <Award className="w-8 h-8 text-blue-600" />
          Certificate of Completion
        </h1>

        <p className="text-lg text-gray-800 mb-6">This is to certify that</p>

        <p className="text-2xl font-semibold text-gray-900 mb-1 underline">
          {certificateData.studentName}
        </p>
        <p className="text-md text-gray-700 mb-4">
          S/O {certificateData.fatherName}
        </p>

        <p className="text-md text-gray-800 mb-2">
          has successfully completed the course
        </p>

        <p className="text-xl font-bold text-blue-600 mb-4">
          {certificateData.courseName}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-left text-sm text-gray-700 mb-8 max-w-xl mx-auto">
          <p><strong>Roll Number:</strong> {certificateData.rollNumber}</p>
          <p><strong>Exam ID:</strong> {certificateData.examId}</p>
          <p><strong>Session:</strong> {certificateData.session}</p>
          <p><strong>Institute:</strong> {certificateData.instituteName}</p>
          <p><strong>Percentage:</strong> {certificateData.percentage}%</p>
          <p><strong>Grade:</strong> {certificateData.grade}</p>
        </div>

        <p className="text-sm text-gray-500 mb-8 italic">
          This certificate is awarded based on official examination results and
          approved status.
        </p>

        <div className="flex justify-between items-center mt-8 px-6 print:hidden">
          <button
            type="button"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow text-sm"
            onClick={() =>
              window.open(
                `${API_BASE_URL}/api/v1/institute_certificates/download/${encodeURIComponent(
                  certificateData.certificateId
                )}`,
                "_blank"
              )
            }
            aria-label="Download certificate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Download Certificate
          </button>

          <div className="text-xs text-gray-400">Powered by YourSystemName</div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
