// Regenerates knowledge-base/INDEX.md (file + size listing). Run any time the KB changes.
import fs from 'node:fs';
import path from 'node:path';

const KB = 'knowledge-base';
function walk(d, o = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, o);
    else o.push(p);
  }
  return o;
}
const files = walk(KB).filter(p => !p.endsWith('README.md') && !p.endsWith('INDEX.md'));
const lines = [
  '# Knowledge Base — full index',
  '',
  'Machine-generated index of every file. See README.md for structure and provenance.',
  '',
  '| File | Size |',
  '| --- | --- |',
];
for (const p of files.sort()) {
  const rel = path.relative(KB, p).split(path.sep).join('/');
  lines.push(`| ${rel} | ${Math.round(fs.statSync(p).size / 102.4) / 10} KB |`);
}
fs.writeFileSync(path.join(KB, 'INDEX.md'), lines.join('\n') + '\n');
console.log('INDEX.md written:', files.length, 'files listed');
