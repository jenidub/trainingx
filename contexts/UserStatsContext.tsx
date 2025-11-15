"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useAuth } from "./AuthContextProvider";

type StatsDoc = Doc<"userStats"> | null;

interface UserStatsContextValue {
  userStats: StatsDoc | undefined;
  isLoading: boolean;
}

const UserStatsContext = createContext<UserStatsContextValue | undefined>(undefined);

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?._id as Id<"users"> | undefined;
  const stats = useQuery(
    api.users.getUserStats,
    userId ? { userId } : "skip"
  );

  const value = useMemo<UserStatsContextValue>(() => {
    return {
      userStats: stats === undefined ? undefined : stats ?? null,
      isLoading: userId ? stats === undefined : false,
    };
  }, [stats, userId]);

  return (
    <UserStatsContext.Provider value={value}>
      {children}
    </UserStatsContext.Provider>
  );
}

export function useUserStats() {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error("useUserStats must be used within a UserStatsProvider");
  }
  return context;
}
