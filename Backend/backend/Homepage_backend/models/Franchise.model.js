import mongoose, { Schema } from 'mongoose';

const franchiseSchema = new Schema(
    {
        franchiseName: {
            type: String,
            required: true,
            trim: true,
        },
        ownerName: {
            type: String,
            required: true,
            trim: true,
        },
        designation: {
            type: String,
            required: true,
            enum: ['Teacher', 'Entrepreneur', 'Institute Owner'],
        },
        dob: {
            type: Date,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            type: String,
            required: true,
            default: 'INDIA',
        },
        postalCode: {
            type: String,
            required: true,
            trim: true,
        },
        totalComputers: {
            type: Number,
            min: 0,
            default: 0,
        },
        totalStudents: {
            type: Number,
            min: 0,
            default: 0,
        },
        franchiseId: {
            type: String,
            unique: true,
            trim: true,
            sparse: true,
        },
        password: {
            type: String,
        },
        planValidityDays: {
            type: Number,
            required: true,
            enum: [90, 180, 365],
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Active', 'Inactive', 'Rejected', 'Not Initialized'],
            default: 'Pending',
        },
        verificationStatus: {
            type: String,
            required: true,
            enum: ['Pending', 'Verified', 'Rejected'],
            default: 'Pending',
        },
        applicationType: {
            type: String,
            required: true,
            enum: ['AdminCreated', 'FranchiseApplied'],
        },
        gstNumber: {
            type: String,
            trim: true,
        },
        ownerPhotoUrl: {
            type: String,
        },
        franchiseSignatureUrl: {
            type: String,
        },
        requestDate: {
            type: Date,
            default: Date.now,
        },
        activationDate: {
            type: Date,
        },
        expireDate: {
            
            type: Date,
        },
        atcCode: {
            type: String,
            trim: true,
        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        }
    },
    { timestamps: true }
);

// Pre-save hook to calculate expireDate based on activationDate
franchiseSchema.pre('save', function (next) {
    if (this.isModified('activationDate') || this.isNew && this.activationDate) {
        if (this.activationDate && this.planValidityDays) {
            const expiry = new Date(this.activationDate);
            expiry.setDate(expiry.getDate() + this.planValidityDays);
            this.expireDate = expiry;
        } else {
            this.expireDate = undefined;
        }
    }
    next();
});

const Franchise =mongoose.models.Franchise || mongoose.model('Franchise', franchiseSchema);

export default Franchise;
