"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { cn } from "../lib/utils";

type TextEffectProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  children: React.ReactNode;
  delay?: number;
  /** Line-by-line vs single block (block still animates as one unit here). */
  per?: "line" | "word" | "char";
  preset?: string;
  speedSegment?: number;
};

const motionTags = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  div: motion.div,
} as const;

/**
 * Fade + blur reveal used on marketing sections. Matches prior "fade-in-blur" preset.
 */
export function TextEffect({
  as = "span",
  className,
  children,
  delay = 0,
  speedSegment = 0.3,
}: TextEffectProps) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motionTags[as];

  return (
    <MotionTag
      className={cn(className)}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, filter: "blur(12px)", y: 16 }
      }
      whileInView={
        reduceMotion
          ? { opacity: 1 }
          : { opacity: 1, filter: "blur(0px)", y: 0 }
      }
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        delay,
        duration: Math.max(0.35, speedSegment * 2),
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
