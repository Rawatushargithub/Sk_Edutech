import { asyncHandler } from "../utils/asynchanlder.js"; 
import Batch from "../models/batch.model.js" 
import Franchise from "../models/Franchise.model.js";
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
  // Input validation
  const { batchName, batchLimit, currentStudents, batchTiming } = req.body;
  const { franchiseId} = req.query; // Destructure franchiseId from query params
  // Log the request body for debugging
  console.log('Request body:', req.body);
  console.log('Franchise ID:', franchiseId);
  //Validate required fields
  if (!franchiseId) {
    return res.status(400).json(
      new ApiResponse(400, null, "Franchise ID is required")
    );
  }
  
  if (!batchName) {
    return res.status(400).json(
      new ApiResponse(400, null, "Batch name is required")
    );
  }
  
  if (!batchLimit || batchLimit <= 0) {
    return res.status(400).json(
      new ApiResponse(400, null, "Valid batch limit is required")
    );
  }
  
  if (!batchTiming) {
    return res.status(400).json(
      new ApiResponse(400, null, "Batch timing is required")
    );
  }
  
  try {
    //Check if franchise exists (optional but recommended)
    const franchiseExists = await Franchise.find({franchiseId: franchiseId});
    if (!franchiseExists) { 
      return res.status(404).json(
        new ApiResponse(404, null, "Franchise not found")
      );
    }
    
    // Create new batch instance
    const newBatch = new Batch({
      batchName,
      batchLimit: parseInt(batchLimit),
      currentStudents: parseInt(currentStudents) || 0,
      batchTiming,
      franchiseId: franchiseId // Use the franchiseId from query params
    });
    
    console.log('Creating batch:', newBatch);
    
    // Save to database
    const savedBatch = await newBatch.save();
    
    if (!savedBatch) {
      return res.status(500).json(
        new ApiResponse(500, null, "Failed to save batch to database")
      );
    }
    
    console.log('Batch created successfully:', savedBatch);
    
    return res.status(201).json(
      new ApiResponse(201, savedBatch, "Batch created successfully")
    );
    
  } catch (error) {
    console.error('Error creating batch:', error);
    
    // Handle specific MongoDB/Mongoose errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json(
        new ApiResponse(409, null, `Batch with this ${field} already exists`)
      );
    }
    
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json(
        new ApiResponse(400, null, `Validation error: ${validationErrors.join(', ')}`)
      );
    }
    
    if (error.name === 'CastError') {
      // Invalid ObjectId or data type error
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid data format provided")
      );
    }
    
    // Generic server error
    return res.status(500).json(
      new ApiResponse(500, null, `Server error: ${error.message}`)
    );
  }
});

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