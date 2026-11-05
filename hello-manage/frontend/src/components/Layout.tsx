import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CalendarCheck, CalendarDays, Tag, Bike, Users, LogOut, Store, Wallet, LayoutDashboard, Settings as SettingsIcon, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeChoice } from '../lib/theme';
import { MotionConfig } from 'motion/react';
import { TabPanel } from './ui';

const THEMES: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: 'system', label: 'Match system', icon: Monitor },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
];

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/walk-in', label: 'Walk-in', icon: Store },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/fleet', label: 'Fleet', icon: Bike },
  { to: '/owners', label: 'Owners', icon: Users },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/extras', label: 'Extras', icon: Tag },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Layout({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const { pathname } = useLocation();
  const [theme, setTheme] = useTheme();
  // The calendar timeline wants the full screen width; other pages read better capped.
  const fullWidth = pathname === '/calendar';
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar — a macOS-style source list: frosted, light, pinned on desktop. */}
      <aside className="no-print md:w-60 md:shrink-0 bg-card/70 backdrop-blur-xl backdrop-saturate-150 border-b md:border-b-0 md:border-r border-dark/[0.08] flex md:flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto z-30">
        <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-[9px] bg-gradient-to-b from-[#3395FF] to-brand text-white grid place-items-center text-[13px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
            HR
          </span>
          <span className="hidden md:block leading-tight">
            <span className="block text-[14px] font-semibold">Hello Manage</span>
            <span className="block text-[11px] text-dark/45">Hello Rent · Weligama</span>
          </span>
        </div>
        {/* On desktop this is the usual column; on mobile it scrolls sideways
            as a strip, so the far end of it is reachable. */}
        <nav className="flex md:flex-col gap-0.5 px-3 flex-1 overflow-x-auto md:overflow-x-visible items-center md:items-stretch">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-colors shrink-0 ${
                  isActive ? 'bg-dark/[0.07] text-dark' : 'text-dark/75 hover:bg-dark/[0.04]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-[17px] h-[17px] ${isActive ? 'text-brand' : 'text-brand/80'}`} strokeWidth={1.9} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        {/* Appearance — System / Light / Dark, like macOS. */}
        <div
          role="radiogroup"
          aria-label="Appearance"
          className="hidden md:flex mx-3 mt-3 gap-0.5 p-[3px] rounded-[9px] bg-dark/[0.06]"
        >
          {THEMES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={theme === id}
              aria-label={label}
              title={label}
              onClick={() => setTheme(id)}
              className={`flex-1 grid place-items-center py-1.5 rounded-[7px] transition-all ${
                theme === id
                  ? 'bg-card dark:bg-[#636366]/70 text-dark shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                  : 'text-dark/50 hover:text-dark'
              }`}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          ))}
        </div>
        <button
          onClick={onLogout}
          className="m-3 flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium text-dark/60 hover:bg-dark/[0.04] hover:text-dark transition-colors shrink-0"
        >
          <LogOut className="w-[17px] h-[17px]" strokeWidth={1.9} /> Sign out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-6 md:p-10">
        {/* Each page fades in as you move between sidebar tabs. MotionConfig makes every
            animation respect the OS "reduce motion" setting. */}
        <MotionConfig reducedMotion="user">
          <TabPanel tabKey={pathname} variant="page" className={`pt-2.5 ${fullWidth ? '' : 'max-w-5xl'}`}>
            {children}
          </TabPanel>
        </MotionConfig>
      </main>
    </div>
  );
}
