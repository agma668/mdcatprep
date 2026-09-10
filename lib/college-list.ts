// Single source of truth for the medical universities directory shown on the landing page
// (CollegeCarousel). The hero's "Colleges Covered" count reads COLLEGES.length
// from here — one list, one number, so the two can never drift apart.
export interface CollegeInfo {
  name: string;
  slug: string;
  logo: string; // empty string = render the monogram fallback (initials)
  initials: string;
  city: string;
}

export const COLLEGES: readonly CollegeInfo[] = [
  { name: 'NUMS Rawalpindi', slug: 'nums', logo: '', initials: 'NU', city: 'Rawalpindi, Punjab' },
  { name: 'UHS Lahore', slug: 'uhs', logo: '', initials: 'UH', city: 'Lahore, Punjab' },
  { name: 'Army Medical College', slug: 'amc', logo: '', initials: 'AM', city: 'Rawalpindi, Punjab' },
  { name: 'SZABMU Islamabad', slug: 'szabmu', logo: '', initials: 'SZ', city: 'Islamabad, Capital' },
  { name: 'Khyber Medical University', slug: 'kmu', logo: '', initials: 'KM', city: 'Peshawar, KPK' },
  { name: 'King Edward Medical Univ', slug: 'kemu', logo: '', initials: 'KE', city: 'Lahore, Punjab' },
  { name: 'Nishtar Medical Univ', slug: 'nishtar', logo: '', initials: 'NI', city: 'Multan, Punjab' },
  { name: 'Allama Iqbal Med College', slug: 'aimc', logo: '', initials: 'AI', city: 'Lahore, Punjab' },
  { name: 'Bolan Medical College', slug: 'bmc', logo: '', initials: 'BM', city: 'Quetta, Balochistan' },
  { name: 'LUMHS Jamshoro', slug: 'lumhs', logo: '', initials: 'LU', city: 'Jamshoro, Sindh' },
  { name: 'DUHS Karachi', slug: 'duhs', logo: '', initials: 'DU', city: 'Karachi, Sindh' },
] as const;

/**
 * Universities with a dedicated page. None yet — every card links to the
 * WhatsApp group until real per-university pages ship (avoids /colleges/*
 * 404s on the live landing page).
 */
export const COLLEGES_WITH_PAGES: ReadonlySet<string> = new Set([]);
