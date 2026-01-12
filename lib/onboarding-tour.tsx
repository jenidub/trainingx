"use client";

import { type Step } from "onborda";

export const TOUR_ID = "welcome-tour";
export const TOUR_STORAGE_KEY = "trainingx-tour-completed";

export function isTourCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
}

export function markTourCompleted() {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOUR_STORAGE_KEY, "true");
}

export function resetTour() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

type Tour = {
  tour: string;
  steps: Step[];
};

export const welcomeTour: Tour = {
  tour: TOUR_ID,
  steps: [
    // Dashboard intro
    {
      icon: <>👋</>,
      title: "Welcome to TrainingX!",
      content:
        "Your personal AI training hub. Let's take a quick tour to help you get started and make the most of the platform.",
      selector: "#onborda-welcome",
      side: "bottom",
      showControls: true,
      pointerPadding: 12,
      pointerRadius: 16,
    },
    {
      icon: <>📊</>,
      title: "Your Progress at a Glance",
      content:
        "Track your Prompt Score, completed projects, and daily streak here. Your Prompt Score increases as you complete challenges and assessments!",
      selector: "#onborda-stats",
      side: "bottom",
      showControls: true,
      pointerPadding: 12,
      pointerRadius: 16,
    },
    // Core Features (detailed)
    {
      icon: <>🎯</>,
      title: "Practice Zone",
      content:
        "This is your training ground! Complete hands-on AI challenges across different domains like Coding, Writing, Design, and more. Start with General AI Skills to unlock specialized tracks.",
      selector: "#onborda-practice-link",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    {
      icon: <>🚀</>,
      title: "Project Arcade",
      content:
        "Build real-world AI projects! Follow step-by-step guides to create impressive applications and build your portfolio.",
      selector: "#onborda-projects-link",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    {
      icon: <>✨</>,
      title: "Matching Zone",
      content:
        "Discover personalized career opportunities, side hustles, and business ideas based on your AI skills. Take a quick assessment to get matched with roles that fit you.",
      selector: "#onborda-matching-link",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    {
      icon: <>📚</>,
      title: "AI Database",
      content:
        "Explore our library of AI tools, prompts, and resources. Great for discovering new ways to use AI in your work.",
      selector: "#onborda-database-link",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    // Engagement (brief)
    {
      icon: <>⚔️</>,
      title: "Duels",
      content:
        "Challenge other users to prompt battles! A fun way to test your skills and climb the leaderboard.",
      selector: "#onborda-duels-link",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    // Community (grouped & brief)
    {
      icon: <>🏆</>,
      title: "Community & Leaderboard",
      content:
        "See where you rank among other AI practitioners and connect with the TrainingX community.",
      selector: "#onborda-community-section",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    // AI Tools (grouped & brief)
    {
      icon: <>🛠️</>,
      title: "AI Tools",
      content:
        "Access Spiral (your AI study buddy), custom GPTs, and other AI tools to boost your learning.",
      selector: "#onborda-aitools-section",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    // Feedback (brief)
    {
      icon: <>💬</>,
      title: "Share Your Feedback",
      content:
        "We're constantly improving! Let us know what you think and help shape the future of TrainingX.",
      selector: "#onborda-feedback-section",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
    // Final step
    {
      icon: <>🚀</>,
      title: "Ready to Begin!",
      content:
        "Head to the Practice Zone to start your first challenge. You can restart this tour anytime from the 'Take Tour' button below. Good luck!",
      selector: "#onborda-practice-link",
      side: "right",
      showControls: true,
      pointerPadding: 8,
      pointerRadius: 12,
    },
  ],
};

export const allTours: Tour[] = [welcomeTour];
