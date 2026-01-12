"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rubric } from "@/lib/scoring";
import {
  ArrowRight,
  Trophy,
  Briefcase,
  Target,
  Sparkles,
  Brain,
  Layers,
  Wrench,
  RotateCcw,
} from "lucide-react";

const generatedImage =
  "/assets/generated_images/soft_abstract_3d_shapes_on_white_background_for_light_mode_ui.png";

interface ResultsScreenProps {
  userName: string;
  promptScore: number;
  rubric: Rubric;
  feedback: {
    greeting: string;
    encouragement: string;
  };
  motivationalMsg: string;
  onGetStarted: () => void;
  onMatchingQuiz: () => void;
}

const dimensions = [
  { key: "clarity", label: "AI Intuition", icon: Sparkles, color: "blue" },
  {
    key: "constraints",
    label: "Technical Control",
    icon: Layers,
    color: "purple",
  },
  { key: "tool", label: "Model Fluency", icon: Wrench, color: "orange" },
];

export function ResultsScreen({
  promptScore,
  rubric,
  feedback,
  motivationalMsg,
  onGetStarted,
  onMatchingQuiz,
}: ResultsScreenProps) {
  const getScoreColor = (score: number, max: number = 25) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return { text: "text-green-600", bg: "bg-green-500" };
    if (percentage >= 50)
      return { text: "text-yellow-600", bg: "bg-yellow-500" };
    return { text: "text-red-600", bg: "bg-red-500" };
  };

  const scoreColor = getScoreColor(promptScore, 100);

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

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-gradient-from to-gradient-to shadow-lg shadow-primary/30"
              >
                <Trophy className="h-12 w-12 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-wider text-slate-600 shadow-sm border-2 border-b-4 border-slate-200"
              >
                <Sparkles className="h-4 w-4 fill-current text-yellow-400" />
                <span>Assessment Complete</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl md:text-3xl font-extrabold text-slate-900"
              >
                {feedback.greeting}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-slate-500 max-w-xl mx-auto"
              >
                {feedback.encouragement}
              </motion.p>
            </div>

            {/* Score Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="flex justify-center"
            >
              <div className="relative inline-flex items-center justify-center">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#e5e7eb"
                    strokeWidth="14"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke={
                      promptScore / 100 >= 0.7
                        ? "#16a34a"
                        : promptScore / 100 >= 0.5
                          ? "#ca8a04"
                          : "#dc2626"
                    }
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 84}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 84 * (1 - promptScore / 100),
                    }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className={`text-6xl font-black ${scoreColor.text}`}
                  >
                    {promptScore}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="text-sm font-bold text-slate-400 uppercase tracking-wide"
                  >
                    Prompt Score
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Dimension Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {dimensions.map((dim, index) => {
                const score = rubric[dim.key as keyof Rubric];
                const percentage = (score / 25) * 100;
                const color = getScoreColor(score);

                return (
                  <motion.div
                    key={dim.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    className="relative overflow-hidden rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-slate-100">
                        <dim.icon className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        {dim.label}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-3xl font-black ${color.text}`}>
                        {score}
                      </span>
                      <span className="text-sm font-bold text-slate-400">
                        /25
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 1.3 + index * 0.1 }}
                        className={`h-full rounded-full ${color.bg}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Motivational Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className={`rounded-2xl border-2 border-b-4 p-6 ${
                promptScore >= 80
                  ? "bg-green-50 border-green-200"
                  : promptScore >= 70
                    ? "bg-emerald-50 border-emerald-200"
                    : promptScore >= 50
                      ? "bg-blue-50 border-blue-200"
                      : "bg-purple-50 border-purple-200"
              }`}
            >
              <p
                className={`text-base font-medium leading-relaxed ${
                  promptScore >= 80
                    ? "text-green-800"
                    : promptScore >= 70
                      ? "text-emerald-800"
                      : promptScore >= 50
                        ? "text-blue-800"
                        : "text-purple-800"
                }`}
              >
                {motivationalMsg}
              </p>
            </motion.div>

            {/* Action Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 }}
              className="grid md:grid-cols-2 gap-4"
            >
              {/* Career Match CTA */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-b-4 border-primary/30 bg-gradient-to-br from-primary/5 to-indigo-50 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to text-white">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                      Find Your AI Career Match
                    </h3>
                    <p className="text-sm text-slate-500">
                      Discover which AI opportunities align with your skills and
                      goals.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onMatchingQuiz}
                  variant="outline"
                  className="w-full h-12 text-base font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                  size="lg"
                  data-testid="button-matching-quiz"
                >
                  Take Career Match Quiz
                  <Target className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Get Started CTA */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                      Start Training Now
                    </h3>
                    <p className="text-sm text-slate-500">
                      Jump into practice exercises and improve your prompt
                      skills.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onGetStarted}
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-gradient-from to-gradient-to rounded-xl shadow-lg shadow-primary/20"
                  size="lg"
                  data-testid="button-get-started"
                >
                  Get Started with TrainingX.AI
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
