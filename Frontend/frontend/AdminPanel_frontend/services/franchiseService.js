import axios from 'axios';
import API_BASE_URL from "../../config";

const franchiseApi = axios.create({
    baseURL: `${API_BASE_URL}/franchises`,
    // Add headers or configurations if needed, e.g., for authentication
});

// Function to get all ACTIVE franchises (for general listing)
export const getAllActiveFranchises = async () => {
    const url = '/'; // GET /api/v1/franchises/
    console.log(`[FranchiseService] Attempting to fetch active franchises from: ${franchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await franchiseApi.get(url);
        console.log("[FranchiseService] Raw response from getAllActiveFranchises:", response);
        // Assuming backend returns { success: boolean, data: [], message: string }
        // Or directly { statusCode: number, data: [], message: string } based on ApiResponse structure
        return response.data;
    } catch (error) {
        // Log detailed error information
        if (error.response) {
            console.error("[FranchiseService] Error fetching active franchises - Response Data:", error.response.data);
            console.error("[FranchiseService] Error fetching active franchises - Response Status:", error.response.status);
            console.error("[FranchiseService] Error fetching active franchises - Response Headers:", error.response.headers);
        } else if (error.request) {
            console.error("[FranchiseService] Error fetching active franchises - No response received:", error.request);
        } else {
            console.error("[FranchiseService] Error fetching active franchises - Request setup error:", error.message);
        }
        console.error("[FranchiseService] Full error object:", error.config || error);

        // Rethrow or handle error as needed
        throw error.response?.data || new Error("Failed to fetch active franchises");
    }
};

// Function for ADMIN to create a new, active franchise
// Takes FormData object as input because we might send files
export const addFranchiseByAdmin = async (formData) => {
    const url = '/'; // POST /api/v1/franchises/
    console.log(`[FranchiseService] Attempting to add franchise via admin from: ${franchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await franchiseApi.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Important for file uploads
            },
        });
        console.log("[FranchiseService] Raw response from addFranchiseByAdmin:", response);
        return response.data;
    } catch (error) {
        console.error("[FranchiseService] Error adding franchise by admin:", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to add franchise");
    }
};

// Function to get all PENDING franchise requests
export const getFranchiseRequests = async () => {
    const url = '/requests'; // GET /api/v1/franchises/requests
    console.log(`[FranchiseService] Attempting to fetch franchise requests from: ${franchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await franchiseApi.get(url);
        console.log("[FranchiseService] Raw response from getFranchiseRequests:", response);
        return response.data;
    } catch (error) {
        console.error("[FranchiseService] Error fetching franchise requests:", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to fetch franchise requests");
    }
};

// Function for ADMIN to update status/verification of a franchise
// Takes the MongoDB _id and an update object { status?: string, verificationStatus?: string }
export const updateFranchiseStatusVerification = async (franchiseId, updateData) => {
    const url = `/${franchiseId}/manage`; // PATCH /api/v1/franchises/{franchiseId}/manage
    console.log(`[FranchiseService] Attempting to update status/verification for ${franchiseId} at: ${franchiseApi.defaults.baseURL}${url}`);
    console.log(`[FranchiseService] Update data:`, updateData);
    try {
        const response = await franchiseApi.patch(url, updateData); // Send updateData as JSON body
        console.log("[FranchiseService] Raw response from updateFranchiseStatusVerification:", response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error updating status/verification for ${franchiseId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to update franchise status/verification");
    }
};

// Function to get a single franchise by its ID
export const getFranchiseById = async (franchiseId) => {
    const url = `/${franchiseId}`; // GET /api/v1/franchises/{franchiseId}
    console.log(`[FranchiseService] Attempting to fetch franchise by ID ${franchiseId} from: ${franchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await franchiseApi.get(url);
        console.log(`[FranchiseService] Raw response from getFranchiseById for ${franchiseId}:`, response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error fetching franchise by ID ${franchiseId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch franchise ${franchiseId}`);
    }
};

// Function to update a franchise by its ID
// Takes franchiseId and FormData object (for potential file uploads)
export const updateFranchise = async (franchiseId, formData) => {
    const url = `/${franchiseId}`; // PUT /api/v1/franchises/{franchiseId}
    console.log(`[FranchiseService] Attempting to update franchise ${franchiseId} at: ${franchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await franchiseApi.put(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Important if files are part of the update
            },
        });
        console.log(`[FranchiseService] Raw response from updateFranchise for ${franchiseId}:`, response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error updating franchise ${franchiseId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to update franchise ${franchiseId}`);
    }
};

// Function to delete a franchise by its ID
export const deleteFranchise = async (franchiseId) => {
    const url = `/${franchiseId}`; // DELETE /api/v1/franchises/{franchiseId}
    console.log(`[FranchiseService] Attempting to delete franchise ${franchiseId} from: ${franchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await franchiseApi.delete(url);
        console.log(`[FranchiseService] Raw response from deleteFranchise for ${franchiseId}:`, response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error deleting franchise ${franchiseId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to delete franchise ${franchiseId}`);
    }
};

// Function to request resending credentials for a franchise
export const resendCredentials = async (franchiseId) => {
    const url = `/${franchiseId}/resend-credentials`; // POST /api/v1/franchises/{franchiseId}/resend-credentials
    console.log(`[FranchiseService] Attempting to resend credentials for franchise ${franchiseId} at: ${franchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await franchiseApi.post(url); // No body needed for this request
        console.log(`[FranchiseService] Raw response from resendCredentials for ${franchiseId}:`, response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error resending credentials for franchise ${franchiseId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to resend credentials for franchise ${franchiseId}`);
    }
};


// TODO: Add service function for franchise application (applyForFranchise) when implemented
