import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { bikes as defaultBikes, type Bike } from '../data/fleet';
import { fetchBikes } from '../lib/api';

export default function FleetPage() {
  const [active, setActive] = useState('All');
  // Fleet is admin-managed; fall back to bundled defaults if the API is unreachable.
  const [bikes, setBikes] = useState<Bike[]>(defaultBikes);

  useEffect(() => {
    let on = true;
    fetchBikes()
      .then(list => {
        if (on && list.length) setBikes(list);
      })
      .catch(() => {
        /* offline — defaults remain */
      });
    return () => {
      on = false;
    };
  }, []);

  // Filters follow the categories actually present in the fleet (admin-managed).
  const filters = ['All', ...Array.from(new Set(bikes.map(b => b.category)))];
  const filtered = active === 'All' ? bikes : bikes.filter(b => b.category === active);

  return (
    <div className="bg-beige min-h-screen">

      <div className="relative h-screen min-h-[600px] w-full overflow-hidden bg-dark" style={{ height: '100dvh' }}>
        <div className="absolute inset-0 bg-dark/55 z-10" />
        <img
          src="https://images.unsplash.com/photo-1706766958001-176b3d7800ff?auto=format&fit=crop&q=80&w=2600"
          alt="Nine Arch Bridge, Ella"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="eyebrow !text-white/60">[ Our Fleet ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Our rental fleet
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Automatic scooters from $9/day for coastal cruising, or manual sport bikes for Sri Lanka's mountain roads. Every bike comes with a helmet.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-16">

        <div className="flex gap-3 mb-12">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                active === f ? 'bg-dark text-white' : 'bg-white text-dark border border-dark/10 hover:border-dark/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((bike, idx) => (
            <motion.div
              key={bike.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="bg-white rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={bike.image}
                  alt={bike.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{bike.category}</span>
                    <h3 className="font-display text-xl font-bold mt-1">{bike.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-black text-brand">${bike.pricePerDay}</span>
                    <span className="text-dark/40 text-xs">/day</span>
                  </div>
                </div>
                <ul className="space-y-1 mb-6">
                  {bike.features.map(f => (
                    <li key={f} className="text-sm text-dark/60 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-brand inline-block" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/book?bike=${bike.id}`}
                  aria-label={`Rent the ${bike.title}`}
                  className="btn-primary w-full justify-center group"
                >
                  RENT NOW
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

