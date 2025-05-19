import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    // required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal"],
    required: true,
  },
  status: { 
    type: String,
    enum: ["pending", "pending_approval", "approved", "rejected", "failed"],
    default: "pending",
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

