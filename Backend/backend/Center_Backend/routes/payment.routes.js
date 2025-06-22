import { Router } from "express";
import { create_order , getbalance , verify_payment , deductWalletBalance} from "../controllers/payment.controller.js";

const router = Router();
// Create Razorpay order
router.post('/razorpay/create-order', create_order);
router.post('/razorpay/verify-payment' , verify_payment);

router.get('/balance' , getbalance);
router.post ('/deduct-wallet' , deductWalletBalance);
  
  export default router