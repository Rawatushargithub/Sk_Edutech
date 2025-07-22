import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
// Import the new service functions for public application with OTP
import { requestFranchiseOtp, submitFranchiseApplicationWithOtp } from '../AdminPanel_frontend/services/homepageFranchiseService'; // UPDATED
import INDFlag from '/assets/india-flag-icon.png'; // Assuming you have a flag image in your assets

// Predefined data (subset needed for application)
const designations = ['Teacher', 'Entrepreneur', 'Institute Owner'];
const plans = [ // Added plans for the dropdown
    { label: "90 days", value: 90 },
    { label: "180 days", value: 180 },
    { label: "365 days", value: 365 }
];
const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Modal component
function ApplyFranchiseModal({ isOpen, onClose }) {
    // Add setError to useForm hook destructuring
    const { register, handleSubmit, watch, setValue, setError, reset, formState: { errors } } = useForm({
        defaultValues: {
            country: 'INDIA',
            // No default for gstNumber, atcCode, totalComputers, totalStudents
            planValidityDays: '', // Add default for plan
            confirmTerms: false, // Add default for terms confirmation checkbox
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [modalStep, setModalStep] = useState('form'); // 'form', 'otp', or 'success'
    const [otpValue, setOtpValue] = useState('');
    const [formDataForOtp, setFormDataForOtp] = useState(null);
    const [userEmailForOtp, setUserEmailForOtp] = useState('');
    const [applicationId, setApplicationId] = useState('');

    // Watch the confirmTerms checkbox to control submit button state
    const confirmTermsValue = watch('confirmTerms');

    // Reset form and modal state when modal is opened/closed
    useEffect(() => {
        if (isOpen) {
            reset();
            setModalStep('form');
            setOtpValue('');
            setFormDataForOtp(null);
            setUserEmailForOtp('');
        }
    }, [isOpen, reset]);


    // Watch file inputs (optional for display)
    const ownerPhotoFile = watch('ownerPhoto');
    const franchiseSignatureFile = watch('franchiseSignature');

    // Removed mock function, will use the actual service function
    // const mockApplyForFranchise = async (formData) => {
    //     console.log("[ApplyFranchiseModal] Mock Submitting FormData:", Object.fromEntries(formData.entries()));
    //     // Simulate API call delay
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    //     // Simulate success
    //     return { statusCode: 201, message: "Application submitted successfully." };
    //     // Simulate error: throw new Error("Mock submission failed.");
    // };


    const handleProceedToOtp = async (data) => {
        setIsLoading(true);
        setUserEmailForOtp(data.email); // Store email for display in OTP step

        const formData = new FormData();
        const fieldsToInclude = [
            'franchiseName', 'ownerName', 'designation', 'dob', 'email', 'mobile',
            'address', 'state', 'city', 'postalCode', 'country',
            'totalComputers', 'totalStudents', 'planValidityDays',
            'gstNumber', 'atcCode', 'ownerPhoto', 'franchiseSignature'
        ];

        fieldsToInclude.forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                if (key === 'ownerPhoto' || key === 'franchiseSignature') {
                    if (data[key] && data[key][0]) {
                        formData.append(key, data[key][0]);
                    }
                } else {
                    formData.append(key, data[key]);
                }
            }
        });
        if (!formData.has('country')) formData.append('country', 'INDIA');
        formData.append('applicationType', 'FranchiseApplied'); // Keep this if backend expects it for OTP request

        setFormDataForOtp(formData); // Store formData for final submission
        console.log("[ApplyFranchiseModal] Requesting OTP with FormData:", Object.fromEntries(formData.entries()));

        try {
            // Create a plain object for the OTP request, as it might not need FormData
            const otpRequestData = {
                email: data.email,
                // Include other fields if your backend OTP request endpoint needs them
                // For example, if you want to pre-validate some data before sending OTP
                franchiseName: data.franchiseName,
                ownerName: data.ownerName,
                mobile: data.mobile,
            };

            const response = await requestFranchiseOtp(otpRequestData); // Use new service
            console.log("[ApplyFranchiseModal] OTP Request API Response:", response);

            if (response && response.statusCode === 200) { // Assuming 200 for OTP sent
                toast.success(response.message || "OTP sent to your email successfully.");
                setModalStep('otp');
            } else {
                throw new Error(response?.message || "Failed to send OTP. Unexpected response.");
            }
        } catch (error) {
            console.error("[ApplyFranchiseModal] OTP Request error:", error);
            let errorMessage = error.message || "An unexpected error occurred while sending OTP.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
            // Potentially set field errors if backend provides them for OTP request
            if (error.response && error.response.data && error.response.data.errors) {
                // Example: setError('email', { type: 'manual', message: error.response.data.errors.email });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!formDataForOtp) {
            toast.error("Form data is missing. Please restart the application process.");
            return;
        }
        if (!otpValue || otpValue.length !== 6) { // Assuming 6-digit OTP
            toast.error("Please enter a valid 6-digit OTP.");
            return;
        }

        setIsLoading(true);
        // Append OTP to the stored formData
        formDataForOtp.append('otp', otpValue);

        console.log("[ApplyFranchiseModal] Submitting Application with OTP. FormData:", Object.fromEntries(formDataForOtp.entries()));

        try {
            const response = await submitFranchiseApplicationWithOtp(formDataForOtp); // Use new service
            console.log("[ApplyFranchiseModal] Final Submit API Response:", response);

            if (response && response.statusCode === 201) {
                // Store application ID if provided
                if (response.data && response.data.applicationId) {
                    setApplicationId(response.data.applicationId);
                }
                // Show success modal instead of closing
                setModalStep('success');
            } else {
                throw new Error(response?.message || "Failed to submit application. Unexpected response.");
            }
        } catch (error) {
            console.error("[ApplyFranchiseModal] Final Submit error:", error);
            let errorMessage = error.message || "An unexpected error occurred during final submission.";
             if (error.response) {
                 const backendErrorData = error.response.data;
                 let backendMessage = '';
                 if (backendErrorData && typeof backendErrorData === 'object') {
                    backendMessage = backendErrorData.message || backendErrorData.error || '';
                 }
                 errorMessage = (typeof backendMessage === 'string' && backendMessage.length > 0)
                    ? backendMessage
                    : `Server Error: ${error.response.status}. Please check server logs.`;

                // If OTP is invalid, backend might send a specific message
                if (errorMessage.toLowerCase().includes('otp')) {
                    // setError for an OTP field if you had one registered with react-hook-form
                    // For now, just a toast.
                }
             } else if (error.request) {
                 errorMessage = "Network Error: Could not connect to the server.";
             }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
            // Do not clear formDataForOtp here, in case user wants to retry OTP with same form data
            // It will be cleared when modal is closed/reopened via useEffect
        }
    };


    // Render nothing if modal is not open
    if (!isOpen) return null;

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base transition duration-150 ease-in-out placeholder-gray-400";
    const labelClass = "block text-base font-medium text-gray-700 mb-1";
    const errorClass = "text-red-500 text-sm mt-1";
    const sectionTitleClass = "text-xl font-medium leading-6 text-gray-800 border-b pb-2 mb-6";

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            {/* Modal Content */}
            <div className="relative p-8 bg-white w-full max-w-3xl mx-auto rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
                 <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                    aria-label="Close"
                >
                    &times;
                </button>

                {modalStep === 'form' && (
                    <form onSubmit={handleSubmit(handleProceedToOtp)} className="space-y-8">
                        <h2 className="text-3xl font-semibold text-black mb-8 text-center">Apply for Franchise</h2>

                        {/* Franchise & Owner Details */}
                        <section>
                            <h3 className={sectionTitleClass}>Franchise & Owner Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div>
                                    <label htmlFor="franchiseName" className={labelClass}>Institute Name <span className="text-red-500">*</span></label>
                                    <input type="text" id="franchiseName" {...register("franchiseName", { required: "Institute Name is required", minLength: { value: 3, message: "Institute Name must be at least 3 characters long" } })} className={inputClass} placeholder="e.g., SK EduTech Center" />
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
                                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="mobile" className={labelClass}>Mobile <span className="text-red-500">*</span></label>
                                    <div className="flex mt-1 rounded-md shadow-sm border border-gray-300 focus-within:ring-1 focus-within:ring-black focus-within:border-black overflow-hidden">
                                        <div className="flex-shrink-0 inline-flex items-center pl-3 pr-2 border-r border-gray-300 bg-gray-50 text-gray-600 text-base">
                                            <img src={INDFlag} alt="IN" className="h-5 w-auto mr-2 flex-shrink-0"/>
                                            <span className="whitespace-nowrap">+91</span>
                                        </div>
                                        <input type="tel" id="mobile" {...register("mobile", { required: "Mobile number is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" } })} className="block w-full flex-1 px-3 py-2 border-none focus:outline-none text-base placeholder-gray-400" placeholder="9876543210" />
                                    </div>
                                    {errors.mobile && <p className={errorClass}>{errors.mobile.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Address Details */}
                        <section>
                            <h3 className={sectionTitleClass}>Address Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div className="md:col-span-2">
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
                                    <input type="text" id="postalCode" {...register("postalCode", { required: "Postal Code is required", pattern: { value: /^\d{6}$/, message: "Enter a valid 6-digit postal code" } })} className={inputClass} placeholder="e.g., 400001" />
                                    {errors.postalCode && <p className={errorClass}>{errors.postalCode.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="country" className={labelClass}>Country</label>
                                    <input type="text" id="country" value="INDIA" readOnly className={`${inputClass} bg-gray-100 cursor-not-allowed`} />
                                </div>
                            </div>
                        </section>

                        {/* Infrastructure Details */}
                        <section>
                            <h3 className={sectionTitleClass}>Infrastructure Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div>
                                    <label htmlFor="totalComputers" className={labelClass}>No. of Computers <span className="text-red-500">*</span></label>
                                    <input type="number" id="totalComputers" {...register("totalComputers", { required: "Number of computers is required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })} className={inputClass} placeholder="e.g., 10" />
                                    {errors.totalComputers && <p className={errorClass}>{errors.totalComputers.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="totalStudents" className={labelClass}>No. of Students <span className="text-red-500">*</span></label>
                                    <input type="number" id="totalStudents" {...register("totalStudents", { required: "Number of students is required", valueAsNumber: true, min: { value: 0, message: "Cannot be negative" } })} className={inputClass} placeholder="e.g., 50" />
                                    {errors.totalStudents && <p className={errorClass}>{errors.totalStudents.message}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Plan & Other Details */}
                        <section>
                            <h3 className={sectionTitleClass}>Plan & Other Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <div>
                                    <label htmlFor="planValidityDays" className={labelClass}>Select Plan <span className="text-red-500">*</span></label>
                                    <select id="planValidityDays" {...register("planValidityDays", { required: "Plan selection is required" })} className={inputClass}>
                                        <option value="">-- Select Plan --</option>
                                        {plans.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                    {errors.planValidityDays && <p className={errorClass}>{errors.planValidityDays.message}</p>}
                                </div>
                                <div> {/* Empty div for alignment */} </div>
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

                        {/* Documents Upload */}
                        <section>
                            <h3 className={sectionTitleClass}>Documents Upload</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="ownerPhoto" className={labelClass}>Owner Photo <span className="text-red-500">*</span></label>
                                    <input type="file" id="ownerPhoto" {...register("ownerPhoto", { required: "Owner photo is required" })} accept="image/*" className="mt-1 block w-full text-base text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-base file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"/>
                                    {errors.ownerPhoto && <p className={errorClass}>{errors.ownerPhoto.message}</p>}
                                    {ownerPhotoFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{ownerPhotoFile[0].name}</span>}
                                </div>
                                <div>
                                    <label htmlFor="franchiseSignature" className={labelClass}>Franchise Signature <span className="text-red-500">*</span></label>
                                    <input type="file" id="franchiseSignature" {...register("franchiseSignature", { required: "Franchise signature is required" })} accept="image/*" className="mt-1 block w-full text-base text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:text-base file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"/>
                                    {errors.franchiseSignature && <p className={errorClass}>{errors.franchiseSignature.message}</p>}
                                    {franchiseSignatureFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{franchiseSignatureFile[0].name}</span>}
                                </div>
                            </div>
                        </section>

                        {/* Terms and Conditions */}
                        <section>
                            <h3 className={sectionTitleClass}>Terms and Conditions</h3>
                            
                            {/* Scrollable Terms Content */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                <div className="max-h-80 overflow-y-auto pr-2 space-y-4 text-sm text-gray-700 leading-relaxed">
                                    <div className="font-semibold text-gray-900 mb-4">
                                        I/We hereby solemnly affirm and declare as under:
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <p>That I/We have established/opened a Centre at a fixed and verifiable location.</p>
                                        
                                        <p>That I/We have established/opened the above-mentioned Centre/Institute/NGO in accordance with the required norms.</p>
                                        
                                        <p>That I/We have fulfilled all requirements to run an authorized All Zone Course (Software Zone / Hardware Zone / Teacher Training Zone / Vocational Zone) under SK Edutech — an I.T. & Vocational Training Programme of SK Edutech I.T. & Educational Development - HR — in our Centre/Institute/NGO.</p>
                                        
                                        <p>That SK Edutech shall issue authorization to run the above-mentioned Zone(s)/Course(s) only for the single, officially registered location.</p>
                                        
                                        <p>This authorization shall not apply to any franchise or branch at different locations. For any other location, I/We shall submit a new application for center authorization. The branch shall not deal with any other organization on its own behalf.</p>
                                        
                                        <p>That I/We shall remain liable for all due payments towards SK Edutech under all circumstances.</p>
                                        
                                        <p>That SK Edutech has no share in student admission fees, tuition fees, or examination fees. All such fees shall be decided solely by us based on:</p>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Investment</li>
                                            <li>Infrastructure facilities</li>
                                            <li>Student-teacher ratio</li>
                                            <li>Local geographic and economic conditions</li>
                                        </ul>
                                        
                                        <p>SK Edutech shall not be held responsible for any disputes arising from the fees decided and collected by the Centre. I/We shall be solely liable.</p>
                                        
                                        <p>SK Edutech shall charge a one-time nominal registration fee per student, as per the course duration.</p>
                                        
                                        <p>That SK Edutech has not made, and shall not make, any investment in the setup of our Centre/Institute. Therefore, all investments, expenses, and operational responsibilities shall be fully managed and borne by us. These include but are not limited to:</p>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Computer systems</li>
                                            <li>Center furniture</li>
                                            <li>Teachers' salaries</li>
                                            <li>Center building (rented or self-owned)</li>
                                            <li>Licensed educational software</li>
                                            <li>Centre audits, ITR filings, and taxes</li>
                                            <li>Local-level approvals and documentation</li>
                                        </ul>
                                        
                                        <p>That student diplomas/certificates issued under SK Edutech's I.T. & Vocational Training Programme shall be received at our center via postal service.</p>
                                        
                                        <p>That all payments made or to be made to SK Edutech are non-refundable under any circumstances.</p>
                                        
                                        <p>That SK Edutech shall not be held liable for any commitments, schemes, advertisements, or tie-ups conducted independently by us with:</p>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>Students</li>
                                            <li>Government bodies</li>
                                            <li>Corporate entities</li>
                                            <li>Universities</li>
                                            <li>Public or private organizations</li>
                                        </ul>
                                        
                                        <p>That if any person involved in our Centre is found guilty of criminal, financial, or social offenses, the authorization shall be terminated automatically.</p>
                                        
                                        <p>That the authorization for our Centre/Institute/NGO shall remain valid from the date of authorization and is subject to renewal each year in March, before the 31st of the month, as per the renewal terms.</p>
                                        
                                        <p>That SK Edutech reserves the right to modify, update, or introduce new rules and regulations regarding the authorization or association of our Centre.</p>
                                        
                                        <p>That I/We have read, understood, and accepted all the rules and regulations of SK Edutech. In the case of any non-compliance, the decision of the Director of SK Edutech regarding continuation or termination shall be final and binding.</p>
                                        
                                        <p>That all center data shall be submitted to the Head Office in Excel format before the 10th of every month.</p>
                                        
                                        <p>That a minimum of 30 student admissions shall be maintained in every financial year.</p>
                                        
                                        <p>That all financial dues shall be submitted to the Head Office before the 10th of each month.</p>
                                        
                                        <p>That identity cards are mandatory for both teachers and students.</p>
                                        
                                        <p>That no center head shall create any page on any social media platform or website using the name "SK Edutech." Any such action shall result in immediate termination and legal action.</p>
                                        
                                        <p>That if any individual is found guilty of wrongdoing at the center, the branch head shall be held accountable. The Head Office shall bear no responsibility.</p>
                                        
                                        <div className="font-semibold text-gray-900 mt-6 mb-3">
                                            Declaration Clause
                                        </div>
                                        
                                        <p>This declaration has been made with full understanding and shall serve legal purposes as required.</p>
                                        <p>In the event of any dispute, it shall be resolved by a committee appointed by SK Edutech – HR.</p>
                                        <p>The committee's decision shall be final and binding.</p>
                                        <p>Jurisdiction shall rest with the courts in Gurugram (Haryana), and all legal expenses shall be borne by us.</p>
                                        
                                        <p>I/We declare that the information provided in this declaration, as well as in the Center Authorization Application and Center Head Profile, is true and accurate to the best of our knowledge.</p>
                                        <p>This declaration shall remain binding on us and our successors throughout our association with SK Edutech.</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Confirmation Checkbox */}
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    id="confirmTerms"
                                    {...register("confirmTerms", { 
                                        required: "You must confirm that you have read and agreed to all terms and conditions" 
                                    })}
                                    className="mt-1 h-5 w-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                                <label htmlFor="confirmTerms" className="text-base font-semibold text-gray-700  leading-relaxed">
                                     I/We hereby confirm that we have fully read, understood, and agreed to abide by all the terms and conditions mentioned above. <span className="text-red-500">*</span>
                                </label>
                            </div>
                            {errors.confirmTerms && <p className={errorClass}>{errors.confirmTerms.message}</p>}
                        </section>

                        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-10">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition duration-150 ease-in-out disabled:opacity-50 ${
                                    !confirmTermsValue || isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
                                }`}
                                disabled={isLoading || !confirmTermsValue}
                            >
                                {isLoading ? 'Processing...' : 'Proceed'}
                            </button>
                        </div>
                    </form>
                )}

                {modalStep === 'otp' && (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-semibold text-black mb-8 text-center">Enter OTP</h2>
                        <p className="text-center text-gray-600">
                            An OTP has been sent to <span className="font-medium">{userEmailForOtp}</span>.
                            Please enter it below to submit your application.
                        </p>
                        
                        <div>
                            <label htmlFor="otpInput" className={labelClass}>OTP <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="otpInput"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value)}
                                className={inputClass}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                            />
                            {/* Basic OTP error display, can be enhanced */}
                        </div>

                        <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-10">
                            <button
                                type="button"
                                onClick={() => setModalStep('form')} // Go back to form
                                className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out"
                                disabled={isLoading}
                            >
                                Back to Form
                            </button>
                            <button
                                type="button"
                                onClick={handleFinalSubmit}
                                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition duration-150 ease-in-out disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </div>
                )}

                {modalStep === 'success' && (
                    <div className="space-y-8 text-center">
                        {/* Success Icon */}
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>

                        {/* Success Message */}
                        <div>
                            <h2 className="text-3xl font-semibold text-green-600 mb-4">🎉 Application Submitted Successfully!</h2>
                            <div className="space-y-4 text-gray-700">
                                <p className="text-lg">
                                    Thank you for applying for a franchise with <span className="font-semibold text-black">SK EDUTECH</span>!
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
                                    <h3 className="font-semibold text-blue-800 mb-3">What happens next?</h3>
                                    <ul className="space-y-2 text-blue-700">
                                        <li className="flex items-start">
                                            <span className="text-blue-500 mr-2">📧</span>
                                            <span>You will be contacted within <strong>12 hours</strong> via email</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-500 mr-2">🔑</span>
                                            <span>You'll receive your <strong>login ID and credentials</strong></span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-500 mr-2">✅</span>
                                            <span>Our team will review your application for <strong>approval</strong></span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-500 mr-2">🚀</span>
                                            <span>Once approved, you can start your <strong>franchise journey</strong></span>
                                        </li>
                                    </ul>
                                </div>
                                {applicationId && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Application ID:</span> 
                                            <span className="font-mono text-gray-800 ml-2">{applicationId}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Please save this ID for future reference
                                        </p>
                                    </div>
                                )}
                                <p className="text-base text-gray-600">
                                    We appreciate your interest in partnering with us and look forward to welcoming you to the SK EDUTECH family!
                                </p>
                            </div>
                        </div>

                        {/* Close Button */}
                        <div className="pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ApplyFranchiseModal;
