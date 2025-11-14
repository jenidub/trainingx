"use client";

import { Sparkles, Trophy, Target } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArenaHero,
  MissionDeckCard,
  XP_PER_LEVEL,
  ratingMeta,
  type Rating,
} from "@/components/prompt-arena";
import { promptArenaDeck } from "@/data/prompt-arena-deck";
import { useAuth } from "@/contexts/AuthContextProvider";

const INITIAL_STATS = {
  xp: 80,
  level: 1,
  streak: 0,
  cardsPlayed: 0,
};

type LeftBadge = {
  title: string;
  icon: ReactNode;
};

export default function PromptArenaPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem("redirectAfterLogin", "/prompt-arena");
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const deck = useMemo(
    () => [...promptArenaDeck].sort(() => Math.random() - 0.5),
    []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isApplyingPrompt, setIsApplyingPrompt] = useState(false);
  const [promptResult, setPromptResult] = useState<string | null>(null);
  const [lastRating, setLastRating] = useState<Rating | null>(null);
  const [stats, setStats] = useState(INITIAL_STATS);

  const currentCard = deck[currentIndex];
  const displayCardNumber = stats.cardsPlayed + (isRevealed ? 0 : 1);
  const nextLevelXp = XP_PER_LEVEL - (stats.xp % XP_PER_LEVEL);
  const heroTiles = [
    {
      label: "Season XP",
      value: `${stats.xp} XP`,
      detail: `${nextLevelXp} XP to Level ${stats.level + 1}`,
    },
    {
      label: "Combo Multiplier",
      value: `x${Math.max(stats.streak || 1, 1)}`,
      detail: stats.streak >= 3 ? "Mini-boss deck primed" : "Keep the streak alive",
    },
    {
      label: "Deck Cycle",
      value: `${displayCardNumber}/${deck.length}`,
      detail: `Cycle ${Math.floor(stats.cardsPlayed / deck.length) + 1}`,
    },
  ];

  const leftBadges: LeftBadge[] = [
    { title: "First Win", icon: <Trophy className="size-4 text-amber-500" /> },
    { title: "Perfect 10", icon: <Sparkles className="size-4 text-emerald-500" /> },
    { title: "Logic Pro", icon: <Target className="size-4 text-cyan-500" /> },
  ];

  const learningProgress = Math.min(100, ((stats.cardsPlayed % 40) / 40) * 100);
  const cardsThisLevel = stats.cardsPlayed % 40;
  const score = stats.xp * 12 + 1100;

  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Charging the arena...
        </div>
      </SidebarLayout>
    );
  }

  if (!isAuthenticated || !currentCard) {
    return null;
  }

  const handleRate = (rating: Rating) => {
    const reward = ratingMeta[rating];
    setIsRevealed(true);
    setLastRating(rating);
    setStats((prev) => {
      const xp = prev.xp + reward.xp * currentCard.skills.length;
      const level = Math.floor(xp / XP_PER_LEVEL) + 1;
      return {
        xp,
        level,
        cardsPlayed: prev.cardsPlayed + 1,
        streak: rating === "bad" ? 0 : prev.streak + 1,
      };
    });
  };

  const handleApplyPrompt = () => {
    setIsApplyingPrompt(true);
    setPromptResult(null);
    setTimeout(() => {
      setPromptResult(currentCard.applyPreview);
      setIsApplyingPrompt(false);
    }, 900);
  };

  const handleNextCard = () => {
    setPromptResult(null);
    setIsApplyingPrompt(false);
    setIsRevealed(false);
    setLastRating(null);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  };

  return (
    <SidebarLayout>
      <div className="min-h-full bg-[#F3F8FD] text-slate-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Practice Zone · Prompt Arena
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Your turn! Draw the next card.
            </h1>
            <p className="text-slate-600">
              Tap into mission-based practice, track streaks, and keep the combo
              alive.
            </p>
          </div>

          <ArenaHero heroTiles={heroTiles} streak={stats.streak} />

          <section className="grid gap-6 lg:grid-cols-[220px_1fr_250px]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.1)]">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  Score
                </p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-teal-600">
                  {score.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">Daily high score streak</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-500">
                  <span>Current Streak</span>
                  <span>{stats.streak} days</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <div
                      key={`${day}-${index}`}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        index < stats.streak
                          ? "bg-teal-400 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.1)]">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                  Badges Earned
                </p>
                <div className="mt-3 flex justify-between gap-3">
                  {leftBadges.map((badge) => (
                    <div key={badge.title} className="text-center text-xs">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                        {badge.icon}
                      </div>
                      <p className="mt-1 text-slate-600">{badge.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <MissionDeckCard
                card={currentCard}
                displayCardNumber={displayCardNumber}
                isRevealed={isRevealed}
                lastRating={lastRating}
                ratingMeta={ratingMeta}
                onRate={handleRate}
                disableRating={isRevealed}
              />
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 text-sm shadow-[0_20px_45px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                    Apply prompt
                  </p>
                  <span className="text-xs font-semibold text-slate-500">
                    {promptResult ? "Coach ready" : "Prep the deck"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    variant="default"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400"
                    onClick={handleApplyPrompt}
                    disabled={!isRevealed || isApplyingPrompt}
                  >
                    Apply Prompt
                  </Button>
                  <Button
                    variant="outline"
                    className="text-slate-700"
                    onClick={handleNextCard}
                    disabled={!isRevealed}
                  >
                    Next Card
                  </Button>
                </div>
                <div className="mt-4 min-h-[90px] rounded-2xl border border-slate-100 bg-slate-50 p-3 text-slate-600">
                  {promptResult ? (
                    <p>{promptResult}</p>
                  ) : (
                    <p className="text-slate-400">
                      Run the prompt to see the coach output.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                      Learning Journey
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      Level {stats.level}
                    </p>
                  </div>
                  <Sparkles className="size-6 text-teal-500" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{cardsThisLevel} / 40 cards</span>
                  </div>
                  <Progress value={learningProgress} className="h-2 bg-slate-200" />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Keep the combo to unlock surprise level drops and bonus badges.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.1)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
                    Daily Bonus
                  </p>
                  <Sparkles className="size-4 text-orange-400" />
                </div>
                <p className="mt-3 text-4xl font-bold text-teal-600">+10 XP</p>
                <p className="text-xs text-slate-500">
                  Hit 3 “Good” runs in a row to bank this power-up.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </SidebarLayout>
  );
}
