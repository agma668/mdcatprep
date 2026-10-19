"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/site";

const DISMISS_KEY = "acma-cch-summer-camp-2026";

export function SummerCampNotification() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Decide after first paint (async) so the server-rendered hidden state
    // hydrates cleanly — the dialog only appears once the browser knows this
    // device hasn't dismissed it.
    if (typeof window === "undefined" || localStorage.getItem(DISMISS_KEY)) return;
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  const whatsappUrl = getWhatsAppLink(
    "AOA Sir! I attended the CCH Summer Camp 2026. Please guide me further."
  );

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="CCH Summer Camp 2026"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative w-full max-w-md bg-[#141414] rounded-[var(--radius-xl)] shadow-[0_24px_60px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-navy)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent-light)] animate-pulse" />
            <span className="text-sm font-bold text-white tracking-wide">Important Notice</span>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <h3 className="text-lg font-extrabold text-gray-900 mb-2">
            CCH Summer Camp 2026 🏕️
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            Did you attend the <strong>CCH Summer Camp 2026</strong>?
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            If yes, please send a message to <strong>MED Prep</strong> on WhatsApp so we can guide you further and connect you with the right resources.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--radius-md)] bg-[var(--whatsapp)] text-[var(--color-text-inverse)] font-bold text-sm hover:bg-[var(--whatsapp-deep)] transition-colors shadow-[0_4px_16px_rgba(37,211,102,0.35)]"
          >
            <MessageCircle className="w-4 h-4" />
            Send WhatsApp Message
          </a>

          <button
            onClick={dismiss}
            className="w-full mt-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            I&apos;ll do it later
          </button>
        </div>
      </div>
    </div>
  );
}
