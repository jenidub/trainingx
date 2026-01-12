"use client";

import React, { useEffect, useRef, useState } from "react";
import { Track } from "livekit-client";
import { AnimatePresence, motion } from "motion/react";
import {
  type AgentState,
  BarVisualizer,
  VideoTrack,
  useSessionContext,
  useSessionMessages,
  useTracks,
  useVoiceAssistant,
} from "@livekit/components-react";
import type { StudyBuddyConfig } from "@/lib/livekit-config";
import { useLocalTrackRef } from "@/hooks/livekit/useLocalTrackRef";
import {
  AgentControlBar,
  type ControlBarControls,
} from "@/components/livekit/agent-control-bar/agent-control-bar";
import { ScrollArea } from "@/components/livekit/scroll-area/scroll-area";
import { cn } from "@/lib/utils";

// Animated mascot for session
function SessionMascot({
  agentState,
  agentAudioTrack,
}: {
  agentState: AgentState;
  agentAudioTrack: any;
}) {
  const isListening = agentState === "listening";
  const isSpeaking = agentState === "speaking";
  const isThinking = agentState === "thinking";

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isSpeaking ? [1, 1.05, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: isSpeaking ? Infinity : 0,
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)",
        }}
        animate={{
          scale: isSpeaking ? [1, 1.3, 1] : isListening ? [1, 1.15, 1] : 1,
          opacity: isSpeaking
            ? [0.5, 0.8, 0.5]
            : isListening
              ? [0.3, 0.5, 0.3]
              : 0.3,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main avatar container */}
      <div className="relative h-40 w-40 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-violet-600 p-1 md:h-56 md:w-56">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-900/50 to-violet-900/50 backdrop-blur-sm">
          {/* Visualizer bars in the background */}
          <BarVisualizer
            barCount={5}
            state={agentState}
            options={{ minHeight: 10 }}
            trackRef={agentAudioTrack}
            className="absolute inset-0 flex items-center justify-center gap-1"
          >
            <motion.span
              className="min-h-4 w-3 rounded-full bg-gradient-to-t from-purple-400 to-pink-400"
              animate={{
                scaleY: isSpeaking ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                repeat: isSpeaking ? Infinity : 0,
              }}
            />
          </BarVisualizer>

          {/* Mascot face */}
          <svg
            viewBox="0 0 100 100"
            className="relative z-10 h-28 w-28 md:h-36 md:w-36"
          >
            {/* Face base */}
            <circle cx="50" cy="50" r="40" fill="#FFECD2" />

            {/* Eyes */}
            <motion.g
              animate={{
                scaleY: isThinking ? [1, 0.1, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                repeat: isThinking ? Infinity : 0,
                repeatDelay: 2,
              }}
              style={{ transformOrigin: "50% 45%" }}
            >
              <circle cx="35" cy="45" r="8" fill="#2D1B69" />
              <circle cx="65" cy="45" r="8" fill="#2D1B69" />
              <circle cx="37" cy="43" r="3" fill="white" />
              <circle cx="67" cy="43" r="3" fill="white" />
            </motion.g>

            {/* Blush */}
            <circle cx="22" cy="55" r="6" fill="#FFB6C1" opacity="0.6" />
            <circle cx="78" cy="55" r="6" fill="#FFB6C1" opacity="0.6" />

            {/* Mouth */}
            <motion.path
              d={
                isSpeaking
                  ? "M35 65 Q50 80 65 65"
                  : isListening
                    ? "M40 68 Q50 72 60 68"
                    : "M38 68 Q50 75 62 68"
              }
              stroke="#2D1B69"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Status indicator */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold"
        style={{
          background: isListening
            ? "linear-gradient(135deg, #10B981, #34D399)"
            : isSpeaking
              ? "linear-gradient(135deg, #7C3AED, #A855F7)"
              : isThinking
                ? "linear-gradient(135deg, #F59E0B, #FBBF24)"
                : "linear-gradient(135deg, #6B7280, #9CA3AF)",
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        <span className="flex items-center gap-1.5 text-white">
          {isListening && (
            <>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🎧
              </motion.span>
              Listening...
            </>
          )}
          {isSpeaking && (
            <>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                💬
              </motion.span>
              Speaking
            </>
          )}
          {isThinking && (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🧠
              </motion.span>
              Thinking...
            </>
          )}
          {!isListening && !isSpeaking && !isThinking && (
            <>
              <span>✨</span>
              Ready
            </>
          )}
        </span>
      </motion.div>
    </motion.div>
  );
}

// Chat message component
function ChatMessage({ message, isUser }: { message: any; isUser: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex max-w-[85%] gap-3",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm",
          isUser
            ? "bg-gradient-to-br from-blue-500 to-cyan-500"
            : "bg-gradient-to-br from-purple-500 to-pink-500"
        )}
      >
        {isUser ? "👤" : "🤖"}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "rounded-2xl px-4 py-3",
          isUser
            ? "rounded-tr-md border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
            : "rounded-tl-md border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
        )}
      >
        <p className="text-sm leading-relaxed text-white/90">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

// XP Gain animation
function XPGainPopup({
  amount,
  onComplete,
}: {
  amount: number;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -30, scale: 1 }}
      exit={{ opacity: 0, y: -60 }}
      className="fixed top-20 right-6 z-50"
    >
      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 font-bold text-white shadow-lg">
        <span>⭐</span>
        <span>+{amount} XP</span>
      </div>
    </motion.div>
  );
}

// Session stats bar
function SessionStatsBar({
  questionCount,
  sessionDuration,
}: {
  questionCount: number;
  sessionDuration: number;
}) {
  const minutes = Math.floor(sessionDuration / 60);
  const seconds = sessionDuration % 60;

  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
        <span>❓</span>
        <span className="text-sm font-medium text-white">
          {questionCount} questions
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
        <span>⏱️</span>
        <span className="text-sm font-medium text-white">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-1.5">
        <span>🔥</span>
        <span className="text-sm font-medium text-yellow-200">On Fire!</span>
      </div>
    </div>
  );
}

interface StudyBuddySessionViewProps {
  appConfig: StudyBuddyConfig;
}

export const StudyBuddySessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<"section"> & StudyBuddySessionViewProps) => {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack = useLocalTrackRef(Track.Source.Camera);

  const [chatOpen, setChatOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [xpGains, setXpGains] = useState<number[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled =
    screenShareTrack && !screenShareTrack.publication.isMuted;

  const controls: ControlBarControls = {
    leave: true,
    microphone: true,
    chat: appConfig.supportsChatInput,
    camera: appConfig.supportsVideoInput,
    screenShare: appConfig.supportsScreenShare,
  };

  // Track session duration
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Track questions and award XP
  useEffect(() => {
    const userMessages = messages.filter((m) => m.from?.isLocal);
    if (userMessages.length > questionCount) {
      setQuestionCount(userMessages.length);
      // Award XP for asking questions
      const xp = 10 + Math.floor(Math.random() * 10);
      setXpGains((prev) => [...prev, xp]);
    }
  }, [messages, questionCount]);

  // Auto scroll to bottom
  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section
      className="relative min-h-svh overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1e3a5f 70%, #0d1f2d 100%)",
      }}
      {...props}
    >
      {/* Gradient orbs */}
      <div className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

      {/* XP Gain popups */}
      <AnimatePresence>
        {xpGains.map((xp, i) => (
          <XPGainPopup
            key={`${i}-${xp}`}
            amount={xp}
            onComplete={() =>
              setXpGains((prev) => prev.filter((_, idx) => idx !== 0))
            }
          />
        ))}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 px-6 pt-6"
      >
        <SessionStatsBar
          questionCount={questionCount}
          sessionDuration={sessionDuration}
        />
      </motion.div>

      {/* Main content area */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8">
        {/* Chat area or mascot */}
        <AnimatePresence mode="wait">
          {chatOpen ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[50vh] w-full max-w-2xl md:h-[55vh]"
            >
              {/* Mini mascot */}
              <div className="mb-4 flex justify-center">
                <motion.div
                  className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 p-0.5"
                  animate={{
                    scale: agentState === "speaking" ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: agentState === "speaking" ? Infinity : 0,
                  }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-900/50 text-2xl">
                    🤖
                  </div>
                </motion.div>
              </div>

              {/* Chat messages */}
              <ScrollArea
                ref={scrollAreaRef}
                className="h-full rounded-2xl border border-white/10 bg-white/5 px-4 backdrop-blur-sm"
              >
                <div className="space-y-4 py-4">
                  {messages.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-white/50">
                        Start talking! I&apos;m here to help you learn 📚
                      </p>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={index}
                      message={message}
                      isUser={message.from?.isLocal ?? false}
                    />
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <motion.div
              key="mascot"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center"
            >
              {/* Avatar video or mascot */}
              {agentVideoTrack ? (
                <div className="h-64 w-64 overflow-hidden rounded-3xl border-4 border-purple-500/50 bg-black shadow-2xl md:h-80 md:w-80">
                  <VideoTrack
                    trackRef={agentVideoTrack}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <SessionMascot
                  agentState={agentState}
                  agentAudioTrack={agentAudioTrack}
                />
              )}

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 text-center"
              >
                <p className="text-sm text-white/40">
                  💡 Tip: Ask specific questions for better answers!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera preview */}
        {(isCameraEnabled || isScreenShareEnabled) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed right-6 bottom-32 z-30"
          >
            <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-purple-500/50 bg-black shadow-xl md:h-32 md:w-32">
              <VideoTrack
                trackRef={cameraTrack || screenShareTrack}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom control bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        <div className="mx-auto max-w-2xl pb-6 md:pb-8">
          {/* Gamified control bar wrapper */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 blur-xl" />

            {/* Control bar */}
            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-xl">
              <AgentControlBar
                controls={controls}
                isConnected={session.isConnected}
                onDisconnect={session.end}
                onChatOpenChange={setChatOpen}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement unlock notification (example) */}
      {questionCount === 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="rounded-3xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6 text-center text-white shadow-2xl">
            <div className="mb-2 text-4xl">🏆</div>
            <h3 className="text-xl font-bold">Achievement Unlocked!</h3>
            <p className="mt-1 text-sm opacity-90">Asked 3 Questions</p>
            <p className="mt-2 text-lg font-bold">+50 XP</p>
          </div>
        </motion.div>
      )}
    </section>
  );
};
