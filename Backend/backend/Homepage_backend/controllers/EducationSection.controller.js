import Student from "../../Admin_Backend/models/Student/Student_Details.model.js";
import Franchise from "../../Admin_Backend/models/franchise/franchise.models.js"
export const getRecentStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .select('studentName studentPhoto')
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedStudents = students.map(student => ({
      name: student.studentName,
      image: student.studentPhoto
    }));


    return res.status(200).json({
      success: true,
      message: "Recent students fetched successfully",
      data: formattedStudents
    });
  } catch (error) {
    console.error("Error fetching recent students:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent students",
      error: error.message
    });
  }
};

export const getRecentCenterImgs = async (req, res) => {
  try {
    const Centers = await Franchise.find()
      .select('franchiseName ownerPhotoUrl')
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedCenters = Centers.map(Centers => ({
      name: Centers.franchiseName,
      image:Centers.ownerPhotoUrl
    }));


    return res.status(200).json({
      success: true,
      message: "Recent center images fetched successfully",
      data: formattedCenters
    });
  } catch (error) {
    console.error("Error fetching recent center images:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent center images",
      error: error.message
    });
  }
};
