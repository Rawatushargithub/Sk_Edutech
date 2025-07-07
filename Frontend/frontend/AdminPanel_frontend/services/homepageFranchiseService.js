import axios from 'axios';

// Define the base URL for the SK_Merged_landing backend API
// This backend is located at f:/SK Project/SK_Merged_landing/Backend
// Port is 8000 as per SK_Merged_landing/Backend/.env
const SK_MERGED_API_BASE_URL = 'http://localhost:8000/api/v1/homepage-franchises';

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
        const response = await skMergedHomepageFranchiseApi.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // FormData includes files
            },
        });
        console.log("[HomepageFranchiseService] Raw response from submitFranchiseApplicationWithOtp:", response);
        // Expected: { statusCode: 201, message: "Application submitted successfully. Please wait for super admin approval!" }
        return response.data;
    } catch (error) {
        console.error("[HomepageFranchiseService] Error submitting application with OTP:", error.response?.data || error.message);
        throw error.response?.data || new Error("Failed to submit application with OTP");
    }
};


// --- Original applyForFranchise function (if still needed for other purposes or as a reference) ---
// This points to the f:/SK Project/backend (presumably port 8002)
const ORIGINAL_API_BASE_URL = 'http://localhost:8002/api/v1';
const originalFranchiseApi = axios.create({
    baseURL: `${ORIGINAL_API_BASE_URL}/franchises`,
});

export const applyForFranchise_Legacy = async (formData) => { // Renamed to avoid conflict
    const url = '/apply';
    console.log(`[HomepageFranchiseService] Legacy: Submitting to: ${originalFranchiseApi.defaults.baseURL}${url}`);
    try {
        const response = await originalFranchiseApi.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error("[HomepageFranchiseService] Legacy Error:", error.response?.data || error.message);
        throw error.response?.data || new Error("Legacy: Failed to submit application");
    }
};
// Note: The ApplyFranchiseModal.jsx was updated to use the new OTP flow functions.
// If applyForFranchise is no longer used by ApplyFranchiseModal.jsx, it could be removed or kept as _Legacy.
// For now, I've renamed it to applyForFranchise_Legacy to avoid breaking anything that might still import it by the old name,
// though the modal itself now imports requestFranchiseOtp and submitFranchiseApplicationWithOtp.
