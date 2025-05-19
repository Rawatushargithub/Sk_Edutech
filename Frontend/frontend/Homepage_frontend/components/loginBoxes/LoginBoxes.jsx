import {
  FaGraduationCap,
  FaBuilding,
  FaFileSignature,
  FaCheckCircle,
  FaFolderPlus,
} from "react-icons/fa";
import { useNavigate} from "react-router-dom";
import { useState} from "react";


const LoginBoxes = () => {
  const navigate = useNavigate();
  const ApplyFranchise = () => {
    navigate("/ApplyforFranchise");
  };

  const [isOpen, setIsOpen] = useState(false);
    const [certificateId, setCertificateId] = useState("");
    const [verificationResult, setVerificationResult] = useState(null);
    const [loading, setLoading] = useState(false);
  
     const studentLogin = () => {
    navigate("/student/login"); // or whatever your login route is
  };
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

    

  return (
    // Parent div - Responsive grid layout
    <div className="grid grid-cols-1 sm:grid-cols-5 lg:grid-cols-5 gap-6 p-4 mx-4 md:mx-12 mb-10">
      {/* Student Login */}
      <div onClick={studentLogin} className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-6 py-8 flex items-center justify-center flex-col lg:flex-row gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer">
        <FaGraduationCap className="text-[#003366] group-hover:text-white transition duration-300" size={50} />
        <div  className="text-xl group-hover:text-white transition duration-300 text-center lg:text-left mt-2">
          Student <br /> Login
        </div>
      </div>

      {/* Center Login */}
      <div className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-6 py-8 flex items-center justify-center flex-col lg:flex-row gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer">
        <FaBuilding className="text-[#003366] group-hover:text-white transition duration-300" size={50} />
        <div className="text-xl group-hover:text-white transition duration-300 text-center lg:text-left mt-2"
        onClick={() => navigate("/institute")}>
          Center <br /> Login
        </div>
      </div>

      

      {/* Certificate Verification */}
      <div className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-6 py-8 flex items-center justify-center flex-col  lg:flex-row gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer"
      onClick={() => setIsOpen(true)}
      >
        <FaFileSignature className="text-[#003366] group-hover:text-white transition duration-300" size={50} />
        <div className="text-xl group-hover:text-white transition duration-300 text-center lg:text-left mt-2">
          Certificate <br /> Verification
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
                className={`mt-4 p-2 rounded-lg text-center ${
                  verificationResult.success ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
                }`}
              >
                {verificationResult.message}
              </div>
            )}
          </div>
        </div>
        )}

      


      {/* Center Verification */}
      <div className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-6 py-8 flex items-center justify-center flex-col  lg:flex-row gap-4 transition duration-500 hover:bg-sky-950 cursor-pointer">
        <FaCheckCircle className="text-[#003366] group-hover:text-white transition duration-300" size={50} />
        <div className="text-xl group-hover:text-white transition duration-300 text-center lg:text-left mt-2">
          Center <br /> Verification
        </div>
      </div>

      {/* Apply for Franchise */}
      <div
        onClick={ApplyFranchise}
        className="group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-6 py-8 flex items-center justify-center flex-col  lg:flex-row gap-2 transition duration-500 hover:bg-sky-950 cursor-pointer"
      >
        <FaFolderPlus className="text-[#003366] group-hover:text-white transition duration-300" size={50} />
        <div className="text-xl group-hover:text-white transition duration-300 text-left lg:text-center mt-2">
          Apply for <br /> Franchise
        </div>
      </div>
    </div>
  );
};

export default LoginBoxes;




// import {
//     FaApple,
//     FaCheckCircle,
//     FaFileSignature,
//     FaFolderPlus,
//     FaGraduationCap,
//   } from "react-icons/fa";
//   import { FaBuilding } from "react-icons/fa";
  
//   // import { FontAwesomeIcon } from "react";
  
//   const LoginBoxes = () => {
//     return (
//       // Parent div responsive which contains 5 divs inside
//       <div 
      
//       className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 p-4 mx-4 md:mx-12 mb-10"
      
//       >
//         {/* Single div which contains two div: icon and text */}
  
//         <div className="flex-1 group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-10 py-10 transition duration-500 hover:bg-sky-950">
//           <div className="flex items-center">
//             <div className="px-1 mr-4 ">
//               {/* Graduation Cap Icon with group-hover effect */}
//               <FaGraduationCap
//                 className="text-[#003366] group-hover:text-white transition duration-300"
//                 size={50}
//               />
//             </div>
//             <div className="text-xl group-hover:text-white transition duration-300">
//               Student <br />
//               Login
//             </div>
//           </div>
//         </div>
  
//         <div className="flex-1 group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-10 py-10 transition duration-500 hover:bg-sky-950">
//           <div className="flex items-center">
//             <div className="px-1 mr-4">
//               {/* Graduation Cap Icon with group-hover effect */}
//               <FaBuilding
//                 className="text-[#003366] group-hover:text-white transition duration-300"
//                 size={50}
//               />
//             </div>
//             <div className="text-xl group-hover:text-white transition duration-300">
//               Center <br />
//               Login
//             </div>
//           </div>
//         </div>
  
//         <div className="flex-1 group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-10 py-10 transition duration-500 hover:bg-sky-950">
//           <div className="flex items-center">
//             <div className="px-1 mr-4">
//               {/* Graduation Cap Icon with group-hover effect */}
//               <FaFileSignature
//                 className="text-[#003366] group-hover:text-white transition duration-300"
//                 size={50}
//               />
//             </div>
//             <div className="text-xl group-hover:text-white transition duration-300">
//               Certificate <br />
//               Verification
//             </div>
//           </div>
//         </div>
  
//         <div className="flex-1 group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-10 py-10 transition duration-500 hover:bg-sky-950">
//           <div className="flex items-center">
//             <div className="px-1 mr-4">
//               {/* Graduation Cap Icon with group-hover effect */}
//               <FaCheckCircle
//                 className="text-[#003366] group-hover:text-white transition duration-300"
//                 size={50}
//               />
//             </div>
//             <div className="text-xl group-hover:text-white transition duration-300">
//               Center <br />
//               Verification
//             </div>
//           </div>
//         </div>
  
//         <div className="flex-1 group border-2 border-[#003366] rounded-3xl font-bold text-regal-blue px-10 py-10 transition duration-500 hover:bg-sky-950">
//           <div className="flex items-center">
//             <div className="px-1 mr-4">
//               {/* Graduation Cap Icon with group-hover effect */}
//               <FaFolderPlus
//                 className="text-[#003366] group-hover:text-white transition duration-300"
//                 size={50}
//               />
//             </div>
//             <div className="text-xl group-hover:text-white transition duration-300">
//               Apply for <br />
//               Franchise
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };
//   export default LoginBoxes;
  


