import { Clock, Instagram, Linkedin, MapPin, MessageCircle, Phone, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CONTACT, whatsappLink } from '../data/contact';

const socials = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Youtube, label: 'YouTube' },
];

const columns = [
  {
    title: 'Explore',
    links: [
      { to: '/', label: 'Home' },
      { to: '/fleet', label: 'Our Fleet' },
      { to: '/tours', label: 'Day Trips' },
      { to: '/about', label: 'About Us' },
      { to: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/book-now', label: 'Book Now' },
      { to: '/driving-permit', label: 'Driving Permit' },
      { to: '/about#safety', label: 'Safety Guide' },
      { to: '/contact#store', label: 'Find Our Store' },
      { to: '/contact', label: 'Contact Us' },
    ],
  },
];

/* Phones get a 44px tap target; desktop keeps the list tight. */
const linkClass =
  'inline-flex items-center min-h-[44px] lg:min-h-0 text-sm font-medium text-dark/70 hover:text-brand transition-colors';

const headingClass = 'font-bold text-xs uppercase tracking-[0.15em] text-dark/40 mb-5';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="bg-beige pt-16 md:pt-24 pb-10 border-t border-dark/5">
      <div className="max-w-7xl mx-auto px-6">
        {/* Newsletter band */}
        <div className="bg-white rounded-3xl border border-dark/5 px-6 py-8 md:px-10 md:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16 md:mb-20">
          <div className="max-w-md">
            <h3 className="font-display font-bold text-2xl md:text-3xl tracking-tight">
              Riding tips &amp; deals<span className="text-brand">.</span>
            </h3>
            <p className="text-sm text-dark/60 mt-2">
              Exclusive rental deals and hidden south-coast routes, straight to your inbox.
            </p>
          </div>
          {subscribed ? (
            <div className="bg-beige rounded-2xl px-6 py-4">
              <p className="text-sm font-bold">You're subscribed! 🎉</p>
              <p className="text-xs text-dark/50 font-medium mt-1">
                Look out for rental deals and hidden routes in your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto lg:min-w-[420px]">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:bg-beige sm:rounded-full sm:p-1.5">
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@email.com"
                  className="flex-1 min-w-0 bg-beige sm:bg-transparent rounded-full px-5 py-3 text-base sm:text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-brand text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all"
                >
                  Subscribe
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 mb-16">
          <div className="col-span-2 lg:col-span-4 space-y-5">
            <span className="block font-display font-bold text-3xl tracking-tight uppercase">
              Hello Rent<span className="text-brand">.</span>
            </span>
            <p className="text-dark/60 text-sm leading-relaxed max-w-xs">
              Explore Sri Lanka your way. Scooters, motorbikes, tuk-tuks and cars from €5/day, picked up from our store in Weligama on the south coast.
            </p>
            <div className="flex items-center gap-2 -ml-2">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`Hello Rent on ${label}`}
                  className="w-11 h-11 lg:w-9 lg:h-9 flex items-center justify-center rounded-full text-dark hover:text-brand hover:bg-dark/5 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map(({ title, links }) => (
            <div key={title} className="lg:col-span-2">
              <h4 className={headingClass}>{title}</h4>
              <ul className="space-y-0 lg:space-y-3">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link to={to} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 lg:col-span-4">
            <h4 className={headingClass}>Visit Us</h4>
            <ul className="space-y-3 text-sm text-dark/70">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                <a href={CONTACT.directionsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                  {CONTACT.address}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                <span>{CONTACT.hours}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                <a href={`tel:+${CONTACT.whatsappNumber}`} className="hover:text-brand transition-colors">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-brand" />
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-dark/10">
          <p className="text-xs text-dark/40 font-medium">
            © {new Date().getFullYear()} Hello Rent. All rights reserved.
          </p>
          <div className="px-4 py-2 bg-white rounded-full text-[10px] font-bold tracking-wider border border-dark/5 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
            24/7 ROADSIDE SUPPORT AVAILABLE
          </div>
        </div>
      </div>
    </footer>
  );
}
