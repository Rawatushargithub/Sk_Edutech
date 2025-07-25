// controllers/notificationController.js
import MarqueeNotification from '../../models/NotificationMarquee.model.js'; // Adjust path as needed

// Get all notifications (for admin panel)
const handleExpiredNotifications = async () => {
  try {
    const now = new Date();
    await MarqueeNotification.updateMany(
      { isActive: true, expiresAt: { $lte: now } },
      { $set: { isActive: false, expiresAt: null } }
    );
  } catch (error) {
    console.error('Error handling expired notifications:', error);
  }
};

// Get all notifications (for admin panel)
export const getAllNotifications = async (req, res) => {
  try {
    await handleExpiredNotifications(); // Handle expired notifications before fetching
    const notifications = await MarqueeNotification.find()
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Error fetching notifications', 
      error: error.message 
    });
  }
};

// Get active notifications (for client side)
export const getActiveNotifications = async (req, res) => {
  try {
    await handleExpiredNotifications(); // Handle expired notifications before fetching
    const now = new Date();
    
    const notifications = await MarqueeNotification.find({
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } }, // No expiration date
        { expiresAt: null }, // Null expiration date
        { expiresAt: { $gt: now } } // Not yet expired
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching active notifications:', error);
    res.status(500).json({ 
      message: 'Error fetching active notifications', 
      error: error.message 
    });
  }
};

// Get single notification by ID
export const getNotificationById = async (req, res) => {
  try {
    const notification = await MarqueeNotification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ 
      message: 'Error fetching notification', 
      error: error.message 
    });
  }
};

// Create new notification
export const createNotification = async (req, res) => {
  try {
    const { text, isActive = true, expiresAt } = req.body;
    
    // If this notification is set to active, deactivate all others
    if (isActive) {
      await MarqueeNotification.updateMany({}, { $set: { isActive: false } });
    }
    
    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Notification text is required' });
    }
    
    // Check if expiresAt is in the future (if provided)
    if (expiresAt) {
      const expireDate = new Date(expiresAt);
      const now = new Date();
      
      if (expireDate <= now) {
        return res.status(400).json({ 
          message: 'Expiration date must be in the future' 
        });
      }
    }
    
    const notificationData = {
      text: text.trim(),
      isActive: Boolean(isActive)
    };
    
    // Only add expiresAt if it's provided and not empty
    if (expiresAt && expiresAt.trim() !== '') {
      notificationData.expiresAt = new Date(expiresAt);
    }
    
    const notification = new MarqueeNotification(notificationData);
    const savedNotification = await notification.save();
    
    res.status(201).json(savedNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      message: 'Error creating notification', 
      error: error.message 
    });
  }
};

// Update notification
export const updateNotification = async (req, res) => {
  try {
    const { text, isActive, expiresAt } = req.body;
    const notificationId = req.params.id;
    
    // Find the notification first
    const notification = await MarqueeNotification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (text !== undefined) {
      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Notification text cannot be empty' });
      }
      updateData.text = text.trim();
    }
    
    if (isActive !== undefined) {
      // If activating this notification, deactivate all others
      if (Boolean(isActive)) {
        await MarqueeNotification.updateMany({ _id: { $ne: notificationId } }, { $set: { isActive: false } });
      }
      updateData.isActive = Boolean(isActive);
    }
    
    // Handle expiresAt field
    if (expiresAt !== undefined) {
      if (expiresAt === null || expiresAt === '') {
        updateData.expiresAt = null; // Remove expiration
      } else {
        const expireDate = new Date(expiresAt);
        const now = new Date();
        
        if (expireDate <= now) {
          return res.status(400).json({ 
            message: 'Expiration date must be in the future' 
          });
        }
        
        updateData.expiresAt = expireDate;
      }
    }
    
    const updatedNotification = await MarqueeNotification.findByIdAndUpdate(
      notificationId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ 
      message: 'Error updating notification', 
      error: error.message 
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    const deletedNotification = await MarqueeNotification.findByIdAndDelete(notificationId);
    
    if (!deletedNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json({ 
      message: 'Notification deleted successfully',
      deletedNotification 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      message: 'Error deleting notification', 
      error: error.message 
    });
  }
};

// Toggle notification active status
export const toggleNotificationStatus = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    const notification = await MarqueeNotification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    const updatedNotification = await MarqueeNotification.findByIdAndUpdate(
      notificationId,
      { isActive: !notification.isActive },
      { new: true }
    );
    
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Error toggling notification status:', error);
    res.status(500).json({ 
      message: 'Error toggling notification status', 
      error: error.message 
    });
  }
};

// Clean up expired notifications (utility function)
export const cleanupExpiredNotifications = async (req, res) => {
  try {
    const now = new Date();
    
    const result = await MarqueeNotification.deleteMany({
      expiresAt: { $lte: now }
    });
    
    res.status(200).json({ 
      message: `Cleaned up ${result.deletedCount} expired notifications` 
    });
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    res.status(500).json({ 
      message: 'Error cleaning up expired notifications', 
      error: error.message 
    });
  }
};