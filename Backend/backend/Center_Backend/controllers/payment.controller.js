import { asyncHandler } from "../utils/asynchanlder.js";
import Wallet from "../models/Payment/Wallet.js";
import Transaction from "../models/Payment/Transaction.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });

  // 25/march/2025
  // the issure arrising it will create the new order id and update the wallet amount with same amount as previous 
 

export const create_order = asyncHandler (async (req, res) => {
    try {
      const { amount } = req.body;
      console.log("amount in create order" , amount)
      if (!amount || amount < 100) { // Minimum amount validation (₹1)
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      // Create Razorpay order
      const options = {
        amount: amount, // amount in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        payment_capture: 1 // Auto-capture payment
      };
      
      const order = await razorpay.orders.create(options);
      
      // Store pending transaction
    //   const userId = req.user.id;        // change with this to institute id
      const wallet = await Wallet.findOne({ });
    
    //   if (!wallet) {
    //     return res.status(404).json({ error: 'Wallet not found' });
    //   } 
      
      await Transaction.create({
        amount: amount / 100, // Convert paise to rupees
        type: 'deposit',
        status: 'pending',
        orderId: order.id,
        timestamp: new Date(),
        wallet:wallet._id
      });
      console.log(order.id , "key_id" , process.env.RAZORPAY_KEY_ID)
      res.json({
        order_id: order.id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Server error' });
    }
  })

  export const verify_payment  = asyncHandler (async (req, res) => {
    console.log("yes verify is working ")
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      amount
    } = req.body;
    console.log("razorpayPaymentId" , razorpayPaymentId, "razorpayOrderId", razorpayOrderId)
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
    
    // Update transaction status
    // const userId = req.user.id;     <- this will for future when institute ID will created then it is used 
    // const wallet = await Wallet.findOne({ user: userId });
    const wallet = await Wallet.findOne();
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    console.log("wallet id " , wallet._id)
    const transaction = await Transaction.findOne({ 
      wallet: wallet._id,
      // orderId: razorpayOrderId
    });
    console.log("transaction :: " , transaction)
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update transaction with payment details
    transaction.amount = amount/100;
    transaction.paymentId = razorpayPaymentId;
    transaction.status = 'pending_approval'; // Pending admin approval
    await transaction.save();

    console.log("Success")
    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export const getbalance = asyncHandler( async (req, res) => {
  try {
    // const userId = req.user.id;
    
    // Find or create wallet
    let wallet = await Wallet.findOne();
    
    if (!wallet) {
      wallet = await Wallet.create({
        user: userId,
        balance: 0
      });
    }
    
    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export const deductWalletBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    // Find the user's wallet
    const wallet = await Wallet.findOne();

    if (!wallet || wallet.balance < amount) {
      throw new ApiError(400, "Insufficient balance", "INSUFFICIENT_BALANCE");
    }

    // Deduct amount
    wallet.balance -= amount;

    // Create transaction record    in future create debit transaction different model  
    // await Transaction.create({
    //   amount,
    //   type: 'debit',
    //   purpose,
    //   status: 'approved'
    // });

    // Save wallet
    await wallet.save();

    return res.status(200).json(
      new ApiResponse(200, { newBalance: wallet.balance }, "Amount deducted successfully")
    );
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Error processing wallet deduction"
    );
  }
});