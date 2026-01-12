"use client";

import { Track } from "livekit-client";
import {
  Microphone,
  MicrophoneSlash,
  VideoCamera,
  VideoCameraSlash,
  Screencast,
} from "@phosphor-icons/react";
import { Toggle, type toggleVariants } from "@/components/livekit/toggle";
import type { VariantProps } from "class-variance-authority";

interface TrackToggleProps extends VariantProps<typeof toggleVariants> {
  source: Track.Source;
  pressed: boolean;
  disabled?: boolean;
  onPressedChange: () => void;
  "aria-label"?: string;
}

export function TrackToggle({
  source,
  pressed,
  disabled,
  onPressedChange,
  variant,
  size,
  ...props
}: TrackToggleProps) {
  const getIcon = () => {
    switch (source) {
      case Track.Source.Microphone:
        return pressed ? (
          <Microphone weight="bold" />
        ) : (
          <MicrophoneSlash weight="bold" />
        );
      case Track.Source.Camera:
        return pressed ? (
          <VideoCamera weight="bold" />
        ) : (
          <VideoCameraSlash weight="bold" />
        );
      case Track.Source.ScreenShare:
        return <Screencast weight="bold" />;
      default:
        return null;
    }
  };

  return (
    <Toggle
      variant={variant}
      size={size}
      pressed={pressed}
      disabled={disabled}
      onPressedChange={onPressedChange}
      {...props}
    >
      {getIcon()}
    </Toggle>
  );
}
