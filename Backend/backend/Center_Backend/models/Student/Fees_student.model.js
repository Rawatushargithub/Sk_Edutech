import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  courseFees: { type: Number, required: true },
  discountType: { type: String, enum: ["amount+", "amount-", "percent+", "percent-"] }, // Discount Options
  discountAmount: { type: Number, default: 0 },
  totalFees: { type: Number, required: true },
  feesReceived: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  remarks: { type: String },
}, { timestamps: true });
 
export default mongoose.model("Fee", feeSchema);
