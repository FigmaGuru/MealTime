"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/animations";

export function CtaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <motion.div
        ref={ref}
        variants={fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="rounded-2xl border border-primary/10 bg-primary/5 p-10 text-center sm:p-16"
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to simplify meal planning?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Join families who save time every week with MealTime. Free to start,
          no credit card required.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
