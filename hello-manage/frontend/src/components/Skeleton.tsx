import type { ReactNode } from 'react';

/**
 * The shapes a page wears while it is waiting.
 *
 * Each one stands in for the thing that is coming, at roughly its size, so the
 * layout does not jump when the data lands and the wait says how much is on the
 * way. A row of grey bars is a better answer to "is this working?" than the
 * word "Loading".
 *
 * The whole group is announced once, politely: a screen reader should hear
 * "Loading bookings" and not eleven empty list items.
 */

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`skeleton block ${className}`} />;
}

/** Wraps a set of placeholders so assistive tech is told once what is happening. */
export function Loading({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="rise">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Cards stacked down the page — bookings, owners, models, extras. */
export function SkeletonCards({ count = 4, lines = 2 }: { count?: number; lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 md:p-6 rise"
          // Staggered, so the placeholders arrive as one movement down the page
          // rather than every card flashing in at the same instant.
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
          {Array.from({ length: lines }, (_, j) => (
            <Skeleton key={j} className={`h-3 mt-3 ${j % 2 ? 'w-1/2' : 'w-2/3'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** A row of headline figures. */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 rise" style={{ animationDelay: `${i * 60}ms` }}>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20 mt-3" />
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      ))}
    </div>
  );
}

/** A table, with its header bar and a few rows. */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 rise">
      <div className="flex gap-4 pb-3 border-b border-dark/10">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className={`h-3 ${i === 0 ? 'w-40' : 'flex-1'}`} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4 py-3.5 border-b border-dark/5 last:border-0">
          {Array.from({ length: cols }, (_, i) => (
            <Skeleton key={i} className={`h-3.5 ${i === 0 ? 'w-40' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** One panel of whatever shape, for the pages made of boxes. */
export function SkeletonPanel({ className = '', lines = 4 }: { className?: string; lines?: number }) {
  return (
    <div className={`bg-white rounded-2xl p-5 md:p-6 rise ${className}`}>
      <Skeleton className="h-5 w-40" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-3 mt-3 ${i % 3 === 2 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}
