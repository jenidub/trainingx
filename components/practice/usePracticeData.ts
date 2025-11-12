import { useMemo } from "react";
import type { PracticeProject, UserStats, LevelProgress } from "./types";
import { getUnlockPromptScore } from "./utils";

type UsePracticeDataReturn = {
  projects: PracticeProject[];
  stats: UserStats;
  completedSlugs: Set<string>;
  levels: number[];
  getLevelProgress: (level: number) => LevelProgress;
};

export function usePracticeData(
  convexProjects: any[] | undefined,
  userStats: any | undefined
): UsePracticeDataReturn {
  const projects: PracticeProject[] = useMemo(() => {
    if (!convexProjects) return [];
    return convexProjects.map((project) => ({
      slug: project.slug,
      title: project.title,
      description: project.description,
      level: project.level,
      duration: project.estTime,
      reward: project.difficulty * 10,
      skills: project.buildsSkills || [],
      requiresCompletion: project.requiresCompletion,
      isAssessment: project.isAssessment,
      badgeReward: project.badge,
      actionLink: `/practice/${project.slug}`,
      requiresPromptScore: getUnlockPromptScore(
        project.level,
        project.difficulty
      ),
      steps: project.steps || 3,
    }));
  }, [convexProjects]);

  const defaultStats: UserStats = {
    promptScore: 0,
    completedProjects: [],
    badges: [],
    weeklyPracticeMinutes: 0,
  };

  const stats = userStats || defaultStats;
  const completedSlugs = new Set<string>(
    (stats.completedProjects || []).map((project: any) => project.slug as string)
  );

  const levels = Array.from(
    new Set(projects.map((project) => project.level))
  ).sort((a, b) => a - b);

  const getLevelProgress = (level: number) => {
    const items = projects.filter((project) => project.level === level);
    const completed = items.filter((project) =>
      completedSlugs.has(project.slug)
    );
    return {
      completed: completed.length,
      total: items.length,
      percentage:
        items.length === 0
          ? 0
          : Math.round((completed.length / items.length) * 100),
    };
  };

  return {
    projects,
    stats,
    completedSlugs,
    levels,
    getLevelProgress,
  };
}
