import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../Center_frontend/pages/Dashboard/Dashboard";
import Sidebar from "../Center_frontend/components/Sidebar";

// import StudentProvider from "../Center_frontend/context/StudentContext.jsx"

import ProfileSection from "../Center_frontend/pages/Profile/Profile.jsx";
import ProfileDetails from "../Center_frontend/pages/Profile/Profile_details.jsx";
// import Wallet from "../Center_frontend/pages/Wallet/Wallet.jsx";
import AddNewStudent from "../Center_frontend/pages/Manage_students/StudentAddAdmission.jsx";
import EnquiryForm from "../Center_frontend/pages/Enquiry/EnquiryForm.jsx";
import StudentFeeDetails from "../Center_frontend/pages/Manage_students/StudentFeeDetails.jsx";
import StudentAdmissionList from "../Center_frontend/pages/Manage_students/Showing_students/Manage_student.jsx";
import StudentProfileDetails from "../Center_frontend/pages/Manage_students/Showing_students/Student_profile_details.jsx";
import { StudentProvider } from "../Center_frontend/context/StudentContext.jsx";

import Center_wallet from "../Center_frontend/pages/Dashboard/Wallet.jsx";

import Batches from "../Center_frontend/pages/Batches/Batche.jsx"
import UploadCourseVideo1 from "../Center_frontend/pages/video.jsx" // This is the Video Dashboard
import AddVideoLink from "../Center_frontend/pages/AddVideoLink.jsx"; // New page for adding video links

import CourseList from "../Center_frontend/pages/Courses/CourseList.jsx";
import CourseForm from "../Center_frontend/pages/Courses/CourseForm.jsx";
// import CourseUpdateForm from "../Center_frontend/pages/Courses/CourseForm.jsx"; // Redundant, CourseForm handles edit

import NotesDashboard from "../Center_frontend/pages/Notes/NotesDashboard.jsx"
import AddNote from "../Center_frontend/pages/Notes/AddNote.jsx"
import NoteDetail from "../Center_frontend/pages/Notes/NoteDetail.jsx"

import ExamManagement from "../Center_frontend/pages/Exam/ExamPage.jsx"
import AddExam from "../Center_frontend/pages/Exam/AddExam.jsx"

import Enquiries from "../Center_frontend/pages/Enquiry/EnquiryList.jsx"
import Certificate from "../Center_frontend/pages/Certificate/Certificate.jsx"

import QuestionBankSystem from "../Center_frontend/pages/QuestionBank/QuestionBankSystem.jsx";



function App() {

  
const navigate = useNavigate();

useEffect(() => {
    const centerToken = localStorage.getItem("centerToken");
    if (centerToken) {
      // Redirect to /institute if token exists
      navigate("/institute");
    } else {
      // Otherwise go to homepage
      navigate("/");
    }
  }, [navigate]);



  return (
    <StudentProvider>
      <div className="h-screen flex flex-col"> 

        <div className="flex flex-1">
          <Sidebar />

          <div className="flex-1 bg-gray-100 p-6 overflow-y-auto"> 

            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="profile" element={<ProfileSection />} />
              <Route path="profile_details" element={<ProfileDetails />} />
              {/* <Route path="" element={<Wallet />} /> */}

             <Route path="Registration" element={<AddNewStudent />} />
              <Route path="enquiry" element={<EnquiryForm />} />
              <Route path="fees" element={<StudentFeeDetails />} />
              <Route path="Student_list" element={<StudentAdmissionList />} />
              <Route path="edit-student/:id" element={<StudentProfileDetails />} />
              <Route path="wallet" element={<Center_wallet />} />


              <Route path="Courses" element={< CourseList/>} />
              <Route path="CourseForm" element={< CourseForm mode="add" />} /> {/* Explicitly add mode */}
              {/* <Route path="updatecourse" element={< CourseUpdateForm/>} />  Old update route, CourseForm will handle edit */}
              <Route path="updatecourse/:courseId" element={< CourseForm mode="edit" />} /> {/* Parameterized route for edit */}

              <Route path="Notes" element={<NotesDashboard />} />
              <Route path="AddNote" element={<AddNote />} />
              <Route path="NoteDetail" element={<NoteDetail />} />

              <Route path="Batch" element={< Batches/>} />

              <Route path="videos" element={<UploadCourseVideo1 />} /> 
              <Route path="AddVideoLink" element={<AddVideoLink />} /> {/* Route for new AddVideoLink page */}

              <Route path="Exam" element={<ExamManagement />} />
              <Route path="AddExam" element={<AddExam />} />
              <Route path="apply-certificate" element={<Certificate />} />
              <Route path="Enquiries" element={< Enquiries/>} />
              <Route path="Question-bank" element={<QuestionBankSystem/>} />
              

            </Routes>
          </div>
        </div>
      </div>
    </StudentProvider>
  );
}

export default App;
