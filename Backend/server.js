// index.js or app.js (depending on your file name)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Ensure public/temp directory exists for multer uploads
const tempDir = path.join(__dirname, 'public/temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Created temporary directory for uploads: ${tempDir}`);
}
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // allowed frontends
}));

// Database Connection
const PORT = process.env.PORT || 8000; // Adjusted to reflect your running port
const DB_NAME = "SK_Edutech"; // Changed to lowercase to match existing DB

// Construct MongoDB URI more safely
let mongoURI = process.env.MONOGODB_URI;
if (mongoURI && mongoURI.endsWith('/')) {
  mongoURI = mongoURI.slice(0, -1); // Remove trailing slash if present
}
const finalMongoURI = `${mongoURI}/${DB_NAME}`;
console.log("Attempting to connect to MongoDB with URI:", finalMongoURI); // Log the URI

mongoose.connect(finalMongoURI, {
  // useNewUrlParser and useUnifiedTopology are deprecated and can be removed
  // mongoose.connect(finalMongoURI) is enough for modern Mongoose versions
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Homepage Routes
import mainSliderRoutes from './backend/Homepage_backend/routes/mainSliderRoute.js'
import marqueeRoutes from './backend/Homepage_backend/routes/marquee.routes.js'
import FeedbackRoutes from './backend/Homepage_backend/routes/feedbackRoutes.js'
import AchieverSliderRoutes from './backend/Homepage_backend/routes/achieverSliderRoutes.js'
import eduSectionRouter from './backend/Homepage_backend/routes/EduSectionImageRoutes.js'
import marqueeLineRouter from './backend/Admin_Backend/routes/MarqueeLine/marquee.routes.js'
import homepageFranchiseRoutes from './backend/Homepage_backend/routes/homepageFranchise.routes.js'

// Homepage Routes
// app.use("/api/v1/gallery", galleryRoutes)
app.use("/api/v1/mainSliderImages", mainSliderRoutes) 
app.use("/api/v1/marquee", marqueeRoutes)
app.use("/api/v1", FeedbackRoutes);
app.use("/api/v1/achievements",AchieverSliderRoutes );
app.use("/api/v1/eduSection",eduSectionRouter );
app.use("/api/v1/marquee",marqueeLineRouter );
app.use("/api/v1/homepage-franchises", homepageFranchiseRoutes);




// Admin Routes
import mainSliderRouter from './backend/Admin_Backend/routes/MainSlider/mainSlider.routes.js'
import achieversRouter from './backend/Admin_Backend/routes/Achievers/achievementRoutes.js'
import eventBoxRouter from './backend/Admin_Backend/routes/Achievers/eventBox.routes.js'
import franchiseRouter from "./backend/Admin_Backend/routes/franchise/franchise.routes.js"; // Import franchise router
import galleryRouter from "./backend/Admin_Backend/routes/Gallery/galleryRoutes.js"; // Import franchise router
import adminCourseRouter from "./backend/Admin_Backend/routes/courses.routes.js"; // Import admin course router
import paymentRouter from "./backend/Admin_Backend/routes/admin.routes.js"; // Import payment router
import adminRoutes from "./backend/Admin_Backend/routes/AdminPanel/admin.panel.js"; // Import admin routes
import adminstudentRouter from "./backend/Admin_Backend/routes/student.routes.js"; // Import student router
import notificationRoutes from "./backend/Admin_Backend/routes/Notification/notification.routes.js"; // Import notification router
import AdminCourseListRouter from "./backend/Admin_Backend/routes/admin.course.routes.js"
// admin routes
app.use("/api/v1/mainSliderImages",mainSliderRouter)
app.use("/api/v1/marquee",marqueeRoutes)
app.use("/api/v1/admin_student", adminstudentRouter)
app.use("/api/v1/achievers", achieversRouter)
app.use("/api/v1/eventBoxImages",eventBoxRouter)
app.use("/api/v1/adminwallet", paymentRouter)
app.use("/api/v1/franchises", franchiseRouter); 
app.use("/api/v1/gallery", galleryRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/courses", AdminCourseListRouter);
app.use("/api/v1/admin_courses", adminCourseRouter); // Add admin course routes
app.use("/api/v1/notification", notificationRoutes);

//Student Routes
import StudentRoutes from "./backend/Student_backend/routes/studentRoutes.js"
import notesRoutes from "./backend/Student_backend/routes/notesRoutes.js";
import certificateRoutes from './backend/Student_backend/routes/certiifcateRoutes.js'
import feesRoutes from "./backend/Student_backend/routes/feesRoutes.js";
import feedbackRoutes from "./backend/Student_backend/routes/feedbackRoutes.js";
import ExamRoutes from "./backend/Student_backend/routes/exam.routes.js";
import videoRoutes from "./backend/Student_backend/routes/videoRoutes.js";
import AdmitCardRoutes from "./backend/Student_backend/routes/admitcard.routes.js"
import CourseRouter from "./backend/Student_backend/routes/student.course.routes.js"

// Student Routes 
app.use("/api/v1/student", StudentRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/videos",videoRoutes );
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/fees", feesRoutes);
app.use("/api/exams", ExamRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/admit-card", AdmitCardRoutes);
app.use("/api/v1/coursedetails", CourseRouter);





//Center Routes
import studentRouter from "./backend/Center_Backend/routes/Student/Student.routes.js";
import courseRouter from "./backend/Center_Backend/routes/Courses.routes.js"
import feesRouter from "./backend/Center_Backend/routes/Student/fees_routes.js" 
import batchRouter from "./backend/Center_Backend/routes/batch.routes.js";
import institute_examRoutes from "./backend/Center_Backend/routes/examRoutes.js"
import institute_walletRoutes from "./backend/Center_Backend/routes/payment.routes.js"
import institute_EnquiryRoutes from "./backend/Center_Backend/routes/enquiryStudent.route.js";
import institute_questionBankRoutes from "./backend/Center_Backend/routes/questionBankroutes.js";
import Certificate_routes from './backend//Center_Backend/routes/certificate.routes.js';
import getCenterCertificate  from './backend/Center_Backend/routes/CenterCertificate.routes.js';
// import institute_detailsRoutes from "../Backend/backend/Center_Backend/routes/";
// import getCenterCertificate from './backend/Center_Backend/controllers/centerCertificate.controller.js' 

app.use("/api/v1/institute_student" , studentRouter);
app.use("/api/v1/institute_courses" , courseRouter); 
app.use("/api/v1/institute_fees" , feesRouter);
app.use("/api/v1/institute_batche" , batchRouter); 

app.use("/api/v1/institute_exam", institute_examRoutes);
app.use("/api/v1/institute_wallet", institute_walletRoutes);
app.use("/api/v1/institute_enquiry", institute_EnquiryRoutes);
app.use("/api/v1/institute_question_bank", institute_questionBankRoutes);
app.use("/api/v1/institute_certificates", Certificate_routes);
app.use("/api/v1/certificates", getCenterCertificate);



// app.use("/api/v1/institute_details", institute_questionBankRoutes);
console.log("Center Routes Loaded");