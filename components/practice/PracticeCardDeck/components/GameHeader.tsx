import { Brain, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface GameHeaderProps {
  onBack: () => void;
  levelTitle?: string;
  progress: number;
  answeredCount: number;
  totalCount: number;
}

export function GameHeader({
  onBack,
  levelTitle,
  progress,
  answeredCount,
  totalCount,
}: GameHeaderProps) {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-3 mb-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3px]" />
        </Button>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-500">
          <Brain className="w-7 h-7 stroke-[2.5px]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Practice Level
          </h1>
          {levelTitle && (
            <p className="text-slate-500 text-sm font-bold">{levelTitle}</p>
          )}
        </div>
      </div>
      <p className="text-slate-500 text-lg mb-4 font-medium pl-1">
        Complete challenges to master your skills
      </p>

      <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
        <motion.div
          className="bg-blue-500 h-full rounded-full shadow-sm"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-slate-400 text-sm mt-2 font-bold pl-1">
        Progress: {answeredCount} / {totalCount} cards completed
      </p>
    </div>
  );
}
