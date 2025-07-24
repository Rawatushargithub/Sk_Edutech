// routes/notificationRoutes.js
import express from 'express';
import {
  getAllNotifications,
  getActiveNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  toggleNotificationStatus,
  cleanupExpiredNotifications
} from '../../controllers/Notification/notification.controller.js'; // Adjust path as needed

const router = express.Router();

// GET Routes
router.get('/', getAllNotifications); // Get all notifications (for admin)
router.get('/active', getActiveNotifications); // Get only active notifications (for client)
router.get('/cleanup', cleanupExpiredNotifications); // Cleanup expired notifications
router.get('/:id', getNotificationById); // Get single notification by ID

// POST Routes
router.post('/', createNotification); // Create new notification

// PUT Routes
router.put('/:id', updateNotification); // Update notification
router.put('/:id/toggle', toggleNotificationStatus); // Toggle active status

// DELETE Routes
router.delete('/:id', deleteNotification); // Delete notification

export default router;