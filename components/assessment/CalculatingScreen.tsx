"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Brain, Target, Sparkles, CheckCircle2, BarChart3 } from "lucide-react";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

interface CalculatingScreenProps {
  onComplete: () => void;
}

const steps = [
  {
    text: "Analyzing your prompt clarity...",
    icon: Brain,
  },
  {
    text: "Evaluating constraint definition skills...",
    icon: Target,
  },
  {
    text: "Measuring iteration strategies...",
    icon: Sparkles,
  },
  {
    text: "Calculating your Prompt Score...",
    icon: BarChart3,
  },
];

export function CalculatingScreen({ onComplete }: CalculatingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Asset */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <img
          src={generatedImage}
          alt="Background"
          className="w-full h-full object-cover opacity-50 blur-2xl"
        />
      </div>

      <div className="z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="relative w-full max-w-md">
          {/* Central Pulse Animation */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gradient-from to-gradient-to shadow-lg shadow-primary/30 mb-4"
            >
              <Sparkles className="h-10 w-10 text-white animate-pulse" />
            </motion.div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Calculating Your Score
            </h2>
            <p className="text-slate-500">
              Analyzing your responses across 4 dimensions...
            </p>
          </motion.div>

          <div className="relative z-10 space-y-4">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isPending = index > currentStep;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isPending ? 0.4 : 1,
                    x: 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 border-b-4 transition-all duration-500 ${
                    isActive
                      ? "bg-white border-primary/30 shadow-lg"
                      : isCompleted
                        ? "bg-white border-green-200"
                        : "bg-white/60 border-slate-200"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? "bg-gradient-to-br from-gradient-from to-gradient-to text-white scale-110"
                        : isCompleted
                          ? "bg-green-100 text-green-600"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <step.icon
                        className={`w-6 h-6 ${isActive ? "animate-pulse" : ""}`}
                      />
                    )}
                  </div>

                  <div className="flex-grow">
                    <span
                      className={`text-base font-semibold transition-colors duration-300 ${
                        isActive
                          ? "text-slate-900"
                          : isCompleted
                            ? "text-slate-700"
                            : "text-slate-400"
                      }`}
                    >
                      {step.text}
                    </span>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}





