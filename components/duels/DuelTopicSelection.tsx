"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Shuffle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DuelTopicSelectionProps {
  userId: Id<"users">;
  onSelectTrack: (
    trackId: Id<"practiceTracks"> | null,
    trackName: string
  ) => void;
  onCancel: () => void;
}

export function DuelTopicSelection({
  userId,
  onSelectTrack,
  onCancel,
}: DuelTopicSelectionProps) {
  const [selectedDomainId, setSelectedDomainId] =
    useState<Id<"practiceDomains"> | null>(null);

  const domains = useQuery(api.practiceDomains.listWithUnlockStatus, {
    userId,
  }) as any;
  const tracks = useQuery(
    api.practiceTracks.listByDomainWithProgress,
    selectedDomainId ? { domainId: selectedDomainId, userId } : "skip"
  ) as any;

  // Random mix option
  const handleRandomMix = () => {
    onSelectTrack(null, "Random Mix");
  };

  // Loading state
  if (!domains) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  // Step 1: Domain selection
  if (!selectedDomainId) {
    const unlockedDomains = domains.filter(
      (d: any) => d.isUnlocked || d.isStarter
    );

    return (
      <div className="space-y-4">
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">
          Choose a Topic Category
        </div>

        {/* Random Mix Option */}
        <button
          onClick={handleRandomMix}
          className="w-full p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500 group-hover:bg-blue-200 transition-colors">
            <Shuffle className="h-5 w-5" />
          </div>
          <div className="text-left flex-1">
            <div className="font-bold text-slate-800">Random Mix</div>
            <div className="text-sm text-slate-500">
              Questions from all topics
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400 font-bold">
              or pick a topic
            </span>
          </div>
        </div>

        {/* Domain Grid */}
        <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
          {unlockedDomains.map((domain: any) => (
            <button
              key={domain._id}
              onClick={() => setSelectedDomainId(domain._id)}
              className="p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{domain.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 truncate">
                    {domain.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {domain.trackCount} tracks
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2">
          <Button variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Step 2: Track selection
  const selectedDomain = domains.find((d: any) => d._id === selectedDomainId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDomainId(null)}
          className="h-8 px-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedDomain?.icon}</span>
          <span className="font-bold text-slate-800">
            {selectedDomain?.title}
          </span>
        </div>
      </div>

      <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">
        Select a Track
      </div>

      {!tracks ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {tracks.map((track: any) => (
            <button
              key={track._id}
              onClick={() => onSelectTrack(track._id, track.title)}
              className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{track.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800">{track.title}</div>
                  <div className="text-sm text-slate-500 line-clamp-1">
                    {track.description}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs bg-slate-100">
                      {track.levelCount} levels
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-slate-100">
                      {track.totalChallenges} questions
                    </Badge>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
