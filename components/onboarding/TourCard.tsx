"use client";

import { useOnborda } from "onborda";
import type { CardComponentProps } from "onborda";
import { X, ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { markTourCompleted } from "@/lib/onboarding-tour";

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}: CardComponentProps) {
  const { closeOnborda } = useOnborda();
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  useEffect(() => {
    if (isLastStep) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"],
      });
    }
  }, [isLastStep]);

  const handleComplete = () => {
    markTourCompleted();
    closeOnborda();
  };

  const handleSkip = () => {
    markTourCompleted();
    closeOnborda();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative z-[2000] w-[300px] rounded-2xl border-2 border-b-4 border-blue-200 bg-white p-5 shadow-2xl"
    >
      {arrow}

      {/* Header with progress and close */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-4 bg-blue-500"
                  : i < currentStep
                    ? "w-1.5 bg-blue-300"
                    : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            {currentStep + 1}/{totalSteps}
          </span>
          <button
            onClick={handleSkip}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3 mb-2">
        {step.icon && <span className="text-2xl">{step.icon}</span>}
        <h3 className="text-base font-bold text-slate-800 leading-tight">
          {step.title}
        </h3>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {step.content}
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {!isFirstStep && (
          <button
            onClick={prevStep}
            className="flex h-9 items-center gap-1.5 rounded-lg border-2 border-slate-200 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        )}

        {isFirstStep && (
          <button
            onClick={handleSkip}
            className="flex h-9 items-center px-3 text-sm text-slate-400 hover:text-slate-600"
          >
            Skip
          </button>
        )}

        <button
          onClick={isLastStep ? handleComplete : nextStep}
          className={`flex-1 flex h-9 items-center justify-center gap-1.5 rounded-lg border-2 px-3 text-sm font-bold text-white ${
            isLastStep
              ? "border-green-600 bg-green-500 hover:bg-green-400"
              : "border-blue-600 bg-blue-500 hover:bg-blue-400"
          }`}
        >
          {isLastStep ? (
            <>
              <PartyPopper className="h-3.5 w-3.5" />
              Got it!
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
