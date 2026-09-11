import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken, clearToken } from './lib/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WalkIn from './pages/WalkIn';
import Bookings from './pages/Bookings';
import Calendar from './pages/Calendar';
import Fleet from './pages/Fleet';
import Owners from './pages/Owners';
import Payouts from './pages/Payouts';
import Extras from './pages/Extras';
import Settings from './pages/Settings';

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  const logout = () => {
    clearToken();
    setAuthed(false);
  };

  return (
    <BrowserRouter>
      <Layout onLogout={logout}>
        <Routes>
          <Route path="/" element={<Dashboard onLogout={logout} />} />
          <Route path="/walk-in" element={<WalkIn onLogout={logout} />} />
          <Route path="/bookings" element={<Bookings onLogout={logout} />} />
          <Route path="/calendar" element={<Calendar onLogout={logout} />} />
          <Route path="/fleet" element={<Fleet onLogout={logout} />} />
          <Route path="/owners" element={<Owners onLogout={logout} />} />
          <Route path="/finance" element={<Payouts onLogout={logout} />} />
          <Route path="/payouts" element={<Navigate to="/finance" replace />} />
          <Route path="/extras" element={<Extras onLogout={logout} />} />
          <Route path="/settings" element={<Settings onLogout={logout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
