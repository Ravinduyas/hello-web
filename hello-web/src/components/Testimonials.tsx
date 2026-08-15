import { ArrowLeft, ArrowRight, Quote, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

// Real, verified customer reviews. Avatars + trip photos live in
// /public/reviews. Star ratings default to 5.0 — the source screenshots
// didn't include the numeric rating, and every review is strongly positive.
const reviews = [
  {
    rating: '5.0',
    quote:
      'We rented a scooter for 8 days and a tuk tuk for 1 day. The experience was 100% positive. Excellent service, good vibes and 0 problems. Lucky even gave me a free tuk tuk driving lesson. Thank you for making the most of our trip. I totally recommend Hello Rent.',
    name: 'Alexander Artamonov',
    location: 'Google review · Weligama',
    avatar: '/reviews/avatars/alexander.png',
    photo: '/reviews/photos/alexander.jpg',
  },
  {
    rating: '5.0',
    quote:
      "Great experience with Hello Rent in Weligama! Friendly service, highly recommended if you're looking to rent a scooter in Weligama!",
    name: 'Sandaru Jayasinghe',
    location: 'Google review · Weligama',
    avatar: '/reviews/avatars/sandaru.png',
    photo: '/reviews/photos/sandaru.jpg',
  },
  {
    rating: '5.0',
    quote:
      'Very good rental, super friendly and scooters are in good condition. Totally recommended.',
    name: 'Andrew Zolotaryov',
    location: 'Google review · Weligama',
    avatar: '/reviews/avatars/andrew.png',
    photo: '/reviews/photos/andrew.jpg',
  },
  {
    rating: '5.0',
    quote:
      'Very good rental, super friendly and scooters are in good condition. Totally recommended.',
    name: 'Pablo',
    location: 'Google review · Weligama',
    avatar: '/reviews/avatars/pablo.png',
    photo: '/reviews/photos/pablo.jpg',
  },
];

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4 },
};

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const review = reviews[index];

  const go = (dir: number) =>
    setIndex(prev => (prev + dir + reviews.length) % reviews.length);

  // Auto-advance the carousel; pauses on hover so a reader isn't rushed. The
  // timer resets on every index change (manual or auto) for a full interval.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex(prev => (prev + 1) % reviews.length), 6000);
    return () => clearInterval(id);
  }, [index, paused]);

  return (
    <section className="bg-beige py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="max-w-md">
            <div className="flex items-center justify-between gap-4">
              <span className="eyebrow">[ What Renters Say ]</span>
              <span className="section-index">(05)</span>
            </div>
            <h2 className="display-xl text-4xl md:text-6xl mt-5 pt-6 border-t border-dark/15">
              Real stories from <br /> real riders
            </h2>
            <p className="text-dark/60 leading-relaxed mt-6 max-w-sm">
              Travelers from around the world have explored the south coast with us. Here's what a few of them had to say.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <span className="font-display text-2xl font-bold">5.0</span>
              <span className="text-[10px] font-bold text-dark/40 uppercase tracking-widest">
                Rated 5.0 <br /> on Google
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-1 max-w-2xl w-full bg-white rounded-[2rem] shadow-sm overflow-hidden"
            aria-roledescription="carousel"
            aria-label="Customer testimonials"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex flex-col md:flex-row md:h-[460px]">
              {/* Trip photo — fills the full height of the card. */}
              <div className="relative md:w-[44%] h-60 md:h-full shrink-0 bg-brand/5 overflow-hidden">
                <AnimatePresence mode="wait">
                  {review.photo ? (
                    <motion.img
                      key={index}
                      src={review.photo}
                      alt={`${review.name}'s trip with Hello Rent`}
                      loading="lazy"
                      {...fade}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <motion.div
                      key={index}
                      {...fade}
                      className="absolute inset-0 flex items-center justify-center text-brand/25"
                    >
                      <Quote className="w-20 h-20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content — vertically centered so short quotes stay balanced. */}
              <div className="flex-1 flex flex-col p-8 md:p-10 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.div key={index} {...fade} className="flex-1 flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-bold">{review.rating}</span>
                      <div className="flex text-brand" aria-hidden="true">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center py-6">
                      <p className="text-dark/80 text-lg md:text-xl font-medium leading-relaxed italic">
                        “{review.quote}”
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-dark/5">
                      {review.avatar ? (
                        <img
                          src={review.avatar}
                          alt={review.name}
                          loading="lazy"
                          className="w-11 h-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center font-display font-bold shrink-0">
                          {review.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold truncate">{review.name}</h4>
                        <p className="text-[10px] text-dark/40 uppercase font-bold tracking-widest">
                          {review.location}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controls — static, so they don't flicker on slide change. */}
                <div className="flex items-center justify-between mt-8">
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

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => go(-1)}
                      aria-label="Previous testimonial"
                      className="w-10 h-10 rounded-full border border-dark/10 flex items-center justify-center hover:bg-dark hover:text-white transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => go(1)}
                      aria-label="Next testimonial"
                      className="w-10 h-10 rounded-full border border-brand/20 text-brand flex items-center justify-center hover:bg-dark hover:text-white hover:border-dark transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
