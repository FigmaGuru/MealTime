import type { Variants, Transition } from "framer-motion";

// --- Spring configs ---
export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

// --- Variants ---
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: smoothSpring },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: smoothSpring },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: smoothSpring },
};

// --- Stagger containers ---
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
