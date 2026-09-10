// Single source of truth for the college directory shown on the landing page
// (CollegeCarousel). The hero's "Colleges Covered" count reads COLLEGES.length
// from here — one list, one number, so the two can never drift apart.
export interface CollegeInfo {
  name: string;
  slug: string;
  logo: string;
  city: string;
}

export const COLLEGES: readonly CollegeInfo[] = [
  { name: 'CCH Hasanabdal', slug: 'cch', logo: '/cch-logo.png', city: 'Attock, Punjab' },
  { name: 'PAF Sargodha', slug: 'paf-sargodha', logo: '/paf-sargodha-logo.png', city: 'Sargodha, Punjab' },
  { name: 'MCJ Jhelum', slug: 'mcj', logo: '/mcj-jhelum-logo.jpg', city: 'Jhelum, Punjab' },
  { name: 'Kohat Cadet', slug: 'kohat', logo: '/kohat-logo.jpg', city: 'Kohat, KPK' },
  { name: 'Petaro', slug: 'petaro', logo: '/petaro-logo.png', city: 'Jamshoro, Sindh' },
  { name: 'Burn Hall Abbottabad', slug: 'burn-hall', logo: '/burnhall-logo.webp', city: 'Abbottabad, KPK' },
  { name: 'Cadet College Larkana', slug: 'larkana', logo: '/larkana-logo-new.jpg', city: 'Larkana, Sindh' },
  { name: 'Cadet College Swat', slug: 'swat', logo: '/swat-logo.webp', city: 'Swat, KPK' },
  { name: 'Cadet College Mardan', slug: 'mardan', logo: '/mardan-logo.png', city: 'Mardan, KPK' },
  { name: 'Cadet College Sanghar', slug: 'sanghar', logo: '/sanghar-logo.webp', city: 'Sanghar, Sindh' },
  { name: 'Cadet College Wana', slug: 'wana', logo: '/wana-logo.png', city: 'Wana, Waziristan' },
  { name: 'PAF Lower Topa', slug: 'lower-topa', logo: '/paf-lower-topa-logo.png', city: 'Murree, Punjab' },
] as const;

/** Colleges that have their own dedicated page (the rest link to WhatsApp). */
export const COLLEGES_WITH_PAGES: ReadonlySet<string> = new Set([
  "cch",
  "paf-sargodha",
  "mcj",
  "kohat",
]);
