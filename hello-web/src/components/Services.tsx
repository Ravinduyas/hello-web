import { ArrowRight, FileText, Package, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { extras as defaultExtras, priceLabel, type Extra } from '../data/fleet';
import { fetchExtras } from '../lib/api';

// Everything Hello Rent does beyond handing over a vehicle. Prices come from
// the same `extras` list the booking form charges from, so the two cannot drift.
const icons: Record<string, typeof FileText> = {
  'driving-permit': FileText,
  'extra-helmet': ShieldCheck,
  'phone-mount': Smartphone,
  'luggage-box': Package,
  delivery: Truck,
};

// The three documents we need to arrange a permit, from the client's notes.
const documents = [
  'Your own government-issued IDP booklet',
  'A copy of your passport',
  'A photo',
];

export default function Services() {
  // The admin owns these prices, so read them from it — the bundled list is
  // only a fallback. Without this, changing an extra in the admin moved the
  // booking form but left this section quoting the old figure.
  const [extras, setExtras] = useState<Extra[]>(defaultExtras);

  useEffect(() => {
    let active = true;
    fetchExtras()
      .then(list => {
        if (active && list) setExtras(list);
      })
      .catch(() => {
        /* backend unreachable — the bundled prices stand */
      });
    return () => {
      active = false;
    };
  }, []);

  const permit = extras.find(e => e.id === 'driving-permit');
  const rest = extras.filter(e => e.id !== 'driving-permit');

  return (
    <section className="bg-beige py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="section-head">
          <span className="eyebrow">[ Our Services ]</span>
          <div className="rule mt-5">
            <h2 className="display-xl text-4xl md:text-6xl max-w-3xl">
              More than the keys
            </h2>
            <span className="section-index">(03)</span>
          </div>
          <p className="text-dark/60 leading-relaxed max-w-2xl mt-8">
            The paperwork, the helmet for your passenger, the ride to your hotel — the small
            things that turn a rental into a trip you can just get on and enjoy.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* The permit is the service guests ask for most, so it leads the section
              on its own filled card rather than sitting in the list below. */}
          {permit && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 bg-dark text-beige rounded-3xl p-8 md:p-12 flex flex-col"
            >
              <FileText className="w-7 h-7 text-brand shrink-0" strokeWidth={1.5} />

              <h3 className="display-xl text-3xl md:text-4xl mt-6">
                {permit.label}
              </h3>

              <p className="text-beige/70 leading-relaxed max-w-xl mt-4">
                Sri Lankan law requires a local permit — your licence from home is not enough
                on its own. Get one at the airport or a Motor Traffic office and it lasts a
                month, and renewing means going back in person. We arrange the legal permit
                instead, endorsed with the Automobile Association and valid six months.
              </p>

              <div className="mt-8 pt-8 border-t border-beige/20">
                <span className="eyebrow !text-beige/50">[ What we need from you ]</span>
                <ul className="grid sm:grid-cols-3 gap-4 mt-5">
                  {documents.map(doc => (
                    <li key={doc} className="text-sm text-beige/70 leading-relaxed">
                      {doc}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-beige/45 leading-relaxed mt-5">
                  All three can be sent over WhatsApp. An IDP bought from an online agency is
                  not valid in Sri Lanka.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 mt-10 pt-8 border-t border-beige/20">
                <div>
                  <span className="font-display text-3xl font-bold">
                    {priceLabel(permit.price)}
                  </span>
                  <span className="text-beige/50 text-sm ml-2">
                    {permit.price > 0 ? 'one-off · ' : ''}valid six months
                  </span>
                </div>
                <Link
                  to="/driving-permit"
                  className="inline-flex items-center gap-2 border border-beige/30 text-beige px-5 py-2.5 rounded-full text-sm font-medium hover:bg-beige hover:text-dark transition-all"
                >
                  How it works
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* The remaining add-ons, priced exactly as the booking form charges them. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-px bg-dark/15 border border-dark/15 rounded-3xl overflow-hidden">
            {rest.map(({ id, label, description, price, perDay }, idx) => {
              const Icon = icons[id] ?? Package;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="group bg-beige p-7 flex flex-col gap-3"
                >
                  <Icon className="w-5 h-5 text-brand shrink-0" strokeWidth={1.5} />
                  <h3 className="font-display text-base font-bold leading-tight">{label}</h3>
                  <p className="text-sm text-dark/55 leading-relaxed">{description}</p>
                  {/* "Free / day" reads as a question about what it normally
                      costs, so a free extra drops the qualifier. */}
                  <span className="font-display text-sm font-bold mt-auto pt-3">
                    {priceLabel(price)}
                    {price > 0 && (
                      <span className="text-dark/45 font-sans font-normal ml-1.5">
                        {perDay ? '/ day' : 'one-off'}
                      </span>
                    )}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-dark/50 leading-relaxed mt-10">
          Add any of these to your booking, or just ask us —{' '}
          <Link to="/book" target="_blank" rel="noopener" className="text-brand font-medium hover:underline">
            start a booking
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
