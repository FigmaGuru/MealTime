"use client";

import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface StepRowProps {
  step: string;
  index: number;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export function StepRow({ step, index, onChange, onRemove }: StepRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {index + 1}
      </span>
      <Textarea
        placeholder={`Step ${index + 1}`}
        value={step}
        onChange={(e) => onChange(index, e.target.value)}
        rows={2}
        className="flex-1 resize-none"
        aria-label={`Step ${index + 1}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => onRemove(index)}
        aria-label={`Remove step ${index + 1}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
