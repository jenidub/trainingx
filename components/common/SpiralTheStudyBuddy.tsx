"use client";

import { App as StudyBuddyApp } from "@/components/study-buddy/app";
import { STUDY_BUDDY_CONFIG } from "@/lib/livekit-config";

export default function SpiralTheStudyBuddy() {
  return <StudyBuddyApp appConfig={STUDY_BUDDY_CONFIG} />;
}
