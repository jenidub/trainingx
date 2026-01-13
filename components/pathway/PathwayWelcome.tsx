"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PathwayWelcomeProps {
  onStart: () => void;
}

export function PathwayWelcome({ onStart }: PathwayWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto text-center space-y-8"
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border border-slate-100"
      >
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-slate-600">
          Free Assessment • 3 Minutes
        </span>
      </motion.div>

      {/* Hero Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-xl shadow-primary/20"
      >
        <Rocket className="h-12 w-12 text-white" />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
          Welcome to Your{" "}
          <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
            21st Century
          </span>{" "}
          Success Pathway
        </h1>
      </motion.div>

      {/* Body Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 text-lg text-slate-600 max-w-xl mx-auto"
      >
        <p>
          Taking this AI Prompting & Skills Assessment is your first step into
          the future. It will help you discover exactly where you fit in the new
          AI economy.
        </p>
        <p>
          Based on your answers, we will generate a{" "}
          <strong className="text-slate-800">custom Success Pathway</strong>{" "}
          just for you. You will see which cool AI careers, trades, and side
          hustles match your natural talents.
        </p>
      </motion.div>

      {/* Reassurance */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-slate-500 font-medium"
      >
        There are no right or wrong answers—just be real.
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          size="lg"
          onClick={onStart}
          className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-xl shadow-primary/20 group"
        >
          Start Assessment
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
