// Single source of truth for the medical universities directory shown on the landing page
// (CollegeCarousel). The hero's "Colleges Covered" count reads COLLEGES.length
// from here — one list, one number, so the two can never drift apart.
export interface CollegeInfo {
  name: string;
  slug: string;
  logo: string;
  city: string;
}

export const COLLEGES: readonly CollegeInfo[] = [
  { name: 'NUMS Rawalpindi', slug: 'nums', logo: '/cch-logo.png', city: 'Rawalpindi, Punjab' },
  { name: 'UHS Lahore', slug: 'uhs', logo: '/paf-sargodha-logo.png', city: 'Lahore, Punjab' },
  { name: 'Army Medical College', slug: 'amc', logo: '/mcj-jhelum-logo.jpg', city: 'Rawalpindi, Punjab' },
  { name: 'Aga Khan University', slug: 'aku', logo: '/kohat-logo.jpg', city: 'Karachi, Sindh' },
  { name: 'SZABMU Islamabad', slug: 'szabmu', logo: '/petaro-logo.png', city: 'Islamabad, Capital' },
  { name: 'Khyber Medical University', slug: 'kmu', logo: '/burnhall-logo.webp', city: 'Peshawar, KPK' },
  { name: 'King Edward Medical Univ', slug: 'kemu', logo: '/larkana-logo-new.jpg', city: 'Lahore, Punjab' },
  { name: 'Nishtar Medical Univ', slug: 'nishtar', logo: '/swat-logo.webp', city: 'Multan, Punjab' },
  { name: 'Allama Iqbal Med College', slug: 'aimc', logo: '/mardan-logo.png', city: 'Lahore, Punjab' },
  { name: 'Bolan Medical College', slug: 'bmc', logo: '/sanghar-logo.webp', city: 'Quetta, Balochistan' },
  { name: 'LUMHS Jamshoro', slug: 'lumhs', logo: '/wana-logo.png', city: 'Jamshoro, Sindh' },
  { name: 'DUHS Karachi', slug: 'duhs', logo: '/paf-lower-topa-logo.png', city: 'Karachi, Sindh' },
] as const;

/** Universities that have their own dedicated page (the rest link to WhatsApp). */
export const COLLEGES_WITH_PAGES: ReadonlySet<string> = new Set([
  "nums",
  "uhs",
  "amc",
  "aku",
]);
