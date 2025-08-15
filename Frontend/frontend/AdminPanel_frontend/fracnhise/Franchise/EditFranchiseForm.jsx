import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFranchiseById, updateFranchise, updateFranchiseStatusOnly } from '../../services/franchiseService';
import INDFlag from '/assets/india-flag-icon.png';

// Predefined data (can be shared or re-imported)
const designations = ['Teacher', 'Entrepreneur', 'Institute Owner'];
const plans = [
    { label: "90 days", value: 90 },
    { label: "180 days", value: 180 },
    { label: "365 days", value: 365 }
];
const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Helper function to format date for input type="date"
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

function EditFranchiseForm() {
    const { franchiseId } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, setError, formState: { errors, isDirty } } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [franchiseData, setFranchiseData] = useState(null);

    // Fetch franchise data
    const fetchFranchiseDetails = useCallback(async () => {
        setIsFetching(true);
        try {
            const response = await getFranchiseById(franchiseId);
            if (response.statusCode === 200 && response.data) {
                const data = response.data;
                setFranchiseData(data);
                // Pre-fill form fields
                Object.keys(data).forEach(key => {
                    if (key === 'dob') {
                        setValue(key, formatDateForInput(data[key]));
                    } else if (key === 'planValidityDays') { // Ensure this matches the form field name
                        setValue(key, data[key]);
                    }
                    else {
                        setValue(key, data[key]);
                    }
                });
            } else {
                toast.error(response.message || "Failed to fetch franchise details.");
                navigate('/admin/franchises'); // Redirect if not found or error
            }
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching franchise details.");
            navigate('/admin/franchises');
        } finally {
            setIsFetching(false);
        }
    }, [franchiseId, setValue, navigate]);

    useEffect(() => {
        fetchFranchiseDetails();
    }, [fetchFranchiseDetails]);

    const onSubmit = async (data) => {
        if (!isDirty) {
            toast.info("No changes detected to save.");
            return;
        }
        setIsLoading(true);
        const formData = new FormData();

        // Append only editable fields
        const editableFields = [
    'franchiseName', 'ownerName', 'designation', 'dob', 'email', 'mobile',
    'address', 'state', 'city', 'postalCode', 'country',
    'planValidityDays', 'gstNumber', 'atcCode',
    'totalComputers', 'totalStudents', 'status' // ✅ include status here
];


        editableFields.forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                // Check if the field was actually changed to avoid sending unchanged values
                if (data[key] !== franchiseData[key]) { // franchiseData holds original values
                    formData.append(key, data[key]);
                }
            }
        });

        // Handle file uploads only if new files are selected
        if (data.ownerPhoto && data.ownerPhoto[0]) {
            formData.append('ownerPhoto', data.ownerPhoto[0]);
        }
        if (data.franchiseSignature && data.franchiseSignature[0]) {
            formData.append('franchiseSignature', data.franchiseSignature[0]);
        }

        // If no actual data changed (including files), inform user
        let hasChanges = false;
        for (const _ of formData.entries()) { // Iterate to check if formData has any entries
            hasChanges = true;
            break;
        }
        if (!hasChanges && !isDirty) { // Double check with isDirty for non-file inputs
            toast.info("No changes to submit.");
            setIsLoading(false);
            return;
        }


        try {
            const response = await updateFranchise(franchiseId, formData);
            if (response.statusCode === 200) {
                toast.success(response.message || "Franchise updated successfully!");
                navigate('/admin/franchises'); // Or back to the request stack if it came from there
            } else {
                throw new Error(response.message || "Failed to update franchise.");
            }
        } catch (error) {
            console.error("Error updating franchise:", error);
            let errorMessage = "An unexpected error occurred.";
            if (error.response) {
                const backendMessage = error.response.data?.message || error.response.data?.error || '';
                errorMessage = (typeof backendMessage === 'string' && backendMessage.length > 0 ? backendMessage : null) || `Server Error: ${error.response.status}`;
                if (error.response.status === 409 && errorMessage.toLowerCase().includes('email')) {
                    setError('email', { type: 'manual', message: errorMessage });
                }
            } else if (error.request) {
                errorMessage = "Could not connect to the server.";
            } else {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base transition duration-150 ease-in-out placeholder-gray-400";
    const labelClass = "block text-base font-medium text-gray-700 mb-1";
    const errorClass = "text-red-500 text-sm mt-1";
    const sectionTitleClass = "text-xl font-medium leading-6 text-gray-800 border-b pb-2 mb-6";

    if (isFetching) {
        return <div className="text-center p-10">Loading franchise details...</div>;
    }
    if (!franchiseData) {
        return <div className="text-center p-10 text-red-500">Could not load franchise data.</div>;
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Franchise & Owner Details */}
                <section>
                    <h3 className={sectionTitleClass}>Franchise & Owner Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                            <label htmlFor="franchiseName" className={labelClass}>Franchise Name <span className="text-red-500">*</span></label>
                            <input type="text" id="franchiseName" {...register("franchiseName", { required: "Franchise Name is required" })} className={inputClass} />
                            {errors.franchiseName && <p className={errorClass}>{errors.franchiseName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="ownerName" className={labelClass}>Owner Name <span className="text-red-500">*</span></label>
                            <input type="text" id="ownerName" {...register("ownerName", { required: "Owner Name is required" })} className={inputClass} />
                            {errors.ownerName && <p className={errorClass}>{errors.ownerName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="designation" className={labelClass}>Designation <span className="text-red-500">*</span></label>
                            <select id="designation" {...register("designation", { required: "Designation is required" })} className={inputClass}>
                                <option value="">-- Select Designation --</option>
                                {designations.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.designation && <p className={errorClass}>{errors.designation.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="dob" className={labelClass}>Date Of Birth <span className="text-red-500">*</span></label>
                            <input type="date" id="dob" {...register("dob", { required: "Date of Birth is required", valueAsDate: true })} className={inputClass} />
                            {errors.dob && <p className={errorClass}>{errors.dob.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className={labelClass}>Email <span className="text-red-500">*</span></label>
                            <input type="email" id="email" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })} className={inputClass} />
                            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="mobile" className={labelClass}>Mobile <span className="text-red-500">*</span></label>
                            <div className="flex mt-1 rounded-md shadow-sm border border-gray-300 focus-within:ring-1 focus-within:ring-black focus-within:border-black overflow-hidden">
                                <div className="flex-shrink-0 inline-flex items-center pl-3 pr-2 border-r border-gray-300 bg-gray-50 text-gray-600 text-base">
                                    <img src={INDFlag} alt="IN" className="h-5 w-auto mr-2 flex-shrink-0" />
                                    <span className="whitespace-nowrap">+91</span>
                                </div>
                                <input type="tel" id="mobile" {...register("mobile", { required: "Mobile number is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" } })} className="block w-full flex-1 px-3 py-2 border-none focus:outline-none text-base placeholder-gray-400" />
                            </div>
                            {errors.mobile && <p className={errorClass}>{errors.mobile.message}</p>}
                        </div>
                    </div>
                </section>

                {/* Address Details */}
                <section>
                    <h3 className={sectionTitleClass}>Address Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div className="md:col-span-3">
                            <label htmlFor="address" className={labelClass}>Address <span className="text-red-500">*</span></label>
                            <textarea id="address" {...register("address", { required: "Address is required" })} rows="3" className={inputClass}></textarea>
                            {errors.address && <p className={errorClass}>{errors.address.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="state" className={labelClass}>State <span className="text-red-500">*</span></label>
                            <select id="state" {...register("state", { required: "State is required" })} className={inputClass}>
                                <option value="">-- Select State --</option>
                                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {errors.state && <p className={errorClass}>{errors.state.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="city" className={labelClass}>City <span className="text-red-500">*</span></label>
                            <input type="text" id="city" {...register("city", { required: "City is required" })} className={inputClass} />
                            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="postalCode" className={labelClass}>Postal Code <span className="text-red-500">*</span></label>
                            <input type="text" id="postalCode" {...register("postalCode", { required: "Postal Code is required", pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit postal code" } })} className={inputClass} />
                            {errors.postalCode && <p className={errorClass}>{errors.postalCode.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="country" className={labelClass}>Country</label>
                            <input type="text" id="country" {...register("country")} readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                        </div>
                    </div>
                </section>

                {/* Infrastructure Details */}
                <section>
                    <h3 className={sectionTitleClass}>Infrastructure Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                            <label htmlFor="totalComputers" className={labelClass}>No. of Computers</label>
                            <input type="number" id="totalComputers" {...register("totalComputers", { valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })} className={inputClass} />
                            {errors.totalComputers && <p className={errorClass}>{errors.totalComputers.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="totalStudents" className={labelClass}>No. of Students</label>
                            <input type="number" id="totalStudents" {...register("totalStudents", { valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })} className={inputClass} />
                            {errors.totalStudents && <p className={errorClass}>{errors.totalStudents.message}</p>}
                        </div>
                    </div>
                </section>

                {/* Plan & Other Details */}
                <section>
                    <h3 className={sectionTitleClass}>Plan & Other Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                            <label htmlFor="planValidityDays" className={labelClass}>Select Plan <span className="text-red-500">*</span></label>
                            <select id="planValidityDays" {...register("planValidityDays", { required: "Plan is required" })} className={inputClass}>
                                <option value="">-- Select Plan --</option>
                                {plans.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                            {errors.planValidityDays && <p className={errorClass}>{errors.planValidityDays.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="gstNumber" className={labelClass}>GST Number</label>
                            <input type="text" id="gstNumber" {...register("gstNumber")} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="atcCode" className={labelClass}>ATC Code</label>
                            <input type="text" id="atcCode" {...register("atcCode")} className={inputClass} />
                        </div>
                    </div>
                </section>

                {/* Documents Upload */}
                <section>
                    <h3 className={sectionTitleClass}>Documents Upload (Update if needed)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="franchiseLogo" className={labelClass}>Franchise Logo</label>
                            <input type="file" id="franchiseLogo" {...register("franchiseLogo")} accept="image/*" className="mt-1 block w-full text-base text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-base file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" />
                            {franchiseData?.franchiseLogoUrl && !watch('ownerPhoto')?.[0] && <a href={franchiseData.franchiseLogoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">View current photo</a>}
                        </div>
                        <div>
                            <label htmlFor="franchiseSignature" className={labelClass}>Franchise Signature</label>
                            <input type="file" id="franchiseSignature" {...register("franchiseSignature")} accept="image/*" className="mt-1 block w-full text-base text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-base file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" />
                            {franchiseData?.franchiseSignatureUrl && !watch('franchiseSignature')?.[0] && <a href={franchiseData.franchiseSignatureUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">View current signature</a>}
                        </div>
                    </div>
                </section>

                {/* System Information (Read-only) */}
                <section>
                    <h3 className={sectionTitleClass}>System Information (Read-only)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                            <label className={labelClass}>Franchise ID</label>
                            <input type="text" value={franchiseData?.franchiseId || 'N/A'} readOnly className={`${inputClass} bg-gray-100`} />
                        </div>
                        <div>
    <label htmlFor="status" className={labelClass}>
        Status <span className="text-red-500">*</span>
    </label>
    <select
        id="status"
        {...register("status", { required: "Status is required" })}
        className={inputClass}
    >
        <option value="">-- Select Status --</option>
        <option value="Pending">Pending</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Rejected">Rejected</option>
    </select>
    {errors.status && <p className={errorClass}>{errors.status.message}</p>}
</div>




                        <div>
                            <label className={labelClass}>Verification Status</label>
                            <input type="text" value={franchiseData?.verificationStatus || 'N/A'} readOnly className={`${inputClass} bg-gray-100`} />
                        </div>
                    </div>
                </section>

                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-10">
                    <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50" disabled={isLoading}>
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50" disabled={isLoading || !isDirty}>
                        {isLoading ? 'Updating...' : 'Update Franchise'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditFranchiseForm;
