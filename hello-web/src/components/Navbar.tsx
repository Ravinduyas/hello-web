import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Our Fleet', to: '/fleet' },
  { label: 'About Us', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact Us', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // Drives the lift: translucent and weightless over a hero, solid once the
  // page is scrolling under it.
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', latest => setScrolled(latest > 40));

  return (
    <>
      {/* Floating cream pill, centred and clear of the page edges, so the hero
          image reads behind it instead of being cut by a full-width bar. */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        className="fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl"
      >
        <div
          className={`flex items-center justify-between gap-6 rounded-full pl-5 pr-2 py-2 border transition-all duration-300 ${
            scrolled
              ? 'bg-beige/95 backdrop-blur-md border-dark/10 shadow-lg shadow-dark/10'
              : 'bg-beige/80 backdrop-blur-md border-white/40 shadow-md shadow-dark/5'
          }`}
        >
          <Link
            to="/"
            className="flex items-center font-display font-bold text-lg tracking-tight uppercase text-dark shrink-0"
          >
            Hello Rent<span className="text-brand">.</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {links.map(link => {
              const activeLink = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-full transition-colors ${
                    activeLink ? 'text-dark' : 'text-dark/60 hover:text-dark'
                  }`}
                >
                  {/* Shared pill that slides between items as the route changes. */}
                  {activeLink && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-dark/[0.07]"
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to="/book" className="btn-primary text-xs px-5 py-2.5 md:text-sm">
              BOOK NOW
            </Link>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="md:hidden p-2 rounded-full text-dark hover:bg-dark/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-beige flex flex-col px-8 py-10"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-display font-bold text-xl tracking-tight uppercase">
                Hello Rent<span className="text-brand">.</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2 hover:bg-dark/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`font-display text-3xl font-bold transition-colors hover:text-brand ${
                    pathname === link.to ? 'text-brand' : 'text-dark'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="btn-primary justify-center mt-10 py-3"
            >
              BOOK NOW
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
