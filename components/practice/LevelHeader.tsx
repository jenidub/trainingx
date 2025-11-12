import { Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { levelLabel, levelGradient } from "./utils";
import type { LevelProgress } from "./types";

type LevelHeaderProps = {
  level: number;
  levelUnlocked: boolean;
  progress: LevelProgress;
};

export function LevelHeader({ level, levelUnlocked, progress }: LevelHeaderProps) {
  const gradient = levelGradient(level);

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-full ${levelUnlocked ? `bg-gradient-to-r ${gradient}` : "bg-yellow-500"}`}
      >
        {levelUnlocked ? (
          <Unlock className="h-6 w-6 text-white" />
        ) : (
          <Lock className="h-6 w-6 text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold">Level {level}</h2>
          <Badge
            className={`${levelUnlocked ? `bg-gradient-to-r ${gradient} text-white` : "bg-yellow-500 text-white"}`}
          >
            {levelLabel(level)}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-300`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
            {progress.completed}/{progress.total}
          </span>
        </div>
      </div>
    </div>
  );
}
