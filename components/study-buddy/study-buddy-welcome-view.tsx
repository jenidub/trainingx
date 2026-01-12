"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

// Animated mascot SVG component
function StudyBuddyMascot({ isHovered }: { isHovered: boolean }) {
  return (
    <motion.div
      animate={{
        y: isHovered ? -5 : [0, -10, 0],
        rotate: isHovered ? [0, -5, 5, 0] : 0,
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 0.5,
          ease: "easeInOut",
        },
      }}
      className="relative"
    >
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        {/* Main body - friendly round shape */}
        <circle
          cx="80"
          cy="85"
          r="60"
          className="fill-gradient-primary"
          fill="url(#mascotGradient)"
        />

        {/* Cute ears */}
        <ellipse cx="40" cy="45" rx="18" ry="22" fill="url(#mascotGradient)" />
        <ellipse cx="120" cy="45" rx="18" ry="22" fill="url(#mascotGradient)" />
        <ellipse cx="40" cy="45" rx="10" ry="14" fill="#FFB6C1" />
        <ellipse cx="120" cy="45" rx="10" ry="14" fill="#FFB6C1" />

        {/* Face */}
        <circle cx="80" cy="85" r="50" fill="#FFECD2" />

        {/* Eyes */}
        <motion.g
          animate={{
            scaleY: isHovered ? [1, 0.1, 1] : 1,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          <circle cx="60" cy="80" r="12" fill="#2D1B69" />
          <circle cx="100" cy="80" r="12" fill="#2D1B69" />
          <circle cx="63" cy="77" r="4" fill="white" />
          <circle cx="103" cy="77" r="4" fill="white" />
        </motion.g>

        {/* Blush */}
        <circle cx="45" cy="95" r="8" fill="#FFB6C1" opacity="0.6" />
        <circle cx="115" cy="95" r="8" fill="#FFB6C1" opacity="0.6" />

        {/* Smile */}
        <motion.path
          d="M65 105 Q80 120 95 105"
          stroke="#2D1B69"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          animate={{
            d: isHovered ? "M65 105 Q80 125 95 105" : "M65 105 Q80 120 95 105",
          }}
        />

        {/* Graduation cap */}
        <polygon points="80,25 30,45 80,55 130,45" fill="#2D1B69" />
        <rect x="60" y="45" width="40" height="8" fill="#2D1B69" />
        <line
          x1="120"
          y1="45"
          x2="135"
          y2="60"
          stroke="#2D1B69"
          strokeWidth="3"
        />
        <circle cx="135" cy="65" r="6" fill="#FFD700" />

        {/* Sparkles */}
        <motion.g
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        >
          <path d="M25 70 L28 75 L25 80 L22 75 Z" fill="#FFD700" />
          <path d="M135 100 L138 105 L135 110 L132 105 Z" fill="#FFD700" />
          <path d="M140 75 L143 80 L140 85 L137 80 Z" fill="#FFD700" />
        </motion.g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient
            id="mascotGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// Pre-computed particle positions to avoid hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 5, top: 10, duration: 3.2, delay: 0.1 },
  { left: 15, top: 25, duration: 4.1, delay: 0.8 },
  { left: 25, top: 45, duration: 3.7, delay: 1.5 },
  { left: 35, top: 15, duration: 4.5, delay: 0.3 },
  { left: 45, top: 65, duration: 3.9, delay: 1.2 },
  { left: 55, top: 35, duration: 4.3, delay: 0.6 },
  { left: 65, top: 75, duration: 3.4, delay: 1.8 },
  { left: 75, top: 55, duration: 4.0, delay: 0.4 },
  { left: 85, top: 20, duration: 3.6, delay: 1.1 },
  { left: 95, top: 80, duration: 4.2, delay: 0.9 },
  { left: 10, top: 90, duration: 3.8, delay: 1.6 },
  { left: 20, top: 5, duration: 4.4, delay: 0.2 },
  { left: 30, top: 70, duration: 3.3, delay: 1.4 },
  { left: 40, top: 40, duration: 4.6, delay: 0.7 },
  { left: 50, top: 85, duration: 3.5, delay: 1.9 },
  { left: 60, top: 50, duration: 4.1, delay: 0.5 },
  { left: 70, top: 30, duration: 3.9, delay: 1.3 },
  { left: 80, top: 60, duration: 4.3, delay: 1.0 },
  { left: 90, top: 95, duration: 3.7, delay: 1.7 },
  { left: 3, top: 55, duration: 4.0, delay: 0.0 },
];

const PARTICLE_COLORS = ["#FFD700", "#7C3AED", "#10B981", "#F472B6", "#60A5FA"];

// Floating particles
function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLE_POSITIONS.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            background: PARTICLE_COLORS[i % 5],
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Stats display
function StatsDisplay() {
  const stats = [
    {
      icon: "🔥",
      label: "Streak",
      value: "7",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: "⭐",
      label: "XP",
      value: "1,250",
      color: "from-yellow-400 to-orange-400",
    },
    {
      icon: "🏆",
      label: "Level",
      value: "5",
      color: "from-purple-400 to-pink-500",
    },
  ];

  return (
    <div className="flex justify-center gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm"
        >
          <span className="text-xl">{stat.icon}</span>
          <div className="text-left">
            <p className="text-xs text-white/70">{stat.label}</p>
            <p className="text-sm font-bold text-white">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Subject buttons
function SubjectButtons() {
  const subjects = [
    {
      emoji: "📐",
      name: "Math",
      color: "bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/50",
    },
    {
      emoji: "🔬",
      name: "Science",
      color: "bg-green-500/20 hover:bg-green-500/40 border-green-400/50",
    },
    {
      emoji: "📚",
      name: "English",
      color: "bg-purple-500/20 hover:bg-purple-500/40 border-purple-400/50",
    },
    {
      emoji: "🌍",
      name: "History",
      color: "bg-amber-500/20 hover:bg-amber-500/40 border-amber-400/50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex max-w-sm flex-wrap justify-center gap-3"
    >
      {subjects.map((subject) => (
        <motion.button
          key={subject.name}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 backdrop-blur-sm transition-all ${subject.color}`}
        >
          <span className="text-lg">{subject.emoji}</span>
          <span className="text-sm font-medium text-white">{subject.name}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}

interface StudyBuddyWelcomeViewProps {
  onStartCall: () => void;
}

export const StudyBuddyWelcomeView = ({
  onStartCall,
  ref,
}: React.ComponentProps<"div"> & StudyBuddyWelcomeViewProps) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <div
      ref={ref}
      className="relative min-h-svh overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 30%, #1e3a5f 70%, #0d1f2d 100%)",
      }}
    >
      {/* Animated background elements */}
      <FloatingParticles />

      {/* Gradient orbs */}
      <div className="absolute top-20 -left-32 h-96 w-96 animate-pulse rounded-full bg-purple-600/30 blur-3xl" />
      <div
        className="absolute -right-32 bottom-20 h-96 w-96 animate-pulse rounded-full bg-blue-600/30 blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 py-12">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <StatsDisplay />
        </motion.div>

        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="cursor-pointer"
        >
          <StudyBuddyMascot isHovered={isButtonHovered} />
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-lg font-medium text-white/70">{greeting}! 👋</p>
          <h1 className="mt-2 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Meet Your Study Buddy
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-white/60">
            Your AI-powered friend that makes learning fun! Ask questions, get
            help with homework, or explore new topics together.
          </p>
        </motion.div>

        {/* Subject buttons */}
        <motion.div className="mt-8">
          <SubjectButtons />
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10"
        >
          <motion.button
            onClick={onStartCall}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden rounded-2xl px-10 py-5 text-lg font-bold text-white transition-all duration-300"
            style={{
              background:
                "linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #7C3AED 100%)",
              backgroundSize: "200% 200%",
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            {/* Button content */}
            <span className="relative flex items-center gap-3">
              <motion.span
                animate={{ rotate: isButtonHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                🎙️
              </motion.span>
              <span>Start Learning!</span>
              <motion.span
                animate={{ x: isButtonHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </span>
          </motion.button>
        </motion.div>

        {/* Daily challenge hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2"
        >
          <span className="text-xl">🎯</span>
          <p className="text-sm text-amber-200">
            <span className="font-semibold">Daily Challenge:</span> Ask 3
            questions to earn bonus XP!
          </p>
        </motion.div>

        {/* Recent achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-8 text-center"
        >
          <p className="mb-3 text-sm text-white/50">Recent Achievements</p>
          <div className="flex justify-center gap-2">
            {["🥇", "📖", "🧠", "✨", "🚀"].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + i * 0.1, type: "spring" }}
                whileHover={{ scale: 1.2, rotate: 10 }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg backdrop-blur-sm"
              >
                {badge}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute right-0 bottom-4 left-0 text-center">
        <p className="text-xs text-white/30">
          Powered by AI • Made for curious minds 🧠
        </p>
      </div>
    </div>
  );
};
