import { useCallback, useEffect, useState } from 'react';
import { Mail, RefreshCw, Send, ShieldCheck, Check, AlertTriangle } from 'lucide-react';
import {
  fetchEmailSettings,
  saveEmailSettings,
  verifyEmailSettings,
  sendTestEmail,
  UnauthorizedError,
  type EmailSettings,
} from '../lib/api';
import { Loading, SkeletonPanel } from '../components/Skeleton';

/**
 * Where the shop changes its own email, without anyone editing a file.
 *
 * The password is the awkward part. The server never sends it back, so the
 * field is always blank and blank means "leave it alone"; a note says whether
 * one is stored. Saving a form should never be able to silently wipe a working
 * password just because the box it lives in could not be pre-filled.
 */
export default function Settings({ onLogout }: { onLogout: () => void }) {
  const [s, setS] = useState<EmailSettings | null>(null);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [testTo, setTestTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setS(await fetchEmailSettings());
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Could not load the email settings');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) =>
    setS(prev => (prev ? { ...prev, [key]: value } : prev));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;
    setBusy(true);
    setError('');
    setNote('');
    try {
      const { hasPassword: _drop, ...rest } = s;
      const saved = await saveEmailSettings({ ...rest, ...(pass ? { pass } : {}) });
      setS(saved);
      setPass('');
      setNote('Saved.');
    } catch (err) {
      if (err instanceof UnauthorizedError) return onLogout();
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    setBusy(true);
    setError('');
    setNote('');
    try {
      const r = await verifyEmailSettings();
      if (r.sent) setNote('Connected and signed in. The settings work.');
      else setError(r.error ?? 'Could not connect.');
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    if (!testTo.trim()) return;
    setBusy(true);
    setError('');
    setNote('');
    try {
      const r = await sendTestEmail(testTo.trim());
      if (r.sent) setNote(`Test sent to ${testTo.trim()}. Check the inbox, and the spam folder.`);
      else setError(r.error ?? (r.skipped === 'disabled' ? 'Email is switched off, or not configured yet.' : 'Not sent.'));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div>
        <span className="eyebrow">[ Settings ]</span>
        <div className="mt-6">
          <Loading label="Loading the email settings">
            <SkeletonPanel lines={8} />
          </Loading>
        </div>
      </div>
    );
  }

  if (!s) return <p className="text-red-600">{error || 'No settings available.'}</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="eyebrow">[ Settings ]</span>
          <h1 className="font-display text-2xl font-black mt-1">Email</h1>
        </div>
        <button onClick={() => load()} className="btn-outline" disabled={busy} aria-label="Reload">
          <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </p>
      )}
      {note && (
        <p className="flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
          <Check className="w-4 h-4 mt-0.5 shrink-0" /> {note}
        </p>
      )}

      <form onSubmit={save} className="space-y-4">
        {/* The switch first: everything under it is inert without it. */}
        <section className="bg-white rounded-2xl p-5 md:p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={s.enabled}
              onChange={e => set('enabled', e.target.checked)}
              className="mt-1 w-4 h-4 accent-brand"
            />
            <span>
              <span className="font-bold flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand" /> Send email from this system
              </span>
              <span className="block text-sm text-dark/50 mt-0.5">
                Off, nothing is sent to anyone — bookings and payments still work exactly as they do now.
              </span>
            </span>
          </label>
        </section>

        {/* Who it comes from: the part the shop actually wants to change. */}
        <section className="bg-white rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-lg font-bold mb-1">The address customers see</h2>
          <p className="text-xs text-dark/45 mb-5">This is what appears in their inbox, and where a reply goes.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="label">From name</span>
              <input value={s.fromName} onChange={e => set('fromName', e.target.value)} className="input mt-1" placeholder="Hello Rent" />
            </label>
            <label className="block">
              <span className="label">From address</span>
              <input
                type="email"
                value={s.fromEmail}
                onChange={e => set('fromEmail', e.target.value)}
                className="input mt-1"
                placeholder="hello@hellorentsrilanka.com"
              />
            </label>
            <label className="block">
              <span className="label">Reply-to (optional)</span>
              <input value={s.replyTo} onChange={e => set('replyTo', e.target.value)} className="input mt-1" placeholder="Same as the from address" />
            </label>
            <label className="block">
              <span className="label">Blind copy the shop (optional)</span>
              <input value={s.bcc} onChange={e => set('bcc', e.target.value)} className="input mt-1" placeholder="A copy of every message" />
            </label>
          </div>
        </section>

        {/* The transport. Filled in once, by whoever set the mailbox up. */}
        <section className="bg-white rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-lg font-bold mb-1">Mail server (SMTP)</h2>
          <p className="text-xs text-dark/45 mb-5">
            From whoever provides the mailbox — Google Workspace, Zoho, or the hosting company.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="label">Host</span>
              <input value={s.host} onChange={e => set('host', e.target.value)} className="input mt-1" placeholder="smtp.gmail.com" />
            </label>
            <label className="block">
              <span className="label">Port</span>
              <input
                type="number"
                value={s.port}
                onChange={e => set('port', Number(e.target.value) || 587)}
                className="input mt-1"
              />
              <span className="block text-[11px] text-dark/40 mt-1">587 for STARTTLS, 465 for TLS.</span>
            </label>
            <label className="block">
              <span className="label">Username</span>
              <input value={s.user} onChange={e => set('user', e.target.value)} className="input mt-1" autoComplete="off" />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="input mt-1"
                autoComplete="new-password"
                placeholder={s.hasPassword ? '•••••••• (saved — leave blank to keep)' : 'Not set'}
              />
              <span className="block text-[11px] text-dark/40 mt-1">
                {s.hasPassword
                  ? 'A password is stored. Leave this blank unless you are changing it.'
                  : 'No password stored yet.'}
              </span>
            </label>
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer text-sm">
            <input type="checkbox" checked={s.secure} onChange={e => set('secure', e.target.checked)} className="w-4 h-4 accent-brand" />
            Use TLS directly (tick this only for port 465)
          </label>
        </section>

        {/* What actually triggers a message. */}
        <section className="bg-white rounded-2xl p-5 md:p-6">
          <h2 className="font-display text-lg font-bold mb-4">When to send</h2>
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={s.sendOnConfirm} onChange={e => set('sendOnConfirm', e.target.checked)} className="mt-1 w-4 h-4 accent-brand" />
              <span>
                <b>When a booking is confirmed</b>
                <span className="block text-dark/50">
                  The customer gets their reference, dates, vehicle, and what is due at pickup.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={s.sendOnPayment} onChange={e => set('sendOnPayment', e.target.checked)} className="mt-1 w-4 h-4 accent-brand" />
              <span>
                <b>When a payment is recorded</b>
                <span className="block text-dark/50">A receipt for the amount taken, and what is left to pay.</span>
              </span>
            </label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save settings'}
          </button>
          <button type="button" onClick={check} className="btn-outline" disabled={busy}>
            <ShieldCheck className="w-4 h-4" /> Test the connection
          </button>
        </div>
      </form>

      {/* Proving it end to end: the connection can be fine and the mail still
          land in a spam folder, which only a real message will show. */}
      <section className="bg-white rounded-2xl p-5 md:p-6 mt-4">
        <h2 className="font-display text-lg font-bold mb-1">Send a test</h2>
        <p className="text-xs text-dark/45 mb-4">
          Sends a real message, so you can see how it arrives. Save your changes first.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="email"
            value={testTo}
            onChange={e => setTestTo(e.target.value)}
            placeholder="your@email.com"
            className="input max-w-xs"
          />
          <button onClick={test} className="btn-outline" disabled={busy || !testTo.trim()}>
            <Send className="w-4 h-4" /> Send test
          </button>
        </div>
      </section>
    </div>
  );
}
