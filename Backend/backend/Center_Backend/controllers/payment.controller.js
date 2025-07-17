import { asyncHandler } from "../utils/asynchanlder.js";
import Wallet from "../models/Payment/Wallet.js";
import Transaction from "../models/Payment/Transaction.js";
import Franchise from "../models/Franchise.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("Razorpay keys are missing! Check your environment variables.");
}

export const create_order = asyncHandler(async (req, res) => {
    try {
        const { amount } = req.body;
        const { franchiseId } = req.query;
        
        console.log("amount in create order", amount);
        console.log("franchiseId in create order", franchiseId);
        
        if (!amount || amount < 100) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        
        if (!franchiseId) {
            return res.status(400).json({ error: 'Franchise ID not found' });
        }
        
        // Find the franchise to get ObjectId
        const franchise = await Franchise.findOne({ franchiseId: franchiseId });
        if (!franchise) {
            return res.status(404).json({ error: 'Franchise not found' });
        }
        
        console.log("franchise id in create order", franchise);
        
        // Find or create wallet for this franchise
        let wallet = await Wallet.findOne({ franchiseId: franchiseId });
        
        if (!wallet) {
            wallet = await Wallet.create({
                franchiseId: franchiseId,
                balance: 0
            });
        }
        
        // Create Razorpay order
        const options = {
            amount: amount, // amount in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            payment_capture: 1
        };
        
        const order = await razorpay.orders.create(options);
        
        // ✅ DON'T CREATE TRANSACTION HERE - just return order details
        console.log("Order created:", order.id, "key_id", process.env.RAZORPAY_KEY_ID);
        
        res.json({
            order_id: order.id,
            razorpay_key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export const verify_payment = asyncHandler(async (req, res) => {
    console.log("yes verify is working");
    try {
        const { 
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            amount
        } = req.body;
        const { franchiseId } = req.query;

        // Verify signature
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');
        
        const isAuthentic = expectedSignature === razorpaySignature;
        
        if (!isAuthentic) {
            return res.status(400).json({ error: 'Invalid payment' });
        }
        
        // Find franchise and wallet
        const franchise = await Franchise.findOne({ franchiseId: franchiseId });
        if (!franchise) {
            return res.status(404).json({ error: 'Franchise not found' });
        }
        
        const wallet = await Wallet.findOne({ franchiseId: franchiseId });
        console.log("wallet in verify payment", wallet);
        
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }
        
        // ✅ CREATE NEW TRANSACTION DOCUMENT FOR EACH PAYMENT
        const newTransaction = await Transaction.create({
            amount: amount / 100, // Convert paise to rupees
            type: 'deposit',
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
            status: 'pending_approval',
            timestamp: new Date(),
            franchise: franchise._id,
            wallet: wallet._id
        });
        
        console.log("New transaction created:", newTransaction);
        console.log("Success");
        
        res.json({ 
            success: true,
            transactionId: newTransaction._id 
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
export const getbalance = asyncHandler( async (req, res) => {
  try {
    // const userId = req.user.id;
    const { franchiseId } = req.query; // Get franchiseId from request body
    // Find or create wallet
    let wallet = await Wallet.findOne({franchiseId: franchiseId});
    
    if (!wallet) {
      wallet = await Wallet.create({
        franchiseId: franchiseId,
        balance: 0
      }); 
    }
    
    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

 
// Get franchise-specific transactions
export const getFranchiseTransactions = asyncHandler(async(req, res) => {
    try {
        const { franchiseId } = req.query; // Get franchiseId from query parameters
        
        if (!franchiseId) {
            return res.status(400).json({ message: 'Franchise ID is required' });
        }
        
        // Find the franchise document by franchiseId (string) to get the ObjectId
        const franchise = await Franchise.findOne({ franchiseId: franchiseId });
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }
        
        const transactions = await Transaction.find({ franchise: franchise._id })
            .populate('franchise', 'franchiseName ownerName email mobile city state franchiseId')
            .sort({ timestamp: -1 });
        
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching franchise transactions:', error);
        res.status(500).json({ message: 'Error fetching franchise transactions', error: error.message });
    }
});
