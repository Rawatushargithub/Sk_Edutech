import { asyncHandler } from "../utils/asynchanlder.js"; 
import Batch from "../models/batch.model.js" 
import {ApiError} from "../utils/ApiError.js"; 
import {ApiResponse} from "../utils/ApiResponse.js";

// Get all batches
export const getAllBatches = asyncHandler(async (req, res) => {
    try {
      const batches = await Batch.find({}, 'batchName _id batchTiming batchLimit currentStudents');
      res.status(200).json(new ApiResponse(200 , batches.map(batch => ({
        id: batch._id,
        name: batch.batchName,
        timings: batch.batchTiming,
        limit: batch.batchLimit,
        currentStudents: batch.currentStudents
      })) , "Successfully Get all Batches"));
    } catch (error) { 
      throw new ApiError(500 , "Error Fetching Batches" , error.message)
    }
  })

// Get remaining seats for a specific batch
export const getBatchSeats = asyncHandler(async (req, res) => {
    try {
      const batch = await Batch.findById(req.params.batchId);
      if (!batch) {
        throw new ApiError(500 , "Batch not Found")
      }
      
      // Calculate remaining seats
      const remainingSeats = batch.batchLimit - batch.currentStudents;
      
      res.status(200).json(new ApiResponse(200 , remainingSeats , "Successfully get the seats"));
    } catch (error) {
        throw new ApiError(500 , 'Error fetching batch seats', error.message)
    }
  })

// Create new batch
export const createBatch = asyncHandler(async (req, res) => {
  
      const { batchName, batchLimit, currentStudents, batchTiming } = req.body;
      console.log(req.body)
      
      const newBatch = new Batch({
        batchName,
        batchLimit,
        currentStudents,
        batchTiming
      });
      
      if(!newBatch)
      {
        throw new ApiError(500 , "Batch is not created in DB" , error.message)
      }
      await newBatch.save();
      return res.status(201).json(new ApiResponse(200 , newBatch , "Sucessfully created the batch"));
  })

// Update batch
export const updateBatch = asyncHandler(async (req, res) => {
    try {
      const { batchName, batchLimit, currentStudents, batchTiming } = req.body;
      
      const updatedBatch = await Batch.findByIdAndUpdate(
        req.params.batchId,
        {
          batchName,
          batchLimit,
          currentStudents,
          batchTiming
        },
        { new: true }
      );
      
      if (!updatedBatch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      
      res.status(200).json(updatedBatch);
    } catch (error) {
      res.status(400).json({ message: 'Error updating batch', error: error.message });
    }
  })

// Delete batch
export const deleteBatch = asyncHandler(async (req, res) => {
    try {
      console.log(req.params.batchId)
      const deletedBatch = await Batch.findByIdAndDelete(req.params.batchId);
      
      if (!deletedBatch) {
        return res.status(404).json({ message: 'Batch not found' });
      }
      
      res.status(200).json({ message: 'Batch deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting batch', error: error.message });
    }
  })