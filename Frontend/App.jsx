import { Route,Routes } from 'react-router-dom'
import './index.css'
import Sidebar from './frontend/AdminPanel_frontend/Sidebar/Sidebar';
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



// import NAllReviewsPage from './componenets/NewAllReviews'

// import CertificateVerification from './componenets/Certificate'
// import AboutUs from './componenets/AboutUs'

// import GalleryHomepage from './componenets/Gallery/Gallery'
// import MarqueeDisplay from './componenets/MarqueeLine/Marqueeline'
// import Downloadpdf from './componenets/downloadpdf'

function App() {

  return (
    <>
      <Routes>
        {/* Homepage Routes */}
        <Route path="/" element={<HomePage/>} />
        <Route path="/gallery" element={<GalleryHomepage/>} />
<Route path="/allreviews" element={<NAllReviewsPage/>} />


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
