import React from 'react';
import { ExternalLink, UploadCloud, FileText, Award, FileCheck, MapPin, Phone, Mail, Shield, BookOpen, UserCheck, GitBranch, Tv, LifeBuoy, CreditCard, CheckCircle, Users, Building, List } from 'lucide-react';
import Navbar from '../Navbar';

const Section = ({ title, icon: Icon, children }) => (
  <section className="mb-12">
    <div className="flex items-center mb-6">
      {Icon && <Icon className="w-8 h-8 text-blue-600 mr-4" />}
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    </div>
    {children}
  </section>
);

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
    <div className="flex items-center mb-3">
      <Icon className="w-6 h-6 text-green-500 mr-3" />
      <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
    </div>
    <p className="text-gray-600">{children}</p>
  </div>
);

const Step = ({ number, title, children }) => (
    <div className="flex items-start mb-4">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold mr-4 flex-shrink-0">
            {number}
        </div>
        <div>
            <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
            <div className="text-gray-600">{children}</div>
        </div>
    </div>
);

const HowToGetFran = () => {
  return (
    <div className="bg-gray-50 font-sans">
        <Navbar/>
        <div className="bg-gray shadow-md">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-gray-900">How to Get Franchise Affiliation</h1>
            <p className="mt-2 text-lg text-gray-600">
              We welcome passionate educators, entrepreneurs, and training providers to join the SK Edutech family.
            </p>
          </div>
        </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <Section title="Method 1: Online Franchise Affiliation" icon={UploadCloud}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Step-by-Step Process</h3>
              <Step number="1" title="Visit Our Website">
                <p>Go to <a href="https://www.skedutech.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">skedutech.com</a>.</p>
              </Step>
              <Step number="2" title="Click on “Apply for Franchise”">
                <p>Find the link on our homepage or in the “Affiliation Process” section.</p>
              </Step>
              <Step number="3" title="Fill the Online Form">
                <p>Provide your personal details, center location, qualifications, and infrastructure info.</p>
              </Step>
              <Step number="4" title="Upload Documents">
                <p>Aadhaar Card, Educational Certificates, Passport Size Photo, and optional Building Agreement.</p>
              </Step>
              <Step number="5" title="Pay Registration Fee (₹1999)">
                <p>Use our secure payment gateway. You'll receive a confirmation email upon payment.</p>
              </Step>
              <Step number="6" title="Verification & Approval">
                <p>Our team will review your application within 24–72 hours for approval.</p>
              </Step>
               <Step number="7" title="Receive Affiliation Kit">
                <p>A complete Welcome Kit will be sent via email and courier with your center code, login panel, and branding materials.</p>
              </Step>
            </div>
            <div className="flex items-center justify-center">
                <a href="https://www.skedutech.com/apply" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105">
                    Apply Online Now
                    <ExternalLink className="w-5 h-5 ml-2" />
                </a>
            </div>
          </div>
        </Section>

        <Section title="Method 2: Offline Franchise Affiliation" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">Step-by-Step Process</h3>
                    <Step number="1" title="Contact Our Franchise Team">
                        <p>Call or WhatsApp us at <span className="font-semibold">+91-8860836811</span> or <span className="font-semibold">+91-8076782988</span>.</p>
                    </Step>
                    <Step number="2" title="Download & Fill Franchise Form">
                        <p>Get the form from our website or request it via email at <a href="mailto:support@skedutech.com" className="text-blue-600 hover:underline">support@skedutech.com</a>.</p>
                    </Step>
                    <Step number="3" title="Attach Required Documents">
                        <p>Photocopies of Aadhaar Card, Qualification Certificates, Photos, and optional Rent/Ownership Proof.</p>
                    </Step>
                    <Step number="4" title="Submit Documents">
                        <p>Courier or email the scanned documents to our corporate office.</p>
                        <p className="text-sm text-gray-500 mt-1">Address and email provided in the contact section.</p>
                    </Step>
                    <Step number="5" title="Franchise Fee Submission">
                        <p>Payment details will be shared after your documents are reviewed.</p>
                    </Step>
                    <Step number="6" title="Verification & Confirmation">
                        <p>Our team will verify your documents and confirm your partnership upon approval.</p>
                    </Step>
                    <Step number="7" title="Receive Franchise Kit">
                        <p>Your complete Welcome Kit will be sent to you via email and courier.</p>
                    </Step>
                </div>
                <div className="bg-indigo-100 p-6 rounded-lg">
                    <h4 className="text-xl font-bold text-indigo-800 mb-4">Contact for Offline Process</h4>
                    <p className="flex items-center mb-2"><Phone className="w-5 h-5 mr-2 text-indigo-600"/> +91-8860836811, +91-8076782988</p>
                    <p className="flex items-center mb-2"><Mail className="w-5 h-5 mr-2 text-indigo-600"/> support@skedutech.com</p>
                    <p className="flex items-start"><MapPin className="w-5 h-5 mr-2 text-indigo-600 mt-1"/> 1ST Floor, Narsinghpur, Link Road NH-8, Near Tata Pasco, Gurugram, Haryana - 122001</p>
                </div>
            </div>
        </Section>

        <Section title="Benefits of SK Edutech Franchise" icon={Award}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <InfoCard icon={Shield} title="Govt. Registered">ISO Certified & MCA Registered Brand</InfoCard>
            <InfoCard icon={BookOpen} title="1000+ Courses">IT, Vocational, Teacher Training & More</InfoCard>
            <InfoCard icon={UserCheck} title="Online/Offline Exams">Flexible examination system</InfoCard>
            <InfoCard icon={GitBranch} title="No Royalty Model">Keep what you earn</InfoCard>
            <InfoCard icon={Tv} title="Marketing Support">Branding and promotional materials</InfoCard>
            <InfoCard icon={LifeBuoy} title="Lifetime Center Code">Your unique identity with us</InfoCard>
            <InfoCard icon={CreditCard} title="Flexible Fee Structure">Affordable for students</InfoCard>
            <InfoCard icon={CheckCircle} title="Lifetime Valid Certificates">Industry-recognized credentials</InfoCard>
          </div>
        </Section>

        <Section title="Document Requirements" icon={FileCheck}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><Users className="w-6 h-6 mr-2 text-blue-500"/> For Individuals/Proprietorship</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Address Proof: Latest Electricity or Phone Bill, Passport, or Voter ID.</li>
                        <li>Photo ID: PAN Card, Aadhaar, Driving License, or Passport.</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><Building className="w-6 h-6 mr-2 text-blue-500"/> For Partnership Firm</h3>
                     <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Address & ID proof for all partners.</li>
                        <li>Signed Partnership Deed.</li>
                        <li>Authorization letter on firm's letterhead.</li>
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><List className="w-6 h-6 mr-2 text-blue-500"/> For Trust/Society</h3>
                     <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>Copy of Registration Certificate or Trust Deed.</li>
                        <li>Address & ID proof for two key members.</li>
                        <li>Authorization letter on official letterhead.</li>
                    </ul>
                </div>
            </div>
        </Section>

        <Section title="Franchise Available Across India" icon={MapPin}>
          <p className="text-center text-gray-600 mb-4">We are inviting partners from all states and union territories to join our mission.</p>
          <div className="text-sm text-center text-gray-500 bg-gray-100 p-4 rounded-lg">
            Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jammu & Kashmir, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttarakhand, Uttar Pradesh, West Bengal, and all Union Territories.
          </div>
        </Section>

      </main>
    </div>
  );
};

export default HowToGetFran;
