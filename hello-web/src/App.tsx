/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BASE_URL } from './lib/asset';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import ProductGrid from './components/ProductGrid';
import WhyChooseUs from './components/WhyChooseUs';
import OurStory from './components/OurStory';
import Testimonials from './components/Testimonials';
import TrustBand from './components/TrustBand';
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
      <WhyChooseUs />
      <OurStory />
      <Testimonials />
      <Blog />
      <CTASection />
    </main>
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
      <div className="min-h-screen">
        <Navbar />
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
        <TrustBand />
        <Footer />
      </div>
    </BrowserRouter>
  );
}
