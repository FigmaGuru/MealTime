"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainerSlow, fadeInUp } from "@/lib/animations";

const steps = [
  {
    number: "01",
    title: "Add your meals",
    description:
      "Build your library with family favorites. Just add a title — AI fills in the rest.",
  },
  {
    number: "02",
    title: "Generate a plan",
    description:
      "Pick your days, set preferences, and generate a weekly plan in seconds.",
  },
  {
    number: "03",
    title: "Cook & enjoy",
    description:
      "Follow your plan, check off your shopping list, and enjoy stress-free meals.",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="border-y bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three simple steps to a stress-free week.
          </p>
        </div>

        <motion.div
          ref={ref}
          className="grid gap-8 sm:grid-cols-3"
          variants={staggerContainerSlow}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-bold text-primary">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-2 font-medium">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
