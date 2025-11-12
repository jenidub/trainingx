"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const scoreDiff = previousPromptScore && previousPromptScore > 0
    ? promptScore - previousPromptScore
    : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-6 mb-8">
      <Card className="py-4 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Prompt Score</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700 transition-all duration-300">
            {animatedPromptScore}/100
          </div>
          <Progress 
            value={animatedPromptScore} 
            className="mt-2 transition-all duration-1000 ease-out" 
          />
          {scoreDiff !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              {scoreDiff >= 0 ? '+' : ''}{scoreDiff} from last assessment
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="py-4 border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
          <Trophy className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700 transition-all duration-300">
            {animatedProjects}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {availableProjects} projects available
          </p>
        </CardContent>
      </Card>

      <Card className="py-4 border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700 transition-all duration-300">
            {animatedStreak} days
          </div>
          <p className="text-xs text-muted-foreground">Keep it going!</p>
        </CardContent>
      </Card>
    </div>
  );
}

