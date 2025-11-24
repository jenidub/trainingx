"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowRight, Sparkles, Zap } from "lucide-react";
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

export function DomainSelection({ userId, onSelectDomain }: DomainSelectionProps) {
  const domains = useQuery(api.practiceDomains.listWithUnlockStatus, { userId }) as any;

  if (!domains) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#DDF3FE] via-[#E8F5FE] to-[#F0F9FF] flex items-center justify-center">
        <div className="text-gray-700 text-xl font-semibold">Loading domains...</div>
      </div>
    );
  }

  const starterDomain = domains.find((d: any) => d.isStarter);
  const specializedDomains = domains.filter((d: any) => !d.isStarter);
  const hasUnlockedSpecialized = specializedDomains.some((d: any) => d.isUnlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DDF3FE] via-[#E8F5FE] to-[#F0F9FF] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Practice Zone
          </h1>
          <p className="text-xl text-gray-700 mb-6 font-medium">
            Master AI prompting across every domain
          </p>
          
          {/* Progress Indicator */}
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-blue-200 shadow-md">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-700 font-medium">
                <span className="text-blue-600 font-bold">{specializedDomains.filter((d: any) => d.isUnlocked).length}</span>
                {" "}of {specializedDomains.length} specialized domains unlocked
              </span>
            </div>
          </div>
        </motion.div>

        {/* Starter Domain */}
        {starterDomain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                {hasUnlockedSpecialized ? "Continue Learning" : "Start Here"}
              </h2>
            </div>

            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 hover:border-green-400 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => onSelectDomain(starterDomain._id, starterDomain.slug)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.span 
                          className="text-5xl"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {starterDomain.icon}
                        </motion.span>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {starterDomain.title}
                          </h3>
                          <p className="text-gray-700 font-medium">
                            {starterDomain.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-300">
                          {starterDomain.trackCount} tracks
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border border-blue-300">
                          Essential for everyone
                        </Badge>
                      </div>
                    </div>

                    <motion.div
                      animate={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <ArrowRight className="w-6 h-6 text-green-600" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Specialized Domains */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {hasUnlockedSpecialized ? "Specialized Domains" : "Unlock Specialized Domains"}
            </h2>
            {!hasUnlockedSpecialized && (
              <Badge variant="outline" className="text-blue-700 border-blue-400 bg-blue-50">
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
                          "h-full transition-all",
                          domain.isUnlocked
                            ? "bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl cursor-pointer group"
                            : "bg-white/40 backdrop-blur-sm border-2 border-gray-200 opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => domain.isUnlocked && onSelectDomain(domain._id, domain.slug)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <motion.span 
                              className="text-4xl"
                              whileHover={domain.isUnlocked ? { scale: 1.1 } : {}}
                            >
                              {domain.icon}
                            </motion.span>
                            {!domain.isUnlocked && (
                              <Lock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {domain.title}
                          </h3>
                          <p className={cn(
                            "text-sm mb-4 font-medium",
                            domain.isUnlocked ? "text-gray-700" : "text-gray-500"
                          )}>
                            {domain.description}
                          </p>

                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border border-blue-200 text-xs">
                              {domain.trackCount} tracks
                            </Badge>
                            {domain.isUnlocked && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200 text-xs">
                                ✨ Unlocked
                              </Badge>
                            )}
                          </div>

                          {domain.isUnlocked && (
                            <motion.div 
                              className="mt-4 flex items-center text-blue-600 text-sm font-semibold"
                              whileHover={{ x: 4 }}
                            >
                              <span>Explore</span>
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    {!domain.isUnlocked && (
                      <TooltipContent className="bg-white border-2 border-gray-200 text-gray-700">
                        <p className="text-sm font-medium">Complete Level 1 to unlock</p>
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
