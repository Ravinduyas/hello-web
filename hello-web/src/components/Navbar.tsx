import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Our Fleet', to: '/fleet' },
  { label: 'Locations', to: '/locations' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact Us', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // Hidden while the full-screen hero is in view; slides in once scrolled past it.
  const [hidden, setHidden] = useState(true);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', latest => {
    // On the home page the hero is full-screen, so stay hidden across most of
    // the first viewport. On inner pages (shorter heroes) reveal after a nudge.
    const threshold = pathname === '/' ? window.innerHeight * 0.85 : 80;
    setHidden(latest < threshold);
  });

  return (
    <>
      <motion.nav
        variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
        initial="hidden"
        animate={hidden && !open ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-white/80 backdrop-blur-md border-b border-dark/5 text-dark shadow-sm"
      >
        <Link to="/" className="flex items-center font-display font-bold text-xl tracking-tight uppercase">
          Hello Rent<span className="text-brand">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors hover:text-brand ${
                pathname === link.to ? 'text-brand font-bold' : 'text-dark/70'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/book" className="hidden md:flex btn-primary text-sm py-2 px-5">
            BOOK NOW
          </Link>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="md:hidden p-2 rounded-full hover:bg-dark/5 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col px-8 py-10"
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
