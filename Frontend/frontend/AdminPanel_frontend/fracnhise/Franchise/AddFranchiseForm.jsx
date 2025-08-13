import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addFranchiseByAdmin } from '../../services/franchiseService'; // Updated import
import INDFlag from '/assets/india-flag-icon.png';


// Predefined data
const designations = ['Teacher', 'Entrepreneur', 'Institute Owner'];
const plans = [
    { label: "90 days", value: 90 },
    { label: "180 days", value: 180 },
    { label: "365 days", value: 365 }
];
const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Helper function to format date for display
const formatDateDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

function AddFranchiseForm() {
    // Add setError to useForm hook destructuring
    const { register, handleSubmit, watch, setValue, setError, formState: { errors } } = useForm({
        defaultValues: {
            country: 'INDIA',
        }
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [calculatedExpiryDate, setCalculatedExpiryDate] = useState('');

const ownerPhotoFile = watch('ownerPhoto');
const franchiseSignatureFile = watch('franchiseSignature');
const planValidityDays = watch('planValidityDays'); // Renamed from planDuration
const registeredDate = new Date(); // This is just for display, backend sets actual dates

// Effect to calculate display expiry date (client-side only)
useEffect(() => {
    if (planValidityDays) {
        const duration = parseInt(planValidityDays, 10);
        if (!isNaN(duration)) {
            // Note: This calculates based on *today*, backend calculates based on activationDate
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + duration);
            setCalculatedExpiryDate(formatDateDisplay(expiry));
        } else {
             setCalculatedExpiryDate('');
        }
    } else {
        setCalculatedExpiryDate('');
    }
}, [planValidityDays]);


const onSubmit = async (data) => {
    setIsLoading(true);

    const formData = new FormData();
    // Append necessary fields for admin creation, including new ones
    const fieldsToInclude = [
        'franchiseName', 'ownerName', 'designation', 'dob', 'email', 'mobile',
        'address', 'state', 'city', 'postalCode', 'country',
        'totalComputers', 'totalStudents', // Added fields
        'planValidityDays', 'gstNumber', 'atcCode',
        'ownerPhoto', 'franchiseSignature'
    ];

    fieldsToInclude.forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
            if (key === 'ownerPhoto' || key === 'franchiseSignature') {
                // Append file if present
                if (data[key] && data[key][0]) {
                    formData.append(key, data[key][0]);
                }
            } else {
                formData.append(key, data[key]);
            }
        }
    });
    // Ensure country is always sent if not explicitly set (though it has a default)
    if (!formData.has('country')) formData.append('country', 'INDIA');

    console.log("[AddFranchiseForm] Submitting FormData for Admin Add:", Object.fromEntries(formData.entries()));

    try {
        const response = await addFranchiseByAdmin(formData); // Updated service call
        console.log("[AddFranchiseForm] API Response:", response);
        // Check based on ApiResponse structure
        if (response && response.statusCode === 201) {
             // Use the specific message from the backend response
             toast.success(response.message || "Franchise created successfully. Please verify and activate.");
            console.log("Created Franchise Data (Pending Activation/Verification):", response.data);
            // Navigate to the requests page where the new entry will appear
            setTimeout(() => navigate('/admin/franchises/requests'), 2000);
        } else {
             console.warn("[AddFranchiseForm] API call finished but response indicates failure. Response:", response);
             // Use the specific message from the backend response if available
             throw new Error(response?.message || "Failed to create franchise. Unexpected response structure.");
        }
    } catch (error) {
         console.error("[AddFranchiseForm] Submit error occurred. Full error object:", error);
             if (error.response) { // Error from backend response
                 console.error("[AddFranchiseForm] Error Response Status:", error.response.status);
                 console.error("[AddFranchiseForm] Error Response Data:", error.response.data);
             } else if (error.request) { // No response received
                 console.error("[AddFranchiseForm] Error Request Data:", error.request);
             } else { // Setup error or other client-side issue
                 console.error("[AddFranchiseForm] Error Message:", error.message);
             }

             let errorMessage = "An unexpected error occurred. Please try again."; // Default message

             if (error.response) {
                 // Attempt to parse message from backend JSON response
                 const backendErrorData = error.response.data;
                 let backendMessage = '';

                 if (backendErrorData && typeof backendErrorData === 'object') {
                    // Use message from our standard ApiResponse structure if available
                    backendMessage = backendErrorData.message || backendErrorData.error || '';
                 }

                 // If we got a specific message, use it, otherwise use status code
                 errorMessage = (typeof backendMessage === 'string' && backendMessage.length > 0)
                    ? backendMessage
                    : `Server Error: ${error.response.status}. Please check server logs.`;

                 // Set specific field errors if applicable (e.g., duplicate email)
                 if (error.response.status === 409 && errorMessage.toLowerCase().includes('email')) {
                     setError('email', { type: 'manual', message: errorMessage });
                     // Don't overwrite the general error message for the toast in this case
                 }
                 // Add more specific field error checks here if needed based on backend responses

             } else if (error.request) {
                 // Network error (no response received)
                 errorMessage = "Network Error: Could not connect to the server. Please ensure it's running and accessible.";
             } else {
                 // Other errors (e.g., setup issues)
                 errorMessage = error.message || "An unknown client-side error occurred.";
             }

             // Always display the determined error message via toast
             console.log("[AddFranchiseForm] Displaying toast error with message:", errorMessage);
             toast.error(errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base transition duration-150 ease-in-out placeholder-gray-400";
    const labelClass = "block text-base font-medium text-gray-700 mb-1";
    const errorClass = "text-red-500 text-sm mt-1";
    const sectionTitleClass = "text-xl font-medium leading-6 text-gray-800 border-b pb-2 mb-6";

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <h2 className="text-3xl font-semibold text-black mb-8 text-center">Add New Franchise</h2>

                <section>
                     <h3 className={sectionTitleClass}>Franchise & Owner Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div>
                            <label htmlFor="franchiseName" className={labelClass}>Franchise Name <span className="text-red-500">*</span></label>
                            <input type="text" id="franchiseName" {...register("franchiseName", { required: "Franchise Name is required" })} className={inputClass} placeholder="e.g., SK EduTech Center" />
                            {errors.franchiseName && <p className={errorClass}>{errors.franchiseName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="ownerName" className={labelClass}>Owner Name <span className="text-red-500">*</span></label>
                            <input type="text" id="ownerName" {...register("ownerName", { required: "Owner Name is required" })} className={inputClass} placeholder="e.g., John Doe" />
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
                            <input type="email" id="email" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })} className={inputClass} placeholder="e.g., owner@example.com" />
                            {/* Display manual error set by setError */}
                            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="mobile" className={labelClass}>Mobile <span className="text-red-500">*</span></label>
                            <div className="flex mt-1 rounded-md shadow-sm border border-gray-300 focus-within:ring-1 focus-within:ring-black focus-within:border-black overflow-hidden">
                                <div className="flex-shrink-0 inline-flex items-center pl-3 pr-2 border-r border-gray-300 bg-gray-50 text-gray-600 text-base">
                                    <img src={INDFlag} alt="IN" className="h-5 w-auto mr-2 flex-shrink-0"/>
                                    <span className="whitespace-nowrap">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    id="mobile"
                                    {...register("mobile", {
                                        required: "Mobile number is required",
                                        pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" }
                                    })}
                                    className="block w-full flex-1 px-3 py-2 border-none focus:outline-none text-base placeholder-gray-400"
                                    placeholder="9876543210"
                                />
                            </div>
                             {errors.mobile && <p className={errorClass}>{errors.mobile.message}</p>}
                        </div>
                    </div>
                </section>

                 <section>
                     <h3 className={sectionTitleClass}>Address Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                        <div className="md:col-span-3">
                            <label htmlFor="address" className={labelClass}>Address <span className="text-red-500">*</span></label>
                            <textarea id="address" {...register("address", { required: "Address is required" })} rows="3" className={inputClass} placeholder="Street Address, Area"></textarea>
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
                            <input type="text" id="city" {...register("city", { required: "City is required" })} className={inputClass} placeholder="e.g., Mumbai" />
                            {errors.city && <p className={errorClass}>{errors.city.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="postalCode" className={labelClass}>Postal Code <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="postalCode"
                                {...register("postalCode", {
                                    required: "Postal Code is required",
                                    pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit postal code" }
                                })}
                                className={inputClass}
                                placeholder="e.g., 400001"
                            />
                            {errors.postalCode && <p className={errorClass}>{errors.postalCode.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="country" className={labelClass}>Country</label>
                            <input type="text" id="country" value="INDIA" readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                        </div>
                     </div>
                </section>

                 <section>
                     <h3 className={sectionTitleClass}>Infrastructure Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                         <div>
                            <label htmlFor="totalComputers" className={labelClass}>No. of Computers</label>
                            <input type="number" id="totalComputers" {...register("totalComputers", { valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })} className={inputClass} placeholder="e.g., 10" />
                            {errors.totalComputers && <p className={errorClass}>{errors.totalComputers.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="totalStudents" className={labelClass}>No. of Students</label>
                            <input type="number" id="totalStudents" {...register("totalStudents", { valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })} className={inputClass} placeholder="e.g., 50" />
                            {errors.totalStudents && <p className={errorClass}>{errors.totalStudents.message}</p>}
                        </div>
                     </div>
                 </section>


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
                            <label htmlFor="expireDateDisplay" className={labelClass}>Approx. Expiry Date (Display Only)</label>
                            <input type="text" id="expireDateDisplay" value={calculatedExpiryDate} readOnly title="Actual expiry date is calculated by the server upon activation." className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                         </div>
                         <div></div> {/* Empty div for alignment */}
                         <div>
                            <label htmlFor="gstNumber" className={labelClass}>GST Number</label>
                            <input type="text" id="gstNumber" {...register("gstNumber")} className={inputClass} placeholder="Optional" />
                         </div>
                         <div>
                            <label htmlFor="atcCode" className={labelClass}>ATC Code</label>
                            <input type="text" id="atcCode" {...register("atcCode")} className={inputClass} placeholder="Optional" />
                         </div>
                    </div>
                </section>

                <section>
                    <h3 className={sectionTitleClass}>Documents Upload</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="franchiseLogo" className={labelClass}>Franchise Logo</label>
                            <input type="file" id="franchiseLogo" {...register("franchiseLogo")} accept="image/*" className="mt-1 block w-full text-base text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-base file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"/>
                            {ownerPhotoFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{ownerPhotoFile[0].name}</span>}
                        </div>
                        <div>
                            <label htmlFor="franchiseSignature" className={labelClass}>Franchise Signature</label>
                            <input type="file" id="franchiseSignature" {...register("franchiseSignature")} accept="image/*" className="mt-1 block w-full text-base text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-base file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"/>
                            {franchiseSignatureFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{franchiseSignatureFile[0].name}</span>}
                        </div>
                    </div>
                </section>

                <section>
                     <h3 className={sectionTitleClass}>For Office Use Only</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                         <div>
                            <label htmlFor="registeredDateDisplay" className={labelClass}>Register Date</label>
                            <input type="text" id="registeredDateDisplay" value={formatDateDisplay(registeredDate)} readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                         </div>
                     </div>
                </section>

                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-10">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/franchises')}
                        className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Adding Franchise...' : 'Add Franchise'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddFranchiseForm;
