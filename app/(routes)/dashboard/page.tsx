"use client";

import { useEffect, useMemo, useRef } from "react";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { getLiveMatchPreview } from "@/lib/live-matching";
import { useWizardContext } from "@/contexts/WizardContextProvider";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TopSkillsCard } from "@/components/dashboard/TopSkillsCard";
import { CoachPanel } from "@/components/common/CoachPanel";
import { AssessmentHistory } from "@/components/dashboard/AssessmentHistory";
// import { BadgesCard } from "@/components/dashboard/BadgesCard";
import { UnlockedMatchesCard } from "@/components/dashboard/UnlockedMatchesCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { CertificateCard } from "@/components/dashboard/CertificateCard";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

function DashboardContent() {
  const { user } = useAuth();
  const { setContext } = useWizardContext();

  // Initialize onboarding tour (auto-starts for first-time users)
  const { restartTour, closeTour } = useOnboardingTour();

  // Cleanup tour on unmount
  useEffect(() => {
    return () => {
      closeTour();
    };
  }, [closeTour]);

  // Fetch data from Convex
  const totalProjectCount = useQuery(api.projects.getProjectCount);
  const userProgress = useQuery(
    api.users.getUserProgress,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Fetch real user stats from shared context
  const { userStats: userStatsData } = useUserStats();

  // Fetch skills from Elo system (converted to 0-100 display)
  const skillsDisplay = useQuery(
    api.practiceUserSkills.getUserSkillsDisplay,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?._id ? { userId: user._id as any } : "skip"
  );

  const trackProgress = useQuery(
    api.userProgress.getAllTrackProgress,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?._id ? { userId: user._id as any } : "skip"
  );

  // Initialize stats for new users
  const initStats = useMutation(api.users.initializeUserStats);
  const updateStreakMutation = useMutation(api.users.updateStreak);

  // Initialize stats on first load if they don't exist
  useEffect(() => {
    if (user?._id && userStatsData === null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initStats({ userId: user._id as any });
    }
  }, [user?._id, userStatsData, initStats]);

  const hasUpdatedStreak = useRef(false);
  // Update streak once per session when stats load
  useEffect(() => {
    if (hasUpdatedStreak.current) return;
    if (user?._id && userStatsData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateStreakMutation({ userId: user._id as any });
      hasUpdatedStreak.current = true;
    }
  }, [user?._id, userStatsData, updateStreakMutation]);

  const practiceScoreMeta = useMemo(() => {
    if (!userStatsData) {
      return { score: 0, source: "none" as const };
    }

    const completedProjects = Array.isArray(userStatsData.completedProjects)
      ? userStatsData.completedProjects
      : [];

    const recentProjectScores = completedProjects
      .slice()
      .sort((a: any, b: any) => {
        const aTime = new Date(a.completedAt || 0).getTime();
        const bTime = new Date(b.completedAt || 0).getTime();
        return aTime - bTime;
      })
      .slice(-5)
      .map((project: any) => project.finalScore)
      .filter((score: any) => typeof score === "number");

    const projectScore =
      recentProjectScores.length > 0
        ? Math.round(
            recentProjectScores.reduce((sum, score) => sum + score, 0) /
              recentProjectScores.length
          )
        : null;

    const trackScores = Array.isArray(trackProgress)
      ? trackProgress
          .map((progress: any) => progress.percentComplete)
          .filter((score: any) => typeof score === "number")
      : [];

    const trackScore =
      trackScores.length > 0
        ? Math.round(
            trackScores.reduce((sum, score) => sum + score, 0) /
              trackScores.length
          )
        : null;

    const hasProjectScore = projectScore !== null;
    const hasTrackScore = trackScore !== null;

    if (!hasProjectScore && !hasTrackScore) {
      return { score: userStatsData.promptScore || 0, source: "legacy" as const };
    }

    const projectWeight = hasProjectScore ? 0.7 : 0;
    const trackWeight = hasTrackScore ? 0.3 : 0;
    const totalWeight = projectWeight + trackWeight;

    const blendedScore =
      totalWeight > 0
        ? Math.round(
            ((projectScore ?? 0) * projectWeight +
              (trackScore ?? 0) * trackWeight) /
              totalWeight
          )
        : 0;

    return { score: blendedScore, source: "practice" as const };
  }, [userStatsData, trackProgress]);

  // Use default values when data is loading
  const userStats = useMemo(() => {
    if (!userStatsData) {
      return {
        promptScore: 0,
        skills: {} as Record<string, number>,
        completedProjects: [],
        badges: [],
        streak: 0,
        assessmentComplete: false,
        previousPromptScore: undefined,
        previousSkills: undefined,
      };
    }
    return {
      promptScore: practiceScoreMeta.score,
      skills: skillsDisplay || userStatsData.skills || {},
      completedProjects: userProgress || [],
      badges: userStatsData.badges,
      streak: userStatsData.streak,
      assessmentComplete: userStatsData.assessmentComplete,
      previousPromptScore:
        practiceScoreMeta.source === "legacy"
          ? userStatsData.previousPromptScore
          : undefined,
      previousSkills: userStatsData.previousSkills,
    };
  }, [userStatsData, userProgress, skillsDisplay, practiceScoreMeta]);

  // Update wizard context with dashboard info
  useEffect(() => {
    if (userStatsData && userProgress !== undefined) {
      setContext({
        page: "dashboard",
        pageTitle: "Dashboard",
        userState: {
          promptScore: practiceScoreMeta.score,
          skills: userStatsData.skills,
          completedProjects: userProgress.length,
          badges: userStatsData.badges.length,
        },
        recentAction: `Viewing dashboard with ${practiceScoreMeta.score}/100 practice score`,
      });
    }

    return () => setContext(undefined);
  }, [userStatsData, userProgress, setContext]);

  const completedProjectIds = useMemo(() => {
    return userStats.completedProjects.map(
      (p: { projectId?: string; _id?: string }) => p.projectId || p._id
    );
  }, [userStats.completedProjects]);

  const liveMatches = useMemo(() => {
    if (
      totalProjectCount === undefined ||
      (userStats.promptScore === 0 &&
        Object.keys(userStats.skills).length === 0)
    ) {
      return { unlocked: [], almostUnlocked: [], newlyUnlocked: [] };
    }
    return (
      getLiveMatchPreview(
        userStats.promptScore,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userStats.skills as any,
        userStats.completedProjects.length,
        completedProjectIds,
        userStats.previousPromptScore,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userStats.previousSkills as any
      ) || { unlocked: [], almostUnlocked: [], newlyUnlocked: [] }
    );
  }, [userStats, completedProjectIds, totalProjectCount]);

  const availableProjectsCount = useMemo(() => {
    if (totalProjectCount === undefined) return 0;
    const completedCount = completedProjectIds.length;
    return Math.max(0, totalProjectCount - completedCount);
  }, [totalProjectCount, completedProjectIds]);

  return (
    <div className="py-8 bg-slate-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          id="onborda-welcome"
          className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Welcome back, {user?.name || "Friend"}!
            </h1>
            <p className="text-lg font-medium text-slate-500">
              Ready to level up your AI skills today?
            </p>
          </div>
          <Button
            onClick={() => restartTour()}
            variant="outline"
            className="rounded-xl border-2 border-b-4 hover:bg-slate-50 font-bold gap-2 h-11"
          >
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Take Tour
          </Button>
        </div>

        <StatsCards
          promptScore={userStats.promptScore}
          previousPromptScore={userStats.previousPromptScore}
          completedProjects={userStats.completedProjects.length}
          availableProjects={availableProjectsCount}
          streak={userStats.streak}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Score History */}
            <AssessmentHistory userStatsData={userStatsData} />

            {/* Top Skills */}
            <TopSkillsCard skills={userStats.skills} />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* AI Coach Panel */}
            {/* {user?._id && (
                <div className="rounded-3xl border-2 border-b-[6px] border-indigo-200 bg-white overflow-hidden">
                  <CoachPanel userId={user._id as any} />
                </div>
              )} */}

            {/* Certificate Status */}
            <CertificateCard />

            {/* Badges */}
            {/* <BadgesCard userStats={userStats} /> */}

            {/* Unlocked Matches */}
            <UnlockedMatchesCard liveMatches={liveMatches} />

            {/* Quick Actions */}
            <QuickActionsCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SidebarLayout>
      <DashboardContent />
    </SidebarLayout>
  );
}
