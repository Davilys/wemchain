"use client";

import { ReactNode } from "react";
import { motion, Variants } from "framer-motion";

export type TransitionVariant = "fadeUp" | "fadeIn" | "slideRight" | "scale";

interface PageTransitionProps {
  children: ReactNode;
  variant?: TransitionVariant;
  className?: string;
  delay?: number;
}

const pageVariants: Record<TransitionVariant, Variants> = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 }
  }
};

const transition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94] as const
};

export function PageTransition({ 
  children, 
  variant = "fadeUp",
  className = "",
  delay = 0
}: PageTransitionProps) {
  const selectedVariant = pageVariants[variant];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={selectedVariant}
      transition={{ ...transition, delay }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

// Hook para detectar preferência de reduced motion
export function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
