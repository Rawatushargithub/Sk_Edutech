import React , { useEffect, useState }from 'react';
import axios from "axios";
import API_BASE_URL from "../../../config";
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
          <p className="text-gray-700 text-lg lg:text-lg md:text-sm  ">
            SK EDUTECH is critical in the 21st century. India, in the last two
            decades has seen a new dawn with the help of computers and
            technologies. The government is trying to reach out to every citizen
            and make them digitally sound. It is said, educate a women and you
            educate a family. In the same way, making one person in every family
            SK EDUTECH is the key to digital India. But this rage to become
            tech-savvy took off only after PM’s ‘Digital India’ programme.
            <br />
            The digital India is a flagship programme of the Government of
            India, with a vision to transform India into a digitally empowered
            society and knowledge economy. To make India a computer educated
            nation and to fullfill our PM`s dream SK EDUTECH has taken the
            initiative to take technology to the common man. Our aims to provide
            computer education at affordable price to every section of society.
            We believe , We will improve the socio-economic levels of the
            community, and ultimately the country. So let’s be a part of the SK
            EDUTECH and contribute in the development of the nation.
            <br />
            <br />
            For buying pc institute franchise/ pc middle franchise/ pc coaching
            franchise, contact us anytime.
            <br />
            
            No.1 Computer Center in India No.1 Computer institute Franchise |
            No.1 Education Brand in India SK EDUTECH is a dependable, one of a
            kind, Best Computer Education Franchise Brand in India, The
            Organization is Certificate of Incorporation by GOVERNMENT OF INDIA
            Computer Institute Franchise, Computer Center Franchise, Computer
            Education Franchise,.
            <br />
            <br />
            Chance to get now/set up now/open Center/begin a franchise with
            Govt. Job Valid Certificate or Computer Education Institute, then
            become our Computer Education Franchisee with Free of Cost/ No
            Franchise Fee/ India's No. 1 Computer Institute, Fees No any other
            Hidden Charges you Can Open Set UP Your own Computer Center Very Low
            Franchise Investment anywhere in India. Our Best Franchise is the
            best Top suitable option for all Institute who want to Provide his
            own Institute Name Certificate for Education. Because we offer
            provide No.1 Best Computer Vocational Institute Franchise & Computer
            Institute (Center) Affiliation or Computer & Vocational Study Center
            Affiliation/ Authorization with Free of cost in all over
            India/India’s No.1 Computer institute in India, Low Investment
            Franchises/ how to/new computer training/ institute registration
            Full Process/ form, process
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