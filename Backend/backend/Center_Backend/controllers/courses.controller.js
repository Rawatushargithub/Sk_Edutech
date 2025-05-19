import Course from '../models/Courses/Courses.models.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { asyncHandler } from "../utils/asynchanlder.js";
// Create a new course
export const createCourse = asyncHandler( async (req, res) => {
    try {

        const {
            courseCode, award, courseName, courseSubject, courseFees, courseMRP, minFeePayable,
            courseDuration, institutePlans, courseVideoLinks, courseSyllabus, courseEligibility,
            displayFeesOnWebsite, status
        } = req.body;
        console.log("In Controller :: " , req.body)
        // Upload image if provided
        let courseImage = '';
        if (req.file) {
            const uploadRes = await cloudinary.uploader.upload(req.file.path);
            courseImage = uploadRes.secure_url;
        }

        // Upload PDFs to Cloudinary
        let courseMaterials = [];
        if (req.files && req.files.courseMaterials) {
            for (const file of req.files.courseMaterials) {
                const uploadRes = await cloudinary.uploader.upload(file.path, { resource_type: 'raw' });
                courseMaterials.push(uploadRes.secure_url);
            }
        }

        // Parse institute plans
        const parsedInstitutePlans = JSON.parse(institutePlans);
       
        const newCourse = new Course({
            courseCode,
            award,
            courseName,
            courseSubject,
            courseFees,
            courseMRP,
            minFeePayable,
            courseDuration,
            institutePlans: parsedInstitutePlans,
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
})
// Get all courses
export const getCourses = async (req, res) => {
    try { 
        const courses = await Course.find().select('courseName courseFees courseMRP minFeePayable courseDuration status');
        console.log("courses data" , courses);
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Get courses count
export const getCoursesCount = async (req , res) => {
    try {
        const count = await Course.countDocuments();       //{ instituteId: req.user.instituteId } <= courses count
       console.log(count)
        res.status(200).json({ count });
      } catch (error) {
        res.status(500).json({ message: "Error fetching course count", error });
      }
}

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
