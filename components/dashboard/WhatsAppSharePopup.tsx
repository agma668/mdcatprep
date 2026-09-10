"use client";

import { useState, useEffect } from "react";
import { getSiteUrl } from "@/lib/site";
import { useReferral } from "@/lib/use-referral";

const KEY = "acma-share-popup";
const REPEAT_INTERVAL =
  (Number(process.env.NEXT_PUBLIC_SHARE_POPUP_INTERVAL_DAYS) || 14) *
  24 * 60 * 60 * 1000;
const HEADLINES = [
  "Help a Friend Get In \ud83c\udf93",
  "Your Friends Need This Too \ud83d\udc65",
  "Grow the Community \ud83c\udf31",
  "Spread the Word \ud83d\udce2",
];

interface Props {
  questionsAnswered: number;
  streak: number;
  accuracy: number;
}

export function WhatsAppSharePopup({ questionsAnswered, streak, accuracy }: Props) {
  const [show, setShow] = useState(false);
  const [shared, setShared] = useState(false);
  const { link: referralUrl, joinedCount } = useReferral();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastShown = localStorage.getItem(KEY);
    if (lastShown && Date.now() - Number(lastShown) < REPEAT_INTERVAL) return;
    setShow(true);
  }, []);

  // Auto-dismiss thank-you after 2.5 seconds
  useEffect(() => {
    if (!shared) return;
    const id = setTimeout(() => {
      localStorage.setItem(KEY, Date.now().toString());
      setShow(false);
    }, 2500);
    return () => clearTimeout(id);
  }, [shared]);

  if (!show) return null;

  // Rotate headline based on last-shown timestamp
  const lastShown = typeof window !== "undefined"
    ? Number(localStorage.getItem(KEY) || "0")
    : 0;
  const headline = HEADLINES[Math.floor(lastShown / REPEAT_INTERVAL) % HEADLINES.length];

  const dismiss = () => {
    localStorage.setItem(KEY, Date.now().toString());
    setShow(false);
  };

  const onShare = () => {
    const count = Number(localStorage.getItem("acma-share-count") || "0");
    localStorage.setItem("acma-share-count", String(count + 1));
    setShared(true);
  };

  // Thank-you state
  if (shared) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Share with friends">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-sm bg-[#141414] rounded-[var(--radius-xl)] p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
          <p className="text-2xl mb-2">🎉</p>
          <h3 className="text-lg font-bold text-white mb-1">Thanks for sharing!</h3>
          <p className="text-sm text-white/50">
            {joinedCount > 0
              ? `${joinedCount} student${joinedCount !== 1 ? "s have" : " has"} now joined through shares like this`
              : "You\'re helping fellow students prepare for their dream college."}
          </p>
        </div>
      </div>
    );
  }

  // Share state
  const url = referralUrl || getSiteUrl();
  const statsLine =
    questionsAnswered > 0
      ? `I've answered ${questionsAnswered.toLocaleString()} questions${accuracy > 0 ? ` with ${accuracy}% accuracy` : ""}${streak > 0 ? ` and am on a ${streak}-day streak` : ""} — join me!\n\n`
      : "";
  const socialProofLine =
    joinedCount > 0
      ? `${joinedCount} student${joinedCount !== 1 ? "s have" : " has"} already joined\n\n`
      : "";
  const msg =
    `🎓 I'm using Cadet College Prep to prepare for my entry test — and it's completely free!\n\n` +
    statsLine +
    socialProofLine +
    `Share it with 5 friends preparing for CCH, PAF Sargodha, MCJ, or any cadet college:\n\n` +
    `${url}\n\n` +
    `100% free. Help more students succeed! 🇵🇰`;
  const href = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Share with friends">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative w-full max-w-sm bg-[#141414] rounded-[var(--radius-xl)] p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.3)]">
        <h3 className="text-lg font-bold text-white mb-2">{headline}</h3>
        <p className="text-sm text-white/55 mb-2">
          Share this free prep platform with <strong className="text-white/80">5 contacts</strong> on WhatsApp — you could help someone get into their dream cadet college.
        </p>
        {joinedCount > 0 && (
          <p className="text-xs text-white/35 mb-6">
            {joinedCount} student{joinedCount !== 1 ? "s have" : " has"} already joined through shares like this
          </p>
        )}

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onShare}
          className="block w-full py-3 rounded-[var(--radius-md)] bg-[var(--whatsapp)] text-[var(--color-text-inverse)] font-bold text-sm hover:bg-[var(--whatsapp-deep)] transition-colors"        >
          Share on WhatsApp
        </a>
        <p className="text-[10px] text-white/25 mt-1.5">Works best on mobile</p>

        <button
          onClick={dismiss}
          className="block w-full mt-2 py-2.5 text-sm font-medium text-white/35 hover:text-white/60 transition-colors cursor-pointer"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
