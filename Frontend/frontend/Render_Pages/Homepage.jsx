import { Route,Routes } from 'react-router-dom'
import { useState } from 'react';

// importing all components one by one
import Navbar from "../Homepage_frontend/components/navbar/Navbar";
import MainSlider from "../Homepage_frontend/components/mainSlider/MainSlider";
import GalleryHomepage from "../Homepage_frontend/components/gallery/Gallery";
import LoginBoxes from '../Homepage_frontend/components/loginBoxes/LoginBoxes';
import EducationSection from '../Homepage_frontend/components/educationSection/EducationSection';
import OurAchievers from '../Homepage_frontend/components/ourAchievers/OurAchievers';
import ReviewsSection from '../Homepage_frontend/components/ReviewsSection/ReviewsSection';
import ContactUsSection from '../Homepage_frontend/components/contactUs/ContactUsSection';
import Footer from '../Homepage_frontend/components/footer/Footer';
import TopMarquee from '../Homepage_frontend/components/marqueeLine/TopMarquee';
import BottomMarquee from '../Homepage_frontend/components/marqueeLine/BottomMarquee';
import NAllReviewsPage from '../Homepage_frontend/components/ReviewsSection/NewAllReviews'
import ApplyFranchiseModal from '../Homepage_frontend/ApplyFranchiseModal';


// import EducationSection from "../componenets/EducationSection";
// import OurAchievers from "../componenets/OurAchievers";
// import ContactUsSection from "../componenets/ContactUsSection";
// import ReviewsSection from "../componenets/ReviewsSection";
// import Footer from "../componenets/Footer";


function HomePage() {

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false); // State for modal visibility

    const handleOpenApplyModal = () => {
        setIsApplyModalOpen(true);
    };

    const handleCloseApplyModal = () => {
        setIsApplyModalOpen(false);
    };


    return (
      <div>
        <Navbar/>
        
        <Routes>
          {/* Default route for the main homepage content */}
          <Route path="/" element={
            <>
              <MainSlider/>
              <TopMarquee />
              <LoginBoxes onApplyClick={handleOpenApplyModal}/>
              <EducationSection/>
              <BottomMarquee />
              <OurAchievers/>
              <ReviewsSection />
              <ContactUsSection />
            </>
          } />

        
        </Routes>
        <Footer/>

        {/* Render the modal conditionally */}
        {isApplyModalOpen && (
            <ApplyFranchiseModal isOpen={isApplyModalOpen} onClose={handleCloseApplyModal} />
        )}

      </div>
    );
  }
  export default HomePage;