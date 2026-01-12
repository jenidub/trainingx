"use client";

import { cn } from "@/lib/utils";

interface ShimmerTextProps {
  text: string;
  className?: string;
}

export function ShimmerText({ text, className }: ShimmerTextProps) {
  return (
    <span
      className={cn(
        "animate-pulse bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-clip-text text-transparent",
        className
      )}
    >
      {text}
    </span>
  );
}
