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

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await Otp.findOneAndUpdate({ email }, { otp, otpExpiry }, { upsert: true, new: true });

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
        throw new ApiError(500, "Failed to send OTP. Please try again later.");
    }
});

const submitWithOtp = asyncHandler(async (req, res) => {
    console.log("Received body for submitWithOtp:", JSON.stringify(req.body, null, 2));
    const { email, otp, franchiseName, ownerName, designation, dob, mobile, address, state, city, postalCode, country, totalComputers, totalStudents, planValidityDays, gstNumber, atcCode } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required for submission.");
    }

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
        throw new ApiError(400, "OTP not found. Please request a new one.");
    }

    if (otpRecord.otp !== otp) {
        throw new ApiError(400, "Invalid OTP. Please check and try again.");
    }

    if (otpRecord.otpExpiry < new Date()) {
        throw new ApiError(400, "OTP has expired. Please request a new OTP.");
    }

    // OTP is valid, create the franchise application
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
        applicationType: 'FranchiseApplied',
        status: 'Pending',
        verificationStatus: 'Verified' // Since OTP is verified
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

export { requestOtp, submitWithOtp };
