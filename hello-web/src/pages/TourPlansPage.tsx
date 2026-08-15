import { ArrowRight, Compass, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { whatsappLink } from '../data/contact';

// Lucky's own "where can I reach in one day from Weligama" list.
const destinations = [
  {
    name: 'Hiriketiya',
    kind: 'Beach & surf',
    copy: 'A horseshoe bay tucked into the coast — gentle on one side, punchier on the other. An easy morning ride east.',
  },
  {
    name: 'Tangalle',
    kind: 'Beach',
    copy: 'Long, quiet stretches of sand further down the south coast, well past the busier surf towns.',
  },
  {
    name: 'Yala National Park',
    kind: 'Wildlife',
    copy: "Sri Lanka's best-known park for leopards, elephants and birdlife. A long day — start early.",
  },
  {
    name: 'Udawalawe National Park',
    kind: 'Wildlife',
    copy: 'Open grassland park inland, famous for large herds of wild elephants.',
  },
  {
    name: 'Sinharaja Rain Forest',
    kind: 'Rainforest',
    copy: 'UNESCO-listed lowland rainforest, thick with endemic birds, and a proper change of scenery from the coast.',
  },
  {
    name: 'Deniyaya',
    kind: 'Waterfall & tea',
    copy: 'Waterfalls, tea plantations and a working tea factory on the edge of the Sinharaja forest.',
  },
  {
    name: 'Unawatuna & Galle Fort',
    kind: 'History & beach',
    copy: 'The walled colonial fort at Galle, with Unawatuna bay just around the headland. The classic short ride west.',
  },
  {
    name: 'Hikkaduwa',
    kind: 'Reef & surf',
    copy: 'Reef breaks, coral and a busy beach strip — the furthest of the easy west-coast runs.',
  },
  {
    name: 'Hiyare & Kottawa Rain Forest',
    kind: 'Rainforest',
    copy: 'A small, quiet rainforest reserve and reservoir inland of Galle. Close enough for a half day.',
  },
  {
    name: 'Ancient temples',
    kind: 'Culture',
    copy: 'More than a thousand of them scattered across the region — many of them barely visited.',
  },
];

export default function TourPlansPage() {
  return (
    <div className="bg-beige min-h-screen">
      <div
        className="relative h-screen min-h-[600px] w-full overflow-hidden bg-dark"
        style={{ height: '100dvh' }}
      >
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <img
          src="/ride-hill-road.jpg"
          alt="A winding road through the Sri Lankan hills"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow !text-white/60">[ Day Trips ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              How far can you get <br /> in one day?
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Further than you think. From our door in Weligama, the whole south opens up in every
              direction — and all of it is a day trip.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* ── The 360° idea ─────────────────────────────────────────────── */}
        <section className="mb-16 md:mb-24">
          <header className="section-head">
            <span className="eyebrow">[ Start Here ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                Weligama sits in the middle of everything
              </h2>
              <span className="section-index">(01)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-dark/70 leading-relaxed"
            >
              <Compass className="w-7 h-7 text-brand" strokeWidth={1.5} />
              <p className="text-xl md:text-2xl font-medium text-dark leading-snug">
                Ride twenty kilometres in any direction and the island changes completely.
              </p>
              <p>
                Beaches one way, rainforest the other, wildlife parks inland, and a colonial fort
                down the coast. Because Weligama sits in the middle of the south, you get a full
                360° of options without ever changing hotels.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-dark text-beige rounded-3xl p-8 md:p-12 space-y-6"
            >
              <p className="font-display text-xl md:text-2xl font-bold leading-snug tracking-tight">
                Tell us how long you have and what you like, and we'll plan the route with you.
              </p>
              <p className="text-beige/60 text-sm leading-relaxed">
                Lucky has ridden all of these roads. Ask before you go — road conditions, timings
                and the best order to do things in all change with the season.
              </p>
              <a
                href={whatsappLink(
                  "Hi Hello Rent! Can you help me plan a day trip from Weligama?",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand text-beige px-6 py-3 rounded-full text-sm font-medium transition-all hover:brightness-110"
              >
                <MessageCircle className="w-4 h-4" />
                ASK US FOR A ROUTE
              </a>
            </motion.div>
          </div>
        </section>

        {/* ── The list ──────────────────────────────────────────────────── */}
        <section>
          <header className="section-head">
            <span className="eyebrow">[ Within One Day ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                Where you can reach from Weligama
              </h2>
              <span className="section-index">(02)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-dark/15">
            {destinations.map((place, idx) => (
              <motion.div
                key={place.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.08 }}
                className="group border-r border-b border-dark/15 p-8 md:p-10 flex flex-col gap-3"
              >
                <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                  {place.kind}
                </span>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight group-hover:text-brand transition-colors">
                  {place.name}
                </h3>
                <p className="text-sm text-dark/55 leading-relaxed">{place.copy}</p>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border-r border-b border-dark/15 bg-dark text-beige p-8 md:p-10 flex flex-col justify-between gap-8"
            >
              <p className="font-display text-xl md:text-2xl font-bold leading-snug tracking-tight">
                All of it starts with the right vehicle.
              </p>
              <Link
                to="/fleet"
                className="self-start inline-flex items-center gap-2 border border-beige/30 text-beige px-5 py-2.5 rounded-full text-sm font-medium hover:bg-beige hover:text-dark transition-all group"
              >
                Browse the fleet
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          <p className="text-sm text-dark/50 leading-relaxed mt-8 max-w-2xl">
            Distances and driving times vary a lot with traffic, weather and the route you take —
            the wildlife parks in particular make for a very long day. Message us and we'll tell you
            honestly what fits.
          </p>
        </section>
      </div>
    </div>
  );
}
