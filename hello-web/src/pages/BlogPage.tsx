import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'Top Scenic Routes to Ride in Sri Lanka',
    date: '02 May 2026',
    category: 'Riding Guides',
    excerpt: 'From the misty roads of Ella to the golden coast of Mirissa — discover the most breathtaking roads Sri Lanka has to offer on two wheels.',
    image: 'https://images.unsplash.com/photo-1775479788897-c5ec08cb7fb0?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'What to Know Before Renting a Scooter in Sri Lanka',
    date: '18 Apr 2026',
    category: 'Tips & Advice',
    excerpt: 'License requirements, local traffic rules, and safety gear — everything first-time riders need to know before hitting the Sri Lankan roads.',
    image: 'https://images.unsplash.com/photo-1573828263190-2cbdc3dc7d11?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Scooter vs Motorbike: Which Should You Rent?',
    date: '10 Apr 2026',
    category: 'Guides',
    excerpt: 'Automatic scooter or manual motorbike? We break down the pros and cons to help you choose the right ride for your Sri Lanka trip.',
    image: 'https://images.unsplash.com/photo-1550039082-d8572c2ba1a4?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Hidden Temples You Can Only Reach by Bike',
    date: '28 Mar 2026',
    category: 'Riding Guides',
    excerpt: 'Skip the tourist buses and discover Sri Lanka\'s most sacred and secluded temples using nothing but a scooter and a sense of adventure.',
    image: 'https://images.unsplash.com/photo-1612862862126-865765df2ded?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'The Coastal Ride: Colombo to Galle',
    date: '15 Mar 2026',
    category: 'Riding Guides',
    excerpt: 'One of Sri Lanka\'s most iconic coastal routes. Every stop, viewpoint, and local café worth visiting along the Southern Expressway coastal road.',
    image: 'https://images.unsplash.com/photo-1654561773591-57b9413c45c0?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Riding Through the Hill Country: Kandy to Ella',
    date: '02 Mar 2026',
    category: 'Riding Guides',
    excerpt: 'Tea estates, waterfalls, and winding mountain roads — the Kandy to Ella route is every rider\'s dream on two wheels.',
    image: 'https://images.unsplash.com/photo-1706766958001-176b3d7800ff?auto=format&fit=crop&q=80&w=800',
  },
];

export default function BlogPage() {
  return (
    <div className="bg-beige min-h-screen">

      <div className="relative h-screen min-h-[600px] w-full overflow-hidden bg-dark" style={{ height: '100dvh' }}>
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1775479788897-c5ec08cb7fb0?auto=format&fit=crop&q=80&w=2600"
          alt="Nine Arch Bridge, Ella, Sri Lanka"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="eyebrow !text-white/60">[ Riding Guides ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Sri Lanka riding guides
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Routes, road tips, and real stories from travelers exploring Sri Lanka on two wheels.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-16">

        {/* Featured post — the real day-trip guide, written from Lucky's notes. */}
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
                src="/ride-hill-road.jpg"
                alt="A winding road through the Sri Lankan hills"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-brand text-beige px-3 py-1 rounded-full">
                  Featured
                </span>
                <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                  Day Trips
                </span>
              </div>
              <h2 className="display-xl text-3xl md:text-5xl">
                How far can you get in one day?
              </h2>
              <p className="text-dark/60 leading-relaxed mt-5 max-w-lg">
                Ride twenty kilometres in any direction from Weligama and the island changes
                completely — beaches one way, rainforest the other, wildlife parks inland and a
                colonial fort down the coast. Here is everywhere you can reach and get back the
                same day.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all mt-8">
                Read the guide <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={post.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07 }}
              className="group cursor-pointer bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{post.category}</span>
                  <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">{post.date}</span>
                </div>
                <h3 className="font-display text-lg font-bold mb-3 group-hover:text-brand transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-dark/60 leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all">
                  Read more <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
