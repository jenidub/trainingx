"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { MultipleChoiceOption } from "@/lib/shared-types";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

interface QuestionCardProps {
  question: string;
  options: MultipleChoiceOption[];
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer?: number;
  showFeedback: boolean;
  onAnswer: (index: number) => void;
  onNext: () => void;
}

export function QuestionCard({
  question,
  options,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  showFeedback,
  onAnswer,
  onNext,
}: QuestionCardProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const canProceed = selectedAnswer !== undefined;

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background Asset */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <img
          src={generatedImage}
          alt="Background"
          className="w-full h-full object-cover opacity-50 blur-2xl"
        />
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-gradient-from to-gradient-to"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Question Header */}
              <div className="space-y-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-slate-600 shadow-sm border-2 border-b-4 border-slate-200"
                >
                  <Sparkles className="h-4 w-4 fill-current text-yellow-400" />
                  <span>
                    Question {currentQuestion + 1} of {totalQuestions}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto"
                >
                  {question}
                </motion.h2>
              </div>

              {/* Options */}
              <div className="grid gap-4 pt-4">
                {options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = option.quality === "good";
                  const isAlmost = option.quality === "almost";

                  return (
                    <OptionCard
                      key={idx}
                      option={option}
                      index={idx}
                      isSelected={isSelected}
                      showFeedback={showFeedback}
                      onClick={() => onAnswer(idx)}
                      isCorrect={isCorrect}
                      isAlmost={isAlmost}
                    />
                  );
                })}
              </div>

              {/* Next Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center pt-4"
              >
                <Button
                  onClick={onNext}
                  disabled={!canProceed}
                  className="h-14 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-gradient-from to-gradient-to hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
                  data-testid="button-next"
                >
                  {showFeedback
                    ? currentQuestion < totalQuestions - 1
                      ? "Next Question"
                      : "See My Results"
                    : "Check Answer"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  index,
  isSelected,
  showFeedback,
  onClick,
  isCorrect,
  isAlmost,
}: {
  option: MultipleChoiceOption;
  index: number;
  isSelected: boolean;
  showFeedback: boolean;
  onClick: () => void;
  isCorrect: boolean;
  isAlmost: boolean;
}) {
  const getFeedbackStyles = () => {
    if (!showFeedback) {
      return isSelected
        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
        : "border-white bg-white/80 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10";
    }

    if (isCorrect) {
      return "border-green-400 bg-green-50";
    }
    if (isAlmost) {
      return "border-yellow-400 bg-yellow-50";
    }
    return "border-red-300 bg-red-50";
  };

  const getFeedbackIcon = () => {
    if (isCorrect) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (isAlmost) {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getFeedbackLabel = () => {
    if (isCorrect) return { text: "EXCELLENT CHOICE", color: "text-green-700" };
    if (isAlmost) return { text: "ALMOST THERE", color: "text-yellow-700" };
    return { text: "NOT IDEAL", color: "text-red-700" };
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!showFeedback ? { scale: 1.01, y: -2 } : undefined}
      whileTap={!showFeedback ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={showFeedback}
      className={`
        relative group w-full text-left p-6 rounded-2xl border-2 border-b-4 transition-all duration-300
        ${getFeedbackStyles()}
        ${showFeedback ? "cursor-default" : "cursor-pointer"}
      `}
      data-testid={`option-q${index}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-base md:text-lg font-medium text-slate-800 flex-1 leading-relaxed">
          {option.text}
        </p>

        {isSelected && !showFeedback && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0"
          >
            <CheckCircle2 className="w-6 h-6 text-primary fill-primary/20" />
          </motion.div>
        )}

        {isSelected && showFeedback && (
          <span className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-gradient-from to-gradient-to text-white text-xs font-bold uppercase tracking-wide rounded-full whitespace-nowrap">
            Your Pick
          </span>
        )}
      </div>

      {/* Feedback Section */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-slate-200/50"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getFeedbackIcon()}</div>
              <div className="space-y-1">
                <p
                  className={`text-sm font-bold uppercase tracking-wide ${getFeedbackLabel().color}`}
                >
                  {getFeedbackLabel().text}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {option.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
