import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, type summariseCategories } from '../data/fleet';

export type CategorySummary = ReturnType<typeof summariseCategories>[number];

/**
 * One vehicle class, as a card.
 *
 * The fleet page and the first step of booking are asking the same question —
 * which kind of ride? — so they ask it with the same card rather than two that
 * drift apart. What differs is only what a click does: the fleet page opens
 * booking, the wizard picks the class it is already in. So the face is shared
 * and each page brings its own shell.
 */
const SHELL = 'group relative block h-[440px] lg:h-[500px] w-full rounded-3xl overflow-hidden text-left';

function Face({ summary, cta }: { summary: CategorySummary; cta: string }) {
  return (
    <>
      <img
        src={summary.image}
        alt={summary.meta.label}
        loading="lazy"
        style={{ objectPosition: summary.imagePosition ?? 'center' }}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {/* Espresso-tinted gradient, darkest at the foot for legibility. */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark/85 via-dark/30 to-dark/10" />

      {summary.meta.transmission && (
        <span className="absolute top-6 left-6 eyebrow !text-white/70">{summary.meta.transmission}</span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-7 md:p-8 text-beige">
        <h3 className="display-xl text-3xl md:text-4xl">{summary.meta.label}</h3>
        {summary.meta.blurb && (
          <p className="text-beige/70 text-sm leading-relaxed mt-3">{summary.meta.blurb}</p>
        )}

        <div className="flex items-center justify-between mt-7 pt-5 border-t border-beige/20">
          <span className="font-display text-base font-bold">
            From {formatPrice(summary.from)} / day
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide group-hover:gap-3 transition-all">
            {cta} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </>
  );
}

/** The fleet page's card: a way into booking, in a new tab. */
export function ClassCardLink({ summary }: { summary: CategorySummary }) {
  return (
    <Link
      to={`/book?category=${encodeURIComponent(summary.category)}`}
      target="_blank"
      rel="noopener"
      aria-label={`Rent ${summary.meta.label} — opens in a new tab`}
      className={SHELL}
    >
      <Face summary={summary} cta="Rent" />
    </Link>
  );
}

/** The booking step's card: picking the class, and showing which is picked. */
export function ClassCardButton({
  summary,
  selected,
  onPick,
}: {
  summary: CategorySummary;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`Choose ${summary.meta.label}`}
      className={`${SHELL} border-2 transition-all ${
        selected ? 'border-brand' : 'border-transparent hover:border-brand'
      }`}
    >
      <Face summary={summary} cta="Choose" />
    </button>
  );
}
