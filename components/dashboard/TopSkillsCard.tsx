"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateSkillLevel } from "./utils";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface TopSkillsCardProps {
  skills: Record<string, number>;
}

export function TopSkillsCard({ skills }: TopSkillsCardProps) {
  const [animatedSkills, setAnimatedSkills] = useState<Record<string, number>>(
    {}
  );

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
          setAnimatedSkills((prev) => ({
            ...prev,
            [skillName]: Math.round(current),
          }));
        }
      }, stepDuration);

      timers.push(timer);
    };

    topSkills.forEach(([skill, score]) => {
      animateSkill(skill, score);
    });

    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, [topSkills]);

  if (topSkills.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Zap className="h-6 w-6 stroke-3" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-700">Top Skills</h3>
        </div>
        <p className="text-sm font-medium text-slate-400">
          Complete assessments to see your skills
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
          <Zap className="h-6 w-6 stroke-3" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-700">Top Skills</h3>
      </div>

      <div className="space-y-6">
        {topSkills.map(([skill, score]) => {
          const { level, color } = calculateSkillLevel(score);
          const animatedScore = animatedSkills[skill] || 0;

          // Map color classes to specific tailwind colors for the bar
          const barColor = color.includes("green")
            ? "bg-green-500"
            : color.includes("blue")
              ? "bg-blue-500"
              : color.includes("purple")
                ? "bg-purple-500"
                : color.includes("yellow")
                  ? "bg-yellow-500"
                  : "bg-slate-500";

          return (
            <div key={skill} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="capitalize text-sm font-extrabold text-slate-600">
                  {skill.replace(/_/g, " ")}
                </span>
                <span className="text-xs font-black uppercase tracking-wide text-slate-400">
                  {level}
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                  style={{ width: `${animatedScore}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
