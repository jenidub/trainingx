"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PracticeCardDeck } from "@/components/practice/PracticeCardDeck";
import { LoadingState } from "@/components/practice";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "@/convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export default function PracticeGamePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ domainSlug: string; trackSlug: string }>();
  const { domainSlug, trackSlug } = params || {};

  // Get track details to find the first level
  const track = useQuery(
    api.practiceTracks.getBySlug,
    trackSlug ? { slug: trackSlug } : "skip"
  );

  // Once we have track ID, get the details including levels
  const trackDetails = useQuery(
    api.practiceTracks.getTrackDetails,
    track && user?._id
      ? { trackId: track._id, userId: user._id as Id<"users"> }
      : "skip"
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        `/practice/${domainSlug}/${trackSlug}`
      );
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router, domainSlug, trackSlug]);

  if (authLoading || track === undefined || trackDetails === undefined) {
    return (
      <SidebarLayout>
        <LoadingState />
      </SidebarLayout>
    );
  }

  if (!user?._id) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-white">
            Please log in to access the practice zone.
          </p>
        </div>
      </SidebarLayout>
    );
  }

  if (!track || !trackDetails) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500">Track not found.</p>
        </div>
      </SidebarLayout>
    );
  }

  // Find the first level (or appropriate level)
  // Since user said "everyone has just one level, so directly just take to the first level"
  // We'll take the first one from the list.
  const firstLevel = trackDetails.levels?.[0];

  if (!firstLevel) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500">No levels found in this track.</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <PracticeCardDeck
        userId={user._id as any}
        levelId={firstLevel._id}
        onBack={() => router.push(`/practice/${domainSlug}`)}
      />
    </SidebarLayout>
  );
}
