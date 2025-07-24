import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/mailer.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import  Franchise  from "../../Admin_Backend/models/franchise/franchise.models.js"; // Use local Franchise model that shares the same Mongoose connection
import crypto from "crypto";

// In-memory store for OTPs. In a production scenario, consider Redis or a temporary DB collection.
const otpStore = new Map(); // Stores { email: { otp, expires, data } }


const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

const requestOtp = asyncHandler(async (req, res) => {
    const { email, franchiseName, ownerName, mobile } = req.body;

    if (!email || !franchiseName || !ownerName || !mobile) {
        throw new ApiError(400, "Email, Franchise Name, Owner Name, and Mobile are required to request OTP.");
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        throw new ApiError(400, "Invalid email format.");
    }

    const otp = generateOtp();
    const expires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Store OTP with applicant's partial data for verification upon final submission
    // This data is minimal, the full form data (including files) comes with the final submit call
    otpStore.set(email, { otp, expires, applicantData: { franchiseName, ownerName, mobile } });

    console.log(`[HomepageFranchiseController] Generated OTP for ${email}: ${otp}`);

    try {
        await sendEmail({
            to: email,
            subject: "Your OTP for Franchise Application",
            text: `Dear ${ownerName},\n\nYour OTP for submitting the franchise application for ${franchiseName} is: ${otp}\nThis OTP is valid for 10 minutes.\n\nThank you,\nSK Team`,
            html: `<p>Dear ${ownerName},</p><p>Your OTP for submitting the franchise application for ${franchiseName} is: <strong>${otp}</strong></p><p>This OTP is valid for 10 minutes.</p><p>Thank you,<br/>SK Team</p>`
        });
        return res.status(200).json(
            new ApiResponse(200, {}, "OTP sent successfully to your email address.")
        );
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        // Clean up OTP from store if email sending fails to prevent retrying with same OTP
        otpStore.delete(email);
        throw new ApiError(500, "Failed to send OTP. Please try again later.");
    }
});

const submitWithOtp = asyncHandler(async (req, res) => {
    // Assuming multer has processed 'ownerPhoto' and 'franchiseSignature' if they are part of this request
    // and req.files might contain them, or req.body will have their Cloudinary URLs if pre-processed.
    // For now, we'll focus on the OTP and other text fields from FormData.
    const {
        email, otp, franchiseName, ownerName, designation, dob, mobile,
        address, state, city, postalCode, country,
        totalComputers, totalStudents, planValidityDays,
        gstNumber, atcCode, applicationType
    } = req.body;

    // Files would be in req.files if multer is used correctly for these fields
    const ownerPhotoFile = req.files?.ownerPhoto?.[0];
    const franchiseSignatureFile = req.files?.franchiseSignature?.[0];

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required for submission.");
    }

    const storedOtpData = otpStore.get(email);

    if (!storedOtpData) {
        throw new ApiError(400, "Invalid OTP or OTP expired. Please request a new OTP.");
    }

    if (storedOtpData.otp !== otp) {
        throw new ApiError(400, "Invalid OTP. Please check and try again.");
    }

    if (Date.now() > storedOtpData.expires) {
        otpStore.delete(email); // Clean up expired OTP
        throw new ApiError(400, "OTP has expired. Please request a new OTP.");
    }

    // OTP is valid, proceed to save the application

    let ownerPhotoUrl = null;
    let franchiseSignatureUrl = null;

    try {
        if (ownerPhotoFile) {
            console.log("[HomepageFranchiseController] Uploading owner photo...");
            const ownerPhotoUploadResult = await uploadBufferToCloudinary(ownerPhotoFile.buffer, ownerPhotoFile.originalname, "franchise_owner_photos");
            if (ownerPhotoUploadResult && ownerPhotoUploadResult.secure_url) {
                ownerPhotoUrl = ownerPhotoUploadResult.secure_url;
                console.log("[HomepageFranchiseController] Owner photo uploaded:", ownerPhotoUrl);
            } else {
                console.warn("[HomepageFranchiseController] Owner photo upload failed or no URL returned.");
                // Decide if this is a critical error. For now, we'll proceed without it if it fails.
            }
        }

        if (franchiseSignatureFile) {
            console.log("[HomepageFranchiseController] Uploading franchise signature...");
            const franchiseSignatureUploadResult = await uploadBufferToCloudinary(franchiseSignatureFile.buffer, franchiseSignatureFile.originalname, "franchise_signatures");
            if (franchiseSignatureUploadResult && franchiseSignatureUploadResult.secure_url) {
                franchiseSignatureUrl = franchiseSignatureUploadResult.secure_url;
                console.log("[HomepageFranchiseController] Franchise signature uploaded:", franchiseSignatureUrl);
            } else {
                console.warn("[HomepageFranchiseController] Franchise signature upload failed or no URL returned.");
            }
        }
    } catch (uploadError) {
        console.error("[HomepageFranchiseController] Error during file upload to Cloudinary:", uploadError);
        // Potentially throw an ApiError here if file uploads are critical
        // For now, logging and proceeding, URLs will be null if upload failed.
    }
    
    // Ensure required file URLs are present if they are mandatory for your schema
    if (!ownerPhotoUrl) {
        // This check depends on whether ownerPhotoUrl is strictly required by your model
        console.warn("[HomepageFranchiseController] Owner photo URL is missing. Application might be incomplete. Ensure it's not required or handle this case.");
        // For now, we assume it's required by the model based on previous setup. If upload failed, this will cause DB validation error.
        // throw new ApiError(400, "Owner photo is required and upload failed.");
    }
    if (!franchiseSignatureUrl) {
        console.warn("[HomepageFranchiseController] Franchise signature URL is missing. Application might be incomplete.");
        // throw new ApiError(400, "Franchise signature is required and upload failed.");
    }

    let finalGstNumber = gstNumber || null;
    if (finalGstNumber) {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(finalGstNumber.toUpperCase())) {
            console.warn(`[HomepageFranchiseController] Invalid GST Number format provided: ${finalGstNumber}. Setting to null.`);
            finalGstNumber = null; // Or you could throw an ApiError(400, "Invalid GST Number format.")
        } else {
            finalGstNumber = finalGstNumber.toUpperCase();
        }
    }

    try {
        // Create a new franchise application using the existing Franchise model
        const newApplication = await Franchise.create({
            franchiseName,
            ownerName,
            designation,
            dob,
            email,
            mobile,
            address,
            state,
            city,
            postalCode,
            country: country || 'INDIA',
            totalComputers: parseInt(totalComputers, 10),
            totalStudents: parseInt(totalStudents, 10),
            planValidityDays: parseInt(planValidityDays, 10),
            gstNumber: finalGstNumber,
            atcCode: atcCode || null,
            ownerPhotoUrl, // The field name matches
            franchiseSignatureUrl, // The field name matches
            applicationType: 'FranchiseApplied', // Set this correctly for the request stack
            status: 'Pending', // Default status for new applications in the existing schema
            verificationStatus: 'Pending' // Default verification status
        });

        otpStore.delete(email); // OTP used successfully, remove it

        console.log(`[HomepageFranchiseController] Application for ${email} successfully saved with ID: ${newApplication._id}`);
        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    applicationId: newApplication._id,
                    franchiseName: newApplication.franchiseName,
                    email: newApplication.email,
                    status: newApplication.status
                },
                "Successfully sending the details. Please wait for super admin approval!"
            )
        );

    } catch (dbError) {
        console.error("[HomepageFranchiseController] Database error while saving application:", dbError);
        // Handle specific Mongoose errors, e.g., unique constraint (E11000)
        if (dbError.code === 11000) {
            let field = 'unknown';
            if (dbError.message.includes('email')) field = 'email';
            else if (dbError.message.includes('mobile')) field = 'mobile number';
            throw new ApiError(409, `This ${field} is already associated with an application.`);
        }
        // General DB error, potentially a validation error from the Franchise model
        throw new ApiError(500, dbError.message || "Failed to save your application due to a server error. Please try again.");
    }
});

export { requestOtp, submitWithOtp };
