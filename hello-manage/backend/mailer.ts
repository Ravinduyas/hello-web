import nodemailer, { type Transporter } from 'nodemailer';
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
  if (!isSendable(s)) return { sent: false, skipped: 'disabled', error: 'Email is off, or the host and from-address are not set.' };
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
    });
    console.log(`Email sent: "${subject}" → ${to}`);
    return { sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`Email failed: "${subject}" → ${to} — ${error}`);
    return { sent: false, error };
  }
}

/** A plain test, for the button in the admin. */
export async function sendTestEmail(to: string): Promise<SendResult> {
  return send(
    to,
    'Hello Rent — test email',
    layout(
      'Your email settings work',
      `<p>This is a test from the Hello Rent admin. If you are reading it, confirmations and receipts will reach your customers.</p>`,
    ),
    'This is a test from the Hello Rent admin. If you are reading it, confirmations and receipts will reach your customers.',
  );
}

const money = (n: number) => `€${n.toFixed(2).replace(/\.00$/, '')}`;
const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);
const dueOf = (b: Booking) => Math.max(0, b.total - paidOf(b));

/**
 * The booking is confirmed, and here is what is owed.
 *
 * The shop takes payment at the counter rather than online, so this asks for
 * nothing but says plainly what to bring — an invoice for a card that will
 * never be charged online would only confuse someone.
 */
export async function sendBookingConfirmed(b: Booking): Promise<SendResult> {
  const s = await getEmailSettings();
  if (!s.sendOnConfirm) return { sent: false, skipped: 'disabled' };

  const due = dueOf(b);
  const paid = paidOf(b);
  const name = b.renter.firstName || 'there';

  const rows = [
    ['Reference', b.reference],
    ['Vehicle', b.bikeTitle + (b.plate ? ` · ${b.plate}` : '')],
    ['Collect', b.pickupDate],
    ['Return', b.dropoffDate],
    ['Days', String(b.days)],
    ['Total', money(b.total)],
    ...(paid > 0 ? [['Paid', money(paid)]] : []),
    ['Due at pickup', money(due)],
    ...(b.deposit > 0 ? [['Refundable deposit', money(b.deposit)]] : []),
  ];

  const html = layout(
    'Your booking is confirmed',
    `<p>Hi ${escape(name)},</p>
     <p>Your rental is confirmed. Here are the details — quote the reference when you arrive.</p>
     <table style="border-collapse:collapse;width:100%;margin:20px 0;font-size:14px">
       ${rows
         .map(
           ([k, v], i) =>
             `<tr style="background:${i % 2 ? '#faf7f2' : '#fff'}">
                <td style="padding:9px 12px;color:#6b6157">${escape(k)}</td>
                <td style="padding:9px 12px;font-weight:700;text-align:right">${escape(v)}</td>
              </tr>`,
         )
         .join('')}
     </table>
     ${
       due > 0
         ? `<p style="font-size:15px"><strong>${money(due)} is due when you collect.</strong> Cash or card at the shop — there is nothing to pay online.</p>`
         : `<p style="font-size:15px"><strong>Nothing left to pay.</strong> Just bring your licence and the reference above.</p>`
     }
     <p>Bring your driving licence and, if you have one, your international permit. Any questions, just reply to this email or message us on WhatsApp.</p>`,
  );

  const text = [
    `Hi ${name},`,
    '',
    'Your rental is confirmed.',
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    due > 0 ? `${money(due)} is due when you collect — cash or card at the shop.` : 'Nothing left to pay.',
    '',
    'Bring your driving licence and, if you have one, your international permit.',
  ].join('\n');

  return send(b.renter.email, `Booking confirmed — ${b.reference}`, html, text);
}

/** A receipt for money actually taken. */
export async function sendPaymentReceipt(b: Booking, amount: number): Promise<SendResult> {
  const s = await getEmailSettings();
  if (!s.sendOnPayment) return { sent: false, skipped: 'disabled' };

  const due = dueOf(b);
  const name = b.renter.firstName || 'there';
  const html = layout(
    'Payment received',
    `<p>Hi ${escape(name)},</p>
     <p>We have received <strong>${money(amount)}</strong> against booking <strong>${escape(b.reference)}</strong>.</p>
     <p>${due > 0 ? `${money(due)} remains due.` : 'That settles your rental in full — thank you.'}</p>`,
  );
  const text = `Hi ${name},\n\nWe have received ${money(amount)} against booking ${b.reference}.\n${
    due > 0 ? `${money(due)} remains due.` : 'That settles your rental in full — thank you.'
  }`;

  return send(b.renter.email, `Payment received — ${b.reference}`, html, text);
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** One wrapper for every message, so they look like they come from one shop. */
function layout(heading: string, body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f3ede4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#2a2420">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#b0764f">Hello Rent · Weligama</p>
    <h1 style="margin:0 0 18px;font-size:22px;line-height:1.25">${escape(heading)}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:26px 0 14px" />
    <p style="margin:0;font-size:12px;color:#8a8078">
      Hello Rent, Weligama, Sri Lanka · +94 76 707 3388 · open daily 07:00–21:00
    </p>
  </div>
</body></html>`;
}
