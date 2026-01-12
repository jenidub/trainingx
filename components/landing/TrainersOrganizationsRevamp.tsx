"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import {
  CheckCircle2,
  BarChart3,
  Video,
  TrendingUp,
  GraduationCap,
  Users,
  Award,
  Compass,
  Building2,
  Heart,
  Briefcase,
  School,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RevampedBackground from "./RevampedBackground";
import Link from "next/link";

type TabType = "trainers" | "communities";

export default function TrainersOrganizationsRevamp() {
  const [activeTab, setActiveTab] = useState<TabType>("trainers");

  return (
    <section className="relative py-16 overflow-hidden">
      <RevampedBackground />
      <div className="relative z-10 container mx-auto px-4">
        {/* Connector Line */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: 96 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute left-1/2 -top-24 w-px bg-linear-to-b from-transparent via-slate-300 to-slate-300 hidden lg:block"
        />

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-3 py-1 bg-linear-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-lg text-teal-700 text-xs font-bold tracking-wider uppercase"
          >
            For Professionals & Organizations
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Bring <span className="text-teal-600">AI Literacy</span> to{" "}
            <span className="text-blue-600">Your Audience</span>
          </motion.h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            Whether you&apos;re training clients or educating communities,
            TrainingX.ai adapts to your mission.
          </p>
        </div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveTab("trainers")}
              className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "trainers"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {activeTab === "trainers" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Trainers & Consultants
              </span>
            </button>
            <button
              onClick={() => setActiveTab("communities")}
              className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === "communities"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {activeTab === "communities" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Schools & Communities
              </span>
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "trainers" ? (
            <TrainersContent key="trainers" />
          ) : (
            <CommunitiesContent key="communities" />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ============================================
// TRAINERS TAB CONTENT (Original)
// ============================================
function TrainersContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Feature Column */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <FeatureTile
            icon={CheckCircle2}
            title="Custom Branding"
            desc="Customize your brand with your own logo and colors."
            delay={0}
            visual={
              <div className="flex flex-col gap-2 mt-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <motion.div
                  whileHover={{ width: "85%" }}
                  className="h-2 w-3/4 bg-slate-400 rounded-full"
                />
                <motion.div
                  whileHover={{ width: "60%" }}
                  className="h-2 w-1/2 bg-slate-400 rounded-full"
                />
                <motion.div
                  whileHover={{ width: "75%" }}
                  className="h-2 w-2/3 bg-slate-400 rounded-full"
                />
              </div>
            }
          />
          <FeatureTile
            icon={BarChart3}
            title="Admin Dashboard"
            desc="Track student progress, analytics, and issue certificates."
            delay={0.1}
            visual={
              <div className="flex items-end gap-1 mt-4 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                <motion.div
                  animate={{ height: ["40%", "60%", "40%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 bg-blue-500 rounded-t-sm h-4"
                />
                <motion.div
                  animate={{ height: ["70%", "40%", "70%"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-3 bg-blue-500 rounded-t-sm h-8"
                />
                <motion.div
                  animate={{ height: ["50%", "80%", "50%"] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="w-3 bg-blue-500 rounded-t-sm h-6"
                />
              </div>
            }
          />
          <FeatureTile
            icon={Video}
            title="End to end support"
            desc="Get started with a 1-1 call with our team."
            delay={0.2}
            visual={
              <div className="mt-4 w-16 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-slate-400 border-b-4 border-b-transparent ml-1" />
              </div>
            }
          />
          <FeatureTile
            icon={TrendingUp}
            title="Automations to Scale"
            desc="Automate your training with our AI-powered tools."
            delay={0.3}
            visual={
              <div className="mt-4 flex items-center gap-2 text-green-600 font-mono text-xs bg-green-50 px-2 py-1 rounded border border-green-100">
                <TrendingUp className="w-3 h-3" />
                <span>+75% GROWTH</span>
              </div>
            }
          />
        </div>

        {/* Revenue Card - The "Hero" of this section */}
        <SpotlightCard className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 p-32 bg-linear-to-br from-green-500/20 to-blue-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="mb-auto relative z-10">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border-white/20 mb-6 hover:bg-white/20 transition-colors"
            >
              Revenue Potential
            </Badge>
            <h3 className="text-5xl font-bold text-white mb-2 tracking-tight">
              $5k - $15k
            </h3>
            <p className="text-slate-400 mb-8 font-medium">
              Per workshop for organizations
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative z-10 hover:bg-white/10 transition-colors cursor-default">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-300 font-medium">
                Annual Potential
              </span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">6 Figures</div>
            <div className="text-sm text-green-400 font-medium">
              Licensing TrainingX.AI
            </div>
          </div>

          <Link href="/earnings-calculator">
            <Button className="mt-8 w-full bg-slate-50 text-slate-900 hover:bg-slate-100 font-bold h-12 rounded-xl shadow-lg shadow-black/20 border-0 transition-transform active:scale-95">
              Calculate Your Earnings
            </Button>
          </Link>
        </SpotlightCard>
      </div>
    </motion.div>
  );
}

// ============================================
// COMMUNITIES TAB CONTENT (New)
// ============================================
function CommunitiesContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Feature Column */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <FeatureTile
            icon={BarChart3}
            title="Progress Tracking"
            desc="Monitor every student's journey with real-time analytics and completion rates."
            delay={0}
            visual={
              <div className="flex items-end gap-1 mt-4 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                <motion.div
                  animate={{ height: ["30%", "70%", "30%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 bg-emerald-500 rounded-t-sm h-4"
                />
                <motion.div
                  animate={{ height: ["50%", "90%", "50%"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-3 bg-emerald-500 rounded-t-sm h-8"
                />
                <motion.div
                  animate={{ height: ["40%", "80%", "40%"] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="w-3 bg-emerald-500 rounded-t-sm h-6"
                />
              </div>
            }
          />
          <FeatureTile
            icon={Award}
            title="Verifiable Certificates"
            desc="Students earn certificates employers can verify — real proof of skills."
            delay={0.1}
            visual={
              <div className="mt-4 w-16 h-12 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-200 shadow-inner group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
            }
          />
          <FeatureTile
            icon={Compass}
            title="AI Career Matching"
            desc="Show students their career potential based on the skills they've developed."
            delay={0.2}
            visual={
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-mono text-xs bg-blue-50 px-2 py-1 rounded border border-blue-100">
                <Compass className="w-3 h-3" />
                <span>500+ CAREERS</span>
              </div>
            }
          />
          <FeatureTile
            icon={Users}
            title="Bulk Management"
            desc="Easily onboard and manage cohorts of students with group tools."
            delay={0.3}
            visual={
              <div className="flex -space-x-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center"
                  >
                    <Users className="w-3 h-3 text-slate-500" />
                  </div>
                ))}
              </div>
            }
          />
        </div>

        {/* Impact Card - The "Hero" of this section */}
        <SpotlightCard className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 p-32 bg-linear-to-br from-green-500/20 to-blue-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="mb-auto relative z-10">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border-white/20 mb-6 hover:bg-white/20 transition-colors"
            >
              Built for Impact
            </Badge>
            <h3 className="text-[29px] leading-8 font-bold text-white mb-2 tracking-tight">
              Prepare Your Students for the AI Future
            </h3>
            <p className="text-slate-400 mb-6 font-medium">
              From middle schoolers to adults rebuilding their careers
            </p>
          </div>

          {/* Who it's for */}
          <div className="space-y-3 mb-6 relative z-10">
            {[
              { icon: School, label: "K-12 Schools" },
              { icon: Building2, label: "Workforce Development" },
              { icon: Heart, label: "Youth Organizations" },
              { icon: GraduationCap, label: "Higher Education" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <item.icon className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <a href="mailto:doneal@nuueducation.com?subject=TrainingX for Our Organization">
            <Button className="w-full bg-slate-50 text-slate-900 hover:bg-slate-100 font-bold h-12 rounded-xl shadow-lg shadow-black/20 border-0 transition-transform active:scale-95">
              Schedule a Demo Call
            </Button>
          </a>
        </SpotlightCard>
      </div>

      {/* Additional Info for Schools */}
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-200"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">
              Need to report outcomes to funders or stakeholders?
            </h4>
            <p className="text-slate-600">
              Our admin dashboard provides exportable reports on completion
              rates, skill progress, and certificate issuance.
            </p>
          </div>
          <a
            href="mailto:doneal@nuueducation.com?subject=TrainingX Reporting Demo"
            className="shrink-0"
          >
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold rounded-xl"
            >
              Learn More
            </Button>
          </a>
        </div>
      </motion.div> */}
    </motion.div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================
function FeatureTile({
  icon: Icon,
  title,
  desc,
  visual,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  visual: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.8)" }}
      className="p-6 rounded-2xl bg-white/60 border border-slate-200 shadow-sm hover:shadow-md transition-all group backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 text-slate-600 group-hover:text-blue-600 transition-colors">
          {/* @ts-ignore */}
          <Icon className="w-5 h-5" />
        </div>
        {visual}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">
        {desc}
      </p>
    </motion.div>
  );
}

function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
}
