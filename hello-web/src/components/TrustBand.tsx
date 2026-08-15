import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { whatsappLink } from '../data/contact';

/**
 * The brand's trust promise, sitting directly above the WhatsApp button.
 *
 * Per the client's copy deck this pairing is deliberate and repeats site-wide:
 * the quote is what a traveler should read in the moment just before they
 * reach out. Rendered once in App.tsx above the footer so it appears on every
 * page without each page having to remember it.
 */
export default function TrustBand() {
  return (
    <section className="bg-dark text-beige py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-4xl font-bold leading-snug tracking-tight"
        >
          “At Hello Rent, you're not just our customer. From the moment you arrive in Sri Lanka
          until the day you leave, we want you to feel that you have a trusted local brother and
          sister by your side.”
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand text-beige px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:brightness-110"
          >
            <MessageCircle className="w-4 h-4" />
            CHAT WITH US ON WHATSAPP
          </a>
          <p className="text-[10px] font-bold uppercase tracking-widest text-beige/40">
            Ask us anything — routes, surf, permits, or a scooter
          </p>
        </motion.div>
      </div>
    </section>
  );
}
