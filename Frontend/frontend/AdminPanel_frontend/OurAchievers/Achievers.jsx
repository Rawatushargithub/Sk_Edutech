

import React, { useState, useEffect} from 'react';
import { Plus, Trash2, Save, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import  API_BASE_URL  from '../../config'; // Adjust the import based on your project structure

export default function StudentAchievementsPanel() {
  // Temporary entries that haven't been saved yet
  const [pendingEntries, setPendingEntries] = useState([
    { id: 1, rollNumber: '', achievementDetails: '' }
  ]);
  
  // Entries that have been saved to the database
  const [savedEntries, setSavedEntries] = useState([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);
  const [remainingSlots, setRemainingSlots] = useState(10);

  const API_URL = `${API_BASE_URL}/api/v1/achievers`;

  // Fetch saved achievements when component mounts
  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(API_URL);
      
      if (response.data && response.data.success) {
        setSavedEntries(response.data.achievements.map(achievement => ({
          id: achievement._id, // Use MongoDB ID
          rollNumber: achievement.rollNumber,
          achievementDetails: achievement.achievementDetails
        })));
        
        setRemainingSlots(response.data.remainingSlots);
        
        // If we've reached the limit, remove any pending entries
        if (response.data.remainingSlots === 0) {
          setPendingEntries([]);
        } else if (pendingEntries.length === 0) {
          // Add an empty pending entry if none exists and we have slots available
          setPendingEntries([{ id: Date.now(), rollNumber: '', achievementDetails: '' }]);
        }
      } else {
        setError('Failed to fetch achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Error connecting to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedEntries = [...pendingEntries];
    updatedEntries[index][field] = value;
    setPendingEntries(updatedEntries);
  };

  const addNewEntry = () => {
    // Check if we're still under the total limit of 10
    if (savedEntries.length + pendingEntries.length < 10) {
      setPendingEntries([
        ...pendingEntries,
        { id: Date.now(), rollNumber: '', achievementDetails: '' }
      ]);
    }
  };

  const deletePendingEntry = (index) => {
    const updatedEntries = [...pendingEntries];
    updatedEntries.splice(index, 1);
    setPendingEntries(updatedEntries);
  };

  const deleteSavedEntry = async (id, index) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      
      const updatedSavedEntries = [...savedEntries];
      updatedSavedEntries.splice(index, 1);
      setSavedEntries(updatedSavedEntries);
      
      // Update remaining slots
      setRemainingSlots(prevSlots => prevSlots + 1);
      
      // If we don't have any pending entries but have slots now, add one
      if (pendingEntries.length === 0) {
        setPendingEntries([{ id: Date.now(), rollNumber: '', achievementDetails: '' }]);
      }
      
      // Show success message
      setSaveStatus('deleted');
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setSaveStatus('error-api');
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const saveToDatabase = async () => {
    // Validate fields
    if (pendingEntries.some(entry => !entry.rollNumber || !entry.achievementDetails)) {
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
      return;
    }
    
    // Check if we're trying to add too many entries
    if (savedEntries.length + pendingEntries.length > 10) {
      setSaveStatus('error-limit');
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
      return;
    }
    
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Remove temporary IDs before sending to backend
      const dataToSubmit = pendingEntries.map(({ id, ...entryData }) => entryData);
      
      // Send POST request to backend API
      const response = await axios.post(API_URL, dataToSubmit);
      
      if (response.data && response.data.success) {
        // Refresh data from server to ensure we have the latest state
        await fetchAchievements();
        
        // Clear pending entries if we've reached the limit
        if (response.data.remainingSlots === 0) {
          setPendingEntries([]);
        } else {
          // Otherwise, add a single empty entry
          setPendingEntries([{ id: Date.now(), rollNumber: '', achievementDetails: '' }]);
        }
        
        setSaveStatus('success');
      } else {
        setSaveStatus('error-api');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      
      // Handle specific error for limit reached
      if (error.response && error.response.data && 
          error.response.data.message && 
          error.response.data.message.includes('Maximum limit')) {
        setSaveStatus('error-limit');
        // Refresh to get the latest state
        await fetchAchievements();
      } else {
        setSaveStatus('error-api');
      }
    } finally {
      setIsSaving(false);
      
      // Reset status message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const totalEntries = pendingEntries.length + savedEntries.length;
  const navigate = useNavigate();
  const EventBox=()=>{
      navigate('/admin/EventBox')
  }


  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Achievements</h1>
          <p className="text-gray-600 mt-2">Add and manage student achievements (maximum 10)</p>
        </header>
        <button 
        className='hover:cursor-pointer bg-black rounded-md text-white font-bold p-2 mb-4'
        onClick={EventBox}
        >
          Switch to Event Box</button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Student Achievers</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              totalEntries >= 10 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {totalEntries}/10 entries
            </span>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading achievements...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          ) : (
            <>
              {/* Saved entries section */} 
              {savedEntries.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                    <Check size={16} className="text-green-600 mr-2" />
                    Saved Entries ({savedEntries.length})
                  </h3>
                  <div className="space-y-4">
                    {savedEntries.map((entry, index) => (
                      <div key={entry.id} className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 border-l-4 border-l-green-500 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                            {entry.rollNumber}
                          </div>
                        </div>
                        <div className="flex-[2]">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Achievement</label>
                          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800">
                            {entry.achievementDetails}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => deleteSavedEntry(entry.id, index)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                            aria-label="Delete entry"
                            disabled={isSaving}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider if both sections present */}
              {savedEntries.length > 0 && pendingEntries.length > 0 && (
                <div className="border-b border-gray-200 my-6"></div>
              )}
              
              {/* Pending entries section */}
              {pendingEntries.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">New Entries ({pendingEntries.length})</h3>
                  <div className="space-y-4">
                    {pendingEntries.map((entry, index) => (
                      <div key={entry.id} className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                          <input
                            type="text"
                            value={entry.rollNumber}
                            onChange={(e) => handleInputChange(index, 'rollNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter student ID"
                          />
                        </div>
                        <div className="flex-[2]">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Achievement</label>
                          <input
                            type="text"
                            value={entry.achievementDetails}
                            onChange={(e) => handleInputChange(index, 'achievementDetails', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the achievement"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => deletePendingEntry(index)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                            aria-label="Delete entry"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {savedEntries.length === 10 && (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md mt-4">
                  You've reached the maximum limit of 10 achievements. Delete existing entries to add new ones.
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-4 justify-between">
                <button
                  onClick={addNewEntry}
                  disabled={totalEntries >= 10}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    totalEntries >= 10
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-50 text-black hover:bg-blue-100'
                  }`}
                >
                  <Plus size={18} />
                  Add Achiever
                </button>

                <button
                  onClick={saveToDatabase}
                  disabled={
                    isSaving || 
                    pendingEntries.length === 0 || 
                    pendingEntries.every(entry => !entry.rollNumber && !entry.achievementDetails) ||
                    savedEntries.length >= 10
                  }
                  className={`flex items-center gap-2 px-6 py-2 rounded-md transition-colors ${
                    isSaving || 
                    pendingEntries.length === 0 || 
                    pendingEntries.every(entry => !entry.rollNumber && !entry.achievementDetails) ||
                    savedEntries.length >= 10
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-950 hover:bg-blue-800 text-white'
                  }`}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}

          {saveStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md">
              Successfully saved student achievements to database!
            </div>
          )}
          {saveStatus === 'deleted' && (
            <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md">
              Successfully deleted entry from database!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
              Please fill out all fields before saving.
            </div>
          )}
          {saveStatus === 'error-api' && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
              Error connecting to the server. Please try again later.
            </div>
          )}
          {saveStatus === 'error-limit' && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
              Cannot exceed the maximum limit of 10 achievements.
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 mt-8">
          <p>Note: Once entries are saved, they cannot be edited. To modify an entry, delete it and create a new one.</p>
          <p className="mt-2">Changes will be reflected on the main page after saving.</p>
          <p className="mt-2">Maximum of 10 achievements can be stored in the database.</p>
        </div>
      </div>
    </div>
  );
}