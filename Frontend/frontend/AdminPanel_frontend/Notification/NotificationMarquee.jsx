import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, Clock } from 'lucide-react';
import API_BASE_URL from "../../../frontend/config.js";


const NotificationAdminPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    isActive: true,
    expiresAt: ''
  });

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/notification`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = editingNotification 
        ? `${API_BASE_URL}/api/v1/notification/${editingNotification._id}` 
        : `${API_BASE_URL}/api/v1/notification`;
      
      const method = editingNotification ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null
        }),
      });

      if (response.ok) {
        await fetchNotifications();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving notification:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/notification/${id}`, {
          method: 'DELETE',
        });
        await fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  // Toggle active status
  const toggleActive = async (id, currentStatus) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/notification/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  // Open modal for editing
  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      text: notification.text,
      isActive: notification.isActive,
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : ''
    });
    setIsModalOpen(true);
  };

  // Open modal for creating
  const handleCreate = () => {
    setEditingNotification(null);
    setFormData({
      text: '',
      isActive: true,
      expiresAt: ''
    });
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotification(null);
    setFormData({
      text: '',
      isActive: true,
      expiresAt: ''
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notification Manager</h1>
              <p className="text-gray-600 mt-2">Manage marquee notifications for franchises dashboard</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-black hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={20} />
              Add Notification
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Notifications</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No notifications found. Create your first notification!</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div key={notification._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          notification.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {notification.isActive ? (
                            <>
                              <Eye size={12} className="mr-1 cursor-pointer" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} className="mr-1 cursor-pointer" />
                              Inactive
                            </>
                          )}
                        </span>
                        {notification.expiresAt && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock size={12} className="mr-1" />
                            Expires: {formatDate(notification.expiresAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-gray-900 mb-2 break-words">{notification.text}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Created: {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(notification._id, notification.isActive)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          notification.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={notification.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {notification.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(notification)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingNotification ? 'Edit Notification' : 'Create New Notification'}
              </h3>
            </div>
            
            <div className="p-6 pt-0 space-y-6">
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Text *
                </label>
                <textarea
                  id="text"
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Enter your notification message..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Inactive notifications won't be displayed</p>
              </div>

              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date (Optional)
                </label>
                <input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ease-in-out"
                />
                <p className="text-xs text-gray-500 mt-1.5">Leave empty for a permanent notification.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 font-semibold bg-black hover:bg-gray-800 text-white rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {loading ? 'Saving...' : (editingNotification ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default NotificationAdminPanel;

const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes fade-in-scale {
      0% {
        transform: scale(0.95);
        opacity: 0;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    .animate-fade-in-scale {
      animation: fade-in-scale 0.3s ease-in-out forwards;
    }
  `}</style>
);