import { ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const slides = [
  { src: '/hero-couple-scooter.jpg', alt: 'A foreign couple riding a scooter together with helmets in Sri Lanka' },
  { src: '/hero-hill-riders.jpg', alt: 'Travelers riding adventure motorbikes through Sri Lanka’s hill country' },
  { src: '/hero-group-ride.jpg', alt: 'A group of riders with their motorbikes on a Sri Lankan mountain ridge' },
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  // Auto-advance the hero slideshow; pauses are unnecessary for three slides.
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-dark" style={{ height: '100dvh' }}>
      {/* Crossfading slideshow with a slow Ken Burns zoom. */}
      <AnimatePresence>
        <motion.img
          key={index}
          src={slides[index].src}
          alt={slides[index].alt}
          fetchPriority="high"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2, ease: 'easeInOut' }, scale: { duration: 6.5, ease: 'linear' } }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Espresso-tinted gradient: darkest at lower-left for headline + index-bar legibility. */}
      <div className="absolute inset-0 z-10 bg-gradient-to-tr from-dark/80 via-dark/50 to-dark/25" />

      {/* Slide indicators. */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`w-2 rounded-full transition-all ${
              i === index ? 'h-8 bg-beige' : 'h-2 bg-beige/40 hover:bg-beige/70'
            }`}
          />
        ))}
      </div>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full eyebrow !text-white mb-7 border border-white/20">
            [ Sri Lanka's Favourite Scooter Rental ]
          </span>
          <h1 className="display-xl text-6xl md:text-8xl text-white mb-8">
            Discover Sri Lanka <br />
            <span className="text-brand">your way</span>
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-8 mt-12">
            <Link to="/fleet" className="btn-light group w-fit text-base px-7 py-3.5 tracking-wide">
              BOOK YOUR RIDE
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex text-brand">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-white text-xs mt-1 font-medium">(4.9) Rated by 2,400+ Travelers</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Editorial index bar — hairline rule + small-caps meta columns,
            riding beneath the headline like a magazine masthead. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/20 pt-5 text-white">
            {[
              { k: 'Est.', v: 'Since 2018' },
              { k: 'Pickup', v: 'Colombo — Mirissa' },
              { k: 'Fleet', v: '50+ Bikes' },
              { k: 'From', v: '$9 / day' },
            ].map(item => (
              <div key={item.k}>
                <p className="eyebrow !text-white/50">{item.k}</p>
                <p className="font-display text-sm font-bold mt-1">{item.v}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
