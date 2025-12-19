"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Lock,
  MapPin,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
  BookOpen,
  Code,
  Rocket,
  Shield,
  Brain,
} from "lucide-react";

import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Dummy Data for Opportunity Details
const DUMMY_OPPORTUNITY = {
  id: "1",
  title: "AI Solutions Architect",
  company: "TechCorp Inc.",
  type: "career",
  location: "San Francisco, CA",
  salaryRange: "$150k - $220k",
  description:
    "Lead the design and implementation of enterprise-scale AI solutions. You will work closely with stakeholders to identify business problems that can be solved with AI and design the architecture to support those solutions.",
  matchScore: 94,
  potentialXp: 2500,
  skills: ["Python", "TensorFlow", "System Design", "Cloud Architecture"],
};

// Dummy Data for Roadmap
const DUMMY_ROADMAP = [
  {
    id: 1,
    title: "Foundations",
    subtitle: "AI Architecture Basics",
    status: "completed",
    xp: 500,
    icon: BookOpen,
    color: "bg-green-500 border-green-600",
  },
  {
    id: 2,
    title: "Cloud Mastery",
    subtitle: "AWS & GCP Deployment",
    status: "in-progress",
    progress: 65,
    xp: 750,
    icon: Code,
    color: "bg-blue-500 border-blue-600",
  },
  {
    id: 3,
    title: "RAG Pipeline",
    subtitle: "Build a Retrieval System",
    status: "locked",
    xp: 1000,
    icon: Rocket,
    color: "bg-purple-500 border-purple-600",
  },
  {
    id: 4,
    title: "Security",
    subtitle: "Enterprise Compliance",
    status: "locked",
    xp: 600,
    icon: Shield,
    color: "bg-orange-500 border-orange-600",
  },
  {
    id: 5,
    title: "Capstone",
    subtitle: "Full System Design",
    status: "locked",
    xp: 1500,
    icon: Trophy,
    color: "bg-yellow-400 border-yellow-600",
  },
];

const RoadmapNode = ({
  node,
  index,
  isLast,
}: {
  node: any;
  index: number;
  isLast: boolean;
}) => {
  const isLocked = node.status === "locked";
  const isCompleted = node.status === "completed";
  const isActive = node.status === "in-progress";

  return (
    <div className="relative flex flex-col items-center z-10">
      {/* Connecting Line */}
      {!isLast && (
        <div className="absolute top-20 h-24 w-3 bg-slate-200 rounded-full -z-10" />
      )}

      {/* Node Button */}
      <motion.div
        whileHover={!isLocked ? { scale: 1.1 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        className={`relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-b-8 transition-all duration-200 cursor-pointer ${
          isLocked
            ? "bg-slate-200 border-slate-300 text-slate-400"
            : `${node.color} border-black/20 text-white shadow-xl`
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-10 w-10 stroke-3" />
        ) : isLocked ? (
          <Lock className="h-8 w-8 opacity-50" />
        ) : (
          <node.icon className="h-10 w-10 stroke-[2.5]" />
        )}

        {/* Floating Stars for Completed */}
        {isCompleted && (
          <div className="absolute -right-2 -top-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 border-2 border-b-4 border-yellow-600 text-yellow-900">
              <Star className="h-4 w-4 fill-current" />
            </div>
          </div>
        )}
      </motion.div>

      {/* Label Box */}
      <div
        className={`mt-3 text-center transition-opacity duration-300 ${isLocked ? "opacity-50" : "opacity-100"}`}
      >
        <h4 className="text-lg font-extrabold text-slate-700 leading-tight">
          {node.title}
        </h4>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {node.subtitle}
        </p>
      </div>

      {/* Active Popover */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-28 top-4 w-48 rounded-2xl border-2 border-b-4 border-blue-200 bg-white p-3 shadow-lg z-20 hidden md:block"
        >
          <div className="absolute -left-2 top-6 h-4 w-4 rotate-45 border-b-2 border-l-2 border-blue-200 bg-white" />
          <p className="mb-2 text-sm font-bold text-slate-600">Current Goal</p>
          <Progress
            value={node.progress}
            className="h-3 rounded-full bg-slate-100"
          />
          <p className="mt-1 text-right text-xs font-bold text-blue-500">
            {node.progress}%
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default function OpportunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapVisible, setRoadmapVisible] = useState(false);

  const handleGenerateRoadmap = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setRoadmapVisible(true);
    }, 2000);
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-white pb-20">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 border-b-2 border-slate-100 bg-white/90 backdrop-blur-md px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-slate-400 hover:bg-transparent hover:text-slate-600"
            >
              <ArrowLeft className="h-6 w-6 stroke-3 transition-transform group-hover:-translate-x-1" />
              <span className="font-extrabold uppercase tracking-wide">
                Back
              </span>
            </Button>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 rounded-xl border-2 border-b-4 border-yellow-500 bg-yellow-400 px-3 py-1.5 text-yellow-950">
                <Crown className="h-5 w-5 fill-current" />
                <span className="font-black text-sm">PRO</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border-2 border-b-4 border-orange-500 bg-orange-500 px-3 py-1.5 text-white shadow-sm">
                <Zap className="h-5 w-5 fill-current" />
                <span className="font-black text-sm">2500 XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-10">
          {/* Header Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12 rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-b-4 border-blue-200 bg-blue-500 text-white shadow-lg">
                <Brain className="h-12 w-12" />
              </div>

              <h1 className="mb-2 text-3xl font-extrabold text-slate-800 md:text-4xl">
                {DUMMY_OPPORTUNITY.title}
              </h1>
              <p className="mb-6 text-lg font-medium text-slate-500">
                {DUMMY_OPPORTUNITY.company} • {DUMMY_OPPORTUNITY.location}
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <span className="rounded-xl border-2 border-b-4 border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-blue-500">
                  CAREER
                </span>
                <span className="rounded-xl border-2 border-b-4 border-green-200 bg-green-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-green-600">
                  94% MATCH
                </span>
                <span className="rounded-xl border-2 border-b-4 border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  REMOTE
                </span>
              </div>
            </div>
          </motion.div>

          {/* Roadmap Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-800">
                Your Path to Success
              </h2>
              <p className="text-slate-500 font-medium">
                Complete these steps to land the role
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!roadmapVisible ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center py-12"
                >
                  <div className="mb-8 max-w-md text-center text-slate-600 font-medium">
                    Ready to start? Generate your personalized learning path
                    tailored to your current skills.
                  </div>

                  <Button
                    size="lg"
                    onClick={handleGenerateRoadmap}
                    disabled={isGenerating}
                    className="h-16 w-full max-w-xs rounded-2xl border-b-[6px] border-green-600 bg-green-500 text-xl font-extrabold uppercase tracking-widest text-white hover:bg-green-400 hover:border-green-500 active:border-b-0 active:translate-y-1.5 transition-all"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <Zap className="h-6 w-6 animate-pulse fill-current" />
                        BUILDING...
                      </span>
                    ) : (
                      "GENERATE PATH"
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 py-8"
                >
                  {DUMMY_ROADMAP.map((node, index) => (
                    <RoadmapNode
                      key={node.id}
                      node={node}
                      index={index}
                      isLast={index === DUMMY_ROADMAP.length - 1}
                    />
                  ))}

                  <div className="mt-12 w-full rounded-3xl border-2 border-b-[6px] border-yellow-500 bg-yellow-400 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                      <Trophy className="h-8 w-8 text-yellow-950" />
                    </div>
                    <h3 className="text-xl font-black text-yellow-950">
                      FINAL GOAL
                    </h3>
                    <p className="font-bold text-yellow-900/80">
                      Land the Job & Earn 2500 XP
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
