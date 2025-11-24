import { AnimatePresence, motion } from "framer-motion";
import { PracticeCard, AnswerType } from "../../types";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";

interface CardModalProps {
  card: PracticeCard | null;
  selectedAnswer: AnswerType;
  timer: number;
  isTimerRunning: boolean;
  lastScoreChange: number | null;
  streak: number;
  onClose: () => void;
  onAnswerSelect: (answer: AnswerType) => void;
}

export function CardModal({
  card,
  selectedAnswer,
  timer,
  isTimerRunning,
  lastScoreChange,
  streak,
  onClose,
  onAnswerSelect,
}: CardModalProps) {
  if (!card) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          className="relative z-10 w-full max-w-xl"
          initial={{ scale: 0.5, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="w-full h-[500px] max-h-[85vh]"
            style={{ perspective: 2000 }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotateY: selectedAnswer ? 180 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <CardFront
                card={card}
                timer={timer}
                isTimerRunning={isTimerRunning}
                selectedAnswer={selectedAnswer}
                onClose={onClose}
                onAnswerSelect={onAnswerSelect}
              />
              
              <CardBack
                card={card}
                selectedAnswer={selectedAnswer}
                lastScoreChange={lastScoreChange}
                streak={streak}
                timer={timer}
                onClose={onClose}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
