import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import SupportVerticalIcons from "../../Student_Frontend/component/SupportIcons.jsx";

const SkEduTechSupport = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h2 className="text-3xl font-bold text-center text-blue-950 mb-10">
        Help & Support
      </h2>

      <div className="flex flex-col lg:flex-row gap-10 items-stretch">
        {/* Left: SK EDUTECH Support */}
        <div className="flex flex-col gap-8 w-full lg:w-2/3">
          <div className="bg-white shadow-md p-6 rounded-lg border border-blue-900 h-fit">
            <h3 className="text-xl font-semibold text-blue-950 mb-4">
              SK EDUTECH Support
            </h3>
            <div className="space-y-6 text-base">
              <SupportInfo 
                label="Phone Support" 
                icon={<Phone />} 
                value={
                  <>
                    +91 8700810876 <br />
                    +91 8860836811
                  </>
                } 
              />
              <SupportInfo 
                label="Email Support" 
                icon={<Mail />} 
                value="skcoachingclasses722@gmail.com" 
              />
              <SupportInfo
                label="Location"
                icon={<MapPin />}
                value="First floor, Link Road NH-48, Narsinghpur, Gurgaon HR, India"
              />
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            We're here to help! Reach out anytime between{" "}
            <strong className="text-blue-950">10:00 AM - 6:00 PM</strong> (Mon - Sat)
          </div>
        </div>

        {/* Right: Vertical Icon Section */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white shadow-md rounded-lg border border-blue-900 h-full flex justify-center items-center">
            <SupportVerticalIcons />
          </div>
        </div>
      </div>
    </div>
  );
};

const SupportInfo = ({ icon, label, value }) => (
  <div className="flex items-start gap-4">
    <div className="text-blue-950 w-6 h-6 mt-1">{icon}</div>
    <div>
      <p className="font-semibold text-blue-950">{label}</p>
      <p className="text-gray-700">{value}</p>
    </div>
  </div>
);

export default SkEduTechSupport;
