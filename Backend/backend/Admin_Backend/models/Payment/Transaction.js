import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    // required: true,
  },
  franchise: {  // Add this field
    type: mongoose.Schema.Types.ObjectId,
    ref: "Franchise",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal" , "marksheet_deduction"],
    required: true,
  },
  status: { 
    type: String,
    enum: [ "pending_approval", "approved", "rejected", "failed"],
    default: "pending_approval",
  },
  purpose: {
    type: String,
    default: "wallet_recharge",
  },
  orderId: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  referenceId: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;

