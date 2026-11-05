/**
 * Editorial riding & rental guides for Hello Rent - Scooter & Tuktuk Rental.
 *
 * Kept as pure data (no React imports) so both the browser bundle and the Vite
 * build-time SEO/sitemap plugins can walk the exact same list of articles,
 * slugs, metadata, FAQs, and internal links.
 */

export type BlogCategory =
  | 'Weligama Local'
  | 'Sri Lanka Tips'
  | 'Tuk-Tuk Guides'
  | 'Routes & Trips';

export interface BlogComparisonTable {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface BlogCallout {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaTo?: string;
  dark?: boolean;
}

export interface BlogSection {
  id: string;
  heading: string;
  /** Supports inline markdown-style links `[anchor text](/path)` rendered via React Router. */
  paragraphs: string[];
  bullets?: { label: string; text: string }[];
  table?: BlogComparisonTable;
  callout?: BlogCallout;
}

export interface BlogFaq {
  question: string;
  /** Plain text (also emitted verbatim into FAQPage JSON-LD). */
  answer: string;
}

export interface BlogPost {
  slug: string;
  path: `/blog/${string}`;
  title: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  category: BlogCategory;
  publishedAt: string;
  updatedAt: string;
  displayDate: string;
  readingTime: string;
  heroImage: string;
  cardImage: string;
  heroAlt: string;
  excerpt: string;
  keyTakeaways: string[];
  sections: BlogSection[];
  faqs: BlogFaq[];
  relatedSlugs: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  /* ------------------------------------------------------------------ */
  /*  1. Weligama Scooter & Bike Rental Cornerstone Guide                */
  /* ------------------------------------------------------------------ */
  {
    slug: 'weligama-scooter-bike-rental-guide',
    path: '/blog/weligama-scooter-bike-rental-guide',
    title: 'Weligama Scooter Rental & Bike Rent: 2026 Prices, Surf Racks & Local Tips',
    seoTitle: 'Weligama Scooter Rental & Bike Rent Guide (2026) | Hello Rent',
    metaDescription:
      'Planning scooter rental in Weligama or bike rent in Weligama? Compare €5–€10/day rates, surf racks, permits and no-passport deposits at Hello Rent.',
    keywords: [
      'scooter rental weligama',
      'weligama scooter rental',
      'bike rent weligama',
      'weligama bike rental',
      'hello rent - scooter & tuktuk rental',
      'hello rent',
    ],
    category: 'Weligama Local',
    publishedAt: '2026-10-28',
    updatedAt: '2026-11-04',
    displayDate: '28 Oct 2026',
    readingTime: '7 min read',
    heroImage: '/photos/scooters-weligama-bay.jpg',
    cardImage: '/photos/scooters-weligama-bay.jpg',
    heroAlt: 'Two Hello Rent scooters parked overlooking Weligama Bay on Sri Lanka’s south coast',
    excerpt:
      'What scooter rental in Weligama really costs per day, how to choose between an automatic 110cc scooter and a geared motorbike, and the local rules worth knowing before you ride out onto Matara Road.',
    keyTakeaways: [
      'Automatic 110cc scooters (Honda Dio, Yamaha Ray ZR) start at €5/day; 125cc TVS Ntorq scooters are €6/day; manual 160cc–200cc motorbikes are €10/day.',
      'Never leave your physical passport as a rental deposit — reputable Weligama shops use fair deposit alternatives.',
      'To ride legally past south-coast police checks, you need Category A on your International Driving Permit plus a local Sri Lankan recognition permit.',
      'Hello Rent - Scooter & Tuktuk Rental sits in central Weligama near the train station and beach, with hotel delivery across Mirissa, Midigama and Ahangama.',
    ],
    sections: [
      {
        id: 'weligama-rental-prices',
        heading: 'What Scooter Rental in Weligama Actually Costs in 2026',
        paragraphs: [
          'If you are staying anywhere along Weligama Bay, having your own two wheels turns twenty-minute tuk-tuk negotiations into effortless five-minute coastal hops. Morning surf at Weligama Beach, brunch in Ahangama, sunset at Coconut Tree Hill in Mirissa, and dinner in Midigama all sit within ten kilometres of each other along the A2 coast road.',
          'At **Hello Rent - Scooter & Tuktuk Rental**, we keep pricing transparent and grouped by engine class rather than haggling at the kerb. Every [Weligama scooter rental and motorbike in our fleet](/fleet) includes a safety-inspected vehicle, a rider helmet, and 24/7 south-coast roadside support.',
        ],
        table: {
          caption: '2026 Daily Rates at Hello Rent (Weligama, Southern Province)',
          headers: ['Vehicle Class', 'Models in Fleet', 'Transmission', 'Daily Rate'],
          rows: [
            ['110cc Scooter', 'Honda Dio, Yamaha Ray ZR, Honda Navi', 'Automatic (twist & go)', '€5 / day'],
            ['125cc Scooter', 'TVS Ntorq 125', 'Automatic (twist & go)', '€6 / day'],
            ['Manual Motorbike', 'Bajaj Pulsar N160, Yamaha FZ 160, TVS Apache 200', 'Manual clutch & gears', '€10 / day'],
            ['Self-Drive Tuk-Tuk', 'Bajaj RE 4-Stroke Three-Wheeler', 'Manual handlebar clutch', '€15 / day'],
          ],
        },
      },
      {
        id: 'scooter-vs-bike-rent-weligama',
        heading: 'Bike Rent in Weligama: Automatic Scooter vs Manual Motorbike',
        paragraphs: [
          'Travelers searching for **bike rent Weligama** or **Weligama bike rental** often mean two very different machines: an automatic step-through scooter for beach runs, or a geared motorcycle for climbing into the hills. Picking the right one comes down to your licence, your height, and how far inland you plan to ride.',
          'For 90% of south-coast trips between Hikkaduwa, Galle, Weligama, Mirissa and Hiriketiya, an automatic scooter is easier in town traffic and gives you lockable under-seat storage for flip-flops, sunscreen and a dry shirt. If you want a deeper model-by-model breakdown, read our [scooter vs motorbike comparison for Sri Lanka](/blog/scooter-vs-motorbike-sri-lanka).',
        ],
        bullets: [
          {
            label: 'Honda Dio 110cc & Yamaha Ray ZR (€5/day)',
            text: 'Low seat height (765mm on the Dio) and light weight (99kg on the Ray ZR) make these the easiest Weligama scooter rental choice for solo riders and narrow beach lanes.',
          },
          {
            label: 'TVS Ntorq 125 (€6/day)',
            text: 'Extra torque for two adults riding together, larger 22L under-seat boot, and stronger acceleration when merging onto Matara Road.',
          },
          {
            label: 'Pulsar N160, Yamaha FZ 160 & Apache 200 (€10/day)',
            text: 'Proper manual motorbikes with bigger fuel tanks, perimeter frames and engine braking — built for riders heading up to Ella, Sinharaja or Deniyaya.',
          },
        ],
      },
      {
        id: 'deposits-damage-honesty',
        heading: 'No Passport Deposit & Fair Damage Rules at Hello Rent',
        paragraphs: [
          'Two things ruin holiday rentals across South Asia faster than anything else: shops holding your original passport hostage, and inflated scratch bills on return day. When Bhagya ("Lucky") and Sandra built [Hello Rent](/about) from a hand-painted board in 2017, they set out to run the opposite kind of shop.',
          'We **never** ask you to leave your physical passport as a deposit, and if a plastic panel ever gets scuffed in a tight surf-camp car park, we charge only the normal local market price of the part — zero invented labour fees and zero spare-parts commissions. Around a hundred Weligama families own the bikes in our fleet, so keeping every handover honest protects both travelers and our neighbours.',
        ],
        callout: {
          eyebrow: '[ Permit Arranged Before You Land ]',
          title: 'Need your Sri Lankan driving permit sorted?',
          body: 'Your home licence alone is not valid here. Send your government-issued IDP booklet and passport page on WhatsApp and Hello Rent arranges the official 6-month Automobile Association permit so it is waiting with your bike.',
          ctaLabel: 'See how the permit works',
          ctaTo: '/driving-permit',
          dark: true,
        },
      },
      {
        id: 'surf-racks-fuel-police-weligama',
        heading: 'Surf Racks, Fuel Stations & Police Checks Around Weligama Bay',
        paragraphs: [
          'Weligama is a surf town first, so side-mounted surfboard racks, phone mounts (€1/day) and extra passenger helmets (€2/day) are everyday requests. Keep speeds calm when carrying a longboard across the bay bridge or past the open ocean breeze between Midigama and Kabalana — gusts off the water catch big boards if you rush.',
          'Fuel is simple: both Ceypetco and Lanka IOC petrol stations sit right on the main road in Weligama town and accept cash in Sri Lankan rupees (and cards at most pumps). Traffic police regularly check riders between Weligama, Mirissa and Ahangama for three things: a fastened helmet, sober riding, and a valid [Sri Lankan driving permit](/driving-permit) matching your vehicle class.',
        ],
      },
      {
        id: 'pickup-delivery-hello-rent',
        heading: 'Picking Up from Hello Rent - Scooter & Tuktuk Rental (or Hotel Delivery)',
        paragraphs: [
          'Our shop sits right in the centre of Weligama — walking distance from Weligama railway station, the main bus stand, the banks, and Weligama Beach, open seven days a week from **07:00 to 21:00**. Before handing over the keys, we walk through the brakes, tyres, lights and left-hand road habits with you so your first ten minutes feel natural.',
          'Staying in Mirissa, Midigama, Ahangama, Kabalana or Matara? Add hotel delivery when you [book your scooter or bike online](/book-now) (no card required to reserve) or message us on [our Weligama contact page](/contact) and we will bring the ride straight to your guesthouse gate.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How much does scooter rental in Weligama cost per day?',
        answer:
          'At Hello Rent in Weligama, 110cc automatic scooters (Honda Dio, Yamaha Ray ZR, Honda Navi) cost €5 per day, 125cc TVS Ntorq scooters cost €6 per day, and manual 160cc–200cc motorbikes cost €10 per day, including a helmet and roadside assistance.',
      },
      {
        question: 'Do I have to leave my passport for bike rent in Weligama?',
        answer:
          'No. Hello Rent never holds your physical passport as a deposit. We verify your ID and driving permit at handover and offer fair, privacy-respecting deposit alternatives.',
      },
      {
        question: 'What licence do I need for a Weligama scooter rental?',
        answer:
          'To ride a scooter or motorbike legally in Weligama and across Sri Lanka, you need a full motorcycle category (Category A) on your government-issued International Driving Permit (1949 convention booklet) plus a Sri Lankan local recognition permit, which Hello Rent can arrange in advance.',
      },
      {
        question: 'Where is Hello Rent - Scooter & Tuktuk Rental located?',
        answer:
          'Hello Rent - Scooter & Tuktuk Rental is in the centre of Weligama town, Southern Province, within walking distance of Weligama Beach and Weligama train station, open daily from 07:00 to 21:00. We also deliver vehicles to hotels in Mirissa, Midigama, Ahangama and across the island.',
      },
    ],
    relatedSlugs: [
      'rent-a-scooter-in-sri-lanka',
      'tuktuk-rental-weligama-sri-lanka',
      'south-coast-ride-weligama-to-galle',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  2. Rent a Scooter in Sri Lanka — Island-Wide First-Timer Guide     */
  /* ------------------------------------------------------------------ */
  {
    slug: 'rent-a-scooter-in-sri-lanka',
    path: '/blog/rent-a-scooter-in-sri-lanka',
    title: 'How to Rent a Scooter in Sri Lanka: Licences, Daily Costs & Road Rules',
    seoTitle: 'Rent a Scooter in Sri Lanka: 2026 Permits & Costs | Hello Rent',
    metaDescription:
      'Everything you need to rent a scooter in Sri Lanka legally in 2026: AAC driving permits, real €5/day scooter rental prices, traffic rules and safety tips.',
    keywords: [
      'rent a scooter sri lanka',
      'rent scooter sri lanka',
      'scooter rental weligama',
      'hello rent',
      'hello rent - scooter & tuktuk rental',
    ],
    category: 'Sri Lanka Tips',
    publishedAt: '2026-10-19',
    updatedAt: '2026-11-03',
    displayDate: '19 Oct 2026',
    readingTime: '8 min read',
    heroImage: '/blog/permit.webp',
    cardImage: '/blog/permit.webp',
    heroAlt: 'Traveler preparing documents and helmet to rent a scooter in Sri Lanka',
    excerpt:
      'Planning to rent a scooter in Sri Lanka? Here is the honest breakdown of IDP and local permit laws, real daily costs, left-hand road habits, and how to inspect a bike before riding off.',
    keyTakeaways: [
      'Your home driving licence alone is not legal in Sri Lanka — you need a government-issued IDP booklet plus a local Sri Lankan recognition permit.',
      'Online "digital IDPs" sold by private websites are rejected by Sri Lankan police and the Automobile Association.',
      'Expect to pay €5–€6/day for a well-maintained 110cc–125cc automatic scooter on the south coast.',
      'Sri Lanka drives on the left; expressways ("E" highways) are strictly closed to scooters, motorbikes and tuk-tuks.',
    ],
    sections: [
      {
        id: 'licence-requirements-sri-lanka',
        heading: 'What Licence You Need to Rent a Scooter in Sri Lanka',
        paragraphs: [
          'The biggest surprise for first-time visitors looking to **rent a scooter in Sri Lanka** is the paperwork. Unlike parts of Southeast Asia where travelers take chances on a home card, Sri Lankan traffic law strictly requires a locally endorsed permit — and travel insurance policies routinely void medical cover if you ride without the proper category.',
          'To ride any 110cc or 125cc scooter legally here, your home licence and your **government-issued International Driving Permit (1949 Geneva booklet)** must carry **Category A** (motorcycles). Beware of €30 "instant PDF international licences" advertised online — they hold zero legal standing in Colombo or at south-coast checkpoints.',
          'On top of your IDP, you need a Sri Lankan temporary recognition permit. You can queue at the airport arrival counter (valid 1 month), spend half a day at the Department of Motor Traffic in Werahera or Hambantota (valid 1 month), or let [Hello Rent arrange your 6-month Automobile Association permit](/driving-permit) over WhatsApp before you even pack your bags.',
        ],
      },
      {
        id: 'cost-to-rent-scooter-sri-lanka',
        heading: 'How Much Does It Cost to Rent a Scooter in Sri Lanka?',
        paragraphs: [
          'When travelers search **rent scooter Sri Lanka**, quotes online swing wildly between beachfront touts and international aggregators taking 30% commission. Booking directly with an established local shop gives you newer tyres, real brakes, and honest local rates.',
          'At **Hello Rent** in Weligama, daily scooter rental starts at **€5/day** for 110cc twist-and-go models (Honda Dio, Yamaha Ray ZR, Honda Navi) and **€6/day** for the 125cc TVS Ntorq. Optional extras are priced plainly: €1/day for a handlebar GPS phone mount, €2/day for a second passenger helmet, €3/day for a lockable top box, and €15 one-off for hotel delivery.',
        ],
        callout: {
          eyebrow: '[ Transparent Fleet Pricing ]',
          title: 'Compare every scooter, bike & tuk-tuk side by side',
          body: 'See live daily rates in euros, seat heights, storage space and transmission types across the full Hello Rent fleet — reserve online and pay at pickup.',
          ctaLabel: 'Browse the fleet',
          ctaTo: '/fleet',
        },
      },
      {
        id: 'sri-lanka-traffic-rules',
        heading: 'Traffic Rules, Buses & Fuel Stations First-Time Riders Should Know',
        paragraphs: [
          'Riding in Sri Lanka is genuinely rewarding once you understand the rhythm of the road. Speeds outside cities are modest — coastal towns flow at 35–50 km/h — so you rarely feel pushed to ride fast, provided you stay alert and predictable.',
        ],
        bullets: [
          {
            label: 'Keep left & yield to buses',
            text: 'Sri Lanka drives on the left. Private and red SLTB buses overtake assertively and flash their headlights to claim the lane — ease left, give them room, and never contest a gap with a bus.',
          },
          {
            label: 'Stay off Expressways (E01 / E02)',
            text: 'Toll expressways such as the Southern Expressway are car-and-bus only. Set Google Maps to "Two-wheeler" or toggle "Avoid highways" so your route stays on scenic A- and B-roads.',
          },
          {
            label: 'Watch for wildlife, dogs & speed humps',
            text: 'Unmarked speed bumps sit before pedestrian crossings and school zones, peacocks and monitor lizards cross rural lanes in the south, and dusk brings street dogs onto warm tarmac. Avoid long unfamiliar rides after dark.',
          },
          {
            label: 'Fuel is plentiful at Ceypetco & Lanka IOC',
            text: 'A 110cc scooter sips roughly 2–2.5 litres per 100 km. Carry small LKR notes (Rs. 1,000–2,000 fills a scooter tank from empty) and ask for 92 Octane petrol.',
          },
        ],
      },
      {
        id: 'handover-inspection-checklist',
        heading: 'Checklist Before You Ride Away from Any Rental Shop',
        paragraphs: [
          'Before setting off, spend two minutes checking five essentials: front and rear brake bite (test both levers rolling forward), tyre tread depth (smooth tyres slide immediately on tropical rain showers), working indicators and horn, mirrors tightened for your height, and a helmet strap that clicks firmly under your chin.',
          'Take a quick walk-around video in daylight with the shop team so pre-existing scuffs are agreed upfront. At [Hello Rent - Scooter & Tuktuk Rental](/about#safety), we run an 8-point mechanical check before every handover — and if you have never ridden on the left before, we take time on a quiet lane until you feel completely steady.',
        ],
      },
      {
        id: 'why-start-in-weligama',
        heading: 'Why South Coast Travelers Rent with Hello Rent in Weligama',
        paragraphs: [
          'Colombo traffic is hectic for your first hour in the country. Most travelers take the train or an airport transfer down to Weligama first, then [book a scooter in Weligama](/book-now) once the roads open into palm-lined coastal stretches and quiet inland paddy fields. From our door, you can explore [ten unforgettable south-coast day trips](/tours) or arrange island-wide delivery and collection if you are riding one-way.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I rent a scooter in Sri Lanka with a regular car licence?',
        answer:
          'Technically, riding a two-wheeled scooter or motorcycle legally in Sri Lanka requires motorcycle entitlement (Category A) on your International Driving Permit endorsed onto a Sri Lankan recognition permit. If you hold only a Category B licence, speak to us before booking — a self-drive automatic car or properly endorsed three-wheeler permit may suit you better.',
      },
      {
        question: 'How much does it cost to rent a scooter in Sri Lanka?',
        answer:
          'Direct local rates at Hello Rent start at €5 per day for a 110cc automatic scooter (Honda Dio, Yamaha Ray ZR) and €6 per day for a 125cc TVS Ntorq, with helmets and 24/7 roadside assistance included.',
      },
      {
        question: 'Are scooters allowed on the Southern Expressway in Sri Lanka?',
        answer:
          'No. Two-wheelers and three-wheelers are prohibited on Sri Lanka’s E-class expressways. Always select two-wheeler mode or "Avoid highways" in Google Maps to stay on coastal and hill A/B roads.',
      },
      {
        question: 'How do I get the Sri Lankan driving permit without visiting Colombo?',
        answer:
          'Hello Rent arranges the official 6-month Sri Lankan permit endorsed through the Automobile Association. Simply send photos of your government-issued IDP booklet, passport photo page, and a plain-wall portrait via WhatsApp before arrival.',
      },
    ],
    relatedSlugs: [
      'weligama-scooter-bike-rental-guide',
      'scooter-vs-motorbike-sri-lanka',
      'tuktuk-rental-weligama-sri-lanka',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  3. Tuk-Tuk Rental in Weligama & Sri Lanka — Self-Drive Guide       */
  /* ------------------------------------------------------------------ */
  {
    slug: 'tuktuk-rental-weligama-sri-lanka',
    path: '/blog/tuktuk-rental-weligama-sri-lanka',
    title: 'Tuk-Tuk Rental in Weligama & Sri Lanka: Self-Drive Costs, Permits & Tips',
    seoTitle: 'Tuk-Tuk Rental Weligama & Sri Lanka: 2026 Guide | Hello Rent',
    metaDescription:
      'Self-drive tuktuk rental in Weligama & tuk tuk rental in Sri Lanka from €15/day. Learn handlebar gears, permit rules, luggage space & routes with Hello Rent.',
    keywords: [
      'tuktuk rental weligama',
      'tuk tuk rental sri lanka',
      'hello rent - scooter & tuktuk rental',
      'hello rent',
      'weligama scooter rental',
    ],
    category: 'Tuk-Tuk Guides',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-05',
    displayDate: '02 Nov 2026',
    readingTime: '7 min read',
    heroImage: '/fleet/bajaj-re-tuktuk.jpg',
    cardImage: '/fleet/bajaj-re-tuktuk.jpg',
    heroAlt: 'Bajaj RE 4-stroke self-drive tuk-tuk parked outside Hello Rent - Scooter & Tuktuk Rental in Weligama',
    excerpt:
      'Three seats, a roof against tropical sun and rain, room for backpacks and surfboards, and pure Sri Lankan road-trip joy — everything you need to know about self-drive tuk-tuk rental in Weligama and across the island.',
    keyTakeaways: [
      'Self-drive Bajaj RE 4-stroke tuk-tuk rental at Hello Rent in Weligama is €15/day — flat, transparent pricing with no hidden mileage traps.',
      'A tuk-tuk uses a 4-speed left-handlebar clutch and twist shift plus a right-foot brake; we give every driver a calm practice session before handover.',
      'Three-wheelers have a legal top speed limit of 40 km/h in Sri Lanka and cannot enter toll expressways.',
      'Ideal for couples, groups of three, surfboard trips, and multi-day loops where backpacks need to stay bone-dry.',
    ],
    sections: [
      {
        id: 'why-self-drive-tuk-tuk-sri-lanka',
        heading: 'Why Self-Drive Tuk Tuk Rental in Sri Lanka Beats Hiring Taxis',
        paragraphs: [
          'Ask ten travelers what made their Sri Lanka trip unforgettable and half of them will grin and say driving their own three-wheeler. Searching for **tuk tuk rental Sri Lanka** has exploded because a Bajaj RE hits the sweet spot between a scooter and a car: open sides so you smell cinnamon gardens and sea air, a canvas roof when an afternoon downpour rolls in, and a rear bench that seats up to three adults with 60–80 litres of backpack storage behind it.',
          'Even around the south coast, three or four return tuk-tuk taxi rides between Weligama, Mirissa, Ahangama and Galle quickly match the cost of having your own keys parked outside your villa all day — without ever haggling after dinner in the rain.',
        ],
      },
      {
        id: 'tuktuk-rental-weligama-rates',
        heading: 'Tuktuk Rental in Weligama: Daily Rates & What Is Included',
        paragraphs: [
          'Many national tuk-tuk agencies are based only near Negombo/Colombo airport and charge steep one-way fees or bundle mandatory extras you may not need. With **Hello Rent - Scooter & Tuktuk Rental**, you can pick up your three-wheeler right here on the south coast — or arrange island-wide delivery to your hotel or railway station.',
          'Our [Bajaj RE 4-Stroke Tuk-Tuk](/fleet) rents for **€15 per day**. Every vehicle is inspected across brakes, tyres, lights, suspension, battery and engine oil before handover, backed by 24/7 emergency roadside support and our fair, no-passport-deposit rental policy.',
        ],
        table: {
          caption: 'Scooter vs Tuk-Tuk vs Automatic Car for South Coast & Island Trips',
          headers: ['Feature', 'Scooter (€5–€6/day)', 'Tuk-Tuk (€15/day)', 'Automatic Car (€31/day)'],
          rows: [
            ['Seats', '1–2 riders', 'Driver + up to 3 passengers (best for 2–3)', '4–5 passengers'],
            ['Weather protection', 'Open air (rain poncho needed)', 'Full roof + roll-down rain flaps', 'Enclosed cabin + A/C'],
            ['Luggage & surfboards', '18–22L under-seat + side rack', '60–80L rear bay + roof rack option', 'Full boot / KDH van option'],
            ['Transmission', 'Automatic twist-and-go', '4-speed handlebar manual + reverse', 'Automatic'],
          ],
        },
      },
      {
        id: 'how-to-drive-bajaj-re',
        heading: 'How to Drive a Bajaj RE 4-Stroke Tuk-Tuk (Handlebar Clutch Explained)',
        paragraphs: [
          'Never driven a three-wheeler? Neither have most of our guests before day one. Our Bajaj RE fleet runs modern **4-stroke petrol engines** — quieter, cleaner and far easier to start than old smoky 2-strokes, with electric push-button start and a proper reverse gear lever.',
          'Instead of a foot clutch like a car, you squeeze the **left handlebar lever** and twist the left grip through gears 1–2–3–4, while your right hand works the throttle and your **right foot presses the main hydraulic brake pedal** on the floorboard. Before you hit Matara Road, Lucky or one of our Weligama team walks you through smooth hill starts, reversing, and wide cornering until shifting feels second nature.',
        ],
      },
      {
        id: 'tuk-tuk-permits-speed-limits',
        heading: 'Driving Permits & the 40 km/h Rule for Three-Wheelers',
        paragraphs: [
          'Three-wheelers are taken seriously by Sri Lankan traffic police. Two rules keep your trip completely trouble-free:',
        ],
        bullets: [
          {
            label: 'Three-wheeler Sri Lankan recognition permit',
            text: 'Your Sri Lankan driving permit must explicitly cover three-wheelers, endorsed through the Automobile Association on the strength of your valid home licence and government-issued IDP booklet. Message us your licence photo before booking so we confirm your exact category.',
          },
          {
            label: '40 km/h national three-wheeler speed limit',
            text: 'By law, tuk-tuks in Sri Lanka have a maximum speed limit of 40 km/h (and are banned from expressways). Embrace the unhurried pace — radar checks on wide A-roads outside towns enforce the 40 km/h cap.',
          },
          {
            label: 'Brake in a straight line before corners',
            text: 'A tuk-tuk has one front wheel and two rear wheels, so slow down before turning rather than braking sharply mid-bend, especially on wet cobbles or gravel shoulders.',
          },
        ],
        callout: {
          eyebrow: '[ Paperwork Handled ]',
          title: 'Unsure if your licence covers a tuk-tuk in Sri Lanka?',
          body: 'Send a photo of your licence and IDP on WhatsApp before you book. We check your categories for free and arrange the official 6-month Automobile Association permit for you.',
          ctaLabel: 'Check permit requirements',
          ctaTo: '/driving-permit',
          dark: true,
        },
      },
      {
        id: 'best-tuk-tuk-routes-from-weligama',
        heading: 'Best South Coast & Hill Routes from Hello Rent - Scooter & Tuktuk Rental',
        paragraphs: [
          'For **tuktuk rental Weligama** day trips, our favourite loop rolls west along Koggala Lake to [Galle Fort and Unawatuna](/blog/south-coast-ride-weligama-to-galle), or east past Dondra Head lighthouse to Hiriketiya Bay and Tangalle’s quiet coves. Planning a multi-day island adventure? Climb inland past Udawalawe’s elephant plains into [Ella and Sri Lanka’s tea country](/blog/scenic-routes-to-ride-in-sri-lanka) — 1st and 2nd gear pull steadily up mountain switchbacks while you stop at every waterfall view.',
          'Ready to claim your three-wheeler? [Reserve your tuk-tuk online](/book-now?category=Tuk%20Tuk) in two minutes and pay when we hand over the keys in Weligama.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How much does tuktuk rental in Weligama and Sri Lanka cost?',
        answer:
          'At Hello Rent - Scooter & Tuktuk Rental in Weligama, renting a self-drive Bajaj RE 4-stroke tuk-tuk costs €15 per day, including full mechanical inspection, handover driving guidance, and 24/7 roadside assistance.',
      },
      {
        question: 'Is a tuk-tuk hard to learn if I have never driven one?',
        answer:
          'Most travelers pick up the handlebar clutch and twist-grip gears within 20–30 minutes, especially if you have ever driven a manual car or geared bike. Before every rental, our team gives you hands-on guidance on a quiet road until you are confident.',
      },
      {
        question: 'What permit do I need for tuk tuk rental in Sri Lanka?',
        answer:
          'You need a valid Sri Lankan recognition permit endorsed for three-wheelers through the Automobile Association of Ceylon, backed by your home licence and a government-issued International Driving Permit booklet. Hello Rent can check your licence and arrange the 6-month permit via WhatsApp.',
      },
      {
        question: 'How many people and bags fit inside a rental tuk-tuk?',
        answer:
          'The rear bench seats up to three adults alongside the driver, though two to three travelers total is most comfortable for multi-day trips with backpacks stored in the 60–80L rear luggage bay.',
      },
    ],
    relatedSlugs: [
      'weligama-scooter-bike-rental-guide',
      'rent-a-scooter-in-sri-lanka',
      'scenic-routes-to-ride-in-sri-lanka',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  4. Scooter vs Manual Motorbike Comparison                          */
  /* ------------------------------------------------------------------ */
  {
    slug: 'scooter-vs-motorbike-sri-lanka',
    path: '/blog/scooter-vs-motorbike-sri-lanka',
    title: 'Scooter vs Manual Motorbike: Which Should You Rent in Sri Lanka?',
    seoTitle: 'Scooter vs Motorbike Rental in Sri Lanka | Hello Rent Guide',
    metaDescription:
      'Automatic 110cc/125cc scooter or manual 160cc–200cc motorbike? Compare power, storage, hills and daily Weligama bike rental prices before you book.',
    keywords: [
      'weligama bike rental',
      'bike rent weligama',
      'weligama scooter rental',
      'rent scooter sri lanka',
      'hello rent',
    ],
    category: 'Sri Lanka Tips',
    publishedAt: '2026-10-10',
    updatedAt: '2026-11-01',
    displayDate: '10 Oct 2026',
    readingTime: '6 min read',
    heroImage: '/blog/coast-road.webp',
    cardImage: '/blog/coast-road.webp',
    heroAlt: 'Coastal road in southern Sri Lanka ideal for scooters and manual motorbikes',
    excerpt:
      'Twist-and-go Honda Dio and TVS Ntorq scooters versus geared Bajaj Pulsar, Yamaha FZ and TVS Apache motorbikes — an honest mechanic’s guide to choosing the right two-wheeler.',
    keyTakeaways: [
      'Choose an automatic scooter (€5–€6/day) for coastal towns, surf hops, effortless traffic handling and lockable under-seat storage.',
      'Choose a manual 160cc–200cc motorbike (€10/day) for steep hill-country climbs, engine braking on long descents, and 150+ km highway days.',
      'Only rent a manual clutch motorbike if you already ride geared bikes confidently — coastal traffic on the left is not the place to learn clutch control.',
    ],
    sections: [
      {
        id: 'automatic-scooters-pros-cons',
        heading: 'When an Automatic Scooter Is the Smarter Choice',
        paragraphs: [
          'Most riders walking into our shop for [Weligama scooter rental](/blog/weligama-scooter-bike-rental-guide) end up happiest on an automatic. With no clutch lever and no foot gear shifter, all your attention stays on reading Sri Lankan road traffic, spotting coastal turn-offs, and enjoying the sea breeze.',
          'Step-through floorboards keep rain spray off your shoes, and popping the seat open gives you 18 to 22 litres of enclosed storage. If you are riding solo around Weligama, Mirissa and Ahangama, the **Honda Dio 110cc** or feather-light 99kg **Yamaha Ray ZR** (€5/day) turns in tight café courtyards effortlessly. Riding two-up or taller than 180cm? Step up to the **TVS Ntorq 125** (€6/day) for stronger hill pull and extra knee room.',
        ],
      },
      {
        id: 'manual-motorbikes-pros-cons',
        heading: 'When You Need a Manual Motorbike ("Big Bike")',
        paragraphs: [
          'Once your route leaves the flat southern coastline and climbs past Wellawaya, Deniyaya, Haputale or Nuwara Eliya, larger wheels and manual gears earn their keep. Larger 17-inch wheels roll smoothly over broken mountain tarmac where small scooter wheels bounce, and downshifting into 2nd gear gives you controlled engine braking on long descents without overheating brake pads.',
        ],
        table: {
          caption: 'Comparing Automatic Scooters & Manual Motorbikes in the Hello Rent Fleet',
          headers: ['Model', 'Engine & Gears', 'Best Rider & Trip Fit', 'Rate'],
          rows: [
            ['Honda Dio / Yamaha Ray ZR', '110cc Automatic', 'Solo coastal rides, petite to average height, easy parking', '€5 / day'],
            ['TVS Ntorq 125', '125cc Automatic', 'Tall riders, two-up beach trips, brisk A2 traffic pace', '€6 / day'],
            ['Bajaj Pulsar N160 / Yamaha FZ 160', '160cc Manual', 'Experienced geared riders heading to Ella, Kandy or Sinharaja', '€10 / day'],
            ['TVS Apache 200 / Hero Hunk 200', '200cc Manual', 'Two-up island touring, steep tea-country climbs & long range', '€10 / day'],
          ],
        },
      },
      {
        id: 'honest-safety-advice',
        heading: 'Our Rule at Hello Rent: Match the Bike to Your Real Experience',
        paragraphs: [
          'At **Hello Rent**, we always ask about your riding history before recommending a machine. If you ride a geared motorcycle at home, a Pulsar N160 or Apache 200 from our [Weligama bike rental fleet](/fleet) feels planted and responsive. If you have only ridden automatic scooters on holiday before, stick with the TVS Ntorq 125 — it climbs southern hills reliably without giving you a clutch to think about in busy roundabouts.',
          'Want luggage space and rain protection without balancing two wheels at all? Take a look at our [self-drive tuk-tuk rental guide](/blog/tuktuk-rental-weligama-sri-lanka) too.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can a 125cc scooter make it from Weligama to Ella?',
        answer:
          'Yes — a solo rider with a light backpack can ride a well-maintained 125cc TVS Ntorq to Ella comfortably if you take breaks. However, if two adults are riding together with luggage into steep hill country, a manual 160cc–200cc motorbike or self-drive tuk-tuk is much more comfortable.',
      },
      {
        question: 'Do scooters and manual motorbikes need the same Sri Lankan permit?',
        answer:
          'Yes. Both automatic scooters and manual motorbikes require Category A (motorcycles) on your International Driving Permit endorsed onto a local Sri Lankan recognition permit.',
      },
      {
        question: 'Which scooter has the lowest seat for shorter riders?',
        answer:
          'The Honda Dio 110cc (765mm seat) and the narrow Honda Navi 110cc are the easiest flat-foot options for shorter riders, while the Yamaha Ray ZR is the lightest overall at just 99kg.',
      },
    ],
    relatedSlugs: [
      'weligama-scooter-bike-rental-guide',
      'rent-a-scooter-in-sri-lanka',
      'scenic-routes-to-ride-in-sri-lanka',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  5. South Coast Route: Weligama to Mirissa, Ahangama & Galle Fort   */
  /* ------------------------------------------------------------------ */
  {
    slug: 'south-coast-ride-weligama-to-galle',
    path: '/blog/south-coast-ride-weligama-to-galle',
    title: 'The South Coast Ride: Weligama to Mirissa, Ahangama & Galle Fort',
    seoTitle: 'Weligama to Galle by Scooter or Tuk-Tuk: South Coast Route',
    metaDescription:
      'Ride from Weligama to Ahangama, Koggala Lake, Unawatuna and Galle Fort by scooter or tuk-tuk — local backroads, parking tips and sunset stops.',
    keywords: [
      'weligama scooter rental',
      'scooter rental weligama',
      'tuktuk rental weligama',
      'weligama bike rental',
      'hello rent',
    ],
    category: 'Routes & Trips',
    publishedAt: '2026-09-28',
    updatedAt: '2026-10-30',
    displayDate: '28 Sep 2026',
    readingTime: '6 min read',
    heroImage: '/blog/tea-country.webp',
    cardImage: '/blog/hero-card.webp',
    heroAlt: 'Palm-fringed southern Sri Lanka road between Weligama and Galle',
    excerpt:
      'Skip the bus exhaust on the main highway where it counts: our favourite half-day and full-day ride west from Weligama through Midigama, Koggala Lake’s cinnamon backroads, Unawatuna and Galle Fort.',
    keyTakeaways: [
      'Weligama to Galle Fort is roughly 30 km one way — 50 minutes straight on the A2, or a relaxed full day with lagoon detours and swims.',
      'Turn inland around Koggala Lake to swap coastal bus traffic for quiet paddy-field lanes and cinnamon estates.',
      'Any 110cc/125cc scooter (€5–€6/day) or self-drive tuk-tuk (€15/day) handles this flat coastal run effortlessly.',
    ],
    sections: [
      {
        id: 'morning-departure-weligama-ahangama',
        heading: 'Morning: Weligama Bay Through Midigama & Ahangama (0–10 km)',
        paragraphs: [
          'Pick up your ride from **Hello Rent** at 07:30 while the coast air is cool and golden. Rolling west out of Weligama Bay, the ocean stays just steps off your left shoulder through Gurubebila (Plantations and Coconuts reef breaks) and Midigama.',
          'Ten minutes further brings you into Ahangama and Kabalana — stop for a flat white or string hoppers overlooking the reef, and watch stilt fishermen perched along the shallow coral shelf before midday glare sets in.',
        ],
      },
      {
        id: 'koggala-lake-backroad',
        heading: 'The Local Detour: Inland Around Koggala Lake (10–20 km)',
        paragraphs: [
          'Here is the tip Lucky gives every rider leaving our [Weligama scooter rental shop](/blog/weligama-scooter-bike-rental-guide): instead of staying glued to the busy A2 highway all the way to Habaraduwa, turn right onto the quiet B-roads skirting **Koggala Lake**.',
          'Within two minutes, highway horns vanish into emerald rice paddies, kingfishers on telegraph wires, and small family cinnamon workshops. Loop back toward the sea near Mihiripenna and Dalawella Beach — home to the shallow reef lagoon where sea turtles feed in knee-deep water.',
        ],
      },
      {
        id: 'unawatuna-and-galle-fort',
        heading: 'Afternoon: Unawatuna Swim & Parking at Galle Fort (20–30 km)',
        paragraphs: [
          'Curve around the Jungle Beach headland at Rumassala for a sheltered swim, then finish the final six kilometres into **Galle Fort**. Two-wheelers and tuk-tuks can enter through the Old Gate or Main Gate, though parking right beside the cricket stadium outside the ramparts (or along quiet Church Street bays inside, obeying no-parking signs) saves weaving past afternoon walkers.',
          'Roll back east at 16:30 so you reach Weligama Bay or **Mirissa’s Coconut Tree Hill** (just 6 km east of our shop) in time for sunset. Looking for nine more directions you can reach before dark? Explore our full [Weligama one-day riding routes guide](/tours).',
        ],
        callout: {
          eyebrow: '[ Ready for Tomorrow Morning? ]',
          title: 'Book your scooter or tuk-tuk in Weligama',
          body: 'Open 07:00–21:00 daily in central Weligama. Helmets included, phone mounts €1/day, no card needed to reserve.',
          ctaLabel: 'Reserve your ride',
          ctaTo: '/book-now',
        },
      },
    ],
    faqs: [
      {
        question: 'How long does it take to ride from Weligama to Galle by scooter?',
        answer:
          'Direct along the A2 coastal road, Weligama to Galle Fort is around 30 km and takes 45 to 55 minutes by scooter or 60 to 70 minutes in a tuk-tuk. With stops at Ahangama, Koggala Lake and Unawatuna, allow a relaxed 5 to 7 hours round trip.',
      },
      {
        question: 'Is a 110cc scooter enough for Weligama to Galle and Mirissa?',
        answer:
          'Yes — the south coast road is almost completely flat apart from the gentle headland at Rumassala, making a €5/day 110cc Honda Dio or Yamaha Ray ZR ideal.',
      },
      {
        question: 'Can you park a rental scooter or tuk-tuk at Galle Fort?',
        answer:
          'Yes. Dedicated two-wheeler and three-wheeler parking bays sit just outside the Fort gates beside Galle International Cricket Stadium as well as marked bays inside the ramparts.',
      },
    ],
    relatedSlugs: [
      'weligama-scooter-bike-rental-guide',
      'scenic-routes-to-ride-in-sri-lanka',
      'tuktuk-rental-weligama-sri-lanka',
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  6. Top Scenic Routes in Sri Lanka (Rainforest, Wildlife & Hills)   */
  /* ------------------------------------------------------------------ */
  {
    slug: 'scenic-routes-to-ride-in-sri-lanka',
    path: '/blog/scenic-routes-to-ride-in-sri-lanka',
    title: 'Top Scenic Routes to Ride in Sri Lanka by Scooter, Bike or Tuk-Tuk',
    seoTitle: 'Top Scenic Routes to Ride in Sri Lanka | Hello Rent Weligama',
    metaDescription:
      'From Deniyaya rainforest hairpins and Tangalle beaches to Ella’s misty tea estates — the best scenic Sri Lanka routes when you rent a scooter, bike or tuk-tuk.',
    keywords: [
      'rent a scooter sri lanka',
      'tuk tuk rental sri lanka',
      'weligama bike rental',
      'hello rent - scooter & tuktuk rental',
      'hello rent',
    ],
    category: 'Routes & Trips',
    publishedAt: '2026-09-15',
    updatedAt: '2026-10-29',
    displayDate: '15 Sep 2026',
    readingTime: '7 min read',
    heroImage: '/photos/tea-country-ride.jpg',
    cardImage: '/blog/packing.webp',
    heroAlt: 'Riders overlooking misty emerald tea estates in Sri Lanka’s central highlands',
    excerpt:
      'Ride twenty kilometres inland from the surf coast and coconut palms give way to lowland rainforest, elephant corridors and high-altitude tea estates. Here are four routes worth every kilometre.',
    keyTakeaways: [
      'Sri Lanka packs surf coast, UNESCO lowland rainforest, dry-zone elephant parks and 1,800m tea hills within half a day’s ride of Weligama.',
      'Start mountain climbs before 08:00 — mist and brief afternoon rain regularly roll across Ella, Haputale and Deniyaya after 14:00.',
      'Match your vehicle to the climb: scooters shine on coastal & foothill runs, while manual 160–200cc bikes and 4-stroke tuk-tuks excel on multi-day hill loops.',
    ],
    sections: [
      {
        id: 'weligama-to-deniyaya-sinharaja',
        heading: '1. Weligama to Deniyaya & the Edge of Sinharaja Rainforest',
        paragraphs: [
          'Heading straight north from Weligama through Akuressa swaps salt air for rubber plantations, spice gardens and terraced low-grown tea within an hour. By the time you wind up toward **Deniyaya** and the UNESCO-protected **Sinharaja Rainforest**, temperatures drop five degrees and waterfalls spill beside the road.',
          'You can ride this there-and-back in one full day from our [Weligama shop](/contact) (~75 km each way). Pack a light rain jacket in your under-seat boot and fuel up in Akuressa before the final climb.',
        ],
      },
      {
        id: 'tangalle-hiriketiya-quiet-south',
        heading: '2. East Along the Deep South: Dondra Head, Hiriketiya & Tangalle',
        paragraphs: [
          'While most newcomers turn west toward Galle, riding east past Matara rewards you with Sri Lanka’s southernmost tip at **Dondra Head Lighthouse**, the horseshoe surf cove of **Hiriketiya**, and long empty golden beaches around **Tangalle** and Rekawa.',
          'This flat, breezy stretch is pure joy when you [rent a scooter in Sri Lanka](/blog/rent-a-scooter-in-sri-lanka) or cruise at 35 km/h with two friends in a [self-drive tuk-tuk](/blog/tuktuk-rental-weligama-sri-lanka).',
        ],
      },
      {
        id: 'udawalawe-to-ella-gap',
        heading: '3. Udawalawe Elephant Corridor to Wellawaya & Ella Gap',
        paragraphs: [
          'Turning a south-coast holiday into a 3-to-5-day loop? Ride northeast past **Udawalawe National Park** (watch carefully near the reservoir fence where wild elephants stand right beside the road — never stop close or rev your engine), then climb through **Ella Gap** past Rawana Falls.',
          'For this climb, our geared **Yamaha FZ 160**, **Bajaj Pulsar N160** or **TVS Apache 200** (€10/day) from the [Hello Rent fleet](/fleet) gives you effortless overtaking power and engine braking on the hairpins.',
        ],
      },
      {
        id: 'ella-to-haputale-liptons-seat',
        heading: '4. Ella to Bandarawela, Haputale & Lipton’s Seat',
        paragraphs: [
          'Arguably the finest morning on two wheels anywhere on the island: depart Ella at 06:00, thread along high-ridge roads through Bandarawela to **Haputale**, and wind up the narrow tea-estate lane to **Lipton’s Seat** before morning cloud rises from the southern plains below.',
          'Planning a custom multi-day route and unsure about road works or monsoon seasons? Message Bhagya ("Lucky") directly from our [day-trips and route planning page](/tours) — we share real, current road notes free of charge with every guest.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I take a Hello Rent scooter, motorbike or tuk-tuk on a multi-day trip across Sri Lanka?',
        answer:
          'Yes! Many of our guests pick up in Weligama for multi-day or multi-week loops through Tangalle, Udawalawe, Ella and Kandy, and we can also arrange island-wide delivery or collection if you do not want to backtrack.',
      },
      {
        question: 'When is the best season to ride the south coast and hill country?',
        answer:
          'November through April brings the sunniest, calmest weather to Weligama, Galle and the south coast, as well as crisp mornings in Ella. Even between May and October, mornings often start bright and the eastern side around Hiriketiya, Tangalle and Yala stays much drier.',
      },
      {
        question: 'Which bike in Hello Rent’s fleet is best for Ella and mountain roads?',
        answer:
          'Experienced geared riders love the Yamaha FZ 160, Bajaj Pulsar N160 and TVS Apache 200 (€10/day) for hill country. Solo automatic riders prefer the 125cc TVS Ntorq (€6/day), while couples with luggage often pick our Bajaj RE 4-stroke tuk-tuk (€15/day).',
      },
    ],
    relatedSlugs: [
      'scooter-vs-motorbike-sri-lanka',
      'tuktuk-rental-weligama-sri-lanka',
      'south-coast-ride-weligama-to-galle',
    ],
  },
];

export const BLOG_CATEGORIES: ('All' | BlogCategory)[] = [
  'All',
  'Weligama Local',
  'Sri Lanka Tips',
  'Tuk-Tuk Guides',
  'Routes & Trips',
];

export function getBlogPost(slug: string | undefined): BlogPost | undefined {
  if (!slug) return undefined;
  return BLOG_POSTS.find(post => post.slug === slug);
}

export function getBlogPostByPath(path: string): BlogPost | undefined {
  const clean = '/' + path.replace(/^\/+|\/+$/g, '');
  return BLOG_POSTS.find(post => post.path === clean);
}

