"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  BarChart3,
  BrainCircuit,
  Lightbulb,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RevampedBackground from "./RevampedBackground";

export default function TimelineSection() {
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"],
  });

  // Draw line progress
  const lineProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  const milestones = [
    {
      year: "2015",
      title: "Spiral the Study Buddy",
      desc: "The journey began with an innovative study companion for effective learning.",
      icon: BookOpen,
      color: "blue",
    },
    {
      year: "2018",
      title: "NuuedScore",
      desc: "Evolved into a comprehensive scoring and assessment platform.",
      icon: BarChart3,
      color: "indigo",
    },
    {
      year: "2021",
      title: "TrainingX.AI",
      desc: "Introduced Reactive Parallelism + Continuous AI for adaptive learning.",
      icon: BrainCircuit,
      color: "purple",
    },
    {
      year: "2023",
      title: "PromptToSuccess.AI",
      desc: "Focused on the art and science of prompting for AI collaboration.",
      icon: Lightbulb,
      color: "pink",
    },
    {
      year: "2024",
      title: "Universal Prompting Zone",
      desc: "A comprehensive ecosystem for mastering AI-powered future skills.",
      icon: Globe,
      color: "emerald",
    },
  ];

  return (
    <section
      ref={timelineRef}
      className="relative py-20 overflow-hidden rounded-3xl"
    >
      <RevampedBackground />
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            The TrainingX.AI <span className="text-purple-600">Story</span>
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            From Spiral the Study Buddy to Universal Prompting Zone - a journey
            of innovation.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Center Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 -ml-0.5 md:-ml-0.5">
            <motion.div
              style={{ scaleY: lineProgress }}
              className="absolute top-0 left-0 right-0 bg-linear-to-b from-blue-500 via-purple-500 to-emerald-500 w-full origin-top"
            />
          </div>

          <div className="space-y-12 md:space-y-24">
            {milestones.map((m, i) => (
              <TimelineItem key={i} item={m} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ item, index }: { item: any; index: number }) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${isEven ? "md:flex-row-reverse" : ""}`}
    >
      {/* Spacer for desktop */}
      <div className="hidden md:block flex-1" />

      {/* Center Point */}
      <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-white border-4 border-slate-200 rounded-full -ml-2 md:-ml-2 z-10 shadow-sm group-hover:border-purple-500 transition-colors">
        <div
          className={`w-full h-full rounded-full bg-${item.color}-500 opacity-0 group-hover:opacity-100 transition-opacity`}
        />
      </div>

      {/* Content Card */}
      <div className="flex-1 w-full pl-12 md:pl-0">
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 relative overflow-hidden group hover:border-${item.color}-200 transition-all`}
        >
          {/* Color accent top bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-${item.color}-400 to-${item.color}-600`}
          />

          <div className="flex items-center gap-3 mb-3">
            <Badge
              variant="secondary"
              className={`bg-${item.color}-50 text-${item.color}-700 border-${item.color}-100`}
            >
              {item.year}
            </Badge>
            <item.icon className={`w-5 h-5 text-${item.color}-500`} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {item.title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
