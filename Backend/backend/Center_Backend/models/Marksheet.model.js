import mongoose from 'mongoose';

const marksheetSchema = new mongoose.Schema({
    franchiseId: {
        type: String,
        required: true
    },
    courses: [{
        courseCode: {
            type: String,
            required: true
        },
        courseName: {
            type: String,
            required: true
        },
        students: [{
            marksheetId: {  // ✅ Add marksheetId field
                type: String,
                unique: false, // not globally unique since it's per student
            },
            studentName: {
                type: String,
                required: true
            },
            rollNumber: {
                type: String,
                required: true
            },
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            subjects: [{
                srNo: {
                    type: Number,
                    required: true
                },
                subjectName: {
                    type: String,
                    required: true
                },
                practicalMarks: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                theoryMarks: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                totalMarks: {
                    type: Number,
                    default: 0
                },
                maximumMarks: {
                    type: Number,
                    default: 50
                },
                grade: {
                    type: String,
                    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
                    default: 'F'
                }
            }],
            overallTotalMarks: {
                type: String,
                default: "0/0"
            },
            overallGrade: {
                type: String,
                enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
                default: 'F'
            },
            percentage: {
                type: Number,
                default: 0
            },
            isApprovedByAdmin: {
                type: Boolean,
                default: false
            },
            approvalStatus: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            rejectionReason: {
                type: String,
                default: null
            }
        }]
    }]
}, { timestamps: true });


// ✅ Generate marksheetId + calculate totals before saving
marksheetSchema.pre('save', function(next) {
    this.courses.forEach(course => {
        course.students.forEach(student => {
            
            // ✅ Assign marksheetId only if not already set
            if (!student.marksheetId) {
                student.marksheetId = "SK" +  Math.floor(100000 + Math.random() * 900000).toString();
            }

            if (student.subjects && student.subjects.length > 0) {
                let totalObtained = 0;
                let totalMaximum = 0;

                student.subjects.forEach((subject, index) => {
                    subject.srNo = index + 1;
                    subject.totalMarks = subject.practicalMarks + subject.theoryMarks;
                    totalObtained += subject.totalMarks;
                    totalMaximum += subject.maximumMarks;

                    // Grade calculation per subject
                    const subjectPercentage = subject.maximumMarks > 0 ? 
                        (subject.totalMarks / subject.maximumMarks) * 100 : 0;

                    if (subjectPercentage >= 90) subject.grade = 'A+';
                    else if (subjectPercentage >= 80) subject.grade = 'A';
                    else if (subjectPercentage >= 70) subject.grade = 'B+';
                    else if (subjectPercentage >= 60) subject.grade = 'B';
                    else if (subjectPercentage >= 50) subject.grade = 'C+';
                    else if (subjectPercentage >= 40) subject.grade = 'C';
                    else if (subjectPercentage >= 33) subject.grade = 'D';
                    else subject.grade = 'F';
                });

                // Overall
                student.overallTotalMarks = `${totalObtained}/${totalMaximum}`;
                student.percentage = totalMaximum > 0 ? 
                    Math.round((totalObtained / totalMaximum) * 100) : 0;

                if (student.percentage >= 90) student.overallGrade = 'A+';
                else if (student.percentage >= 80) student.overallGrade = 'A';
                else if (student.percentage >= 70) student.overallGrade = 'B+';
                else if (student.percentage >= 60) student.overallGrade = 'B';
                else if (student.percentage >= 50) student.overallGrade = 'C+';
                else if (student.percentage >= 40) student.overallGrade = 'C';
                else if (student.percentage >= 33) student.overallGrade = 'D';
                else student.overallGrade = 'F';
            }
        });
    });
    next();
});

const Marksheet = mongoose.model('Marksheet', marksheetSchema);
export default Marksheet;
