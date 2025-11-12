import { CheckCircle, Clock, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { UserStats } from "./types";

type StatsCardsProps = {
  stats: UserStats;
};

export function StatsCards({ stats }: StatsCardsProps) {
  const unlockedBadgeCount = (stats.badges || []).length;

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Prompt Score</div>
            <div className="ml-1 text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              {stats.promptScore}
            </div>
          </div>
          <Target className="h-8 w-8 text-gradient-from" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              Challenges Complete
            </div>
            <div className="ml-1 text-2xl font-bold">
              {(stats.completedProjects || []).length}
            </div>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Badges Earned</div>
            <div className="ml-1 text-2xl font-bold">{unlockedBadgeCount}</div>
          </div>
          <Trophy className="h-8 w-8 text-amber-500" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="px-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Weekly Minutes</div>
            <div className="ml-1 text-2xl font-bold">
              {stats.weeklyPracticeMinutes || 0}
            </div>
          </div>
          <Clock className="h-8 w-8 text-blue-500" />
        </CardContent>
      </Card>
    </section>
  );
}
