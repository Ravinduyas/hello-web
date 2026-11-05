import { useEffect, useState } from 'react';

/**
 * Light / dark appearance, the Apple way: follow the system unless the user
 * picks one. The choice lives in localStorage; index.html applies it before
 * the first paint so there is no white flash on a dark screen.
 */
export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'hm-theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

function apply(choice: ThemeChoice) {
  const dark = choice === 'dark' || (choice === 'system' && media().matches);
  document.documentElement.classList.toggle('dark', dark);
}

export function useTheme(): [ThemeChoice, (c: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>(
    () => (localStorage.getItem(KEY) as ThemeChoice | null) ?? 'system',
  );

  useEffect(() => {
    apply(choice);
    if (choice === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
    // While following the system, follow it live (e.g. macOS auto at sunset).
    if (choice !== 'system') return;
    const m = media();
    const onChange = () => apply('system');
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [choice]);

  return [choice, setChoice];
}
