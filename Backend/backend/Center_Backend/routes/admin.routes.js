import express from "express"
import mongoose from "mongoose";
import Transaction from "../models/Payment/Transaction.js";
import Wallet from "../models/Payment/Wallet.js";
const router = express.Router();
// Approve transaction
router.post('/transactions/:transactionId/approve', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const transaction = await Transaction.findById(req.params.transactionId).session(session);
      
      if (!transaction) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      // Check if transaction is already processed
      if (transaction.status !== 'pending_approval') {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Transaction cannot be approved' });
      }
       
      // Update transaction status
      transaction.status = 'approved';
      await transaction.save();
      
      // Update wallet balance
      const wallet = await Wallet.findById(transaction.wallet).session(session);
      
      if (!wallet) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Wallet not found' });
      }
      
      // Add the transaction amount to wallet balance
      wallet.balance += transaction.amount;
      await wallet.save();
      
      // Commit the transaction
      await session.commitTransaction();
      
      res.json({ 
        success: true, 
        balance: wallet.balance 
      });
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      console.error('Error approving transaction:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      // End the session
      session.endSession();
    }
  });

router.get("/transactions" , async(req , res) => {
    try {
        const { status } = req.query;
    
        // Build query based on status filter
        let query = {};
        if (status && status !== 'all') {
          query.status = status;
        }
    
        // Populate institute details and sort by most recent first
        const transactions = await Transaction.aggregate([
          { $match: query },
          { $sort: { timestamp: -1 } }
        ]);
    
        res.status(200).json(transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
      }
    
})
  export default router;