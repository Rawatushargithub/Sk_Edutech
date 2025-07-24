import React from 'react';
import Navbar from '../Navbar';
import { FileText, XCircle, MapPin, DollarSign, AlertTriangle } from 'lucide-react';

const PolicySection = ({ icon, title, children }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg flex items-start">
    <div className="flex-shrink-0 mr-6">{icon}</div>
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
    </div>
  </div>
);

const RefundPolicy = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      {/* Header */}
      <div className="bg-gray border-b border-gray-200">
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Cancellation & Refund Policy
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Our policies regarding franchise applications and payments.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <PolicySection icon={<FileText className="w-10 h-10 text-blue-600" />} title="Franchise Application">
            <p>SK EDUTECH does not charge any fees for submitting a franchise application. Individuals, companies, NGOs, and educational institutions are encouraged to apply to become an authorized study center under our network.</p>
            <p>Applicants are welcome to contact our support team at any stage for clarification regarding our services, operations, or franchise terms. No hidden charges or upfront fees are collected during the application stage.</p>
          </PolicySection>

          <PolicySection icon={<XCircle className="w-10 h-10 text-red-600" />} title="Cancellation of Application">
            <p>If a prospective franchisee does not agree with SK EDUTECH's policies, procedures, or operational guidelines, they may cancel their application by submitting a written request to our official email address: <a href="mailto:support@skedutech.com" className="text-blue-600 font-medium">support@skedutech.com</a>.</p>
          </PolicySection>

          <PolicySection icon={<MapPin className="w-10 h-10 text-green-600" />} title="Distance Criteria Between Centers">
            <p>To maintain operational exclusivity and quality, a minimum distance of <strong>2 kilometers</strong> between centers is required in rural areas and <strong>1 kilometer</strong> in urban areas.</p>
            <p>Please verify that no other SK EDUTECH center exists in your area before applying. If two applications are received for the same location, the later one will be cancelled.</p>
          </PolicySection>

          <PolicySection icon={<AlertTriangle className="w-10 h-10 text-yellow-500" />} title="Non-Refundable Payments">
            <p>All payments made for franchise activation, student registration, student training fees, and market review fees are <strong>non-refundable</strong> under any circumstances.</p>
            <p>Once a payment is processed, it is considered final and non-reversible, regardless of usage or participation status.</p>
          </PolicySection>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;
