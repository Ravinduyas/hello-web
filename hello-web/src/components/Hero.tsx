import { ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { asset } from '../lib/asset';

const slides = [
  { src: asset('/hero-couple-scooter.jpg'), alt: 'A foreign couple riding a scooter together with helmets in Sri Lanka' },
  { src: asset('/hero-hill-riders.jpg'), alt: 'Travelers riding adventure motorbikes through Sri Lanka’s hill country' },
  { src: asset('/hero-group-ride.jpg'), alt: 'A group of riders with their motorbikes on a Sri Lankan mountain ridge' },
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
      {/* Vignette — pulls the corners down so the centre of the photo stays the
          brightest point and the type sits on the darker edge. */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 35%, rgba(46,33,27,0.45) 100%)',
        }}
      />

      {/* Slide indicators, with a magazine-style counter above them. */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
        <span className="font-display text-xs font-bold text-beige tabular-nums tracking-tight">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex flex-col gap-3">
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
        <span className="font-display text-xs font-bold text-beige/40 tabular-nums tracking-tight">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full eyebrow !text-white mb-7 border border-white/20">
            [ Sri Lanka's Favourite Scooter Rental ]
          </span>
          {/* Headline reveals a line at a time — each line masked so it rises
              into view rather than simply fading. */}
          <h1 className="display-xl text-6xl md:text-8xl text-white mb-8">
            {['Discover Sri Lanka', 'your way'].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.12 }}
                  className={`block ${i === 1 ? 'text-brand' : ''}`}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-8 mt-12">
            <Link to="/fleet" className="btn-light group w-fit">
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
            anchored to the foot of the hero like a magazine masthead. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-6 pb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/20 pt-5 text-white">
            {[
              { k: 'Est.', v: 'Since 2018' },
              { k: 'Pickup', v: 'Weligama' },
              { k: 'Fleet', v: '50+ Bikes' },
              { k: 'From', v: '€5 / day' },
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
