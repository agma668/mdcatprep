// audit-routes.mjs — the P0 crawl-foundation check, run against a live server.
//
// For every URL the sitemap submits: is it 200, unique, absolute, self-canonical and indexable?
// And separately: do the private/utility routes that must not be indexed actually ship noindex?
//
// Uses fetch rather than one curl process per URL: a dev server compiling large pages drops rapid
// shell connections, and a dropped connection would read as a broken route.
//
// usage: node scripts/audit-routes.mjs [base]     (default http://localhost:3111)

const BASE = (process.argv[2] || 'http://localhost:3111').replace(/\/$/, '');

const unescape = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");

async function get(url, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(120_000) });
      return { status: res.status, html: await res.text() };
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  return { status: 0, html: '', error: String(lastErr).slice(0, 80) };
}

const sitemapRes = await get(`${BASE}/sitemap.xml`);
const sitemapUrls = [...sitemapRes.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => unescape(m[1]).trim());
const canonicalHost = (sitemapUrls[0] || '').replace(/^(https?:\/\/[^/]+).*$/, '$1');
const paths = sitemapUrls.map((u) => u.replace(/^https?:\/\/[^/]+/, ''));

console.log(`sitemap URLs: ${paths.length}  canonical host in sitemap: ${canonicalHost}`);

const seenTitles = new Map();
const problems = [];
const noDescription = [];

for (const path of paths) {
  const { status, html, error } = await get(`${BASE}${path}`);
  if (status === 0) {
    problems.push(`NO RESPONSE  ${path}${error ? ` (${error})` : ''}`);
    continue;
  }
  const title = unescape((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').trim();
  const canonical = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || [])[1] || '';
  const robots = unescape((html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i) || [])[1] || '');
  const description = unescape((html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [])[1] || '');

  seenTitles.set(title, (seenTitles.get(title) || 0) + 1);

  if (status !== 200) problems.push(`STATUS ${status}  ${path}`);
  if (!canonical) problems.push(`NO CANONICAL  ${path}`);
  else {
    const norm = (u) => u.replace(/\/$/, '');
    if (norm(canonical) !== norm(canonicalHost + path)) problems.push(`CANONICAL MISMATCH  ${path} -> ${canonical}`);
  }
  if (/noindex/i.test(robots)) problems.push(`NOINDEX BUT IN SITEMAP  ${path}`);
  if (!title) problems.push(`NO TITLE  ${path}`);
  if (!description) noDescription.push(path);
  if (/mdcatprep-eight/.test(html)) problems.push(`STALE HOST IN HTML  ${path}`);
}

for (const [title, n] of seenTitles) {
  if (n > 1 && title) problems.push(`DUPLICATE TITLE x${n}  "${title.slice(0, 70)}"`);
}

// Must-not-be-indexed surfaces: auth, account state, admin and student-private app routes.
// The per-exam practice pages (/nust/practice, /usat/practice, /pma/practice) are deliberately NOT
// here: they are public practice surfaces, and classifying them as private was this audit's own bug.
const PRIVATE = [
  '/login', '/signup', '/pending', '/rejected', '/suspended', '/forgot-password',
  '/reset-password', '/account-deleted', '/admin', '/dashboard', '/dashboard/practice',
  '/practice/session', '/offline-practice',
];
const privateReport = [];
for (const p of PRIVATE) {
  const { status, html } = await get(`${BASE}${p}`);
  const robots = (html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i) || [])[1] || '';
  const inSitemap = paths.includes(p);
  privateReport.push({ p, status, robots, inSitemap });
  if (inSitemap) problems.push(`PRIVATE ROUTE IN SITEMAP  ${p}`);
  if (status === 200 && !/noindex/i.test(robots)) problems.push(`PRIVATE ROUTE INDEXABLE  ${p} (robots "${robots || 'none'}")`);
}

console.log('\n--- must-not-index report ---');
for (const r of privateReport) console.log(`${String(r.status).padEnd(3)} ${r.p}  robots="${r.robots}"`);

if (noDescription.length) {
  console.log(`\n--- sitemap URLs with no meta description (${noDescription.length}) ---`);
  for (const p of noDescription) console.log(`  ${p}`);
}

console.log('\n--- problems ---');
if (!problems.length) console.log('none');
else for (const p of problems) console.log(p);
console.log(`\nchecked ${paths.length} sitemap URLs + ${PRIVATE.length} private routes | problems: ${problems.length}`);
