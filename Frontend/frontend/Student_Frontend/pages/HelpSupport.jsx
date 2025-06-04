import React from "react";
import { Phone, Mail, MapPin } from "lucide-react"; // Lucide icons

const HelpSupport = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 flex items-center justify-center">
      <div className="w-full bg-white rounded-md shadow-lg p-8 border border-blue-900">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-950">
          Help & Support
        </h2>

        <div className="space-y-6 text-lg">
          <div className="flex items-start gap-4">
            <Phone className="text-blue-950 w-6 h-6 mt-1" />
            <div>
              <p className="font-semibold text-blue-950">Phone Support:</p>
              <p className="text-gray-700">+91 9876543210</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="text-blue-950 w-6 h-6 mt-1" />
            <div>
              <p className="font-semibold text-blue-950">Email Support:</p>
              <p className="text-gray-700">support@skeduteh.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="text-blue-950 w-6 h-6 mt-1" />
            <div>
              <p className="font-semibold text-blue-950">Location:</p>
              <p className="text-gray-700">
                Skeduteh Tuition Centre, Sector 15, Noida, Uttar Pradesh, India
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-10 text-sm text-gray-600">
          We're here to help! Reach out anytime between{" "}
          <strong className="text-blue-950">10:00 AM - 6:00 PM</strong> (Mon - Sat)
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
