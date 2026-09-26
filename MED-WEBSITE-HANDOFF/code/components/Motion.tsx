'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type CSSProperties } from 'react'

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

interface RevealProps {
  children: ReactNode
  /** Animation direction — where the element slides in from. 'none' = fade only. */
  direction?: Direction
  /** Delay before animation starts (ms), useful for stagger sequences */
  delay?: number
  /** Animation duration (ms) — recommended 300-400ms for scroll reveals */
  duration?: number
  /** Distance to travel (px) — recommended 8-16px for subtle fade */
  distance?: number
  /** Trigger threshold — how much of the element must be visible (0-1) */
  threshold?: number
  /** Only animate once, or re-animate when scrolling back */
  once?: boolean
  /** Additional CSS classes */
  className?: string
  style?: CSSProperties
}

/**
 * Scroll-reveal wrapper. Fades + slides children into view when they enter
 * the viewport. Pure CSS transitions — no JS animation library needed.
 *
 * Respects prefers-reduced-motion: shows content immediately without animation.
 *
 * Usage:
 *   <Reveal><div>content</div></Reveal>
 *   <Reveal direction="left" delay={100}><Card /></Reveal>
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 350,
  distance = 12,
  threshold = 0.15,
  once = true,
  className = '',
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Under reduced motion the render path below never reads `visible`, so
    // there is nothing to set — just skip the observer.
    if (reducedMotion) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once, reducedMotion])

  // Under reduced motion: skip animation, show content immediately
  if (reducedMotion) {
    return (
      <div ref={ref} className={className} style={{ opacity: 1, ...style }}>
        {children}
      </div>
    )
  }

  const transforms: Record<Direction, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    none: 'none',
  }

  const rootStyle: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : transforms[direction],
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
    // Dropped once the element has arrived. Leaving will-change set holds a
    // compositor layer for every revealed block on the page — around thirty of
    // them here — long after there is nothing left to animate.
    willChange: visible ? undefined : 'opacity, transform',
    ...style,
  }

  return (
    <div ref={ref} className={className} style={rootStyle}>
      {children}
    </div>
  )
}

/**
 * Stagger container — wraps multiple children with increasing delays.
 * Per-item stagger: 30ms (recommended for lists > 10 items).
 *
 * Respects prefers-reduced-motion: shows all items immediately.
 *
 * Usage:
 *   <Stagger>
 *     <Card 1 />
 *     <Card 2 />
 *     <Card 3 />
 *   </Stagger>
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
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Under reduced motion the render path below never reads `visible`.
    if (reducedMotion) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  if (reducedMotion) {
    return <div ref={ref} className={className}>{children}</div>
  }

  // Clone children and inject increasing delays.
  // Each child gets a wrapper div, and that wrapper — not the child — is the
  // direct descendant of this container. So grid-placement classes (col-span,
  // row-span) set on a child are ignored here; put those on a per-item
  // <Reveal className="..."> instead.
  const kids = Array.isArray(children) ? children : [children]
  return (
    <div ref={ref} className={className}>
      {kids.map((child, i) => {
        if (!visible) {
          return (
            <div
              key={i}
              style={{ opacity: 0, transform: 'translateY(10px)', willChange: 'opacity, transform' }}
            >
              {child}
            </div>
          )
        }
        return (
          <div
            key={i}
            style={{
              opacity: 1,
              transform: 'none',
              transition: `opacity 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}ms, transform 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * stagger}ms`,
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Scale-in reveal — for elements that should pop into view.
 * Used for stat counters, icons, etc.
 *
 * Respects prefers-reduced-motion.
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
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Under reduced motion the render path below never reads `visible`.
    if (reducedMotion) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  if (reducedMotion) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.92)',
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: visible ? undefined : 'opacity, transform',
      }}
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
