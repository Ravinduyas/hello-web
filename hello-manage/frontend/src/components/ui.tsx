import { useEffect, useId, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

/**
 * Shared building blocks so every admin page has the same frame:
 * the same title, the same tab bar, the same spacing.
 */

/** The top of every page: a large title, a quiet subtitle, actions on the right. */
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Buttons and controls, right-aligned. */
  children?: ReactNode;
}) {
  return (
    <div className="no-print flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-semibold tracking-tight">{title}</h1>
        {subtitle && <div className="text-[13px] text-dark/50 mt-0.5 flex items-center gap-2">{subtitle}</div>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  /** A small count shown after the label. */
  count?: number;
}

/**
 * Apple-style segmented control: a grey track with the chosen segment raised
 * as a white pill. Used for every set of tabs or view switches in the admin.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className = '',
  fill = false,
}: {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Accessible name for the group. */
  label: string;
  className?: string;
  /** Stretch to the full width, segments sharing it equally (for narrow columns). */
  fill?: boolean;
}) {
  // One id per control, so its pill only ever slides within its own track.
  const pillId = useId();
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`no-print flex max-w-full ${fill ? 'w-full' : 'w-fit'} gap-0.5 p-[3px] rounded-[10px] bg-dark/[0.06] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {options.map(({ id, label: text, icon: Icon, count }) => {
        const on = value === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(id)}
            className={`relative flex items-center justify-center gap-1.5 ${fill ? 'flex-1 min-w-0 px-2' : 'px-3.5'} py-1.5 rounded-[8px] text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
              on ? 'text-dark' : 'text-dark/60 hover:text-dark'
            }`}
          >
            {/* The raised pill slides between segments, as on iOS / macOS. */}
            {on && (
              <motion.span
                layoutId={pillId}
                aria-hidden
                className="absolute inset-0 rounded-[8px] bg-card dark:bg-[#636366]/70 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)]"
                transition={{ type: 'spring', stiffness: 520, damping: 26, mass: 0.75 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 min-w-0">
            {Icon && <Icon className={`w-3.5 h-3.5 ${on ? 'text-brand' : ''}`} />}
            {text}
            {count !== undefined && <span className="text-[11px] tabular-nums text-dark/40">{count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Content under a set of tabs, with a less ordinary entrance.
 *
 *  - variant "page" — a focus pull: the page arrives a touch large and out of
 *    focus, then sharpens into place, like a camera lens racking focus.
 *  - variant "tab"  — a directional shutter: content sweeps in from the side
 *    of the tab you moved toward, skewed and motion-blurred, then settles.
 *    Pass `order` (the tab's index) so it knows which way you went.
 *
 * Filter and transform are cleared the moment the animation ends — either one
 * left in place would trap fixed-position drawers inside this element.
 */
export function TabPanel({
  tabKey,
  children,
  className = '',
  variant = 'tab',
  order,
}: {
  tabKey: string;
  children: ReactNode;
  className?: string;
  variant?: 'page' | 'tab';
  order?: number;
}) {
  const prev = useRef(order);
  const dir = order !== undefined && prev.current !== undefined && order < prev.current ? -1 : 1;
  useEffect(() => {
    prev.current = order;
  }, [order]);

  const initial =
    variant === 'page'
      ? { opacity: 0, scale: 1.025, filter: 'blur(14px)' }
      : { opacity: 0, x: 36 * dir, skewX: -5 * dir, filter: 'blur(6px)' };
  const animate =
    variant === 'page'
      ? { opacity: 1, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }
      : { opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } };

  return (
    <motion.div
      key={tabKey}
      initial={initial}
      animate={animate}
      transition={
        variant === 'page'
          ? { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
          : { type: 'spring', stiffness: 380, damping: 32, mass: 0.7, filter: { duration: 0.25 }, opacity: { duration: 0.2 } }
      }
      style={{ transformOrigin: variant === 'page' ? '50% 0%' : dir > 0 ? '100% 50%' : '0% 50%' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
