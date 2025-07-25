import React from 'react';
import Navbar from '../Navbar';
import { FileText, Shield, AlertTriangle, CheckSquare } from 'lucide-react';

const Section = ({ title, icon, children }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
    <div className="flex items-center mb-4">
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="text-gray-700 leading-relaxed space-y-4 pl-16">
      {children}
    </div>
  </div>
);

const TermAndConditions = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      {/* Header */}
      <header className="bg-gray-100 border-b border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Please read our terms carefully before partnering with us.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Section title="Affirmation and Declaration" icon={<FileText />}>
          <p className="font-semibold text-gray-900">I/We hereby solemnly affirm and declare as under:</p>
          <ul className="list-disc list-outside space-y-3 pl-5">
            <li>That I/We have established/opened a Centre at a fixed and verifiable location.</li>
            <li>That I/We have established/opened the above-mentioned Centre/Institute/NGO in accordance with the required norms.</li>
            <li>That I/We have fulfilled all requirements to run an authorized All Zone Course (Software Zone / Hardware Zone / Teacher Training Zone / Vocational Zone) under SK Edutech.</li>
            <li>That SK Edutech shall issue authorization to run the above-mentioned Zone(s)/Course(s) only for the single, officially registered location.</li>
            <li>This authorization shall not apply to any franchise or branch at different locations. For any other location, I/We shall submit a new application for center authorization.</li>
            <li>That I/We shall remain liable for all due payments towards SK Edutech under all circumstances.</li>
          </ul>
        </Section>

        <Section title="Fees and Financial Responsibility" icon={<Shield />}>
          <p>SK Edutech has no share in student admission fees, tuition fees, or examination fees. All such fees shall be decided solely by us based on investment, infrastructure, student-teacher ratio, and local conditions.</p>
          <p>SK Edutech shall not be held responsible for any disputes arising from fees. I/We shall be solely liable.</p>
          <p>SK Edutech shall charge a one-time nominal registration fee per student, as per the course duration.</p>
          <p>All investments, expenses, and operational responsibilities (computers, furniture, salaries, rent, software, taxes, etc.) shall be fully managed and borne by us.</p>
          <p>All payments made or to be made to SK Edutech are non-refundable under any circumstances.</p>
        </Section>

        <Section title="Operational Guidelines & Compliance" icon={<CheckSquare />}>
            <p>Student diplomas/certificates will be received at our center via postal service.</p>
            <p>The authorization for our Centre/Institute/NGO is subject to renewal each year in March, before the 31st.</p>
            <p>SK Edutech reserves the right to modify, update, or introduce new rules and regulations.</p>
            <p>All center data shall be submitted to the Head Office in Excel format before the 10th of every month.</p>
            <p>A minimum of 30 student admissions shall be maintained in every financial year.</p>
            <p>All financial dues shall be submitted to the Head Office before the 10th of each month.</p>
            <p>Identity cards are mandatory for both teachers and students.</p>
        </Section>

        <Section title="Prohibitions and Legal Clauses" icon={<AlertTriangle />}>
          <p>SK Edutech shall not be held liable for any independent commitments, schemes, or advertisements conducted by us.</p>
          <p>If any person involved in our Centre is found guilty of criminal, financial, or social offenses, the authorization shall be terminated automatically.</p>
          <p>No center head shall create any page on any social media platform or website using the name "SK Edutech." Any such action shall result in immediate termination and legal action.</p>
          <p>If any individual is found guilty of wrongdoing at the center, the branch head shall be held accountable. The Head Office shall bear no responsibility.</p>
          <div className="font-semibold text-gray-900 mt-6 mb-3">Declaration Clause:</div>
          <p>In the event of any dispute, it shall be resolved by a committee appointed by SK Edutech. The committee's decision shall be final and binding. Jurisdiction shall rest with the courts in Gurugram (Haryana).</p>
          <p>I/We declare that the information provided is true and accurate. This declaration shall remain binding on us and our successors.</p>
        </Section>
      </main>
    </div>
  );
};

export default TermAndConditions;
