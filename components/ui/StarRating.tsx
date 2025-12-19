"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface StarRatingProps {
  stars: number; // 0-3
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showEmpty?: boolean;
  className?: string;
  animated?: boolean;
}

export function StarRating({
  stars,
  maxStars = 3,
  size = "md",
  showEmpty = true,
  className,
  animated = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const starSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const isFilled = index < stars;

        return (
          <Star
            key={index}
            className={cn(
              starSize,
              "transition-all duration-300",
              isFilled
                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                : showEmpty
                  ? "fill-slate-200 text-slate-200"
                  : "hidden",
              animated && isFilled && "animate-pulse"
            )}
            style={
              animated && isFilled
                ? { animationDelay: `${index * 100}ms` }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

// Helper to calculate stars from score
export function calculateStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
}
