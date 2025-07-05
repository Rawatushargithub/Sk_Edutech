import { Router } from 'express';
import {
    addFranchiseByAdmin,
    // applyForFranchise, // Placeholder for future use
    getFranchiseRequests,
    updateFranchiseStatusVerification,
    getAllFranchises,
    getFranchiseById,    // New
    updateFranchiseById, // New
    deleteFranchiseById,  // New
    resendFranchiseCredentials, // New
    loginFranchise, // New
    verificationCheck,
    updateFranchiseStatusOnly // New 
} from '../../controllers/Franchise/franchise.controller.js';
import { upload } from '../../middlewares/franchise.multer.middleware.js'; // Assuming multer middleware is configured here

const router = Router();

// --- Super Admin Routes ---

// Route to get all ACTIVE franchises (for general listing)
router.route('/').get(getAllFranchises);

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

// --- Franchise Application Route (Future Implementation) ---
// router.route('/apply').post(
//     upload.fields([ ...fields needed for application... ]),
//     applyForFranchise
// );

export default router;
