import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutPanelLeft, CircleUser, ChevronDown, ChevronUp, BookOpenCheck } from "lucide-react";
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


const Sidebar = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState({
    manageStudent: false,
    examination: false,
    certificate: false,
  });

  const toggleSection = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutPanelLeft className="w-5 h-5" />,
      link: "/",
    },
    {
      title: "Manage Student",
      icon: <CircleUser className="w-5 h-5" />,
      submenu: [
        { title: "Registration", icon: <PiStudentBold className="w-5 h-5" />, link: "/registration" },
        { title: "Enquiry", icon: <TbUserQuestion className="w-5 h-5" />, link: "/enquiry" },
        { title: "Fees", icon: <FaMoneyBill1Wave className="w-5 h-5" />, link: "/fees" },
        { title: "Students List", icon: <PiUserListBold className="w-5 h-5" />, link: "/student_list" },
      ],
      stateKey: "manageStudent",
    },
    {
      title: "Examination",
      icon: <BookOpenCheck className="w-5 h-5" />,
      submenu: [
        { title: "Exam", icon: <PiExam className="w-5 h-5" />, link: "/exam" },
        { title: "Question Bank", icon: <MdOutlineCommentBank className="w-5 h-5" />, link: "/question-bank" },
      ],
      stateKey: "examination",
    },
    {
      title: "Certificate",
      icon: <TbCertificate className="w-5 h-5" />,
      submenu: [
        { title: "Apply", icon: <VscGitStashApply className="w-5 h-5" />, link: "/apply-certificate" },
        { title: "Approve", icon: <LiaCertificateSolid className="w-5 h-5" />, link: "/approve-certificate" },
      ],
      stateKey: "certificate",
    },
    {
      title: "Enquiries",
      icon: <TbUserQuestion className="w-5 h-5" />,
      link: "/enquiry-list",
    },
    {
      title: "Notes",
      icon: <GrNotes className="w-5 h-5" />,
      action: () => navigate("/notes"),
    },
    {
      title: "Videos",
      icon: <BiSolidVideos className="w-5 h-5" />,
      action: () => navigate("/videos"),
    },
    {
      title:"Batch",
      icon:<IoMdClock className="w-5 h-5"/>,
      action: () => navigate("/Batch")
    },
    {
      title:"Courses",
      icon:<RiBookShelfLine className="w-5 h-5"/>,
      action: () => navigate("/Courses")
    }
  ];

  return (
    <div className="w-72 bg-gray-800 text-white h-full px-10 ">
      <h2 className="text-xl font-semibold mb-4">SKEDUTECH</h2>
      <ul className="space-y-3.5">
        {menuItems.map((item, index) => (
          <li key={index}>
            {item.link ? (
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-2 px-4 rounded text-lg font-medium ${
                    isActive ? "bg-gray-700" : "hover:bg-gray-700"
                  }`
                }
              >
                {item.icon} {item.title}
              </NavLink>
            ) : item.submenu ? (
              <div>
                <div
                  onClick={() => toggleSection(item.stateKey)}
                  className="cursor-pointer flex justify-between py-2 px-4 rounded hover:bg-gray-700 items-center"
                >
                  <span className="flex items-center gap-2">
                    {item.icon} {item.title}
                  </span>
                  {openSections[item.stateKey] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
                {openSections[item.stateKey] && (
                  <ul className="ml-6 mt-2 space-y-1">
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <NavLink
                          to={subItem.link}
                          className={({ isActive }) =>
                            `flex items-center gap-2 py-2 px-4 rounded ${
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
  );
};

export default Sidebar;
