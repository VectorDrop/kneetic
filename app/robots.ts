import { siteUrl } from 'lib/site-url';
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/checkout/', '/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
