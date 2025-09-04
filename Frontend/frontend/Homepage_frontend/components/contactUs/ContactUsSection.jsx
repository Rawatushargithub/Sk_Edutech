import React, { forwardRef } from "react";
import { PhoneCall, MapPin, Mail, Clock } from "lucide-react";

const ContactUsSection = forwardRef((props, ref) => {
  return (
    <section ref={ref} className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Get In Touch</h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 max-w-xl mx-auto">
          Have questions or need assistance? Reach out to us.
        </p>
      </div>

      {/* Contact Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 md:grid-cols-4 gap-6">
        {/* Visit Us Card */}
        <a
          href="https://maps.app.goo.gl/3FJYX2azTzjdNfHC9"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg hover:translate-y-1 flex flex-col items-center text-center group w-full max-w-xs"
        >
          <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-600 transition-colors duration-300">
            <MapPin className="text-blue-600 group-hover:text-white w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg mb-2">Visit Us</h3>
          <p className="text-gray-600 text-sm">
            First floor, Link Road NH-48, Narsinghpur, Gurgaon HR
          </p>
        </a>

        {/* Call Us Card */}
        <a
          href="tel:+918700810876"
          className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg hover:translate-y-1 flex flex-col items-center text-center group w-full max-w-xs"
        >
          <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-600 transition-colors duration-300">
            <PhoneCall className="text-green-600 group-hover:text-white w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg mb-2">Call Us</h3>
          <p className="text-gray-600 text-sm">+91 8860836811</p>
          <p className="text-gray-600 text-sm">+91 8076782988</p>
        </a>

        {/* Email Card */}
        <a
          href="mailto:skcoachingclasses722@gmail.com"
          className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg hover:translate-y-1 flex flex-col items-center text-center group  w-full max-w-xs"
        >
          <div className="bg-red-100 p-4 rounded-full mb-4 group-hover:bg-red-600 transition-colors duration-300 ">
            <Mail className="text-red-600 group-hover:text-white w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg mb-2">Email Us</h3>
          <p className="text-gray-600 text-sm break-words w-full">
            support@skedutech.com 
          </p>
        </a>

        {/* Opening Hours Card */}
        <div className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg hover:translate-y-1 flex flex-col items-center text-center group w-full max-w-xs">
          <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:bg-purple-600 transition-colors duration-300">
            <Clock className="text-purple-600 group-hover:text-white w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg mb-2">Hours</h3>
          <p className="text-gray-600 text-sm">Mon - Fri: 9:00 AM - 6:00 PM</p>
          <p className="text-gray-600 text-sm">Sat: 9:00 AM - 1:00 PM</p>
          <p className="text-gray-600 text-sm">Sun: Closed</p>
        </div>
      </div>

      {/* Connect With Us Button */}
      
    </section>
  );
});

export default ContactUsSection;