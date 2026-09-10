"use client";

// Shared navy/gold shareable-card body: canvas draw + Share (Web Share API
// with an image file) + Download PNG + honest status. One copy of the canvas
// logic and actions — used by the dashboard "Share your progress" section and
// the daily-quiz "Share today's result" control.
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";

export interface ShareCell {
  label: string;
  value: string;
  /** Accent (brass-gold) value — usually the headline stat. */
  accent?: boolean;
}

const W = 1080;
const H = 1350;

const NAVY_TOP = "#0d1628";
const NAVY_BOTTOM = "#070b16";
const BRASS = "#c9a24b";
const BRASS_BRIGHT = "#f2dc96";
const MUTED = "rgba(255,255,255,0.55)";
const WHITE = "#ffffff";

const FONT_BOLD = '700 72px "Inter", system-ui, sans-serif';
const FONT_LABEL = '600 30px "Inter", system-ui, sans-serif';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** One stat cell: muted label over a big value, on the card's grid. */
function drawStatCell(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string, value: string, valueColor: string) {
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, x, y, w, h, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(201,162,75,0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = MUTED;
  ctx.font = FONT_LABEL;
  ctx.fillText(label.toUpperCase(), x + w / 2, y + 78);
  ctx.fillStyle = valueColor;
  ctx.font = FONT_BOLD;
  ctx.fillText(value, x + w / 2, y + h / 2 + 52);
}

function drawShareCard(ctx: CanvasRenderingContext2D, opts: { title: string; name: string; cells: ShareCell[] }) {
  const { title, name, cells } = opts;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, NAVY_TOP);
  bg.addColorStop(1, NAVY_BOTTOM);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.26, 0, W / 2, H * 0.26, W * 0.72);
  glow.addColorStop(0, "rgba(201,162,75,0.13)");
  glow.addColorStop(1, "rgba(201,162,75,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 46, 46, W - 92, H - 92, 30);
  ctx.strokeStyle = BRASS;
  ctx.lineWidth = 5;
  ctx.stroke();
  roundRect(ctx, 62, 62, W - 124, H - 124, 22);
  ctx.strokeStyle = "rgba(201,162,75,0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = BRASS_BRIGHT;
  ctx.font = '600 34px "Inter", system-ui, sans-serif';
  ctx.fillText("CADET COLLEGE PREP", W / 2, 148);
  ctx.strokeStyle = "rgba(201,162,75,0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 130, 192);
  ctx.lineTo(W / 2 + 130, 192);
  ctx.stroke();
  ctx.fillStyle = WHITE;
  ctx.font = '800 64px "Inter", system-ui, sans-serif';
  ctx.fillText(title, W / 2, 276);
  ctx.fillStyle = BRASS_BRIGHT;
  ctx.font = '700 46px "Inter", system-ui, sans-serif';
  ctx.fillText(name, W / 2, 352);
  const gx = 140;
  const gw = W - 280;
  const cellW = (gw - 40) / 2;
  const y0 = 452;
  const cellH = 300;
  const gapY = 36;
  cells.slice(0, 4).forEach((cell, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    drawStatCell(
      ctx,
      gx + col * (cellW + 40),
      y0 + row * (cellH + gapY),
      cellW,
      cellH,
      cell.label,
      cell.value,
      cell.accent ? BRASS_BRIGHT : WHITE
    );
  });
  ctx.fillStyle = MUTED;
  ctx.font = '500 32px "Inter", system-ui, sans-serif';
  ctx.fillText("Practicing daily on medprep.pk", W / 2, H - 150);
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.font = '500 27px "Inter", system-ui, sans-serif';
  ctx.fillText(
    `Updated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
    W / 2,
    H - 104
  );
}

export function ProgressShareCardBody({
  title,
  name,
  cells,
  shareText,
  fileName = "med-prep-progress.png",
}: {
  title: string;
  name: string;
  cells: ShareCell[];
  shareText: string;
  fileName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<"idle" | "shared" | "downloaded" | "error">("idle");
  const [canShareFiles] = useState(() => {
    if (typeof navigator === "undefined" || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [new File(["probe"], "probe.png", { type: "image/png" })] });
    } catch {
      return false;
    }
  });

  // Draw whenever the (real) values change; stamp the exact numbers drawn so
  // the card can be verified against the database to the digit.
  const drawKey = JSON.stringify({ title, name, cells });
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawShareCard(ctx, { title, name, cells });
    canvas.setAttribute("data-stats", drawKey);
  }, [drawKey, title, name, cells]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus("error");
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatus("downloaded");
    }, "image/png");
  }, [fileName]);

  const share = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setStatus("error");
        return;
      }
      const file = new File([blob], fileName, { type: "image/png" });
      try {
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "MED Prep", text: shareText });
          setStatus("shared");
        } else {
          download();
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setStatus("error");
      }
    }, "image/png");
  }, [shareText, fileName, download]);

  return (
    <div className="flex w-full flex-col items-center">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        aria-label={`${title} card — ${name}`}
        className="h-auto w-full max-w-[300px] rounded-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {canShareFiles && (
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-light)]"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </button>
        )}
        <button
          onClick={download}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 px-5 py-2.5 text-sm font-bold text-[var(--color-primary-light)] transition-colors hover:bg-[var(--color-primary)]/20"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download PNG
        </button>
      </div>
      {status !== "idle" && (
        <p
          className={`mt-3 text-center text-sm font-semibold ${
            status === "error"
              ? "text-rose-400"
              : status === "shared"
                ? "text-emerald-400"
                : "text-[var(--color-primary-light)]"
          }`}
          role="status"
        >
          {status === "shared" && "Shared — check WhatsApp or Instagram to post it."}
          {status === "downloaded" && "Downloaded — find the PNG in your downloads."}
          {status === "error" && "Something went wrong generating the card — please try again."}
        </p>
      )}
    </div>
  );
}
