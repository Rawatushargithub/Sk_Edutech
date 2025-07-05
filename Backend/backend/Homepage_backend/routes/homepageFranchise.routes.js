import { Router } from "express";
import { requestOtp, submitWithOtp } from "../controllers/homepageFranchise.controller.js";
import multer from "multer";

const router = Router();

// Configure Multer for file uploads
// Basic setup: in-memory storage. For production, use diskStorage or a cloud service.
// Adjust limits and storage as needed.
const storage = multer.memoryStorage(); // Stores files in memory as Buffer objects

// Example of a more robust multer setup (if you had a local 'public/temp' folder for uploads)
// import fs from "fs";
// const tempDir = "./public/temp"; // Ensure this directory exists
// if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
// }
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, tempDir);
//     },
//     filename: function (req, file, cb) {
//       // Basic filename, consider adding unique identifiers
//       cb(null, Date.now() + '-' + file.originalname);
//     }
// });


const upload = multer({
    storage: storage, // Using memoryStorage for now
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit per file (adjust as needed)
    }
});

// Route to request OTP
// Expects JSON: { email, franchiseName, ownerName, mobile }
router.route("/request-otp").post(requestOtp);

// Route to submit application with OTP
// Expects FormData including all text fields, OTP, and files
router.route("/submit-with-otp").post(
    upload.fields([
        { name: 'ownerPhoto', maxCount: 1 },
        { name: 'franchiseSignature', maxCount: 1 }
    ]),
    submitWithOtp
);

export default router;
