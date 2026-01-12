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
import { ViewController } from "@/components/study-buddy/view-controller";
import { Toaster } from "@/components/livekit/toaster";
import { useAgentErrors } from "@/hooks/livekit/useAgentErrors";
import { useDebugMode } from "@/hooks/livekit/useDebug";

const IN_DEVELOPMENT = process.env.NODE_ENV !== "production";

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: StudyBuddyConfig;
}

export function App({ appConfig }: AppProps) {
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
      <main className="grid h-svh grid-cols-1 place-content-center">
        <ViewController appConfig={appConfig} />
      </main>
      <StartAudio label="Start Audio" />
      <RoomAudioRenderer />
      <Toaster />
    </SessionProvider>
  );
}
