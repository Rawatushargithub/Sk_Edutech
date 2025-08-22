import {v2 as cloudinary} from "cloudinary";
import fs from "fs" // fs is file system library provided by node js

//cloudinary is used for taking the file from local server and save into cloudinary 
//fs is used for managing files , here we are using it for unlinking the file from our server

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
    });

    console.log("Cloudinary Config:", {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "Not Set", 
        api_key: process.env.CLOUDINARY_API_KEY || "Not Set",
        api_secret: process.env.CLOUDINARY_API_SECRET ? "Set" : "Not Set" // We won't log the secret itself for security
      });
   
      const uploadOnCloudinary = async (localfilepath) => {
        if (!localfilepath) return null; // Immediately return if no file path is provided
    
        try {
            console.log("Uploading file to Cloudinary:", localfilepath);
            
            // Determine resource type based on file extension
            const fileExtension = localfilepath.split('.').pop().toLowerCase();
            let resourceType = "auto";
            let uploadOptions = {};
            
            if (fileExtension === 'pdf') {
                resourceType = "raw";
                uploadOptions = {
                    resource_type: resourceType,
                    access_mode: "public", // Make PDFs publicly accessible
                    type: "upload"
                };
            } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
                resourceType = "image";
                uploadOptions = {
                    resource_type: resourceType
                };
            } else {
                // For other file types (doc, docx, txt, etc.)
                resourceType = "raw";
                uploadOptions = {
                    resource_type: resourceType,
                    access_mode: "public"
                };
            }
            
            const response = await cloudinary.uploader.upload(localfilepath, uploadOptions);
    
            console.log("File successfully uploaded to Cloudinary:", response);
            fs.unlinkSync(localfilepath); // Remove the file from the local server after uploading
            return response; // Return the response for further processing
        } 
        catch (error) {
            console.error("Cloudinary upload error:", error);
            
            // Only attempt to unlink if the file exists
            if (fs.existsSync(localfilepath)) fs.unlinkSync(localfilepath);
            
            return null; // Return null if there was an error uploading
        }
    };

    // Function to delete file from Cloudinary (handles both images and raw files like PDFs)
    const deleteFromCloudinary = async (fileUrl) => {
        if (!fileUrl) return null;
        
        try {
            // Extract public_id from Cloudinary URL
            const publicId = extractPublicId(fileUrl);
            
            if (!publicId) {
                console.error("Could not extract public_id from URL:", fileUrl);
                return { success: false, error: "Could not extract public_id" };
            }
            
            console.log("Deleting file from Cloudinary with public_id:", publicId);
            
            // Determine if it's a raw file (like PDF) based on URL or extension
            const isRawFile = fileUrl.includes('/raw/') || publicId.includes('.pdf') || publicId.includes('.doc') || publicId.includes('.docx');
            
            let response;
            if (isRawFile) {
                // For raw files (PDFs, docs, etc.), use resource_type: "raw"
                response = await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
            } else {
                // For images, use default resource_type
                response = await cloudinary.uploader.destroy(publicId);
            }
            
            console.log("File deletion response from Cloudinary:", response);
            
            return { 
                success: response.result === 'ok', 
                result: response.result,
                response: response 
            };
        } catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
            return { success: false, error: error.message };
        }
    };

     // Helper function to extract public_id from Cloudinary URL
    const extractPublicId = (cloudinaryUrl) => {
        try {
            console.log("Extracting public_id from Cloudinary URL:", cloudinaryUrl);
            // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
            // For raw files: https://res.cloudinary.com/demo/raw/upload/v1234567890/sample.pdf
            const urlParts = cloudinaryUrl.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            
            if (uploadIndex === -1) return null;
            
            // Get the part after 'upload' and version (if present)
            let publicIdPart = urlParts.slice(uploadIndex + 1).join('/');
            
            // Remove version if present (starts with 'v' followed by numbers)
            if (publicIdPart.match(/^v\d+\//)) {
                publicIdPart = publicIdPart.split('/').slice(1).join('/');
            }
            
            // For raw files (PDFs, docs, etc.), keep the file extension as part of public_id
            // For images, remove the file extension
            const isRawFile = cloudinaryUrl.includes('/raw/') || publicIdPart.includes('.pdf') || publicIdPart.includes('.doc') || publicIdPart.includes('.docx');
            
            let publicId;
            if (isRawFile) {
                // Keep extension for raw files
                publicId = publicIdPart;
            } else {
                // Remove extension for images
                publicId = publicIdPart.replace(/\.[^/.]+$/, '');
            }
            
            console.log("Extracted public_id:", publicId, "| isRawFile:", isRawFile);
            return publicId;
        } catch (error) {
            console.error("Error extracting public_id:", error);
            return null;
        }
    };

    export { uploadOnCloudinary ,deleteFromCloudinary };
    