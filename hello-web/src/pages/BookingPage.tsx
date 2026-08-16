import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  MapPin,
  Bike as BikeIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Minus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { bikes as defaultBikes, extras as defaultExtras, formatPrice, shopLocation, type Bike, type Extra } from '../data/fleet';
import { getSpec, type VehicleSpec } from '../data/specs';
import { createBooking, fetchExtras, fetchBikes } from '../lib/api';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole rental days between two ISO dates (min 1 once both are set). */
function rentalDays(pickup: string, dropoff: string): number {
  if (!pickup || !dropoff) return 0;
  const start = new Date(pickup).getTime();
  const end = new Date(dropoff).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.max(1, Math.round((end - start) / MS_PER_DAY));
}

/** Local-time ISO date. Never toISOString() — that shifts the day by timezone. */
const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Today in the visitor's own timezone.
 *
 * Not toISOString() — that converts to UTC first, so a traveller anywhere west
 * of Greenwich gets yesterday's date for part of their day, and the calendar
 * would grey out a date they can still legitimately book.
 */
const todayISO = () => isoOf(new Date());

interface Renter {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  license: string;
}

const STEPS = ['Your ride', 'Rental dates', 'Extras', 'Your details'] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BookingPage() {
  const [params] = useSearchParams();

  const [step, setStep] = useState(0);
  const [bikeId, setBikeId] = useState<string | null>(params.get('bike'));
  // Set when the visitor arrives from a category card rather than a vehicle.
  const [category, setCategory] = useState<string | null>(params.get('category'));
  // Narrows a class by engine size before model — scooters are 110cc or 125cc.
  const [engineCc, setEngineCc] = useState<number | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  // Fleet & extras come from the admin-managed API; fall back to bundled defaults if it's unreachable.
  const [bikes, setBikes] = useState<Bike[]>(defaultBikes);
  const [extras, setExtras] = useState<Extra[]>(defaultExtras);
  const [chosenExtras, setChosenExtras] = useState<string[]>([]);
  const [renter, setRenter] = useState<Renter>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    license: '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const bike = bikes.find(b => b.id === bikeId);
  const days = rentalDays(pickupDate, dropoffDate);

  // Load the live fleet & extras once on mount; keep defaults on failure.
  useEffect(() => {
    let active = true;
    fetchBikes()
      .then(list => {
        if (active && list.length) setBikes(list);
      })
      .catch(() => {});
    fetchExtras()
      .then(list => {
        if (active && list.length) setExtras(list);
      })
      .catch(() => {
        /* offline / backend down — bundled defaults remain */
      });
    return () => {
      active = false;
    };
  }, []);

  /* ---- Price breakdown ------------------------------------------- */
  const summary = useMemo(() => {
    const lines: { label: string; amount: number }[] = [];
    if (bike && days > 0) {
      lines.push({ label: `${bike.title} · ${days} day${days > 1 ? 's' : ''}`, amount: bike.pricePerDay * days });
    }
    for (const ex of extras) {
      if (!chosenExtras.includes(ex.id)) continue;
      const amount = ex.perDay ? ex.price * Math.max(days, 1) : ex.price;
      lines.push({ label: ex.perDay ? `${ex.label} (×${Math.max(days, 1)})` : ex.label, amount });
    }
    const total = lines.reduce((sum, l) => sum + l.amount, 0);
    return { lines, total };
  }, [bike, days, chosenExtras, extras]);

  /* ---- Per-step validation --------------------------------------- */
  const stepValid = [
    !!bike,
    !!pickupDate && !!dropoffDate && days > 0,
    true, // extras are optional
    !!renter.firstName && !!renter.lastName && /\S+@\S+\.\S+/.test(renter.email) && !!renter.phone,
  ];

  function toggleExtra(id: string) {
    setChosenExtras(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  async function submitBooking() {
    if (!bike) return;
    setSubmitting(true);
    setError('');
    try {
      const { reference } = await createBooking({
        bikeId: bike.id,
        bikeTitle: bike.title,
        pickupLocation: shopLocation.name,
        dropoffLocation: shopLocation.name,
        pickupDate,
        dropoffDate,
        days,
        extras: extras
          .filter(ex => chosenExtras.includes(ex.id))
          .map(ex => ({ id: ex.id, label: ex.label, amount: ex.perDay ? ex.price * days : ex.price })),
        total: summary.total,
        renter,
      });
      setReference(reference);
      setConfirmed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else void submitBooking();
  }
  function back() {
    setStep(s => Math.max(0, s - 1));
  }

  /* ---------------------------------------------------------------- */
  /*  Confirmation screen                                             */
  /* ---------------------------------------------------------------- */
  if (confirmed) {
    return (
      <div className="bg-beige min-h-screen pt-28 md:pt-36 pb-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-3xl p-8 md:p-12 text-center"
        >
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-brand" />
          </div>
          <span className="eyebrow">[ Booking confirmed ]</span>
          <h1 className="display-xl text-3xl md:text-5xl mt-3 mb-4">You're all set, {renter.firstName}!</h1>
          <p className="text-dark/60 mb-8">
            We've emailed your confirmation to <span className="font-medium text-dark">{renter.email}</span>. Bring
            your passport &amp; a valid licence to pick up.
          </p>

          <div className="bg-beige rounded-2xl p-6 text-left space-y-3 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Reference</span>
              <span className="font-display font-bold tracking-wide">{reference}</span>
            </div>
            <Row icon={BikeIcon} label="Ride" value={bike?.title ?? ''} />
            <Row icon={Calendar} label="Dates" value={`${pickupDate} → ${dropoffDate} (${days} day${days > 1 ? 's' : ''})`} />
            <Row icon={MapPin} label="Pickup & return" value={shopLocation.address} />
            <div className="flex items-center justify-between border-t border-dark/10 pt-3">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-black text-brand">{formatPrice(summary.total)}</span>
            </div>
            <p className="text-xs text-dark/40">Pay at pickup — no card needed to reserve.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/fleet" className="btn-outline justify-center">Browse the fleet</Link>
            <Link to="/" className="btn-primary justify-center">Back to home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Wizard                                                          */
  /* ---------------------------------------------------------------- */
  return (
    // Deliberately tight above the fold. The job of this page is picking a
    // vehicle, so the masthead and step rail give up their height to get the
    // cards into view without scrolling for them.
    // pt clears the floating navbar — trimming it further ran the masthead
    // underneath. max-w-7xl matches the rest of the site and keeps the side
    // margins narrow instead of banding the page with empty beige.
    <div className="bg-beige min-h-screen pt-28 md:pt-32 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-5">
          <span className="eyebrow">[ Book your ride ]</span>
          <h1 className="display-xl text-3xl md:text-4xl mt-2">Reserve in a few taps</h1>
        </header>

        {/* Step indicator */}
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors ${
                  i === step ? 'text-brand' : i < step ? 'text-dark/60 hover:text-dark' : 'text-dark/25'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    i < step ? 'bg-brand text-white' : i === step ? 'bg-dark text-white' : 'bg-dark/10 text-dark/40'
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="w-6 h-px bg-dark/15 hidden sm:block" />}
            </li>
          ))}
        </ol>

        <div>
          <div className="bg-white rounded-3xl p-6 md:p-8 min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <StepRide
                    bikes={bikes}
                    selected={bikeId}
                    onSelect={setBikeId}
                    category={category}
                    onClearCategory={() => {
                      setCategory(null);
                      setEngineCc(null);
                    }}
                    engineCc={engineCc}
                    onPickCapacity={setEngineCc}
                  />
                )}

                {step === 1 && (
                  <StepDates
                    pickupDate={pickupDate}
                    dropoffDate={dropoffDate}
                    onChange={f => {
                      if (f.pickupDate !== undefined) {
                        setPickupDate(f.pickupDate);
                        // keep drop-off on/after pickup
                        if (dropoffDate && f.pickupDate > dropoffDate) setDropoffDate(f.pickupDate);
                      }
                      if (f.dropoffDate !== undefined) setDropoffDate(f.dropoffDate);
                    }}
                  />
                )}

                {step === 2 && <StepExtras extras={extras} chosen={chosenExtras} onToggle={toggleExtra} days={Math.max(days, 1)} />}

                {step === 3 && <StepDetails renter={renter} onChange={r => setRenter(r)} />}
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-dark/10">
              <button
                type="button"
                onClick={back}
                disabled={step === 0 || submitting}
                className="btn-outline disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              {/* The running total rides with the button that commits to it —
                  the summary panel is gone, and nobody should reach "Confirm
                  booking" without seeing what they are agreeing to pay. */}
              {summary.total > 0 && (
                <div className="flex items-baseline gap-2 ml-auto mr-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-dark/40">
                    Total
                  </span>
                  <span className="font-display text-xl font-black text-brand tabular-nums">
                    {formatPrice(summary.total)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={next}
                disabled={!stepValid[step] || submitting}
                className="btn-primary disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting
                  ? 'Booking…'
                  : step === STEPS.length - 1
                    ? 'Confirm booking'
                    : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — choose a ride                                            */
/* ------------------------------------------------------------------ */

/**
 * The three attributes every ride card compares on, in a fixed order.
 *
 * Character and best-for come straight off the comparison sheet; storage is
 * read out of the spec rows by label, because it is the one figure that
 * separates otherwise similar scooters and the sheets do not all carry the
 * same fields.
 */
const specRow = (spec: VehicleSpec | undefined, label: string) =>
  spec?.specs.find(s => s.label === label)?.value;

/** The attributes the comparison table lines up, in order. */
const COMPARE_ATTRS: { label: string; read: (spec: VehicleSpec | undefined) => string | undefined }[] = [
  { label: 'Character', read: spec => spec?.headline },
  { label: 'Best for', read: spec => spec?.bestFor },
  { label: 'Transmission', read: spec => specRow(spec, 'Transmission') },
  { label: 'Storage', read: spec => specRow(spec, 'Storage') },
];

/**
 * Per-vehicle detail, collapsed. A plain <details> keeps it keyboard-accessible
 * and working without JS; vehicles with no spec sheet fall back to the feature
 * list the admin holds for them.
 */
function VehicleDetails({ bike }: { bike: Bike }) {
  const spec = getSpec(bike.id);

  return (
    <details className="group/vd border-t border-dark/10">
      <summary className="flex items-center justify-center gap-2 cursor-pointer list-none px-4 py-2.5 text-xs font-bold text-dark/65 hover:text-brand transition-colors">
        <Info className="w-3.5 h-3.5" />
        Vehicle details
        <ChevronDown className="w-3.5 h-3.5 transition-transform group-open/vd:rotate-180" />
      </summary>

      <div className="px-4 pb-4 text-xs space-y-3">
        {spec ? (
          <>
            <dl className="divide-y divide-dark/10 border-y border-dark/10">
              {spec.specs.map(row => (
                <div key={row.label} className="flex justify-between gap-3 py-1.5">
                  <dt className="text-dark/45 shrink-0">{row.label}</dt>
                  <dd className="text-dark/80 text-right">{row.value}</dd>
                </div>
              ))}
            </dl>

            {spec.pros.length > 0 && (
              <ul className="space-y-1">
                {spec.pros.map(p => (
                  <li key={p} className="flex gap-1.5 text-dark/65 leading-snug">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            )}

            {spec.cons.length > 0 && (
              <ul className="space-y-1">
                {spec.cons.map(c => (
                  <li key={c} className="flex gap-1.5 text-dark/50 leading-snug">
                    <Minus className="w-3 h-3 text-dark/35 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <ul className="space-y-1">
            {bike.features.map(f => (
              <li key={f} className="flex gap-1.5 text-dark/65 leading-snug">
                <span className="w-1 h-1 mt-1.5 rounded-full bg-brand shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

/**
 * The vehicles on screen, side by side on the attributes that separate them.
 * Only worth drawing for two or more with a sheet — one column compares with
 * nothing, and vehicles without a sheet would be a column of dashes.
 */
function CompareTable({ bikes }: { bikes: Bike[] }) {
  const withSpec = bikes.filter(b => getSpec(b.id));
  if (withSpec.length < 2) return null;

  return (
    <section className="mt-10 pt-8 border-t border-dark/10">
      <p className="eyebrow text-center">[ Compare ]</p>

      <div className="overflow-x-auto mt-5">
        <table className="w-full min-w-[620px] text-sm border-collapse">
          <thead>
            <tr>
              <td className="w-28" />
              {withSpec.map(b => (
                <th key={b.id} scope="col" className="px-3 pb-3 text-left font-display font-bold align-bottom">
                  {b.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ATTRS.map(attr => (
              <tr key={attr.label} className="border-t border-dark/10">
                <th
                  scope="row"
                  className="py-2.5 pr-4 text-left text-[10px] font-bold uppercase tracking-widest text-dark/40 align-top"
                >
                  {attr.label}
                </th>
                {withSpec.map(b => (
                  <td key={b.id} className="py-2.5 px-3 text-dark/70 align-top leading-snug">
                    {attr.read(getSpec(b.id)) ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StepRide({
  bikes,
  selected,
  onSelect,
  category,
  onClearCategory,
  engineCc,
  onPickCapacity,
}: {
  bikes: Bike[];
  selected: string | null;
  onSelect: (id: string) => void;
  category: string | null;
  onClearCategory: () => void;
  engineCc: number | null;
  onPickCapacity: (cc: number | null) => void;
}) {
  // Arriving from a category card on the fleet page shows just that class;
  // the fleet page no longer lists models, so this is where a visitor meets
  // them. Everything stays reachable via the clear button.
  const shown = category ? bikes.filter(b => b.category === category) : bikes;
  const inCategory = shown.length ? shown : bikes;

  // Scooters are chosen by engine capacity before model — that is how the
  // price list is written (110cc €5, 125cc €6). The chooser appears only when
  // the class actually spans more than one capacity, so it never shows up for
  // cars or the tuk-tuk.
  const capacities = Array.from(
    new Set(inCategory.map(b => b.engineCc).filter((cc): cc is number => typeof cc === 'number')),
  ).sort((a, b) => a - b);
  const showCapacities = capacities.length > 1;

  const visible =
    showCapacities && engineCc ? inCategory.filter(b => b.engineCc === engineCc) : inCategory;

  // The cheapest rate at a given capacity, for the chooser's label.
  const rateAt = (cc: number) =>
    Math.min(...inCategory.filter(b => b.engineCc === cc).map(b => b.pricePerDay));

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Choose your ride</h2>
      <p className="text-dark/50 text-sm">Every bike comes with a helmet and 24/7 roadside support.</p>

      {/* Class and engine size share one strip rather than stacking two
          labelled blocks — it saves a screenful before the cards. */}
      {(showCapacities || (category && shown.length > 0)) && (
        <div className="flex flex-wrap items-center gap-2 mt-4 mb-5">
          {category && shown.length > 0 && (
            <>
              <span className="px-3.5 py-1.5 rounded-full bg-dark text-beige text-[11px] font-bold uppercase tracking-widest">
                {category}
              </span>
              <button
                type="button"
                onClick={onClearCategory}
                className="text-sm text-brand font-medium hover:underline"
              >
                Show all
              </button>
              {showCapacities && <span className="w-px h-5 bg-dark/15 mx-1.5" aria-hidden="true" />}
            </>
          )}

          {capacities.map(cc => (
            <button
              key={cc}
              type="button"
              onClick={() => onPickCapacity(engineCc === cc ? null : cc)}
              aria-pressed={engineCc === cc}
              className={`px-3.5 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all ${
                engineCc === cc
                  ? 'border-brand bg-brand text-beige'
                  : 'border-dark/15 text-dark hover:border-dark/40'
              }`}
            >
              {cc}cc · {formatPrice(rateAt(cc))}
            </button>
          ))}
        </div>
      )}

      {/* Four across from lg: scooters and motorbikes are classes of four, so a
          whole class lands on one row with nothing orphaned, and the
          comparison reads across without scrolling. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visible.map(b => {
          const active = b.id === selected;
          return (
            // A div, not a button: the details disclosure below is interactive
            // and may not be nested inside one.
            <div
              key={b.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all ${
                active ? 'border-brand shadow-md' : 'border-dark/10 hover:border-dark/30'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(b.id)}
                aria-pressed={active}
                className="block w-full text-left"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-beige">
                  <img
                    src={b.image}
                    alt={b.title}
                    loading="lazy"
                    style={{ objectPosition: b.imagePosition ?? 'center' }}
                    className="w-full h-full object-cover"
                  />
                  {active && (
                    <span className="absolute top-3 right-3 w-7 h-7 bg-brand rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </span>
                  )}
                </div>
                <div className="p-4 pb-3">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                    {b.category}
                  </span>
                  <p className="font-display font-bold leading-tight">{b.title}</p>
                  {getSpec(b.id)?.headline && (
                    <p className="text-xs text-dark/45 leading-snug mt-0.5">
                      {getSpec(b.id)?.headline}
                    </p>
                  )}
                </div>
              </button>

              <VehicleDetails bike={b} />
            </div>
          );
        })}
      </div>

      <CompareTable bikes={visible} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — rental dates                                             */
/* ------------------------------------------------------------------ */

interface DateFields {
  pickupDate?: string;
  dropoffDate?: string;
}

function StepDates(props: {
  pickupDate: string;
  dropoffDate: string;
  onChange: (f: DateFields) => void;
}) {
  const { pickupDate, dropoffDate, onChange } = props;
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-1">Rental dates</h2>
      <p className="text-dark/50 text-sm mb-6">Choose when you'll pick up and return the bike.</p>

      <div className="flex items-start gap-3 bg-beige rounded-2xl p-4 mb-6">
        <MapPin className="w-5 h-5 text-brand mt-0.5 shrink-0" />
        <div>
          <p className="font-bold text-sm">Pick up &amp; return — {shopLocation.name}</p>
          <p className="text-dark/50 text-sm">{shopLocation.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <RangeCalendar pickupDate={pickupDate} dropoffDate={dropoffDate} onChange={onChange} />

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <DateReadout label="Pickup" value={pickupDate} placeholder="Pick a date" />
          <DateReadout label="Drop-off" value={dropoffDate} placeholder="Pick a date" />

          {pickupDate && dropoffDate && (
            <p className="col-span-2 lg:col-span-1 text-sm text-dark/60 bg-beige rounded-2xl px-4 py-3">
              {rentalDays(pickupDate, dropoffDate)} day
              {rentalDays(pickupDate, dropoffDate) > 1 ? 's' : ''} — pick up and return at{' '}
              {shopLocation.name}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DateReadout({ label, value, placeholder }: { label: string; value: string; placeholder: string }) {
  return (
    <div className="border border-dark/10 rounded-2xl px-4 py-3 bg-white">
      <p className="text-[10px] font-bold uppercase tracking-widest text-dark/40">{label}</p>
      <p className={`text-sm mt-0.5 ${value ? 'font-medium text-dark' : 'italic text-dark/35'}`}>
        {value ? longDate(value) : placeholder}
      </p>
    </div>
  );
}

/* ---- Calendar ---------------------------------------------------- */

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const longDate = (s: string) => {
  const d = fromISO(s);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
};

/**
 * Six weeks of days for the month, Monday-first, padded with the neighbouring
 * months so every row is full.
 */
function monthGrid(view: Date): Date[] {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  // getDay() is Sunday-first; shift so Monday starts the week.
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - lead);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function RangeCalendar({
  pickupDate,
  dropoffDate,
  onChange,
}: {
  pickupDate: string;
  dropoffDate: string;
  onChange: (f: DateFields) => void;
}) {
  const today = todayISO();
  const [view, setView] = useState(() => {
    const anchor = pickupDate ? fromISO(pickupDate) : fromISO(today);
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  });

  const grid = monthGrid(view);
  const shiftMonth = (by: number) => setView(v => new Date(v.getFullYear(), v.getMonth() + by, 1));
  // Never page back past the current month — those days are all unbookable.
  const atFirstMonth = isoOf(view) <= `${today.slice(0, 7)}-01`;

  function pick(day: string) {
    // First tap sets the start; a second tap after it closes the range.
    // Anything else starts over, so a mis-tap costs one click, not a reset.
    if (!pickupDate || dropoffDate || day < pickupDate) {
      onChange({ pickupDate: day, dropoffDate: '' });
    } else {
      onChange({ dropoffDate: day });
    }
  }

  return (
    <div className="border border-dark/10 rounded-2xl p-4 md:p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={atFirstMonth}
          aria-label="Previous month"
          className="w-9 h-9 grid place-items-center rounded-full hover:bg-beige disabled:opacity-25 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-display font-bold">
          {MONTH_NAMES[view.getMonth()]} {view.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="w-9 h-9 grid place-items-center rounded-full hover:bg-beige transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 border-t border-dark/10 pt-3">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[10px] font-bold uppercase tracking-widest text-dark/35 pb-2">
            {w}
          </div>
        ))}

        {grid.map(day => {
          const key = isoOf(day);
          const outside = day.getMonth() !== view.getMonth();
          const past = key < today;
          const isStart = key === pickupDate;
          const isEnd = key === dropoffDate;
          const between = !!pickupDate && !!dropoffDate && key > pickupDate && key < dropoffDate;
          const edge = isStart || isEnd;

          return (
            <button
              key={key}
              type="button"
              disabled={past}
              onClick={() => pick(key)}
              aria-label={longDate(key)}
              aria-pressed={edge}
              className={`h-10 text-sm transition-colors disabled:pointer-events-none
                ${edge ? 'bg-brand text-beige font-bold' : between ? 'bg-brand/10 text-dark' : 'hover:bg-beige'}
                ${isStart && dropoffDate ? 'rounded-l-full' : ''}
                ${isEnd ? 'rounded-r-full' : ''}
                ${edge && !dropoffDate ? 'rounded-full' : ''}
                ${!edge && !between ? 'rounded-full' : ''}
                ${past ? 'text-dark/20' : outside ? 'text-dark/30' : ''}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-dark/45 mt-3 pt-3 border-t border-dark/10">
        Tap a pickup date, then a drop-off date.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — extras                                                   */
/* ------------------------------------------------------------------ */

function StepExtras({ extras, chosen, onToggle, days }: { extras: Extra[]; chosen: string[]; onToggle: (id: string) => void; days: number }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-1">Add some extras</h2>
      <p className="text-dark/50 text-sm mb-6">Optional — make your trip smoother.</p>
      <div className="space-y-3">
        {extras.map(ex => {
          const active = chosen.includes(ex.id);
          const total = ex.perDay ? ex.price * days : ex.price;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onToggle(ex.id)}
              className={`w-full flex items-center gap-4 text-left rounded-2xl border-2 p-4 transition-all ${
                active ? 'border-brand bg-brand/5' : 'border-dark/10 hover:border-dark/30'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                  active ? 'bg-brand border-brand' : 'border-dark/25'
                }`}
              >
                {active && <Check className="w-4 h-4 text-white" />}
              </span>
              <div className="flex-1">
                <p className="font-bold">{ex.label}</p>
                <p className="text-dark/50 text-sm">{ex.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-brand">{formatPrice(total)}</p>
                <p className="text-dark/40 text-[10px] uppercase tracking-wide">{ex.perDay ? 'for trip' : 'flat'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — renter details                                          */
/* ------------------------------------------------------------------ */

function StepDetails({ renter, onChange }: { renter: Renter; onChange: (r: Renter) => void }) {
  const set = (k: keyof Renter) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...renter, [k]: e.target.value });
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-1">Your details</h2>
      <p className="text-dark/50 text-sm mb-6">We only use these to confirm your booking.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First name">
          <input type="text" required value={renter.firstName} onChange={set('firstName')} placeholder="Sarah" className="booking-input" />
        </Field>
        <Field label="Last name">
          <input type="text" required value={renter.lastName} onChange={set('lastName')} placeholder="Johnson" className="booking-input" />
        </Field>
        <Field label="Email">
          <input type="email" required value={renter.email} onChange={set('email')} placeholder="sarah@email.com" className="booking-input" />
        </Field>
        <Field label="Phone">
          <input type="tel" required value={renter.phone} onChange={set('phone')} placeholder="+94 77 123 4567" className="booking-input" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Driving licence no. (optional)">
            <input type="text" value={renter.license} onChange={set('license')} placeholder="B1234567" className="booking-input" />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small shared UI                                                   */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-dark/40">{label}</span>
      {children}
    </label>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-brand mt-1 shrink-0" />
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-dark/40">{label}</p>
        <p className="font-medium text-sm">{value}</p>
      </div>
    </div>
  );
}
