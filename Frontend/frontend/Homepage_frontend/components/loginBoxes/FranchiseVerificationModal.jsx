import { useState } from "react";
import { XCircle, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../../config"; // Adjust path if needed

const FranchiseVerificationModal = ({ onClose }) => {
    const [franchiseId, setFranchiseId] = useState("");
    const [loading, setLoading] = useState(false);
    const [franchise, setFranchise] = useState(null);
    const [error, setError] = useState("");

    const handleVerify = async () => {
        setLoading(true);
        setFranchise(null);
        setError("");
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/franchises/verify/${franchiseId}`);
            if (res.data.verificationStatus === "Verified") {
                setFranchise(res.data);
            } else {
                setError("Franchise is found but not verified yet.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Franchise not found.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg relative shadow-lg border-2 border-sky-700">
                <button
              onClick={onClose}
              className="absolute -top-10 right-0 text-white hover:text-violet-800 text-4xl font-bold z-50"
              aria-label="Close modal"
            >
              &times;
            </button>


                <h2 className="text-2xl font-bold text-center text-sky-700 mb-4">Franchise Verification</h2>

                <input
                    type="text"
                    placeholder="Enter Franchise ID"
                    value={franchiseId}
                    onChange={(e) => setFranchiseId(e.target.value)}
                    className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <button
                    onClick={handleVerify}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg flex justify-center items-center"
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

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
                        <AlertTriangle size={18} />
                        {error}
                    </div>
                )}

                {franchise && (
                    <div className="mt-6 border-t pt-4 space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <CheckCircle size={20} /> Franchise Verified
                        </div>
                        <p><strong>Name:</strong> {franchise.franchiseName}</p>
                        <p><strong>Email:</strong> {franchise.email}</p>
                        <p><strong>Mobile:</strong> {franchise.mobile}</p>
                        <p><strong>City:</strong> {franchise.city}, {franchise.state}</p>
                        <p><strong>Status:</strong> {franchise.status}</p>
                        <p><strong>Verification:</strong> {franchise.verificationStatus}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FranchiseVerificationModal;