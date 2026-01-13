"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { YouthQuestion } from "@/data/youth-questions";
import type { Question } from "@/data/questions";

interface PathwayQuizProps {
  question: YouthQuestion | Question;
  questionNumber: number;
  totalQuestions: number;
  isYouth: boolean;
  onAnswer: (answer: string) => void;
  isCalculating: boolean;
}

export function PathwayQuiz({
  question,
  questionNumber,
  totalQuestions,
  isYouth,
  onAnswer,
  isCalculating,
}: PathwayQuizProps) {
  if (isCalculating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl mx-auto text-center space-y-6"
      >
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-lg font-medium text-slate-600">
          Analyzing your answers...
        </p>
      </motion.div>
    );
  }

  // Handle youth questions (A/B format)
  if (isYouth) {
    const youthQ = question as YouthQuestion;
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-3xl mx-auto space-y-8"
      >
        {/* Section Title (if new section) */}
        {youthQ.sectionTitle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider">
              {youthQ.sectionTitle}
            </span>
          </motion.div>
        )}

        {/* Question Header */}
        <div className="space-y-2 text-center">
          <span className="text-sm font-medium text-slate-500 tracking-wider uppercase">
            Question {questionNumber} of {totalQuestions}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight max-w-2xl mx-auto">
            {youthQ.text}
          </h2>
        </div>

        {/* A/B Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {youthQ.options.map((option, index) => (
            <YouthOptionCard
              key={option.id}
              label={option.id.toUpperCase()}
              text={option.text}
              onClick={() => onAnswer(option.id)}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Handle adult questions (multi-choice format)
  const adultQ = question as Question;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Question Header */}
      <div className="space-y-2 text-center">
        <span className="text-sm font-medium text-primary/80 tracking-wider uppercase">
          Question {questionNumber} of {totalQuestions}
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
          {adultQ.text}
        </h2>
      </div>

      {/* Multi-choice Options */}
      <div
        className={`grid gap-4 pt-4 ${
          adultQ.options.length > 4
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        {adultQ.options.map((option, index) => {
          const Icon = option.icon;
          return (
            <AdultOptionCard
              key={option.id}
              icon={Icon}
              label={option.label}
              description={option.description}
              onClick={() => onAnswer(option.value)}
              delay={0.1 + index * 0.05}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

interface YouthOptionCardProps {
  label: string;
  text: string;
  onClick: () => void;
  delay: number;
}

function YouthOptionCard({
  label,
  text,
  onClick,
  delay,
}: YouthOptionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-3xl border-2 border-white bg-white/80 backdrop-blur-sm text-center transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 min-h-[140px]"
    >
      {/* Option Label */}
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
        {label}
      </span>

      {/* Option Text */}
      <span className="text-base sm:text-lg font-medium text-slate-700 leading-snug">
        {text}
      </span>
    </motion.button>
  );
}

interface AdultOptionCardProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  onClick: () => void;
  delay: number;
}

function AdultOptionCard({
  icon: Icon,
  label,
  description,
  onClick,
  delay,
}: AdultOptionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border-2 border-white bg-white/80 backdrop-blur-sm text-center transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Icon */}
      {Icon && (
        <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-indigo-600 group-hover:text-white transition-colors">
          <Icon className="w-7 h-7" />
        </div>
      )}

      {/* Text */}
      <div className="space-y-1">
        <span className="text-lg font-semibold text-slate-800 block">
          {label}
        </span>
        {description && (
          <span className="text-sm text-slate-500 block">{description}</span>
        )}
      </div>
    </motion.button>
  );
}
