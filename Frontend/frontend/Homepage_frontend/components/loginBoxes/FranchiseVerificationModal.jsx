import { useState } from "react";
import { XCircle, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../../config"; // Adjust if needed

const FranchiseVerificationModal = ({ onClose }) => {
  const [certificateId, setCertificateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const verifyCertificate = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/certificates/verify/${certificateId}`);
      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.message || "Certificate not verified.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Certificate not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg relative shadow-lg border-2 border-sky-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-violet-800 text-4xl font-bold z-50"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-[#003366] mb-4">Certificate Verification</h2>

        {/* Input */}
        <input
          type="text"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#003366]"
        />

        {/* Verify Button */}
        <button
          onClick={verifyCertificate}
          className="w-full bg-[#003366] hover:bg-sky-800 text-white py-2 rounded-lg flex justify-center items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="mt-6 border-t pt-4 space-y-1 text-sm text-gray-700">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle size={20} /> Certificate Verified
            </div>
            <p><strong>Name:</strong> {result.name}</p>
            <p><strong>Email:</strong> {result.email}</p>
            <p><strong>Course:</strong> {result.course}</p>
            <p><strong>Date:</strong> {result.date}</p>
            <p><strong>Status:</strong> {result.status}</p>
            <p><strong>Verification:</strong> {result.success ? "Verified" : "Not Verified"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FranchiseVerificationModal;
