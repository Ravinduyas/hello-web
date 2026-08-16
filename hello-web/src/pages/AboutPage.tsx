import { ArrowRight, Heart, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { asset } from '../lib/asset';

// The closing promise, one line at a time — the client's copy reads as a list.
const promise = [
  'You’re choosing people who genuinely care.',
  'You’re choosing honesty over hidden charges.',
  'You’re choosing safety over shortcuts.',
  'You’re choosing kindness over business.',
  'You’re choosing local friends instead of strangers.',
  'You’re choosing peace of mind.',
];

export default function AboutPage() {
  return (
    <div className="bg-beige min-h-screen">
      <div className="relative h-[58vh] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <img
          src={asset('/photos/shop-front.jpg')}
          alt="The Hello Rent shopfront in Weligama, with a tuk-tuk parked under the sign"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow !text-white/60">[ Our Story ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Come as a traveler. <br /> Leave as family.
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              If you’re lucky enough to discover Hello Rent, you’re lucky enough to experience Sri
              Lanka with a team that truly cares.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Meet the family ─────────────────────────────────────────────── */}
      {/* The ids below are anchor targets for the homepage "Our Story" teaser.
          scroll-mt clears the fixed navbar so headings aren't hidden under it. */}
      <section id="meet" className="scroll-mt-24 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <header className="section-head">
          <span className="eyebrow">[ Meet Your Local Family ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              Meet Bhagya (“Lucky”) &amp; Sandra
            </h2>
            <span className="section-index">(01)</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-dark/70 leading-relaxed"
          >
            <p className="text-xl md:text-2xl font-medium text-dark leading-snug">
              Welcome to Hello Rent. We are Bhagya and Sandra, a husband-and-wife team who run
              Hello Rent together.
            </p>
            <p>
              We believe every traveler deserves to feel safe, respected and genuinely welcomed in
              Sri Lanka. From the moment you arrive until the day you leave, we hope you feel that
              you have a local brother and sister by your side.
            </p>
            <p>
              We’re always happy to share our local knowledge, answer your questions, and help make
              your holiday unforgettable.
            </p>
            <Link to="/contact" className="btn-dark group w-fit mt-2">
              SAY HELLO
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* TODO(client): swap this brand mark for a real photo of Bhagya &
              Sandra once one is supplied — drop it in /public and point the
              <img> at it; the framing below already suits a portrait crop. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden bg-white flex items-center justify-center p-12"
          >
            <img
              src={asset('/photos/hello-rental.jpg')}
              alt="Hello Rent — scooter and bike rental, Weligama"
              loading="lazy"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Lucky's story ───────────────────────────────────────────────── */}
      <section id="story" className="scroll-mt-24 bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <header className="section-head">
            <span className="eyebrow">[ How It Started ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                A hand-painted board and three borrowed scooters
              </h2>
              <span className="section-index">(02)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
            <motion.figure
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-28 h-fit"
            >
              <blockquote className="font-display text-2xl md:text-3xl font-bold leading-snug tracking-tight border-t border-dark/15 pt-8">
                “I asked for nothing. When the month ended he pushed ten thousand rupees into my
                hand — that was the moment I understood this could be a living.”
              </blockquote>
              <figcaption className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mt-6">
                Bhagya “Lucky” · Founder, Hello Rent
              </figcaption>
            </motion.figure>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6 text-dark/70 leading-relaxed"
            >
              <p className="text-lg text-dark/85">
                My name is Bhagya. Most people call me Lucky, because that is what the name means.
              </p>
              <p>
                I finished thirteen years of school, passed my A-Levels, and went to Colombo to
                train as a hydraulic mechanic on a four-year course. Along the way my mind changed.
                I studied human resource management instead, took the certificate and came home. My
                father worked at the port and found me a job as a seaman on a big boat — that life
                wasn’t for me either.
              </p>
              <p>
                From 2016 to 2020 I taught surfing at Becool Surf Camp on Weligama Beach. Five years
                on that beach is where Hello Rent really began. All I owned was the scooter my
                father had bought me, and students kept asking me the same question: where can we
                rent one? So I borrowed a scooter from a friend, then from another friend, then
                another.
              </p>
              <p>
                One of my surf students asked me to find him a scooter for a month. A friend had
                just bought a brand-new one and agreed to lend it, because he trusted the rider. I
                arranged everything and asked for nothing — I was only helping. When the month
                ended, my friend pushed ten thousand rupees into my hand. I hadn’t asked for it.
                That was the moment I understood that giving people a good vehicle could be a
                living.
              </p>
              <p>
                In 2017 I took back a place in the centre of Weligama that my father had lost. It
                sits in the heart of the town — walking distance to the beach, the train station,
                the bus station and the bank. I found an old broken board, took a brush and some
                paint, wrote <em>Hello Rent</em> across it and stood it out front. I parked two or
                three of my friends’ scooters beside it. That was the beginning.
              </p>
              <p>
                Today, most of the vehicles you rent from us still belong to local families rather
                than to me. Around a hundred families earn a living from this fleet. They take their
                share, I take mine, and travelers get a good vehicle without fraud, without
                harassment, without trouble. That is why this brand means something here.
              </p>
              <p>
                My hope for the future is a high-quality, hassle-free rental and taxi service for
                travelers from anywhere in the world — so anyone can arrive without fear or doubt,
                take a vehicle, finish their trip, and go home without a single hassle.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Safety ──────────────────────────────────────────────────────── */}
      <section id="safety" className="scroll-mt-24 bg-dark text-beige py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <header className="section-head">
            <span className="eyebrow !text-brand">[ Safety First ]</span>
            <div className="rule mt-5 !border-beige/20">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                Your safety is our highest priority
              </h2>
              <span className="section-index !text-beige/30">(03)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-beige/70 leading-relaxed"
            >
              <p>
                A safe and enjoyable journey begins with responsible driving. Before every rental we
                take the time to understand your experience, your confidence, and how familiar you
                are with riding a scooter or driving a tuk-tuk — including whether you’ve driven on
                the left-hand side of the road before, here or elsewhere in Asia, where conditions
                and traffic can be very different.
              </p>
              <p>
                Our goal is not simply to rent you a vehicle. It’s to help you enjoy Sri Lanka
                safely, confidently and responsibly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6 text-beige/70 leading-relaxed"
            >
              <p>
                We also help eligible travelers obtain the appropriate driving permit so they can
                ride legally and with peace of mind. Our team is always glad to explain local
                traffic rules, share practical safety tips, and recommend the vehicle that actually
                suits your experience.
              </p>
              <p className="text-beige">
                And if we believe a vehicle isn’t the right choice for you right now, we’ll say so
                honestly. Your safety matters more to us than making a rental.
              </p>
              <p className="font-display text-xl md:text-2xl font-bold text-beige leading-snug tracking-tight pt-2">
                Service comes first. Safety always comes first. Trust is everything.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section id="values" className="scroll-mt-24 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <header className="section-head">
          <span className="eyebrow">[ Our Values ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              Kindness is the whole business plan
            </h2>
            <span className="section-index">(04)</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-dark/70 leading-relaxed"
          >
            <ShieldCheck className="w-7 h-7 text-brand" strokeWidth={1.5} />
            <p>
              As Buddhists, we believe kindness, honesty, compassion, respect and good karma should
              guide every decision we make. Those values are why we treat every customer fairly,
              wherever they come from.
            </p>
            <p>
              Service matters more to me than money. I try to live by karma — to do good, and not to
              hurt anyone’s feelings. If something I do harms another person, I regret it. Even when
              people criticise me, I smile. Everything is impermanent; nothing we call ours is
              really ours. What we can do with this life is act well while we have it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-6 text-dark/70 leading-relaxed"
          >
            <Heart className="w-7 h-7 text-brand" strokeWidth={1.5} />
            <p>
              Most travelers arrive in Sri Lanka knowing nobody. They don’t know Weligama, or the
              south, or how much one province differs from the next. Some people will tell you
              foreigners only care about money. That has never been true for me.
            </p>
            <p>
              I just want to see people laughing and happy — if the other person is happy, I’m
              happy. That’s my way, and it’s why I enjoy helping travelers so much.
            </p>
            <p className="text-dark">
              Profit is necessary to run a business, but it has never been our greatest purpose.
              Helping people and creating unforgettable memories will always be our greatest reward.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── The promise ─────────────────────────────────────────────────── */}
      <section id="promise" className="scroll-mt-24 bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <header className="section-head">
            <span className="eyebrow">[ The Hello Rent Promise ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                You’re not just renting a scooter
              </h2>
              <span className="section-index">(05)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-l border-dark/15">
            {promise.map((line, idx) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 2) * 0.08 }}
                className="border-r border-b border-dark/15 p-8 md:p-10 font-display text-lg md:text-xl font-bold leading-snug"
              >
                {line}
              </motion.p>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="font-display text-2xl md:text-4xl font-bold tracking-tight">
              Welcome to the Hello Rent family.
            </p>
            <p className="text-dark/60 mt-3">Come as a traveler. Leave as family.</p>
            <div className="flex justify-center mt-8">
              <Link to="/fleet" className="btn-primary px-7 py-3 group">
                BROWSE OUR FLEET
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
