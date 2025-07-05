import { useState, useEffect } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 🌐 10 languages (EN + 9 Indian)
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇮🇳" },
    { code: "mr", name: "मराठी", flag: "🇮🇳" },
    { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
    { code: "bho", name: "भोजपुरी*", flag: "🇮🇳" }, // *early‑access
  ];

  /** Set Goog Translate cookie then reload */
  const translatePage = (lang) => {
    if (lang === "en") {
      // clear cookie → back to English
      document.cookie =
        "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/;`;
    }
    window.location.reload();
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang.name);
    setIsDropdownOpen(false);
    translatePage(lang.code);
  };

  /* Load Google script once if the page doesn’t already have it */
  useEffect(() => {
    if (!window.google || !window.google.translate) {
      const s = document.createElement("script");
      s.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">

        <div className="flex flex-wrap justify-between gap-10 md:gap-6">
                    
                    {/* Logo & Description */}
                    <div className="w-full md:w-1/4 flex flex-col items-start">
                        <img
                            src="/assets/Logo.jpg"
                            alt="SkEdutech"
                            className="w-40 h-14 rounded-md border-2"
                        />
                        <p className="text-gray-400 mt-4 text-sm">
                            Empowering education through technology & excellence.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="w-full md:w-3/4 grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
                            <ul className="space-y-2">
                                <li className="cursor-pointer hover:text-orange-400">Home</li>
                                <li className="cursor-pointer hover:text-orange-400">Our Services</li>
                                <li className="cursor-pointer hover:text-orange-400">About Us</li>
                                <li className="cursor-pointer hover:text-orange-400">Contact Us</li>
                                <li className="cursor-pointer hover:text-orange-400">Certifications</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Franchise</h3>
                            <ul className="space-y-2">
                                <li className="cursor-pointer hover:text-orange-400">Verifications</li>
                                <li className="cursor-pointer hover:text-orange-400">Franchise Registration</li>
                                <li className="cursor-pointer hover:text-orange-400">Franchise Details</li>
                                <li className="cursor-pointer hover:text-orange-400">Our Team</li>
                                <li className="cursor-pointer hover:text-orange-400">Registered Centers</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">More Info</h3>
                            <ul className="space-y-2">
                                <li className="cursor-pointer hover:text-orange-400">Gallery</li>
                                <li className="cursor-pointer hover:text-orange-400">Our Blogs</li>
                                <li className="cursor-pointer hover:text-orange-400">Terms & Conditions</li>
                                <li className="cursor-pointer hover:text-orange-400">Privacy Policy</li>
                                <li className="cursor-pointer hover:text-orange-400">Refund Policy</li>
                            </ul>
                        </div>
                    </div>
                </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* ▼ Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen((o) => !o)}
              className="flex items-center gap-2 border border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-orange-400"
              aria-label="Select language"
              aria-expanded={isDropdownOpen}
            >
              <span className="text-sm">🌐</span>
              <span className="text-sm">{selectedLanguage}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Social icons (unchanged) */}
          <div className="flex space-x-5">
            <a
              href="https://facebook.com"
              className="text-blue-500 hover:text-blue-700 transition"
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://twitter.com"
              className="text-blue-400 hover:text-blue-600 transition"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <FaLinkedinIn size={20} />
            </a>
            <a
              href="https://instagram.com"
              className="text-pink-500 hover:text-pink-700 transition"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://youtube.com"
              className="text-red-500 hover:text-red-700 transition"
            >
              <FaYoutube size={20} />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          © 2025 SK Edutech. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;


// import { useState } from "react";
// import {
//     FaFacebookF,
//     FaTwitter,
//     FaLinkedinIn,
//     FaInstagram,
//     FaYoutube,
// } from "react-icons/fa";

// const Footer = () => {
//     const [selectedLanguage, setSelectedLanguage] = useState("English");
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//     const languages = [
//         { code: "en", name: "English", flag: "🇺🇸" },
//         { code: "es", name: "Español", flag: "🇪🇸" },
//         { code: "fr", name: "Français", flag: "🇫🇷" },
//         { code: "de", name: "Deutsch", flag: "🇩🇪" },
//         { code: "it", name: "Italiano", flag: "🇮🇹" },
//         { code: "pt", name: "Português", flag: "🇵🇹" },
//         { code: "ru", name: "Русский", flag: "🇷🇺" },
//         { code: "ja", name: "日本語", flag: "🇯🇵" },
//         { code: "ko", name: "한국어", flag: "🇰🇷" },
//         { code: "hi", name: "हिंदी", flag: "🇮🇳" },
//     ];

//     const handleLanguageChange = (language) => {
//         setSelectedLanguage(language.name);
//         setIsDropdownOpen(false);
        
//         // Here you would implement your translation logic
//         // For example: translatePage(language.code);
//         console.log(`Language changed to: ${language.name} (${language.code})`);
//     };

//     return (
//         <footer className="bg-gray-900 text-white py-12">
//             <div className="container mx-auto px-6">
//                 <div className="flex flex-wrap justify-between gap-10 md:gap-6">
                    
//                     {/* Logo & Description */}
//                     <div className="w-full md:w-1/4 flex flex-col items-start">
//                         <img
//                             src="/assets/Logo.jpg"
//                             alt="SkEdutech"
//                             className="w-40 h-14 rounded-md border-2"
//                         />
//                         <p className="text-gray-400 mt-4 text-sm">
//                             Empowering education through technology & excellence.
//                         </p>
//                     </div>

//                     {/* Quick Links */}
//                     <div className="w-full md:w-3/4 grid grid-cols-2 md:grid-cols-3 gap-6">
//                         <div>
//                             <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
//                             <ul className="space-y-2">
//                                 <li className="cursor-pointer hover:text-orange-400">Home</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Our Services</li>
//                                 <li className="cursor-pointer hover:text-orange-400">About Us</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Contact Us</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Certifications</li>
//                             </ul>
//                         </div>

//                         <div>
//                             <h3 className="font-semibold text-lg mb-3">Franchise</h3>
//                             <ul className="space-y-2">
//                                 <li className="cursor-pointer hover:text-orange-400">Verifications</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Franchise Registration</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Franchise Details</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Our Team</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Registered Centers</li>
//                             </ul>
//                         </div>

//                         <div>
//                             <h3 className="font-semibold text-lg mb-3">More Info</h3>
//                             <ul className="space-y-2">
//                                 <li className="cursor-pointer hover:text-orange-400">Gallery</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Our Blogs</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Terms & Conditions</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Privacy Policy</li>
//                                 <li className="cursor-pointer hover:text-orange-400">Refund Policy</li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Divider */}
//                 <div className="border-t border-gray-700 my-8"></div>

//                 {/* Bottom Section */}
//                 <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    
//                     {/* Language Selector */}
//                     <div className="relative">
//                         <button
//                             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                             className="flex items-center gap-2 border border-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
//                             aria-label="Select language"
//                             aria-expanded={isDropdownOpen}
//                         >
//                             <span className="text-sm">🌐</span>
//                             <span className="text-sm">{selectedLanguage}</span>
//                             <svg 
//                                 className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
//                                 fill="none" 
//                                 stroke="currentColor" 
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                         </button>

//                         {isDropdownOpen && (
//                             <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
//                                 {languages.map((language) => (
//                                     <button
//                                         key={language.code}
//                                         onClick={() => handleLanguageChange(language)}
//                                         className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors duration-150 flex items-center gap-3"
//                                     >
//                                         <span className="text-sm">{language.flag}</span>
//                                         <span className="text-sm">{language.name}</span>
//                                     </button>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* Social Media Links */}
//                     <div className="flex space-x-5">
//                         <a href="https://facebook.com" className="text-blue-500 hover:text-blue-700 transition">
//                             <FaFacebookF size={20} />
//                         </a>
//                         <a href="https://twitter.com" className="text-blue-400 hover:text-blue-600 transition">
//                             <FaTwitter size={20} />
//                         </a>
//                         <a href="https://linkedin.com" className="text-blue-600 hover:text-blue-800 transition">
//                             <FaLinkedinIn size={20} />
//                         </a>
//                         <a href="https://instagram.com" className="text-pink-500 hover:text-pink-700 transition">
//                             <FaInstagram size={20} />
//                         </a>
//                         <a href="https://youtube.com" className="text-red-500 hover:text-red-700 transition">
//                             <FaYoutube size={20} />
//                         </a>
//                     </div>
//                 </div>

//                 {/* Copyright */}
//                 <p className="text-center text-gray-400 mt-6 text-sm">
//                     © 2024 SkEdutech. All Rights Reserved.
//                 </p>
//             </div>
//         </footer>
//     );
// };

// export default Footer;

