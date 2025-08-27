// batchRoutes.js 
import express from 'express';
import {
  getAllBatches,
  getBatchSeats,
  createBatch,
  updateBatch,  
  editBatch,
  deleteBatch
} from "../controllers/batch.controller.js"

const router = express.Router();
 
// Get all batches (for dropdown) 
router.get('/allBatches', getAllBatches);

// Get remaining seats for specific batch
router.get('/:batchId/seats', getBatchSeats);

// Create new batch
router.post('/createBatch', createBatch);

// Update batch
router.put('/:batchId', updateBatch);

// Edit batch (only timing and allowed students)
router.patch('/:batchId/edit', editBatch);

// Delete batch
router.delete('/:batchId', deleteBatch);

export default router;