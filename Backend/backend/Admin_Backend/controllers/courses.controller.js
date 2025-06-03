import Course from '../models/Courses/Courses.models.js'; // Uses the re-exported model
import { asyncHandler } from '../utils/asynchanlder.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Get all courses for Admin (can be filtered by status)
export const getAllCoursesAdmin = asyncHandler(async (req, res) => {
    // Optional: Add query parameter for filtering, e.g., /courses?status=pending
    const { status } = req.query;
    const query = {};
    if (status) {
        query.adminApprovalStatus = status;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    if (!courses) {
        throw new ApiError(404, "No courses found");
    }

    return res.status(200).json(
        new ApiResponse(200, courses, "Courses retrieved successfully")
    );
});

// Update a course's admin approval status
export const updateCourseAdminStatus = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { adminApprovalStatus } = req.body; // Expecting 'approved' or 'rejected'

    if (!['approved', 'rejected', 'pending'].includes(adminApprovalStatus)) {
        throw new ApiError(400, "Invalid status value. Must be 'approved', 'rejected', or 'pending'.");
    }

    const course = await Course.findByIdAndUpdate(
        courseId,
        { adminApprovalStatus: adminApprovalStatus },
        { new: true } // Return the updated document
    );

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    return res.status(200).json(
        new ApiResponse(200, course, `Course status updated to ${adminApprovalStatus} successfully`)
    );
});

// Get a single course by ID (for admin to view details)
export const getCourseByIdAdmin = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    return res.status(200).json(
        new ApiResponse(200, course, "Course details retrieved successfully")
    );
});
