// Verifies that every @/ import of a COMMITTED page resolves inside the
// COMMITTED tree (catches the "works locally, fails on Vercel" class of bug
// that froze production since Sept 12).
//
//   node scripts/verify-committed-imports.mjs
import { execSync } from "node:child_process";

const pages = [
  "app/notes/page.tsx",
  "app/notes/[subject]/page.tsx",
  "app/dashboard/notes/master-reader/page.tsx",
  "app/topicals/page.tsx",
  "app/page.tsx",
];
let bad = 0;

const show = (p) => {
  try { return execSync(`git show HEAD:${JSON.stringify(p)}`, { stdio: ["pipe", "pipe", "pipe"] }).toString(); }
  catch { return null; }
};

for (const pg of pages) {
  const src = show(pg);
  if (src === null) { console.log("NOT COMMITTED:", pg); bad++; continue; }
  const imports = [...src.matchAll(/from "@\/([^"]+)"/g)].map((m) => m[1]);
  for (const imp of new Set(imports)) {
    let mod = null, modPath = null;
    for (const cand of [`lib/${imp}.ts`, `lib/${imp}.tsx`, `components/${imp}.tsx`, `${imp}.ts`, `${imp}.tsx`]) {
      mod = show(cand);
      if (mod !== null) { modPath = cand; break; }
    }
    if (mod === null) { console.log(`MODULE NOT IN COMMIT: @/${imp}  (imported by ${pg})`); bad++; continue; }
    const exps = new Set([...mod.matchAll(/export (?:const|function|type|interface|async function) ([A-Za-z0-9_]+)/g)].map((m) => m[1]));
    const used = [...src.matchAll(new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*"@/${imp.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g"))];
    for (const u of used) {
      for (const name of u[1].split(",").map((s) => s.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]).filter(Boolean)) {
        if (!exps.has(name)) { console.log(`MISSING EXPORT: ${name} from @/${imp} (used in ${pg})`); bad++; }
      }
    }
  }
}
console.log(bad === 0 ? "OK — all committed imports resolve within the committed tree" : `PROBLEMS: ${bad}`);
process.exit(bad === 0 ? 0 : 1);
