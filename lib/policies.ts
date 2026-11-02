/**
 * STORE POLICIES (Shipping, Returns & Refunds, Privacy, Terms).
 *
 * 1. Fill in the settings in `policyInfo` below. Everything marked TODO is a fact only you know.
 *    The policy texts update automatically.
 * 2. Pages: /policies/shipping, /policies/refunds, /policies/privacy, /policies/terms
 *
 * These are solid templates for a small online store, not legal advice. Have them checked by a
 * lawyer for the countries you sell to (EU/UK and California have extra consumer and privacy rules).
 */
import { brand } from './sales-content';

export const policyInfo = {
  brand: brand.name,
  /** TODO: your registered business name (e.g. "KNEETIC LLC" or your name as sole trader). */
  legalName: 'KNEETIC',
  /** TODO: business address. Shown on Privacy and Terms (required in the EU/UK). Leave '' to hide. */
  address: '',
  /** TODO: country whose laws apply to your store, e.g. 'Germany' or 'the State of Delaware, USA'. */
  governingLaw: '',
  email: brand.supportEmail,
  lastUpdated: 'November 2, 2026',

  shipping: {
    /** TODO: time to pack and hand the order to the carrier. */
    processing: '1–3 business days',
    /**
     * Total time from order to the customer's door (processing included). Also used for the
     * estimated delivery dates in checkout and on the thank-you page.
     */
    delivery: '5–10 business days',
    /** Where you ship to. */
    regions: 'the United States and most countries worldwide',
    /** How many days after the expected delivery date customers can report a missing order. */
    lostClaimDays: 14
  },

  returns: {
    /** Must match the guarantee on the sales page. */
    windowDays: 30,
    /** 'customer' = the customer pays return shipping, 'store' = you send a prepaid label. */
    returnShippingPaidBy: 'customer' as 'customer' | 'store',
    /** Time to issue the refund after the return arrives. */
    refundTime: '5 business days',
    /** Days customers have to report a damaged, defective or wrong item. */
    defectReportDays: 14
  }
};

export type PolicySection = { h: string; p?: string[]; list?: string[] };
export type Policy = { slug: string; title: string; intro: string; sections: PolicySection[] };

const i = policyInfo;
const contact = `email us at ${i.email}`;
const lawText = i.governingLaw
  ? `the laws of ${i.governingLaw}`
  : `the laws of the country in which ${i.legalName} is registered`;

export const policies: Policy[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: 'shipping',
    title: 'Shipping Policy',
    intro: `Here is everything you need to know about how and when your ${i.brand} order ships.`,
    sections: [
      {
        h: 'Where we ship',
        p: [
          `We ship to ${i.shipping.regions}. If your country is available at checkout, we deliver there.`
        ]
      },
      {
        h: 'Processing time',
        p: [
          `Orders are processed within ${i.shipping.processing} after payment. Orders placed on weekends or public holidays are processed the next business day.`
        ]
      },
      {
        h: 'Delivery time',
        p: [
          `Most orders arrive within ${i.shipping.delivery} of your order, processing time included. Delivery times are estimates, not guarantees. Carrier delays, customs checks and peak seasons can add a few days.`
        ]
      },
      {
        h: 'Shipping costs',
        p: [
          'Shipping to the United States is free. For all other countries, shipping costs are shown at checkout before you pay.'
        ]
      },
      {
        h: 'Order tracking',
        p: [
          `As soon as your order ships, we send you a confirmation email with a tracking number where available. If you haven't received it within ${i.shipping.processing} of your order, check your spam folder or ${contact}.`
        ]
      },
      {
        h: 'Customs, duties and taxes',
        p: [
          'Orders shipped outside the country they are sent from may be subject to import duties, taxes or customs fees charged by your country. These are set by your local authorities, are not included in our prices, and are the responsibility of the recipient. If you refuse to pay them and the parcel is returned to us, we refund the product price minus any return shipping costs we are charged.'
        ]
      },
      {
        h: 'Wrong address',
        p: [
          `Please check your shipping address at checkout. If you notice a mistake, ${contact} as soon as possible. We can change the address only before the order has shipped. We are not responsible for orders delivered to an incorrect address entered at checkout.`
        ]
      },
      {
        h: 'Lost or damaged parcels',
        p: [
          `If your order hasn't arrived within ${i.shipping.lostClaimDays} days after the expected delivery date, or it arrives damaged, ${contact} with your order number (and photos of any damage). We'll work with the carrier and, if the parcel can't be found or the item is damaged, send a replacement or a full refund.`
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'refunds',
    title: 'Returns & Refunds Policy',
    intro: `Every ${i.brand} order comes with a ${i.returns.windowDays}-day money-back guarantee. Train in your sleeves, and if they're not right for you, send them back for a full refund.`,
    sections: [
      {
        h: `${i.returns.windowDays}-day money-back guarantee`,
        p: [
          `You have ${i.returns.windowDays} days from the day your order is delivered to request a return. You can return your sleeves even if you've worn them. We want you to test them properly on your heavy days.`
        ]
      },
      {
        h: 'How to return your sleeves',
        list: [
          `Email us at ${i.email} within ${i.returns.windowDays} days of delivery with your order number and the reason for your return.`,
          "We reply with the return address and instructions. Please don't send items back without contacting us first; returns sent without instructions may not be processed.",
          'Pack the sleeves securely and send them back. We recommend a tracked shipping method.',
          `Once your return arrives, we issue your refund within ${i.returns.refundTime}.`
        ]
      },
      {
        h: 'Return shipping costs',
        p: [
          i.returns.returnShippingPaidBy === 'store'
            ? 'We send you a prepaid return label, so returning your sleeves costs you nothing.'
            : 'You are responsible for the cost of return shipping, unless the item arrived damaged, defective or wasn’t what you ordered. Original shipping costs, if any, are not refunded.'
        ]
      },
      {
        h: 'Refunds',
        p: [
          `Refunds are issued to your original payment method. Depending on your bank or card provider, it can take a further 5–10 business days for the money to appear in your account. We email you as soon as your refund has been processed.`
        ]
      },
      {
        h: 'Wrong size',
        p: [
          `If your sleeves don't fit, ${contact} within ${i.returns.windowDays} days of delivery. You can return them for a refund under the money-back guarantee and order the right size.`
        ]
      },
      {
        h: 'Damaged, defective or wrong items',
        p: [
          `If your order arrives damaged, defective or isn't what you ordered, ${contact} within ${i.returns.defectReportDays} days of delivery with your order number and a photo of the problem. We'll send a replacement or a full refund, and you won't pay for return shipping.`
        ]
      },
      {
        h: 'Your legal rights',
        p: [
          'This policy is in addition to, and does not limit, any rights you have under the consumer laws of your country, such as the 14-day right of withdrawal for customers in the EU and UK.'
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    intro: `This policy explains what personal information ${i.legalName} ("we", "us") collects when you visit our website or buy from us, how we use it, and the choices you have.`,
    sections: [
      {
        h: 'Who we are',
        p: [
          `${i.legalName} operates the ${i.brand} online store and is responsible for your personal information.${i.address ? ` Our address: ${i.address}.` : ''} You can reach us at ${i.email}.`
        ]
      },
      {
        h: 'Information we collect',
        list: [
          'Order information: your name, email address, shipping and billing address, phone number (if provided) and the products you buy.',
          'Payment information: payments are processed by our payment providers at checkout. We do not see or store your full card details.',
          'Communication: messages you send us, for example about an order or a return.',
          'Device and usage information: your IP address, browser type, device, pages viewed and how you arrived at our site, collected through cookies and similar technologies.'
        ]
      },
      {
        h: 'How we use your information',
        list: [
          'To process and deliver your order, including sending order and shipping confirmations.',
          'To handle returns, refunds and customer service requests.',
          'To prevent fraud and keep our store secure.',
          'To understand how our website is used and improve it.',
          'To send marketing emails, only if you have agreed to receive them. You can unsubscribe at any time using the link in every email.',
          'To show relevant ads on other platforms (for example Meta or Google), where you have allowed advertising cookies.'
        ]
      },
      {
        h: 'Legal bases (EU/UK customers)',
        p: [
          'We process your information to perform our contract with you (fulfilling your order), to meet legal obligations (such as tax and accounting rules), based on our legitimate interests (running and securing our store), and based on your consent (marketing emails and advertising cookies). You can withdraw your consent at any time.'
        ]
      },
      {
        h: 'Who we share it with',
        p: [
          'We share your information only with service providers who help us run the store, and only as far as needed:'
        ],
        list: [
          'Our e-commerce platform and checkout provider (Swell), which hosts our store and processes orders.',
          'Payment providers that process your payment.',
          'Shipping carriers and fulfillment partners that pack and deliver your order.',
          'Analytics and advertising providers, if you have allowed the related cookies.',
          'Authorities, where we are required to by law.'
        ]
      },
      {
        h: 'International transfers',
        p: [
          'Some of our service providers are located outside your country, including in the United States. Where required, we rely on appropriate safeguards such as standard contractual clauses to protect your information.'
        ]
      },
      {
        h: 'Cookies',
        p: [
          'We use cookies that are necessary for the store to work (for example your cart and checkout). With your consent, we may also use analytics and advertising cookies. You can block or delete cookies in your browser settings; some parts of the store may not work without the necessary ones.'
        ]
      },
      {
        h: 'How long we keep it',
        p: [
          'We keep order information as long as needed to fulfill your order and to meet legal requirements (for example, tax law may require us to keep invoices for several years). Marketing data is kept until you unsubscribe.'
        ]
      },
      {
        h: 'Your rights',
        p: [
          `Depending on where you live, you may have the right to access, correct, delete or receive a copy of your personal information, to object to or restrict certain processing, and to withdraw consent. California residents can request to know what information we hold and ask us to delete it; we do not sell your personal information. To use any of these rights, ${contact}. You also have the right to lodge a complaint with your local data protection authority.`
        ]
      },
      {
        h: 'Children',
        p: [
          'Our store is not directed at children under 16, and we do not knowingly collect their personal information.'
        ]
      },
      {
        h: 'Changes to this policy',
        p: [
          'We may update this policy from time to time. The latest version is always available on this page, with the date it was last updated.'
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'terms',
    title: 'Terms of Service',
    intro: `These terms apply to your use of the ${i.brand} website and to every order you place with us. By using our site or placing an order, you agree to them.`,
    sections: [
      {
        h: 'About us',
        p: [
          `This store is operated by ${i.legalName}.${i.address ? ` Address: ${i.address}.` : ''} Contact: ${i.email}.`
        ]
      },
      {
        h: 'Our products',
        p: [
          `${i.brand} knee sleeves are training gear. They are not a medical device and are not intended to diagnose, treat, cure or prevent any injury or medical condition. If you have a knee injury, pain or a medical condition, consult a qualified medical professional before use. Always train within your abilities.`,
          'We make every effort to show our products accurately. Colors and details may look slightly different depending on your screen.'
        ]
      },
      {
        h: 'Orders',
        p: [
          'Placing an order is an offer to buy. A contract is formed when we confirm your order by email. We may refuse or cancel an order, for example if a product is unavailable, there is an obvious pricing error, or we suspect fraud. If we cancel an order you have paid for, we refund you in full.'
        ]
      },
      {
        h: 'Prices and payment',
        p: [
          'All prices are shown in US dollars (USD) unless stated otherwise. Shipping costs and any applicable taxes are shown at checkout. Payment is taken when you place your order. Multi-pair prices apply to the quantity shown at checkout.'
        ]
      },
      {
        h: 'Shipping and returns',
        p: [
          `Delivery is covered by our Shipping Policy, and returns and refunds by our Returns & Refunds Policy, including our ${i.returns.windowDays}-day money-back guarantee. Both are part of these terms.`
        ]
      },
      {
        h: 'Use of our website',
        p: [
          'You may use our site only for lawful purposes. All content on this site, including text, images, logos and design, belongs to us or our licensors and may not be copied or used without our permission.'
        ]
      },
      {
        h: 'Reviews',
        p: [
          'Reviews shown on our site are submitted by customers and reflect their own experience. Individual results and fit may vary.'
        ]
      },
      {
        h: 'Liability',
        p: [
          'To the extent permitted by law, we are not liable for indirect or consequential losses, or for injury resulting from improper use of our products. Our total liability for any order is limited to the amount you paid for it. Nothing in these terms limits liability that cannot be limited by law, or your statutory rights as a consumer.'
        ]
      },
      {
        h: 'Governing law',
        p: [
          `These terms are governed by ${lawText}. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live.`
        ]
      },
      {
        h: 'Changes',
        p: [
          'We may update these terms from time to time. The version on this page at the time of your order applies to that order.'
        ]
      },
      {
        h: 'Contact',
        p: [`Questions about these terms? ${contact.charAt(0).toUpperCase() + contact.slice(1)}.`]
      }
    ]
  }
];

export function getPolicy(slug: string): Policy | undefined {
  return policies.find((p) => p.slug === slug);
}
