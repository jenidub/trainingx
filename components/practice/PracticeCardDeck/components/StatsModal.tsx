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
      className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-blue-200 shadow-xl"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart className="w-5 h-5 text-blue-600" />
        Level Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <p className="text-blue-700 text-sm font-bold">Challenges</p>
          <p className="text-2xl font-bold text-gray-900">{levelDetails.challengeCount}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <p className="text-green-700 text-sm font-bold">Completed</p>
          <p className="text-2xl font-bold text-gray-900">{levelDetails.progress?.challengesCompleted || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <p className="text-purple-700 text-sm font-bold">Progress</p>
          <p className="text-2xl font-bold text-gray-900">{levelDetails.progress?.percentComplete || 0}%</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
          <p className="text-amber-700 text-sm font-bold">Avg Score</p>
          <p className="text-2xl font-bold text-gray-900">{Math.round(levelDetails.progress?.averageScore || 0)}</p>
        </div>
      </div>
    </motion.div>
  );
}
