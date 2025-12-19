"use client";

import projects from "@/data/projects";
import badgeRules from "@/data/badge-rules.json";
import {
  Award,
  Calendar,
  Download,
  Share2,
  Star,
  Target,
  Trophy,
  Zap,
  Briefcase,
  Medal,
} from "lucide-react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useUserStats } from "@/contexts/UserStatsContext";

const formatSkillName = (skill: string): string => {
  const formatted = skill.replace(/_/g, " ");
  if (/\b(ai|agi)\b/i.test(formatted)) {
    return formatted
      .replace(/\bagi\b/gi, "AGI")
      .replace(/\bai\b/gi, "AI")
      .split(" ")
      .map((word) =>
        word === "AI" || word === "AGI"
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  return formatted
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const getSkillTier = (
  level: number
): { tier: string; color: string; icon: typeof Star } => {
  if (level >= 90)
    return {
      tier: "Expert",
      color: "text-purple-600 bg-purple-100 border-purple-200",
      icon: Award,
    };
  if (level >= 75)
    return {
      tier: "Advanced",
      color: "text-blue-600 bg-blue-100 border-blue-200",
      icon: Zap,
    };
  if (level >= 50)
    return {
      tier: "Intermediate",
      color: "text-green-600 bg-green-100 border-green-200",
      icon: Target,
    };
  return {
    tier: "Novice",
    color: "text-slate-600 bg-slate-100 border-slate-200",
    icon: Star,
  };
};

export default function PortfolioPage() {
  const { user } = useAuth();

  const { userStats } = useUserStats();

  if (!user) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-center">
            <p className="font-bold text-slate-600">
              Please log in to view your portfolio
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (userStats === undefined) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-center">
            <p className="font-bold text-slate-600 animate-pulse">Loading...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!userStats) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Briefcase className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-xl font-extrabold text-slate-800 mb-2">
              No portfolio data yet
            </p>
            <p className="text-slate-500 font-medium">
              Complete projects to build your portfolio
            </p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const completedProjectSlugs =
    userStats.completedProjects?.map((item) => item.slug) || [];
  const completedProjectsData = projects.filter((project) =>
    completedProjectSlugs.includes(project.slug)
  );

  const earnedBadgesData = (userStats.badges || []).map((badgeId) => {
    const badgeRule = badgeRules[badgeId as keyof typeof badgeRules];
    const project = projects.find((p) => p.slug === badgeRule?.project);
    return {
      id: badgeId,
      ...badgeRule,
      projectTitle: project?.title || badgeRule?.project,
    };
  });

  return (
    <SidebarLayout>
      <div className="h-full overflow-auto bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-b-[6px] border-blue-200 bg-white text-blue-500 shadow-sm">
                <Briefcase className="h-8 w-8 stroke-3" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  My Portfolio
                </h1>
                <p className="text-lg font-medium text-slate-500">
                  {completedProjectsData.length} projects completed •{" "}
                  {earnedBadgesData.length} badges earned
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <JuicyButton
                variant="secondary"
                className="gap-2"
                data-testid="button-share"
              >
                <Share2 className="h-5 w-5 stroke-3" />
                Share
              </JuicyButton>
              {/* <JuicyButton className="gap-2" data-testid="button-download">
                <Download className="h-5 w-5 stroke-3" />
                Download PDF
              </JuicyButton> */}
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border-2 border-b-[6px] border-amber-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-amber-500 stroke-3" />
                <span className="text-sm font-bold text-amber-600 uppercase tracking-wide">
                  Prompt Score
                </span>
              </div>
              <div className="text-4xl font-black text-slate-800">
                {userStats.promptScore}
              </div>
            </div>

            <div className="rounded-3xl border-2 border-b-[6px] border-blue-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-blue-500 stroke-3" />
                <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                  Projects Done
                </span>
              </div>
              <div className="text-4xl font-black text-slate-800">
                {completedProjectsData.length}
              </div>
            </div>

            <div className="rounded-3xl border-2 border-b-[6px] border-purple-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-purple-600 stroke-3" />
                <span className="text-sm font-bold text-purple-600 uppercase tracking-wide">
                  Badges Earned
                </span>
              </div>
              <div className="text-4xl font-black text-slate-800">
                {earnedBadgesData.length}
              </div>
            </div>

            <div className="rounded-3xl border-2 border-b-[6px] border-green-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-green-500 stroke-3" />
                <span className="text-sm font-bold text-green-600 uppercase tracking-wide">
                  Weekly Streak
                </span>
              </div>
              <div className="text-4xl font-black text-slate-800">
                {userStats.streak || 0}
              </div>
            </div>
          </section>

          {userStats.skills && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Target className="h-6 w-6 stroke-3" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Skill Mastery
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(userStats.skills).map(([skill, level]) => {
                  const { tier, color, icon: Icon } = getSkillTier(level);
                  return (
                    <div
                      key={skill}
                      className="group relative flex items-center justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div>
                        <p className="text-lg font-extrabold text-slate-700 mb-1">
                          {formatSkillName(skill)}
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Level {level}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 border-2 ${color}`}
                      >
                        <Icon className="h-4 w-4 stroke-3" />
                        <span className="text-xs font-black uppercase tracking-wide">
                          {tier}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                <Calendar className="h-6 w-6 stroke-3" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">
                Completed Projects
              </h2>
            </div>

            {completedProjectsData.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Briefcase className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">
                  No projects yet
                </h3>
                <p className="text-slate-500 font-medium mt-1">
                  Complete your first project to build your portfolio.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {completedProjectsData.map((project) => (
                  <div
                    key={project.slug}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                        {project.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed mb-4">
                        {project.description}
                      </p>
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          Skills Built
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.buildsSkills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600"
                            >
                              {formatSkillName(skill)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {earnedBadgesData.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                  <Medal className="h-6 w-6 stroke-3" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Badges
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {earnedBadgesData.map((badge) => (
                  <div
                    key={badge.id}
                    className="group relative flex flex-col items-center text-center overflow-hidden rounded-3xl border-2 border-b-[6px] border-yellow-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-500">
                      <Award className="h-8 w-8 stroke-3" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                      Min PS: {badge.minPS}
                    </p>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                      Earned by completing {badge.projectTitle}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
