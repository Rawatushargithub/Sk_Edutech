// index.js or app.js (depending on your file name)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // allowed frontends
}));

// Database Connection
const PORT = process.env.PORT || 5000;
const DB_NAME = "SK_Edutech";

mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
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

// Homepage Routes
// app.use("/api/v1/gallery", galleryRoutes)
app.use("/api/v1/mainSliderImages", mainSliderRoutes)
app.use("/api/v1/marquee", marqueeRoutes)
app.use("/api/v1", FeedbackRoutes);
app.use("/api/v1/achievements",AchieverSliderRoutes );
app.use("/api/v1/eduSection",eduSectionRouter );
app.use("/api/v1/marquee",marqueeLineRouter );




// Admin Routes
import mainSliderRouter from './backend/Admin_Backend/routes/MainSlider/mainSlider.routes.js'
import achieversRouter from './backend/Admin_Backend/routes/Achievers/achievementRoutes.js'
import eventBoxRouter from './backend/Admin_Backend/routes/Achievers/eventBox.routes.js'
import franchiseRouter from "./backend/Admin_Backend/routes/franchise/franchise.routes.js"; // Import franchise router
import galleryRouter from "./backend/Admin_Backend/routes/Gallery/galleryRoutes.js"; // Import franchise router

// admin routes
app.use("/api/v1/mainSliderImages",mainSliderRouter)
app.use("/api/v1/marquee",marqueeRoutes)
// app.use("/api/v1/gallery", galleryRoutes)
app.use("/api/v1/achievers", achieversRouter)
app.use("/api/v1/eventBoxImages",eventBoxRouter)
// app.use("/api/v1/payment" , paymentRouter)
// app.use("/api/v1/adminwallet" , adminRouter)
app.use("/api/v1/franchises", franchiseRouter); 
app.use("/api/v1/gallery", galleryRouter);




//Student Routes
import StudentRoutes from "./backend/Student_backend/routes/studentRoutes.js"
import notesRoutes from "./backend/Student_backend/routes/notesRoutes.js";
import videoRoutes from "./backend/Student_backend/routes/videoRoutes.js";
import certificateRoutes from './backend/Student_backend/routes/certiifcateRoutes.js'
import feesRoutes from "./backend/Student_backend/routes/feesRoutes.js";
import feedbackRoutes from "./backend/Student_backend/routes/feedbackRoutes.js";

// Student Routes 
app.use("/api/v1/student", StudentRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/fees", feesRoutes);

app.use("/api/v1/feedback", feedbackRoutes);




//Center Routes
import studentRouter from "./backend/Center_Backend/routes/Student/Student.routes.js";
import courseRouter from "./backend/Center_Backend/routes/Courses.routes.js"
import feesRouter from "./backend/Center_Backend/routes/Student/fees_routes.js" 
import batchRouter from "./backend/Center_Backend/routes/batch.routes.js";
import videoRouter from "./backend/Center_Backend/routes/VideoRoutes.js"
import institute_notesRoutes from "./backend/Center_Backend/routes/notesRoutes.js"
import institute_examRoutes from "./backend/Center_Backend/routes/examRoutes.js"
import institute_walletRoutes from "./backend/Center_Backend/routes/payment.routes.js"
import institute_EnquiryRoutes from "./backend/Center_Backend/routes/enquiryStudent.route.js";
import institute_questionBankRoutes from "./backend/Center_Backend/routes/questionBankroutes.js";


app.use("/api/v1/institute_student" , studentRouter);
app.use("/api/v1/institute_courses" , courseRouter); 
app.use("/api/v1/institute_fees" , feesRouter)
app.use("/api/v1/institute_batche" , batchRouter); 
app.use("/api/v1/institute_videos" , videoRouter)
app.use("/api/v1/institute_note", institute_notesRoutes);
app.use("/api/v1/institute_exam", institute_examRoutes);
app.use("/api/v1/institute_wallet", institute_walletRoutes);
app.use("/api/v1/institute_enquiry", institute_EnquiryRoutes);
app.use("/api/v1/institute_question_bank", institute_questionBankRoutes);
console.log("Center Routes Loaded");