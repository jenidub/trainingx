"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  ChevronRight,
  Loader2,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  pathwayProfiles,
  ScoreCategory,
  YouthQuizResult,
} from "@/data/youth-questions";
import Link from "next/link";

export default function YouthResultsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?._id as any;

  const [results, setResults] = useState<YouthQuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to get results from Convex if logged in
  const quizResults = useQuery(
    api.quizResults.getLatestQuizResult,
    userId ? { userId, quizType: "pathway" } : "skip"
  );

  useEffect(() => {
    if (authLoading) return;

    // If not logged in, redirect to discover
    if (!userId) {
      router.push("/discover");
      return;
    }

    // Try to get results from Convex
    if (quizResults !== undefined) {
      if (quizResults?.answers) {
        // Parse the stored results
        const scores = JSON.parse(
          (quizResults.answers._scores as string) || "{}"
        );
        const filters = JSON.parse(
          (quizResults.answers._filters as string) || "{}"
        );
        const dominantPath = quizResults.answers._dominantPath as ScoreCategory;

        // Remove metadata fields from answers
        const answers = { ...quizResults.answers };
        delete answers._ageGroup;
        delete answers._scores;
        delete answers._filters;
        delete answers._dominantPath;

        setResults({
          scores,
          filters,
          dominantPath,
          answers: answers as Record<string, "a" | "b">,
        });
      }
      setIsLoading(false);
    }
  }, [authLoading, userId, quizResults, router]);

  // Also check localStorage for results (in case they just completed the quiz)
  useEffect(() => {
    const stored = localStorage.getItem("pathway_quiz_results");
    if (stored && !results) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.type === "youth" && parsed.results) {
          setResults(parsed.results);
          setIsLoading(false);
          // Clear localStorage after loading
          localStorage.removeItem("pathway_quiz_results");
        }
      } catch {
        // Invalid data
      }
    }
  }, [results]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Zap className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-900">
              No Results Found
            </h2>
            <p className="text-slate-600">
              It looks like you haven&apos;t completed the assessment yet.
            </p>
            <Link href="/discover">
              <Button className="w-full">Take the Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort pathways by score
  const sortedPathways = Object.entries(results.scores)
    .sort(([, a], [, b]) => b - a)
    .map(([key, score]) => ({
      ...pathwayProfiles[key as ScoreCategory],
      score,
      maxScore: 4,
    }));

  const dominantPathway = sortedPathways[0];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-100/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-slate-100">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-600">
              Your Success Pathway Results
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            You&apos;re a Natural{" "}
            <span className={dominantPathway.color}>
              {dominantPathway.title}!
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {dominantPathway.description}
          </p>
        </motion.div>

        {/* Dominant Pathway Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className={`overflow-hidden border-2 ${dominantPathway.borderColor}`}
          >
            <CardContent className={`p-6 ${dominantPathway.bgColor}`}>
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${dominantPathway.bgColor} ${dominantPathway.color} border-2 ${dominantPathway.borderColor}`}
                >
                  <dominantPathway.icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {dominantPathway.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${dominantPathway.bgColor} ${dominantPathway.color}`}
                    >
                      Top Match
                    </span>
                  </div>
                  <p className="text-slate-600">{dominantPathway.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">
                    {dominantPathway.score}/{dominantPathway.maxScore}
                  </div>
                  <div className="text-sm text-slate-500">Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* All Pathways */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Your Complete Profile
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sortedPathways.map((pathway, index) => (
              <PathwayScoreCard
                key={pathway.id}
                pathway={pathway}
                isTop={index === 0}
                delay={0.3 + index * 0.1}
              />
            ))}
          </div>
        </motion.div>

        {/* Filters Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Personalized For You
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                  {results.filters.hasLaptop
                    ? "💻 Computer Access"
                    : "📱 Mobile-First"}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                  {results.filters.wantsMoney
                    ? "💰 Ready to Earn Now"
                    : "📚 Building Future Skills"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-4 pt-4"
        >
          <p className="text-lg font-medium text-slate-700">
            Ready to start your AI journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="h-12 px-6 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="outline" className="h-12 px-6">
                Start Practicing
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface PathwayScoreCardProps {
  pathway: {
    id: ScoreCategory;
    title: string;
    subtitle: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    score: number;
    maxScore: number;
  };
  isTop: boolean;
  delay: number;
}

function PathwayScoreCard({ pathway, isTop, delay }: PathwayScoreCardProps) {
  const percentage = (pathway.score / pathway.maxScore) * 100;
  const Icon = pathway.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={`overflow-hidden transition-all hover:shadow-md ${
          isTop ? `border-2 ${pathway.borderColor}` : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${pathway.bgColor} ${pathway.color}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-slate-900 truncate">
                  {pathway.title}
                </h4>
                <span className="text-sm font-medium text-slate-600 shrink-0">
                  {pathway.score}/{pathway.maxScore}
                </span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: delay + 0.2, duration: 0.5 }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    isTop
                      ? "from-primary to-indigo-500"
                      : "from-slate-300 to-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
