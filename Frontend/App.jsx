import { Route, Routes } from 'react-router-dom';
import ApplyFranchiseModal from './frontend/Homepage_frontend/ApplyFranchiseModal';
import './index.css'
import HomePage from './frontend/Render_Pages/Homepage'
import AdminPanel from './frontend/Render_Pages/AdminPanel';
import StudentPanel from './frontend/Render_Pages/StudentPanel'
import GalleryHomepage from './frontend/Homepage_frontend/components/gallery/Gallery';
import NAllReviewsPage from './frontend/Homepage_frontend/components/ReviewsSection/NewAllReviews';
import CenterPanel from './frontend/Render_Pages/CenterPanel';


import StudentAchievementsPanel from './frontend/AdminPanel_frontend/OurAchievers/Achievers';
import MainSliderUploadPage from './frontend/AdminPanel_frontend/MainSlider/MainSliderImgUpload';
import AdminGalleryPanel from './frontend/AdminPanel_frontend/GalleryPanel/AdminGalleryPanel';
import MarqueeManager from './frontend/AdminPanel_frontend/MarqueeLine/Marquee';
import EventBox from './frontend/AdminPanel_frontend/OurAchievers/EventBox';
import AdminLogin from './frontend/AdminPanel_frontend/Admin.Login';
import AffiliationProcess from './frontend/Homepage_frontend/components/navbar/links/AffiliationProcess';
import HowToGetFran from './frontend/Homepage_frontend/components/navbar/links/HowToGetFran';
import ReasonPartner from './frontend/Homepage_frontend/components/navbar/links/ReasonPartner';
import HowToRegInstitute from './frontend/Homepage_frontend/components/navbar/links/HowToRegInstitute';
import PublicNote from './frontend/Homepage_frontend/components/navbar/links/PublicNote';
import AboutUs from './frontend/Homepage_frontend/components/navbar/links/AboutUs';
import OurAim from './frontend/Homepage_frontend/components/navbar/links/OurAim';
import RefundPolicy from './frontend/Homepage_frontend/components/navbar/links/RefundPolicy';
import PrivacyPolicy from './frontend/Homepage_frontend/components/navbar/links/PrivacyPolicy';
import Message from './frontend/Homepage_frontend/components/navbar/links/Message';
import TermAndConditions from './frontend/Homepage_frontend/components/navbar/links/TermAndConditions';
import VerifyCertificate from './frontend/Center_frontend/pages/Certificate/VerifybyQr';
import CenterVerification from './frontend/Center_frontend/CenterCertificateVerify';




function App() {

  return (
    <>
      <Routes>
        <Route path="/apply" element={<ApplyFranchiseModal />} />        {/* Homepage Routes */}
        <Route path="/" element={<HomePage/>} />
        <Route path="/gallery" element={<GalleryHomepage/>} />
        <Route path="/allreviews" element={<NAllReviewsPage/>} />

        <Route path="/verify/:certificateId" element={<VerifyCertificate/>} />
        <Route path="/franchise/:franchiseId" element={<CenterVerification/>} />





        <Route path="/affiliation-process" element={<AffiliationProcess />} />
        <Route path="/how-to-get-franchise" element={<HowToGetFran />} />
        <Route path="/reason-partners" element={<ReasonPartner />} />
        <Route path="/affiliation/register-institute" element={<HowToRegInstitute />} />
        <Route path="/public-note" element={<PublicNote />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/our-aim" element={<OurAim />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/message" element={<Message />} />
        <Route path="/term-condition" element={<TermAndConditions />} />

        {/* Admin Routes */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/student/*" element={<StudentPanel />} />
        
    
    {/* Institute Routes */}
        <Route path="/institute/*" element={<CenterPanel />} />
        
        {/* <Route path="/admin" element={<AdminPanel/>} /> */}

        {/* <Route path="/adminachievers" element={<StudentAchievementsPanel/>} />
        <Route path="/adminmainslider" element={<MainSliderUploadPage/>} /> 
        <Route path="/admingallery" element={<AdminGalleryPanel/>} />
        <Route path="/admin/MM" element={<MarqueeManager/>} />
        <Route path="/admin/EventBox" element={<EventBox/>} /> */}


        {/* <Route path="/newa" element={<NAllReviewsPage/>} />
        <Route path="/About" element={<AboutUs/>} />
        <Route path="/gallery" element={<GalleryHomepage/>} />

        <Route path="/veri" element={<CertificateVerification/>} />
        <Route path="/marq" element={<MarqueeDisplay/>} />
        <Route path="/pdf" element={<Downloadpdf/>} /> */}



      </Routes>
    </>
  )
}

export default App;
