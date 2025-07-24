import React from 'react';
import { Building, CheckCircle, Users, Award, BookOpen, Monitor, Wifi, Printer, User, Heart, Droplets, Library, Shield, TrendingUp, Star, MapPin, Mail, ExternalLink, Globe } from 'lucide-react';
import Navbar from '../Navbar';

const Section = ({ title, icon, children }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-12 border border-gray-200/80">
      <div className="p-6 md:p-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-4">
            <IconComponent className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="text-gray-600 leading-relaxed space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, children }) => {
  const IconComponent = icon;
  return (
    <div className="bg-gray-50/80 border border-gray-200/90 rounded-lg p-6 h-full">
      <div className="flex items-center text-blue-600 mb-3">
        <IconComponent className="w-6 h-6 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600">
        {children}
      </p>
    </div>
  );
};

const AffiliationProcess = () => {
  return (
    <div className="bg-gray-50 font-sans">
        <Navbar/>
      {/* Hero Section */}
      <header className="bg-gray border-b  border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Partner with SK EDUTECH
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Launch your own government-recognized computer education center with our zero-franchise-fee model and empower your community through digital literacy.
          </p>
          <a 
            href="https://www.skedutech.com/apply" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
          >
            Apply for Franchise Now
            <ExternalLink className="w-5 h-5 ml-2" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4  sm:px-6 lg:px-8 py-16">

        <Section title="Why Choose SK EDUTECH?" icon={TrendingUp}>
          <p className="mb-6">
            We are a fast-growing, government-registered institution committed to skill-based learning and vocational training. Our transparent, ethical, and student-focused model makes us the ideal partner for your entrepreneurial journey in IT education.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard icon={Shield} title="Government Recognized">
              Registered under the Ministry of Corporate Affairs (MCA), Govt. of India, and ISO 9001:2015 certified.
            </InfoCard>
            <InfoCard icon={Award} title="Zero Franchise Fee">
              Start your journey with no initial franchise fee. We believe in accessible partnership opportunities.
            </InfoCard>
            <InfoCard icon={BookOpen} title="Industry-Aligned Curriculum">
              Our courses are designed to meet current industry needs, ensuring your students are job-ready.
            </InfoCard>
            <InfoCard icon={Users} title="Lifetime Student Support">
              We provide lifetime support and smart class access for all students, adding immense value to your center.
            </InfoCard>
          </div>
        </Section>

        <Section title="Who Can Apply for a Franchise?" icon={Users}>
          <p className="mb-6">We welcome applications from passionate individuals and organizations dedicated to spreading quality computer education. You are a great fit if you are:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>An individual with a background in IT or teaching experience.</li>
            <li>An existing computer training center seeking to upgrade and gain national recognition.</li>
            <li>A school, college, or other educational institution.</li>
            <li>A registered society, NGO, or charitable trust committed to community development.</li>
          </ul>
        </Section>

        <Section title="Minimum Infrastructure Requirements" icon={Building}>
          <p className="mb-6">To ensure a quality learning environment, your center should meet the following minimum requirements:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {[ 
              { icon: Monitor, text: "Minimum 5 Computers" },
              { icon: Building, text: "200 sq. ft. Space" },
              { icon: Wifi, text: "Internet Connection" },
              { icon: Printer, text: "Printer & Scanner" },
              { icon: User, text: "Qualified Faculty" },
              { icon: Library, text: "Basic Library / Reading Area" },
              { icon: Heart, text: "First-Aid Kit" },
              { icon: Droplets, text: "Clean Drinking Water" },
            ].map((item, index) => (
              <div key={index} className="flex items-center">
                <item.icon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Specialized Courses Available for Affiliation" icon={Star}>
          <p className="mb-6">Expand your offerings with our in-demand, specialized vocational courses:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {["Nursery Teacher Training (NTT)", "Computer Teacher Training (CTT)", "Beautician Courses", "Fashion Designing"].map(program => (
              <div key={program} className="bg-blue-50 text-blue-800 rounded-lg p-4 text-center font-medium border border-blue-200">
                {program}
              </div>
            ))}
          </div>
        </Section>

        <Section title="How to Apply" icon={Mail}>
          <p className="mb-6">Starting your SK EDUTECH center is a straightforward process. Follow these simple steps to begin your application:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200/90 rounded-lg p-6">
              <div className="flex items-center text-blue-600 mb-3">
                <Globe className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">1. Online Application</h3>
              </div>
              <p className="text-gray-600 mb-4">For the fastest processing, please use our official online portal to submit your application.</p>
              <a href="https://www.skedutech.com/apply" target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800 inline-flex items-center">
                Go to Online Portal <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-gray-50 border border-gray-200/90 rounded-lg p-6">
              <div className="flex items-center text-blue-600 mb-3">
                <Mail className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">2. Email Submission</h3>
              </div>
              <p className="text-gray-600 mb-4">Alternatively, you can download the form and submit your application via email.</p>
              <a href="mailto:support@skedutech.com" className="font-medium text-blue-600 hover:text-blue-800 inline-flex items-center">
                Email to support@skedutech.com <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </Section>

      </main>
    </div>
  );
};

export default AffiliationProcess;