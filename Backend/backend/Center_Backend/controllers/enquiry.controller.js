import EnquiryStudent from '../models/EnquiryStudent.model.js';

// Add a new student enquiry
export const addStudent = async (req, res) => {
  try {
    const studentData = req.body;
    console.log("Received student data:", studentData);
    const franchiseId = studentData.franchiseId; // Ensure franchiseId is included in the request body
    console.log(studentData.franchiseId)
    // Validate franchiseId
    if (!franchiseId) {
      return res.status(400).json({ 
        success: false,
        message: 'FranchiseID is required' 
      });
    }
    
    const newStudent = new EnquiryStudent(studentData);
    await newStudent.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Student enquiry saved', 
      student: newStudent 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all student enquiries filtered by franchiseId
export const getStudents = async (req, res) => {
  try {
    const { franchiseId, page = 1, limit = 10, search = "" } = req.query;
    console.log("franchiseId value :: ", franchiseId);
    // Validate franchiseId
    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'FranchiseID is required'
      });
    }
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Build the filter query
    const query = { franchiseId: franchiseId };
    
    // Add search functionality if search parameter exists
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get filtered students with pagination
    const students = await EnquiryStudent.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });
    console.log("Students fetched:", students);
    // Count total documents for pagination
    const totalStudents = await EnquiryStudent.countDocuments(query);
    
    res.json({
      success: true,
      data: students,
      pagination: {
        total: totalStudents,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalStudents / limitNumber)
      }
    });
  } catch (error) { 
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Delete a student enquiry by ID (with franchiseId validation)
export const deleteStudent = async (req, res) => {
  try {
    const enquiryId = req.params.id;
    const { franchiseId } = req.query;
    
    // Validate franchiseId
    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'FranchiseID is required'
      });
    }
    
    // Find and delete only if it belongs to the franchise
    const enquiry = await EnquiryStudent.findOneAndDelete({
      _id: enquiryId,
      franchiseId: franchiseId
    });

    if (!enquiry) {
      return res.status(404).json({ 
        success: false,
        message: 'Enquiry not found or does not belong to this franchise' 
      });
    }

    res.json({ 
      success: true,
      message: 'Enquiry deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get a single student enquiry by ID (with franchiseId validation)
export const getStudentById = async (req, res) => {
  try {
    const enquiryId = req.params.id;
    const { franchiseId } = req.query;
    
    // Validate franchiseId
    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'FranchiseID is required'
      });
    }
    
    // Find enquiry only if it belongs to the franchise
    const enquiry = await EnquiryStudent.findOne({
      _id: enquiryId,
      franchiseId: franchiseId
    });

    if (!enquiry) {
      return res.status(404).json({ 
        success: false,
        message: 'Enquiry not found or does not belong to this franchise' 
      });
    }

    res.json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

