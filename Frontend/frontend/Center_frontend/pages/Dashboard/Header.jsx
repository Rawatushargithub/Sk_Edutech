import React, { useState, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa";

const Header = () => {
  const [instituteName, setInstituteName] = useState("Institute Name");

  useEffect(() => {
    // Fetch institute name from local storage (assuming it's stored during login)
    const storedInstitute = localStorage.getItem("instituteName");

    if (storedInstitute) {
      setInstituteName(storedInstitute);
    } else {
      fetchInstituteNameFromAPI();
    }
  }, []);

  // Function to fetch from API (if not stored locally)
  const fetchInstituteNameFromAPI = async () => {
    try {
      const response = await fetch("https://your-api.com/institute/details"); // Replace with actual API
      if (!response.ok) throw new Error("Failed to fetch institute name");

      const data = await response.json();
      setInstituteName(data.name || "Institute Name");

      // Store in local storage for future sessions
      localStorage.setItem("instituteName", data.name);
    } catch (error) {
      console.error("Error fetching institute name:", error);
    }
  };

  return (
    <div className="flex bg-gray-100 justify-between items-center">
      <h1 className="text-xl text-admin-col">👋 Welcome {instituteName}!</h1>
    </div>
  );
};

export default Header;
