"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Star,
  Trophy,
} from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DomainSelectionProps {
  userId: Id<"users">;
  onSelectDomain: (domainId: Id<"practiceDomains">, slug: string) => void;
}

export function DomainSelection({
  userId,
  onSelectDomain,
}: DomainSelectionProps) {
  const domains = useQuery(api.practiceDomains.listWithUnlockStatus, {
    userId,
  }) as any;

  if (!domains) {
    return (
      <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-lg font-bold">
            Loading domains...
          </div>
        </div>
      </div>
    );
  }

  const starterDomain = domains.find((d: any) => d.isStarter);
  const specializedDomains = domains.filter((d: any) => !d.isStarter);
  const hasUnlockedSpecialized = specializedDomains.some(
    (d: any) => d.isUnlocked
  );
  const unlockedCount = specializedDomains.filter(
    (d: any) => d.isUnlocked
  ).length;

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Practice Zone
            </h1>
            <p className="text-xl font-medium text-slate-500">
              Master AI prompting across every domain
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                  <Zap className="h-6 w-6 stroke-[3px]" />
                </div>
                <span className="font-bold text-slate-600">
                  Specialized Domains
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-slate-700">
                  {unlockedCount}
                </span>
                <span className="text-xl font-bold text-slate-400">
                  / {specializedDomains.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Starter Domain */}
        {starterDomain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
                <Star className="h-6 w-6 stroke-[3px]" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-700">
                {hasUnlockedSpecialized ? "Continue Learning" : "Start Here"}
              </h2>
            </div>

            <motion.div
              whileHover={{ scale: 1.01, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className="bg-white border-2 border-b-[6px] border-slate-200 hover:border-blue-200 rounded-3xl transition-all cursor-pointer group overflow-hidden"
                onClick={() =>
                  onSelectDomain(starterDomain._id, starterDomain.slug)
                }
              >
                <CardContent className="px-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-4">
                        <motion.div
                          className="text-6xl p-4 bg-blue-50 rounded-3xl border-2 border-blue-100"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {starterDomain.icon}
                        </motion.div>
                        <div>
                          <h3 className="text-3xl font-extrabold text-slate-800 mb-2">
                            {starterDomain.title}
                          </h3>
                          <p className="text-lg text-slate-500 font-medium max-w-xl">
                            {starterDomain.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-6">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 font-bold"
                        >
                          {starterDomain.trackCount} tracks
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1 font-bold"
                        >
                          Essential for everyone
                        </Badge>
                      </div>
                    </div>

                    <div className="self-center">
                      <div
                        className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white
                          shadow-[0_4px_0_0_#2563eb] active:shadow-none active:translate-y-[4px] transition-all"
                      >
                        <ArrowRight className="w-8 h-8 stroke-[3px]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Specialized Domains */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                <Trophy className="h-6 w-6 stroke-[3px]" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-700">
                {hasUnlockedSpecialized
                  ? "Specialized Domains"
                  : "Unlock Specialized Domains"}
              </h2>
            </div>
            {!hasUnlockedSpecialized && (
              <Badge
                variant="outline"
                className="text-slate-500 border-slate-300 bg-slate-100 font-bold px-3 py-1"
              >
                Complete Level 1 to unlock
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TooltipProvider>
              {specializedDomains.map((domain: any, index: number) => (
                <motion.div
                  key={domain._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={domain.isUnlocked ? { scale: 1.02, y: -4 } : {}}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className={cn(
                          "h-full transition-all border-2 border-b-[6px] rounded-3xl relative overflow-hidden",
                          domain.isUnlocked
                            ? "bg-white border-slate-200 hover:border-purple-200 hover:shadow-lg cursor-pointer group"
                            : "bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed"
                        )}
                        onClick={() =>
                          domain.isUnlocked &&
                          onSelectDomain(domain._id, domain.slug)
                        }
                      >
                        <CardContent className="px-6 py-6 font-medium">
                          <div className="flex items-start justify-between mb-4">
                            <motion.span
                              className={cn(
                                "text-5xl p-3 rounded-2xl border-2 transition-colors",
                                domain.isUnlocked
                                  ? "bg-purple-50 border-purple-100 text-purple-600 group-hover:scale-110 duration-200"
                                  : "bg-slate-100 border-slate-200 grayscale"
                              )}
                            >
                              {domain.icon}
                            </motion.span>
                            {!domain.isUnlocked && (
                              <div className="bg-slate-200 p-2 rounded-xl">
                                <Lock className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight">
                            {domain.title}
                          </h3>
                          <p
                            className={cn(
                              "text-sm mb-6 leading-relaxed font-semibold",
                              domain.isUnlocked
                                ? "text-slate-500"
                                : "text-slate-400"
                            )}
                          >
                            {domain.description}
                          </p>

                          <div className="flex items-center gap-2 mb-4">
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 border-slate-200 font-bold"
                            >
                              {domain.trackCount} tracks
                            </Badge>
                            {domain.isUnlocked && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 border-green-200 font-bold"
                              >
                                Unlocked
                              </Badge>
                            )}
                          </div>

                          {domain.isUnlocked && (
                            <div className="mt-auto">
                              <div
                                className="w-full py-3 rounded-xl bg-purple-100/50 border-2 border-purple-100 text-purple-700 font-extrabold text-center uppercase tracking-wide text-xs
                                  group-hover:bg-purple-500 group-hover:border-purple-500 group-hover:text-white transition-all shadow-sm"
                              >
                                Start Practice
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    {!domain.isUnlocked && (
                      <TooltipContent className="bg-slate-800 text-white border-slate-700">
                        <p className="font-bold">Complete Level 1 to unlock</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </motion.div>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
