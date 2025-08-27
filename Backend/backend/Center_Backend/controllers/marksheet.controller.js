import Marksheet from '../models/Marksheet.model.js';
import Student from '../models/Student/Student_Detais.model.js';
import Course from '../models/Courses/Courses.models.js';
import { asyncHandler } from "../utils/asynchanlder.js";

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

// Create or update marksheet
export const createOrUpdateMarksheet = asyncHandler(async (req, res) => {
    try {
        const { studentId, courseId, subjects, franchiseId } = req.body;
        const finalFranchiseId = franchiseId || req.user?.instituteID || req.body.franchiseId;
        const createdBy = finalFranchiseId || 'system';

        if (!finalFranchiseId || !studentId || !courseId || !subjects || subjects.length === 0) {
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

        // Check if marksheet already exists
        let marksheet = await Marksheet.findOne({
            studentId: studentId,
            courseId: courseId,
            franchiseId: finalFranchiseId
        });

        if (marksheet) {
            // Update existing marksheet
            marksheet.subjects = subjects;
            await marksheet.save();
        } else {
            // Create new marksheet
            marksheet = new Marksheet({
                studentId,
                courseId,
                franchiseId: finalFranchiseId,
                subjects,
                createdBy
            });
            await marksheet.save();
        }

        // Populate student and course details for response
        await marksheet.populate('studentId', 'studentName rollNumber');
        await marksheet.populate('courseId', 'courseName courseCode');

        res.status(200).json({
            success: true,
            data: marksheet,
            message: marksheet.isNew ? "Marksheet created successfully" : "Marksheet updated successfully"
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
        const { studentId, courseId } = req.params;
        const franchiseId = req.query.franchiseId || req.user?.instituteID || req.body.franchiseId;

        const marksheet = await Marksheet.findOne({
            studentId: studentId,
            courseId: courseId,
            franchiseId: franchiseId
        }).populate('studentId', 'studentName rollNumber email')
          .populate('courseId', 'courseName courseCode courseSubject');

        if (!marksheet) {
            return res.status(404).json({
                success: false,
                error: "Marksheet not found"
            });
        }

        res.status(200).json({
            success: true,
            data: marksheet
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
        const franchiseId = req.user?.instituteID || req.body.franchiseId;
        const { courseId, status } = req.query;

        if (!franchiseId) {
            return res.status(400).json({
                success: false,
                error: "Franchise ID is required"
            });
        }

        let query = { franchiseId: franchiseId };
        
        if (courseId && courseId !== 'all') {
            query.courseId = courseId;
        }
        
        if (status) {
            query.status = status;
        }

        const marksheets = await Marksheet.find(query)
            .populate('studentId', 'studentName rollNumber email')
            .populate('courseId', 'courseName courseCode courseSubject')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: marksheets
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
