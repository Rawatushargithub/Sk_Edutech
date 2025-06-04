import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashbaord";
import ManageProfile from "../pages/ManageProfiles";
// import Fees from "../pages/Fees";
import Notes from "../pages/Notes";
import Videos from "../pages/CourseVideos";
import ExamDetails from "../pages/ExamPage";
// import CertificatePage from "../pages/Certificate";
import FeesDetails from "../pages/Fees";
import FeedbackForm from "../pages/FeedbackForm";
import HelpSupport from "../pages/HelpSupport";

const MainContent = () => {
  const [selectedComponent, setSelectedComponent] = useState("Dashboard");
  const [student, setStudent] = useState(null); // Store student data

  useEffect(() => {
    const storedStudent = localStorage.getItem("student");
    console.log("Stored Student Data:", storedStudent);

    if (storedStudent) {
      try {
        setStudent(JSON.parse(storedStudent)); // ✅ Convert JSON string back to object
      } catch (error) {
        console.error("Error parsing student data:", error);
      }
    }
  }, []);


  const renderComponent = () => {
    switch (selectedComponent) {
      case "Dashboard":
        return <Dashboard student={student}  />;
      case "Manage Profile":
        return <ManageProfile  />;
      case "Fees":
        return <FeesDetails student={student}  />;
      case "Notes":
        return <Notes student={student}  />;
      case "Course Videos":
        return <Videos student={student} />;
      case "Exam":
        return <ExamDetails student={student} />;
      case "Certificate":
        return <CertificatePage student={student} />;
      case "Feedback":
          return <FeedbackForm student={student} />;
      case "Help and Support":
            return <HelpSupport student={student} />;
      default:
        return <Dashboard student={student} />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar onSelect={setSelectedComponent} />

      {/* Right Content */}
      <div className="flex-1 overflow-auto ml-64">{renderComponent()}</div>
    </div>
  );
};

export default MainContent;
