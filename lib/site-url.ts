/**
 * Public address of the store, used for the sitemap, robots.txt and social share links.
 * Set SITE_URL in Vercel if the domain ever changes (no trailing slash).
 */
export const siteUrl = (
  process.env.SITE_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://kneeticgear.com' : 'http://localhost:3000')
).replace(/\/+$/, '');
