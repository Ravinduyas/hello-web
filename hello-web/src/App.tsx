/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, type ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ROUTE_PATHS, type RoutePath } from './data/routes';
import { BASE_URL } from './lib/asset';
import ScrollToTop from './components/ScrollToTop';
import PageSeo from './components/PageSeo';
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
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TourPlansPage = lazy(() => import('./pages/TourPlansPage'));
const DrivingPermitPage = lazy(() => import('./pages/DrivingPermitPage'));
const FleetPage = lazy(() => import('./pages/FleetPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));

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
 * What each public path renders.
 *
 * Typed against the shared route list, so a page and its URL cannot fall out
 * of step — and neither can sitemap.xml, which the build writes from that same
 * list. A path added there is a type error here until it has a page.
 */
const PAGES: Record<RoutePath, ReactElement> = {
  '/': <HomePage />,
  '/fleet': <FleetPage />,
  '/book-now': <BookingPage />,
  '/tours': <TourPlansPage />,
  '/driving-permit': <DrivingPermitPage />,
  '/about': <AboutPage />,
  '/blog': <BlogPage />,
  '/contact': <ContactPage />,
};

/**
 * A redirect that does not throw away what the old URL was carrying.
 *
 * `<Navigate to="/book-now">` would drop `?category=Scooter` and land the
 * visitor on a booking page with nothing chosen, which is worse than the link
 * they clicked.
 */
function KeepQuery({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
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
  const bare = pathname === '/book-now';

  return (
    <div className="min-h-screen">
      <PageSeo />
      {!bare && <Navbar />}
      {/* Keyed on the path so each page plays the entrance once when it
          arrives, rather than the container animating a single time on load. */}
      <div id="main-content" key={pathname} className="rise">
        {/* A route's code arrives as its own file now, so there is a moment
            between clicking and rendering. The fallback holds the page's height
            so the footer does not jump up to meet the header and back down. */}
        <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
          <Routes>
            {ROUTE_PATHS.map(path => (
              <Route key={path} path={path} element={PAGES[path]} />
            ))}
            {/* The Locations page was folded into Contact; keep the old URL
                working for anyone arriving from a bookmark or search result.
                A redirect is not a page, so it stays out of the sitemap. */}
            <Route path="/locations" element={<Navigate to="/contact#store" replace />} />
            {/* /book was the booking page's URL until it became /book-now. It
                has been shared over WhatsApp and indexed, and the fleet used to
                link to it with a category attached, so the query has to survive
                the move or the arrival lands on an empty picker. */}
            <Route path="/book" element={<KeepQuery to="/book-now" />} />
          </Routes>
        </Suspense>
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
