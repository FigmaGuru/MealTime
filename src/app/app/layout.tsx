"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <OnboardingProvider>
        <AppShell>{children}</AppShell>
      </OnboardingProvider>
    </AuthGuard>
  );
}
