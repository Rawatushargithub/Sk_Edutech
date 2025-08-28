import EnquiryStudent from '../models/EnquiryStudent.model.js';

// Add a new student enquiry
export const addStudent = async (req, res) => {
  try {
    console.log("=== ADD STUDENT DEBUG START ===");
    console.log("Full request body:", JSON.stringify(req.body, null, 2));
    console.log("Request headers:", req.headers);
    
    const {
      // rollNumber,
      abbreviation,
      franchiseId,
      studentName,
      relationType,
      fatherHusbandName,
      includeFatherHusband = true,
      surnameName,
      includeSurname = true,
      motherName,
      courseInterested,
      studentMobile,
      alternateMobile,
      email,
      dob,
      gender,
      city,
      postCode,
      permanentAddress,
      referralCode,
      caste,
      qualifications,
      occupation,
      feeDetails,
      selectedBatch,
      admissionDate,
      enquiryDate,
      displayAdmissionOptions = false,
      courseFees,
      discountRate,
      discountAmount,
      totalFees,
      feesReceived,
      paymentMode,
      balance,
      remarks,
      installments = [],
      enquiryStatus,
      // priority, // Commented out - not needed
      holdUntilDate,
      nextContactDate,
      contactAttempts,
    } = req.body;

    console.log("=== FRANCHISE ID CHECK ===");
    console.log("franchiseId from request body:", franchiseId);
    console.log("franchiseId type:", typeof franchiseId);
    console.log("franchiseId length:", franchiseId?.length);
    console.log("franchiseId truthy check:", !!franchiseId);

    // Validate franchiseId more thoroughly
    if (!franchiseId || franchiseId.trim() === '' || franchiseId === 'null' || franchiseId === 'undefined') {
      console.error("Invalid franchiseId received:", franchiseId);
      return res.status(400).json({
        success: false,
        message: 'Valid FranchiseID is required. Please check your login status.',
        receivedFranchiseId: franchiseId
      });
    }
    
    const cleanFranchiseId = franchiseId.trim();
    console.log("Clean franchiseId:", cleanFranchiseId);

    // Validate required fields
    if (!studentName?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student name is required',
      });
    }

    if (!studentMobile?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Student mobile is required',
      });
    }

    if (!courseInterested?.courseName || !courseInterested?.courseCode) {
      return res.status(400).json({
        success: false,
        message: 'Course information is required',
      });
    }

    // Generate enquiryId with better logic
    console.log("Generating enquiryId for franchiseId:", franchiseId);
    
    let enquiryId;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        // Get the count of existing enquiries for this franchise
        const enquiryCount = await EnquiryStudent.countDocuments({ franchiseId });
        const newEnquiryNumber = enquiryCount + 1 + attempts; // Add attempts to handle race conditions
        
        enquiryId = `EQ/${franchiseId}/${String(newEnquiryNumber).padStart(3, '0')}`;
        
        console.log(`Attempt ${attempts + 1}: Generated enquiryId: ${enquiryId}`);
        
        // Check if this enquiryId already exists
        const existingEnquiry = await EnquiryStudent.findOne({ enquiryId });
        if (!existingEnquiry) {
          console.log("EnquiryId is unique, proceeding...");
          break; // Unique ID found
        }
        
        console.log("EnquiryId already exists, trying next number...");
        attempts++;
      } catch (error) {
        console.error("Error generating enquiryId:", error);
        attempts++;
      }
    }
    
    if (attempts >= maxAttempts) {
      // Fallback: use timestamp
      const timestamp = Date.now();
      enquiryId = `EQ/${franchiseId}/${timestamp}`;
      console.log("Using timestamp fallback enquiryId:", enquiryId);
    }
    
    // Validate that enquiryId was generated successfully
    if (!enquiryId) {
      console.error("Failed to generate enquiryId");
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique enquiry ID',
      });
    }

    // Process installments
    const processedInstallments = Array.isArray(installments) 
      ? installments
          .filter(inst => inst && (inst.installmentDate || inst.installmentAmount))
          .map(inst => ({
            installmentDate: inst.installmentDate || '',
            installmentAmount: parseFloat(inst.installmentAmount) || 0
          }))
      : [];

    // Process and validate fee fields explicitly
    const processedCourseFees = courseFees !== undefined && courseFees !== null ? parseFloat(courseFees) : 0;
    const processedDiscountRate = discountRate !== undefined && discountRate !== null ? parseFloat(discountRate) : 0;
    const processedDiscountAmount = discountAmount !== undefined && discountAmount !== null ? parseFloat(discountAmount) : 0;
    const processedTotalFees = totalFees !== undefined && totalFees !== null ? parseFloat(totalFees) : 0;
    const processedFeesReceived = feesReceived !== undefined && feesReceived !== null ? parseFloat(feesReceived) : 0;
    const processedBalance = balance !== undefined && balance !== null ? parseFloat(balance) : 0;
    
    console.log("Processed fee values:");
    console.log("- processedCourseFees:", processedCourseFees);
    console.log("- processedDiscountRate:", processedDiscountRate);
    console.log("- processedDiscountAmount:", processedDiscountAmount);
    console.log("- processedTotalFees:", processedTotalFees);
    console.log("- processedFeesReceived:", processedFeesReceived);
    console.log("- processedBalance:", processedBalance);

    // Create new student object
    const studentData = {
      enquiryId,
      // rollNumber: rollNumber || '',
      abbreviation: abbreviation || 'Mr.',
      franchiseId: cleanFranchiseId,
      studentName: studentName?.trim() || '',
      relationType: relationType || 'S/o',
      fatherHusbandName: fatherHusbandName?.trim() || '',
      includeFatherHusband: Boolean(includeFatherHusband),
      surnameName: surnameName?.trim() || '',
      includeSurname: Boolean(includeSurname),
      motherName: motherName?.trim() || '',
      courseInterested: {
        courseName: courseInterested?.courseName || '',
        courseCode: courseInterested?.courseCode || ''
      },
      studentMobile: studentMobile?.trim() || '',
      alternateMobile: alternateMobile?.trim() || '',
      email: email?.trim() || '',
      dob: dob || '',
      gender: gender || '',
      city: city?.trim() || '',
      postCode: postCode?.trim() || '',
      permanentAddress: permanentAddress?.trim() || '',
      referralCode: referralCode?.trim() || '',
      caste: caste?.trim() || '',
      qualifications: qualifications?.trim() || '',
      occupation: occupation?.trim() || '',
      feeDetails,
      selectedBatch,
      admissionDate: admissionDate || '',
      enquiryDate: enquiryDate || '',
      displayAdmissionOptions: Boolean(displayAdmissionOptions),
      courseFees: processedCourseFees,
      discountRate: processedDiscountRate,
      discountAmount: processedDiscountAmount,
      totalFees: processedTotalFees,
      feesReceived: processedFeesReceived,
      paymentMode: paymentMode?.trim() || 'Cash',
      balance: processedBalance,
      remarks: remarks?.trim() || '',
      installments: processedInstallments,
      status: 'pending',
      // Status management fields - Only OPEN and ON_HOLD allowed
      enquiryStatus: ['OPEN', 'ON_HOLD'].includes(enquiryStatus) ? enquiryStatus : 'OPEN',
      // priority: priority || 'MEDIUM', // Commented out - not needed
      holdUntilDate: holdUntilDate ? new Date(holdUntilDate) : null,
      nextContactDate: nextContactDate ? new Date(nextContactDate) : null,
      contactAttempts: contactAttempts || 0,
      statusHistory: [{
        status: ['OPEN', 'ON_HOLD'].includes(enquiryStatus) ? enquiryStatus : 'OPEN',
        changedBy: 'System',
        changeDate: new Date(),
        remarks: 'Initial enquiry creation'
      }],
    };
    
    delete studentData.rollNumber;
    console.log("Final student data to be saved:");
    console.log(JSON.stringify(studentData, null, 2));

    const newStudent = new EnquiryStudent(studentData);

    console.log("Created EnquiryStudent instance - checking fee fields:");
    console.log("- newStudent.courseFees:", newStudent.courseFees);
    console.log("- newStudent.discountRate:", newStudent.discountRate);
    console.log("- newStudent.discountAmount:", newStudent.discountAmount);
    console.log("- newStudent.totalFees:", newStudent.totalFees);
    console.log("- newStudent.feesReceived:", newStudent.feesReceived);
    console.log("- newStudent.paymentMode:", newStudent.paymentMode);
    console.log("- newStudent.balance:", newStudent.balance);
    console.log("- newStudent.remarks:", newStudent.remarks);
    console.log("- installments count:", newStudent.installments?.length);
    console.log("- installments:", JSON.stringify(newStudent.installments, null, 2));

    // Save to database
    const savedStudent = await newStudent.save();

    console.log("Successfully saved student - verifying all fields:");
    console.log("- _id:", savedStudent._id);
    console.log("- enquiryId:", savedStudent.enquiryId);
    console.log("- courseFees:", savedStudent.courseFees);
    console.log("- discountRate:", savedStudent.discountRate);
    console.log("- discountAmount:", savedStudent.discountAmount);
    console.log("- totalFees:", savedStudent.totalFees);
    console.log("- feesReceived:", savedStudent.feesReceived);
    console.log("- paymentMode:", savedStudent.paymentMode);
    console.log("- balance:", savedStudent.balance);
    console.log("- remarks:", savedStudent.remarks);
    console.log("- installments count:", savedStudent.installments?.length);
    console.log("- enquiryStatus:", savedStudent.enquiryStatus);
    // console.log("- priority:", savedStudent.priority); // Commented out
    console.log("- Full saved document:", JSON.stringify(savedStudent.toObject(), null, 2));
    console.log("=== ADD STUDENT DEBUG END ===");

    res.status(201).json({
      success: true,
      message: 'Student enquiry saved successfully',
      student: savedStudent,
      debug: {
        enquiryId: savedStudent.enquiryId,
        installmentsCount: savedStudent.installments?.length || 0,
        courseFees: savedStudent.courseFees,
        totalFees: savedStudent.totalFees,
        balance: savedStudent.balance,
        enquiryStatus: savedStudent.enquiryStatus,
        // priority: savedStudent.priority // Commented out
      }
    });

  } catch (error) {
    console.error("=== ADD STUDENT ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("MongoDB error details:", error);
    console.error("=== ADD STUDENT ERROR END ===");
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.name === 'ValidationError' ? error.errors : undefined
    });
  }
};

// Get all student enquiries filtered by franchiseId with status filters and date range
export const getStudents = async (req, res) => {
  try {
    const { 
      franchiseId, 
      page = 1, 
      limit = 10, 
      search = "", 
      status, 
      // priority, // Commented out - not needed
      tab,
      dateRange, // New parameter for date filtering
      startDate,
      endDate
    } = req.query;
    console.log("franchiseId value :: ", franchiseId);
    console.log("Query parameters:", req.query);
    
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
    
    // Add tab-based filtering - Only OPEN and ON_HOLD allowed
    if (tab && tab !== "all") {
      if (['OPEN', 'ON_HOLD'].includes(tab)) {
        query.enquiryStatus = tab;
      }
    }
    
    // Add specific status filter - Only OPEN and ON_HOLD allowed
    if (status && status !== "all" && ['OPEN', 'ON_HOLD'].includes(status)) {
      query.enquiryStatus = status;
    }
    
    // Add priority filter - Commented out as not needed
    // if (priority && priority !== "all") {
    //   query.priority = priority;
    // }

    // Add date range filtering for holdUntilDate
    if (dateRange || (startDate && endDate)) {
      let dateQuery = {};
      const now = new Date();
      
      if (dateRange) {
        switch (dateRange) {
          case 'today':
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            dateQuery = {
              $gte: todayStart,
              $lte: todayEnd
            };
            break;
            
          case 'yesterday':
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
            dateQuery = {
              $gte: yesterdayStart,
              $lte: yesterdayEnd
            };
            break;
            
          case 'last7days':
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            dateQuery = {
              $gte: sevenDaysAgo,
              $lte: now
            };
            break;
            
          case 'last30days':
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            dateQuery = {
              $gte: thirtyDaysAgo,
              $lte: now
            };
            break;
        }
      } else if (startDate && endDate) {
        // Custom range
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date
        dateQuery = {
          $gte: start,
          $lte: end
        };
      }
      
      if (Object.keys(dateQuery).length > 0) {
        query.createdAt = dateQuery;
      }
    }
    
    // Add search functionality if search parameter exists
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentMobile: { $regex: search, $options: 'i' } },
        { enquiryId: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log("Final query:", JSON.stringify(query, null, 2));
    
    // Get filtered students with pagination
    const students = await EnquiryStudent.find(query)
      .select('enquiryId studentName email studentMobile dob city courseFees discountAmount totalFees feesReceived balance paymentMode remarks courseInterested gender permanentAddress enquiryDate installments enquiryStatus holdUntilDate nextContactDate contactAttempts statusHistory lastContactDate')
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ createdAt: -1 });
    console.log("Students fetched:", students.length);
    
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
    console.error("Error in getStudents:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update enquiry status - Only OPEN and ON_HOLD allowed
export const updateEnquiryStatus = async (req, res) => {
  try {
    const enquiryId = req.params.id;
    const { franchiseId } = req.query;
    const { enquiryStatus, holdUntilDate, remarks, changedBy } = req.body;
    
    console.log("Updating status for enquiry:", enquiryId);
    console.log("Update data:", req.body);
    
    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'FranchiseID is required'
      });
    }
    
    if (!enquiryStatus || !['OPEN', 'ON_HOLD'].includes(enquiryStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Enquiry status is required and must be either OPEN or ON_HOLD'
      });
    }
    
    const updateData = {
      enquiryStatus,
      // priority: priority || 'MEDIUM', // Commented out - not needed
      lastContactDate: new Date(),
      $push: {
        statusHistory: {
          status: enquiryStatus,
          changedBy: changedBy || 'User',
          changeDate: new Date(),
          remarks: remarks || ''
        }
      }
    };
    
    if (holdUntilDate) updateData.holdUntilDate = new Date(holdUntilDate);
    
    // Increment contact attempts for OPEN status
    if (enquiryStatus === 'OPEN') updateData.$inc = { contactAttempts: 1 };
    
    const enquiry = await EnquiryStudent.findOneAndUpdate(
      { _id: enquiryId, franchiseId: franchiseId },
      updateData,
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ 
        success: false,
        message: 'Enquiry not found or does not belong to this franchise' 
      });
    }

    console.log("Status updated successfully for enquiry:", enquiry.enquiryId);
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get status summary for dashboard - Only OPEN and ON_HOLD
export const getStatusSummary = async (req, res) => {
  try {
    const { franchiseId } = req.query;
    
    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'FranchiseID is required'
      });
    }
    
    const pipeline = [
      { $match: { franchiseId: franchiseId } },
      {
        $group: {
          _id: '$enquiryStatus',
          count: { $sum: 1 }
        }
      }
    ];
    
    const statusCounts = await EnquiryStudent.aggregate(pipeline);
    
    // Format the response - Only OPEN and ON_HOLD
    const summary = {
      OPEN: 0,
      ON_HOLD: 0,
      // Commented out closed statuses
      // CLOSED_CONVERTED: 0,
      // CLOSED_NOT_INTERESTED: 0,
      // CLOSED_UNRESPONSIVE: 0
    };
    
    statusCounts.forEach(item => {
      if (summary.hasOwnProperty(item._id)) {
        summary[item._id] = item.count;
      }
    });
    
    // Calculate totals
    const totalEnquiries = Object.values(summary).reduce((sum, count) => sum + count, 0);
    // const totalClosed = summary.CLOSED_CONVERTED + summary.CLOSED_NOT_INTERESTED + summary.CLOSED_UNRESPONSIVE;
    // const conversionRate = totalEnquiries > 0 ? ((summary.CLOSED_CONVERTED / totalEnquiries) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        statusCounts: summary,
        totalEnquiries,
        // totalClosed, // Commented out
        // conversionRate: parseFloat(conversionRate) // Commented out
      }
    });
  } catch (error) {
    console.error("Error getting status summary:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get enquiries ready to contact (ON_HOLD with holdUntilDate <= today)
export const getReadyToContact = async (req, res) => {
  try {
    const { franchiseId } = req.query;
    
    if (!franchiseId) {
      return res.status(400).json({
        success: false,
        message: 'FranchiseID is required'
      });
    }
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    const enquiries = await EnquiryStudent.find({
      franchiseId: franchiseId,
      enquiryStatus: 'ON_HOLD',
      holdUntilDate: { $lte: today }
    })
    .select('enquiryId studentName studentMobile email holdUntilDate courseInterested') // Removed priority
    .sort({ holdUntilDate: 1 });
    
    res.json({
      success: true,
      data: enquiries,
      count: enquiries.length
    });
  } catch (error) {
    console.error("Error getting ready to contact enquiries:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
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
