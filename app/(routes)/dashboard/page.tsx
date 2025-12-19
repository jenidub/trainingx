"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
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
import { getNextBestAction } from "@/components/dashboard/utils";
import { JuicyButton } from "@/components/ui/juicy-button";
import {
  Target,
  Trophy,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Flame,
  Zap,
  Calendar,
  Star,
} from "lucide-react";
import badgeRules from "@/data/badge-rules.json";

export default function DashboardPage() {
  const { user } = useAuth();
  const { setContext } = useWizardContext();

  // Fetch data from Convex
  const projects = useQuery(api.projects.getProjects, { limit: 20 });
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
      promptScore: userStatsData.promptScore,
      skills: skillsDisplay || userStatsData.skills || {},
      completedProjects: userProgress || [],
      badges: userStatsData.badges,
      streak: userStatsData.streak,
      assessmentComplete: userStatsData.assessmentComplete,
      previousPromptScore: userStatsData.previousPromptScore,
      previousSkills: userStatsData.previousSkills,
    };
  }, [userStatsData, userProgress, skillsDisplay]);

  // Update wizard context with dashboard info
  useEffect(() => {
    if (userStatsData && userProgress !== undefined) {
      setContext({
        page: "dashboard",
        pageTitle: "Dashboard",
        userState: {
          promptScore: userStatsData.promptScore,
          skills: userStatsData.skills,
          completedProjects: userProgress.length,
          badges: userStatsData.badges.length,
        },
        recentAction: `Viewing dashboard with ${userStatsData.promptScore}/100 prompt score`,
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
      !projects ||
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
  }, [userStats, completedProjectIds, projects]);

  const availableProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => !completedProjectIds.includes(p._id));
  }, [projects, completedProjectIds]);

  const nextAction = useMemo(() => {
    return getNextBestAction(
      userStats.assessmentComplete,
      userStats.completedProjects.length,
      liveMatches?.almostUnlocked?.length || 0
    );
  }, [
    userStats.assessmentComplete,
    userStats.completedProjects.length,
    liveMatches,
  ]);

  return (
    <SidebarLayout>
      <div className="py-8 bg-slate-50 min-h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Welcome back, {user?.name || "Friend"}!
            </h1>
            <p className="text-lg font-medium text-slate-500">
              Ready to level up your AI skills today?
            </p>
          </div>

          <StatsCards
            promptScore={userStats.promptScore}
            previousPromptScore={userStats.previousPromptScore}
            completedProjects={userStats.completedProjects.length}
            availableProjects={availableProjects.length}
            streak={userStats.streak}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Score Breakdown */}
              {userStatsData && (
                <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
                        <Target className="h-7 w-7 stroke-3" />
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-700">
                          Prompt Score Breakdown
                        </h2>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                          Your AI Proficiency
                        </p>
                      </div>
                    </div>
                    {userStatsData.previousPromptScore &&
                      userStatsData.previousPromptScore > 0 &&
                      userStatsData.promptScore >
                        userStatsData.previousPromptScore && (
                        <div className="flex items-center gap-1 rounded-xl bg-green-100 px-3 py-1 text-sm font-black text-green-600">
                          <TrendingUp className="h-4 w-4 stroke-3" />
                          <span>
                            +
                            {userStatsData.promptScore -
                              userStatsData.previousPromptScore}
                          </span>
                        </div>
                      )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {[
                      {
                        label: "Clarity",
                        value: userStatsData.rubric?.clarity || 0,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Constraints",
                        value: userStatsData.rubric?.constraints || 0,
                        color: "bg-purple-500",
                      },
                      {
                        label: "Iteration",
                        value: userStatsData.rubric?.iteration || 0,
                        color: "bg-green-500",
                      },
                      {
                        label: "Tool Selection",
                        value: userStatsData.rubric?.tool || 0,
                        color: "bg-orange-500",
                      },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="font-bold text-slate-600">
                            {item.label}
                          </span>
                          <span className="text-sm font-black text-slate-400">
                            {item.value}/25
                          </span>
                        </div>
                        <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${(item.value / 25) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <Link href="/quiz">
                      <JuicyButton
                        variant="outline"
                        className="w-full border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <Target className="mr-2 h-5 w-5" />
                        Retake Assessment
                      </JuicyButton>
                    </Link>
                  </div>
                </div>
              )}

              {/* Score History */}
              {userStatsData?.assessmentHistory &&
                userStatsData.assessmentHistory.length > 1 && (
                  <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                        <Calendar className="h-6 w-6 stroke-3" />
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-700">
                        Recent Progress
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {userStatsData.assessmentHistory
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .map((assessment: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-slate-200 font-black text-slate-400 text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="font-bold text-slate-700">
                                  {new Date(assessment.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                  Assessment
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-xl font-black text-slate-700">
                                {assessment.promptScore}
                              </div>
                              {idx <
                                userStatsData.assessmentHistory.length - 1 && (
                                <div
                                  className={`px-2 py-1 rounded-lg text-xs font-black ${
                                    assessment.promptScore >
                                    userStatsData.assessmentHistory[
                                      userStatsData.assessmentHistory.length -
                                        idx -
                                        2
                                    ].promptScore
                                      ? "bg-green-100 text-green-600"
                                      : "bg-slate-200 text-slate-500"
                                  }`}
                                >
                                  {assessment.promptScore >
                                  userStatsData.assessmentHistory[
                                    userStatsData.assessmentHistory.length -
                                      idx -
                                      2
                                  ].promptScore
                                    ? `+${assessment.promptScore - userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore}`
                                    : `${assessment.promptScore - userStatsData.assessmentHistory[userStatsData.assessmentHistory.length - idx - 2].promptScore}`}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Top Skills */}
              <TopSkillsCard skills={userStats.skills} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Coach Panel */}
              {user?._id && (
                <div className="rounded-3xl border-2 border-b-[6px] border-indigo-200 bg-white overflow-hidden">
                  <CoachPanel userId={user._id as any} />
                </div>
              )}

              {/* Badges */}
              <div className="rounded-3xl border-2 border-b-[6px] border-yellow-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                    <Trophy className="h-6 w-6 stroke-3" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-700">
                    Badges
                  </h3>
                </div>

                {userStats.badges && userStats.badges.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(badgeRules)
                      .filter(([badgeId]) => userStats.badges.includes(badgeId))
                      .map(([badgeId, badge]: [string, any]) => (
                        <div
                          key={badgeId}
                          className="flex flex-col items-center p-2 rounded-xl bg-yellow-50 text-center"
                        >
                          <div className="h-8 w-8 rounded-full bg-yellow-200 flex items-center justify-center mb-1">
                            <Star className="h-4 w-4 text-yellow-600 fill-current" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 leading-tight">
                            {badge.name}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-4 px-2 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400">
                      No badges yet.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Complete projects to earn them!
                    </p>
                  </div>
                )}
              </div>

              {/* Unlocked Matches */}
              {liveMatches.unlocked.length > 0 && (
                <div className="rounded-3xl border-2 border-b-[6px] border-green-200 bg-white p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                      <BriefcaseIcon className="h-6 w-6 stroke-3" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-700">
                      Matches
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    {liveMatches.unlocked
                      .slice(0, 3)
                      .map((match: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-green-50 border-2 border-green-100"
                        >
                          <div className="text-sm font-bold text-slate-700 truncate max-w-[140px]">
                            {match.title}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-wide text-green-600 bg-green-200 px-2 py-0.5 rounded-lg">
                            {match.type}
                          </div>
                        </div>
                      ))}
                  </div>
                  <Link href="/matching">
                    <JuicyButton
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      View All Matches
                    </JuicyButton>
                  </Link>
                </div>
              )}

              {/* Quick Actions */}
              <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Zap className="h-6 w-6 stroke-3" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-700">
                    Quick Actions
                  </h3>
                </div>

                <div className="space-y-3">
                  <Link href="/practice" className="block">
                    <JuicyButton
                      variant="outline"
                      className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Target className="mr-3 h-5 w-5 text-blue-500" />
                      Practice Zone
                    </JuicyButton>
                  </Link>
                  <Link href="/portfolio" className="block">
                    <JuicyButton
                      variant="outline"
                      className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Trophy className="mr-3 h-5 w-5 text-purple-500" />
                      View Portfolio
                    </JuicyButton>
                  </Link>
                  <Link href="/matching" className="block">
                    <JuicyButton
                      variant="outline"
                      className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <TrendingUp className="mr-3 h-5 w-5 text-green-500" />
                      Career Matching
                    </JuicyButton>
                  </Link>
                  <Link href="/community" className="block">
                    <JuicyButton
                      variant="outline"
                      className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      <Sparkles className="mr-3 h-5 w-5 text-yellow-500" />
                      Community
                    </JuicyButton>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
