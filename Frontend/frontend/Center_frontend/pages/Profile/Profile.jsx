import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../../../config.js"
import { Mail, Phone, Home, Building2, BadgeCheck, CalendarCheck, Landmark, ReceiptText, ShieldCheck } from "lucide-react"
const ProfileSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [franchiseData, setFranchiseData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear stored center data
    localStorage.removeItem("centerToken");
    localStorage.removeItem("franchiseName");
    localStorage.removeItem("franchiseID");
    localStorage.removeItem("franchiseImage");

    // Redirect to login/home page
    navigate("/");
  };

  useEffect(() => {
    const fetchFranchiseDetails = async () => {
      const storedId = localStorage.getItem("franchiseID");
      if (!storedId) return;
      console.log("Stored Franchise ID:", storedId);
      try {
        const encodedFranchiseId = encodeURIComponent(storedId);

        const response = await fetch(`${API_BASE_URL}/api/v1/franchises/getprofile/${encodedFranchiseId}`);
        const data = await response.json();
        setFranchiseData(data);
      } catch (error) {
        console.error("Failed to fetch franchise data:", error);
      }
    };

    fetchFranchiseDetails();
  }, []);

  // Simulated API call to fetch certificates
  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/certificates');
      const data = await response.json();
      console.log("Value of data", data)
      setCertificates(data);
    } catch (error) {
      console.log("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificateClick = async () => {
    setShowCertificates(true);
    setIsLoading(true);

    try {
      const storedId = localStorage.getItem("franchiseID");
      console.log("Stored Franchise ID for certificate:", storedId);
      const encodedId = encodeURIComponent(storedId); 
      const res = await fetch(`${API_BASE_URL}/api/v1/certificates/centercertificate/${encodedId}`);

      if (!res.ok) throw new Error("Failed to fetch certificate");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error loading certificate PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleCertificateClick = () => {
  //   setShowCertificates(true);
  //   fetchCertificates();
  // };

  const handleEditProfile = () => {

    window.location.href = '/institute/profile_details';
  };

  // Profile Default img code
  const ImageComponent = (obj) => {
    obj.src = "/Profile.jpg"

  };
  const handleCertificateImageClick = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseCertificates = () => {
  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  }
  setShowCertificates(false);
};

  return (
    <div className="w-full relative overflow-hidden">
      {/* Profile Section with sliding animation */}
      <div
        className={`w-full transition-transform duration-500 ease-in-out ${showCertificates ? '-translate-y-24' : 'translate-y-0'
          }`}
      >
        {/* Top banner with gradient */}
        <div className="h-60 bg-black relative">
          <div className="absolute -bottom-24 left-16">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-52 h-52 rounded-full border-4 border-white bg-gray-200 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
            >

              <div>
                <img
                  src={franchiseData?.franchiseLogoUrl || "/Profile.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/Profile.jpg"; // fallback if image fails
                  }}
                />
              </div>



              {/* <img
                src="/api/placeholder/112/112"
                alt="https://th.bing.com/th/id/OIP.M977DvratP5IkCubMgFikwHaHa?w=203&h=202&c=7&r=0&o=5&dpr=1.5&pid=1.7"
                className="w-full h-full object-cover"
              /> */}
            </button>
          </div>
        </div>

        {/* Profile information section */}
        <div className="bg-white shadow-md pt-28 pb-6 pl-14 pr-8">
          {/* Owner Name + Status */}
          <div className='flex items-center mb-4 gap-3'>
            <h1 className="text-2xl font-bold">{franchiseData?.ownerName}</h1>
            <div
              className={`text-sm font-semibold border-2 px-3 py-1 rounded-full ${franchiseData?.status === "Active"
                ? "border-green-500 text-green-600"
                : franchiseData?.status === "Inactive"
                  ? "border-gray-500 text-gray-600"
                  : franchiseData?.status === "Pending"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-red-500 text-red-600"
                }`}
            >
              {franchiseData?.status}
            </div>
          </div>

          {/* Profile Info + Right Side Details */}
          <div className='flex justify-between'>
            {/* Left - Profile Details */}
            <div className="space-y-4 text-base w-full md:w-2/3">
              <div className="flex items-center gap-2">
                <Building2 className="text-gray-500 w-5 h-5" />
                <span className="font-semibold w-40">Institute Name:</span>
                <span className="text-gray-600">{franchiseData?.franchiseName}</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="text-gray-500 w-5 h-5" />
                <span className="font-semibold w-40">Institute Code:</span>
                <span className="text-gray-600">{franchiseData?.franchiseId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="text-gray-500 w-5 h-5" />
                <span className="font-semibold w-40">Address:</span>
                <span className="text-gray-600">{franchiseData?.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-gray-500 w-5 h-5" />
                <span className="font-semibold w-40">Mobile No:</span>
                <span className="text-gray-600">{franchiseData?.mobile}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-gray-500 w-5 h-5" />
                <span className="font-semibold w-40">E-Mail:</span>
                <span className="text-gray-600">{franchiseData?.email}</span>
              </div>
              {franchiseData?.activationDate && (
                <div className="flex items-center gap-2">
                  <CalendarCheck className="text-gray-500 w-5 h-5" />
                  <span className="font-semibold w-40">Activation Date:</span>
                  <span className="text-gray-600">
                    {new Date(franchiseData.activationDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Right - Expiry & GST */}
            <div className="text-sm text-gray-700 space-y-5 w-full md:w-1/3 md:pl-6 border-gray-300">
              <div>
                <Landmark className="inline-block mr-2 text-blue-500" />
                <span className="font-semibold">Expiry Date:</span>
                <div className="text-gray-600">
                  {franchiseData?.expireDate
                    ? new Date(franchiseData.expireDate).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              {franchiseData?.expireDate && franchiseData?.activationDate && (
                <div>
                  <ShieldCheck className="inline-block mr-2 text-purple-500" />
                  <span className="font-semibold">Days Left:</span>
                  <div className="text-gray-600">
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(franchiseData.expireDate) - new Date()) /
                        (1000 * 60 * 60 * 24)
                      )
                    )}{" "}
                    days
                  </div>
                </div>
              )}

              <div>
                <ReceiptText className="inline-block mr-2 text-amber-600" />
                <span className="font-semibold">GST Number:</span>
                <div className="text-gray-600">
                  {franchiseData?.gstNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4 mt-6 text-lg ml-2">
            <button
              className="px-4 py-2 bg-transparent border hover:bg-gray-200 border-gray-600 text-gray-600 rounded-md 
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
            <button
              className="px-4 py-2 bg-transparent border hover:bg-gray-200 border-gray-600 text-gray-600 rounded-md 
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
              onClick={handleCertificateClick}
            >
              Certificate
            </button>
            <button
              className="px-4 py-2 bg-transparent border hover:bg-gray-200 border-gray-600 text-gray-600 rounded-md 
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>

      </div>

      {/* Certificates Section */}
      <div
        className={`w-full bg-white shadow-md p-1 ml-4  absolute bottom-10 transition-all duration-500 ease-in-out ${showCertificates ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Certificates</h2>
          <button
            onClick={() => handleCloseCertificates()}
            className="text-gray-600 hover:text-gray-800 text-xl font-semibold mr-12"
          >
            ↑ Back to Profile
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : pdfUrl ? (
          <div style={{ height: '600px' }}>
            <iframe
              src={pdfUrl}
              title="Certificate PDF"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            ></iframe>
          </div>
        ) : (
          <p className="text-gray-600">No certificate available</p>
        )}

      </div>

      {/* Photo Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-xl max-h-[90vh] w-[90vw]"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
              <img
                src="/api/placeholder/400/400"
                alt="Full profile"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
      {/* Certificate Full Screen Modal */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={handleCloseCertificateModal}
        >
          <div
            className="relative max-w-4xl w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl"
              onClick={handleCloseCertificateModal}
            >
              &times;
            </button>
            <button
              className="absolute -top-12 left-0 text-white hover:text-gray-300 flex items-center gap-2"
              onClick={handleCloseCertificateModal}
            >
              <span className="text-2xl">←</span> Back
            </button>
            <img
              src={selectedCertificate.image}
              alt={selectedCertificate.title}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 text-white">
              <h3 className="text-xl font-bold">{selectedCertificate.title}</h3>
              <p>Issued on: {selectedCertificate.issueDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfileSection;