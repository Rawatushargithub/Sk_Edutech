import {
  FaGraduationCap,
  FaBuilding,
  FaFileSignature,
  FaCheckCircle,
  FaFolderPlus,
} from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Login from "../../../Student_Frontend/pages/Login";
import CenterLoginModal from "../../../Center_frontend/pages/centerLogin.jsx";
import FranchiseVerificationModal from "./FranchiseVerificationModal";


const LoginBoxes = ({ onApplyClick }) => {
  const navigate = useNavigate();
  const ApplyFranchise = () => {
    navigate("/ApplyforFranchise");
  };

  const [isOpen, setIsOpen] = useState(false);
  const [certificateId, setCertificateId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [activeSlide, setActiveSlide] = useState(0); // 0 for Student, 1 for Center login

  // Mock function to simulate API call
  const verifyCertificate = async () => {
    setLoading(true);

    try {
      // Replace with actual API call
      const response = await fetch(`/api/verify-certificate/${certificateId}`);
      const data = await response.json();

      if (data.valid) {
        setVerificationResult({ success: true, message: "Certificate is valid!" });
      } else {
        setVerificationResult({ success: false, message: "Certificate not found!" });
      }
    } catch (error) {
      setVerificationResult({ success: false, message: "Error verifying certificate!" });
    }

    setLoading(false);
  };

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "student" or "center"

  const studentLogin = () => {
    setModalType("student");
    setShowModal(true);
  };

  const CenterLogin = () => {
    setModalType("center");
    setShowModal(true);
  };

  const verificationShow = () => {
    setModalType("verification");
    setShowModal(true);
  }


  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveSlide((prev) => (prev + 1) % 2),
    onSwipedRight: () => setActiveSlide((prev) => (prev - 1 + 2) % 2),
    trackTouch: true,
    trackMouse: false,
  });





  return (
    // Parent div - Responsive grid layout
    <div className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-5 gap-6 p-4 mx-4 md:mx-12 mb-10">
      {/* Student Login */}
      <div
        onClick={studentLogin}
        className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-4 py-4 flex items-center justify-center flex-row gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer h-20 lg:h-auto"
      >
        <FaGraduationCap
          className="text-[#003366] group-hover:text-white transition duration-300 text-3xl sm:text-[2.5rem]"
        />
        <div className="text-lg sm:text-xl group-hover:text-white transition duration-300 text-left">
          Student <br className="hidden sm:block" /> Login
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <div className="relative max-w-sm w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-violet-800 text-4xl font-bold z-50"
              aria-label="Close modal"
            >
              &times;
            </button>

            {/* Modal Content */}
            <div
              className="bg-white 
               border-white text-[#003366] rounded-2xl shadow-lg max-w-sm w-full relative max-h-[90vh] overflow-y-auto transition-all duration-500"
              {...handlers}
            >
              {modalType === "student" && <Login />}
              {modalType === "center" && <CenterLoginModal />}
              {modalType === "verification" && <FranchiseVerificationModal onClose={() => setShowModal(false)} />}
            </div>
          </div>
        </div>
      )}




      {/* Center Login */}
      <div
        onClick={CenterLogin}
        className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-4 py-4 flex items-center justify-center flex-row gap-3 sm:gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer h-20 sm:h-auto"
      >
        <FaBuilding
          className="text-[#003366] group-hover:text-white transition duration-300 text-3xl sm:text-[2.5rem]"
        />
        <div className="text-lg sm:text-xl group-hover:text-white transition duration-300 text-left"
        // onClick={CenterLogin}
        >
          Center <br className="hidden sm:block" /> Login
        </div>
      </div>




      {/* Certificate Verification */}
      <div
        className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-4 py-4 flex items-center justify-center flex-row gap-3 sm:gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer h-20 sm:h-auto"
      
      >
        <FaFileSignature className="text-[#003366] group-hover:text-white transition duration-300 text-3xl sm:text-[2.5rem]" />
        <div className="text-lg sm:text-xl group-hover:text-white transition duration-300 text-left">
          Certificate <br className="hidden sm:block" /> Verification
        </div>
      </div>


      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-300 w-96">
            <h2 className="text-lg font-semibold text-[#003366]">Certificate Verification</h2>
            <input
              type="text"
              className="w-full border p-2 mt-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Enter Certificate ID"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
            />
            <div className="flex justify-between mt-4">
              <button
                className="bg-[#003366] text-white px-4 py-2 rounded-lg hover:bg-sky-950"
                onClick={verifyCertificate}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                onClick={() => {
                  setIsOpen(false);
                  setVerificationResult(null);
                  setCertificateId("");
                }}
              >
                Close
              </button>
            </div>

            {/* Display Verification Result */}
            {verificationResult && (
              <div
                className={`mt-4 p-2 rounded-lg text-center ${verificationResult.success ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                  }`}
              >
                {verificationResult.message}
              </div>
            )}
          </div>
        </div>
      )}




      {/* Center Verification */}
      <div
        onClick={verificationShow}
        className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-4 py-4 flex items-center justify-center flex-row gap-3 sm:gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer h-20 sm:h-auto"
      >
        <FaCheckCircle className="text-[#003366] group-hover:text-white transition duration-300 text-3xl sm:text-[2.5rem]" />
        <div className="text-lg sm:text-xl group-hover:text-white transition duration-300 text-left">
          Center <br className="hidden sm:block" /> Verification
        </div>
      </div>


      {/* Apply for Franchise */}
      <div
        onClick={onApplyClick}
        className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-4 py-4 flex items-center justify-center flex-row gap-3 sm:gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer h-20 sm:h-auto"
      >
        <FaFolderPlus className="text-[#003366] group-hover:text-white transition duration-300 text-3xl sm:text-[2.5rem]" />
        <div className="text-lg sm:text-xl group-hover:text-white transition duration-300 text-left">
          Apply for <br className="hidden sm:block" /> Franchise
        </div>
      </div>

    </div>
  );
};

export default LoginBoxes;

