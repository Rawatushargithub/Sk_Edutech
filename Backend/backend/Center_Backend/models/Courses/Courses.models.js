import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    courseSubject: { type: String, required: true },
    courseFees: { type: Number, required: true }, // Actual fee
    courseMRP: { type: Number, required: true },  // MRP of the course
    courseDuration: { type: Number, required: true }, // Duration in months, e.g., 6
    // institutePlans removed
    courseVideoLinks: [
        {
            title: { type: String, required: true },
            link: { type: String, required: true }
        }
    ],
    courseSyllabus: { type: String, required: true }, // Detailed syllabus
    courseEligibility: { type: String, required: true }, // Eligibility criteria
    courseImage: { type: String }, // Cloudinary URL of the image
    courseMaterials: [ // This will now serve as "Notes"
        {
            title: { type: String, required: true },
            type: { type: String, enum: ['file', 'link'], required: true }, // 'file' for Cloudinary upload, 'link' for external URL
            url: { type: String, required: true }, // Cloudinary URL or external link
            fileName: { type: String }, // Original name of the uploaded file, if type is 'file'
            fileType: { type: String }, // e.g., 'pdf', 'jpg', 'png', or 'external-link'. Helps in UI rendering.
            thumbnailUrl: {type: String } // Optional: URL to a thumbnail for the note (e.g., auto-generated for images, or a generic icon)
        }
    ],
    instituteStatus: { type: String, enum: ['active', 'inactive'], default: 'active' }, // Status set by the institute
    adminApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Status set by Admin
    franchiseId: { type: String, required: true } // Add this line
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
export default Course;
