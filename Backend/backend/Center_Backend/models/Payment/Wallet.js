import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  Institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  balance: { 
    type: Number,
    default: 0,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Wallet = mongoose.model("Wallet", WalletSchema);

export default Wallet;