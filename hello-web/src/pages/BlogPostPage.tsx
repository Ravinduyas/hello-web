import { ArrowLeft, ArrowRight, Check, Clock, HelpCircle, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BLOG_POSTS, getBlogPost } from '../data/blog';
import { CONTACT, whatsappLink } from '../data/contact';
import { asset } from '../lib/asset';

/**
 * Parses lightweight inline `[anchor](/path)` links and `**bold**` emphasis
 * from pure-data blog paragraphs so articles stay portable across Node build
 * plugins and React components without raw HTML injection.
 */
function renderInline(text: string): ReactNode[] {
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      if (href.startsWith('/')) {
        return (
          <Link
            key={idx}
            to={href}
            className="text-brand font-medium underline decoration-brand/40 underline-offset-4 hover:decoration-brand transition-colors"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={idx}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand font-medium underline decoration-brand/40 underline-offset-4 hover:decoration-brand transition-colors"
        >
          {label}
        </a>
      );
    }

    const boldMatch = /^\*\*([^*]+)\*\*$/.exec(part);
    if (boldMatch) {
      return (
        <strong key={idx} className="font-semibold text-dark">
          {boldMatch[1]}
        </strong>
      );
    }

    return part;
  });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = post.relatedSlugs
    .map(s => BLOG_POSTS.find(p => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="bg-beige min-h-screen">
      <article>
        {/* ── Hero Header ───────────────────────────────────────────────── */}
        <header className="relative min-h-[520px] md:min-h-[580px] w-full overflow-hidden bg-dark flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/65 to-dark/35 z-10" />
          <img
            src={asset(post.heroImage)}
            alt={post.heroAlt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />

          <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pb-14 md:pb-20 pt-32">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="max-w-4xl"
            >
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/65">
                  <li>
                    <Link to="/" className="hover:text-white transition-colors">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-white/35">/</li>
                  <li>
                    <Link to="/blog" className="hover:text-white transition-colors">
                      Riding Guides
                    </Link>
                  </li>
                  <li aria-hidden="true" className="text-white/35">/</li>
                  <li className="text-brand font-semibold">{post.category}</li>
                </ol>
              </nav>

              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-brand text-beige px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <time
                  dateTime={post.publishedAt}
                  className="text-[11px] font-bold text-white/65 uppercase tracking-widest"
                >
                  {post.displayDate}
                </time>
                <span className="text-white/30">·</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/65 uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-brand" />
                  {post.readingTime}
                </span>
              </div>

              <h1 className="display-xl text-4xl sm:text-5xl md:text-6xl text-white mb-5">
                {post.title}
              </h1>

              <p className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>

              <div className="mt-7 pt-6 border-t border-white/15 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/65">
                <span>
                  Written by <strong className="text-white font-semibold">Bhagya (“Lucky”) &amp; Sandra</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  Hello Rent - Scooter &amp; Tuktuk Rental · Weligama, Sri Lanka
                </span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* ── Article Body + Sticky Sidebar ─────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-16 items-start">
            {/* Main Column */}
            <div className="min-w-0 space-y-14">
              {/* Quick Summary / Key Takeaways */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                aria-label="Key takeaways"
                className="bg-white rounded-3xl p-7 md:p-10 border border-dark/10"
              >
                <span className="eyebrow">[ Quick Summary ]</span>
                <h2 className="font-display text-xl md:text-2xl font-bold mt-2 mb-5">
                  What to know in 60 seconds
                </h2>
                <ul className="space-y-3.5">
                  {post.keyTakeaways.map(point => (
                    <li key={point} className="flex items-start gap-3.5 text-sm md:text-base text-dark/75 leading-relaxed">
                      <span className="w-6 h-6 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Editorial Sections */}
              {post.sections.map((section, idx) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="scroll-mt-28 space-y-6"
                >
                  <div className="flex items-end justify-between gap-6 border-t border-dark/15 pt-6">
                    <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight leading-tight">
                      {section.heading}
                    </h2>
                    <span className="section-index">
                      ({String(idx + 1).padStart(2, '0')})
                    </span>
                  </div>

                  <div className="space-y-5 text-dark/75 text-base md:text-lg leading-relaxed">
                    {section.paragraphs.map((paragraph, pIdx) => (
                      <p key={pIdx}>{renderInline(paragraph)}</p>
                    ))}
                  </div>

                  {/* Bullet Breakdown */}
                  {section.bullets && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 space-y-5 border border-dark/10">
                      {section.bullets.map(item => (
                        <div
                          key={item.label}
                          className="pb-5 last:pb-0 border-b last:border-b-0 border-dark/10"
                        >
                          <h3 className="font-display text-base md:text-lg font-bold text-dark">
                            {item.label}
                          </h3>
                          <p className="text-sm md:text-base text-dark/65 leading-relaxed mt-1.5">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comparison Table */}
                  {section.table && (
                    <div className="bg-white rounded-3xl overflow-hidden border border-dark/10">
                      {section.table.caption && (
                        <div className="px-6 py-4 bg-dark text-beige text-xs font-bold uppercase tracking-widest">
                          {section.table.caption}
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-dark/15 bg-beige/45">
                              {section.table.headers.map(header => (
                                <th
                                  key={header}
                                  scope="col"
                                  className="px-5 py-4 font-display text-xs font-bold uppercase tracking-wider text-dark"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-dark/10 text-sm">
                            {section.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-beige/25 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`px-5 py-4 leading-relaxed ${
                                      cIdx === 0
                                        ? 'font-display font-bold text-dark'
                                        : cIdx === row.length - 1
                                          ? 'font-semibold text-brand whitespace-nowrap'
                                          : 'text-dark/70'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Contextual Callout */}
                  {section.callout && (
                    <div
                      className={`rounded-3xl p-7 md:p-10 space-y-4 ${
                        section.callout.dark
                          ? 'bg-dark text-beige'
                          : 'bg-white border border-dark/10 text-dark'
                      }`}
                    >
                      <span
                        className={`eyebrow ${
                          section.callout.dark ? '!text-brand' : ''
                        }`}
                      >
                        {section.callout.eyebrow}
                      </span>
                      <h3 className="font-display text-xl md:text-2xl font-bold leading-snug">
                        {section.callout.title}
                      </h3>
                      <p
                        className={`text-sm md:text-base leading-relaxed ${
                          section.callout.dark ? 'text-beige/70' : 'text-dark/65'
                        }`}
                      >
                        {section.callout.body}
                      </p>
                      {section.callout.ctaLabel && section.callout.ctaTo && (
                        <div className="pt-2">
                          <Link
                            to={section.callout.ctaTo}
                            className={`inline-flex w-fit ${
                              section.callout.dark ? 'btn-ghost' : 'btn-primary'
                            }`}
                          >
                            {section.callout.ctaLabel}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </motion.section>
              ))}

              {/* ── FAQ Section (mirrors FAQPage JSON-LD) ─────────────────── */}
              <section id="faq" className="scroll-mt-28 pt-4">
                <header className="section-head !mb-8">
                  <span className="eyebrow">[ Common Questions ]</span>
                  <div className="rule mt-4">
                    <h2 className="display-xl text-3xl md:text-5xl">
                      Frequently asked questions
                    </h2>
                    <HelpCircle className="w-6 h-6 text-brand shrink-0" strokeWidth={1.5} />
                  </div>
                </header>

                <div className="space-y-4">
                  {post.faqs.map(faq => (
                    <div
                      key={faq.question}
                      className="bg-white rounded-3xl p-6 md:p-8 border border-dark/10"
                    >
                      <h3 className="font-display text-lg md:text-xl font-bold text-dark">
                        {faq.question}
                      </h3>
                      <p className="text-sm md:text-base text-dark/70 leading-relaxed mt-3">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Local Shop E-E-A-T Bio Card ───────────────────────────── */}
              <section
                aria-label="About Hello Rent"
                className="bg-dark text-beige rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between"
              >
                <div className="space-y-3 max-w-xl">
                  <span className="eyebrow !text-brand">
                    [ Hello Rent - Scooter &amp; Tuktuk Rental ]
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                    Written from our shop in Weligama — never copied
                  </h2>
                  <p className="text-beige/70 text-sm leading-relaxed">
                    Run by Bhagya (“Lucky”) and Sandra in central Weligama ({CONTACT.hours}). Scooters
                    from €5/day, manual motorbikes €10/day, self-drive Bajaj RE tuk-tuks €15/day, and
                    official 6-month Sri Lankan permits arranged via WhatsApp.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.keywords.map(kw => (
                      <span
                        key={kw}
                        className="text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-beige/75"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                  <Link to="/fleet" className="btn-primary justify-center px-6 py-3">
                    VIEW FLEET &amp; PRICES
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={whatsappLink(
                      `Hi Hello Rent! I just read "${post.title}" and would like to ask about renting a ride.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost justify-center px-6 py-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                    ASK ON WHATSAPP
                  </a>
                </div>
              </section>

              <div>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to all Sri Lanka riding guides
                </Link>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <aside className="lg:sticky lg:top-28 space-y-6">
              {/* Table of Contents */}
              <div className="bg-white rounded-3xl p-6 md:p-7 border border-dark/10">
                <span className="eyebrow">[ In This Guide ]</span>
                <nav aria-label="Table of contents" className="mt-4">
                  <ol className="space-y-2.5 text-sm">
                    {post.sections.map((s, idx) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="flex items-start gap-2.5 text-dark/70 hover:text-brand transition-colors py-1"
                        >
                          <span className="font-display text-xs font-bold text-brand tabular-nums mt-0.5">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="leading-snug">{s.heading}</span>
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href="#faq"
                        className="flex items-start gap-2.5 text-dark/70 hover:text-brand transition-colors py-1"
                      >
                        <span className="font-display text-xs font-bold text-brand tabular-nums mt-0.5">
                          FAQ
                        </span>
                        <span className="leading-snug">Frequently asked questions</span>
                      </a>
                    </li>
                  </ol>
                </nav>
              </div>

              {/* Direct Conversion Card */}
              <div className="bg-dark text-beige rounded-3xl p-7 space-y-5">
                <span className="eyebrow !text-brand">[ Weligama Pickup &amp; Delivery ]</span>
                <h3 className="font-display text-2xl font-bold leading-tight">
                  Reserve in 2 minutes. Pay at pickup.
                </h3>
                <ul className="space-y-2.5 text-xs text-beige/75">
                  <li className="flex items-center justify-between border-b border-beige/15 pb-2">
                    <span>110cc Automatic Scooter</span>
                    <strong className="text-beige font-display text-sm">€5 / day</strong>
                  </li>
                  <li className="flex items-center justify-between border-b border-beige/15 pb-2">
                    <span>125cc TVS Ntorq Scooter</span>
                    <strong className="text-beige font-display text-sm">€6 / day</strong>
                  </li>
                  <li className="flex items-center justify-between border-b border-beige/15 pb-2">
                    <span>160–200cc Manual Bike</span>
                    <strong className="text-beige font-display text-sm">€10 / day</strong>
                  </li>
                  <li className="flex items-center justify-between pb-1">
                    <span>Bajaj RE 4-Stroke Tuk-Tuk</span>
                    <strong className="text-beige font-display text-sm">€15 / day</strong>
                  </li>
                </ul>
                <p className="text-xs text-beige/55 leading-relaxed">
                  Helmets included · Never leave your passport · 6-month Sri Lankan permit available.
                </p>
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link to="/book-now" className="btn-primary justify-center py-3">
                    BOOK YOUR RIDE
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/driving-permit" className="btn-ghost justify-center py-2.5 text-xs">
                    Need a Sri Lankan permit?
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ── Related Guides Cluster ────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-16 md:py-24 border-t border-dark/10">
          <div className="max-w-7xl mx-auto px-6">
            <header className="section-head">
              <span className="eyebrow">[ Keep Reading ]</span>
              <div className="rule mt-5">
                <h2 className="display-xl text-3xl md:text-5xl">
                  Related rental &amp; route guides
                </h2>
                <Link
                  to="/blog"
                  className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3 transition-all"
                >
                  All guides <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(rel => (
                <Link
                  key={rel.slug}
                  to={rel.path}
                  className="group bg-beige rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={asset(rel.cardImage)}
                      alt={rel.heroAlt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                        {rel.category}
                      </span>
                      <span className="text-[10px] font-bold text-dark/45 uppercase tracking-widest">
                        {rel.readingTime}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold mb-3 group-hover:text-brand transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-sm text-dark/60 leading-relaxed line-clamp-3 mb-5 flex-1">
                      {rel.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-brand group-hover:gap-3 transition-all">
                      Read guide <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

