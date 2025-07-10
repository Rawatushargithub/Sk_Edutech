import React from "react";

const StudentFormView = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Form Container */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden z-10 border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Student All Details</h2>
          </div>
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 bg-gray-50/30">
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Photo and Signature */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center">
                      <label className="text-sm font-medium text-gray-600 mb-2">Photo</label>
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border-2 border-gray-200 shadow-sm">
                        {student.studentPhoto ? (
                          <img src={student.studentPhoto} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <label className="text-sm font-medium text-gray-600 mb-2">Signature</label>
                      <div className="w-32 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden border-2 border-gray-200 shadow-sm">
                        {student.studentSignature ? (
                          <img src={student.studentSignature} alt="Signature" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Signature
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Roll Number</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-medium">
                          {student.rollNumber || "Not assigned"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Student Name</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-medium">
                          {student.studentName || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Abbreviation</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                          {student.abbreviation || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Father/Husband Name</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                          {student.fatherHusbandName || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Mother Name</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                          {student.motherName || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Surname</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                          {student.surnameName || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                          {student.dob || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                          {student.gender || "N/A"}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Caste</label>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                          {student.caste || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Course Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Course Name</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-medium">
                      {student.courseInterested?.courseName || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Course Code</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.courseInterested?.courseCode || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Admission Date</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.admissionDate || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Admission Options</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.displayAdmissionOptions 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.displayAdmissionOptions ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.studentMobile || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Alternate Mobile</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.alternateMobile || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.email || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.city || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Post Code</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.postCode || "N/A"}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Permanent Address</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 min-h-[80px]">
                      {student.permanentAddress || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Referral Code</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.referralCode || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Qualifications</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.qualifications || "N/A"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Occupation</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.occupation || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Reference Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Fee Details ID</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.feeDetails || "Not assigned"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Selected Batch ID</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                      {student.selectedBatch || "Not assigned"}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Installments</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.installmentDetails && student.installmentDetails.length > 0
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.installmentDetails && student.installmentDetails.length > 0
                          ? `${student.installmentDetails.length} installment(s)`
                          : "No installments"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFormView;