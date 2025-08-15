import React, { useState, useEffect } from "react";
import Select from 'react-select';
import { Calendar } from "lucide-react";
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
    relation: "S/o",
    guardianName: "",
    motherName: "",
    // Updated courseInterested structure to match schema
    courseInterested: {
      courseName: "",
      courseCode: "",
    },
    studentMobile: "",
    alternateMobile: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    city: "",
    postcode: "",
    permanentAddress: "",
    referralCode: "",
    enquiryDate: new Date().toISOString().split("T")[0], // Set default to today
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);

  // Indian States Data
  const indianStates = [
    { value: "andhra-pradesh", label: "Andhra Pradesh" },
    { value: "arunachal-pradesh", label: "Arunachal Pradesh" },
    { value: "assam", label: "Assam" },
    { value: "bihar", label: "Bihar" },
    { value: "chhattisgarh", label: "Chhattisgarh" },
    { value: "goa", label: "Goa" },
    { value: "gujarat", label: "Gujarat" },
    { value: "haryana", label: "Haryana" },
    { value: "himachal-pradesh", label: "Himachal Pradesh" },
    { value: "jharkhand", label: "Jharkhand" },
    { value: "karnataka", label: "Karnataka" },
    { value: "kerala", label: "Kerala" },
    { value: "madhya-pradesh", label: "Madhya Pradesh" },
    { value: "maharashtra", label: "Maharashtra" },
    { value: "manipur", label: "Manipur" },
    { value: "meghalaya", label: "Meghalaya" },
    { value: "mizoram", label: "Mizoram" },
    { value: "nagaland", label: "Nagaland" },
    { value: "odisha", label: "Odisha" },
    { value: "punjab", label: "Punjab" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "sikkim", label: "Sikkim" },
    { value: "tamil-nadu", label: "Tamil Nadu" },
    { value: "telangana", label: "Telangana" },
    { value: "tripura", label: "Tripura" },
    { value: "uttar-pradesh", label: "Uttar Pradesh" },
    { value: "uttarakhand", label: "Uttarakhand" },
    { value: "west-bengal", label: "West Bengal" },
  ];

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
                const franchiseId = localStorage.getItem('franchiseID');

        const response = await axios.get(`${API_BASE_URL}/api/v1/institute_courses/getCourses?franchiseId=${franchiseId}`);
        console.log("course fetching :: ", response);
        setCourses(response.data); // Assuming the response is an array of course object
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to fetch courses");
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validation for mobile number
    if (name === "studentMobile" || name === "alternateMobile") {
      if (value === "" || /^\d{0,10}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }

    // Validation for postcode
    if (name === "postcode") {
      if (value === "" || /^\d{0,6}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }

    // Validation for city (only letters, spaces, and basic punctuation)
    if (name === "city") {
      if (value === "" || /^[a-zA-Z\s.-]*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
      return;
    }

    // For all other fields
    setFormData({ ...formData, [name]: value });
  };

  // Handler for course selection
  const handleCourseChange = (selectedOption) => {
    if (selectedOption) {
      const selectedCourse = courses.find(
        (course) => course._id === selectedOption.value
      );

      if (selectedCourse) {
        setFormData({
          ...formData,
          courseInterested: {
            courseName: selectedCourse.courseName,
            courseCode: selectedCourse.courseCode,
          },
        });
      } else {
        toast.error("Invalid course selection");
      }
    } else {
      // Reset course selection if no course is selected
      setFormData({
        ...formData,
        courseInterested: {
          courseName: "",
          courseCode: "",
        },
      });
    }
  };

  const handlenquiry = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.studentName.trim()) {
      toast.error("Student name is required");
      return;
    }

    if (!formData.guardianName.trim()) {
      toast.error("Guardian name is required");
      return;
    }

    if (!formData.motherName.trim()) {
      toast.error("Mother name is required");
      return;
    }

    if (!formData.studentMobile.trim()) {
      toast.error("Student mobile is required");
      return;
    }

    if (formData.studentMobile.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    if (!formData.courseInterested.courseName) {
      toast.error("Please select a course");
      return;
    }

    const franchiseId = localStorage.getItem("franchiseID");

    // Create student object from form data
    const studentData = {
      studentName: `${formData.abbreviation} ${formData.studentName}`,
      relation: formData.relation,
      guardianName: formData.guardianName,
      motherName: formData.motherName,
      courseInterested: formData.courseInterested, // Now properly structured
      studentMobile: formData.studentMobile,
      alternateMobile: formData.alternateMobile,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      state: formData.state,
      city: formData.city,
      postcode: formData.postcode,
      permanentAddress: formData.permanentAddress,
      referralCode: formData.referralCode,
      enquiryDate: formData.enquiryDate,
      franchiseId: franchiseId,
      status: "pending",
    };

    try {
      setLoading(true);
      // Send data to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/institute_enquiry`,
        studentData
      );
      console.log(response);

      // Add to local context
      addStudent(response.data);

      // Show success message
      toast.success("Enquiry submitted successfully!");

      // Reset loading state
      setLoading(false);

      // Navigate back to home page after a short delay
      setTimeout(() => {
        navigate("/institute");
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError("Failed to submit enquiry");
      console.error("Error submitting enquiry:", err);

      // Better error handling
      const errorMessage =
        err.response?.data?.message ||
        "Failed to submit enquiry. Please try again.";
      toast.error(errorMessage);
    }
  };

  const GoBack = () => {
    navigate("/institute");
  };

  const inputStyle =
    "w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-2";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#457B9D] from-blue-500 to-blue-600 px-8 py-4">
            <h1 className="text-2xl font-bold text-white">
              Add New Student Enquiry
            </h1>
          </div>

          {/* Form Content */}
          <form onSubmit={handlenquiry} className="p-8 space-y-8">
            {/* Loading spinner */}
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-800">Processing...</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Personal Information
              </h2>

              {/* Name Row */}
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-2">
                  <label htmlFor="abbreviation" className={labelStyle}>
                    Title {requiredStar}
                  </label>
                  <select
                    id="abbreviation"
                    name="abbreviation"
                    value={formData.abbreviation}
                    onChange={handleInputChange}
                    required
                    className={inputStyle}
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Ms.">Ms.</option>
                  </select>
                </div>

                <div className="col-span-7">
                  <label htmlFor="studentName" className={labelStyle}>
                    Student Name {requiredStar}
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Student Name"
                    className={inputStyle}
                  />
                </div>

                <div className="col-span-3">
                  <label htmlFor="relation" className={labelStyle}>
                    Relation {requiredStar}{" "}
                  </label>
                  <select
                    id="relation"
                    name="relation"
                    value={formData.relation}
                    onChange={handleInputChange}
                    required
                    className={inputStyle}
                  >
                    <option value="S/o">S/o</option>
                    <option value="D/o">D/o</option>
                    <option value="W/o">W/o</option>
                  </select>
                </div>
              </div>

              {/* Family Information Row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="guardianName" className={labelStyle}>
                    Father/Husband Name {requiredStar}
                  </label>
                  <input
                    type="text"
                    id="guardianName"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Father/Husband Name"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="motherName" className={labelStyle}>
                    Mother Name {requiredStar}
                  </label>
                  <input
                    type="text"
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Mother Name"
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Course & Contact Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Course & Contact Details
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="courseInterested" className={labelStyle}>
                    Course Interested {requiredStar}
                  </label>
                  <Select
                    id="courseInterested"
                    name="courseInterested"
                    options={courses.map(course => ({
                      value: course._id,
                      label: `${course.courseName} (${course.courseCode})`
                    }))}
                    onChange={handleCourseChange}
                    value={courses.map(course => ({
                      value: course._id,
                      label: `${course.courseName} (${course.courseCode})`
                    })).find(option => 
                      courses.find(c => c._id === option.value)?.courseName === formData.courseInterested.courseName &&
                      courses.find(c => c._id === option.value)?.courseCode === formData.courseInterested.courseCode
                    ) || null}
                    isClearable
                    isSearchable
                    required
                    placeholder="Select or search for a course..."
                    className="w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    styles={{
                      control: (base) => ({ ...base, ...inputStyle, padding: '0.1rem' }),
                    }}
                  />
                  {formData.courseInterested.courseName && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {formData.courseInterested.courseName} -{" "}
                      {formData.courseInterested.courseCode}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="studentMobile" className={labelStyle}>
                    Student Mobile {requiredStar}
                  </label>
                  <input
                    type="tel"
                    id="studentMobile"
                    name="studentMobile"
                    value={formData.studentMobile}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Mobile Number"
                    className={inputStyle}
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="alternateMobile" className={labelStyle}>
                    Alternate Mobile
                  </label>
                  <input
                    type="tel"
                    id="alternateMobile"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleInputChange}
                    placeholder="Enter Alternate Mobile"
                    className={inputStyle}
                    maxLength="10"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelStyle}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter Email Address"
                    className={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Additional Details
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dateOfBirth" className={labelStyle}>
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={inputStyle}
                    />
                    <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="gender" className={labelStyle}>
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={inputStyle}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label htmlFor="state" className={labelStyle}>
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={inputStyle}
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className={labelStyle}>
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter City"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="postcode" className={labelStyle}>
                    Postcode
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    placeholder="Enter Postcode"
                    className={inputStyle}
                    maxLength="6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="permanentAddress" className={labelStyle}>
                  Permanent Address
                </label>
                <textarea
                  id="permanentAddress"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleInputChange}
                  placeholder="Enter Permanent Address..."
                  rows={3}
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                Other Information
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="referralCode" className={labelStyle}>
                    Referral Code (If Any)
                  </label>
                  <input
                    type="text"
                    id="referralCode"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    placeholder="Enter Referral Code"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label htmlFor="enquiryDate" className={labelStyle}>
                    Enquiry Date {requiredStar}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="enquiryDate"
                      name="enquiryDate"
                      value={formData.enquiryDate}
                      onChange={handleInputChange}
                      required
                      className={inputStyle}
                    />
                    <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#457B9D] from-blue-500 to-blue-600 px-8 py-4 text-white rounded-md hover:bg-[#2e5369] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
