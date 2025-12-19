"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/StarRating";
import {
  Trophy,
  XCircle,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  Download,
  Share2,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useState, useEffect } from "react";

interface CategoryResult {
  name: string;
  correct: number;
  total: number;
}

interface AssessmentResultsProps {
  passed: boolean;
  score: number;
  passingScore: number;
  timeSpent: number; // in seconds
  correctCount: number;
  totalQuestions: number;
  categories?: CategoryResult[];
  certificateUrl?: string;
  onRetry?: () => void;
  onViewCertificate?: () => void;
  onBack: () => void;
  cooldownHours?: number;
}

export function AssessmentResults({
  passed,
  score,
  passingScore,
  timeSpent,
  correctCount,
  totalQuestions,
  categories,
  certificateUrl,
  onRetry,
  onViewCertificate,
  onBack,
  cooldownHours = 24,
}: AssessmentResultsProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(passed);

  useEffect(() => {
    if (passed) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [passed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;

  return (
    <div className="min-h-full bg-slate-50 pb-12 relative">
      {/* Confetti for passing */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Result header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={cn(
              "inline-flex items-center justify-center w-24 h-24 rounded-full mb-4",
              passed
                ? "bg-green-100 border-4 border-green-300"
                : "bg-red-100 border-4 border-red-300"
            )}
          >
            {passed ? (
              <Trophy className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "text-4xl font-extrabold mb-2",
              passed ? "text-green-700" : "text-red-700"
            )}
          >
            {passed ? "Congratulations!" : "Not Quite There"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-slate-500 font-medium"
          >
            {passed
              ? "You've earned your Domain Mastery Certificate!"
              : `You needed ${passingScore}% to pass. Keep practicing!`}
          </motion.p>
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card
            className={cn(
              "border-2 border-b-4 rounded-2xl mb-6",
              passed ? "border-green-200" : "border-slate-200"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <div
                    className={cn(
                      "text-5xl font-black",
                      passed ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {score}%
                  </div>
                  <div className="text-sm font-semibold text-slate-500 mt-1">
                    Your Score
                  </div>
                </div>

                {passed && <StarRating stars={stars} size="lg" animated />}

                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {correctCount}/{totalQuestions}
                  </div>
                  <div className="text-sm font-semibold text-slate-500 mt-1">
                    Correct
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-800">
                      {formatTime(timeSpent)}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      Time Spent
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-800">
                      {passingScore}%
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      Passing Score
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category breakdown (for failed attempts) */}
        {!passed && categories && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-2 border-slate-200 rounded-2xl mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 mb-4">
                  Areas to Review
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const percent = Math.round((cat.correct / cat.total) * 100);
                    const isPassing = percent >= 70;

                    return (
                      <div key={cat.name} className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center",
                            isPassing ? "bg-green-100" : "bg-red-100"
                          )}
                        >
                          {isPassing ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <span className="flex-1 font-semibold text-slate-700">
                          {cat.name}
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            isPassing ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {cat.correct}/{cat.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          {passed ? (
            <>
              {onViewCertificate && (
                <Button
                  onClick={onViewCertificate}
                  size="lg"
                  className="w-full py-5 text-lg font-extrabold uppercase tracking-wider bg-green-500 hover:bg-green-600 text-white rounded-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                  <Download className="w-5 h-5 mr-2" />
                  View Certificate
                </Button>
              )}

              <Button
                onClick={onBack}
                variant="outline"
                size="lg"
                className="w-full py-5 text-lg font-bold rounded-2xl border-2"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Continue Learning
              </Button>
            </>
          ) : (
            <>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  size="lg"
                  className="w-full py-5 text-lg font-extrabold uppercase tracking-wider bg-purple-500 hover:bg-purple-600 text-white rounded-2xl border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
              )}

              <p className="text-center text-sm text-slate-500 font-medium">
                You can retry after {cooldownHours} hours
              </p>

              <Button
                onClick={onBack}
                variant="outline"
                size="lg"
                className="w-full py-5 text-lg font-bold rounded-2xl border-2"
              >
                Review Tracks
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
