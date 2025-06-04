import Course from '../models/Courses/Courses.models.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js"; 
import { asyncHandler } from "../utils/asynchanlder.js";

// Create a new course
export const createCourse = asyncHandler( async (req, res) => {
    try {
        const {
            courseCode, courseName, courseSubject, courseFees, courseMRP,
            courseDuration, // Expected as number (months)
            // institutePlans, // Removed
            courseVideoLinks, // Expected as JSON string of [{title, link}]
            courseSyllabus, courseEligibility,
            instituteStatus // Renamed from status
        } = req.body;

        console.log("In Controller :: ", req.body);

        // Upload course image if provided
        let courseImageCloudinaryUrl = '';
        if (req.files && req.files.courseImage && req.files.courseImage[0]) { // Assuming courseImage is sent via req.files
            const imageFile = req.files.courseImage[0];
            const uploadedImage = await uploadOnCloudinary(imageFile.path);
            if (uploadedImage && uploadedImage.url) {
                courseImageCloudinaryUrl = uploadedImage.url;
            } else {
                console.error("Cloudinary image upload failed or URL not found", uploadedImage);
            }
        } else if (req.file) { // Fallback if sent as req.file (single upload)
             const uploadedImage = await uploadOnCloudinary(req.file.path);
             if (uploadedImage && uploadedImage.url) {
                courseImageCloudinaryUrl = uploadedImage.url;
            } else {
                console.error("Cloudinary image upload failed (req.file) or URL not found", uploadedImage);
            }
        }

        // Upload course materials (PDFs) to Cloudinary
        // Frontend will send courseMaterials as a JSON string array of objects:
        // [{ title, type ('file' or 'link'), url (if link), originalFileName (if file for matching) }]
        // And actual files in req.files.courseMaterialFiles (ensure frontend names this field for multer)
        
        let processedCourseMaterials = [];
        const courseMaterialsInput = req.body.courseMaterials ? JSON.parse(req.body.courseMaterials) : [];
        let fileUploadIndex = 0;

        for (const material of courseMaterialsInput) {
            if (material.type === 'link') {
                if (material.url && material.title) { // Ensure link and title are provided
                    processedCourseMaterials.push({
                        title: material.title,
                        type: 'link',
                        url: material.url,
                        fileType: 'external-link', // Or derive from URL if possible
                        // thumbnailUrl: generateThumbnailForLink(material.url) // Optional
                    });
                }
            } else if (material.type === 'file') { // This was 'file' in the input from frontend
                 if (material.isNewFile && req.files && req.files.courseMaterialFiles && req.files.courseMaterialFiles[fileUploadIndex]) {
                    const materialFile = req.files.courseMaterialFiles[fileUploadIndex];
                    const uploadedMaterial = await uploadOnCloudinary(materialFile.path);
                    if (uploadedMaterial && uploadedMaterial.url) {
                        processedCourseMaterials.push({
                            title: material.title || materialFile.originalname,
                            type: 'file',
                            url: uploadedMaterial.url,
                            fileName: materialFile.originalname,
                            fileType: materialFile.mimetype,
                        });
                    } else {
                        console.error("Cloudinary material upload failed for file:", materialFile.originalname, uploadedMaterial);
                    }
                    fileUploadIndex++;
                } else if (!material.isNewFile && material.url) { // Existing file to keep
                    processedCourseMaterials.push(material);
                } else {
                    console.warn("Mismatch or issue with course material file data at index", fileUploadIndex, material);
                }
            }
        }
        
        // Parse JSON string fields
        const parsedCourseVideoLinks = courseVideoLinks ? JSON.parse(courseVideoLinks) : [];

        const newCourse = new Course({
            courseCode,
            courseName,
            courseSubject,
            courseFees: Number(courseFees),
            courseMRP: Number(courseMRP),
            courseDuration: Number(courseDuration),
            courseVideoLinks: parsedCourseVideoLinks.filter(v => v.title && v.link),
            courseSyllabus,
            courseEligibility,
            courseImage: courseImageCloudinaryUrl,
            courseMaterials: processedCourseMaterials, // Use the processed materials
            instituteStatus: instituteStatus || 'active',
            // adminApprovalStatus will default to 'pending' as per schema
        });

        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully. Pending admin approval.', course: newCourse });

    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all courses
export const getCourses = async (req, res) => {
    try { 
        const courses = await Course.find().select(
            'courseName courseCode courseFees courseMRP courseDuration instituteStatus adminApprovalStatus courseImage courseSubject createdAt updatedAt courseMaterials courseVideoLinks' // Added courseMaterials & courseVideoLinks
        );
        console.log("courses data" , courses); 
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Get courses count
export const getCoursesCount = async (req , res) => {
    try {
        const count = await Course.countDocuments();
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
        .select("courseName courseCode courseDuration courseSubject courseMRP instituteStatus adminApprovalStatus courseImage createdAt");
      
      if (courses.length === 0) {
        return res.status(404).json({ message: "No courses found" });
      }
       
      const formattedCourses = courses.map(course => ({
        id: course._id,
        name: course.courseName,
        code: course.courseCode,
        subject: course.courseSubject,
        duration: course.courseDuration, 
        price: course.courseMRP,
        instituteStatus: course.instituteStatus,
        adminApprovalStatus: course.adminApprovalStatus,
        imageUrl: course.courseImage,
        addedOn: course.createdAt
      }));
      
      res.status(200).json(formattedCourses);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

// Update an existing course by ID
export const updateCourseById = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const {
        courseFees, courseMRP, courseDuration, courseVideoLinks,
        courseSyllabus, courseEligibility, instituteStatus,
        // existingCourseImage, // Handled by checking if new courseImage is uploaded
    } = req.body; // courseCode, courseName, courseSubject are not updatable from form

    console.log("Updating course :: ", courseId, "Body:", req.body);
    console.log("Files received for update :: ", req.files);

    const courseToUpdate = await Course.findById(courseId);
    if (!courseToUpdate) {
        return res.status(404).json({ error: "Course not found" });
    }

    const updates = {};
    if (courseFees !== undefined) updates.courseFees = Number(courseFees);
    if (courseMRP !== undefined) updates.courseMRP = Number(courseMRP);
    if (courseDuration !== undefined) updates.courseDuration = Number(courseDuration);
    if (courseSyllabus !== undefined) updates.courseSyllabus = courseSyllabus;
    if (courseEligibility !== undefined) updates.courseEligibility = courseEligibility;
    if (instituteStatus !== undefined) updates.instituteStatus = instituteStatus;
    
    if (courseVideoLinks !== undefined) {
        try {
            const parsedVideos = JSON.parse(courseVideoLinks);
            updates.courseVideoLinks = parsedVideos.filter(v => v.title && v.link);
        } catch (e) {
            console.warn("Could not parse courseVideoLinks for update:", e.message);
        }
    }

    if (req.files && req.files.courseImage && req.files.courseImage[0]) {
        const imageFile = req.files.courseImage[0];
        const uploadedImage = await uploadOnCloudinary(imageFile.path);
        if (uploadedImage && uploadedImage.url) {
            updates.courseImage = uploadedImage.url;
        } else {
            console.error("Cloudinary image upload failed for update or URL not found", uploadedImage);
        }
    } else if (req.body.existingCourseImage) { // If frontend signals to keep existing image
        updates.courseImage = req.body.existingCourseImage;
    } else if (!req.body.existingCourseImage && !req.files?.courseImage) { 
      // If it's edit mode, no existing image was sent to be kept, and no new one uploaded, means remove.
      updates.courseImage = ""; // Set to empty string to remove
    }

    let finalProcessedCourseMaterials = [];
    const materialsDataFromFrontend = req.body.courseMaterials ? JSON.parse(req.body.courseMaterials) : [];
    let newFilesUploadIndex = 0;

    for (const materialInfo of materialsDataFromFrontend) {
        if (materialInfo.type === 'link') {
            if (materialInfo.url && materialInfo.title) {
                finalProcessedCourseMaterials.push({
                    title: materialInfo.title,
                    type: 'link',
                    url: materialInfo.url,
                    fileName: materialInfo.fileName || materialInfo.title,
                    fileType: materialInfo.fileType || 'external-link',
                    thumbnailUrl: materialInfo.thumbnailUrl,
                    _id: materialInfo._id // Preserve _id if it's an existing material
                });
            }
        } else if (materialInfo.type === 'file') {
            if (materialInfo.isNewFile) { // Placeholder for a new file
                if (req.files && req.files.courseMaterialFiles && req.files.courseMaterialFiles[newFilesUploadIndex]) {
                    const materialFile = req.files.courseMaterialFiles[newFilesUploadIndex];
                    const uploadedMaterial = await uploadOnCloudinary(materialFile.path);
                    if (uploadedMaterial && uploadedMaterial.url) {
                        finalProcessedCourseMaterials.push({
                            title: materialInfo.title || materialFile.originalname,
                            type: 'file',
                            url: uploadedMaterial.url,
                            fileName: materialFile.originalname,
                            fileType: materialFile.mimetype,
                        });
                    }
                    newFilesUploadIndex++;
                }
            } else if (materialInfo.url) { // Existing file to keep
                finalProcessedCourseMaterials.push({
                    title: materialInfo.title,
                    type: 'file',
                    url: materialInfo.url,
                    fileName: materialInfo.fileName,
                    fileType: materialInfo.fileType,
                    thumbnailUrl: materialInfo.thumbnailUrl,
                     _id: materialInfo._id
                });
            }
        }
    }
    updates.courseMaterials = finalProcessedCourseMaterials;

    const updatedCourse = await Course.findByIdAndUpdate(courseId, { $set: updates }, { new: true, runValidators: true });

    if (!updatedCourse) {
        return res.status(404).json({ error: "Course not found or update failed" });
    }
    const message = 'Course updated successfully.';
    res.status(200).json({ message, course: updatedCourse });
});

// Get a single course by ID
export const getCourseById = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json(course);
});

// Add a new note/material to a specific course
export const addNoteToCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    
    console.log("[addNoteToCourse] req.body:", req.body);
    console.log("[addNoteToCourse] req.files:", req.files);

    const { title, type, url: linkUrl } = req.body; 

    if (!title || !type) {
        console.error("[addNoteToCourse] Missing title or type in req.body", req.body);
        return res.status(400).json({ error: "Title and Type are required for a note." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ error: "Course not found" });
    }

    let newNote;

    if (type === 'link') {
        if (!linkUrl) { // Title is already checked above
            return res.status(400).json({ error: "URL is required for link type notes." });
        }
        newNote = {
            title, type: 'link', url: linkUrl, fileType: 'external-link',
        };
    } else if (type === 'file') {
        if (!req.files || !req.files.noteFile || req.files.noteFile.length === 0) {
            return res.status(400).json({ error: "File is required for file type notes." });
        }
        const noteFile = req.files.noteFile[0];
        const uploadedFile = await uploadOnCloudinary(noteFile.path);

        if (!uploadedFile || !uploadedFile.url) {
            console.error("Cloudinary upload failed for note file:", noteFile.originalname, uploadedFile);
            return res.status(500).json({ error: "Failed to upload file to Cloudinary." });
        }
        newNote = {
            title: title || noteFile.originalname, type: 'file', url: uploadedFile.url,
            fileName: noteFile.originalname, fileType: noteFile.mimetype,
        };
    } else {
        return res.status(400).json({ error: "Invalid note type specified." });
    }

    console.log("[addNoteToCourse] Constructed newNote:", newNote);
    // Ensure existing materials are valid before pushing and saving
    const validExistingMaterials = [];
    if (course.courseMaterials && Array.isArray(course.courseMaterials)) {
        course.courseMaterials.forEach(material => {
            let currentTitle = material.title || material.fileName || 'Untitled Material';
            let currentType = material.type;
            let currentUrl = material.url;

            if (!currentType) currentType = (material.fileName && currentUrl) ? 'file' : (currentUrl ? 'link' : 'file');
            if (!currentUrl) currentUrl = "placeholder_url"; // Should not happen if schema enforced
            
            validExistingMaterials.push({
                title: currentTitle, type: currentType, url: currentUrl,
                fileName: material.fileName, fileType: material.fileType, 
                thumbnailUrl: material.thumbnailUrl, _id: material._id
            });
        });
    }
    
    validExistingMaterials.push(newNote);
    course.courseMaterials = validExistingMaterials;

    console.log("[addNoteToCourse] course.courseMaterials AFTER processing and push:", JSON.stringify(course.courseMaterials, null, 2));
    
    await course.save();
    res.status(201).json({ message: "Note added successfully to course.", course });
});

// Add a new video link to a specific course
export const addVideoLinkToCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { title, link } = req.body;

    if (!title || !link) {
        return res.status(400).json({ error: "Title and Link are required for a video." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ error: "Course not found" });
    }

    const newVideoLink = { title, link };

    course.courseVideoLinks.push(newVideoLink);
    
    await course.save();
    res.status(201).json({ message: "Video link added successfully to course.", course });
});