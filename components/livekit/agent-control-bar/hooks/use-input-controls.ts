"use client";

import { useCallback, useState, useMemo } from "react";
import { Track } from "livekit-client";
import {
  useTracks,
  useLocalParticipant,
  type TrackReference,
} from "@livekit/components-react";

export interface UseInputControlsProps {
  saveUserChoices?: boolean;
  onDisconnect?: () => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
}

export function useInputControls({
  onDeviceError,
  saveUserChoices = true,
}: UseInputControlsProps = {}) {
  const { localParticipant } = useLocalParticipant();
  const [micEnabled, setMicEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [micPending, setMicPending] = useState(false);
  const [cameraPending, setCameraPending] = useState(false);
  const [screenSharePending, setScreenSharePending] = useState(false);

  const micTrackRef = useMemo<TrackReference | undefined>(() => {
    const publication = localParticipant.getTrackPublication(
      Track.Source.Microphone
    );
    return publication
      ? {
          source: Track.Source.Microphone,
          participant: localParticipant,
          publication,
        }
      : undefined;
  }, [localParticipant]);

  const toggleMicrophone = useCallback(async () => {
    if (micPending) return;
    setMicPending(true);
    try {
      await localParticipant.setMicrophoneEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
    } catch (error) {
      onDeviceError?.({
        source: Track.Source.Microphone,
        error: error as Error,
      });
    } finally {
      setMicPending(false);
    }
  }, [localParticipant, micEnabled, micPending, onDeviceError]);

  const toggleCamera = useCallback(async () => {
    if (cameraPending) return;
    setCameraPending(true);
    try {
      await localParticipant.setCameraEnabled(!cameraEnabled);
      setCameraEnabled(!cameraEnabled);
    } catch (error) {
      onDeviceError?.({ source: Track.Source.Camera, error: error as Error });
    } finally {
      setCameraPending(false);
    }
  }, [localParticipant, cameraEnabled, cameraPending, onDeviceError]);

  const toggleScreenShare = useCallback(async () => {
    if (screenSharePending) return;
    setScreenSharePending(true);
    try {
      await localParticipant.setScreenShareEnabled(!screenShareEnabled);
      setScreenShareEnabled(!screenShareEnabled);
    } catch (error) {
      onDeviceError?.({
        source: Track.Source.ScreenShare,
        error: error as Error,
      });
    } finally {
      setScreenSharePending(false);
    }
  }, [localParticipant, screenShareEnabled, screenSharePending, onDeviceError]);

  const handleAudioDeviceChange = useCallback((deviceId: string) => {
    // Device selection is handled by TrackSelector component
    console.log("Audio device changed:", deviceId);
  }, []);

  const handleVideoDeviceChange = useCallback((deviceId: string) => {
    // Device selection is handled by TrackSelector component
    console.log("Video device changed:", deviceId);
  }, []);

  const handleMicrophoneDeviceSelectError = useCallback(
    (error: Error) => {
      onDeviceError?.({ source: Track.Source.Microphone, error });
    },
    [onDeviceError]
  );

  const handleCameraDeviceSelectError = useCallback(
    (error: Error) => {
      onDeviceError?.({ source: Track.Source.Camera, error });
    },
    [onDeviceError]
  );

  return {
    micTrackRef,
    microphoneToggle: {
      enabled: micEnabled,
      pending: micPending,
      toggle: toggleMicrophone,
    },
    cameraToggle: {
      enabled: cameraEnabled,
      pending: cameraPending,
      toggle: toggleCamera,
    },
    screenShareToggle: {
      enabled: screenShareEnabled,
      pending: screenSharePending,
      toggle: toggleScreenShare,
    },
    handleAudioDeviceChange,
    handleVideoDeviceChange,
    handleMicrophoneDeviceSelectError,
    handleCameraDeviceSelectError,
  };
}
