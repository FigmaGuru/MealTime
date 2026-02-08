"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { smoothSpring } from "@/lib/animations";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: smoothSpring },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="pointer-events-none absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 right-1/4 h-[400px] w-[400px] rounded-full bg-chart-2/5 blur-3xl"
        animate={{ y: [0, -25, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-36">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={item}
            className="mx-auto max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Plan your meals.
            <br />
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Simplify your week.
            </span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground"
          >
            MealTime helps your family plan meals fast, reuse favorites, and
            generate a clean weekly plan — all in one calm, minimal app.
          </motion.p>
          <motion.div
            variants={item}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Try the Demo</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
