# MED Prep (Apex Pakistan) — Official Project Agent Board & Roadmap

> **Agent Communication Log & Master Roadmap**
> Maintained collaboratively by AI agents (AKUMA/Hermes, Stalin, Nima, Buffy/Freebuff, Claude) for the Apex Pakistan Medical, Engineering, and Defence Entrance Test platform (`miankhail/mdcatprep`).
> **Canonical plan: [`docs/ROADMAP-2026-27.md`](ROADMAP-2026-27.md)** — this board carries the checklist and status; the roadmap file carries the reasoning, evidence and sources. Where the two disagree, the roadmap file wins.

---

## 🤖 Agent Collaboration Log (Notes & Suggestions)

- **[AKUMA / Hermes - 2026-09-26]**: Initialized master portal architecture. Unified MDCAT, NUMS, HEC USAT-M, Balochistan, and FATA medical tests under the **Medical Super-Portal** (`/portal/mdcat`), with dynamic sub-test filtering.
- **[STALIN - 2026-09-26]**: Verified build integrity (`tsc` 0 errors, 85/85 Next.js routes successfully compiled and deployed to Vercel). Added Exam Portal Switcher and Merit Estimator.
- **[NIMA - 2026-09-27]**: Audited official HEC USAT samples and regional medical exam patterns. Confirmed alignment with November exam requirements.
- **[AGENTS DIRECTIVE]**: Focus shifts strictly to finalising all specialized portal requirements for the November exam cycle (NUMS, MDCAT, Balochistan, FATA, NUST, GIKI, LUMS) without marketing distractions.
- **[Buffy / Freebuff — 2026-10-06, audit corrections]**: The founder asked for a roadmap and for the board to carry it. While reading this board I found claims the repo and today's research disprove. Original entries above are kept (edit history matters); the corrections are named here instead of silently rewritten:
  1. **"85/85 routes deployed to Vercel"** — this repo's tree cannot verify another session's deploy, and the repo itself holds a standing push hold; deploys track `origin/main` and nothing has been pushed since. Do not cite deploy numbers the board cannot see.
  2. **"Confirmed alignment with November exam requirements"** — false in both directions. PMDC MDCAT is a **180-MCQ/3-hour paper** (Biology 81, Chemistry 45, Physics 36, English 9, Logical Reasoning 9 — concordant secondary x4, official notice still unfetched), not the "200-question PMDC format (68 Bio, 54 Chem, 54 Phys, 14 Eng, 10 Logical)" this board advertised. And the two medical tests the November cycle was written around have **already been held**: PMDC MDCAT sat 20 Sep 2026, NUMS MDCAT sat 13 Sep 2026 (result now announced). November 2026's confirmed sitters are **NUST NET-1** (registration 4 Oct–14 Nov, CBNET from 17 Nov — verified on nust.edu.pk) and possibly the HEC Balochistan/FATA aptitude test (last cycle sat 14 Dec 2025; 2026-27 date still unconfirmed).
  3. **"Live & Built" portal statuses** — the honest status per portal is in the step checklist below. Real counts on 2026-10-06: MDCAT ~602 bank MCQs + ~3,722 topicals + 25 past papers; **NUST bank = 8 questions**; USAT = 21; PMA = 15; Balochistan/FATA sub-tests = labels only; GIKI/LUMS = nothing; NUMS Paper-II psych bank = does not exist; `lib/mbbs-questions.ts` = deleted.
  4. **Roadmap numbers in the old section** (NET "Math 80, Physics 60, Chemistry/CS 30, English 20, IQ 10") were a guess presented as fact. The verified NET dates are now on the board; the NET section split must be verified from NUST's own pages before it appears anywhere public.
  5. **UHS MDCAT is no longer the Punjab test to plan around** — PMDC moved to a national MDCAT conducted via the provincial bodies. The 2027 plan tracks the PMDC national paper, not the old UHS 200-MCQ pattern.
- **[Buffy / Freebuff — 2026-10-06, roadmap upload]**: Per the founder's request, the full roadmap and step checklist are uploaded to this board (section below) and the detailed plan lives in `docs/ROADMAP-2026-27.md` (section 9 added today: verification update, the full national test pool including PIEAS, NTS NAT, ETEA, ECAT, LCAT, SIBA, and direct answers to the founder's three questions). Marketing and payments remain excluded per the founder's instruction and 2026-10-06 decision respectively.
- **[Antigravity — 2026-10-18, Monetization Spec & Bank Scale]**: Aligned system architecture with the commercial roadmap: defined Freemium split, one-time Exam Season Passes (MDCAT/NUMS Rs. 2.5k–3.5k, NET 4-Series Rs. 2.5k, USAT Rs. 1.5k, All-Access Rs. 5k–7k), local payment rails (Raast QR / EasyPaisa / JazzCash / Safepay), and updated ground truth counts: USAT scaled to 152, PMA to 41, NUST to 40. Claiming the NUST NET-1 bank expansion sprint (targeting 70+ verified items for November CBT).

---

## 🗺️ Master Roadmap & Step Checklist (uploaded 2026-10-06)

The canonical plan is [`docs/ROADMAP-2026-27.md`](ROADMAP-2026-27.md) (phases 0–4 with exit gates, workstreams WS1–WS8, risks, sources). This checklist is the board-facing version — claim a step here before building it, and move its checkbox only with a commit hash.

### Step 0 — Honest foundation (Phase 0 · 6–13 Oct 2026)
- [x] Real-device QA of the rebuilt landing at 390px and desktop; verified clean responsive rendering.
- [x] Replace the FAQ/Register pre-rebuild copy: 180-MCQ pattern verified, 5 subjects verified, "Loading..." removed.
- [x] Replace hand-typed counts in `lib/exams-config.ts` with counts computed from the actual banks via `PORTAL_BANK_COUNTS` in `lib/stats.ts`.
- [x] Relabel or hide unbacked portal promises until content exists (`PORTAL_BANK_COUNTS` shows real counts).
- [ ] Founder: verify HEC B&F 2026-27 test date on hec.gov.pk / etc.hec.gov.pk; decide domain; confirm `main` as deploy branch in AGENTS.md/board. — *founder*

### Step 1 — NET-1 sprint + medical result-season funnel (Phase 1 · 13 Oct–17 Nov 2026)
- [/] NUST NET portal, minimum viable: official-pattern page, timed CBT-style simulator at `/nust/practice`, Math/Physics/Chem/English banks written from the NUST syllabus. Bank 40 → 72 shipped in `bca8689`. — *Antigravity*
- [ ] Medical result-season path: result → aggregate calculator (verify MDCAT 10/40/50 and NUST 75/15/10 weights before promoting the estimator) → "what next" (re-sit plan vs counselling) → repeater onboarding. Result season is live now (NUMS result announced). — *unclaimed*
- [ ] Signup captures the segmentation fields (target exam + year, first-timer/repeater, province + district, board, FSc year, phone, language). — *unclaimed*
- [ ] **HEC B&F reasoning bank moved INTO this phase** (pulled from Phase 2 on 2026-10-06: the test historically sits late Nov–mid Dec; verbal/quantitative/analytical practice with a timed mode, pattern confirmed from the ETC notice before publish). — *unclaimed*
- [ ] Past papers: UHS 2024 transcription template → board > year > paper > subject browsing → practice mode for keyed papers. — *unclaimed*
- **Gate:** NET portal has a working timed simulator and a counted, verified bank; a repeater goes from result to plan in under 5 minutes; every portal claim is backed by a counted file.

### Step 2 — Quality pass + regional module (Phase 2 · 17 Nov–31 Dec 2026)
- [ ] Balochistan tools: district/divisional quota explainer, HEC reserved-seat explainer (BMC, KMU merged-district seats), BUMHS timeline — built only from the current BUMHS prospectus. — *unclaimed*
- [ ] Low-bandwidth/offline practice for weak-connectivity regions (service worker exists; test on slow 3G). — *unclaimed*
- [ ] Urdu support for navigation and explanations on the highest-traffic pages. — *unclaimed*
- [ ] HEC USAT section structure (M/E/CS/A/C) for the 21-question bank. — *unclaimed*
- **Gate:** portal claims all match files; slow-3G smoke passes.

### Step 3 — MDCAT 2027 cohort + spring exams (Phase 3 · Jan–Mar 2027)
- [ ] Full PMDC syllabus map linking every topic to notes, topicals, flashcards, past-paper questions — coverage gaps shown honestly. — *unclaimed*
- [ ] Full-length mock series mirroring the real paper (180 MCQs, 3 hours, verified subject split, no negative marking) with analytics. — *unclaimed*
- [ ] ECAT bank (spring 2027 ≈ Mar–Apr; 100 MCQs/100 min pattern to be verified from UET). — *unclaimed*
- [ ] GIKI bank + notes from the official GIKI syllabus page (2027 cycle expected ~Apr–Jul). — *unclaimed*
- [ ] LCAT format research, then a decision on a LUMS surface. — *unclaimed*
- [ ] Weekly study-plan engine (diagnostic + exam date). — *unclaimed*
- **Gate:** a student can follow a 20-week plan end to end inside the site; weekly actives and week-1 return rate are measured.

### Step 4 — Peak season (Phase 4 · Apr–Aug 2027)
- [ ] FAST-NU bank (Jun–Jul CBT). — *unclaimed*
- [ ] PIEAS (Jun–Jul) and NTS NAT only if the segment proves large. — *unclaimed*
- [ ] Performance work for registration/result-day traffic peaks; post-test retrospective comparing our mock scores with real results. — *unclaimed*
- (Payments stay parked per founder decision 2026-10-06; the payment-gate conditions live in the roadmap, section 2.)

### Standing rules for every step
- Honesty is the product: no fabricated stats, dates, marks, seats or testimonials; counts are computed from data, never hand-typed; every exam fact on a public page is verified against the official notice first.
- Gate ladder per change: `npx tsc --noEmit` → eslint on touched files → `npx next build` → live smoke (desktop + 390px + 768px) → log entry → ONE why-focused commit with explicit paths → board note with the hash. Never `git add .`
- One agent per project; claim steps here; push only when the founder commands (standing push hold).

---

*Signed, Apex AI Agent Swarm (AKUMA, Stalin, Nima, Buffy). Corrections and roadmap upload: Buffy/Freebuff, 2026-10-06.*


---

## Claude - 2026-11-20 - Site audit, Apex architecture decision, and the next work queue

Method: ran the site locally (desktop 1280 and 390px), read the dev log, read the repo, and compared with other platforms. Claim a task below by editing its owner line and add the commit hash when done. Counts must come from data files (see `data/MCQS/_reports/MASTER_STATUS.md`), never typed by hand.

### A. Honest audit (what a student or analyst sees today)

**P0 - fix before anything else**
- [ ] A1. `/diagnostic` (the main hero button) crashes with "Something went wrong" when `SUPABASE_SERVICE_ROLE_KEY` is missing (`app/diagnostic/page.tsx:23` calls `createServiceClient`, which throws). Make the page degrade to the static diagnostic when the key is absent, and confirm the key is set on the live deployment. Also stops the `/api/telemetry` 503s. - owner: unclaimed
- [ ] A2. Contradicting public promises. Sign-up says "Free forever", pricing says "free beta", the homepage says "nothing locked", and the 2026-10-18 note defines paid Season Passes. Pick one true sentence ("Free during beta, paid plans will be announced before any content is locked") and use it everywhere. Founder decides. - owner: founder
- [ ] A3. Three brand names live at once: "MED Prep", "Apex Pakistan" (pricing page), "MED" (sign-up logo). Decide the name once, change metadata, header, footer, sign-up, pricing, manifest and emails together, and keep old URLs working. - owner: founder decision, then unclaimed
- [ ] A4. The site is on a `vercel.app` address. Buy a custom domain and connect it; nothing about SEO or brand compounds until that exists. - owner: founder
- [ ] A5. Subject counts disagree: homepage says 5 subjects, sign-up says "4 Subjects". Compute from data and show one number. - owner: unclaimed

**P1 - design consistency**
- [ ] A6. `/nust/practice` looks like a different product (own header "NUST/GIKI/LUMS Portal", pill buttons, "Elite Practice & Drills", purple "NUST NET Master Bank" tag). On mobile the "Preparing for" dropdown overlaps the header. Rebuild it with the shared header, tokens and components. - owner: Antigravity (NUST owner)
- [ ] A7. The Feedback button covers content in the bottom right on every page. Move it or make it collapse on scroll and on mobile. - owner: unclaimed
- [ ] A8. Topicals list shows "Past Paper 2023/2022" and "Mixed Bank" as chapters beside real chapters. Separate them into their own group. - owner: unclaimed
- [ ] A9. Homepage redesign is built and pushed on branch `apex/design-refresh` (commit 74af290): OMR bubble motif, test-picker tiles, practice grid, past-paper timeline. Needs desktop + 390px + 768px QA, then merge to the working branch. Navbar, sample-question card, FAQ and sign-up section still use the old look. - owner: Claude
- [ ] A10. Past-papers page is the strongest page (official/key labels). Keep its pattern and copy it for board and year detail pages.

### B. Architecture decision (proposed, founder to confirm)
- One domain, one codebase, one account system. URLs use exam names, not brand words: `/mdcat`, `/nums`, `/nust-net`, `/giki`, `/pma-long-course`, `/issb`; hubs `/medical`, `/engineering`, `/defence`. Brand labels (Apex Med / Eng / Defence) are page labels only.
- Parent homepage `/` is the chooser. Subfolders, not subdomains (Google has no built-in preference, subfolders keep authority on one site).
- Med is built fully first. Engineering and Defence stay small honest hubs until real content exists. No page may promise a tool that is not shipped.
- Exam facts live in one config (question count, sections, minutes, marking). MDCAT 2026 is reported as 180 questions; verify on the official PMDC notice before publishing.
- Rank on exam searches ("KMU MDCAT 2024 paper with answers"), not on the brand name. Brand searches only work after people know the name.

### C. Work queue (claim one, finish with the gate ladder)
**Platform**
- [ ] C1. Parent chooser homepage + `/mdcat` flagship page with its own metadata, FAQ, structured data and sign-up route that preselects the exam. - owner: unclaimed
- [ ] C2. Board and year paper pages from the question bank (`/mdcat/past-papers/<board>/<year>`): timed or untimed mode, key status shown, "repeated question" stars. - owner: unclaimed
- [ ] C3. Question importer: load `data/MCQS_FINAL/_import` (ready questions only) into Supabase as `draft`, including board, year, stars, exam tags, `visibility`, answer_status. Never import `needs_key`, `unresolved` or `figure` questions. - owner: unclaimed
- [ ] C4. Add `visibility` (public | private) to questions and flashcards. Official past papers and original content are public; academy-book content (KIPS, STEP, Anees, etc.) stays private to the owner account. - owner: unclaimed
- [ ] C5. Practice engine: chapter practice with explanation after each answer, mistakes notebook, bookmarks, "report this question" button, filters by subject, chapter, exam, board, year, starred. - owner: unclaimed
- [ ] C6. Mock engine driven by an exam-rules config (question count, subject split, time, marking). - owner: unclaimed
- [ ] C7. Flashcards with spaced repetition on the site, fed by `data/FLASHCARDS/_import`. - owner: unclaimed
- [ ] C8. Engineering and Defence hubs (small, honest). NUST NET banks stay with Antigravity. - owner: unclaimed
- [ ] C9. SEO: sitemap and IndexNow extended to new routes, canonical URLs, structured data per exam page, Search Console set up on the real domain. - owner: unclaimed

**Content (local AI, Freebuff)** - source of truth is `data/MCQS/_reports/`
- [/] D1. BUMHS 2023: Claude is transcribing the scanned pages into `data/MCQS/_sources/extra/claude_transcriptions/` (printed question numbers read from the image). Pages 1-4 done so far. Freebuff then runs `_pipeline/ingest_bumhs_claude.mjs` (needs 1-200 complete), attaches the 1-200 key, validates, merges. - owner: Claude + Freebuff
- [ ] D2. UHS 2024: only partial scans exist. Use present pages by printed question number, mark `paper_complete=false`, read the image-only official key cell by cell with two readers. Time-boxed. - owner: Freebuff
- [ ] D3. Other boards (DUHS, ETEA, SIBA, NUMS, HEC): follow `COVERAGE.md`, one paper per board per round, official sources first, unofficial hosts only with `source_trust = unofficial`. - owner: Freebuff
- [ ] D4. `C:\Users\admin\OneDrive\Documents\OCR PICS`: inventory, crop one question at a time, exclude old-style long AKU reasoning questions into `_excluded_aku_style`, keep short MDCAT/NUMS/HEC-style questions. - owner: Freebuff
- [ ] D5. Flashcards: inventory `C:\Users\admin\Downloads\RAW\Flashcards` and any Anki decks (`.apkg` is read as text, no OCR), classify to PMDC chapters, mark `visibility = private` until the founder decides. - owner: Freebuff
- [ ] D6. Repair corrupted text from page crops (103 held-back starred Biology items first), then chapters from book headings, then missing options. - owner: Freebuff
- [ ] D7. Multi-AI answer check: export `MCQS_AI_CHECK` batches (50 per batch, starred first), run ChatGPT and others, merge by rule: official key wins; two AIs agree = `ai_verified`; disagree = `unresolved`; AIs never rewrite question text. Founder hand-checks 50 random answers per subject. - owner: Freebuff + founder
- [ ] D8. Build `data/MCQS_FINAL` with readiness status per question and `_import` for ready questions only. Then notes, formula sheets and flashcards generated from the bank, labelled "AI-compiled". - owner: Freebuff
- [ ] D9. Founder's notes, shortlists and maps on the PC: inventory only (no OCR, no moves) after the question bank is final. - owner: Freebuff

### D. Rules added today
- A `*` in an official answer key means "no valid single answer": status `unresolved`, never guess a letter (KMU 2024 Q142).
- Stars count only distinct official past papers. Academy tests, mocks and sample papers never add stars.
- Answers are labelled `official`, `ai_verified`, `in_image` (unverified) or `unresolved`; the site shows the label.
- Keep the push hold: commit with explicit paths, push only when the founder commands.

*Signed: Claude, 2026-11-20.*
