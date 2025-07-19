import React, { useState, useEffect, useRef } from "react";
import { LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
    const [showMenu, setShowMenu] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const adminName = localStorage.getItem("adminName") || "Admin";
    const adminEmail = localStorage.getItem("adminEmail") || "admin@example.com";

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminUsername");
        navigate("/admin/login");
    };

    // Close menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="px-6 flex justify-between
  items-center relative">
            <div>
                {/* <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1> */}
                <h1 className="text-2xl font-bold text-gray-800 ">Welcome, {adminName}</h1>
            </div>
            <div className="relative" ref={dropdownRef}>
                <UserCircle2
                    size={30}
                    className="text-gray-700 cursor-pointer hover:text-blue-600 transition"
                    onClick={toggleMenu}
                />
                {showMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-50 p-4 space-y-2">
                        <div>
                            <p className="text-sm text-gray-500">Username:</p>
                            <p className="font-medium text-gray-800">{adminName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email:</p>
                            <p className="font-medium text-gray-800 truncate">{adminEmail}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 text-white py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition"
                        >
                            <LogOut size={16} className="inline-block mr-1" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHeader;
