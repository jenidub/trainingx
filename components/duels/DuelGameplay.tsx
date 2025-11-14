"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Swords,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Flame,
  Share2,
  RotateCcw,
} from "lucide-react";

type DuelGameplayProps = {
  duelId: Id<"practiceDuels">;
};

export function DuelGameplay({ duelId }: DuelGameplayProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per item
  const [streak, setStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Fetch duel details
  const duelDetails = useQuery(api.duels.getDuelDetails, { roomId: duelId });
  const submitAttempt = useMutation(api.duels.submitDuelAttempt);

  // Reset timer when moving to next item
  useEffect(() => {
    setStartTime(Date.now());
    setTimeLeft(60);
  }, [currentItemIndex]);

  // Countdown timer
  useEffect(() => {
    if (showFeedback || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleSubmitAnswer(); // Auto-submit on timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showFeedback]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">Please log in to participate in duels</p>
        </CardContent>
      </Card>
    );
  }

  if (duelDetails === undefined) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading duel...</p>
        </CardContent>
      </Card>
    );
  }

  if (!duelDetails || !duelDetails.room) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Duel not found</p>
          <Button onClick={() => router.push("/duels")}>
            Back to Arena
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { room: duel, attempts, items, participants } = duelDetails;

  // Derive challenger and opponent from participants
  const challenger = participants.find(p => p._id === duel.challengerId);
  const opponent = participants.find(p => p._id === duel.opponentId);

  // Check if user is participant
  const isChallenger = duel.challengerId === user._id;
  const isOpponent = duel.opponentId === user._id;
  const isParticipant = isChallenger || isOpponent;

  if (!isParticipant) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You are not a participant in this duel</p>
          <Button onClick={() => router.push("/duels")}>
            Back to Arena
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Get user's attempts
  const userAttempts = attempts.filter((a) => a.userId === user._id);
  const opponentAttempts = attempts.filter((a) => a.userId !== user._id);

  // Check if user has completed all items
  const userCompleted = userAttempts.length === duel.itemIds.length;
  const opponentCompleted = opponentAttempts.length === duel.itemIds.length;
  const duelCompleted = duel.status === "completed";

  // Get current item
  const currentItem = items[currentItemIndex];

  // Check if current item already attempted
  const currentItemAttempted = userAttempts.some(
    (a) => a.itemId === currentItem?._id
  );

  // Calculate scores
  const userScore = userAttempts.reduce((sum, a) => sum + a.score, 0);
  const opponentScore = opponentAttempts.reduce((sum, a) => sum + a.score, 0);

  // Handle answer selection
  const handleSelectAnswer = (optionIndex: number) => {
    if (showFeedback || submitting) return;
    setSelectedAnswer(optionIndex);
  };

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!currentItem || submitting) return;
    
    // Allow timeout submission even without selection
    const answerIndex = selectedAnswer !== null ? selectedAnswer : -1;

    setSubmitting(true);
    try {
      const timeMs = Date.now() - startTime;
      const options = currentItem.params?.options || [];
      const selectedOption = answerIndex >= 0 ? options[answerIndex] : null;
      const correct = selectedOption?.quality === "good";
      const score = correct ? 100 : 0;

      await submitAttempt({
        userId: user._id as any,
        roomId: duelId,
        itemId: currentItem._id,
        response: { optionIndex: answerIndex },
        score,
        correct: correct || false,
        timeMs,
      });

      setIsCorrect(correct || false);
      setShowFeedback(true);
      
      // Update streak
      if (correct) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle next item
  const handleNextItem = () => {
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(null);
    }
  };

  // Handle finish
  const handleFinish = () => {
    router.push("/duels");
  };

  // Calculate stats for victory screen
  const userCorrect = userAttempts.filter((a) => a.correct).length;
  const accuracy = userAttempts.length > 0 ? Math.round((userCorrect / userAttempts.length) * 100) : 0;
  const avgTime = userAttempts.length > 0 
    ? Math.round(userAttempts.reduce((sum, a) => sum + a.timeMs, 0) / userAttempts.length / 1000) 
    : 0;
  const isWinner = duelCompleted && duel.winnerId === user._id;

  // If user completed, show completion screen
  if (userCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-900 via-blue-900 to-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-purple-500 shadow-2xl">
            <CardContent className="p-12 text-center">
              {/* Winner Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-6"
              >
                {duelCompleted ? (
                  isWinner ? (
                    <Trophy className="h-32 w-32 text-amber-500 mx-auto" />
                  ) : (
                    <Swords className="h-32 w-32 text-gray-400 mx-auto" />
                  )
                ) : (
                  <CheckCircle2 className="h-32 w-32 text-green-500 mx-auto" />
                )}
              </motion.div>

              <h1 className="text-5xl font-bold mb-4">
                {duelCompleted
                  ? isWinner
                    ? "VICTORY!"
                    : "DEFEAT"
                  : "Duel Completed!"}
              </h1>

              <p className="text-gray-600 mb-8">
                {duelCompleted
                  ? isWinner
                    ? "You crushed it! 🎉"
                    : "Better luck next time!"
                  : "Waiting for opponent to finish..."}
              </p>

              {/* Score Comparison */}
              <div className="grid grid-cols-2 gap-8 my-8">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={isChallenger && isWinner ? "scale-110" : ""}
                >
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-purple-500 text-white text-xl">
                      {(challenger?.name || "C")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-gray-600 mb-1">
                    {challenger?.name || "Challenger"}
                    {isChallenger && " (You)"}
                  </p>
                  <p className="text-6xl font-bold text-green-500">
                    {duel.challengerScore}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {userAttempts.filter((a) => a.userId === duel.challengerId && a.correct).length}/{duel.itemIds.length} correct
                  </p>
                </motion.div>

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={isOpponent && isWinner ? "scale-110" : ""}
                >
                  <Avatar className="h-16 w-16 mx-auto mb-3">
                    <AvatarFallback className="bg-blue-500 text-white text-xl">
                      {(opponent?.name || "O")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-gray-600 mb-1">
                    {opponent?.name || "Opponent"}
                    {isOpponent && " (You)"}
                  </p>
                  <p className="text-6xl font-bold text-blue-500">
                    {duel.opponentScore || 0}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {opponentAttempts.filter((a) => a.correct).length}/{duel.itemIds.length} correct
                  </p>
                </motion.div>
              </div>

              {/* Stats */}
              {duelCompleted && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-3 gap-4 mb-8 text-sm"
                >
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 mb-1">Accuracy</p>
                    <p className="text-2xl font-bold">{accuracy}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 mb-1">Avg Time</p>
                    <p className="text-2xl font-bold">{avgTime}s</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 mb-1">Correct</p>
                    <p className="text-2xl font-bold">{userCorrect}/{userAttempts.length}</p>
                  </div>
                </motion.div>
              )}

              {/* Rewards */}
              {isWinner && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="bg-amber-50 border-2 border-amber-500 rounded-lg p-4 mb-6"
                >
                  <p className="font-bold text-amber-900 mb-2">Rewards Earned!</p>
                  <div className="flex justify-center gap-4">
                    <Badge className="bg-amber-500 text-white">+100 XP</Badge>
                    <Badge className="bg-purple-500 text-white">Duel Master</Badge>
                  </div>
                </motion.div>
              )}

              {/* Progress indicator */}
              {!duelCompleted && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Opponent Progress: {opponentAttempts.length}/{duel.itemIds.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {duelCompleted && (
                  <>
                    <Button
                      onClick={() => {
                        // TODO: Implement rematch
                        alert("Rematch feature coming soon!");
                      }}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Rematch
                    </Button>
                    <Button
                      onClick={() => {
                        // TODO: Implement share
                        alert("Share feature coming soon!");
                      }}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={handleFinish}
                variant={duelCompleted ? "default" : "outline"}
                className="w-full mt-3"
                size="lg"
              >
                Back to Arena
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Skip to first unattempted item
  if (currentItemAttempted && !showFeedback) {
    const nextUnattemptedIndex = items.findIndex(
      (item) => !userAttempts.some((a) => a.itemId === item._id)
    );
    if (nextUnattemptedIndex !== -1 && nextUnattemptedIndex !== currentItemIndex) {
      setCurrentItemIndex(nextUnattemptedIndex);
      return null;
    }
  }

  if (!currentItem) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Item not found</p>
          <Button onClick={() => router.push("/duels")}>
            Back to Arena
          </Button>
        </CardContent>
      </Card>
    );
  }

  const options = currentItem.params?.options || [];
  const question = currentItem.params?.question || "No question available";

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/duels")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Arena
      </Button>

      {/* Live Scoreboard */}
      <Card className="bg-linear-to-r from-gray-900 to-gray-800 text-white border-2 border-purple-500">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6 items-center">
            {/* You */}
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-green-400">
                <AvatarFallback className="bg-green-500 text-white text-xl">
                  {(isChallenger ? challenger?.name : opponent?.name || "You")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-sm mb-1">You</p>
              <p className="text-4xl font-bold text-green-400">{userScore}</p>
              <Progress 
                value={(userAttempts.length / items.length) * 100} 
                className="mt-2 h-2 bg-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                {userAttempts.length}/{items.length} items
              </p>
            </div>

            {/* VS */}
            <div className="text-center">
              <Swords className="h-10 w-10 mx-auto text-red-500 mb-2" />
              <p className="text-sm text-gray-300">
                {userScore > opponentScore 
                  ? "You're Winning! 🔥" 
                  : userScore < opponentScore 
                    ? "Catch Up! 💪"
                    : "It's a Tie! ⚔️"}
              </p>
              {streak > 1 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-500 font-bold">{streak} Streak!</span>
                </div>
              )}
            </div>

            {/* Opponent */}
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-blue-400">
                <AvatarFallback className="bg-blue-500 text-white text-xl">
                  {(isChallenger ? opponent?.name : challenger?.name || "Opponent")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-sm mb-1">
                {isChallenger ? opponent?.name || "Opponent" : challenger?.name || "Challenger"}
              </p>
              <p className="text-4xl font-bold text-blue-400">{opponentScore}</p>
              <Progress 
                value={(opponentAttempts.length / items.length) * 100} 
                className="mt-2 h-2 bg-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">
                {opponentAttempts.length}/{items.length} items
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-blue-500 shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex justify-between items-center">
            <Badge className="bg-white/20 text-white border-white/30">
              Question {currentItemIndex + 1}/{items.length}
            </Badge>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <span 
                className={`font-mono text-2xl font-bold ${
                  timeLeft < 10 
                    ? 'text-red-300 animate-pulse' 
                    : timeLeft < 30 
                      ? 'text-yellow-300' 
                      : 'text-white'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Badge className="bg-white/20 text-white border-white/30">
              {currentItem.difficultyBand}
            </Badge>
            {currentItem.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} className="bg-white/20 text-white border-white/30">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Question */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200"
          >
            <h3 className="text-xl font-bold text-gray-900">{question}</h3>
          </motion.div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option: any, index: number) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = option.quality === "good";
              const showCorrect = showFeedback && isCorrectOption;
              const showIncorrect = showFeedback && isSelected && !isCorrectOption;

              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={showFeedback || submitting}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrect
                      ? "border-green-500 bg-green-50"
                      : showIncorrect
                        ? "border-red-500 bg-red-50"
                        : isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                  } ${showFeedback || submitting ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                        showCorrect
                          ? "border-green-500 bg-green-500 text-white"
                          : showIncorrect
                            ? "border-red-500 bg-red-500 text-white"
                            : isSelected
                              ? "border-purple-500 bg-purple-500 text-white"
                              : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {showCorrect ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : showIncorrect ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{option.text}</p>
                      {showFeedback && (isSelected || isCorrectOption) && option.explanation && (
                        <p className="text-sm text-gray-600 mt-2">
                          {option.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {showFeedback && isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <Card className={`p-8 ${isCorrect ? 'border-green-500 border-4' : 'border-red-500 border-4'} shadow-2xl`}>
                    <CardContent className="text-center">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
                          <h2 className="text-4xl font-bold text-green-600 mb-2">Correct!</h2>
                          <p className="text-2xl text-gray-700">+100 points</p>
                          {streak > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-3">
                              <Flame className="h-6 w-6 text-orange-500" />
                              <span className="text-xl font-bold text-orange-500">
                                {streak} in a row! 🔥
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-24 w-24 text-red-500 mx-auto mb-4" />
                          <h2 className="text-4xl font-bold text-red-600 mb-2">Incorrect</h2>
                          <p className="text-gray-700">Keep trying!</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {!showFeedback ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || submitting}
                className="flex-1"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Answer"
                )}
              </Button>
            ) : (
              <Button
                onClick={
                  currentItemIndex < items.length - 1
                    ? handleNextItem
                    : handleFinish
                }
                className="flex-1"
                size="lg"
              >
                {currentItemIndex < items.length - 1
                  ? "Next Question →"
                  : "Finish Duel 🏁"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Opponent Status */}
      {opponentAttempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {(isChallenger ? opponent?.name : challenger?.name || "O")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {isChallenger ? opponent?.name || "Opponent" : challenger?.name || "Challenger"}
                    </p>
                    <p className="text-xs text-blue-700">
                      {opponentAttempts.length}/{items.length} completed · {opponentScore} points
                    </p>
                  </div>
                </div>
                {opponentCompleted ? (
                  <Badge className="bg-blue-600 text-white">Finished!</Badge>
                ) : opponentAttempts.length > userAttempts.length ? (
                  <Badge className="bg-orange-500 text-white">Ahead!</Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
