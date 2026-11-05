import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory } from '../data/blog';
import { asset } from '../lib/asset';

const quickTopics = [
  {
    eyebrow: 'Weligama Scooters',
    title: 'Scooter Rental in Weligama (€5–€6/day)',
    copy: 'Automatic 110cc Honda Dio & Yamaha Ray ZR scooters at €5/day and 125cc TVS Ntorq scooters at €6/day — rider helmet included and zero passport deposit.',
    to: '/blog/weligama-scooter-bike-rental-guide',
    cta: 'Weligama scooter guide',
  },
  {
    eyebrow: 'Manual Motorbikes',
    title: 'Bike Rent in Weligama for Hill Country (€10/day)',
    copy: 'Heading up to Ella, Sinharaja or Deniyaya? Compare geared 160cc–200cc Bajaj Pulsar, Yamaha FZ and TVS Apache motorbikes against twist-and-go scooters.',
    to: '/blog/scooter-vs-motorbike-sri-lanka',
    cta: 'Compare scooters vs bikes',
  },
  {
    eyebrow: 'Three-Wheelers',
    title: 'Tuk-Tuk Rental in Weligama & Sri Lanka (€15/day)',
    copy: 'Drive your own Bajaj RE 4-stroke tuk-tuk with handlebar gears, a roof for sun and rain, three passenger seats, and 60–80L of luggage room.',
    to: '/blog/tuktuk-rental-weligama-sri-lanka',
    cta: 'Self-drive tuk-tuk guide',
  },
  {
    eyebrow: 'Island Rules & Permits',
    title: 'How to Rent a Scooter in Sri Lanka Legally',
    copy: 'Why your home licence alone is not enough, how the 6-month Automobile Association permit works, and what south-coast traffic police actually check.',
    to: '/blog/rent-a-scooter-in-sri-lanka',
    cta: 'Sri Lanka rental rules',
  },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<'All' | BlogCategory>('All');

  const visiblePosts =
    activeCategory === 'All'
      ? BLOG_POSTS
      : BLOG_POSTS.filter(post => post.category === activeCategory);

  return (
    <div className="bg-beige min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative h-[58vh] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <img
          src={asset('/blog/hero.webp')}
          alt="Nine Arch Bridge and lush hills on a Sri Lanka scooter and tuk-tuk road trip"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow !text-white/60">
              [ Hello Rent - Scooter &amp; Tuktuk Rental ]
            </span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Weligama &amp; Sri Lanka <br /> riding guides
            </h1>
            <p className="text-white/75 text-lg max-w-2xl">
              Honest local advice on Weligama scooter rental, manual bike rent, self-drive tuk-tuks,
              driving permits and coastal routes — written from our shop in Weligama.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-16">
        {/* ── Featured Day-Trip Guide ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Link
            to="/tours"
            className="group grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl"
          >
            <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
              <img
                src={asset('/photos/ride-hill-road.jpg')}
                alt="A winding road through the Sri Lankan hills from Weligama"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-brand text-beige px-3 py-1 rounded-full">
                  Featured
                </span>
                <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                  360° From Weligama
                </span>
              </div>
              <h2 className="display-xl text-3xl md:text-5xl">
                How far can you get in one day?
              </h2>
              <p className="text-dark/60 leading-relaxed mt-5 max-w-lg">
                Ride twenty kilometres in any direction from Hello Rent in Weligama and the island
                changes completely — surf bays one way, Sinharaja rainforest the other, elephant
                parks inland and Galle Fort down the coast.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all mt-8">
                Explore 10 one-day routes <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </motion.div>

        {/* ── Category Filter Bar ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-dark/15 pt-8 mb-10">
          <div>
            <span className="eyebrow">[ Rental &amp; Road Knowledge ]</span>
            <h2 className="display-xl text-3xl md:text-5xl mt-3">
              All riding &amp; rental guides
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter riding guides by topic"
            className="flex flex-wrap gap-2"
          >
            {BLOG_CATEGORIES.map(category => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-dark text-beige'
                      : 'bg-white text-dark/65 hover:text-dark border border-dark/10'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Blog Posts Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePosts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
            >
              <Link to={post.path} className="group flex flex-col flex-1">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={asset(post.cardImage)}
                    alt={post.heroAlt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                      {post.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      {post.readingTime}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-3 group-hover:text-brand transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-dark/60 leading-relaxed line-clamp-3 mb-5 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-dark/10">
                    <time
                      dateTime={post.publishedAt}
                      className="text-[10px] font-bold text-dark/40 uppercase tracking-widest"
                    >
                      {post.displayDate}
                    </time>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all">
                      Read guide <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* ── Pillar Topic Hub (Internal Linking & Local Intent) ────────── */}
        <section className="mt-20 md:mt-28">
          <header className="section-head">
            <span className="eyebrow">[ Start With the Essentials ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-3xl md:text-5xl max-w-3xl">
                Renting a scooter, bike or tuk-tuk in Weligama &amp; Sri Lanka
              </h2>
              <span className="section-index">(02)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-dark/15 bg-white rounded-3xl overflow-hidden">
            {quickTopics.map(topic => (
              <div
                key={topic.title}
                className="border-r border-b border-dark/15 p-8 md:p-10 flex flex-col gap-3"
              >
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                  {topic.eyebrow}
                </span>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-snug">
                  {topic.title}
                </h3>
                <p className="text-sm text-dark/60 leading-relaxed flex-1">{topic.copy}</p>
                <Link
                  to={topic.to}
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3 transition-all pt-3"
                >
                  {topic.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
