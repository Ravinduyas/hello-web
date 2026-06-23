import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ChevronDown, Pencil, Percent, DollarSign } from 'lucide-react';
import Drawer from '../components/Drawer';
import { fetchOwners, fetchUnits, fetchBookings, updateOwner, paidOf, dueOf, UnauthorizedError, type Owner, type Unit, type Booking } from '../lib/api';
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

type SubTab = 'payouts' | 'payments';
const SUBTABS: { key: SubTab; label: string }[] = [
  { key: 'payouts', label: 'Owner payouts' },
  { key: 'payments', label: 'Customer payments' },
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

export default function Finance({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<SubTab>('payouts');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<DateRange>('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [editing, setEditing] = useState<Owner | null>(null);

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
      setError(err instanceof Error ? err.message : 'Failed to load finance');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveRate(id: string, commissionPct: number, commissionFlat: number) {
    try {
      const updated = await updateOwner(id, { commissionPct, commissionFlat });
      setOwners(prev => prev.map(o => (o.id === id ? updated : o)));
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Could not save rate');
    }
  }

  const [from, to] = rangeBounds(range, customFrom, customTo);
  const periodBookings = bookings.filter(b => (!from || b.pickupDate >= from) && (!to || b.pickupDate <= to));

  /* ---- Owner payouts ---- */
  const payoutRows = owners
    .map(o => ({ owner: o, c: ownerCommission(o, units, periodBookings) }))
    .sort((a, b) => b.c.commission - a.c.commission);
  const payoutTotals = payoutRows.reduce(
    (t, r) => ({ rentals: t.rentals + r.c.rentals, revenue: t.revenue + r.c.revenue, commission: t.commission + r.c.commission, payout: t.payout + r.c.payout }),
    { rentals: 0, revenue: 0, commission: 0, payout: 0 },
  );
  const editRow = editing ? payoutRows.find(r => r.owner.id === editing.id) : null;

  /* ---- Customer payments ---- */
  const billRows = periodBookings
    .filter(b => b.status !== 'cancelled')
    .map(b => ({ b, paid: paidOf(b), due: dueOf(b) }))
    .sort((a, b) => b.due - a.due || b.b.total - a.b.total);
  const billTotals = billRows.reduce(
    (t, r) => ({ revenue: t.revenue + r.b.total, paid: t.paid + r.paid, due: t.due + r.due, deposits: t.deposits + (r.b.depositReturned ? 0 : r.b.deposit) }),
    { revenue: 0, paid: 0, due: 0, deposits: 0 },
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="eyebrow">[ Finance ]</span>
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

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SUBTABS.map(s => (
          <button
            key={s.key}
            onClick={() => setTab(s.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              tab === s.key ? 'bg-dark text-white' : 'bg-white text-dark border border-dark/10 hover:border-dark/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {range === 'custom' && (
        <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="input max-w-[170px]" aria-label="From date" />
          <span className="text-dark/40">→</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="input max-w-[170px]" aria-label="To date" />
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      <Drawer open={!!editing} onClose={() => setEditing(null)} title="Commission rate" subtitle={editing?.name} widthClass="max-w-md">
        {editing && (
          <CommissionForm
            owner={editing}
            rentals={editRow?.c.rentals ?? 0}
            revenue={editRow?.c.revenue ?? 0}
            periodLabel={RANGES.find(r => r.key === range)?.label ?? ''}
            onSave={async (pct, flat) => { await saveRate(editing.id, pct, flat); setEditing(null); }}
          />
        )}
      </Drawer>

      {loading ? (
        <p className="text-dark/50">Loading…</p>
      ) : tab === 'payouts' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Stat label="Rentals" value={String(payoutTotals.rentals)} />
            <Stat label="Revenue" value={money(payoutTotals.revenue)} />
            <Stat label="Shop commission" value={money(payoutTotals.commission)} accent />
            <Stat label="Owner payouts" value={money(payoutTotals.payout)} />
          </div>

          {payoutRows.length === 0 ? (
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
                  {payoutRows.map(({ owner, c }) => (
                    <tr key={owner.id} className="border-b border-dark/5 last:border-0">
                      <td className="px-4 py-3 font-bold whitespace-nowrap">{owner.name}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{c.rentals}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{money(c.revenue)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditing(owner)} title="Edit commission rate" className="group inline-flex items-center gap-2 rounded-full -ml-2 px-2 py-1 hover:bg-dark/5 transition">
                          <span className="text-dark/60 whitespace-nowrap">{owner.commissionPct}% + {money(owner.commissionFlat)}/rental</span>
                          <Pencil className="w-3.5 h-3.5 text-dark/40 group-hover:text-brand" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-700">{money(c.commission)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold">{money(c.payout)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-dark/10 font-bold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right tabular-nums">{payoutTotals.rentals}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(payoutTotals.revenue)}</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{money(payoutTotals.commission)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(payoutTotals.payout)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <p className="text-[11px] text-dark/40 mt-3">Counts confirmed rentals by pickup date in the selected period. Set each owner's rate on the Owners tab.</p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Stat label="Revenue" value={money(billTotals.revenue)} />
            <Stat label="Collected" value={money(billTotals.paid)} accent />
            <Stat label="Outstanding due" value={money(billTotals.due)} />
            <Stat label="Deposits held" value={money(billTotals.deposits)} />
          </div>

          {billRows.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-dark/50">No rentals in this period.</div>
          ) : (
            <div className="bg-white rounded-2xl overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="text-dark/40 text-[10px] uppercase tracking-widest border-b border-dark/10">
                  <tr>
                    <th className="text-left font-bold px-4 py-3">Customer</th>
                    <th className="text-left font-bold px-4 py-3">Bike</th>
                    <th className="text-right font-bold px-4 py-3">Total</th>
                    <th className="text-right font-bold px-4 py-3">Paid</th>
                    <th className="text-right font-bold px-4 py-3">Due</th>
                    <th className="text-right font-bold px-4 py-3">Deposit</th>
                  </tr>
                </thead>
                <tbody>
                  {billRows.map(({ b, paid, due }) => (
                    <tr key={b.id} className="border-b border-dark/5 last:border-0">
                      <td className="px-4 py-3 font-bold whitespace-nowrap">{b.renter.firstName} {b.renter.lastName}</td>
                      <td className="px-4 py-3 text-dark/60 whitespace-nowrap">{b.bikeTitle}{b.plate ? ` · ${b.plate}` : ''}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{money(b.total)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{money(paid)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums font-bold ${due > 0 ? 'text-red-600' : 'text-dark/40'}`}>{money(due)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{b.deposit > 0 ? money(b.deposit) + (b.depositReturned ? ' ↩' : '') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-dark/10 font-bold">
                    <td className="px-4 py-3" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(billTotals.revenue)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-700">{money(billTotals.paid)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-red-600">{money(billTotals.due)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{money(billTotals.deposits)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          <p className="text-[11px] text-dark/40 mt-3">Non-cancelled rentals by pickup date in the selected period. ↩ = deposit returned. Record payments on the Bookings tab.</p>
        </>
      )}
    </div>
  );
}

/** Polished commission-rate editor (drawer body) with a live payout preview. */
function CommissionForm({
  owner,
  rentals,
  revenue,
  periodLabel,
  onSave,
}: {
  owner: Owner;
  rentals: number;
  revenue: number;
  periodLabel: string;
  onSave: (pct: number, flat: number) => Promise<void>;
}) {
  const [pct, setPct] = useState(owner.commissionPct);
  const [flat, setFlat] = useState(owner.commissionFlat);
  const [busy, setBusy] = useState(false);
  const commission = revenue * (pct / 100) + flat * rentals;
  const payout = revenue - commission;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(pct, flat);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-2 block">
          <span className="label">Commission %</span>
          <div className="relative">
            <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/30 pointer-events-none" />
            <input type="number" min={0} max={100} step="0.5" value={pct} onChange={e => setPct(Number(e.target.value))} className="input pl-9" />
          </div>
        </label>
        <label className="space-y-2 block">
          <span className="label">Flat per rental</span>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark/30 pointer-events-none" />
            <input type="number" min={0} step="0.5" value={flat} onChange={e => setFlat(Number(e.target.value))} className="input pl-9" />
          </div>
        </label>
      </div>

      <div className="bg-dark text-beige rounded-2xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-beige/50 mb-3">
          {periodLabel} · {rentals} rental{rentals === 1 ? '' : 's'}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-beige/70">Revenue</span><span className="tabular-nums">{money(revenue)}</span></div>
          <div className="flex justify-between"><span className="text-beige/70">Shop commission</span><span className="tabular-nums font-bold text-emerald-300">{money(commission)}</span></div>
          <div className="flex justify-between border-t border-beige/15 pt-2 mt-1"><span className="font-bold">Owner payout</span><span className="tabular-nums font-bold">{money(payout)}</span></div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save rate'}</button>
      </div>
    </form>
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
