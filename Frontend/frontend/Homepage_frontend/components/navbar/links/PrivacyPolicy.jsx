import React from 'react';
import Navbar from '../Navbar';
import { ShieldCheck, Mail, FileText, CreditCard, Users, Lock, Info, HelpCircle, Edit } from 'lucide-react';

const PolicySection = ({ id, icon, title, children }) => (
  <section id={id} className="mb-10">
    <div className="flex items-center mb-4">
      {icon}
      <h2 className="text-2xl font-bold text-gray-800 ml-3">{title}</h2>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-md text-gray-700 space-y-4 leading-relaxed">
      {children}
    </div>
  </section>
);

const PrivacyPolicy = () => {
  const effectiveDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      {/* Header */}
      <div className="bg-gray border-b border-gray-200">
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Privacy Statement</h1>
          <p className="mt-4 text-lg text-gray-600">Effective Date: {effectiveDate}</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PolicySection id="collection" icon={<FileText className="w-8 h-8 text-blue-600" />} title="SECTION 1 – What Information Do We Collect?">
          <p>When you interact with our services, we collect personal information such as your name, address, email, phone number, IP address, photo, and institute logo. We may also use cookies to understand your browser and system preferences.</p>
          <h4 className="font-bold">Email Communication</h4>
          <p>With your permission, we may send emails regarding offers, services, and updates.</p>
        </PolicySection>

        <PolicySection id="consent" icon={<ShieldCheck className="w-8 h-8 text-green-600" />} title="SECTION 2 – Consent">
          <p>By completing a transaction or submitting a form, you consent to the collection and use of your information for that specific purpose. For secondary purposes like marketing, we will seek your explicit consent or offer an opt-out option.</p>
          <h4 className="font-bold">How to Withdraw Consent</h4>
          <p>You may withdraw consent anytime by emailing us at <a href="mailto:support@skedutech.com" className="text-blue-600 font-medium">support@skedutech.com</a> or by post.</p>
        </PolicySection>

        <PolicySection id="disclosure" icon={<Info className="w-8 h-8 text-gray-600" />} title="SECTION 3 – Disclosure">
          <p>We may disclose your information if required by law or if you violate our Terms of Service.</p>
        </PolicySection>

        <PolicySection id="payments" icon={<CreditCard className="w-8 h-8 text-purple-600" />} title="SECTION 4 – Payments">
          <p>We use Razorpay for secure payment processing. Your card details are not stored on our servers, and payment data is encrypted under PCI-DSS standards. For more details, please review <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">Razorpay's Privacy Policy</a>.</p>
        </PolicySection>

        <PolicySection id="third-party" icon={<Users className="w-8 h-8 text-orange-600" />} title="SECTION 5 – Third-Party Services">
          <p>Third-party providers only access the data necessary to perform their services. We encourage you to review their privacy policies, as our policy no longer applies once you leave our site.</p>
        </PolicySection>

        <PolicySection id="security" icon={<Lock className="w-8 h-8 text-red-600" />} title="SECTION 6 – Data Security">
          <p>We follow industry best practices to ensure your data is protected from unauthorized access, disclosure, loss, or destruction.</p>
        </PolicySection>

        <PolicySection id="cookies" icon={<Info className="w-8 h-8 text-teal-600" />} title="SECTION 7 – Cookies">
          <p>We use cookies to maintain your session. These do not personally identify you on other websites.</p>
        </PolicySection>

        <PolicySection id="age" icon={<ShieldCheck className="w-8 h-8 text-yellow-600" />} title="SECTION 8 – Age of Consent">
          <p>By using this site, you confirm that you are at least 13 years of age or have provided consent for any minor dependents to use our website.</p>
        </PolicySection>

        <PolicySection id="changes" icon={<Edit className="w-8 h-8 text-indigo-600" />} title="SECTION 9 – Changes to This Privacy Policy">
          <p>We reserve the right to update this policy at any time. Changes take effect immediately once posted. If SK EDUTECH is acquired or merged, your data may be transferred to the new ownership.</p>
        </PolicySection>

        <PolicySection id="contact" icon={<Mail className="w-8 h-8 text-blue-600" />} title="QUESTIONS & CONTACT">
          <p>To access, update, or delete your personal data, or for any privacy concerns, contact our Privacy Compliance Officer at <a href="mailto:support@skedutech.com" className="text-blue-600 font-medium">support@skedutech.com</a> or via mail.</p>
        </PolicySection>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
