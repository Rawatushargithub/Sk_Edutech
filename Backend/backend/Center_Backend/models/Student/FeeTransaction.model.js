// FeeTransaction.model.js
import mongoose from "mongoose";

const feeTransactionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  feeId: { type: mongoose.Schema.Types.ObjectId, ref: "Fee", required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  paymentMode: { type: String, required: true },
}, { timestamps: true });
 
export default mongoose.model("FeeTransaction", feeTransactionSchema); 