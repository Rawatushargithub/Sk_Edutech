import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { requestFranchiseOtp, submitFranchiseApplicationWithOtp, checkUniqueness } from '../AdminPanel_frontend/services/homepageFranchiseService';
import INDFlag from '/assets/india-flag-icon.png';

const designations = ['Teacher', 'Entrepreneur', 'Institute Owner'];
const plans = [
    // { label: "90 days", value: 90 },
    // { label: "180 days", value: 180 },
    { label: "365 days", value: 365 }
];
const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const ApplyFranchiseModal = () => {
    const { register, handleSubmit, watch, setValue, setError, clearErrors, reset, formState: { errors } } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            country: 'INDIA',
            planValidityDays: '',
            confirmTerms: false,
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [modalStep, setModalStep] = useState('form');
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState('');
    const [formDataForOtp, setFormDataForOtp] = useState(null);
    const [userEmailForOtp, setUserEmailForOtp] = useState('');
    const [applicationId, setApplicationId] = useState('');
    const [validationStatus, setValidationStatus] = useState({
        email: { loading: false, unique: true, message: '' },
        mobile: { loading: false, unique: true, message: '' }
    });

    const confirmTermsValue = watch('confirmTerms');

    useEffect(() => {
        reset();
    }, [reset]);

    const checkFieldUniqueness = useCallback(async (field, value) => {
        setValidationStatus(prev => ({ ...prev, [field]: { ...prev[field], loading: true } }));
        try {
            const response = await checkUniqueness({ [field]: value });
            if (response.data.isUnique) {
                setValidationStatus(prev => ({ ...prev, [field]: { loading: false, unique: true, message: '' } }));
            } else {
                setValidationStatus(prev => ({ ...prev, [field]: { loading: false, unique: false, message: `This ${field} is already registered.` } }));
            }
        } catch (error) {
            setValidationStatus(prev => ({ ...prev, [field]: { loading: false, unique: false, message: `Error checking ${field}.` } }));
        }
    }, []);

    const franchiseLogoFile = watch('franchiseLogo');
    const franchiseSignatureFile = watch('franchiseSignature');
    const ownerAadharFile = watch('ownerAadhar');
    const ownerPanFile = watch('ownerPan');
    const ownerHigherEducationFile = watch('ownerHigherEducation');
    const ownerPhotoFile = watch('ownerPhoto');

    const handleProceedToOtp = async (data) => {
        setIsLoading(true);
        setUserEmailForOtp(data.email);

        const formData = new FormData();
        const fieldsToInclude = [
            'franchiseName', 'ownerName', 'designation', 'dob', 'email', 'mobile',
            'address', 'state', 'city', 'postalCode', 'country',
            'totalComputers', 'totalStudents', 'planValidityDays',
            'gstNumber', 'atcCode', 'franchiseLogo', 'franchiseSignature',
            'ownerAadhar', 'ownerPan', 'ownerHigherEducation', 'ownerPhoto'
        ];

        fieldsToInclude.forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                if (
                    key === 'franchiseLogo' ||
                    key === 'franchiseSignature' ||
                    key === 'ownerAadhar' ||
                    key === 'ownerPan' ||
                    key === 'ownerHigherEducation' ||
                    key === 'ownerPhoto'
                ) {
                    if (data[key] && data[key][0]) {
                        formData.append(key, data[key][0]);
                    }
                } else {
                    formData.append(key, data[key]);
                }
            }
        });
        if (!formData.has('country')) formData.append('country', 'INDIA');
        formData.append('applicationType', 'FranchiseApplied');

        setFormDataForOtp(formData);

        try {
            const otpRequestData = {
                email: data.email,
                franchiseName: data.franchiseName,
                ownerName: data.ownerName,
                mobile: data.mobile,
            };

            const response = await requestFranchiseOtp(otpRequestData);

            if (response && response.statusCode === 200) {
                toast.success(response.message || "OTP sent to your email successfully.");
                setModalStep('otp');
            } else {
                throw new Error(response?.message || "Failed to send OTP. Unexpected response.");
            }
        } catch (error) {
            let errorMessage = error.message || "An unexpected error occurred while sending OTP.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        setOtpError(''); // Clear previous errors
        if (!formDataForOtp) {
            toast.error("Form data is missing. Please restart the application process.");
            return;
        }
        if (!otpValue || otpValue.length !== 6) {
            setOtpError("Please enter a valid 6-digit OTP.");
            return;
        }

        setIsLoading(true);
        formDataForOtp.set('otp', otpValue);

        try {
            const response = await submitFranchiseApplicationWithOtp(formDataForOtp);

            if (response && response.statusCode === 201) {
                if (response.data && response.data.applicationId) {
                    setApplicationId(response.data.applicationId);
                }
                setModalStep('success');
            } else {
                throw new Error(response?.message || "Failed to submit application. Unexpected response.");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Incorrect OTP. Please re-enter.";
            setOtpError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "mt-2 block w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-300";
    const labelClass = "block text-sm font-semibold text-gray-800 mb-2 tracking-wide uppercase";
    const errorClass = "text-red-600 text-sm mt-2 font-medium";
    const sectionTitleClass = "text-2xl font-bold text-gray-900 border-b-2 border-blue-500 pb-3 mb-8 relative";

    const handleInstantFileCheck = (e, fieldName, { minBytes, maxBytes, allowedMimes, label }) => {
        const file = e.target.files?.[0];
        if (!file) {
            clearErrors(fieldName);
            return;
        }
        if (allowedMimes && !allowedMimes.includes(file.type)) {
            setError(fieldName, { type: 'manual', message: `${label} must be of type: ${allowedMimes.join(', ')}` });
            e.target.value = '';
            return;
        }
        if (minBytes && file.size < minBytes) {
            setError(fieldName, { type: 'manual', message: `${label} must be at least ${Math.round(minBytes/1024)} KB` });
            e.target.value = '';
            return;
        }
        if (maxBytes && file.size > maxBytes) {
            setError(fieldName, { type: 'manual', message: `${label} must be at most ${Math.round(maxBytes/1024)} KB` });
            e.target.value = '';
            return;
        }
        clearErrors(fieldName);
    };

    return (
        <div className="p-10 bg-gradient-to-br from-white to-gray-50 w-full max-w-6xl mx-auto rounded-2xl shadow-2xl my-10 border border-gray-100">
            {modalStep === 'form' && (
                <form onSubmit={handleSubmit(handleProceedToOtp)} className="space-y-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Apply for Franchise</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
                        <p className="text-gray-600 mt-4 text-lg">Join our network of successful franchise partners</p>
                    </div>

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
                                <input type="email" id="email" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } })} onBlur={(e) => checkFieldUniqueness('email', e.target.value)} className={inputClass} placeholder="e.g., owner@example.com" />
                                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                {validationStatus.email.loading && <p className="text-blue-600 text-sm mt-2">Checking...</p>}
                                {!validationStatus.email.unique && <p className={errorClass}>{validationStatus.email.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="mobile" className={labelClass}>Mobile <span className="text-red-500">*</span></label>
                                <div className="flex mt-1 rounded-md shadow-sm border border-gray-300 focus-within:ring-1 focus-within:ring-black focus-within:border-black overflow-hidden">
                                    <div className="flex-shrink-0 inline-flex items-center pl-3 pr-2 border-r border-gray-300 bg-gray-50 text-gray-600 text-base">
                                        <img src={INDFlag} alt="IN" className="h-5 w-auto mr-2 flex-shrink-0"/>
                                        <span className="whitespace-nowrap">+91</span>
                                    </div>
                                    <input type="tel" id="mobile" {...register("mobile", { required: "Mobile number is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" } })} onBlur={(e) => checkFieldUniqueness('mobile', e.target.value)} className="block w-full flex-1 px-3 py-2 border-none focus:outline-none text-base placeholder-gray-400" placeholder="9876543210" />
                                </div>
                                {errors.mobile && <p className={errorClass}>{errors.mobile.message}</p>}
                                {validationStatus.mobile.loading && <p className="text-blue-600 text-sm mt-2">Checking...</p>}
                                {!validationStatus.mobile.unique && <p className={errorClass}>{validationStatus.mobile.message}</p>}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className={sectionTitleClass}>Address Details</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="lg:col-span-2">
                                <label htmlFor="address" className={labelClass}>Address <span className="text-red-500">*</span></label>
                                <textarea 
                                    id="address" 
                                    {...register("address", { required: "Address is required" })} 
                                    className="mt-2 block w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-300 resize-none" 
                                    rows="4" 
                                    placeholder="Enter your complete address"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                ></textarea>
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

                    <section>
                        <h3 className={sectionTitleClass}>Infrastructure Details</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label htmlFor="totalComputers" className={labelClass}>Total Computers <span className="text-red-500">*</span></label>
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

                    <section>
                        <h3 className={sectionTitleClass}>Plan & Other Details</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label htmlFor="planValidityDays" className={labelClass}>Plan Validity <span className="text-red-500">*</span></label>
                                <select id="planValidityDays" {...register("planValidityDays", { required: "Plan selection is required" })} className={inputClass}>
                                    <option value="">-- Select Plan --</option>
                                    {plans.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                                {errors.planValidityDays && <p className={errorClass}>{errors.planValidityDays.message}</p>}
                            </div>
                            <div></div>
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label htmlFor="franchiseLogo" className={labelClass}>Franchise Logo <span className="text-red-500">*</span></label>
                                <input type="file" id="franchiseLogo" {...register("franchiseLogo", { required: "Franchise logo is required" })} className="mt-2 block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/jpeg,image/png,image/jpg" />
                                <p className="text-xs text-gray-500 mt-2">
                                    <strong>Important:</strong> Upload a square logo (1:1 aspect ratio) in JPG or PNG format. Recommended minimum size is 100x100 pixels. Also, remove any unncessary background color (if present). This logo will appear on student ID cards and admission forms.
                                </p>
                                {errors.franchiseLogo && <p className={errorClass}>{errors.franchiseLogo.message}</p>}
                                {franchiseLogoFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{franchiseLogoFile[0].name}</span>}
                            </div>
                            <div>
                                <label htmlFor="franchiseSignature" className={labelClass}>Franchise Signature <span className="text-red-500">*</span></label>
                                <input type="file" id="franchiseSignature" {...register("franchiseSignature", { required: "Franchise signature is required" })} className="mt-2 block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
                                {errors.franchiseSignature && <p className={errorClass}>{errors.franchiseSignature.message}</p>}
                                {franchiseSignatureFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{franchiseSignatureFile[0].name}</span>}
                            </div>
                            <div>
                                <label htmlFor="ownerAadhar" className={labelClass}>Owner Aadhar (PDF) <span className="text-gray-500">50 KB – 1 MB</span> <span className="text-red-500">*</span></label>
                                <input
                                  type="file"
                                  id="ownerAadhar"
                                  accept="application/pdf"
                                  {...register("ownerAadhar", {
                                    required: "Owner Aadhar PDF is required",
                                    validate: {
                                      size: (files) => {
                                        const f = files?.[0];
                                        if (!f) return true;
                                        const min = 50 * 1024; // 50 KB
                                        const max = 1 * 1024 * 1024; // 1 MB
                                        return (f.size >= min && f.size <= max) || "File size must be between 50 KB and 1 MB";
                                      }
                                    }
                                  })}
                                  onChange={(e) => handleInstantFileCheck(e, 'ownerAadhar', { minBytes: 50 * 1024, maxBytes: 1 * 1024 * 1024, allowedMimes: ['application/pdf'], label: 'Owner Aadhar' })}
                                  className="mt-2 block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {errors.ownerAadhar && <p className={errorClass}>{errors.ownerAadhar.message}</p>}
                                {ownerAadharFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{ownerAadharFile[0].name}</span>}
                            </div>
                            <div>
                                <label htmlFor="ownerPan" className={labelClass}>Owner PAN (PDF) <span className="text-gray-500">20 KB – 500 KB</span> <span className="text-red-500">*</span></label>
                                <input
                                  type="file"
                                  id="ownerPan"
                                  accept="application/pdf"
                                  {...register("ownerPan", {
                                    required: "Owner PAN PDF is required",
                                    validate: {
                                      size: (files) => {
                                        const f = files?.[0];
                                        if (!f) return true;
                                        const min = 20 * 1024; // 20 KB
                                        const max = 500 * 1024; // 500 KB
                                        return (f.size >= min && f.size <= max) || "File size must be between 20 KB and 500 KB";
                                      }
                                    }
                                  })}
                                  onChange={(e) => handleInstantFileCheck(e, 'ownerPan', { minBytes: 20 * 1024, maxBytes: 500 * 1024, allowedMimes: ['application/pdf'], label: 'Owner PAN' })}
                                  className="mt-2 block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {errors.ownerPan && <p className={errorClass}>{errors.ownerPan.message}</p>}
                                {ownerPanFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{ownerPanFile[0].name}</span>}
                            </div>
                            <div>
                                <label htmlFor="ownerHigherEducation" className={labelClass}>Owner Higher Education Certificate (PDF/JPG) <span className="text-gray-500">50 KB – 2 MB</span> <span className="text-red-500">*</span></label>
                                <input
                                  type="file"
                                  id="ownerHigherEducation"
                                  accept="application/pdf,image/jpeg,image/jpg"
                                  {...register("ownerHigherEducation", {
                                    required: "Higher education certificate is required",
                                    validate: {
                                      size: (files) => {
                                        const f = files?.[0];
                                        if (!f) return true;
                                        const min = 50 * 1024; // 50 KB
                                        const max = 2 * 1024 * 1024; // 2 MB
                                        return (f.size >= min && f.size <= max) || "File size must be between 50 KB and 2 MB";
                                      }
                                    }
                                  })}
                                  onChange={(e) => handleInstantFileCheck(e, 'ownerHigherEducation', { minBytes: 50 * 1024, maxBytes: 2 * 1024 * 1024, allowedMimes: ['application/pdf','image/jpeg','image/jpg'], label: 'Higher Education Certificate' })}
                                  className="mt-2 block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {errors.ownerHigherEducation && <p className={errorClass}>{errors.ownerHigherEducation.message}</p>}
                                {ownerHigherEducationFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{ownerHigherEducationFile[0].name}</span>}
                            </div>
                            <div>
                                <label htmlFor="ownerPhoto" className={labelClass}>Owner Passport Size Photo (JPG/PNG) <span className="text-gray-500">20 KB – 200 KB</span> <span className="text-red-500">*</span></label>
                                <input
                                  type="file"
                                  id="ownerPhoto"
                                  accept="image/jpeg,image/jpg,image/png"
                                  {...register("ownerPhoto", {
                                    required: "Owner passport photo is required",
                                    validate: {
                                      size: (files) => {
                                        const f = files?.[0];
                                        if (!f) return true;
                                        const min = 20 * 1024; // 20 KB
                                        const max = 200 * 1024; // 200 KB
                                        return (f.size >= min && f.size <= max) || "File size must be between 20 KB and 200 KB";
                                      }
                                    }
                                  })}
                                  onChange={(e) => handleInstantFileCheck(e, 'ownerPhoto', { minBytes: 20 * 1024, maxBytes: 200 * 1024, allowedMimes: ['image/jpeg','image/jpg','image/png'], label: 'Owner Passport Photo' })}
                                  className="mt-2 block w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition duration-200 ease-in-out hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {errors.ownerPhoto && <p className={errorClass}>{errors.ownerPhoto.message}</p>}
                                {ownerPhotoFile?.[0] && <span className="text-sm text-gray-500 mt-1 block truncate">{ownerPhotoFile[0].name}</span>}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className={sectionTitleClass}>Terms and Conditions</h3>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 max-h-60 overflow-y-auto shadow-inner">
                                <h4 className="font-bold text-gray-900 mb-6 text-xl border-b border-blue-300 pb-2">Terms and Conditions</h4>
                                <div className="space-y-5 text-gray-800 text-sm leading-relaxed">
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
                                <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <input
                                    type="checkbox"
                                    id="confirmTerms"
                                    {...register("confirmTerms", { 
                                        required: "You must confirm that you have read and agreed to all terms and conditions" 
                                    })}
                                    className="mt-1 h-6 w-6 text-blue-600 bg-white border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:ring-2 cursor-pointer transition duration-200"
                                />
                            <label htmlFor="confirmTerms" className="text-base font-semibold text-gray-800 leading-relaxed cursor-pointer">
                                 I/We hereby confirm that we have fully read, understood, and agreed to abide by all the terms and conditions mentioned above. <span className="text-red-500">*</span>
                            </label>
                        </div>
                            </div>
                        </div>
            
                        {errors.confirmTerms && <p className={errorClass}>{errors.confirmTerms.message}</p>}
                    </section>

                        <div className="flex justify-center pt-10 border-t-2 border-gray-200 mt-12">
                            <button
                                type="submit"
                                className={`px-12 py-4 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:transform-none ${
                                    !confirmTermsValue || isLoading || !validationStatus.email.unique || !validationStatus.mobile.unique
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
                                }`}
                                disabled={isLoading || !confirmTermsValue || !validationStatus.email.unique || !validationStatus.mobile.unique}
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>Proceed to OTP Verification</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>
                </form>
            )}

            {modalStep === 'otp' && (
                <div className="space-y-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">OTP Verification</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                        <p className="text-gray-700 text-lg">
                            An OTP has been sent to <span className="font-semibold text-blue-600">{userEmailForOtp}</span>.
                        </p>
                        <p className="text-gray-600 mt-2">
                            Please enter the 6-digit code below to complete your application.
                        </p>
                    </div>
                    
                    <div className="max-w-md mx-auto">
                        <label htmlFor="otpInput" className={labelClass}>OTP Code <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="otpInput"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            className="mt-2 block w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl text-center font-mono tracking-widest transition duration-200 ease-in-out placeholder-gray-400 hover:border-gray-300"
                            placeholder="000000"
                            maxLength="6"
                        />
                        {otpError && <p className={errorClass}>{otpError}</p>}
                    </div>

                    <div className="flex justify-center space-x-6 pt-10 border-t-2 border-gray-200 mt-12">
                        <button
                            type="button"
                            onClick={() => setModalStep('form')}
                            className="px-8 py-3 border-2 border-gray-300 rounded-xl shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition duration-200 ease-in-out transform hover:scale-105"
                            disabled={isLoading}
                        >
                            ← Back to Form
                        </button>
                        <button
                            type="button"
                            onClick={handleFinalSubmit}
                            className="px-12 py-3 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50"
                            disabled={isLoading || otpValue.length !== 6}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <span>Submit Application</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {modalStep === 'success' && (
                <div className="space-y-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-green-100 to-blue-100 shadow-lg">
                        <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>

                    <div>
                        <h2 className="text-4xl font-bold text-green-600 mb-4">🎉 Application Submitted Successfully!</h2>
                        <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full mb-6"></div>
                        <div className="space-y-4 text-gray-700">
                            <p className="text-lg">
                                Thank you for applying for a franchise with <span className="font-semibold text-black">SK EDUTECH</span>!
                            </p>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-left shadow-inner">
                                <h3 className="font-bold text-blue-800 mb-4 text-xl">What happens next?</h3>
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
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 shadow-inner">
                                    <p className="text-base text-gray-700 mb-2">
                                        <span className="font-semibold">Application ID:</span> 
                                    </p>
                                    <p className="font-mono text-xl text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200 text-center">
                                        {applicationId}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-3 text-center">
                                        📋 Please save this ID for future reference
                                    </p>
                                </div>
                            )}
                            <p className="text-base text-gray-600">
                                We appreciate your interest in partnering with us and look forward to welcoming you to the SK EDUTECH family!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApplyFranchiseModal;
