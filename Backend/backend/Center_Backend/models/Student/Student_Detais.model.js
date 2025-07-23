import mongoose from "mongoose";
 
const studentSchema = new mongoose.Schema({
  studentPhoto: { type: String, required: true }, // Cloudinary URL
  studentSignature: { type: String, required: true }, // Cloudinary URL
  rollNumber: { type: String, required: true, unique: true },
  abbreviation: { type: String },
  franchiseId: { // System Generated ID
    type: String,
    required: true
  },
  studentName: { type: String, required: true }, 
  relationType: { type: String , required: true }, 
  fatherHusbandName: { type: String },
  includeFatherHusband: { type:Boolean , default:true} , 
  surnameName: { type: String },
  includeSurname: { type:Boolean , default:true},
  motherName: { type: String },
  courseInterested: { 
    courseName: {type: String, required: true},
    courseCode: {type: String, required: true}  
}, 
  studentMobile: { type: String, required: true },
  alternateMobile: { type: String },
  email: { type: String, unique: true },
  dob: { type: String, required: true }, // Format: dd-mm-yyyy
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  city: { type: String },
  postCode: { type: String },
  permanentAddress: { type: String },
  referralCode: { type: String },
  caste: { type: String },
  qualifications: { type: String },
  occupation: { type: String }, 
 
  // Reference Fields 
  feeDetails: { type: mongoose.Schema.Types.ObjectId, ref: "Fee" }, // Linked Fee Schema
  installmentDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: "Installment" }], // Linked Installments
  selectedBatch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" }, // Linked Batch

  admissionDate: { type: String, required: true }, // Format: dd-mm-yyyy
  displayAdmissionOptions: { type: Boolean, default: false }, // For ID card, admission form & fee receipt
  status: { type: Boolean, default: true }
  
}, { timestamps: true });
 
const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;

