import Course from '../models/Courses/Courses.models.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { asyncHandler } from "../utils/asynchanlder.js";

// Create a new course
export const createCourse = asyncHandler(async (req, res) => {
    try {
        const {
            courseCode, courseName, courseSubject, courseFees, courseMRP, 
            courseDuration, courseVideoLinks, courseSyllabus, courseEligibility,
            displayFeesOnWebsite, status
        } = req.body;
        
        console.log("In Controller :: ", req.body);
        
        // Upload image if provided
        let courseImage = '';
        if (req.files && req.files.courseImage && req.files.courseImage[0]) {
            const uploadRes = await uploadOnCloudinary(req.files.courseImage[0].path);
            courseImage = uploadRes.secure_url;
        }

        // Upload PDFs to Cloudinary
        let courseMaterials = [];
        if (req.files && req.files.courseMaterials) {
            for (const file of req.files.courseMaterials) {
                const uploadRes = await uploadOnCloudinary(file.path, { resource_type: 'raw' });
                courseMaterials.push(uploadRes.secure_url);
            }
        }
        
        const newCourse = new Course({
            courseCode,
            courseName,
            courseSubject,
            courseFees,
            courseMRP,
            courseDuration,
            courseVideoLinks,
            courseSyllabus,
            courseEligibility,
            courseImage,
            courseMaterials,
            displayFeesOnWebsite,
            status
        });

        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all courses (just names)
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().select('courseName');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all courses with full details
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get course by ID
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update course
export const updateCourse = asyncHandler(async (req, res) => {
    try {
        console.log("bhsdk")
        console.log(req.body , req.params.id);
        const courseId = req.params.id;
        const courseData = req.body;
        
        // Upload image if provided
        if (req.files && req.files.courseImage && req.files.courseImage[0]) {
            const uploadRes = await uploadOnCloudinary(req.files.courseImage[0].path);
            courseData.courseImage = uploadRes.secure_url;
        }

        // Upload PDFs to Cloudinary
        if (req.files && req.files.courseMaterials) {
            const materials = [];
            for (const file of req.files.courseMaterials) {
                const uploadRes = await uploadOnCloudinary(file.path, { resource_type: 'raw' });
                materials.push(uploadRes.secure_url);
            }
            courseData.courseMaterials = materials;
        }
        
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            courseData,
            { new: true }
        );
        
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete course
export const deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get courses count
export const getCoursesCount = async (req, res) => {
    try {
        const count = await Course.countDocuments();
        console.log(count);
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching course count", error });
    }
};

// Get recently added courses
export const getRecentCourses = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const courses = await Course.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("courseName courseCode courseDuration courseSubject courseMRP status courseImage createdAt");
        
        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found" });
        }
        
        // Format the response data
        const formattedCourses = courses.map(course => ({
            id: course._id,
            name: course.courseName,
            code: course.courseCode,
            subject: course.courseSubject,
            duration: course.courseDuration,
            price: course.courseMRP,
            status: course.status,
            imageUrl: course.courseImage,
            addedOn: course.createdAt
        }));
        
        res.status(200).json(formattedCourses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};