import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Student_Frontend/pages/Login";
import Register from "../Student_Frontend/pages/Register";
import MainContent from "../Student_Frontend/component/MainContent";
import Dashboard from "../Student_Frontend/component/Dashbaord";
import StudentList from "../Student_Frontend/pages/studentList";
import GiveTest from "../Student_Frontend/pages/GIveTest";
import UploadForm from "../Student_Frontend/pages/UploadForm";
// import CertificateManagement from "../Student_Frontend/pages/certificate/Certificate";

function App() {
  return (
    
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="" element={<MainContent />} />
        <Route path="students" element={<StudentList />} />
        <Route path="/exam/give/:id" element={<GiveTest />} /> 
        {/* <Route path="/certificate" element={<CertificateManagement/>} /> */}
      </Routes>
    
  );
}

export default App;
