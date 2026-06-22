import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

const reviews = [
  {
    rating: '4.8',
    quote:
      "Hiring a scooter from Hello Rent was the best decision of our Sri Lanka trip. The bike was spotless, pickup was a breeze at the Colombo branch, and the coastal ride down to Galle was absolutely stunning. We ended up keeping the bike for the entire week — there's simply no better way to explore the island.",
    name: 'Mia & James T.',
    location: 'Travelers from New Zealand',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
  {
    rating: '5.0',
    quote:
      "Effortless from start to finish. We booked online the night before, collected two scooters in Mirissa the next morning, and the team walked us through the best routes along the south coast. Helmets were included and in great condition — exactly what we needed for a worry-free trip.",
    name: 'Lena R.',
    location: 'Traveler from Germany',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  },
  {
    rating: '4.9',
    quote:
      "We rode the hill country from Kandy to Ella and it was the highlight of our month in Sri Lanka. When we had a small issue with a mirror, their 24/7 support sorted it within the hour. Honest pricing, no hidden fees, genuinely lovely people.",
    name: 'Daniel & Priya S.',
    location: 'Travelers from the UK',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const review = reviews[index];

  const go = (dir: number) =>
    setIndex(prev => (prev + dir + reviews.length) % reviews.length);

  return (
    <section className="bg-beige py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="max-w-md">
            <div className="flex items-center justify-between gap-4">
              <span className="eyebrow">[ What Renters Say ]</span>
              <span className="section-index">(03)</span>
            </div>
            <h2 className="display-xl text-4xl md:text-6xl mt-5 pt-6 border-t border-dark/15">
              Real stories from <br /> real riders
            </h2>
            <p className="text-dark/60 leading-relaxed mt-6 max-w-sm">
              Thousands of travelers have explored the island with us. Here's what a few of them had to say.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <span className="font-display text-2xl font-bold">4.9</span>
              <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                Average from <br /> 2,400+ riders
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 max-w-2xl bg-white p-10 md:p-14 rounded-[2rem] shadow-sm relative"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-6 mb-8">
                  <span className="font-display text-xl font-bold">{review.rating}</span>
                  <div className="flex text-brand" aria-hidden="true">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>

                <p className="text-dark/80 text-xl font-medium leading-relaxed italic">
                  “{review.quote}”
                </p>

                <div className="flex items-center gap-4 mt-12 pt-12 border-t border-dark/5">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold">{review.name}</h4>
                    <p className="text-[10px] text-dark/40 uppercase font-bold tracking-widest">
                      {review.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10">
              <div className="flex items-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? 'w-6 bg-brand' : 'w-2 bg-dark/15 hover:bg-dark/30'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous testimonial"
                  className="w-12 h-12 rounded-full border border-dark/10 flex items-center justify-center hover:bg-dark hover:text-white transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next testimonial"
                  className="w-12 h-12 rounded-full border border-brand/20 text-brand flex items-center justify-center hover:bg-dark hover:text-white hover:border-dark transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
