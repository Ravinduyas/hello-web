import {
  ArrowRight,
  FileText,
  HeartHandshake,
  KeyRound,
  LifeBuoy,
  PlaneTakeoff,
  ShieldCheck,
  Signpost,
  Truck,
  Users,
  Waves,
  Wrench,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

// The client's "Why Choose Hello Rent" promises, in their order. Kept as data
// so the copy stays editable without touching layout.
const promises = [
  {
    Icon: HeartHandshake,
    title: 'Honest & Transparent Service',
    copy: 'No hidden charges, no unfair pricing, no taking advantage of travelers. We look for a fair solution for our customers and our vehicle owners alike.',
  },
  {
    Icon: Wrench,
    title: 'Carefully Maintained Vehicles',
    copy: 'Every scooter and tuk-tuk is inspected before it goes out — brakes, tyres, lights, indicators, suspension, mirrors, engine and battery.',
  },
  {
    Icon: ShieldCheck,
    title: 'Fair Damage Policy',
    copy: 'Small scratches happen. If a plastic part is damaged we ask only for the part at normal market price. No invented labour fees, and never a commission from the spare parts shop.',
  },
  {
    Icon: LifeBuoy,
    title: 'Emergency Assistance',
    copy: 'Breakdown, puncture, accident or anything unexpected — our team does everything possible to reach you quickly. You are never alone on the road with us.',
  },
  {
    Icon: Signpost,
    title: 'Driving Guidance',
    copy: "Sri Lanka's roads work differently. Before you set off we explain local traffic rules, riding on the left, road conditions and the safety tips that matter most.",
  },
  {
    Icon: FileText,
    title: 'Driving Permit Assistance',
    copy: 'No need to spend your holiday queueing in government offices. We help eligible travelers arrange the proper Sri Lankan driving permit.',
    to: '/driving-permit',
  },
  {
    Icon: KeyRound,
    title: 'Flexible Deposit Policy',
    copy: 'We respect your privacy and never ask you to leave your passport as a deposit. We offer fair alternatives instead, under our rental policy.',
  },
  {
    Icon: Truck,
    title: 'Island-Wide Delivery & Collection',
    copy: 'Airport, hotel, railway station or another city — wherever possible we bring the vehicle to you and collect it when you are done.',
  },
  {
    Icon: Waves,
    title: 'Surf Tips from Lucky',
    copy: 'Before Hello Rent, Bhagya ("Lucky") taught surfing in Weligama for years. Beginner guidance, safety advice and local surf knowledge, free of charge.',
  },
  {
    Icon: PlaneTakeoff,
    title: 'Special Transport Benefits',
    copy: 'Airport pickup, airport drop-off and private shuttles with experienced drivers and comfortable air-conditioned vehicles.',
  },
  {
    Icon: Users,
    title: 'More Than a Rental Company',
    copy: 'Restaurants, beaches, surf, transport, local customs, shopping, hospitals — just ask. Our wish is that you find a local brother and sister in Sri Lanka.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Why Choose Hello Rent ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              Renting should be simple, honest and stress-free
            </h2>
            <span className="section-index">(04)</span>
          </div>
          <p className="text-dark/60 leading-relaxed max-w-2xl mt-8">
            We are not here just to rent scooters and tuk-tuks. We are here to help you enjoy Sri
            Lanka safely, comfortably and with complete confidence.
          </p>
        </header>

        {/* Bordered cell grid — the same rule motif used in the Stats signature block. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-dark/15">
          {promises.map(({ Icon, title, copy, to }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 3) * 0.08 }}
              className="group border-r border-b border-dark/15 p-8 md:p-10 flex flex-col gap-4"
            >
              <Icon className="w-6 h-6 text-brand shrink-0" strokeWidth={1.5} />
              <h3 className="font-display text-lg md:text-xl font-bold leading-tight group-hover:text-brand transition-colors">
                {title}
              </h3>
              <p className="text-sm text-dark/55 leading-relaxed">{copy}</p>
              {to && (
                <Link
                  to={to}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:gap-3 transition-all mt-auto pt-2"
                >
                  How it works
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>
          ))}

          {/* Filled espresso statement cell closes the grid on the philosophy line. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-r border-b border-dark/15 bg-dark text-beige p-8 md:p-10 flex flex-col justify-between gap-8"
          >
            <p className="font-display text-xl md:text-2xl font-bold leading-snug tracking-tight">
              Service comes before profit. Humanity comes before business.
            </p>
            <Link
              to="/about"
              className="self-start inline-flex items-center gap-2 border border-beige/30 text-beige px-5 py-2.5 rounded-full text-sm font-medium hover:bg-beige hover:text-dark transition-all"
            >
              Read our story
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
