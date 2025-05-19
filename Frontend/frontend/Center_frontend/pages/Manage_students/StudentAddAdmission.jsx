import React, { useState , useEffect } from "react";
import axios from "axios";
import Fees_table from "./Fees_table";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddNewStudent = () => { 
  const [formData, setFormData] = useState({
    // Personal Details
    studentPhoto: null,
    studentSignature: null,
    rollNumber: "",
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

    // Academic Details
    courseInterested: "",
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
        const response = await axios.get('http://localhost:8000/api/v1/courses/getCourses');
        console.log("course fetching :: " , response)
        setCourses(response.data); // Assuming the response is an array of course objects
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    console.log(e);
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  const formDataToSend = new FormData();

  // Append files separately
  if (formData.studentPhoto) {
    formDataToSend.append("studentPhoto", formData.studentPhoto); 
  }
  if (formData.studentSignature) {
    formDataToSend.append("studentSignature", formData.studentSignature);
  }

  
  // Append other fields
  Object.entries(formData).forEach(([key, value]) => {
    if (key !== "studentPhoto" && key !== "studentSignature" && value !== null) {
      formDataToSend.append(key, value);
    }
  });
// To properly see what's in the FormData:
for (let pair of formDataToSend.entries()) {
  console.log(pair[0], pair[1]); // This will show you the actual contents
}

    try {

      const response = await axios.post( 
        "http://localhost:8000/api/v1/student/register_student",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // Add wallet deduction logic
      const walletDeductionResponse = await axios.post(
        "http://localhost:8000/api/v1/payment/deduct-wallet", 
        { 
          amount: 300, // Fixed registration fee
          purpose: "Student Registration" 
        }
      );
      if(walletDeductionResponse)
        {
          toast.info(`₹300 deducted from wallet for registration`);
          setFormData({})
        }
      if(response)
      {
        console.log(response)
        toast.success("Student added successfully!");
        setFormData({})
      }
      else
      {
        
        toast.error("Student registration failed");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student: " + (error.response?.data?.message || error.message));

      // Check if it's a wallet deduction error
    if (error.response?.data?.code === 'INSUFFICIENT_BALANCE') {
      toast.error("Insufficient wallet balance. Please add money.");
    } else {
      toast.error("Failed to add student: " + (error.response?.data?.message || error.message));
    }
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-blue-50">
       <ToastContainer position="top-right" autoClose={5000} />
      <div className="w-full  bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-red-500">
          Add New Student
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <img src='Student_photo.png' width="100px" height="100px"/> */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Student Photo</label>

              <img
                src={
                  formData.studentPhoto
                    ? URL.createObjectURL(formData.studentPhoto)
                    : "/assets/Student_photo.png"
                }
                alt="Student Photo Preview"
                className="w-32 h-32 object-cover  mb-2"
              />
              <input
                type="file"
                name="studentPhoto"
                onChange={handleFileChange}
                className=" p-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Student Signature</label>
              <img
                src={
                  formData.studentSignature
                    ? URL.createObjectURL(formData.studentSignature)
                    : "/assets/Signature.png"
                }
                alt="Student Signature Preview"
                className="w-32 h-10 object-cover mb-2"
              />
              <input
                type="file"
                name="studentSignature"
                onChange={handleFileChange}
                className=" p-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Roll Number *</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                className="border-gray-400 text-black border-2 p-2 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div>
              <label className="block mb-1 ">Abbreviation</label>
              <select
                name="abbreviation"
                value={formData.abbreviation}
                onChange={handleChange}
                className=" p-2 border-gray-400 rounded-md border-2 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              >
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Miss">Miss</option>
              </select>
            </div>

            <div>
              <label className="block mb-1">Student Name *</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className=" p-2 border-gray-400 rounded-md border-2 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
                required
              />
            </div>

            <div className=" ml-16 w-20 h-20 ">
              <label className="block mb-1">Select One</label>
              <select
                name="relationType"
                value={formData.relationType}
                onChange={handleChange}
                className=" p-2 border-gray-400 rounded-md border-2 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              >
                <option value="S/O">S/O</option>
                <option value="D/O">D/O</option>
                <option value="W/O">W/O</option>
              </select>
            </div>

            <div className="">
              <label className="block mb-1">Father/Husband Name</label>
              <input
                type="text"
                name="fatherOrHusbandName"
                value={formData.fatherOrHusbandName}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-40 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 "
              />
              <label className="inline-flex items-center mt-2 text-blue-600 underline">
                <input
                  type="checkbox"
                  name="includeFatherHusband"
                  checked={formData.includeFatherHusband}
                  onChange={handleChange}
                  className="mr-2 "
                />
                Show on certificate
              </label>
            </div>
            {/* Checkboxes for certificate inclusion */}
            <div>
              <label className="block mb-1">Surname Name</label>
              <input
                type="text"
                name="surnameName"
                value={formData.surnameName}
                onChange={handleChange}
                className=" p-2 border-gray-400 border-2 rounded-md w-40 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 "
              />
              <label className="inline-flex items-center mt-2 text-blue-600 underline">
                <input
                  type="checkbox"
                  name="includeSurname"
                  checked={formData.includeSurname}
                  onChange={handleChange}
                  className="mr-2 "
                />
                Show on certificate
              </label>
            </div>
            <div>
              <label className="block mb-1">Mother Name</label>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md w-40 p-2 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 "
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <label className="block mb-1 ">Course Interested</label>
              <select
                name="courseInterested"
                onChange={handleChange}
                className=" p-2 w-80 border-gray-400 border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 "
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course.courseName} >
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Student Mobile</label>
              <input
                type="text"
                name="studentMobile"
                value={formData.studentMobile}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1">Alternate Mobile</label>
              <input
                type="text"
                name="alternateMobile"
                value={formData.alternateMobile}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>

            <div>
              <label className="block mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1">Post Code</label>
              <input
                type="text"
                name="postCode"
                value={formData.postCode}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1">Permanent Address</label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Exam Type</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              >
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Referral Code</label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1">Caste</label>
              <input
                type="text"
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div> 
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none  focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
            <div>
              <label className="block mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="border-gray-400 border-2 rounded-md p-2 w-80 focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200"
              />
            </div>
          </div>
          <Fees_table 
          handleSubmit={handleSubmit}   
          formData={formData} handleChange={handleChange} 
          setFormData={setFormData}
          batches={batches} setBatches={setBatches} 
          selectedBatch={selectedBatch} 
          setSelectedBatch={setSelectedBatch} 
          remainingSeats={remainingSeats} 
          setRemainingSeats={setRemainingSeats}
          isSubmitting={isSubmitting}  />
       </form>
      </div>
    </div>
  );
};

export default AddNewStudent;



