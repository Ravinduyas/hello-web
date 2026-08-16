import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  MapPin,
  Bike as BikeIcon,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { bikes as defaultBikes, extras as defaultExtras, formatPrice, shopLocation, type Bike, type Extra } from '../data/fleet';
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

const todayISO = () => new Date().toISOString().split('T')[0];

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
    <div className="bg-beige min-h-screen pt-28 md:pt-36 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <span className="eyebrow">[ Book your ride ]</span>
          <h1 className="display-xl text-4xl md:text-6xl mt-3">Reserve in a few taps</h1>
        </header>

        {/* Step indicator */}
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-10">
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* ---- Step content ---- */}
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
                    onClearCategory={() => setCategory(null)}
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

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark/10">
              <button
                type="button"
                onClick={back}
                disabled={step === 0 || submitting}
                className="btn-outline disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
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

          {/* ---- Live summary ---- */}
          <aside className="bg-dark text-beige rounded-3xl p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand" /> Booking summary
            </h2>

            {bike ? (
              <div className="flex gap-4 mb-5">
                <img src={bike.image} alt={bike.title} className="w-20 h-16 object-cover rounded-xl" />
                <div>
                  <p className="font-bold leading-tight">{bike.title}</p>
                  <p className="text-beige/50 text-sm">{bike.category} · {formatPrice(bike.pricePerDay)}/day</p>
                </div>
              </div>
            ) : (
              <p className="text-beige/50 text-sm mb-5">No ride selected yet.</p>
            )}

            <div className="space-y-2 text-sm border-t border-beige/15 pt-5">
              {summary.lines.length === 0 && <p className="text-beige/40">Pick your dates to see pricing.</p>}
              {summary.lines.map(line => (
                <div key={line.label} className="flex justify-between gap-4">
                  <span className="text-beige/70">{line.label}</span>
                  <span className="font-medium tabular-nums">{formatPrice(line.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between border-t border-beige/15 mt-5 pt-5">
              <span className="font-bold">Total</span>
              <span className="font-display text-3xl font-black text-brand tabular-nums">{formatPrice(summary.total)}</span>
            </div>
            <p className="text-beige/40 text-xs mt-3">Pay at pickup. Free cancellation up to 24h before.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — choose a ride                                            */
/* ------------------------------------------------------------------ */

function StepRide({
  bikes,
  selected,
  onSelect,
  category,
  onClearCategory,
}: {
  bikes: Bike[];
  selected: string | null;
  onSelect: (id: string) => void;
  category: string | null;
  onClearCategory: () => void;
}) {
  // Arriving from a category card on the fleet page shows just that class;
  // the fleet page no longer lists models, so this is where a visitor meets
  // them. Everything stays reachable via the clear button.
  const shown = category ? bikes.filter(b => b.category === category) : bikes;
  const visible = shown.length ? shown : bikes;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-1">Choose your ride</h2>
      <p className="text-dark/50 text-sm mb-6">Every bike comes with a helmet and 24/7 roadside support.</p>

      {category && shown.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="px-4 py-1.5 rounded-full bg-dark text-beige text-xs font-bold uppercase tracking-widest">
            {category}
          </span>
          <button
            type="button"
            onClick={onClearCategory}
            className="text-sm text-brand font-medium hover:underline"
          >
            Show every vehicle
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map(b => {
          const active = b.id === selected;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onSelect(b.id)}
              className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
                active ? 'border-brand shadow-md' : 'border-dark/10 hover:border-dark/30'
              }`}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={b.image} alt={b.title} loading="lazy" className="w-full h-full object-cover" />
                {active && (
                  <span className="absolute top-3 right-3 w-7 h-7 bg-brand rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </span>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{b.category}</span>
                  <p className="font-display font-bold">{b.title}</p>
                </div>
                <span className="font-display text-lg font-black text-brand">{formatPrice(b.pricePerDay)}</span>
              </div>
            </button>
          );
        })}
      </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Pickup date">
          <input
            type="date"
            min={todayISO()}
            value={pickupDate}
            onChange={e => onChange({ pickupDate: e.target.value })}
            className="booking-input"
          />
        </Field>
        <Field label="Drop-off date">
          <input
            type="date"
            min={pickupDate || todayISO()}
            value={dropoffDate}
            onChange={e => onChange({ dropoffDate: e.target.value })}
            className="booking-input"
          />
        </Field>
      </div>
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
