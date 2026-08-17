import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, RefreshCw, GripVertical } from 'lucide-react';
import Drawer from '../components/Drawer';
import {
  fetchExtras,
  createExtra,
  updateExtra,
  deleteExtra,
  UnauthorizedError,
  type Extra,
  type ExtraInput,
} from '../lib/api';

export default function Extras({ onLogout }: { onLogout: () => void }) {
  const [extras, setExtras] = useState<Extra[]>([]);
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
      setExtras(await fetchExtras());
    } catch (err) {
      fail(err, 'Failed to load extras');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(input: ExtraInput) {
    try {
      const created = await createExtra(input);
      setExtras(prev => [...prev, created]);
      setAddOpen(false);
    } catch (err) {
      fail(err, 'Create failed');
      throw err; // let the form keep its values
    }
  }

  async function handleSave(id: string, patch: Partial<ExtraInput>) {
    try {
      const updated = await updateExtra(id, patch);
      setExtras(prev => prev.map(e => (e.id === id ? updated : e)));
    } catch (err) {
      fail(err, 'Save failed');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this extra? Existing bookings keep their copy.')) return;
    try {
      await deleteExtra(id);
      setExtras(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      fail(err, 'Delete failed');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow">[ Booking extras ]</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add extra
          </button>
          <button onClick={load} className="btn-outline" disabled={loading} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      <Drawer open={addOpen} onClose={() => setAddOpen(false)} title="Add an extra" subtitle="An optional add-on customers can pick at checkout." widthClass="max-w-lg">
        <AddExtra onCreate={handleCreate} />
      </Drawer>

      {loading ? (
        <p className="text-dark/50 mt-6">Loading extras…</p>
      ) : extras.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-dark/50">No extras yet. Add one above.</div>
      ) : (
        <div className="space-y-4">
          {extras.map(extra => (
            <ExtraRow key={extra.id} extra={extra} onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add-new form                                                      */
/* ------------------------------------------------------------------ */

const EMPTY: ExtraInput = { label: '', description: '', price: 0, perDay: true, active: true };

function AddExtra({ onCreate }: { onCreate: (input: ExtraInput) => Promise<void> }) {
  const [draft, setDraft] = useState<ExtraInput>(EMPTY);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.label.trim()) return;
    setBusy(true);
    try {
      await onCreate(draft);
      setDraft(EMPTY);
    } catch {
      /* error surfaced by parent; keep values */
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <span className="label">Label</span>
        <input className="input" placeholder="Surf rack" value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} />
      </div>
      <div className="space-y-2">
        <span className="label">Description</span>
        <input
          className="input"
          placeholder="Carry a surfboard safely."
          value={draft.description}
          onChange={e => setDraft({ ...draft, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <span className="label">Price (€)</span>
          <input
            type="number"
            min={0}
            step="0.5"
            className="input"
            value={draft.price}
            onChange={e => setDraft({ ...draft, price: Number(e.target.value) })}
          />
        </div>
        <PerDayToggle value={draft.perDay} onChange={v => setDraft({ ...draft, perDay: v })} />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={busy || !draft.label.trim()}>
          {busy ? 'Adding…' : 'Add extra'}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Editable row                                                      */
/* ------------------------------------------------------------------ */

function ExtraRow({
  extra,
  onSave,
  onDelete,
}: {
  extra: Extra;
  onSave: (id: string, patch: Partial<ExtraInput>) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Extra>(extra);
  const [busy, setBusy] = useState(false);

  // Re-sync when the parent replaces the extra (e.g. after a save elsewhere).
  useEffect(() => setDraft(extra), [extra]);

  const dirty =
    draft.label !== extra.label ||
    draft.description !== extra.description ||
    draft.price !== extra.price ||
    draft.perDay !== extra.perDay ||
    draft.active !== extra.active;

  async function save() {
    setBusy(true);
    await onSave(extra.id, {
      label: draft.label,
      description: draft.description,
      price: draft.price,
      perDay: draft.perDay,
      active: draft.active,
    });
    setBusy(false);
  }

  return (
    // Dimmed by what is saved, not what is typed. Dimming on the draft made an
    // unsaved toggle look identical to a saved one — the card faded, the change
    // was never written, and the extra kept showing on the website.
    <div
      className={`bg-white rounded-2xl p-5 md:p-6 transition-opacity ${extra.active ? '' : 'opacity-60'} ${
        dirty ? 'ring-2 ring-brand/60' : ''
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3 space-y-2">
          <span className="label flex items-center gap-1">
            <GripVertical className="w-3 h-3 text-dark/25" /> Label
          </span>
          <input className="input" value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} />
        </div>
        <div className="md:col-span-5 space-y-2">
          <span className="label">Description</span>
          <input className="input" value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
        </div>
        <div className="md:col-span-2 space-y-2">
          <span className="label">Price (€)</span>
          <input
            type="number"
            min={0}
            step="0.5"
            className="input"
            value={draft.price}
            onChange={e => setDraft({ ...draft, price: Number(e.target.value) })}
          />
        </div>
        <div className="md:col-span-2">
          <PerDayToggle value={draft.perDay} onChange={v => setDraft({ ...draft, perDay: v })} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-dark/10">
        <button
          type="button"
          onClick={() => setDraft({ ...draft, active: !draft.active })}
          className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full transition ${
            draft.active ? 'bg-emerald-100 text-emerald-800' : 'bg-dark/10 text-dark/50'
          }`}
        >
          {draft.active ? 'Active' : 'Inactive'}
        </button>
        <span className="text-xs text-dark/40 font-mono">{extra.id}</span>

        {/* Nothing reaches the website until Save is pressed, so say so rather
            than letting the toggle imply it already has. */}
        {dirty && (
          <span className="text-xs font-bold text-brand inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            Unsaved — press Save to apply
          </span>
        )}

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || busy}
            className="btn-primary text-sm py-2"
          >
            <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(extra.id)}
            className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PerDayToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-2">
      <span className="label">Charge</span>
      <div className="flex rounded-xl overflow-hidden border border-dark/10 text-xs font-bold">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 px-3 py-2.5 transition ${value ? 'bg-brand text-white' : 'bg-beige text-dark/60'}`}
        >
          Per day
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 px-3 py-2.5 transition ${!value ? 'bg-brand text-white' : 'bg-beige text-dark/60'}`}
        >
          Flat
        </button>
      </div>
    </div>
  );
}
