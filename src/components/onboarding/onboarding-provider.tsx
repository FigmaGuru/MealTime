"use client";

import { createContext, useContext } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingDialog } from "./onboarding-dialog";

interface OnboardingContextType {
  reopen: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  reopen: () => {},
});

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, setOpen, complete, reopen } = useOnboarding();

  return (
    <OnboardingContext.Provider value={{ reopen }}>
      {children}
      <OnboardingDialog
        open={open}
        onOpenChange={setOpen}
        onComplete={complete}
      />
    </OnboardingContext.Provider>
  );
}

export const useOnboardingActions = () => useContext(OnboardingContext);
