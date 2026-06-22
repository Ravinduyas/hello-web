import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="bg-beige min-h-screen">

      <div className="relative h-screen min-h-[600px] w-full overflow-hidden bg-dark" style={{ height: '100dvh' }}>
        <div className="absolute inset-0 bg-dark/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1703588866434-3ce7163742ed?auto=format&fit=crop&q=80&w=2600"
          alt="Galle Fort, Sri Lanka"
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
                  <Mail className="w-8 h-8 text-brand" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-3">Message sent!</h3>
                <p className="text-dark/60">We'll get back to you within 24 hours.</p>
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
                      placeholder="Sarah"
                      className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Johnson"
                      className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@email.com"
                    className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Subject</label>
                  <select className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors appearance-none">
                    <option>Booking enquiry</option>
                    <option>Fleet question</option>
                    <option>Pickup location</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us what you need..."
                    className="w-full bg-beige border border-dark/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  SEND MESSAGE
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
              { icon: MapPin, label: 'Main Location', value: 'No. 45, Galle Road, Colombo 03, Sri Lanka' },
              { icon: Phone, label: 'Call Us', value: '+94 77 123 4567' },
              { icon: Mail, label: 'Email Us', value: 'hello@hellorent.co' },
              { icon: Clock, label: 'Opening Hours', value: 'Mon – Sun: 07:00 – 21:00' },
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

            <div className="bg-white rounded-2xl overflow-hidden h-64">
              <img
                src="https://images.unsplash.com/photo-1703588866434-3ce7163742ed?auto=format&fit=crop&q=80&w=800"
                alt="Galle Fort, Sri Lanka"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
