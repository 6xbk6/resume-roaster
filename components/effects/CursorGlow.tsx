"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const posRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          glow.style.transform = `translate3d(${posRef.current.x - 200}px, ${posRef.current.y - 200}px, 0)`;
          glow.style.opacity = "1";
          rafRef.current = 0;
        });
      }
    };

    const handleMouseLeave = () => {
      glow.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-0 transition-opacity duration-300"
      style={{
        width: 400,
        height: 400,
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)",
        borderRadius: "50%",
        opacity: 0,
        willChange: "transform, opacity",
      }}
    />
  );
}