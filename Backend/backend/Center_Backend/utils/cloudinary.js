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
                resource_type: "image", // Automatically detect file type (e.g., image, video)
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

    // const deleteFromCloudinary = async(videoPublicId , thumbnailPublicId ) => {
    //     try{
    //         // console.log("public id of video and thumbnail :: " , videoPublicId , " " , thumbnailPublicId)
    //         if( videoPublicId == "")
    //         {
    //             const response_2 =  await cloudinary.uploader.destroy( thumbnailPublicId );
    //             console.log("Response 2 from deleted function :: ",response_2)
    //             return response_2;
    //         }
    //         else if( thumbnailPublicId = "")
    //         {
    //             const response_1 =  await cloudinary.uploader.destroy( videoPublicId , { resource_type: 'video' });
    //             console.log("Response 1 from deleted function :: ",response_1) 
    //             return response_1
    //         }
    //          else{
    //             const response_2 =  await cloudinary.uploader.destroy( thumbnailPublicId );
    //             const response_1 =  await cloudinary.uploader.destroy( videoPublicId , { resource_type: 'video' });
    //             return response_1 , response_2;
    //          }
          
    //     }
    //     catch(error){
    //         console.log("error" , error);
    //     }
    // }

    export { uploadOnCloudinary };
    