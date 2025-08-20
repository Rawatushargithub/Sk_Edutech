import mongoose from "mongoose";
 
const installmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  installmentName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // Format: dd-mm-yyyy
  paid: { type:Boolean }
}, { timestamps: true });

const Installment = mongoose.models.Installment || mongoose.model("Installment", installmentSchema);

export default Installment;
