'use client';
import { useEffect, useRef } from 'react';

export function CursorSpotlight() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    const glow = glowRef.current;
    if (!glow) return;

    const handler = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    // Smooth interpolation for buttery feel
    const animate = () => {
      const t = 0.18;
      posRef.current.x += (targetRef.current.x - posRef.current.x) * t;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * t;
      glow.style.setProperty('--spotlight-x', posRef.current.x + 'px');
      glow.style.setProperty('--spotlight-y', posRef.current.y + 'px');
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handler, { passive: true });
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handler);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] hidden md:block"
      style={{ '--spotlight-x': '-200px', '--spotlight-y': '-200px' } as React.CSSProperties}
    >
      {/* Main gold glow — covers whole page */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(450px circle at var(--spotlight-x) var(--spotlight-y), rgba(201, 168, 76, 0.07), transparent 50%)',
        }}
      />
      {/* Subtle inner highlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(250px circle at var(--spotlight-x) var(--spotlight-y), rgba(224, 200, 120, 0.04), transparent 40%)',
        }}
      />
    </div>
  );
}
