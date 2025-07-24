import React from 'react';
import { Building, Target, FileWarning, ShieldCheck, MessageSquareQuote } from 'lucide-react';
import Navbar from '../Navbar';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
    <div className="flex items-center mb-4">
      <Icon className="w-10 h-10 text-blue-600 mr-4" />
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="text-gray-700 leading-relaxed space-y-4">{children}</div>
  </div>
);

const PublicNote = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      <div className="bg-gray border-b border-gray-200">
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
            Public Note
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            SK EDUTECH’s Commitment to Transparency and Quality
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Section icon={Building} title="About Us">
          <p>
            SK EDUTECH is a nationally recognized, ISO 9001:2015 certified, and autonomous organization dedicated to advancing computer education and vocational training across India. Registered under the Ministry of Corporate Affairs (MCA), Government of India, we have been actively working since 2018 to provide skill-based, job-oriented training to learners from all backgrounds—especially those in rural and underserved communities.
          </p>
        </Section>

        <Section icon={Target} title="Our Aim">
          <p>
            At SK EDUTECH, our core aim is to empower individuals through accessible, affordable, and practical education. We serve students, homemakers, job seekers, and professionals with a focus on skill development that leads to meaningful employment. We prioritize accessibility in remote and economically weaker regions, delivering smart class video content, free eBooks, live practice tests, and multilingual learning materials.
          </p>
        </Section>

        <Section icon={FileWarning} title="Cancellation & Refund Policy">
          <p>
            <strong>Franchise Application:</strong> Submitting a franchise application is free of charge. Interested individuals or organizations can inquire at any time for full details.
          </p>
          <p>
            <strong>Center Distance Policy:</strong> To maintain fair operational zones, the minimum distance between two centers must be 3 km in rural areas and 1 km in urban areas. Duplicate registrations within these zones will be canceled without a refund.
          </p>
          <p>
            <strong>Refund Terms:</strong> All payments made toward franchise activation, student registration, or other services are non-refundable under any circumstances.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Privacy Policy">
          <p>
            SK EDUTECH is committed to safeguarding the personal information of our students, partners, and applicants. All data collected is stored securely and used strictly for educational and administrative purposes. We do not share or sell personal data with third parties.
          </p>
        </Section>

        <div className="text-center bg-gray-800 text-white p-10 rounded-lg">
            <MessageSquareQuote className="w-12 h-12 mx-auto mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold mb-2">A Final Note</h2>
            <p className="max-w-2xl mx-auto">
                We invite all aspiring students, educators, and franchise partners to join us in our mission to build a more skilled, self-reliant, and digitally empowered India. Your trust is our foundation, and we are committed to transparency, quality, and lifelong learning.
            </p>
        </div>
      </main>
    </div>
  );
};

export default PublicNote;
