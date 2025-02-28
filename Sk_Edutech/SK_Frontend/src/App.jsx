import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProfileSection from "./pages/Profile/Profile";
import ProfileDetails from "./pages/Profile/Profile_details";

import Sidebar from "./components/Sidebar"; 
import Dashboard from "./pages/Dashboard/Dashboard";

import AddNewStudent from "./pages/Manage_students/StudentAddAdmission";
import StudentAdmissionList from "./pages/Manage_students/Manage_student";
import EnquiryForm from "./pages/EnquiryForm/EnquiryForm";
import StudentFeeDetails from "./pages/Manage_students/StudentFeeDetails";

import ExamManagement from "./pages/Exam/ExamPage";
import AddExam from "./pages/Exam/AddExam";

import CertificateManagement from "./pages/Certificate/Certificate";

import NotesDashboard from "./pages/Notes/NotesDashboard";
import AddNote from "./pages/Notes/AddNote";
import NoteDetail from "./pages/Notes/NoteDetail";

import CourseList from "./pages/Courses/CourseList";
import CourseForm from "./pages/Courses/CourseForm";
import CourseUpdateForm from "./pages/Courses/UpdateCourse";

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

              <Route path="/Exam" element={<ExamManagement />} />
              <Route path="/AddExam" element={<AddExam />} />

              <Route path="/apply-certificate" element={<CertificateManagement />} />

              <Route path="/Notes" element={<NotesDashboard />} />
              <Route path="/AddNote" element={<AddNote />} />
              <Route path="/NoteDetail" element={<NoteDetail />} />
              
              <Route path="/Courses" element={<CourseList />} />
              <Route path="/CourseForm" element={<CourseForm />} />
              <Route path="/updatecourse" element={<CourseUpdateForm />} />
              
              {/* <Route path="/studentAddAdmission" element={<AddNewStudent />} /> */}
            </Routes>
          </div>
        </div>
      </div>
    </StudentProvider>
  );
};

export default App;
