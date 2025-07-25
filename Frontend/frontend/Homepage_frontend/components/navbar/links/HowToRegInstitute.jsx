import React from 'react';
import { Globe, Phone, Mail, FileText, UploadCloud, Building, Send, UserCheck, CreditCard } from 'lucide-react';
import Navbar from '../Navbar';

const Step = ({ icon: Icon, title, children }) => (
  <div className="flex items-start space-x-4 mb-6">
    <div className="flex-shrink-0">
      <Icon className="w-8 h-8 text-blue-600 mt-1" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="text-gray-600">{children}</div>
    </div>
  </div>
);

const HowToRegInstitute = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      <div className="bg-gray shadow-md">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">How to Register Your Institute with SK Edutech</h1>
          <p className="mt-4 text-xl text-gray-600">
            Join our network by following the simple affiliation process below.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Online Method */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">🟢 Method 1: Online Affiliation</h2>
            <Step icon={Globe} title="Step 1: Visit Our Website">
              <p>Go to <a href="https://www.skedutech.com/" className="text-blue-600 hover:underline">skedutech.com</a> and click on "Apply for Franchise."</p>
            </Step>
            <Step icon={FileText} title="Step 2: Fill the Online Form">
              <p>Provide your personal details, center location, qualifications, and infrastructure info.</p>
            </Step>
            <Step icon={UploadCloud} title="Step 3: Upload Documents">
              <p>Upload your Aadhaar Card, qualification certificates, and a passport-size photo.</p>
            </Step>
            <Step icon={CreditCard} title="Step 4: Pay Registration Fee (₹1999)">
              <p>Complete the payment through our secure gateway to receive an email confirmation.</p>
            </Step>
            <Step icon={UserCheck} title="Step 5: Verification & Approval">
              <p>Our team will review your application within 24–72 hours for official affiliation.</p>
            </Step>
            <Step icon={Send} title="Step 6: Receive Affiliation Kit">
              <p>Your Welcome Kit (certificate, center code, branding assets) will be sent via email and courier.</p>
            </Step>
          </div>

          {/* Offline Method */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 border-orange-500 pb-2">🟠 Method 2: Offline Affiliation</h2>
            <Step icon={Phone} title="Step 1: Contact Our Team">
              <p>Call or WhatsApp us at <strong className="text-gray-900">+91-8860836811</strong> or <strong className="text-gray-900">+91-8076782988</strong>.</p>
            </Step>
            <Step icon={FileText} title="Step 2: Download & Fill Form">
              <p>Download the form from our website or request it via email at <a href="mailto:support@skedutech.com" className="text-blue-600 hover:underline">support@skedutech.com</a>.</p>
            </Step>
            <Step icon={UploadCloud} title="Step 3: Attach Documents">
              <p>Attach a photocopy of your Aadhaar Card, qualifications, and two passport-size photos.</p>
            </Step>
            <Step icon={Building} title="Step 4: Send Documents">
              <p>Courier the form and documents to our corporate office or email them to <a href="mailto:support@skedutech.com" className="text-blue-600 hover:underline">support@skedutech.com</a>.</p>
            </Step>
            <Step icon={CreditCard} title="Step 5: Fee Submission">
              <p>Payment details will be provided after our team reviews your documents.</p>
            </Step>
            <Step icon={UserCheck} title="Step 6: Verification & Confirmation">
              <p>Once approved, you will be officially listed as a Franchise Partner.</p>
            </Step>
            <Step icon={Send} title="Step 7: Receive Franchise Kit">
              <p>Your Welcome Kit will be sent to you with full access to our digital resources.</p>
            </Step>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowToRegInstitute;
