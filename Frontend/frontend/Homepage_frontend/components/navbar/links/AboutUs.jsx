import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Target, Award, Users } from 'lucide-react';
import Navbar from '../Navbar';

const AboutUs = () => {
  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />
      {/* Header */}
        <div className="bg-gray border-b border-gray-200">
        <div className=" max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl">
            About SK EDUTECH
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Empowering India Through Accessible, Skill-Based Education.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* About Us Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Who We Are</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Card 1: Our Mission */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-center items-center mb-4 w-16 h-16 mx-auto bg-blue-100 rounded-full">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To make skill-based education affordable and accessible to learners from all walks of life, especially in rural and underserved regions.
              </p>
            </div>

            {/* Card 2: Our Credentials */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-center items-center mb-4 w-16 h-16 mx-auto bg-blue-100 rounded-full">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Our Credentials</h3>
              <p className="text-gray-600">
                An ISO 9001:2015 certified organization, registered under the Ministry of Corporate Affairs (MCA), leading the way with 200+ study centers.
              </p>
            </div>

            {/* Card 3: For Our Students */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex justify-center items-center mb-4 w-16 h-16 mx-auto bg-blue-100 rounded-full">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">For Our Students</h3>
              <p className="text-gray-600">
                Offering nationally recognized certificates and industry-relevant skills completely free of cost through the ESIW Scheme.
              </p>
            </div>
          </div>
        </section>

        {/* Offerings Section */}
        <section className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-start">
                <CheckCircle className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Comprehensive Courses</h3>
                  <p className="text-gray-600">Certified courses in DCA, ADCA, Tally, Accounting, and Digital Marketing.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-start">
                <CheckCircle className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Free Learning Resources</h3>
                  <p className="text-gray-600">Smart class video content, multilingual eBooks, and an 8,000+ exam practice series.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-start">
                <CheckCircle className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Online Verification System</h3>
                  <p className="text-gray-600">A free, secure online system for certificate, marksheet, and student verification.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-start">
                <CheckCircle className="w-7 h-7 text-green-500 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Franchise Opportunities</h3>
                  <p className="text-gray-600">Transparent and zero-investment franchise model with no hidden fees.</p>
                </div>
              </div>
            </div>
        </section>

        {/* Final Note / CTA */}
        <section className="mt-16 bg-blue-600 text-white py-16 rounded-lg">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-lg opacity-90 mb-8">
                At SK EDUTECH, we are driven by a single mission: to empower youth through affordable, skill-based education that leads to real employment opportunities. We invite you to join us in shaping a more skilled and self-reliant India.
            </p>
            <Link 
              to="/how-to-get-franchise"
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-transform transform hover:scale-105 inline-block"
            >
              Become a Partner
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AboutUs;
