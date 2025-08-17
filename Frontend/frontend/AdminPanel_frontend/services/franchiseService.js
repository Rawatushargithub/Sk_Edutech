import axios from 'axios';
import API_BASE_URL from "../../config"; 

const franchiseApi = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/franchises`,
    // Add headers or configurations if needed, e.g., for authentication
});

// Function to get all ACTIVE franchises (for general listing)
export const getAllActiveFranchises = async () => {
    const url = '/'; // GET /api/v1/franchises/
    console.log(`[FranchiseService] Attempting to fetch active franchises with student counts from: ${franchiseApi.defaults.baseURL}${url}`);
    
    try {
        // Fetch franchises and student counts in parallel for better performance
        const [franchisesResponse, studentCountsResponse] = await Promise.allSettled([
            franchiseApi.get(url),
            getAllFranchiseStudentCounts()
        ]);

        console.log("[FranchiseService] Franchises response:", franchisesResponse);
        console.log("[FranchiseService] Student counts response:", studentCountsResponse);

        // Handle franchises response
        if (franchisesResponse.status === 'rejected') {
            throw franchisesResponse.reason;
        }

        const franchises = franchisesResponse.value.data;
        if (franchises && franchises.statusCode === 200 && franchises.data) {
            let franchisesData = franchises.data;
console.log("studentCountsResponse.value.data" , studentCountsResponse.value.data)
            // Handle student counts response
            console.log("[FranchiseService] Checking conditions:");
            console.log("- status === 'fulfilled':", studentCountsResponse.status === 'fulfilled');
            console.log("- value exists:", !!studentCountsResponse.value);
            console.log("- value.data exists:", !!studentCountsResponse.value?.data);
            console.log("- actual statusCode:", studentCountsResponse.value?.data?.statusCode);
            console.log("- statusCode === 200:", studentCountsResponse.value?.data?.statusCode === 200);
            
            if (studentCountsResponse.status === 'fulfilled' && 
                studentCountsResponse.value && 
                studentCountsResponse.value.data) {
                console.log("if else working")
                const studentCountsData = studentCountsResponse.value.data || [];
                console.log("[FranchiseService] Student counts raw data:", studentCountsData);
                
                // Create a map of franchise student counts for quick lookup
                const studentCountsMap = {};
                studentCountsData.forEach(item => {
                    studentCountsMap[item.franchiseId] = item.studentCount;
                });

                // Merge real-time student counts with franchise data
                franchisesData = franchises.data.map(franchise => ({
                    ...franchise,
                    totalStudents: studentCountsMap[franchise.franchiseId] || 0 // Real-time count from DB
                }));
                
                console.log("[FranchiseService] Student counts map:", studentCountsMap);
                console.log("[FranchiseService] Sample franchise after merge:", franchisesData[0]);
                console.log("[FranchiseService] Successfully merged student counts with franchise data");
            } else {
                console.warn("[FranchiseService] Student counts fetch failed, using original totalStudents values");
                console.warn("[FranchiseService] Student counts response:", studentCountsResponse.value?.data);
                console.warn("[FranchiseService] Response status:", studentCountsResponse.status);
                // Keep original totalStudents values if student count fetch fails
            }

            return {
                ...franchises,
                data: franchisesData
            };
        }

        return franchises;

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

// Function to get student count for a specific franchise
export const getStudentCountByFranchise = async (franchiseId) => {
    const url = `/${franchiseId}/count`;
    console.log(`[FranchiseService] Fetching student count for franchise ${franchiseId} from: ${franchiseApi.defaults.baseURL}${url}`);
    
    try {
        const response = await franchiseApi.get(url);
        console.log(`[FranchiseService] Student count response for ${franchiseId}:`, response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error fetching student count for ${franchiseId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch student count for franchise ${franchiseId}`);
    }
};

// Function to get student counts for all franchises
export const getAllFranchiseStudentCounts = async () => {
    const url = '/students/counts';
    console.log(`[FranchiseService] Fetching student counts for all franchises from: ${franchiseApi.defaults.baseURL}${url}`);
    
    try {
        const response = await franchiseApi.get(url);
        console.log(`[FranchiseService] All franchise student counts response:`, response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error fetching all franchise student counts:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to fetch student counts for all franchises`);
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
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log(`[FranchiseService] Raw response from updateFranchise for ${franchiseId}:`, response);
        return response.data;
    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error(`[FranchiseService] Error updating franchise ${franchiseId}:`, errorData);
        throw errorData;
    }
};

export const updateFranchiseStatusOnly = async (franchiseId, status) => {
    const url = `/${franchiseId}/status`; // Backend should handle this route specifically for status
    console.log(`[FranchiseService] Updating ONLY status for ${franchiseId} to ${status}`);

    try {
        const response = await franchiseApi.patch(url, { status }); // Send JSON payload
        console.log(`[FranchiseService] Status update response for ${franchiseId}:`, response);
        return response.data;
    } catch (error) {
        console.error(`[FranchiseService] Error updating status for ${franchiseId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error(`Failed to update status for franchise ${franchiseId}`);
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
