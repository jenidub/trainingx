"use client";

import { useLocalParticipant } from "@livekit/components-react";

export function usePublishPermissions() {
  const { localParticipant } = useLocalParticipant();
  const permissions = localParticipant.permissions;

  return {
    microphone: permissions?.canPublish ?? true,
    camera: permissions?.canPublish ?? true,
    screenShare: permissions?.canPublish ?? true,
    data: permissions?.canPublishData ?? true,
  };
}
