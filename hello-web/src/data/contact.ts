/**
 * Single source of truth for the contact details shown across the site.
 *
 * TODO(client): the phone/WhatsApp numbers below are still the placeholders
 * that were hard-coded into ContactPage. Replace them with Hello Rent's real
 * numbers — every place they appear reads from here, so one edit covers the
 * contact page, the WhatsApp button, and anything added later.
 */
export const CONTACT = {
  /** Display form, used in text. */
  phone: '+94 77 123 4567',
  /** Digits only, international format — the form wa.me expects. */
  whatsappNumber: '94771234567',
  email: 'hello@hellorent.co',
  address: 'Weligama, Southern Province, Sri Lanka',
  hours: 'Mon – Sun: 07:00 – 21:00',
  /** Single store — the former Locations page now lives inside /contact. */
  storeName: 'Weligama',
  /** Google Maps embed for "Hello Rent - Scooter & Tuktuk Rental". */
  mapSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3968.152793923988!2d80.43021617397146!3d5.973686329310416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae115bc1dd20d9f%3A0xd2b6be823738f94a!2sHello%20Rent%20-%20Scooter%20%26%20Tuktuk%20Rental!5e0!3m2!1sen!2slk!4v1782907333001!5m2!1sen!2slk',
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=Hello+Rent+-+Scooter+%26+Tuktuk+Rental',
} as const;

/** Build a wa.me deep link with an optional pre-filled first message. */
export function whatsappLink(
  message = "Hi Hello Rent! I'd like to ask about renting a scooter.",
) {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
