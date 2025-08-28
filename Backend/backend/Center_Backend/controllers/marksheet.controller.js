import { asyncHandler } from '../utils/asynchanlder.js';
import Marksheet from '../models/Marksheet.model.js';
import Student from '../models/Student/Student_Detais.model.js';
import Course from '../models/Courses/Courses.models.js';
import Franchise from '../models/Franchise.model.js';
import Wallet from '../models/Payment/Wallet.js';
import Transaction from '../models/Payment/Transaction.js';
import mongoose from 'mongoose';

// Get all courses for a franchise
export const getFranchiseCourses = asyncHandler(async (req, res) => {
    try {
        const franchiseId = req.query.franchiseId || req.user?.instituteID || req.body.franchiseId;
        
        if (!franchiseId) {
            return res.status(400).json({
                success: false,
                error: "Franchise ID is required"
            });
        }

        const courses = await Course.find({ 
            franchiseId: franchiseId,
            instituteStatus: 'active'
        }).select('_id courseName courseCode courseSubject');

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        console.error("Error fetching franchise courses:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch courses"
        });
    }
});

// Get active students for a specific course
export const getCourseStudents = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.params;
        const franchiseId = req.query.franchiseId || req.user?.instituteID || req.body.franchiseId;

        if (!franchiseId) {
            return res.status(400).json({
                success: false,
                error: "Franchise ID is required"
            });
        }

        const students = await Student.find({
            franchiseId: franchiseId,
            status: 'active',
            'courseInterested.courseCode': { $exists: true }
        }).select('_id studentName rollNumber courseInterested email studentMobile');

        // Filter students by course if courseId is provided
        let filteredStudents = students;
        if (courseId && courseId !== 'all') {
            const course = await Course.findById(courseId);
            if (course) {
                filteredStudents = students.filter(student => 
                    student.courseInterested.courseCode === course.courseCode
                );
            }
        }

        res.status(200).json({
            success: true,
            data: filteredStudents
        });
    } catch (error) {
        console.error("Error fetching course students:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch students"
        });
    }
});

// Create or update marksheet with new nested structure
export const createOrUpdateMarksheet = asyncHandler(async (req, res) => {
    try {
        const { studentId, courseId, subjects } = req.body;
        const franchiseId = req.user?.instituteID || req.body.franchiseId;

        if (!franchiseId || !studentId || !courseId || !subjects || subjects.length === 0) {
            console.log("Data coming from the frontend:: " , req.body)
            return res.status(400).json({
                success: false,
                error: "All fields are required: studentId, courseId, subjects"
            });
        }

        // Validate student and course exist
        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student || !course) {
            return res.status(404).json({
                success: false,
                error: "Student or Course not found"
            });
        }

        // Find existing marksheet for this franchise
        let marksheet = await Marksheet.findOne({
            franchiseId: franchiseId
        });

        if (!marksheet) {
            // Create new marksheet with flattened structure
            marksheet = new Marksheet({
                franchiseId: franchiseId,
                courses: [{
                    courseCode: course.courseCode,
                    courseName: course.courseName,
                    students: []
                }]
            });
        }

        // Find the course in the flattened structure
        let courseEntry = marksheet.courses.find(c => c.courseCode === course.courseCode);
        if (!courseEntry) {
            courseEntry = {
                courseCode: course.courseCode,
                courseName: course.courseName,
                students: []
            };
            marksheet.courses.push(courseEntry);
        }

        // Find existing student in the course or create new entry
        let studentEntry = courseEntry.students.find(s => s.studentId.toString() === studentId);
        
        // Find the franchise to get its ObjectId
        const franchise = await Franchise.findOne({ franchiseId });
        if (!franchise) {
            return res.status(404).json({
                success: false,
                message: "Franchise not found",
                code: "FRANCHISE_NOT_FOUND",
            });
        }

        // Check wallet balance for marksheet creation fee
        const marksheetFee = 300; // Fee for creating marksheet
        let wallet;
        try {
            wallet = await Wallet.findOne({franchiseId: franchiseId});
            if (!wallet || wallet.balance < marksheetFee) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient wallet balance. Please add money to continue.",
                    code: "INSUFFICIENT_BALANCE",
                    requiredAmount: marksheetFee,
                    currentBalance: wallet ? wallet.balance : 0,
                });
            }
        } catch (walletError) {
            console.error("Error checking wallet balance:", walletError);
            return res.status(500).json({
                success: false,
                message: "Error checking wallet balance",
                code: "WALLET_ERROR",
            });
        }

        // Add srNo to subjects before saving
        const subjectsWithSrNo = subjects.map((subject, index) => ({
            ...subject,
            srNo: index + 1
        }));

        // Check if this is a new marksheet entry (not an update)
        const isNewMarksheet = !studentEntry;

        // Database transaction for marksheet creation and wallet deduction
        let session;
        try {
            session = await mongoose.startSession();
            session.startTransaction();

            if (studentEntry) {
                // Update existing student's subjects
                studentEntry.subjects = subjectsWithSrNo;
            } else {
                // Add new student entry
                studentEntry = {
                    studentName: student.name || student.studentName || 'Unknown Student',
                    rollNumber: student.rollNumber || 'N/A',
                    studentId: studentId,
                    subjects: subjectsWithSrNo
                };
                courseEntry.students.push(studentEntry);
            }

            await marksheet.save({ session });

            // Deduct wallet balance only for new marksheet creation
            if (isNewMarksheet) {
                wallet.balance -= marksheetFee;
                await wallet.save({ session });

                // Create transaction record
                await Transaction.create(
                    [{
                        franchise: franchise._id, // Use franchise ObjectId instead of franchiseId string
                        amount: marksheetFee,
                        type: "marksheet_deduction",
                        status: "approved",
                        referenceId: `Marksheet Creation - ${student.name || 'Student'}`,
                        timestamp: new Date(),
                    }],
                    { session }
                );
            }

            await session.commitTransaction();
            session.endSession();
        } catch (transactionError) {
            if (session) {
                await session.abortTransaction();
                session.endSession();
            }
            console.error("Transaction error:", transactionError);
            return res.status(500).json({
                success: false,
                message: "Error processing marksheet creation",
                error: transactionError.message
            });
        }

        res.status(200).json({
            success: true,
            data: marksheet,
            message: "Marksheet saved successfully"
        });
    } catch (error) {
        console.error("Error creating/updating marksheet:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create/update marksheet"
        });
    }
});

// Get marksheet for a student
export const getStudentMarksheet = asyncHandler(async (req, res) => {
    try {
        const { studentId, courseCode } = req.params;
        const franchiseId = req.query.franchiseId || req.user?.instituteID;

        const marksheet = await Marksheet.findOne({
            franchiseId: franchiseId,
            'courses.courseCode': courseCode,
            'courses.students.studentId': studentId
        });

        if (!marksheet) {
            return res.status(404).json({
                success: false,
                error: "Marksheet not found"
            });
        }

        let student = null;
        let course = null;
        
        if (marksheet) {
            course = marksheet.courses.find(c => c.courseCode === courseCode);
            if (course) {
                student = course.students.find(s => s.studentId.toString() === studentId);
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Student marksheet not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                student,
                courseInfo: {
                    courseCode: course.courseCode,
                    courseName: course.courseName
                }
            }
        });
    } catch (error) {
        console.error("Error fetching marksheet:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch marksheet"
        });
    }
});

// Get all marksheets for a franchise
export const getFranchiseMarksheets = asyncHandler(async (req, res) => {
    try {
        const franchiseId = req.user?.instituteID || req.query.franchiseId;
        const { courseCode, approvalStatus } = req.query;

        if (!franchiseId) {
            return res.status(400).json({
                success: false,
                error: "Franchise ID is required"
            });
        }

        let query = { franchiseId: franchiseId };
        
        if (courseCode && courseCode !== 'all') {
            query['courses.courseCode'] = courseCode;
        }
        
        if (approvalStatus) {
            query['courses.students.approvalStatus'] = approvalStatus;
        }

        const marksheets = await Marksheet.find(query).sort({ createdAt: -1 });

        // Extract student marksheets from flattened structure
        const studentMarksheets = [];
        marksheets.forEach(marksheet => {
            marksheet.courses.forEach(course => {
                if (!courseCode || course.courseCode === courseCode) {
                    course.students.forEach(student => {
                        if (!approvalStatus || student.approvalStatus === approvalStatus) {
                            studentMarksheets.push({
                                _id: student._id,
                                studentName: student.studentName,
                                rollNumber: student.rollNumber,
                                courseCode: course.courseCode,
                                courseName: course.courseName,
                                approvalStatus: student.approvalStatus,
                                isApprovedByAdmin: student.isApprovedByAdmin,
                                percentage: student.percentage,
                                overallGrade: student.overallGrade,
                                createdAt: marksheet.createdAt
                            });
                        }
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: studentMarksheets
        });
    } catch (error) {
        console.error("Error fetching franchise marksheets:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch marksheets"
        });
    }
});

// Delete marksheet
export const deleteMarksheet = asyncHandler(async (req, res) => {
    try {
        const { marksheetId } = req.params;
        const franchiseId = req.user?.instituteID || req.body.franchiseId;

        const marksheet = await Marksheet.findOneAndDelete({
            _id: marksheetId,
            franchiseId: franchiseId
        });

        if (!marksheet) {
            return res.status(404).json({
                success: false,
                error: "Marksheet not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Marksheet deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting marksheet:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete marksheet"
        });
    }
});

// Publish marksheet (change status from draft to published)
export const publishMarksheet = asyncHandler(async (req, res) => {
    try {
        const { marksheetId } = req.params;
        const franchiseId = req.user?.instituteID || req.body.franchiseId;

        const marksheet = await Marksheet.findOneAndUpdate(
            { _id: marksheetId, franchiseId: franchiseId },
            { status: 'published' },
            { new: true }
        ).populate('studentId', 'studentName rollNumber')
         .populate('courseId', 'courseName courseCode');

        if (!marksheet) {
            return res.status(404).json({
                success: false,
                error: "Marksheet not found"
            });
        }

        res.status(200).json({
            success: true,
            data: marksheet,
            message: "Marksheet published successfully"
        });
    } catch (error) {
        console.error("Error publishing marksheet:", error);
        res.status(500).json({
            success: false,
            error: "Failed to publish marksheet"
        });
    }
});

// Download approved marksheet
export const downloadApprovedMarksheet = asyncHandler(async (req, res) => {
    try {
        const { studentId, courseCode } = req.params;
        const franchiseId = req.user?.instituteID || req.query.franchiseId;

        const marksheet = await Marksheet.findOne({
            franchiseId: franchiseId,
            'courses.courseCode': courseCode,
            'courses.students.studentId': studentId
        });

        if (!marksheet) {
            return res.status(404).json({
                success: false,
                error: "Marksheet not found"
            });
        }

        // Extract specific student data
        const course = marksheet.courses.find(c => c.courseCode === courseCode);
        const student = course?.students.find(s => s.studentId?.toString() === studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Student marksheet not found"
            });
        }

        // Check if marksheet is approved
        if (!student.isApprovedByAdmin || student.approvalStatus !== 'approved') {
            return res.status(403).json({
                success: false,
                error: "Marksheet is not approved by admin. Download not allowed."
            });
        }

        res.status(200).json({
            success: true,
            data: {
                student,
                courseInfo: {
                    courseCode: course.courseCode,
                    courseName: course.courseName
                },
                downloadAllowed: true
            },
            message: "Marksheet ready for download"
        });
    } catch (error) {
        console.error("Error downloading marksheet:", error);
        res.status(500).json({
            success: false,
            error: "Failed to download marksheet"
        });
    }
});
