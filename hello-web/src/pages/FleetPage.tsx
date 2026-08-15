import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Minus, Route } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { bikes as defaultBikes, formatPrice, getCategoryMeta, type Bike } from '../data/fleet';
import { getSpec } from '../data/specs';
import { fetchBikes } from '../lib/api';

// Easiest to ride first; anything the admin adds later lands at the end.
const CATEGORY_ORDER = ['Scooter', 'Motorbike', 'Tuk Tuk', 'Car'];
const orderOf = (category: string) => {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
};

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

/**
 * Manufacturer specs plus the honest pros and cons, collapsed by default so the
 * card stays scannable. A plain <details> keeps it keyboard-accessible and
 * working without JS; models with no sheet render nothing at all.
 */
function SpecPanel({ bikeId }: { bikeId: string }) {
  const spec = getSpec(bikeId);
  if (!spec) return null;

  return (
    <details className="group/spec mb-4 border-t border-dark/10 pt-3">
      <summary className="flex items-center justify-between gap-2 cursor-pointer list-none text-[10px] font-bold uppercase tracking-widest text-dark/40 hover:text-brand transition-colors">
        <span>Specs &amp; honest verdict</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform group-open/spec:rotate-180" />
      </summary>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">
            Best for
          </p>
          <p className="text-sm text-dark/70">
            {spec.headline} — {spec.bestFor}
          </p>
        </div>

        <dl className="divide-y divide-dark/10 border-y border-dark/10">
          {spec.specs.map(row => (
            <div key={row.label} className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-dark/45 shrink-0">{row.label}</dt>
              <dd className="text-sm text-dark/80 text-right">{row.value}</dd>
            </div>
          ))}
        </dl>

        {/* Single column — the card is only ~280px wide, so a viewport-based
            two-column split would cramp both lists. */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-2">
              What's good
            </p>
            <ul className="space-y-1.5">
              {spec.pros.map(p => (
                <li key={p} className="text-sm text-dark/65 flex gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-1" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {spec.cons.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-2">
                Worth knowing
              </p>
              <ul className="space-y-1.5">
                {spec.cons.map(c => (
                  <li key={c} className="text-sm text-dark/65 flex gap-2">
                    <Minus className="w-3.5 h-3.5 text-dark/35 shrink-0 mt-1" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </details>
  );
}

/**
 * One category's vehicles as a horizontal, snapping track rather than a grid
 * that wraps and leaves an orphan card on its own row.
 *
 * The arrows exist because a mouse-wheel user cannot scroll a horizontal track;
 * they hide once there is nothing further to scroll in that direction, and are
 * skipped by screen readers since the track itself is keyboard-scrollable.
 */
function CardRow({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // A 1px tolerance — fractional scroll positions never land exactly on the edge.
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const page = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="group"
        aria-label="Vehicles — scroll horizontally"
        className="fleet-track flex gap-8 overflow-x-auto snap-x snap-mandatory
                   focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-4
                   rounded-3xl py-2"
      >
        {children}
      </div>

      {[-1, 1].map(direction => {
        const isLeft = direction === -1;
        const enabled = isLeft ? canScrollLeft : canScrollRight;
        if (!enabled) return null;
        const Icon = isLeft ? ChevronLeft : ChevronRight;
        return (
          <button
            key={direction}
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => page(direction as 1 | -1)}
            className={`hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 z-10
                        w-11 h-11 rounded-full bg-white text-dark shadow-lg
                        hover:bg-dark hover:text-beige transition-colors
                        ${isLeft ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}
          >
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}

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
  const categories = Array.from(new Set(bikes.map(b => b.category)));
  const filters = ['All', ...categories];

  // Presented as groups, easiest-to-ride first, so a visitor who doesn't know
  // the model names can still tell automatic from manual at a glance.
  const groups = (active === 'All' ? categories : [active])
    .slice()
    .sort((a, b) => orderOf(a) - orderOf(b))
    .map(category => ({ category, items: bikes.filter(b => b.category === category) }))
    .filter(group => group.items.length > 0);

  return (
    <div className="bg-beige min-h-screen">

      <div className="relative h-[58vh] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-dark">
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
              Automatic scooters from €5/day for coastal cruising, manual bikes for the mountain roads, tuk-tuks for the whole family, and air-conditioned cars. Every bike comes with a helmet.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-16">

        <div className="flex flex-wrap gap-3 mb-12">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                active === f ? 'bg-dark text-white' : 'bg-white text-dark border border-dark/10 hover:border-dark/30'
              }`}
            >
              {f === 'All' ? 'All' : getCategoryMeta(f).label}
            </button>
          ))}
        </div>

        <div className="space-y-16 md:space-y-24">
          {groups.map(group => {
            const meta = getCategoryMeta(group.category);
            return (
              <section key={group.category}>
                <header className="section-head">
                  <div className="rule">
                    <div>
                      <h2 className="display-xl text-3xl md:text-5xl">
                        {meta.label}
                        {meta.transmission && (
                          <span className="text-brand"> — {meta.transmission}</span>
                        )}
                      </h2>
                      {meta.blurb && (
                        <p className="text-dark/60 leading-relaxed max-w-2xl mt-5">{meta.blurb}</p>
                      )}
                    </div>
                    <span className="section-index">
                      ({String(group.items.length).padStart(2, '0')})
                    </span>
                  </div>
                </header>

                <CardRow>
                  {group.items.map((bike, idx) => (
                    <motion.div
                      key={bike.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (idx % 3) * 0.07 }}
                      className="snap-start shrink-0 w-[264px] sm:w-[284px] bg-white rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      {/* Transmission rides on the photo rather than taking a
                          line of its own above the title. */}
                      <div className="relative aspect-[3/2] overflow-hidden bg-beige">
                        <img
                          src={bike.image}
                          alt={bike.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-white/85 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-dark/70">
                          {meta.transmission ?? bike.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="font-display text-base font-bold leading-tight">
                            {bike.title}
                          </h3>
                          <span className="font-display text-lg font-black text-brand shrink-0">
                            {formatPrice(bike.pricePerDay)}
                            <span className="text-dark/40 text-[10px] font-medium">/day</span>
                          </span>
                        </div>

                        {/* Two lines only — the rest lives behind the specs
                            disclosure, so every card is the same height. */}
                        <ul className="mt-3 mb-4 space-y-1">
                          {bike.features.slice(0, 2).map(f => (
                            <li
                              key={f}
                              title={f}
                              className="text-xs text-dark/55 flex items-center gap-2 min-w-0"
                            >
                              <span className="w-1 h-1 rounded-full bg-brand shrink-0" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>

                        <SpecPanel bikeId={bike.id} />

                        <Link
                          to={`/book?bike=${bike.id}`}
                          aria-label={`Rent the ${bike.title}`}
                          className="flex items-center justify-center gap-2 w-full bg-brand text-beige rounded-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:brightness-110"
                        >
                          Rent now
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </CardRow>
              </section>
            );
          })}
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

