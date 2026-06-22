import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function WhyChooseUs() {
  const sections = [
    {
      title: 'Rates From $9 a Day',
      category: 'Pricing',
      label: 'No Hidden Fees',
      image: 'https://images.unsplash.com/photo-1704797390325-b057758d8c3d?auto=format&fit=crop&q=80&w=1000',
      span: 'col-span-1 md:col-span-1'
    },
    {
      title: 'GPS Mount on Every Bike',
      category: 'Navigation',
      label: 'Navigate Sri Lanka Freely',
      image: 'https://images.unsplash.com/photo-1612862862126-865765df2ded?auto=format&fit=crop&q=80&w=1000',
      span: 'col-span-1 md:col-span-1'
    },
    {
      title: '24/7 Island-Wide Support',
      category: 'Support',
      label: 'Never Stranded',
      image: 'https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?auto=format&fit=crop&q=80&w=1000',
      span: 'col-span-1 md:col-span-1'
    },
    {
      title: '5 Pickup Locations',
      category: 'Locations',
      label: 'Colombo · Galle · Kandy · Negombo · Mirissa',
      image: 'https://images.unsplash.com/photo-1734279135136-dcaca9fdffaf?auto=format&fit=crop&q=80&w=1000',
      span: 'col-span-1 md:col-span-1'
    },
    {
      title: 'Helmets Always Included',
      category: 'Safety',
      label: 'Ride Legal, Ride Safe',
      image: 'https://images.unsplash.com/photo-1623343559257-1f3aef3a77e5?auto=format&fit=crop&q=80&w=1500',
      span: 'col-span-2 md:col-span-2'
    }
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Why Rent With Us ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              The smarter way to explore Sri Lanka
            </h2>
            <span className="section-index">(01)</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-16">
          {sections.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`${item.span} group overflow-hidden`}
            >
              <div className="relative aspect-[16/9] md:aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <Link
                  to="/fleet"
                  aria-label={`Learn more: ${item.title}`}
                  className="absolute bottom-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-brand hover:border-brand transition-all"
                >
                  <Plus className="w-5 h-5" />
                </Link>
              </div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold text-dark/30 uppercase tracking-tight">{item.label}</span>
                  <h3 className="font-display text-xl md:text-2xl font-bold mt-1 group-hover:text-brand transition-colors">
                    {item.title}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-dark/30 uppercase tracking-tight">{item.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
