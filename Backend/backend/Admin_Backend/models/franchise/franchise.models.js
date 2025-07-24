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
        totalStudents: { // Added field for number of students
             type: Number,
             min: 0,
             default: 0,
        },
        franchiseId: { // System Generated ID
            type: String,
            // required: true, // Not required initially for applications
            unique: true,
            trim: true,
            sparse: true, // Allows multiple documents to have null/missing value
            // lowercase: true, // Removed lowercase constraint
        },
        password: {
            type: String,
            // required: true, // Not required initially for applications
        },
        planValidityDays: { // Renamed from planDuration
            type: Number,
            required: true,
            enum: [90, 180, 365],
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Active', 'Inactive', 'Rejected'],
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
        // Cloudinary URLs for uploaded documents
        ownerPhotoUrl: {
            type: String, // URL from Cloudinary
        },
        franchiseSignatureUrl: {
            type: String, // URL from Cloudinary
        },
        // Request & Activation Tracking
        requestDate: { // Date the application was submitted or admin created
            type: Date,
            default: Date.now,
        },
        activationDate: { // Date the franchise status became 'Active'
            type: Date,
        },
        expireDate: { // Calculated based on activationDate + planValidityDays
            type: Date,
        },
        atcCode: { // Seems like an internal code? Keep as is.
             type: String,
             trim: true,
        }
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Pre-save hook to calculate expireDate based on activationDate
franchiseSchema.pre('save', function (next) {
    // Calculate expireDate only when activationDate is set/modified and planValidityDays exists
    if (this.isModified('activationDate') || this.isNew && this.activationDate) {
        if (this.activationDate && this.planValidityDays) {
            const expiry = new Date(this.activationDate);
            expiry.setDate(expiry.getDate() + this.planValidityDays);
            this.expireDate = expiry;
        } else {
             // If activationDate is removed or not set, clear expireDate
             this.expireDate = undefined;
        }
    }

    // TODO: Add password hashing logic here before saving (only if password is provided/modified)
    // if (this.isModified('password')) { ... hash password ... }
    next();
});


const Franchise = mongoose.model('Franchise', franchiseSchema);
export default Franchise;