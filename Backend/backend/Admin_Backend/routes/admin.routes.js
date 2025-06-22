import express from "express"
import { approveTransaction, getAllTransactions } from "../controllers/wallet/adminWallet.controller.js";
const router = express.Router();
// Approve transaction
router.post('/transactions/:transactionId/approve', approveTransaction);

router.get("/transactions" , getAllTransactions)
  export default router;