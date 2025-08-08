import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, Mail } from 'lucide-react';
import { deleteFranchise, updateFranchiseStatusVerification, resendCredentials } from '../../services/franchiseService'; // Added resendCredentials
// VerificationModal is not needed for resend credentials, but keeping if view details is still desired elsewhere.
// For this specific request, the eye icon becomes "resend credentials".

// Helper function to format date (optional)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', { // 'en-IN' for India locale
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'Invalid Date';
    }
};

function FranchiseTable({ franchises = [], onActionComplete }) { // Added onActionComplete prop
    const navigate = useNavigate();
    const [processingId, setProcessingId] = useState(null); // For delete/toggle status/resend loading

    if (!franchises || franchises.length === 0) {
        return <p className="text-center text-gray-500 mt-6 text-base">No franchises found.</p>;
    }

    const handleEdit = (franchiseId) => {
        navigate(`/admin/franchises/edit/${franchiseId}`);
    };

    const handleDelete = async (franchiseId, franchiseName) => {
        if (window.confirm(`Are you sure you want to delete franchise "${franchiseName}"? This action cannot be undone.`)) {
            setProcessingId(franchiseId);
            try {
                await deleteFranchise(franchiseId);
                toast.success(`Franchise "${franchiseName}" deleted successfully.`);
                if (onActionComplete) onActionComplete();
            } catch (error) {
                toast.error(error.message || `Failed to delete franchise "${franchiseName}".`);
            } finally {
                setProcessingId(null);
            }
        }
    };

    // const handleView = (franchise) => { // Replaced by handleResendCredentials
    //     setFranchiseToView(franchise);
    //     setIsViewModalOpen(true);
    // };

    const handleResendCredentialsAction = async (franchise) => {
        if (window.confirm(`Are you sure you want to resend credentials (a new password will be generated) for "${franchise.franchiseName}" to ${franchise.email}?`)) {
            setProcessingId(franchise._id);
            try {
                const response = await resendCredentials(franchise._id);
                toast.success(response.message || `Credentials resent successfully for ${franchise.franchiseName}.`);
                // No list refresh needed here as data doesn't change in the table itself
            } catch (error) {
                toast.error(error.message || `Failed to resend credentials for ${franchise.franchiseName}.`);
            } finally {
                setProcessingId(null);
            }
        }
    };

    // const handleToggleStatus = async (franchise) => { // REMOVED
    //     const newStatus = franchise.status === 'Active' ? 'Inactive' : 'Active';
    //     const action = newStatus === 'Active' ? 'activate' : 'deactivate';
    //     if (window.confirm(`Are you sure you want to ${action} franchise "${franchise.franchiseName}"?`)) {
    //         setProcessingId(franchise._id);
    //         try {
    //             await updateFranchiseStatusVerification(franchise._id, { status: newStatus });
    //             toast.success(`Franchise "${franchise.franchiseName}" ${action}d successfully.`);
    //             if (onActionComplete) onActionComplete();
    //         } catch (error) {
    //             toast.error(error.message || `Failed to ${action} franchise.`);
    //         } finally {
    //             setProcessingId(null);
    //         }
    //     }
    // };


    // Define columns based on the image and requirements - UPDATED
    const columns = [
        { header: 'Sr.', accessor: (_, index) => index + 1, width: 'w-12' },
        { header: 'Action', accessor: 'actions', width: 'w-24' }, // Adjusted width
        { header: 'Owner Photo', accessor: 'ownerPhotoUrl', width: 'w-20' },
        { header: 'Franchise ID', accessor: 'franchiseId', width: 'w-28' },
        { header: 'Institute Name', accessor: 'franchiseName', width: 'w-auto' },
        { header: 'Mobile', accessor: 'mobile', width: 'w-32' },
        { header: 'No Of Student', accessor: 'totalStudents', width: 'w-24' },
        { header: 'State', accessor: 'state', width: 'w-32' },
        { header: 'City', accessor: 'city', width: 'w-32' },
        { header: 'ATC Code', accessor: 'atcCode', width: 'w-24' },
        // { header: 'Status', accessor: 'status', width: 'w-24'}, // REMOVED Status column
        { header: 'Expiry Date', accessor: 'expireDate', width: 'w-32' },
        { header: 'Status', accessor: 'status', width: 'w-32' },
    ];

    // Helper function to render cell content based on column accessor
    // Moved inside component to access navigate, handleDelete etc.
    const renderCellContent = (column, franchise, index) => {
        const value = typeof column.accessor === 'function' ? column.accessor(franchise, index) : franchise[column.accessor];

        switch (column.header) {
            case 'Action':
                return (
                    <div className="flex space-x-2">
                        <button onClick={() => handleEdit(franchise._id)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(franchise._id, franchise.franchiseName)} className="text-red-500 hover:text-red-700 p-1" title="Delete" disabled={processingId === franchise._id}>
                            {processingId === franchise._id && column.header === 'Action' && processingId === franchise._id ? '...' : <TrashIcon className="h-5 w-5" />}
                        </button>
                        {/* Changed eye icon to resend credentials */}
                        <button onClick={() => handleResendCredentialsAction(franchise)} className="text-purple-600 hover:text-purple-800 p-1" title="Resend Credentials" disabled={processingId === franchise._id}>
                            {processingId === franchise._id && column.header === 'Action' && processingId === franchise._id ? '...' : <Mail className="h-5 w-5" />}
                        </button>
                        {/* <button onClick={() => handleToggleStatus(franchise)} // REMOVED
                                className={`p-1 ${franchise.status === 'Active' ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                                title={franchise.status === 'Active' ? 'Deactivate (Hide)' : 'Activate (Show)'}
                                disabled={processingId === franchise._id}>
                             {processingId === franchise._id && column.header === 'Action' && processingId === franchise._id ? '...' : (franchise.status === 'Active' ? '🟢' : '⚪')}
                        </button> */}
                    </div>
                );
            case 'Owner Photo':
                return value ? <img src={value} alt="Owner" className="h-10 w-10 object-contain rounded" /> : 'No Photo';
            // case 'Status': // REMOVED
            //      return <span className={`font-medium ${value === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{value}</span>;
            case 'Expiry Date':
            case 'Registered Date':
                return formatDate(value);
            case 'No Of Student':
                return value !== undefined ? value : 'N/A';
            case 'Status':
                return (
                    <span className={`font-semibold ${value === 'Active' ? 'text-green-600' : value === 'Inactive' ? 'text-red-600' : 'text-gray-500'}`}>
                        {value}
                    </span>
                );
            default:
                return value !== null && value !== undefined ? String(value) : 'N/A';
        }
    };


    return (
        <>
            <div className="overflow-x-auto shadow-md sm:rounded-lg mt-4 border border-gray-200">
                <table className="w-full text-base text-left text-gray-700">
                    <thead className="text-sm text-gray-100 uppercase bg-black">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.header} scope="col" className={`px-5 py-3 whitespace-nowrap tracking-wider font-semibold ${col.width || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {franchises.map((franchise, index) => (
                            <tr key={franchise._id || index} className="bg-white border-b hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td key={`${col.header}-${franchise._id || index}`} className="px-5 py-4 whitespace-nowrap">
                                        {renderCellContent(col, franchise, index)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* VerificationModal is no longer used by the eye icon in this table */}
            {/* <VerificationModal
                isOpen={isViewModalOpen}
                franchise={franchiseToView}
                onConfirm={() => setIsViewModalOpen(false)}
                onCancel={() => setIsViewModalOpen(false)}
                isVerifying={false}
            /> */}
        </>
    );
}

export default FranchiseTable;
