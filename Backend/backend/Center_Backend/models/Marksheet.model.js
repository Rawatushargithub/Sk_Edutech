import mongoose from 'mongoose';

const marksheetSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    franchiseId: { 
        type: String, 
        required: true 
    },
    subjects: [{
        subjectName: { 
            type: String, 
            required: true 
        },
        marks: { 
            type: Number, 
            required: true,
            min: 0,
            max: 100
        },
        maxMarks: { 
            type: Number, 
            default: 100 
        }
    }],
    totalMarks: { 
        type: Number, 
        default: 0 
    },
    totalMaxMarks: { 
        type: Number, 
        default: 0 
    },
    percentage: { 
        type: Number, 
        default: 0 
    },
    grade: { 
        type: String, 
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'], 
        default: 'F' 
    },
    status: { 
        type: String, 
        enum: ['draft', 'published'], 
        default: 'draft' 
    },
    createdBy: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

// Calculate totals and grade before saving
marksheetSchema.pre('save', function(next) {
    if (this.subjects && this.subjects.length > 0) {
        this.totalMarks = this.subjects.reduce((sum, subject) => sum + subject.marks, 0);
        this.totalMaxMarks = this.subjects.reduce((sum, subject) => sum + subject.maxMarks, 0);
        this.percentage = this.totalMaxMarks > 0 ? Math.round((this.totalMarks / this.totalMaxMarks) * 100) : 0;
        
        // Calculate grade based on percentage
        if (this.percentage >= 90) this.grade = 'A+';
        else if (this.percentage >= 80) this.grade = 'A';
        else if (this.percentage >= 70) this.grade = 'B+';
        else if (this.percentage >= 60) this.grade = 'B';
        else if (this.percentage >= 50) this.grade = 'C+';
        else if (this.percentage >= 40) this.grade = 'C';
        else if (this.percentage >= 33) this.grade = 'D';
        else this.grade = 'F';
    }
    next();
});

const Marksheet = mongoose.model('Marksheet', marksheetSchema);
export default Marksheet;
