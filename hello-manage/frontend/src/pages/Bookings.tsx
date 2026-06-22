import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Check, X, Trash2, Calendar, MapPin, Mail, Phone } from 'lucide-react';
import {
  fetchBookings,
  setBookingStatus,
  deleteBooking,
  UnauthorizedError,
  type Booking,
  type BookingStatus,
} from '../lib/api';

const statusStyles: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

const FILTERS: ('all' | BookingStatus)[] = ['all', 'pending', 'confirmed', 'cancelled'];

export default function Bookings({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setBookings(await fetchBookings());
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: string, status: BookingStatus) {
    try {
      const updated = await setBookingStatus(id, status);
      setBookings(prev => prev.map(b => (b.id === id ? updated : b)));
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <span className="eyebrow">[ Bookings ]</span>
          <h1 className="display-xl text-4xl md:text-5xl mt-2">Manage bookings</h1>
        </div>
        <button onClick={load} className="btn-outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
              filter === f ? 'bg-dark text-white' : 'bg-white text-dark border border-dark/10 hover:border-dark/30'
            }`}
          >
            {f} <span className="opacity-50">({counts[f]})</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {loading ? (
        <p className="text-dark/50">Loading bookings…</p>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-dark/50">No bookings here yet.</div>
      ) : (
        <div className="space-y-4">
          {visible.map(b => (
            <div key={b.id} className="bg-white rounded-2xl p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display font-bold tracking-wide">{b.reference}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusStyles[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="font-bold">{b.bikeTitle}</p>
                  <p className="text-sm text-dark/50">
                    {b.renter.firstName} {b.renter.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-black text-brand">${b.total}</p>
                  <p className="text-[10px] text-dark/40 uppercase tracking-wide">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-4 border-t border-dark/10 text-sm text-dark/60">
                <Detail icon={Calendar} text={`${b.pickupDate} → ${b.dropoffDate} (${b.days}d)`} />
                <Detail icon={MapPin} text={b.pickupLocation} />
                <Detail icon={Mail} text={b.renter.email} />
                <Detail icon={Phone} text={b.renter.phone} />
              </div>

              {b.extras.length > 0 && (
                <p className="text-xs text-dark/40 mt-3">Extras: {b.extras.map(e => e.label).join(', ')}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-5">
                {b.status !== 'confirmed' && (
                  <button
                    onClick={() => changeStatus(b.id, 'confirmed')}
                    className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white hover:brightness-110 transition"
                  >
                    <Check className="w-4 h-4" /> Confirm
                  </button>
                )}
                {b.status !== 'cancelled' && (
                  <button
                    onClick={() => changeStatus(b.id, 'cancelled')}
                    className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-dark/5 text-dark hover:bg-dark/10 transition"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
                <button
                  onClick={() => remove(b.id)}
                  className="text-sm font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-red-600 hover:bg-red-50 transition ml-auto"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-brand shrink-0" /> {text}
    </span>
  );
}
