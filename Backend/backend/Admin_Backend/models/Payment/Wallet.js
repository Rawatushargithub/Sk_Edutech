import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  franchiseId: { // System Generated ID
            type: String,
            // required: true, // Not required initially for applications
            unique: true,
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