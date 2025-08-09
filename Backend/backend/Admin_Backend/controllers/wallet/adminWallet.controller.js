import Wallet from "../../models/Payment/Wallet.js";
import Transaction from "../../models/Payment/Transaction.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../../Center_Backend/utils/asynchanlder.js";


export const approveTransaction = asyncHandler(async (req, res) => {
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

export const getAllTransactions = asyncHandler(async(req , res) => {
    try {
        const { status } = req.query;
    
        // Build query based on status filter
        let query = {};
        if (status && status !== 'all') {
          query.status = status;
        }
    
        // Populate institute details and sort by most recent first
        // const transactions = await Transaction.aggregate([
        //   { $match: query },
        //   { $sort: { timestamp: -1 } }
        // ]);
        const transactions = await Transaction.find(query)
      .populate('franchise', 'franchiseName ownerName email mobile city state')
      .sort({ timestamp: -1 });
    
        res.status(200).json(transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
      }
    
});

export const rejectTransaction = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const transaction = await Transaction.findById(req.params.transactionId).session(session);
      
      if (!transaction) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      // Check if transaction can be rejected
      if (transaction.status !== 'pending_approval') {
        await session.abortTransaction();
        return res.status(400).json({ error: 'Transaction cannot be rejected' });
      }
       
      // Update transaction status
      transaction.status = 'rejected';
      await transaction.save({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      
      res.json({ 
        success: true, 
        message: 'Transaction rejected successfully'
      });
    } catch (error) {
      await session.abortTransaction();
      console.error('Error rejecting transaction:', error);
      res.status(500).json({ error: 'Server error' });
    } finally {
      session.endSession();
    }
});