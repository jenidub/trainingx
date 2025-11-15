import type { Doc } from "./_generated/dataModel";

type UserStatsDoc = Doc<"userStats">;

type LeaderboardOverrides = {
  promptScore?: number;
  communityActivity?: UserStatsDoc["communityActivity"];
  communityScore?: number;
};

export function nextLeaderboardFields(
  stats: UserStatsDoc,
  overrides: LeaderboardOverrides = {}
) {
  const promptScore = overrides.promptScore ?? stats.promptScore ?? 0;
  const communityScore =
    overrides.communityScore ??
    overrides.communityActivity?.communityScore ??
    stats.communityScore ??
    stats.communityActivity?.communityScore ??
    0;

  return {
    communityScore,
    totalScore: promptScore + communityScore,
  };
}
