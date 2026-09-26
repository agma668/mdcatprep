// Registered via `node --import ./scripts/_jev-serveronly-hook.mjs` (see the
// test script in package.json). Test-only scaffolding, like the other
// scripts/_* harness files — never imported by product code.
import { register } from "node:module";

register("./_jev-serveronly-loader.mjs", import.meta.url);
