import React, { useState, useEffect } from "react";
import { Calendar, Trash2 } from "lucide-react";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useStudentContext } from "../../context/StudentContext.jsx";
import API_BASE_URL from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EnquiryForm = () => {
  const { addStudent } = useStudentContext();
  const [formData, setFormData] = useState({
    abbreviation: "Mr.",
    studentName: "",
    relationType: "S/o",
    fatherHusbandName: "",
    surnameName: "",
    motherName: "",
    courseInterested: {
      courseName: "",
      courseCode: "",
    },
    studentMobile: "",
    alternateMobile: "",
    email: "",
    dob: "",
    gender: "Male",
    city: "",
    postCode: "",
    permanentAddress: "",
    referralCode: "",
    caste: "",
    qualifications: "",
    occupation: "",
    admissionDate: new Date().toISOString().split("T")[0],
    enquiryDate: new Date().toISOString().split("T")[0],
    courseFees: 0,
    discountRate: 0,
    discountAmount: 0,
    totalFees: 0,
    feesReceived: 0,
    paymentMode: "Cash",
    balance: 0,
    remarks: "",
    installments: [],
    // Status Management Fields - Simplified
    enquiryStatus: 'OPEN',
    holdUntilDate: '',
    contactAttempts: 0,
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const franchiseId = localStorage.getItem('franchiseID');
        const response = await axios.get(`${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const courseFees = parseFloat(formData.courseFees) || 0;
    const discountRate = parseFloat(formData.discountRate) || 0;
    const feesReceived = parseFloat(formData.feesReceived) || 0;

    const discountAmount = (courseFees * discountRate) / 100;
    const totalFees = courseFees - discountAmount;
    const balance = totalFees - feesReceived;

    setFormData(prev => ({
      ...prev,
      discountAmount: discountAmount.toFixed(2),
      totalFees: totalFees.toFixed(2),
      balance: balance.toFixed(2)
    }));
  }, [formData.courseFees, formData.discountRate, formData.feesReceived]);

  // Convert date from YYYY-MM-DD to DD-MM-YYYY format
  const convertDateToBackendFormat = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; // Change from hyphens to forward slashes
  };

  // Convert date from DD-MM-YYYY to YYYY-MM-DD format for input display
  const convertDateToInputFormat = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
      return dateString; // Already in YYYY-MM-DD format
    }
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert DD-MM-YYYY to YYYY-MM-DD
    }
    return dateString;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    if (selectedCourseId) {
      const selectedCourse = courses.find(
        (course) => course._id === selectedCourseId
      );
      if (selectedCourse) {
        setFormData({
          ...formData,
          courseInterested: {
            courseName: selectedCourse.courseName,
            courseCode: selectedCourse.courseCode,
          },
          courseFees: selectedCourse.courseFees || 0,
        });
      }
    } else {
      setFormData({
        ...formData,
        courseInterested: { courseName: "", courseCode: "" },
        courseFees: 0,
      });
    }
  };

  const addInstallment = () => {
    setFormData({
      ...formData,
      installments: [...formData.installments, { installmentDate: "", installmentAmount: 0 }]
    });
  };

  const handleInstallmentChange = (index, e) => {
    const { name, value } = e.target;
    const installments = [...formData.installments];
    
    if (name === 'installmentAmount') {
      installments[index][name] = parseFloat(value) || 0;
    } else {
      installments[index][name] = value;
    }
    
    setFormData({ ...formData, installments });
  };

  const removeInstallment = (index) => {
    const installments = [...formData.installments];
    installments.splice(index, 1);
    setFormData({ ...formData, installments });
  };

  const handlenquiry = async (e) => {
    e.preventDefault();
    if (!formData.studentName.trim()) {
      toast.error("Student Name is a required field");
      return;
    }
  
    if (!formData.courseInterested.courseName) {
      toast.error("Course Interested is a required field");
      return;
    }
    if (!formData.studentMobile.trim()) {
      toast.error("Student Mobile is a required field");
      return;
    }
    if (formData.studentMobile.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is a required field");
      return;
    }
    
    if (!formData.admissionDate) {
      toast.error("Admission Date is a required field");
      return;
    }
    if (!formData.enquiryDate) {
      toast.error("Enquiry Date is a required field");
      return;
    }

    const franchiseId = localStorage.getItem("franchiseID");
    
    // Prepare student data with proper formatting and type conversion
    const studentData = {
      ...formData,
      studentName: `${formData.abbreviation} ${formData.studentName}`,
      franchiseId: franchiseId,
      status: "pending",
      // Convert dates to DD-MM-YYYY format for backend
      dob: convertDateToBackendFormat(formData.dob),
      admissionDate: convertDateToBackendFormat(formData.admissionDate),
      enquiryDate: convertDateToBackendFormat(formData.enquiryDate),
      // Ensure numeric fields are properly converted
      courseFees: parseFloat(formData.courseFees) || 0,
      discountRate: parseFloat(formData.discountRate) || 0,
      discountAmount: parseFloat(formData.discountAmount) || 0,
      totalFees: parseFloat(formData.totalFees) || 0,
      feesReceived: parseFloat(formData.feesReceived) || 0,
      balance: parseFloat(formData.balance) || 0,
      // Process installments to ensure proper format
      installments: formData.installments.map(installment => ({
        installmentDate: convertDateToBackendFormat(installment.installmentDate),
        installmentAmount: parseFloat(installment.installmentAmount) || 0
      })),
      // Status management fields - Simplified
      enquiryStatus: formData.enquiryStatus,
      holdUntilDate: formData.holdUntilDate || null,
      contactAttempts: 0,
    };

    console.log("Sending student data:", studentData); // Debug log

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/v1/institute_enquiry`, studentData);
      addStudent(response.data);
      toast.success("Enquiry submitted successfully!");
      setLoading(false);
      setTimeout(() => navigate("/institute/Enquiries"), 1500);
    } catch (err) {
      setLoading(false);
      setError("Failed to submit enquiry");
      const errorMessage = err.response?.data?.message || "Failed to submit enquiry. Please try again. Ensure that all fields are filled.";
      toast.error(errorMessage);
      console.error("Error submitting enquiry:", err.response?.data || err.message);
    }
  };

  const GoBack = () => navigate("/institute");

  const inputStyle = "w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-2";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-[#457B9D] px-8 py-4">
            <h1 className="text-2xl font-bold text-white">Add New Student Enquiry</h1>
          </div>
          <form onSubmit={handlenquiry} className="p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h2>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-2">
                  <label htmlFor="abbreviation" className={labelStyle}>Title </label>
                  <select id="abbreviation" name="abbreviation" value={formData.abbreviation} onChange={handleInputChange} className={inputStyle}>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>
                <div className="col-span-5">
                  <label htmlFor="studentName" className={labelStyle}>Student Name {requiredStar}</label>
                  <input type="text" id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} required placeholder="Enter Student Name" className={inputStyle} />
                </div>
                <div className="col-span-5">
                  <label htmlFor="surnameName" className={labelStyle}>Surname</label>
                  <input type="text" id="surnameName" name="surnameName" value={formData.surnameName} onChange={handleInputChange} placeholder="Enter Surname" className={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-3">
                  <label htmlFor="relationType" className={labelStyle}>Relation </label>
                  <select id="relationType" name="relationType" value={formData.relationType} onChange={handleInputChange} className={inputStyle}>
                    <option value="S/o">S/o</option>
                    <option value="D/o">D/o</option>
                    <option value="W/o">W/o</option>
                  </select>
                </div>
                <div className="col-span-9">
                  <label htmlFor="fatherHusbandName" className={labelStyle}>Father/Husband Name </label>
                  <input type="text" id="fatherHusbandName" name="fatherHusbandName" value={formData.fatherHusbandName} onChange={handleInputChange} placeholder="Enter Father/Husband Name" className={inputStyle} />
                </div>
              </div>
              <div>
                <label htmlFor="motherName" className={labelStyle}>Mother Name </label>
                <input type="text" id="motherName" name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="Enter Mother Name" className={inputStyle} />
              </div>
            </div>

            {/* Course & Contact Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Course & Contact Details</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="courseInterested" className={labelStyle}>Course Interested {requiredStar}</label>
                  <select id="courseInterested" name="courseInterested" onChange={handleCourseChange} value={formData.courseInterested.courseName ? courses.find(c => c.courseName === formData.courseInterested.courseName)?._id : ""} required className={inputStyle}>
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.courseName} ({course.courseCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="studentMobile" className={labelStyle}>Student Mobile {requiredStar}</label>
                  <input type="tel" id="studentMobile" name="studentMobile" value={formData.studentMobile} onChange={handleInputChange} required placeholder="Enter Mobile Number" className={inputStyle} maxLength="10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="alternateMobile" className={labelStyle}>Alternate Mobile</label>
                  <input type="tel" id="alternateMobile" name="alternateMobile" value={formData.alternateMobile} onChange={handleInputChange} placeholder="Enter Alternate Mobile" className={inputStyle} maxLength="10" />
                </div>
                <div>
                  <label htmlFor="email" className={labelStyle}>Email {requiredStar}</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="Enter Email Address" className={inputStyle} />
                </div>
              </div>
            </div>

            {/* Status Management Section - Simplified */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Status Management</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Enquiry Status</label>
                  <select name="enquiryStatus" value={formData.enquiryStatus} onChange={handleInputChange} className={inputStyle}>
                    <option value="OPEN">Open</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
                
                {formData.enquiryStatus === 'ON_HOLD' && (
                  <div>
                    <label className={labelStyle}>Contact After Date</label>
                    <input type="date" name="holdUntilDate" value={formData.holdUntilDate} onChange={handleInputChange} className={inputStyle} />
                  </div>
                )}
              </div>
            </div>

            {/* Fee Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Fee Details</h2>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label htmlFor="courseFees" className={labelStyle}>Course Fees (₹)</label>
                  <input type="number" id="courseFees" name="courseFees" value={formData.courseFees} onChange={handleInputChange} className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="discountRate" className={labelStyle}>Discount Rate (%)</label>
                  <input type="number" id="discountRate" name="discountRate" value={formData.discountRate} onChange={handleInputChange} className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="discountAmount" className={labelStyle}>Discount Amount (₹)</label>
                  <input type="number" id="discountAmount" name="discountAmount" value={formData.discountAmount} className={inputStyle} readOnly />
                </div>
                <div>
                  <label htmlFor="totalFees" className={labelStyle}>Total Fees (₹)</label>
                  <input type="number" id="totalFees" name="totalFees" value={formData.totalFees} className={inputStyle} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="remarks" className={labelStyle}>Remarks</label>
                  <input type="text" id="remarks" name="remarks" value={formData.remarks} onChange={handleInputChange} className={inputStyle} />
                </div>
              </div>
            </div>

            {/* Installment Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Installment Details</h2>
              {formData.installments.map((installment, index) => (
                <div key={index} className="grid grid-cols-3 gap-6 items-end">
                  <div>
                    <label className={labelStyle}>Installment Date</label>
                    <input 
                      type="date" 
                      name="installmentDate" 
                      value={installment.installmentDate} 
                      onChange={(e) => handleInstallmentChange(index, e)} 
                      className={inputStyle} 
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Installment Amount (₹)</label>
                    <input 
                      type="number" 
                      name="installmentAmount" 
                      value={installment.installmentAmount} 
                      onChange={(e) => handleInstallmentChange(index, e)} 
                      className={inputStyle} 
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-center">
                    <button 
                      type="button" 
                      onClick={() => removeInstallment(index)} 
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Remove Installment"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addInstallment} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Add Installment
              </button>
            </div>

            {/* Additional Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Additional Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dob" className={labelStyle}>Date of Birth </label>
                  <div className="relative">
                    <input 
                      type="date" 
                      id="dob" 
                      name="dob" 
                      value={formData.dob} 
                      onChange={handleInputChange} 
                      className={inputStyle} 
                    />
                    <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label htmlFor="gender" className={labelStyle}>Gender </label>
                  <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className={inputStyle}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className={labelStyle}>City</label>
                  <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter City" className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="postCode" className={labelStyle}>Postcode</label>
                  <input type="text" id="postCode" name="postCode" value={formData.postCode} onChange={handleInputChange} placeholder="Enter Postcode" className={inputStyle} maxLength="6" />
                </div>
                <div>
                  <label htmlFor="caste" className={labelStyle}>Caste</label>
                  <input type="text" id="caste" name="caste" value={formData.caste} onChange={handleInputChange} placeholder="Enter Caste" className={inputStyle} />
                </div>
              </div>
              <div>
                <label htmlFor="permanentAddress" className={labelStyle}>Permanent Address</label>
                <textarea id="permanentAddress" name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} placeholder="Enter Permanent Address..." rows={3} className={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="qualifications" className={labelStyle}>Qualifications</label>
                  <input type="text" id="qualifications" name="qualifications" value={formData.qualifications} onChange={handleInputChange} placeholder="Enter Qualifications" className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="occupation" className={labelStyle}>Occupation</label>
                  <input type="text" id="occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="Enter Occupation" className={inputStyle} />
                </div>
              </div>
            </div>

            {/* Other Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Other Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="referralCode" className={labelStyle}>Referral Code (If Any)</label>
                  <input type="text" id="referralCode" name="referralCode" value={formData.referralCode} onChange={handleInputChange} placeholder="Enter Referral Code" className={inputStyle} />
                </div>
                <div>
                  <label htmlFor="enquiryDate" className={labelStyle}>Enquiry Date {requiredStar}</label>
                  <div className="relative">
                    <input type="date" id="enquiryDate" name="enquiryDate" value={formData.enquiryDate} onChange={handleInputChange} required className={inputStyle} />
                    <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-[#457B9D] px-8 py-4 text-white rounded-md hover:bg-[#2e5369] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Save Enquiry"}
              </button>
              <button 
                type="button" 
                onClick={GoBack} 
                className="px-6 py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;
