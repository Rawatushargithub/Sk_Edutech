import axios from 'axios';
import API_BASE_URL from '../../config';


// Define the base URL for the SK_Merged_landing backend API
// This backend is located at f:/SK Project/SK_Merged_landing/Backend
// Port is 8000 as per SK_Merged_landing/Backend/.env
const SK_MERGED_API_BASE_URL = `${API_BASE_URL}/api/v1/homepage-franchises`;

const skMergedHomepageFranchiseApi = axios.create({
    baseURL: SK_MERGED_API_BASE_URL,
});


// Function to request OTP for franchise application
export const requestFranchiseOtp = async (applicantData) => {
    const url = '/request-otp'; // POST /api/v1/homepage-franchises/request-otp
    console.log(`[HomepageFranchiseService] Requesting OTP from: ${skMergedHomepageFranchiseApi.defaults.baseURL}${url}`);
    try {
        // Sending JSON data for OTP request
        const response = await skMergedHomepageFranchiseApi.post(url, applicantData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("[HomepageFranchiseService] Raw response from requestFranchiseOtp:", response);
        return response.data; // Expected: { statusCode: 200, message: "OTP sent successfully" }
    } catch (error) {
        console.error("[HomepageFranchiseService] Error requesting OTP:", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to request OTP");
    }
};

// Function to submit franchise application with OTP
// Takes FormData object as input because it includes files and OTP
export const submitFranchiseApplicationWithOtp = async (formData) => {
    const url = '/submit-with-otp'; // POST /api/v1/homepage-franchises/submit-with-otp
    console.log(`[HomepageFranchiseService] Submitting application with OTP to: ${skMergedHomepageFranchiseApi.defaults.baseURL}${url}`);
    try {
        // Do NOT set Content-Type manually; let Axios/browser set proper boundary
        const response = await skMergedHomepageFranchiseApi.post(url, formData);
        console.log("[HomepageFranchiseService] Raw response from submitFranchiseApplicationWithOtp:", response);
        // Expected: { statusCode: 201, message: "Application submitted successfully. Please wait for super admin approval!" }
        return response.data;
    } catch (error) {
        console.error("[HomepageFranchiseService] Error submitting application with OTP:", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to submit application with OTP");
    }
};

export const checkUniqueness = async (params) => {
    const url = '/check-uniqueness';
    try {
        const response = await skMergedHomepageFranchiseApi.get(url, { params });
        return response.data;
    } catch (error) {
        console.error("[HomepageFranchiseService] Error checking uniqueness:", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to check uniqueness");
    }
};
