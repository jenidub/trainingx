import { useMemo } from "react";
import type { PracticeProject, UserStats } from "./types";

export function useUnlockLogic(
  projects: PracticeProject[],
  completedSlugs: Set<string>,
  promptScore: number
) {
  return useMemo(() => {
    const levelUnlockCache = new Map<number, boolean>();
    const projectUnlockCache = new Map<string, boolean>();

    const checkLevelUnlocked = (level: number): boolean => {
      if (levelUnlockCache.has(level)) return levelUnlockCache.get(level)!;

      if (level === 1) {
        levelUnlockCache.set(level, true);
        return true;
      }
      if (projects.length === 0) {
        levelUnlockCache.set(level, false);
        return false;
      }

      const previousLevel = level - 1;
      const previousLevelProjects = projects.filter(
        (p) => p.level === previousLevel && !p.isAssessment
      );
      if (previousLevelProjects.length === 0) {
        levelUnlockCache.set(level, false);
        return false;
      }

      const unlocked = previousLevelProjects.every((p) =>
        completedSlugs.has(p.slug)
      );
      levelUnlockCache.set(level, unlocked);
      return unlocked;
    };

    const checkProjectUnlocked = (project: PracticeProject): boolean => {
      if (projectUnlockCache.has(project.slug))
        return projectUnlockCache.get(project.slug)!;

      const levelUnlocked = checkLevelUnlocked(project.level);
      if (!levelUnlocked) {
        projectUnlockCache.set(project.slug, false);
        return false;
      }

      if (project.level === 1) {
        if (
          !project.requiresCompletion ||
          project.requiresCompletion.length === 0
        ) {
          projectUnlockCache.set(project.slug, true);
          return true;
        }
        if (project.isAssessment) {
          const siblings = projects.filter(
            (item) => item.level === project.level && !item.isAssessment
          );
          if (siblings.length === 0) {
            projectUnlockCache.set(project.slug, false);
            return false;
          }
          const unlocked = siblings.some((item) =>
            completedSlugs.has(item.slug)
          );
          projectUnlockCache.set(project.slug, unlocked);
          return unlocked;
        }
        const unlocked = project.requiresCompletion.every((slug) =>
          completedSlugs.has(slug)
        );
        projectUnlockCache.set(project.slug, unlocked);
        return unlocked;
      }

      if (
        project.requiresPromptScore !== undefined &&
        promptScore < project.requiresPromptScore
      ) {
        projectUnlockCache.set(project.slug, false);
        return false;
      }

      if (
        !project.requiresCompletion ||
        project.requiresCompletion.length === 0
      ) {
        projectUnlockCache.set(project.slug, true);
        return true;
      }

      if (project.isAssessment) {
        const siblings = projects.filter(
          (item) => item.level === project.level && !item.isAssessment
        );
        if (siblings.length === 0) {
          projectUnlockCache.set(project.slug, false);
          return false;
        }
        const unlocked = siblings.some((item) => completedSlugs.has(item.slug));
        projectUnlockCache.set(project.slug, unlocked);
        return unlocked;
      }

      const unlocked = project.requiresCompletion.every((slug) =>
        completedSlugs.has(slug)
      );
      projectUnlockCache.set(project.slug, unlocked);
      return unlocked;
    };

    return {
      isLevelUnlocked: checkLevelUnlocked,
      isProjectUnlocked: checkProjectUnlocked,
    };
  }, [projects, completedSlugs, promptScore]);
}
