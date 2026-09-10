"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/ui/Motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  color: string;
}

export function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.parentElement?.clientWidth || window.innerWidth;
    let h = canvas.parentElement?.clientHeight || 400;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      if (!canvas.parentElement) return;
      w = canvas.parentElement.clientWidth || window.innerWidth;
      h = canvas.parentElement.clientHeight || 400;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Create particles
    const particleCount = 85;
    const particles: Particle[] = [];
    const colors = ["rgba(95,211,228,", "rgba(201,162,75,", "rgba(198,210,228,", "rgba(59,130,246,"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2.5 + 1,
        baseAlpha: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;
    let prevMouseX = -1000;
    let prevMouseY = -1000;
    let mouseVx = 0;
    let mouseVy = 0;
    let onScreen = true;
    let raf = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (prevMouseX !== -1000) {
        mouseVx = currentX - prevMouseX;
        mouseVy = currentY - prevMouseY;
      }
      prevMouseX = currentX;
      prevMouseY = currentY;
      mouseX = currentX;
      mouseY = currentY;
    };

    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
      prevMouseX = -1000;
      prevMouseY = -1000;
      mouseVx = 0;
      mouseVy = 0;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", onMouseLeave);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    const loop = () => {
      if (!onScreen) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);

      // Dampen mouse velocity over time when mouse stops
      mouseVx *= 0.9;
      mouseVy *= 0.9;

      ctx.clearRect(0, 0, w, h);

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx + mouseVx * 0.03;
        p.y += p.vy + mouseVy * 0.03;

        // Wrap or bounce edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse directional interaction (Nexstudio & Antigravity directional velocity wake)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 140;

        if (dist < maxDist && dist > 0) {
          const force = (1 - dist / maxDist) * 1.8;
          // Push particles in the direction of mouse movement plus slight radial push
          p.x -= (dx / dist) * force * 1.5 - mouseVx * 0.05;
          p.y -= (dy / dist) * force * 1.5 - mouseVy * 0.05;
        }

        // Draw particle glow / dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.baseAlpha})`;
        ctx.fill();

        // Connect nearby particles with glowing network lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ndx = p.x - p2.x;
          const ndy = p.y - p2.y;
          const ndist = Math.hypot(ndx, ndy);
          if (ndist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(95,211,228,${(1 - ndist / 85) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw directional cursor connection and velocity trail
      if (mouseX > 0 && mouseY > 0) {
        for (const p of particles) {
          const cdx = mouseX - p.x;
          const cdy = mouseY - p.y;
          const cdist = Math.hypot(cdx, cdy);
          if (cdist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(201,162,75,${(1 - cdist / 110) * 0.3})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }

        // Draw cursor directional indicator vector
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(mouseX + mouseVx * 4, mouseY + mouseVy * 4);
        ctx.strokeStyle = "rgba(95,211,228,0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-auto cursor-pointer"
    />
  );
}
