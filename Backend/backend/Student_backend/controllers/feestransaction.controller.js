import FeeTransaction from "../../Center_Backend/models/Student/FeeTransaction.model.js";
import Student from "../../Center_Backend/models/Student/Student_Detais.model.js";

// Get fee history by studentId
export const getFeeHistoryByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch fee history
    const history = await FeeTransaction.find({ studentId })
      .populate("feeId", "name amount dueDate") // only pick fields you want from Fee
      .sort({ date: -1 });

    res.json({
      student: {
        id: student._id,
        name: student.name,
        class: student.className,
      },
      feeHistory: history,
    });
  } catch (error) {
    console.error("Error fetching fee history:", error);
    res.status(500).json({ message: "Server error" });
  }
};
