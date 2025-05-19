import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) { //in request json data will come but to configure file multer is used express file upload can also used for configure files
      cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
      // the problem of localfilepath in cloudinary will solved becoz this storage function will return the originalFileName 
  export const upload = multer({
     storage,
     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
     fileFilter: (req, file, cb) => {
       if (file.mimetype.startsWith('image/')) {
         cb(null, true);
       } else {
         cb(new Error('Only image files are allowed!'), false);
       }
     }
    }) 