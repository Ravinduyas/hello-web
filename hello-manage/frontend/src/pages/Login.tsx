import { useState } from 'react';
import { Lock } from 'lucide-react';
import { login } from '../lib/api';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(username, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl p-8 md:p-10 shadow-sm">
        <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-brand" />
        </div>
        <span className="eyebrow">[ Hello Manage ]</span>
        <h1 className="font-display text-2xl font-bold mt-2 mb-6">Admin sign in</h1>

        <label className="block space-y-2 mb-4">
          <span className="label">Username</span>
          <input type="text" required autoFocus value={username} onChange={e => setUsername(e.target.value)} className="input" />
        </label>
        <label className="block space-y-2 mb-6">
          <span className="label">Password</span>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input" />
        </label>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
