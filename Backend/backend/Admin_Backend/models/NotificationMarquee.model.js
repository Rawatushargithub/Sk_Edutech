
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date // Optional: for time-limited messages
  }
});

export default mongoose.model('NotificationMarquee', notificationSchema);
