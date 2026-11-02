/** Country and state lists for the address form. Country names come from the browser (Intl). */

/** Shown first in the country list. Most orders are expected from these. */
const TOP = ['US', 'CA', 'GB', 'AU'];

/** ISO 3166-1 alpha-2 codes. */
const ALL =
  'AD AE AG AL AM AO AR AT AU AW AZ BA BB BD BE BG BH BM BN BO BR BS BT BW BY BZ CA CH CL CN CO CR CY CZ DE DK DM DO DZ EC EE EG ES FI FJ FO FR GB GD GE GG GH GI GL GP GR GT GU GY HK HN HR HU ID IE IL IM IN IS IT JE JM JO JP KE KH KN KR KW KY KZ LA LB LC LI LK LT LU LV MA MC MD ME MK MN MO MQ MT MU MV MX MY NA NC NG NI NL NO NP NZ OM PA PE PF PG PH PK PL PR PT PY QA RE RO RS SA SC SE SG SI SK SM SN SR SV TC TH TN TR TT TW TZ UA UG UY UZ VC VE VG VI VN ZA ZM'.split(
    ' '
  );

export type Choice = { code: string; name: string };

function countryName(code: string, names: Intl.DisplayNames | null): string {
  try {
    return names?.of(code) || code;
  } catch {
    return code;
  }
}

let cached: Choice[] | null = null;

/** Country list: top countries first, then the rest alphabetically. */
export function countries(): Choice[] {
  if (cached) return cached;
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    names = null;
  }
  const top = TOP.map((code) => ({ code, name: countryName(code, names) }));
  const rest = ALL.filter((code) => TOP.indexOf(code) === -1)
    .map((code) => ({ code, name: countryName(code, names) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  cached = top.concat(rest);
  return cached;
}

const US_STATES: Choice[] = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['PR', 'Puerto Rico'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['AA', 'Armed Forces Americas'],
  ['AE', 'Armed Forces Europe'],
  ['AP', 'Armed Forces Pacific']
].map(([code, name]) => ({ code: code as string, name: name as string }));

const CA_PROVINCES: Choice[] = [
  ['AB', 'Alberta'],
  ['BC', 'British Columbia'],
  ['MB', 'Manitoba'],
  ['NB', 'New Brunswick'],
  ['NL', 'Newfoundland and Labrador'],
  ['NS', 'Nova Scotia'],
  ['NT', 'Northwest Territories'],
  ['NU', 'Nunavut'],
  ['ON', 'Ontario'],
  ['PE', 'Prince Edward Island'],
  ['QC', 'Quebec'],
  ['SK', 'Saskatchewan'],
  ['YT', 'Yukon']
].map(([code, name]) => ({ code: code as string, name: name as string }));

/** Region rules per country: a dropdown list, a required text field, or optional text. */
export function regionField(country: string): {
  label: string;
  choices: Choice[] | null;
  required: boolean;
  zipLabel: string;
  zipRequired: boolean;
} {
  if (country === 'US') {
    return {
      label: 'State',
      choices: US_STATES,
      required: true,
      zipLabel: 'ZIP code',
      zipRequired: true
    };
  }
  if (country === 'CA') {
    return {
      label: 'Province',
      choices: CA_PROVINCES,
      required: true,
      zipLabel: 'Postal code',
      zipRequired: true
    };
  }
  if (country === 'AU') {
    return {
      label: 'State/territory',
      choices: null,
      required: true,
      zipLabel: 'Postcode',
      zipRequired: true
    };
  }
  // Places like Hong Kong or the UAE often have no postal code.
  const noZip = [
    'HK',
    'AE',
    'QA',
    'IE',
    'PA',
    'AG',
    'BS',
    'BZ',
    'DM',
    'GD',
    'KN',
    'LC',
    'VC',
    'TT',
    'BM',
    'KY',
    'TC',
    'VG'
  ];
  return {
    label: 'State/region (optional)',
    choices: null,
    required: false,
    zipLabel: 'Postal code',
    zipRequired: noZip.indexOf(country) === -1
  };
}

/** Light format check (never blocks a valid address): US ZIP and Canadian postal codes. */
export function zipLooksWrong(country: string, zip: string): boolean {
  const z = zip.trim();
  if (country === 'US') return !/^\d{5}(-?\d{4})?$/.test(z);
  if (country === 'CA') return !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(z);
  return false;
}
