"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle, Target, Clock, Trophy } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface LevelSelectionProps {
  userId: Id<"users">;
  trackId: Id<"practiceTracks">;
  onBack: () => void;
  onSelectLevel: (levelId: Id<"practiceLevels">) => void;
}

export function LevelSelection({ userId, trackId, onBack, onSelectLevel }: LevelSelectionProps) {
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
      <div className="min-h-screen bg-gradient-to-br from-[#DDF3FE] via-[#E8F5FE] to-[#F0F9FF] flex items-center justify-center">
        <div className="text-gray-700 text-xl font-semibold">Loading levels...</div>
      </div>
    );
  }

  const { levels, progress: trackProgress } = trackDetails;

  // All levels are always unlocked - no locks!
  const getLevelStatus = () => "unlocked";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DDF3FE] via-[#E8F5FE] to-[#F0F9FF] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mb-6 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tracks
          </Button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{trackDetails.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {trackDetails.title}
                </h1>
                <p className="text-gray-700 font-medium">
                  {trackDetails.description}
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            {trackProgress && (
              <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Overall Progress</span>
                  <span className="text-emerald-300 font-semibold">
                    {trackProgress.percentComplete}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${trackProgress.percentComplete}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {trackProgress.totalChallengesCompleted} of {trackProgress.totalChallenges} challenges completed
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
            const isCompleted = level.progress.status === "completed" || level.progress.percentComplete === 100;
            const isInProgress = level.progress.status === "in_progress" && level.progress.percentComplete > 0;

            return (
              <motion.div
                key={level._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "transition-all",
                    isLocked
                      ? "bg-white/40 backdrop-blur-sm border-2 border-gray-200 opacity-60"
                      : "bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl cursor-pointer group"
                  )}
                  onClick={() => !isLocked && onSelectLevel(level._id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Level Number Badge */}
                      <div
                        className={cn(
                          "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
                          isCompleted
                            ? "bg-green-100 text-green-700 border-2 border-green-500"
                            : isInProgress
                              ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                              : isLocked
                                ? "bg-gray-100 text-gray-400 border-2 border-gray-300"
                                : "bg-purple-100 text-purple-700 border-2 border-purple-500"
                        )}
                      >
                        {isLocked ? (
                          <Lock className="w-6 h-6" />
                        ) : isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          level.levelNumber
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              Level {level.levelNumber}: {level.title}
                            </h3>
                            <p className="text-gray-700 text-sm font-medium">
                              {level.description}
                            </p>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {level.challengeCount} challenges
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~{level.estimatedMinutes} min
                          </Badge>
                          {!isLocked && (
                            <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                              {level.requiredScore}% to unlock next
                            </Badge>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {!isLocked && level.progress.percentComplete > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-400">Progress</span>
                              <span className="text-emerald-300 font-semibold">
                                {level.progress.percentComplete}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${level.progress.percentComplete}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {level.progress.challengesCompleted} of {level.challengeCount} completed
                              {level.progress.averageScore > 0 && ` • ${level.progress.averageScore}% avg score`}
                            </p>
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="mt-3 flex items-center gap-2">
                          {isCompleted && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              <Trophy className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                          {isInProgress && !isCompleted && (
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              In Progress
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/30 text-xs">
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
