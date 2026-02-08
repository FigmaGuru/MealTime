"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BookOpen, CalendarDays, Sparkles, ShoppingCart } from "lucide-react";
import { staggerContainerSlow, fadeInUp } from "@/lib/animations";

const features = [
  {
    icon: BookOpen,
    title: "Meal Library",
    description:
      "Build a collection of your family's favorite meals with ingredients, steps, and nutrition info.",
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/10",
  },
  {
    icon: CalendarDays,
    title: "Weekly Planning",
    description:
      "Drag and drop meals into a weekly plan. See your whole week at a glance.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: Sparkles,
    title: "Smart Generation",
    description:
      "Generate plans based on your preferences — favorites, prep time, variety, and AI suggestions.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: ShoppingCart,
    title: "Shopping Lists",
    description:
      "Auto-generate shopping lists from your weekly plan, organized by category.",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to plan meals
        </h2>
        <p className="mt-3 text-muted-foreground">
          Simple tools that work together to simplify your week.
        </p>
      </div>

      <motion.div
        ref={ref}
        className="grid gap-6 sm:grid-cols-2"
        variants={staggerContainerSlow}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeInUp}
            className="group rounded-xl border border-border/60 p-6 transition-colors hover:bg-accent/30"
          >
            <div
              className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.iconBg}`}
            >
              <feature.icon className={`h-5 w-5 ${feature.color}`} />
            </div>
            <h3 className="mb-1.5 font-medium">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
