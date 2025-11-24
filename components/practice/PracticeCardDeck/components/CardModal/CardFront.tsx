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

export function CardFront({ card, timer, isTimerRunning, selectedAnswer, onClose, onAnswerSelect }: CardFrontProps) {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-100 rounded-lg shadow-2xl p-8 flex flex-col overflow-y-auto border-4 border-white/30"
      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-2">
          {isTimerRunning && (
            <motion.div 
              className="flex items-center gap-1 bg-blue-100 text-blue-200 px-3 py-1 rounded-xl border border-blue-200"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">{timer}s</span>
            </motion.div>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        <div>
          <h3 className="text-blue-600 text-xs font-bold mb-3 uppercase tracking-wide">
            Scenario
          </h3>
          <p className="text-gray-800 text-base leading-relaxed font-medium">
            {card.params?.scenario || "Rate this prompt"}
          </p>
        </div>

        <div>
          <h3 className="text-purple-600 text-xs font-bold mb-3 uppercase tracking-wide">
            Prompt
          </h3>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
            <p className="text-gray-800 text-sm leading-relaxed font-mono font-medium">
              "{card.params?.prompt}"
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-pink-600 text-xs font-bold mb-3 uppercase tracking-wide">
            Rate this prompt
          </h3>
          {!selectedAnswer && (
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onAnswerSelect("bad")}
                  className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg font-bold rounded-xl py-6"
                >
                  <span className="text-2xl">😔</span>
                  <span className="ml-2">Bad</span>
                </Button>
              </motion.div>
              
              <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onAnswerSelect("almost")}
                  className="w-full bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-lg font-bold rounded-xl py-6"
                >
                  <span className="text-2xl">🤔</span>
                  <span className="ml-2">Almost</span>
                </Button>
              </motion.div>
              
              <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onAnswerSelect("good")}
                  className="w-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg font-bold rounded-xl py-6"
                >
                  <span className="text-2xl">🎯</span>
                  <span className="ml-2">Good</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
