import { Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const socials = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Linkedin, label: 'LinkedIn' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Youtube, label: 'YouTube' },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="bg-beige pt-16 md:pt-24 pb-12 border-t border-dark/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-1 space-y-6">
            <span className="font-display font-bold text-3xl tracking-tight uppercase">
              Hello Rent<span className="text-brand">.</span>
            </span>
            <p className="text-dark/60 text-sm leading-relaxed max-w-xs">
              Explore Sri Lanka on two wheels. Scooter and motorbike rentals from $9/day across Colombo, Galle, Kandy, Negombo, and Mirissa.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`Hello Rent on ${label}`}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-dark hover:text-brand hover:bg-dark/5 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-dark/40">Company</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li><Link to="/" className="hover:text-brand transition-colors">Home</Link></li>
                <li><Link to="/fleet" className="hover:text-brand transition-colors">Our Fleet</Link></li>
                <li><Link to="/locations" className="hover:text-brand transition-colors">Locations</Link></li>
                <li><Link to="/blog" className="hover:text-brand transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-brand transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider text-dark/40">Support</h4>
              <ul className="space-y-3 text-sm font-medium">
                <li className="hover:text-brand cursor-pointer transition-colors">How It Works</li>
                <li className="hover:text-brand cursor-pointer transition-colors">FAQs</li>
                <li className="hover:text-brand cursor-pointer transition-colors">Rental Terms</li>
                <li className="hover:text-brand cursor-pointer transition-colors">Safety Guide</li>
                <li><Link to="/fleet" className="hover:text-brand transition-colors">Book Now</Link></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <h4 className="font-bold text-sm uppercase tracking-wider text-dark/40">Riding Tips & Deals</h4>
            {subscribed ? (
              <div className="bg-white border border-dark/5 rounded-2xl px-6 py-5">
                <p className="text-sm font-bold">You're subscribed! 🎉</p>
                <p className="text-[10px] text-dark/50 font-medium mt-1">
                  Look out for rental deals and hidden routes in your inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@email.com"
                    className="w-full bg-white border border-dark/5 rounded-full px-6 py-4 text-sm focus:border-brand transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-brand text-white px-4 rounded-full text-[10px] font-bold uppercase tracking-tight hover:brightness-110 transition-all"
                  >
                    SUBSCRIBE
                  </button>
                </div>
                <p className="text-[10px] text-dark/40 font-medium">
                  Subscribe for exclusive rental deals and hidden routes.
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-dark/5">
          <p className="text-xs text-dark/40 font-medium font-sans">
            © 2026 Hello Rent. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white rounded-full text-[10px] font-bold border border-dark/5 flex items-center gap-2">
              <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              24/7 ROADSIDE SUPPORT AVAILABLE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
