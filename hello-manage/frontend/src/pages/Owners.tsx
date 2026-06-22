import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, RefreshCw, Bike as BikeIcon } from 'lucide-react';
import Drawer from '../components/Drawer';
import {
  fetchOwners,
  createOwner,
  updateOwner,
  deleteOwner,
  fetchUnits,
  UnauthorizedError,
  type Owner,
  type OwnerInput,
  type Unit,
} from '../lib/api';

export default function Owners({ onLogout }: { onLogout: () => void }) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);

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
      const [o, u] = await Promise.all([fetchOwners(), fetchUnits()]);
      setOwners(o);
      setUnits(u);
    } catch (err) {
      fail(err, 'Failed to load owners');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  const bikeCount = (ownerId: string) => units.filter(u => u.ownerId === ownerId).length;

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
    } catch (err) {
      fail(err, 'Save failed');
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
          <h1 className="display-xl text-4xl md:text-5xl mt-2">Fleet owners</h1>
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

      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add an owner"
        subtitle="A fleet owner whose bikes you rent out."
        widthClass="max-w-2xl"
      >
        <AddOwner onCreate={handleCreate} />
      </Drawer>

      {loading ? (
        <p className="text-dark/50 mt-6">Loading owners…</p>
      ) : owners.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-dark/50 mt-6">No owners yet. Add one above.</div>
      ) : (
        <div className="space-y-4 mt-6">
          {owners.map(owner => (
            <OwnerRow key={owner.id} owner={owner} bikes={bikeCount(owner.id)} onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add-new owner                                                     */
/* ------------------------------------------------------------------ */

const EMPTY: OwnerInput = { name: '', phone: '', email: '', nic: '', notes: '' };

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

/* ------------------------------------------------------------------ */
/*  Editable row                                                      */
/* ------------------------------------------------------------------ */

function OwnerRow({
  owner,
  bikes,
  onSave,
  onDelete,
}: {
  owner: Owner;
  bikes: number;
  onSave: (id: string, patch: Partial<OwnerInput>) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<OwnerInput>(owner);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(owner), [owner]);

  const dirty =
    draft.name !== owner.name ||
    draft.phone !== owner.phone ||
    draft.email !== owner.email ||
    draft.nic !== owner.nic ||
    draft.notes !== owner.notes;

  async function save() {
    setBusy(true);
    await onSave(owner.id, { ...draft });
    setBusy(false);
  }

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6">
      <OwnerFields draft={draft} setDraft={setDraft} />

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-dark/10">
        <span className="text-xs font-bold inline-flex items-center gap-1.5 bg-beige rounded-full px-3 py-1.5">
          <BikeIcon className="w-4 h-4 text-brand" /> {bikes} bike{bikes === 1 ? '' : 's'}
        </span>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={save} disabled={!dirty || busy} className="btn-primary text-sm py-2">
            <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(owner.id)}
            className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared fields                                                     */
/* ------------------------------------------------------------------ */

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
    </div>
  );
}
