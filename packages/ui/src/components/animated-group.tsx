"use client";

import { motion, type Variants } from "motion/react";
import * as React from "react";

export type AnimatedGroupVariants = {
  item: Variants;
};

type AnimatedGroupProps = {
  variants: AnimatedGroupVariants;
  className?: string;
  children: React.ReactNode;
};

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.04,
    },
  },
};

/**
 * Scroll-triggered stagger for direct children (e.g. TextEffect blocks).
 */
export function AnimatedGroup({ variants, className, children }: AnimatedGroupProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -64px 0px" }}
      variants={container}
    >
      {React.Children.toArray(children).map((child, i) => (
        <motion.div key={i} variants={variants.item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
