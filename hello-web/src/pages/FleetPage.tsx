import { useEffect, useState } from 'react';
import { ArrowRight, Route } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { bikes as defaultBikes, formatPrice, summariseCategories, type Bike } from '../data/fleet';
import { asset } from '../lib/asset';
import { fetchBikes } from '../lib/api';

// Lucky's own advice: for a trip around the whole island, take exactly one of
// these three rather than choosing on looks.
const touringPicks = [
  {
    title: 'TVS Ntorq 125',
    copy: 'The strongest automatic we rent — enough power for long days and 22L of storage.',
  },
  {
    title: 'Bajaj Pulsar, up to 160cc',
    copy: 'Manual, perimeter frame and a 12L tank. The one for mountain passes and distance.',
  },
  {
    title: 'Bajaj 4-stroke tuk-tuk',
    copy: 'Three seats, a roof over your head and 60–80L of luggage space. Slow, but it never stops.',
  },
];

// How the four automatics differ where it actually matters to a rider.
const scooterFit = [
  {
    name: 'Honda Navi 110',
    character: 'Mini-bike hybrid',
    bestFor: 'Petite and short riders',
    storage: 'None — box on request',
  },
  {
    name: 'Honda Dio 110',
    character: 'Trusted commuter',
    bestFor: 'Petite to average riders',
    storage: '18 litres',
  },
  {
    name: 'Yamaha Ray ZR',
    character: 'Smart hybrid choice',
    bestFor: 'Petite to tall riders',
    storage: '21 litres',
  },
  {
    name: 'TVS Ntorq 125',
    character: 'Performance king',
    bestFor: 'Average to tall riders',
    storage: '22 litres',
  },
];

export default function FleetPage() {
  // Fleet is admin-managed; fall back to bundled defaults if the API is unreachable.
  const [bikes, setBikes] = useState<Bike[]>(defaultBikes);

  useEffect(() => {
    let on = true;
    fetchBikes()
      .then(list => {
        if (on && list) setBikes(list);
      })
      .catch(() => {
        /* offline — defaults remain */
      });
    return () => {
      on = false;
    };
  }, []);

  // The page presents the four vehicle types rather than every named model —
  // a visitor picks the kind of ride here and the exact vehicle at booking.
  // Categories come from the fleet itself (admin-managed), so adding one in
  // the admin adds a card here.
  const summaries = summariseCategories(bikes);

  return (
    <div className="bg-beige min-h-screen">

      <div className="relative h-[58vh] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-dark/55 z-10" />
        <img
          src={asset('/photos/fleet-lineup.jpg')}
          alt="The Hello Rent scooter fleet lined up outside the shop in Weligama"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="eyebrow !text-white/60">[ Our Fleet ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Our rental fleet
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Automatic scooters from €5/day for coastal cruising, manual bikes for the mountain roads, tuk-tuks for the whole family, and air-conditioned cars. Every bike comes with a helmet.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {summaries.map((cat, idx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
            >
              <Link
                to={`/book?category=${encodeURIComponent(cat.category)}`}
                aria-label={`Rent ${cat.meta.label}`}
                className="group relative block h-[440px] lg:h-[500px] rounded-3xl overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.meta.label}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Espresso-tinted gradient, darkest at the foot for legibility. */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/30 to-dark/10" />

                {cat.meta.transmission && (
                  <span className="absolute top-6 left-6 eyebrow !text-white/70">
                    {cat.meta.transmission}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-7 md:p-8 text-beige">
                  <h3 className="display-xl text-3xl md:text-4xl">{cat.meta.label}</h3>
                  {cat.meta.blurb && (
                    <p className="text-beige/70 text-sm leading-relaxed mt-3">{cat.meta.blurb}</p>
                  )}

                  <div className="flex items-center justify-between mt-7 pt-5 border-t border-beige/20">
                    <span className="font-display text-base font-bold">
                      From {formatPrice(cat.from)} / day
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide group-hover:gap-3 transition-all">
                      Rent <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ── Touring advice ────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-24 bg-dark text-beige rounded-3xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-16 items-start">
            <div className="space-y-5">
              <Route className="w-7 h-7 text-brand" strokeWidth={1.5} />
              <h2 className="display-xl text-3xl md:text-4xl">
                Planning to tour <br /> the island?
              </h2>
              <p className="text-beige/60 text-sm leading-relaxed">
                Then the body style matters less than the vehicle. For long distances across Sri
                Lanka, take one of these three — they're the ones we know will hold up.
              </p>
            </div>

            <div className="space-y-4">
              {touringPicks.map(pick => (
                <div
                  key={pick.title}
                  className="flex items-start gap-4 border-t border-beige/20 pt-4"
                >
                  <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-2" />
                  <div>
                    <p className="font-display text-lg font-bold">{pick.title}</p>
                    <p className="text-beige/55 text-sm leading-relaxed mt-1">{pick.copy}</p>
                  </div>
                </div>
              ))}
              <p className="text-beige/50 text-sm leading-relaxed pt-4 border-t border-beige/20">
                Just staying around Weligama? Any scooter will do. And if your plans change and you
                decide to go touring, come back and we'll exchange it for something more suitable.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Scooter fit guide ─────────────────────────────────────────── */}
        <section className="mt-16 md:mt-24">
          <header className="section-head">
            <span className="eyebrow">[ Which Scooter Fits You ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-5xl max-w-3xl">
                Pick by your height, not the colour
              </h2>
              <span className="section-index">(01)</span>
            </div>
            <p className="text-dark/60 leading-relaxed max-w-2xl mt-8">
              All four automatics are easy to ride. The real difference is how they fit you — seat
              height, knee room and how much you can carry.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-dark/15">
            {scooterFit.map((scooter, idx) => (
              <motion.div
                key={scooter.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 4) * 0.08 }}
                className="border-r border-b border-dark/15 p-7 md:p-8 flex flex-col gap-4"
              >
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                  {scooter.character}
                </span>
                <h3 className="font-display text-lg md:text-xl font-bold leading-tight">
                  {scooter.name}
                </h3>
                <div className="space-y-3 mt-auto pt-4 border-t border-dark/10">
                  <div>
                    <p className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                      Best for
                    </p>
                    <p className="text-sm text-dark/70 mt-1">{scooter.bestFor}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                      Storage
                    </p>
                    <p className="text-sm text-dark/70 mt-1">{scooter.storage}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

