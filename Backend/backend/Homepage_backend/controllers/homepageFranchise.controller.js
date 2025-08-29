import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/mailer.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import Franchise from "../../Admin_Backend/models/franchise/franchise.models.js";
import Otp from "../models/Otp.model.js";
import crypto from "crypto";

const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

const requestOtp = asyncHandler(async (req, res) => {
    const { email, ownerName } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required to request OTP.");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        throw new ApiError(400, "Invalid email format.");
    }

    // Reuse existing unexpired OTP if present to avoid frequent regeneration
    const existing = await Otp.findOne({ email });
    const now = new Date();
    let otp;
    let otpExpiry;
    if (existing && existing.otp && existing.otpExpiry && existing.otpExpiry > now) {
        otp = String(existing.otp);
        otpExpiry = existing.otpExpiry;
    } else {
        otp = generateOtp();
        otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
        await Otp.findOneAndUpdate({ email }, { otp, otpExpiry }, { upsert: true, new: true });
    }

    console.log(`[HomepageFranchiseController] Generated OTP for ${email}: ${otp}`);

    try {
        await sendEmail({
            to: email,
            subject: "Your OTP for Franchise Application",
            text: `Dear ${ownerName},\n\nYour OTP for submitting the franchise application is: ${otp}\nThis OTP is valid for 10 minutes.\n\nThank you,\nSK Team`,
            html: `<p>Dear ${ownerName},</p><p>Your OTP for submitting the franchise application is: <strong>${otp}</strong></p><p>This OTP is valid for 10 minutes.</p><p>Thank you,<br/>SK Team</p>`
        });
        return res.status(200).json(
            new ApiResponse(200, {}, "OTP sent successfully to your email address.")
        );
    } catch (error) {
        console.error("Failed to send OTP email:", error);
        // In development, allow flow to continue without email delivery
        if (process.env.NODE_ENV !== 'production') {
            return res.status(200).json(
                new ApiResponse(200, { devOtp: otp }, "OTP generated locally (email not sent). Use the devOtp for testing.")
            );
        }
        throw new ApiError(500, "Failed to send OTP. Please try again later.");
    }
});

const submitWithOtp = asyncHandler(async (req, res) => {
    console.log("Received body for submitWithOtp:", JSON.stringify(req.body, null, 2));
    let { email, otp, franchiseName, ownerName, designation, dob, mobile, address, state, city, postalCode, country, totalComputers, totalStudents, planValidityDays, gstNumber, atcCode } = req.body;
    const franchiseLogoFile = req.files?.franchiseLogo?.[0];
    const franchiseSignatureFile = req.files?.franchiseSignature?.[0];
    const ownerAadharFile = req.files?.ownerAadhar?.[0];
    const ownerPanFile = req.files?.ownerPan?.[0];
    const ownerHigherEducationFile = req.files?.ownerHigherEducation?.[0];
    const ownerPhotoFile = req.files?.ownerPhoto?.[0];

    // Normalize
    if (typeof otp !== 'undefined' && otp !== null) {
        otp = String(otp).trim();
    }

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required for submission.");
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
        throw new ApiError(400, "OTP not found. Please request a new one.");
    }

    if (process.env.NODE_ENV !== 'production') {
        console.log(`[OTP Debug] Stored OTP for ${email}:`, String(otpRecord.otp).trim(), 'Provided:', otp);
    }
    if (String(otpRecord.otp).trim() !== otp) {
        throw new ApiError(400, "Invalid OTP. Please check and try again.");
    }

    if (otpRecord.otpExpiry < new Date()) {
        throw new ApiError(400, "OTP has expired. Please request a new OTP.");
    }

    // Validate and upload files
    const validateFile = (file, allowedMimes, minBytes, maxBytes, label) => {
        if (!file) return;
        if (minBytes && file.size < minBytes) {
            throw new ApiError(400, `${label} must be at least ${Math.round(minBytes/1024)} KB`);
        }
        if (maxBytes && file.size > maxBytes) {
            throw new ApiError(400, `${label} must be at most ${Math.round(maxBytes/1024)} KB`);
        }
        if (allowedMimes && !allowedMimes.includes(file.mimetype)) {
            throw new ApiError(400, `${label} must be one of types: ${allowedMimes.join(', ')}`);
        }
    };

    // Constraints
    validateFile(ownerAadharFile, ["application/pdf"], 50 * 1024, 1 * 1024 * 1024, "Owner Aadhar");
    validateFile(ownerPanFile, ["application/pdf"], 20 * 1024, 500 * 1024, "Owner PAN");
    validateFile(ownerHigherEducationFile, ["application/pdf", "image/jpeg", "image/jpg"], 50 * 1024, 2 * 1024 * 1024, "Owner Higher Education Certificate");
    validateFile(ownerPhotoFile, ["image/jpeg", "image/jpg", "image/png"], 20 * 1024, 200 * 1024, "Owner Passport Size Photo");

    // OTP is valid, create the franchise application
    let franchiseLogoUrl = null;
    if (franchiseLogoFile) {
        const uploadResult = await uploadBufferToCloudinary(franchiseLogoFile.buffer, franchiseLogoFile.originalname, "franchise_logos");
        franchiseLogoUrl = uploadResult.secure_url;
    }

    let franchiseSignatureUrl = null;
    if (franchiseSignatureFile) {
        const uploadResult = await uploadBufferToCloudinary(franchiseSignatureFile.buffer, franchiseSignatureFile.originalname, "franchise_signatures");
        franchiseSignatureUrl = uploadResult.secure_url;
    }

    let ownerAadharUrl = null;
    if (ownerAadharFile) {
        const uploadResult = await uploadBufferToCloudinary(ownerAadharFile.buffer, ownerAadharFile.originalname, "franchise_owner_aadhar");
        ownerAadharUrl = uploadResult.secure_url;
    }

    let ownerPanUrl = null;
    if (ownerPanFile) {
        const uploadResult = await uploadBufferToCloudinary(ownerPanFile.buffer, ownerPanFile.originalname, "franchise_owner_pan");
        ownerPanUrl = uploadResult.secure_url;
    }

    let ownerHigherEducationUrl = null;
    if (ownerHigherEducationFile) {
        const uploadResult = await uploadBufferToCloudinary(ownerHigherEducationFile.buffer, ownerHigherEducationFile.originalname, "franchise_owner_higher_education");
        ownerHigherEducationUrl = uploadResult.secure_url;
    }

    let ownerPhotoUrl = null;
    if (ownerPhotoFile) {
        const uploadResult = await uploadBufferToCloudinary(ownerPhotoFile.buffer, ownerPhotoFile.originalname, "franchise_owner_photo");
        ownerPhotoUrl = uploadResult.secure_url;
    }

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
        gstNumber,
        atcCode,
        franchiseLogoUrl,
        franchiseSignatureUrl,
        ownerAadharUrl,
        ownerPanUrl,
        ownerHigherEducationUrl,
        ownerPhotoUrl,
        applicationType: 'FranchiseApplied',
        status: 'Pending',
        otpVerified: true,
        verificationStatus: 'Pending'
    });

    await Otp.deleteOne({ email }); // Delete the used OTP

    console.log(`[HomepageFranchiseController] Application for ${email} successfully saved with ID: ${newApplication._id}`);
    
    try {
        await sendEmail({
            to: email,
            subject: "Franchise Application Submitted Successfully",
            text: `Dear ${ownerName},\n\nYour franchise application has been successfully submitted. The super admin will review your details and eligibility and update your status accordingly.\n\nThank you,\nSK Team`,
            html: `<p>Dear ${ownerName},</p><p>Your franchise application has been successfully submitted. The super admin will review your details and eligibility and update your status accordingly.</p><p>Thank you,<br/>SK Team</p>`
        });
    } catch (error) {
        console.error("Failed to send application confirmation email:", error);
        // Don't throw an error here, as the application was already saved successfully.
        // Just log the error and proceed.
    }

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
});

const checkUniqueness = asyncHandler(async (req, res) => {
    const { email, mobile } = req.query;

    if (!email && !mobile) {
        throw new ApiError(400, "Email or mobile number is required to check for uniqueness.");
    }

    let query = {};
    if (email) {
        query.email = email;
    } else {
        query.mobile = mobile;
    }

    const existingFranchise = await Franchise.findOne(query);

    return res.status(200).json(
        new ApiResponse(200, { isUnique: !existingFranchise }, "Uniqueness check complete.")
    );
});

export { requestOtp, submitWithOtp, checkUniqueness };
