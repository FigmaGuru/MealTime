import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center animate-in fade-in-0 duration-300">
      <Loader2 className="h-8 w-8 animate-spin text-primary [animation-duration:1s]" />
    </div>
  );
}
