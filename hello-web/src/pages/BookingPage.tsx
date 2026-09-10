import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  MapPin,
  Bike as BikeIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { bikes as defaultBikes, extras as defaultExtras, formatPrice, priceLabel, shopLocation, summariseCategories, type Bike, type Extra } from '../data/fleet';
import { getSpec, type VehicleSpec } from '../data/specs';
import { asset } from '../lib/asset';
import { ClassCardButton } from '../components/ClassCard';
import { createBooking, fetchExtras, fetchBikes } from '../lib/api';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * One vehicle in a booking, with the dates that vehicle is wanted for.
 *
 * The dates sit on the vehicle rather than on the booking because a group
 * rarely wants everything for the same days — a scooter for the week and a
 * tuk-tuk for the day out is the ordinary case, not the awkward one.
 */
interface CartItem {
  bikeId: string;
  pickupDate: string;
  dropoffDate: string;
}

const emptyItem = (bikeId: string): CartItem => ({ bikeId, pickupDate: '', dropoffDate: '' });

/** A cart item resolved against the fleet: the vehicle, and how long for. */
type BookingItem = CartItem & { bike: Bike; days: number };

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

const STEPS = ['Vehicle type', 'Your ride', 'Rental dates', 'Extras', 'Your details'] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BookingPage() {
  const [params] = useSearchParams();
  const location = useLocation();

  const [step, setStep] = useState(0);
  // Arriving with ?bike= starts the cart with that vehicle already in it.
  const [cart, setCart] = useState<CartItem[]>(() => {
    const seed = params.get('bike');
    return seed ? [emptyItem(seed)] : [];
  });
  // Set when the visitor arrives from a category card rather than a vehicle.
  const [category, setCategory] = useState<string | null>(params.get('category'));
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
  const [references, setReferences] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /** The cart against the live fleet, dropping anything no longer offered. */
  const items = useMemo(
    () =>
      cart.flatMap(item => {
        const bike = bikes.find(b => b.id === item.bikeId);
        return bike ? [{ ...item, bike, days: rentalDays(item.pickupDate, item.dropoffDate) }] : [];
      }),
    [cart, bikes],
  );

  /**
   * The booking end to end: the first pickup to the last return.
   *
   * Per-day extras are charged over this rather than once per vehicle. A phone
   * mount is hired for the trip, not for each machine, and it is held from the
   * day the first vehicle is collected to the day the last one comes back.
   */
  const dated = items.filter(i => i.days > 0);
  const spanDays = dated.length
    ? rentalDays(
        dated.map(i => i.pickupDate).sort()[0],
        dated.map(i => i.dropoffDate).sort()[dated.length - 1],
      )
    : 0;

  /* ---- Arriving at the page ---------------------------------------
   *
   * A booking in progress survives leaving and coming back: "Book now" on its
   * own resumes it. Arriving with an explicit class or vehicle is a choice,
   * though, so that applies and returns to the first step — otherwise picking
   * Motorbikes on the fleet page would leave Scooters selected, since this
   * component stays mounted and only seeds from the query string once.
   */
  const paramCategory = params.get('category');
  const paramBike = params.get('bike');

  useEffect(() => {
    if (!paramCategory && !paramBike) return;
    if (paramCategory) {
      setCategory(paramCategory);
    }
    // Arriving with an explicit vehicle replaces the cart: the link is a
    // fresh intent, not an addition to whatever was left half-chosen.
    setCart(paramBike ? [emptyItem(paramBike)] : []);
    // The class screen is already answered by the link, so land on the ride.
    setStep(1);
  }, [paramCategory, paramBike]);

  // A finished booking is not something to resume — returning starts a new one,
  // keeping only the renter's own details so they need not retype them.
  useEffect(() => {
    if (!confirmed) return;
    setConfirmed(false);
    setReferences([]);
    setStep(0);
    setCart(paramBike ? [emptyItem(paramBike)] : []);
    setCategory(paramCategory);
    setChosenExtras([]);
    setError('');
    // location.key changes on every navigation, including to the same URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Load the live fleet & extras once on mount; keep defaults on failure.
  useEffect(() => {
    let active = true;
    fetchBikes()
      .then(list => {
        if (active && list) setBikes(list);
      })
      .catch(() => {});
    fetchExtras()
      .then(list => {
        if (active && list) setExtras(list);
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
    for (const item of items) {
      if (item.days < 1) continue;
      lines.push({
        label: `${item.bike.title} · ${item.days} day${item.days > 1 ? 's' : ''}`,
        amount: item.bike.pricePerDay * item.days,
      });
    }
    const chargeDays = Math.max(spanDays, 1);
    for (const ex of extras) {
      if (!chosenExtras.includes(ex.id)) continue;
      const amount = ex.perDay ? ex.price * chargeDays : ex.price;
      lines.push({ label: ex.perDay ? `${ex.label} (×${chargeDays})` : ex.label, amount });
    }
    const total = lines.reduce((sum, l) => sum + l.amount, 0);
    return { lines, total };
  }, [items, spanDays, chosenExtras, extras]);

  /* ---- Per-step validation --------------------------------------- */
  const stepValid = [
    !!category,
    items.length > 0,
    items.length > 0 && items.every(i => i.days > 0),
    true, // extras are optional
    !!renter.firstName && !!renter.lastName && /\S+@\S+\.\S+/.test(renter.email) && !!renter.phone,
  ];

  /** Add a vehicle to the booking, or take it back out. */
  function toggleVehicle(id: string) {
    setCart(prev =>
      prev.some(i => i.bikeId === id) ? prev.filter(i => i.bikeId !== id) : [...prev, emptyItem(id)],
    );
  }

  function setItemDates(bikeId: string, fields: DateFields) {
    setCart(prev =>
      prev.map(item => {
        if (item.bikeId !== bikeId) return item;
        const next = { ...item };
        if (fields.pickupDate !== undefined) {
          next.pickupDate = fields.pickupDate;
          // keep drop-off on or after pickup
          if (next.dropoffDate && fields.pickupDate > next.dropoffDate) next.dropoffDate = fields.pickupDate;
        }
        if (fields.dropoffDate !== undefined) next.dropoffDate = fields.dropoffDate;
        return next;
      }),
    );
  }

  function toggleExtra(id: string) {
    setChosenExtras(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  /**
   * One booking per vehicle.
   *
   * The shop assigns a physical machine and a number plate to a booking, so a
   * row per vehicle is what lets it do that, and what puts each vehicle on its
   * own line of the timeline. The extras ride on the first row only — charging
   * them on every row would bill one phone mount once per scooter.
   */
  async function submitBooking() {
    if (!items.length) return;
    setSubmitting(true);
    setError('');

    const extraLines = extras
      .filter(ex => chosenExtras.includes(ex.id))
      .map(ex => ({
        id: ex.id,
        label: ex.label,
        amount: ex.perDay ? ex.price * Math.max(spanDays, 1) : ex.price,
      }));
    const extrasTotal = extraLines.reduce((sum, line) => sum + line.amount, 0);
    const booked: string[] = [];

    try {
      for (const [i, item] of items.entries()) {
        const { reference } = await createBooking({
          bikeId: item.bike.id,
          bikeTitle: item.bike.title,
          pickupLocation: shopLocation.name,
          dropoffLocation: shopLocation.name,
          pickupDate: item.pickupDate,
          dropoffDate: item.dropoffDate,
          days: item.days,
          extras: i === 0 ? extraLines : [],
          total: item.bike.pricePerDay * item.days + (i === 0 ? extrasTotal : 0),
          renter,
        });
        booked.push(reference);
      }
      setReferences(booked);
      setConfirmed(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      /*
       * A vehicle already booked stays booked. Saying so is the difference
       * between a customer ringing the shop about the one that failed and a
       * customer pressing Confirm again, taking the first scooter twice.
       */
      setError(
        booked.length
          ? `${message} — but ${booked.length} of ${items.length} vehicles are already reserved (${booked.join(', ')}). Please call us to add the rest rather than booking again.`
          : message,
      );
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
      <div className="bg-beige min-h-screen pt-10 md:pt-16 pb-24 px-6">
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

          {/* One block per vehicle: each is its own reservation at the shop,
              with its own reference to quote and its own dates. */}
          <div className="bg-beige rounded-2xl p-6 text-left mb-8">
            {items.map((item, i) => (
              <div key={item.bikeId} className={`space-y-3 ${i > 0 ? 'border-t border-dark/10 mt-4 pt-4' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-dark/40">Reference</span>
                  <span className="font-display font-bold tracking-wide">{references[i] ?? '—'}</span>
                </div>
                <Row icon={BikeIcon} label="Ride" value={item.bike.title} />
                <Row
                  icon={Calendar}
                  label="Dates"
                  value={`${item.pickupDate} → ${item.dropoffDate} (${item.days} day${item.days > 1 ? 's' : ''})`}
                />
              </div>
            ))}

            <div className="space-y-3 border-t border-dark/10 mt-4 pt-4">
              <Row icon={MapPin} label="Pickup & return" value={shopLocation.address} />
              <div className="flex items-center justify-between">
                <span className="font-bold">Total</span>
                <span className="font-display text-2xl font-black text-brand">{formatPrice(summary.total)}</span>
              </div>
              <p className="text-xs text-dark/40">Pay at pickup — no card needed to reserve.</p>
            </div>
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
    // No navbar on this route, so no clearance to leave for one. The bottom
    // padding clears the standing summary bar instead, which is fixed.
    <div className="bg-beige min-h-screen pt-8 md:pt-10 pb-36 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-5 flex items-start justify-between gap-6">
          <div>
            <span className="eyebrow">[ Book your ride ]</span>
            <h1 className="display-xl text-3xl md:text-4xl mt-2">Reserve in a few taps</h1>
          </div>

          {/* The logo stands in for the navbar that this route hides — a
              customer mid-booking should still see whose site they are on.
              mix-blend-multiply drops the mark's white backing into the beige;
              the file is a JPEG and has no transparency of its own. */}
          <img
            src={asset('/brand/logo.jpg')}
            alt="Hello Rent"
            className="hidden sm:block w-24 md:w-32 shrink-0 mix-blend-multiply"
          />
        </header>

        {/* Step indicator */}
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex items-center gap-2 min-h-11 sm:min-h-0 text-sm font-bold uppercase tracking-wide transition-colors ${
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
                  <StepClass
                    bikes={bikes}
                    selected={category}
                    onPick={c => {
                      setCategory(c);
                      // The cart survives the change. Coming back here and
                      // picking another class is how a second vehicle is
                      // added, so clearing it would undo the booking.
                      setStep(1);
                    }}
                  />
                )}

                {step === 1 && (
                  <StepRide
                    bikes={bikes}
                    chosen={cart.map(i => i.bikeId)}
                    onToggle={toggleVehicle}
                    category={category}
                  />
                )}

                {step === 2 && (
                  <StepDates items={items} onChange={setItemDates} />
                )}

                {step === 3 && (
                  <StepExtras
                    extras={extras}
                    chosen={chosenExtras}
                    onToggle={toggleExtra}
                    days={Math.max(spanDays, 1)}
                  />
                )}

                {step === 4 && <StepDetails renter={renter} onChange={r => setRenter(r)} />}
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="mt-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

          </div>

        </div>
      </div>

      <BookingBar
        items={items}
        extrasCount={chosenExtras.length}
        total={summary.total}
        canGoBack={step > 0 && !submitting}
        canContinue={stepValid[step] && !submitting}
        isLastStep={step === STEPS.length - 1}
        submitting={submitting}
        onBack={back}
        onNext={next}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — choose a class                                           */
/* ------------------------------------------------------------------ */

/**
 * The four vehicle types, as its own screen.
 *
 * Class and vehicle used to share one step, swapping the panel once a class was
 * picked — so the progress rail said "Your ride" through both and Back could
 * not return to the classes. They are now two steps, which is what they always
 * were to the person filling the form in.
 */
function StepClass({
  bikes,
  selected,
  onPick,
}: {
  bikes: Bike[];
  selected: string | null;
  onPick: (category: string) => void;
}) {
  const summaries = summariseCategories(bikes);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">What would you like to ride?</h2>
      <p className="text-dark/50 text-sm">Pick a class, then the vehicle. Every one comes with a helmet.</p>

      {/* The same four columns the fleet page uses, so a visitor who browsed
          the fleet meets the classes laid out exactly as they left them. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mt-5">
        {summaries.map(cat => (
          <ClassCardButton
            key={cat.category}
            summary={cat}
            selected={selected === cat.category}
            onPick={() => onPick(cat.category)}
          />
        ))}
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  Step 2 — choose a ride                                            */
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

/** One vehicle, as a single photograph of it. */
function RideCard({ bike, active, onSelect }: { bike: Bike; active: boolean; onSelect: () => void }) {
  return (
    <div
      className={`h-full rounded-2xl border-2 overflow-hidden transition-all ${
        active ? 'border-brand shadow-md' : 'border-dark/10 hover:border-dark/30'
      }`}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-beige">
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={active}
          aria-label={`Choose the ${bike.title}`}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={bike.image}
            alt={bike.title}
            loading="lazy"
            style={{ objectPosition: bike.imagePosition ?? 'center' }}
            className="w-full h-full object-cover"
          />
        </button>

        {active && (
          <span className="absolute top-3 right-3 w-7 h-7 bg-brand rounded-full flex items-center justify-center pointer-events-none">
            <Check className="w-4 h-4 text-white" />
          </span>
        )}
      </div>

      <button type="button" onClick={onSelect} className="block w-full text-left p-4 pb-3">
        <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
          {bike.bodyType ?? bike.category}
        </span>
        <p className="font-display font-bold leading-tight">{bike.title}</p>
        {getSpec(bike.id)?.headline && (
          <p className="text-xs text-dark/45 leading-snug mt-0.5">{getSpec(bike.id)?.headline}</p>
        )}
      </button>
    </div>
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

/**
 * How wide a capacity's enclosure is, and how many columns of cards it holds.
 *
 * Written out rather than composed, because Tailwind finds class names by
 * reading the source: a string built at runtime never reaches the stylesheet.
 */
const BAND_SPAN: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
};

const BAND_COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

function StepRide({
  bikes,
  chosen,
  onToggle,
  category,
}: {
  bikes: Bike[];
  chosen: string[];
  onToggle: (id: string) => void;
  category: string | null;
}) {
  // Arriving from a category card on the fleet page shows just that class;
  // the fleet page no longer lists models, so this is where a visitor meets
  // them. Everything stays reachable via the clear button.
  const shown = category ? bikes.filter(b => b.category === category) : bikes;
  const inCategory = shown.length ? shown : bikes;


  // Scooters come in two engine capacities, and that is how the price list is
  // written (110cc €5, 125cc €6), so the cards are grouped and headed by
  // capacity. Only when the class actually spans more than one, so it never
  // applies to cars or the tuk-tuk.
  const capacities = Array.from(
    new Set(inCategory.map(b => b.engineCc).filter((cc): cc is number => typeof cc === 'number')),
  ).sort((a, b) => a - b);
  const showCapacities = capacities.length > 1;

  // The cheapest rate at a given capacity, for the band heading.
  const rateAt = (cc: number) =>
    Math.min(...inCategory.filter(b => b.engineCc === cc).map(b => b.pricePerDay));

  const visible = inCategory
    .slice()
    // Smallest engine first, so the row reads 110cc then 125cc and the two
    // groups below are contiguous rather than interleaved.
    .sort((a, b) => (a.engineCc ?? 0) - (b.engineCc ?? 0));

  /**
   * The row split by engine size — 110cc on the left, 125cc on the right.
   *
   * Each capacity is drawn as an enclosure with its rate cut into the top
   * edge, so a card belongs to a price by sitting inside it rather than by
   * sitting under a heading that a wrapped row could separate it from.
   *
   * The enclosures share the four columns the cards would have had, each
   * spanning as many as its capacity has vehicles — so the lone 125cc card
   * stays a quarter of the row instead of swelling to match the three beside it.
   */
  const capacityBands = showCapacities
    ? capacities.map(cc => ({ cc, vehicles: visible.filter(b => b.engineCc === cc) }))
    : [];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Choose your ride</h2>
      <p className="text-dark/50 text-sm">
        Take as many as you need — every bike comes with a helmet and 24/7 roadside support.
      </p>

      {/* What is in the booking so far, including vehicles from classes this
          screen is not showing. Without it, going back for a tuk-tuk would
          make the scooter you already chose look like it had been dropped. */}
      {chosen.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-dark/40">In this booking</span>
          {chosen.map(id => {
            const picked = bikes.find(b => b.id === id);
            return picked ? (
              <button
                key={id}
                type="button"
                onClick={() => onToggle(id)}
                aria-label={`Remove ${picked.title} from this booking`}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-dark text-beige text-xs font-bold hover:bg-dark/80 transition-colors"
              >
                {picked.title}
                <X className="w-3 h-3" />
              </button>
            ) : null;
          })}
        </div>
      )}

      <p className="text-dark/40 text-xs mt-3">
        Want a vehicle from another class too? Go back a step and pick it — this list is kept.
      </p>

      {/* Which class is being shown, as a label. Changing it is the Back
          button's job, and the step rail's — a third way to do it, sitting in
          the same strip, was one too many. Engine size is not a filter either:
          it is a heading over the very cards it describes, below. */}
      {category && shown.length > 0 && (
        <div className="mt-4 mb-5">
          <span className="px-3.5 py-1.5 rounded-full bg-dark text-beige text-[11px] font-bold uppercase tracking-widest">
            {category}
          </span>
        </div>
      )}

      {/* A class priced by engine size is drawn as one enclosure per capacity,
          the rate sitting in the top edge. Below lg the enclosures stack and
          each keeps its own label, which is where the old headings-over-columns
          arrangement gave up and hid itself.

          A class with a single rate needs no enclosure — it would be a box
          drawn around everything, saying only what the class chip already
          says. */}
      {capacityBands.length > 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {capacityBands.map(band => (
            <fieldset
              key={band.cc}
              className={`${BAND_SPAN[band.vehicles.length] ?? 'lg:col-span-1'} rounded-2xl border border-dark/20 px-2 pt-1 pb-2`}
            >
              <legend className="px-2 text-[11px] font-bold uppercase tracking-widest text-brand">
                {band.cc}cc
                <span className="text-dark/30"> · </span>
                <span className="text-dark/70">{formatPrice(rateAt(band.cc))} / day</span>
              </legend>

              <div className={`grid grid-cols-1 sm:grid-cols-2 ${BAND_COLS[band.vehicles.length] ?? 'lg:grid-cols-1'} gap-4`}>
                {band.vehicles.map(b => (
                  <RideCard key={b.id} bike={b} active={chosen.includes(b.id)} onSelect={() => onToggle(b.id)} />
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      ) : (
        /* Four across from lg: scooters and motorbikes are classes of four, so
           a whole class lands on one row with nothing orphaned, and the
           comparison reads across without scrolling. */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map(b => (
            <RideCard key={b.id} bike={b} active={chosen.includes(b.id)} onSelect={() => onToggle(b.id)} />
          ))}
        </div>
      )}

      <CompareTable bikes={visible} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — rental dates                                             */
/* ------------------------------------------------------------------ */

interface DateFields {
  pickupDate?: string;
  dropoffDate?: string;
}

/**
 * When each vehicle is wanted.
 *
 * One calendar per vehicle rather than one for the booking: the scooter is
 * often taken for the week and the tuk-tuk for a single day out, and a shared
 * range would either overcharge for the tuk-tuk or hold the scooter too briefly.
 * A booking of one vehicle reads exactly as it did before — the vehicle's name
 * only appears once there is another one to tell it apart from.
 */
function StepDates({
  items,
  onChange,
}: {
  items: BookingItem[];
  onChange: (bikeId: string, fields: DateFields) => void;
}) {
  const many = items.length > 1;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-1">Rental dates</h2>
      <p className="text-dark/50 text-sm mb-6">
        {many
          ? 'Each vehicle has its own dates — take the scooter for the week and the tuk-tuk for a day if you like.'
          : "Choose when you'll pick up and return the bike."}
      </p>

      <div className="flex items-start gap-3 bg-beige rounded-2xl p-4 mb-6">
        <MapPin className="w-5 h-5 text-brand mt-0.5 shrink-0" />
        <div>
          <p className="font-bold text-sm">Pick up &amp; return — {shopLocation.name}</p>
          <p className="text-dark/50 text-sm">{shopLocation.address}</p>
        </div>
      </div>

      <div className="space-y-8">
        {items.map((item, i) => (
          <div key={item.bikeId} className={i > 0 ? 'border-t border-dark/10 pt-8' : ''}>
            {many && (
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={item.bike.image}
                  alt=""
                  style={{ objectPosition: item.bike.imagePosition ?? 'center' }}
                  className="w-14 h-11 object-cover rounded-lg shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-sm leading-tight truncate">{item.bike.title}</p>
                  <p className="text-dark/45 text-xs">{formatPrice(item.bike.pricePerDay)} / day</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
              <RangeCalendar
                pickupDate={item.pickupDate}
                dropoffDate={item.dropoffDate}
                onChange={fields => onChange(item.bikeId, fields)}
              />

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                <DateReadout label="Pickup" value={item.pickupDate} placeholder="Pick a date" />
                <DateReadout label="Drop-off" value={item.dropoffDate} placeholder="Pick a date" />

                {item.days > 0 && (
                  <p className="col-span-2 lg:col-span-1 text-sm text-dark/60 bg-beige rounded-2xl px-4 py-3">
                    {item.days} day{item.days > 1 ? 's' : ''} — pick up and return at {shopLocation.name}.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
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
/*  Step 4 — extras                                                   */
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
              {/* A free extra says so and drops the per-trip/flat qualifier —
                  "FREE / FOR TRIP" invites the question of what it would
                  otherwise have cost. */}
              <div className="text-right shrink-0">
                <p className="font-display font-bold text-brand">{priceLabel(total)}</p>
                {total > 0 && (
                  <p className="text-dark/40 text-[10px] uppercase tracking-wide">
                    {ex.perDay ? 'for trip' : 'flat'}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 5 — renter details                                          */
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
          {/* Deliberately not a Sri Lankan number: this asks for the renter's
              own, and the old example was the shop's placeholder number. */}
          <input type="tel" required value={renter.phone} onChange={set('phone')} placeholder="e.g. +44 7700 900123" className="booking-input" />
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


/* ------------------------------------------------------------------ */
/*  Standing action bar                                               */
/* ------------------------------------------------------------------ */

/**
 * The foot of the booking: what has been chosen, what it comes to, and the
 * controls that move through it.
 *
 * This is the old sidebar panel's job done in a strip rather than a column,
 * and it holds Back and Continue so the way forward is always on screen —
 * previously they sat at the end of the step content, which on the details
 * step meant scrolling past a form to reach them.
 */
function BookingBar({
  items,
  extrasCount,
  total,
  canGoBack,
  canContinue,
  isLastStep,
  submitting,
  onBack,
  onNext,
}: {
  items: BookingItem[];
  extrasCount: number;
  total: number;
  canGoBack: boolean;
  canContinue: boolean;
  isLastStep: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const lead = items[0];
  // The span the booking covers, and the days actually being charged for —
  // which are not the same number once two vehicles are out for different
  // stretches, so both are worth saying.
  const dated = items.filter(i => i.days > 0);
  const firstPickup = dated.map(i => i.pickupDate).sort()[0];
  const lastReturn = dated.map(i => i.dropoffDate).sort()[dated.length - 1];
  const chargedDays = dated.reduce((sum, i) => sum + i.days, 0);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-dark text-beige border-t border-beige/10 shadow-[0_-10px_30px_rgba(0,0,0,0.18)]">
      {/* One row that never wraps: summary on the left, giving up width by
          truncating, and the controls on the right at their natural size.
          The height is set by the summary rather than by the buttons — a bar
          the height of a button reads as a toolbar stuck to the page, not as
          the running account of the booking that it is. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-7 min-w-0 min-h-[48px]">
          {lead ? (
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <img
                src={lead.bike.image}
                alt=""
                style={{ objectPosition: lead.bike.imagePosition ?? 'center' }}
                className="hidden sm:block w-24 h-16 object-cover rounded-xl shrink-0"
              />
              <div className="min-w-0">
                {/* One vehicle names itself; several are counted and then
                    listed, because a truncated list of four titles tells you
                    nothing about how many you have chosen. */}
                <p className="font-bold text-sm sm:text-base leading-tight truncate">
                  {items.length === 1 ? lead.bike.title : `${items.length} vehicles`}
                </p>
                <p className="text-beige/45 text-xs sm:text-[13px] truncate mt-0.5">
                  {items.length === 1
                    ? `${lead.bike.bodyType ?? lead.bike.category} · ${formatPrice(lead.bike.pricePerDay)}/day`
                    : items.map(i => i.bike.title).join(', ')}
                </p>
              </div>
            </div>
          ) : (
            /* Empty until something is chosen. The row carries a minimum
               height so the bar does not grow the moment a vehicle lands in
               it: a bar that changes height under you as you move through the
               steps is the thing that reads as unfinished. */
            <p className="text-beige/35 text-sm">Nothing chosen yet</p>
          )}

          {/* Dates and extras earn their room from lg; below that the controls
              have first claim on the width. */}
          {(dated.length > 0 || extrasCount > 0) && (
            <div className="hidden lg:flex flex-col gap-1 text-xs text-beige/55 shrink-0 border-l border-beige/10 pl-7">
              {dated.length > 0 && (
                <span className="whitespace-nowrap">
                  {longDate(firstPickup)} → {longDate(lastReturn)} · {chargedDays} rental day
                  {chargedDays > 1 ? 's' : ''}
                </span>
              )}
              {extrasCount > 0 && (
                <span className="whitespace-nowrap">
                  {extrasCount} extra{extrasCount > 1 ? 's' : ''} added
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* No point announcing a total of nothing on the first step. */}
          {total > 0 && (
            <div className="text-right leading-none sm:border-r sm:border-beige/10 sm:pr-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-beige/40">Total</p>
              <p className="font-display text-2xl sm:text-3xl font-black text-brand tabular-nums mt-1.5">
                {formatPrice(total)}
              </p>
            </div>
          )}

          {/* The label goes before the button does — an arrow alone still reads
              as "back" once Continue sits beside it. */}
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Back"
            className="btn-ghost px-4 sm:px-5 disabled:opacity-25 disabled:pointer-events-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue}
            className="btn-primary whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none"
          >
            {submitting ? 'Booking…' : isLastStep ? 'Confirm booking' : 'Continue'}
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
