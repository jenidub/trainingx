"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useLocation } from "wouter";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import {
  LevelSection,
  StatsCards,
  LoadingState,
  usePracticeData,
  useUnlockLogic,
} from "@/components/practice";
import { AdaptivePracticeSection } from "@/components/practice/AdaptivePracticeSection";
import { api } from "convex/_generated/api";
import { useAuth } from "@/contexts/AuthContextProvider";

export default function PracticeZonePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const pageData = useQuery(
    api.practiceProjects.getPageData,
    user?._id ? { userId: user._id as any } : {}
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/practice");
      setLocation("/auth");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { projects, stats, completedSlugs, levels, getLevelProgress } =
    usePracticeData(pageData?.projects, pageData?.userStats);

  const { isLevelUnlocked, isProjectUnlocked } = useUnlockLogic(
    projects,
    completedSlugs,
    stats.promptScore
  );

  if (!pageData || !pageData.projects) {
    return (
      <SidebarLayout>
        <LoadingState />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container max-w-6xl mx-auto px-4 py-6 space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold">Practice Zone</h1>
            <p className="text-gray-600">
              Progress through levels, master prompting skills, and unlock new
              challenges.
            </p>
          </header>

          <StatsCards stats={stats} />

          {/* Adaptive Practice Section (Phase 2) */}
          {user?._id && (
            <AdaptivePracticeSection userId={user._id as any} />
          )}

          {/* Original Practice Projects (Phase 1) */}
          <div className="pt-4">
            <h2 className="text-2xl font-bold mb-4">Structured Learning Paths</h2>
          </div>

          {levels.map((level) => {
            const projectsForLevel = projects.filter(
              (project) => project.level === level
            );
            const levelUnlocked = level === 1 ? true : isLevelUnlocked(level);
            const progress = getLevelProgress(level);

            return (
              <LevelSection
                key={level}
                level={level}
                projects={projectsForLevel}
                levelUnlocked={levelUnlocked}
                progress={progress}
                completedSlugs={completedSlugs}
                stats={stats}
                isLevelUnlocked={isLevelUnlocked}
                isProjectUnlocked={isProjectUnlocked}
              />
            );
          })}
        </div>
      </div>
    </SidebarLayout>
  );
}
