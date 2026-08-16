import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';

export function Blog() {
  const posts = [
    {
      title: 'How far can you get in one day?',
      date: 'Featured · Day Trips',
      image: asset('/photos/ride-hill-road.jpg'),
      to: '/tours',
    },
    {
      title: 'Top Scenic Routes to Ride in Sri Lanka',
      date: '02 May 2026',
      image: asset('/photos/tea-country-ride.jpg'),
      to: '/blog',
    },
    {
      title: 'The Coastal Ride: Colombo to Galle',
      date: '18 Apr 2026',
      image: asset('/photos/ride-misty-forest.jpg'),
      to: '/blog',
    }
  ];

  return (
    <section className="bg-beige py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Riding Guides ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              Sri Lanka riding guides &amp; routes
            </h2>
            <span className="section-index">(07)</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={post.to} className="group block">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-display text-xl font-bold mb-4 line-clamp-2 group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
                <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                  {post.date}
                </span>
              </Link>
            </motion.div>
          ))}
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
