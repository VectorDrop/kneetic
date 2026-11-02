import clsx from 'clsx';
import { policies, policyInfo, type Policy } from 'lib/policies';
import { brand, footer } from 'lib/sales-content';
import Link from 'next/link';
import { bodyFont, displayFont } from './fonts';
import css from './policy-page.module.css';

export function PolicyPage({ policy }: { policy: Policy }) {
  return (
    <div className={clsx(css.page, displayFont.variable, bodyFont.variable)}>
      <header className={css.header}>
        <div className={css.headerInner}>
          <Link href="/" className={css.logo} aria-label={`${brand.name} home`}>
            {brand.name}
          </Link>
          <Link href="/#buy" className={css.headerCta}>
            Shop now
          </Link>
        </div>
      </header>

      <main className={css.main}>
        <nav className={css.tabs} aria-label="Store policies">
          {policies.map((p) => (
            <Link
              key={p.slug}
              href={`/policies/${p.slug}`}
              className={clsx(css.tab, p.slug === policy.slug && css.tabActive)}
              aria-current={p.slug === policy.slug ? 'page' : undefined}
            >
              {p.title.replace(' Policy', '')}
            </Link>
          ))}
        </nav>

        <h1 className={css.title}>{policy.title}</h1>
        <p className={css.updated}>Last updated: {policyInfo.lastUpdated}</p>
        <p className={css.intro}>{policy.intro}</p>

        {policy.sections.map((s) => (
          <section key={s.h} className={css.section}>
            <h2>{s.h}</h2>
            {s.p?.map((para) => (
              <p key={para}>{para}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div className={css.contact}>
          <strong>Questions?</strong>
          <span>
            Email us at <a href={`mailto:${policyInfo.email}`}>{policyInfo.email}</a>. We usually
            reply within one business day.
          </span>
        </div>
      </main>

      <footer className={css.footer}>
        <div className={css.footerInner}>
          <span className={css.footerLogo}>{brand.name}</span>
          <nav className={css.footerNav} aria-label="Policies">
            {footer.links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
          <p className={css.footerCopy}>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
