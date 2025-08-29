import React , { useEffect, useState }from 'react';
import axios from "axios";
import API_BASE_URL from "../../../config";
import { List } from 'lucide-react';
// center wala container jisme left right scrolling images hain
const EducationSection = () => {

    const [students, setStudents] = useState([]); //ye api k liye hai manually images ko hatake
    const [centers, setCenters] = useState([]);
  
    // ise hata do pure ko sirf check krne k liye manual image laggaye
  // Left side student data


  // Define CSS for the continuous scrolling animation
  const scrollAnimationStyle = `
    @keyframes scrollInfinite {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-50%);
      }
    }
    
    .animate-scroll-infinite {
      animation: scrollInfinite 30s linear infinite;
    }
  `;

  useEffect(() => {
    const fetchStudentsImages = async() => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/eduSection/recentStudentImg`)

          console.log("studentsimage" , response.data.data);
          const studentsdataarray = response.data.data;
          setStudents(studentsdataarray);

        } catch (error) {
          console.error("error fetching images " , error)
        setStudents([]);
        }
    };
    fetchStudentsImages();
  } , [])

  useEffect(() => {
    const fetchCenterImages = async() => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/eduSection/recentCenterImg`)

          console.log("centerImages" , response.data.data);
          const centerImgArray = response.data.data;
          setCenters(centerImgArray);

        } catch (error) {
          console.error("error fetching images " , error)
          setCenters([]);
        }
    };
    fetchCenterImages();
  } , [])
  return (
    <>
      {/* Include the CSS animation */}
      <style>{scrollAnimationStyle}</style>
      
      <div 
      // className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-4"
      className="container mx-auto px-4 py-8   md:mx-auto flex flex-col md:flex-row w-full gap-4"
      >
        {/* Left Side: Recently Joined Student */}
        <div className="bg-gray-100 rounded-lg shadow-md w-full md:w-1/4">
          <h2 className="text-lg font-bold text-center p-4 bg-gray-200 rounded-t-lg">
            Recently Joined Students
          </h2>
          <div className="h-[750px] overflow-hidden relative">
            <div className="animate-scroll-infinite">
              {students.map((student, index) => (
                <div
                  key={`student-${index}`}
                  className="flex flex-col items-center p-4 bg-white m-4 rounded-md shadow"
                >
                  <img
                    loading='lazy'
                    src={student.image}
                    alt={student.name}
                    className="w-24 h-24 object-cover border border-gray-300"
                  />
                  <p className="mt-2 font-bold text-center">{student.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full lg:w-1/2 text-justify">
          <h2 className="text-2xl font-bold text-center text-[#003366] mb-4">
            No.1 Education Brand in India
          </h2>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            🚀 SK EDUTECH – India’s No. 1 Education Brand & Computer Training Franchise
            Empowering Digital India with Affordable Computer Education In the 21st century, computer education is not just a skill—it is a necessity.
            Over the last two decades, India has entered a new digital era with the power of technology.
            Supporting our Hon’ble Prime Minister’s Digital India Mission, SK EDUTECH is committed to making every citizen digitally empowered.
          </p>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            Our motto is simple: Educate one member in every family and empower the entire nation.
            With affordable computer education, government-recognized certification, and 100% career-oriented training, SK EDUTECH is transforming India into a knowledge-driven economy.
          </p>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            Why Choose SK EDUTECH?
          </p>
          <ul className="text-gray-700 text-lg lg:text-lg md:text-sm">
            <li>✔ India’s No.1 Computer Education Brand</li>
            <li>✔ Trusted & Registered with Certificate of Incorporation – Government of India</li>
            <li>✔ Free Franchise Setup – No Franchise Fee & No Hidden Charges</li>
            <li>✔ Low Investment, High Return Education Business Opportunity</li>
            <li>✔ Govt. Valid Certificates for Students – boosting employability</li>
            <li>✔ Nationwide Support for Institute Setup & Growth</li>
          </ul>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            Franchise Opportunities with SK EDUTECH Whether you are looking for a computer coaching center franchise,
            vocational training institute affiliation, or low-investment education business, SK EDUTECH provides the best computer institute franchise in India.
          </p>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            Franchise Benefits:
          </p>
          <ul className="text-gray-700 text-lg lg:text-lg md:text-sm">
            <li>Open your own computer center with NO royalty and NO hidden costs.</li>
            <li>Use your own institute name with SK EDUTECH affiliation.</li>
            <li>Get ready-made syllabus, study material, and government-approved certifications.</li>
            <li>Support in marketing, center setup, and staff training.</li>
          </ul>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            Franchise Options:
          </p>
          <ul className="text-gray-700 text-lg lg:text-lg md:text-sm">
            <li>✅ PC Institute Franchise.</li>
            <li>✅ PC Middle Franchise.</li>
            <li>✅ Computer Coaching Center Franchise.</li>
            <li>✅ Vocational Training Institute Franchise.</li>
          </ul>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            Our Mission<br />
            To make India a computer-educated nation by offering quality, affordable IT education to every section of society.
            By training students in digital literacy and vocational skills, SK EDUTECH aims to improve socio-economic levels and contribute to the dream of a Digital India.
          </p>
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm">
            📌 Start your own Computer Education Franchise today with SK EDUTECH – India’s No.1 Computer Institute Brand.<br />
            👉 Be your own boss, uplift your community, and join the mission to build a digitally empowered India.<br />
            📞 Contact Us Now to get started with your Free Franchise Setup anywhere in India!
          </p>
        </div>

        {/* Right Side: Recently Joined Centers */}
        <div className=" bg-gray-100 rounded-lg shadow-md w-full md:w-1/4">
          <h2 className="text-lg font-bold text-center p-4 bg-gray-200 rounded-t-lg">
          Recently Joined Centers
          </h2>
          <div className="h-[750px] overflow-hidden relative">
            <div className="animate-scroll-infinite">
              {centers.map((center, index) => (
                <div
                  key={`center-${index}`}
                  className="flex flex-col items-center p-4 bg-white m-4 rounded-md shadow"
                >
                  <img
                    src={center.image}
                    alt={center.name}
                    className="w-24 h-24 object-cover border border-gray-300"
                  />
                  <p className="mt-2 font-bold text-center">{center.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EducationSection;