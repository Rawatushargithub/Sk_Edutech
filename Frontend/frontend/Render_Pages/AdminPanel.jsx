import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { StudentProvider } from "../AdminPanel_frontend/context/StudentContext";

import Sidebar from "../AdminPanel_frontend/Sidebar/Sidebar";
import StudentAchievementsPanel from "../AdminPanel_frontend/OurAchievers/Achievers";
import MainSliderUploadPage from "../AdminPanel_frontend/MainSlider/MainSliderImgUpload";
import AdminGalleryPanel from "../AdminPanel_frontend/GalleryPanel/AdminGalleryPanel";
import EventBox from "../AdminPanel_frontend/OurAchievers/EventBox";
import MarqueeManager from "../AdminPanel_frontend/MarqueeLine/Marquee";
import Dashboard from "../AdminPanel_frontend/Dashboard/Dashboard";
import FranchiseListPage from "../AdminPanel_frontend/fracnhise/pages/FranchiseListPage";
import AddFranchisePage from "../AdminPanel_frontend/fracnhise/pages/AddFranchisePage";
import RequestStackPage from "../AdminPanel_frontend/fracnhise/pages/RequestStackPage";
import EditFranchisePage from "../AdminPanel_frontend/fracnhise/pages/EditFranchisePage";
import CourseListAdmin from "../AdminPanel_frontend/Courses/CourseListAdmin"; // Import Admin Course List
import AdminWallet from "../AdminPanel_frontend/Dashboard/Admin_Wallet"; // Import Admin Wallet
const AdminPanel = () => {
  return (
    <StudentProvider>
      <div className="h-screen flex flex-col">

        {/* Main Content */}
        <div className="flex flex-1">

          <Sidebar />

          {/* Content Area */}
          <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="achievers" element={<StudentAchievementsPanel />} />
              <Route path="mainslider" element={<MainSliderUploadPage />} />
              <Route path="wallet" element={<AdminWallet />} />

              <Route path="gallery" element={<AdminGalleryPanel />} />

              <Route path="marqueeline" element={<MarqueeManager />} />

              <Route path="MM" element={<MarqueeManager />} />
              <Route path="EventBox" element={<EventBox />} />
              {/* <Route path="student_list" element={<studen />} /> */}

              <Route path="franchises" element={<FranchiseListPage />} /> {/* Lists ACTIVE & VERIFIED franchises */}
              <Route path="franchises/add" element={<AddFranchisePage />} /> {/* Admin adds a NEW franchise (starts Pending) */}
              <Route path="franchises/requests" element={<RequestStackPage />} /> {/* Shows franchises needing action */}
              <Route path="franchises/edit/:franchiseId" element={<EditFranchisePage />} /> {/* Edit a specific franchise */}

              {/* Admin Course Management Route */}
              <Route path="courses" element={<CourseListAdmin />} />
            </Routes>
          </div>
        </div>
      </div>
    </StudentProvider>
  );
};

export default AdminPanel;
