"use client";

import { motion } from "framer-motion";
import { User, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AgeSelectionProps {
  onSelect: (ageGroup: "youth" | "adult") => void;
}

export function AgeSelection({ onSelect }: AgeSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto text-center space-y-8"
    >
      <div className="space-y-2">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-semibold text-[var(--gradient-from)] uppercase tracking-wider"
        >
          Let&apos;s personalize this for you
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-slate-900"
        >
          How old are you?
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <AgeCard
          title="I'm Under 18"
          subtitle="Student / Teen"
          icon={User}
          delay={0.3}
          onClick={() => onSelect("youth")}
          gradientFrom="var(--gradient-from)"
          gradientTo="var(--gradient-to)"
        />
        <AgeCard
          title="I'm 18 or Older"
          subtitle="Adult"
          icon={Users}
          delay={0.4}
          onClick={() => onSelect("adult")}
          gradientFrom="var(--gradient-to)"
          gradientTo="var(--gradient-from)"
        />
      </div>
    </motion.div>
  );
}

interface AgeCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  delay: number;
  onClick: () => void;
  gradientFrom: string;
  gradientTo: string;
}

function AgeCard({
  title,
  subtitle,
  icon: Icon,
  delay,
  onClick,
  gradientFrom,
  gradientTo,
}: AgeCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 border-white bg-white/80 backdrop-blur-sm text-center transition-all duration-300 hover:border-[var(--gradient-from)]/30 hover:shadow-xl hover:shadow-[var(--gradient-from)]/10"
    >
      {/* Icon */}
      <div
        className="p-4 rounded-2xl text-white shadow-lg"
        style={{
          background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <Icon className="w-8 h-8" />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <span className="text-xl font-bold text-slate-800 block">{title}</span>
        <span className="text-sm text-slate-500 block">{subtitle}</span>
      </div>
    </motion.button>
  );
}
