import EnquiryStudent from '../models/EnquiryStudent.model.js';

// Add a new student enquiry
export const addStudent = async (req, res) => {
  try {
    const newStudent = new EnquiryStudent(req.body);
    await newStudent.save();
    res.status(201).json({ message: 'Student enquiry saved', student: newStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all student enquiries
export const getStudents = async (req, res) => {
  try {
    const students = await EnquiryStudent.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a student enquiry by ID
export const deleteStudent = async (req, res) => {
  try {
    const enquiryId = req.params.id;
    const enquiry = await EnquiryStudent.findByIdAndDelete(enquiryId);

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
