"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Play,
  BookOpen,
  Trophy,
} from "lucide-react";

interface AssessmentPrepProps {
  assessment: {
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    questionCount: number;
    maxAttempts: number;
  };
  attemptNumber: number;
  attemptsRemaining: number;
  onStart: () => void;
  onBack: () => void;
}

export function AssessmentPrep({
  assessment,
  attemptNumber,
  attemptsRemaining,
  onStart,
  onBack,
}: AssessmentPrepProps) {
  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 mb-6 rounded-xl font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Tracks
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-purple-100 border-2 border-purple-200 mb-4">
            <Trophy className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
            {assessment.title}
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">
            {assessment.description}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="border-2 border-slate-200 rounded-2xl">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-800">
                {assessment.questionCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Questions
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 rounded-2xl">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-800">
                {assessment.timeLimit}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Minutes
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 rounded-2xl">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-800">
                {assessment.passingScore}%
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                To Pass
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rules Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-slate-200 rounded-2xl mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Assessment Rules
              </h2>
              <ul className="space-y-3">
                {[
                  "You cannot pause or go back to previous questions",
                  "Your time starts when you click 'Start Assessment'",
                  "For prompt writing questions, you can test your prompt up to 3 times",
                  `You need ${assessment.passingScore}% to pass and earn your certificate`,
                  `You have ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? "s" : ""} remaining`,
                ].map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 font-medium">{rule}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attempt indicator */}
        {attemptNumber > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-center"
          >
            <span className="text-amber-800 font-bold">
              This is attempt #{attemptNumber} of {assessment.maxAttempts}
            </span>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="w-full py-6 text-lg font-extrabold uppercase tracking-wider bg-purple-500 hover:bg-purple-600 text-white rounded-2xl border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
          >
            <Play className="w-6 h-6 mr-2 fill-current" />
            Start Assessment
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
