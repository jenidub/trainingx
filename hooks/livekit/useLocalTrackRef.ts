"use client";

import { useMemo } from "react";
import { Track } from "livekit-client";
import {
  type TrackReference,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from "@livekit/components-react";

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () =>
      publication
        ? { source, participant: localParticipant, publication }
        : undefined,
    [source, publication, localParticipant]
  );
  return trackRef;
}
