import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Stats() {
  const stats = [
    { value: '10K+', copy: 'happy renters who have explored the island on two wheels.' },
    { value: '50+',  copy: 'scooters and motorbikes kept road-ready across our fleet.' },
    { value: '5',    copy: 'pickup locations, from Colombo’s coast to Mirissa’s beaches.' },
  ];

  return (
    <section className="bg-beige pt-16 md:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="eyebrow">[ Rent · Ride · Explore Sri Lanka ]</span>
            <h2 className="display-xl text-4xl md:text-6xl">
              Your island <br /> adventure <br /> starts here
            </h2>
            <Link to="/fleet" className="btn-dark group w-fit">
              BROWSE OUR FLEET
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="pt-12 border-t border-dark/10 max-w-md">
              <p className="text-dark/70 text-sm italic leading-relaxed">
                "Renting from Hello Rent was the best thing we did in Sri Lanka. The bike was spotless, pickup was effortless in Colombo, and riding down the coast to Galle was absolutely breathtaking. We added three extra days — couldn't bring ourselves to stop."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                  alt="Sarah & Tom K."
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold">Sarah & Tom K.</h4>
                  <p className="text-[10px] text-dark/50 uppercase font-bold tracking-tight">Travelers from Australia</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="/couple-tuktuk-sigiriya.jpg"
              alt="A couple exploring Sri Lanka past Sigiriya Rock"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-dark/15">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border-r border-b border-dark/15 p-8 md:p-12 flex items-end justify-between gap-6 min-h-[220px]"
            >
              <p className="text-sm text-dark/55 leading-relaxed max-w-[14rem]">{stat.copy}</p>
              <div className="font-display text-5xl md:text-7xl font-bold tracking-tighter leading-none shrink-0">
                {stat.value}
              </div>
            </motion.div>
          ))}

          {/* Filled espresso statement cell — the reference's signature accent. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: stats.length * 0.1 }}
            className="border-r border-b border-dark/15 bg-dark text-beige p-8 md:p-12 flex flex-col justify-between gap-8 min-h-[220px]"
          >
            <p className="text-lg md:text-xl font-medium leading-snug">
              Renting isn’t just transport — it’s how you feel the island.
            </p>
            <Link
              to="/fleet"
              className="self-start inline-flex items-center gap-2 border border-beige/30 text-beige px-5 py-2.5 rounded-full text-sm font-medium hover:bg-beige hover:text-dark transition-all group"
            >
              Learn more
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
