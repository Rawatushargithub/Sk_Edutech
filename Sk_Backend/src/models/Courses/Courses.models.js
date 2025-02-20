import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    award: { type: String, required: true }, // e.g., "Basic Courses, Accounting & Computer Diploma"
    courseName: { type: String, required: true },
    courseSubject: { type: String, required: true },
    courseFees: { type: Number, required: true }, // Actual fee
    courseMRP: { type: Number, required: true },  // MRP of the course
    minFeePayable: { type: Number, required: true }, // Minimum fee required to enroll
    courseDuration: { type: String, required: true }, // e.g., "6 Months"
    institutePlans: [
        {
            planName: { type: String, required: true }, // e.g., "Plan A"
            planFees: { type: Number, required: true }, // Fees for this plan
        }
    ],
    courseVideoLinks: [{ type: String }], // Array to store multiple video links
    courseSyllabus: { type: String, required: true }, // Detailed syllabus
    courseEligibility: { type: String, required: true }, // Eligibility criteria
    courseImage: { type: String }, // Cloudinary URL of the image
    courseMaterials: [{ type: String }], // Array of Cloudinary URLs for PDFs
    displayFeesOnWebsite: { type: Boolean, default: true }, // Show/hide fees
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
