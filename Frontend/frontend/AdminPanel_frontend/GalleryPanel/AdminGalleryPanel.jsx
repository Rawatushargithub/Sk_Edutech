// AdminGalleryPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminGalleryPanel = () => {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    fetchMedia();
  }, []);

  // Calculate total file size when files change
  useEffect(() => {
    if (files.length > 0) {
      const size = files.reduce((total, file) => total + file.size, 0);
      setTotalSize(size);
    } else {
      setTotalSize(0);
    }
  }, [files]);

  const fetchMedia = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/gallery/');
      setMedia(response.data);
    } catch (error) {
      console.error('Error fetching media:', error);
      setMessage('Failed to load gallery items');
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Format file size to be human readable
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setMessage('Please select at least one file');
      return;
    }

    if (!title.trim()) {
      setMessage('Please enter a title');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading...');
    setUploadProgress(0);
    setShowProgress(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('title', title);

      await axios.post('http://localhost:8000/api/v1/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          // Calculate and update progress percentage
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setMessage('Upload successful!');
      setTitle('');
      setFiles([]);
      // Keep progress bar visible for a moment to show completion
      setTimeout(() => {
        setShowProgress(false);
      }, 1500);
      fetchMedia(); // Refresh the gallery
    } catch (error) {
      console.error('Error uploading files:', error);
      setMessage('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await axios.delete(`http://localhost:8000/api/v1/gallery/${id}`);
      setMessage('Item deleted successfully');
      fetchMedia(); // Refresh the gallery
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Failed to delete item');
    }
  };

  // Format upload time remaining (approximate calculation)
  const formatTimeRemaining = () => {
    if (uploadProgress >= 100) return 'Complete';
    if (uploadProgress <= 0) return 'Calculating...';
    
    // Rough estimation
    const remainingPercentage = 100 - uploadProgress;
    const secondsRemaining = Math.ceil(remainingPercentage / 10); // Simple approximation
    
    if (secondsRemaining <= 0) return 'Complete';
    if (secondsRemaining < 60) return `${secondsRemaining} seconds remaining`;
    return `${Math.ceil(secondsRemaining / 60)} minutes remaining`;
  };

  return (
    <div className=" p-6">
      <h1 className="text-2xl font-bold mb-6">Gallery Admin Panel</h1>
      
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mb-8 p-6 bg-gray-100 rounded-lg">
        <div className=" mb-4 ">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title (will be applied to all selected files)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="files" className="block text-sm font-medium mb-1">
            Select Images/Videos
          </label>
          <input
            type="file"
            id="files"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            You can select multiple files
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">
              Selected files: <span className="text-blue-600">{formatFileSize(totalSize)} total</span>
            </p>
            <ul className="text-sm text-gray-600">
              {files.map((file, index) => (
                <li key={index} className="flex justify-between">
                  <span>{file.name}</span>
                  <span className="text-gray-500">{formatFileSize(file.size)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Upload Progress Bar */}
        {showProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Upload Progress: {uploadProgress}%</span>
              <span>{formatTimeRemaining()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isUploading}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 disabled:bg-blue-300"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
        
        {message && (
          <div className="mt-3 text-sm font-medium text-red-600">
            {message}
          </div>
        )}
      </form>
      
      {/* Gallery Preview */}
      <div>
        <h2 className="text-xl font-bold mb-4">Gallery Items</h2>
        
        {media.length === 0 ? (
          <p className="text-gray-500">No items in the gallery yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div key={item._id} className="border rounded-lg overflow-hidden">
                {item.mediaType.startsWith('image') ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-48 object-cover"
                    controls
                  />
                )}
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {item.size ? formatFileSize(item.size) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGalleryPanel;



