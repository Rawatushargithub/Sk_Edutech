import React, { useState , useEffect } from "react";
import axios from "axios";
import Fees_table from "./Fees_table";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL  from "../../../config"

const AddNewStudent = () => { 
 
  const [formData, setFormData] = useState({
    // Personal Details
    studentPhoto: null,
    studentSignature: null, 
    // rollNumber removed as it will be auto-generated in the backend
    abbreviation: "Mr.",
    studentName: "",
    relationType: "S/O",
    fatherOrHusbandName: "",
    includeFatherHusband: true,
    surnameName: "",
    includeSurname: true,
    motherName: "",
    studentMobile: "",
    alternateMobile: "",
    email: "",
    dob: "",
    gender: "Male",
    city: "",
    postCode: "",
    permanentAddress: "",
    caste: "",
    admissionDate:"",

    // Academic Details - Modified courseInterested structure
    courseInterested: {
      courseName: "",
      courseCode: ""
    },
    examType: "Offline",
    referralCode: "",
    qualifications: "",
    occupation: "",
    selectedBatch:"",

    // Financial Details 
    courseFees: 0,
    discountRate: "amount-",
    discountAmount: 0,
    totalFees: 0,
    feesReceived: 0, 
    paymentMode: "Cash", 
    installments: [],
  });
 
  const [courses, setCourses] = useState([]);
  // State for batches
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [remainingSeats, setRemainingSeats] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch courses from the backend
    
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/institute_courses/getCourses`);
        console.log("course fetching :: " , response)
        setCourses(response.data); // Assuming the response is an array of course objects
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

const validateForm = (formData) => {
  const errors = {};
  
  // Roll number validation removed as it will be auto-generated
  
  if (!formData.studentName?.trim()) {
    errors.studentName = "Student name is required";
  }
  
  if (!formData.studentMobile?.trim()) {
    errors.studentMobile = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(formData.studentMobile)) {
    errors.studentMobile = "Please enter a valid 10-digit mobile number";
  }
  
  if (!formData.dob) {
    errors.dob = "Date of birth is required";
  }
  
  if (!formData.admissionDate) {
    errors.admissionDate = "Admission date is required";
  }
  
  if (!formData.courseInterested.courseName) {
    errors.courseInterested = "Course selection is required";
  }
  
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (!formData.studentPhoto) {
    errors.studentPhoto = "Student photo is required";
  }
  
  if (!formData.studentSignature) {
    errors.studentSignature = "Student signature is required";
  }
  
  // Fee validation
  if (formData.courseFees < 0) {
    errors.courseFees = "Course fees cannot be negative";
  }
  
  if (formData.totalFees < 0) {
    errors.totalFees = "Total fees cannot be negative";
  }
  
  if (formData.feesReceived > formData.totalFees) {
    errors.feesReceived = "Fees received cannot be greater than total fees";
  }
  
  return errors;
};

const getErrorMessage = (error) => {
  if (error.response?.data?.success === false) {
    const errorData = error.response.data;
    
    switch (errorData.code) {
      case 'MISSING_REQUIRED_FIELDS':
        return `Missing required fields: ${errorData.missingFields?.join(', ')}`;
      case 'INVALID_MOBILE_FORMAT':
        return "Please enter a valid 10-digit mobile number";
      case 'INVALID_EMAIL_FORMAT':
        return "Please enter a valid email address";
      case 'DUPLICATE_ROLL_NUMBER':
        return "A student with this roll number already exists";
      case 'DUPLICATE_EMAIL':
        return "A student with this email already exists";
      case 'INVALID_COURSE_SELECTION':
        return "Please select a valid course";
      case 'BATCH_REQUIRED':
        return "Please select a batch";
      case 'BATCH_NOT_FOUND':
        return "Selected batch not found";
      case 'BATCH_FULL':
        return "Selected batch has no available seats";
      case 'PHOTO_REQUIRED':
        return "Student photo is required";
      case 'SIGNATURE_REQUIRED':
        return "Student signature is required";
      case 'INVALID_COURSE_FEES':
        return "Please enter valid course fees";
      case 'INVALID_TOTAL_FEES':
        return "Please enter valid total fees";
      case 'INVALID_FEES_RECEIVED':
        return "Fees received cannot be greater than total fees";
      case 'INSUFFICIENT_BALANCE':
        return `Insufficient wallet balance. Required: ₹${errorData.requiredAmount}, Current: ₹${errorData.currentBalance}`;
      case 'PHOTO_UPLOAD_FAILED':
        return "Failed to upload student photo. Please try again.";
      case 'SIGNATURE_UPLOAD_FAILED':
        return "Failed to upload student signature. Please try again.";
      case 'DUPLICATE_ENTRY':
        return "Duplicate entry detected. Please check roll number and email.";
      case 'TRANSACTION_FAILED':
        return "Database transaction failed. Please try again.";
      default:
        return errorData.message || "An error occurred while registering the student";
    }
  }
  
  return error.response?.data?.message || error.message || "An unexpected error occurred";
};


  
// Enhanced handleChange with validation
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  let processedValue = type === "checkbox" ? checked : value;
  
  // Real-time validation for specific fields
  if (name === 'studentMobile' || name === 'alternateMobile') {
    // Allow only numbers and limit to 10 digits
    processedValue = value.replace(/\D/g, '').slice(0, 10);
  }
  
  if (name === 'email') {
    // Basic email format check
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      // You can add visual feedback here if needed
    }
  }
  
  // Roll number handling removed as it will be auto-generated
  
  if (name === 'postCode') {
    // Allow only numbers and limit to 6 digits
    processedValue = value.replace(/\D/g, '').slice(0, 6);
  }
  
  // Update form data
  setFormData({
    ...formData,
    [name]: processedValue,
  });
};


  // New handler for course selection
 const handleCourseChange = (e) => {
  const selectedCourseId = e.target.value;
   if (selectedCourseId) {
    const selectedCourse = courses.find(course => course._id === selectedCourseId);
    
    if (selectedCourse) {
      setFormData({
        ...formData,
        courseInterested: {
          courseName: selectedCourse.courseName,
          courseCode: selectedCourse.courseCode
        },
        // Set the course fees from the selected course
        courseFees: selectedCourse.courseFees || 0
      });
    } else {
      toast.error("Invalid course selection");
    }
  } else {
    // Reset course selection and fees when no course is selected
    setFormData({
      ...formData,
      courseInterested: {
        courseName: "",
        courseCode: ""
      },
      courseFees: 0
    });
  }
  }

 const handleFileChange = (e) => {
  const { name, files } = e.target;
  const file = files[0];
  
  if (file) {
    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${name === 'studentPhoto' ? 'Photo' : 'Signature'} file size should be less than 5MB`);
      return;
    }
    
    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`${name === 'studentPhoto' ? 'Photo' : 'Signature'} must be a JPEG, PNG, or JPG file`);
      return;
    }
    
    setFormData({
      ...formData,
      [name]: file
    });
  }
};


  // Updated handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Client-side validation
  const validationErrors = validateForm(formData);
  if (Object.keys(validationErrors).length > 0) {
    const firstError = Object.values(validationErrors)[0];
    toast.error(firstError);
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const formDataToSend = new FormData();
    const franchiseId = localStorage.getItem("franchiseID");
    const franchiseName = localStorage.getItem("franchiseName");
    console.log("franchiseId:", franchiseId);
    console.log("franchiseName:", franchiseName);
    
    if (franchiseId) {
      formDataToSend.append("franchiseId", franchiseId);
    }
    if (franchiseName) {
      formDataToSend.append("franchiseName", franchiseName);
    }
    
    // Append files
    if (formData.studentPhoto) {
      formDataToSend.append("studentPhoto", formData.studentPhoto); 
    }
    if (formData.studentSignature) {
      formDataToSend.append("studentSignature", formData.studentSignature);
    }

    // Append other fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "studentPhoto" && key !== "studentSignature" && key !== "courseInterested"  && value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        } 
      }
    }); 
    
    // Handle courseInterested separately
    formDataToSend.append("courseInterested", JSON.stringify(formData.courseInterested));
    
    const response = await axios.post( 
      `${API_BASE_URL}/api/v1/institute_student/register_student`,
      formDataToSend,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    
    if (response.data.success) {
      toast.success("Student registered successfully!");
      
      // Reset form
      setFormData({
        studentPhoto: null,
        studentSignature: null,
        // rollNumber removed as it will be auto-generated
        abbreviation: "Mr.",
        studentName: "",
        relationType: "S/O",
        fatherOrHusbandName: "",
        includeFatherHusband: true,
        surnameName: "",
        includeSurname: true,
        motherName: "",
        studentMobile: "",
        alternateMobile: "",
        email: "",
        dob: "",
        gender: "Male",
        city: "",
        postCode: "",
        permanentAddress: "",
        caste: "",
        admissionDate:"",
        courseInterested: {
          courseName: "",
          courseCode: ""
        },
        examType: "Offline",
        referralCode: "",
        qualifications: "",
        occupation: "",
        selectedBatch:"",
        courseFees: 0,
        discountRate: "amount-",
        discountAmount: 0,
        totalFees: 0,
        feesReceived: 0, 
        installments: [],
      });
    }
    
  } catch (error) {
    console.error("Registration error:", error);
    
    const errorMessage = getErrorMessage(error);
    toast.error(errorMessage);
    
    // Log detailed error for debugging
    if (error.response?.data) {
      console.log("Detailed error:", error.response.data);
    }
    
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-blue-50">
       <ToastContainer position="top-right" autoClose={5000} />
      <div className="w-full bg-white p-4 sm:p-6 rounded-2xl shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-red-500">
          Add New Student
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo and Signature Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Student Photo</label>
              <img
                src={
                  formData.studentPhoto
                    ? URL.createObjectURL(formData.studentPhoto)
                    : "/assets/Student_photo.png"
                }
                alt="Student Photo Preview"
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover mb-2 rounded-lg border"
              />
              <input
                type="file"
                name="studentPhoto"
                onChange={handleFileChange}
                className="p-2 w-full text-sm border rounded-md"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Student Signature</label>
              <img
                src={
                  formData.studentSignature
                    ? URL.createObjectURL(formData.studentSignature)
                    : "/assets/Signature.png"
                }
                alt="Student Signature Preview"
                className="w-24 h-8 sm:w-32 sm:h-10 object-cover mb-2 rounded border"
              />
              <input
                type="file"
                name="studentSignature"
                onChange={handleFileChange}
                className="p-2 w-full text-sm border rounded-md"
              />
            </div>
            {/* Roll Number field removed as it will be auto-generated in the backend */}
          </div>

          {/* Name Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Abbreviation</label>
              <select
                name="abbreviation"
                value={formData.abbreviation}
                onChange={handleChange}
                className="p-2 border-gray-300 rounded-md border w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Miss">Miss</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Student Name *</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="p-2 border-gray-300 rounded-md border w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Relation</label>
              <select
                name="relationType"
                value={formData.relationType}
                onChange={handleChange}
                className="p-2 border-gray-300 rounded-md border w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="S/O">S/O</option>
                <option value="D/O">D/O</option>
                <option value="W/O">W/O</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Father/Husband Name</label>
              <input
                type="text"
                name="fatherOrHusbandName"
                value={formData.fatherOrHusbandName}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <label className="inline-flex items-center mt-2 text-sm text-blue-600">
                <input
                  type="checkbox"
                  name="includeFatherHusband"
                  checked={formData.includeFatherHusband}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show on certificate
              </label>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Surname Name</label>
              <input
                type="text"
                name="surnameName"
                value={formData.surnameName}
                onChange={handleChange}
                className="p-2 border-gray-300 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <label className="inline-flex items-center mt-2 text-sm text-blue-600">
                <input
                  type="checkbox"
                  name="includeSurname"
                  checked={formData.includeSurname}
                  onChange={handleChange}
                  className="mr-2"
                />
                Show on certificate
              </label>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Mother Name</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="border-gray-300 border rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Contact and Course Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Course Interested</label>
              <select
                name="courseInterested"
                onChange={handleCourseChange}
                value={formData.courseInterested.courseName ? 
                  courses.find(course => 
                    course.courseName === formData.courseInterested.courseName && 
                    course.courseCode === formData.courseInterested.courseCode
                  )?._id || "" : ""}
                className="p-2 w-full border-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id} >
                    {course.courseName} ({course.courseCode})
                  </option>
                ))} 
              </select>
              {formData.courseInterested.courseName && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {formData.courseInterested.courseName} - {formData.courseInterested.courseCode}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Student Mobile</label>
              <input
                type="text"
                name="studentMobile"
                value={formData.studentMobile}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Alternate Mobile</label>
              <input
                type="text"
                name="alternateMobile"
                value={formData.alternateMobile}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Post Code</label>
              <input
                type="text"
                name="postCode"
                value={formData.postCode}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Permanent Address</label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                rows={3}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Academic Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Exam Type</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Referral Code</label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Caste</label>
              <input
                type="text"
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div> 
          </div>

          {/* Additional Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="border-gray-300 border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Fees Table Component */}
          <div className="mt-6">
            <Fees_table 
              handleSubmit={handleSubmit}   
              formData={formData} 
              handleChange={handleChange} 
              setFormData={setFormData}
              batches={batches} 
              setBatches={setBatches} 
              selectedBatch={selectedBatch} 
              setSelectedBatch={setSelectedBatch} 
              remainingSeats={remainingSeats} 
              setRemainingSeats={setRemainingSeats}
              isSubmitting={isSubmitting}  
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewStudent;

