"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Flame } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsCardsProps {
  promptScore: number;
  previousPromptScore?: number;
  completedProjects: number;
  availableProjects: number;
  streak: number;
}

export function StatsCards({
  promptScore,
  previousPromptScore,
  completedProjects,
  availableProjects,
  streak,
}: StatsCardsProps) {
  const [animatedPromptScore, setAnimatedPromptScore] = useState(0);
  const [animatedProjects, setAnimatedProjects] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;

    const animateValue = (
      start: number,
      end: number,
      setter: (value: number) => void
    ) => {
      const difference = end - start;
      const increment = difference / steps;
      let current = start;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;
        if (step >= steps) {
          setter(end);
          clearInterval(timer);
        } else {
          setter(Math.round(current));
        }
      }, stepDuration);
    };

    animateValue(0, promptScore, setAnimatedPromptScore);
    animateValue(0, completedProjects, setAnimatedProjects);
    animateValue(0, streak, setAnimatedStreak);
  }, [promptScore, completedProjects, streak]);

  const scoreDiff =
    previousPromptScore && previousPromptScore > 0
      ? promptScore - previousPromptScore
      : null;

  return (
    <div id="onborda-stats" className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
      {/* Practice Score Card */}
      <div className="group relative overflow-hidden rounded-3xl border-2 border-b-[6px] border-blue-200 bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
              Practice Score
            </h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
              <Target className="h-6 w-6 stroke-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-black text-blue-500">
              {animatedPromptScore}
            </span>
            <span className="text-lg font-bold text-slate-300">/100</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden mb-2">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${animatedPromptScore}%` }}
            />
          </div>
          {scoreDiff !== null && (
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {scoreDiff >= 0 ? "+" : ""}
              {scoreDiff} from last check
            </p>
          )}
        </div>
      </div>

      {/* Projects Card */}
      <div className="group relative overflow-hidden rounded-3xl border-2 border-b-[6px] border-purple-200 bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
              Projects
            </h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
              <Trophy className="h-6 w-6 stroke-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-black text-purple-500">
              {animatedProjects}
            </span>
            <span className="text-lg font-bold text-slate-300">Done</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            {availableProjects} more available
          </p>
        </div>
      </div>

      {/* Streak Card */}
      <div className="group relative overflow-hidden rounded-3xl border-2 border-b-[6px] border-orange-200 bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
              Streak
            </h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
              <Flame className="h-6 w-6 stroke-3" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-black text-orange-500">
              {animatedStreak}
            </span>
            <span className="text-lg font-bold text-slate-300">Days</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            You're on fire!
          </p>
        </div>
      </div>
    </div>
  );
}
