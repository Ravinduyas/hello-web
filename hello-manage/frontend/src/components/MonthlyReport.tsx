import { money } from '../lib/money';
import { monthLabel, type MonthlyReport, type OwnerSection } from '../lib/report';

/**
 * A month's statement, laid out to be printed.
 *
 * It is a document rather than a screen: no controls inside it, nothing that
 * only makes sense while hovering, and every figure spelled out, because the
 * copy an owner keeps has to answer its own questions with nobody to ask.
 * `print-report` is what the print stylesheet keeps; everything else on the
 * page is hidden when this goes to paper or PDF.
 */
export default function MonthlyReportDoc({ report, shop }: { report: MonthlyReport; shop: string }) {
  return (
    <div className="print-report bg-white text-dark rounded-2xl p-8 md:p-10">
      <header className="flex items-start justify-between gap-6 border-b-2 border-dark pb-4 mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand">Monthly statement</p>
          <h2 className="font-display text-3xl font-black mt-1">{monthLabel(report.month)}</h2>
          <p className="text-xs text-dark/50 mt-1">
            {report.from} to {report.to} · by pickup date · confirmed rentals only
          </p>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-lg">{shop}</p>
          <p className="text-xs text-dark/50">Generated {new Date().toLocaleDateString()}</p>
        </div>
      </header>

      {/* The month in five figures, before anyone turns the page. */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <Figure label="Rentals" value={String(report.rentals)} />
        <Figure label="Revenue" value={money(report.revenue)} />
        <Figure label="Collected" value={money(report.paid)} />
        <Figure label="Outstanding" value={money(report.due)} tone={report.due > 0 ? 'owed' : undefined} />
        <Figure label="Owner payouts" value={money(report.payout)} tone="accent" />
      </div>

      {report.sections.map(section => (
        <OwnerBlock key={section.owner?.id ?? 'unassigned'} section={section} />
      ))}

      {report.unplated.length > 0 && (
        <section className="break-inside-avoid mb-8">
          <h3 className="font-display text-lg font-bold border-b border-dark/20 pb-2 mb-3">
            Confirmed without a plate
          </h3>
          <p className="text-xs text-dark/50 mb-3">
            These rentals belong to no machine, so they are in the month's revenue but in nobody's payout.
          </p>
          <BookingTable bookings={report.unplated} />
        </section>
      )}

      <footer className="border-t border-dark/20 pt-4 mt-8 text-xs text-dark/50 space-y-1">
        <p>
          Revenue is the agreed rental total. Collected is what has actually been received; outstanding is the
          remainder. Commission is the shop's share, payout the owner's.
        </p>
        {(report.excluded.pending > 0 || report.excluded.cancelled > 0) && (
          <p>
            Not counted this month: {report.excluded.pending} booking(s) still pending and{' '}
            {report.excluded.cancelled} cancelled.
          </p>
        )}
      </footer>
    </div>
  );
}

function OwnerBlock({ section }: { section: OwnerSection }) {
  const { owner, commission } = section;
  return (
    <section className="mb-8 break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-dark/20 pb-2 mb-3">
        <h3 className="font-display text-lg font-bold">{owner ? owner.name : 'Unassigned machines'}</h3>
        <p className="text-xs text-dark/50">
          {owner ? (
            <>
              {owner.phone && <>{owner.phone} · </>}
              Commission {owner.commissionPct}%{owner.commissionFlat > 0 && <> + {money(owner.commissionFlat)}/rental</>}
            </>
          ) : (
            'No owner on record'
          )}
        </p>
      </div>

      {section.plates.map(p => (
        <div key={p.unitId} className="mb-4 break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
            <p className="font-bold text-sm">
              {p.plate} <span className="font-normal text-dark/50">· {p.model}</span>
            </p>
            <p className="text-xs tabular-nums text-dark/60">
              {p.rentals} rental{p.rentals === 1 ? '' : 's'} · {p.days} day{p.days === 1 ? '' : 's'} ·{' '}
              <b className="text-dark">{money(p.revenue)}</b>
            </p>
          </div>
          {p.bookings.length ? (
            <BookingTable bookings={p.bookings} />
          ) : (
            <p className="text-xs text-dark/40 italic">No rentals this month.</p>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 text-xs bg-beige rounded-xl px-4 py-3 mt-3">
        <span className="text-dark/50">
          Revenue <b className="text-dark tabular-nums">{money(section.revenue)}</b>
        </span>
        <span className="text-dark/50">
          Collected <b className="text-dark tabular-nums">{money(section.paid)}</b>
        </span>
        {section.due > 0 && (
          <span className="text-dark/50">
            Outstanding <b className="text-red-700 tabular-nums">{money(section.due)}</b>
          </span>
        )}
        {commission && (
          <>
            <span className="text-dark/50">
              Commission <b className="text-dark tabular-nums">{money(commission.commission)}</b>
            </span>
            <span className="font-bold">
              Payout <b className="font-display text-base text-brand tabular-nums">{money(commission.payout)}</b>
            </span>
          </>
        )}
      </div>
    </section>
  );
}

function BookingTable({ bookings }: { bookings: { id: string; reference: string; pickupDate: string; dropoffDate: string; days: number; total: number; renter: { firstName: string; lastName: string }; payments: { amount: number }[] }[] }) {
  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="text-dark/45 border-b border-dark/10">
          <th className="text-left font-bold py-1.5 pr-3">Ref</th>
          <th className="text-left font-bold py-1.5 pr-3">Customer</th>
          <th className="text-left font-bold py-1.5 pr-3">Out</th>
          <th className="text-left font-bold py-1.5 pr-3">Back</th>
          <th className="text-right font-bold py-1.5 pr-3">Days</th>
          <th className="text-right font-bold py-1.5 pr-3">Revenue</th>
          <th className="text-right font-bold py-1.5 pr-3">Paid</th>
          <th className="text-right font-bold py-1.5">Due</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map(b => {
          const paid = b.payments.reduce((s, p) => s + p.amount, 0);
          const due = Math.max(0, b.total - paid);
          return (
            <tr key={b.id} className="border-b border-dark/5 last:border-0">
              <td className="py-1.5 pr-3 font-display font-bold">{b.reference}</td>
              <td className="py-1.5 pr-3">
                {b.renter.firstName} {b.renter.lastName}
              </td>
              <td className="py-1.5 pr-3 tabular-nums">{b.pickupDate}</td>
              <td className="py-1.5 pr-3 tabular-nums">{b.dropoffDate}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums">{b.days}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums">{money(b.total)}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums">{money(paid)}</td>
              <td className={`py-1.5 text-right tabular-nums ${due > 0 ? 'text-red-700 font-bold' : 'text-dark/40'}`}>
                {money(due)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: 'owed' | 'accent' }) {
  return (
    <div className="border border-dark/10 rounded-xl px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-widest text-dark/40">{label}</p>
      <p
        className={`font-display text-lg font-black tabular-nums mt-0.5 ${
          tone === 'owed' ? 'text-red-700' : tone === 'accent' ? 'text-brand' : 'text-dark'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
