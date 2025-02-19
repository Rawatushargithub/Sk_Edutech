import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProfileSection from "./pages/Profile/Profile";
import ProfileDetails from "./pages/Profile/Profile_details";

import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import Dashboard from "./pages/Dashboard";

import AddNewStudent from "./pages/Manage_students/StudentAddAdmission";
import StudentAdmissionList from "./pages/Manage_students/Manage_student";
import EnquiryForm from "./pages/EnquiryForm/EnquiryForm";
import StudentFeeDetails from "./pages/Manage_students/StudentFeeDetails";

import ExamSection from "./pages/Exam";
import QuestionBank from "./pages/QuestionBank";

import ApplyCertificate from "./pages/Certificate.jsx/ApplyCertificate";
import ApproveCertificate from "./pages/Certificate.jsx/ApproveCertificate";

import { StudentProvider } from "./context/StudentContext";

const App = () => {
  return (
    <StudentProvider>
      <div className="h-screen flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar />

          {/* Content Area */}
          <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileSection />} />
              <Route path="/profile-details" element={<ProfileDetails />} />

              <Route path="/Registration" element={<AddNewStudent />} />
              <Route path="/enquiry" element={<EnquiryForm />} />
              <Route path="/fees" element={<StudentFeeDetails />} />
              <Route path="/Student_list" element={<StudentAdmissionList />} />

              <Route path="/exam" element={<ExamSection />} />
              
              <Route path="/apply-certificate" element={<ApplyCertificate />} />
              {/* <Route path="/studentAddAdmission" element={<AddNewStudent />} /> */}
            </Routes>
          </div>
        </div>
      </div>
    </StudentProvider>
  );
};

export default App;
