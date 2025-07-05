// src/services/centerService.js
import axios from "axios";

export const loginFranchise = async (identifier, password) => {
  const response = await axios.post("http://localhost:8000/api/v1/franchises/login", {
    identifier,
    password,
  });
  return response.data;
};
