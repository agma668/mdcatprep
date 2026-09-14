'use client'

// The declarative half of the page's ONE appearance vocabulary. The other two
// halves are components/landing/ScrollReveal.tsx (the single controller that
// arms the document and triggers reveals) and the REVEAL VOCABULARY section of
// app/globals.css (the keyframes and the three custom properties).
//
// Every component below renders exactly the wrapper element it always did, in
// the same place in the tree, with the same className — the only change is that
// the wrapper carries `data-reveal` (plus its timing) instead of running its own
// IntersectionObserver and React state. Nineteen call sites used to mean
// nineteen observers and nineteen re-renders; they now mean one observer and no
// state at all.
//
// An element here is visible at rest. Nothing is hidden until the controller has
// armed the document, so a page whose JS never runs renders every section
// instead of a blank column (see the CSS for the second half of that promise).

import { useSyncExternalStore, type ReactNode, type CSSProperties } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

/**
 * Check if the user prefers reduced motion.
 * Returns true if the user has requested minimal animations. The media query
 * is read as an external store so no state is set from an effect: the server
 * snapshot is false, and the live value only re-renders on real changes.
 *
 * Exported because anything that moves on its own — autoplaying carousels,
 * canvas loops, smooth scrolling — has to check it too, not just reveals.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', onStoreChange)
      return () => mq.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )
}

/**
 * Direction and distance as the two custom properties the keyframes read.
 * 'up' means the element travels upward into place, so it starts below the
 * pointer-free rest position — the same convention the old inline transform
 * used, kept so every existing call site keeps its feel.
 */
function revealVector(direction: Direction, distance: number): CSSProperties {
  const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0
  const x = direction === 'left' ? distance : direction === 'right' ? -distance : 0
  return { '--reveal-x': `${x}px`, '--reveal-y': `${y}px` } as CSSProperties
}

interface RevealProps {
  children: ReactNode
  /** Animation direction — where the element slides in from. 'none' = fade only. */
  direction?: Direction
  /** Delay before the animation starts (ms), useful for stagger sequences */
  delay?: number
  /** Animation duration (ms) — the beat this element lands on */
  duration?: number
  /** Distance to travel (px) — 12 is the house default; section leads use 20 */
  distance?: number
  /** Additional CSS classes */
  className?: string
  style?: CSSProperties
}

/**
 * Scroll-reveal wrapper. Fades + slides its children into view when they enter
 * the viewport, on the shared vocabulary: one controller triggers it, CSS
 * animates it, and reduced motion shows the content immediately.
 *
 * Usage:
 *   <Reveal><div>content</div></Reveal>
 *   <Reveal direction="left" delay={100}><Card /></Reveal>
 *   <Reveal distance={20} duration={520}>  // a section lead
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 350,
  distance = 12,
  className = '',
  style,
}: RevealProps) {
  return (
    <div
      data-reveal=""
      className={className}
      style={
        {
          ...revealVector(direction, distance),
          '--reveal-delay': `${delay}ms`,
          '--reveal-duration': `${duration}ms`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

/**
 * Stagger container — wraps multiple children with increasing delays.
 * Per-item stagger: 30ms (recommended for lists > 10 items).
 *
 * Each child gets its own wrapper carrying the shared reveal attributes and its
 * own --reveal-delay, so the group needs no styling of its own and the children
 * animate on the same trigger as everything else. Note that the wrapper — not
 * the child — is the direct descendant of this container, so grid-placement
 * classes (col-span, row-span) set on a child are ignored here; put those on a
 * per-item <Reveal className="..."> instead.
 */
export function Stagger({
  children,
  stagger = 30,
  className = '',
}: {
  children: ReactNode
  stagger?: number
  className?: string
}) {
  const kids = Array.isArray(children) ? children : [children]
  return (
    <div className={className}>
      {kids.map((child, i) => (
        <div
          key={i}
          data-reveal=""
          style={{ '--reveal-delay': `${i * stagger}ms` } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

/**
 * Scale-in reveal — for elements that should pop into view.
 * Same vocabulary, same trigger; the only difference is the keyframe.
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  className = '',
}: {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <div
      data-reveal="scale"
      className={className}
      style={
        {
          '--reveal-delay': `${delay}ms`,
          '--reveal-duration': `${duration}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

/**
 * Parallax float — subtle continuous floating animation for decorative elements.
 * Pauses under prefers-reduced-motion.
 */
export function Float({
  children,
  speed = 3,
  className = '',
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      className={className}
      style={{
        animation: `float ${speed}s ease-in-out infinite`,
      }}
    >
      {children}
    </div>
  )
}
