import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const userInfo = {
    name: "Rohan Kumar",
    instituteCode: "SNE-34578",
    address: "15-7, M.G Road",
    mobile: "9856432109",
    email: "abc.def@gmail.com"
  };

  return (
    <div className="w-full">
      {/* Top banner with gradient */}
      <div className="h-28 bg-gradient-to-r from-yellow-500 via-blue-600 to-blue-800 relative">
        {/* Profile photo circle - moved right */}
        <div className="absolute -bottom-14 left-14">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-28 h-28 rounded-full border-4 border-white bg-gray-200 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity shadow-lg"
          >
            <img
              src="https://randomuser.me/api/portraits/men/2.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      {/* Profile information section - adjusted padding */}
      <div className="bg-white shadow-md pt-20 pb-6 pl-14 pr-8">
        <h1 className="text-xl font-bold mb-4 ml-2">{userInfo.name}</h1>
        
        <div className="space-y-2 ml-2">
          <div className="flex items-center">
            <span className="font-semibold w-28">Institute Code:</span>
            <span>{userInfo.instituteCode}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-28">Address:</span>
            <span>{userInfo.address}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-28">Mobile No:</span>
            <span>{userInfo.mobile}</span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold w-28">E-Mail:</span>
            <span>{userInfo.email}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-6 ml-2">
          <button className="px-4 py-2 bg-transparent border border-blue-500 text-blue-500 rounded-md 
            transform transition-all duration-200 
            hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3)]
            active:translate-y-0 active:translate-x-0 active:shadow-none"
            onClick={() => navigate("/profile-details") }>
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-transparent border border-green-500 text-green-500 rounded-md 
            transform transition-all duration-200
            hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3)]
            active:translate-y-0 active:translate-x-0 active:shadow-none">
            Certificate
          </button>
          <button className="px-4 py-2 bg-transparent border border-gray-500 text-gray-500 rounded-md 
            transform transition-all duration-200
            hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3)]
            active:translate-y-0 active:translate-x-0 active:shadow-none">
            Reset Password
          </button>
        </div>
      </div>

      {/* Modal for full photo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white p-4 rounded-lg max-w-xl max-h-[90vh] w-[90vw]" onClick={e => e.stopPropagation()}>
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
    </div>
  );
};

export default ProfileSection;