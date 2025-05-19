import React, { useState, useEffect } from 'react';

const ProfileSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const userInfo = {
    name: "Rohan Kumar",
    insitituteName: "SK Institute",
    instituteCode: "SNE-34578",
    address: "15-7, M.G Road",
    mobile: "9856432109",
    email: "abc.def@gmail.com"
  };

  // Simulated API call to fetch certificates
  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('/api/certificates');
      const data = await response.json();
      console.log("Value of data" , data)
      setCertificates(data);
    } catch (error) {
       console.log("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificateClick = () => {
    setShowCertificates(true);
    fetchCertificates();
  };

  const handleEditProfile = () => {
    // Replace this with your preferred navigation method
    window.location.href = '/institute/profile_details';
  };
  
  // Profile Default img code
  const ImageComponent = (obj) => {
    obj.src = "/Profile.jpg"
   
  };
  const handleCertificateImageClick = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCloseCertificateModal = () => {
    setSelectedCertificate(null);
  };
  return (
    <div className="w-full relative overflow-hidden">
      {/* Profile Section with sliding animation */}
      <div
        className={`w-full transition-transform duration-500 ease-in-out ${
          showCertificates ? '-translate-y-24' : 'translate-y-0'
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
                    src="/api/placeholder/112/112" // This URL is broken
                    // alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Prevents infinite loop in case fallback also fails
                      ImageComponent(e.target)
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
          <h1 className="text-2xl font-bold mb-4 ml-2">{userInfo.name}</h1>
          
          <div className="space-y-3 ml-3 text-xl">
            <div className="flex items-center">
              <span className="font-semibold w-40">Institute Name:</span>
              <span className="font-semibold text-gray-500">{userInfo.insitituteName}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-40">Institute Code:</span>
              <span className="font-semibold text-gray-500">{userInfo.instituteCode}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-40">Address:</span>
              <span className="font-semibold text-gray-500">{userInfo.address}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-40">Mobile No:</span>
              <span className="font-semibold text-gray-500">{userInfo.mobile}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-40">E-Mail:</span>
              <span className="font-semibold text-gray-500">{userInfo.email}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-6 mt-6 ml-2 text-lg">
            <button 
              className="px-4 py-2 bg-transparent border hover:bg-gray-200 border-gray-600 text-gray-600 rounded-md 
                transform transition-all duration-200 
                hover:-translate-y-0.5 hover:translate-x-0.2 hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2)]
                active:translate-y-0 active:translate-x-0 active:shadow-none"
              onClick={handleEditProfile}
            >
              Edit Profile
            </button>
            <button 
              className="px-4 py-2 bg-transparent border hover:bg-gray-200 border-gray-600 text-gray-600 rounded-md 
                transform transition-all duration-200
                hover:-translate-y-0.5 hover:translate-x-0.2 hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2)]
                active:translate-y-0 active:translate-x-0 active:shadow-none"
              onClick={handleCertificateClick}
            >
              Certificate
            </button>
            <button 
              className="px-4 py-2 bg-transparent border hover:bg-gray-200 border-gray-600 text-gray-600 rounded-md 
                transform transition-all duration-200
                hover:-translate-y-0.5 hover:translate-x-0.2 hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2)]
                active:translate-y-0 active:translate-x-0 active:shadow-none"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      <div 
        className={`w-full bg-white shadow-md p-1 ml-4  absolute bottom-10 transition-all duration-500 ease-in-out ${
          showCertificates ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Certificates</h2>
          <button 
            onClick={() => setShowCertificates(false)}
            className="text-gray-600 hover:text-gray-800 text-xl font-semibold mr-12"
          >
            ↑ Back to Profile
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Replace this with your actual certificate data */}
            
              <div 
                className="border rounded-xs p-1 hover:shadow-lg transition-shadow "
                onClick={() => handleCertificateImageClick({
                  image: "https://th.bing.com/th/id/OIP.e8CC-0Yu-UVQjuTKqkBqZQHaFQ?rs=1&pid=ImgDetMain",
                  title: "Contract Certificate",
                  issueDate: "Jan, 2024"
                })}
              >
                <img
                  src={"https://th.bing.com/th/id/OIP.e8CC-0Yu-UVQjuTKqkBqZQHaFQ?rs=1&pid=ImgDetMain"}
                  alt={`Certificate `}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg mb-2">Contract Certificate</h3>
                <p className="text-gray-600">Issued on: Jan , 2024</p>
              </div>
            
          </div>
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