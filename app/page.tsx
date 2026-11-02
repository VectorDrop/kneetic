import { SalesPage } from 'components/sales/sales-page';
import { TrackOnView } from 'components/tracking/track-on-view';
import { meta } from 'lib/sales-content';
import { getSalesProduct } from 'lib/swell/sales';

export const runtime = 'edge';

export const metadata = {
  title: { absolute: meta.title },
  description: meta.description,
  openGraph: {
    type: 'website',
    title: meta.title,
    description: meta.description,
    images: ['/carousel/01-hero.jpg']
  }
};

export default async function HomePage() {
  const product = await getSalesProduct();
  return (
    <>
      <SalesPage product={product} />
      <TrackOnView
        event="view_content"
        params={{ value: product.price ?? undefined, currency: product.currency }}
      />
    </>
  );
}
