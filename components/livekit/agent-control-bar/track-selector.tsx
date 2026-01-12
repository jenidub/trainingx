"use client";

import { Track } from "livekit-client";
import {
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
} from "@phosphor-icons/react";
import { Toggle } from "@/components/livekit/toggle";

interface TrackSelectorProps {
  kind: MediaDeviceKind;
  source: Track.Source;
  pressed: boolean;
  disabled?: boolean;
  pending?: boolean;
  audioTrackRef?: unknown;
  onPressedChange: () => void;
  onActiveDeviceChange?: (deviceId: string) => void;
  onMediaDeviceError?: (error: Error) => void;
  "aria-label"?: string;
}

export function TrackSelector({
  kind,
  source,
  pressed,
  disabled,
  onPressedChange,
  ...props
}: TrackSelectorProps) {
  const getIcon = () => {
    if (kind === "audioinput") {
      return pressed ? (
        <Microphone weight="bold" />
      ) : (
        <MicrophoneSlash weight="bold" />
      );
    }
    return pressed ? (
      <VideoCamera weight="bold" />
    ) : (
      <VideoCameraSlash weight="bold" />
    );
  };

  return (
    <Toggle
      variant="secondary"
      size="icon"
      pressed={pressed}
      disabled={disabled}
      onPressedChange={onPressedChange}
      aria-label={props["aria-label"]}
    >
      {getIcon()}
    </Toggle>
  );
}
