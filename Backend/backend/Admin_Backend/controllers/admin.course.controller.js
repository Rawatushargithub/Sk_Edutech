import Course from '../models/Courses/Courses.models.js'; // Adjust path as needed

// Get all courses created by admin
export const getAdminCourses = async (req, res) => {
  try {
    // Find courses where BOTH byAdmin is true AND franchiseId is "Admin"
    const adminCourses = await Course.find({
      byAdmin: true,
      franchiseId: "Admin"
    }).sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      success: true,
      message: "Admin courses fetched successfully",
      data: adminCourses,
      count: adminCourses.length
    });

  } catch (error) {
    console.error("Error fetching admin courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin courses",
      error: error.message
    });
  }
};


// Get admin courses with filters
export const getAdminCoursesWithFilters = async (req, res) => {
    try {
        const {
            status = 'all',
            search = '',
            limit = 10,
            page = 1,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build the base query for admin courses
        let query = {
            $or: [
                { byAdmin: true },
                { franchiseId: "Admin" }
            ]
        };

        // Add status filter
        if (status !== 'all') {
            query.instituteStatus = status;
        }

        // Add search functionality
        if (search) {
            query.$and = [
                query.$or ? { $or: query.$or } : {},
                {
                    $or: [
                        { courseName: { $regex: search, $options: 'i' } },
                        { courseCode: { $regex: search, $options: 'i' } },
                        { courseSubject: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
            // Remove the original $or since we're using $and now
            delete query.$or;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        const courses = await Course.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalCourses = await Course.countDocuments(query);
        const totalPages = Math.ceil(totalCourses / parseInt(limit));

        res.status(200).json({
            success: true,
            message: "Admin courses fetched successfully",
            data: courses,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCourses,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error("Error fetching admin courses with filters:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin courses",
            error: error.message
        });
    }
};

// Get single admin course by ID
export const getAdminCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Find course and verify it's created by admin
        const course = await Course.findOne({
            _id: courseId,
            $or: [
                { byAdmin: true },
                { franchiseId: "Admin" }
            ]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Admin course not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Admin course fetched successfully",
            data: course
        });

    } catch (error) {
        console.error("Error fetching admin course by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin course",
            error: error.message
        });
    }
};

// Get admin courses statistics
export const getAdminCoursesStats = async (req, res) => {
    try {
        // Base query for admin courses
        const adminQuery = {
            $or: [
                { byAdmin: true },
                { franchiseId: "Admin" }
            ]
        };

        // Get various statistics
        const [
            totalCourses,
            activeCourses,
            inactiveCourses,
            approvedCourses,
            pendingCourses,
            rejectedCourses
        ] = await Promise.all([
            Course.countDocuments(adminQuery),
            Course.countDocuments({ ...adminQuery, instituteStatus: 'active' }),
            Course.countDocuments({ ...adminQuery, instituteStatus: 'inactive' }),
            Course.countDocuments({ ...adminQuery, adminApprovalStatus: 'approved' }),
            Course.countDocuments({ ...adminQuery, adminApprovalStatus: 'pending' }),
            Course.countDocuments({ ...adminQuery, adminApprovalStatus: 'rejected' })
        ]);

        // Calculate total fees and MRP
        const totalFeesResult = await Course.aggregate([
            { $match: adminQuery },
            {
                $group: {
                    _id: null,
                    totalFees: { $sum: "$courseFees" },
                    totalMRP: { $sum: "$courseMRP" },
                    averageFees: { $avg: "$courseFees" },
                    averageMRP: { $avg: "$courseMRP" }
                }
            }
        ]);

        const financialData = totalFeesResult[0] || {
            totalFees: 0,
            totalMRP: 0,
            averageFees: 0,
            averageMRP: 0
        };

        res.status(200).json({
            success: true,
            message: "Admin courses statistics fetched successfully",
            data: {
                totalCourses,
                coursesByStatus: {
                    active: activeCourses,
                    inactive: inactiveCourses
                },
                coursesByApproval: {
                    approved: approvedCourses,
                    pending: pendingCourses,
                    rejected: rejectedCourses
                },
                financial: {
                    totalFees: Math.round(financialData.totalFees),
                    totalMRP: Math.round(financialData.totalMRP),
                    averageFees: Math.round(financialData.averageFees),
                    averageMRP: Math.round(financialData.averageMRP),
                    totalDiscount: Math.round(financialData.totalMRP - financialData.totalFees)
                }
            }
        });

    } catch (error) {
        console.error("Error fetching admin courses statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin courses statistics",
            error: error.message
        });
    }
};

// Delete admin course
export const deleteAdminCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Find and verify it's an admin course before deleting
        const course = await Course.findOne({
            _id: courseId,
            $or: [
                { byAdmin: true },
                { franchiseId: "Admin" }
            ]
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Admin course not found"
            });
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        res.status(200).json({
            success: true,
            message: "Admin course deleted successfully",
            data: {
                deletedCourse: {
                    id: course._id,
                    courseName: course.courseName,
                    courseCode: course.courseCode
                }
            }
        });

    } catch (error) {
        console.error("Error deleting admin course:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete admin course",
            error: error.message
        });
    }
};

// Update admin course status
export const updateAdminCourseStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { instituteStatus } = req.body;

        if (!['active', 'inactive'].includes(instituteStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'active' or 'inactive'"
            });
        }

        // Find and update admin course
        const course = await Course.findOneAndUpdate(
            {
                _id: courseId,
                $or: [
                    { byAdmin: true },
                    { franchiseId: "Admin" }
                ]
            },
            { instituteStatus },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Admin course not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Admin course status updated successfully",
            data: course
        });

    } catch (error) {
        console.error("Error updating admin course status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update admin course status",
            error: error.message
        });
    }
};