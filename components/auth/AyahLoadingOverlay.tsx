"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Auth loading veil. While the sign-in / sign-up request is in flight the
 * student sees one ayah — picked at random per appearance — instead of a
 * bare spinner. The selection is made once per mount (not on a timer): a
 * load lasts a couple of seconds, and swapping Quran text mid-read is
 * worse than showing one verse well.
 *
 * The veil never traps the student: the ✕ button, a click on the backdrop
 * or the Escape key all dismiss it. Dismissing hides only the veil — the
 * request keeps running, and the form underneath still receives its
 * outcome (an error shows there; a success navigates). Dismissal is a
 * courtesy, not a cancellation.
 *
 * Twenty verses, chosen around what a student feels at this exact moment:
 * calling on Allah (the founder-requested anchor 40:60 and its companion
 * 2:186), knowledge (20:114, 39:9, 58:11), perseverance (94:6, 2:286,
 * 3:139, 2:153, 29:69), trust (65:2-3, 3:173), hope (39:53, 93:5),
 * remembrance (2:152, 13:28), light (24:35, Ayat al-Kursi 2:255), and
 * Musa's dua before his great task (20:25-26). The founder reviews the
 * wording before launch.
 *
 * Typography: Amiri — a face cut for Quran typesetting — self-hosted via
 * next/font (see app/layout.tsx), with platform Naskh fallbacks through
 * the --font-quran token. No third-party origin is touched.
 *
 * Entrance animations (ayah-veil-in / ayah-card-in in globals.css) are
 * covered by the global prefers-reduced-motion rule: they collapse to
 * their finished state, so the overlay still appears, instantly.
 */

const AYAHS: ReadonlyArray<{
  arabic: string;
  translation: string;
  reference: string;
}> = [
  // ── Calling on Allah ──────────────────────────────────────────────────────
  {
    arabic: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    translation: "Call upon Me; I will respond to you.",
    reference: "Surah Ghāfir · 40:60",
  },
  {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    translation: "And when My servants ask you concerning Me — indeed I am near.",
    reference: "Surah Al-Baqarah · 2:186",
  },
  // ── Knowledge ─────────────────────────────────────────────────────────────
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translation: "And say: My Lord, increase me in knowledge.",
    reference: "Surah Ṭāhā · 20:114",
  },
  {
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    translation: "My Lord, expand for me my chest and ease for me my task.",
    reference: "Surah Ṭāhā · 20:25–26",
  },
  {
    arabic: "قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ",
    translation: "Say: Are those who know equal to those who do not know?",
    reference: "Surah Az-Zumar · 39:9",
  },
  {
    arabic: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ",
    translation: "Allah will raise in rank those of you who believe and those given knowledge.",
    reference: "Surah Al-Mujādila · 58:11",
  },
  // ── Perseverance ──────────────────────────────────────────────────────────
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    reference: "Surah Ash-Sharḥ · 94:6",
  },
  {
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond what it can bear.",
    reference: "Surah Al-Baqarah · 2:286",
  },
  {
    arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    translation: "So do not weaken and do not grieve, and you will be superior if you are believers.",
    reference: "Surah Āl ʿImrān · 3:139",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Indeed, Allah is with the patient.",
    reference: "Surah Al-Baqarah · 2:153",
  },
  {
    arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    translation: "But those who strive for Us — We will surely guide them to Our ways.",
    reference: "Surah Al-ʿAnkabūt · 29:69",
  },
  // ── Trust ─────────────────────────────────────────────────────────────────
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    translation: "And whoever is mindful of Allah — He will make a way out for him.",
    reference: "Surah Aṭ-Ṭalāq · 65:2",
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "And whoever places their trust in Allah, He is sufficient for them.",
    reference: "Surah Aṭ-Ṭalāq · 65:3",
  },
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    translation: "Sufficient for us is Allah, and He is the best Disposer of affairs.",
    reference: "Surah Āl ʿImrān · 3:173",
  },
  // ── Hope ──────────────────────────────────────────────────────────────────
  {
    arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    translation: "Do not despair of the mercy of Allah.",
    reference: "Surah Az-Zumar · 39:53",
  },
  {
    arabic: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى",
    translation: "And your Lord will give you, and you will be satisfied.",
    reference: "Surah Aḍ-Ḍuḥā · 93:5",
  },
  // ── Remembrance & light ───────────────────────────────────────────────────
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translation: "So remember Me; I will remember you.",
    reference: "Surah Al-Baqarah · 2:152",
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Verily, in the remembrance of Allah do hearts find rest.",
    reference: "Surah Ar-Raʿd · 13:28",
  },
  {
    arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    translation: "Allah is the Light of the heavens and the earth.",
    reference: "Surah An-Nūr · 24:35",
  },
  {
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of all existence.",
    reference: "Surah Al-Baqarah · 2:255",
  },
];

// Module-level memory of the previous pick, so two attempts in a row (a
// wrong password, then a retry) never show the same verse twice.
let lastAyahIndex = -1;

function pickAyah() {
  let index = Math.floor(Math.random() * AYAHS.length);
  if (index === lastAyahIndex) index = (index + 1) % AYAHS.length;
  lastAyahIndex = index;
  return AYAHS[index];
}

export function AyahLoadingOverlay({ label = "Loading" }: { label?: string }) {
  const [ayah] = useState(pickAyah);
  const [dismissed, setDismissed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes the veil, exactly like clicking outside or the ✕.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDismissed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The veil is modal while visible: freeze the page behind it, park focus
  // on the close button, and put both back when it goes (dismissed or done).
  useEffect(() => {
    if (dismissed) return;
    const prevOverflow = document.body.style.overflow;
    const prevActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${label} — ${ayah.translation} (${ayah.reference})`}
      onClick={() => setDismissed(true)}
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-[ayah-veil-in_240ms_ease-out_both] bg-[rgba(9,15,27,0.9)] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--line-2)] bg-[var(--srf-2)] px-7 pb-9 pt-12 text-center shadow-[var(--shadow-xl)] sm:px-10 animate-[ayah-card-in_340ms_var(--ease-out-quart)_both]"
      >
        {/* Dismiss — a courtesy, not a cancellation: the request continues
            underneath and the form still shows its outcome. */}
        <button
          ref={closeRef}
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close and continue"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[var(--steel-400)] transition-colors hover:bg-white/[0.06] hover:text-[var(--steel-200)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* The ayah, set in Amiri between the ornamental Quranic brackets,
            with the reference line keeping the insignia register. */}
        <p
          dir="rtl"
          lang="ar"
          className="text-[1.9rem] leading-[2] text-[var(--steel-100)] sm:text-[2.5rem]"
          style={{ fontFamily: "var(--font-quran)" }}
        >
          <span aria-hidden="true" className="text-[var(--brass)]">﴿</span>
          {ayah.arabic}
          <span aria-hidden="true" className="text-[var(--brass)]">﴾</span>
        </p>

        {/* Brass insignia divider — the same hairline-and-medal register as
            the crest panel, kept to the two brass tokens the design system
            reserves for insignia. */}
        <div className="mt-6 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-16 bg-[var(--line-brass)]" />
          <span className="block h-1.5 w-1.5 rotate-45 bg-[var(--brass)]" />
          <span className="h-px w-16 bg-[var(--line-brass)]" />
        </div>

        <p className="mt-6 text-[15px] italic leading-relaxed text-[var(--steel-300)]">
          “{ayah.translation}”
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--steel-400)]">
          {ayah.reference}
        </p>

        <div className="mt-8 flex items-center justify-center gap-2.5 text-[var(--steel-400)]">
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--line-3)] border-t-[var(--signal-300)]"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
