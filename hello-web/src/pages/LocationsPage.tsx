import { MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'motion/react';

const locations = [
  {
    name: 'Colombo',
    address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
    hours: 'Open 07:00 – 21:00',
    phone: '+94 77 123 4567',
    image: 'https://images.unsplash.com/photo-1704797390682-76479a29dc9a?auto=format&fit=crop&q=80&w=800',
    tag: 'Most Popular',
  },
  {
    name: 'Galle',
    address: 'No. 12, Closenberg Road, Galle Fort, Sri Lanka',
    hours: 'Open 08:00 – 20:00',
    phone: '+94 77 123 4568',
    image: 'https://images.unsplash.com/photo-1704797390325-b057758d8c3d?auto=format&fit=crop&q=80&w=800',
    tag: null,
  },
  {
    name: 'Kandy',
    address: 'No. 8, Peradeniya Road, Kandy, Sri Lanka',
    hours: 'Open 08:00 – 19:00',
    phone: '+94 77 123 4569',
    image: 'https://images.unsplash.com/photo-1705730428836-b54e12aa8ea5?auto=format&fit=crop&q=80&w=800',
    tag: null,
  },
  {
    name: 'Negombo',
    address: 'No. 3, Lewis Place, Negombo, Sri Lanka',
    hours: 'Open 07:00 – 21:00',
    phone: '+94 77 123 4570',
    image: 'https://images.unsplash.com/photo-1682091052512-18b00e81105c?auto=format&fit=crop&q=80&w=800',
    tag: 'New',
  },
  {
    name: 'Mirissa',
    address: 'No. 1, Beach Road, Mirissa, Sri Lanka',
    hours: 'Open 08:00 – 20:00',
    phone: '+94 77 123 4571',
    image: 'https://images.unsplash.com/photo-1734279135136-dcaca9fdffaf?auto=format&fit=crop&q=80&w=800',
    tag: null,
  },
];

export default function LocationsPage() {
  return (
    <div className="bg-beige min-h-screen">

      <div className="relative h-screen min-h-[600px] w-full overflow-hidden bg-dark" style={{ height: '100dvh' }}>
        <div className="absolute inset-0 bg-dark/55 z-10" />
        <img
          src="https://images.unsplash.com/photo-1734279135136-dcaca9fdffaf?auto=format&fit=crop&q=80&w=2600"
          alt="Mirissa Beach, Sri Lanka"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16 pt-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="eyebrow !text-white/60">[ Find Us ]</span>
            <h1 className="display-xl text-5xl md:text-7xl text-white mt-3 mb-4">
              Pick up across Sri Lanka
            </h1>
            <p className="text-white/70 text-lg max-w-xl">
              Five rental locations from Colombo to Mirissa. Start your ride at any branch and return it at another — no extra fee.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24 pt-16">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc, idx) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-3xl overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {loc.tag && (
                  <span className="absolute top-4 left-4 bg-brand text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {loc.tag}
                  </span>
                )}
              </div>
              <div className="p-6 space-y-3">
                <h3 className="font-display text-2xl font-bold">{loc.name}</h3>
                <div className="flex items-start gap-2 text-sm text-dark/60">
                  <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                  <span>{loc.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-dark/60">
                  <Clock className="w-4 h-4 text-brand shrink-0" />
                  <span>{loc.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-dark/60">
                  <Phone className="w-4 h-4 text-brand shrink-0" />
                  <span>{loc.phone}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
