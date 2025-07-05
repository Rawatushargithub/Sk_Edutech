import React, { useState, useEffect } from 'react';
import API_BASE_URL from "../../config"
import axios from 'axios';
import { Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

const MarqueeManager = () => {
  const [marquees, setMarquees] = useState([]);
  const [formData, setFormData] = useState({
    text: '',
    position: 'top',
    isActive: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteText, setDeleteText] = useState('');
  
  useEffect(() => {
    fetchMarquees();
  }, []);
  
  const fetchMarquees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/v1/marquee/`);
      setMarquees(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch marquees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editMode) {
        await axios.put(`${API_BASE_URL}/api/v1/marquee/${currentId}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/api/v1/marquee/`, formData);
      }
      
      // Reset form
      setFormData({ text: '', position: 'top', isActive: false });
      setEditMode(false);
      setCurrentId(null);
      
      // Refresh marquee list
      fetchMarquees();
      setError(null);
    } catch (err) {
      setError('Failed to save marquee');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = marquee => {
    setFormData({
      text: marquee.text,
      position: marquee.position,
      isActive: marquee.isActive
    });
    setCurrentId(marquee._id);
    setEditMode(true);
  };
  
  const handleDeleteClick = (id, text) => {
    setDeleteId(id);
    setDeleteText(text);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/marquee/${deleteId}`);
      fetchMarquees();
      setError(null);
    } catch (err) {
      setError('Failed to delete marquee');
      console.error(err);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteText('');
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
    setDeleteText('');
  };
  
  const handleCancel = () => {
    setFormData({ text: '', position: 'top', isActive: false });
    setEditMode(false);
    setCurrentId(null);
  };
  
  const handleToggleActive = async (marquee) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/v1/marquee/${marquee._id}`, {
        ...marquee,
        isActive: !marquee.isActive
      });
      fetchMarquees();
      setError(null);
    } catch (err) {
      setError('Failed to update marquee status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Marquee Manager</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text">
            Marquee Text
          </label>
          <input
            type="text"
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter marquee text..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
            Position
          </label>
          <select
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700 text-sm font-bold">Active</span>
          </label>
          <p className="text-gray-600 text-xs italic mt-1">
            Only one marquee can be active per position.
          </p>
        </div>
        
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black hover:cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {loading ? 'Processing...' : editMode ? 'Update Marquee' : 'Add Marquee'}
          </button>
          
          {editMode && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Marquee List</h3>
        
        {loading && <p>Loading...</p>}
        
        {marquees.length === 0 && !loading ? (
          <p className="text-gray-600">No marquees found. Add your first marquee above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Text
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {marquees.map(marquee => (
                  <tr key={marquee._id}>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <div className="truncate max-w-xs">{marquee.text}</div>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 capitalize">
                      {marquee.position}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          marquee.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {marquee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(marquee)}
                          className={`p-1 rounded hover:bg-gray-100 cursor-pointer transition-colors ${
                            marquee.isActive
                              ? 'text-yellow-600 hover:text-yellow-700'
                              : 'text-green-600 hover:text-green-700'
                          }`}
                          title={marquee.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {marquee.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(marquee)}
                          className="p-1 rounded text-blue-600 hover:text-blue-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(marquee._id, marquee.text)}
                          className="p-1 rounded text-red-600 hover:text-red-700 cursor-pointer hover:bg-gray-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Marquee</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this marquee?
            </p>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-600 font-medium">"{deleteText}"</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarqueeManager;


// import React, { useState, useEffect } from 'react';
// import API_BASE_URL from "../../config"
// import axios from 'axios';
// // Mock API_BASE_URL for d

// const MarqueeManager = () => {
//   const [marquees, setMarquees] = useState([]);
//   const [formData, setFormData] = useState({
//     text: '',
//     position: 'top',
//     isActive: false
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [currentId, setCurrentId] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);
//   const [deleteText, setDeleteText] = useState('');
  
//   useEffect(() => {
//     fetchMarquees();
//   }, []);
  
//   const fetchMarquees = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/v1/marquee/`);
//       setMarquees(res.data);
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch marquees');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleChange = e => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };
  
//   const handleSubmit = async e => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       if (editMode) {
//         await axios.put(`${API_BASE_URL}/api/v1/marquee/${currentId}`, formData);
//       } else {
//         await axios.post(`${API_BASE_URL}/api/v1/marquee/`, formData);
//       }
      
//       // Reset form
//       setFormData({ text: '', position: 'top', isActive: false });
//       setEditMode(false);
//       setCurrentId(null);
      
//       // Refresh marquee list
//       fetchMarquees();
//       setError(null);
//     } catch (err) {
//       setError('Failed to save marquee');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleEdit = marquee => {
//     setFormData({
//       text: marquee.text,
//       position: marquee.position,
//       isActive: marquee.isActive
//     });
//     setCurrentId(marquee._id);
//     setEditMode(true);
//   };
  
//   const handleDeleteClick = (id, text) => {
//     setDeleteId(id);
//     setDeleteText(text);
//     setShowDeleteModal(true);
//   };
  
//   const handleDeleteConfirm = async () => {
//     setLoading(true);
//     try {
//       await axios.delete(`${API_BASE_URL}/api/v1/marquee/${deleteId}`);
//       fetchMarquees();
//       setError(null);
//     } catch (err) {
//       setError('Failed to delete marquee');
//       console.error(err);
//     } finally {
//       setLoading(false);
//       setShowDeleteModal(false);
//       setDeleteId(null);
//       setDeleteText('');
//     }
//   };
  
//   const handleDeleteCancel = () => {
//     setShowDeleteModal(false);
//     setDeleteId(null);
//     setDeleteText('');
//   };
  
//   const handleCancel = () => {
//     setFormData({ text: '', position: 'top', isActive: false });
//     setEditMode(false);
//     setCurrentId(null);
//   };
  
//   const handleToggleActive = async (marquee) => {
//     setLoading(true);
//     try {
//       await axios.put(`${API_BASE_URL}/api/v1/marquee/${marquee._id}`, {
//         ...marquee,
//         isActive: !marquee.isActive
//       });
//       fetchMarquees();
//       setError(null);
//     } catch (err) {
//       setError('Failed to update marquee status');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-2xl font-bold mb-6">Marquee Manager</h2>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit} className="mb-8">
//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text">
//             Marquee Text
//           </label>
//           <input
//             type="text"
//             id="text"
//             name="text"
//             value={formData.text}
//             onChange={handleChange}
//             required
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//             placeholder="Enter marquee text..."
//           />
//         </div>
        
//         <div className="mb-4">
//           <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
//             Position
//           </label>
//           <select
//             id="position"
//             name="position"
//             value={formData.position}
//             onChange={handleChange}
//             className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//           >
//             <option value="top">Top</option>
//             <option value="bottom">Bottom</option>
//           </select>
//         </div>
        
//         <div className="mb-6">
//           <label className="flex items-center">
//             <input
//               type="checkbox"
//               name="isActive"
//               checked={formData.isActive}
//               onChange={handleChange}
//               className="mr-2"
//             />
//             <span className="text-gray-700 text-sm font-bold">Active</span>
//           </label>
//           <p className="text-gray-600 text-xs italic mt-1">
//             Only one marquee can be active per position.
//           </p>
//         </div>
        
//         <div className="flex items-center">
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-black hover:cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//           >
//             {loading ? 'Processing...' : editMode ? 'Update Marquee' : 'Add Marquee'}
//           </button>
          
//           {editMode && (
//             <button
//               type="button"
//               onClick={handleCancel}
//               className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>
      
//       <div>
//         <h3 className="text-xl font-bold mb-4">Marquee List</h3>
        
//         {loading && <p>Loading...</p>}
        
//         {marquees.length === 0 && !loading ? (
//           <p className="text-gray-600">No marquees found. Add your first marquee above.</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white">
//               <thead>
//                 <tr>
//                   <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Text
//                   </th>
//                   <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Position
//                   </th>
//                   <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {marquees.map(marquee => (
//                   <tr key={marquee._id}>
//                     <td className="py-2 px-4 border-b border-gray-200">
//                       <div className="truncate max-w-xs">{marquee.text}</div>
//                     </td>
//                     <td className="py-2 px-4 border-b border-gray-200 capitalize">
//                       {marquee.position}
//                     </td>
//                     <td className="py-2 px-4 border-b border-gray-200">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           marquee.isActive
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-gray-100 text-gray-800'
//                         }`}
//                       >
//                         {marquee.isActive ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="py-2 px-4 border-b border-gray-200 ">
//                       <button
//                         onClick={() => handleToggleActive(marquee)}
//                         className={`text-xs mr-2 cursor-pointer ${
//                           marquee.isActive
//                             ? 'text-yellow-600 hover:text-yellow-900'
//                             : 'text-green-600 hover:text-green-900'
//                         }`}
//                       >
//                         {marquee.isActive ? 'Deactivate' : 'Activate'}
//                       </button>
//                       <button
//                         onClick={() => handleEdit(marquee)}
//                         className="text-blue-600 hover:text-blue-900 cursor-pointer mr-2 text-xs "
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDeleteClick(marquee._id, marquee.text)}
//                         className="text-red-600 hover:text-red-900 cursor-pointer text-xs"
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
      
//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Marquee</h3>
//             <p className="text-gray-700 mb-6">
//               Are you sure you want to delete this marquee?
//             </p>
//             <div className="bg-gray-50 p-3 rounded mb-4">
//               <p className="text-sm text-gray-600 font-medium">"{deleteText}"</p>
//             </div>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={handleDeleteCancel}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 disabled={loading}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
//               >
//                 {loading ? 'Deleting...' : 'Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MarqueeManager;
