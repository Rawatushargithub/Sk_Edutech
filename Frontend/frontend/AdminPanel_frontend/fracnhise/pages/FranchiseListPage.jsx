import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Import useCallback
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllActiveFranchises } from '../../services/franchiseService';
import FranchiseTable from '../Franchise/FranchiseTable';

function FranchiseListPage() {
    const [franchises, setFranchises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // Hook for navigation
    const [statusFilter, setStatusFilter] = useState('');

    // Define fetchFranchises using useCallback
    const fetchFranchises = useCallback(async () => {
        // This function should fetch ONLY Active & Verified franchises
        console.log("[FranchiseListPage] Fetching active & verified franchises...");
        try {
            setLoading(true);
            const response = await getAllActiveFranchises();
            console.log("[FranchiseListPage] API Response received:", response);
            if (response && response.statusCode === 200 && response.data) {
                setFranchises(response.data);
            } else {
                if (response && response.statusCode === 200 && Array.isArray(response.data) && response.data.length === 0) {
                    setFranchises([]);
                } else {
                    throw new Error(response?.message || "Failed to fetch active & verified franchises: Unexpected response structure.");
                }
            }
        } catch (err) {
            console.error("Error fetching active & verified franchises:", err.response || err.request || err);
            let displayError = "An error occurred while fetching active & verified franchises.";
            if (err.response) {
                displayError = `Server Error (${err.response.status}): ${err.response.data?.message || err.message}`;
            } else if (err.request) {
                displayError = "Could not connect to the server. Please check if it's running.";
            } else {
                displayError = err.message;
            }
            toast.error(displayError);
        } finally {
            console.log("[FranchiseListPage] Fetch finished.");
            setLoading(false);
        }
    }, []); // Empty dependency array as it doesn't depend on props/state from this component directly

    useEffect(() => {
        fetchFranchises();
    }, [fetchFranchises]); // Now fetchFranchises is a stable dependency

    // Filter franchises based on search term (client-side)
    const filteredFranchises = useMemo(() => {
  return franchises.filter(franchise => {
    const matchesSearch = !searchTerm || (
      franchise.franchiseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.franchiseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.atcCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      franchise.mobile?.includes(searchTerm)
    );

    const matchesStatus = !statusFilter || franchise.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [franchises, searchTerm, statusFilter]);


    // Handler for search input change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-6 gap-4"> {/* Added gap */}
                    <h1 className="text-3xl font-semibold text-black">Active Franchises</h1> {/* Updated Title */}
                    <div className="flex space-x-3"> {/* Group buttons */}
                        <Link
                            // onClick={() => navigate('/admin/franchises/requests')}
                            to="/admin/franchises/requests"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded text-base transition duration-300 ease-in-out"
                        >
                            See All Requests
                        </Link>
                        <Link
                            to="/admin/franchises/add"
                            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-5 rounded text-base transition duration-300 ease-in-out"
                        >
                            Add Franchise
                        </Link>
                    </div>
                </div>

                {/* Search remains */}
                <div className="flex justify-start items-center mb-4 gap-4">
                    {/* Search Input */}
                    <div className="w-full md:w-1/3">
                        <label htmlFor="search-franchise" className="sr-only">Search</label>
                        <input
                            type="text"
                            id="search-franchise"
                            placeholder="Search..."
                            className="border rounded px-3 py-1.5 text-base w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="w-full md:w-1/4">
                        <label htmlFor="status-filter" className="sr-only">Status</label>
                        <select
                            id="status-filter"
                            className="border rounded px-3 py-1.5 text-base w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>




                {/* Conditional Rendering based on state */}
                {loading && <p className="text-center text-gray-500 py-10 text-lg">Loading franchises...</p>}

                {/* Removed inline error display, using toasts now */}

                {!loading && (
                    <FranchiseTable franchises={filteredFranchises} onActionComplete={fetchFranchises} />
                )}

                <div className="flex justify-between items-center mt-6 text-base text-gray-600">
                    {/* Update showing entries info based on filtered results */}
                    {!loading && (
                        <span>
                            Showing {filteredFranchises.length > 0 ? 1 : 0} to {filteredFranchises.length} of {filteredFranchises.length} entries
                            {searchTerm && ` (filtered from ${franchises.length} total)`}
                        </span>
                    )}
                    <div className="space-x-2">
                        <button className="border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-100 text-gray-700 text-base">Previous</button>
                        <span className="bg-black text-white rounded px-4 py-1.5 text-base">1</span>
                        <button className="border border-gray-300 rounded px-4 py-1.5 hover:bg-gray-100 text-gray-700 text-base">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FranchiseListPage;
