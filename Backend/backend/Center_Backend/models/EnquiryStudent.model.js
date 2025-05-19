import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentName: String,
  relation: String,
  guardianName: String,
  motherName: String,
  courseOfInterest: String,
  studentMobile: String,
  alternateMobile: String,
  email: String,
  dateOfBirth: String,
  gender: String,
  state: String,
  city: String,
  postcode: String,
  permanentAddress: String,
  referralCode: String,
  enquiryDate: String,
  status: { type: String, default: 'pending' }
});

const EnquiryStudent = mongoose.model('EnquiryStudent', studentSchema);

export default EnquiryStudent;
