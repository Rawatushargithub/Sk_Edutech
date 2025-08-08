import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
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

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginBoxesRef = useRef(null);
  const contactUsRef = useRef(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const sectionRefs = {
        loginBoxes: loginBoxesRef,
        contactUs: contactUsRef,
      };

      const targetRef = sectionRefs[location.state.scrollTo];

      if (targetRef && targetRef.current) {
        const yOffset = -80; // Adjust this value as needed
        const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        // Clear the state to prevent scrolling on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location]); // State for modal visibility

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
              <LoginBoxes ref={loginBoxesRef} onApplyClick={handleOpenApplyModal}/>
              <EducationSection/>
              <BottomMarquee />
              <OurAchievers/>
              <ReviewsSection />
              <ContactUsSection ref={contactUsRef} />
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