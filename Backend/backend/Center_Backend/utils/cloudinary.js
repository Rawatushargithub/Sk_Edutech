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
            const response = await cloudinary.uploader.upload(localfilepath, {
                resource_type: "raw", // Automatically detect file type (e.g., image, video)
            });
    
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

    // Function to delete image from Cloudinary
    const deleteFromCloudinary = async (imageUrl) => {
        if (!imageUrl) return null;
        
        try {
            // Extract public_id from Cloudinary URL
            const publicId = extractPublicId(imageUrl);
            
            if (!publicId) {
                console.error("Could not extract public_id from URL:", imageUrl);
                return null;
            }
            
            console.log("Deleting image from Cloudinary with public_id:", publicId);
            
            const response = await cloudinary.uploader.destroy(publicId);
            console.log("Image deleted from Cloudinary:", response);
            
            return response;
        } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
            return null;
        }
    };

     // Helper function to extract public_id from Cloudinary URL
    const extractPublicId = (cloudinaryUrl) => {
        try {
            console.log("Extracting public_id from Cloudinary URL:", cloudinaryUrl);
            // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg
            // Extract the public_id which is the part after the last '/' and before the file extension
            const urlParts = cloudinaryUrl.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            
            if (uploadIndex === -1) return null;
            
            // Get the part after 'upload' and version (if present)
            let publicIdPart = urlParts.slice(uploadIndex + 1).join('/');
            
            // Remove version if present (starts with 'v' followed by numbers)
            if (publicIdPart.match(/^v\d+\//)) {
                publicIdPart = publicIdPart.split('/').slice(1).join('/');
            }
            
            // Remove file extension
            const publicId = publicIdPart.replace(/\.[^/.]+$/, '');
            
            return publicId;
        } catch (error) {
            console.error("Error extracting public_id:", error);
            return null;
        }
    };

    export { uploadOnCloudinary ,deleteFromCloudinary };
    