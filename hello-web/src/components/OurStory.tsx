import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

// Each card previews one segment of the About page and deep-links into it.
// The `to` hashes match the section ids in pages/AboutPage.tsx.
const segments = [
  {
    index: '01',
    title: 'Meet Bhagya (“Lucky”) & Sandra',
    copy: 'A husband-and-wife team who want you to feel you have a local brother and sister by your side.',
    to: '/about#meet',
  },
  {
    index: '02',
    title: 'How Hello Rent started',
    copy: 'A surf instructor, a hand-painted board, and three borrowed scooters in the centre of Weligama.',
    to: '/about#story',
  },
  {
    index: '03',
    title: 'Your safety comes first',
    copy: 'We match the vehicle to your real experience — and tell you honestly when it isn’t the right one.',
    to: '/about#safety',
  },
  {
    index: '04',
    title: 'Our values',
    copy: 'Kindness, honesty and good karma guide every decision. Profit has never been the greatest purpose.',
    to: '/about#values',
  },
];

export default function OurStory() {
  return (
    <section className="bg-beige py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Our Story ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              The people behind the scooters
            </h2>
            <span className="section-index">(04)</span>
          </div>
          <p className="text-dark/60 leading-relaxed max-w-2xl mt-8">
            Hello Rent started on Weligama Beach with one scooter and a few borrowed from friends.
            Today most of the fleet still belongs to local families — around a hundred of them earn
            a living from it.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-dark/15">
          {segments.map((segment, idx) => (
            <motion.div
              key={segment.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 2) * 0.08 }}
              className="border-r border-b border-dark/15"
            >
              <Link
                to={segment.to}
                className="group h-full p-8 md:p-12 flex flex-col gap-4 hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="font-display text-sm font-bold tracking-tight text-dark/30 tabular-nums">
                    ({segment.index})
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-dark/30 group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight group-hover:text-brand transition-colors">
                  {segment.title}
                </h3>
                <p className="text-sm text-dark/55 leading-relaxed">{segment.copy}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-12">
          <Link to="/about" className="btn-dark group">
            READ THE FULL STORY
            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/about#promise" className="btn-outline">
            THE HELLO RENT PROMISE
          </Link>
        </div>
      </div>
    </section>
  );
}
