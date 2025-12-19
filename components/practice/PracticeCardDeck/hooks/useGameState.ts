import { useState, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { AnswerType, PracticeCard, GameState } from "../types";

export function useGameState(
  userId: Id<"users">,
  levelId: Id<"practiceLevels">
) {
  const [state, setState] = useState<GameState>({
    selectedCardIndex: null,
    selectedAnswer: null,
    isShuffling: false,
    lastScoreChange: null,
    timer: 0,
    isTimerRunning: false,
    showStats: false,
    streak: 0,
    score: 0,
    answeredCards: new Set(),
    justCompletedCard: null,
    showLevelComplete: false,
    correctAnswers: 0,
  });

  // Track shuffled card order
  const [shuffledIndices, setShuffledIndices] = useState<number[] | null>(null);

  const updateLevelProgress = useMutation(api.userProgress.updateLevelProgress);
  const resetLevelProgress = useMutation(api.userProgress.resetLevelProgress);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isTimerRunning) {
      interval = setInterval(() => {
        setState((prev) => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning]);

  const handleCardClick = (index: number, cards: PracticeCard[]) => {
    if (
      !cards[index] ||
      state.answeredCards.has(cards[index]._id) ||
      state.isShuffling
    )
      return;

    setState((prev) => ({
      ...prev,
      selectedCardIndex: index,
      selectedAnswer: null,
      timer: 0,
      isTimerRunning: true,
    }));
  };

  const handleCloseModal = (cards: PracticeCard[]) => {
    if (state.selectedAnswer !== null && state.selectedCardIndex !== null) {
      const selectedCard = cards[state.selectedCardIndex];
      if (selectedCard) {
        setState((prev) => ({ ...prev, justCompletedCard: selectedCard._id }));
        setTimeout(() => {
          setState((prev) => ({ ...prev, justCompletedCard: null }));
        }, 2000);
      }
    }

    setState((prev) => ({
      ...prev,
      selectedCardIndex: null,
      selectedAnswer: null,
      isTimerRunning: false,
    }));
  };

  const handleAnswerSelect = async (
    answerType: AnswerType,
    cards: PracticeCard[]
  ) => {
    if (state.selectedCardIndex === null || state.selectedAnswer !== null)
      return;

    const selectedCard = cards[state.selectedCardIndex];
    if (!selectedCard) return;

    const correctAnswer = selectedCard.params?.correctAnswer;
    const isCorrect = answerType === correctAnswer;
    const isAlmost = answerType === "almost" || correctAnswer === "almost";

    let pointsEarned = 0;
    let newStreak = state.streak;

    if (isCorrect) {
      const timeBonus = state.timer < 5 ? 5 : state.timer < 10 ? 2 : 0;
      const streakBonus = Math.floor(state.streak / 3) * 2;
      pointsEarned = 10 + timeBonus + streakBonus;
      newStreak = state.streak + 1;
    } else if (isAlmost) {
      pointsEarned = 0;
      newStreak = 0;
    } else {
      pointsEarned = -5;
      newStreak = 0;
    }

    const newAnsweredCards = new Set([
      ...state.answeredCards,
      selectedCard._id,
    ]);
    const newCorrectAnswers = state.correctAnswers + (isCorrect ? 1 : 0);
    const isLevelComplete = newAnsweredCards.size === cards.length;

    setState((prev) => ({
      ...prev,
      selectedAnswer: answerType,
      isTimerRunning: false,
      score: prev.score + pointsEarned,
      streak: newStreak,
      lastScoreChange: pointsEarned,
      answeredCards: newAnsweredCards,
      correctAnswers: newCorrectAnswers,
      showLevelComplete: isLevelComplete,
    }));

    // Pass the challenge ID to the backend
    updateLevelProgress({
      userId,
      levelId,
      challengeId: selectedCard._id, // Pass the specific challenge ID
      score: pointsEarned,
      correct: isCorrect,
    }).catch((error) => {
      console.error("Error updating progress:", error);
    });
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = async (cards: PracticeCard[]) => {
    setState((prev) => ({ ...prev, isShuffling: true }));

    // Create shuffled indices
    const indices = cards.map((_, i) => i);
    const shuffled = shuffleArray(indices);
    setShuffledIndices(shuffled);

    await new Promise((resolve) => setTimeout(resolve, 400));
    setState((prev) => ({ ...prev, isShuffling: false }));
  };

  const handleReset = async () => {
    // Reset local state
    setState((prev) => ({
      ...prev,
      score: 0,
      streak: 0,
      answeredCards: new Set(),
      lastScoreChange: null,
      selectedCardIndex: null,
      selectedAnswer: null,
      isTimerRunning: false,
      showLevelComplete: false,
      correctAnswers: 0,
    }));

    // Clear shuffle order
    setShuffledIndices(null);

    // Reset backend progress
    try {
      await resetLevelProgress({
        userId,
        levelId,
      });
    } catch (error) {
      console.error("Error resetting progress:", error);
    }
  };

  const toggleStats = () => {
    setState((prev) => ({ ...prev, showStats: !prev.showStats }));
  };

  const initializeFromProgress = useCallback((completedCardIds: string[]) => {
    setState((prev) => ({
      ...prev,
      answeredCards: new Set(completedCardIds),
    }));
  }, []);

  const closeLevelComplete = () => {
    setState((prev) => ({ ...prev, showLevelComplete: false }));
  };

  // Helper to get cards in shuffled order
  const getShuffledCards = useCallback(
    (cards: PracticeCard[]): PracticeCard[] => {
      if (!shuffledIndices || shuffledIndices.length !== cards.length) {
        return cards;
      }
      return shuffledIndices.map((i) => cards[i]);
    },
    [shuffledIndices]
  );

  return {
    state,
    shuffledIndices,
    getShuffledCards,
    handleCardClick,
    handleCloseModal,
    handleAnswerSelect,
    handleShuffle,
    handleReset,
    toggleStats,
    initializeFromProgress,
    closeLevelComplete,
  };
}
