import { PolicyPage } from 'components/sales/policy-page';
import { getPolicy, policies } from 'lib/policies';
import { brand } from 'lib/sales-content';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const policy = getPolicy(params.slug);
  if (!policy) return {};
  return { title: { absolute: `${policy.title} | ${brand.name}` }, description: policy.intro };
}

export default function Page({ params }: { params: { slug: string } }) {
  const policy = getPolicy(params.slug);
  if (!policy) return notFound();
  return <PolicyPage policy={policy} />;
}
