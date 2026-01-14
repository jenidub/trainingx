"use client";

import { useState } from "react";
import { ChevronLeft, Loader2, PenLine, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { YouthQuestion } from "@/data/youth-questions";
import type { Question } from "@/data/questions";
import { motion } from "framer-motion";

// Questions that should have an "Other" option with text input
const QUESTIONS_WITH_OTHER = ["industry_focus", "current_role"];

interface PathwayQuizProps {
  question: YouthQuestion | Question;
  questionNumber: number;
  totalQuestions: number;
  isYouth: boolean;
  onAnswer: (answer: string) => void;
  onBack?: () => void;
  isCalculating: boolean;
  canGoBack: boolean;
}

export function PathwayQuiz({
  question,
  questionNumber,
  totalQuestions,
  isYouth,
  onAnswer,
  onBack,
  isCalculating,
  canGoBack,
}: PathwayQuizProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState("");

  // Reset other input when question changes
  const handleAnswerWithReset = (answer: string) => {
    setShowOtherInput(false);
    setOtherText("");
    onAnswer(answer);
  };

  const handleOtherSubmit = () => {
    if (otherText.trim()) {
      handleAnswerWithReset(`other:${otherText.trim()}`);
    }
  };

  if (isCalculating) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-6">
        <Loader2 className="h-12 w-12 animate-spin text-[#0074b9] mx-auto" />
        <p className="text-lg font-medium text-slate-600">
          Analyzing your answers...
        </p>
      </div>
    );
  }

  // Handle youth questions (A/B format)
  if (isYouth) {
    const youthQ = question as YouthQuestion;
    return (
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-3xl mx-auto space-y-8"
      >
        {/* Back Button + Section Title */}
        <div className="flex items-center justify-between">
          {canGoBack && onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {youthQ.sectionTitle && (
            <span
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: "rgba(0, 116, 185, 0.1)",
                color: "#0074b9",
              }}
            >
              {youthQ.sectionTitle}
            </span>
          )}

          {!youthQ.sectionTitle && <div />}
        </div>

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
          {youthQ.options.map((option) => (
            <YouthOptionCard
              key={option.id}
              label={option.id.toUpperCase()}
              text={option.text}
              onClick={() => handleAnswerWithReset(option.id)}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Handle adult questions (multi-choice format)
  const adultQ = question as Question;
  const shouldShowOther = QUESTIONS_WITH_OTHER.includes(adultQ.id);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Back Button */}
      <div className="flex items-center">
        {canGoBack && onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Question Header */}
      <div className="space-y-2 text-center">
        <span
          className="text-sm font-medium tracking-wider uppercase"
          style={{ color: "#0074b9" }}
        >
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
        {adultQ.options.map((option) => {
          const Icon = option.icon;
          return (
            <AdultOptionCard
              key={option.id}
              icon={Icon}
              label={option.label}
              description={option.description}
              onClick={() => handleAnswerWithReset(option.value)}
            />
          );
        })}

        {/* Other Option - only for specific questions */}
        {shouldShowOther && !showOtherInput && (
          <OtherOptionCard onClick={() => setShowOtherInput(true)} />
        )}
      </div>

      {/* Expandable Text Input for "Other" */}
      {showOtherInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOtherSubmit()}
              placeholder="Type your answer..."
              autoFocus
              className="w-full px-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0074b9] focus:ring-2 focus:ring-[#0074b9]/20 transition-all text-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowOtherInput(false);
                setOtherText("");
              }}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleOtherSubmit}
              disabled={!otherText.trim()}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                background: "linear-gradient(to right, #0074b9, #46bc61)",
              }}
            >
              Submit
              <Send className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface YouthOptionCardProps {
  label: string;
  text: string;
  onClick: () => void;
}

function YouthOptionCard({ label, text, onClick }: YouthOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-3xl border-2 border-white bg-white/80 backdrop-blur-sm text-center transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:border-[#0074b9]/30 hover:shadow-xl hover:shadow-[#0074b9]/10 min-h-[140px] active:scale-[0.98]"
    >
      {/* Option Label - uses inline style for reliable gradient on hover */}
      <span className="youth-option-label inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-bold text-lg transition-all duration-200">
        {label}
      </span>

      {/* Option Text */}
      <span className="text-base sm:text-lg font-medium text-slate-700 leading-snug">
        {text}
      </span>

      {/* CSS for hover gradient */}
      <style jsx>{`
        .group:hover .youth-option-label {
          background: linear-gradient(to bottom right, #0074b9, #46bc61);
          color: white;
        }
      `}</style>
    </button>
  );
}

interface AdultOptionCardProps {
  icon?: LucideIcon;
  label: string;
  description?: string;
  onClick: () => void;
}

function AdultOptionCard({
  icon: Icon,
  label,
  description,
  onClick,
}: AdultOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border-2 border-white bg-white/80 backdrop-blur-sm text-center transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:border-[#0074b9]/30 hover:shadow-xl hover:shadow-[#0074b9]/10 active:scale-[0.98]"
    >
      {/* Icon */}
      {Icon && (
        <div className="adult-option-icon p-4 rounded-2xl bg-slate-100 text-slate-600 transition-all duration-200">
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

      {/* CSS for hover gradient */}
      <style jsx>{`
        .group:hover .adult-option-icon {
          background: linear-gradient(to bottom right, #0074b9, #46bc61);
          color: white;
        }
      `}</style>
    </button>
  );
}

interface OtherOptionCardProps {
  onClick: () => void;
}

function OtherOptionCard({ onClick }: OtherOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-8 rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 backdrop-blur-sm text-center transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:border-[#0074b9]/50 hover:bg-white/80 active:scale-[0.98]"
    >
      {/* Icon */}
      <div className="other-option-icon p-4 rounded-2xl bg-slate-50 text-slate-400 transition-all duration-200">
        <PenLine className="w-7 h-7" />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <span className="text-lg font-semibold text-slate-600 block">
          Other
        </span>
        <span className="text-sm text-slate-400 block">
          Type your own answer
        </span>
      </div>

      {/* CSS for hover gradient */}
      <style jsx>{`
        .group:hover .other-option-icon {
          background: linear-gradient(to bottom right, #0074b9, #46bc61);
          color: white;
        }
      `}</style>
    </button>
  );
}
