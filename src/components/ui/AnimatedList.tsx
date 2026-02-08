"use client";

import { ReactNode, Children, isValidElement } from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export function AnimatedList({ 
  children, 
  className = "",
  staggerDelay = 0.05,
  initialDelay = 0.1
}: AnimatedListProps) {
  const customContainerVariants: Variants = {
    ...containerVariants,
    visible: {
      ...containerVariants.visible,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={customContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        
        return (
          <motion.div
            key={child.key || index}
            variants={itemVariants}
            style={{ willChange: "opacity, transform" }}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Componente individual para uso customizado
interface AnimatedItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedItem({ 
  children, 
  className = "",
  delay = 0 
}: AnimatedItemProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
