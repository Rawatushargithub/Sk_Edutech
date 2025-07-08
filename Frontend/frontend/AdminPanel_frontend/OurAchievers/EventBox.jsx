import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../config"

const EventBox = () => {
  // State for storing image data
  const [sliderImages, setSliderImages] = useState([]); // Images from database
  const [pendingImages, setPendingImages] = useState([]); // Temporarily selected images
  const [temporaryServerImages, setTemporaryServerImages] = useState([]); // Images uploaded to server but not yet to Cloudinary
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load existing images on component mount
  useEffect(() => {
    fetchImagesFromDatabase();
    
    // Cleanup function to remove any temporary files when component unmounts
    return () => {
      if (temporaryServerImages.length > 0) {
        cleanupTemporaryFiles();
      }
    };
  }, []);

  // Fetch images from database
  const fetchImagesFromDatabase = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/eventBoxImages/`);
      setSliderImages(response.data);
    } catch (error) {
      console.error('Error fetching images from database:', error);
      setErrorMessage('Failed to load existing images. Please refresh the page.');
    }
  };

  // Cleanup temporary files on the server
  const cleanupTemporaryFiles = async () => {
    if (temporaryServerImages.length === 0) return;
    
    try {
      await axios.post(`${API_BASE_URL}/api/v1/eventBoxImages/cleanup-temp`, {
        tempImages: temporaryServerImages
      });
      setTemporaryServerImages([]);
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }
  };

  // Handle file input change - store files and upload to server temp storage
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the 10 image limit
    if (sliderImages.length + pendingImages.length + files.length > 10) {
      setErrorMessage('You can only upload up to 10 images in total.');
      return;
    }
    
    setErrorMessage('');
    setUploading(true);
    
    try {
      // Process each file to display preview first
      const newPendingImages = files.map(file => {
        const reader = new FileReader();
        const fileId = Date.now() + Math.random().toString(36).substring(2, 15);
        
        reader.onload = (e) => {
          setPendingImages(prevImages => 
            prevImages.map(img => 
              img.id === fileId 
                ? { ...img, url: e.target.result } 
                : img
            )
          );
        };
        
        reader.readAsDataURL(file);
        
        return {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          order: sliderImages.length + pendingImages.length,
          url: '' // Will be populated when FileReader completes
        };
      });

      setPendingImages(prev => [...prev, ...newPendingImages]);
      
      // Upload to server temporary storage
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/v1/eventBoxImages/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Store temporary file paths returned from server
      setTemporaryServerImages(prev => [...prev, ...response.data.tempImages]);
      
      setSuccessMessage('Images selected. Click "Publish Slider" to upload.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error processing images:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to select images. Please try again.');
    }
    
    setUploading(false);
  };

  // Handle image deletion - for pending images
  const handleDeletePendingImage = (id) => {
    // Find the pending image index
    const pendingIndex = pendingImages.findIndex(image => image.id === id);
    
    if (pendingIndex !== -1) {
      // Remove corresponding temporary server image
      const updatedTempServerImages = [...temporaryServerImages];
      if (updatedTempServerImages[pendingIndex]) {
        // Delete just this specific temporary file
        axios.post(`${API_BASE_URL}/api/v1/eventBoxImages/cleanup-temp`, {
          tempImages: [updatedTempServerImages[pendingIndex]]
        }).catch(error => {
          console.error('Error cleaning up temporary file:', error);
        });
        
        // Remove from temporary server images array
        updatedTempServerImages.splice(pendingIndex, 1);
        setTemporaryServerImages(updatedTempServerImages);
      }
      
      // Remove from pending images
      setPendingImages(pendingImages.filter(image => image.id !== id));
    }
  };

  // Handle image deletion - for uploaded images
  const handleDeleteImage = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/eventBoxImages/${id}`);
      
      // Fetch updated images after deletion
      await fetchImagesFromDatabase();
      closeDeleteModal();
      setSuccessMessage('Image deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error deleting image:', error);
      setErrorMessage('Failed to delete image. Please try again.');
    }
  };

  
   // Single delete functions
  const openDeleteModal = (item) => {
    setLoading(false);
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      
      handleDeleteImage(itemToDelete);
      
    } catch (error) {
      console.error("Error deleting item:", error);
      setMessage("Failed to delete item");
    }
  };


  // Handle reordering of images
  const handleReorder = async (id, direction, isPending) => {
    if (isPending) {
      // Reorder pending images locally
      const currentIndex = pendingImages.findIndex(image => image.id === id);
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === pendingImages.length - 1)
      ) {
        return; // Already at top or bottom
      }
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Also reorder temporaryServerImages to match
      if (temporaryServerImages.length > 0) {
        const updatedTempServerImages = [...temporaryServerImages];
        const tempImg = updatedTempServerImages[currentIndex];
        updatedTempServerImages[currentIndex] = updatedTempServerImages[newIndex];
        updatedTempServerImages[newIndex] = tempImg;
        setTemporaryServerImages(updatedTempServerImages);
      }
      
      // Reorder pending images
      const reorderedImages = [...pendingImages];
      const temp = reorderedImages[currentIndex];
      reorderedImages[currentIndex] = reorderedImages[newIndex];
      reorderedImages[newIndex] = temp;
      
      setPendingImages(reorderedImages);
    } else {
      // Reorder uploaded images via API
      try {
        await axios.put(`${API_BASE_URL}/api/v1/eventBoxImages/reorder`, {
          imageId: id,
          direction: direction
        });
        
        // Fetch updated images after reordering
        await fetchImagesFromDatabase();
      } catch (error) {
        console.error('Error reordering images:', error);
        setErrorMessage('Failed to change image order. Please try again.');
      }
    }
  };
  
  // Function to handle publishing all images to Cloudinary and database
  const handleSaveToCloudinary = async () => {
    if (temporaryServerImages.length === 0 && sliderImages.length === 0) return;
    
    setUploading(true);
    setErrorMessage('');
    
    try {
      // If there are pending images, publish them with upload
      if (temporaryServerImages.length > 0) {
        const response = await axios.post(`${API_BASE_URL}/api/v1/eventBoxImages/publish-with-upload`, {
          tempImages: temporaryServerImages
        });
        
        // Clear pending images after successful upload
        setPendingImages([]);
        setTemporaryServerImages([]);
        
        // Update slider images from response
        setSliderImages(response.data.allImages);
      } else {
        // Just publish existing images
        await axios.put(`${API_BASE_URL}/api/v1/eventBoxImages/publish`);
        
        // Refresh the list of images
        await fetchImagesFromDatabase();
      }
      
      setUploading(false);
      setSuccessMessage('All images have been published to the EventBox slider!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error publishing images:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to publish images. Please try again.');
      setUploading(false);
    }
  };

  // Calculate total file size of all images
  const totalSize = [...sliderImages, ...pendingImages].reduce((acc, image) => acc + (image.size || 0), 0);
  const formattedSize = totalSize > 1024 * 1024 
    ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB` 
    : `${(totalSize / 1024).toFixed(2)} KB`;

  // Combine both arrays for display
  const allImages = [...sliderImages, ...pendingImages];

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl ">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Event Box Images</h1>
            <p className="text-blue-100 mt-1">Upload and manage your EventBox images (maximum 10)</p>
          </div>
          
          {/* Upload Section */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Upload Slider Images</h2>
                <p className="text-sm text-gray-500 mt-1">
                  You can upload up to {10 - allImages.length} more image{10 - allImages.length !== 1 ? 's' : ''}
                </p>
                {pendingImages.length > 0 && (
                  <p className="text-sm text-orange-500 mt-1">
                    You have {pendingImages.length} pending image{pendingImages.length !== 1 ? 's' : ''} to publish
                  </p>
                )}
              </div>
              
              <div className="mt-4 sm:mt-0">
                <label className="inline-flex items-center px-4 py-2 bg-blue-950 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-900 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150 cursor-pointer">
                  Select Images
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload} 
                    className="hidden"
                    disabled={allImages.length >= 10 || uploading}
                  />
                </label>
              </div>
            </div>
            
            {/* Status Messages */}
            {errorMessage && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Images List */}
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Current Slider Images ({allImages.length}/10)</h2>
              <div className="text-sm text-gray-500">Total size: {formattedSize}</div>
            </div>
            
            {allImages.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-500">No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Database Images */}
                {sliderImages.map((image, index) => (
                  <div key={image._id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
                      <img 
                        src={image.url} 
                        alt={`Slider ${index + 1}`} 
                        className="object-cover w-full h-48"
                      />
                      <div className="absolute top-2 left-2 bg-blue-700 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="text-sm text-gray-500 truncate" title={image.name}>{image.name}</div>
                      <div className="text-xs text-gray-400">
                        {image.size ? ((image.size / 1024).toFixed(2) + ' KB') : ''}
                      </div>
                      
                      <div className="flex justify-between mt-3">
                        <div className="space-x-1">
                          <button
                            onClick={() => handleReorder(image._id, 'up', false)}
                            disabled={index === 0}
                            className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="Move up"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleReorder(image._id, 'down', false)}
                            disabled={index === sliderImages.length - 1}
                            className={`p-1 rounded ${index === sliderImages.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="Move down"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => openDeleteModal(image._id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pending Images */}
                {pendingImages.map((image, index) => (
                  <div key={image.id} className="border rounded-lg overflow-hidden bg-white shadow-sm border-orange-300">
                    <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
                      <img 
                        src={image.url} 
                        alt={`Pending ${index + 1}`} 
                        className="object-cover w-full h-48"
                      />
                      <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        Pending {index + 1}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="text-sm text-gray-500 truncate" title={image.name}>{image.name}</div>
                      <div className="text-xs text-gray-400">
                        {(image.size / 1024).toFixed(2)} KB
                      </div>
                      
                      <div className="flex justify-between mt-3">
                        <div className="space-x-1">
                          <button
                            onClick={() => handleReorder(image.id, 'up', true)}
                            disabled={index === 0}
                            className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="Move up"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => handleReorder(image.id, 'down', true)}
                            disabled={index === pendingImages.length - 1}
                            className={`p-1 rounded ${index === pendingImages.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                            title="Move down"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleDeletePendingImage(image.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={handleSaveToCloudinary}
              disabled={allImages.length === 0 || uploading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                allImages.length === 0 || uploading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : pendingImages.length > 0 
                    ? 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : pendingImages.length > 0 ? (
                'Upload'
              ) : (
                'Update Slider'
              )}
            </button>
          </div>
          {/* Single Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete ? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:text-red-600 cursor-pointer hover:bg-gray-100"
              >
                {loading ? "Deleting..." : "Delete"}
                
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
        
        
      </div>
    </div>
  );
};

export default EventBox;

