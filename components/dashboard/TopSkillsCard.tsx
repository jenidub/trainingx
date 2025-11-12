"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { calculateSkillLevel } from "./utils";
import { useEffect, useState } from "react";

interface TopSkillsCardProps {
  skills: Record<string, number>;
}

export function TopSkillsCard({ skills }: TopSkillsCardProps) {
  const [animatedSkills, setAnimatedSkills] = useState<Record<string, number>>({});

  const topSkills = Object.entries(skills)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    const timers: NodeJS.Timeout[] = [];

    const animateSkill = (skillName: string, targetValue: number) => {
      const increment = targetValue / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current += increment;
        if (step >= steps) {
          setAnimatedSkills((prev) => ({ ...prev, [skillName]: targetValue }));
          clearInterval(timer);
        } else {
          setAnimatedSkills((prev) => ({ ...prev, [skillName]: Math.round(current) }));
        }
      }, stepDuration);
      
      timers.push(timer);
    };

    topSkills.forEach(([skill, score]) => {
      animateSkill(skill, score);
    });

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [topSkills]);

  if (topSkills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Complete assessments to see your skills</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle>Top Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSkills.map(([skill, score]) => {
            const { level, color } = calculateSkillLevel(score);
            const animatedScore = animatedSkills[skill] || 0;
            return (
              <div key={skill} className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center justify-between">
                  <span className="capitalize text-sm font-medium">
                    {skill.replace(/_/g, ' ')}
                  </span>
                  <Badge className={color}>{level}</Badge>
                </div>
                <Progress 
                  value={animatedScore} 
                  className="transition-all duration-1000 ease-out" 
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Score: {animatedScore}/100</span>
                  <span>{level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

