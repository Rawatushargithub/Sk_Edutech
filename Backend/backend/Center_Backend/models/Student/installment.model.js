import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  installmentName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // Format: dd-mm-yyyy
  paid: { type:Boolean },
   paymentMode: { 
    type: String, 
    enum: ["Cash", "Card", "UPI"], 
    default: null 
  },
  paymentDate: { type: String }, // Date when payment was made
  paidAmount: { type: Number, default: 0 }, // Amount actually paid
  status: { type: String, enum: ["Pending", "Paid", "Overdue"], default: "Pending" }
}, { timestamps: true }); 

const Installment = mongoose.models.Installment || mongoose.model("Installment", installmentSchema);

export default Installment;
 