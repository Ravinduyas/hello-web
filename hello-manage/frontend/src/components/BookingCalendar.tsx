import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, BookingStatus } from '../lib/api';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Local Y/M/D → "YYYY-MM-DD" (no UTC shift, unlike Date.toISOString). */
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const chipStyles: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-dark/5 text-dark/40 line-through',
};

export default function BookingCalendar({ bookings }: { bookings: Booking[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });

  // 6-week (42-cell) grid, Monday-first, with leading/trailing days from
  // neighbouring months so multi-day bookings read continuously.
  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const offset = (first.getDay() + 6) % 7; // Mon=0 … Sun=6
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(cursor.y, cursor.m, 1 - offset + i);
      return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate(), inMonth: d.getMonth() === cursor.m };
    });
  }, [cursor]);

  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate());
  const onDay = (dayIso: string) => bookings.filter(b => b.pickupDate <= dayIso && dayIso <= b.dropoffDate);
  const move = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl font-bold">
          {MONTHS[cursor.m]} {cursor.y}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}
            className="text-sm font-bold px-3 py-1.5 rounded-full bg-dark/5 hover:bg-dark/10 transition-colors"
          >
            Today
          </button>
          <button onClick={() => move(-1)} aria-label="Previous month" className="w-9 h-9 rounded-full border border-dark/10 flex items-center justify-center hover:bg-dark/5 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => move(1)} aria-label="Next month" className="w-9 h-9 rounded-full border border-dark/10 flex items-center justify-center hover:bg-dark/5 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-[10px] font-bold uppercase tracking-widest text-dark/40 pb-2 text-center">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-dark/10 rounded-xl overflow-hidden">
        {cells.map((c, i) => {
          const dayIso = iso(c.y, c.m, c.day);
          const list = onDay(dayIso);
          const isToday = dayIso === todayIso;
          return (
            <div key={i} className={`min-h-[84px] md:min-h-[104px] p-1.5 ${c.inMonth ? 'bg-white' : 'bg-beige/50'}`}>
              <div
                className={`text-xs font-bold mb-1 inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  isToday ? 'bg-brand text-white' : c.inMonth ? 'text-dark/70' : 'text-dark/30'
                }`}
              >
                {c.day}
              </div>
              <div className="space-y-1">
                {list.slice(0, 3).map(b => (
                  <div
                    key={b.id}
                    title={`${b.reference} · ${b.bikeTitle}${b.plate ? ' · ' + b.plate : ''} · ${b.renter.firstName} ${b.renter.lastName}`.trim()}
                    className={`truncate text-[10px] font-bold px-1.5 py-0.5 rounded ${chipStyles[b.status]}`}
                  >
                    {b.plate || b.bikeTitle}
                  </div>
                ))}
                {list.length > 3 && <div className="text-[10px] text-dark/40 px-1">+{list.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4">
        {(['pending', 'confirmed', 'cancelled'] as BookingStatus[]).map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-dark/50">
            <span className={`w-3 h-3 rounded ${chipStyles[s].split(' ')[0]}`} /> {s}
          </span>
        ))}
      </div>
    </div>
  );
}
