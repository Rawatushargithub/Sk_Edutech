import React from 'react';
import { Zap, ShieldCheck, TrendingUp, Award, MonitorPlay, BarChart, Handshake, Target, Users, MapPin, ExternalLink } from 'lucide-react';
import Navbar from '../Navbar';

const FeatureCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 text-blue-600 mr-4" />
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    <p className="text-gray-600 flex-grow">{children}</p>
  </div>
);

const ReasonPartner = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      <div className="bg-gray shadow-md">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Why Partner with SK EDUTECH?</h1>
          <p className="mt-4 text-xl text-gray-600">
            Join One of India’s Fastest Growing Computer Education Networks — No Franchise Fee Required!
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-lg text-center text-gray-700 mb-12 max-w-4xl mx-auto">
          Are you ready to start your own education venture with low investment and high returns? Partnering with SK EDUTECH means joining a nationally recognized, government-registered organization with a proven track record in vocational and computer training.
        </p>

        <section>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Top Reasons to Become an Authorized SK EDUTECH Training Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={ShieldCheck} title="Government-Registered & Recognized">
              Registered under the Ministry of Corporate Affairs (MCA), Govt. of India and certified under ISO 9001:2015 standards.
            </FeatureCard>
            <FeatureCard icon={Zap} title="No Franchise Fee">
              We offer a zero-investment franchise model—no royalty, no hidden fees, and no renewal charges.
            </FeatureCard>
            <FeatureCard icon={TrendingUp} title="Established Since 2018">
              A trusted name in IT and vocational education with a growing network of 200+ authorized study centers.
            </FeatureCard>
            <FeatureCard icon={Award} title="Valid Certifications for Employment">
              Students receive certifications recognized in both private and public sectors, supporting job placement and career growth.
            </FeatureCard>
            <FeatureCard icon={MonitorPlay} title="Online Verification System">
              24/7 online verification for certificates, student IDs, marksheets, and center authorization.
            </FeatureCard>
            <FeatureCard icon={BarChart} title="Low Risk, High Return Business">
              Start a center with minimal investment and achieve over 200% return through high-demand courses.
            </FeatureCard>
          </div>
        </section>

        <section className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Who Can Join as a Partner?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div className="bg-blue-100 p-6 rounded-lg"><p className="font-semibold text-blue-800">IT or Education Professionals</p></div>
                <div className="bg-blue-100 p-6 rounded-lg"><p className="font-semibold text-blue-800">Existing Computer Centers</p></div>
                <div className="bg-blue-100 p-6 rounded-lg"><p className="font-semibold text-blue-800">Schools, Colleges, NGOs, & Trusts</p></div>
                <div className="bg-blue-100 p-6 rounded-lg"><p className="font-semibold text-blue-800">Passionate Individuals</p></div>
            </div>
        </section>

        <section className="mt-16 text-center bg-indigo-700 text-white p-12 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Apply Today – Be Part of the SK EDUTECH Mission</h2>
            <p className="text-lg opacity-90 mb-6">Ready to take the first step toward owning your own education center?</p>
            <a href="https://www.skedutech.com/apply" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-3 bg-white text-indigo-700 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors">
                Apply Now
                <ExternalLink className="w-5 h-5 ml-2" />
            </a>
        </section>

      </main>
    </div>
  );
};

export default ReasonPartner;
