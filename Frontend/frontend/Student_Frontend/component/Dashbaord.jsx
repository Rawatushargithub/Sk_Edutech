import { useState } from "react";
import TopBar from "./dashboard_Component/TopBar";
import StatsSection from "./dashboard_Component/StatsSection";
import QuickActions from "./dashboard_Component/QuickActions";
import ToggleSection from "./dashboard_Component/ToggleSection";
import Notes from "../pages/Notes";
import Fees from "../pages/Fees";
import CourseDetails from "../pages/CourseDetails";

// In Dashboard
const Dashboard = ({ student, setSelectedComponent }) => {
    return (
        <>
            <TopBar />
            <StatsSection />
            <QuickActions setTab={setSelectedComponent} />
            <ToggleSection student={student} />
        </>
    );
};


export default Dashboard;
