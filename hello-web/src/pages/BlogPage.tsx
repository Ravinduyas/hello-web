import { ArrowRight, Clock, Compass, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BLOG_CATEGORIES, BLOG_POSTS } from '../data/blog';
import { asset } from '../lib/asset';

const POPULAR_TOPICS = [
  'scooter rental weligama',
  'bike rent weligama',
  'weligama bike rental',
  'weligama scooter rental',
  'tuktuk rental weligama',
  'tuk tuk rental sri lanka',
  'rent a scooter sri lanka',
  'rent scooter sri lanka',
  'hello rent - scooter & tuktuk rental',
  'hello rent',
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Guides');
  const [searchParams, setSearchParams] = useSearchParams();
  const topicFilter = (searchParams.get('q') ?? '').trim().toLowerCase();

  const featuredPost = BLOG_POSTS.find(p => p.featured) ?? BLOG_POSTS[0];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory =
      selectedCategory === 'All Guides' || post.category === selectedCategory;

    if (!matchesCategory) return false;
    if (!topicFilter) return true;

    const haystack = [
      post.title,
      post.excerpt,
      post.category,
      ...post.keywords,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(topicFilter);
  });

  function clearTopic() {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
  }

  function selectTopic(topic: string) {
    if (topicFilter === topic.toLowerCase()) {
      clearTopic();
    } else {
      setSelectedCategory('All Guides');
      setSearchParams({ q: topic }, { replace: true });
    }
  }

  const showFeatured =
    selectedCategory === 'All Guides' && !topicFilter && Boolean(featuredPost);
  const gridPosts = showFeatured
    ? filteredPosts.filter(p => p.slug !== featuredPost.slug)
    : filteredPosts;

  return (
    <div className="bg-beige min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative h-[58vh] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <img
          src={asset('/blog/hero.webp')}
          alt="Nine Arch Bridge and lush hills in Sri Lanka — riding guides by Hello Rent Weligama"
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
              [ Hello Rent · Weligama Riding Guides ]
            </span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Scooter, bike &amp; tuk-tuk <br className="hidden sm:inline" /> rental guides
            </h1>
            <p className="text-white/75 text-lg max-w-2xl">
              Honest local advice on scooter rental in Weligama, manual motorbikes, self-drive
              tuk-tuk rental in Sri Lanka, driving permits, and south-coast routes — written in our
              Weligama shop.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-14 md:pt-16">
        {/* ── Category & Topic Filter Controls ──────────────────────────── */}
        <div className="flex flex-col gap-5 mb-12 pb-8 border-b border-dark/15">
          <div className="flex flex-wrap items-center gap-2">
            {BLOG_CATEGORIES.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 min-h-[44px] lg:min-h-0 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-dark text-beige'
                      : 'bg-white text-dark/70 hover:text-dark border border-dark/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-dark/45 mr-1">
              Popular Searches:
            </span>
            {POPULAR_TOPICS.map(topic => {
              const active = topicFilter === topic.toLowerCase();
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => selectTopic(topic)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? 'bg-brand text-beige border-brand font-medium'
                      : 'bg-transparent border-dark/15 text-dark/65 hover:border-brand hover:text-brand'
                  }`}
                >
                  <span>{topic}</span>
                  {active && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Featured Pillar Post ──────────────────────────────────────── */}
        {showFeatured && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl border border-dark/5"
            >
              <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
                <img
                  src={asset(featuredPost.image)}
                  alt={featuredPost.imageAlt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-brand text-beige px-3 py-1 rounded-full">
                    Featured Guide
                  </span>
                  <span className="text-[10px] font-bold text-dark/45 uppercase tracking-widest">
                    {featuredPost.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-dark/45 uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-brand" />
                    {featuredPost.readingTime}
                  </span>
                </div>
                <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight leading-tight group-hover:text-brand transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-dark/65 leading-relaxed mt-5 max-w-xl">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {featuredPost.keywords.slice(0, 3).map(kw => (
                    <span
                      key={kw}
                      className="text-[11px] font-medium bg-beige text-dark/70 px-3 py-1 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all mt-8">
                  Read full guide <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* ── Articles Grid ─────────────────────────────────────────────── */}
        {gridPosts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4">
            <p className="font-display text-2xl font-bold">
              No guides matched “{searchParams.get('q') || selectedCategory}”
            </p>
            <p className="text-sm text-dark/60">
              Clear the active filter to browse all Weligama scooter, bike, and tuk-tuk guides.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All Guides');
                clearTopic();
              }}
              className="btn-dark mx-auto"
            >
              SHOW ALL GUIDES
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridPosts.map((post, idx) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="h-full"
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group h-full flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-dark/5"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={asset(post.image)}
                      alt={post.imageAlt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 md:p-7 flex flex-col flex-1">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                        {post.category}
                      </span>
                      <span className="text-[10px] font-bold text-dark/45 uppercase tracking-widest">
                        {post.displayDate} · {post.readingTime}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold mb-3 group-hover:text-brand transition-colors leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-dark/60 leading-relaxed line-clamp-3 mb-5 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-dark/10">
                      <span className="text-[11px] font-medium text-dark/45 truncate max-w-[180px]">
                        {post.keywords[0]}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all shrink-0">
                        Read guide <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        {/* ── Lucky's Day-Trip Interactive Map / Guide Callout ──────────── */}
        <div className="mt-20 bg-dark text-beige rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <div className="space-y-4">
            <span className="eyebrow !text-brand inline-flex items-center gap-2">
              <Compass className="w-4 h-4" /> [ 360° From Weligama ]
            </span>
            <h2 className="display-xl text-3xl md:text-5xl">
              How far can you get in one day?
            </h2>
            <p className="text-beige/70 leading-relaxed max-w-xl">
              Ride twenty kilometres in any direction from our door at{' '}
              <strong className="text-beige font-medium">
                Hello Rent - Scooter &amp; Tuktuk Rental
              </strong>{' '}
              in Weligama and the island transforms — Hiriketiya surf bays, Galle Fort, Sinharaja
              Rain Forest, and Udawalawe elephants are all day trips.
            </p>
          </div>
          <div className="flex flex-wrap lg:justify-end gap-3">
            <Link to="/tours" className="btn-primary">
              SEE 10 DAY-TRIP DESTINATIONS
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/fleet" className="btn-ghost">
              COMPARE FLEET &amp; RATES
            </Link>
          </div>
        </div>

        {/* ── Local SEO Quick-Reference Hub ─────────────────────────────── */}
        <section className="mt-20 pt-16 border-t border-dark/15">
          <header className="section-head">
            <span className="eyebrow">[ Hello Rent Weligama ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-3xl md:text-5xl max-w-3xl">
                Scooter, bike &amp; tuk-tuk rental in Weligama at a glance
              </h2>
              <span className="section-index">(01)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-dark/15 bg-white/60">
            <Link
              to="/fleet"
              className="group border-r border-b border-dark/15 p-7 flex flex-col justify-between gap-4 hover:bg-white transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  From €5 / day
                </span>
                <h3 className="font-display text-xl font-bold mt-2 group-hover:text-brand transition-colors">
                  Weligama Scooter Rental
                </h3>
                <p className="text-sm text-dark/60 leading-relaxed mt-2">
                  Twist-and-go Honda Dio, Yamaha Ray ZR &amp; 125cc TVS Ntorq with helmet included.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dark group-hover:text-brand">
                View scooters <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              to="/fleet"
              className="group border-r border-b border-dark/15 p-7 flex flex-col justify-between gap-4 hover:bg-white transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  €10 / day
                </span>
                <h3 className="font-display text-xl font-bold mt-2 group-hover:text-brand transition-colors">
                  Weligama Bike Rental
                </h3>
                <p className="text-sm text-dark/60 leading-relaxed mt-2">
                  Manual 160cc–200cc Bajaj Pulsar, Yamaha FZ, TVS Apache &amp; Hero Hunk for hill
                  country.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dark group-hover:text-brand">
                View motorbikes <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              to="/blog/tuktuk-rental-weligama-sri-lanka-guide"
              className="group border-r border-b border-dark/15 p-7 flex flex-col justify-between gap-4 hover:bg-white transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  €15 / day
                </span>
                <h3 className="font-display text-xl font-bold mt-2 group-hover:text-brand transition-colors">
                  Tuk-Tuk Rental Sri Lanka
                </h3>
                <p className="text-sm text-dark/60 leading-relaxed mt-2">
                  Self-drive Bajaj RE 4-stroke three-wheelers in Weligama with lesson &amp; luggage
                  space.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dark group-hover:text-brand">
                Read tuk-tuk guide <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              to="/driving-permit"
              className="group border-r border-b border-dark/15 p-7 flex flex-col justify-between gap-4 hover:bg-white transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Valid 6 Months
                </span>
                <h3 className="font-display text-xl font-bold mt-2 group-hover:text-brand transition-colors">
                  Sri Lankan Permit Service
                </h3>
                <p className="text-sm text-dark/60 leading-relaxed mt-2">
                  Rent a scooter in Sri Lanka legally — send 3 photos on WhatsApp and skip queues.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-dark group-hover:text-brand">
                How permits work <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
