import clsx from 'clsx';
import * as c from 'lib/sales-content';
import { formatMoney } from 'lib/sales-pricing';
import type { SalesProduct } from 'lib/sales-types';
import Image from 'next/image';
import { BuyBox } from './buy-box';
import { BuyStateProvider } from './buy-state';
import { Countdown } from './countdown';
import { bodyFont, displayFont } from './fonts';
import { Gallery } from './gallery';
import { Icon, type IconName } from './icons';
import css from './sales-page.module.css';
import { StickyBuyBar } from './sticky-buy-bar';

function Faqs({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className={css.faqs}>
      {items.map((f) => (
        <details key={f.q} className={css.faq}>
          <summary>
            <span>{f.q}</span>
            <Icon name="chevron" size={20} />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function Stars({ value, size = 18 }: { value: number; size?: number }) {
  return (
    <span className={css.stars} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="star"
          size={size}
          className={clsx(i <= Math.round(value) && css.starOn)}
        />
      ))}
    </span>
  );
}

/** Glamory-style headline: the part before "|" is light, the part after it bold. */
function Title({ text }: { text: string }) {
  const [light, bold] = text.split('|').map((s) => s.trim());
  if (!bold) return <>{light}</>;
  return (
    <>
      <span className={css.titleLight}>{light}</span> <span className={css.titleBold}>{bold}</span>
    </>
  );
}

function RatingBadge({ center = false }: { center?: boolean }) {
  return (
    <a href="#reviews" className={clsx(css.ratingBadge, center && css.ratingCenter)}>
      <Stars value={c.rating.value} size={17} />
      <strong>{c.rating.value.toFixed(1)}/5</strong>
      <span>
        Based on <strong>{c.rating.count}</strong> {c.rating.label}
      </span>
    </a>
  );
}

function Cell({ value, price }: { value: string; price: string }) {
  if (value === 'yes')
    return (
      <>
        <Icon name="check" size={22} className={css.yes} />
        <span className={css.srOnly}>Yes</span>
      </>
    );
  if (value === 'no')
    return (
      <>
        <Icon name="x" size={22} className={css.no} />
        <span className={css.srOnly}>No</span>
      </>
    );
  if (value === 'varies') return <span className={css.varies}>Varies</span>;
  return <span>{value.replace('{price}', price || '—')}</span>;
}

export function SalesPage({ product }: { product: SalesProduct }) {
  const priceText = formatMoney(product.price, product.currency);
  const reviews = c.reviews;
  const finalImage = product.images[0] ?? c.salesFallbackImages[0];

  const jsonLd = product.live
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images.map((i) => i.src),
        brand: { '@type': 'Brand', name: c.brand.name },
        offers: {
          '@type': 'Offer',
          priceCurrency: product.currency,
          price: product.price ?? undefined,
          availability:
            product.stockTracking && product.stockLevel !== null && product.stockLevel <= 0
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock'
        }
      }
    : null;

  return (
    <BuyStateProvider product={product} defaultQty={c.buyBox.quantities[0]?.qty ?? 1}>
      <div className={clsx(css.page, displayFont.variable, bodyFont.variable)}>
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}

        <div className={css.announce}>
          <Icon name="truck" size={16} /> {c.announcement}
        </div>

        <header className={css.header}>
          <div className={clsx(css.wrap, css.headerInner)}>
            <a href="#top" className={css.logo} aria-label={`${c.brand.name} home`}>
              {c.brand.name}
            </a>
            <a href="#buy" className={css.headerCta}>
              Shop now
            </a>
          </div>
        </header>

        {/* ============ ABOVE THE FOLD ============ */}
        <section className={css.hero} id="top">
          <div className={clsx(css.wrap, css.heroGrid)}>
            <div className={css.heroMedia}>
              <Gallery images={product.images} labels={c.galleryLabels} />
            </div>

            <div className={css.heroCopy}>
              <RatingBadge />
              <h1 className={css.heroTitle}>
                <Title text={c.hero.headline} />
              </h1>
              <p className={css.heroSub}>{c.hero.subheadline}</p>

              <ul className={css.benefits}>
                {c.hero.benefits.map((b) => (
                  <li key={b.strong}>
                    <span className={css.benefitIcon}>
                      <Icon name={b.icon as IconName} size={20} />
                    </span>
                    <span>
                      <strong>{b.strong}</strong>
                      {b.rest}
                    </span>
                  </li>
                ))}
              </ul>

              <BuyBox id="buy" />

              <div className={css.heroFaqs}>
                <h2 className={css.miniTitle}>Questions lifters ask first</h2>
                <Faqs items={c.heroFaqs} />
              </div>
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        {reviews.length > 0 && (
          <section className={clsx(css.section, css.sectionWhite)} id="reviews">
            <div className={css.wrap}>
              <h2 className={clsx(css.sectionTitle, css.titleTight)}>
                <Title text={c.reviewsSection.title} />
              </h2>
              <RatingBadge center />

              {c.customerPhotos.length > 0 && (
                <div className={css.photoGrid}>
                  {c.customerPhotos.map((p) => (
                    <figure key={p.src} className={css.photo}>
                      <Image src={p.src} alt={p.alt} fill sizes="(min-width: 960px) 300px, 50vw" />
                      <figcaption>
                        <Icon name="check" size={13} /> {c.reviewsSection.photosLabel}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <div className={css.swipeRow}>
                {reviews.map((r) => (
                  <article key={r.name + r.title} className={css.review}>
                    {r.photo && (
                      <div className={css.reviewPhoto}>
                        <Image
                          src={r.photo}
                          alt={`${r.name} wearing the sleeves`}
                          fill
                          sizes="(min-width: 960px) 360px, 80vw"
                        />
                      </div>
                    )}
                    <div className={css.reviewBody}>
                      <Stars value={r.rating} size={16} />
                      <h3>{r.title}</h3>
                      <p>{r.body}</p>
                      <footer>
                        {r.name !== 'Verified buyer' && <strong>{r.name}</strong>}
                        {r.verified && (
                          <span className={css.verified}>
                            <Icon name="check" size={14} /> Verified buyer
                          </span>
                        )}
                        {r.detail && <span className={css.reviewDetail}>{r.detail}</span>}
                      </footer>
                    </div>
                  </article>
                ))}
              </div>
              <p className={clsx(css.footnote, css.center)}>{c.reviewsSection.note}</p>
            </div>
          </section>
        )}

        {/* ============ EDUCATION: THE BIG IDEA ============ */}
        <section className={clsx(css.section, css.sectionNavy)} id="why">
          <div className={clsx(css.wrap, css.split)}>
            <div className={css.splitText}>
              <p className={css.kicker}>{c.bigIdea.kicker}</p>
              <h2 className={clsx(css.sectionTitle, css.left, css.light)}>
                <span className={css.titleLight}>{c.bigIdea.title}</span>{' '}
                <span className={css.accent}>{c.bigIdea.titleAccent}</span>
              </h2>
              {c.bigIdea.body.map((p) => (
                <p key={p} className={css.lead}>
                  {p}
                </p>
              ))}
            </div>
            <div className={css.splitMedia}>
              <Image
                src={c.bigIdea.image}
                alt={c.bigIdea.imageAlt}
                width={1400}
                height={1400}
                sizes="(min-width: 960px) 540px, 100vw"
              />
            </div>
            <div className={css.splitStages}>
              <ol className={css.fade}>
                {c.bigIdea.stages.map((st, i) => (
                  <li
                    key={st.when}
                    className={clsx(
                      css.fadeStep,
                      i === 1 && css.fadeStep1,
                      i === 2 && css.fadeStep2
                    )}
                  >
                    <strong>{st.when}</strong>
                    <span>{st.what}</span>
                  </li>
                ))}
              </ol>
              <p className={clsx(css.footnote, css.footnoteLight)}>{c.bigIdea.footnote}</p>
            </div>
          </div>
        </section>

        {/* ============ EDUCATION: WHAT'S IN IT ============ */}
        <section className={css.section} id="materials">
          <div className={css.wrap}>
            <h2 className={css.sectionTitle}>
              <Title text={c.materials.title} />
            </h2>
            <div className={css.featureList}>
              {c.materials.items.map((m) => (
                <div key={m.name} className={css.feature}>
                  <span className={css.featureIcon}>
                    <Icon name={m.icon as IconName} size={26} />
                  </span>
                  <div>
                    <h3>{m.name}</h3>
                    <p>{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ EDUCATION: HONEST SCIENCE ============ */}
        <section className={clsx(css.section, css.sectionWhite)} id="science">
          <div className={css.wrap}>
            <h2 className={css.sectionTitle}>
              <Title text={c.science.title} />
            </h2>
            <div className={css.science}>
              <div className={clsx(css.scienceCol, css.scienceDont)}>
                <h3>Sleeves won&apos;t</h3>
                <ul>
                  {c.science.dont.map((t) => (
                    <li key={t}>
                      <Icon name="x" size={18} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={clsx(css.scienceCol, css.scienceDo)}>
                <h3>KNEETIC will</h3>
                <ul>
                  {c.science.do.map((t) => (
                    <li key={t}>
                      <Icon name="check" size={18} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={css.stat}>
                <strong>{c.science.stat}</strong>
                <p>{c.science.statText}*</p>
                <small>*{c.science.statSource}</small>
              </div>
            </div>
          </div>
        </section>

        {/* ============ EDUCATION: HOW TO USE ============ */}
        <section className={css.section} id="how-to">
          <div className={css.wrap}>
            <h2 className={css.sectionTitle}>
              <Title text={c.howToUse.title} />
            </h2>
            <ol className={css.steps}>
              {c.howToUse.steps.map((st, i) => (
                <li key={st.title} className={css.step}>
                  {c.howToUse.media[i] ? (
                    <video
                      className={css.stepMedia}
                      src={c.howToUse.media[i]}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <span className={css.stepNum}>{i + 1}</span>
                  )}
                  <div>
                    <h3>{st.title}</h3>
                    <p>{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ EDUCATION: WHO IT'S FOR ============ */}
        <section className={clsx(css.section, css.sectionWhite)} id="who">
          <div className={css.wrap}>
            <h2 className={css.sectionTitle}>
              <Title text={c.whoFor.title} />
            </h2>
            <div className={css.swipeRow}>
              {c.whoFor.cards.map((w) => (
                <div key={w.title} className={css.whoCard}>
                  <span className={css.featureIcon}>
                    <Icon name={w.icon as IconName} size={24} />
                  </span>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              ))}
            </div>
            <p className={clsx(css.footnote, css.center)}>{c.whoFor.note}</p>
          </div>
        </section>

        {/* ============ EDUCATION: THEM VS US ============ */}
        <section className={css.section} id="compare">
          <div className={css.wrap}>
            <h2 className={css.sectionTitle}>
              <Title text={c.comparison.title} />
            </h2>
            <div className={css.compare}>
              <table>
                <thead>
                  <tr>
                    <th>
                      <span className={css.srOnly}>Feature</span>
                    </th>
                    {c.comparison.columns.map((col, i) => (
                      <th
                        key={col}
                        className={clsx(i === c.comparison.columns.length - 1 && css.us)}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.comparison.rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {r.values.map((v, i) => (
                        <td key={i} className={clsx(i === r.values.length - 1 && css.us)}>
                          <Cell value={v} price={priceText} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={clsx(css.footnote, css.center)}>{c.comparison.note}</p>
          </div>
        </section>

        {/* ============ EDUCATION: TIMELINE + ROADMAP ============ */}
        <section className={clsx(css.section, css.sectionWhite)} id="timeline">
          <div className={clsx(css.wrap, css.twoCol)}>
            <div>
              <h2 className={clsx(css.sectionTitle, css.left)}>
                <Title text={c.timeline.title} />
              </h2>
              <ol className={css.timeline}>
                {c.timeline.items.map((t) => (
                  <li key={t.when}>
                    <strong>{t.when}</strong>
                    <p>{t.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className={clsx(css.sectionTitle, css.left)}>
                <Title text={c.roadmap.title} />
              </h2>
              <ol className={css.roadmap}>
                {c.roadmap.steps.map((st, i) => (
                  <li key={st.title}>
                    <span className={css.roadmapNum}>{i + 1}</span>
                    <div>
                      <strong>{st.title}</strong>
                      <p>{st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ============ EDUCATION: AUTHORITY (optional, real person only) ============ */}
        {c.founder.enabled && c.founder.name && (
          <section className={css.section} id="founder">
            <div className={clsx(css.wrap, css.founder)}>
              {c.founder.photo && (
                <Image src={c.founder.photo} alt={c.founder.name} width={220} height={220} />
              )}
              <blockquote>
                <p>“{c.founder.quote}”</p>
                <footer>
                  <strong>{c.founder.name}</strong>
                  {c.founder.credential && <span> · {c.founder.credential}</span>}
                </footer>
              </blockquote>
            </div>
          </section>
        )}

        {/* ============ MORE FAQS ============ */}
        <section className={css.section} id="faq">
          <div className={clsx(css.wrap, css.narrow)}>
            <h2 className={css.sectionTitle}>
              <Title text="Ask Us | Anything" />
            </h2>
            <Faqs items={c.moreFaqs} />
          </div>
        </section>

        {/* ============ OFFER WITH URGENCY ============ */}
        <section className={clsx(css.section, css.sectionNavy, css.final)} id="final-offer">
          <div className={clsx(css.wrap, css.finalGrid)}>
            <div className={css.finalCopy}>
              <h2 className={clsx(css.sectionTitle, css.left, css.light)}>
                <Title text={c.finalOffer.title} />
              </h2>
              <p className={css.lead}>{c.finalOffer.subtitle}</p>
              <Countdown endsAt={c.urgency.launchPriceEndsAt} label={c.urgency.launchPriceLabel} />
              {finalImage && (
                <div className={css.finalImg}>
                  <Image
                    src={finalImage.src}
                    alt={finalImage.alt}
                    width={finalImage.width}
                    height={finalImage.height}
                    sizes="(min-width: 960px) 560px, 100vw"
                  />
                </div>
              )}
            </div>
            <BuyBox id="final-buy" />
          </div>
        </section>

        <footer className={css.footer}>
          <div className={css.wrap}>
            <div className={css.footerTop}>
              <span className={clsx(css.logo, css.logoLight)}>{c.brand.name}</span>
              <nav aria-label="Policies" className={css.footerNav}>
                {c.footer.links.map((l) => (
                  <a key={l.href} href={l.href}>
                    {l.label}
                  </a>
                ))}
                <a href={`mailto:${c.brand.supportEmail}`}>Contact</a>
              </nav>
            </div>
            <p className={css.footerDisclaimer}>{c.footer.disclaimer}</p>
            <p className={css.footerCopy}>
              © {new Date().getFullYear()} {c.brand.name}. All rights reserved.
            </p>
          </div>
        </footer>

        <StickyBuyBar />
      </div>
    </BuyStateProvider>
  );
}
