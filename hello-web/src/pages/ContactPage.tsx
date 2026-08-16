import { MapPin, Phone, Mail, Clock, Navigation, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { CONTACT, whatsappLink } from '../data/contact';
import { asset } from '../lib/asset';

const SUBJECTS = ['Booking enquiry', 'Fleet question', 'Pickup location', 'Other'];

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: SUBJECTS[0],
    message: '',
  });
  const [sent, setSent] = useState(false);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  /**
   * There is no mail server behind this site, so the form hands the message to
   * WhatsApp — where the shop actually answers — instead of pretending to send
   * it. Everything typed is carried across, so nothing is retyped.
   */
  const composed = [
    `Hi Hello Rent! ${form.subject}.`,
    '',
    `Name: ${[form.firstName, form.lastName].filter(Boolean).join(' ')}`,
    form.email ? `Email: ${form.email}` : '',
    '',
    form.message,
  ]
    .filter(line => line !== '')
    .join('\n');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    window.open(whatsappLink(composed), '_blank', 'noopener,noreferrer');
    setSent(true);
  }

  return (
    <div className="bg-beige min-h-screen">

      <div className="relative h-[58vh] min-h-[420px] max-h-[620px] w-full overflow-hidden bg-dark">
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <img
          src={asset('/photos/weligama-road.jpg')}
          alt="The Hello Rent shop on the main road through Weligama"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="eyebrow !text-white/60">[ Get In Touch ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Contact us
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Questions about booking, fleet availability, or pickup locations? We're here to help.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-16">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 md:p-12"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-8 h-8 text-brand" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">WhatsApp is open</h3>
                {/* Only the handover is certain, so the wording claims no more
                    than that — and the link covers a blocked pop-up. */}
                <p className="text-dark/60 mb-6">
                  Your message is waiting there — press send and we'll reply as soon as we see it.
                </p>
                <a
                  href={whatsappLink(composed)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Open WhatsApp again
                </a>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-sm text-dark/45 hover:text-brand transition-colors mt-5"
                >
                  Back to the form
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display text-2xl font-bold mb-8">Send a message</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">First Name</label>
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={set('firstName')}
                      placeholder="Sarah"
                      className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Last Name</label>
                    <input
                      type="text"
                      required
                      value={form.lastName}
                      onChange={set('lastName')}
                      placeholder="Johnson"
                      className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="sarah@email.com (optional)"
                    className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Subject</label>
                  <select
                    value={form.subject}
                    onChange={set('subject')}
                    className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors appearance-none"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Tell us what you need..."
                    className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>
                {/* Named for what it does — the message goes to WhatsApp, and
                    a button saying "send" would imply an inbox that does not
                    exist. */}
                <button type="submit" className="btn-primary w-full justify-center">
                  <MessageCircle className="w-4 h-4" />
                  SEND VIA WHATSAPP
                </button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {[
              { icon: MapPin, label: 'Main Location', value: CONTACT.address },
              { icon: Phone, label: 'Call Us', value: CONTACT.phone },
              { icon: Mail, label: 'Email Us', value: CONTACT.email },
              { icon: Clock, label: 'Opening Hours', value: CONTACT.hours },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-dark/40 mb-1">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              </div>
            ))}

            <a
              href={CONTACT.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-fit text-sm py-3 px-6"
            >
              GET DIRECTIONS
              <Navigation className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* ── Our store ───────────────────────────────────────────────────
            Formerly the standalone /locations page. Hello Rent has a single
            home base, so it lives here rather than on a page of its own. */}
        <section id="store" className="scroll-mt-24 mt-16 md:mt-24">
          <header className="section-head">
            <span className="eyebrow">[ Find Us ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
                Find us in Weligama
              </h2>
              <span className="section-index">(01)</span>
            </div>
            <p className="text-dark/60 leading-relaxed max-w-2xl mt-8">
              One home base on Sri Lanka's south coast. Pick up your scooter or tuk-tuk and explore
              the island your way — or ask us to deliver it to your hotel, the airport, or another
              city.
            </p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="relative min-h-[320px] lg:min-h-[420px]">
              <iframe
                title="Hello Rent — Weligama location"
                src={CONTACT.mapSrc}
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
              <div>
                <span className="eyebrow">[ Our Store ]</span>
                <h3 className="font-display text-3xl md:text-4xl font-bold mt-2">
                  {CONTACT.storeName}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-dark/70">
                  <MapPin className="w-5 h-5 text-brand mt-0.5 shrink-0" />
                  <span>{CONTACT.address}</span>
                </div>
                <div className="flex items-center gap-3 text-dark/70">
                  <Clock className="w-5 h-5 text-brand shrink-0" />
                  <span>Open daily · 07:00 – 21:00</span>
                </div>
                <div className="flex items-center gap-3 text-dark/70">
                  <Phone className="w-5 h-5 text-brand shrink-0" />
                  <span>{CONTACT.phone}</span>
                </div>
              </div>

              <a
                href={CONTACT.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-fit text-sm py-3 px-6"
              >
                GET DIRECTIONS
                <Navigation className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
