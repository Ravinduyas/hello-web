import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { fetchBookings, fetchBikes, fetchUnits, UnauthorizedError, type Booking, type Bike, type Unit } from '../lib/api';
import TimelineCalendar from '../components/TimelineCalendar';

export default function Calendar({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [b, bk, u] = await Promise.all([fetchBookings(), fetchBikes(), fetchUnits()]);
      setBookings(b);
      setBikes(bk);
      setUnits(u);
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
        <button onClick={load} className="btn-outline" disabled={loading} aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">{error}</p>}

      {loading ? <p className="text-dark/50">Loading calendar…</p> : <TimelineCalendar bookings={bookings} bikes={bikes} units={units} />}
    </div>
  );
}
