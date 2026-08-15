import { useEffect, useMemo, useState, useCallback } from 'react';
import { Check, Bike as BikeIcon, Calendar, Store, RefreshCw, ArrowRight } from 'lucide-react';
import {
  fetchBikes,
  fetchUnits,
  fetchExtras,
  createWalkInBooking,
  UnauthorizedError,
  type Bike,
  type Unit,
  type Extra,
  type Booking,
} from '../lib/api';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const todayISO = () => new Date().toISOString().split('T')[0];

/** Whole rental days between two ISO dates (min 1 once both are set). */
function rentalDays(pickup: string, dropoff: string): number {
  if (!pickup || !dropoff) return 0;
  const start = new Date(pickup).getTime();
  const end = new Date(dropoff).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.max(1, Math.round((end - start) / MS_PER_DAY));
}

const EMPTY_CUSTOMER = { firstName: '', lastName: '', phone: '', email: '' };

export default function WalkIn({ onLogout }: { onLogout: () => void }) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bikeId, setBikeId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [pickupDate, setPickupDate] = useState(todayISO());
  const [dropoffDate, setDropoffDate] = useState(todayISO()); // defaults to the pickup date
  const [chosen, setChosen] = useState<string[]>([]);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [deposit, setDeposit] = useState('');
  const [paidNow, setPaidNow] = useState('');

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  const fail = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : fallback);
    },
    [onLogout],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [b, u, e] = await Promise.all([fetchBikes(), fetchUnits(), fetchExtras()]);
      setBikes(b.filter(x => x.active));
      setUnits(u);
      setExtras(e.filter(x => x.active));
    } catch (err) {
      fail(err, 'Failed to load shop data');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  const bike = bikes.find(b => b.id === bikeId);
  const plates = units.filter(u => u.bikeId === bikeId && u.status === 'available');
  const days = rentalDays(pickupDate, dropoffDate);

  // Reset the plate whenever the model changes (a plate belongs to one model).
  useEffect(() => setUnitId(''), [bikeId]);

  const summary = useMemo(() => {
    const lines: { label: string; amount: number }[] = [];
    if (bike && days > 0) {
      lines.push({ label: `${bike.title} · ${days} day${days > 1 ? 's' : ''}`, amount: bike.pricePerDay * days });
    }
    for (const ex of extras) {
      if (!chosen.includes(ex.id)) continue;
      const amount = ex.perDay ? ex.price * Math.max(days, 1) : ex.price;
      lines.push({ label: ex.perDay ? `${ex.label} (×${Math.max(days, 1)})` : ex.label, amount });
    }
    return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
  }, [bike, days, chosen, extras]);

  const valid = !!bike && !!unitId && days > 0 && !!customer.firstName.trim() && !!customer.phone.trim();

  function toggleExtra(id: string) {
    setChosen(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  function resetForm() {
    setDone(null);
    setBikeId('');
    setUnitId('');
    setPickupDate(todayISO());
    setDropoffDate(todayISO());
    setChosen([]);
    setCustomer(EMPTY_CUSTOMER);
    setDeposit('');
    setPaidNow('');
  }

  async function submit() {
    if (!bike || !valid) return;
    setBusy(true);
    setError('');
    try {
      const created = await createWalkInBooking({
        bikeId: bike.id,
        unitId,
        pickupDate,
        dropoffDate,
        days,
        extras: extras
          .filter(ex => chosen.includes(ex.id))
          .map(ex => ({ id: ex.id, label: ex.label, amount: ex.perDay ? ex.price * days : ex.price })),
        total: summary.total,
        deposit: Number(deposit) || 0,
        paidNow: Number(paidNow) || 0,
        renter: { firstName: customer.firstName.trim(), lastName: customer.lastName.trim(), email: customer.email.trim(), phone: customer.phone.trim() },
      });
      setDone(created);
      setUnits(await fetchUnits()); // the plate is now rented
    } catch (err) {
      fail(err, 'Could not create the rental');
    } finally {
      setBusy(false);
    }
  }

  /* ---- Success screen ------------------------------------------------ */
  if (done) {
    return (
      <div>
        <Header />
        <div className="bg-white rounded-3xl p-8 md:p-10 max-w-2xl">
          <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mb-5">
            <Check className="w-7 h-7 text-brand" />
          </div>
          <span className="eyebrow">[ Rental created ]</span>
          <h2 className="display-xl text-3xl md:text-4xl mt-2 mb-6">{done.renter.firstName} is on the road</h2>
          <div className="bg-beige rounded-2xl p-6 space-y-3">
            <SummaryRow icon={BikeIcon} label="Bike" value={`${done.bikeTitle} · Plate ${done.plate}`} />
            <SummaryRow icon={Calendar} label="Dates" value={`${done.pickupDate} → ${done.dropoffDate} (${done.days} day${done.days > 1 ? 's' : ''})`} />
            <SummaryRow icon={Store} label="Customer" value={`${done.renter.firstName} ${done.renter.lastName}`.trim() + ` · ${done.renter.phone}`} />
            <div className="flex items-center justify-between border-t border-dark/10 pt-3">
              <span className="font-bold">Total</span>
              <span className="font-display text-2xl font-black text-brand">{money(done.total)}</span>
            </div>
            <p className="text-xs text-dark/40">Collected at the counter. The plate is now marked rented.</p>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={resetForm} className="btn-primary">
              <Store className="w-4 h-4" /> New rental
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Form ---------------------------------------------------------- */
  return (
    <div>
      <Header onRefresh={load} loading={loading} />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {loading ? (
        <p className="text-dark/50">Loading shop data…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-6">
            {/* Bike + plate */}
            <Section title="Bike & plate" step={1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="label">Model</span>
                  <select className="input" value={bikeId} onChange={e => setBikeId(e.target.value)}>
                    <option value="">Select a model…</option>
                    {bikes.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {money(b.pricePerDay)}/day
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="label">Plate</span>
                  <select className="input" value={unitId} onChange={e => setUnitId(e.target.value)} disabled={!bikeId}>
                    <option value="">{!bikeId ? 'Pick a model first' : plates.length ? 'Select a plate…' : 'No plates available'}</option>
                    {plates.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.plate}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {bikeId && plates.length === 0 && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                  No available plates for this model — add one in Fleet, or free one up by returning a rental.
                </p>
              )}
            </Section>

            {/* Dates */}
            <Section title="Rental dates" step={2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="label">Pickup date</span>
                  <input
                    type="date"
                    className="input"
                    min={todayISO()}
                    value={pickupDate}
                    onChange={e => {
                      setPickupDate(e.target.value);
                      // Keep drop-off on/after pickup (and fill it if empty).
                      if (!dropoffDate || e.target.value > dropoffDate) setDropoffDate(e.target.value);
                    }}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="label">Drop-off date</span>
                  <input type="date" className="input" min={pickupDate || todayISO()} value={dropoffDate} onChange={e => setDropoffDate(e.target.value)} />
                </label>
              </div>
            </Section>

            {/* Extras */}
            {extras.length > 0 && (
              <Section title="Extras" step={3} hint="Optional">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {extras.map(ex => {
                    const active = chosen.includes(ex.id);
                    const amount = ex.perDay ? ex.price * Math.max(days, 1) : ex.price;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => toggleExtra(ex.id)}
                        className={`flex items-center gap-3 text-left rounded-xl border-2 p-3 transition-all ${
                          active ? 'border-brand bg-brand/5' : 'border-dark/10 hover:border-dark/30'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${active ? 'bg-brand border-brand' : 'border-dark/25'}`}>
                          {active && <Check className="w-3.5 h-3.5 text-white" />}
                        </span>
                        <span className="flex-1 text-sm font-bold">{ex.label}</span>
                        <span className="font-display font-bold text-brand text-sm">{money(amount)}</span>
                      </button>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Customer */}
            <Section title="Customer" step={4}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="label">First name *</span>
                  <input className="input" placeholder="Sarah" value={customer.firstName} onChange={e => setCustomer({ ...customer, firstName: e.target.value })} />
                </label>
                <label className="block space-y-2">
                  <span className="label">Last name</span>
                  <input className="input" placeholder="Johnson" value={customer.lastName} onChange={e => setCustomer({ ...customer, lastName: e.target.value })} />
                </label>
                <label className="block space-y-2">
                  <span className="label">Phone *</span>
                  <input className="input" placeholder="+94 77 123 4567" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                </label>
                <label className="block space-y-2">
                  <span className="label">Email</span>
                  <input className="input" type="email" placeholder="optional" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} />
                </label>
              </div>
            </Section>

            {/* Payment & deposit */}
            <Section title="Payment & deposit" step={5} hint="Optional">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-2">
                  <span className="label">Amount paid now ($)</span>
                  <input type="number" min={0} step="0.5" className="input" placeholder="0" value={paidNow} onChange={e => setPaidNow(e.target.value)} />
                </label>
                <label className="block space-y-2">
                  <span className="label">Security deposit ($)</span>
                  <input type="number" min={0} step="0.5" className="input" placeholder="0" value={deposit} onChange={e => setDeposit(e.target.value)} />
                </label>
              </div>
              <p className="text-[11px] text-dark/40 mt-2">Deposit is a refundable hold taken when the bike goes out. The remaining balance can be collected later from Bookings.</p>
            </Section>
          </div>

          {/* Summary */}
          <aside className="bg-dark text-beige rounded-3xl p-6 lg:sticky lg:top-10">
            <h2 className="font-display text-lg font-bold mb-5 flex items-center gap-2">
              <Store className="w-5 h-5 text-brand" /> Rental summary
            </h2>
            {bike ? (
              <div className="mb-4">
                <p className="font-bold leading-tight">{bike.title}</p>
                <p className="text-beige/50 text-sm">
                  {unitId ? `Plate ${plates.find(u => u.id === unitId)?.plate}` : 'No plate selected'} · {money(bike.pricePerDay)}/day
                </p>
              </div>
            ) : (
              <p className="text-beige/50 text-sm mb-4">No bike selected yet.</p>
            )}

            <div className="space-y-2 text-sm border-t border-beige/15 pt-4">
              {summary.lines.length === 0 && <p className="text-beige/40">Pick a bike and dates to see pricing.</p>}
              {summary.lines.map(line => (
                <div key={line.label} className="flex justify-between gap-4">
                  <span className="text-beige/70">{line.label}</span>
                  <span className="font-medium tabular-nums">{money(line.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between border-t border-beige/15 mt-4 pt-4">
              <span className="font-bold">Total</span>
              <span className="font-display text-3xl font-black text-brand tabular-nums">{money(summary.total)}</span>
            </div>

            {(Number(paidNow) > 0 || Number(deposit) > 0) && (
              <div className="space-y-1 text-sm mt-3">
                {Number(paidNow) > 0 && (
                  <>
                    <div className="flex justify-between"><span className="text-beige/70">Paid now</span><span className="tabular-nums text-emerald-300">{money(Number(paidNow))}</span></div>
                    <div className="flex justify-between"><span className="text-beige/70">Balance due</span><span className="tabular-nums">{money(Math.max(0, summary.total - Number(paidNow)))}</span></div>
                  </>
                )}
                {Number(deposit) > 0 && (
                  <div className="flex justify-between"><span className="text-beige/70">Deposit (held)</span><span className="tabular-nums">{money(Number(deposit))}</span></div>
                )}
              </div>
            )}

            <button onClick={submit} disabled={!valid || busy} className="btn-primary w-full justify-center mt-6">
              {busy ? 'Creating…' : 'Create rental'}
              <ArrowRight className="w-4 h-4" />
            </button>
            {!valid && <p className="text-beige/40 text-[11px] mt-3 text-center">Bike, plate, dates, name &amp; phone are required.</p>}
          </aside>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Header({ onRefresh, loading }: { onRefresh?: () => void; loading?: boolean } = {}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <span className="eyebrow">[ Walk-in ]</span>
      </div>
      {onRefresh && (
        <button onClick={onRefresh} className="btn-outline" disabled={loading} aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}

function Section({ title, step, hint, children }: { title: string; step: number; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-6 h-6 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
        <h2 className="font-display font-bold">{title}</h2>
        {hint && <span className="text-[10px] font-bold uppercase tracking-widest text-dark/30">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: typeof BikeIcon; label: string; value: string }) {
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
