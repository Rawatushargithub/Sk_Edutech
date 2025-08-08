import express from "express"
import { approveTransaction, getAllTransactions ,rejectTransaction} from "../controllers/wallet/adminWallet.controller.js";
const router = express.Router();
// Approve transaction
router.post('/transactions/:transactionId/approve', approveTransaction);

router.get("/transactions" , getAllTransactions)
router.post("/transactions/:transactionId/reject", rejectTransaction)
  export default router;