/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { BASE_URL } from './lib/asset';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import ProductGrid from './components/ProductGrid';
import Services from './components/Services';
import WhyChooseUs from './components/WhyChooseUs';
import OurStory from './components/OurStory';
import Testimonials from './components/Testimonials';
import TrustBand from './components/TrustBand';
import WhatsAppButton from './components/WhatsAppButton';
import { Blog, CTASection } from './components/Blog';
import AboutPage from './pages/AboutPage';
import TourPlansPage from './pages/TourPlansPage';
import DrivingPermitPage from './pages/DrivingPermitPage';
import FleetPage from './pages/FleetPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';

function HomePage() {
  return (
    <main>
      <Hero />
      <Stats />
      <HowItWorks />
      <ProductGrid />
      <Services />
      <WhyChooseUs />
      <OurStory />
      <Testimonials />
      <Blog />
      <CTASection />
    </main>
  );
}

/**
 * Booking runs without the site's furniture — no navbar, trust band or footer.
 *
 * Once someone is filling in a booking, a menu inviting them to read the blog
 * is a way out of a half-finished form rather than a service to them. The page
 * carries its own way back to the site.
 */
function Shell() {
  const { pathname } = useLocation();
  const bare = pathname === '/book';

  return (
    <div className="min-h-screen">
      {!bare && <Navbar />}
      <div id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tours" element={<TourPlansPage />} />
          <Route path="/driving-permit" element={<DrivingPermitPage />} />
          <Route path="/fleet" element={<FleetPage />} />
          <Route path="/book" element={<BookingPage />} />
          {/* The Locations page was folded into Contact; keep the old URL
              working for anyone arriving from a bookmark or search result. */}
          <Route path="/locations" element={<Navigate to="/contact#store" replace />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
      {!bare && (
        <>
          <TrustBand />
          <Footer />
        </>
      )}

      {/* Every page, booking included — it is the shop's main way of being
          reached, and a question mid-booking is the one most worth answering. */}
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    // basename keeps routing correct when the site is served from a sub-path
    // (a GitHub Pages project site). It is '/' in dev.
    <BrowserRouter basename={BASE_URL}>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Shell />
    </BrowserRouter>
  );
}
