import { asyncHandler } from "../utils/asynchanlder.js"; 
import Batch from "../models/batch.model.js" 
import {ApiError} from "../utils/ApiError.js"; 
import {ApiResponse} from "../utils/ApiResponse.js";

// Get all batches for a specific franchise
export const getAllBatches = asyncHandler(async (req, res) => {
    try {
      const {franchiseId} = req.query;
      if (!franchiseId) {
        throw new ApiError(400, "Franchise ID is required");
      }
      
      const batches = await Batch.find(
        { franchiseId }, 
        'batchName _id batchTiming batchLimit currentStudents franchiseId'
      );
      
      res.status(200).json(new ApiResponse(200, batches.map(batch => ({
        id: batch._id,
        name: batch.batchName,
        timings: batch.batchTiming,
        limit: batch.batchLimit,
        currentStudents: batch.currentStudents,
        franchiseId: batch.franchiseId
      })), "Successfully Get all Batches"));
    } catch (error) { 
      throw new ApiError(500, "Error Fetching Batches", error.message)
    }
  })

// Get remaining seats for a specific batch
export const getBatchSeats = asyncHandler(async (req, res) => {
    try {
      const {franchiseId} = req.query;
      if (!franchiseId) {
        throw new ApiError(400, "Franchise ID is required");
      }
      
      const batch = await Batch.findOne({
        _id: req.params.batchId,
        franchiseId: franchiseId
      });
      
      if (!batch) {
        throw new ApiError(404, "Batch not found for this franchise")
      }
      
      // Calculate remaining seats
      const remainingSeats = batch.batchLimit - batch.currentStudents;
      
      res.status(200).json(new ApiResponse(200, remainingSeats, "Successfully get the seats"));
    } catch (error) {
        throw new ApiError(500, 'Error fetching batch seats', error.message)
    }
  })

// Create new batch for a specific franchise
export const createBatch = asyncHandler(async (req, res) => {
    try {
      const { batchName, batchLimit, currentStudents, batchTiming, franchiseId } = req.body;
      
      if (!franchiseId) {
        throw new ApiError(400, "Franchise ID is required");
      }
      
      console.log(req.body)
      
      const newBatch = new Batch({
        batchName,
        batchLimit,
        franchiseId,
        currentStudents,
        batchTiming,
        franchiseId
      });
      
      const savedBatch = await newBatch.save();
      
      if (!savedBatch) {
        throw new ApiError(500, "Batch is not created in DB")
      }
      
      return res.status(201).json(new ApiResponse(201, savedBatch, "Successfully created the batch"));
    } catch (error) {
      throw new ApiError(500, "Error creating batch", error.message)
    }
  })

// Update batch for a specific franchise
export const updateBatch = asyncHandler(async (req, res) => {
    try {
      const { batchName, batchLimit, currentStudents, batchTiming, franchiseId } = req.body;
      
      if (!franchiseId) {
        throw new ApiError(400, "Franchise ID is required");
      }
      
      const updatedBatch = await Batch.findOneAndUpdate(
        { 
          _id: req.params.batchId,
          franchiseId: franchiseId
        },
        {
          batchName,
          batchLimit,
          currentStudents,
          batchTiming
        },
        { new: true }
      );
      
      if (!updatedBatch) {
        throw new ApiError(404, "Batch not found for this franchise");
      }
      
      res.status(200).json(new ApiResponse(200, updatedBatch, "Successfully updated the batch"));
    } catch (error) {
      throw new ApiError(500, "Error updating batch", error.message);
    }
  })

// Delete batch for a specific franchise
export const deleteBatch = asyncHandler(async (req, res) => {
    try {
      const {franchiseId} = req.query;
      if (!franchiseId) {
        throw new ApiError(400, "Franchise ID is required");
      }
      
      console.log(req.params.batchId)
      
      const deletedBatch = await Batch.findOneAndDelete({
        _id: req.params.batchId,
        franchiseId: franchiseId
      });
      
      if (!deletedBatch) {
        throw new ApiError(404, "Batch not found for this franchise");
      }
      
      res.status(200).json(new ApiResponse(200, null, "Batch deleted successfully"));
    } catch (error) {
      throw new ApiError(500, "Error deleting batch", error.message);
    }
  })