import { AlertTriangle, ArrowRight, Check, FileText, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { whatsappLink } from '../data/contact';
import { extras, formatPrice } from '../data/fleet';
import { asset } from '../lib/asset';

const permitExtra = extras.find(e => e.id === 'driving-permit');

// The three routes to a legal permit, as Hello Rent explains them.
const options = [
  {
    index: '01',
    title: 'At the airport when you land',
    badge: 'Easiest & cheapest',
    copy: 'Colombo / Katunayake international airport issues the domestic driving card on arrival. The quickest option if you are riding straight away.',
    validity: 'Valid one month',
  },
  {
    index: '02',
    title: 'Department of Motor Traffic',
    badge: 'Cheap, but you travel',
    copy: 'The offices in Colombo or Hambantota will issue it too. Straightforward and inexpensive — the cost is a day of your holiday getting there.',
    validity: 'Valid one month',
  },
  {
    index: '03',
    title: 'We arrange it for you',
    badge: 'No queueing',
    copy: 'Send us your documents and we handle the paperwork, legally endorsed through the Automobile Association. You stay at the beach.',
    validity: 'Valid six months',
    highlight: true,
  },
];

const documents = [
  {
    label: 'Your International Driving Permit',
    detail:
      'It must be the government-issued booklet from your own country. IDPs bought from online agencies are not accepted here.',
  },
  {
    label: 'A copy of your passport',
    detail: 'The photo page is enough.',
  },
  {
    label: 'A passport photo',
    detail: 'A clear photo of your face — a phone picture against a plain wall usually works.',
  },
];

export default function DrivingPermitPage() {
  return (
    <div className="bg-beige min-h-screen">
      <div
        className="relative h-screen min-h-[600px] w-full overflow-hidden bg-dark"
        style={{ height: '100dvh' }}
      >
        <div className="absolute inset-0 bg-dark/65 z-10" />
        <img
          src={asset('/rider-checking-phone.jpg')}
          alt="A rider checking their phone beside a scooter in Sri Lanka"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow !text-white/60">[ Driving Permit ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Do I need a permit <br /> to ride in Sri Lanka?
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Yes — absolutely. Here are the three ways to get one, and the one where you don't
              have to leave the beach.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* ── Why it matters ────────────────────────────────────────────── */}
        <section className="mb-16 md:mb-24">
          <header className="section-head">
            <span className="eyebrow">[ The Short Answer ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                Your home licence alone is not enough
              </h2>
              <span className="section-index">(01)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-dark/70 leading-relaxed"
            >
              <AlertTriangle className="w-7 h-7 text-brand" strokeWidth={1.5} />
              <p className="text-xl md:text-2xl font-medium text-dark leading-snug">
                Sri Lankan traffic law is stricter than the law in a lot of visitors' home
                countries.
              </p>
              <p>
                To ride or drive here legally you need your licence recognised locally — which means
                a Sri Lankan permit endorsed on top of your International Driving Permit. Riding
                without one can mean a fine, and it can affect you badly if anything goes wrong on
                the road.
              </p>
              <p>
                It is worth ten minutes of paperwork. We would rather tell you this honestly before
                you ride than have you find out from a police officer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 md:p-12 space-y-6 h-fit"
            >
              <span className="eyebrow">[ Check Your Category ]</span>
              <div className="space-y-5">
                <div className="flex items-start gap-4 pb-5 border-b border-dark/10">
                  <span className="font-display text-3xl font-black text-brand shrink-0 leading-none">
                    A
                  </span>
                  <div>
                    <p className="font-bold">Motorcycles &amp; scooters</p>
                    <p className="text-sm text-dark/55 leading-relaxed mt-1">
                      The category you need for everything on two wheels in our fleet.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-display text-3xl font-black text-brand shrink-0 leading-none">
                    B
                  </span>
                  <div>
                    <p className="font-bold">Cars &amp; light vehicles</p>
                    <p className="text-sm text-dark/55 leading-relaxed mt-1">
                      Needed for our cars and vans — and for a tuk-tuk, ask us first.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-dark/55 leading-relaxed pt-2 border-t border-dark/10">
                Make sure the right category is actually on your licence before you travel. If
                you're unsure, send us a photo of it and we'll check for you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Three options ─────────────────────────────────────────────── */}
        <section className="mb-16 md:mb-24">
          <header className="section-head">
            <span className="eyebrow">[ Three Ways ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                How to get your permit
              </h2>
              <span className="section-index">(02)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {options.map((option, idx) => (
              <motion.div
                key={option.index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`rounded-3xl p-8 md:p-10 flex flex-col gap-4 ${
                  option.highlight ? 'bg-dark text-beige' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className={`font-display text-sm font-bold tabular-nums ${
                      option.highlight ? 'text-beige/40' : 'text-dark/30'
                    }`}
                  >
                    ({option.index})
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      option.highlight ? 'bg-brand text-beige' : 'bg-brand/10 text-brand'
                    }`}
                  >
                    {option.badge}
                  </span>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold leading-tight">
                  {option.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed flex-1 ${
                    option.highlight ? 'text-beige/60' : 'text-dark/55'
                  }`}
                >
                  {option.copy}
                </p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest pt-4 border-t ${
                    option.highlight ? 'border-beige/20 text-beige/50' : 'border-dark/10 text-dark/40'
                  }`}
                >
                  {option.validity}
                </p>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-dark/50 leading-relaxed mt-8 max-w-2xl">
            The first two options are issued for one month. Renewing them means going back in
            person — which is why most of our guests choose the six-month permit we arrange.
          </p>
        </section>

        {/* ── What we need ──────────────────────────────────────────────── */}
        <section>
          <header className="section-head">
            <span className="eyebrow">[ Let Us Handle It ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                Send three things by WhatsApp
              </h2>
              <span className="section-index">(03)</span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 items-start">
            <div className="border-t border-dark/15">
              {documents.map((doc, idx) => (
                <motion.div
                  key={doc.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="border-b border-dark/15 py-8 flex items-start gap-5"
                >
                  <span className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg md:text-xl font-bold">{doc.label}</h3>
                    <p className="text-sm text-dark/55 leading-relaxed mt-2">{doc.detail}</p>
                  </div>
                </motion.div>
              ))}
              <p className="text-sm text-dark/55 leading-relaxed pt-8">
                That's everything. No government offices, no queueing, no lost holiday. We'll tell
                you as soon as it's ready.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-dark text-beige rounded-3xl p-8 md:p-10 space-y-6"
            >
              <FileText className="w-7 h-7 text-brand" strokeWidth={1.5} />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-beige/40">
                  Permit arranged by us
                </span>
                {permitExtra && (
                  <p className="font-display text-5xl font-black text-brand mt-2 leading-none">
                    {formatPrice(permitExtra.price)}
                  </p>
                )}
                <p className="text-beige/50 text-sm mt-3">One-off · valid six months</p>
              </div>
              <p className="text-beige/60 text-sm leading-relaxed">
                Legally endorsed through the Automobile Association. You can add it to your booking,
                or just message us before you arrive.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <a
                  href={whatsappLink(
                    "Hi Hello Rent! I'd like you to arrange my Sri Lankan driving permit.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-brand text-beige px-6 py-3 rounded-full text-sm font-medium transition-all hover:brightness-110"
                >
                  <MessageCircle className="w-4 h-4" />
                  SEND YOUR DOCUMENTS
                </a>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 border border-beige/30 text-beige px-6 py-3 rounded-full text-sm font-medium hover:bg-beige hover:text-dark transition-all group"
                >
                  Add it to a booking
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
