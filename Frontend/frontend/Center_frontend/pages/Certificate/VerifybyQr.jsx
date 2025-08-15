import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // for React Router
import API_BASE_URL from "../../../config";
import { Verified } from "lucide-react"; // Adjust the import based on your project structure

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/institute_certificates/verify-by-qr/${encodeURIComponent(certificateId)}`
        );

        if (!response.ok) throw new Error("Certificate not found");

        const data = await response.json();
        setCertificate(data);
      } catch (err) {
        setError("Certificate not found or invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  if (loading) return <p>Loading...</p>;

  if (error)
    return (
      <div style={{ color: "red" }}>
        <h2>❌ Certificate Not Verified</h2>
        <p>{error}</p>
      </div>
    );

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2 className="flex justify-center gap-2"><Verified className="text-blue-900"/> Certificate Verified</h2>
      <p><strong>Student Name:</strong> {certificate.studentName}</p>
      {/* <p><strong>Center Name:</strong> {certificate.franchiseId}</p> */}

      <p><strong>Course:</strong> {certificate.courseName}</p>
      <p><strong>Certificate ID:</strong> {certificate.certificateId}</p>
      <p><strong>Roll Number:</strong> {certificate.rollNumber}</p>
      <p><strong>Percentage:</strong> {certificate.percentage}%</p>
      <p><strong>Grade:</strong> {certificate.grade}</p>
      <p><strong>Session:</strong> {certificate.session}</p>
      <p><strong>Issued On:</strong> {new Date(certificate.issuedOn).toLocaleDateString()}</p>
    </div>
  );
};

export default VerifyCertificate;
