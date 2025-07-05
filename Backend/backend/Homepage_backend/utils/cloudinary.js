import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv'; // dotenv should be loaded in the main server.js file
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("[Cloudinary Util] Config Loaded:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "Not Set",
    api_key: process.env.CLOUDINARY_API_KEY ? "Set" : "Not Set",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not Set"
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer The buffer of the file to upload.
 * @param {string} originalFilename The original name of the file, used for context or folder structure.
 * @param {string} [folder="franchise_applications"] The Cloudinary folder to upload to.
 * @returns {Promise<object|null>} Cloudinary response object or null on error.
 */
const uploadBufferToCloudinary = (fileBuffer, originalFilename, folder = "franchise_applications") => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) {
            console.error("[Cloudinary Util] No file buffer provided for upload.");
            return resolve(null); // Or reject, depending on desired error handling
        }

        console.log(`[Cloudinary Util] Attempting to upload buffer for: ${originalFilename} to folder: ${folder}`);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: "auto", // Let Cloudinary detect resource type
                public_id: `${Date.now()}_${originalFilename.replace(/\s+/g, '_')}` // Create a somewhat unique public_id
            },
            (error, result) => {
                if (error) {
                    console.error("[Cloudinary Util] Upload stream error:", error);
                    reject(error);
                } else {
                    console.log("[Cloudinary Util] File uploaded successfully via stream:", result?.secure_url);
                    resolve(result);
                }
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

export { uploadBufferToCloudinary };
