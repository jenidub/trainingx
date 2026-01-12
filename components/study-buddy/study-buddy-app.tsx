"use client";

import { useMemo } from "react";
import { TokenSource } from "livekit-client";
import {
  RoomAudioRenderer,
  SessionProvider,
  StartAudio,
  useSession,
} from "@livekit/components-react";
import type { StudyBuddyConfig } from "@/lib/livekit-config";
import { Toaster } from "@/components/livekit/toaster";
import { StudyBuddyViewController } from "@/components/study-buddy/study-buddy-view-controller";
import { useAgentErrors } from "@/hooks/livekit/useAgentErrors";
import { useDebugMode } from "@/hooks/livekit/useDebug";

const IN_DEVELOPMENT = process.env.NODE_ENV !== "production";

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface StudyBuddyAppProps {
  appConfig: StudyBuddyConfig;
}

export function StudyBuddyApp({ appConfig }: StudyBuddyAppProps) {
  const tokenSource = useMemo(() => {
    return TokenSource.endpoint("/api/livekit/connection-details");
  }, []);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  return (
    <SessionProvider session={session}>
      <AppSetup />
      <main className="min-h-svh overflow-hidden">
        <StudyBuddyViewController appConfig={appConfig} />
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}
