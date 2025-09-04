import Marksheet from "../../Center_Backend/models/Marksheet.model.js";

// ✅ Get all marksheets
export const getAllMarksheets = async (req, res) => {
  try {
    const marksheets = await Marksheet.find();
    res.status(200).json(marksheets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching marksheets", error });
  }
};

// ✅ Update approval status of a student
export const updateApprovalStatus = async (req, res) => {
  try {
    const { marksheetId, courseCode, studentId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    // Find the marksheet
    const marksheet = await Marksheet.findById(marksheetId);
    if (!marksheet) {
      return res.status(404).json({ message: "Marksheet not found" });
    }

    // Find course
    const course = marksheet.courses.find(c => c.courseCode === courseCode);
    if (!course) {
      return res.status(404).json({ message: "Course not found in marksheet" });
    }

    // Find student
    const student = course.students.find(
      s => s._id.toString() === studentId.toString()
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found in course" });
    }

    // ✅ Update fields
    student.approvalStatus = approvalStatus;

    if (approvalStatus === "approved") {
      student.isApprovedByAdmin = true;
      student.rejectionReason = null;
    } else if (approvalStatus === "rejected") {
      student.isApprovedByAdmin = false;
      student.rejectionReason = rejectionReason || "Not specified";
    } else {
      student.isApprovedByAdmin = false;
      student.rejectionReason = null;
    }

    await marksheet.save();

    res.status(200).json({
      message: "Student approval status updated successfully",
      student
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating approval status", error });
  }
};
