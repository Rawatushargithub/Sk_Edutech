import { Router } from 'express';
import {
    addFranchiseByAdmin,
    getFranchiseRequests,
    updateFranchiseStatusVerification,
    getAllFranchises,
    getFranchiseById,    // New
    updateFranchiseById, // New
    deleteFranchiseById,  // New
    resendFranchiseCredentials, // New
    loginFranchise, // New
    verificationCheck,
    updateFranchiseStatusOnly, // New 
    getRecentFranchises,
    getFranchiseCount,
    getFranchiseByFranchiseId,
    updateFranchiseContact ,
    getStudentCountByFranchise,
    getAllFranchiseStudentCounts,

} from '../../controllers/Franchise/franchise.controller.js';
import { upload } from '../../middlewares/franchise.multer.middleware.js'; // Assuming multer middleware is configured here

const router = Router();

// --- Super Admin Routes ---

// Route to get all ACTIVE franchises (for general listing)
router.route('/').get(getAllFranchises);

router.put("/manage/updatecontact", updateFranchiseContact); //for update center profile
// Route for ADMIN to create a new, active franchise
router.route('/').post(
    upload.fields([
        { name: 'ownerPhoto', maxCount: 1 },
        { name: 'franchiseSignature', maxCount: 1 }
    ]),
    addFranchiseByAdmin
);

// Route to get all PENDING franchise requests
router.route('/requests').get(getFranchiseRequests);

// Route for ADMIN to update status/verification of a specific franchise (using MongoDB _id)
// Using PATCH as it's a partial update
router.route('/:franchiseId/manage').patch(updateFranchiseStatusVerification);

// Route to get recently added franchises
router.get('/recent', getRecentFranchises);

// Route to get count of franchises
router.get('/count', getFranchiseCount);

// --- Routes for specific franchise CRUD operations ---
router.route('/:franchiseId')
    .get(getFranchiseById) // Get a single franchise by ID
    .put( // Update a franchise by ID (full update, ensure multer handles files if needed for edit)
        upload.fields([
            { name: 'ownerPhoto', maxCount: 1 },
            { name: 'franchiseSignature', maxCount: 1 }
        ]),
        updateFranchiseById
    )
    .delete(deleteFranchiseById); // Delete a franchise by ID

// Route for ADMIN to resend credentials
router.route('/:franchiseId/resend-credentials').post(resendFranchiseCredentials);

router.post("/login", loginFranchise);
router.get("/verify/:franchiseId", verificationCheck);
router.patch("/:franchiseId/status", updateFranchiseStatusOnly);


router.get("/getprofile/:franchiseId", getFranchiseByFranchiseId);

router.get('/:franchiseId/count', getStudentCountByFranchise);

// Route to get student counts for all franchises
router.get('/students/counts', getAllFranchiseStudentCounts);

export default router;
