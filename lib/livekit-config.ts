export interface StudyBuddyConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

export const STUDY_BUDDY_CONFIG: StudyBuddyConfig = {
  companyName: "TrainingX",
  pageTitle: "Spiral the Study Buddy",
  pageDescription: "Your AI-powered friend that makes learning fun!",

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: "/spiral-logo.svg",
  accent: "#7C3AED",
  logoDark: "/spiral-logo-dark.svg",
  accentDark: "#A855F7",
  startButtonText: "Start Learning!",

  // agent dispatch configuration
  agentName: process.env.NEXT_PUBLIC_LIVEKIT_AGENT_NAME ?? undefined,

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
