import mongoose, { Schema } from 'mongoose';

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpiry: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

export default Otp;
