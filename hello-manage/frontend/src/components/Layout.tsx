import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CalendarCheck, CalendarDays, Tag, Bike, Users, LogOut, Store } from 'lucide-react';

const nav = [
  { to: '/walk-in', label: 'Walk-in', icon: Store },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/fleet', label: 'Fleet', icon: Bike },
  { to: '/owners', label: 'Owners', icon: Users },
  { to: '/extras', label: 'Extras', icon: Tag },
];

export default function Layout({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const { pathname } = useLocation();
  // The calendar timeline wants the full screen width; other pages read better capped.
  const fullWidth = pathname === '/calendar';
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 bg-dark text-beige md:min-h-screen flex md:flex-col">
        <div className="p-6 flex items-center font-display font-bold text-xl tracking-tight uppercase">
          Hello Manage<span className="text-brand">.</span>
        </div>
        <nav className="flex md:flex-col gap-1 px-3 md:px-4 flex-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  isActive ? 'bg-brand text-white' : 'text-beige/70 hover:bg-white/5 hover:text-beige'
                }`
              }
            >
              <Icon className="w-4 h-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="m-3 md:m-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-beige/70 hover:bg-white/5 hover:text-beige transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 p-6 md:p-10">
        <div className={fullWidth ? '' : 'max-w-5xl'}>{children}</div>
      </main>
    </div>
  );
}
