import { motion } from 'motion/react';
import { asset } from '../lib/asset';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Choose Your Bike',
      description: 'Browse our scooters, motorbikes, tuk-tuks and cars online. Automatics from €5/day are ideal for beach roads and city streets, while manual bikes are built for Ella\'s mountain passes.',
      image: asset('/bikes-ready.png'),
    },
    {
      num: '02',
      title: 'Book Online',
      description: 'Reserve in minutes. Pick your dates and collect your ride from our Weligama store on the south coast — return it there when your trip wraps up.',
      image: asset('/rider-checking-phone.jpg'),
    },
    {
      num: '03',
      title: 'Collect & Hit the Road',
      description: 'Show your booking, grab your helmet, and go. Our team will brief you on the best Sri Lankan routes. An International Driving Permit is required for manual motorbikes.',
      image: 'https://images.unsplash.com/photo-1691673366849-a393a424fa19?auto=format&fit=crop&q=80&w=600',
    },
  ];

  return (
    <section className="bg-beige py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Simple 3 Steps ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              On the road in under 10 minutes
            </h2>
            <span className="section-index">(01)</span>
          </div>
        </header>

        <div className="space-y-16 lg:space-y-0">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-8 py-12 border-b border-dark/10"
            >
              <div className="w-full md:w-44 lg:w-52 shrink-0 aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex-1 max-w-md">
                <h3 className="font-display text-2xl md:text-3xl font-bold group-hover:text-brand transition-colors">
                  {step.title}
                </h3>
              </div>
              <div className="flex-1 max-w-sm">
                <p className="text-dark/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="flex-none font-display text-5xl md:text-7xl font-black text-dark/10 group-hover:text-brand/20 transition-colors">
                {step.num}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
