import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        ref: 'Student'
    },
    courseId: {
        type: String,
        required: true,
        ref: 'Course'
    },
    requestDate: {
        type: Date, 
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvalDate: {
        type: Date
    },
    approvedBy: {
        type: String  // Admin ID who approved/rejected
    },
    certificateNumber: {
        type: String,
        unique: true,
        sparse: true  // Only enforces uniqueness for non-null values
    },
    remarks: String
}, {
    timestamps: true
});

// Generate unique certificate number when approved
certificateSchema.pre('save', async function(next) {
    if (this.isModified('status') && this.status === 'approved' && !this.certificateNumber) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            status: 'approved',
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lte: new Date(year, 11, 31)
            }
        });
        this.certificateNumber = `CERT/${year}/${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

export default mongoose.model('Certificate', certificateSchema);
