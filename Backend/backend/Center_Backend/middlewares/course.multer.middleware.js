import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Path is relative from this file's location in Center_Backend/middlewares/
      // ../../../ moves up to Sk_Edutech/Backend/
      // then public/temp
      const destPath = path.resolve(__dirname, '../../../public/temp');
      cb(null, destPath); 
    },
    filename: function (req, file, cb) {
      // Using a timestamp to make filenames unique to avoid overwrites
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "courseImage") {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed for courseImage!'), false);
        }
    } else if (file.fieldname === "courseMaterialFiles") { // Changed from courseMaterials
        // Allow various common document/image types for notes, not just PDF
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type for course material/note!'), false);
        }
    } else {
        // If the fieldname is not expected, reject the file
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Unexpected field: ${file.fieldname}`), false);
    }
};

export const uploadCourseFiles = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
}).fields([
    { name: 'courseImage', maxCount: 1 },
    { name: 'courseMaterialFiles', maxCount: 10 } // For course form bulk material uploads
]);

// Separate multer instance for single 'noteFile' upload
export const uploadSingleNoteFile = multer({
    storage: storage,
    fileFilter: (req, file, cb) => { // Simplified file filter for 'noteFile'
        if (file.fieldname === "noteFile") {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type for note!'), false);
            }
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Unexpected field: ${file.fieldname}`), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
}).fields([{ name: 'noteFile', maxCount: 1 }]); // Use .fields to be consistent with controller expecting req.files.noteFile[0]
                                               // or use .single('noteFile') and access req.file in controller
                                               // Using .fields for now to match controller's current expectation.
