import { motion } from "framer-motion";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PracticeCard, AnswerType } from "../../types";

interface CardFrontProps {
  card: PracticeCard;
  timer: number;
  isTimerRunning: boolean;
  selectedAnswer: AnswerType;
  onClose: () => void;
  onAnswerSelect: (answer: AnswerType) => void;
}

export function CardFront({
  card,
  timer,
  isTimerRunning,
  selectedAnswer,
  onClose,
  onAnswerSelect,
}: CardFrontProps) {
  return (
    <div
      className="absolute inset-0 bg-white rounded-3xl shadow-xl p-8 flex flex-col overflow-y-auto border-2 border-b-8 border-slate-200"
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          {isTimerRunning && (
            <motion.div
              className="flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-xl border-2 border-blue-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Clock className="w-4 h-4 stroke-[3px]" />
              <span className="text-sm font-black">{timer}s</span>
            </motion.div>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-slate-400 hover:bg-slate-100 rounded-xl"
        >
          <X className="w-6 h-6 stroke-[3px]" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-between gap-8">
        <div>
          <h3 className="text-slate-400 text-xs font-black mb-3 uppercase tracking-wide">
            Scenario
          </h3>
          <p className="text-slate-700 text-lg leading-relaxed font-bold">
            {card.params?.scenario || "Rate this prompt"}
          </p>
        </div>

        <div>
          <h3 className="text-slate-400 text-xs font-black mb-3 uppercase tracking-wide">
            Prompt
          </h3>
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-slate-600 text-base leading-relaxed font-mono font-medium">
              "{card.params?.prompt}"
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-slate-400 text-xs font-black mb-3 uppercase tracking-wide">
            Rate this prompt
          </h3>
          {!selectedAnswer && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onAnswerSelect("bad")}
                  className="w-full bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_0_rgb(185,28,28)] active:shadow-none active:translate-y-[4px] font-bold rounded-2xl py-6 transition-all border-2 border-red-600"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">😔</span>
                    <span className="text-sm font-black uppercase">Bad</span>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onAnswerSelect("almost")}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-[0_4px_0_0_rgb(202,138,4)] active:shadow-none active:translate-y-[4px] font-bold rounded-2xl py-6 transition-all border-2 border-yellow-500"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🤔</span>
                    <span className="text-sm font-black uppercase">Almost</span>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => onAnswerSelect("good")}
                  className="w-full bg-green-500 hover:bg-green-600 text-white shadow-[0_4px_0_0_rgb(21,128,61)] active:shadow-none active:translate-y-[4px] font-bold rounded-2xl py-6 transition-all border-2 border-green-600"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl pb-2">🎯</span>
                    <span className="text-sm font-black uppercase">Good</span>
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
