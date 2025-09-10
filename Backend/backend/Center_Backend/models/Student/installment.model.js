import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  installmentName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // Format: dd-mm-yyyy //due date
  paid: { type: Boolean, default: false },
  paymentMode: { 
    type: String, 
    enum: ["Cash", "Card", "UPI"], 
    default: null 
  },
  paymentDate: { type: String }, // Date when payment was made
  paidAmount: { type: Number, default: 0 }, // Amount actually paid
  remainingAmount: { type: Number }, // Calculated field for remaining amount
  status: { 
    type: String, 
    enum: ["Pending", "Partial", "Paid", "Overdue", "Fully_Paid_Early"], 
    default: "Pending" 
  },
  paymentHistory: [{
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ["Cash", "Card", "UPI"], required: true },
    paymentDate: { type: String, required: true },
    remarks: { type: String }
  }]
}, { timestamps: true }); 

const Installment = mongoose.models.Installment || mongoose.model("Installment", installmentSchema);

export default Installment;