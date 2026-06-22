import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { fetchOwners, fetchUnits, fetchBookings, UnauthorizedError, type Owner, type Unit, type Booking } from '../lib/api';
import { ownerCommission } from '../lib/commission';

const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, '')}`;

type DateRange = 'all' | 'today' | 'week' | 'month' | 'custom';
const RANGES: { key: DateRange; label: string }[] = [
  { key: 'all', label: 'All time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'custom', label: 'Custom' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const isoLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function rangeBounds(range: DateRange, from: string, to: string): [string, string] {
  const now = new Date();
  switch (range) {
    case 'today': { const s = isoLocal(now); return [s, s]; }
    case 'week': {
      const off = (now.getDay() + 6) % 7;
      const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - off);
      const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
      return [isoLocal(mon), isoLocal(sun)];
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [isoLocal(first), isoLocal(last)];
    }
    case 'custom': return [from, to];
    default: return ['', ''];
  }
}

export default function Payouts({ onLogout }: { onLogout: () => void }) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<DateRange>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [o, u, b] = await Promise.all([fetchOwners(), fetchUnits(), fetchBookings()]);
      setOwners(o);
      setUnits(u);
      setBookings(b);
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const [from, to] = rangeBounds(range, customFrom, customTo);
  const periodBookings = bookings.filter(b => (!from || b.pickupDate >= from) && (!to || b.pickupDate <= to));
  const rows = owners
    .map(o => ({ owner: o, c: ownerCommission(o, units, periodBookings) }))
    .sort((a, b) => b.c.commission - a.c.commission);
  const totals = rows.reduce(
    (t, r) => ({ rentals: t.rentals + r.c.rentals, revenue: t.revenue + r.c.revenue, commission: t.commission + r.c.commission, payout: t.payout + r.c.payout }),
    { rentals: 0, revenue: 0, commission: 0, payout: 0 },
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="eyebrow">[ Payouts ]</span>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={range}
              onChange={e => setRange(e.target.value as DateRange)}
              aria-label="Period"
              className="appearance-none cursor-pointer bg-white border border-dark/15 rounded-full pl-4 pr-9 py-2 text-sm font-bold text-dark hover:border-dark/30 focus:outline-none focus:border-brand"
            >
              {RANGES.map(r => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/40" />
          </div>
          <button onClick={load} className="btn-outline" disabled={loading} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {range === 'custom' && (
        <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="input max-w-[170px]" aria-label="From date" />
          <span className="text-dark/40">→</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="input max-w-[170px]" aria-label="To date" />
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Rentals" value={String(totals.rentals)} />
        <Stat label="Revenue" value={money(totals.revenue)} />
        <Stat label="Shop commission" value={money(totals.commission)} accent />
        <Stat label="Owner payouts" value={money(totals.payout)} />
      </div>

      {loading ? (
        <p className="text-dark/50">Loading payouts…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-dark/50">No owners yet.</div>
      ) : (
        <div className="bg-white rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="text-dark/40 text-[10px] uppercase tracking-widest border-b border-dark/10">
              <tr>
                <th className="text-left font-bold px-4 py-3">Owner</th>
                <th className="text-right font-bold px-4 py-3">Rentals</th>
                <th className="text-right font-bold px-4 py-3">Revenue</th>
                <th className="text-left font-bold px-4 py-3">Rate</th>
                <th className="text-right font-bold px-4 py-3">Commission</th>
                <th className="text-right font-bold px-4 py-3">Owner payout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ owner, c }) => (
                <tr key={owner.id} className="border-b border-dark/5 last:border-0">
                  <td className="px-4 py-3 font-bold whitespace-nowrap">{owner.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.rentals}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(c.revenue)}</td>
                  <td className="px-4 py-3 text-dark/60 whitespace-nowrap">{owner.commissionPct}% + {money(owner.commissionFlat)}/rental</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-700">{money(c.commission)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold">{money(c.payout)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-dark/10 font-bold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right tabular-nums">{totals.rentals}</td>
                <td className="px-4 py-3 text-right tabular-nums">{money(totals.revenue)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{money(totals.commission)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{money(totals.payout)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="text-[11px] text-dark/40 mt-3">Counts confirmed rentals by pickup date in the selected period. Set each owner's rate on the Owners tab.</p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-dark/40">{label}</p>
      <p className={`font-display text-2xl font-black mt-1 ${accent ? 'text-emerald-700' : 'text-dark'}`}>{value}</p>
    </div>
  );
}
