import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blog';
import { asset } from '../lib/asset';

export function Blog() {
  const featuredPosts = [
    BLOG_POSTS[0], // Scooter Rental in Weligama
    BLOG_POSTS[3], // Tuk-Tuk Rental in Weligama & Sri Lanka
    BLOG_POSTS[2], // How to Rent a Scooter in Sri Lanka
  ].filter(Boolean);

  return (
    <section className="bg-beige py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Riding Guides ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              Weligama &amp; Sri Lanka rental guides
            </h2>
            <span className="section-index">(07)</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPosts.map((post, idx) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="group block">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6">
                  <img
                    src={asset(post.image)}
                    alt={post.imageAlt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest block mb-2">
                  {post.category} · {post.readingTime}
                </span>
                <h3 className="font-display text-xl font-bold mb-3 line-clamp-2 group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-dark/60 leading-relaxed line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                  {post.displayDate}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center md:justify-end">
          <Link to="/blog" className="btn-outline group">
            READ ALL RIDING GUIDES
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden flex items-center justify-center">
      <img
        src={asset('/photos/tea-country-ride.jpg')}
        className="absolute inset-0 w-full h-full object-cover"
        alt="Motorbike riders in Sri Lanka's tea country"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-dark/55 backdrop-blur-[2px]" />

      <div className="relative z-10 text-center text-white px-6">
        <span className="eyebrow !text-white/60">
          [ READY TO EXPLORE ]
        </span>
        <h2 className="display-xl text-5xl md:text-7xl mt-4 mb-10">
          Start your adventure <br /> today
        </h2>
        <div className="flex justify-center">
          <Link to="/fleet" className="btn-primary px-7 py-3 group">
            BOOK YOUR RIDE NOW
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </section>
  );
}
