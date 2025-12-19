import { motion } from "framer-motion";
import { BarChart } from "lucide-react";

interface StatsModalProps {
  levelDetails: any;
}

export function StatsModal({ levelDetails }: StatsModalProps) {
  if (!levelDetails) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-2xl p-6 mb-6 border-2 border-b-[6px] border-slate-200"
    >
      <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
        <div className="bg-blue-100 p-1.5 rounded-lg">
          <BarChart className="w-5 h-5 text-blue-500 stroke-[3px]" />
        </div>
        Level Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wide">
            Challenges
          </p>
          <p className="text-2xl font-black text-slate-700">
            {levelDetails.challengeCount}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wide">
            Completed
          </p>
          <p className="text-2xl font-black text-slate-700">
            {levelDetails.progress?.challengesCompleted || 0}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wide">
            Progress
          </p>
          <p className="text-2xl font-black text-slate-700">
            {levelDetails.progress?.percentComplete || 0}%
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wide">
            Avg Score
          </p>
          <p className="text-2xl font-black text-slate-700">
            {Math.round(levelDetails.progress?.averageScore || 0)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
