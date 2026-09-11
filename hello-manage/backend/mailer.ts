import nodemailer, { type Transporter } from 'nodemailer';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getEmailSettings, isSendable, type EmailSettings } from './settings.ts';
import type { Booking } from './types.ts';

/**
 * Sending mail, and the messages worth sending.
 *
 * Nothing here throws into a request. A booking is confirmed whether or not the
 * shop's mail host is reachable, and a customer standing at the counter should
 * not see a rental fail because an SMTP password expired. Every send is
 * attempted, logged, and reported back as a result the caller may ignore.
 *
 * The transport is rebuilt whenever the settings change rather than held
 * forever, because the settings are editable in the admin and a cached
 * connection would keep using the old ones until a restart.
 */

export interface SendResult {
  sent: boolean;
  /** Why not, when not — shown in the admin for a test send. */
  error?: string;
  skipped?: 'disabled' | 'no-address';
}

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The logo travels with the message rather than being linked.
 *
 * Gmail hides remote images from a sender it does not know until someone
 * clicks "display images" — and the first email a customer ever gets is
 * precisely when the sender is unknown. Attached, it shows immediately.
 * Read once at startup; it is 27 KB and never changes at runtime.
 */
const LOGO = (() => {
  try {
    return readFileSync(join(here, 'assets', 'logo.png'));
  } catch {
    return null;
  }
})();

let cached: { key: string; transport: Transporter } | null = null;

/** Identifies a configuration, so a changed setting builds a new transport. */
const keyOf = (s: EmailSettings) => [s.host, s.port, s.secure, s.user, s.pass].join('|');

function transportFor(s: EmailSettings): Transporter {
  const key = keyOf(s);
  if (cached?.key === key) return cached.transport;
  const transport = nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.secure,
    auth: s.user ? { user: s.user, pass: s.pass } : undefined,
  });
  cached = { key, transport };
  return transport;
}

/** Proves the settings work, without sending anything to a customer. */
export async function verifyEmail(): Promise<SendResult> {
  const s = await getEmailSettings();
  if (!isSendable(s)) {
    return { sent: false, skipped: 'disabled', error: 'Email is off, or the host and from-address are not set.' };
  }
  try {
    await transportFor(s).verify();
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function send(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  const s = await getEmailSettings();
  if (!isSendable(s)) return { sent: false, skipped: 'disabled' };
  if (!to) return { sent: false, skipped: 'no-address' };

  try {
    await transportFor(s).sendMail({
      from: s.fromName ? `"${s.fromName}" <${s.fromEmail}>` : s.fromEmail,
      to,
      replyTo: s.replyTo || undefined,
      bcc: s.bcc || undefined,
      subject,
      text,
      html,
      attachments: LOGO ? [{ filename: 'logo.png', content: LOGO, cid: 'hellorent-logo' }] : undefined,
    });
    console.log(`Email sent: "${subject}" → ${to}`);
    return { sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`Email failed: "${subject}" → ${to} — ${error}`);
    return { sent: false, error };
  }
}

/* ================================================================== */
/*  The messages                                                       */
/* ================================================================== */

const money = (n: number) => `€${n.toFixed(2).replace(/\.00$/, '')}`;
const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);
const dueOf = (b: Booking) => Math.max(0, b.total - paidOf(b));

const escape = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "Thu 17 Sep 2026" — a date someone can picture. */
const day = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const stamp = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** A plain test, for the button in the admin. */
export async function sendTestEmail(to: string): Promise<SendResult> {
  return send(
    to,
    'Hello Rent — test email',
    layout(
      'Your email settings work',
      `<p style="${P}">This is a test from the Hello Rent admin. If you are reading it, confirmations and receipts will reach your customers — and the logo above means images are coming through too.</p>`,
    ),
    'This is a test from the Hello Rent admin. If you are reading it, confirmations and receipts will reach your customers.',
  );
}

/**
 * The booking is confirmed, with the whole rental written out.
 *
 * It is the document the customer will still have on their phone at the
 * counter a week later, so everything they might be asked is in it: what they
 * booked, on what dates, at what price, what has been paid, what is owed, and
 * what to bring. The shop takes payment at the counter rather than online, so
 * it asks for nothing now — an invoice for a card that will never be charged
 * only confuses people.
 */
export async function sendBookingConfirmed(b: Booking): Promise<SendResult> {
  const s = await getEmailSettings();
  if (!s.sendOnConfirm) return { sent: false, skipped: 'disabled' };

  const paid = paidOf(b);
  const due = dueOf(b);
  const extrasTotal = b.extras.reduce((sum, e) => sum + e.amount, 0);
  const rental = Math.max(0, b.total - extrasTotal);
  const perDay = b.days > 0 ? rental / b.days : rental;
  const name = b.renter.firstName || 'there';

  /* ---- the rental itself ---- */
  const details = rows([
    ['Booking reference', `<b style="font-size:15px;letter-spacing:.04em">${escape(b.reference)}</b>`],
    ['Vehicle', escape(b.bikeTitle) + (b.plate ? ` <span style="color:#8a8078">· plate ${escape(b.plate)}</span>` : '')],
    ['Collect', `${day(b.pickupDate)}<br><span style="color:#8a8078">${escape(b.pickupLocation)}</span>`],
    ['Return', `${day(b.dropoffDate)}<br><span style="color:#8a8078">${escape(b.dropoffLocation)}</span>`],
    ['Duration', `${b.days} day${b.days === 1 ? '' : 's'}`],
    ['Booked on', stamp(b.createdAt)],
  ]);

  /* ---- what it costs, itemised ---- */
  const priceLines: [string, string][] = [
    [`Rental · ${b.days} day${b.days === 1 ? '' : 's'} at ${money(perDay)}/day`, money(rental)],
    ...b.extras.map(e => [`Extra · ${escape(e.label)}`, money(e.amount)] as [string, string]),
  ];
  const pricing = `
    <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;margin:0 0 8px">
      ${priceLines
        .map(
          ([k, v]) =>
            `<tr><td style="padding:7px 0;color:#4a423b">${k}</td><td style="padding:7px 0;text-align:right;font-variant-numeric:tabular-nums">${v}</td></tr>`,
        )
        .join('')}
      <tr><td colspan="2" style="border-top:1px solid #e8e0d6;font-size:0;line-height:0">&nbsp;</td></tr>
      <tr>
        <td style="padding:9px 0;font-weight:700">Total</td>
        <td style="padding:9px 0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums">${money(b.total)}</td>
      </tr>
      ${
        paid > 0
          ? `<tr><td style="padding:4px 0;color:#2f7a55">Already paid</td><td style="padding:4px 0;text-align:right;color:#2f7a55;font-variant-numeric:tabular-nums">− ${money(paid)}</td></tr>`
          : ''
      }
      <tr>
        <td style="padding:9px 0;font-weight:700;border-top:1px solid #e8e0d6">${due > 0 ? 'Due at pickup' : 'Balance'}</td>
        <td style="padding:9px 0;text-align:right;font-weight:700;border-top:1px solid #e8e0d6;font-variant-numeric:tabular-nums;color:${due > 0 ? '#b0764f' : '#2f7a55'}">${money(due)}</td>
      </tr>
    </table>`;

  /* ---- payments already taken ---- */
  const history = b.payments.length
    ? section(
        'Payments received',
        `<table role="presentation" width="100%" style="border-collapse:collapse;font-size:13px">
          ${b.payments
            .map(
              p =>
                `<tr>
                   <td style="padding:6px 0;color:#8a8078">${stamp(p.at)}${p.note ? ` · ${escape(p.note)}` : ''}</td>
                   <td style="padding:6px 0;text-align:right;font-weight:700;font-variant-numeric:tabular-nums">${money(p.amount)}</td>
                 </tr>`,
            )
            .join('')}
        </table>`,
      )
    : '';

  const html = layout(
    'Your booking is confirmed',
    `<p style="${P}">Hi ${escape(name)},</p>
     <p style="${P}">Your rental is confirmed — everything is below. Quote the reference when you arrive, or just show us this email.</p>

     ${section('The rental', details)}
     ${section('What it costs', pricing)}
     ${history}

     <div style="background:#faf7f2;border-radius:12px;padding:16px 18px;margin:22px 0">
       ${
         due > 0
           ? `<p style="margin:0 0 6px;font-size:15px"><b>${money(due)} is due when you collect.</b></p>
              <p style="margin:0;font-size:13px;color:#6b6157">Cash or card at the shop — there is nothing to pay online.</p>`
           : `<p style="margin:0 0 6px;font-size:15px"><b>Nothing left to pay.</b></p>
              <p style="margin:0;font-size:13px;color:#6b6157">Just bring your licence and this reference.</p>`
       }
       ${
         b.deposit > 0
           ? `<p style="margin:10px 0 0;font-size:13px;color:#6b6157">Plus a <b>refundable ${money(b.deposit)} deposit</b> on collection — returned when the bike comes back as it went out.</p>`
           : ''
       }
     </div>

     ${section(
       'What to bring',
       `<ul style="margin:0;padding-left:18px;font-size:14px;color:#4a423b;line-height:1.7">
          <li>Your driving licence</li>
          <li>Your international driving permit, if you have one</li>
          <li>Your passport, for the deposit</li>
        </ul>`,
     )}

     ${section(
       'Your details',
       rows([
         ['Name', escape(`${b.renter.firstName} ${b.renter.lastName}`.trim())],
         ['Email', escape(b.renter.email)],
         ['Phone', escape(b.renter.phone)],
         ...(b.renter.license ? ([['Licence', escape(b.renter.license)]] as [string, string][]) : []),
       ]),
     )}

     <p style="${P}">Anything at all — a change of dates, a later pickup, directions to the shop — just reply to this email or message us on WhatsApp. See you soon.</p>`,
  );

  /* ---- the same thing, for a client that will not render HTML ---- */
  const text = [
    `Hi ${name},`,
    '',
    'Your rental is confirmed.',
    '',
    'THE RENTAL',
    `Reference:  ${b.reference}`,
    `Vehicle:    ${b.bikeTitle}${b.plate ? ` (plate ${b.plate})` : ''}`,
    `Collect:    ${day(b.pickupDate)} — ${b.pickupLocation}`,
    `Return:     ${day(b.dropoffDate)} — ${b.dropoffLocation}`,
    `Duration:   ${b.days} day${b.days === 1 ? '' : 's'}`,
    '',
    'WHAT IT COSTS',
    `Rental (${b.days} x ${money(perDay)}/day): ${money(rental)}`,
    ...b.extras.map(e => `Extra - ${e.label}: ${money(e.amount)}`),
    `Total: ${money(b.total)}`,
    ...(paid > 0 ? [`Already paid: -${money(paid)}`] : []),
    `${due > 0 ? 'Due at pickup' : 'Balance'}: ${money(due)}`,
    ...(b.deposit > 0 ? ['', `Refundable deposit on collection: ${money(b.deposit)}`] : []),
    '',
    'WHAT TO BRING',
    '- Your driving licence',
    '- Your international driving permit, if you have one',
    '- Your passport, for the deposit',
    '',
    'Hello Rent, Weligama, Sri Lanka · +94 76 707 3388 · open daily 07:00-21:00',
  ].join('\n');

  return send(b.renter.email, `Booking confirmed — ${b.reference}`, html, text);
}

/** A receipt for money actually taken. */
export async function sendPaymentReceipt(b: Booking, amount: number): Promise<SendResult> {
  const s = await getEmailSettings();
  if (!s.sendOnPayment) return { sent: false, skipped: 'disabled' };

  const paid = paidOf(b);
  const due = dueOf(b);
  const name = b.renter.firstName || 'there';

  const html = layout(
    'Payment received',
    `<p style="${P}">Hi ${escape(name)},</p>
     <p style="${P}">Thank you — we have received <b>${money(amount)}</b>.</p>
     ${section(
       'Against this booking',
       rows([
         ['Reference', `<b>${escape(b.reference)}</b>`],
         ['Vehicle', escape(b.bikeTitle) + (b.plate ? ` · ${escape(b.plate)}` : '')],
         ['Dates', `${day(b.pickupDate)} → ${day(b.dropoffDate)}`],
         ['Rental total', money(b.total)],
         ['Paid so far', money(paid)],
         [due > 0 ? 'Still to pay' : 'Balance', `<b style="color:${due > 0 ? '#b0764f' : '#2f7a55'}">${money(due)}</b>`],
       ]),
     )}
     <p style="${P}">${due > 0 ? `${money(due)} remains due at pickup.` : 'That settles your rental in full.'}</p>`,
  );

  const text = [
    `Hi ${name},`,
    '',
    `We have received ${money(amount)} against booking ${b.reference}.`,
    '',
    `Vehicle:      ${b.bikeTitle}${b.plate ? ` (${b.plate})` : ''}`,
    `Dates:        ${day(b.pickupDate)} to ${day(b.dropoffDate)}`,
    `Rental total: ${money(b.total)}`,
    `Paid so far:  ${money(paid)}`,
    `${due > 0 ? 'Still to pay' : 'Balance'}:  ${money(due)}`,
  ].join('\n');

  return send(b.renter.email, `Payment received — ${b.reference}`, html, text);
}

/* ================================================================== */
/*  Presentation                                                       */
/* ================================================================== */

/** Body paragraph. Inline, because email clients discard a stylesheet. */
const P = 'margin:0 0 14px;font-size:15px;line-height:1.6;color:#2a2420';

/** A labelled block, so a long message still has a shape. */
function section(title: string, body: string): string {
  return `
    <div style="margin:22px 0 0">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#a89a8c">${escape(title)}</p>
      ${body}
    </div>`;
}

/** Label-and-value rows, banded so the eye can follow a long one across. */
function rows(pairs: [string, string][]): string {
  return `
    <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">
      ${pairs
        .map(
          ([k, v], i) =>
            `<tr style="background:${i % 2 ? '#faf7f2' : '#ffffff'}">
               <td style="padding:9px 12px;color:#6b6157;vertical-align:top;width:38%">${k}</td>
               <td style="padding:9px 12px;text-align:right;vertical-align:top">${v}</td>
             </tr>`,
        )
        .join('')}
    </table>`;
}

/**
 * One wrapper for every message.
 *
 * Tables and inline styles rather than anything modern: Outlook still renders
 * with Word's engine, and a flex layout collapses into a single column of
 * unstyled text there.
 */
function layout(heading: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px 12px;background:#f3ede4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" style="border-collapse:collapse">
    <tr><td align="center">
      <table role="presentation" width="600" style="width:100%;max-width:600px;border-collapse:collapse;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr>
          <td style="padding:28px 32px 0;text-align:center">
            ${LOGO ? `<img src="cid:hellorent-logo" width="72" height="72" alt="Hello Rent" style="display:block;margin:0 auto 14px;width:72px;height:72px" />` : ''}
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#b0764f">Hello Rent · Weligama</p>
            <h1 style="margin:0 0 4px;font-size:23px;line-height:1.25;color:#2a2420">${escape(heading)}</h1>
          </td>
        </tr>
        <tr><td style="padding:22px 32px 32px">${body}</td></tr>
        <tr>
          <td style="padding:18px 32px 26px;border-top:1px solid #efe8df;text-align:center">
            <p style="margin:0 0 4px;font-size:13px;color:#4a423b">
              <a href="tel:+94767073388" style="color:#b0764f;text-decoration:none;font-weight:700">+94 76 707 3388</a>
              &nbsp;·&nbsp;
              <a href="https://hellorentsrilanka.com" style="color:#b0764f;text-decoration:none;font-weight:700">hellorentsrilanka.com</a>
            </p>
            <p style="margin:0;font-size:12px;color:#8a8078">Weligama, Sri Lanka · open daily 07:00–21:00</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
