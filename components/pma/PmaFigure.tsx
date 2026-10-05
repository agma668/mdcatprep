'use client';

import type { ReactElement } from 'react';
import type { PmaFigure } from '@/lib/pma-questions';

// Original SVG figures for the PMA non-verbal engine (deterministic expansions of
// the PmaFigure spec in lib/pma-questions.ts — page and bank cannot disagree).
const FG = 'currentColor';
const ACCENT = '#f59e0b'; // amber-500, matches the PMA practice theme
const MUTED_STROKE = 'rgba(148,163,184,0.35)';

function polygonPoints(sides: number, cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2; // flat top for squares/triangles
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function Shape({ sides, cx, cy, r }: { sides: number; cx: number; cy: number; r: number }) {
  if (sides === 0) return <circle cx={cx} cy={cy} r={r} fill="none" stroke={FG} strokeWidth={2} />;
  return <polygon points={polygonPoints(sides, cx, cy, r)} fill="none" stroke={FG} strokeWidth={2} strokeLinejoin="round" />;
}

function Dots({ filled, total }: { filled: number; total: number }) {
  // 2 rows of 4 (total = 8); general small-grid layout
  const cols = 4;
  const rows = Math.ceil(total / cols);
  const dots: ReactElement[] = [];
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = 15 + col * 23 + (rows === 1 ? 11.5 : 0);
    const cy = rows === 1 ? 30 : 18 + row * 24;
    dots.push(<circle key={i} cx={cx} cy={cy} r={6} fill={i < filled ? ACCENT : 'transparent'} stroke={i < filled ? ACCENT : MUTED_STROKE} strokeWidth={1.5} />);
  }
  return <>{dots}</>;
}

function Arrow({ rotateDeg, x, y }: { rotateDeg: number; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotateDeg})`} stroke={ACCENT} strokeWidth={3} strokeLinecap="round">
      <line x1={-14} y1={0} x2={12} y2={0} />
      <polyline points="4,-8 12,0 4,8" fill="none" />
    </g>
  );
}

function Flag({ mirror, rotateDeg }: { mirror: boolean; rotateDeg: number }) {
  const flip = mirror ? -1 : 1;
  return (
    <g transform={`translate(30 34) rotate(${rotateDeg})`}>
      <line x1={0} y1={-20} x2={0} y2={22} stroke={FG} strokeWidth={2} />
      <polygon points={`0,-16 ${18 * flip},-11 0,-6`} fill={ACCENT} fillOpacity={0.85} stroke={ACCENT} />
      {mirror && <line x1={26} y1={-24} x2={26} y2={26} stroke={FG} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />}
      {!mirror && <text x={26} y={26} fontSize={9} fill={FG} opacity={0.6} textAnchor="middle">mirror</text>}
    </g>
  );
}

export function PmaFigure({ spec, label, className }: { spec: PmaFigure; label: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      role="img"
      aria-label={label}
      className={className ?? 'h-16 w-16 shrink-0 text-foreground'}
    >
      {spec.style === 'matrix-sides' && (
        <>
          <line x1={30} y1={4} x2={30} y2={56} stroke={MUTED_STROKE} />
          <line x1={4} y1={30} x2={56} y2={30} stroke={MUTED_STROKE} />
          <Shape sides={3} cx={17} cy={17} r={10} />
          <Shape sides={4} cx={43} cy={17} r={10} />
          <Shape sides={4} cx={17} cy={43} r={10} />
          {/* missing cell: dashed placeholder */}
          <rect x={33} y={33} width={20} height={20} fill="none" stroke={ACCENT} strokeDasharray="4 3" strokeWidth={1.5} />
          <text x={43} y={47} fontSize={11} fill={ACCENT} textAnchor="middle">?</text>
        </>
      )}
      {spec.style === 'dot-progression' && <Dots filled={spec.filled ?? 0} total={spec.total} />}
      {spec.style === 'rotation-series' && (
        <>
          <Arrow rotateDeg={0} x={20} y={14} />
          <Arrow rotateDeg={spec.rotateStepDeg ?? 45} x={43} y={14} />
          <Arrow rotateDeg={(spec.rotateStepDeg ?? 45) * 2} x={20} y={38} />
          <Arrow rotateDeg={(spec.rotateStepDeg ?? 45) * 3} x={43} y={38} />
          {/* next frame: dashed circle placeholder */}
          <circle cx={54} cy={54} r={0} />
          <g transform="translate(54 54)">
            <circle r={12} fill="none" stroke={ACCENT} strokeDasharray="4 3" strokeWidth={1.5} />
            <text y={4} fontSize={11} fill={ACCENT} textAnchor="middle">?</text>
          </g>
        </>
      )}
      {spec.style === 'single-mirrored' && <Flag mirror={spec.mirror ?? false} rotateDeg={spec.rotateDeg ?? 0} />}
      {spec.style === 'sequence-sides' && (
        <>
          <Shape sides={3} cx={13} cy={30} r={9} />
          <text x={13} y={49} fontSize={8} fill={FG} opacity={0.6} textAnchor="middle">3</text>
          <Shape sides={4} cx={33} cy={30} r={9} />
          <text x={33} y={49} fontSize={8} fill={FG} opacity={0.6} textAnchor="middle">4</text>
          <Shape sides={5} cx={52} cy={30} r={9} />
          <text x={52} y={49} fontSize={8} fill={FG} opacity={0.6} textAnchor="middle">5</text>
          {/* next: dashed placeholder below the 5 */}
          <g transform="translate(52 8)">
            <circle r={8} fill="none" stroke={ACCENT} strokeDasharray="3 3" strokeWidth={1.5} />
            <text y={3.5} fontSize={9} fill={ACCENT} textAnchor="middle">?</text>
          </g>
        </>
      )}
    </svg>
  );
}
