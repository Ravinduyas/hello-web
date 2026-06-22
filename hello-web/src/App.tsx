/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Stats from './components/Stats';
import HowItWorks from './components/HowItWorks';
import ProductGrid from './components/ProductGrid';
import Testimonials from './components/Testimonials';
import { Blog, CTASection } from './components/Blog';
import FleetPage from './pages/FleetPage';
import LocationsPage from './pages/LocationsPage';
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
      <Testimonials />
      <Blog />
      <CTASection />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="min-h-screen">
        <Navbar />
        <div id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
