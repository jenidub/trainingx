"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useOnborda } from "onborda";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import {
  TOUR_ID,
  isTourCompleted,
  markTourCompleted,
  resetTour,
} from "@/lib/onboarding-tour";

export function useOnboardingTour() {
  const { startOnborda, closeOnborda, isOnbordaVisible, currentStep } =
    useOnborda();
  const { setOpenMobile, isMobile } = useSidebar();
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);
    return () => {
      hasStartedRef.current = false;
    };
  }, []);

  const startTour = useCallback(() => {
    startOnborda(TOUR_ID);
  }, [startOnborda]);

  const restartTour = useCallback(() => {
    resetTour();
    setTimeout(() => {
      startOnborda(TOUR_ID);
    }, 100);
  }, [startOnborda]);

  const completeTour = useCallback(() => {
    markTourCompleted();
    closeOnborda();
  }, [closeOnborda]);

  // Auto-start tour on dashboard for first-time users
  useEffect(() => {
    if (!hasMounted) return;
    if (pathname !== "/dashboard") return;
    if (isOnbordaVisible) return;
    if (hasStartedRef.current) return;
    if (isTourCompleted()) return;

    hasStartedRef.current = true;

    // Delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const element = document.querySelector("#onborda-welcome");
      if (element) {
        startOnborda(TOUR_ID);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, hasMounted, isOnbordaVisible, startOnborda]);

  // Track if tour has started to detect when it closes
  useEffect(() => {
    if (isOnbordaVisible) {
      hasStartedRef.current = true;
    } else if (hasStartedRef.current) {
      // If it was started and is now not visible, mark as completed
      // This covers both "Finish" and "Skip/Close" actions
      markTourCompleted();
    }
  }, [isOnbordaVisible]);

  // Manage sidebar visibility during tour on mobile
  useEffect(() => {
    if (!isMobile) return;

    if (isOnbordaVisible) {
      // Steps 0 and 1 are on the dashboard (Welcome, Stats)
      // Steps 2+ are on the sidebar
      if (currentStep >= 2) {
        setOpenMobile(true);
      } else {
        setOpenMobile(false);
      }
    }
  }, [isOnbordaVisible, currentStep, isMobile, setOpenMobile]);

  return {
    startTour,
    restartTour,
    completeTour,
    closeTour: closeOnborda,
    isVisible: isOnbordaVisible,
    currentStep,
    isTourCompleted,
  };
}
