/**
 * SEO-optimised riding & rental guides written for Hello Rent in Weligama.
 *
 * Each article targets a distinct search intent so pages complement rather than
 * cannibalise one another across Weligama local queries, Sri Lanka-wide rental
 * queries, vehicle-comparison queries, tuk-tuk self-drive queries, and brand
 * searches for "Hello Rent - Scooter & Tuktuk Rental".
 *
 * Read both at build time (by vite-plugin-sitemap and vite-plugin-seo-routes)
 * and at runtime (by BlogPage, BlogPostPage, Blog teaser, and PageSeo).
 * Keep free of browser-only globals so Node can import this module cleanly.
 */

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogBullet {
  title: string;
  detail: string;
}

export interface BlogTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface BlogCallout {
  eyebrow?: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaTo: string;
}

export interface BlogSection {
  id: string;
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  bullets?: BlogBullet[];
  table?: BlogTable;
  callout?: BlogCallout;
}

export interface BlogQuickFact {
  label: string;
  value: string;
}

export interface BlogInternalLink {
  label: string;
  to: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** Concise title (<60 chars where possible) for SERP & social cards. */
  seoTitle: string;
  /** ~145–160 char meta description written for click-through & intent match. */
  seoDescription: string;
  /** Target & semantic keywords for structured data and topic filtering. */
  keywords: string[];
  category: string;
  /** ISO 8601 date string for BlogPosting schema. */
  publishedAt: string;
  /** Human-readable date matching house style. */
  displayDate: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
  };
  /** Path relative to public/, e.g. '/photos/scooters-weligama-bay.jpg'. */
  image: string;
  imageAlt: string;
  excerpt: string;
  featured?: boolean;
  whatsappPrompt: string;
  quickFacts: BlogQuickFact[];
  sections: BlogSection[];
  faqs: BlogFaq[];
  relatedSlugs: string[];
  internalLinks: BlogInternalLink[];
}

export const BLOG_POSTS: BlogPost[] = [
  /* ======================================================================== */
  /* 1. Scooter Rental Weligama / Weligama Scooter Rental                     */
  /* ======================================================================== */
  {
    slug: 'scooter-rental-weligama-guide',
    title: 'Scooter Rental in Weligama: Local Prices, Permits & South Coast Tips (2026)',
    seoTitle: 'Scooter Rental Weligama: 2026 Prices & Guide | Hello Rent',
    seoDescription:
      'Looking for scooter rental in Weligama? Compare €5–€6/day Honda Dio, Yamaha Ray ZR & TVS Ntorq rates, permit rules, surf parking, and hotel delivery with Hello Rent.',
    keywords: [
      'scooter rental weligama',
      'weligama scooter rental',
      'hello rent',
      'hello rent - scooter & tuktuk rental',
      'rent scooter sri lanka',
      'bike rent weligama',
    ],
    category: 'Weligama Guides',
    publishedAt: '2026-05-02',
    displayDate: '02 May 2026',
    readingTime: '7 min read',
    author: {
      name: 'Bhagya “Lucky” & Sandra',
      role: 'Founders, Hello Rent Weligama',
    },
    image: '/photos/scooters-weligama-bay.jpg',
    imageAlt: 'Automatic scooters parked by Weligama Bay on Sri Lanka’s south coast',
    excerpt:
      'Everything you need to know before picking up a Weligama scooter rental — honest daily prices from €5, which automatic model suits your height and luggage, where to park near the surf breaks, and how to ride legally.',
    featured: true,
    whatsappPrompt:
      "Hi Hello Rent! I read your Weligama scooter rental guide and I'd like to check availability.",
    quickFacts: [
      { label: '110cc Scooters', value: '€5 / day' },
      { label: '125cc TVS Ntorq', value: '€6 / day' },
      { label: 'Included Free', value: '1 Helmet & Briefing' },
      { label: 'Store Hours', value: '07:00 – 21:00 Daily' },
    ],
    sections: [
      {
        id: 'why-scooter-weligama',
        eyebrow: '[ Why Two Wheels Win ]',
        heading: 'Why a Weligama scooter rental changes your whole south coast trip',
        paragraphs: [
          'Stay in Weligama for more than one morning and you notice the rhythm of the coast right away. Dawn surf checks at Weligama Bay or Midigama, breakfast cafés tucked up quiet coconut lanes, midday swims at Jungle Beach or Secret Beach in Mirissa, and sunset viewpoints toward Ahangama — all of them sit five to twenty minutes apart along the A2 coastal road.',
          'Relying on roadside three-wheeler taxis for four or five hops a day quickly costs more than having your own wheels, and you spend half your holiday negotiating fares in the heat. With a reliable scooter rental in Weligama, your day belongs to you: stop where the fruit stall looks good, detour inland past emerald paddy fields, and ride home whenever the tide turns.',
          'At Hello Rent in the centre of Weligama — walking distance from Weligama Beach, the railway station, and the main bus stand — we hand over automatic scooters every morning to solo surfers, couples, and remote workers staying across the Southern Province.',
        ],
      },
      {
        id: 'weligama-scooter-prices-models',
        eyebrow: '[ Models & Rates ]',
        heading: 'Weligama scooter rental prices & which model to pick',
        paragraphs: [
          'Most visitors have never ridden an Asian commuter scooter before, so we keep our pricing simple and transparent by engine size rather than seasonal haggling. Every automatic 110cc scooter in our shop is €5 per day, and our 125cc scooter is €6 per day — with a clean helmet included and no credit card needed to reserve online.',
          'Choosing the right scooter comes down to your height, whether you are riding solo or two-up with a passenger, and how much under-seat storage you want for beach gear, cameras, or groceries.',
        ],
        table: {
          caption: 'Hello Rent Weligama automatic scooter fleet comparison',
          headers: ['Model', 'Engine', 'Daily Rate', 'Seat & Weight', 'Best For'],
          rows: [
            [
              'Honda Dio 110cc',
              '110cc Auto',
              '€5 / day',
              'Low 765mm seat · Combi Brake System',
              'First-time Sri Lanka riders, solo beach runs, petite to average height',
            ],
            [
              'Yamaha Ray ZR',
              '110cc Hybrid Auto',
              '€5 / day',
              'Lightest at 99kg · 21L storage',
              'Easy low-speed balance, extra knee room for taller riders',
            ],
            [
              'Honda Navi 110cc',
              '110cc Auto',
              '€5 / day',
              'Narrow mini-bike stance (box optional)',
              'Riders who prefer motorcycle posture with twist-and-go simplicity',
            ],
            [
              'TVS Ntorq 125',
              '124.8cc Auto',
              '€6 / day',
              '22L storage · Digital console',
              'Two-up couples, steeper inland hills, Ahangama to Hiriketiya runs',
            ],
          ],
        },
        callout: {
          eyebrow: '[ Check Live Availability ]',
          title: 'Reserve your Weligama scooter in two minutes',
          body: 'Pick your dates, add a second passenger helmet (€2/day) or phone mount (€1/day), and pay at pickup in Weligama or via hotel delivery.',
          ctaLabel: 'BROWSE SCOOTERS & BOOK',
          ctaTo: '/book-now',
        },
      },
      {
        id: 'permits-police-checks-weligama',
        eyebrow: '[ Ride Legally ]',
        heading: 'Licences, permits & what police check around Weligama and Mirissa',
        paragraphs: [
          'This is the single piece of advice we give every guest before handing over a key: your home driving licence or International Driving Permit (IDP) alone is not legally sufficient in Sri Lanka. Traffic police along the Weligama–Mirissa coastal strip and outside Galle regularly run friendly routine checkpoints.',
          'To ride a scooter legally, you need Category A (motorcycles) on your home licence, a government-issued IDP booklet (not an unofficial online PDF), and a temporary Sri Lankan recognition permit. You can pick up a one-month card at Colombo Airport or the Department of Motor Traffic, or let Hello Rent arrange an official six-month Automobile Association permit (€57 one-off) via WhatsApp before you even step off the plane.',
        ],
        bullets: [
          {
            title: 'Always fasten your helmet chin-strap',
            detail:
              'Helmets are mandatory for both rider and pillion passenger across Sri Lanka. Unclipped straps are treated the same as riding without a helmet.',
          },
          {
            title: 'Carry physical or clear copies of documents',
            detail:
              'Keep your Sri Lankan driving permit, IDP, passport photo page copy, and rental slip under the seat or in a dry pouch.',
          },
          {
            title: 'Never take a scooter onto the Southern Expressway (E01)',
            detail:
              'Expressways in Sri Lanka are strictly for four-wheeled vehicles. Stick to the scenic A2 coast road or peaceful inland B-roads.',
          },
        ],
      },
      {
        id: 'fuel-parking-coastal-tips',
        eyebrow: '[ Local Know-How ]',
        heading: 'Fuel stations, surf parking & avoiding rental traps in Weligama',
        paragraphs: [
          'Filling up in Weligama is straightforward and inexpensive. Ask the attendant for “92 Octane Petrol” at the Ceypetco or Lanka IOC stations in Weligama town — a full tank on a Honda Dio or TVS Ntorq only takes around four to five litres and carries you well over 150 kilometres along the flat coast.',
          'When parking along Weligama Bay, Coconut Tree Hill in Mirissa, or Kabalana in Ahangama, pull completely off the tarmac onto firm sand or designated bays so buses have full clearance, lock the steering column to the left, and never park directly underneath ripe coconut palms!',
          'Finally, watch out for informal street rentals that ask to hold your original passport as collateral. Never hand over your physical passport to anyone. At Hello Rent, we take a simple copy, inspect the scooter together with you in daylight so every existing mark is noted honestly, and keep 24/7 roadside support on WhatsApp if you ever get a flat tyre.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How much does scooter rental in Weligama cost per day?',
        answer:
          'At Hello Rent in Weligama, automatic 110cc scooters (Honda Dio, Yamaha Ray ZR, and Honda Navi) cost €5 per day, and the more powerful 125cc TVS Ntorq costs €6 per day. One helmet is included free with every scooter.',
      },
      {
        question: 'Do you deliver rental scooters to hotels in Weligama, Mirissa, or Ahangama?',
        answer:
          'Yes. You can pick up directly from our central Weligama shop between 07:00 and 21:00 for free, or choose hotel delivery and collection across Weligama, Mirissa, Midigama, Ahangama, and nearby south coast towns (€15 flat fee).',
      },
      {
        question: 'Do I have to leave my passport to rent a scooter in Weligama?',
        answer:
          'No — we never hold your original passport. You keep your passport with you where it belongs; we only require a copy of your passport photo page and your valid driving permit.',
      },
      {
        question: 'Which scooter is best for two people riding around Weligama?',
        answer:
          'For two adults riding together — especially if you are heading to Mirissa hills, Hiriketiya, or inland cafés — we recommend the TVS Ntorq 125 (€6/day). It has extra torque, stronger brakes, a roomy pillion seat, and 22 litres of under-seat storage.',
      },
    ],
    relatedSlugs: [
      'bike-rent-weligama-scooter-vs-motorbike',
      'rent-a-scooter-sri-lanka-complete-guide',
      'hello-rent-scooter-tuktuk-rental-weligama-guide',
    ],
    internalLinks: [
      {
        label: 'View Full Weligama Fleet & Rates',
        to: '/fleet',
        description: 'Compare every scooter, manual motorbike, tuk-tuk, and car in our shop.',
      },
      {
        label: 'Sri Lankan Driving Permit Service',
        to: '/driving-permit',
        description: 'Send 3 photos on WhatsApp and have your 6-month legal permit waiting.',
      },
      {
        label: 'One-Day Riding Routes from Weligama',
        to: '/tours',
        description: 'Beaches, rainforests, forts, and wildlife parks reachable in a day.',
      },
    ],
  },

  /* ======================================================================== */
  /* 2. Bike Rent Weligama / Weligama Bike Rental                             */
  /* ======================================================================== */
  {
    slug: 'bike-rent-weligama-scooter-vs-motorbike',
    title: 'Bike Rent in Weligama: Automatic Scooter vs Manual Motorbike — Which Should You Ride?',
    seoTitle: 'Bike Rent Weligama: Scooter vs Motorbike | Hello Rent',
    seoDescription:
      'Searching for bike rent in Weligama? Compare €5 automatic scooters vs €10 manual motorbikes (Pulsar N160, Yamaha FZ, Apache 200) for coast & hill country rides.',
    keywords: [
      'bike rent weligama',
      'weligama bike rental',
      'scooter rental weligama',
      'weligama scooter rental',
      'hello rent',
      'rent scooter sri lanka',
    ],
    category: 'Fleet & Advice',
    publishedAt: '2026-04-24',
    displayDate: '24 Apr 2026',
    readingTime: '6 min read',
    author: {
      name: 'Bhagya “Lucky” & Sandra',
      role: 'Founders, Hello Rent Weligama',
    },
    image: '/blog/coast-road.webp',
    imageAlt: 'Rider cruising Sri Lanka’s palm-lined southern coast road on two wheels',
    excerpt:
      'When travelers search for bike rent in Weligama, half mean a twist-and-go beach scooter and half mean a geared 160cc–200cc motorcycle for Ella and Kandy. Here is how to pick the right two-wheeler for your route.',
    whatsappPrompt:
      "Hi Hello Rent! I'm comparing scooters vs manual motorbikes in Weligama — can you help me choose?",
    quickFacts: [
      { label: 'Auto Scooters', value: '€5 – €6 / day' },
      { label: 'Manual Motorbikes', value: '€10 / day' },
      { label: 'Engine Sizes', value: '110cc to 200cc' },
      { label: 'Extras Available', value: 'Top Box & GPS Mount' },
    ],
    sections: [
      {
        id: 'scooter-vs-motorbike-weligama',
        eyebrow: '[ Two Kinds of Two-Wheelers ]',
        heading: 'Understanding Weligama bike rental options: twist-and-go vs manual gears',
        paragraphs: [
          'In Sri Lanka, travelers and locals alike say “bike” to mean everything on two wheels — from a 99kg automatic Yamaha Ray ZR scooter to a 200cc manual TVS Apache sport-tourer. When arranging bike rent in Weligama, the first question we always ask in the shop is simple: “Have you ridden with a manual hand clutch and foot gears before, and how far inland are you going?”',
          'If your holiday revolves around Weligama, Midigama, Ahangama, Mirissa, Galle Fort, and Hiriketiya, the terrain is flat, warm, and dotted with village slowdowns. An automatic scooter lets you keep both hands relaxed, store your flip-flops and camera under the seat, and thread effortlessly into beach parking.',
          'If you are strapping on a backpack and climbing 1,000+ metres into Deniyaya, Sinharaja Rain Forest, Ella, Haputale, or Kandy, a manual 160cc–200cc motorbike transforms the ride: larger 17-inch wheels smooth out rough mountain tarmac, engine braking saves your brake pads on long hairpins, and a 12-litre tank means fewer fuel stops.',
        ],
      },
      {
        id: 'side-by-side-comparison',
        eyebrow: '[ Head-to-Head ]',
        heading: 'Weligama bike rental comparison: scooters vs big bikes',
        paragraphs: [
          'Here is how the two classes in the Hello Rent Weligama fleet stack up across daily rate, transmission, luggage practicality, and ideal Sri Lankan routes.',
        ],
        table: {
          caption: 'Automatic Scooters vs Manual Motorbikes at Hello Rent Weligama',
          headers: ['Feature', 'Automatic Scooters (110–125cc)', 'Manual Motorbikes (160–200cc)'],
          rows: [
            ['Models in Shop', 'Honda Dio, Honda Navi, Yamaha Ray ZR, TVS Ntorq 125', 'Bajaj Pulsar N160, Yamaha FZ 160, TVS Apache 200, Hero Hunk 200'],
            ['Daily Rental Price', '€5/day (110cc) · €6/day (125cc)', '€10/day across all manual models'],
            ['Transmission', 'Automatic CVT — twist and go', '5-speed manual — left-hand clutch & foot shifter'],
            ['Braking & Wheels', 'Compact wheels, Combi Brake / front disc', 'Full-size 17" wheels, strong disc brakes (ABS on Pulsar N160)'],
            ['Built-in Storage', '18L – 22L under-seat bay (plus optional top box)', 'None under seat — add our lockable rear box (€3/day) or backpack'],
            ['Best Terrain', 'South coast towns, surf checks, short day trips (<80 km)', 'Hill country climbs (Ella, Kandy, Deniyaya) & long island loops'],
          ],
        },
      },
      {
        id: 'manual-motorbike-lineup',
        eyebrow: '[ Our Manual Fleet ]',
        heading: 'Which manual motorbike should you rent in Weligama?',
        paragraphs: [
          'Every geared motorbike in our Weligama bike rental lineup is priced flat at €10 per day, maintained by mechanics who know south-coast salt air and hill-country gradients inside out.',
        ],
        bullets: [
          {
            title: 'Bajaj Pulsar N160 (€10/day) — Agile mountain all-rounder',
            detail:
              'Built around a stiff perimeter frame with a single-channel ABS option and a 12L fuel tank. Crisp handling on winding tea-estate roads.',
          },
          {
            title: 'Yamaha FZ 160 (€10/day) — Smooth, upright & forgiving',
            detail:
              'Fuel-injected reliability and a relaxed upright handlebar position that keeps wrists and shoulders fresh all the way from Weligama to Ella.',
          },
          {
            title: 'TVS Apache 200 & Hero Hunk 200 (€10/day) — Extra torque for two-up touring',
            detail:
              'The 200cc class gives noticeable extra pull when overtaking slow trucks uphill or riding two-up with luggage across multiple provinces.',
          },
        ],
        callout: {
          eyebrow: '[ Honest Matching ]',
          title: 'Not sure which bike fits your height or confidence?',
          body: 'Drop by our Weligama store to sit on a Dio, Ntorq, FZ, and Pulsar side by side — if we feel a heavy bike is not right for you yet, we will tell you honestly.',
          ctaLabel: 'COMPARE THE FULL FLEET',
          ctaTo: '/fleet',
        },
      },
      {
        id: 'luggage-helmets-extras',
        eyebrow: '[ Practical Setup ]',
        heading: 'Setting up your bike for south coast surf or island touring',
        paragraphs: [
          'Small details make a huge difference on Sri Lankan roads. A handlebar phone/GPS mount (€1/day) keeps Google Maps at eye level so you never have to check directions one-handed at busy junctions in Matara or Galle. If you need extra carrying capacity beyond under-seat storage, we fit a lockable rear luggage box (€3/day) for dry clothes, camera gear, and rain jackets.',
          'Before every Weligama bike rental leaves the shop, we check tyre pressures, front and rear brake bite, horn, indicators, mirrors, and headlight beam together with you — because on Sri Lankan roads, a crisp horn and good mirrors matter just as much as horsepower.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can a beginner rent a manual motorbike in Weligama?',
        answer:
          'If you have never used a motorcycle hand clutch and foot gear-lever before, Sri Lankan traffic is not the place to learn on day one. We strongly recommend starting with an automatic scooter (€5–€6/day) where there are zero gears to stall.',
      },
      {
        question: 'Can I ride a 125cc scooter from Weligama to Ella, or do I need a motorbike?',
        answer:
          'Solo riders regularly take our TVS Ntorq 125 to Ella without trouble if they take breaks, though a 160cc–200cc manual motorbike (€10/day) is more comfortable, stable on steep descents, and much better suited if you are riding with a passenger.',
      },
      {
        question: 'What licence category covers bike rent in Weligama?',
        answer:
          'Both scooters and geared motorbikes require a motorcycle entitlement (Category A) on your home licence, paired with a valid International Driving Permit and a Sri Lankan recognition permit, which Hello Rent can arrange for you.',
      },
      {
        question: 'Is roadside assistance included with Weligama bike rental?',
        answer:
          'Yes. Hello Rent provides 24/7 WhatsApp support across our fleet so you always have a local team to call if you run into a puncture or mechanical issue.',
      },
    ],
    relatedSlugs: [
      'scooter-rental-weligama-guide',
      'scenic-coastal-hill-routes-from-weligama-sri-lanka',
      'rent-a-scooter-sri-lanka-complete-guide',
    ],
    internalLinks: [
      {
        label: 'Book Your Scooter or Motorbike Online',
        to: '/book-now',
        description: 'Choose your vehicle class, dates, and extras — pay at pickup in Weligama.',
      },
      {
        label: 'Read Our Safety & Family Promise',
        to: '/about#safety',
        description: 'How Bhagya & Sandra match every rider to a safe vehicle.',
      },
      {
        label: 'Get Your Sri Lankan Permit Arranged',
        to: '/driving-permit',
        description: 'Skip government queues with our 6-month endorsed permit service.',
      },
    ],
  },

  /* ======================================================================== */
  /* 3. Rent a Scooter Sri Lanka / Rent Scooter Sri Lanka                     */
  /* ======================================================================== */
  {
    slug: 'rent-a-scooter-sri-lanka-complete-guide',
    title: 'How to Rent a Scooter in Sri Lanka: Permits, Costs & Road Rules (2026 Guide)',
    seoTitle: 'Rent a Scooter in Sri Lanka: 2026 Rules & Costs | Hello Rent',
    seoDescription:
      'Planning to rent a scooter in Sri Lanka? Learn the exact 2026 driving permit laws, daily rental costs, left-side traffic habits, monsoon seasons & safety checks.',
    keywords: [
      'rent a scooter sri lanka',
      'rent scooter sri lanka',
      'scooter rental weligama',
      'weligama scooter rental',
      'hello rent',
    ],
    category: 'Tips & Permits',
    publishedAt: '2026-04-16',
    displayDate: '16 Apr 2026',
    readingTime: '8 min read',
    author: {
      name: 'Bhagya “Lucky” & Sandra',
      role: 'Founders, Hello Rent Weligama',
    },
    image: '/blog/permit.webp',
    imageAlt: 'Traveler preparing documents and helmet to rent a scooter in Sri Lanka',
    excerpt:
      'Planning to rent a scooter in Sri Lanka for the first time? From getting your legal Sri Lankan driving permit sorted without losing a beach day to understanding bus etiquette, fuel stops, and monsoon timing, here is the complete handbook.',
    whatsappPrompt:
      "Hi Hello Rent! I'm planning to rent a scooter in Sri Lanka and have a question about permits and booking.",
    quickFacts: [
      { label: 'Typical Daily Rate', value: '€5 – €6 / day' },
      { label: 'Traffic Side', value: 'Drive on the Left' },
      { label: 'Legal Requirement', value: 'IDP + SL Permit' },
      { label: 'Permit via Hello Rent', value: '€57 (Valid 6 Months)' },
    ],
    sections: [
      {
        id: 'legal-permit-requirements-sri-lanka',
        eyebrow: '[ Step 1: Paperwork ]',
        heading: 'The legal way to rent a scooter in Sri Lanka (no guesswork)',
        paragraphs: [
          'Every week travelers ask us whether an International Driving Permit (IDP) from home is enough on its own when you rent a scooter in Sri Lanka. Under Sri Lankan Motor Traffic law, the answer is no: foreign visitors must hold a local Sri Lankan recognition permit endorsed on top of their valid IDP and home motorcycle licence (Category A).',
          'Riding without the local endorsement carries two risks: spot fines at police checkpoints, and — far more importantly — travel insurers refusing medical or third-party claims if you were riding unlicensed under local law. Fortunately, getting legal takes ten minutes of preparation.',
        ],
        bullets: [
          {
            title: 'Option 1: Arrange in advance with Hello Rent (€57 · Valid 6 months)',
            detail:
              'WhatsApp us a photo of your official government-issued IDP booklet, your passport photo page, and a plain-wall selfie before you land. We have it legally endorsed via the Automobile Association so your permit is waiting with your scooter in Weligama.',
          },
          {
            title: 'Option 2: Recognition counter at Colombo Airport (Valid 1 month)',
            detail:
              'Issued on arrival at Katunayake (CMB) airport. Convenient if your flight lands at a quiet hour and your trip is under 30 days.',
          },
          {
            title: 'Option 3: Department of Motor Traffic in Werahera or Hambantota (Valid 1 month)',
            detail:
              'Inexpensive over the counter, though getting there and back eats up a full day of your holiday.',
          },
        ],
        callout: {
          eyebrow: '[ Zero Queueing ]',
          title: 'Want your Sri Lankan permit ready when you arrive?',
          body: 'See the exact three photos we need on WhatsApp so you can go straight from your hotel check-in to the beach.',
          ctaLabel: 'HOW PERMIT ARRANGEMENT WORKS',
          ctaTo: '/driving-permit',
        },
      },
      {
        id: 'what-it-costs-to-rent-scooter-sri-lanka',
        eyebrow: '[ Step 2: Real Costs ]',
        heading: 'How much does it actually cost to rent scooter Sri Lanka?',
        paragraphs: [
          'Sri Lanka is one of the best-value places in Asia to explore independently on two wheels. At an honest local shop like Hello Rent in Weligama, daily scooter rates start at €5 per day for well-maintained 110cc automatics (Honda Dio, Yamaha Ray ZR, Honda Navi) and €6 per day for a 125cc TVS Ntorq.',
          'Petrol (92 Octane) is regulated nationwide at uniform pump prices, meaning a full tank costs only a few euros and delivers roughly 35–45 km per litre. Even factoring in your Sri Lankan recognition permit, an extra pillion helmet (€2/day), and a handlebar phone mount (€1/day), two weeks of complete coastal freedom costs a fraction of private car transfers.',
        ],
      },
      {
        id: 'sri-lanka-road-rules-etiquette',
        eyebrow: '[ Step 3: Road Survival ]',
        heading: '7 unwritten Sri Lankan road habits every first-time rider should know',
        paragraphs: [
          'Traffic in Sri Lanka flows slower than in Europe or Australia — average speeds on coastal and hill roads hover between 35 and 55 km/h — yet the road is shared with buses, tuk-tuks, cyclists, schoolkids, peacocks, monitor lizards, and the occasional sleepy dog. Once you understand the local rhythm, riding feels remarkably cooperative.',
        ],
        bullets: [
          {
            title: '1. Keep left and respect the “size hierarchy”',
            detail:
              'Sri Lanka drives on the left. Colourful private and red SLTB buses run to tight schedules and rarely yield — when you see a bus flashing its headlights and overtaking oncoming traffic, ease calmly left and give it room.',
          },
          {
            title: '2. A short horn tap means “I am here”, not anger',
            detail:
              'Drivers give a polite, brief beep before overtaking a tuk-tuk or rounding a blind tea-country corner. Use yours gently and never take a beep personally.',
          },
          {
            title: '3. Watch vehicle front wheels, not just indicators',
            detail:
              'Three-wheelers can pull out or U-turn suddenly near junctions and bakery stops. Leave a two-second cushion in town centres.',
          },
          {
            title: '4. Avoid long inter-town rides after dark',
            detail:
              'After 18:30, unlit pedestrians, potholes, stray dogs, and high-beam oncoming headlights make unfamiliar roads tiring. Plan big rides for morning light (06:30–11:30).',
          },
          {
            title: '5. Know the two monsoons before planning routes',
            detail:
              'The south and west coasts (Weligama, Mirissa, Galle, Hiriketiya) shine brightest from November through April, though warm sunny mornings are common year-round with brief tropical showers.',
          },
        ],
      },
      {
        id: 'pre-ride-inspection-checklist',
        eyebrow: '[ Step 4: Pickup Check ]',
        heading: 'The 60-second inspection to do before riding away',
        paragraphs: [
          'Wherever you rent a scooter in Sri Lanka, take one minute before leaving the forecourt: film a quick walk-around video on your phone in daylight, squeeze both brake levers firmly, test the horn and high/low headlight switch, check tyre tread for wet-road grip, and make sure your helmet visor is scratch-free and fits snugly.',
          'At Hello Rent we walk through every single one of those checks alongside you — and if you have never driven on the left before, we take ten calm minutes on a quiet Weligama lane first until your shoulders drop and you feel completely at home.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can tourists legally rent a scooter in Sri Lanka?',
        answer:
          'Yes. Tourists with a valid motorcycle licence (Category A), a government-issued International Driving Permit (1949 Geneva Convention booklet), and a Sri Lankan recognition permit can legally rent and ride scooters anywhere on public non-expressway roads in Sri Lanka.',
      },
      {
        question: 'Are online “instant International Driving Permits” accepted in Sri Lanka?',
        answer:
          'No. Sri Lankan authorities and the Automobile Association only accept the official physical IDP booklet issued by the authorised motoring association or government office in your home country — not digital PDFs sold by commercial websites.',
      },
      {
        question: 'What is the speed limit for scooters in Sri Lanka?',
        answer:
          'Unless posted lower, the statutory speed limit for motorcycles and scooters in Sri Lanka is 40 km/h in built-up urban areas (such as Weligama, Mirissa, and Galle town centres) and up to 70 km/h on open rural roads. Scooters are prohibited on expressways.',
      },
      {
        question: 'Where is the easiest place on the south coast to rent a scooter?',
        answer:
          'Weligama is the central hub of the south coast — connected directly by train and highway bus from Colombo, and sitting right between Galle Fort to the west and Mirissa/Hiriketiya to the east. Hello Rent is a short walk from Weligama train station and also delivers to south-coast hotels.',
      },
    ],
    relatedSlugs: [
      'scooter-rental-weligama-guide',
      'tuktuk-rental-weligama-sri-lanka-guide',
      'bike-rent-weligama-scooter-vs-motorbike',
    ],
    internalLinks: [
      {
        label: 'Arrange Your Sri Lankan Permit',
        to: '/driving-permit',
        description: 'Full breakdown of Airport, DMT, and Hello Rent’s 6-month permit service.',
      },
      {
        label: 'Reserve a Scooter in Weligama',
        to: '/book-now',
        description: 'Lock in your scooter from €5/day — no upfront card payment required.',
      },
      {
        label: 'Contact Hello Rent Weligama',
        to: '/contact',
        description: 'Find our shop on Google Maps or message +94 76 707 3388 on WhatsApp.',
      },
    ],
  },

  /* ======================================================================== */
  /* 4. TukTuk Rental Weligama / Tuk Tuk Rental Sri Lanka                     */
  /* ======================================================================== */
  {
    slug: 'tuktuk-rental-weligama-sri-lanka-guide',
    title: 'Tuk-Tuk Rental in Weligama & Sri Lanka: Self-Drive Costs, Lessons & Routes',
    seoTitle: 'Tuk-Tuk Rental Weligama & Sri Lanka Guide | Hello Rent',
    seoDescription:
      'Self-drive tuk-tuk rental in Weligama & Sri Lanka for €15/day. Learn how to drive a Bajaj RE 4-stroke, permit rules, luggage space & top routes with Hello Rent.',
    keywords: [
      'tuktuk rental weligama',
      'tuk tuk rental sri lanka',
      'hello rent - scooter & tuktuk rental',
      'hello rent',
      'weligama bike rental',
    ],
    category: 'Tuk-Tuk Guides',
    publishedAt: '2026-04-08',
    displayDate: '08 Apr 2026',
    readingTime: '7 min read',
    author: {
      name: 'Bhagya “Lucky” & Sandra',
      role: 'Founders, Hello Rent Weligama',
    },
    image: '/fleet/bajaj-re-tuktuk.jpg',
    imageAlt: 'Bajaj RE 4-stroke self-drive tuk-tuk parked at Hello Rent in Weligama, Sri Lanka',
    excerpt:
      'Driving your own three-wheeler across Sri Lanka is an unforgettable way to travel with friends, surfboards, and backpacks — shaded from midday sun and dry in tropical rain. Here is everything to know about tuktuk rental in Weligama.',
    whatsappPrompt:
      "Hi Hello Rent! I'm interested in self-drive tuk-tuk rental in Weligama — could I check availability and permit details?",
    quickFacts: [
      { label: 'Bajaj RE 4-Stroke', value: '€15 / day' },
      { label: 'Seating & Cargo', value: '3 Adults + 60–80L' },
      { label: 'Transmission', value: '4-Speed Handlebar Clutch' },
      { label: 'Legal Speed Limit', value: '40 km/h' },
    ],
    sections: [
      {
        id: 'why-self-drive-tuk-tuk-sri-lanka',
        eyebrow: '[ Three Wheels, Pure Joy ]',
        heading: 'Why self-drive tuk tuk rental in Sri Lanka has become a bucket-list trip',
        paragraphs: [
          'Ask anyone who has driven a three-wheeler down the palm-fringed coast or up into Sri Lanka’s misty tea estates and they all say the same thing: nothing else connects you to the island like a tuk-tuk. Unlike an enclosed rental car, the open sides let in sea breezes, cinnamon-wood smoke, and friendly waves from every village you pass. Unlike a scooter, you have a full canvas roof over your head when an afternoon shower rolls through, space for three adults on the back bench, and 60 to 80 litres of luggage room behind the seat.',
          'At Hello Rent - Scooter & Tuktuk Rental in Weligama, our Bajaj RE 4-stroke tuk-tuks (€15/day) are rented both for week-long south-coast surf hopping — carrying boards between Weligama, Midigama, Ahangama, and Hiriketiya — and for multi-day loops inland to Udawalawe, Ella, and Deniyaya.',
        ],
      },
      {
        id: 'how-to-drive-bajaj-re-tuktuk',
        eyebrow: '[ Controls Explained ]',
        heading: 'Is a tuk-tuk hard to drive? How the Bajaj RE handlebar clutch works',
        paragraphs: [
          'The biggest surprise for first-timers booking tuktuk rental in Weligama is where the gears live. Our Bajaj RE 4-stroke three-wheelers are manual, yet there is no clutch pedal on the floor — only a rear foot brake on the right floorboard!',
          'Instead, you pull the left-hand lever on the handlebar for the clutch and twist the entire left grip forward or back through gears 1, 2, 3, and 4, while your right hand twists the throttle just like a scooter. A small lever under the dashboard engages reverse gear so you never have to push the vehicle out of tight beach parking.',
          'Even if you have only ever driven a manual car (or ridden a geared bike), muscle memory clicks within fifteen to twenty minutes. Before you leave Hello Rent in Weligama, Lucky or one of our team sits beside you for a relaxed hands-on practice session — starting on flat ground, practising hill starts, reverse parking, and smooth downshifts — until you are grinning and ready.',
        ],
        table: {
          caption: 'Tuk-Tuk vs Scooter vs Compact Car for Sri Lanka travel',
          headers: ['Vehicle Type', 'Daily Rate at Hello Rent', 'Passengers & Bags', 'Weather Protection', 'Vibe & Pace'],
          rows: [
            [
              'Bajaj RE Tuk-Tuk',
              '€15 / day',
              'Driver + up to 3 passengers · 60–80L luggage',
              'Full roof & roll-down rain flaps',
              'Iconic open-air road trip · steady 40 km/h',
            ],
            [
              'Automatic Scooter',
              '€5 – €6 / day',
              '1–2 riders · 18–22L under-seat bay',
              'Open to sun & rain',
              'Nimble & effortless for short coastal hops',
            ],
            [
              'Automatic A/C Car',
              '€31 / day',
              '4–5 passengers + full suitcases',
              'Enclosed cabin + air conditioning',
              'Fastest inter-city comfort & expressway access',
            ],
          ],
        },
      },
      {
        id: 'tuktuk-licence-and-road-rules',
        eyebrow: '[ Permits & Limits ]',
        heading: 'Permits, speed limits & mountain tips for tuk tuk rental Sri Lanka',
        paragraphs: [
          'Three-wheelers have their own specific rules in Sri Lanka that every self-drive visitor must respect. First, you must hold a Sri Lankan recognition permit endorsed for three-wheelers / light vehicles alongside your valid International Driving Permit and home licence — message us a photo of your licence on WhatsApp before booking and we will verify your categories and arrange the local permit (€57, valid six months) ahead of your arrival.',
          'Second, the national legal speed limit for three-wheelers in Sri Lanka is 40 km/h, and tuk-tuks are not permitted on expressways. That unhurried 40 km/h cruising speed is actually the secret to why tuk-tuk travel feels so relaxing: you spot roadside king-coconut stalls, elephants near Udawalawe, and hidden coves that cars blur straight past.',
        ],
        bullets: [
          {
            title: 'Drop to 1st or 2nd gear BEFORE steep hill climbs & descents',
            detail:
              'Climbing toward Ella or Deniyaya with two passengers and backpacks? Shift down early and let the punchy 4-stroke engine chug steadily rather than slipping the clutch.',
          },
          {
            title: 'Corner smoothly — remember you have one front wheel',
            detail:
              'Brake in a straight line before entering tight turns rather than yanking the handlebars sharply mid-corner.',
          },
          {
            title: 'Split the €15/day cost with a travel partner',
            detail:
              'At €7.50 per person for two travelers (or €5 each for three), a self-drive tuk-tuk costs nearly the same per person as two separate scooters while keeping all your bags dry together.',
          },
        ],
        callout: {
          eyebrow: '[ Ready for Three Wheels? ]',
          title: 'Book your Bajaj RE tuk-tuk in Weligama',
          body: 'Our tuk-tuks are among the first vehicles in the shop to book out in peak south-coast season. Reserve yours online with zero upfront card charge.',
          ctaLabel: 'RESERVE A TUK-TUK',
          ctaTo: '/book-now',
        },
      },
    ],
    faqs: [
      {
        question: 'How much is tuktuk rental in Weligama per day?',
        answer:
          'At Hello Rent - Scooter & Tuktuk Rental in Weligama, our well-maintained Bajaj RE 4-stroke tuk-tuks rent for €15 per day, including a full driving walkthrough before you set off and 24/7 roadside support.',
      },
      {
        question: 'Do you give a driving lesson if I have never driven a tuk-tuk before?',
        answer:
          'Yes! Almost none of our guests have driven a handlebar-shift three-wheeler before arriving in Weligama. We walk you through the clutch, gears, reverse lever, and braking on quiet streets until you feel completely confident.',
      },
      {
        question: 'What driving permit do I need for tuk tuk rental in Sri Lanka?',
        answer:
          'You need a valid home driving licence (typically Category B / light vehicle), an official physical International Driving Permit booklet, and a Sri Lankan recognition permit covering three-wheelers. Send us a photo of your licence on WhatsApp and Hello Rent can check eligibility and arrange your six-month Sri Lankan permit.',
      },
      {
        question: 'Can a tuk-tuk carry surfboards around Weligama and Ahangama?',
        answer:
          'Yes — shortboards can tuck diagonally inside when riding solo or two-up, and longer boards can be strapped securely to the roof rack with soft straps for easy runs between Weligama Bay, Midigama, and Kabalana.',
      },
    ],
    relatedSlugs: [
      'hello-rent-scooter-tuktuk-rental-weligama-guide',
      'scenic-coastal-hill-routes-from-weligama-sri-lanka',
      'scooter-rental-weligama-guide',
    ],
    internalLinks: [
      {
        label: 'See Our Bajaj RE Tuk-Tuk Specs',
        to: '/fleet',
        description: 'Compare our three-wheelers alongside scooters, motorbikes, and A/C cars.',
      },
      {
        label: 'Arrange Your Sri Lankan Driving Permit',
        to: '/driving-permit',
        description: 'Check licence categories and let us handle the paperwork.',
      },
      {
        label: 'Plan Your One-Day Route from Weligama',
        to: '/tours',
        description: 'Discover wildlife parks, rainforests, and beaches within easy reach.',
      },
    ],
  },

  /* ======================================================================== */
  /* 5. Hello Rent - Scooter & Tuktuk Rental / Hello Rent                     */
  /* ======================================================================== */
  {
    slug: 'hello-rent-scooter-tuktuk-rental-weligama-guide',
    title: 'Hello Rent – Scooter & Tuk-Tuk Rental in Weligama: How Our Local Community Fleet Works',
    seoTitle: 'Hello Rent - Scooter & Tuktuk Rental Weligama | Local Guide',
    seoDescription:
      'Meet Hello Rent - Scooter & Tuktuk Rental in Weligama. Family-run by Bhagya (“Lucky”) & Sandra, supporting ~100 local families with honest €5 scooters & €15 tuk-tuks.',
    keywords: [
      'hello rent - scooter & tuktuk rental',
      'hello rent',
      'scooter rental weligama',
      'tuktuk rental weligama',
      'weligama scooter rental',
      'bike rent weligama',
    ],
    category: 'Local Stories',
    publishedAt: '2026-03-29',
    displayDate: '29 Mar 2026',
    readingTime: '5 min read',
    author: {
      name: 'Bhagya “Lucky” & Sandra',
      role: 'Founders, Hello Rent Weligama',
    },
    image: '/photos/shop-front.jpg',
    imageAlt: 'The Hello Rent - Scooter & Tuktuk Rental storefront in central Weligama',
    excerpt:
      'What started in 2017 with a hand-painted wooden sign and three borrowed scooters near Weligama Beach now supports around a hundred local families. Here is what to expect when you rent with Hello Rent.',
    whatsappPrompt:
      "Hi Lucky & Sandra at Hello Rent! I read your story and I'd love to book a vehicle for my stay in Weligama.",
    quickFacts: [
      { label: 'Founded in Weligama', value: '2017 by Lucky & Sandra' },
      { label: 'Community Impact', value: '~100 Local Families' },
      { label: 'Passport Held?', value: 'Never — Copy Only' },
      { label: 'Opening Hours', value: 'Mon–Sun 07:00–21:00' },
    ],
    sections: [
      {
        id: 'story-behind-hello-rent-weligama',
        eyebrow: '[ From Surf Camp to Central Weligama ]',
        heading: 'How Hello Rent – Scooter & Tuktuk Rental began with three friends’ scooters',
        paragraphs: [
          'Between 2016 and 2020, Bhagya — whom everyone on the coast calls “Lucky”, the English meaning of his Sinhala name — taught surfing on Weligama Beach. Every afternoon after surf lessons, students asked the exact same question: where in Weligama can we rent a clean scooter without getting overcharged or hassled over tiny scratches?',
          'Lucky started by lending his own scooter and borrowing two or three well-kept bikes from trusted friends for fellow surfers. In 2017, he reclaimed a family plot right in the heart of Weligama town — walking distance from Weligama Beach, the railway station, the bus stand, and local banks — painted the words “Hello Rent” on an old wooden board, and parked his friends’ scooters out front.',
          'Today, run side by side by husband-and-wife team Bhagya and Sandra, Hello Rent - Scooter & Tuktuk Rental operates on a unique community model: around one hundred Weligama families place their vehicles in our care and earn steady household income from tourism, while travelers receive mechanically inspected scooters, motorbikes, tuk-tuks, and cars backed by one accountable local shop.',
        ],
      },
      {
        id: 'what-makes-hello-rent-different',
        eyebrow: '[ Zero Rental Anxiety ]',
        heading: 'Six things we do differently at Hello Rent',
        paragraphs: [
          'Renting a vehicle abroad can feel stressful when rules are unclear. Everything in our Weligama shop is built around one simple Buddhist principle: treat visitors like a brother or sister arriving in town for the first time.',
        ],
        bullets: [
          {
            title: '1. Published euro rates — zero haggling or hidden add-ons',
            detail:
              '110cc scooters are €5/day, 125cc TVS Ntorq €6/day, manual motorbikes €10/day, Bajaj RE tuk-tuks €15/day, and automatic A/C cars or vans €31/day.',
          },
          {
            title: '2. We never hold your original passport',
            detail:
              'Your passport belongs safely with you. A quick copy of your photo page and driving permit is all we take at handover.',
          },
          {
            title: '3. Safety comes before making a sale',
            detail:
              'Before handing over keys, we ask about your experience with two-wheelers, manual clutches, and left-hand Asian traffic. If a vehicle isn’t safe for you right now, we say so honestly and suggest a better match.',
          },
          {
            title: '4. Official 6-month Sri Lankan permits arranged before arrival',
            detail:
              'Send your IDP, passport page, and photo by WhatsApp and skip government office queues altogether (€57 one-off).',
          },
          {
            title: '5. South-coast hotel delivery & collection',
            detail:
              'Staying in Mirissa, Midigama, Ahangama, or a hillside villa? We bring your scooter, tuk-tuk, or car straight to your door and collect it when you check out (€15 flat).',
          },
          {
            title: '6. 24/7 local WhatsApp support',
            detail:
              'Flat tyre near Kabalana? Unsure which turn leads to Deniyaya? Message +94 76 707 3388 anytime and talk directly to people who know every road in the south.',
          },
        ],
        callout: {
          eyebrow: '[ Come as a Traveler, Leave as Family ]',
          title: 'Read Bhagya & Sandra’s full Weligama story',
          body: 'Learn more about our values, safety commitment, and the local families behind the Hello Rent fleet.',
          ctaLabel: 'READ OUR STORY',
          ctaTo: '/about',
        },
      },
      {
        id: 'finding-our-weligama-store',
        eyebrow: '[ Visit the Shop ]',
        heading: 'How to find Hello Rent in Weligama (and how booking works)',
        paragraphs: [
          'If you arrive on the coastal train from Colombo Fort or Galle, our Weligama shop is just a few minutes away in the town centre — open seven days a week from 07:00 to 21:00. You can walk in, test seat heights across our Honda Dio, Yamaha Ray ZR, TVS Ntorq, Pulsar, or Bajaj RE tuk-tuk, and ride out in fifteen minutes.',
          'Travelling between December and April? South-coast surf season gets busy fast, so we recommend locking in your dates online via our booking page. It takes under two minutes, requires no credit card upfront, and guarantees your preferred vehicle is freshly serviced and waiting.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where is Hello Rent - Scooter & Tuktuk Rental located?',
        answer:
          'Hello Rent is located in central Weligama, Southern Province, Sri Lanka — walking distance from Weligama Beach, Weligama railway station, and the main bus stand. You can get exact turn-by-turn directions on our Contact page.',
      },
      {
        question: 'Do I need a credit card to book online with Hello Rent?',
        answer:
          'No credit card is required to reserve online. Choose your vehicle, dates, and optional extras on our website, and pay simply when you pick up your vehicle in Weligama or when we deliver to your hotel.',
      },
      {
        question: 'What vehicles does Hello Rent offer besides scooters and tuk-tuks?',
        answer:
          'Alongside 110cc–125cc automatic scooters and Bajaj RE 4-stroke tuk-tuks, Hello Rent offers 160cc–200cc manual motorbikes (Pulsar, FZ, Apache, Hunk) and automatic air-conditioned cars and vans (Suzuki Wagon R, Spacia, Toyota Roomy, Raize, Prius, and KDH surfboard vans).',
      },
      {
        question: 'What are Hello Rent’s opening hours in Weligama?',
        answer:
          'Our Weligama shop is open every day from 07:00 to 21:00 (Monday through Sunday), with 24/7 roadside assistance available for active rentals.',
      },
    ],
    relatedSlugs: [
      'scooter-rental-weligama-guide',
      'tuktuk-rental-weligama-sri-lanka-guide',
      'scenic-coastal-hill-routes-from-weligama-sri-lanka',
    ],
    internalLinks: [
      {
        label: 'Find Hello Rent on Google Maps',
        to: '/contact#store',
        description: 'Directions, opening hours, and one-tap WhatsApp contact.',
      },
      {
        label: 'Explore Our Full Fleet',
        to: '/fleet',
        description: 'Scooters (€5), Motorbikes (€10), Tuk-Tuks (€15), and Cars (€31).',
      },
      {
        label: 'Book Your Ride Online',
        to: '/book-now',
        description: 'Reserve in two minutes with zero upfront card payment.',
      },
    ],
  },

  /* ======================================================================== */
  /* 6. Best Routes from Weligama (Coast & Hill Country)                      */
  /* ======================================================================== */
  {
    slug: 'scenic-coastal-hill-routes-from-weligama-sri-lanka',
    title: 'Best South Coast & Hill Country Routes from Weligama by Scooter, Bike or Tuk-Tuk',
    seoTitle: 'Best Scooter & Tuk-Tuk Routes from Weligama | Hello Rent',
    seoDescription:
      '4 unforgettable Sri Lanka routes starting with a Weligama scooter rental, bike rental, or self-drive tuk-tuk: Galle Fort, Hiriketiya, Sinharaja & Ella.',
    keywords: [
      'weligama scooter rental',
      'weligama bike rental',
      'tuk tuk rental sri lanka',
      'rent scooter sri lanka',
      'hello rent',
    ],
    category: 'Riding Guides',
    publishedAt: '2026-03-18',
    displayDate: '18 Mar 2026',
    readingTime: '8 min read',
    author: {
      name: 'Bhagya “Lucky” & Sandra',
      role: 'Founders, Hello Rent Weligama',
    },
    image: '/blog/tea-country.webp',
    imageAlt: 'Winding green tea-country road in Sri Lanka ideal for motorbikes and tuk-tuks',
    excerpt:
      'Ride twenty kilometres in any direction from Weligama and Sri Lanka changes completely — Dutch forts to the west, horseshoe surf bays to the east, and misty rainforests and tea estates inland. Here are Lucky’s four favourite routes.',
    whatsappPrompt:
      "Hi Hello Rent! I'm planning a road trip from Weligama and would love route and vehicle advice.",
    quickFacts: [
      { label: 'Starting Point', value: 'Hello Rent Weligama' },
      { label: 'Half-Day Coast Runs', value: '15 – 45 km each way' },
      { label: 'Inland Tea & Forest', value: '65 – 85 km each way' },
      { label: 'Hill Country Loop', value: '2 – 5 Days' },
    ],
    sections: [
      {
        id: 'route-1-west-coast-galle-fort',
        eyebrow: '[ Route 01 · West Along the Reefs ]',
        heading: 'Weligama → Midigama → Ahangama → Koggala Lake → Galle Fort (30 km)',
        paragraphs: [
          'If it is your very first morning with a Weligama scooter rental, turn right (west) onto the coastal road after sunrise. Within ten minutes you roll past the reef breaks of Midigama (Lazy Left and Rams) and the iconic stilt fishermen platforms between Ahangama and Koggala.',
          'Before pushing on to Unawatuna and the 17th-century ramparts of Galle Fort, detour five minutes inland around Koggala Lake — a glass-calm lagoon ringed by cinnamon islands and quiet Buddhist temples where tour buses never go. An automatic 110cc Honda Dio or Yamaha Ray ZR (€5/day) handles this entire 60 km round trip on less than two litres of petrol.',
        ],
      },
      {
        id: 'route-2-east-bays-mirissa-hiriketiya',
        eyebrow: '[ Route 02 · East to Hidden Bays ]',
        heading: 'Weligama → Mirissa → Madiha → Hiriketiya → Tangalle (42 – 58 km)',
        paragraphs: [
          'Head east from Weligama and the coastline breaks into a string of palm-fringed coves. Pass Coconut Tree Hill in Mirissa early before the midday crowd arrives, skirt through Matara, and cruise the quiet oceanfront lane of Madiha — one of the best spots on the south coast to spot green sea turtles swimming right off the reef.',
          'Forty-two kilometres east of Weligama sits Hiriketiya, a lush horseshoe bay near Dickwella with gentle longboard waves on one side and café-lined jungle hills above. Keep rolling another twenty minutes to Tangalle if you want wide, empty golden beaches. Our TVS Ntorq 125 (€6/day) or a Bajaj RE tuk-tuk (€15/day) makes this an effortless full-day beach crawl.',
        ],
      },
      {
        id: 'route-3-inland-deniyaya-sinharaja',
        eyebrow: '[ Route 03 · Rainforest & Tea ]',
        heading: 'Weligama → Akuressa → Deniyaya & Sinharaja Edge (72 km)',
        paragraphs: [
          'Most visitors don’t realise how fast the tropical beach gives way to cool mountain air. Turn directly inland from Weligama through Akuressa and watch coconut palms give way to rubber estates, cinnamon gardens, low-grown tea slopes, and roadside waterfalls around Deniyaya on the border of the UNESCO-listed Sinharaja Rain Forest.',
          'Start by 06:30 so you arrive before midday clouds gather over the canopy, visit a working tea factory, swim in a clear rock pool, and coast back down to Weligama before dusk. Because the road climbs and twists past tea lorries, we recommend at least the 125cc TVS Ntorq for solo riders or a 160cc–200cc manual motorbike (€10/day) if riding two-up.',
        ],
        table: {
          caption: 'Matching Lucky’s 4 routes to the ideal Hello Rent vehicle',
          headers: ['Route from Weligama', 'One-Way Distance', 'Trip Length', 'Recommended Vehicle'],
          rows: [
            ['West: Midigama, Koggala & Galle Fort', '~30 km', 'Half day', '110cc Scooter (€5/day) or Tuk-Tuk (€15/day)'],
            ['East: Mirissa, Madiha & Hiriketiya', '~42 km', 'Full day', 'TVS Ntorq 125 (€6/day) or Tuk-Tuk (€15/day)'],
            ['Inland: Deniyaya Tea & Sinharaja', '~72 km', 'Early full day', '160–200cc Motorbike (€10/day) or Ntorq 125'],
            ['Multi-Day: Udawalawe, Ella & Kandy', '165 – 290 km', '3 – 6 days', 'Yamaha FZ / Pulsar / Apache (€10) or Tuk-Tuk (€15)'],
          ],
        },
      },
      {
        id: 'route-4-multi-day-ella-hill-country',
        eyebrow: '[ Route 04 · The Classic Island Climb ]',
        heading: 'Multi-day loop: Weligama → Udawalawe → Ella → Nuwara Eliya',
        paragraphs: [
          'Planning a multi-day Weligama bike rental or self-drive tuk tuk rental in Sri Lanka? Break the climb to Ella in two scenic stages: ride east and inland across open plains past Udawalawe National Park (famous for wild elephants right beside the reservoir fence), stay overnight or grab lunch near Wellawaya, and climb through Ravana Falls pass into Ella at 1,040 metres.',
          'Pack a windproof layer and light rain shell — temperatures drop quickly from 30°C in Weligama to 16°C in the central highlands! Before setting out on any multi-day trip, drop by the shop and Lucky will check live road conditions and mark the best fuel and tea stops on your phone.',
        ],
        callout: {
          eyebrow: '[ More Day-Trip Ideas ]',
          title: 'See all 10 places you can reach in one day from Weligama',
          body: 'Explore Lucky’s complete 360° day-trip guide including Yala, Hiyare Rain Forest, Hikkaduwa, and ancient southern temples.',
          ctaLabel: 'EXPLORE DAY TRIPS GUIDE',
          ctaTo: '/tours',
        },
      },
    ],
    faqs: [
      {
        question: 'Can I take a Weligama scooter rental or tuk-tuk on a multi-day trip to Ella?',
        answer:
          'Yes! Guests regularly take our manual motorbikes (Yamaha FZ 160, Bajaj Pulsar N160, TVS Apache 200), Bajaj RE tuk-tuks, and 125cc TVS Ntorq scooters on multi-day loops to Udawalawe, Ella, and back to Weligama. Tell us your planned route at pickup so we prep the vehicle and luggage setup accordingly.',
      },
      {
        question: 'How long does it take to ride from Weligama to Galle Fort or Hiriketiya?',
        answer:
          'Allow around 50–60 minutes at a relaxed coastal pace to reach Galle Fort (30 km west) and roughly 70–85 minutes to reach Hiriketiya (42 km east), plus plenty of extra time for coffee, surf checks, and beach swims along the way.',
      },
      {
        question: 'Are Google Maps travel times accurate for scooters and tuk-tuks in Sri Lanka?',
        answer:
          'Google Maps is reliable for navigation on main A- and B-roads (be sure to toggle “Avoid Highways/Tolls” so it never routes you onto the E01 Southern Expressway), though in a tuk-tuk or on steep mountain roads you should add 25–30% to Google’s estimated driving time.',
      },
      {
        question: 'What if rain catches me halfway through a south-coast ride?',
        answer:
          'South-coast showers outside peak monsoon usually pass in 20 to 40 minutes — do what Sri Lankan riders do: pull into a roadside bakery or king-coconut stall, enjoy a hot cup of Ceylon tea and a roti, and wait for the sun to break back out rather than rushing on slick first-rain tarmac.',
      },
    ],
    relatedSlugs: [
      'scooter-rental-weligama-guide',
      'bike-rent-weligama-scooter-vs-motorbike',
      'tuktuk-rental-weligama-sri-lanka-guide',
    ],
    internalLinks: [
      {
        label: 'Full 1-Day Destinations from Weligama',
        to: '/tours',
        description: '10 beaches, parks, and rainforests mapped from our Weligama door.',
      },
      {
        label: 'Choose Your Vehicle for the Trip',
        to: '/fleet',
        description: 'Compare scooters, manual hill-country motorbikes, tuk-tuks, and cars.',
      },
      {
        label: 'Book Your Dates Now',
        to: '/book-now',
        description: 'Add a GPS phone mount and rear luggage box in seconds.',
      },
    ],
  },
];

export const BLOG_CATEGORIES = [
  'All Guides',
  ...Array.from(new Set(BLOG_POSTS.map(post => post.category))),
];

export function getBlogPostBySlug(slug: string | undefined): BlogPost | undefined {
  if (!slug) return undefined;
  return BLOG_POSTS.find(post => post.slug === slug);
}

export function getRelatedBlogPosts(post: BlogPost, limit = 3): BlogPost[] {
  const explicit = post.relatedSlugs
    .map(slug => getBlogPostBySlug(slug))
    .filter((p): p is BlogPost => Boolean(p));

  if (explicit.length >= limit) return explicit.slice(0, limit);

  const fallback = BLOG_POSTS.filter(
    p => p.slug !== post.slug && !explicit.some(e => e.slug === p.slug),
  );
  return [...explicit, ...fallback].slice(0, limit);
}
