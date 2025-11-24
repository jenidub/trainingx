import { Award, Zap, TrendingUp, BarChart, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameHUDProps {
  score: number;
  streak: number;
  answeredCount: number;
  totalCount: number;
  onShowStats: () => void;
  onReset: () => void;
  onShuffle: () => void;
}

export function GameHUD({ score, streak, answeredCount, totalCount, onShowStats, onReset, onShuffle }: GameHUDProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border-2 border-gray-200 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Score</div>
              <div className="text-2xl font-bold text-gray-900">{score}</div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-gray-300" />
          
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-xl">
              <Zap className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Streak</div>
              <div className="text-2xl font-bold text-gray-900">{streak}x</div>
            </div>
          </div>
          
          <div className="h-10 w-px bg-gray-300" />
          
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-bold">Progress</div>
              <div className="text-2xl font-bold text-gray-900">{answeredCount}/{totalCount}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={onShowStats}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-md border-2 border-blue-200 text-blue-700 hover:text-blue-900 hover:bg-blue-50 hover:border-blue-300 w-full font-bold rounded-xl shadow-sm"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Stats
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-md border-2 border-purple-200 text-purple-700 hover:text-purple-900 hover:bg-purple-50 hover:border-purple-300 w-full font-bold rounded-xl shadow-sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={onShuffle}
          variant="outline"
          size="sm"
          className="bg-white/80 backdrop-blur-md border-2 border-pink-200 text-pink-700 hover:text-pink-900 hover:bg-pink-50 hover:border-pink-300 w-full font-bold rounded-xl shadow-sm"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
      </div>
    </div>
  );
}
