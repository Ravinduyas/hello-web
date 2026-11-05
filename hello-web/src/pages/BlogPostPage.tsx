import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { getBlogPostBySlug, getRelatedBlogPosts } from '../data/blog';
import { CONTACT, whatsappLink } from '../data/contact';
import { asset } from '../lib/asset';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="bg-beige min-h-[75vh] flex items-center justify-center px-6 pt-32 pb-24">
        <div className="max-w-xl text-center space-y-6 bg-white rounded-3xl p-10 md:p-14">
          <span className="eyebrow">[ 404 · Guide Not Found ]</span>
          <h1 className="display-xl text-4xl md:text-5xl">We moved or couldn’t find that guide</h1>
          <p className="text-dark/65 leading-relaxed">
            Browse all of our Weligama scooter, motorbike, and self-drive tuk-tuk guides, or check
            live fleet availability from €5 a day.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/blog" className="btn-dark">
              <ArrowLeft className="w-4 h-4" />
              ALL RIDING GUIDES
            </Link>
            <Link to="/fleet" className="btn-primary">
              BROWSE OUR FLEET
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const related = getRelatedBlogPosts(post, 3);

  return (
    <div className="bg-beige min-h-screen">
      {/* ── Editorial Hero ──────────────────────────────────────────────── */}
      <header className="relative min-h-[520px] md:min-h-[580px] w-full overflow-hidden bg-dark flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/40 z-10" />
        <img
          src={asset(post.image)}
          alt={post.imageAlt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pt-32 pb-14 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            {/* Visual & Accessible Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/65 mb-6"
            >
              <Link to="/" className="hover:text-white transition-colors py-1">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <Link to="/blog" className="hover:text-white transition-colors py-1">
                Blog
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span className="text-white/90 truncate max-w-[240px] sm:max-w-none">
                {post.category}
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-brand text-beige px-3.5 py-1.5 rounded-full">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/75">
                <Clock className="w-3.5 h-3.5 text-brand" />
                {post.readingTime}
              </span>
              <span className="text-white/35">·</span>
              <time dateTime={post.publishedAt} className="text-xs font-medium text-white/75">
                {post.displayDate}
              </time>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl text-white tracking-tight leading-[1.05]">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-7 pt-6 border-t border-white/15 text-xs text-white/75">
              <span>
                Written by <strong className="text-white font-semibold">{post.author.name}</strong>{' '}
                · {post.author.role}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/65">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                Weligama, Southern Province, Sri Lanka
              </span>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Quick Facts Strip ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 -mt-7 relative z-30">
        <dl className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-3xl border border-dark/10 shadow-sm overflow-hidden">
          {post.quickFacts.map((fact, idx) => (
            <div
              key={fact.label}
              className={`p-5 md:p-7 border-dark/10 ${
                idx % 2 === 0 ? 'border-r' : 'lg:border-r'
              } ${idx >= 2 ? 'border-t lg:border-t-0' : ''} ${
                idx === post.quickFacts.length - 1 ? '!border-r-0' : ''
              }`}
            >
              <dt className="text-[10px] font-bold uppercase tracking-widest text-dark/45">
                {fact.label}
              </dt>
              <dd className="font-display text-lg md:text-2xl font-bold text-dark mt-1.5">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Main Article + Sticky Sidebar ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-12 lg:gap-16 items-start">
          {/* Article Body */}
          <article className="space-y-14">
            <p className="text-lg md:text-2xl font-medium text-dark leading-relaxed border-b border-dark/15 pb-10">
              {post.excerpt}
            </p>

            {post.sections.map((section, sIdx) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 space-y-6">
                <div className="space-y-2">
                  {section.eyebrow && <span className="eyebrow block">{section.eyebrow}</span>}
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight leading-tight text-dark">
                      {section.heading}
                    </h2>
                    <span className="section-index hidden sm:inline">
                      (0{sIdx + 1})
                    </span>
                  </div>
                </div>

                <div className="space-y-5 text-dark/75 leading-relaxed text-base md:text-lg">
                  {section.paragraphs.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}
                </div>

                {/* Comparison Table */}
                {section.table && (
                  <div className="my-8 overflow-x-auto rounded-3xl border border-dark/15 bg-white">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                      {section.table.caption && (
                        <caption className="sr-only">{section.table.caption}</caption>
                      )}
                      <thead>
                        <tr className="border-b border-dark/15 bg-dark/[0.03]">
                          {section.table.headers.map(header => (
                            <th
                              key={header}
                              scope="col"
                              className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-dark/60"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark/10 text-sm">
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-beige/40 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`px-5 py-4 align-top leading-relaxed ${
                                  cIdx === 0
                                    ? 'font-display font-bold text-dark whitespace-nowrap'
                                    : 'text-dark/75'
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
                )}

                {/* Bulleted Checklist */}
                {section.bullets && section.bullets.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    {section.bullets.map(bullet => (
                      <div
                        key={bullet.title}
                        className="bg-white rounded-2xl p-6 border border-dark/10 flex items-start gap-4"
                      >
                        <span className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-base md:text-lg text-dark">
                            {bullet.title}
                          </h3>
                          <p className="text-sm md:text-base text-dark/65 leading-relaxed mt-1.5">
                            {bullet.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Action Callout */}
                {section.callout && (
                  <div className="bg-dark text-beige rounded-3xl p-7 md:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-6">
                    <div className="space-y-2 max-w-xl">
                      {section.callout.eyebrow && (
                        <span className="eyebrow !text-brand block">{section.callout.eyebrow}</span>
                      )}
                      <p className="font-display text-xl md:text-2xl font-bold leading-snug">
                        {section.callout.title}
                      </p>
                      <p className="text-sm text-beige/70 leading-relaxed">
                        {section.callout.body}
                      </p>
                    </div>
                    <Link
                      to={section.callout.ctaTo}
                      className="btn-primary shrink-0 self-start sm:self-center whitespace-nowrap"
                    >
                      {section.callout.ctaLabel}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </section>
            ))}

            {/* ── Frequently Asked Questions (Matches FAQPage Schema) ──── */}
            {post.faqs.length > 0 && (
              <section
                id="faq"
                className="scroll-mt-28 pt-10 border-t border-dark/15 space-y-6"
              >
                <div>
                  <span className="eyebrow block">[ Common Questions ]</span>
                  <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight mt-2">
                    Frequently asked questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {post.faqs.map((faq, idx) => (
                    <details
                      key={faq.question}
                      open={idx === 0}
                      className="group bg-white rounded-2xl border border-dark/10 px-6 py-5"
                    >
                      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-display font-bold text-base md:text-lg text-dark min-h-[36px]">
                        <span>{faq.question}</span>
                        <ChevronDown className="w-5 h-5 text-brand shrink-0 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <p className="text-sm md:text-base text-dark/70 leading-relaxed pt-4 mt-3 border-t border-dark/10">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* ── Related Search Topics ─────────────────────────────────── */}
            <div className="pt-6 border-t border-dark/15">
              <span className="text-[10px] font-bold uppercase tracking-widest text-dark/45 block mb-3">
                Related Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {post.keywords.map(kw => (
                  <Link
                    key={kw}
                    to={`/blog?q=${encodeURIComponent(kw)}`}
                    className="text-xs font-medium bg-white border border-dark/10 hover:border-brand hover:text-brand px-3.5 py-2 rounded-full transition-colors"
                  >
                    {kw}
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Author & Local Shop Card ──────────────────────────────── */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-dark/10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div className="space-y-3 max-w-xl">
                <span className="eyebrow block">[ Hello Rent - Scooter &amp; Tuktuk Rental ]</span>
                <h3 className="font-display text-2xl font-bold">
                  Have a question about riding in Weligama or Sri Lanka?
                </h3>
                <p className="text-sm text-dark/65 leading-relaxed">
                  Message Bhagya (“Lucky”) &amp; Sandra directly on WhatsApp ({CONTACT.phone}). Our
                  shop in central Weligama is open every day from 07:00 to 21:00 — and we’re happy
                  to check your licence or suggest a route even before you book.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href={whatsappLink(post.whatsappPrompt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  ASK ON WHATSAPP
                </a>
                <Link to="/book-now" className="btn-outline justify-center">
                  BOOK YOUR RIDE
                </Link>
              </div>
            </div>
          </article>

          {/* Sticky Sidebar */}
          <aside className="lg:sticky lg:top-28 space-y-6">
            {/* Table of Contents */}
            <nav
              aria-label="Table of contents"
              className="bg-white rounded-3xl p-7 border border-dark/10 space-y-4"
            >
              <span className="eyebrow block">[ On This Page ]</span>
              <ol className="space-y-2.5 text-sm">
                {post.sections.map((sec, idx) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="flex items-start gap-2.5 text-dark/70 hover:text-brand transition-colors py-1 leading-snug"
                    >
                      <span className="font-display text-xs font-bold text-brand shrink-0 mt-0.5">
                        0{idx + 1}
                      </span>
                      <span>{sec.heading}</span>
                    </a>
                  </li>
                ))}
                {post.faqs.length > 0 && (
                  <li>
                    <a
                      href="#faq"
                      className="flex items-start gap-2.5 text-dark/70 hover:text-brand transition-colors py-1 leading-snug"
                    >
                      <span className="font-display text-xs font-bold text-brand shrink-0 mt-0.5">
                        0{post.sections.length + 1}
                      </span>
                      <span>Frequently asked questions</span>
                    </a>
                  </li>
                )}
              </ol>
            </nav>

            {/* Quick Booking Box */}
            <div className="bg-dark text-beige rounded-3xl p-7 space-y-5">
              <span className="eyebrow !text-brand block">[ Rent in Weligama ]</span>
              <h3 className="font-display text-2xl font-bold leading-snug">
                Honest daily rates, helmets included
              </h3>
              <ul className="space-y-2.5 text-sm border-y border-beige/15 py-4">
                <li className="flex items-center justify-between">
                  <span className="text-beige/70">110cc Auto Scooters</span>
                  <strong className="font-display text-beige">€5 / day</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-beige/70">125cc TVS Ntorq</span>
                  <strong className="font-display text-beige">€6 / day</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-beige/70">Manual Motorbikes</span>
                  <strong className="font-display text-beige">€10 / day</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-beige/70">Bajaj RE Tuk-Tuk</span>
                  <strong className="font-display text-beige">€15 / day</strong>
                </li>
              </ul>
              <div className="flex flex-col gap-2.5">
                <Link to="/book-now" className="btn-primary justify-center">
                  RESERVE ONLINE
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={whatsappLink(post.whatsappPrompt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost justify-center"
                >
                  <MessageCircle className="w-4 h-4" />
                  WHATSAPP +94 76 707 3388
                </a>
              </div>
              <p className="text-[11px] text-beige/50 leading-relaxed">
                No card needed to book. Pick up in central Weligama (07:00–21:00) or add south-coast
                hotel delivery.
              </p>
            </div>

            {/* Internal Links Hub */}
            <div className="bg-white rounded-3xl p-7 border border-dark/10 space-y-4">
              <span className="eyebrow block">[ Useful Links ]</span>
              <div className="divide-y divide-dark/10">
                {post.internalLinks.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group block py-3.5 first:pt-1 last:pb-1"
                  >
                    <div className="flex items-center justify-between gap-2 font-display font-bold text-sm text-dark group-hover:text-brand transition-colors">
                      <span>{item.label}</span>
                      <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-dark/55 leading-relaxed mt-1">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Related Guides Cluster ──────────────────────────────────────── */}
      <section className="bg-white py-16 md:py-24 border-t border-dark/10">
        <div className="max-w-7xl mx-auto px-6">
          <header className="section-head">
            <span className="eyebrow">[ Keep Reading ]</span>
            <div className="rule mt-5">
              <h2 className="display-xl text-3xl md:text-5xl max-w-2xl">
                More Weligama &amp; Sri Lanka rental guides
              </h2>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:gap-3 transition-all shrink-0"
              >
                All guides <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map(item => (
              <Link
                key={item.slug}
                to={`/blog/${item.slug}`}
                className="group bg-beige rounded-3xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={asset(item.image)}
                    alt={item.imageAlt}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-dark/45 uppercase tracking-widest">
                      {item.readingTime}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-3 group-hover:text-brand transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-dark/60 leading-relaxed line-clamp-3 mb-5 flex-1">
                    {item.excerpt}
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
    </div>
  );
}
