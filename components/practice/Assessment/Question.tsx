"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface QuestionWrapperProps {
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number; // in seconds
  children: React.ReactNode;
  onTimeUp?: () => void;
}

export function QuestionWrapper({
  questionNumber,
  totalQuestions,
  timeRemaining,
  children,
  onTimeUp,
}: QuestionWrapperProps) {
  const [time, setTime] = useState(timeRemaining);
  const isLowTime = time < 300; // Less than 5 minutes
  const isCriticalTime = time < 60; // Less than 1 minute

  useEffect(() => {
    if (time <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [time, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (questionNumber / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b-2 border-slate-200 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Timer */}
            <motion.div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm",
                isCriticalTime
                  ? "bg-red-100 text-red-700"
                  : isLowTime
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
              )}
              animate={isCriticalTime ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {isCriticalTime ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {formatTime(time)}
            </motion.div>

            {/* Question counter */}
            <div className="text-slate-600 font-bold text-sm">
              Question <span className="text-purple-600">{questionNumber}</span>{" "}
              of <span className="text-slate-800">{totalQuestions}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4">{children}</div>
      </div>
    </div>
  );
}
