import React, { useState } from 'react';
import Navbar from '../Navbar';
import { Mail, Globe, CheckCircle } from 'lucide-react';

const Message = () => {
  const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi

  const content = {
    en: {
      title: "Message from the Managing Directors",
      directors: "Mr. Satish Kumar & Mr. Satveer Kumar",
      position: "Managing Directors – SK EDUTECH",
      emails: "satish@skedutech.com & satveer@skedutech.com",
      greeting: "Respected Study Centers, Students, and Well-wishers,",
      welcome: "Welcome to SK EDUTECH!",
      body: [
        "Skill-based learning and professional education are rapidly transforming India’s future. It has always been my heartfelt dream to contribute to our nation's development by empowering youth through education—and that dream took shape through the establishment of SK EDUTECH.",
        "Since our inception, we have been committed to delivering affordable, high-quality, and practical education to learners across all corners of the country. Our growing network of study centers is dedicated to creating a nurturing, career-focused environment that allows students to unlock their true potential.",
        "Thanks to our focus on excellence, student support, and industry-relevant training, SK EDUTECH has earned a reputation as a trusted name in the field of computer education and vocational training. Many of our students are now proudly contributing to top organizations across both government and private sectors, securing competitive job roles and fulfilling careers.",
        "We continue to invest in modern infrastructure, curriculum upgrades, and digital learning tools to ensure that every student receives the best possible training. Through smart class access, multilingual eBooks, and live practice sessions, our goal is to help every student learn in a flexible and inclusive environment.",
        "Our faculty and training partners come from diverse and experienced backgrounds. Before any training reaches the student, our study centers undergo extensive training directly from SK EDUTECH—ensuring consistency, clarity, and quality in every classroom."
      ],
      valuesTitle: "At SK EDUTECH, we believe in:",
      values: [
        "Transparency",
        "Integrity",
        "Open communication",
        "Continuous feedback and improvement"
      ],
      invitation: "We encourage all students, educators, and partners to freely share your suggestions, feedback, queries, or concerns. Your input helps us improve and grow stronger together.",
      closing: "I warmly invite you to be a part of the SK EDUTECH family and experience a journey of learning, empowerment, and transformation. I wish each one of you a successful and fulfilling experience with us.",
      regards: "Warm regards,",
    },
    hi: {
      title: "प्रबंध निदेशकों का संदेश",
      directors: "श्री सतीश कुमार और श्री सतवीर कुमार",
      position: "प्रबंध निदेशक – SK EDUTECH",
      emails: "satish@skedutech.com & satveer@skedutech.com",
      greeting: "सम्मानित अध्ययन केंद्रों, छात्रों और शुभचिंतकों,",
      welcome: "SK EDUTECH में आपका स्वागत है!",
      body: [
        "कौशल-आधारित शिक्षा और व्यावसायिक शिक्षा भारत के भविष्य को तेज़ी से बदल रही है। शिक्षा के माध्यम से युवाओं को सशक्त बनाकर देश के विकास में योगदान देना हमेशा से मेरा हार्दिक सपना रहा है—और SK EDUTECH की स्थापना के साथ यह सपना साकार हुआ।",
        "अपनी स्थापना के बाद से, हम देश के सभी कोनों में शिक्षार्थियों को किफ़ायती, उच्च-गुणवत्ता वाली और व्यावहारिक शिक्षा प्रदान करने के लिए प्रतिबद्ध हैं। हमारे अध्ययन केंद्रों का बढ़ता नेटवर्क एक ऐसा पोषणकारी, करियर-केंद्रित वातावरण बनाने के लिए समर्पित है जो छात्रों को उनकी वास्तविक क्षमता को उजागर करने का अवसर प्रदान करता है।",
        "उत्कृष्टता, छात्र सहायता और उद्योग-प्रासंगिक प्रशिक्षण पर हमारे ध्यान के कारण, SK EDUTECH ने कंप्यूटर शिक्षा और व्यावसायिक प्रशिक्षण के क्षेत्र में एक विश्वसनीय नाम के रूप में ख्याति अर्जित की है। हमारे कई छात्र अब सरकारी और निजी दोनों क्षेत्रों के शीर्ष संगठनों में गर्व से योगदान दे रहे हैं, प्रतिस्पर्धी नौकरी और संतुष्टिदायक करियर हासिल कर रहे हैं।",
        "हम आधुनिक बुनियादी ढाँचे, पाठ्यक्रम उन्नयन और डिजिटल शिक्षण उपकरणों में निवेश जारी रखते हैं ताकि यह सुनिश्चित किया जा सके कि प्रत्येक छात्र को सर्वोत्तम संभव प्रशिक्षण मिले। स्मार्ट क्लास एक्सेस, बहुभाषी ई-बुक्स और लाइव अभ्यास सत्रों के माध्यम से, हमारा लक्ष्य प्रत्येक छात्र को एक लचीले और समावेशी वातावरण में सीखने में मदद करना है।",
        "हमारे संकाय और प्रशिक्षण भागीदार विविध और अनुभवी पृष्ठभूमि से आते हैं। किसी भी प्रशिक्षण के छात्र तक पहुँचने से पहले, हमारे अध्ययन केंद्र सीधे SK EDUTECH से व्यापक प्रशिक्षण प्राप्त करते हैं - जिससे प्रत्येक कक्षा में एकरूपता, स्पष्टता और गुणवत्ता सुनिश्चित होती है।"
      ],
      valuesTitle: "SK EDUTECH में, हम निम्नलिखित में विश्वास करते हैं:",
      values: [
        "पारदर्शिता",
        "ईमानदारी",
        "खुला संचार",
        "निरंतर प्रतिक्रिया और सुधार"
      ],
      invitation: "हम सभी छात्रों, शिक्षकों और भागीदारों को अपने सुझाव, प्रतिक्रिया, प्रश्न या चिंताएँ खुलकर साझा करने के लिए प्रोत्साहित करते हैं। आपका इनपुट हमें बेहतर बनाने और एक साथ मज़बूत बनने में मदद करता है।",
      closing: "मैं आपको SK EDUTECH परिवार का हिस्सा बनने और सीखने, सशक्तिकरण और परिवर्तन की यात्रा का अनुभव करने के लिए हार्दिक आमंत्रित करता हूँ। मैं आप सभी के लिए हमारे साथ एक सफल और संतुष्टिदायक अनुभव की कामना करता हूँ।",
      regards: "नमस्कार,",
    }
  };

  const current = content[language];

  return (
    <div className="bg-gray font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-50 rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{current.title}</h1>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'en' ? 'हिंदी में पढ़ें' : 'Read in English'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left mb-8 pb-8 border-b">
              {/* <img 
                src="https://via.placeholder.com/150" // Placeholder image
                alt="Managing Directors" 
                className="w-32 h-32 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6 border-4 border-blue-100"
              /> */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{current.directors}</h2>
                <p className="text-md text-gray-600">{current.position}</p>
                <div className="flex items-center justify-center sm:justify-start mt-2 text-sm text-blue-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{current.emails}</span>
                </div>
              </div>
            </div>

            <div className="text-gray-700 leading-relaxed space-y-4">
              <p className="font-semibold">{current.greeting}</p>
              <p className="font-bold text-lg text-blue-700">{current.welcome}</p>
              {current.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              <div className="bg-blue-50 p-6 rounded-lg my-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{current.valuesTitle}</h3>
                <ul className="space-y-2">
                  {current.values.map((value, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p>{current.invitation}</p>
              <p>{current.closing}</p>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-semibold">{current.regards}</p>
                <p className="font-bold text-gray-900">{current.directors}</p>
                <p className="text-sm text-gray-600">{current.position}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Message;
