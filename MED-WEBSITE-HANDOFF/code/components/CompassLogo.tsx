// Compass-rose insignia — replaces the plain letter tile as the brand mark
// (from the cadet design package). The draw-in is one-shot CSS: stroke
// dashoffset + a needle pop. It is a pure static SVG — no JS state — and the
// global prefers-reduced-motion rule collapses the animation to a frame, so
// reduced-motion users simply see the finished mark.
//
// The mark paints in currentColor and sets its own colour from --brass on the
// <svg> itself. That keeps the one legitimate use of the metal reading from the
// token instead of a local hex, and setting `color` here rather than inheriting
// it means the surrounding text colour can never bleed into the insignia.
const TICKS = [0, 90, 180, 270];

export function CompassLogo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="compass-logo text-[var(--brass)]"
    >
      <circle cx={24} cy={24} r={20} stroke="currentColor" strokeWidth={1.75} pathLength={1} />
      {TICKS.map((deg) => (
        <line
          key={deg}
          x1={24}
          y1={5.5}
          x2={24}
          y2={10}
          stroke="currentColor"
          strokeWidth={1.75}
          pathLength={1}
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
      {/* N–S needle */}
      <path d="M24 13.5 L27.4 24 L24 34.5 L20.6 24 Z" fill="currentColor" />
    </svg>
  );
}
