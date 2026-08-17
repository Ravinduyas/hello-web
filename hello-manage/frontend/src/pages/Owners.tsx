import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Pencil, RefreshCw, Bike as BikeIcon, ChevronDown } from 'lucide-react';
import Drawer from '../components/Drawer';
import {
  fetchOwners,
  createOwner,
  updateOwner,
  deleteOwner,
  fetchUnits,
  fetchBikes,
  fetchBookings,
  UnauthorizedError,
  type Owner,
  type OwnerInput,
  type Unit,
  type UnitStatus,
  type Bike,
  type Booking,
} from '../lib/api';
import { ownerCommission } from '../lib/commission';
import { money } from '../lib/money';


const unitStatusChip: Record<UnitStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  rented: 'bg-amber-100 text-amber-800',
  maintenance: 'bg-dark/10 text-dark/50',
};

export default function Owners({ onLogout }: { onLogout: () => void }) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Owner | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
      const [o, u, b, bk] = await Promise.all([fetchOwners(), fetchUnits(), fetchBikes(), fetchBookings()]);
      setOwners(o);
      setUnits(u);
      setBikes(b);
      setBookings(bk);
    } catch (err) {
      fail(err, 'Failed to load owners');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  const ownerUnits = (ownerId: string) => units.filter(u => u.ownerId === ownerId);
  const bikeTitle = (bikeId: string) => bikes.find(b => b.id === bikeId)?.title ?? 'Unknown model';
  const plateRevenue = (unitId: string) =>
    bookings.filter(b => b.status === 'confirmed' && b.unitId === unitId).reduce((s, b) => s + b.total, 0);

  async function handleCreate(input: OwnerInput) {
    try {
      const created = await createOwner(input);
      setOwners(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setAddOpen(false);
    } catch (err) {
      fail(err, 'Create failed');
      throw err;
    }
  }

  async function handleSave(id: string, patch: Partial<OwnerInput>) {
    try {
      const updated = await updateOwner(id, patch);
      setOwners(prev => prev.map(o => (o.id === id ? updated : o)));
      setEditing(null);
    } catch (err) {
      fail(err, 'Save failed');
      throw err;
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this owner?')) return;
    try {
      await deleteOwner(id);
      setOwners(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      fail(err, 'Delete failed');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow">[ Owners ]</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add owner
          </button>
          <button onClick={load} className="btn-outline" disabled={loading} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {/* Add */}
      <Drawer open={addOpen} onClose={() => setAddOpen(false)} title="Add an owner" subtitle="A fleet owner whose bikes you rent out." widthClass="max-w-2xl">
        <AddOwner onCreate={handleCreate} />
      </Drawer>

      {/* Edit */}
      <Drawer open={!!editing} onClose={() => setEditing(null)} title="Edit owner" subtitle={editing?.name} widthClass="max-w-2xl">
        {editing && <EditOwner key={editing.id} owner={editing} onSave={patch => handleSave(editing.id, patch)} />}
      </Drawer>

      {loading ? (
        <p className="text-dark/50 mt-6">Loading owners…</p>
      ) : owners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-dark/50 mt-6">No owners yet. Add one above.</div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Column headers (desktop) */}
          <div className="hidden md:grid grid-cols-[2fr_1.4fr_1fr_auto] gap-4 px-6 py-3 border-b border-dark/10 text-[10px] font-bold uppercase tracking-widest text-dark/40">
            <span>Owner</span>
            <span>Phone</span>
            <span>NIC / ID</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-dark/5">
            {owners.map(owner => {
              const ownersBikes = ownerUnits(owner.id);
              const count = ownersBikes.length;
              const isOpen = expanded === owner.id;
              const c = ownerCommission(owner, units, bookings);
              return (
                <div key={owner.id} className="px-4 md:px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-[2fr_1.4fr_1fr_auto] gap-2 md:gap-4 md:items-center">
                    {/* Owner + email + bikes toggle */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold truncate">{owner.name}</p>
                        <button
                          onClick={() => setExpanded(prev => (prev === owner.id ? null : owner.id))}
                          disabled={count === 0}
                          aria-expanded={isOpen}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 transition-colors ${
                            count === 0 ? 'bg-beige text-dark/40' : 'bg-beige hover:bg-brand/15 text-dark'
                          }`}
                        >
                          <BikeIcon className="w-3 h-3 text-brand" /> {count} {count === 1 ? 'bike' : 'bikes'}
                          {count > 0 && <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                        </button>
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 bg-emerald-100 text-emerald-800" title="Shop commission from confirmed rentals">
                          Comm {money(c.commission)}
                        </span>
                      </div>
                      <p className="text-sm text-dark/50 truncate">{owner.email || '—'}</p>
                      <p className="text-[11px] text-dark/40 mt-0.5">
                        Rate {owner.commissionPct}% + {money(owner.commissionFlat)}/rental
                      </p>
                    </div>

                    {/* Phone */}
                    <div className="text-sm min-w-0 truncate">
                      <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-dark/40 mr-2">Phone</span>
                      {owner.phone || '—'}
                    </div>

                    {/* NIC */}
                    <div className="text-sm min-w-0 truncate">
                      <span className="md:hidden text-[10px] font-bold uppercase tracking-widest text-dark/40 mr-2">NIC</span>
                      {owner.nic || '—'}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:justify-end mt-1 md:mt-0">
                      <button
                        onClick={() => setEditing(owner)}
                        className="text-sm font-bold inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-dark/5 text-dark hover:bg-dark/10 transition"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(owner.id)}
                        aria-label={`Delete ${owner.name}`}
                        className="text-sm font-bold inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="md:hidden">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Per-owner bikes (plates) */}
                  {isOpen && count > 0 && (
                    <div className="mt-3 bg-beige/60 rounded-xl p-3 space-y-1.5">
                      {ownersBikes.map(u => (
                        <div key={u.id} className="flex items-center gap-3 text-sm bg-white rounded-lg px-3 py-2">
                          <span className="font-display font-bold tracking-wide w-28 shrink-0">{u.plate}</span>
                          <span className="text-dark/60 flex-1 truncate">{bikeTitle(u.bikeId)}</span>
                          <span className="text-dark/50 tabular-nums shrink-0" title="Revenue from confirmed rentals">{money(plateRevenue(u.id))}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${unitStatusChip[u.status]}`}>
                            {u.status}
                          </span>
                        </div>
                      ))}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-3 pt-2 text-sm">
                        <span className="text-dark/50">Rentals <b className="text-dark">{c.rentals}</b></span>
                        <span className="text-dark/50">Revenue <b className="text-dark">{money(c.revenue)}</b></span>
                        <span className="text-dark/50">Commission <b className="text-emerald-700">{money(c.commission)}</b></span>
                        <span className="text-dark/50">Owner payout <b className="text-dark">{money(c.payout)}</b></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add / Edit forms (shared fields, used inside the Drawer)          */
/* ------------------------------------------------------------------ */

const EMPTY: OwnerInput = { name: '', phone: '', email: '', nic: '', notes: '', commissionPct: 0, commissionFlat: 0 };

function AddOwner({ onCreate }: { onCreate: (input: OwnerInput) => Promise<void> }) {
  const [draft, setDraft] = useState<OwnerInput>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setBusy(true);
    try {
      await onCreate(draft);
      setDraft(EMPTY);
    } catch {
      /* surfaced by parent */
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <OwnerFields draft={draft} setDraft={setDraft} />
      <div className="flex justify-end mt-6">
        <button type="submit" className="btn-primary" disabled={busy || !draft.name.trim()}>
          {busy ? 'Adding…' : 'Add owner'}
        </button>
      </div>
    </form>
  );
}

function EditOwner({ owner, onSave }: { owner: Owner; onSave: (patch: Partial<OwnerInput>) => Promise<void> }) {
  const [draft, setDraft] = useState<OwnerInput>(owner);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setBusy(true);
    try {
      await onSave(draft);
    } catch {
      /* surfaced by parent */
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <OwnerFields draft={draft} setDraft={setDraft} />
      <div className="flex justify-end mt-6">
        <button type="submit" className="btn-primary" disabled={busy || !draft.name.trim()}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function OwnerFields({ draft, setDraft }: { draft: OwnerInput; setDraft: (d: OwnerInput) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <label className="md:col-span-4 space-y-2 block">
        <span className="label">Name</span>
        <input className="input" placeholder="Nimal Perera" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
      </label>
      <label className="md:col-span-4 space-y-2 block">
        <span className="label">Phone</span>
        <input className="input" placeholder="+94 77 123 4567" value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} />
      </label>
      <label className="md:col-span-4 space-y-2 block">
        <span className="label">NIC / ID</span>
        <input className="input" placeholder="901234567V" value={draft.nic} onChange={e => setDraft({ ...draft, nic: e.target.value })} />
      </label>
      <label className="md:col-span-6 space-y-2 block">
        <span className="label">Email</span>
        <input className="input" type="email" placeholder="owner@email.com" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} />
      </label>
      <label className="md:col-span-6 space-y-2 block">
        <span className="label">Notes</span>
        <input className="input" placeholder="Payout details, bank, etc." value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} />
      </label>

      <div className="md:col-span-12 grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-dark/10">
        <label className="space-y-2 block">
          <span className="label">Commission %</span>
          <input
            type="number"
            min={0}
            max={100}
            step="0.5"
            className="input"
            placeholder="15"
            value={draft.commissionPct}
            onChange={e => setDraft({ ...draft, commissionPct: Number(e.target.value) })}
          />
        </label>
        <label className="space-y-2 block">
          <span className="label">Flat per rental (€)</span>
          <input
            type="number"
            min={0}
            step="0.5"
            className="input"
            placeholder="2"
            value={draft.commissionFlat}
            onChange={e => setDraft({ ...draft, commissionFlat: Number(e.target.value) })}
          />
        </label>
        <p className="col-span-2 text-[11px] text-dark/40">Shop commission = % of rental revenue + flat per confirmed rental. Owner is paid the rest.</p>
      </div>
    </div>
  );
}
