import mongoose from 'mongoose';

const instituteSchema = new mongoose.Schema({
  instituteID: {
    type: String,
    required: true,
    unique: true
  },
  instituteName: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  dob: {
    type: Date
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
    default: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  instituteLogo: {
    type: String
  },
  instituteSignature: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on document update
instituteSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Institute = mongoose.model('Institute', instituteSchema);
export default Institute;
