"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSessionContext } from "@livekit/components-react";
import type { StudyBuddyConfig } from "@/lib/livekit-config";
import { StudyBuddySessionView } from "@/components/study-buddy/study-buddy-session-view";
import { StudyBuddyWelcomeView } from "@/components/study-buddy/study-buddy-welcome-view";

const MotionWelcomeView = motion.create(StudyBuddyWelcomeView);
const MotionSessionView = motion.create(StudyBuddySessionView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
    },
    hidden: {
      opacity: 0,
    },
  },
  initial: "hidden",
  animate: "visible",
  exit: "hidden",
  transition: {
    duration: 0.5,
    ease: "linear" as const,
  },
};

interface StudyBuddyViewControllerProps {
  appConfig: StudyBuddyConfig;
}

export function StudyBuddyViewController({
  appConfig,
}: StudyBuddyViewControllerProps) {
  const { isConnected, start } = useSessionContext();

  return (
    <AnimatePresence mode="wait">
      {/* Welcome view */}
      {!isConnected && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          onStartCall={start}
        />
      )}
      {/* Session view */}
      {isConnected && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          appConfig={appConfig}
        />
      )}
    </AnimatePresence>
  );
}
