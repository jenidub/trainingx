"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PracticeCardDeckProps } from "./types";
import { useGameState } from "./hooks/useGameState";
import { GameHeader } from "./components/GameHeader";
import { GameHUD } from "./components/GameHUD";
import { StatsModal } from "./components/StatsModal";
import { PracticeCard } from "./components/PracticeCard";
import { CardModal } from "./components/CardModal";
import { LevelCompleteModal } from "./components/LevelCompleteModal";

export function PracticeCardDeck({
  userId,
  levelId,
  onBack,
}: PracticeCardDeckProps) {
  const practiceItems = useQuery(api.practiceItems.getChallengesForLevel, {
    levelId,
    userId,
  }) as any;

  const levelDetails = useQuery(api.practiceLevels.getWithDetails, {
    levelId,
    userId,
  }) as any;

  const levelProgress = useQuery(api.userProgress.getLevelProgress, {
    userId,
    levelId,
  }) as any;

  const {
    state,
    isViewingAttempted,
    getShuffledCards,
    handleCardClick,
    handleCloseModal,
    handleAnswerSelect,
    handleViewAnswer,
    handleShuffle,
    handleReset,
    toggleStats,
    initializeFromProgress,
    closeLevelComplete,
  } = useGameState(userId, levelId);

  useEffect(() => {
    console.log("PracticeCardDeck Debug:", {
      levelId,
      userId,
      practiceItems,
      levelDetails,
      levelProgress,
      itemsCount: practiceItems?.length,
      firstItem: practiceItems?.[0],
      firstItemParams: practiceItems?.[0]?.params,
    });
  }, [practiceItems, levelDetails, levelProgress, levelId, userId]);

  // Demo mode controlled by environment variable (set in .env.local)
  // Set NEXT_PUBLIC_DEMO_MODE=true to mark all cards as completed (for recording demo videos)
  const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Track if we've already initialized to prevent re-initialization after reset
  const hasInitializedRef = useRef(false);
  // Track if user has clicked reset (disables demo mode re-triggering)
  const hasBeenResetRef = useRef(false);

  // Initialize answered cards from backend progress when data loads
  // Now using actual completedChallengeIds instead of assuming first N cards
  useEffect(() => {
    // Skip if already initialized (prevents re-init after reset)
    if (hasInitializedRef.current) return;

    if (practiceItems && practiceItems.length > 0) {
      // DEMO MODE: Mark all cards as completed (only if hasn't been reset)
      if (DEMO_MODE && !hasBeenResetRef.current) {
        const allCardIds = practiceItems.map((item: any) => item._id);
        initializeFromProgress(allCardIds);
        hasInitializedRef.current = true;
        return;
      }

      // Normal mode (or after reset): Use actual progress from backend
      if (levelProgress) {
        const completedIds = levelProgress.completedChallengeIds || [];
        if (completedIds.length > 0) {
          // Use actual completed card IDs from backend
          initializeFromProgress(completedIds);
          hasInitializedRef.current = true;
        }
      }
    }
  }, [practiceItems, levelProgress, initializeFromProgress]);

  const displayItems =
    practiceItems && Array.isArray(practiceItems) ? practiceItems : [];

  // Get shuffled cards for display
  const cardsToDisplay = useMemo(() => {
    return getShuffledCards(displayItems);
  }, [displayItems, getShuffledCards]);

  if (
    !displayItems ||
    !Array.isArray(displayItems) ||
    displayItems.length === 0
  ) {
    return (
      <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-lg font-bold">
            Loading challenges...
          </div>
        </div>
      </div>
    );
  }

  const progress = (state.answeredCards.size / displayItems.length) * 100;
  const selectedCard =
    state.selectedCardIndex !== null && cardsToDisplay[state.selectedCardIndex]
      ? cardsToDisplay[state.selectedCardIndex]
      : null;

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <GameHeader
            onBack={onBack}
            levelTitle={levelDetails?.title}
            progress={progress}
            answeredCount={state.answeredCards.size}
            totalCount={displayItems.length}
          />

          <GameHUD
            score={state.score}
            streak={state.streak}
            answeredCount={state.answeredCards.size}
            totalCount={displayItems.length}
            onShowStats={toggleStats}
            onReset={() => {
              // Mark that user has reset (disables demo mode permanently)
              hasBeenResetRef.current = true;
              // Clear the initialized flag so we can re-init from backend next time
              hasInitializedRef.current = false;
              handleReset();
            }}
            onShuffle={() => handleShuffle(displayItems)}
          />
        </div>

        {state.showStats && <StatsModal levelDetails={levelDetails} />}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {cardsToDisplay.map((card: any, index: number) => (
            <PracticeCard
              key={card._id}
              card={card}
              index={index}
              isAnswered={state.answeredCards.has(card._id)}
              isShuffling={state.isShuffling}
              showAnimation={state.justCompletedCard === card._id}
              lastScoreChange={state.lastScoreChange}
              onClick={() => handleCardClick(index, cardsToDisplay)}
            />
          ))}
        </div>
      </div>

      <CardModal
        card={selectedCard}
        selectedAnswer={state.selectedAnswer}
        timer={state.timer}
        isTimerRunning={state.isTimerRunning}
        lastScoreChange={state.lastScoreChange}
        streak={state.streak}
        isViewingAttempted={isViewingAttempted}
        onClose={() => handleCloseModal(cardsToDisplay)}
        onAnswerSelect={(answer) => handleAnswerSelect(answer, cardsToDisplay)}
        onViewAnswer={() => handleViewAnswer(cardsToDisplay)}
      />

      <LevelCompleteModal
        isOpen={state.showLevelComplete}
        score={state.score}
        totalCards={displayItems.length}
        correctAnswers={state.correctAnswers}
        onPlayAgain={() => {
          closeLevelComplete();
          handleReset();
        }}
        onGoBack={() => {
          closeLevelComplete();
          onBack();
        }}
      />
    </div>
  );
}
