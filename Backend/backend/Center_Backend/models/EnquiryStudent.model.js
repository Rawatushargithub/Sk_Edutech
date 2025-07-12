import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentName: String,
  relation: String,
  guardianName: String,
  motherName: String,
  franchiseId: { // System Generated ID
            type: String,
            default: true,
            // required: true, // Not required initially for applications
            // Allows multiple documents to have null/missing value
            // lowercase: true, // Removed lowercase constraint
        },
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
