  import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  franchiseId: { // changed to lowercase for consistency
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
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


const Wallet = mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

export default Wallet;