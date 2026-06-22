import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, RefreshCw, X, ChevronDown, ChevronRight, Tag, LayoutGrid, List } from 'lucide-react';
import Drawer from '../components/Drawer';
import {
  fetchBikes,
  createBike,
  updateBike,
  deleteBike,
  fetchCategories,
  createCategory,
  deleteCategory,
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  fetchOwners,
  UnauthorizedError,
  type Bike,
  type BikeInput,
  type Category,
  type Unit,
  type UnitStatus,
  type Owner,
} from '../lib/api';

export default function Fleet({ onLogout }: { onLogout: () => void }) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<'models' | 'plates'>('models');

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
      const [b, c, u, o] = await Promise.all([fetchBikes(), fetchCategories(), fetchUnits(), fetchOwners()]);
      setBikes(b);
      setCategories(c);
      setUnits(u);
      setOwners(o);
    } catch (err) {
      fail(err, 'Failed to load fleet');
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryNames = categories.map(c => c.name);

  /* ---- bikes ---- */
  async function handleCreate(input: BikeInput) {
    try {
      const created = await createBike(input);
      setBikes(prev => [...prev, created]);
      setAddOpen(false);
    } catch (err) {
      fail(err, 'Create failed');
      throw err;
    }
  }
  async function handleSave(id: string, patch: Partial<BikeInput>) {
    try {
      const updated = await updateBike(id, patch);
      setBikes(prev => prev.map(b => (b.id === id ? updated : b)));
    } catch (err) {
      fail(err, 'Save failed');
    }
  }
  async function handleDelete(id: string) {
    if (!window.confirm('Delete this sub-category and all its bikes (plates)? Existing bookings keep their copy.')) return;
    try {
      await deleteBike(id);
      setBikes(prev => prev.filter(b => b.id !== id));
      setUnits(prev => prev.filter(u => u.bikeId !== id));
    } catch (err) {
      fail(err, 'Delete failed');
    }
  }

  /* ---- units (individual bikes by plate) ---- */
  async function handleAddUnit(bikeId: string, plate: string, status: UnitStatus, ownerId: string) {
    setError('');
    try {
      const created = await createUnit({ bikeId, plate, status, ownerId });
      setUnits(prev => [...prev, created]);
    } catch (err) {
      fail(err, 'Could not add bike');
    }
  }
  async function handleUpdateUnit(id: string, patch: Partial<Pick<Unit, 'plate' | 'status' | 'notes'>>) {
    setError('');
    try {
      const updated = await updateUnit(id, patch);
      setUnits(prev => prev.map(u => (u.id === id ? updated : u)));
    } catch (err) {
      fail(err, 'Could not update bike');
    }
  }
  async function handleDeleteUnit(id: string) {
    setError('');
    try {
      await deleteUnit(id);
      setUnits(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      fail(err, 'Could not delete bike');
    }
  }

  /* ---- categories ---- */
  async function handleAddCategory(name: string) {
    setError('');
    try {
      const created = await createCategory(name);
      setCategories(prev => (prev.some(c => c.name === created.name) ? prev : [...prev, created]));
    } catch (err) {
      fail(err, 'Could not add category');
    }
  }
  async function handleDeleteCategory(name: string) {
    setError('');
    try {
      await deleteCategory(name);
      setCategories(prev => prev.filter(c => c.name !== name));
    } catch (err) {
      fail(err, 'Could not delete category');
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow">[ Fleet ]</span>
          <h1 className="display-xl text-4xl md:text-5xl mt-2">Manage fleet</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle: models (cards) vs plates (flat list) */}
          <div className="flex rounded-full border border-dark/15 overflow-hidden text-sm font-bold">
            <button
              onClick={() => setView('models')}
              className={`flex items-center gap-1.5 px-3 py-2 transition ${view === 'models' ? 'bg-dark text-white' : 'bg-white text-dark/60 hover:text-dark'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Models
            </button>
            <button
              onClick={() => setView('plates')}
              className={`flex items-center gap-1.5 px-3 py-2 transition ${view === 'plates' ? 'bg-dark text-white' : 'bg-white text-dark/60 hover:text-dark'}`}
            >
              <List className="w-4 h-4" /> Plates
            </button>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add sub-category
          </button>
          <button onClick={() => setCategoriesOpen(true)} className="btn-outline">
            <Tag className="w-4 h-4" /> Categories
            <span className="opacity-50">({categoryNames.length})</span>
          </button>
          <button onClick={load} className="btn-outline" disabled={loading} aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {/* Slide-over: manage categories */}
      <Drawer
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
        title="Categories"
        subtitle="Top-level groups you assign sub-categories to."
      >
        <CategoriesManager
          categories={categoryNames}
          usage={Object.fromEntries(categoryNames.map(n => [n, bikes.filter(b => b.category === n).length]))}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
        />
      </Drawer>

      {/* Slide-over: add a sub-category */}
      <Drawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a sub-category"
        subtitle="A model (e.g. “Honda Dio 110cc”) under a category."
        widthClass="max-w-2xl"
      >
        <AddBike categories={categoryNames} onCreate={handleCreate} />
      </Drawer>

      {loading ? (
        <p className="text-dark/50 mt-6">Loading fleet…</p>
      ) : view === 'plates' ? (
        <PlatesList
          units={units}
          bikes={bikes}
          owners={owners}
          onUpdate={handleUpdateUnit}
          onDelete={handleDeleteUnit}
        />
      ) : (
        <div className="mt-8 space-y-8">
          {groupByCategory(bikes, categoryNames).map(group => (
            <section key={group.category}>
              <div className="flex items-baseline gap-3 mb-3 border-b border-dark/10 pb-2">
                <h2 className="font-display text-xl font-bold">{group.category}</h2>
                <span className="text-dark/40 text-sm">
                  {group.items.length} sub-categor{group.items.length === 1 ? 'y' : 'ies'}
                </span>
              </div>
              {group.items.length === 0 ? (
                <p className="text-dark/40 text-sm">No sub-categories here yet — add one above and pick “{group.category}”.</p>
              ) : (
                <div className="space-y-4">
                  {group.items.map(bike => (
                    <BikeRow
                      key={bike.id}
                      bike={bike}
                      categories={categoryNames}
                      units={units.filter(u => u.bikeId === bike.id)}
                      owners={owners}
                      onSave={handleSave}
                      onDelete={handleDelete}
                      onAddUnit={handleAddUnit}
                      onUpdateUnit={handleUpdateUnit}
                      onDeleteUnit={handleDeleteUnit}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Group sub-categories (models) under their parent category, in admin order. */
function groupByCategory(bikes: Bike[], categoryNames: string[]): { category: string; items: Bike[] }[] {
  const groups: { category: string; items: Bike[] }[] = [];
  const seen = new Set<string>();
  for (const cat of categoryNames) {
    groups.push({ category: cat, items: bikes.filter(b => b.category === cat) });
    seen.add(cat);
  }
  // Any sub-categories whose category isn't in the managed list get their own group.
  const orphanCats = Array.from(new Set(bikes.map(b => b.category).filter(c => !seen.has(c))));
  for (const cat of orphanCats) {
    groups.push({ category: cat || 'Uncategorized', items: bikes.filter(b => b.category === cat) });
  }
  return groups;
}

/* ------------------------------------------------------------------ */
/*  Plates list view — every number plate in the fleet, flat          */
/* ------------------------------------------------------------------ */

function PlatesList({
  units,
  bikes,
  owners,
  onUpdate,
  onDelete,
}: {
  units: Unit[];
  bikes: Bike[];
  owners: Owner[];
  onUpdate: (id: string, patch: Partial<Pick<Unit, 'plate' | 'status' | 'ownerId' | 'notes'>>) => void;
  onDelete: (id: string) => void;
}) {
  const bikeById = new Map(bikes.map(b => [b.id, b]));
  const ownerById = new Map(owners.map(o => [o.id, o]));
  const available = units.filter(u => u.status === 'available').length;

  const rows = [...units].sort((a, b) => {
    const ma = bikeById.get(a.bikeId)?.title ?? '';
    const mb = bikeById.get(b.bikeId)?.title ?? '';
    return ma.localeCompare(mb) || a.plate.localeCompare(b.plate);
  });

  if (units.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-dark/50 mt-6">
        No number plates yet. Switch to <b>Models</b> and add bikes under a sub-category.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-dark/50 text-sm mb-3">
        {units.length} bike{units.length !== 1 ? 's' : ''} · {available} available
      </p>
      <div className="bg-white rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="text-dark/40 text-[10px] uppercase tracking-widest border-b border-dark/10">
            <tr>
              <th className="text-left font-bold px-4 py-3">Plate</th>
              <th className="text-left font-bold px-4 py-3">Model</th>
              <th className="text-left font-bold px-4 py-3">Category</th>
              <th className="text-left font-bold px-4 py-3">Status</th>
              <th className="text-left font-bold px-4 py-3">Owner</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(u => {
              const bike = bikeById.get(u.bikeId);
              return (
                <tr key={u.id} className="border-b border-dark/5 last:border-0">
                  <td className="px-4 py-3 font-mono font-bold tracking-wide whitespace-nowrap">{u.plate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{bike?.title ?? '—'}</td>
                  <td className="px-4 py-3 text-dark/60 whitespace-nowrap">{bike?.category ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.status}
                      onChange={e => onUpdate(u.id, { status: e.target.value as UnitStatus })}
                      className={`text-xs font-bold rounded-full px-3 py-1.5 appearance-none cursor-pointer ${STATUS_STYLE[u.status]}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ownerById.has(u.ownerId) ? u.ownerId : ''}
                      onChange={e => onUpdate(u.id, { ownerId: e.target.value })}
                      className="text-xs bg-beige border border-dark/10 rounded-full px-3 py-1.5 max-w-[180px]"
                    >
                      <option value="">— no owner —</option>
                      {owners.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(u.id)}
                      title="Remove this bike"
                      className="text-red-600 hover:bg-red-50 rounded-full p-1.5 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Categories manager                                                */
/* ------------------------------------------------------------------ */

function CategoriesManager({
  categories,
  usage,
  onAdd,
  onDelete,
}: {
  categories: string[];
  usage: Record<string, number>;
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
}) {
  const [name, setName] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  }

  return (
    <div>
      <p className="text-dark/50 text-sm mb-4">A category in use can't be deleted.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {categories.length === 0 && <span className="text-dark/40 text-sm">No categories yet.</span>}
        {categories.map(c => (
          <span key={c} className="inline-flex items-center gap-2 bg-beige border border-dark/10 rounded-full pl-4 pr-2 py-1.5 text-sm font-bold">
            {c}
            <span className="text-dark/40 text-xs font-medium">{usage[c] ?? 0}</span>
            <button
              type="button"
              onClick={() => onDelete(c)}
              title={usage[c] ? `${usage[c]} bike(s) use this` : 'Delete category'}
              className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-dark/10 text-dark/50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="flex gap-2 max-w-sm">
        <input className="input" placeholder="e.g. Three Wheeler" value={name} onChange={e => setName(e.target.value)} />
        <button type="submit" className="btn-primary shrink-0" disabled={!name.trim()}>
          <Plus className="w-4 h-4" /> Add
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add-new bike                                                      */
/* ------------------------------------------------------------------ */

const emptyDraft = (category: string): BikeInput => ({
  title: '',
  category,
  pricePerDay: 0,
  image: '',
  features: [],
  active: true,
});

function AddBike({ categories, onCreate }: { categories: string[]; onCreate: (input: BikeInput) => Promise<void> }) {
  const [draft, setDraft] = useState<BikeInput>(emptyDraft(categories[0] ?? ''));
  const [featureText, setFeatureText] = useState('');
  const [busy, setBusy] = useState(false);

  // Default the category once the list arrives.
  useEffect(() => {
    setDraft(d => (d.category ? d : { ...d, category: categories[0] ?? '' }));
  }, [categories]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setBusy(true);
    try {
      await onCreate({ ...draft, features: linesToFeatures(featureText) });
      setDraft(emptyDraft(categories[0] ?? ''));
      setFeatureText('');
    } catch {
      /* error surfaced by parent */
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <p className="text-dark/50 text-sm mb-4">You add the individual bikes by plate afterwards, from the sub-category's card.</p>
      <BikeFields draft={draft} setDraft={setDraft} categories={categories} featureText={featureText} setFeatureText={setFeatureText} />
      <div className="flex justify-end mt-6">
        <button type="submit" className="btn-primary" disabled={busy || !draft.title.trim()}>
          {busy ? 'Adding…' : 'Add sub-category'}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Editable row                                                      */
/* ------------------------------------------------------------------ */

function BikeRow({
  bike,
  categories,
  units,
  owners,
  onSave,
  onDelete,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
}: {
  bike: Bike;
  categories: string[];
  units: Unit[];
  owners: Owner[];
  onSave: (id: string, patch: Partial<BikeInput>) => Promise<void>;
  onDelete: (id: string) => void;
  onAddUnit: (bikeId: string, plate: string, status: UnitStatus, ownerId: string) => void;
  onUpdateUnit: (id: string, patch: Partial<Pick<Unit, 'plate' | 'status' | 'ownerId' | 'notes'>>) => void;
  onDeleteUnit: (id: string) => void;
}) {
  const [draft, setDraft] = useState<BikeInput>(bike);
  const [featureText, setFeatureText] = useState(featuresToLines(bike.features));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(bike);
    setFeatureText(featuresToLines(bike.features));
  }, [bike]);

  const features = linesToFeatures(featureText);
  const dirty =
    draft.title !== bike.title ||
    draft.category !== bike.category ||
    draft.pricePerDay !== bike.pricePerDay ||
    draft.image !== bike.image ||
    draft.active !== bike.active ||
    JSON.stringify(features) !== JSON.stringify(bike.features);

  async function save() {
    setBusy(true);
    await onSave(bike.id, {
      title: draft.title,
      category: draft.category,
      pricePerDay: draft.pricePerDay,
      image: draft.image,
      features,
      active: draft.active,
    });
    setBusy(false);
  }

  return (
    <div className={`bg-white rounded-2xl p-5 md:p-6 transition-opacity ${draft.active ? '' : 'opacity-60'}`}>
      <BikeFields draft={draft} setDraft={setDraft} categories={categories} featureText={featureText} setFeatureText={setFeatureText} />

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
        <span className="text-xs text-dark/40 font-mono">{bike.id}</span>

        <div className="ml-auto flex gap-2">
          <button type="button" onClick={save} disabled={!dirty || busy} className="btn-primary text-sm py-2">
            <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(bike.id)}
            className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <UnitsPanel
        units={units}
        owners={owners}
        onAdd={(plate, status, ownerId) => onAddUnit(bike.id, plate, status, ownerId)}
        onUpdate={onUpdateUnit}
        onDelete={onDeleteUnit}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Units panel — individual bikes (number plates) under a model      */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: UnitStatus[] = ['available', 'rented', 'maintenance'];
const STATUS_LABEL: Record<UnitStatus, string> = { available: 'Available', rented: 'Rented', maintenance: 'Maintenance' };
const STATUS_STYLE: Record<UnitStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  rented: 'bg-amber-100 text-amber-800',
  maintenance: 'bg-dark/10 text-dark/60',
};

function UnitsPanel({
  units,
  owners,
  onAdd,
  onUpdate,
  onDelete,
}: {
  units: Unit[];
  owners: Owner[];
  onAdd: (plate: string, status: UnitStatus, ownerId: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<Unit, 'plate' | 'status' | 'ownerId' | 'notes'>>) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(units.length > 0);
  const [plate, setPlate] = useState('');
  const [status, setStatus] = useState<UnitStatus>('available');
  const [ownerId, setOwnerId] = useState('');

  const available = units.filter(u => u.status === 'available').length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = plate.trim();
    if (!p) return;
    onAdd(p, status, ownerId);
    setPlate('');
    setStatus('available');
    setOwnerId('');
  }

  return (
    <div className="mt-4 pt-4 border-t border-dark/10">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex items-center gap-2 text-sm font-bold">
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Bikes — {units.length} plate{units.length !== 1 ? 's' : ''}
        <span className="text-dark/40 font-medium">· {available} available</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {units.length === 0 && (
            <p className="text-dark/40 text-sm">No bikes yet. Add each physical bike by its number plate below.</p>
          )}
          {units.map(u => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 bg-beige rounded-xl px-4 py-2.5">
              <span className="font-mono font-bold tracking-wide">{u.plate}</span>
              <select
                value={u.status}
                onChange={e => onUpdate(u.id, { status: e.target.value as UnitStatus })}
                className={`text-xs font-bold rounded-full px-3 py-1.5 appearance-none cursor-pointer ${STATUS_STYLE[u.status]}`}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
              <select
                value={owners.some(o => o.id === u.ownerId) ? u.ownerId : ''}
                onChange={e => onUpdate(u.id, { ownerId: e.target.value })}
                title="Owner"
                className="text-xs bg-white border border-dark/10 rounded-full px-3 py-1.5 max-w-[160px]"
              >
                <option value="">— no owner —</option>
                {owners.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onDelete(u.id)}
                title="Remove this bike"
                className="ml-auto text-red-600 hover:bg-red-50 rounded-full p-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <form onSubmit={submit} className="flex flex-wrap gap-2 items-center pt-1">
            <input
              className="input max-w-[180px] font-mono"
              placeholder="WP CAB-1234"
              value={plate}
              onChange={e => setPlate(e.target.value)}
            />
            <select value={status} onChange={e => setStatus(e.target.value as UnitStatus)} className="input max-w-[150px]">
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <select value={ownerId} onChange={e => setOwnerId(e.target.value)} className="input max-w-[170px]">
              <option value="">— no owner —</option>
              {owners.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <button type="submit" className="btn-primary text-sm py-2" disabled={!plate.trim()}>
              <Plus className="w-4 h-4" /> Add bike
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared field group                                                */
/* ------------------------------------------------------------------ */

function BikeFields({
  draft,
  setDraft,
  categories,
  featureText,
  setFeatureText,
}: {
  draft: BikeInput;
  setDraft: (d: BikeInput) => void;
  categories: string[];
  featureText: string;
  setFeatureText: (s: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-2">
        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-beige border border-dark/10">
          {draft.image ? (
            <img src={draft.image} alt={draft.title || 'bike'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dark/30 text-xs">No image</div>
          )}
        </div>
      </div>

      <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-12 gap-4">
        <label className="md:col-span-5 space-y-2 block">
          <span className="label">Title</span>
          <input className="input" placeholder="Honda Dio 110cc" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
        </label>
        <div className="md:col-span-4">
          <CategorySelect value={draft.category} categories={categories} onChange={v => setDraft({ ...draft, category: v })} />
        </div>
        <label className="md:col-span-3 space-y-2 block">
          <span className="label">Price / day ($)</span>
          <input
            type="number"
            min={0}
            step="0.5"
            className="input"
            value={draft.pricePerDay}
            onChange={e => setDraft({ ...draft, pricePerDay: Number(e.target.value) })}
          />
        </label>
        <label className="md:col-span-12 space-y-2 block">
          <span className="label">Image URL</span>
          <input className="input" placeholder="https://…" value={draft.image} onChange={e => setDraft({ ...draft, image: e.target.value })} />
        </label>
        <label className="md:col-span-12 space-y-2 block">
          <span className="label">Features (one per line)</span>
          <textarea
            className="input min-h-[88px] resize-y"
            placeholder={'Automatic\nFuel efficient\nHelmet included'}
            value={featureText}
            onChange={e => setFeatureText(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

function CategorySelect({ value, categories, onChange }: { value: string; categories: string[]; onChange: (v: string) => void }) {
  // Always show the bike's current category, even if it was later removed from the list.
  const options = value && !categories.includes(value) ? [value, ...categories] : categories;
  return (
    <div className="space-y-2">
      <span className="label">Category</span>
      <select className="input" value={value} onChange={e => onChange(e.target.value)}>
        {options.length === 0 && <option value="">— add a category —</option>}
        {options.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

/* ---- helpers ---- */
const linesToFeatures = (text: string): string[] => text.split('\n').map(s => s.trim()).filter(Boolean);
const featuresToLines = (features: string[]): string => features.join('\n');
