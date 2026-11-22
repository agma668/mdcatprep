// audit-links.mjs — every internal link on the public pages must resolve.
//
// Crawls the public entry pages and the pages they link to, then checks each internal href: does the
// route return 200, does a protected route redirect somewhere real, and does an anchor exist on the
// page it points at? A "#how-it-works" is only valid on a page that has that id — which is why the
// shared footer's bare anchors were dead on every page except the homepage.
//
// usage: node scripts/audit-links.mjs [base]      (default http://localhost:3111)

const BASE = (process.argv[2] || 'http://localhost:3111').replace(/\/$/, '');

async function get(path, tries = 3) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(BASE + path, { redirect: 'manual', signal: AbortSignal.timeout(120_000) });
      const location = res.headers.get('location') || '';
      const html = res.status >= 300 && res.status < 400 ? '' : await res.text();
      return { status: res.status, location, html };
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  return { status: 0, location: '', html: '', error: String(last).slice(0, 60) };
}

const SEEDS = [
  '/', '/exams', '/topicals', '/past-papers', '/notes', '/flashcards', '/blog', '/resources',
  '/faq', '/pricing', '/diagnostic', '/daily-quiz', '/privacy', '/copyright',
  '/blog/mdcat-guide', '/past-papers/uhs-mdcat',
];

const hrefRe = /href="([^"]+)"/g;
const idRe = /\sid="([^"]+)"/g;

const pages = new Map(); // path -> html
const links = new Map(); // target -> Set(source)
const anchorRefs = []; // { from, target, id }

function collect(from, html) {
  pages.set(from, html);
  for (const m of html.matchAll(hrefRe)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|whatsapp:|data:|\/\/)/i.test(href)) continue;
    if (href.startsWith('/api/') || href.startsWith('/_next/')) continue;

    const [rawTarget, anchor] = href.split('#');
    if (!rawTarget) {
      // Same-page anchor: valid only if THIS page carries the id.
      if (anchor) anchorRefs.push({ from, target: from, id: anchor });
      continue;
    }
    const target = rawTarget;
    if (!links.has(target)) links.set(target, new Set());
    links.get(target).add(from);
    if (anchor) anchorRefs.push({ from, target, id: anchor });
  }
}

for (const seed of SEEDS) {
  const res = await get(seed);
  if (res.status === 200) collect(seed, res.html);
  else console.log(`SEED FAILED ${seed} -> ${res.status}`);
}

// One level deeper, so a broken link reachable only from another page is still found. This also gives
// us the HTML needed to validate cross-page anchors.
for (const t of [...links.keys()]) {
  if (pages.has(t)) continue;
  const res = await get(t);
  if (res.status === 200) collect(t, res.html);
}

const broken = [];
const redirected = [];
for (const [target, sources] of links) {
  if (pages.has(target)) continue;
  const res = await get(target);
  if (res.status === 200) continue;
  if (res.status >= 300 && res.status < 400) {
    redirected.push({ target, status: res.status, to: res.location, from: [...sources] });
  } else {
    broken.push({ target, status: res.status, from: [...sources].slice(0, 3) });
  }
}

const deadAnchors = [];
for (const ref of anchorRefs) {
  const html = pages.get(ref.target);
  if (html === undefined) continue; // target not reachable/crawled — already reported as a link problem
  const ids = new Set([...html.matchAll(idRe)].map((m) => m[1]));
  if (!ids.has(ref.id)) deadAnchors.push(ref);
}

// Collapse the anchor noise: the shared footer fires the same missing id from every page.
const anchorSummary = new Map();
for (const a of deadAnchors) {
  const key = `${a.target}#${a.id}`;
  const entry = anchorSummary.get(key) || { count: 0, from: [] };
  entry.count += 1;
  if (entry.from.length < 2) entry.from.push(a.from);
  anchorSummary.set(key, entry);
}

console.log(`pages crawled: ${pages.size} | distinct internal links: ${links.size}`);

console.log('\n--- broken links ---');
if (!broken.length) console.log('none');
for (const b of broken) console.log(`STATUS ${b.status}  ${b.target}  (linked from ${b.from.join(', ')})`);

console.log('\n--- links to redirects (works, but link the destination directly) ---');
if (!redirected.length) console.log('none');
for (const r of redirected) console.log(`${r.status}  ${r.target} -> ${r.to}  (from ${r.from.slice(0, 2).join(', ')})`);

console.log('\n--- anchors that do not exist where they point ---');
if (!anchorSummary.size) console.log('none');
for (const [key, v] of anchorSummary) console.log(`${key}  — referenced ${v.count}x, e.g. from ${v.from.join(', ')}`);

console.log(`\nproblems: ${broken.length + redirected.length + anchorSummary.size}`);
