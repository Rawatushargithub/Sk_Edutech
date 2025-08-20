import { useState } from "react";
import TopBar from "./dashboard_Component/TopBar";
import StatsSection from "./dashboard_Component/StatsSection";
import QuickActions from "./dashboard_Component/QuickActions";
import ToggleSection from "./dashboard_Component/ToggleSection";
import Notes from "../pages/Notes";
import Fees from "../pages/Fees"; 
import CourseDetails from "../pages/CourseDetails";

const Dashboard = () => {
    const [selectedTab, setSelectedTab] = useState("Dashboard");

    return (
        <div className="m-5">
            

            {/* Conditional Rendering Based on SelectedTab */}
            {selectedTab === "Dashboard" && (
                <>
                   <TopBar />
                    <StatsSection />
                    <QuickActions setTab={setSelectedTab} />
                    <ToggleSection />
                    
                </>
            )}

            {selectedTab === "Notes" && <Notes />}
            {selectedTab === "Fees" && <Fees />}
            {selectedTab === "CourseDetails" && <CourseDetails />}

            
            {/* Placeholder for future sections */}
            {selectedTab === "Attendance" && <p>Attendance Section Coming Soon...</p>}
        </div>
    );
};

export default Dashboard;
