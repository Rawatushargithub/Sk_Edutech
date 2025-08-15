import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config";

export default function CenterVerification() {
  const { franchiseId } = useParams();
  const encodedId = encodeURIComponent(franchiseId);

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // console.log("Fetching franchise details for ID:", decodedId);
    fetch(`${API_BASE_URL}/api/v1/certificates/${encodedId}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === "Verified") {
          setData(res);
        } else {
          setError("❌ This franchise is not verified.");
        }
      })
      .catch(() => setError("⚠️ Error fetching details"));
  }, [encodedId]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 text-center border-2 border-red-500 rounded-lg bg-red-50">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Franchise Verification</h2>
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 text-center border-2 border-yellow-500 rounded-lg bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">Franchise Verification</h2>
        <p className="text-yellow-700">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 text-center border-2 border-green-500 rounded-lg bg-green-50 shadow-lg">
      <h1 className="text-3xl font-bold text-green-700 mb-4">{data.franchiseName}</h1>
      <p className="mb-2"><span className="font-semibold">Owner:</span> {data.ownerName}</p>
      <p className="mb-2">
        <span className="font-semibold">Address:</span> {data.address}, {data.city}, {data.state} - {data.postalCode}
      </p>
      <p className="text-lg font-semibold text-green-600">✅ Status: Verified</p>
    </div>
  );
}
