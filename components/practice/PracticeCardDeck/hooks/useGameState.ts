import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { AnswerType, PracticeCard, GameState } from "../types";

export function useGameState(userId: Id<"users">, levelId: Id<"practiceLevels">) {
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

  const updateLevelProgress = useMutation(api.userProgress.updateLevelProgress);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isTimerRunning) {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isTimerRunning]);

  const handleCardClick = (index: number, cards: PracticeCard[]) => {
    if (!cards[index] || state.answeredCards.has(cards[index]._id) || state.isShuffling) return;
    
    setState(prev => ({
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
        setState(prev => ({ ...prev, justCompletedCard: selectedCard._id }));
        setTimeout(() => {
          setState(prev => ({ ...prev, justCompletedCard: null }));
        }, 2000);
      }
    }
    
    setState(prev => ({
      ...prev,
      selectedCardIndex: null,
      selectedAnswer: null,
      isTimerRunning: false,
    }));
  };

  const handleAnswerSelect = async (answerType: AnswerType, cards: PracticeCard[]) => {
    if (state.selectedCardIndex === null || state.selectedAnswer !== null) return;

    const selectedCard = cards[state.selectedCardIndex];
    if (!selectedCard) return;

    const correctAnswer = selectedCard.params?.correctAnswer;
    const isCorrect = answerType === correctAnswer;
    const isAlmost = answerType === "almost" || correctAnswer === "almost";
    
    let pointsEarned = 0;
    let newStreak = state.streak;
    
    if (isCorrect) {
      const timeBonus = state.timer < 5 ? 5 : (state.timer < 10 ? 2 : 0);
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
    
    const newAnsweredCards = new Set([...state.answeredCards, selectedCard._id]);
    const newCorrectAnswers = state.correctAnswers + (isCorrect ? 1 : 0);
    const isLevelComplete = newAnsweredCards.size === cards.length;
    
    setState(prev => ({
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

    updateLevelProgress({
      userId,
      levelId,
      score: pointsEarned,
      correct: isCorrect,
    }).catch((error) => {
      console.error("Error updating progress:", error);
    });
  };

  const handleShuffle = async () => {
    setState(prev => ({ ...prev, isShuffling: true }));
    await new Promise(resolve => setTimeout(resolve, 400));
    setState(prev => ({ ...prev, isShuffling: false }));
  };

  const handleReset = () => {
    setState(prev => ({
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
  };

  const toggleStats = () => {
    setState(prev => ({ ...prev, showStats: !prev.showStats }));
  };

  const initializeFromProgress = (completedCardIds: string[]) => {
    setState(prev => ({
      ...prev,
      answeredCards: new Set(completedCardIds),
    }));
  };

  const closeLevelComplete = () => {
    setState(prev => ({ ...prev, showLevelComplete: false }));
  };

  return {
    state,
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
