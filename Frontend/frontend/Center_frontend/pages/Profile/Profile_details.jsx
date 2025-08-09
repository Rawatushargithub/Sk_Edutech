import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from "../../../config";

const Profile_details = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [editableFields, setEditableFields] = useState({
    email: false,
    mobileNumber: false,
    address: false,
  });
const [isSubmitting, setIsSubmitting] = useState(false);
  const franchiseId = localStorage.getItem("franchiseID");

  useEffect(() => {
    const fetchFranchiseDetails = async () => {
      if (!franchiseId) {
        console.error("No Franchise ID provided");
        return;
      }

      try {
        setIsLoading(true);
        const encodedFranchiseId = encodeURIComponent(franchiseId);
        const response = await axios.get(`${API_BASE_URL}/api/v1/franchises/getprofile/${encodedFranchiseId}`);
        const data = response.data;
        setFormData(data);
        if (data?.ownerPhotoUrl) setProfilePic(data.ownerPhotoUrl);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFranchiseDetails();
  }, [franchiseId]);


  const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditToggle = (field) => {
    setEditableFields({ ...editableFields, [field]: !editableFields[field] });
  };

  const handleSubmit = async () => {
    try {

      const franchiseId = localStorage.getItem('franchiseID'); // retrieve from local storage
      console.log("Franchise ID:", franchiseId);

      if (!franchiseId) {
        alert('Franchise ID not found');
        return;
      }


      const updatedFields = {
        franchiseId: franchiseId,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
      };

      await axios.put(`${API_BASE_URL}/api/v1/franchises/manage/updatecontact`, updatedFields);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const handleCancel = () => {
    navigate("/institute/profile");
  };

  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Header Section */}
      <div className="relative w-full h-24 bg-black text-white flex items-center">
        <div className="absolute bottom-0 left-10 transform translate-y-1/2">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100">
            <img
              src={formData?.ownerPhotoUrl || "/Profile.jpg"}
              className="object-cover w-full h-full"
              alt="Profile"
            />
          </div>
        </div>
        <div className="ml-40">
          <h1 className="text-2xl font-bold">{formData?.ownerName || "Owner Name"}</h1>
        </div>
      </div>

      {/* Display Info Section */}
      <div className="w-full grid grid-cols-3 gap-6 relative mt-20">
        {["franchiseId", "franchiseName", "ownerName", "dob", "state", "designation", "city", "postalCode", "gstNumber"].map((field) => (
          <div key={field} className="flex flex-col">
            <label className="font-medium text-gray-700">{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
            <input

              name={field}
             value={field === 'dob' ? formatDate(formData[field]) : (formData[field] || '')}
              readOnly
              className="border border-gray-300 rounded p-2 mt-1 bg-gray-100"
            />
          </div>
        ))}

        {["email", "mobile", "address"].map((field) => (
          <div key={field} className="flex flex-col">
            <label className="font-medium text-gray-700 flex justify-between">
              {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              <button
                type="button"
                className="text-sm text-blue-500 hover:underline"
                onClick={() => handleEditToggle(field)}
              >
                {editableFields[field] ? "Lock" : "Edit"}
              </button>
            </label>
            <input
              type={field === "email" ? "email" : field === "mobileNumber" ? "tel" : "text"}
              name={field}
              value={formData[field] || ''}
              onChange={handleInputChange}
              readOnly={!editableFields[field]}
              className={`border border-gray-300 rounded p-2 mt-1 ${!editableFields[field] ? 'bg-gray-100' : ''}`}
            />
          </div>
        ))}

        <div className="col-span-3 flex justify-end space-x-4 mt-4">
          
        <button
            type="button"
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleSubmit}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile_details;
