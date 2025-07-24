import React from 'react';
import Navbar from '../Navbar';
import { Target, Users, TrendingUp, BookOpen, Globe } from 'lucide-react';

const AimCard = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg flex items-start">
    <div className="flex-shrink-0 mr-4">{icon}</div>
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{children}</p>
    </div>
  </div>
);

const OurAim = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      {/* Header */}
      <div className="bg-gray border-b border-gray-200">
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Our Aim
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            To empower India through accessible, high-quality skill development.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AimCard icon={<Target className="w-10 h-10 text-blue-600" />} title="Empower All Learners">
            We aim to empower learners from all backgrounds—including students, job seekers, homemakers, and working professionals—by offering affordable, high-quality education and skill development opportunities.
          </AimCard>
          <AimCard icon={<Globe className="w-10 h-10 text-blue-600" />} title="Bridge the Skill Gap">
            We are committed to making computer education and vocational training accessible, especially in rural, tribal, and economically weaker regions, to bridge the digital and skill gap with industry-relevant training.
          </AimCard>
          <AimCard icon={<BookOpen className="w-10 h-10 text-blue-600" />} title="Offer Diverse & Certified Courses">
            Our curriculum includes a wide range of certified courses in computer applications, accounting, digital marketing, and more, ensuring that learners of all ages and backgrounds can benefit.
          </AimCard>
          <AimCard icon={<TrendingUp className="w-10 h-10 text-blue-600" />} title="Provide Lifetime Support">
            Every student receives access to smart class video content, eBooks, and lifetime support, ensuring learning is flexible, self-paced, and available anytime, anywhere, at no additional cost.
          </AimCard>
        </div>
        <div className="mt-8">
            <AimCard icon={<Users className="w-10 h-10 text-blue-600" />} title="Expand Our Reach">
                Through our expanding franchise network and zero-investment model, we aim to bring skill-based education to every corner of India, nurturing a generation that is confident, capable, and ready for the future.
            </AimCard>
        </div>
      </main>
    </div>
  );
};

export default OurAim;
