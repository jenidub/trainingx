"use client";

import { Onborda } from "onborda";
import { allTours } from "@/lib/onboarding-tour";
import { TourCard } from "./TourCard";

interface OnbordaWrapperProps {
  children: React.ReactNode;
}

export function OnbordaWrapper({ children }: OnbordaWrapperProps) {
  return (
    <Onborda
      steps={allTours}
      shadowRgb="15, 23, 42"
      shadowOpacity="0.75"
      cardComponent={TourCard}
      cardTransition={{ type: "spring", stiffness: 350, damping: 30 }}
    >
      {children}
    </Onborda>
  );
}
