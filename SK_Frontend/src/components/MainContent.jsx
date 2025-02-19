import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <Outlet />
    </div>
  );
};

export default MainContent;
