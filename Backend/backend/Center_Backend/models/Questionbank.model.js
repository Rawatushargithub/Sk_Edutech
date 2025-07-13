// models/QuestionBank.module.js
import mongoose from 'mongoose';

// Define the question schema
const questionSchema = new mongoose.Schema({
  qNo: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000 
  },
  options: {
    a: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    b: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    c: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    d: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  answer: {
    type: String,
    required: true,
    enum: ['a', 'b', 'c', 'd'],
    lowercase: true
  }
});

const questionBankSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  questions: [questionSchema] // <-- Now an array of question objects
});

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
export default QuestionBank;
