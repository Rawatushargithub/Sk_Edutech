import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({
    manageStudent: false,
    examination: false,
    certificate: false,
    courses: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  return (
    <div className="w-64 bg-gray-800 text-white h- p-6">
      <h2 className="text-xl font-semibold mb-6">Menu</h2>
      <ul className="space-y-4">
        {/* Dashboard */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block py-3 px-4 rounded text-lg font-medium ${
                isActive ? "bg-blue-600" : "hover:bg-gray-700"
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>

        {/* Manage Student */}
        <li>
          <div
            onClick={() => toggleSection("manageStudent")}
            className="cursor-pointer py-2 px-4 rounded hover:bg-gray-700 flex justify-between"
          >
            Manage Student
            <span>{openSections.manageStudent ? "-" : "+"}</span>
          </div>
          {openSections.manageStudent && (
            <ul className="ml-4 mt-2 space-y-2">
              <li>
                <NavLink
                  to="/Registration"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Registration
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/enquiry"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Enquiry
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/fees"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Fees
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/Student_list"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  StudentsList
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Examination */}
        <li>
          <div
            onClick={() => toggleSection("examination")}
            className="cursor-pointer py-2 px-4 rounded hover:bg-gray-700 flex justify-between"
          >
            Examination
            <span>{openSections.examination ? "-" : "+"}</span>
          </div>
          {openSections.examination && (
            <ul className="ml-4 mt-2 space-y-2">
              <li>
                <NavLink
                  to="/exam"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Exam
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/question-bank"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Question Bank
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Certificate */}
        <li>
          <div
            onClick={() => toggleSection("certificate")}
            className="cursor-pointer py-2 px-4 rounded hover:bg-gray-700 flex justify-between"
          >
            Certificate
            <span>{openSections.certificate ? "-" : "+"}</span>
          </div>
          {openSections.certificate && (
            <ul className="ml-4 mt-2 space-y-2">
              <li>
                <NavLink
                  to="/apply-certificate"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Apply
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/approve-certificate"
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded ${
                      isActive ? "bg-blue-600" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Approve
                </NavLink>
              </li>
            </ul>
          )}
        </li>
          
        <li>
         
          <NavLink
          to="Notes"
           className="cursor-pointer py-2 px-4 rounded hover:bg-gray-700 flex justify-between">
            Notes
          </NavLink>
        </li>
        <li>
          <div
            className="cursor-pointer py-2 px-4 rounded hover:bg-gray-700 flex justify-between"
          >
            Videos
            <span>{openSections.certificate ? "-" : "+"}</span>
          </div>
        </li>
        <li>
          <NavLink
          to="/Courses">
          <div
            // onClick={() => toggleSection("certificate")}
            className="cursor-pointer py-2 px-4 rounded hover:bg-gray-700 flex justify-between"
          >
            Courses
            <span>{openSections.certificate ? "-" : "+"}</span>
          </div>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
