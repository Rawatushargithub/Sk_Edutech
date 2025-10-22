import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Calendar, Award, FileText } from "lucide-react";
import API_BASE_URL from "../../config.js"

const ManageProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentData = JSON.parse(localStorage.getItem("student"));
  const studentId = studentData ? studentData.studentId : null;


  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/v1/student/${studentId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch student details");
        }


        const data = await response.json();
        console.log("student data:", data);
        setStudent(data.student);
      } catch (error) {
        console.error("Error fetching student details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentDetails();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-950">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-500">Could not load student details. Please try again.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Form Header */}
        <div className="bg-blue-950 text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold text-center">STUDENT PROFILE</h1>
          <p className="text-center text-blue-100 font-bold text-sm">Roll Number: {student.rollNumber}</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-b-lg shadow-lg border border-gray-200">
          {/* Photo and Signature Section */}
          <div className="flex flex-col md:flex-row border-b border-gray-200">
            {/* Left: Photo */}
            <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex flex-col items-center">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="mr-2 text-blue-950" size={18} />
                  Student Photo
                </h3>
                <div className="border-2 border-blue-950 p-1 rounded-md">
                  <img
                    src={student.studentPhoto || "/api/placeholder/200/240"}
                    alt="Student"
                    className="w-40 h-48 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right: Signature */}
            <div className="w-full md:w-1/2 p-6">
              <div className="flex flex-col items-center">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <FileText className="mr-2 text-blue-950" size={18} />
                  Student Signature
                </h3>
                <div className="border-2 border-blue-950 p-2 rounded-md w-64">
                  <img
                    src={student.studentSignature || "/api/placeholder/240/80"}
                    alt="Signature"
                    className="h-20 object-contain mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Details Section */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-950 border-b border-blue-200 pb-2 mb-4">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Full Name</span>
                  <p className="font-medium">{student.abbreviation} {student.studentName} {student.surnameName}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    Date of Birth
                  </span>
                  <p className="font-medium">{formatDate(student.dob)}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Gender</span>
                  <p className="font-medium">{student.gender}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Caste</span>
                  <p className="font-medium">{student.caste}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-950 border-b border-blue-200 pb-2 mb-4">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Phone size={12} className="mr-1" />
                    Mobile
                  </span>
                  <p className="font-medium">{student.studentMobile}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Phone size={12} className="mr-1" />
                    Alternate Mobile
                  </span>
                  <p className="font-medium">{student.alternateMobile || "Not provided"}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Mail size={12} className="mr-1" />
                    Email
                  </span>
                  <p className="font-medium">{student.email}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500 flex items-center">
                    <MapPin size={12} className="mr-1" />
                    City & Post Code
                  </span>
                  <p className="font-medium">{student.city}, {student.postCode}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50 md:col-span-2">
                  <span className="text-xs text-gray-500">Permanent Address</span>
                  <p className="font-medium">{student.permanentAddress}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-950 border-b border-blue-200 pb-2 mb-4">
                Family Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Relation Type</span>
                  <p className="font-medium">{student.relationType}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Father's 1 Name</span>
                  <p className="font-medium"> {student.fatherHusbandName}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Mother's Name</span>
                  <p className="font-medium">{student.motherName}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-950 border-b border-blue-200 pb-2 mb-4">
                Academic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Course Interested</span>
                  <p className="font-medium">{student.courseInterested.courseName}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Course Interested</span>
                  <p className="font-medium">{student.courseInterested.courseCode}</p>
                </div>


                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Admission Date</span>
                  <p className="font-medium">{formatDate(student.admissionDate)}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Award size={12} className="mr-1" />
                    Qualifications
                  </span>
                  <p className="font-medium">{student.qualifications}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Occupation</span>
                  <p className="font-medium">{student.occupation}</p>
                </div>

                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <span className="text-xs text-gray-500">Referral Code</span>
                  <p className="font-medium">{student.referralCode || "None"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          {/* <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Student ID: <span className="font-medium text-blue-950">{studentId}</span>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ManageProfile;
