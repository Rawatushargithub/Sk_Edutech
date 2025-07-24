import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Student_Frontend/pages/Login";
import Register from "../Student_Frontend/pages/Register";
import MainContent from "../Student_Frontend/component/MainContent";
import Dashboard from "../Student_Frontend/component/Dashbaord";
import StudentList from "../Student_Frontend/pages/studentList";
import GiveTest from "../Student_Frontend/pages/GIveTest";
import UploadForm from "../Student_Frontend/pages/UploadForm";
import CertificatePreview from "../Student_Frontend/pages/Certificate";
import ForgotPassword from "../Student_Frontend/pages/ForgotPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import CertificateManagement from "../Student_Frontend/pages/certificate/Certificate";

function App() {
  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    
      <Routes>
        
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="" element={<MainContent />} />
        <Route path="students" element={<StudentList />} />
        <Route path="/exam/give/:id" element={<GiveTest />} /> 
        <Route path="/certificate" element={<CertificatePreview/>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </>
    
  );
}

export default App;
