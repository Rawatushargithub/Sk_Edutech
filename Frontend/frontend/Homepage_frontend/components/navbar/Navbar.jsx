import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import Login from "../../../Student_Frontend/pages/Login";
import centerLogin from "../../../Student_Frontend/pages/centerLogin";

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdownMobile, setOpenDropdownMobile] = useState(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0); 
  const navigate = useNavigate();

  const handleLinkClick = (link) => {
    if (link) {
      navigate(link);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const studentLogin = () => {
    setShowModal(true);
  };


  const handlers = useSwipeable({
      onSwipedLeft: () => setActiveSlide((prev) => (prev + 1) % 2),
      onSwipedRight: () => setActiveSlide((prev) => (prev - 1 + 2) % 2),
      trackTouch: true,
      trackMouse: false,
    });

  const navItems = [
    {
      title: "HOME",
      hasDropdown: false,
      link: "/",
    },
    {
      title: "ABOUT",
      hasDropdown: true,
      dropdownItems: [
        { title: "About Us", link: "/about-us" },
        { title: "Our Aim", link: "/our-aim" },
        { title: "Accreditation", link: "/accreditation" },
        { title: "Refund & Cancellation Policy", link: "/refund-policy" },
        { title: "Public Note", link: "/public-note" },
      ],
    },
    {
      title: "STUDENT ZONE",
      hasDropdown: true,
      dropdownItems: [
        { title: "Student Zone", link: "/student/dashboard" },
        { title: "Book for Student", link: "/student/books" },
        { title: "Login Panel", link: "/student/login" },
        { title: "Student Enquiry Form", link: "/student/enquiry" },
      ],
    },
    {
      title: "COURSES",
      hasDropdown: true,
      dropdownItems: [
        { title: "Computer Software", link: "/courses/computer-software" },
        { title: "Computer Hardware", link: "/courses/computer-hardware" },
        { title: "Vocational Course", link: "/courses/vocational" },
        { title: "Nursery Teacher Training", link: "/courses/nursery-teacher-training" },
        { title: "Top Job oriented classes courses", link: "/courses/job-oriented" },
      ],
    },
    {
      title: "AFFILIATION PROCESS",
      hasDropdown: true,
      dropdownItems: [
        { title: "Affiliation Process for registration", link: "/affiliation/process" },
        { title: "Reason Partners", link: "/affiliation/partners" },
        { title: "How To Get Franchise (Affiliation)", link: "/affiliation/franchise" },
        { title: "How to Register Institute", link: "/affiliation/register-institute" },
        { title: "NTT Franchise Process", link: "/affiliation/ntt-franchise" },
        { title: "Institute List in India", link: "/affiliation/institute-list" },
        { title: "Live: Top Center List", link: "/affiliation/top-centers" },
      ],
    },
    {
      title: "DOWNLOAD",
      hasDropdown: true,
      dropdownItems: [
        { title: "Download", link: "/downloads" },
        { title: "Admission Form", link: "/downloads/admission-form" },
        { title: "Franchise Form", link: "/downloads/franchise-form" },
      ],
    },
    {
      title: "CONTACT",
      hasDropdown: true,
      dropdownItems: [
        { title: "Contact Us", link: "/contact-us" },
        { title: "Career", link: "/career" },
      ],
    },
    {
      title: "GALLERY",
      hasDropdown: false,
      link: "/gallery",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Track if user has scrolled at all
      if (window.scrollY > 10) {
        setHasScrolled(true);
      }

      // Track if user has scrolled beyond threshold
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      {/* Static navbar that's always visible at the top of the page on initial load */}
      <div className="top-0 left-0 w-full z-20 flex gap-15 shadow-md items-center bg-white">
        {/* Logo */}
        <div className="py-4 w-44 ml-15">
          <img src="/assets/Logo.jpg" alt="Logo" onClick={() => navigate("/")} className="cursor-pointer" />
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex">
          <ul className="flex">
            {navItems.map((item, index) => (
              <li
                key={index}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.hasDropdown ? "#" : item.link}
                  onClick={(e) => {
                    if (!item.hasDropdown) {
                      e.preventDefault();
                      handleLinkClick(item.link);
                    } else {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center px-4 py-6 text-sm font-medium transition-colors duration-300 ${
                    activeDropdown === index
                      ? "text-blue-500"
                      : "text-gray-700 hover:text-blue-500"
                  }`}
                >
                  {item.title}
                  {item.hasDropdown && (
                    <svg
                      className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${
                        activeDropdown === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  )}
                </a>

                {/* Dropdown menu */}
                {item.hasDropdown && (
                  <div
                    className={`absolute left-0 w-52 z-10 bg-white shadow-lg py-2 rounded-b-lg transform transition-all duration-300 ease-in-out origin-top ${
                      activeDropdown === index
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-0 invisible"
                    }`}
                  >
                    {item.dropdownItems.map((dropdownItem, idx) => (
                      <a
                        key={idx}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(dropdownItem.link);
                          setActiveDropdown(null);
                        }}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-300"
                      >
                        {dropdownItem.title}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <button 
         onClick={studentLogin}
          className="hidden lg:block ml-auto mr-6 bg-transparent hover:bg-[#003366] text-[#003366] font-semibold text-xl hover:text-white py-2 px-8 m border border-[#003366] hover:border-transparent rounded-md duration-300"
        >
          Login
        </button>

        {showModal && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                >
        
                  <div className="relative max-w-sm w-full">
                    {/* Close Button just outside top-right */}
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute -top-10 right-0 text-[#003366] hover:text-violet-800 text-4xl font-bold z-50"
                      aria-label="Close modal"
                    >
                      &times;
                    </button>
        
                    {/* Modal Card */}
                    <div className="bg-white border-2 border-[#003366] text-[#003366] rounded-2xl shadow-lg max-w-sm w-full relative max-h-[90vh] overflow-y-auto transition-all duration-500"
                      {...handlers}>
                      {/* <Login /> */}
                      {activeSlide === 0 ? <Login /> : <centerLogin />}
                    </div>
                  </div>
                </div>
              )}
        
        
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden ml-auto mr-6 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 right-0 h-full w-2/3 bg-white shadow-lg transition-transform transform ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          } lg:hidden z-30`}
        >
          <button
            className="absolute top-4 right-4 text-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            ✖
          </button>
          <ul className="mt-16 space-y-1">
            {navItems.map((item, index) => (
              <li key={index} className="relative">
                {item.hasDropdown ? (
                  <button
                    onClick={() =>
                      setOpenDropdownMobile(
                        openDropdownMobile === index ? null : index
                      )
                    }
                    className="w-full text-left px-6 py-2 text-gray-700 flex justify-between items-center"
                  >
                    {item.title}{" "}
                    <svg
                      className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${
                        openDropdownMobile === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                ) : (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(item.link);
                      setIsMenuOpen(false);
                    }}
                    className="block px-6 py-2 text-gray-700"
                  >
                    {item.title}
                  </a>
                )}

                {item.hasDropdown && openDropdownMobile === index && (
                  <div className="pl-8">
                    {item.dropdownItems.map((dropdownItem, idx) => (
                      <a
                        key={idx}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(dropdownItem.link);
                          setIsMenuOpen(false);
                        }}
                        className="block px-6 py-2 text-gray-500 hover:text-gray-700"
                      >
                        {dropdownItem.title}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}

            {/* Login Button for Mobile */}
            <li className="px-6 mt-4">
              <button
                onClick={() => {
                 onClick={studentLogin}
                  setIsMenuOpen(false);
                }}
                className="w-full bg-[#003366] text-white font-semibold text-xl py-2 px-4 text-center border rounded-md"
              >
                Login
              </button>

              {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >

          <div className="relative max-w-sm w-full">
            {/* Close Button just outside top-right */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 text-[#003366] hover:text-violet-800 text-4xl font-bold z-50"
              aria-label="Close modal"
            >
              &times;
            </button>

            {/* Modal Card */}
            <div className="bg-white border-2 border-[#003366] text-[#003366] rounded-2xl shadow-lg max-w-sm w-full relative max-h-[90vh] overflow-y-auto transition-all duration-500"
              {...handlers}>
              {/* <Login /> */}
              {activeSlide === 0 ? <Login /> : <centerLogin />}
            </div>
          </div>
        </div>
      )}

            </li>
          </ul>
        </div>
      </div>

      {/* Scrolling navbar that appears/disappears based on scroll position */}
      <div
        className={`fixed top-0 left-0 w-full z-20 flex gap-15 shadow-md items-center transition-transform duration-400 ${
          isScrolled ? "translate-y-0 bg-white shadow-lg" : "-translate-y-full"
        }`}
        style={{ display: hasScrolled ? "flex" : "none" }}
      >
        {/* Logo */}
        <div className="py-4 w-44 ml-15">
          <img 
            src="/assets/Logo.jpg" 
            alt="Logo" 
            onClick={() => navigate("/")} 
            className="cursor-pointer" 
          />
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex">
          <ul className="flex">
            {navItems.map((item, index) => (
              <li
                key={index}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(index)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.hasDropdown ? "#" : item.link}
                  onClick={(e) => {
                    if (!item.hasDropdown) {
                      e.preventDefault();
                      handleLinkClick(item.link);
                    } else {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center px-4 py-6 text-sm font-medium transition-colors duration-300 ${
                    activeDropdown === index
                      ? "text-blue-500"
                      : "text-gray-700 hover:text-blue-500"
                  }`}
                >
                  {item.title}
                  {item.hasDropdown && (
                    <svg
                      className={`w-4 h-4 ml-1 transform transition-transform duration-300 ${
                        activeDropdown === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  )}
                </a>

                {/* Dropdown menu */}
                {item.hasDropdown && window.scrollY && (
                  <div
                    className={`absolute left-0 w-52 z-10 bg-white shadow-lg py-2 rounded-b-lg transform transition-all duration-300 ease-in-out origin-top ${
                      activeDropdown === index
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-0 invisible"
                    }`}
                  >
                    {item.dropdownItems.map((dropdownItem, idx) => (
                      <a
                        key={idx}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(dropdownItem.link);
                          setActiveDropdown(null);
                        }}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-300"
                      >
                        {dropdownItem.title}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <button 
          onClick={studentLogin}
          className="hidden lg:block ml-auto mr-6 bg-transparent hover:bg-[#003366] text-[#003366] font-semibold text-xl hover:text-white py-2 px-8 m border border-[#003366] hover:border-transparent rounded-md duration-300"
        >
          Login
        </button>

        {showModal && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                >
        
                  <div className="relative max-w-sm w-full">
                    {/* Close Button just outside top-right */}
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute -top-10 right-0 text-[#003366] hover:text-violet-800 text-4xl font-bold z-50"
                      aria-label="Close modal"
                    >
                      &times;
                    </button>
        
                    {/* Modal Card */}
                    <div className="bg-white border-2 border-[#003366] text-[#003366] rounded-2xl shadow-lg max-w-sm w-full relative max-h-[90vh] overflow-y-auto transition-all duration-500"
                      {...handlers}>
                      {/* <Login /> */}
                      {activeSlide === 0 ? <Login /> : <centerLogin />}
                    </div>
                  </div>
                </div>
              )}
        
        
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden ml-auto mr-6 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ☰
        </button>
      </div>
    </div>
  );
};

export default Navbar;
