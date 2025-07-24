import { Route,Routes } from 'react-router-dom'
import './index.css'
import HomePage from './frontend/Render_Pages/Homepage'
import AdminPanel from './frontend/Render_Pages/AdminPanel';
import StudentPanel from './frontend/Render_Pages/StudentPanel'
import GalleryHomepage from './frontend/Homepage_frontend/components/gallery/Gallery';
import NAllReviewsPage from './frontend/Homepage_frontend/components/ReviewsSection/NewAllReviews';
import CenterPanel from './frontend/Render_Pages/CenterPanel';


import AdminLogin from './frontend/AdminPanel_frontend/Admin.Login';



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
