import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../../../config";

const StudentProfileDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    studentPhoto: "",
    studentSignature: "",
    rollNumber: "",
    abbreviation: "",
    studentName: "",
    franchiseId: "",
    relationType: "",
    fatherHusbandName: "",
    includeFatherHusband: true,
    surnameName: "",
    includeSurname: true,
    motherName: "",
    courseInterested: {
      courseName: "",
      courseCode: "",
    },
    studentMobile: "",
    alternateMobile: "",
    email: "",
    dob: "",
    gender: "",
    city: "",
    postCode: "",
    permanentAddress: "",
    referralCode: "",
    caste: "",
    qualificat1xions: "",
    occupation: "",
    admissionDate: "",
    status: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const storedStudentData = localStorage.getItem("editStudentData");
        console.log("student data in profile data:-", storedStudentData);
        if (storedStudentData) {
          const studentData = JSON.parse(storedStudentData);
          delete studentData._id;
          setStudent(studentData);
          return;
        }
        setError("Could not load student data. Please try again.");
      } catch (err) {
        console.error("Error loading student data:", err);
        setError("Error loading student data: " + err.message);
      }
    };
    loadStudentData();
  }, [id]);

  useEffect(() => {
    if (student) {
      setOriginalData(student);
      setFormData((prev) => ({
        ...prev,
        ...student,
        studentPhoto: student.studentPhoto || "",
        studentSignature: student.studentSignature || "",
        rollNumber: student.rollNumber || "",
        abbreviation: student.abbreviation || "",
        studentName: student.studentName || "",
        franchiseId: student.franchiseId || "",
        relationType: student.relationType || "",
        fatherHusbandName: student.fatherHusbandName || "",
        includeFatherHusband:
          student.includeFatherHusband !== undefined
            ? student.includeFatherHusband
            : true,
        surnameName: student.surnameName || "",
        includeSurname:
          student.includeSurname !== undefined ? student.includeSurname : true,
        motherName: student.motherName || "",
        courseInterested: student.courseInterested || {
          courseName: "",
          courseCode: "",
        },
        studentMobile: student.studentMobile || "",
        alternateMobile: student.alternateMobile || "",
        email: student.email || "",
        dob: student.dob || "",
        gender: student.gender || "",
        city: student.city || "",
        postCode: student.postCode || "",
        permanentAddress: student.permanentAddress || "",
        referralCode: student.referralCode || "",
        caste: student.caste || "",
        qualifications: student.qualifications || "",
        occupation: student.occupation || "",
        admissionDate: student.admissionDate || "",
        status: student.status || false,
      }));
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === "checkbox" ? checked : value;
    
    // Trim string values to remove leading/trailing spaces, except for mobile and postcode
    if (typeof processedValue === 'string' && name !== 'studentMobile' && name !== 'alternateMobile' && name !== 'postCode') {
      processedValue = processedValue.trim();
    }
    
    if (name.startsWith("courseInterested.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        courseInterested: {
          ...prev.courseInterested,
          [field]: processedValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  // Updated file input handlers
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store file reference for form submission
      e.target.dataset.fileSelected = "true";

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, studentPhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store file reference for form submission
      e.target.dataset.fileSelected = "true";

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, studentSignature: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getChangedFields = (original, updated) => {
    const changes = {};
    for (const key in updated) {
      const originalValue = original[key];
      const updatedValue = updated[key];
      if (
        typeof updatedValue === "object" &&
        updatedValue !== null &&
        !Array.isArray(updatedValue)
      ) {
        const nested = getChangedFields(originalValue || {}, updatedValue);
        if (Object.keys(nested).length > 0) changes[key] = nested;
      } else if (updatedValue !== originalValue) {
        changes[key] = updatedValue;
      }
    }
    return changes;
  };

  // Updated handleSubmit function for your React component
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const studentId = id || student._id;
      if (!studentId) throw new Error("Student ID is missing");

      // Create FormData object to handle file uploads
      const formDataToSend = new FormData();

      // Get changed data (excluding files)
      const changedData = getChangedFields(originalData, formData);

      // Add text fields to FormData with trimming
      Object.keys(changedData).forEach((key) => {
        if (key !== "studentPhoto" && key !== "studentSignature") {
          if (
            typeof changedData[key] === "object" &&
            changedData[key] !== null
          ) {
            formDataToSend.append(key, JSON.stringify(changedData[key]));
          } else {
            // Trim string values before sending to backend, except for mobile and postcode
            let valueToSend = changedData[key];
            if (typeof valueToSend === 'string' && key !== 'studentMobile' && key !== 'alternateMobile' && key !== 'postCode') {
              valueToSend = valueToSend.trim();
            }
            formDataToSend.append(key, valueToSend);
          }
        }
      });

      // Handle photo file
      const photoInput = document.getElementById("studentPhoto");
      if (photoInput && photoInput.files && photoInput.files[0]) {
        formDataToSend.append("studentPhoto", photoInput.files[0]);
      }

      // Handle signature file
      const signatureInput = document.getElementById("studentSignature");
      if (signatureInput && signatureInput.files && signatureInput.files[0]) {
        formDataToSend.append("studentSignature", signatureInput.files[0]);
      }

      // Check if there are any changes
      if (formDataToSend.entries().next().done) {
        alert("No changes made.");
        return;
      }

      // Send the request with FormData
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/institute_student/update/${studentId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Student information updated successfully!");
        localStorage.removeItem("editStudentData");
        navigate("/institute/student_list");
      } else {
        throw new Error(response.data.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student data:", error);
      setError(
        "Failed to update student information: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    navigate("/institute/student_list");
  };
  return (
    <div className="min-h-full flex items-center justify-center">
      {/* Form Card */}
      <div className="relative bg-white rounded-lg shadow-lg w-[1400px] mx-4 border-2 border-black max-h-[90vh] overflow-y-auto top-0">
        <div className="bg-blue-600 p-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white">Edit Student Profile</h2>
        </div>

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-white bg-red-500 rounded-full p-1"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Student Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 border rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                    {formData.studentPhoto ? (
                      <img
                        src={formData.studentPhoto}
                        alt={formData.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">No Photo</span>
                    )}
                  </div>
                  <input
                    id="studentPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Student Signature - Updated */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Signature
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-16 border rounded overflow-hidden flex items-center justify-center bg-gray-100">
                    {formData.studentSignature ? (
                      <img
                        src={formData.studentSignature}
                        alt="Student Signature"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">
                        No Signature
                      </span>
                    )}
                  </div>
                  <input
                    id="studentSignature"
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              {/* Roll Number */}
              <div>
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Roll Number
                </label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-md border bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Abbreviation */}
              <div>
                <label
                  htmlFor="abbreviation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Abbreviation
                </label>
                <input
                  type="text"
                  id="abbreviation"
                  name="abbreviation"
                  value={formData.abbreviation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Student Name */}
              <div>
                <label
                  htmlFor="studentName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Student Name
                </label>
                <input
                  type="text"
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Franchise ID */}
              <div>
                <label
                  htmlFor="franchiseId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Franchise ID
                </label>
                <input
                  type="text"
                  id="franchiseId"
                  name="franchiseId"
                  value={formData.franchiseId}
                  disabled={true}
                  onChange={handleChange}
                  className="w-full rounded-md border bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Relation Type */}
              <div>
                <label
                  htmlFor="relationType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Relation Type
                </label>
                <select
                  id="relationType"
                  name="relationType"
                  value={formData.relationType}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Relation</option>
                  <option value="Father">S/O</option>
                  <option value="Husband">D/O</option>
                  <option value="Guardian">W/O</option>
                </select>
              </div>

              {/* Father/Husband Name */}
              <div>
                <label
                  htmlFor="fatherHusbandName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Father/Husband Name
                </label>
                <input
                  type="text"
                  id="fatherHusbandName"
                  name="fatherHusbandName"
                  value={formData.fatherHusbandName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Include Father/Husband */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeFatherHusband"
                  name="includeFatherHusband"
                  checked={formData.includeFatherHusband}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="includeFatherHusband"
                  className="text-sm font-medium text-gray-700"
                >
                  Include Father/Husband Name
                </label>
              </div>
            </div>

            {/* Middle Column */}
            <div className="space-y-4">
              {/* Surname */}
              <div>
                <label
                  htmlFor="surnameName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Surname
                </label>
                <input
                  type="text"
                  id="surnameName"
                  name="surnameName"
                  value={formData.surnameName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Include Surname */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeSurname"
                  name="includeSurname"
                  checked={formData.includeSurname}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="includeSurname"
                  className="text-sm font-medium text-gray-700"
                >
                  Include Surname
                </label>
              </div>

              {/* Mother Name */}
              <div>
                <label
                  htmlFor="motherName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mother Name
                </label>
                <input
                  type="text"
                  id="motherName"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Course Name */}
              <div>
                <label
                  htmlFor="courseInterested.courseName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Course Name
                </label>
                <input
                  type="text"
                  id="courseInterested.courseName"
                  name="courseInterested.courseName"
                  value={formData.courseInterested.courseName}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-md border bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Course Code */}
              <div>
                <label
                  htmlFor="courseInterested.courseCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Course Code
                </label>
                <input
                  type="text"
                  id="courseInterested.courseCode"
                  name="courseInterested.courseCode"
                  value={formData.courseInterested.courseCode}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-md border bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Mobile */}
              <div>
                <label
                  htmlFor="studentMobile"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="studentMobile"
                  name="studentMobile"
                  value={formData.studentMobile}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Alternate Mobile */}
              <div>
                <label
                  htmlFor="alternateMobile"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Alternate Mobile
                </label>
                <input
                  type="tel"
                  id="alternateMobile"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth
                </label>
                <input
                  type="text"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  placeholder="dd-mm-yyyy"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Post Code */}
              <div>
                <label
                  htmlFor="postCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Post Code
                </label>
                <input
                  type="text"
                  id="postCode"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Permanent Address */}
              <div>
                <label
                  htmlFor="permanentAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Permanent Address
                </label>
                <textarea
                  id="permanentAddress"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Referral Code */}
              <div>
                <label
                  htmlFor="referralCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Referral Code
                </label>
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-md border bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Caste */}
              <div>
                <label
                  htmlFor="caste"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Caste
                </label>
                <input
                  type="text"
                  id="caste"
                  name="caste"
                  value={formData.caste}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Qualifications */}
              <div>
                <label
                  htmlFor="qualifications"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Qualifications
                </label>
                <input
                  type="text"
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full rounded-md border bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Occupation */}
              <div>
                <label
                  htmlFor="occupation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Admission Date */}
              <div>
                <label
                  htmlFor="admissionDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Admission Date
                </label>
                <input
                  type="text"
                  id="admissionDate"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="dd-mm-yyyy"
                  className="w-full rounded-md border bg-gray-100 text-gray-500 cursor-not-allowed  border-gray-300  p-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700"
                >
                  Status:
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="status"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="status"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      formData.status ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></label>
                </div>
                <span
                  className={`text-sm ${
                    formData.status ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfileDetails;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import API_BASE_URL from "../../../../config";

// const StudentProfileDetails = () => {
//   // State to manage the form data
//   const navigate = useNavigate();
//   const { id } = useParams(); // Get ID from URL if available

//   const [formData, setFormData] = useState({
//     studentName: "",
//     studentPhoto: "",
//     batch: "",
//     courseInterested: "",
//     username: "",
//     password: "",
//     studentMobile: "",
//     email: "",
//     referralCode: "",
//     referralName: "",
//     status: false,
//     address: "15-7, M.G Road"
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [student, setStudent] = useState(null);

//   useEffect(() => {
//     const loadStudentData = async () => {
//       try {
//         // Option 1: Data passed as prop

//         // Option 2: Get student ID from URL params

//         // Option 3: Try to get data from localStorage
//         const storedStudentData = localStorage.getItem('editStudentData');
//         if (storedStudentData) {
//           delete storedStudentData._id;
//           setStudent(JSON.parse(storedStudentData));

//           return;
//         }

//         // If we get here, we couldn't find student data
//         setError("Could not load student data. Please try again.");
//       } catch (err) {
//         console.error("Error loading student data:", err);
//         setError("Error loading student data: " + err.message);
//       }
//     };

//     loadStudentData();
//   }, [id]);

// // Populate form with student data when component mounts or student changes
// useEffect(() => {
//   if (student) {
//     setFormData({
//       ...formData,
//       ...student,
//       // Make sure all required fields exist even if not in student data
//       studentName: student.studentName || "",
//       studentPhoto: student.studentPhoto || "",
//       batch: student.batch || "",
//       courseInterested: student.courseInterested || "",
//       username: student.username || "",
//       password: student.password || "",
//       studentMobile: student.studentMobile || "",
//       email: student.email || "",
//       referralCode: student.referralCode || "",
//       referralName: student.referralName || "",
//       status: student.status || false
//     });
//   }
// }, [student]);

//   // Handle form input changes
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value
//     });
//   };

//   // Handle photo upload
//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData({
//           ...formData,
//           studentPhoto: reader.result
//         });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       // Get the student ID either from the URL or from the student object
//       const studentId = id || student._id;

//       if (!studentId) {
//         throw new Error("Student ID is missing");
//       }

//       // Update student data in the backend
//       const response = await axios.put(
//         `${API_BASE_URL}/api/v1/student/update/${studentId}`,
//         formData
//       );

//       if (response.data.success) {
//         // Show success message
//         alert("Student information updated successfully!");
//         // Clear localStorage if we used it
//         localStorage.removeItem('editStudentData');
//         // Navigate back to student list
//         navigate("/student_list");
//       } else {
//         throw new Error(response.data.message || "Failed to update student");
//       }

//     } catch (error) {
//       console.error("Error updating student data:", error);
//       setError("Failed to update student information: " +
//         (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onClose = () => {
//     navigate("/institute/student_list")
//   }

//   if (error) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center">
//         <div className="absolute inset-0 bg-gray-300 bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
//         <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 z-10 p-6">
//           <div className="text-xl text-red-500">{error}</div>
//           <button
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
//             onClick={onClose}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className=" min-h-full  flex items-center min justify-center">
//       {/* Overlay with blur effect */}
//       {/* <div
//         className="absolute inset-0 border-2 border-black bg-gray-300 bg-opacity-50 backdrop-blur-sm"
//         onClick={onClose}
//       ></div> */}

//       {/* Form Card */}
//       <div className="relative bg-white rounded-lg shadow-lg w-[1200px] mx-4 border-2 border-black max-h-[90vh] overflow-y-auto top-0">
//         <div className="bg-blue-600 p-4 rounded-t-lg">
//           <h2 className="text-xl font-bold text-white">Edit Student Profile</h2>
//         </div>

//         {/* Close Button */}
//         <button
//           className="absolute top-3 right-3 text-white bg-red-500 rounded-full p-1"
//           onClick={onClose}
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </button>

//         {/* Form Content */}
//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Left Column */}
//             <div className="space-y-4">
//               {/* Student Photo */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Student Photo</label>
//                 <div className="flex items-center space-x-4">
//                   <div className="w-24 h-24 border rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
//                     {formData.studentPhoto ? (
//                       <img
//                         src={formData.studentPhoto}
//                         alt={formData.studentName}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-gray-400">No Photo</span>
//                     )}
//                   </div>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handlePhotoChange}
//                     className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   />
//                 </div>
//               </div>

//               {/* Student Name */}
//               <div>
//                 <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
//                   Student Name
//                 </label>
//                 <input
//                   type="text"
//                   id="studentName"
//                   name="studentName"
//                   value={formData.studentName}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Batch */}
//               <div>
//                 <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
//                   Batch
//                 </label>
//                 <input
//                   type="text"
//                   id="batch"
//                   name="batch"
//                   value={formData.batch}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Course Interested */}
//               <div>
//                 <label htmlFor="courseInterested" className="block text-sm font-medium text-gray-700 mb-1">
//                   Course Interested
//                 </label>
//                 <select
//                   id="courseInterested"
//                   name="courseInterested"
//                   value={formData.courseInterested}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">Select Course</option>
//                   <option value="Computer Science Basics">Computer Science Basics</option>
//                   <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
//                   <option value="Full Stack Web Development">Full Stack Web Development</option>
//                   <option value="Data Science">Data Science</option>
//                   <option value="Cybersecurity">Cybersecurity</option>
//                 </select>
//               </div>

//               {/* Username */}
//               <div>
//                 <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
//                   Username
//                 </label>
//                 <input
//                   type="text"
//                   id="username"
//                   name="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Right Column */}
//             <div className="space-y-4">
//               {/* Mobile */}
//               <div>
//                 <label htmlFor="studentMobile" className="block text-sm font-medium text-gray-700 mb-1">
//                   Mobile Number
//                 </label>
//                 <input
//                   type="tel"
//                   id="studentMobile"
//                   name="studentMobile"
//                   value={formData.studentMobile}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Referral Information */}
//               <div>
//                 <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
//                   Referral Code
//                 </label>
//                 <input
//                   type="text"
//                   id="referralCode"
//                   name="referralCode"
//                   value={formData.referralCode}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Referral Name */}
//               <div>
//                 <label htmlFor="referralName" className="block text-sm font-medium text-gray-700 mb-1">
//                   Referral Name
//                 </label>
//                 <input
//                   type="text"
//                   id="referralName"
//                   name="referralName"
//                   value={formData.referralName}
//                   onChange={handleChange}
//                   className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Status Toggle */}
//               <div className="flex items-center space-x-2">
//                 <label htmlFor="status" className="text-sm font-medium text-gray-700">
//                   Status:
//                 </label>
//                 <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                   <input
//                     type="checkbox"
//                     id="status"
//                     name="status"
//                     checked={formData.status}
//                     onChange={handleChange}
//                     className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
//                   />
//                   <label
//                     htmlFor="status"
//                     className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
//                       formData.status ? "bg-green-500" : "bg-red-500"
//                     }`}
//                   ></label>
//                 </div>
//                 <span className={`text-sm ${formData.status ? "text-green-500" : "text-red-500"}`}>
//                   {formData.status ? "Active" : "Inactive"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex justify-end mt-8 space-x-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//               disabled={loading}
//             >
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default StudentProfileDetails;
