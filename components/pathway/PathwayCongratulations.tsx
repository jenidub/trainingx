"use client";

import { motion } from "framer-motion";
import { ArrowRight, PartyPopper, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface PathwayCongratulationsProps {
  ageGroup: "youth" | "adult" | null;
  onSignUp: () => void;
}

export function PathwayCongratulations({
  ageGroup,
  onSignUp,
}: PathwayCongratulationsProps) {
  // Trigger confetti on mount
  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6366f1", "#8b5cf6", "#a855f7"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6366f1", "#8b5cf6", "#a855f7"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const isYouth = ageGroup === "youth";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full max-w-2xl mx-auto text-center space-y-8"
    >
      {/* Celebration Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30"
      >
        <Trophy className="h-12 w-12 text-white" />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-center gap-2">
          <PartyPopper className="h-6 w-6 text-amber-500" />
          <span className="text-lg font-semibold text-amber-600">
            Amazing work!
          </span>
          <PartyPopper className="h-6 w-6 text-amber-500 scale-x-[-1]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Congratulations! You&apos;ve Unlocked Your Profile.
        </h1>
      </motion.div>

      {/* Body Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 text-lg text-slate-600 max-w-xl mx-auto"
      >
        <p>
          Your results are in! Based on your answers, we have identified your
          unique{" "}
          <strong className="text-slate-800">
            {isYouth ? "Success Pathway" : "Prompting Aptitude"}
          </strong>{" "}
          and where your skills fit best in the 21st Century.
        </p>
        <p>
          Your Personal Results show your strengths, your hidden talents, and
          the specific AI tools you are naturally good at.
        </p>
      </motion.div>

      {/* The Hook */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-r from-primary/5 to-indigo-50 border border-primary/10 p-6 max-w-lg mx-auto"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-slate-600 text-left">
            This profile is just the beginning. The platform is designed to help
            you turn these strengths into real{" "}
            <strong className="text-slate-800">money and skills</strong>.
            Remember: The better you prompt, the better outcomes you get with
            every tool on the market.
          </p>
        </div>
      </motion.div>

      {/* Question */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-base font-medium text-slate-700"
      >
        Ready to see your matches for AI Careers, Trades, and Side Hustles?
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          size="lg"
          onClick={onSignUp}
          className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-xl shadow-primary/20 group"
        >
          Sign Up to View My Pathway
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm text-slate-500"
      >
        Free to join • No credit card required
      </motion.p>
    </motion.div>
  );
}
