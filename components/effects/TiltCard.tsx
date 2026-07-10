"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
}

export function TiltCard({ children, className = "", maxTilt = 10, scale = 1.03, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) {
        rafRef.current = 0;
        return;
      }

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setRotateX(((y - centerY) / centerY) * -maxTilt);
      setRotateY(((x - centerX) / centerX) * maxTilt);
      setGlareX((x / rect.width) * 100);
      setGlareY((y / rect.height) * 100);
      rafRef.current = 0;
    });
  }, [maxTilt]);

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlareX(50);
    setGlareY(50);
    setIsHovering(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
        scale: isHovering ? scale : 1,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className={`relative ${className}`}
    >
      {children}
      {glare && isHovering && (
        <div
          className="absolute inset-0 rounded-inherit pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}