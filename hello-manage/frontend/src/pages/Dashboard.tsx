import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RefreshCw, AlertTriangle, ArrowRight, Bike as BikeIcon, CalendarCheck,
  Clock, LogIn, LogOut as LogOutIcon, Wallet, Wrench,
} from 'lucide-react';
import {
  fetchBookings, fetchUnits, dueOf,
  UnauthorizedError, type Booking, type Unit,
} from '../lib/api';
import { money } from '../lib/money';

/**
 * What the shop needs to know before it does anything else.
 *
 * Every figure here is a link into the list that produced it — a dashboard
 * that can only be read is a poster. The numbers are worked out from the same
 * bookings the rest of the admin shows, on the same rules, so nothing here can
 * quietly disagree with the page it sends you to.
 */

const pad = (n: number) => String(n).padStart(2, '0');
const isoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fullDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

const shortDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

const nameOf = (b: Booking) => `${b.renter.firstName} ${b.renter.lastName}`.trim() || 'Someone';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [b, u] = await Promise.all([fetchBookings(), fetchUnits()]);
      setBookings(b);
      setUnits(u);
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Could not load the dashboard');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const today = isoLocal(new Date());
  const live = bookings.filter(b => b.status !== 'cancelled');

  /* ---- the day ---- */
  const pickupsToday = live.filter(b => b.pickupDate === today);
  const returnsToday = live.filter(b => b.dropoffDate === today && b.status === 'confirmed');
  const outNow = live.filter(b => b.status === 'confirmed' && b.pickupDate <= today && b.dropoffDate >= today);
  const overdue = live.filter(b => b.status === 'confirmed' && b.dropoffDate < today);
  const pending = bookings.filter(b => b.status === 'pending');

  /* ---- the money ---- */
  const month = today.slice(0, 7);
  const collectedThisMonth = live
    .flatMap(b => b.payments)
    .filter(p => p.at.slice(0, 7) === month)
    .reduce((s, p) => s + p.amount, 0);
  const outstanding = live.filter(b => b.status === 'confirmed').reduce((s, b) => s + dueOf(b), 0);
  const depositsHeld = live
    .filter(b => b.status === 'confirmed' && !b.depositReturned)
    .reduce((s, b) => s + b.deposit, 0);

  /* ---- the fleet ---- */
  const fleet = {
    available: units.filter(u => u.status === 'available').length,
    rented: units.filter(u => u.status === 'rented').length,
    maintenance: units.filter(u => u.status === 'maintenance').length,
  };
  const outOfService = fleet.maintenance;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="eyebrow">[ Dashboard ]</span>
          <h1 className="font-display text-2xl font-black mt-1">{fullDate(today)}</h1>
        </div>
        <button onClick={() => load()} className="btn-outline" disabled={loading} aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {/* A bike that has not come back outranks everything else on this page. */}
      {overdue.length > 0 && (
        <Link
          to="/bookings?timing=lateReturn"
          className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-4 font-bold hover:bg-red-100 transition"
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>
            {overdue.length} bike{overdue.length === 1 ? '' : 's'} still out past the return date
          </span>
          <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
        </Link>
      )}

      {/* The four questions asked before the shutter is even up. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Tile
          to="/bookings?timing=out"
          icon={BikeIcon}
          label="Out on the road"
          value={outNow.length}
          /* The fleet panel counts 7 rented while this counts 1, and both are
             right: the other six are the overdue ones. Saying so here stops
             the two numbers reading as a contradiction. */
          hint={overdue.length ? `plus ${overdue.length} overdue below` : `of ${units.length} machines`}
        />
        <Tile
          to="/bookings?timing=due"
          icon={LogIn}
          label="Due back today"
          value={returnsToday.length}
          hint={returnsToday.length ? 'coming in' : 'nothing to chase'}
          tone={returnsToday.length ? 'brand' : undefined}
        />
        <Tile
          to="/bookings?status=pending"
          icon={Clock}
          label="Waiting to confirm"
          value={pending.length}
          hint={pending.length ? 'needs an answer' : 'all answered'}
          tone={pending.length ? 'amber' : undefined}
        />
        <Tile
          to="/bookings?pay=unpaid"
          icon={Wallet}
          label="Money owed"
          value={money(outstanding)}
          hint="on confirmed rentals"
          tone={outstanding > 0 ? 'red' : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* ---- the day's movements ---- */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-lg font-bold mb-4">Today's movements</h2>

          <Movements
            title="Going out"
            icon={LogOutIcon}
            empty="No collections booked for today."
            rows={pickupsToday}
            today={today}
          />
          <div className="h-5" />
          <Movements
            title="Coming back"
            icon={LogIn}
            empty="Nothing due back today."
            rows={returnsToday}
            today={today}
          />

          {overdue.length > 0 && (
            <>
              <div className="h-5" />
              <Movements
                title="Should already be back"
                icon={AlertTriangle}
                empty=""
                rows={overdue}
                today={today}
                alarming
              />
            </>
          )}
        </section>

        <div className="space-y-4">
          {/* ---- the fleet at a glance ---- */}
          <section className="bg-white rounded-2xl p-5 md:p-6">
            <h2 className="font-display text-lg font-bold mb-4">The fleet</h2>
            {units.length === 0 ? (
              <p className="text-sm text-dark/45">No machines on the books yet.</p>
            ) : (
              <>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-dark/5 mb-4">
                  <span className="bg-emerald-500" style={{ width: `${(fleet.available / units.length) * 100}%` }} />
                  <span className="bg-brand" style={{ width: `${(fleet.rented / units.length) * 100}%` }} />
                  <span className="bg-amber-400" style={{ width: `${(fleet.maintenance / units.length) * 100}%` }} />
                </div>
                <ul className="space-y-2 text-sm">
                  <FleetRow colour="bg-emerald-500" label="Ready to go" value={fleet.available} />
                  <FleetRow colour="bg-brand" label="Out with customers" value={fleet.rented} />
                  <FleetRow colour="bg-amber-400" label="In the workshop" value={fleet.maintenance} />
                </ul>
                {outOfService > 0 && (
                  <Link to="/fleet" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline mt-4">
                    <Wrench className="w-3.5 h-3.5" /> See what is off the road
                  </Link>
                )}
              </>
            )}
          </section>

          {/* ---- the money ---- */}
          <section className="bg-white rounded-2xl p-5 md:p-6">
            <h2 className="font-display text-lg font-bold mb-4">Money</h2>
            <dl className="space-y-3 text-sm">
              <Figure label="Taken this month" value={money(collectedThisMonth)} tone="good" />
              <Figure label="Still owed" value={money(outstanding)} tone={outstanding > 0 ? 'owed' : undefined} />
              <Figure label="Deposits being held" value={money(depositsHeld)} tone={depositsHeld > 0 ? 'held' : undefined} />
            </dl>
            <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline mt-4">
              <CalendarCheck className="w-3.5 h-3.5" /> Payouts and the monthly statement
            </Link>
          </section>
        </div>
      </div>

      {loading && bookings.length === 0 && <p className="text-dark/50 mt-6">Loading…</p>}
    </div>
  );
}

/** One headline number, and the list it came from. */
function Tile({
  to, icon: Icon, label, value, hint, tone,
}: {
  to: string;
  icon: typeof BikeIcon;
  label: string;
  value: number | string;
  hint: string;
  tone?: 'brand' | 'amber' | 'red';
}) {
  const colour =
    tone === 'red' ? 'text-red-700' : tone === 'amber' ? 'text-amber-700' : tone === 'brand' ? 'text-brand' : 'text-dark';
  return (
    <Link to={to} className="bg-white rounded-2xl p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-2 text-dark/40">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`font-display text-3xl font-black tabular-nums mt-2 ${colour}`}>{value}</p>
      <p className="text-xs text-dark/40 mt-1 flex items-center gap-1">
        {hint}
        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </p>
    </Link>
  );
}

/** The people and machines involved in one part of the day. */
function Movements({
  title, icon: Icon, rows, empty, today, alarming,
}: {
  title: string;
  icon: typeof BikeIcon;
  rows: Booking[];
  empty: string;
  today: string;
  alarming?: boolean;
}) {
  return (
    <div>
      <h3 className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest mb-2 ${alarming ? 'text-red-700' : 'text-dark/40'}`}>
        <Icon className="w-3.5 h-3.5" /> {title} {rows.length > 0 && <span className="tabular-nums">· {rows.length}</span>}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-dark/35">{empty}</p>
      ) : (
        <ul className="divide-y divide-dark/5">
          {rows.map(b => {
            const owed = dueOf(b);
            const daysLate = Math.round(
              (new Date(today).getTime() - new Date(b.dropoffDate).getTime()) / 86400000,
            );
            return (
              <li key={b.id} className="py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-bold">{nameOf(b)}</span>
                <span className="text-sm text-dark/50">
                  {b.bikeTitle}
                  {b.plate && ` · ${b.plate}`}
                </span>
                {alarming && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {daysLate} day{daysLate === 1 ? '' : 's'} late · due {shortDate(b.dropoffDate)}
                  </span>
                )}
                {b.status === 'pending' && (
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    not confirmed
                  </span>
                )}
                <span className="ml-auto flex items-center gap-3 text-sm">
                  {owed > 0 ? (
                    <span className="font-bold text-red-700 tabular-nums">{money(owed)} due</span>
                  ) : (
                    <span className="text-dark/35">settled</span>
                  )}
                  <a
                    href={`tel:${b.renter.phone}`}
                    className="text-xs font-bold text-brand hover:underline whitespace-nowrap"
                  >
                    {b.renter.phone}
                  </a>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FleetRow({ colour, label, value }: { colour: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colour}`} />
      <span className="text-dark/60">{label}</span>
      <span className="ml-auto font-bold tabular-nums">{value}</span>
    </li>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'owed' | 'held' }) {
  const colour =
    tone === 'good' ? 'text-emerald-700' : tone === 'owed' ? 'text-red-700' : tone === 'held' ? 'text-amber-700' : 'text-dark';
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-dark/55">{label}</dt>
      <dd className={`font-display text-lg font-black tabular-nums ${colour}`}>{value}</dd>
    </div>
  );
}
