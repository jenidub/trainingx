"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  Target,
  Clock,
  Trophy,
  Star,
} from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface LevelSelectionProps {
  userId: Id<"users">;
  trackId: Id<"practiceTracks">;
  onBack: () => void;
  onSelectLevel: (levelId: Id<"practiceLevels">) => void;
}

export function LevelSelection({
  userId,
  trackId,
  onBack,
  onSelectLevel,
}: LevelSelectionProps) {
  const trackDetails = useQuery(api.practiceTracks.getTrackDetails, {
    trackId,
    userId,
  }) as any;

  // Auto-skip to practice if track has only 1 level
  useEffect(() => {
    if (trackDetails?.levels && trackDetails.levels.length === 1) {
      onSelectLevel(trackDetails.levels[0]._id);
    }
  }, [trackDetails, onSelectLevel]);

  if (!trackDetails) {
    return (
      <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-lg font-bold">
            Loading levels...
          </div>
        </div>
      </div>
    );
  }

  const { levels, progress: trackProgress } = trackDetails;

  // All levels are always unlocked - no locks!
  const getLevelStatus = () => "unlocked";

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 mb-6 rounded-xl font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Tracks
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl p-3 bg-white rounded-2xl border-2 border-slate-200">
                {trackDetails.icon}
              </span>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800">
                  {trackDetails.title}
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                  {trackDetails.description}
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            {trackProgress && (
              <div className="mt-6 bg-white rounded-2xl p-6 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-600 font-bold">
                    Overall Progress
                  </span>
                  <span className="text-blue-500 font-black text-lg">
                    {trackProgress.percentComplete}%
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${trackProgress.percentComplete}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-sm text-slate-400 font-bold mt-2">
                  {trackProgress.totalChallengesCompleted} of{" "}
                  {trackProgress.totalChallenges} challenges completed
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Levels List */}
        <div className="space-y-4">
          {levels.map((level: any, index: number) => {
            const levelStatus = getLevelStatus();
            const isLocked = false; // Never locked!
            const isCompleted =
              level.progress.status === "completed" ||
              level.progress.percentComplete === 100;
            const isInProgress =
              level.progress.status === "in_progress" &&
              level.progress.percentComplete > 0;

            return (
              <motion.div
                key={level._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card
                  className={cn(
                    "transition-all border-2 border-b-[6px]",
                    isLocked
                      ? "bg-slate-50 border-slate-200 opacity-60"
                      : "bg-white border-slate-200 hover:border-blue-200 cursor-pointer group"
                  )}
                  onClick={() => !isLocked && onSelectLevel(level._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Level Number Badge */}
                      <div
                        className={cn(
                          "shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-b-4",
                          isCompleted
                            ? "bg-green-100 text-green-600 border-green-200"
                            : isInProgress
                              ? "bg-blue-100 text-blue-600 border-blue-200"
                              : isLocked
                                ? "bg-slate-100 text-slate-400 border-slate-200"
                                : "bg-white text-slate-600 border-slate-200"
                        )}
                      >
                        {isLocked ? (
                          <Lock className="w-6 h-6 stroke-[3px]" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-8 h-8 stroke-[3px]" />
                        ) : (
                          level.levelNumber
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-extrabold text-slate-800 mb-1">
                              Level {level.levelNumber}: {level.title}
                            </h3>
                            <p className="text-slate-500 font-medium">
                              {level.description}
                            </p>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-bold flex items-center gap-1"
                          >
                            <Target className="w-3 h-3" />
                            {level.challengeCount} challenges
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-bold flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />~
                            {level.estimatedMinutes} min
                          </Badge>
                          {!isLocked && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs font-bold flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" />
                              {level.requiredScore}% to pass
                            </Badge>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {!isLocked && level.progress.percentComplete > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500 font-bold">
                                Progress
                              </span>
                              <span className="text-blue-500 font-black">
                                {level.progress.percentComplete}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-blue-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${level.progress.percentComplete}%`,
                                }}
                                transition={{
                                  duration: 0.5,
                                  delay: index * 0.1,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="mt-3 flex items-center gap-2">
                          {isCompleted && (
                            <div className="text-green-600 text-sm font-bold flex items-center">
                              <Trophy className="w-4 h-4 mr-1 stroke-[3px]" />
                              Level Completed!
                            </div>
                          )}
                          {isInProgress && !isCompleted && (
                            <div className="text-blue-600 text-sm font-bold flex items-center">
                              Keep Going!
                            </div>
                          )}
                          {isLocked && (
                            <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-xs font-bold">
                              <Lock className="w-3 h-3 mr-1" />
                              Complete Level {level.levelNumber - 1} to unlock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
