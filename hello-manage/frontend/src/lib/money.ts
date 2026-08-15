/**
 * Currency formatting for the admin. Hello Rent quotes every rate in euros, so
 * this is the one place the symbol lives — the public site has the matching
 * helper in `hello-web/src/data/fleet.ts`.
 */
export const CURRENCY = '€';

/** `money(12.5)` → "€12.50", `money(31)` → "€31" (trailing .00 dropped). */
export const money = (n: number) => `${CURRENCY}${n.toFixed(2).replace(/\.00$/, '')}`;
