import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutPanelLeft,
  CircleUser,
  ChevronDown,
  ChevronUp,
  BookOpenCheck,
} from "lucide-react";
import { TbCertificate, TbUserQuestion } from "react-icons/tb";
import { GrNotes } from "react-icons/gr";
import { BiSolidVideos } from "react-icons/bi";
import { VscGitStashApply } from "react-icons/vsc";
import { MdOutlineCommentBank } from "react-icons/md";
import { LiaCertificateSolid } from "react-icons/lia";
import { PiExam, PiStudentBold, PiUserListBold } from "react-icons/pi";
import { FaMoneyBill1Wave } from "react-icons/fa6";
import { IoMdClock } from "react-icons/io";
import { RiBookShelfLine } from "react-icons/ri";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

const Sidebar = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSection = (section) => { 
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const menuItems = [
    { title: "Dashboard", icon: <LayoutPanelLeft className="w-5 h-5" />, link: "/institute" },
    {
      title: "Manage Student",
      icon: <CircleUser className="w-5 h-5" />,
      submenu: [
        { title: "Registration", icon: <PiStudentBold className="w-5 h-5" />, link: "/institute/Registration" },
        { title: "Enquiry", icon: <TbUserQuestion className="w-5 h-5" />, link: "/institute/enquiry" },
        { title: "Fees", icon: <FaMoneyBill1Wave className="w-5 h-5" />, link: "/institute/fees" },
        { title: "Students List", icon: <PiUserListBold className="w-5 h-5" />, link: "/institute/Student_list" },
      ],
      stateKey: "manageStudent",
    },
    {
      title: "Examination",
      icon: <BookOpenCheck className="w-5 h-5" />,
      submenu: [
        { title: "Exam", icon: <PiExam className="w-5 h-5" />, link: "/institute/exam" },
        { title: "Question Bank", icon: <MdOutlineCommentBank className="w-5 h-5" />, link: "/institute/Question-bank" },
      ],
      stateKey: "examination",
    },
    {
      title: "Certificate",
      icon: <TbCertificate className="w-5 h-5" />,
      submenu: [
        { title: "Apply", icon: <VscGitStashApply className="w-5 h-5" />, link: "/institute/apply-certificate" },
        { title: "Approve", icon: <LiaCertificateSolid className="w-5 h-5" />, link: "/institute/approve-certificate" },
      ],
      stateKey: "certificate",
    },
    {
      title: "Enquiries",
      icon: <TbUserQuestion className="w-5 h-5" />,
      link: "/institute/Enquiries",
    },
    {
      title: "Notes",
      icon: <GrNotes className="w-5 h-5" />,
      action: () => navigate("/institute/notes"),
    },
    {
      title: "Videos",
      icon: <BiSolidVideos className="w-5 h-5" />,
      action: () => navigate("/institute/videos"),
    },
    {
      title: "Batch",
      icon: <IoMdClock className="w-5 h-5" />,
      action: () => navigate("/institute/Batch"),
    },
    {
      title: "Courses",
      icon: <RiBookShelfLine className="w-5 h-5" />,
      action: () => navigate("/institute/Courses"),
    },

  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <AiOutlineClose className="w-6 h-6" /> : <AiOutlineMenu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white transition-transform duration-300 md:relative md:translate-x-0 z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:block`}
      >
        <h2 className="text-xl font-semibold p-4">SKEDUTECH</h2>
        <ul className="space-y-3.5 p-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.link ? (
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 px-4 rounded text-lg font-medium transition-colors ${
                      isActive ? "bg-gray-700" : "hover:bg-gray-700"
                    }`
                  }
                >
                  {item.icon} {item.title}
                </NavLink>
              ) : item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.stateKey)}
                    className="w-full flex justify-between items-center py-2 px-4 rounded hover:bg-gray-700 text-left"
                  >
                    <span className="flex items-center gap-2">{item.icon} {item.title}</span>
                    {openSections[item.stateKey] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openSections[item.stateKey] && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <NavLink
                            to={subItem.link}
                            className={({ isActive }) =>
                              `flex items-center gap-2 py-2 px-4 rounded transition-colors ${
                                isActive ? "bg-blue-600" : "hover:bg-gray-700"
                              }`
                            }
                          >
                            {subItem.icon} {subItem.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div
                  onClick={item.action}
                  className="cursor-pointer flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-700"
                >
                  {item.icon} {item.title}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay for Mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-50 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
