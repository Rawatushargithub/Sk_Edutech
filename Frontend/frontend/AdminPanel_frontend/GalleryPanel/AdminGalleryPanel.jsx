// AdminGalleryPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../config"

const AdminGalleryPanel = () => {
  const [media, setMedia] = useState([]);
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const response = await axios.get(`${API_BASE_URL}/api/v1/gallery/`);
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

      await axios.post(`${API_BASE_URL}/api/v1/gallery/upload`, formData, {
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

  // Handle single item selection
  const handleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === media.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(media.map(item => item._id)));
    }
  };

  // Single delete functions
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/v1/gallery/${itemToDelete._id}`);
      setMessage('Item deleted successfully');
      fetchMedia(); // Refresh the gallery
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage('Failed to delete item');
    }
  };

  // Bulk delete functions
  const openBulkDeleteModal = () => {
    setShowBulkDeleteModal(true);
  };

  const closeBulkDeleteModal = () => {
    setShowBulkDeleteModal(false);
  };

  const confirmBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    setIsDeleting(true);
    try {
      // Delete all selected items
      await Promise.all(
        Array.from(selectedItems).map(itemId => 
          axios.delete(`${API_BASE_URL}/api/v1/gallery/${itemId}`)
        )
      );
      
      setMessage(`Successfully deleted ${selectedItems.size} items`);
      setSelectedItems(new Set());
      fetchMedia(); // Refresh the gallery
      closeBulkDeleteModal();
    } catch (error) {
      console.error('Error deleting items:', error);
      setMessage('Failed to delete some items');
    } finally {
      setIsDeleting(false);
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

  // Delete Icon Component
  const DeleteIcon = () => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="feather feather-trash-2"
    >
      <polyline points="3,6 5,6 21,6"></polyline>
      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gallery Admin Panel</h1>
      
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mb-8 p-6 bg-gray-100 rounded-lg">
        <div className="mb-4">
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
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 cursor-pointer disabled:bg-blue-300"
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gallery Items</h2>
          
          {/* Bulk Actions */}
          {media.length > 0 && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectedItems.size === media.length && media.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                  Select All ({selectedItems.size}/{media.length})
                </label>
              </div>
              
              {selectedItems.size > 0 && (
                <button
                  onClick={openBulkDeleteModal}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center space-x-2"
                >
                  <DeleteIcon />
                  <span>Delete Selected ({selectedItems.size})</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {media.length === 0 ? (
          <p className="text-gray-500">No items in the gallery yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div key={item._id} className="border rounded-lg overflow-hidden group relative">
                {/* Selection Checkbox - Top Left */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item._id)}
                    onChange={() => handleItemSelection(item._id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-white"
                  />
                </div>

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
                
                <div className="p-3 relative">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate pr-8">{item.title}</h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {item.size ? formatFileSize(item.size) : ""}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Delete Button - Fixed at Bottom Right */}
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="absolute bottom-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    title="Delete item"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Single Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedItems.size} selected items? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeBulkDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGalleryPanel;


// // AdminGalleryPanel.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import API_BASE_URL from "../../config"
// const AdminGalleryPanel = () => {
//   const [media, setMedia] = useState([]);
//   const [title, setTitle] = useState('');
//   const [files, setFiles] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [showProgress, setShowProgress] = useState(false);
//   const [totalSize, setTotalSize] = useState(0);

//   useEffect(() => {
//     fetchMedia();
//   }, []);

//   // Calculate total file size when files change
//   useEffect(() => {
//     if (files.length > 0) {
//       const size = files.reduce((total, file) => total + file.size, 0);
//       setTotalSize(size);
//     } else {
//       setTotalSize(0);
//     }
//   }, [files]);

//   const fetchMedia = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/api/v1/gallery/`);
//       setMedia(response.data);
//     } catch (error) {
//       console.error('Error fetching media:', error);
//       setMessage('Failed to load gallery items');
//     }
//   };

//   const handleFileChange = (e) => {
//     setFiles(Array.from(e.target.files));
//   };

//   const handleTitleChange = (e) => {
//     setTitle(e.target.value);
//   };

//   // Format file size to be human readable
//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
    
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(1024));
//     return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (files.length === 0) {
//       setMessage('Please select at least one file');
//       return;
//     }

//     if (!title.trim()) {
//       setMessage('Please enter a title');
//       return;
//     }

//     setIsUploading(true);
//     setMessage('Uploading...');
//     setUploadProgress(0);
//     setShowProgress(true);

//     try {
//       // Create FormData for file upload
//       const formData = new FormData();
//       files.forEach(file => {
//         formData.append('files', file);
//       });
//       formData.append('title', title);

//       await axios.post(`${API_BASE_URL}/api/v1/gallery/upload`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         },
//         onUploadProgress: (progressEvent) => {
//           // Calculate and update progress percentage
//           const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//           setUploadProgress(percentCompleted);
//         }
//       });

//       setMessage('Upload successful!');
//       setTitle('');
//       setFiles([]);
//       // Keep progress bar visible for a moment to show completion
//       setTimeout(() => {
//         setShowProgress(false);
//       }, 1500);
//       fetchMedia(); // Refresh the gallery
//     } catch (error) {
//       console.error('Error uploading files:', error);
//       setMessage('Upload failed. Please try again.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this item?')) return;

//     try {
//       await axios.delete(`${API_BASE_URL}/api/v1/gallery/${id}`);
//       setMessage('Item deleted successfully');
//       fetchMedia(); // Refresh the gallery
//     } catch (error) {
//       console.error('Error deleting item:', error);
//       setMessage('Failed to delete item');
//     }
//   };

//   // Format upload time remaining (approximate calculation)
//   const formatTimeRemaining = () => {
//     if (uploadProgress >= 100) return 'Complete';
//     if (uploadProgress <= 0) return 'Calculating...';
    
//     // Rough estimation
//     const remainingPercentage = 100 - uploadProgress;
//     const secondsRemaining = Math.ceil(remainingPercentage / 10); // Simple approximation
    
//     if (secondsRemaining <= 0) return 'Complete';
//     if (secondsRemaining < 60) return `${secondsRemaining} seconds remaining`;
//     return `${Math.ceil(secondsRemaining / 60)} minutes remaining`;
//   };

//   return (
//     <div className=" p-6">
//       <h1 className="text-2xl font-bold mb-6">Gallery Admin Panel</h1>
      
//       {/* Upload Form */}
//       <form onSubmit={handleSubmit} className="max-w-4xl mb-8 p-6 bg-gray-100 rounded-lg">
//         <div className=" mb-4 ">
//           <label htmlFor="title" className="block text-sm font-medium mb-1">
//             Title (will be applied to all selected files)
//           </label>
//           <input
//             type="text"
//             id="title"
//             value={title}
//             onChange={handleTitleChange}
//             className="w-full p-2 border rounded"
//             required
//           />
//         </div>
        
//         <div className="mb-4">
//           <label htmlFor="files" className="block text-sm font-medium mb-1">
//             Select Images/Videos
//           </label>
//           <input
//             type="file"
//             id="files"
//             multiple
//             accept="image/*,video/*"
//             onChange={handleFileChange}
//             className="w-full p-2 border rounded"
//             required
//           />
//           <p className="text-sm text-gray-500 mt-1">
//             You can select multiple files
//           </p>
//         </div>
        
//         {files.length > 0 && (
//           <div className="mb-4">
//             <p className="text-sm font-medium mb-1">
//               Selected files: <span className="text-blue-600">{formatFileSize(totalSize)} total</span>
//             </p>
//             <ul className="text-sm text-gray-600">
//               {files.map((file, index) => (
//                 <li key={index} className="flex justify-between">
//                   <span>{file.name}</span>
//                   <span className="text-gray-500">{formatFileSize(file.size)}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}
        
//         {/* Upload Progress Bar */}
//         {showProgress && (
//           <div className="mb-4">
//             <div className="flex justify-between text-sm text-gray-600 mb-1">
//               <span>Upload Progress: {uploadProgress}%</span>
//               <span>{formatTimeRemaining()}</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div 
//                 className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//           </div>
//         )}
        
//         <button
//           type="submit"
//           disabled={isUploading}
//           className="px-4 py-2 bg-black text-white rounded hover:bg-gray-700 disabled:bg-blue-300"
//         >
//           {isUploading ? 'Uploading...' : 'Upload'}
//         </button>
        
//         {message && (
//           <div className="mt-3 text-sm font-medium text-red-600">
//             {message}
//           </div>
//         )}
//       </form>
      
//       {/* Gallery Preview */}
//       <div>
//         <h2 className="text-xl font-bold mb-4">Gallery Items</h2>
        
//         {media.length === 0 ? (
//           <p className="text-gray-500">No items in the gallery yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             {media.map((item) => (
//               <div key={item._id} className="border rounded-lg overflow-hidden">
//                 {item.mediaType.startsWith('image') ? (
//                   <img
//                     src={item.url}
//                     alt={item.title}
//                     className="w-full h-48 object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={item.url}
//                     className="w-full h-48 object-cover"
//                     controls
//                   />
//                 )}
//                 <div className="p-3">
//                   <div className="flex justify-between items-center">
//                     <h3 className="font-medium truncate">{item.title}</h3>
//                     <span className="text-xs text-gray-500 ml-2">
//                       {item.size ? formatFileSize(item.size) : ""}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center mt-2">
//                     <span className="text-xs text-gray-500">
//                       {new Date(item.createdAt).toLocaleDateString()}
//                     </span>
//                     <button
//                       onClick={() => handleDelete(item._id)}
//                       className="text-red-600 hover:text-red-800 text-sm"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminGalleryPanel;



