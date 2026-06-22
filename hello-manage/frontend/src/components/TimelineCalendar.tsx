import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, Bike, BookingStatus } from '../lib/api';

/* Resource-timeline calendar: one row per bike model, each booking a bar
   spanning its rental days, stacked into lanes when they overlap. */

const DAY = 86_400_000;
const COL = 52; // px per day column
const LABEL_W = 168; // px, left resource column
const BAR_H = 34;
const LANE_GAP = 4;
const WIN = 28; // days visible

const WD = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const parseISO = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const mondayOf = (t: number) => { const d = new Date(t); const off = (d.getDay() + 6) % 7; return midnight(d) - off * DAY; };

const barStyle: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-500 text-white border-emerald-700',
  pending: 'bg-amber-400 text-amber-950 border-amber-600',
  cancelled: 'bg-dark/15 text-dark/50 border-dark/20 line-through',
};

interface Placed { booking: Booking; startIdx: number; endIdx: number; lane: number; }

export default function TimelineCalendar({ bookings, bikes }: { bookings: Booking[]; bikes: Bike[] }) {
  const today = midnight(new Date());
  const [start, setStart] = useState(() => mondayOf(today));

  const days = useMemo(() => Array.from({ length: WIN }, (_, i) => start + i * DAY), [start]);
  const windowEnd = start + (WIN - 1) * DAY;
  const todayIso = isoOf(today);

  // Rows: every model (so empty rows still read as "free"). Falls back to any
  // models referenced by bookings but missing from the fleet list.
  const models = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of bikes) map.set(b.id, b.title);
    for (const bk of bookings) if (!map.has(bk.bikeId)) map.set(bk.bikeId, bk.bikeTitle);
    return [...map].map(([id, title]) => ({ id, title }));
  }, [bikes, bookings]);

  // Lay bookings out per model into non-overlapping lanes within the window.
  const rows = useMemo(() => {
    return models.map(model => {
      const items = bookings
        .filter(b => b.bikeId === model.id && parseISO(b.dropoffDate) >= start && parseISO(b.pickupDate) <= windowEnd)
        .map(b => {
          const s = Math.max(parseISO(b.pickupDate), start);
          const e = Math.min(parseISO(b.dropoffDate), windowEnd);
          return { booking: b, startIdx: Math.round((s - start) / DAY), endIdx: Math.round((e - start) / DAY) };
        })
        .sort((a, b) => a.startIdx - b.startIdx);

      const laneEnds: number[] = [];
      const placed: Placed[] = [];
      for (const it of items) {
        let lane = laneEnds.findIndex(end => end < it.startIdx);
        if (lane === -1) { lane = laneEnds.length; laneEnds.push(it.endIdx); } else { laneEnds[lane] = it.endIdx; }
        placed.push({ ...it, lane });
      }
      return { model, placed, lanes: Math.max(1, laneEnds.length) };
    });
  }, [models, bookings, start, windowEnd]);

  const shift = (deltaDays: number) => setStart(s => s + deltaDays * DAY);
  const monthLabel = (() => {
    const a = new Date(start), b = new Date(windowEnd);
    return a.getMonth() === b.getMonth()
      ? `${MONTHS[a.getMonth()]} ${a.getFullYear()}`
      : `${MONTHS[a.getMonth()]} – ${MONTHS[b.getMonth()]} ${b.getFullYear()}`;
  })();

  const gridBg = `repeating-linear-gradient(to right, transparent 0, transparent ${COL - 1}px, rgba(46,33,27,0.07) ${COL - 1}px, rgba(46,33,27,0.07) ${COL}px)`;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold">{monthLabel}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setStart(mondayOf(today))} className="text-sm font-bold px-3 py-1.5 rounded-full bg-dark/5 hover:bg-dark/10 transition-colors">Today</button>
          <button onClick={() => shift(-7)} aria-label="Previous week" className="w-9 h-9 rounded-full border border-dark/10 flex items-center justify-center hover:bg-dark/5 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => shift(7)} aria-label="Next week" className="w-9 h-9 rounded-full border border-dark/10 flex items-center justify-center hover:bg-dark/5 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-dark/10 bg-white">
        <div style={{ width: LABEL_W + WIN * COL, minWidth: '100%' }}>
          {/* Day header */}
          <div className="flex border-b border-dark/10">
            <div className="sticky left-0 z-20 bg-white shrink-0 border-r border-dark/10" style={{ width: LABEL_W }}>
              <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-dark/40">Model</div>
            </div>
            <div className="flex">
              {days.map(t => {
                const d = new Date(t);
                const weekend = d.getDay() === 0 || d.getDay() === 6;
                const isToday = isoOf(t) === todayIso;
                return (
                  <div key={t} style={{ width: COL }} className={`shrink-0 text-center py-1.5 ${weekend ? 'bg-beige/50' : ''}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-dark/40">{WD[d.getDay()]}</div>
                    <div className={`text-xs font-bold mx-auto w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-brand text-white' : 'text-dark/70'}`}>{d.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resource rows */}
          {rows.map(({ model, placed, lanes }) => {
            const h = lanes * (BAR_H + LANE_GAP) + LANE_GAP;
            return (
              <div key={model.id} className="flex border-b border-dark/5 last:border-b-0">
                <div className="sticky left-0 z-10 bg-white shrink-0 border-r border-dark/10 flex items-center px-4" style={{ width: LABEL_W }}>
                  <p className="font-bold text-sm leading-tight">{model.title}</p>
                </div>
                <div className="relative shrink-0" style={{ width: WIN * COL, height: h, backgroundImage: gridBg }}>
                  {/* today column highlight */}
                  {days.map((t, i) => isoOf(t) === todayIso && (
                    <div key={t} className="absolute top-0 bottom-0 bg-brand/5 pointer-events-none" style={{ left: i * COL, width: COL }} />
                  ))}
                  {/* booking bars */}
                  {placed.map(({ booking: b, startIdx, endIdx, lane }) => (
                    <div
                      key={b.id}
                      title={`${b.reference} · ${b.bikeTitle}${b.plate ? ' · ' + b.plate : ''} · ${b.renter.firstName} ${b.renter.lastName} · ${b.pickupDate} → ${b.dropoffDate}`.trim()}
                      className={`absolute rounded-lg border-l-4 px-2 py-1 overflow-hidden shadow-sm ${barStyle[b.status]}`}
                      style={{ left: startIdx * COL + 2, width: (endIdx - startIdx + 1) * COL - 4, top: lane * (BAR_H + LANE_GAP) + LANE_GAP, height: BAR_H }}
                    >
                      <p className="text-[11px] font-bold leading-tight truncate">{b.reference}{b.plate ? ` · ${b.plate}` : ''}</p>
                      <p className="text-[10px] leading-tight truncate opacity-80">{b.renter.firstName} {b.renter.lastName}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4">
        {(['pending', 'confirmed', 'cancelled'] as BookingStatus[]).map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-dark/50">
            <span className={`w-3 h-3 rounded ${barStyle[s].split(' ')[0]}`} /> {s}
          </span>
        ))}
      </div>
    </div>
  );
}
