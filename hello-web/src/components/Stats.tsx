import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';

export default function Stats() {
  const stats = [
    { value: '10K+', copy: 'happy renters who have explored the island on two wheels.' },
    { value: '50+',  copy: 'scooters and motorbikes kept road-ready across our fleet.' },
    { value: '1',    copy: 'easy pickup point in Weligama, right on Sri Lanka’s south coast.' },
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
            <span className="eyebrow">[ Hello Rent · Explore Sri Lanka ]</span>
            <h2 className="display-xl text-4xl md:text-6xl">
              Your island <br /> adventure <br /> starts here
            </h2>
            <Link to="/fleet" className="btn-dark group w-fit">
              BROWSE OUR FLEET
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {/* The founder's own words, not a customer review — the verified
                Google reviews have their own section further down the page. */}
            <figure className="pt-12 border-t border-dark/10 max-w-md">
              <blockquote className="font-display text-xl md:text-2xl font-bold leading-snug tracking-tight text-dark">
                “I started with one scooter my father bought me and a signboard I painted by hand.
                Today around a hundred families earn their living from this fleet.”
              </blockquote>
              <p className="text-dark/70 text-sm leading-relaxed mt-5">
                If the other person is happy, I’m happy. That has always been my way.
              </p>
              <figcaption className="flex items-center gap-3 mt-6">
                <span className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-display font-bold shrink-0">
                  L
                </span>
                <div>
                  <h4 className="text-sm font-bold">Bhagya “Lucky”</h4>
                  <p className="text-[10px] text-dark/50 uppercase font-bold tracking-tight">
                    Founder, Hello Rent
                  </p>
                </div>
              </figcaption>
              <Link
                to="/about#story"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:gap-3 transition-all mt-6"
              >
                Read Lucky’s story
                <ArrowRight className="w-4 h-4" />
              </Link>
            </figure>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src={asset('/photos/shop-front.jpg')}
              alt="The Hello Rent shopfront in Weligama, a tuk-tuk parked beneath the sign"
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
