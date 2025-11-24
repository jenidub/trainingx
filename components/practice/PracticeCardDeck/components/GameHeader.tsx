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

export function GameHeader({ onBack, levelTitle, progress, answeredCount, totalCount }: GameHeaderProps) {
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-3 mb-3">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Brain className="w-10 h-10 text-blue-500" />
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Practice Level</h1>
          {levelTitle && (
            <p className="text-gray-600 text-sm font-medium">{levelTitle}</p>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-lg mb-4 font-medium">Complete challenges to master your skills</p>
      
      <div className="bg-white/60 rounded-full h-4 overflow-hidden border-2 border-gray-200 shadow-sm">
        <motion.div
          className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-full rounded-full shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-gray-700 text-sm mt-2 font-semibold">
        Progress: {answeredCount} / {totalCount} cards completed
      </p>
    </div>
  );
}
