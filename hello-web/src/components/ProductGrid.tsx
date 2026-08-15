import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ProductGrid() {
  const categories = [
    {
      name: 'Scooters',
      tagline: 'Automatic & easy',
      price: 'From €5 / day',
      copy: 'Honda Dio, Navi, Yamaha Ray ZR and the TVS Ntorq — twist and go, no gears.',
      image: '/hero-couple-scooter.jpg',
      alt: 'Travelers riding an automatic scooter in Sri Lanka',
    },
    {
      name: 'Bikes',
      tagline: 'Manual & capable',
      price: 'From €10 / day',
      copy: 'Pulsar, FZ, Apache and Hunk — manual bikes built for Ella’s mountain passes.',
      image: '/bike-tea-plantation.png',
      alt: 'A motorbike parked among Sri Lankan tea fields',
    },
    {
      name: 'Three Wheelers',
      tagline: 'Covered & comfy',
      price: 'From €15 / day',
      copy: 'The Bajaj RE tuk-tuk — shaded, seats three, and the most fun way to road-trip.',
      image: '/couple-tuktuk-sigiriya.jpg',
      alt: 'Travelers in a tuk-tuk with Sigiriya rock behind',
    },
    {
      name: 'Cars & Vans',
      tagline: 'Automatic & air-con',
      price: 'From €31 / day',
      copy: 'Wagon R, Spacia, Roomy, Raize, Prius and the KDH van — for families, rain and long drives.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000',
      alt: 'A driver at the wheel of an automatic car at dusk',
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
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
                className="group relative block h-[440px] lg:h-[500px] rounded-3xl overflow-hidden"
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
