"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  UtensilsCrossed,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChefHat,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const STEPS = [
  {
    key: "welcome",
    title: "Welcome to MealTime",
    description:
      "Your family meal planner — plan dinners, save favourites, and let AI do the heavy lifting.",
    icon: ChefHat,
    features: null,
  },
  {
    key: "features",
    title: "Everything you need",
    description: "Three powerful tools to simplify your weekly meals.",
    icon: null,
    features: [
      {
        icon: MessageCircle,
        title: "AI Chat",
        description:
          "Ask what's for dinner, get meal ideas, or add new meals — all through natural conversation.",
      },
      {
        icon: UtensilsCrossed,
        title: "Meal Library",
        description:
          "Build your family's collection of go-to meals with ingredients, steps, and nutrition info.",
      },
      {
        icon: CalendarDays,
        title: "Weekly Planner",
        description:
          "Drag and drop meals onto your week. Generate plans with AI and create shopping lists.",
      },
    ],
  },
  {
    key: "ready",
    title: "You're all set",
    description:
      "Jump in and start building your meal library. You can always reopen this guide from the sidebar.",
    icon: Sparkles,
    features: null,
  },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function OnboardingDialog({
  open,
  onOpenChange,
  onComplete,
}: OnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const router = useRouter();
  const current = STEPS[step];

  function next() {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }

  function prev() {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }

  function finish(navigateTo?: string) {
    onComplete();
    setStep(0);
    if (navigateTo) {
      router.push(navigateTo);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onComplete();
          setStep(0);
        }
        onOpenChange(value);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-primary"
                  : i < step
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <div className="min-h-[320px] px-6 pt-6 pb-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <DialogHeader className="items-center text-center">
                {current.icon && (
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <current.icon className="h-7 w-7 text-primary" />
                  </div>
                )}
                <DialogTitle className="text-xl">
                  {current.title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">
                  {current.description}
                </DialogDescription>
              </DialogHeader>

              {/* Feature cards for step 2 */}
              {current.features && (
                <div className="mt-5 space-y-3">
                  {current.features.map((feature) => (
                    <div
                      key={feature.title}
                      className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <feature.icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {feature.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Get started actions for final step */}
              {current.key === "ready" && (
                <div className="mt-6 grid gap-2">
                  <Button
                    className="w-full gap-2"
                    onClick={() => finish("/app/meals")}
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    Add your first meal
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => finish("/app")}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with AI
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={step === 0}
              className="gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={next} className="gap-1">
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => finish()}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
