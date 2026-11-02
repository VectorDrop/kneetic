import { policies } from 'lib/policies';
import { siteUrl } from 'lib/site-url';
import { MetadataRoute } from 'next';

/**
 * Pages Google should index: the sales page (homepage) and the store policies.
 * Checkout, search and the old template product pages are left out on purpose.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...policies.map((p) => ({
      url: `${siteUrl}/policies/${p.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3
    }))
  ];
}
