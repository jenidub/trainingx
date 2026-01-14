"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";
import {
  youthQuestions,
  calculateYouthResults,
  YouthQuizResult,
} from "@/data/youth-questions";
import { questions as adultQuestions } from "@/data/questions";

import { PathwayWelcome } from "@/components/pathway/PathwayWelcome";
import { AgeSelection } from "@/components/pathway/AgeSelection";
import { AdultTypeSelection } from "@/components/pathway/AdultTypeSelection";
import { PathwayQuiz } from "@/components/pathway/PathwayQuiz";
import { PathwayCongratulations } from "@/components/pathway/PathwayCongratulations";

const STORAGE_KEY = "pathway_quiz_state";

type FlowStep =
  | "welcome"
  | "age"
  | "adult-type"
  | "quiz"
  | "congratulations"
  | "results";

type AgeGroup = "youth" | "adult" | null;
type AdultType = "student" | "professional" | null;

interface QuizState {
  step: FlowStep;
  ageGroup: AgeGroup;
  adultType: AdultType;
  currentQuestionIndex: number;
  answers: Record<string, string>;
}

const initialState: QuizState = {
  step: "welcome",
  ageGroup: null,
  adultType: null,
  currentQuestionIndex: 0,
  answers: {},
};

export default function DiscoverPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?._id as any;

  const [state, setState] = useState<QuizState>(initialState);
  const [isCalculating, setIsCalculating] = useState(false);

  const saveQuizResult = useMutation(api.quizResults.saveQuizResult);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Don't restore if they were at results/congratulations - start fresh
        if (parsed.step !== "results" && parsed.step !== "congratulations") {
          setState(parsed);
        }
      } catch {
        // Invalid state, use default
      }
    }
  }, []);

  // Save state to localStorage on change
  useEffect(() => {
    if (state.step !== "welcome") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const currentQuestions =
    state.ageGroup === "youth" ? youthQuestions : adultQuestions;

  const updateState = (updates: Partial<QuizState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleStartAssessment = () => {
    updateState({ step: "age" });
  };

  const handleAgeSelect = (ageGroup: AgeGroup) => {
    updateState({
      ageGroup,
      step: ageGroup === "adult" ? "adult-type" : "quiz",
      currentQuestionIndex: 0,
      answers: {},
    });
  };

  const handleAdultTypeSelect = (adultType: AdultType) => {
    updateState({
      adultType,
      step: "quiz",
      currentQuestionIndex: 0,
      answers: {},
    });
  };

  const handleBack = () => {
    if (state.currentQuestionIndex > 0) {
      // Go to previous question
      updateState({
        currentQuestionIndex: state.currentQuestionIndex - 1,
      });
    } else {
      // At first question, go back to age/adult-type selection
      if (state.ageGroup === "adult") {
        updateState({ step: "adult-type" });
      } else {
        updateState({ step: "age" });
      }
    }
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...state.answers, [questionId]: answer };
    const isLastQuestion =
      state.currentQuestionIndex >= currentQuestions.length - 1;

    if (isLastQuestion) {
      // Quiz complete - calculate and save results
      setIsCalculating(true);
      updateState({ answers: newAnswers });

      // Small delay for animation
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (state.ageGroup === "youth") {
        const results = calculateYouthResults(
          newAnswers as Record<string, "a" | "b">
        );
        await saveResults(results);
      } else {
        await saveAdultResults(newAnswers);
      }

      setIsCalculating(false);

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // If logged in, go to results; otherwise show sign-up gate
      if (userId) {
        if (state.ageGroup === "youth") {
          router.push("/discover/results");
        } else {
          router.push("/matching");
        }
      } else {
        updateState({ step: "congratulations", answers: newAnswers });
      }
    } else {
      // Move to next question
      updateState({
        answers: newAnswers,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      });
    }
  };

  const saveResults = async (results: YouthQuizResult) => {
    if (!userId) {
      // Save to localStorage for after sign-up
      localStorage.setItem(
        "pathway_quiz_results",
        JSON.stringify({
          type: "youth",
          results,
          completedAt: new Date().toISOString(),
        })
      );
      return;
    }

    try {
      await saveQuizResult({
        userId,
        quizType: "pathway",
        answers: {
          ...results.answers,
          _ageGroup: "youth",
          _scores: JSON.stringify(results.scores),
          _filters: JSON.stringify(results.filters),
          _dominantPath: results.dominantPath,
        },
      });
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      // Fallback to localStorage
      localStorage.setItem(
        "pathway_quiz_results",
        JSON.stringify({
          type: "youth",
          results,
          completedAt: new Date().toISOString(),
        })
      );
    }
  };

  const saveAdultResults = async (answers: Record<string, string>) => {
    if (!userId) {
      localStorage.setItem(
        "pathway_quiz_results",
        JSON.stringify({
          type: "adult",
          adultType: state.adultType,
          answers,
          completedAt: new Date().toISOString(),
        })
      );
      return;
    }

    try {
      await saveQuizResult({
        userId,
        quizType: "matching",
        answers: {
          ...answers,
          _adultType: state.adultType || "professional",
        },
      });
    } catch (error) {
      console.error("Failed to save quiz results:", error);
      localStorage.setItem(
        "pathway_quiz_results",
        JSON.stringify({
          type: "adult",
          adultType: state.adultType,
          answers,
          completedAt: new Date().toISOString(),
        })
      );
    }
  };

  const handleSignUp = () => {
    // Redirect to sign up, the results are already saved in localStorage
    router.push("/sign-up?redirect=/discover/results");
  };

  const progress =
    state.step === "quiz"
      ? ((state.currentQuestionIndex + 1) / currentQuestions.length) * 100
      : 0;

  const currentQuestion = currentQuestions[state.currentQuestionIndex];

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50">
      {/* Background with subtle dot pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0074b9]/5 via-transparent to-[#46bc61]/5" />
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Progress Bar (only during quiz) */}
      {state.step === "quiz" && (
        <div className="w-full h-2 bg-slate-200 z-20">
          <div
            className="h-full theme-gradient-r transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        <AnimatePresence mode="wait">
          {state.step === "welcome" && (
            <PathwayWelcome key="welcome" onStart={handleStartAssessment} />
          )}

          {state.step === "age" && (
            <AgeSelection key="age" onSelect={handleAgeSelect} />
          )}

          {state.step === "adult-type" && (
            <AdultTypeSelection
              key="adult-type"
              onSelect={handleAdultTypeSelect}
            />
          )}

          {state.step === "quiz" && currentQuestion && (
            <PathwayQuiz
              key={`quiz-${currentQuestion.id}`}
              question={currentQuestion}
              questionNumber={state.currentQuestionIndex + 1}
              totalQuestions={currentQuestions.length}
              isYouth={state.ageGroup === "youth"}
              onAnswer={(answer) => handleAnswer(currentQuestion.id, answer)}
              onBack={handleBack}
              canGoBack={true}
              isCalculating={isCalculating}
            />
          )}

          {state.step === "congratulations" && (
            <PathwayCongratulations
              key="congratulations"
              ageGroup={state.ageGroup}
              onSignUp={handleSignUp}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
