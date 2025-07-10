// src/services/centerService.js
import axios from "axios";
import API_BASE_URL from "../../config"; // Adjust the import path as necessary
export const loginFranchise = async (identifier, password) => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/franchises/login`, {
    identifier,
    password,
  });
  
  return response.data;
};
