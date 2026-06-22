import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ProductGrid() {
  const categories = [
    {
      name: 'Scooters',
      tagline: 'Automatic & easy',
      price: 'From $9 / day',
      copy: 'Lightweight automatics for beach roads and city streets — twist and go, no gears.',
      image: '/hero-couple-scooter.jpg',
      alt: 'Travelers riding an automatic scooter in Sri Lanka',
    },
    {
      name: 'Bikes',
      tagline: 'Manual & capable',
      price: 'From $15 / day',
      copy: 'Manual sport and touring bikes built for Ella’s mountain passes and hill-country rides.',
      image: '/bike-tea-plantation.png',
      alt: 'A motorbike parked among Sri Lankan tea fields',
    },
    {
      name: 'Three Wheelers',
      tagline: 'Covered & comfy',
      price: 'From $20 / day',
      copy: 'The classic tuk-tuk — shaded, roomy, and the most fun way to road-trip the island.',
      image: '/couple-tuktuk-sigiriya.jpg',
      alt: 'Travelers in a tuk-tuk with Sigiriya rock behind',
    },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Choose Your Ride ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              Find your perfect ride
            </h2>
            <span className="section-index">(02)</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to="/fleet"
                aria-label={`Browse ${cat.name}`}
                className="group relative block h-[440px] lg:h-[520px] rounded-3xl overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.alt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Espresso-tinted gradient, darkest at the foot for text legibility. */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/30 to-dark/10" />

                <span className="absolute top-6 left-6 eyebrow !text-white/70">
                  {cat.tagline}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-7 md:p-8 text-beige">
                  <h3 className="display-xl text-3xl md:text-4xl">{cat.name}</h3>
                  <p className="text-beige/70 text-sm leading-relaxed mt-3">{cat.copy}</p>

                  <div className="flex items-center justify-between mt-7 pt-5 border-t border-beige/20">
                    <span className="font-display text-base font-bold">{cat.price}</span>
                    <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide group-hover:gap-3 transition-all">
                      Browse <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
