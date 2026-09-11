import { collections } from './mongo.ts';

/**
 * Settings the shop can change without a deploy.
 *
 * Email is the first of them. It could have lived in .env, but then changing
 * the address a confirmation comes from would mean editing a file on a server
 * and restarting it — and it is the shop's address, not the developer's. It
 * lives in the database and is edited in the admin.
 *
 * .env still seeds it, so a deployment that already carries SMTP credentials
 * keeps working without anyone retyping them; anything saved in the admin wins
 * from then on.
 */

export interface EmailSettings {
  /** Master switch. Off means nothing is sent, whatever else is filled in. */
  enabled: boolean;
  host: string;
  port: number;
  /** True for implicit TLS (465); false for STARTTLS (587), which is commoner. */
  secure: boolean;
  user: string;
  /** Never leaves the server. The API reports whether one is set, not what it is. */
  pass: string;
  /** What the customer sees in their inbox. */
  fromName: string;
  fromEmail: string;
  /** Where a reply goes, when that is not the sending address. */
  replyTo: string;
  /** A copy to the shop, so there is a record outside the system. */
  bcc: string;
  /** Send the customer their confirmation, and what is owed, on confirm. */
  sendOnConfirm: boolean;
  /** Send a receipt when a payment is recorded. */
  sendOnPayment: boolean;
}

export const EMAIL_DEFAULTS: EmailSettings = {
  enabled: false,
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  fromName: 'Hello Rent',
  fromEmail: '',
  replyTo: '',
  bcc: '',
  sendOnConfirm: true,
  sendOnPayment: false,
};

const DOC_ID = 'email';

/** Credentials a deployment may already carry in its environment. */
function fromEnv(): Partial<EmailSettings> {
  const e = process.env;
  const out: Partial<EmailSettings> = {};
  if (e.SMTP_HOST) out.host = e.SMTP_HOST;
  if (e.SMTP_PORT) out.port = Number(e.SMTP_PORT) || 587;
  if (e.SMTP_SECURE) out.secure = e.SMTP_SECURE === 'true';
  if (e.SMTP_USER) out.user = e.SMTP_USER;
  if (e.SMTP_PASS) out.pass = e.SMTP_PASS;
  if (e.SMTP_FROM) out.fromEmail = e.SMTP_FROM;
  if (e.SMTP_FROM_NAME) out.fromName = e.SMTP_FROM_NAME;
  if (e.SMTP_HOST && e.SMTP_USER) out.enabled = true;
  return out;
}

/** Defaults, then the environment, then whatever the admin has saved. */
export async function getEmailSettings(): Promise<EmailSettings> {
  const doc = await collections().settings.findOne({ _id: DOC_ID });
  const { _id: _drop, ...stored } = (doc ?? { _id: DOC_ID }) as Record<string, unknown>;
  return { ...EMAIL_DEFAULTS, ...fromEnv(), ...(stored as Partial<EmailSettings>) };
}

/** Merges an update in, leaving anything not sent untouched. */
export async function saveEmailSettings(patch: Partial<EmailSettings>): Promise<EmailSettings> {
  const next: EmailSettings = { ...(await getEmailSettings()), ...patch };
  // The collection holds one document per section, each with its own shape, so
  // it is typed as a loose record; the concrete settings go in as fields of one.
  await collections().settings.updateOne(
    { _id: DOC_ID },
    { $set: { ...next } as Record<string, unknown> },
    { upsert: true },
  );
  return next;
}

/** Everything except the password, plus whether one is stored. */
export function redact(s: EmailSettings): Omit<EmailSettings, 'pass'> & { hasPassword: boolean } {
  const { pass, ...rest } = s;
  return { ...rest, hasPassword: !!pass };
}

/** Whether there is enough here to actually send something. */
export function isSendable(s: EmailSettings): boolean {
  return s.enabled && !!s.host && !!s.fromEmail;
}
