import React, { useState, useEffect, useCallback } from 'react';
import { getFranchiseRequests, updateFranchiseStatusVerification } from '../../services/franchiseService';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import VerificationModal from './VerificationModal'; // Import the modal

const RequestStackTable = () => {
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null); // Tracks which row is being updated via API
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [franchiseToVerify, setFranchiseToVerify] = useState(null); // Franchise data for the modal
    const [isVerifying, setIsVerifying] = useState(false); // Tracks modal confirmation loading state

    const fetchFranchisesForStack = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getFranchiseRequests(); // Service function fetches non-active/verified
            if (response.statusCode === 200 && response.data) {
                setFranchises(response.data); // Update state
            } else {
                 // Handle cases where data might be empty but response is ok
                 if (response && response.statusCode === 200 && Array.isArray(response.data) && response.data.length === 0) {
                     setFranchises([]); // Set to empty array
                 } else {
                    throw new Error(response.message || "Failed to fetch franchise stack data");
                 }
            }
        } catch (err) {
            console.error("Error fetching franchise stack:", err);
            setError(err.message || "An error occurred while fetching franchise stack data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFranchisesForStack();
    }, [fetchFranchisesForStack]);

    // Function to handle opening the verification modal
    const openVerificationModal = (franchise) => {
        setFranchiseToVerify(franchise);
        setIsModalOpen(true);
    };

    // Function to handle closing the verification modal
    const closeVerificationModal = () => {
        if (isVerifying) return; // Prevent closing while API call is in progress
        setIsModalOpen(false);
        setFranchiseToVerify(null);
    };

    // Function called when "Confirm Verification" is clicked in the modal
    const handleConfirmVerification = async () => {
        if (!franchiseToVerify || isVerifying) return;

        setIsVerifying(true); // Show loading state in modal
        await handleUpdate(
            franchiseToVerify._id,
            franchiseToVerify.status,
            franchiseToVerify.verificationStatus,
            { verificationStatus: 'Verified' } // The specific update action
        );
        setIsVerifying(false); // Hide loading state
        closeVerificationModal(); // Close modal on success or failure (toast shows result)
    };


    // Generic update handler (used by buttons directly or by modal confirmation)
    const handleUpdate = async (franchiseId, currentStatus, currentVerification, updateData) => {
        // Skip if another update is already in progress for any row
        if (updatingId && updatingId !== franchiseId) {
             toast.warn("Please wait for the current update to complete.");
             return;
        }
        // Skip if this specific row is already being updated (relevant for direct button clicks)
        if (updatingId === franchiseId && !isVerifying) return;


        // Use the specific loading state depending on whether it's a modal action or direct button click
        const setLoadingState = isVerifying ? setIsVerifying : setUpdatingId;
        setLoadingState(franchiseId); // Mark this row/action as in progress
        setError(null);

        // Confirmation for actions other than modal verification (which has its own confirm button)
        if (!updateData.verificationStatus || updateData.verificationStatus !== 'Verified') {
            let confirmationMessage = `Are you sure you want to update this franchise?`;
             if (updateData.status === 'Active' && currentStatus !== 'Active') {
                confirmationMessage = `Are you sure you want to Activate this franchise? This may generate credentials if needed.`;
            } else if (updateData.status === 'Inactive' && currentStatus !== 'Inactive') {
                confirmationMessage = `Are you sure you want to set the status to Inactive?`;
            } else if (updateData.status === 'Rejected' && currentStatus !== 'Rejected') {
                confirmationMessage = `Are you sure you want to Reject this franchise application/status?`;
            } else if (updateData.verificationStatus === 'Rejected' && currentVerification !== 'Rejected') {
                confirmationMessage = `Are you sure you want to Reject the verification for this franchise?`;
            }

            if (!window.confirm(confirmationMessage)) {
                setLoadingState(null);
                return;
            }
        }


        try {
            const response = await updateFranchiseStatusVerification(franchiseId, updateData);
            if (response.statusCode === 200) {
                fetchFranchisesForStack(); // Refresh the list
                toast.success(`Franchise updated successfully!`);
            } else {
                throw new Error(response.message || "Failed to update status/verification");
            }
        } catch (err) {
            console.error(`Error updating franchise ${franchiseId}:`, err.response?.data || err.message || err);
            setError(err.message || `An error occurred while updating franchise ${franchiseId}.`);
            toast.error(`Error: ${err.message || 'Update failed.'}`);
        } finally {
             setLoadingState(null); // Clear loading state for this row/action
        }
    };

    // Helper to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'text-green-600';
            case 'Inactive': return 'text-gray-500';
            case 'Pending': return 'text-yellow-600';
            case 'Rejected': return 'text-red-600';
            default: return 'text-gray-700';
        }
    };

     // Helper to get verification status color
    const getVerificationColor = (status) => {
        switch (status) {
            case 'Verified': return 'text-green-600';
            case 'Pending': return 'text-yellow-600';
            case 'Rejected': return 'text-red-600';
            default: return 'text-gray-700';
        }
    };


    if (loading) {
        return <div className="text-center p-4">Loading franchise data...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-600">Error: {error} <button onClick={fetchFranchisesForStack} className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Retry</button></div>;
    }

    if (franchises.length === 0) {
        return (
            <div className="text-center p-4">
                <p className="text-gray-600 mb-4">No franchises found requiring action.</p>
                <Link 
                to="/admin/franchises" 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                    Back to Active Franchises List
                </Link>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto p-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Franchise Requests & Management</h2>
                <Link to="/admin/franchises" 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                    &larr; Back to Active List
                </Link>
            </div>
            <p className="text-sm text-gray-600 mb-4">
                This table shows franchises that are pending, rejected, inactive, or awaiting verification.
            </p>
            <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        {/* Adjust columns as needed */}
                        <th className="py-2 px-4 border-b text-left">Franchise Name</th>
                        <th className="py-2 px-4 border-b text-left">Owner Name</th>
                        <th className="py-2 px-4 border-b text-left">Email</th>
                        <th className="py-2 px-4 border-b text-left">Request Date</th>
                        <th className="py-2 px-4 border-b text-left">Status</th>
                        <th className="py-2 px-4 border-b text-left">Verification</th>
                        <th className="py-2 px-4 border-b text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {franchises.map((franchise) => (
                        <tr key={franchise._id} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{franchise.franchiseName}</td>
                            <td className="py-2 px-4 border-b">{franchise.ownerName}</td>
                            <td className="py-2 px-4 border-b">{franchise.email}</td>
                            <td className="py-2 px-4 border-b">
                                {franchise.requestDate ? format(new Date(franchise.requestDate), 'PP') : 'N/A'}
                            </td>
                            <td className={`py-2 px-4 border-b font-medium ${getStatusColor(franchise.status)}`}>{franchise.status}</td>
                            <td className={`py-2 px-4 border-b font-medium ${getVerificationColor(franchise.verificationStatus)}`}>{franchise.verificationStatus}</td>
                            <td className="py-2 px-4 border-b text-center space-x-1 space-y-1">
                                {/* Conditional Actions based on current status */}
                                {/* Status Actions */}
                                {franchise.status !== 'Active' && (
                                    <button
                                        onClick={() => handleUpdate(franchise._id, franchise.status, franchise.verificationStatus, { status: 'Active' })}
                                        disabled={updatingId === franchise._id}
                                        title="Set status to Active"
                                        className="px-2 py-1 text-xs rounded bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                                    >
                                        Activate
                                    </button>
                                )}
                                {franchise.status !== 'Inactive' && franchise.status !== 'Pending' && franchise.status !== 'Rejected' && ( // Can only make Active inactive
                                     <button
                                        onClick={() => handleUpdate(franchise._id, franchise.status, franchise.verificationStatus, { status: 'Inactive' })}
                                        disabled={updatingId === franchise._id}
                                        title="Set status to Inactive"
                                        className="px-2 py-1 text-xs rounded bg-gray-500 hover:bg-gray-600 text-white disabled:opacity-50"
                                    >
                                        Deactivate
                                    </button>
                                )}
                                {franchise.status !== 'Rejected' && (
                                    <button
                                        onClick={() => handleUpdate(franchise._id, franchise.status, franchise.verificationStatus, { status: 'Rejected' })}
                                        disabled={updatingId === franchise._id}
                                        title="Set status to Rejected"
                                        className="px-2 py-1 text-xs rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                                    >
                                        Reject Status
                                    </button>
                                )}
                                {/* Verification Actions - Open Modal for 'Verify' */}
                                {franchise.verificationStatus !== 'Verified' && (
                                    <button
                                        onClick={() => openVerificationModal(franchise)} // Open modal instead of direct update
                                        disabled={updatingId === franchise._id}
                                        title="Verify Franchise Details"
                                        className="px-2 py-1 text-xs rounded bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                                    >
                                        Verify
                                    </button>
                                )}
                                 {franchise.verificationStatus !== 'Rejected' && (
                                    <button
                                        // Reject verification directly (no modal needed?) or add modal if desired
                                        onClick={() => handleUpdate(franchise._id, franchise.status, franchise.verificationStatus, { verificationStatus: 'Rejected' })}
                                        disabled={updatingId === franchise._id}
                                        title="Set verification to Rejected"
                                        className="px-2 py-1 text-xs rounded bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                                    >
                                        Reject Verify
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

             {/* Render the Verification Modal */}
            <VerificationModal
                isOpen={isModalOpen}
                franchise={franchiseToVerify}
                onConfirm={handleConfirmVerification}
                onCancel={closeVerificationModal}
                isVerifying={isVerifying}
            />
        </div>
    );
};

export default RequestStackTable;
