/**
 * Approved service-area localities for the Coming Soon locality test.
 *
 * IMPORTANT: this list must stay identical to the list in
 * supabase/migrations/*_create_location_test_submissions.sql
 * (`private.is_allowed_locality`). tests/localities.test.js enforces this.
 */
export const LOCALITY_GROUPS = Object.freeze([
  Object.freeze({
    region: 'Mumbai',
    localities: Object.freeze([
      'Andheri East', 'Andheri West', 'Bandra East', 'Bandra West', 'Bhandup',
      'Borivali East', 'Borivali West', 'Byculla', 'Chembur', 'Colaba',
      'Dadar', 'Dahisar', 'Fort', 'Ghatkopar', 'Goregaon East',
      'Goregaon West', 'Jogeshwari', 'Kandivali East', 'Kandivali West', 'Kurla',
      'Lower Parel', 'Malad East', 'Malad West', 'Mulund', 'Parel',
      'Powai', 'Santacruz', 'Vikhroli', 'Vile Parle', 'Wadala',
      'Worli',
    ]),
  }),
  Object.freeze({
    region: 'Thane',
    localities: Object.freeze([
      'Ambernath', 'Badlapur', 'Bhayandar East', 'Bhayandar West', 'Dombivli East',
      'Dombivli West', 'Kalwa', 'Kalyan East', 'Kalyan West', 'Mira Road',
      'Mumbra', 'Thane East', 'Thane West', 'Ulhasnagar',
    ]),
  }),
  Object.freeze({
    region: 'Navi Mumbai',
    localities: Object.freeze([
      'Airoli', 'Belapur', 'Ghansoli', 'Kamothe', 'Kharghar',
      'Koparkhairane', 'Nerul', 'Panvel', 'Sanpada', 'Seawoods',
      'Taloja', 'Vashi',
    ]),
  }),
]);

export const ALL_LOCALITIES = Object.freeze(LOCALITY_GROUPS.flatMap((g) => g.localities));

const ALLOWED = new Set(ALL_LOCALITIES);

/** Strict check: only exact, canonical names from the list are valid. */
export function isAllowedLocality(value) {
  return typeof value === 'string' && ALLOWED.has(value);
}

/** Lower-case and strip spaces/punctuation so "andheri-e" matches "Andheri East". */
export function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Case-insensitive search. Matches on locality name, or on region name
 * (typing "thane" lists every Thane locality). Prefix matches are ranked first.
 * @returns {{region: string, localities: string[]}[]} non-empty groups only
 */
export function filterLocalities(query) {
  const q = normalize(query);
  return LOCALITY_GROUPS.map((group) => {
    if (!q) return { region: group.region, localities: [...group.localities] };
    const regionMatch = normalize(group.region).includes(q);
    const matches = group.localities.filter((name) => regionMatch || normalize(name).includes(q));
    matches.sort((a, b) => {
      const pa = normalize(a).startsWith(q) ? 0 : 1;
      const pb = normalize(b).startsWith(q) ? 0 : 1;
      return pa - pb || a.localeCompare(b);
    });
    return { region: group.region, localities: matches };
  }).filter((group) => group.localities.length > 0);
}

/** Returns the canonical locality if `text` matches one exactly (ignoring case/spacing). */
export function findExactLocality(text) {
  const q = normalize(text);
  if (!q) return null;
  return ALL_LOCALITIES.find((name) => normalize(name) === q) ?? null;
}
