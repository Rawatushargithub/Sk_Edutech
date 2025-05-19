import express from 'express';
import { getProfile , updateProfile} from '../controllers/instituteController.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = express.Router();

//institute creation
// router.route('/register' , )

// Get institute profile
router.get('/profile',getProfile);

// Update institute profile
router.route('/profile_update').post( 
   upload.fields(
    [
        { name: 'profilePicture', maxCount: 1 },
        { name: 'instituteLogo', maxCount: 1 },
        { name: 'instituteSignature', maxCount: 1 }
    ]
   ) 
    ,updateProfile);

export default router;

// FOR FUTURE USE of making code better
// import path from 'path';
// import fs from 'fs';
//  Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       const uploadDir = 'uploads/';
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }
//       cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
//   });
