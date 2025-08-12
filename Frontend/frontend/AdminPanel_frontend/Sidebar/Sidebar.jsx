import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutPanelLeft,
  CircleUser,
  ChevronDown,
  ChevronUp,
  BookOpenCheck,
} from "lucide-react";
import { TbCertificate, TbLadder, TbNotification, TbUserQuestion } from "react-icons/tb";
import { MdOutlineCommentBank } from "react-icons/md";
import { PiExam, PiStudentBold, PiUserListBold } from "react-icons/pi";
import { FaCertificate, FaHandshake, FaMoneyBill1Wave } from "react-icons/fa6";
import { AiOutlineMenu, AiOutlineClose, AiFillSafetyCertificate } from "react-icons/ai";
import { CgWebsite } from "react-icons/cg";
import { BiSolidInstitution } from "react-icons/bi";
import { GrAchievement, GrGallery } from "react-icons/gr";
import { TbHomePlus } from "react-icons/tb";
import { RiBookShelfLine } from "react-icons/ri";



const Sidebar = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const menuItems = [
    { title: "Dashboard", icon: <LayoutPanelLeft className="w-5 h-5" />, link: "/admin/dashboard" },
    
    {
      title: "Institute Portal",
      icon: <BiSolidInstitution className="w-5 h-5 " />,
      submenu: [

   
        { title: "Franchises", icon: <FaHandshake className="w-5 h-5" />, link: "/admin/franchises" },
        { title: "Students", icon: <PiUserListBold className="w-5 h-5" />, link: "/admin/Student-list" },

        { title: "Wallet approval", icon: <FaMoneyBill1Wave className="w-5 h-5" />, link: "/admin/wallet" },
        { title: "Courses", icon: <RiBookShelfLine className="w-5 h-5" />, link: "/admin/courses" },
        { title: "Certificates", icon: <TbCertificate className="w-5 h-5" />, link: "/admin/Certificates" },
        { title: "Notification", icon: <TbNotification className="w-5 h-5" />, link: "/admin/notification" },

      ],
      stateKey: "manageStudent",
    },
    {
      title: "Website Portal",
      icon: <CgWebsite className="w-5 h-5" />,
      submenu: [
        { title: "MainSlider", icon: <TbHomePlus className="w-5 h-5" />, link: "/admin/mainslider" },
        { title: "Marquee Line", icon: <TbLadder className="w-5 h-5" />, link: "/admin/MM" },
        { title: "Gallery", icon: <GrGallery className="w-5 h-5" />, link: "/admin/gallery" },
        { title: "Achievers", icon: <GrAchievement className="w-5 h-5" />, link: "/admin/achievers" },
        { title: "EventBox", icon: <GrGallery className="w-5 h-5" />, link: "/admin/EventBox" },

      ],
      stateKey: "examination",
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
        className={`fixed top-0 left-0 h-full w-64  shadow-md bg-white text-blue transition-transform duration-300 md:relative md:translate-x-0 z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:block`}
      >
        {/* Logo */}
        <div className="py-4 w-44 mx-auto">
          <img src="/assets/Logo.jpg" alt="Logo" className="cursor-pointer" />
        </div>
        <i className="text-lg text-neutral-400 px-4 ml-4">Admin Panel</i>
        <ul className="space-y-3.5 p-4 overflow-y-auto h-[calc(100vh-12rem)]">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.link ? (
                <NavLink
                  to={item.link}
                  className={({ isActive }) =>
                    `flex items-center gap-3 py-2 px-4 rounded text-lg font-medium transition-colors ${
                      isActive ? "bg-gray-400" : "hover:bg-gray-200"
                    }`
                  }
                >
                  {item.icon} {item.title}
                </NavLink>
              ) : item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.stateKey)}
                    className="w-full flex justify-between items-center py-2 px-4 rounded hover:bg-gray-200 text-left"
                  >
                    <span className="flex font-bold items-center gap-2">{item.icon} {item.title}</span>
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
                                isActive ? "bg-gray-400" : "hover:bg-gray-200"
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
