import mongoose from 'mongoose';

const enquiryStudentSchema = new mongoose.Schema({
  enquiryId: { type: String, unique: true },
  // rollNumber: { type: String, unique: true },
  abbreviation: { type: String },
  franchiseId: { // System Generated ID
    type: String,
    required: true
  },
  studentName: { type: String, required: true }, 
  relationType: { type: String }, 
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
  email: { type: String, required: true },
  
  dob: { type: String}, // Format: dd-mm-yyyy
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
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

  admissionDate: { type: String }, // Format: dd-mm-yyyy
  enquiryDate: { type: String, required: true }, // Format: dd-mm-yyyy
  displayAdmissionOptions: { type: Boolean, default: false }, // For ID card, admission form & fee receipt
  status: { type: String, default: 'pending' },

  courseFees: { type: Number },
  discountRate: { type: Number },
  discountAmount: { type: Number },
  totalFees: { type: Number },
  feesReceived: { type: Number },
  paymentMode: { type: String },
  balance: { type: Number },
  remarks: { type: String },
  installments: [{
    installmentDate: { type: String },
    installmentAmount: { type: Number }
  }],
  enquiryStatus: {
  type: String,
  enum: ['OPEN', 'ON_HOLD'],
  default: 'OPEN'
  },
  holdUntilDate: {
    type: Date,
    default: null
  },
  lastContactDate: {
    type: Date,
    default: null
  },
  nextContactDate: {
    type: Date,
    default: null
  },
  contactAttempts: {
    type: Number,
    default: 0
  },
  statusHistory: [{
    status: String,
    changedBy: String,
    changeDate: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],
}, { timestamps: true });

const EnquiryStudent = mongoose.model('EnquiryStudent', enquiryStudentSchema);

export default EnquiryStudent;
