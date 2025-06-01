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
            } else if (material.type === 'file') {
                if (req.files && req.files.courseMaterialFiles && req.files.courseMaterialFiles[fileUploadIndex]) {
                    const materialFile = req.files.courseMaterialFiles[fileUploadIndex];
                    const uploadedMaterial = await uploadOnCloudinary(materialFile.path);
                    if (uploadedMaterial && uploadedMaterial.url) {
                        processedCourseMaterials.push({
                            title: material.title || materialFile.originalname, // Use provided title or fallback to filename
                            type: 'file',
                            url: uploadedMaterial.url,
                            fileName: materialFile.originalname,
                            fileType: materialFile.mimetype, // e.g., 'application/pdf'
                            // thumbnailUrl: generateThumbnailForFile(uploadedMaterial.url, materialFile.mimetype) // Optional
                        });
                    } else {
                        console.error("Cloudinary material upload failed for file:", materialFile.originalname, uploadedMaterial);
                    }
                    fileUploadIndex++;
                } else {
                    console.warn("Mismatch in courseMaterials data and uploaded files for file type at index", fileUploadIndex, material);
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
            'courseName courseCode courseFees courseMRP courseDuration instituteStatus adminApprovalStatus courseImage courseSubject createdAt updatedAt courseMaterials' // Added courseMaterials
        );
        console.log("courses data" , courses); // This log will now show if courseMaterials is populated
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
        .select("courseName courseCode courseDuration courseSubject courseMRP instituteStatus adminApprovalStatus courseImage createdAt");
      
      if (courses.length === 0) {
        return res.status(404).json({ message: "No courses found" });
      }
       
      // Format the response data
      const formattedCourses = courses.map(course => ({
        id: course._id,
        name: course.courseName,
        code: course.courseCode,
        subject: course.courseSubject,
        duration: course.courseDuration, // Assuming this is now number of months
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
        // courseCode, courseName, courseSubject, // These are not updatable from this form as per requirement
        courseFees, courseMRP, courseDuration, courseVideoLinks,
        courseSyllabus, courseEligibility, instituteStatus
    } = req.body;

    console.log("Updating course :: ", courseId, req.body);
    console.log("Files received for update :: ", req.files);


    const courseToUpdate = await Course.findById(courseId);
    if (!courseToUpdate) {
        return res.status(404).json({ error: "Course not found" });
    }

    // Prepare updates
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
            // Optionally, decide if this is a hard error or if you proceed without updating videos
        }
    }

    // Handle course image update
    if (req.files && req.files.courseImage && req.files.courseImage[0]) {
        const imageFile = req.files.courseImage[0];
        const uploadedImage = await uploadOnCloudinary(imageFile.path);
        if (uploadedImage && uploadedImage.url) {
            updates.courseImage = uploadedImage.url;
            // TODO: Optionally delete old image from Cloudinary if courseToUpdate.courseImage exists
        } else {
            console.error("Cloudinary image upload failed for update or URL not found", uploadedImage);
        }
    }

    // Handle course materials update
    let finalProcessedCourseMaterials = [];
    // `req.body.courseMaterials` is expected to be a JSON string array of all materials (existing kept, new links, placeholders for new files)
    // `req.files.courseMaterialFiles` are the actual new files uploaded.
    
    const updatedCourseMaterialsInput = req.body.courseMaterials ? JSON.parse(req.body.courseMaterials) : [];
    let updatedFileUploadIndex = 0;

    for (const material of updatedCourseMaterialsInput) {
        if (material.type === 'link') {
            if (material.url && material.title) { // Existing link or new link
                 finalProcessedCourseMaterials.push({
                    title: material.title,
                    type: 'link',
                    url: material.url,
                    fileName: material.fileName, // Might be undefined for new links
                    fileType: material.fileType || 'external-link',
                    thumbnailUrl: material.thumbnailUrl
                });
            }
        } else if (material.type === 'file') {
            // If it's an existing file (has a URL and wasn't a new upload placeholder)
            if (material.url && !material.isNew) { // Frontend needs to mark new file placeholders
                 finalProcessedCourseMaterials.push({
                    title: material.title,
                    type: 'file',
                    url: material.url,
                    fileName: material.fileName,
                    fileType: material.fileType,
                    thumbnailUrl: material.thumbnailUrl
                });
            } 
            // If it's a placeholder for a new file to be uploaded
            else if (material.isNew && req.files && req.files.courseMaterialFiles && req.files.courseMaterialFiles[updatedFileUploadIndex]) {
                const materialFile = req.files.courseMaterialFiles[updatedFileUploadIndex];
                const uploadedMaterial = await uploadOnCloudinary(materialFile.path);
                if (uploadedMaterial && uploadedMaterial.url) {
                    finalProcessedCourseMaterials.push({
                        title: material.title || materialFile.originalname,
                        type: 'file',
                        url: uploadedMaterial.url,
                        fileName: materialFile.originalname,
                        fileType: materialFile.mimetype,
                        // thumbnailUrl: generateThumbnailForFile(...) // Optional
                    });
                } else {
                    console.error("Cloudinary material upload failed for update:", materialFile.originalname, uploadedMaterial);
                }
                updatedFileUploadIndex++;
            } else if (material.isNew) {
                 console.warn("Mismatch in updated courseMaterials data and uploaded files for new file:", material);
            }
        }
    }
    updates.courseMaterials = finalProcessedCourseMaterials;

    // TODO: Implement deletion of files from Cloudinary that were in `courseToUpdate.courseMaterials` but are not in `finalProcessedCourseMaterials`.
    // This requires comparing the old list with the new list and calling Cloudinary's delete API for each removed file.
    // This is a more advanced step and can be added later if needed. For now, files removed from the course list in DB won't be deleted from Cloudinary.


    // If adminApprovalStatus is 'approved' and institute makes changes, set it back to 'pending'
    // DECISION: Removing this for now. Adding/updating notes/materials should not automatically require re-approval.
    // if (courseToUpdate.adminApprovalStatus === 'approved') {
    //     updates.adminApprovalStatus = 'pending';
    //     console.log(`Course ${courseId} was admin-approved. Re-setting to 'pending' due to update.`);
    // }


    const updatedCourse = await Course.findByIdAndUpdate(courseId, { $set: updates }, { new: true, runValidators: true });

    if (!updatedCourse) {
        return res.status(404).json({ error: "Course not found or update failed" });
    }

    // let message = 'Course updated successfully.';
    // if (updates.adminApprovalStatus === 'pending') { // This condition is now less likely to be met from this controller
    //     message += ' Admin re-approval required.';
    // }
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

    res.status(200).json(course); // Or wrap in ApiResponse if preferred: new ApiResponse(200, course, "Course fetched successfully")
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
        if (!title || !linkUrl) {
            return res.status(400).json({ error: "Title and URL are required for link type notes." });
        }
        newNote = {
            title,
            type: 'link',
            url: linkUrl,
            fileType: 'external-link',
            // thumbnailUrl: generateThumbnailForLink(linkUrl) // Optional
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
            title: title || noteFile.originalname,
            type: 'file',
            url: uploadedFile.url,
            fileName: noteFile.originalname,
            fileType: noteFile.mimetype,
            // thumbnailUrl: generateThumbnailForFile(uploadedFile.url, noteFile.mimetype) // Optional
        };
    } else {
        return res.status(400).json({ error: "Invalid note type specified." });
    }

    console.log("[addNoteToCourse] Constructed newNote:", newNote);
    console.log("[addNoteToCourse] course.courseMaterials BEFORE push:", JSON.stringify(course.courseMaterials, null, 2));

    const updatedMaterials = [];
    if (course.courseMaterials && Array.isArray(course.courseMaterials)) {
        course.courseMaterials.forEach(material => {
            const MongooseDocument = material.constructor; // Check if it's a Mongoose subdocument
            let mat = material;
            // If it's a plain object from DB that became a Mongoose subdoc, ensure it's treated as one
            // or convert it to a plain object for easier manipulation if needed.
            // For simplicity, let's ensure all required fields are present.
            
            let currentTitle = mat.title || mat.fileName || 'Untitled Material';
            let currentType = mat.type;
            let currentUrl = mat.url;
            let currentFileType = mat.fileType;
            let currentFileName = mat.fileName;

            if (!currentType) {
                if (mat.fileName && currentUrl) currentType = 'file';
                else if (currentUrl) currentType = 'link';
                else currentType = 'file'; // Default if unsure
            }

            if (currentType === 'file' && !currentFileType) {
                currentFileType = mat.mimetype || 'unknown'; // mimetype might not be there for old data
            } else if (currentType === 'link' && !currentFileType) {
                currentFileType = 'external-link';
            }
            
            if (!currentUrl) {
                console.warn(`[addNoteToCourse] Existing material (Title: ${currentTitle}) is missing URL. Setting placeholder.`);
                currentUrl = "placeholder_url_for_existing_material";
            }

            updatedMaterials.push({
                title: currentTitle,
                type: currentType,
                url: currentUrl,
                fileName: currentFileName,
                fileType: currentFileType,
                thumbnailUrl: mat.thumbnailUrl,
                _id: mat._id // Preserve existing _id if it's a subdocument
            });
        });
    }
    
    // Add the new note
    updatedMaterials.push(newNote);
    
    course.courseMaterials = updatedMaterials; // Replace the whole array with the processed one

    console.log("[addNoteToCourse] course.courseMaterials AFTER processing and push:", JSON.stringify(course.courseMaterials, null, 2));
    
    // If course was admin-approved, set it to pending for re-approval
    // DECISION: Removing this. Adding a note should not automatically require re-approval.
    // if (course.adminApprovalStatus === 'approved') {
    //     course.adminApprovalStatus = 'pending';
    //     console.log(`Course ${courseId} adminApprovalStatus reset to 'pending' due to new note addition.`);
    // }

    await course.save();
    res.status(201).json({ message: "Note added successfully to course.", course });
});
