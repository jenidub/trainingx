import { Activity, ThumbsDown, ThumbsUp } from "lucide-react";
import type { RatingMeta } from "./types";

export const XP_PER_LEVEL = 160;

export const ratingMeta: RatingMeta = {
  bad: {
    label: "Needs More Juice",
    color: "bg-red-100 border-red-200 text-red-700",
    detail: "Mark the miss, grab insight, and reroll.",
    xp: 8,
    icon: ThumbsDown,
  },
  almost: {
    label: "Almost There",
    color: "bg-amber-100 border-amber-200 text-amber-700",
    detail: "Capture the tweak and bank XP.",
    xp: 18,
    icon: Activity,
  },
  good: {
    label: "Nailed It",
    color: "bg-emerald-100 border-emerald-200 text-emerald-700",
    detail: "Bank combo XP and keep the streak alive.",
    xp: 28,
    icon: ThumbsUp,
  },
};
