// src/services/centerService.js
import axios from "axios";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
export const loginFranchise = async (franchiseId, password) => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/franchises/login`, {
    franchiseId,
    password,
  });
  
  return response.data;
};
