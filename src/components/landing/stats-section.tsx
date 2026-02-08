"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainerSlow, fadeInUp } from "@/lib/animations";

const stats = [
  { value: "5 min", label: "To plan your week" },
  { value: "7", label: "Days of meals sorted" },
  { value: "100%", label: "Free to use" },
  { value: "AI", label: "Powered suggestions" },
];

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <motion.div
        ref={ref}
        className="grid grid-cols-2 gap-8 sm:grid-cols-4"
        variants={staggerContainerSlow}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            className="text-center"
          >
            <p className="text-3xl font-bold text-primary sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
